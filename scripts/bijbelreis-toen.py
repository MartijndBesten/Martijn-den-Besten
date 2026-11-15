#!/usr/bin/env python3
"""Het landschap van toen voor /bijbelreis: maakt public/bijbelreis/toen.json.

De kaart heeft de standen Toen en Nu. geo.json (Natural Earth) is het landschap van vandaag. Dit script
maakt de verschillen voor de Bijbelse tijd, elk uit een genoemde bron, en niets op het oog:

  zee       vlakken die toen zee waren en nu land zijn (dichtgeslibde baaien): Efeze, Milete (Golf van Latmus),
            de kop van de Thermaïsche Golf en de monding van de Tiber. Bron: AWMC (kust van de Romeinse tijd).
  kust      de oever van die vlakken, voor zover die nu in het land ligt (gestreept getekend: reconstructie).
  meren     meren die er toen waren en nu weg of anders zijn: het Hulameer, het meer van Loudias en het
            noordelijke bekken van de Dode Zee. Bron: AWMC.
  onzeker   vlakken waar misschien water stond: het zuidelijke bekken van de Dode Zee (AWMC), de Bittermeren
            (omtrek van nu, Natural Earth) en de kop van de Perzische Golf rond 3000-2000 v.Chr.
            (Forti e.a. 2022, figuur 14, automatisch overgenomen uit de figuur).
  rand      de oever van de onzekere vlakken (gestippeld), zonder de randen die alleen de rand van de bron zijn.
  rivieren  oude Nijlarmen (Pelusisch, Tanitisch, Mendesisch, Sebennytisch, Kanopisch) en de Jordaan van toen
            (door het Hulameer; 'vast': 1 = gewone rivierlijn, anders gestreept). Bron: AWMC.
  weg       namen van meren uit geo.json die alleen in de stand Nu horen.
  wegRivier namen van rivieren uit geo.json die in de stand Toen door een lijn uit 'rivieren' vervangen zijn.
  nu        stuwmeren van nu (Natural Earth, 'Reservoir'): alleen in de stand Nu.

Gebruik (Python 3.10+, numpy, Pillow, shapely 2; voor --controle ook node):
  python3 -I scripts/bijbelreis-toen.py [--cache MAP] [--controle] [--alleen-controle]
  --cache            map voor de gedownloade bronnen (standaard <tmp>/bijbelreis-toen). Zet die NIET in de repo.
  --controle         legt na het maken alle plaatsen, tussenpunten en routes tegen de ondergrond van toen en nu.
  --alleen-controle  alleen die controle, op de bestaande toen.json.

Bronnen (zie docs/bijbelreis-audit/ondergrond.md, hoofdstuk 'Het landschap van toen'):
  - Ancient World Mapping Center (AWMC), geodata, ODbL 1.0. https://github.com/AWMC/geodata, vastgezet op
    commit 7ecf8bc (22-04-2024), bestand 'Physical Shapefiles Apr 2024.zip'. Afgeleid van de Barrington Atlas
    of the Greek and Roman World en van OpenStreetMap (ODbL). toen.json is daarmee een afgeleide database
    onder dezelfde licentie (ODbL 1.0).
  - Forti e.a. 2022, 'The paleoenvironment and depositional context of the Sumerian site of Abu Tbeirah',
    Quaternary Research, doi:10.1017/qua.2022.22, CC BY 4.0. Figuur 14: 'Suggested position of the Persian
    Gulf coastline between 5000-4000 years ago'.
  - Natural Earth 1:10m (publiek domein): ne_10m_lakes en de bestaande geo.json.
"""
import argparse, io, json, math, os, re, struct, subprocess, sys, tempfile, time, urllib.request, zipfile

import numpy as np
from PIL import Image
from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon, box, mapping, shape
from shapely import set_precision
from shapely.ops import linemerge, nearest_points, unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))
OUT = os.path.join(PUB, "bijbelreis")
GEO = os.path.join(OUT, "geo.json")
TOEN = os.path.join(OUT, "toen.json")

AWMC_COMMIT = "7ecf8bccea2efe1e1e9df2daf6001942de73fb87"
AWMC_URL = f"https://raw.githubusercontent.com/AWMC/geodata/{AWMC_COMMIT}/Physical%20Shapefiles%20Apr%202024.zip"
FORTI_URL = "https://iris.uniroma1.it/retrieve/e383532f-2729-15e8-e053-a505fe0a3de9/Forti_The-paleoenvironment_2022.pdf"
NE_LAKES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson"
GEOBOX = box(8, 23.5, 53, 45.5)  # zelfde uitsnede als scripts/bijbelreis-geo.py

# Dichtgeslibde baaien: venster (west, zuid, oost, noord) waarbinnen de kust van AWMC met die van nu wordt vergeleken.
BAAIEN = [
    dict(n="Haven van Efeze", venster=(27.20, 37.90, 27.45, 38.05), tijd="Romeinse tijd (1e eeuw n.Chr.)"),
    dict(n="Golf van Latmus (Milete)", venster=(27.12, 37.44, 27.62, 37.66), tijd="Romeinse tijd (1e eeuw n.Chr.)"),
    dict(n="Thermaïsche Golf", venster=(22.45, 40.42, 23.00, 40.72), tijd="Romeinse tijd"),
    dict(n="Monding van de Tiber", venster=(12.10, 41.65, 12.40, 41.90), tijd="Romeinse tijd"),
]
OPENING = 0.003      # graden (ca. 300 m): smallere verschillen tussen de twee kustlijnen zijn tekenverschil, geen oude baai
MIN_BAAI = 2e-4      # graden² (ca. 2 km²): kleinere restjes vervallen
ZEERAND = 0.02       # graden (ca. 2 km): zoveel loopt een zeevlak door over de zee van nu, zodat de kustlijn van nu en haar zachte rand eronder verdwijnen
NIJLARMEN = {"Pelousiakos": "Pelusische Nijlarm", "Tanitikos": "Tanitische Nijlarm", "Mendesios": "Mendesische Nijlarm",
             "Sebennytikos": "Sebennytische Nijlarm", "Kanobikos": "Kanopische Nijlarm"}
MEREN = {"Semachonitis L.": ("Hulameer", "tot de drooglegging (1951-1958)"),
         "Loudias L.": ("Meer van Loudias", "Griekse en Romeinse tijd; drooggelegd 1928-1932")}
DODE_ZEE = "Mortuum Mare/Asphaltitis L."
WEG = ["Dead Sea", "Great Bitter Lake", "Lake Hammar", "Lake Habbaniyah"]

# Forti e.a. 2022, figuur 14 (ingesloten JPEG van 875 x 623 px). Het kader van de figuur wisselt van zwart naar wit op
# de graadstreepjes; die overgangen zoekt het script zelf op. De kaart is een platte kaart in graden (evenveel pixels
# per graad in beide richtingen).
FIG = dict(breedte=875, hoogte=623, lon=(46.5, 48.0), lat=(31.9, 30.8), blauw=(163, 223, 247), marge=18)
FIG_CONTROLE = {"Ur": (30.9626, 46.1031), "Uruk": (31.3225, 45.6367)}  # rode stippen in de figuur; ligging volgens Pleiades


# ---------- downloads ----------
def fetch(url, path, tries=4):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "bijbelreis-ondergrond/1.0"})
            with urllib.request.urlopen(req, timeout=180) as r:
                data = r.read()
            with open(path + ".part", "wb") as f:
                f.write(data)
            os.replace(path + ".part", path)
            return path
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise RuntimeError(f"download mislukt: {url}: {e}")
            time.sleep(1.5 * (i + 1))


# ---------- shapefiles lezen (zonder extra pakketten) ----------
def read_dbf(data):
    n, hl, rl = struct.unpack("<IHH", data[4:12])
    fields, pos = [], 32
    while data[pos] != 0x0D:
        fields.append((data[pos:pos + 11].split(b"\0")[0].decode("latin1"), data[pos + 16]))
        pos += 32
    recs = []
    for i in range(n):
        o, r = hl + i * rl + 1, {}
        for name, ln in fields:
            raw = data[o:o + ln]
            o += ln
            try:
                r[name] = raw.decode("utf-8").strip()
            except UnicodeDecodeError:
                r[name] = raw.decode("latin1").strip()
        recs.append(r)
    return recs


def read_shp(data):
    """Lijst van (soort, ringen) of None; soort is 'vlak' of 'lijn'."""
    pos, out = 100, []
    while pos < len(data):
        _, clen = struct.unpack(">II", data[pos:pos + 8])
        rec = data[pos + 8:pos + 8 + clen * 2]
        pos += 8 + clen * 2
        st = struct.unpack("<i", rec[:4])[0]
        if st not in (3, 5, 13, 15, 23, 25):
            out.append(None)
            continue
        nparts, npts = struct.unpack("<ii", rec[36:44])
        parts = list(struct.unpack(f"<{nparts}i", rec[44:44 + 4 * nparts])) + [npts]
        o = 44 + 4 * nparts
        pts = struct.unpack(f"<{2 * npts}d", rec[o:o + 16 * npts])
        rings = [[(pts[2 * j], pts[2 * j + 1]) for j in range(parts[k], parts[k + 1])] for k in range(nparts)]
        out.append(("vlak" if st in (5, 15, 25) else "lijn", rings))
    return out


def ring_area(r):
    return sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1)) / 2


def bbox_hit(rings, w, s, e, n):
    xs = [p[0] for r in rings for p in r]
    ys = [p[1] for r in rings for p in r]
    return max(xs) >= w and min(xs) <= e and max(ys) >= s and min(ys) <= n


def vlak_in(rings, venster):
    """Shapefile-vlak (buitenringen met de klok mee, gaten ertegenin) binnen een venster."""
    w, s, e, n = venster
    plus, min_ = [], []
    for r in rings:
        if len(r) < 4 or not bbox_hit([r], w, s, e, n):
            continue
        p = Polygon(r)
        p = p if p.is_valid else p.buffer(0)
        p = p.intersection(box(w, s, e, n))
        if not p.is_empty:
            (plus if ring_area(r) < 0 else min_).append(p)
    if not plus:
        return Polygon()
    return unary_union(plus).difference(unary_union(min_)) if min_ else unary_union(plus)


class Awmc:
    def __init__(self, path):
        self.zip = zipfile.ZipFile(path)

    def laag(self, naam):
        return read_shp(self.zip.read(naam + ".shp")), read_dbf(self.zip.read(naam + ".dbf"))


# ---------- hulpjes ----------
def polys(g):
    if g.is_empty:
        return []
    if g.geom_type == "Polygon":
        return [g]
    return [p for x in getattr(g, "geoms", []) for p in polys(x)]


def lines(g):
    if g.is_empty:
        return []
    if g.geom_type in ("LineString", "LinearRing"):
        return [g]
    return [p for x in getattr(g, "geoms", []) for p in lines(x)]


def rnd(g):
    """GeoJSON-geometrie op 0,001 graad (ca. 100 m). set_precision houdt vlakken geldig na het afronden."""
    g = set_precision(g, 0.001)
    if g.geom_type in ("GeometryCollection", "MultiPolygon", "Polygon") and polys(g):
        g = vlak(g)
    def r(c):
        if isinstance(c[0], (int, float)):
            return [round(c[0], 3), round(c[1], 3)]
        return [r(x) for x in c]
    m = mapping(g)
    return {"type": m["type"], "coordinates": r(m["coordinates"])}


def feat(g, **props):
    return {"type": "Feature", "properties": props, "geometry": rnd(g)}


def vlak(g):
    ps = polys(g)
    return ps[0] if len(ps) == 1 else MultiPolygon(ps)


def lijn(g, minlen=0.004):
    ls = [l for l in lines(g) if l.length >= minlen]
    if not ls:
        return None
    m = linemerge(MultiLineString(ls)) if len(ls) > 1 else ls[0]
    return m


def load_geo():
    geo = json.load(open(GEO, encoding="utf-8"))
    land = shape(geo["land"]["geometry"])
    return geo, (land if land.is_valid else land.buffer(0))


# ---------- 1. dichtgeslibde baaien ----------
def maak_baaien(awmc, land):
    """Zee volgens AWMC (Romeinse tijd) die volgens Natural Earth nu land is."""
    g_open, r_open = awmc.laag("open water/openwater")                       # zee + Bafameer + Golf van Latmus
    g_rom, _ = awmc.laag("open water/roman_open_water/roman_open_water")     # aanvullingen voor de Romeinse tijd
    zee, kust, verslag = [], [], []
    for b in BAAIEN:
        w, s, e, n = b["venster"]
        V = box(w, s, e, n)
        delen = [vlak_in(g[1], b["venster"]) for g in g_open + g_rom if g and bbox_hit(g[1], w, s, e, n)]
        zee_toen = unary_union(delen)
        land_nu = land.intersection(V)
        d = zee_toen.intersection(land_nu)
        d = d.buffer(-OPENING).buffer(OPENING).intersection(d)               # smalle tekenverschillen langs de kust weg
        delen = [p for p in polys(d) if p.area >= MIN_BAAI]
        if not delen:
            raise RuntimeError(f"geen verschil gevonden voor {b['n']}")
        d = unary_union(delen).simplify(0.0012).buffer(0)
        rand = V.boundary.buffer(1e-6)
        if d.intersects(rand):
            raise RuntimeError(f"{b['n']}: het vlak raakt de rand van het venster; maak het venster groter")
        zee_nu = box(w - 0.1, s - 0.1, e + 0.1, n + 0.1).difference(land)
        # het vlak iets over de zee van nu laten doorlopen: de kustlijn van nu verdwijnt eronder
        # snippers land van nu die los in de oude baai overblijven (kleiner dan MIN_BAAI) horen bij het zeevlak
        snippers = [p for p in polys(land_nu.difference(d)) if p.area < MIN_BAAI and p.distance(d) < 1e-9]
        tekenvlak = unary_union([d, d.buffer(ZEERAND).intersection(zee_nu), *snippers]).buffer(0)
        oever = lijn(d.boundary.difference(zee_nu.buffer(0.0008)), 0.015)   # losse snippers van een paar honderd meter vervallen
        zee.append(feat(vlak(tekenvlak), n=b["n"], tijd=b["tijd"]))
        if oever is not None:
            kust.append(feat(oever, n=b["n"]))
        km2 = d.area * 111.2 ** 2 * math.cos(math.radians((s + n) / 2))
        verslag.append(f"{b['n']}: {km2:.0f} km² was zee en is nu land ({len(polys(d))} vlak(ken))")
    return zee, kust, verslag


# ---------- 2. meren en de Dode Zee ----------
def maak_meren(awmc):
    g, r = awmc.laag("inland water/inland-water-osm")
    meren, onzeker, verslag = [], [], []
    dz = None
    for gi, ri in zip(g, r):
        if gi is None:
            continue
        t = ri.get("TITLE", "")
        if t in MEREN and ri.get("TYPE") == "lake":
            xs = [p[0] for rr in gi[1] for p in rr]
            ys = [p[1] for rr in gi[1] for p in rr]
            p = vlak_in(gi[1], (min(xs) - 1, min(ys) - 1, max(xs) + 1, max(ys) + 1)).simplify(0.0012)
            naam, tijd = MEREN[t]
            meren.append(feat(vlak(p), n=naam, tijd=tijd, pleiades=ri.get("PID", "")))
            verslag.append(f"{naam}: {p.area * 111.2 ** 2 * math.cos(math.radians(p.centroid.y)):.0f} km²")
        if t == DODE_ZEE:
            dz = vlak_in(gi[1], (35, 30.5, 36, 32.2))
    if dz is None or len(meren) != len(MEREN):
        raise RuntimeError("AWMC: niet alle meren gevonden")
    # De drempel tussen het noordelijke en het zuidelijke bekken ligt in de zeestraat bij het schiereiland Lisan.
    # Het script zoekt de smalste plek van het AWMC-meer tussen 31,15 en 31,40 graden noorderbreedte en knipt daar.
    best = None
    for i in range(0, 126):
        la = 31.15 + i * 0.002
        wdt = dz.intersection(LineString([(35.0, la), (36.0, la)])).length
        if wdt > 0 and (best is None or wdt < best[0]):
            best = (wdt, la)
    la = best[1]
    noord = dz.intersection(box(35, la, 36, 32.2)).simplify(0.0012)
    zuid = dz.intersection(box(35, 30.5, 36, la)).simplify(0.0012)
    meren.append(feat(vlak(noord), n="Dode Zee (Zoutzee)", tijd="waterstand tussen 390 en 415 m onder zeeniveau", pleiades="697709"))
    onzeker.append((zuid, dict(n="Dode Zee, zuidelijk bekken", tijd="alleen bij hoog water; meestal droog")))
    verslag.append(f"Dode Zee: geknipt op {la:.3f} N, waar het meer {best[0] * 111.2 * math.cos(math.radians(la)):.1f} km breed is")
    return meren, onzeker, noord, verslag


# ---------- 3. kop van de Perzische Golf (Forti e.a. 2022, figuur 14) ----------
def figuur_uit_pdf(pdf):
    d = open(pdf, "rb").read()
    for m in re.finditer(rb"<<(?:[^<>]|<<[^<>]*>>)*?>>\s*stream\r?\n", d):
        h = m.group(0)
        if b"DCTDecode" in h and f"/Width {FIG['breedte']}".encode() in h and f"/Height {FIG['hoogte']}".encode() in h:
            ln = int(re.search(rb"/Length (\d+)", h).group(1))
            return Image.open(io.BytesIO(d[m.end():m.end() + ln])).convert("RGB")
    raise RuntimeError("figuur 14 niet gevonden in de PDF van Forti e.a. 2022")


def kader_overgangen(v):
    """Het kader van de figuur bestaat uit lange zwarte en witte stukken. Geeft (begin, [overgangen], eind) in pixels:
    de overgangen tussen twee lange stukken zijn de graadstreepjes."""
    donker = v < 110
    stukken, s = [], 0
    for i in range(1, len(v) + 1):
        if i == len(v) or donker[i] != donker[s]:
            if i - s >= 50:
                stukken.append((s, i))
            s = i
    return stukken[0][0], [(a[1] + b[0]) / 2 for a, b in zip(stukken, stukken[1:])], stukken[-1][1]


def maak_golf(pdf, land):
    im = np.asarray(figuur_uit_pdf(pdf)).astype(int)
    H, W, _ = im.shape
    grijs = im.sum(2) / 3
    # kader: boven- en onderrand (rij 13 en H-13), linker- en rechterrand (kolom 13 en W-15)
    x0, xs, x1 = kader_overgangen(grijs[13])
    y0, ys, y1 = kader_overgangen(grijs[:, 13])
    if len(xs) != 2 or len(ys) != 2:
        raise RuntimeError(f"kader van figuur 14 niet herkend: {xs} {ys}")
    (x_a, x_b), (y_a, y_b) = xs, ys
    kx = (x_b - x_a) / (FIG["lon"][1] - FIG["lon"][0])
    ky = (y_b - y_a) / (FIG["lat"][0] - FIG["lat"][1])
    if abs(kx - ky) / kx > 0.01:
        raise RuntimeError(f"figuur 14 is geen platte kaart in graden: {kx:.2f} en {ky:.2f} px per graad")
    lon = lambda x: FIG["lon"][0] + (x - x_a) / kx
    lat = lambda y: FIG["lat"][0] - (y - y_a) / ky
    # controle: de rode stippen van Ur en Uruk moeten op hun bekende plek uitkomen
    rood = (im[..., 0] > 190) & (im[..., 1] < 80) & (im[..., 2] < 80)
    verslag = [f"figuur 14: {kx:.1f} px per graad; kader {lon(x0):.2f}-{lon(x1):.2f} O, {lat(y1):.2f}-{lat(y0):.2f} N"]
    for naam, (la, lo) in FIG_CONTROLE.items():
        px, py = x_a + (lo - FIG["lon"][0]) * kx, y_a + (FIG["lat"][0] - la) * ky
        yy, xx = np.nonzero(rood[int(py) - 6:int(py) + 7, int(px) - 6:int(px) + 7])
        if len(xx) < 8:
            raise RuntimeError(f"figuur 14: stip van {naam} niet gevonden")
        dx, dy = xx.mean() + int(px) - 6 + 0.5 - px, yy.mean() + int(py) - 6 + 0.5 - py
        km = math.hypot(dx / kx * 111.2 * math.cos(math.radians(la)), dy / ky * 111.2)
        verslag.append(f"figuur 14: stip van {naam} ligt {km:.1f} km van de bekende plek")
        if km > 2.5:
            raise RuntimeError(f"figuur 14: georeferentie klopt niet ({naam} {km:.1f} km)")
    b = FIG["blauw"]
    blauw = (abs(im[..., 0] - b[0]) < 20) & (abs(im[..., 1] - b[1]) < 20) & (abs(im[..., 2] - b[2]) < 20)
    mg = FIG["marge"]
    blauw[:mg], blauw[H - mg:], blauw[:, :mg], blauw[:, W - mg:] = False, False, False, False
    # rijen van aaneengesloten blauwe pixels -> rechthoeken -> één vlak
    rechthoeken = []
    for y in range(H):
        rij = blauw[y]
        x = 0
        while x < W:
            if rij[x]:
                x0 = x
                while x < W and rij[x]:
                    x += 1
                rechthoeken.append(box(x0, y, x, y + 1))
            else:
                x += 1
    masker = unary_union(rechthoeken).buffer(2.5).buffer(-2.5)        # letters en stippen in het blauw dichten
    groot = max(polys(masker), key=lambda p: p.area)
    groot = Polygon(groot.exterior)                                    # gaten (plaatsnamen in de figuur) vullen
    geo = Polygon([(lon(x), lat(y)) for x, y in groot.exterior.coords]).simplify(0.006).buffer(0)
    kader = box(lon(mg), lat(H - mg), lon(W - mg), lat(mg))
    toen_zee_nu_land = geo.intersection(land)
    delen = [p for p in polys(toen_zee_nu_land.buffer(-0.01).buffer(0.01).intersection(toen_zee_nu_land)) if p.area > 0.01]
    # Losse vlakken die door de rand van de figuur worden afgesneden (het eiland Bubiyan aan de onderrand) zijn in de
    # bron niet af; die vervallen. Het hoofdvlak raakt het kader alleen kort in het oosten; daar krijgt het geen oever.
    hoofd = max(delen, key=lambda p: p.area)
    delen = [p for p in delen if p is hoofd or not p.intersects(kader.boundary.buffer(0.02))]
    v = unary_union(delen).buffer(0)
    km2 = v.area * 111.2 ** 2 * math.cos(math.radians(30.7))
    verslag.append(f"Perzische Golf: {km2:.0f} km² zee in de figuur is nu land ({len(polys(v))} vlak(ken)); pixel = {111.2 / kx:.2f} km")
    return v, kader, verslag


# ---------- 4. oude Nijlarmen ----------
def maak_nijl(awmc):
    g, r = awmc.laag("rivers/awmc-osm-rivers")
    out = []
    for gi, ri in zip(g, r):
        if gi is None or ri.get("Name") not in NIJLARMEN or ri.get("origin") != "BAtlas74":
            continue
        m = MultiLineString([x for x in gi[1] if len(x) >= 2])
        l = lijn(linemerge(m).simplify(0.004), 0)
        out.append(feat(l, n=NIJLARMEN[ri["Name"]], pleiades=ri.get("pid", "")))
    if len(out) != len(NIJLARMEN):
        raise RuntimeError(f"AWMC: {len(out)} van {len(NIJLARMEN)} Nijlarmen gevonden")
    return out


def maak_jordaan(awmc, geo, meren):
    """De Jordaan van toen: ten noorden van het Meer van Galilea de loop volgens AWMC (door het Hulameer), ten zuiden
    ervan de lijn uit geo.json. Stukken die door een meer van toen lopen vervallen (een meer is geen rivier)."""
    g, r = awmc.laag("rivers/awmc-osm-rivers")
    galilea = unary_union([shape(f["geometry"]) for f in geo["lakes"] if f["properties"]["n"] == "Sea of Galilee"])
    water = unary_union([galilea, *meren])
    midden = galilea.centroid.y
    noord = [MultiLineString([x for x in gi[1] if len(x) >= 2]) for gi, ri in zip(g, r)
             if gi is not None and ri.get("Name") == "Iordanes" and ri.get("en_name") == "Jordan"]
    if len(noord) != 1:
        raise RuntimeError(f"AWMC: {len(noord)} Jordaanlijnen gevonden, 1 verwacht")
    boven = noord[0].intersection(box(34, midden, 37, 34.5)).difference(water).simplify(0.002)
    # De AWMC-lijn houdt op bij de noordoever van het meer zoals AWMC die tekent; in geo.json ligt die oever ca. 2 km
    # zuidelijker. Het script trekt de lijn recht door tot de dichtstbijzijnde oever van geo.json (aansluitstukje).
    eind = min((Point(c) for l in lines(boven) for c in (l.coords[0], l.coords[-1])), key=galilea.distance)
    aansluiting = LineString([eind, nearest_points(eind, galilea)[1]])
    if aansluiting.length > 0.03:
        raise RuntimeError(f"Jordaan: aansluiting op het Meer van Galilea is {aansluiting.length * 111:.1f} km, te lang")
    boven = unary_union([boven, aansluiting])
    zuid = unary_union([shape(f["geometry"]) for f in geo["rivers"] if f["properties"]["n"] == "Jordaan"])
    onder = zuid.intersection(box(34, 30, 37, midden)).difference(water)
    return [feat(lijn(boven, 0.003), n="Jordaan", vast=1, pleiades="687932"), feat(lijn(onder, 0.003), n="Jordaan", vast=1)]


# ---------- 5. stuwmeren van nu ----------
def maak_stuwmeren(path, geo):
    al = {f["properties"]["n"] for f in geo["lakes"]}
    out = []
    for f in json.load(open(path, encoding="utf-8"))["features"]:
        p = f["properties"]
        if p.get("featurecla") != "Reservoir" or p.get("name") in al:
            continue
        g = shape(f["geometry"]).intersection(GEOBOX)
        if g.is_empty:
            continue
        out.append(feat(vlak(g.simplify(0.004)), n=p["name"], dam=p.get("year") if (p.get("year") or 0) > 0 else None))
    return out


def maak(cache):
    geo, land = load_geo()
    awmc = Awmc(fetch(AWMC_URL, os.path.join(cache, f"awmc-physical-{AWMC_COMMIT[:7]}.zip")))
    pdf = fetch(FORTI_URL, os.path.join(cache, "forti-2022.pdf"))
    ne_lakes = fetch(NE_LAKES_URL, os.path.join(cache, "ne_10m_lakes.geojson"))
    verslag = []
    zee, kust, v = maak_baaien(awmc, land)
    verslag += v
    meren, onz, dz_noord, v = maak_meren(awmc)
    verslag += v
    golf, kader, v = maak_golf(pdf, land)
    verslag += v
    onz.append((golf, dict(n="Kop van de Perzische Golf", tijd="ca. 3000-2000 v.Chr. (Forti e.a. 2022); omstreden")))
    bitter = [shape(f["geometry"]) for f in geo["lakes"] if f["properties"]["n"] == "Great Bitter Lake"]
    onz.append((unary_union(bitter), dict(n="Bittermeren", tijd="omtrek van nu; in de oudheid meer, moeras of zoutvlakte")))
    # De oever van een onzeker vlak: zijn rand, zonder de stukken langs de zee van nu, langs ander water van toen en
    # langs de rand van de bron (het kader van de figuur), want dat zijn geen oevers.
    zee_nu = box(30, 28, 51, 34).difference(land)
    geen_oever = unary_union([zee_nu.buffer(0.004), dz_noord.buffer(0.002), kader.boundary.buffer(0.02)])
    onzeker, rand = [], []
    for g, props in onz:
        onzeker.append(feat(vlak(g), **props))
        o = lijn(g.boundary.difference(geen_oever))
        if o is not None:
            rand.append(feat(o, n=props["n"]))
    toen_meren = [shape(f["geometry"]) for f in meren] + [g for g, _ in onz]
    rivieren = maak_nijl(awmc) + maak_jordaan(awmc, geo, toen_meren)
    doc = {
        "_info": {
            "wat": "Het landschap van de Bijbelse tijd, voor zover het afwijkt van geo.json (het landschap van nu). Gemaakt met scripts/bijbelreis-toen.py.",
            "licentie": "ODbL 1.0 (afgeleide database van AWMC-geodata); zie docs/bijbelreis-audit/ondergrond.md",
            "bronnen": [
                f"Ancient World Mapping Center, geodata (ODbL 1.0), https://github.com/AWMC/geodata, commit {AWMC_COMMIT[:7]}; naar de Barrington Atlas en OpenStreetMap",
                "Forti e.a. 2022, Quaternary Research, doi:10.1017/qua.2022.22 (CC BY 4.0), figuur 14",
                "Natural Earth 1:10m (publiek domein)",
            ],
        },
        "zee": zee, "kust": kust, "meren": meren, "onzeker": onzeker, "rand": rand,
        "rivieren": rivieren, "weg": WEG, "wegRivier": ["Jordaan"], "nu": maak_stuwmeren(ne_lakes, geo),
    }
    s = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    with open(TOEN, "w", encoding="utf-8") as fh:
        fh.write(s)
    for regel in verslag:
        print("  " + regel)
    print(f"toen.json  {len(s.encode()) / 1024:.1f} kB: " + ", ".join(f"{k} {len(doc[k])}" for k in ("zee", "kust", "meren", "onzeker", "rand", "rivieren", "nu")))


# ---------- controle van plaatsen en routes ----------
NODE = r"""
const fs = require("fs"), path = require("path"), vm = require("vm");
const PUB = process.argv[1];
const html = fs.readFileSync(path.join(PUB, "bijbelreis.html"), "utf8");
const scripts = [...html.matchAll(/<script src="\/bijbelreis\/([^"?]+)"/g)].map((m) => m[1]).filter((s) => !/leaflet|app\.js/.test(s));
const ctx = { window: {} };
for (const s of scripts) vm.runInNewContext(fs.readFileSync(path.join(PUB, "bijbelreis", s), "utf8").replace(/\bBR\./g, "window.BR."), ctx);
const BR = ctx.window.BR;
const ll = (k) => Array.isArray(k) ? k : BR.plaatsen[k] ? BR.plaatsen[k].ll : BR.W[k] || null;
const routes = [];
for (const b of BR.boeken) for (const d of b.delen) d.steps.forEach((s, i) => (s.r || []).forEach((r, j) => routes.push({ key: `${b.id}:${d.id}:${i}:${j}`, deel: d.n, ids: r.p.map((k) => Array.isArray(k) ? "" : k), pts: r.p.map(ll) })));
const plaatsen = Object.fromEntries(Object.entries(BR.plaatsen).map(([id, p]) => [id, { n: p.n, ll: p.ll, t: p.t || "", alt: p.alt || [] }]));
process.stdout.write(JSON.stringify({ plaatsen, W: BR.W, routes }));
"""


def controle():
    """Legt alle plaatsen, tussenpunten en routes tegen het water van toen en van nu. Verplaatst niets; meldt alleen."""
    geo, land = load_geo()
    toen = json.load(open(TOEN, encoding="utf-8"))
    br = json.loads(subprocess.run(["node", "-e", NODE, PUB], check=True, capture_output=True, text=True).stdout)
    U = lambda fs: unary_union([shape(f["geometry"]) for f in fs]) if fs else Polygon()
    meren_nu = unary_union([shape(f["geometry"]) for f in geo["lakes"]] + [shape(f["geometry"]) for f in toen["nu"]])
    meren_oud = U([f for f in geo["lakes"] if f["properties"]["n"] not in toen["weg"]])
    lagen = {f["properties"]["n"]: shape(f["geometry"]) for k in ("zee", "meren", "onzeker") for f in toen[k]}
    soort = {f["properties"]["n"]: k for k in ("zee", "meren", "onzeker") for f in toen[k]}
    baaien = U(toen["zee"])
    water_toen = unary_union([meren_oud, U(toen["meren"])])
    land_toen = land.difference(baaien)
    from shapely import contains_xy, prepare
    for g in [land, land_toen, meren_nu, water_toen, *lagen.values()]:
        prepare(g)

    def waar(lo, la):
        """(nu, toen, laag): 'land', 'zee' of 'meer' in elke stand, plus de naam van het vlak van toen waarin het punt valt."""
        nu = "meer" if contains_xy(meren_nu, lo, la) else "land" if contains_xy(land, lo, la) else "zee"
        laag = next((n for n, g in lagen.items() if contains_xy(g, lo, la)), None)
        if laag and soort[laag] == "onzeker":
            tn = "onzeker"
        else:
            tn = "meer" if contains_xy(water_toen, lo, la) else "land" if contains_xy(land_toen, lo, la) else "zee"
        return nu, tn, laag

    # Meren en stuwmeren die alleen in de stand Nu staan: ook daar kan een route doorheen lopen.
    lagen_nu = {"(nu) " + f["properties"]["n"]: shape(f["geometry"]) for f in toen["nu"] + [x for x in geo["lakes"] if x["properties"]["n"] in toen["weg"]]}
    for g in lagen_nu.values():
        prepare(g)

    print("\n== Plaatsen en tussenpunten die door het landschap van toen veranderen of in een vlak van toen liggen ==")
    punten = [("plaats", f"{p['n']} ({pid}, {p['t'] or 'geen soort'})", p["ll"]) for pid, p in br["plaatsen"].items()]
    punten += [("tussenpunt", pid, p) for pid, p in br["W"].items()]
    punten += [("andere mogelijke plek", f"{p['n']} ({pid})", a[:2]) for pid, p in br["plaatsen"].items() for a in p["alt"]]
    n, al_in_zee = 0, []
    for naam, wie, (la, lo) in punten:
        nu, tn, laag = waar(lo, la)
        if nu != tn or laag:
            n += 1
            print(f"  {naam} {wie} [{la}, {lo}]: nu {nu}, toen {tn}" + (f" ({laag})" if laag else ""))
        elif tn != "land":
            al_in_zee.append(f"{wie.split(' (')[0]} ({tn})")
    print(f"  {n} punten.")
    print(f"\n== Punten die in beide standen in het water liggen (niet door dit script; kustplaatsen op de grove kustlijn van\n   geo.json, tussenpunten van zeereizen en plaatsen van de soort water) ==\n  {len(al_in_zee)}: " + ", ".join(al_in_zee))

    print("\n== Routes die door een vlak van toen of door een (stuw)meer van nu lopen ==")
    regels = {}
    for r in br["routes"]:
        if any(p is None for p in r["pts"]):
            continue
        tel = {"nu": {}, "toen": {}}
        per_laag = {}
        tot = 0.0
        for a, b_ in zip(r["pts"], r["pts"][1:]):
            km = 111.2 * math.hypot((b_[0] - a[0]), (b_[1] - a[1]) * math.cos(math.radians((a[0] + b_[0]) / 2)))
            k = max(1, int(km / 0.25))
            for i in range(k):
                t = (i + 0.5) / k
                la, lo = a[0] + (b_[0] - a[0]) * t, a[1] + (b_[1] - a[1]) * t
                nu, tn, laag = waar(lo, la)
                tel["nu"][nu] = tel["nu"].get(nu, 0) + km / k
                tel["toen"][tn] = tel["toen"].get(tn, 0) + km / k
                for nm in [laag] + [x for x, g in lagen_nu.items() if nu == "meer" and contains_xy(g, lo, la)]:
                    if nm:
                        per_laag[nm] = per_laag.get(nm, 0) + km / k
            tot += km
        g = lambda st, s: tel[st].get(s, 0)
        stuk = "; ".join(f"{n} {km:.1f} km" for n, km in sorted(per_laag.items()) if km >= 0.3)
        if not stuk:
            continue
        # Een route telt als zeereis als ze nu voor meer dan de helft over zee loopt.
        soort_r = "zeereis" if g("nu", "zee") > 0.5 * tot else "landreis"
        tekst = f"{soort_r}, {tot:.0f} km; over land nu {g('nu', 'land'):.1f} km, toen {g('toen', 'land'):.1f} km; door {stuk}"
        regels.setdefault((r["deel"], tekst), []).append(r["key"])
    for (deel, tekst), keys in sorted(regels.items(), key=lambda x: x[1][0]):
        print(f"  {keys[0]}" + (f" (+{len(keys) - 1})" if len(keys) > 1 else "") + f" [{deel}]: {tekst}")
    print(f"  {sum(len(v) for v in regels.values())} routes.")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "bijbelreis-toen"))
    ap.add_argument("--controle", action="store_true")
    ap.add_argument("--alleen-controle", action="store_true")
    a = ap.parse_args()
    if not a.alleen_controle:
        maak(a.cache)
    if a.controle or a.alleen_controle:
        controle()


if __name__ == "__main__":
    main()
