#!/usr/bin/env python3
"""Ondergrondlagen voor /bijbelreis: reliëf (hillshade) en moderne landsgrenzen.

Maakt (en overschrijft) in public/bijbelreis/:
  relief-regio.webp   hillshade van het hele kaartgebied (maxBounds), bron AWS Terrain Tiles zoom 7,
                      uitvoer op zoom-6-resolutie (2x2 gemiddeld);
  relief-kanaan.webp  hillshade van Kanaän en omgeving, bron en uitvoer zoom 9;
                      beide: grijswaarden (wit = vlak/belicht, grijs = schaduwkant) met alfakanaal:
                      zee en meren zijn volledig transparant, relief-kanaan loopt aan de randen via alfa
                      uit (crossfade over relief-regio). Bedoeld voor mix-blend-mode: multiply op de PANE
                      (zie docs/bijbelreis-audit/ondergrond.md voor de CSS);
  relief.json         exacte bounds ([[zuid, west], [noord, oost]]) voor L.imageOverlay;
  grenzen.json        GeoJSON: moderne landsgrenzen (lijnen) + landnamen in het Nederlands (punten).

Gebruik (Python 3.10+, numpy, Pillow met WebP, shapely 2):
  python3 -I scripts/bijbelreis-ondergrond.py [--cache MAP] [--alleen relief|grenzen] [--test]
  --cache   map voor gedownloade tegels en Natural Earth-bestanden (standaard <tmp>/bijbelreis-ondergrond);
            downloads die al in de cache staan worden niet opnieuw opgehaald. Zet de cache NIET in de repo.
  --test    alleen de zelftest (Mercator-rekenwerk + uitlijning tegen geo.json) op de cache uitvoeren.

Bronnen (beide open data, zie docs/bijbelreis-audit/ondergrond.md voor de naamsvermelding):
  - Hoogte: AWS Terrain Tiles (Mapzen/Tilezen), Terrarium-PNG's
    https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
    hoogte (m) = R*256 + G + B/256 - 32768. Op zoom 7-9 is dit op land SRTM (NASA/USGS), in zee ETOPO1 (NOAA).
  - Grenzen/landnamen: Natural Earth 1:10m (publiek domein), via github.com/nvkelso/natural-earth-vector.
  - Kust- en watermasker: public/bijbelreis/geo.json uit deze repo (land + lakes). Zo valt het reliëf
    precies binnen de kustlijn die de kaart tekent; zee en meren (Dode Zee, Meer van Galilea ...) zijn
    wit en transparant.
    Wordt geo.json aangepast, draai dit script dan opnieuw.

Mercator-uitlijning (waarom L.imageOverlay exact past):
  Leaflet (EPSG:3857) zet een imageOverlay neer door de hoeken (bounds) te projecteren en het beeld daartussen
  lineair uit te rekken. Het beeld moet dus lineair zijn in Web-Mercator-x/y, niet in breedtegraad. Dat geldt
  per definitie voor pixels van XYZ-tegels: tegelpixel (px, py) op zoom z ligt op wereldpixel
  x = lon2px(lon, z), y = lat2px(lat, z) met 256*2^z pixels rond de aarde. Dit script knipt uit het
  tegelmozaïek een rechthoek op hele pixelgrenzen (x0..x1, y0..y1) en rekent de bounds terug met de
  inverse projectie (px2lon/px2lat) van precies die pixelranden. Het verkleinen van zoom 7 naar zoom 6 gebeurt
  met 2x2-blokgemiddelden op een even pixelgrens, waardoor de randen identiek blijven. Er wordt nooit
  opnieuw in breedtegraad bemonsterd. De zelftest controleert (1) heen-en-terug-projectie, (2) dat de
  bounds in relief.json exact op hele pixels vallen en de beeldmaat klopt en (3) dat kenmerken uit de
  hoogtedata (kust: hoogte > 0, Dode Zee en Meer van Galilea: diepe depressie) op dezelfde pixels vallen als
  in geo.json (beste verschuiving per kenmerk binnen 1 px op zoom 7 / 3 px op zoom 9, gemiddeld < 1,5 px).
"""
import argparse, concurrent.futures as cf, json, math, os, sys, tempfile, time, urllib.request

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "bijbelreis"))
GEO = os.path.join(OUT, "geo.json")

TILE_URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/{}.geojson"
MAXBOUNDS = ((22.0, 4.0), (47.0, 57.0))  # (zuid, west), (noord, oost) zoals in app.js (sinds 3.0 tot Rome)

# naam, gevraagde bounds, bronzoom, uitvoerzoom, webp-kwaliteit, overdrijving (z-factor)
RELIEF = {
    "regio": dict(bounds=MAXBOUNDS, zsrc=7, zout=6, q=64, exag=5.5),
    "kanaan": dict(bounds=((29.2, 33.8), (33.95, 37.2)), zsrc=9, zout=9, q=70, exag=3.2),
}
# Overgangszone (graden, gemeten vanaf de rand van relief-kanaan naar binnen): daarin loopt de dekking (alfa)
# van relief-kanaan vloeiend van 0 naar 1. relief-regio is overal volledig, dus in dezelfde pane geeft dat een
# crossfade zonder dubbele schaduw of zichtbare naad. De kanaan-bounds zijn ruimer dan het kerngebied
# [[30.9, 34.2], [33.4, 36.4]] zodat dat (plus Hermon en Sinaï-noord) volledig in de scherpe zone ligt.
FEATHER_DEG = 0.35

R_EARTH = 6378137.0
AZIMUT, HOOGTE = 315.0, 45.0  # licht uit het noordwesten, 45 graden boven de horizon
MAX_DONKER = 0.5              # donkerste schaduw = 1 - 0.5 => grijs ~128/255 (zacht)


# ---------- Web Mercator ----------
def lon2px(lon, z):
    return (lon + 180.0) / 360.0 * 256 * 2 ** z

def lat2px(lat, z):
    s = math.sin(math.radians(lat))
    return (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * 256 * 2 ** z

def px2lon(x, z):
    return x / (256 * 2 ** z) * 360.0 - 180.0

def px2lat(y, z):
    n = math.pi * (1 - 2 * y / (256 * 2 ** z))
    return math.degrees(math.atan(math.sinh(n)))

def pixel_window(bounds, z):
    (s, w), (n, e) = bounds
    return (math.floor(lon2px(w, z)), math.floor(lat2px(n, z)), math.ceil(lon2px(e, z)), math.ceil(lat2px(s, z)))


# ---------- downloads ----------
def fetch(url, path, tries=4):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "bijbelreis-ondergrond/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            tmp = path + ".part"
            with open(tmp, "wb") as f:
                f.write(data)
            os.replace(tmp, path)
            return path
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise RuntimeError(f"download mislukt: {url}: {e}")
            time.sleep(1.5 * (i + 1))


def elevation_mosaic(cache, z, x0, y0, x1, y1):
    """Hoogte (m, float32) voor wereldpixels [x0, x1) x [y0, y1) op zoom z."""
    tx0, ty0, tx1, ty1 = x0 // 256, y0 // 256, (x1 - 1) // 256, (y1 - 1) // 256
    jobs = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)]
    paths = {}
    with cf.ThreadPoolExecutor(8) as ex:
        fut = {ex.submit(fetch, TILE_URL.format(z=z, x=tx, y=ty), os.path.join(cache, "tiles", str(z), str(tx), f"{ty}.png")): (tx, ty) for tx, ty in jobs}
        for f in cf.as_completed(fut):
            paths[fut[f]] = f.result()
    W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256
    big = np.zeros((H, W), np.float32)
    for (tx, ty), p in paths.items():
        a = np.asarray(Image.open(p).convert("RGB"), dtype=np.float32)
        big[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    return big[y0 - ty0 * 256:y1 - ty0 * 256, x0 - tx0 * 256:x1 - tx0 * 256]


# ---------- masker uit geo.json ----------
def rasterize(polys, z, x0, y0, W, H, ss=4):
    """Dekking 0..1 van polygonen (lijst van ringen [[lon, lat], ...]) op het pixelraster, met supersampling."""
    img = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(img)
    for ring, val in polys:
        # PIL rekent met pixelmiddens: wereldpixelrand k ligt op PIL-coördinaat k - 0.5
        pts = [((lon2px(lo, z) - x0) * ss - 0.5, (lat2px(la, z) - y0) * ss - 0.5) for lo, la in ring]
        if len(pts) >= 3:
            d.polygon(pts, fill=val)
    return np.asarray(img.resize((W, H), Image.BOX), dtype=np.float32) / 255.0


def lake_rings(geo, naam):
    out = []
    for f in geo["lakes"]:
        if f["properties"].get("n") == naam:
            g = f["geometry"]
            out += [(poly[0], 255) for poly in ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"])]
    return out


def geo_rings(geo):
    out = []
    def add(geom, val):
        cs = geom["coordinates"]
        polys = [cs] if geom["type"] == "Polygon" else cs
        for poly in polys:
            out.append((poly[0], val))
            for hole in poly[1:]:
                out.append((hole, 255 - val))
    add(geo["land"]["geometry"], 255)
    for f in geo["lakes"]:
        add(f["geometry"], 0)
    return out


# ---------- hillshade ----------
def hillshade(elev, z, y0, exag):
    """Schaduw 0..1 (1 = vlak of naar het licht gekeerd, kleiner = schaduwkant)."""
    H, W = elev.shape
    lat = np.array([px2lat(y0 + i + 0.5, z) for i in range(H)])
    res = (2 * math.pi * R_EARTH / (256 * 2 ** z)) * np.cos(np.radians(lat))  # meter per pixel (conform: x = y)
    gy, gx = np.gradient(elev.astype(np.float64))
    dzdx = gx / res[:, None] * exag
    dzdy = -gy / res[:, None] * exag  # rijen lopen naar het zuiden; noord positief
    az, alt = math.radians(AZIMUT), math.radians(HOOGTE)
    lx, ly, lz = math.cos(alt) * math.sin(az), math.cos(alt) * math.cos(az), math.sin(alt)
    norm = np.sqrt(dzdx ** 2 + dzdy ** 2 + 1)
    hs = (-dzdx * lx - dzdy * ly + lz) / norm
    direct = np.clip(hs / lz, 0, 1)             # vlak = 1, belichte hellingen worden afgekapt op wit
    helling = 1 / norm                          # cos(helling): steile hellingen iets grijzer, ook aan de zonkant
    shade = 0.7 * direct + 0.3 * helling ** 3
    donker = np.clip(1 - shade, 0, 1) ** 0.85   # zachte curve
    return 1 - MAX_DONKER * np.clip(donker * 1.15, 0, 1)


def feather_weight(z, x0, y0, W, H, kanaan_px_bounds):
    """Gewicht van relief-kanaan (0..1) op een willekeurig raster, berekend in graden vanaf de kanaan-rand."""
    (s, w), (n, e) = kanaan_px_bounds
    lons = np.array([px2lon(x0 + i + 0.5, z) for i in range(W)])
    lats = np.array([px2lat(y0 + j + 0.5, z) for j in range(H)])
    dx = np.minimum(lons - w, e - lons)[None, :]
    dy = np.minimum(lats - s, n - lats)[:, None]
    d = np.minimum(dx, dy)  # afstand (graden) tot de dichtstbijzijnde rand, negatief = erbuiten
    t = np.clip((d - 0.02) / FEATHER_DEG, 0, 1)
    return t * t * (3 - 2 * t)


def make_relief(cache, geo):
    meta = {}
    # Eerst de bounds van beide beelden bepalen (nodig voor de overgangszone).
    wins = {}
    for name, c in RELIEF.items():
        x0, y0, x1, y1 = pixel_window(c["bounds"], c["zout"])
        wins[name] = (x0, y0, x1, y1)
        z = c["zout"]
        meta[name] = {"src": f"/bijbelreis/relief-{name}.webp",
                      "bounds": [[round(px2lat(y1, z), 6), round(px2lon(x0, z), 6)], [round(px2lat(y0, z), 6), round(px2lon(x1, z), 6)]],
                      "zoom": z, "bronzoom": c["zsrc"], "px": [x1 - x0, y1 - y0]}
    kb = meta["kanaan"]["bounds"]
    rings = geo_rings(geo)
    for name, c in RELIEF.items():
        zs, zo = c["zsrc"], c["zout"]
        f = 2 ** (zs - zo)
        x0, y0, x1, y1 = wins[name]
        X0, Y0, X1, Y1 = x0 * f, y0 * f, x1 * f, y1 * f
        pad = 2
        elev = elevation_mosaic(cache, zs, X0 - pad, Y0 - pad, X1 + pad, Y1 + pad)
        # land/water-masker op bronresolutie (met rand) om zee-bodemhellingen vlak te maken
        land_src = rasterize(rings, zs, X0 - pad, Y0 - pad, elev.shape[1], elev.shape[0], ss=2)
        elev = np.where((land_src < 0.5) & (elev < 0), 0, elev)
        hs = hillshade(elev, zs, Y0 - pad, c["exag"])[pad:-pad, pad:-pad]
        if f > 1:  # blokgemiddelde: pixelranden blijven exact gelijk
            hs = hs.reshape(hs.shape[0] // f, f, hs.shape[1] // f, f).mean(axis=(1, 3))
        W, H = x1 - x0, y1 - y0
        land = rasterize(rings, zo, x0, y0, W, H, ss=4)
        # relief-regio: volledig (ook onder Kanaän), dekking = land. relief-kanaan: dekking = land x overgangsgewicht,
        # zodat het in dezelfde pane met gewone alfa over relief-regio heen vloeit (crossfade, geen dubbele schaduw).
        cover = land * feather_weight(zo, x0, y0, W, H, kb) if name == "kanaan" else land
        out = np.where(cover > 0.002, hs, 1.0)  # zee/meren en onbedekte delen: wit
        gray = np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)
        alpha = np.clip(cover * 255 + 0.5, 0, 255).astype(np.uint8)  # zee/meren volledig transparant
        img = Image.fromarray(np.dstack([gray, gray, gray, alpha]), "RGBA")
        path = os.path.join(OUT, f"relief-{name}.webp")
        img.save(path, "WEBP", quality=c["q"], alpha_quality=100, method=6)
        meta[name]["bytes"] = os.path.getsize(path)
        print(f"relief-{name}.webp  {W}x{H}px  {meta[name]['bytes'] / 1024:.0f} KB  bounds {meta[name]['bounds']}")
    rel = {k: {"src": v["src"], "bounds": v["bounds"]} for k, v in meta.items()}
    rel["_info"] = {
        "projectie": "Web Mercator (EPSG:3857); beeldrijen lineair in Mercator-y, randen op hele tegelpixels",
        "zoom": "regio: bron AWS Terrain Tiles zoom 7, uitvoer zoom 6; kanaan: bron en uitvoer zoom 9",
        "samenspel": "beide in dezelfde pane, relief-kanaan boven relief-regio; mix-blend-mode multiply alleen op de pane; relief-kanaan vloeit via zijn alfakanaal over in relief-regio",
        "bron": "AWS Terrain Tiles (Mapzen/Tilezen): SRTM en GMTED2010 (USGS), ETOPO1 (NOAA); masker uit geo.json (Natural Earth)",
    }
    with open(os.path.join(OUT, "relief.json"), "w", encoding="utf-8") as fh:
        json.dump(rel, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    return meta


# ---------- grenzen ----------
NAMEN = {  # Nederlandse namen; afwijkingen van NAME_NL in Natural Earth staan hier expliciet
    "PSX": "Palestijnse gebieden",  # Natural Earth ADMIN 'Palestine' (Westelijke Jordaanoever + Gaza)
}
SKIP_TYPES = {"Dependency", "Lease"}  # Akrotiri/Dhekelia e.d.: geen landnaam
SKIP_ADMIN = {"Cyprus No Mans Area", "Bir Tawil"}  # VN-bufferzone en niet-geclaimd gebied: geen landnaam


def make_grenzen(cache):
    from shapely.geometry import box, shape, mapping, Point
    from shapely.ops import polylabel, linemerge
    from shapely.geometry import MultiLineString
    from shapely import set_precision

    (S, Wb), (N, E) = MAXBOUNDS
    frame = box(Wb, S, E, N)
    inner = box(Wb + 0.4, S + 0.4, E - 0.4, N - 0.4)
    lines_p = fetch(NE_URL.format("ne_10m_admin_0_boundary_lines_land"), os.path.join(cache, "ne", "ne_10m_admin_0_boundary_lines_land.geojson"))
    ctry_p = fetch(NE_URL.format("ne_10m_admin_0_countries"), os.path.join(cache, "ne", "ne_10m_admin_0_countries.geojson"))
    feats, groups = [], {}

    SOORT = {"International boundary (verify)": "grens", "Disputed (please verify)": "betwist", "Indefinite (please verify)": "onbepaald",
             "Line of control (please verify)": "bestandslijn", "Indeterminant frontier": "onbepaald", "Overlay limit": "overlay", "Lease limit": "overlay"}
    for f in json.load(open(lines_p, encoding="utf-8"))["features"]:
        p = f["properties"]
        cla = p.get("FEATURECLA")
        if cla not in SOORT:  # o.a. 'Unrecognized': niet in de Natural Earth-standaardweergave
            continue
        g = shape(f["geometry"])
        if not g.intersects(frame):
            continue
        g = g.intersection(frame).simplify(0.01, preserve_topology=False)
        g = set_precision(g, 0.001)
        if g.is_empty:
            continue
        parts = [g] if g.geom_type == "LineString" else [x for x in getattr(g, "geoms", []) if x.geom_type == "LineString"]
        groups.setdefault((SOORT[cla], p.get("MIN_ZOOM", 0)), []).extend(parts)
    for (soort, mz), parts in sorted(groups.items()):
        merged = linemerge(MultiLineString(parts))  # losse stukjes per soort samenvoegen (kleiner bestand)
        for part in ([merged] if merged.geom_type == "LineString" else list(merged.geoms)):
            cs = [[round(x, 3), round(y, 3)] for x, y in part.coords]
            cs = [c for i, c in enumerate(cs) if i == 0 or c != cs[i - 1]]
            if len(cs) < 2:
                continue
            feats.append({"type": "Feature", "properties": {"soort": soort, "minzoom": mz},
                          "geometry": {"type": "LineString", "coordinates": cs}})

    labels = []
    for f in json.load(open(ctry_p, encoding="utf-8"))["features"]:
        p = f["properties"]
        if p.get("TYPE") in SKIP_TYPES or p.get("ADMIN") in SKIP_ADMIN:
            continue
        g = shape(f["geometry"])
        if not g.intersects(frame):
            continue
        vis = g.intersection(frame)
        heel = vis.area >= 0.95 * g.area
        if vis.area < (0.05 if heel else 2.0):  # klein land helemaal in beeld, of een flink stuk van een groot land
            continue
        pt = Point(p["LABEL_X"], p["LABEL_Y"])
        if not (inner.contains(pt) and g.contains(pt)):
            big = max(getattr(vis, "geoms", [vis]), key=lambda x: x.area).intersection(inner)
            big = max(getattr(big, "geoms", [big]), key=lambda x: x.area)
            pt = polylabel(big, tolerance=0.02)
        a3 = p.get("ADM0_A3")
        labels.append({"type": "Feature", "properties": {
            "naam": NAMEN.get(a3) or p.get("NAME_NL") or p.get("NAME"), "ne_naam": p.get("NAME"), "a3": a3, "ne_type": p.get("TYPE"),
            "minzoom": p.get("MIN_LABEL"), "rang": p.get("LABELRANK")},
            "geometry": {"type": "Point", "coordinates": [round(pt.x, 3), round(pt.y, 3)]}})
    labels.sort(key=lambda x: (x["properties"]["rang"], x["properties"]["naam"]))
    fc = {"type": "FeatureCollection",
          "bron": "Natural Earth 1:10m (publiek domein), standaardweergave (FEATURECLA); vereenvoudigd 0.01 graad, 3 decimalen",
          "features": feats + labels}
    path = os.path.join(OUT, "grenzen.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"grenzen.json  {len(feats)} lijnen, {len(labels)} landnamen, {os.path.getsize(path) / 1024:.0f} KB")
    for l in labels:
        print("   ", l["properties"]["naam"], l["geometry"]["coordinates"], "minzoom", l["properties"]["minzoom"])


# ---------- zelftest ----------
def selftest(cache, geo):
    ok = True
    for z in (6, 7, 9):
        for lat in (22.5, 29.4, 31.5, 33.6, 44.5):
            back = px2lat(lat2px(lat, z), z)
            if abs(back - lat) > 1e-9:
                ok = False
                print("FOUT heen-en-terug", z, lat, back)
    rel = json.load(open(os.path.join(OUT, "relief.json"), encoding="utf-8"))
    rings = geo_rings(geo)
    for name, c in RELIEF.items():
        b = rel[name]["bounds"]
        zo = c["zout"]
        x0, y0, x1, y1 = lon2px(b[0][1], zo), lat2px(b[1][0], zo), lon2px(b[1][1], zo), lat2px(b[0][0], zo)
        img = Image.open(os.path.join(OUT, f"relief-{name}.webp"))
        if (round(x1 - x0), round(y1 - y0)) != img.size or max(abs(v - round(v)) for v in (x0, y0, x1, y1)) > 1e-3:
            ok = False
            print("FOUT bounds passen niet op hele pixels", name, (x0, y0, x1, y1), img.size)
        # Uitlijning: kenmerken uit de hoogtedata (kust: hoogte > 0; Dode Zee/Meer van Galilea: diepe
        # depressie) tegen dezelfde kenmerken in geo.json, op bronresolutie. Gezocht wordt de verschuiving
        # (in pixels) waarbij ze het best overlappen. Een fout in de projectie zou bij alle kenmerken dezelfde
        # verschuiving geven; losse afwijkingen van 1-3 pixels op zoom 9 komen door de vereenvoudigde
        # geo.json-lijnen (afgerond op 0,001 graad, ingekorte Dode Zee) en middelen uit.
        zs = c["zsrc"]
        tol = 1 if zs <= 7 else 3
        checks = [("kust", ((30.0, 29.0), (37.5, 36.5)) if zs <= 7 else ((32.5, 34.6), (33.2, 35.3)), rings, lambda e: e > 0.5),
                  ("Dode Zee", ((31.0, 35.25), (31.9, 35.75)), lake_rings(geo, "Dead Sea"), lambda e: e < -395),
                  ("Meer van Galilea", ((32.65, 35.45), (32.95, 35.75)), lake_rings(geo, "Sea of Galilee"), lambda e: e < -205)]
        shifts = []
        for label, win, rr, test in checks:
            X0, Y0, X1, Y1 = pixel_window(win, zs)
            P = 8
            elev = elevation_mosaic(cache, zs, X0 - P, Y0 - P, X1 + P, Y1 + P)
            m = rasterize(rr, zs, X0, Y0, X1 - X0, Y1 - Y0, ss=4) > 0.5
            best = None
            for dy in range(-P, P + 1):
                for dx in range(-P, P + 1):
                    e = test(elev[P + dy:P + dy + (Y1 - Y0), P + dx:P + dx + (X1 - X0)])
                    score = float((e & m).sum() / max(1, (e | m).sum()))  # IoU
                    if best is None or score > best[0] + 1e-9 or (abs(score - best[0]) <= 1e-9 and abs(dx) + abs(dy) < abs(best[1]) + abs(best[2])):
                        best = (score, dx, dy)
            shifts.append(best[1:])
            print(f"uitlijning {name} / {label}: beste verschuiving dx={best[1]:+d} dy={best[2]:+d} px op zoom {zs} (IoU {best[0]:.3f})")
            if abs(best[1]) > tol or abs(best[2]) > tol:
                ok = False
        mx, my = (sum(v[i] for v in shifts) / len(shifts) for i in (0, 1))
        mpp = 2 * math.pi * R_EARTH / (256 * 2 ** zs) * math.cos(math.radians(31.5))
        print(f"uitlijning {name}: gemiddelde verschuiving dx={mx:+.2f} dy={my:+.2f} px = {mx * mpp:+.0f} m / {my * mpp:+.0f} m")
        if abs(mx) > 1.5 or abs(my) > 1.5:
            ok = False
    print("zelftest", "OK" if ok else "MISLUKT")
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "bijbelreis-ondergrond"))
    ap.add_argument("--alleen", choices=["relief", "grenzen"])
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()
    geo = json.load(open(GEO, encoding="utf-8"))
    if not a.test:
        if a.alleen in (None, "relief"):
            make_relief(a.cache, geo)
        if a.alleen in (None, "grenzen"):
            make_grenzen(a.cache)
    if a.alleen in (None, "relief") or a.test:
        sys.exit(0 if selftest(a.cache, geo) else 1)


if __name__ == "__main__":
    main()
