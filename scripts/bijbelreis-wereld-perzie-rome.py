#!/usr/bin/env python3
"""Bouwt twee perioden voor de laag ‘De wereld in die tijd’:

  public/bijbelreis/wereld/perioden/perzie.json          Perzië van Darius I tot Nehemia (522–430 v.Chr.)
  public/bijbelreis/wereld/perioden/geboorte-jezus.json  De wereld rond de geboorte van de Heere Jezus (40 v.Chr. – 40 n.Chr.)

Gebruik: python3 scripts/bijbelreis-wereld-perzie-rome.py            (schrijft beide JSON-bestanden)
         python3 scripts/bijbelreis-wereld-perzie-rome.py --controle (schrijft niets; faalt als een bestand afwijkt)

Werkwijze zoals bij Daniël (scripts/bijbelreis-wereld-daniel.py, waarvan de bouwstenen van Perzië hier worden
hergebruikt): grenzen zijn eigen, grove tekeningen langs kusten, rivieren, gebergten en woestijnranden, afgerond op
0,05 graad; er is geen kaart en geen grensdataset overgenomen. Een rijk bestaat uit bouwstenen, zodat buren precies op
elkaar aansluiten. Het Romeinse rijk rond Judea is ‘wat overblijft’: een grove vorm min de vorsten en volken die er niet
direct onder vielen, zodat niets dubbel gekleurd wordt.
Coördinaten: [lengte, breedte] (WGS84). Verantwoording: docs/bijbelreis-wereld/perzie-bronnen.md en
docs/bijbelreis-wereld/geboorte-jezus-bronnen.md.

Op de as van ‘geboorte-jezus’ (soort ‘nchr’) is een negatief jaar v.Chr.: -4 = 4 v.Chr. Een jaar 0 bestaat niet.
"""
import importlib.util
import json
import os
import sys

from shapely.geometry import MultiPolygon, Polygon, box
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

HIER = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HIER, "..", "public", "bijbelreis", "wereld", "perioden")
RASTER = 20  # 1/20 graad = 0,05

_spec = importlib.util.spec_from_file_location("daniel", os.path.join(HIER, "bijbelreis-wereld-daniel.py"))
DAN = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(DAN)
compact, laad_plaatsen = DAN.compact, DAN.laad_plaatsen


def P(*punten):
    return Polygon(punten)


# ---------------------------------------------------------------- geometrie naar GeoJSON (ook MultiPolygon)
def rond(x):
    return round(round(x * RASTER) / RASTER, 2)


def _ring(poly):
    poly = orient(Polygon(poly.exterior), sign=1.0)
    ring = []
    for x, y in poly.exterior.coords:
        p = [rond(x), rond(y)]
        if not ring or ring[-1] != p:
            ring.append(p)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    if len(ring) < 4 or not Polygon(ring).is_valid:
        raise SystemExit(f"ongeldige ring na afronden: {ring[:6]}…")
    return ring


def geometrie(delen, min_opp=0.02, vereenvoudig=0.0):
    """Bouwstenen samenvoegen. Een rijk mag uit losse delen bestaan (MultiPolygon); splinters (< min_opp graad²) vallen weg."""
    def plat(x):
        return [y for z in x for y in plat(z)] if isinstance(x, (list, tuple)) else [x]
    g = unary_union([x.buffer(0) for x in plat(delen)])
    stukken = [g] if g.geom_type == "Polygon" else list(g.geoms)
    stukken = [s for s in stukken if s.area >= min_opp]
    if vereenvoudig:
        stukken = [s.simplify(vereenvoudig, preserve_topology=True) for s in stukken]
    stukken.sort(key=lambda s: -s.area)
    ringen = [_ring(s) for s in stukken]
    if len(ringen) == 1:
        return {"type": "Polygon", "coordinates": [ringen[0]]}
    for i, a in enumerate(ringen):  # delen mogen elkaar niet overlappen
        for b in ringen[i + 1:]:
            if Polygon(a).intersection(Polygon(b)).area > 1e-6:
                raise SystemExit("delen van een MultiPolygon overlappen")
    return {"type": "MultiPolygon", "coordinates": [[r] for r in ringen]}


def sleutel(jaar, delen, opmerking=None, **kw):
    s = {"jaar": jaar, "betrouwbaarheid": "benaderd", "geometrie": geometrie(delen, **kw)}
    if opmerking:
        s["opmerking"] = opmerking
    return s


def d(jaar, status, bron, **extra):
    x = {"jaar": jaar, "status": status, "bron": bron}
    x.update(extra)
    return x


def g(id, titel, tekst, jaar, status, bron, personen, plaats, verhaal=None, belangrijk=False, **extra):
    x = {"id": id, "titel": titel, "tekst": tekst, "jaar": jaar, "tot": None, "status": status, "bron": bron,
         "personen": personen, "plaats": plaats, "verhaal": verhaal, "belangrijk": belangrijk}
    x.update(extra)
    return x


G = "2026-11-17"
SV = "Statenvertaling (1637), publiek domein; gecontroleerd met data/statenvertaling en scripts/bijbel-check.py"
LIV = "© Livius.org (alle rechten voorbehouden); alleen geraadpleegd en kort samengevat, niets overgenomen"
WIKI = "Wikipedia, CC BY-SA 4.0; alleen geraadpleegd voor jaartallen en de stand van het onderzoek, geen tekst overgenomen"
PLE = "CC BY 3.0 (naamsvermelding: Pleiades)"
B_RIJK = "Grenzen bij benadering: rijken hadden geen vaste grenzen zoals nu."


def pleiades(id, nr, naam):
    return {"id": id, "kort": "Pleiades", "soort": "dataset", "titel": f"Pleiades {nr}: {naam}", "url": f"https://pleiades.stoa.org/places/{nr}", "licentie": PLE, "geraadpleegd": G}


EIGEN = {"id": "eigen-tekening", "kort": "eigen tekening", "soort": "dataset", "titel": "Grenzen: eigen grove tekening langs kusten, rivieren, gebergten en woestijnranden (scripts/bijbelreis-wereld-perzie-rome.py)", "url": None, "licentie": "eigen werk; geen kaart overgenomen", "geraadpleegd": G}
PLAATSEN = {"id": "bijbelreis-plaatsen", "kort": "Bijbelreis", "soort": "dataset", "titel": "Bijbelreis plaatsen.js (ligging gecontroleerd met OpenBible.info CC BY 4.0 en Pleiades CC BY)", "url": None, "licentie": "eigen gegevens Bijbelreis; zie docs/bijbelreis-audit/plaatsen.md", "geraadpleegd": G}


# ================================================================= 1. PERZIË (522–430 v.Chr.)
# Perzië in 522: precies de vorm van Daniël in 525–515 (Behistun §6: de landen van Darius in 522).
PER_522 = DAN.PER_525
# Thracië (Skudra): vanaf de veldtocht van Darius tegen de Skythen (513) tot na de Griekse overwinningen van 480–479
# (Eion valt in 476/475). Alleen de kust van de Egeïsche Zee, de Bosporus en de Zwarte Zee tot ruim de Balkan.
THRACIE = P((23.85, 40.8), (24.95, 40.95), (25.5, 40.9), (26.05, 40.75), (26.2, 40.35), (26.65, 40.05), (26.75, 40.4),
            (27.3, 40.65), (27.95, 40.95), (28.95, 41.05), (28.15, 41.55), (27.75, 42.1), (27.65, 42.6), (27.95, 43.2),
            (28.55, 43.75), (28.7, 44.4), (27.0, 43.65), (25.5, 42.75), (24.5, 42.05), (23.9, 41.4))
# De Griekse steden op het vasteland (geen rijk: Athene, Sparta en andere stadstaten). Met Euboea; zonder de eilanden.
GRIEKS = P((22.4, 38.95), (23.2, 39.05), (23.6, 38.75), (24.1, 38.6), (24.6, 38.15), (24.05, 37.65), (23.6, 37.95),
           (23.35, 37.95), (23.0, 37.9), (23.15, 37.65), (23.5, 37.35), (22.8, 37.55), (22.95, 37.0), (23.2, 36.45),
           (22.55, 36.75), (22.5, 36.4), (22.1, 37.05), (21.7, 36.8), (21.65, 37.25), (21.35, 37.65), (21.4, 38.15),
           (21.75, 38.25), (22.1, 38.25), (22.6, 38.05), (22.9, 37.95), (22.95, 38.05), (22.6, 38.2), (22.4, 38.4),
           (21.85, 38.4), (21.4, 38.35), (21.1, 38.6), (20.75, 38.9), (21.0, 39.05), (21.5, 39.2), (22.0, 39.05))
# De provincie Juda (Jehud) in de Perzische tijd: van Mizpa tot Beth-Zur, van Jericho tot de rand van de Sefela
# (plaatsen uit Nehemia 3 en 7). Ligt binnen Perzië.
JEHUD = P((34.95, 31.95), (35.25, 32.0), (35.45, 31.9), (35.45, 31.55), (35.1, 31.55), (34.95, 31.65))

PERZIE_BRONNEN = [
    {"id": "sv", "kort": "Statenvertaling", "soort": "bijbel", "titel": "Statenvertaling: Ezra, Nehemia, Esther, Haggaï, Zacharia", "url": None, "licentie": SV, "geraadpleegd": G},
    {"id": "behistun", "kort": "Behistun", "soort": "historisch", "titel": "Inscriptie van Behistun (Darius I), vertaling en toelichting", "url": "https://www.livius.org/sources/content/behistun-persian-text/", "licentie": LIV, "geraadpleegd": G},
    {"id": "behistun-lijst", "kort": "Behistun", "soort": "historisch", "titel": "Inscriptie van Behistun §6: de 23 landen van Darius I", "url": "https://www.livius.org/articles/person/darius-the-great/sources/four-achaemenid-empire-lists/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-koningen", "kort": "Livius.org", "soort": "historisch", "titel": "Livius.org: Achaemenid Kings (lijst met data): Darius I 29 sept. 522 – na 17 nov. 486; Xerxes I vóór 1 dec. 486 – aug. 465; Artaxerxes I aug. 465 – na 24 dec. 424", "url": "https://www.livius.org/articles/dynasty/achaemenids/achaemenid-kings/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-darius", "kort": "Livius.org", "soort": "historisch", "titel": "Livius.org: Darius I the Great", "url": "https://www.livius.org/articles/person/darius-the-great/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-marathon", "kort": "Livius.org", "soort": "historisch", "titel": "Livius.org: Marathon (490 BCE)", "url": "https://www.livius.org/articles/battle/marathon-490-bce/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-salamis", "kort": "Livius.org", "soort": "historisch", "titel": "Livius.org: Salamis (480 BCE)", "url": "https://www.livius.org/articles/battle/salamis-480-bce/", "licentie": LIV, "geraadpleegd": G},
    {"id": "herodotus", "kort": "Herodotus", "soort": "historisch", "titel": "Herodotus, Historiën IV–IX (vert. G.C. Macaulay, 1890): o.a. 4.143–144 (Thracië), 6.102–117 (Marathon), 8.83–96 (Salamis)", "url": "https://en.wikisource.org/wiki/The_History_of_Herodotus_(Macaulay)", "licentie": "Publiek domein (Wikisource)", "geraadpleegd": G},
    {"id": "wiki-ahasveros", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Ahasuerus (identificatie met Xerxes I; oudere tradities: Artaxerxes)", "url": "https://en.wikipedia.org/wiki/Ahasuerus", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-ezra", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Ezra (zevende jaar van Artaxerxes I, ca. 458/457 v.Chr.; sommigen 398/397 onder Artaxerxes II)", "url": "https://en.wikipedia.org/wiki/Ezra", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-nehemia", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Nehemiah (twintigste jaar van Artaxerxes I, 445 of 444 v.Chr.)", "url": "https://en.wikipedia.org/wiki/Nehemiah", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-skudra", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Skudra (Perzisch Thracië, 513 tot ca. 479–465 v.Chr.)", "url": "https://en.wikipedia.org/wiki/Skudra", "licentie": WIKI, "geraadpleegd": G},
    pleiades("pleiades-persepolis", 922695, "Persepolis"),
    pleiades("pleiades-pasargadae", 922693, "Pasargadae"),
    pleiades("pleiades-behistun", 903002, "Bisutun/Bagistana (Behistun)"),
    pleiades("pleiades-marathon", 580021, "Marathon"),
    pleiades("pleiades-salamis", 580101, "Salamis (eiland)"),
    PLAATSEN, EIGEN,
]

PERZIE_PERSONEN = [
    {"id": "darius-i", "naam": "Darius I", "alt": ["Darius de Grote"], "personenId": "darius_pers", "lijn": "regering",
     "van": d(522, "historisch", ["behistun", "livius-koningen"], begin="regering", opmerking="Koning op 29 september 522 v.Chr., na de dood van Cambyses en de strijd tegen Gaumata (Behistun)."),
     "tot": d(486, "historisch", "livius-koningen", einde="stierf", opmerking="Hij stierf eind 486 v.Chr."),
     "ouder": None, "rol": "Koning van Perzië; in zijn zesde jaar was de tempel in Jeruzalem klaar",
     "ref": ["Ezra 4:24", "Ezra 6:15", "Haggaï 1:1", "Zacharia 1:1"], "gebeurtenissen": ["darius-koning", "profeten", "tempel-klaar", "marathon"], "verhaal": "v76",
     "opmerking": "Dat de Darius van Ezra, Haggaï en Zacharia Darius I is, wordt algemeen aangenomen."},
    {"id": "xerxes", "naam": "Ahasveros", "alt": ["Xerxes I"], "personenId": "ahasveros", "lijn": "regering",
     "van": d(486, "historisch", "livius-koningen", begin="regering"),
     "tot": d(465, "historisch", "livius-koningen", einde="stierf", opmerking="In augustus 465 v.Chr. vermoord."),
     "ouder": "darius-i", "rol": "Koning van Perzië (Xerxes I); maakte Esther koningin",
     "ref": ["Esther 1:1–3", "Esther 2:16–17", "Ezra 4:6"], "gebeurtenissen": ["salamis", "esther-koningin", "purim"], "verhaal": "v77",
     "opmerking": "De meeste onderzoekers stellen de Ahasveros van Esther gelijk aan Xerxes I: de Hebreeuwse naam komt van de Perzische naam Xšayāršā. Oudere tradities (de Griekse vertaling, Josephus) noemen hem Artaxerxes. Daarom zijn de jaartallen van Esther bij benadering."},
    {"id": "artaxerxes", "naam": "Arthahsasta", "alt": ["Artaxerxes I"], "personenId": "arthahsasta", "lijn": "regering",
     "van": d(465, "historisch", "livius-koningen", begin="regering"),
     "tot": d(424, "historisch", "livius-koningen", einde="stierf", opmerking="Hij regeerde tot 424 v.Chr., na het einde van deze tijdlijn."),
     "ouder": "xerxes", "rol": "Koning van Perzië (Artaxerxes I); stuurde Ezra en Nehemia naar Jeruzalem",
     "ref": ["Ezra 7:1–26", "Nehemia 2:1–8", "Nehemia 13:6"], "gebeurtenissen": ["ezra-reis", "nehemia-verlof"], "verhaal": None,
     "opmerking": "De meeste uitleggers houden de Arthahsasta van Ezra 7 en Nehemia voor Artaxerxes I. Sommigen dateren Ezra later, onder Artaxerxes II (398 v.Chr.)."},
    {"id": "zerubbabel", "naam": "Zerubbabel", "alt": [], "personenId": "zerubbabel", "lijn": "in Juda",
     "van": d(538, "benaderd", ["Ezra 2:2", "Ezra 3:8"], begin="genoemd", opmerking="Hij ging met de eerste groep terug (Ezra 2:2), ongeveer 538 v.Chr., vóór het begin van deze tijdlijn."),
     "tot": d(519, "benaderd", ["Zacharia 1:7", "Zacharia 4:9"], einde="onbekend", opmerking="Voor het laatst genoemd in de gezichten van Zacharia, in het tweede jaar van Darius (ongeveer 519 v.Chr.). Hoe zijn leven eindigde, zegt de Bijbel niet."),
     "ouder": None, "rol": "Vorst van Juda; leidde de terugkeer en de bouw van de tempel", "ref": ["Ezra 3:8", "Ezra 5:2", "Haggaï 1:1", "Zacharia 4:9"],
     "gebeurtenissen": ["profeten"], "verhaal": "v76"},
    {"id": "jesua", "naam": "Jesua", "alt": ["Josua"], "personenId": "jesua", "lijn": "in Juda", "ambt": "hogepriester",
     "van": d(538, "benaderd", ["Ezra 2:2", "Ezra 3:2"], begin="genoemd", opmerking="Hij ging met de eerste groep terug, ongeveer 538 v.Chr."),
     "tot": d(519, "benaderd", ["Zacharia 3:1", "Zacharia 6:11"], einde="onbekend", opmerking="Voor het laatst genoemd bij Zacharia (Zacharia 6:11), ongeveer 519 v.Chr. Haggaï en Zacharia noemen hem Josua."),
     "ouder": None, "rol": "Hogepriester; bouwde met Zerubbabel het altaar en de tempel", "ref": ["Ezra 3:2", "Haggaï 1:1", "Zacharia 3:1"],
     "gebeurtenissen": ["profeten"], "verhaal": "v76"},
    {"id": "haggai", "naam": "Haggaï", "alt": [], "personenId": "haggai", "lijn": "profeet",
     "van": d(520, "benaderd", "Haggaï 1:1", begin="roeping", opmerking="In de zesde maand van het tweede jaar van Darius (Haggaï 1:1): als dat Darius I is, augustus 520 v.Chr."),
     "tot": d(520, "benaderd", "Haggaï 2:21", einde="onbekend", opmerking="Al zijn woorden zijn gedateerd in hetzelfde jaar, het tweede jaar van Darius."),
     "ouder": None, "rol": "Profeet; spoorde het volk aan de tempel af te bouwen", "ref": ["Haggaï 1:1", "Ezra 5:1"], "gebeurtenissen": ["profeten"], "verhaal": "v79"},
    {"id": "zacharia", "naam": "Zacharia", "alt": [], "personenId": "zacharia", "lijn": "profeet",
     "van": d(520, "benaderd", "Zacharia 1:1", begin="roeping", opmerking="In de achtste maand van het tweede jaar van Darius (Zacharia 1:1), ongeveer 520 v.Chr."),
     "tot": d(518, "benaderd", "Zacharia 7:1", einde="onbekend", opmerking="Het laatste jaartal in zijn boek is het vierde jaar van Darius (Zacharia 7:1), ongeveer 518 v.Chr."),
     "ouder": None, "rol": "Profeet; spoorde samen met Haggaï het volk aan", "ref": ["Zacharia 1:1", "Ezra 5:1"], "gebeurtenissen": ["profeten"], "verhaal": "v79"},
    {"id": "esther", "naam": "Esther", "alt": ["Hadassa"], "personenId": "esther", "lijn": "regering", "ambt": "koningin",
     "van": d(479, "benaderd", "Esther 2:16–17", begin="regering", marge=[479, 478], opmerking="Koningin in de maand Tebeth van het zevende jaar van Ahasveros (Esther 2:16): als hij Xerxes I is, de winter van 479 op 478 v.Chr."),
     "tot": d(473, "benaderd", "Esther 9:1", einde="onbekend", opmerking="Voor het laatst genoemd bij het eerste Purimfeest (Esther 9:29–32), ongeveer 473 v.Chr."),
     "ouder": None, "rol": "Joodse koningin van Perzië; waagde haar leven voor haar volk", "ref": ["Esther 2", "Esther 4–9"],
     "gebeurtenissen": ["esther-koningin", "purim"], "verhaal": "v78"},
    {"id": "mordechai", "naam": "Mordechai", "alt": [], "personenId": "mordechai", "lijn": "in Susan",
     "van": d(479, "benaderd", "Esther 2:5–7", begin="genoemd", opmerking="Hij wordt genoemd als Esther naar het paleis wordt gehaald (Esther 2), kort vóór haar kroning."),
     "tot": d(473, "benaderd", "Esther 10:3", einde="onbekend", opmerking="Hij werd ‘de tweede bij den koning Ahasveros’ (Esther 10:3); hoe lang nog, zegt de Bijbel niet."),
     "ouder": None, "rol": "Neef en pleegvader van Esther; daarna de tweede man van het rijk", "ref": ["Esther 2:5–7", "Esther 10:3"],
     "gebeurtenissen": ["purim"], "verhaal": "v78"},
    {"id": "ezra", "naam": "Ezra", "alt": [], "personenId": "ezra", "lijn": "in Juda",
     "van": d(458, "benaderd", ["Ezra 7:7–9", "wiki-ezra"], begin="genoemd", marge=[458, 457], opmerking="Naar Jeruzalem in het zevende jaar van Arthahsasta (Ezra 7:7–8): 458 v.Chr. (of 457) als dat Artaxerxes I is."),
     "tot": d(445, "benaderd", ["Nehemia 8:1–2", "Nehemia 12:36"], einde="onbekend", opmerking="Voor het laatst genoemd bij Nehemia: hij leest de wet voor en gaat voor bij de inwijding van de muur."),
     "ouder": None, "rol": "Priester en schriftgeleerde; leerde het volk de wet van Mozes", "ref": ["Ezra 7–10", "Nehemia 8"],
     "gebeurtenissen": ["ezra-reis"], "verhaal": None},
    {"id": "nehemia", "naam": "Nehemia", "alt": [], "personenId": "nehemia", "lijn": "regering", "ambt": "landvoogd",
     "van": d(445, "benaderd", ["Nehemia 2:1", "Nehemia 5:14", "wiki-nehemia"], begin="regering", marge=[445, 444], opmerking="Landvoogd vanaf het twintigste jaar van Arthahsasta (Nehemia 5:14): 445 of 444 v.Chr. Daarvoor was hij schenker van de koning in Susan."),
     "tot": d(433, "berekend", ["Nehemia 5:14", "Nehemia 13:6"], einde="onbekend", opmerking="Twaalf jaar landvoogd, tot het 32e jaar van de koning (Nehemia 5:14; 13:6), ongeveer 433 v.Chr. Daarna kwam hij nog eens naar Jeruzalem (Nehemia 13:7); wanneer hij stierf, zegt de Bijbel niet."),
     "ouder": None, "rol": "Schenker van de koning; als landvoogd bouwde hij de muur van Jeruzalem", "ref": ["Nehemia 1–2", "Nehemia 6:15", "Nehemia 13:6"],
     "gebeurtenissen": ["nehemia-verlof", "muur-klaar"], "verhaal": None},
]

PERZIE_GEBEURTENISSEN = [
    g("darius-koning", "Darius I wordt koning",
      "Na de dood van koning Cambyses wordt Darius koning van Perzië. Op een hoge rots bij Behistun laat hij later in drie talen opschrijven hoe hij koning werd en over welke landen hij regeerde.",
      522, "historisch", ["behistun", "behistun-lijst"], ["darius-i"], [34.39, 47.43],
      opmerking="De inscriptie van Behistun noemt 23 landen, van Egypte en Lydië tot aan de grens van India. Ligging van Behistun: Pleiades."),
    g("profeten", "Haggaï en Zacharia: bouw verder!",
      "In het tweede jaar van koning Darius spreken de profeten Haggaï en Zacharia tot het volk. Zerubbabel en Jesua gaan weer aan het werk aan het huis van God.",
      520, "benaderd", ["Ezra 4:24", "Ezra 5:1–2", "Haggaï 1:1", "Zacharia 1:1"], ["haggai", "zacharia", "zerubbabel", "jesua", "darius-i"], "salem", verhaal="v79",
      stap="ezra:terugkeer:5", opmerking="Het tweede jaar van Darius is 520 v.Chr., als het Darius I is, zoals algemeen wordt aangenomen."),
    g("tempel-klaar", "De tempel is klaar",
      "In het zesde jaar van koning Darius is het huis van God in Jeruzalem herbouwd. Het volk viert de inwijding met vreugde.",
      515, "benaderd", ["Ezra 6:15–16"], ["darius-i"], "salem", verhaal="v76", belangrijk=True, stap="ezra:terugkeer:6", marge=[516, 515],
      opmerking="‘Op den derden dag der maand Adar’ in het zesde jaar van Darius (Ezra 6:15). Als dat Darius I is, is het voorjaar 515 v.Chr.; sommigen rekenen 516. Ook het laatste jaar van de tijdlijn “Daniël en Babylon”."),
    g("marathon", "Slag bij Marathon",
      "Ver van Jeruzalem stuurt Darius een leger naar Griekenland. Bij Marathon, niet ver van Athene, verslaan de Atheners de Perzen.",
      490, "historisch", ["livius-marathon", "herodotus"], ["darius-i"], [38.15, 23.97],
      opmerking="Wat er tegelijk in de wijdere wereld gebeurde. Herodotus beschrijft de slag; augustus of september 490 v.Chr. Ligging: Pleiades."),
    g("salamis", "Zeeslag bij Salamis",
      "Koning Xerxes trekt met een groot leger en een vloot naar Griekenland. Bij het eiland Salamis verslaan de Griekse schepen de Perzische vloot, terwijl Xerxes vanaf een heuvel toekijkt.",
      480, "historisch", ["livius-salamis", "herodotus"], ["xerxes"], [37.94, 23.48], belangrijk=True,
      opmerking="Eind september 480 v.Chr. Als Ahasveros Xerxes is, gebeurde dit vlak vóór het zevende jaar van Ahasveros, waarin Esther koningin werd (Esther 2:16). Ligging: Pleiades."),
    g("esther-koningin", "Esther wordt koningin",
      "Koning Ahasveros kiest Esther, een Joods meisje dat door haar neef Mordechai is opgevoed, en zet de koninklijke kroon op haar hoofd.",
      479, "benaderd", ["Esther 2:16–17"], ["esther", "xerxes", "mordechai"], "susan", verhaal="v77", belangrijk=True, stap="esther:esther:1", marge=[479, 478],
      opmerking="In de maand Tebeth van het zevende jaar van Ahasveros (Esther 2:16). Als hij Xerxes I is, de winter van 479 op 478 v.Chr. Wie Ahasveros anders identificeert, komt op andere jaartallen."),
    g("purim", "Het volk wordt gered: Purim",
      "Haman wilde alle Joden laten doden op één dag. Door Esther en Mordechai wordt het volk gered, en sindsdien vieren de Joden het Purimfeest.",
      473, "benaderd", ["Esther 3:7", "Esther 9:1", "Esther 9:26–28"], ["esther", "mordechai", "xerxes"], "susan", verhaal="v78", stap="esther:esther:7", marge=[474, 473],
      opmerking="Het lot werd geworpen in het twaalfde jaar van Ahasveros (Esther 3:7); de dertiende van Adar van dat jaar valt, als hij Xerxes I is, in maart 473 v.Chr."),
    g("ezra-reis", "Ezra reist naar Jeruzalem",
      "In het zevende jaar van koning Arthahsasta reist Ezra met een groep ballingen van Babel naar Jeruzalem. Na vier maanden komt hij aan, om het volk de wet van God te leren.",
      458, "benaderd", ["Ezra 7:7–9", "wiki-ezra"], ["ezra", "artaxerxes"], "salem", belangrijk=True, stap="ezra:nehemia:0", marge=[458, 457],
      opmerking="Ezra 7:7–8. Als Arthahsasta Artaxerxes I is (465–424), is het zevende jaar 458 v.Chr. (in een andere telling 457). Sommigen dateren Ezra later, onder Artaxerxes II (398 v.Chr.)."),
    g("nehemia-verlof", "Nehemia mag naar Jeruzalem",
      "Nehemia is schenker van de koning in Susan. Hij hoort dat de muur van Jeruzalem in puin ligt, bidt tot God en krijgt van de koning verlof om de stad te gaan bouwen.",
      445, "benaderd", ["Nehemia 1:1", "Nehemia 2:1–8", "wiki-nehemia"], ["nehemia", "artaxerxes"], "susan", stap="ezra:nehemia:2", marge=[445, 444],
      opmerking="In de maand Nisan van het twintigste jaar van Arthahsasta (Nehemia 2:1): 445 of 444 v.Chr., als dat Artaxerxes I is."),
    g("muur-klaar", "De muur in 52 dagen klaar",
      "Iedereen bouwt mee, ondanks de spot en de dreiging van Sanballat en Tobia. Op de 25e van de maand Elul is de muur klaar, in 52 dagen.",
      445, "benaderd", ["Nehemia 4", "Nehemia 6:15"], ["nehemia"], "salem", belangrijk=True, stap="ezra:nehemia:5", marge=[445, 444],
      opmerking="‘In twee en vijftig dagen’ (Nehemia 6:15), in hetzelfde jaar als het verlof van de koning: 445 of 444 v.Chr."),
]

PERZIE_STEDEN = [
    {"id": "susa", "naam": "Susan (Susa)", "plaatsId": "susan", "tekst": "Koningsstad van de Perzen in Elam. Hier speelt het boek Esther, en hier was Nehemia schenker van de koning.", "bron": ["Esther 1:2", "Nehemia 1:1"]},
    {"id": "persepolis", "naam": "Persepolis", "plaatsId": None, "lat": 29.935, "lng": 52.89, "tekst": "Paleisstad in Perzië, die Darius I liet bouwen; ook Xerxes en Artaxerxes bouwden er verder.", "bron": ["pleiades-persepolis", "livius-darius"]},
    {"id": "pasargadae", "naam": "Pasargadae", "plaatsId": None, "lat": 30.195, "lng": 53.174, "tekst": "De oudere hoofdstad van Kores in Perzië, met zijn graf.", "bron": ["pleiades-pasargadae"]},
    {"id": "babylon", "naam": "Babel", "plaatsId": "babelst", "tekst": "De grote stad aan de Eufraat, nu een deel van Perzië. Ezra vertrok hiervandaan naar Jeruzalem (Ezra 7:9).", "bron": ["Ezra 7:9"]},
    {"id": "ekbatana", "naam": "Ekbatana (Achmetha)", "plaatsId": "ekbatana", "tekst": "Koningsstad in Medië. Hier vond men onder Darius de rol met het bevel van Kores (Ezra 6:2–3).", "bron": ["Ezra 6:2–3"]},
    {"id": "behistun", "naam": "Behistun", "plaatsId": None, "lat": 34.388, "lng": 47.432, "tekst": "Hoge rots aan de koningsweg. Darius liet er in drie talen opschrijven hoe hij koning werd.", "bron": ["pleiades-behistun", "behistun"]},
    {"id": "jeruzalem", "naam": "Jeruzalem", "plaatsId": "salem", "tekst": "De stad van de herbouwde tempel (515 v.Chr.). Onder Nehemia kreeg ze weer een muur.", "bron": ["Ezra 6:15", "Nehemia 6:15"]},
    {"id": "samaria", "naam": "Samaria", "plaatsId": "samaria", "tekst": "Van hier kwam tegenwerking: Sanballat spotte met de bouwers ‘in de tegenwoordigheid zijner broederen en van het heir van Samaria’ (Nehemia 4:2).", "bron": ["Nehemia 4:2"]},
    {"id": "sardis", "naam": "Sardis", "plaatsId": "nt4_sardis", "tekst": "Perzische hoofdstad in het westen van Klein-Azië, aan de koningsweg naar Susan.", "bron": ["herodotus"]},
    {"id": "memphis", "naam": "Nof (Memphis)", "plaatsId": "je_nof", "tekst": "Oude hoofdstad van Egypte, dat sinds 525 v.Chr. bij Perzië hoorde.", "bron": ["behistun-lijst"]},
    {"id": "athene", "naam": "Athene", "plaatsId": "nt_athene", "tekst": "Griekse stad. De Atheners versloegen de Perzen bij Marathon (490); in 480 brandde het leger van Xerxes de stad plat.", "bron": ["herodotus", "livius-marathon"]},
    {"id": "marathon", "naam": "Marathon", "plaatsId": None, "lat": 38.147, "lng": 23.97, "tekst": "Vlakte aan de kust bij Athene, waar in 490 v.Chr. de slag werd geleverd.", "bron": ["pleiades-marathon", "livius-marathon"]},
    {"id": "salamis", "naam": "Salamis", "plaatsId": None, "lat": 37.943, "lng": 23.484, "tekst": "Grieks eiland bij Athene (niet het Salamis op Cyprus uit Handelingen 13). Bij dit eiland werd de Perzische vloot verslagen.", "bron": ["pleiades-salamis", "livius-salamis"]},
]

PERZIE_GEBIEDEN = [
    {"id": "perzie", "naam": "Perzische rijk", "kleur": "kobalt", "hoofdstad": "susa",
     "bron": ["behistun-lijst", "herodotus", "wiki-skudra", "eigen-tekening"],
     "opmerking": B_RIJK + " Dezelfde vorm als aan het eind van “Daniël en Babylon” (de landen uit de lijst van Darius, 522). Het oosten (tot aan de Indus) loopt buiten de kaart door. Thracië hoorde ongeveer van 513 tot kort na 480 bij Perzië. Opstanden (zoals in Ionië, 499–493, en in Egypte) zijn niet getekend.",
     "sleutels": [
         sleutel(522, PER_522, "Zoals in 525–515: de landen van Darius in 522 (Behistun).", vereenvoudig=0.04),
         sleutel(514, PER_522, vereenvoudig=0.04),
         sleutel(513, [PER_522, THRACIE], "Darius trekt over de Bosporus tegen de Skythen; Thracië wordt Perzisch (Herodotus 4).", vereenvoudig=0.04),
         sleutel(480, [PER_522, THRACIE], vereenvoudig=0.04),
         sleutel(476, PER_522, "Na Salamis en Plataeae (480–479) verliest Perzië Thracië stukje bij beetje; Eion valt in 476/475, de laatste steunpunten rond 465.", vereenvoudig=0.04),
         sleutel(430, PER_522, vereenvoudig=0.04),
     ]},
    {"id": "jehud", "naam": "Juda", "kleur": "koraal", "hoofdstad": "jeruzalem",
     "bron": ["Nehemia 3", "Nehemia 7:25–38", "bijbelreis-plaatsen", "eigen-tekening"],
     "opmerking": B_RIJK + " Juda (Jehud) was nu een kleine Perzische provincie rond Jeruzalem, van Mizpa tot Beth-Zur (plaatsen uit Nehemia 3 en 7), met een landvoogd.",
     "sleutels": [sleutel(522, JEHUD), sleutel(430, JEHUD)]},
    {"id": "grieken", "naam": "Griekse steden", "kleur": "oker", "hoofdstad": "athene",
     "bron": ["herodotus", "livius-marathon", "livius-salamis", "eigen-tekening"],
     "opmerking": B_RIJK + " Geen rijk: losse stadstaten zoals Athene en Sparta, die samen tegen Perzië vochten. Alleen het vasteland is getekend, niet de eilanden. In 480–479 bezette het leger van Xerxes een deel van dit land; dat is niet getekend.",
     "sleutels": [sleutel(522, GRIEKS), sleutel(430, GRIEKS)]},
]

PERZIE_KOPPELINGEN = [
    {"verhaal": "v77", "jaar": 483, "tot": 479, "status": "benaderd", "personen": ["xerxes", "esther", "mordechai"], "gebeurtenissen": ["esther-koningin", "salamis"],
     "opmerking": "Het feest in Susan was in het derde jaar van Ahasveros (Esther 1:3) en Esther werd koningin in zijn zevende jaar (Esther 2:16): als hij Xerxes I is, ongeveer 483 en 479 v.Chr."},
    {"verhaal": "v78", "jaar": 474, "tot": 473, "status": "benaderd", "personen": ["esther", "mordechai", "xerxes"], "gebeurtenissen": ["purim"],
     "opmerking": "Het lot werd geworpen in het twaalfde jaar van Ahasveros (Esther 3:7): als hij Xerxes I is, 474 v.Chr.; de redding volgde in maart 473."},
    {"verhaal": "v79", "jaar": 520, "tot": 430, "status": "benaderd", "personen": ["haggai", "zacharia", "darius-i"], "gebeurtenissen": ["profeten", "tempel-klaar"],
     "opmerking": "Zacharia begon in het tweede jaar van Darius (520 v.Chr.). Maleachi noemt geen jaartal; de meeste uitleggers plaatsen hem in de tijd van Ezra en Nehemia. De band loopt daarom tot het einde van deze tijdlijn."},
]


# ================================================================= 2. DE WERELD ROND DE GEBOORTE VAN DE HEERE JEZUS
# Kust van de Levant van Rafah tot Antiochië (bij Daniël: LEVANT_W, hier fijner tussen Gaza en Tyrus).
KUST = [(34.25, 31.3), (34.45, 31.5), (34.55, 31.65), (34.65, 31.8), (34.75, 32.05), (34.8, 32.25), (34.85, 32.5),
        (34.95, 32.7), (34.95, 32.85), (35.05, 32.9), (35.1, 33.1), (35.2, 33.25), (35.35, 33.55), (35.5, 33.9),
        (35.65, 34.3), (35.85, 34.45), (35.9, 34.9), (35.8, 35.5), (35.9, 36.0), (36.2, 36.6), (36.6, 36.85)]
# Judea, Samaria en Idumea met de kust van Asdod tot Dor (het deel van Archelaüs; vanaf 6 n.Chr. de Romeinse provincie).
ARCH = P((34.65, 31.8), (34.75, 32.05), (34.8, 32.25), (34.85, 32.5), (34.95, 32.7), (35.1, 32.65), (35.2, 32.55),
         (35.35, 32.5), (35.45, 32.4), (35.55, 32.35), (35.55, 32.0), (35.55, 31.75), (35.45, 31.6), (35.4, 31.45),
         (35.4, 31.2), (35.35, 31.05), (35.1, 31.05), (34.8, 31.15), (34.6, 31.3), (34.65, 31.6))
# De kuststrook (Joppe, Torenstad van Strato = Caesarea): door Augustus in 30 v.Chr. aan Herodes gegeven (Josephus).
KUSTSTROOK = P((34.65, 31.8), (34.75, 32.05), (34.8, 32.25), (34.85, 32.5), (34.95, 32.7), (35.05, 32.65), (34.95, 32.45),
               (34.9, 32.2), (34.85, 32.0), (34.75, 31.75), (34.65, 31.6))
# Galilea: van de heuvels achter Ptolemaïs tot het meer en de Jordaan; in het zuiden de vlakte van Jizreël.
GALILEA = P((35.15, 32.75), (35.2, 32.55), (35.35, 32.5), (35.45, 32.6), (35.55, 32.65), (35.55, 32.7), (35.5, 32.75),
            (35.5, 32.85), (35.6, 32.9), (35.6, 33.0), (35.55, 33.1), (35.35, 33.1), (35.2, 33.0), (35.15, 32.9))
# Perea: ‘over de Jordaan’, van Pella tot Machérus.
PEREA = P((35.55, 32.3), (35.7, 32.3), (35.75, 32.1), (35.8, 31.85), (35.75, 31.6), (35.65, 31.45), (35.6, 31.6),
          (35.55, 31.75), (35.55, 32.0))
# Gadara en Hippos (steden van de Decapolis, 30–4 v.Chr. bij Herodes).
GADHIP = P((35.55, 32.65), (35.7, 32.6), (35.75, 32.7), (35.7, 32.85), (35.65, 32.85), (35.6, 32.75), (35.55, 32.7))
# Gaulanitis, Batanea, Trachonitis en Auranitis (23 v.Chr. aan Herodes) en het land van Zenodorus met Paneas (20 v.Chr.).
NOORDOOST = P((35.6, 32.9), (35.65, 32.85), (35.7, 32.85), (35.8, 32.75), (36.0, 32.75), (36.3, 32.7), (36.6, 32.65),
              (36.75, 32.8), (36.7, 33.1), (36.45, 33.25), (36.1, 33.2), (35.85, 33.15), (35.65, 33.1), (35.6, 33.0))
PANEAS = P((35.6, 33.0), (35.65, 33.1), (35.85, 33.15), (35.95, 33.35), (35.8, 33.45), (35.6, 33.3), (35.55, 33.1))
# De Decapolis zonder Gadara en Hippos: Scythopolis ten westen van de Jordaan, Pella, Gerasa, Philadelphia.
DECAPOLIS = P((35.35, 32.5), (35.45, 32.6), (35.55, 32.65), (35.7, 32.6), (35.75, 32.7), (35.8, 32.75), (36.0, 32.75),
              (36.1, 32.6), (36.1, 32.2), (36.05, 31.85), (35.95, 31.8), (35.8, 31.85), (35.75, 32.1), (35.7, 32.3),
              (35.55, 32.3), (35.55, 32.35), (35.45, 32.4))
# Nabatea: van Bostra in de Hauran langs Moab en Edom tot de Negev en de Golf van Akaba (alleen het noorden getekend).
NABATEA = P((35.55, 31.1), (35.35, 31.05), (35.1, 31.05), (34.8, 31.15), (34.5, 30.8), (34.3, 30.3), (34.9, 29.6),
            (34.95, 29.5), (34.8, 28.0), (37.0, 28.0), (37.5, 30.5), (37.3, 32.6), (36.75, 32.8), (36.6, 32.65),
            (36.3, 32.7), (36.1, 32.6), (36.1, 32.2), (36.05, 31.85), (35.95, 31.8), (35.8, 31.85), (35.75, 31.6),
            (35.65, 31.45))
# Egypte (de Nijl en de noordkust van de Sinaï, zoals bij Daniël), zonder het stuk dat bij Nabatea is getekend.
EGYPTE = unary_union([DAN.EGY, DAN.SINAI]).difference(NABATEA)
# Abilene (Lysanias): het dal van de Barada rond Abila, ten noordwesten van Damascus.
ABILENE = P((35.95, 33.55), (36.2, 33.5), (36.35, 33.65), (36.2, 33.8), (35.95, 33.75))
# Het Romeinse rijk rond Judea, ruw: Cilicië, de Levant en Syrië tot de Eufraat (Zeugma–Sura), de woestijnrand en de
# Sinaïkust.
ROME_RUW = P(*KUST[:-1], (36.2, 36.85), (35.8, 36.75), (35.4, 36.55), (34.65, 36.8), (34.7, 37.2), (35.5, 37.35),
             (36.7, 37.15), (37.0, 37.1), (37.9, 37.1), (38.0, 36.8), (38.1, 36.0), (38.8, 35.9), (38.0, 35.3),
             (37.2, 34.4), (37.0, 33.5), (37.3, 32.6), (37.5, 30.5), (34.3, 30.3), (33.8, 31.1))
# Parthië (rand): Mesopotamië ten oosten van de Eufraat en Iran; het oosten tot ongeveer 62° O (Merv, Herat).
JEZIRA = P((37.9, 37.1), (38.0, 36.8), (38.1, 36.0), (38.8, 35.9), (39.0, 35.95), (40.1, 35.3), (41.0, 34.4),
           (42.8, 33.65), (43.9, 34.25), (44.6, 34.6), (43.6, 35.5), (43.1, 36.3), (42.6, 36.9), (42.2, 37.3),
           (40.8, 37.5), (39.3, 37.5))
PARTHIE = [JEZIRA, DAN.BAB_616, DAN.ASSUR_N, DAN.ZAGROS, DAN.ELAM, DAN.MEDIE, DAN.BRUG_PM, DAN.PERSIS,
           DAN.OOST.intersection(box(40, 20, 62, 45))]

HERODES_37 = [ARCH.difference(KUSTSTROOK), GALILEA, PEREA]
HERODES_30 = [ARCH, GALILEA, PEREA, GADHIP]
HERODES_23 = HERODES_30 + [NOORDOOST]
HERODES_20 = HERODES_23 + [PANEAS]
FILIPPUS = [NOORDOOST, PANEAS]
ANTIPAS = [GALILEA, PEREA]

# Wie wanneer niet direct onder Rome viel (voor de vorm van ‘Romeinse rijk’): [van, tot] (beide inclusief) en de vorm.
NIET_ROME = [
    (-40, -38, HERODES_37), (-37, -31, HERODES_37), (-30, -24, HERODES_30), (-23, -21, HERODES_23), (-20, -5, HERODES_20),
    (-4, 40, [ARCH]), (-4, 40, ANTIPAS), (-4, 33, FILIPPUS), (37, 40, FILIPPUS),
    (-40, 40, [DECAPOLIS]), (-40, -31, [GADHIP]), (-4, 40, [GADHIP]), (-40, 40, [NABATEA]), (-40, -31, [EGYPTE]),
]
# Judea is vanaf 6 n.Chr. wel Romeins, maar heeft een eigen vlak (‘Judea, Romeinse provincie’): niet dubbel kleuren.


def rome(jaar):
    weg = [vorm for (a, b, delen) in NIET_ROME if a <= jaar <= b for vorm in delen]
    rest = ROME_RUW.difference(unary_union([x.buffer(0) for x in weg]))
    delen = [rest] + ([EGYPTE] if jaar >= -30 else [])
    return unary_union(delen)


GJ_BRONNEN = [
    {"id": "sv", "kort": "Statenvertaling", "soort": "bijbel", "titel": "Statenvertaling: Mattheüs 2, Markus 6, Lukas 1–3, Lukas 23, Johannes 2:20, Handelingen 12", "url": None, "licentie": SV, "geraadpleegd": G},
    {"id": "josephus-ant-15", "kort": "Josephus, Oudheden 15", "soort": "historisch", "titel": "Josephus, Joodse Oudheden XV (vert. W. Whiston): 15.7.3 (Gadara, Hippos, Samaria, Gaza, Joppe, Torenstad van Strato), 15.10.1–3 (Trachonitis, Batanea, Auranitis; Paneas), 15.11.1 (tempel, achttiende jaar)", "url": "https://en.wikisource.org/wiki/The_Antiquities_of_the_Jews/Book_XV", "licentie": "Publiek domein (Wikisource)", "geraadpleegd": G},
    {"id": "josephus-ant-17", "kort": "Josephus, Oudheden 17", "soort": "historisch", "titel": "Josephus, Joodse Oudheden XVII (vert. W. Whiston): 17.8.1 (regering van Herodes), 17.11.4 (verdeling onder zijn zonen), 17.13.2 en 5 (Archelaüs verbannen; Quirinius)", "url": "https://en.wikisource.org/wiki/The_Antiquities_of_the_Jews/Book_XVII", "licentie": "Publiek domein (Wikisource)", "geraadpleegd": G},
    {"id": "wiki-herodes", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Herod the Great (40 benoemd, 37 Jeruzalem; dood 4 v.Chr., sommigen 1 v.Chr.)", "url": "https://en.wikipedia.org/wiki/Herod_the_Great", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-archelaus", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Herod Archelaus (etnarch 4 v.Chr. – 6 n.Chr.)", "url": "https://en.wikipedia.org/wiki/Herod_Archelaus", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-antipas", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Herod Antipas (viervorst 4 v.Chr. – 39 n.Chr.)", "url": "https://en.wikipedia.org/wiki/Herod_Antipas", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-filippus", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Philip the Tetrarch (4 v.Chr. – 33/34 n.Chr.; Josephus, Oudheden 18.4.6)", "url": "https://en.wikipedia.org/wiki/Philip_the_Tetrarch", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-augustus", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Augustus (eretitel Augustus 27 v.Chr.; stierf 19 augustus 14 n.Chr.)", "url": "https://en.wikipedia.org/wiki/Augustus", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-tiberius", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Tiberius (keizer 14–37 n.Chr.; vanaf 12/13 medeheerser)", "url": "https://en.wikipedia.org/wiki/Tiberius", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-pilatus", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Pontius Pilate (prefect van Judea ca. 26–36 n.Chr.; Pilatussteen, Caesarea 1961)", "url": "https://en.wikipedia.org/wiki/Pontius_Pilate", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-quirinius", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Census of Quirinius (Josephus: 6 n.Chr.; verhouding tot Lukas 2:2)", "url": "https://en.wikipedia.org/wiki/Census_of_Quirinius", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-lysanias", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Lysanias (Abilene; inscriptie van Abila)", "url": "https://en.wikipedia.org/wiki/Lysanias", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-kajafas", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Caiaphas (hogepriester 18–36 n.Chr.; Josephus, Oudheden 18.2.2 en 18.4.3)", "url": "https://en.wikipedia.org/wiki/Caiaphas", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-decapolis", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Decapolis (de tien steden; sinds Pompeius, 63 v.Chr.)", "url": "https://en.wikipedia.org/wiki/Decapolis", "licentie": WIKI, "geraadpleegd": G},
    {"id": "wiki-nabatea", "kort": "Wikipedia", "soort": "historisch", "titel": "Wikipedia: Nabataean Kingdom (Petra, Bostra, de Negev; Romeins in 106 n.Chr.)", "url": "https://en.wikipedia.org/wiki/Nabataean_Kingdom", "licentie": WIKI, "geraadpleegd": G},
    pleiades("pleiades-gadara", 678142, "Gadara"),
    pleiades("pleiades-gerasa", 678158, "Gerasa"),
    pleiades("pleiades-petra", 697725, "Petra"),
    pleiades("pleiades-abila", 677993, "Abila Lysaniou"),
    pleiades("pleiades-ctesiphon", 893976, "Ctesiphon"),
    PLAATSEN, EIGEN,
]

GJ_PERSONEN = [
    {"id": "augustus", "naam": "Augustus", "alt": ["Octavianus"], "personenId": "augustus", "lijn": "regering", "ambt": "keizer",
     "van": d(-27, "historisch", "wiki-augustus", begin="regering", opmerking="In 27 v.Chr. kreeg hij de eretitel Augustus; sinds de slag bij Actium (31 v.Chr.) was hij al de enige machthebber."),
     "tot": d(14, "historisch", "wiki-augustus", einde="stierf", opmerking="Hij stierf op 19 augustus 14 n.Chr."),
     "ouder": None, "rol": "De eerste Romeinse keizer; van hem ging het gebod uit dat de hele wereld beschreven moest worden", "ref": ["Lukas 2:1"], "gebeurtenissen": ["geboorte"], "verhaal": "v83"},
    {"id": "tiberius", "naam": "Tiberius", "alt": [], "personenId": None, "lijn": "regering", "ambt": "keizer",
     "van": d(14, "historisch", "wiki-tiberius", begin="regering", opmerking="Keizer na de dood van Augustus (september 14 n.Chr.); vanaf 12 of 13 n.Chr. was hij al medeheerser."),
     "tot": d(37, "historisch", "wiki-tiberius", einde="stierf", opmerking="Hij stierf op 16 maart 37 n.Chr."),
     "ouder": None, "rol": "Keizer van Rome; Lukas dateert het optreden van Johannes de Doper in zijn vijftiende jaar", "ref": ["Lukas 3:1"], "gebeurtenissen": ["vijftiende-jaar"], "verhaal": "v87"},
    {"id": "herodes", "naam": "Herodes", "alt": ["Herodes de Grote"], "personenId": "herodes", "lijn": "regering",
     "van": d(-37, "historisch", ["josephus-ant-17", "wiki-herodes"], begin="regering", opmerking="De Romeinse senaat benoemde hem in 40 v.Chr. tot koning; Jeruzalem nam hij in 37 v.Chr. in (sommigen rekenen 36)."),
     "tot": d(-4, "benaderd", ["Mattheüs 2:19", "josephus-ant-17", "wiki-herodes"], einde="stierf", opmerking="Meestal gedateerd in het voorjaar van 4 v.Chr. (Josephus; een maansverduistering kort ervoor). Een kleiner aantal onderzoekers verdedigt 1 v.Chr. Hij stierf in Jericho."),
     "ouder": None, "rol": "Koning van Judea in de tijd van de geboorte van de Heere Jezus", "ref": ["Mattheüs 2:1–19", "Lukas 1:5"],
     "gebeurtenissen": ["herodes-jeruzalem", "tempelbouw", "geboorte", "herodes-sterft"], "verhaal": "v85"},
    {"id": "archelaus", "naam": "Archelaüs", "alt": [], "personenId": "archelaus", "lijn": "regering",
     "van": d(-4, "benaderd", ["Mattheüs 2:22", "josephus-ant-17", "wiki-archelaus"], begin="regering", opmerking="Na de dood van zijn vader (meestal 4 v.Chr.) kreeg hij Judea, Samaria en Idumea. Mattheüs zegt dat Archelaüs ‘in Judea koning was’ (Mattheüs 2:22); zijn Romeinse titel was etnarch (vorst over een volk)."),
     "tot": d(6, "historisch", ["josephus-ant-17", "wiki-archelaus"], einde="afgezet", opmerking="In zijn tiende jaar, 6 n.Chr., door Augustus afgezet en verbannen naar Vienne in Gallië."),
     "ouder": "herodes", "rol": "Zoon van Herodes; heerser over Judea, Samaria en Idumea", "ref": ["Mattheüs 2:22"], "gebeurtenissen": ["terug-nazareth", "judea-provincie"], "verhaal": "v85"},
    {"id": "antipas", "naam": "Herodes Antipas", "alt": ["Herodes de viervorst"], "personenId": "herodes_antipas", "lijn": "regering", "ambt": "viervorst",
     "van": d(-4, "benaderd", ["Lukas 3:1", "josephus-ant-17", "wiki-antipas"], begin="regering", opmerking="Viervorst over Galilea en Perea vanaf de dood van zijn vader (meestal 4 v.Chr.)."),
     "tot": d(39, "historisch", "wiki-antipas", einde="afgezet", opmerking="In de zomer van 39 n.Chr. door keizer Caligula afgezet en verbannen; zijn land ging naar Herodes Agrippa I."),
     "ouder": "herodes", "rol": "Viervorst over Galilea en Perea; liet Johannes de Doper onthoofden", "ref": ["Lukas 3:1", "Markus 6:14–29", "Lukas 23:7–12"],
     "gebeurtenissen": ["vijftiende-jaar"], "verhaal": "v100"},
    {"id": "filippus", "naam": "Filippus", "alt": ["Filippus de viervorst"], "personenId": None, "lijn": "regering", "ambt": "viervorst",
     "van": d(-4, "benaderd", ["Lukas 3:1", "josephus-ant-17", "wiki-filippus"], begin="regering", opmerking="Viervorst over het noordoosten (Iturea en Trachonitis, Lukas 3:1) vanaf de dood van zijn vader."),
     "tot": d(34, "historisch", "wiki-filippus", einde="stierf", marge=[33, 34], opmerking="Hij stierf in het twintigste jaar van Tiberius, 33 of 34 n.Chr. (Josephus). Niet dezelfde als Filippus de apostel, en ook niet de Filippus van Markus 6:17."),
     "ouder": "herodes", "rol": "Zoon van Herodes; viervorst over Iturea en Trachonitis; bouwde Caesarea Filippi", "ref": ["Lukas 3:1"], "gebeurtenissen": ["vijftiende-jaar"], "verhaal": None},
    {"id": "lysanias", "naam": "Lysanias", "alt": [], "personenId": None, "lijn": "regering", "ambt": "viervorst",
     "van": d(28, "berekend", ["Lukas 3:1", "wiki-lysanias"], begin="genoemd", opmerking="Lukas noemt hem viervorst over Abilene in het vijftiende jaar van Tiberius. Een inscriptie uit Abila noemt een viervorst Lysanias in de tijd van Tiberius. Hoe lang hij regeerde, is niet bekend; een oudere Lysanias regeerde rond 40–36 v.Chr."),
     "tot": d(28, "berekend", "Lukas 3:1", einde="onbekend", opmerking="Alleen in Lukas 3:1 genoemd."),
     "ouder": None, "rol": "Viervorst over Abilene, ten noordwesten van Damascus", "ref": ["Lukas 3:1"], "gebeurtenissen": [], "verhaal": None},
    {"id": "cyrenius", "naam": "Cyrenius", "alt": ["Quirinius"], "personenId": "cyrenius", "lijn": "regering", "ambt": "stadhouder",
     "van": d(6, "historisch", ["josephus-ant-17", "wiki-quirinius"], begin="regering", opmerking="Volgens Josephus kwam Quirinius in 6 n.Chr. als stadhouder naar Syrië en liet hij in Judea de bezittingen opschrijven. Lukas verbindt een ‘eerste beschrijving’ (Lukas 2:2) onder Cyrenius met de geboorte van de Heere Jezus, in de dagen van Herodes. Hoe die twee samenhangen, is een bekende vraag. Uitleggers geven verschillende antwoorden: een eerdere inschrijving, een eerdere taak van Quirinius in Syrië, of het woord eerste in de betekenis van: vóór die onder Quirinius."),
     "tot": d(6, "historisch", ["josephus-ant-17", "wiki-quirinius"], einde="onbekend", opmerking="Hoe lang hij stadhouder van Syrië bleef, is niet precies bekend."),
     "ouder": None, "rol": "Romeinse stadhouder van Syrië (Quirinius)", "ref": ["Lukas 2:2"], "gebeurtenissen": ["judea-provincie"], "verhaal": "v83"},
    {"id": "pilatus", "naam": "Pontius Pilatus", "alt": ["Pilatus"], "personenId": "pilatus", "lijn": "regering", "ambt": "stadhouder",
     "van": d(26, "historisch", ["Lukas 3:1", "wiki-pilatus"], begin="regering", opmerking="Stadhouder (prefect) van Judea vanaf ongeveer 26 n.Chr. Een steen uit Caesarea (gevonden in 1961) noemt hem met die titel. Een paar onderzoekers denken aan een eerder begin."),
     "tot": d(36, "historisch", "wiki-pilatus", einde="afgezet", marge=[36, 37], opmerking="Na een bloedbad onder Samaritanen stuurde de stadhouder van Syrië hem naar Rome (36 of 37 n.Chr.). Hoe het daarna met hem ging, is niet bekend."),
     "ouder": None, "rol": "Romeinse stadhouder over Judea; veroordeelde de Heere Jezus", "ref": ["Lukas 3:1", "Lukas 23:1–25"], "gebeurtenissen": ["kruisiging"], "verhaal": "v125"},
    {"id": "kajafas", "naam": "Kajafas", "alt": [], "personenId": "kajafas", "lijn": "regering", "ambt": "hogepriester",
     "van": d(18, "historisch", "wiki-kajafas", begin="regering", opmerking="Door de Romeinse stadhouder Valerius Gratus aangesteld (Josephus)."),
     "tot": d(36, "historisch", "wiki-kajafas", einde="afgezet", opmerking="Door Vitellius, de stadhouder van Syrië, afgezet (Josephus)."),
     "ouder": None, "rol": "Hogepriester; Lukas noemt hem samen met zijn schoonvader Annas", "ref": ["Lukas 3:2", "Johannes 11:49", "Mattheüs 26:57"], "gebeurtenissen": ["kruisiging"], "verhaal": "v125"},
]

GJ_GEBEURTENISSEN = [
    g("herodes-jeruzalem", "Herodes neemt Jeruzalem in",
      "Rome had Herodes tot koning van Judea benoemd. Na een lange strijd neemt hij met hulp van Romeinse soldaten Jeruzalem in.",
      -37, "historisch", ["josephus-ant-17", "wiki-herodes"], ["herodes"], "salem",
      opmerking="Benoemd in 40 v.Chr.; Jeruzalem in de zomer van 37 v.Chr. (sommigen: 36). Daarvoor regeerde Antigonus, de laatste koning uit het huis van de Hasmoneeën."),
    g("egypte-romeins", "Egypte wordt Romeins",
      "Na de dood van koningin Cleopatra wordt Egypte een deel van het Romeinse rijk. Augustus geeft Herodes er steden aan de kust bij.",
      -30, "historisch", ["wiki-augustus", "josephus-ant-15"], ["herodes"], "p3_alexandrie",
      opmerking="Egypte werd na 30 v.Chr. bestuurd door een Romeinse stadhouder. Later vluchtten Jozef en Maria met het Kind naar Egypte (Mattheüs 2:13–14)."),
    g("tempelbouw", "Herodes vernieuwt de tempel",
      "In zijn achttiende jaar begint Herodes de tempel in Jeruzalem groter en prachtiger te maken. Het werk duurt nog tientallen jaren.",
      -19, "benaderd", ["josephus-ant-15", "Johannes 2:20"], ["herodes"], "nt_tempel", marge=[-20, -19],
      opmerking="Het achttiende jaar van Herodes (Josephus) is 20 of 19 v.Chr. Ongeveer 46 jaar later zeiden de Joden: ‘Zes en veertig jaren is over dezen tempel gebouwd’ (Johannes 2:20)."),
    g("geboorte", "De geboorte van de Heere Jezus",
      "Keizer Augustus laat het hele rijk beschrijven. Daarom reizen Jozef en Maria naar Bethlehem, waar de Heere Jezus geboren wordt.",
      -5, "benaderd", ["Lukas 2:1–7", "Mattheüs 2:1"], ["augustus", "herodes"], "efrath", verhaal="v83", belangrijk=True, marge=[-6, -4],
      opmerking="De Bijbel noemt geen jaartal. Het was ‘in de dagen van den koning Herodes’ (Mattheüs 2:1), die volgens Josephus ongeveer 4 v.Chr. stierf. Daarom wordt de geboorte meestal op ca. 6–4 v.Chr. gesteld; andere dateringen bestaan ook. Over de beschrijving onder Cyrenius: zie bij Cyrenius."),
    g("herodes-sterft", "Herodes sterft; zijn rijk wordt verdeeld",
      "Koning Herodes sterft in Jericho. Keizer Augustus verdeelt zijn land onder drie zonen: Archelaüs, Herodes Antipas en Filippus.",
      -4, "benaderd", ["Mattheüs 2:19", "josephus-ant-17", "wiki-herodes"], ["herodes", "archelaus", "antipas", "filippus"], "jericho", belangrijk=True,
      opmerking="Meestal voorjaar 4 v.Chr. (Josephus); een kleiner aantal onderzoekers verdedigt 1 v.Chr. Gaza, Gadara en Hippos gingen naar de provincie Syrië (Josephus, Oudheden 17.11.4)."),
    g("terug-nazareth", "Terug uit Egypte, naar Nazareth",
      "Na de dood van Herodes keert Jozef met Maria en het Kind terug. Omdat Archelaüs koning is in Judea, gaan ze naar Nazareth in Galilea, het land van Herodes Antipas.",
      -4, "benaderd", ["Mattheüs 2:19–23"], ["archelaus", "antipas"], "nt_nazareth", verhaal="v85", marge=[-4, -3],
      opmerking="Hoe lang het gezin in Egypte bleef, zegt de Bijbel niet; het was na de dood van Herodes (Mattheüs 2:19). De kaart laat zien waarom Nazareth veiliger was: Galilea viel niet onder Archelaüs."),
    g("judea-provincie", "Judea onder een Romeinse stadhouder",
      "Keizer Augustus zet Archelaüs af. Judea krijgt een Romeinse stadhouder, en Quirinius laat in het land de bezittingen opschrijven.",
      6, "historisch", ["josephus-ant-17", "wiki-archelaus", "wiki-quirinius"], ["archelaus", "cyrenius", "augustus"], "nt_caesarea",
      opmerking="Volgens Josephus in het tiende jaar van Archelaüs, 6 n.Chr. De stadhouder woonde in Caesarea aan de kust."),
    g("twaalf-jaar", "De Heere Jezus, twaalf jaar, in de tempel",
      "Als de Heere Jezus twaalf jaar is, gaat Hij met Jozef en Maria naar Jeruzalem voor het Pascha. Na drie dagen vinden ze Hem in de tempel.",
      8, "benaderd", ["Lukas 2:41–52"], [], "nt_tempel", verhaal="v86", marge=[7, 9],
      opmerking="Twaalf jaar na de geboorte (ca. 6–4 v.Chr.), en er is geen jaar 0: ongeveer 7–9 n.Chr."),
    g("vijftiende-jaar", "Johannes de Doper begint te prediken",
      "In het vijftiende jaar van keizer Tiberius komt het woord van God tot Johannes in de woestijn. Hij predikt bij de Jordaan de doop van de bekering.",
      28, "benaderd", ["Lukas 3:1–3"], ["tiberius", "pilatus", "antipas", "filippus", "lysanias", "kajafas"], "nt_doopplaats", verhaal="v87", belangrijk=True, marge=[28, 29],
      opmerking="Lukas 3:1–2 noemt zes machthebbers tegelijk. Vanaf de dood van Augustus (14 n.Chr.) gerekend is het vijftiende jaar ongeveer 28/29 n.Chr.; wie telt vanaf het medekeizerschap van Tiberius (12/13 n.Chr.), komt eerder uit."),
    g("doop", "De doop van de Heere Jezus",
      "De Heere Jezus laat Zich door Johannes dopen in de Jordaan. Daarna begint Hij, ongeveer dertig jaar oud, Zijn werk in het openbaar.",
      28, "benaderd", ["Mattheüs 3:13–17", "Lukas 3:21–23"], [], "nt_doopplaats", verhaal="v87", marge=[28, 29],
      opmerking="Kort na het begin van de prediking van Johannes. Lukas zegt dat Hij ‘omtrent dertig jaren oud’ was (Lukas 3:23)."),
    g("kruisiging", "De kruisiging en de opstanding",
      "Onder Pontius Pilatus wordt de Heere Jezus gekruisigd buiten Jeruzalem. Op de derde dag staat Hij op uit de doden.",
      30, "benaderd", ["Lukas 23:1–25", "Lukas 24:1–7"], ["pilatus", "antipas", "kajafas"], "salem", verhaal="v125", belangrijk=True, marge=[30, 33],
      opmerking="De Bijbel noemt geen jaartal. Pilatus was stadhouder van ca. 26 tot 36 n.Chr.; daarom wordt dit meestal op 30 of 33 n.Chr. gesteld."),
]

GJ_STEDEN = [
    {"id": "jeruzalem", "naam": "Jeruzalem", "plaatsId": "salem", "tekst": "De stad van de tempel, die Herodes liet vernieuwen. Hier stond de Heere Jezus als twaalfjarige in de tempel, en hier werd Hij gekruisigd.", "bron": ["Lukas 2:46", "Johannes 2:20"]},
    {"id": "bethlehem", "naam": "Bethlehem", "plaatsId": "efrath", "tekst": "De stad van David in Judea, waar de Heere Jezus geboren werd (Lukas 2:4–7; Mattheüs 2:1).", "bron": ["Lukas 2:4–7", "Mattheüs 2:1"]},
    {"id": "nazareth", "naam": "Nazareth", "plaatsId": "nt_nazareth", "tekst": "Het dorp in Galilea waar Jozef en Maria woonden en waar de Heere Jezus opgroeide.", "bron": ["Mattheüs 2:23", "Lukas 2:51"]},
    {"id": "jericho", "naam": "Jericho", "plaatsId": "jericho", "tekst": "Stad bij de Jordaan. Herodes had er een winterpaleis en stierf er (Josephus).", "bron": ["josephus-ant-17"]},
    {"id": "caesarea", "naam": "Caesarea", "plaatsId": "nt_caesarea", "tekst": "Havenstad die Herodes bouwde. Later woonden de Romeinse stadhouders hier; een steen met de naam van Pilatus is hier gevonden.", "bron": ["wiki-pilatus", "josephus-ant-15"]},
    {"id": "caesarea-filippi", "naam": "Caesarea Filippi", "plaatsId": "nt_kaesareafilippi", "tekst": "Stad bij de bronnen van de Jordaan (Paneas). Filippus de viervorst bouwde haar uit en noemde haar naar de keizer en naar zichzelf.", "bron": ["wiki-filippus", "Mattheüs 16:13"]},
    {"id": "machaerus", "naam": "Machérus", "plaatsId": "nt_machaerus", "tekst": "Burcht van Herodes Antipas in Perea. Volgens Josephus werd Johannes de Doper hier onthoofd; de Bijbel noemt de plaats niet.", "bron": ["wiki-antipas", "Markus 6:27"]},
    {"id": "gadara", "naam": "Gadara", "plaatsId": None, "lat": 32.656, "lng": 35.677, "tekst": "Een van de steden van de Decapolis, ten zuidoosten van het meer van Galilea; vgl. ‘het land der Gadarenen’ (Markus 5:1).", "bron": ["pleiades-gadara", "Markus 5:1"]},
    {"id": "gerasa", "naam": "Gerasa", "plaatsId": None, "lat": 32.28, "lng": 35.891, "tekst": "Grote stad van de Decapolis, ten oosten van de Jordaan.", "bron": ["pleiades-gerasa", "wiki-decapolis"]},
    {"id": "damascus", "naam": "Damascus", "plaatsId": "damascusst", "tekst": "Oude stad in Syrië; bij Plinius een van de steden van de Decapolis.", "bron": ["wiki-decapolis"]},
    {"id": "abila", "naam": "Abila", "plaatsId": None, "lat": 33.627, "lng": 36.116, "tekst": "Hoofdplaats van Abilene, het land van Lysanias (Lukas 3:1).", "bron": ["pleiades-abila", "Lukas 3:1"]},
    {"id": "petra", "naam": "Petra", "plaatsId": None, "lat": 30.345, "lng": 35.383, "tekst": "Hoofdstad van de Nabateeërs, uitgehouwen in rode rotsen.", "bron": ["pleiades-petra", "wiki-nabatea"]},
    {"id": "antiochie", "naam": "Antiochië", "plaatsId": "nt_antiochie", "tekst": "Hoofdstad van de Romeinse provincie Syrië, waar de stadhouder van Syrië woonde.", "bron": ["wiki-quirinius"]},
    {"id": "alexandrie", "naam": "Alexandrië", "plaatsId": "p3_alexandrie", "tekst": "Hoofdstad van Egypte aan zee: tot 30 v.Chr. de stad van Cleopatra, daarna Romeins.", "bron": ["wiki-augustus"]},
    {"id": "ctesiphon", "naam": "Ctesiphon", "plaatsId": None, "lat": 33.095, "lng": 44.581, "tekst": "Koningsstad van de Parthen aan de Tigris, niet ver van het oude Babel.", "bron": ["pleiades-ctesiphon"]},
]

R = "Grenzen bij benadering: rijken hadden geen vaste grenzen zoals nu."
GJ_GEBIEDEN = [
    {"id": "rome", "naam": "Romeinse rijk", "kleur": "rood", "hoofdstad": "antiochie",
     "bron": ["wiki-augustus", "josephus-ant-15", "josephus-ant-17", "wiki-decapolis", "eigen-tekening"],
     "opmerking": R + " Alleen het oosten van het rijk rond Judea is getekend: de provincie Syrië (hoofdstad Antiochië) en vanaf 30 v.Chr. Egypte. Het rijk liep door tot Rome en verder naar het westen. Koningen en vorsten zoals Herodes regeerden met toestemming van Rome; hun land heeft hier een eigen kleur.",
     "sleutels": []},  # hieronder berekend
    {"id": "egypte", "naam": "Egypte (Cleopatra)", "kleur": "lila", "hoofdstad": "alexandrie", "bron": ["wiki-augustus", "eigen-tekening"],
     "opmerking": R + " Het koninkrijk van de Ptolemaeën, met koningin Cleopatra; vanaf 30 v.Chr. Romeins.",
     "sleutels": [sleutel(-40, EGYPTE), sleutel(-31, EGYPTE, "Na de slag bij Actium (31 v.Chr.) valt Egypte in 30 v.Chr. aan Rome.")]},
    {"id": "hasmoneeen", "naam": "Judea (Antigonus)", "kleur": "grijs", "hoofdstad": "jeruzalem", "bron": ["josephus-ant-17", "wiki-herodes", "eigen-tekening"],
     "opmerking": R + " Van 40 tot 37 v.Chr. regeerde Antigonus, de laatste koning uit het huis van de Hasmoneeën, met steun van de Parthen. Herodes was in Rome al tot koning benoemd, maar moest zijn land nog veroveren. Dezelfde vorm als het eerste rijk van Herodes.",
     "sleutels": [sleutel(-40, HERODES_37), sleutel(-38, HERODES_37)]},
    {"id": "herodes", "naam": "Rijk van Herodes", "kleur": "terra", "hoofdstad": "jeruzalem", "bron": ["josephus-ant-15", "josephus-ant-17", "wiki-herodes", "eigen-tekening"],
     "opmerking": R + " Het rijk groeide met gebieden die Augustus gaf: in 30 v.Chr. de kust (Joppe, de Torenstad van Strato) en Gadara en Hippos; in 23 v.Chr. Trachonitis, Batanea en Auranitis; in 20 v.Chr. Paneas (Josephus). Gaza, Samaria en Anthedon kreeg hij ook; Gaza ligt los van de rest en is niet getekend.",
     "sleutels": [
         sleutel(-37, HERODES_37, "Judea, Idumea, Samaria, Galilea en Perea."),
         sleutel(-31, HERODES_37),
         sleutel(-30, HERODES_30, "Na Actium: de kust met Joppe en de Torenstad van Strato (later Caesarea), en Gadara en Hippos (Josephus, Oudheden 15.7.3)."),
         sleutel(-24, HERODES_30),
         sleutel(-23, HERODES_23, "Trachonitis, Batanea en Auranitis (Josephus, Oudheden 15.10.1)."),
         sleutel(-21, HERODES_23),
         sleutel(-20, HERODES_20, "Het land van Zenodorus met Paneas, in het zeventiende jaar van Herodes (Josephus, Oudheden 15.10.3)."),
         sleutel(-5, HERODES_20, "Herodes sterft (meestal 4 v.Chr.); zijn rijk wordt verdeeld."),
     ]},
    {"id": "archelaus", "naam": "Archelaüs", "kleur": "koraal", "hoofdstad": "jeruzalem", "bron": ["Mattheüs 2:22", "josephus-ant-17", "wiki-archelaus", "eigen-tekening"],
     "opmerking": R + " Judea, Samaria en Idumea, met de kust van Asdod tot Caesarea. Gaza ging naar de provincie Syrië.",
     "sleutels": [sleutel(-4, ARCH), sleutel(5, ARCH, "In 6 n.Chr. afgezet.")]},
    {"id": "judea", "naam": "Judea (Romeinse provincie)", "kleur": "rood", "hoofdstad": "caesarea", "bron": ["josephus-ant-17", "wiki-pilatus", "eigen-tekening"],
     "opmerking": R + " Vanaf 6 n.Chr. bestuurd door een Romeinse stadhouder (zoals Pontius Pilatus) vanuit Caesarea.",
     "sleutels": [sleutel(6, ARCH, "Archelaüs afgezet: Judea krijgt een Romeinse stadhouder."), sleutel(40, ARCH)]},
    {"id": "antipas", "naam": "Herodes Antipas", "kleur": "salie", "hoofdstad": None, "bron": ["Lukas 3:1", "josephus-ant-17", "wiki-antipas", "eigen-tekening"],
     "opmerking": R + " Galilea en Perea, twee losse stukken land aan weerszijden van de Jordaan.",
     "sleutels": [sleutel(-4, ANTIPAS), sleutel(38, ANTIPAS, "In de zomer van 39 n.Chr. afgezet.")]},
    {"id": "filippus", "naam": "Filippus", "kleur": "oker", "hoofdstad": "caesarea-filippi", "bron": ["Lukas 3:1", "josephus-ant-17", "wiki-filippus", "eigen-tekening"],
     "opmerking": R + " Het noordoosten: Gaulanitis, Batanea, Trachonitis, Auranitis en Paneas (Lukas 3:1 noemt Iturea en Trachonitis). Na zijn dood (33/34 n.Chr.) bij de provincie Syrië.",
     "sleutels": [sleutel(-4, FILIPPUS), sleutel(33, FILIPPUS, "Filippus sterft (33 of 34 n.Chr.).")]},
    {"id": "agrippa", "naam": "Herodes Agrippa", "kleur": "camel", "hoofdstad": None, "bron": ["Handelingen 12:1", "wiki-antipas", "wiki-filippus", "eigen-tekening"],
     "opmerking": R + " Herodes Agrippa I, een kleinzoon van Herodes de Grote, is ‘de koning Herodes’ (Handelingen 12:1). Hij kreeg in 37 n.Chr. het land van Filippus en in 39 dat van Antipas.",
     "sleutels": [sleutel(37, FILIPPUS), sleutel(38, FILIPPUS), sleutel(39, FILIPPUS + ANTIPAS, "Ook Galilea en Perea, na de verbanning van Antipas."), sleutel(40, FILIPPUS + ANTIPAS)]},
    {"id": "decapolis", "naam": "Decapolis", "kleur": "teal", "hoofdstad": None, "bron": ["wiki-decapolis", "josephus-ant-15", "josephus-ant-17", "eigen-tekening"],
     "opmerking": R + " Decapolis betekent tien steden: steden met Griekse inwoners, die zichzelf bestuurden onder toezicht van de provincie Syrië. Gadara en Hippos hoorden van 30 tot 4 v.Chr. bij Herodes. Damascus, dat Plinius ook noemt, is niet in dit vlak getekend.",
     "sleutels": [sleutel(-40, [DECAPOLIS, GADHIP]), sleutel(-31, [DECAPOLIS, GADHIP]), sleutel(-30, DECAPOLIS, "Gadara en Hippos naar Herodes."),
                  sleutel(-5, DECAPOLIS), sleutel(-4, [DECAPOLIS, GADHIP], "Gadara en Hippos weer bij Syrië."), sleutel(40, [DECAPOLIS, GADHIP])]},
    {"id": "nabatea", "naam": "Nabatea", "kleur": "zand", "hoofdstad": "petra", "bron": ["wiki-nabatea", "eigen-tekening"],
     "opmerking": R + " Het koninkrijk van de Nabateeërs, met Petra en Bostra; het liep verder naar het zuiden door Arabië. Pas in 106 n.Chr. werd het Romeins.",
     "sleutels": [sleutel(-40, NABATEA), sleutel(40, NABATEA)]},
    {"id": "abilene", "naam": "Abilene", "kleur": "bruin", "hoofdstad": "abila", "bron": ["Lukas 3:1", "wiki-lysanias", "eigen-tekening"],
     "opmerking": R + " Het kleine land van Lysanias rond Abila. Alleen getekend rond het vijftiende jaar van Tiberius, waarin Lukas het noemt; hoe lang het daarvoor en daarna zo bestond, is niet bekend.",
     "sleutels": [sleutel(28, ABILENE), sleutel(29, ABILENE)]},
    {"id": "parthie", "naam": "Parthische rijk", "kleur": "kobalt", "hoofdstad": "ctesiphon", "bron": ["wiki-herodes", "eigen-tekening"],
     "opmerking": R + " Het grote rijk ten oosten van de Eufraat, de rivier die de grens met Rome vormde. Het liep ver naar het oosten door; Armenië, dat tussen Rome en Parthië in lag, is niet getekend.",
     "sleutels": [sleutel(-40, PARTHIE, vereenvoudig=0.04), sleutel(40, PARTHIE, vereenvoudig=0.04)]},
]


def rome_sleutels():
    """Een sleutel bij elke wissel van wie niet onder Rome viel, met ervoor de oude vorm (een snelle, geen trage overgang)."""
    def vorig(j):
        return -1 if j == 1 else j - 1  # er is geen jaar 0
    wissels = {-40, 40, -30} | {j for (a, b, _) in NIET_ROME for j in (a, 1 if b == -1 else b + 1)}
    jaren = set()
    for j in wissels:
        if -40 <= j <= 40:
            jaren.add(j)
            if j > -40:
                jaren.add(vorig(j))
    # Splinters (bijv. de Dode Zee tussen Judea, Perea en Nabatea) vallen weg: min_opp 0,2 graad².
    uit = [{"jaar": j, "betrouwbaarheid": "benaderd", "geometrie": geometrie(rome(j), min_opp=0.2)} for j in sorted(jaren)]
    # Alleen houden wat iets toevoegt: een sleutel die gelijk is aan de vorige en de volgende valt weg.
    schoon = [s for i, s in enumerate(uit) if i in (0, len(uit) - 1) or not (s["geometrie"] == uit[i - 1]["geometrie"] == uit[i + 1]["geometrie"])]
    opm = {-30: "Egypte wordt Romeins.", -4: "Na Herodes: Gaza en de steden van de Decapolis weer onder Syrië.", 34: "Het land van Filippus bij de provincie Syrië."}
    for s in schoon:
        if s["jaar"] in opm:
            s["opmerking"] = opm[s["jaar"]]
    return schoon


GJ_KOPPELINGEN = [
    {"verhaal": "v80", "jaar": -7, "tot": -5, "status": "benaderd", "personen": ["herodes", "augustus"], "gebeurtenissen": ["geboorte"],
     "opmerking": "‘In de dagen van Herodes, den koning van Judea’ (Lukas 1:5): ongeveer vijftien maanden vóór de geboorte van de Heere Jezus."},
    {"verhaal": "v81", "jaar": -7, "tot": -5, "status": "benaderd", "personen": ["herodes", "augustus"], "gebeurtenissen": ["geboorte"],
     "opmerking": "Ongeveer negen maanden vóór de geboorte van de Heere Jezus, in de tijd van Herodes."},
    {"verhaal": "v82", "jaar": -6, "tot": -4, "status": "benaderd", "personen": ["herodes"], "gebeurtenissen": ["geboorte"],
     "opmerking": "Johannes werd ongeveer een half jaar vóór de Heere Jezus geboren (Lukas 1:26, 36)."},
    {"verhaal": "v83", "jaar": -6, "tot": -4, "status": "benaderd", "personen": ["augustus", "herodes", "cyrenius"], "gebeurtenissen": ["geboorte"],
     "opmerking": "Vóór de dood van Herodes, die volgens Josephus ongeveer 4 v.Chr. stierf. De beschrijving ‘als Cyrenius over Syrië stadhouder was’ (Lukas 2:2) is historisch niet precies te dateren."},
    {"verhaal": "v84", "jaar": -6, "tot": -4, "status": "benaderd", "personen": ["augustus", "herodes"], "gebeurtenissen": ["geboorte"]},
    {"verhaal": "v85", "jaar": -6, "tot": -4, "status": "benaderd", "personen": ["herodes", "archelaus", "antipas"], "gebeurtenissen": ["geboorte", "herodes-sterft", "terug-nazareth"],
     "opmerking": "Herodes leefde nog toen de wijzen kwamen (Mattheüs 2:1); na zijn dood kwam het gezin terug uit Egypte (Mattheüs 2:19–23)."},
    {"verhaal": "v86", "jaar": 7, "tot": 9, "status": "benaderd", "personen": ["augustus"], "gebeurtenissen": ["twaalf-jaar", "judea-provincie"]},
    {"verhaal": "v87", "jaar": 28, "tot": 29, "status": "benaderd", "personen": ["tiberius", "pilatus", "antipas", "filippus", "lysanias", "kajafas"], "gebeurtenissen": ["vijftiende-jaar", "doop"],
     "opmerking": "In het vijftiende jaar van keizer Tiberius (Lukas 3:1), volgens de gangbare berekening ongeveer 28/29 n.Chr."},
    {"verhaal": "v100", "jaar": 28, "tot": 33, "status": "benaderd", "personen": ["antipas", "filippus"], "gebeurtenissen": ["vijftiende-jaar"],
     "opmerking": "Markus 6 noemt geen jaar. Het was in de regering van Herodes Antipas, nadat Johannes was begonnen te prediken (Lukas 3:1–3) en vóór het laatste Pascha van de Heere Jezus."},
    {"verhaal": "v125", "jaar": 30, "tot": 33, "status": "benaderd", "personen": ["pilatus", "antipas", "kajafas", "tiberius"], "gebeurtenissen": ["kruisiging"],
     "opmerking": "De Bijbel noemt geen jaartal. Meestal wordt de kruisiging op 30 of 33 n.Chr. gesteld, in de tijd dat Pilatus stadhouder was."},
]


# ================================================================= bouwen
def steden(lijst, plaatsen):
    uit = []
    for s in lijst:
        s = dict(s)
        if s["plaatsId"]:
            s["lat"], s["lng"] = plaatsen[s["plaatsId"]]
        uit.append({k: s[k] for k in ("id", "naam", "plaatsId", "lat", "lng", "tekst", "bron")})
    return uit


def bouw_perzie(plaatsen):
    return {
        "id": "perzie",
        "titel": "Perzië: Esther, Ezra en Nehemia",
        "ondertitel": "Van Darius I tot Nehemia, 522–430 v.Chr.",
        "as": {"soort": "vchr", "van": 522, "tot": 430, "stap": 1, "label": "jaar voor Christus"},
        "start": 515,
        "kader": [[24.5, 21.0], [43.5, 54.5]],
        "bronnen": PERZIE_BRONNEN,
        "personen": PERZIE_PERSONEN,
        "gebeurtenissen": PERZIE_GEBEURTENISSEN,
        "gebieden": PERZIE_GEBIEDEN,
        "steden": steden(PERZIE_STEDEN, plaatsen),
        "koppelingen": PERZIE_KOPPELINGEN,
    }


def bouw_geboorte_jezus(plaatsen):
    gebieden = [dict(gb) for gb in GJ_GEBIEDEN]
    gebieden[0]["sleutels"] = rome_sleutels()
    return {
        "id": "geboorte-jezus",
        "titel": "Herodes en de keizers van Rome",
        "ondertitel": "De wereld rond de geboorte van de Heere Jezus, 40 v.Chr. – 40 n.Chr.",
        "as": {"soort": "nchr", "van": -40, "tot": 40, "stap": 1, "label": "jaartelling",
               "uitleg": "Jaren voor en na Christus. Een jaar 0 bestaat niet: na 1 v.Chr. komt 1 n.Chr."},
        "start": -5,
        "kader": [[29.9, 33.0], [34.2, 38.4]],
        "info": [
            {"kop": "Waarom geen lijn voor de Heere Jezus?", "tekst": "De Heere Jezus staat hier niet als een levenslijn of een figuurtje tussen de heersers. Zijn geboorte, Zijn doop en Zijn kruisiging en opstanding staan als gebeurtenissen op de tijdlijn, met de plaats in de Bijbel waar je erover leest.", "status": "expliciet", "bron": "sv"},
            {"kop": "Waarom ca. 6–4 v.Chr.?", "tekst": "Onze jaartelling werd pas eeuwen later berekend, en kwam een paar jaar te laat uit. De Heere Jezus werd geboren in de dagen van koning Herodes (Mattheüs 2:1), die volgens Josephus ongeveer 4 v.Chr. stierf. Andere dateringen bestaan.", "status": "benaderd", "bron": ["Mattheüs 2:1", "wiki-herodes"]},
        ],
        "bronnen": GJ_BRONNEN,
        "personen": GJ_PERSONEN,
        "gebeurtenissen": GJ_GEBEURTENISSEN,
        "gebieden": gebieden,
        "steden": steden(GJ_STEDEN, plaatsen),
        "koppelingen": GJ_KOPPELINGEN,
    }


def main():
    plaatsen = laad_plaatsen()
    fout = False
    for naam, data in (("perzie", bouw_perzie(plaatsen)), ("geboorte-jezus", bouw_geboorte_jezus(plaatsen))):
        pad = os.path.join(MAP, naam + ".json")
        tekst = compact(json.dumps(data, ensure_ascii=False, indent=1)) + "\n"
        if "--controle" in sys.argv:
            oud = open(pad, encoding="utf-8").read() if os.path.exists(pad) else ""
            if oud != tekst:
                print(f"{naam}.json wijkt af van wat het script bouwt")
                fout = True
            else:
                print(f"ok: {naam}.json is gelijk aan de bouw")
            continue
        open(pad, "w", encoding="utf-8").write(tekst)
        print(f"geschreven: {os.path.relpath(pad)} ({len(tekst) // 1024} kB, {len(data['personen'])} personen, "
              f"{len(data['gebeurtenissen'])} gebeurtenissen, {len(data['gebieden'])} gebieden, "
              f"{sum(len(gb['sleutels']) for gb in data['gebieden'])} sleutels, {len(data['steden'])} steden)")
    if fout:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
