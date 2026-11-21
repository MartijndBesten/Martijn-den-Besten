#!/usr/bin/env python3
"""Bouwt public/bijbelreis/wereld/perioden/daniel-babylon.json (laag ‘De wereld in die tijd’, periode Daniël en Babylon).

Gebruik: python3 scripts/bijbelreis-wereld-daniel.py            (schrijft het JSON-bestand)
         python3 scripts/bijbelreis-wereld-daniel.py --controle (schrijft niets; faalt als het bestand afwijkt)

Waarom een script: de grenzen zijn met de hand getekend als grove benadering langs rivieren, kusten, gebergten en
woestijnranden (geen kaart overgenomen). Een rijk bestaat uit bouwstenen (bijv. Perzië = Persis + Medië + ...),
zodat de grens van Babel in 604 en de Babylonische ‘bouwsteen’ van Perzië in 539 precies gelijk zijn. Shapely voegt
de bouwstenen samen; daarna wordt afgerond op 0,05 graad en gecontroleerd op geldige, niet-zelfdoorsnijdende ringen.
Coördinaten: [lengte, breedte] (WGS84). Verantwoording: docs/bijbelreis-wereld/daniel-bronnen.md.
"""
import json
import os
import sys

from shapely.geometry import Polygon, mapping
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

HIER = os.path.dirname(os.path.abspath(__file__))
UIT = os.path.join(HIER, "..", "public", "bijbelreis", "wereld", "perioden", "daniel-babylon.json")
RASTER = 20  # 1/20 graad = 0,05


def P(*punten):
    return Polygon(punten)


# ---------------------------------------------------------------- bouwstenen (lng, lat)
# Babylonië: alleen de omgeving van Babel (Sippar–Nippur), het jaar dat Nabopolassar koning werd.
BAB_626 = P((44.1, 33.2), (44.6, 33.2), (45.3, 32.6), (45.4, 32.0), (44.9, 31.8), (44.3, 32.1), (43.9, 32.6))
# Babylonië zelf: van Hit (Eufraat) en Samarra (Tigris) tot de Golf; west de woestijnrand, oost de voet van de Zagros.
BAB_616 = P((42.8, 33.65), (43.9, 34.25), (45.4, 33.9), (45.9, 33.1), (46.6, 32.4), (47.3, 31.7), (47.9, 30.9),
            (47.7, 29.9), (46.4, 30.5), (45.4, 31.1), (44.4, 31.6), (43.6, 32.3), (43.0, 33.0))
# Na Haran (610/609): de Eufraat op tot de Balich, Haran, langs de voet van de Taurus naar de Tigris, de Tigris af
# (westoever bij Ninevé) naar Assur en Samarra.
NOORD_609 = [(43.9, 34.25), (44.6, 34.6), (43.6, 35.5), (43.1, 36.3), (42.6, 36.9), (42.2, 37.3), (41.2, 37.35),
             (40.0, 37.3), (38.9, 37.1)]
ZUID = [(45.4, 33.9), (45.9, 33.1), (46.6, 32.4), (47.3, 31.7), (47.9, 30.9), (47.7, 29.9), (46.4, 30.5),
        (45.4, 31.1), (44.4, 31.6), (43.6, 32.3), (43.0, 33.0)]
BAB_609 = P(*ZUID, (42.3, 33.6), (41.0, 34.3), (40.0, 34.8), (38.9, 35.9), (38.8, 36.6), *reversed(NOORD_609[1:]),
            (44.6, 34.6))
# Na Karkemis en Hamath (605): ook Noord-Syrië tot Hamath (Babylonische kroniek ABC 5, vz. 1–8).
BAB_605 = P(*ZUID, (42.3, 33.6), (41.0, 34.3), (40.0, 34.8), (38.9, 34.7), (37.6, 34.6), (36.4, 34.9), (36.3, 35.6),
            (36.6, 36.4), (37.0, 36.9), (38.0, 37.0), *reversed(NOORD_609[1:]), (44.6, 34.6))
# Vanaf 604: heel ‘Hattu’ tot aan ‘de rivier van Egypte’ (2 Koningen 24:7; Askelon 604, ABC 5): Fenicische kust,
# Filistea, Juda (als vazal), Overjordanië tot de woestijnrand.
LEVANT_W = [(38.0, 37.0), (37.0, 36.9), (36.2, 36.6), (35.9, 36.0), (35.8, 35.5), (35.9, 34.9), (35.8, 34.4),
            (35.6, 34.1), (35.45, 33.6), (35.15, 33.25), (35.0, 32.85), (34.8, 32.2), (34.55, 31.65), (34.3, 31.35),
            (33.8, 31.1), (34.9, 30.6), (35.4, 30.9), (36.0, 31.0)]
LEVANT_O = [(36.4, 32.0), (37.6, 33.3), (38.9, 34.3), (40.0, 34.5), (41.0, 34.2)]
BAB_604 = P(*ZUID, (42.3, 33.6), *reversed(LEVANT_O), *reversed(LEVANT_W), *reversed(NOORD_609[1:]), (44.6, 34.6))
# Nabonidus in Tayma (ABC 7 ii.5; Versverslag ii.6): een smalle uitloper naar de oase.
TAYMA = [(36.3, 30.0), (37.6, 28.6), (38.3, 27.3), (38.9, 27.4), (38.8, 28.2), (37.4, 29.6), (36.8, 30.8)]
BAB_549 = P(*ZUID, (42.3, 33.6), *reversed(LEVANT_O), *reversed(TAYMA), *reversed(LEVANT_W),
            *reversed(NOORD_609[1:]), (44.6, 34.6))

# Assyrië in 626: kernland aan de Tigris en de Jezira tot Haran en de Eufraat; het westen (Syrië, Kanaän) niet
# getekend, omdat onduidelijk is hoeveel gezag Assyrië daar nog had.
ASS_626 = P((37.9, 37.2), (38.1, 36.5), (38.9, 35.9), (40.1, 35.2), (40.9, 34.5), (42.0, 34.4), (43.7, 34.6),
            (44.5, 35.0), (45.0, 35.8), (44.6, 36.6), (43.8, 37.2), (42.4, 37.5), (40.8, 37.6), (39.3, 37.5))
# Na Ninevé (612): alleen het gebied rond Haran (ABC 3).
ASS_612 = P((38.2, 37.3), (38.2, 36.4), (39.0, 36.0), (39.8, 36.3), (39.9, 37.1), (39.1, 37.5))

# Medië: de Zagros en het westen van het Iraanse hoogland rond Ekbatana; omvang omstreden (zie bronnen).
MEDIE = P((44.6, 38.0), (45.2, 38.9), (46.8, 39.0), (48.0, 38.7), (48.85, 38.4), (48.0, 38.0), (49.3, 36.8),
          (50.5, 36.2), (51.5, 35.8), (52.6, 35.6), (52.4, 34.4), (51.6, 33.4), (50.4, 33.1), (49.0, 33.2),
          (47.6, 33.6), (46.3, 34.6), (45.8, 35.5), (45.2, 36.5), (44.8, 37.4))

# Lydië: kernland (Hermos- en Kaystrosdal rond Sardis) en onder Croesus alles ten westen van de Halys behalve Lycië en
# Cilicië (Herodotus 1.28; Halys als grens: 1.72).
LYD_626 = P((27.3, 39.2), (28.6, 39.4), (29.6, 38.9), (29.4, 38.2), (28.6, 37.8), (27.6, 37.9), (27.2, 38.4))
HALYS = [(35.9, 41.7), (35.5, 41.3), (34.8, 41.0), (34.0, 40.5), (33.6, 40.0), (33.8, 39.3), (34.2, 38.95)]
LYD_560 = P((27.4, 37.0), (27.2, 37.5), (27.3, 37.9), (26.8, 38.4), (26.9, 38.9), (26.2, 39.4), (26.2, 40.0),
            (27.0, 40.4), (27.8, 40.35), (28.9, 40.4), (29.9, 40.75), (29.1, 41.15), (30.4, 41.2), (31.4, 41.3),
            (32.4, 41.75), (33.8, 42.0), (35.0, 42.05), *HALYS, (33.4, 38.2), (32.4, 37.6), (31.6, 37.3),
            (31.6, 36.8), (30.7, 36.85), (30.2, 37.2), (29.4, 37.1), (28.6, 36.8), (28.0, 36.8))

# Egypte: Nijldelta en Nijldal tot Elephantine (eerste cataract), met de Fajoem.
NIJL_O = [(32.55, 31.05), (32.2, 30.5), (31.6, 30.1), (31.4, 29.6), (31.2, 29.0), (31.0, 28.3), (31.0, 27.6),
          (31.4, 27.0), (31.9, 26.6), (32.9, 26.2), (32.85, 25.7), (33.0, 25.0), (33.0, 24.1)]
NIJL_W = [(32.75, 24.0), (32.75, 25.0), (32.5, 25.7), (32.6, 26.0), (32.2, 25.95), (31.5, 26.6), (30.9, 27.2),
          (30.6, 28.1), (30.5, 29.0), (30.3, 29.3), (30.5, 29.6), (30.7, 30.0), (30.2, 30.6), (29.8, 30.9),
          (29.9, 31.2), (30.6, 31.5), (31.4, 31.55)]
EGY = P(*NIJL_O, *NIJL_W)
# 609–605: Farao Necho heeft gezag in Kanaän en Syrië tot Karkemis (2 Koningen 23:29–35; Jeremia 46:2; ABC 3 en 5).
EGY_609 = P(*NIJL_O[1:], *NIJL_W, (32.55, 31.05), (33.8, 31.15), (34.3, 31.35), (34.55, 31.65), (34.8, 32.2),
            (35.0, 32.85), (35.15, 33.25), (35.45, 33.6), (35.6, 34.1), (35.8, 34.4), (35.9, 34.9), (35.8, 35.5),
            (35.9, 36.0), (36.2, 36.6), (37.0, 36.9), (38.0, 37.0), (38.2, 36.3), (37.6, 35.3), (36.9, 34.4),
            (36.6, 33.4), (36.2, 32.3), (35.6, 32.6), (35.5, 31.5), (35.2, 30.8), (34.6, 30.6), (33.0, 30.9))

# Juda: het bergland van Juda met de Sefela en de Negev, van Mizpa tot Berseba.
JUDA = P((34.75, 31.85), (35.05, 31.9), (35.25, 31.95), (35.45, 31.9), (35.55, 31.75), (35.45, 31.45), (35.4, 31.15),
         (35.3, 30.95), (34.95, 30.85), (34.7, 31.1), (34.7, 31.45), (34.75, 31.65))

# Perzië: Persis (Ansan) rond Pasargadae en Ansan (Tall-i Malyan).
PERSIS = P((50.2, 30.4), (50.8, 29.0), (51.4, 28.0), (52.6, 27.4), (54.0, 26.8), (55.3, 27.3), (55.6, 28.6),
           (55.0, 30.1), (53.9, 31.2), (52.4, 31.6), (51.2, 31.2))
BRUG_PM = P((50.2, 30.4), (49.0, 33.2), (51.6, 33.4), (53.9, 31.2))  # Zagros tussen Persis en Medië
# Cappadocië en Armenië (in de lijst van Behistun, 522), hier toegevoegd met Lydië in 547.
CORRIDOR = P(*HALYS, (35.0, 38.2), (36.0, 38.0), (37.0, 37.6), (39.0, 37.7), (41.0, 37.8), (43.0, 37.7), (44.8, 37.4),
             (44.6, 38.0), (45.2, 38.9), (46.8, 39.0), (46.5, 39.6), (45.5, 41.0), (43.5, 41.2), (41.6, 41.6),
             (39.7, 41.0), (37.5, 41.1))
ELAM = P((47.6, 32.3), (47.9, 30.9), (48.5, 30.2), (49.6, 30.0), (50.2, 30.4), (50.0, 31.5), (49.0, 32.8), (47.9, 33.0))
ZAGROS = P((45.3, 34.0), (45.8, 35.5), (46.3, 34.6), (47.6, 33.6), (49.0, 33.2), (47.6, 32.3), (46.6, 32.4),
           (45.9, 33.1))
ASSUR_N = P((43.1, 36.3), (43.6, 35.5), (44.6, 34.6), (45.3, 34.0), (45.8, 35.5), (45.2, 36.5), (44.8, 37.4),
            (43.0, 37.7), (42.2, 37.3), (42.6, 36.9))
# Het oosten, zoals de lijst van Behistun het noemt (Parthië, Aria, Chorasmië, Baktrië, Sogdië, Gandhara, Arachosië,
# Maka): langs de zuidkust van de Kaspische Zee, om de Karakum heen, tot de Indus-uitlopers en de Makran-kust.
OOST = P((48.9, 38.4), (49.5, 37.4), (50.5, 36.9), (51.9, 36.65), (53.9, 36.9), (56.0, 38.3), (58.4, 40.6),
         (59.6, 42.6), (61.2, 42.4), (62.5, 40.6), (64.5, 40.3), (66.5, 40.4), (68.5, 40.4), (69.5, 38.8),
         (71.0, 37.5), (71.6, 34.6), (72.3, 33.8), (71.0, 32.5), (70.0, 31.5), (67.5, 30.0), (66.0, 29.0),
         (62.5, 25.2), (60.0, 25.3), (58.0, 25.6), (57.3, 26.9), (56.3, 27.1), (55.3, 27.3), (55.6, 28.6),
         (55.0, 30.1), (53.9, 31.2), (52.4, 33.0), (52.6, 35.6), (51.5, 35.8), (50.5, 36.2), (49.3, 36.8),
         (48.0, 38.0))
SINAI = P((32.2, 30.5), (32.55, 31.05), (33.8, 31.15), (34.9, 30.6), (34.5, 30.2), (33.0, 30.4))

PER_559 = PERSIS
PER_550 = [PERSIS, BRUG_PM, MEDIE]
PER_547 = PER_550 + [LYD_560, CORRIDOR]
PER_539 = PER_547 + [BAB_604, ELAM, ZAGROS, ASSUR_N]
PER_530 = PER_539 + [OOST]
PER_525 = PER_530 + [EGY, SINAI]


# ---------------------------------------------------------------- geometrie naar GeoJSON
def rond(x):
    return round(round(x * RASTER) / RASTER, 2)


def geometrie(delen):
    if isinstance(delen, Polygon):
        delen = [delen]
    g = unary_union([d.buffer(0) for d in delen])
    if g.geom_type != "Polygon":
        raise SystemExit(f"bouwstenen vormen geen aaneengesloten gebied: {g.geom_type}")
    g = Polygon(g.exterior)  # gaten (bijv. tussen bouwstenen) bestaan niet in deze benadering
    g = g.simplify(0.04, preserve_topology=True)
    g = orient(g, sign=1.0)  # buitenring tegen de klok in (RFC 7946)
    ring = []
    for x, y in g.exterior.coords:
        p = [rond(x), rond(y)]
        if not ring or ring[-1] != p:
            ring.append(p)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    controle = Polygon(ring)
    if not controle.is_valid or len(ring) < 4:
        raise SystemExit(f"ongeldige ring na afronden: {ring[:6]}…")
    return {"type": "Polygon", "coordinates": [ring]}


def sleutel(jaar, delen, opmerking=None):
    s = {"jaar": jaar, "betrouwbaarheid": "benaderd", "geometrie": geometrie(delen)}
    if opmerking:
        s["opmerking"] = opmerking
    return s


# ---------------------------------------------------------------- bronnen
G = "2026-11-17"
SV = "Statenvertaling (1637), publiek domein; gecontroleerd met data/statenvertaling en scripts/bijbel-check.py"
LIV = "© Livius.org (alle rechten voorbehouden); alleen geraadpleegd en kort samengevat, niets overgenomen"
BRONNEN = [
    {"id": "sv", "soort": "bijbel", "titel": "Statenvertaling: Daniël, 2 Koningen 23–25, 2 Kronieken 36, Jeremia, Ezechiël, Ezra 1–6", "url": None, "licentie": SV, "geraadpleegd": G},
    {"id": "abc2", "soort": "historisch", "titel": "Babylonische kroniek ABC 2 (vroege jaren van Nabopolassar), vert. Grayson/Glassner", "url": "https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-2-early-years-of-nabopolassar/", "licentie": LIV, "geraadpleegd": G},
    {"id": "abc3", "soort": "historisch", "titel": "Babylonische kroniek ABC 3 (val van Ninevé)", "url": "https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-3-fall-of-nineveh-chronicle/", "licentie": LIV, "geraadpleegd": G},
    {"id": "abc5", "soort": "historisch", "titel": "Babylonische kroniek ABC 5 (Jeruzalem-kroniek, jaren 21 Nabopolassar – 11 Nebukadnezar)", "url": "https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-5-jerusalem-chronicle/", "licentie": LIV, "geraadpleegd": G},
    {"id": "abc7", "soort": "historisch", "titel": "Babylonische kroniek ABC 7 (Nabonidus-kroniek)", "url": "https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-7-nabonidus-chronicle/", "licentie": LIV, "geraadpleegd": G},
    {"id": "verse-account", "soort": "historisch", "titel": "Versverslag van Nabonidus (Verse Account), kolom ii", "url": "https://www.livius.org/sources/content/anet/verse-account-of-nabonidus/", "licentie": LIV, "geraadpleegd": G},
    {"id": "cyruscilinder", "soort": "historisch", "titel": "Cyruscilinder (British Museum, BM 90920), vertaling en toelichting", "url": "https://www.livius.org/sources/content/cyrus-cylinder/cyrus-cylinder-translation/", "licentie": LIV, "geraadpleegd": G},
    {"id": "behistun-lijst", "soort": "historisch", "titel": "Inscriptie van Behistun §6: de 23 landen van Darius I", "url": "https://www.livius.org/articles/person/darius-the-great/sources/four-achaemenid-empire-lists/", "licentie": LIV, "geraadpleegd": G},
    {"id": "herodotus", "soort": "historisch", "titel": "Herodotus, Historiën I (vert. G.C. Macaulay, 1890), o.a. 1.28, 1.72, 1.74, 1.214", "url": "https://en.wikisource.org/wiki/The_History_of_Herodotus_(Macaulay)/Book_I", "licentie": "Publiek domein (Wikisource)", "geraadpleegd": G},
    {"id": "livius-nebukadnezar", "soort": "historisch", "titel": "Livius.org: Nebuchadnezzar II (tijdlijn)", "url": "https://www.livius.org/articles/person/nebuchadnezzar-ii/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-nabonidus", "soort": "historisch", "titel": "Livius.org: Nabonidus (tijdlijn)", "url": "https://www.livius.org/articles/person/nabonidus/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-cambyses", "soort": "historisch", "titel": "Livius.org: Cambyses II", "url": "https://www.livius.org/articles/person/cambyses-ii/", "licentie": LIV, "geraadpleegd": G},
    {"id": "livius-cyaxares", "soort": "historisch", "titel": "Livius.org: Cyaxares (Meden)", "url": "https://www.livius.org/articles/person/cyaxares/", "licentie": LIV, "geraadpleegd": G},
    {"id": "wiki-darius-meder", "soort": "historisch", "titel": "Darius the Mede (Wikipedia, Engels): de voorgestelde identificaties, waaronder Cyaxares II (Xenophon; o.a. Hiëronymus, Calvijn, Keil)", "url": "https://en.wikipedia.org/wiki/Darius_the_Mede", "licentie": "Wikipedia, CC BY-SA 4.0; alleen geraadpleegd en kort samengevat, geen tekst overgenomen", "geraadpleegd": "2026-11-21", "kort": "Wikipedia"},
    {"id": "livius-sardes", "soort": "historisch", "titel": "Livius.org: Sardes (547 BCE??)", "url": "https://www.livius.org/articles/battle/sardes-547-bce/", "licentie": LIV, "geraadpleegd": G},
    {"id": "cahill-sardis", "soort": "historisch", "titel": "N. Cahill, “The Persian Sack of Sardis”, in: The Lydians and their World (2010)", "url": "https://sardisexpedition.org/en/essays/latw-cahill-persian-sack-sardis", "licentie": "© Archaeological Exploration of Sardis; alleen geraadpleegd", "geraadpleegd": G},
    {"id": "bmcr-media", "soort": "historisch", "titel": "Bespreking van Lanfranchi, Roaf & Rollinger (red.), Continuity of Empire (?) Assyria, Media, Persia (2003), BMCR 2004.11.11", "url": "https://bmcr.brynmawr.edu/?p=23704", "licentie": "© BMCR; alleen geraadpleegd", "geraadpleegd": G},
    {"id": "cojs-jojachin", "soort": "historisch", "titel": "Babylonische rantsoenlijst met koning Jojachin in ballingschap (ca. 592/591 v.Chr.), Center for Online Judaic Studies", "url": "https://cojs.org/babylonian_ration_list-_king_jehoiakhin_in_exile-_592-1_bce/", "licentie": "© COJS; alleen geraadpleegd", "geraadpleegd": G},
    {"id": "pleiades-pasargadae", "soort": "dataset", "titel": "Pleiades 922693: Pasargadae", "url": "https://pleiades.stoa.org/places/922693", "licentie": "CC BY 3.0 (naamsvermelding: Pleiades)", "geraadpleegd": G},
    {"id": "pleiades-sais", "soort": "dataset", "titel": "Pleiades 727217: Sais", "url": "https://pleiades.stoa.org/places/727217", "licentie": "CC BY 3.0 (naamsvermelding: Pleiades)", "geraadpleegd": G},
    {"id": "pleiades-tayma", "soort": "dataset", "titel": "Pleiades 814739: Thaima (Tayma)", "url": "https://pleiades.stoa.org/places/814739", "licentie": "CC BY 3.0 (naamsvermelding: Pleiades)", "geraadpleegd": G},
    {"id": "bijbelreis-plaatsen", "soort": "dataset", "titel": "Bijbelreis plaatsen.js (ligging gecontroleerd met OpenBible.info CC BY 4.0 en Pleiades CC BY)", "url": None, "licentie": "eigen gegevens Bijbelreis; zie docs/bijbelreis-audit/plaatsen.md", "geraadpleegd": G},
    {"id": "eigen-tekening", "soort": "dataset", "titel": "Grenzen: eigen grove tekening langs rivieren, kusten, gebergten en woestijnranden (scripts/bijbelreis-wereld-daniel.py)", "url": None, "licentie": "eigen werk; geen kaart overgenomen", "geraadpleegd": G},
]


def d(jaar, status, bron, **extra):
    """Een gedateerd gegeven: jaar op de as (v.Chr.), status, bron (Bijbelverwijzing of bron-id) en eventueel marge/opmerking."""
    x = {"jaar": jaar, "status": status, "bron": bron}
    x.update(extra)
    return x


# ---------------------------------------------------------------- personen
PERSONEN = [
    {"id": "nabopolassar", "naam": "Nabopolassar", "alt": [], "personenId": None, "lijn": "regering",
     "van": d(626, "historisch", "abc2", begin="regering", opmerking="Koning in Babel op 26 Arahsamnu (23 november 626 v.Chr.)."),
     "tot": d(605, "historisch", "abc5", einde="stierf", opmerking="Hij stierf in de maand Abu (augustus) van 605 v.Chr."),
     "ouder": None, "rol": "Koning van Babel; begon het Nieuw-Babylonische rijk", "ref": [], "gebeurtenissen": ["val-nineve"], "verhaal": None},
    {"id": "nebukadnezar", "naam": "Nebukadnezar", "alt": ["Nebukadrezar", "Nebukadnezar II"], "personenId": "nebukadnezar", "lijn": "regering",
     "van": d(605, "historisch", "abc5", begin="regering", opmerking="Op 1 Ululu (september 605 v.Chr.) besteeg hij de troon in Babel."),
     "tot": d(562, "historisch", "livius-nebukadnezar", einde="stierf"),
     "ouder": "nabopolassar", "rol": "Koning van Babel; veroverde Jeruzalem en voerde Juda weg",
     "ref": ["Daniël 1–4", "2 Koningen 24–25", "Jeremia 25:1"],
     "gebeurtenissen": ["karkemis", "daniel-weggevoerd", "inname-jeruzalem", "verwoesting-jeruzalem", "dood-nebukadnezar"], "verhaal": "v73",
     "opmerking": "De Babylonische kroniek noemt hem “zijn oudste zoon, de kroonprins” van Nabopolassar."},
    {"id": "nabonidus", "naam": "Nabonidus", "alt": [], "personenId": None, "lijn": "regering",
     "van": d(556, "historisch", "livius-nabonidus", begin="regering"),
     "tot": d(539, "historisch", "abc7", einde="onbekend", opmerking="Na de val van Babel werd hij gevangengenomen; hoe zijn leven eindigde, is niet zeker."),
     "ouder": None, "rol": "Laatste koning van Babel; woonde jarenlang in de oase Tayma in Arabië", "ref": [], "gebeurtenissen": ["val-babylon"], "verhaal": None,
     "opmerking": "De Bijbel noemt hem niet bij naam."},
    {"id": "belsazar", "naam": "Belsazar", "alt": ["Bel-sjarra-oesoer"], "personenId": "belsazar", "lijn": "regering",
     "van": d(553, "benaderd", ["verse-account", "abc7"], begin="regering", marge=[553, 552],
              opmerking="Toen zijn derde jaar begon, vertrouwde Nabonidus “het koningschap” toe aan zijn oudste zoon en vertrok naar Tayma (Versverslag). De Bijbel spreekt van ‘het eerste jaar van Belsazar’ (Daniël 7:1)."),
     "tot": d(539, "benaderd", "Daniël 5:30", einde="stierf",
              opmerking="‘In dienzelfden nacht, werd Belsazar, der Chaldeen koning, gedood’ (Daniël 5:30). Babel viel in oktober 539 v.Chr. (Nabonidus-kroniek); zijn dood staat niet in Babylonische bronnen."),
     "ouder": None, "rol": "Zoon van Nabonidus; regeerde in Babel terwijl zijn vader in Tayma was",
     "ref": ["Daniël 5", "Daniël 7:1", "Daniël 8:1"], "gebeurtenissen": ["val-babylon"], "verhaal": None,
     "opmerking": "Het boek Daniël noemt Nebukadnezar ‘zijn vader’ (Daniël 5:2); “vader” kan in de Bijbel ook voorvader of voorganger betekenen. Buiten de Bijbel is hij bekend als zoon van Nabonidus."},
    {"id": "kores", "naam": "Kores", "alt": ["Cyrus", "Cores"], "personenId": "kores", "lijn": "regering",
     "van": d(559, "benaderd", ["herodotus", "pleiades-pasargadae"], begin="regering", opmerking="Herodotus geeft hem 29 regeringsjaren; terugrekenen vanaf 530 geeft 559 v.Chr. Eerst was hij koning van Ansan (Perzië)."),
     "tot": d(530, "historisch", "livius-cambyses", einde="stierf"),
     "ouder": None, "rol": "Koning van Perzië; veroverde Medië, Lydië en Babel en liet de Joden teruggaan",
     "ref": ["Ezra 1:1–4", "2 Kronieken 36:22–23", "Daniël 1:21", "Daniël 10:1", "Jesaja 45:1"],
     "gebeurtenissen": ["kores-medie", "sardis", "val-babylon", "decreet-kores"], "verhaal": "v76"},
    {"id": "cambyses", "naam": "Cambyses", "alt": ["Cambyses II"], "personenId": None, "lijn": "regering",
     "van": d(530, "historisch", "livius-cambyses", begin="regering"),
     "tot": d(522, "historisch", "livius-cambyses", einde="stierf"),
     "ouder": "kores", "rol": "Zoon van Kores; veroverde Egypte in 525 v.Chr.", "ref": [], "gebeurtenissen": [], "verhaal": None,
     "opmerking": "De Nabonidus-kroniek noemt hem “Cambyses, zoon van Kores”. De Bijbel noemt hem niet met zekerheid."},
    {"id": "darius-i", "naam": "Darius I", "alt": ["Darius de Grote"], "personenId": "darius_pers", "lijn": "regering",
     "van": d(522, "historisch", "behistun-lijst", begin="regering"),
     "tot": d(486, "historisch", "behistun-lijst", einde="stierf", opmerking="Zijn regering loopt door tot na het einde van deze tijdlijn."),
     "ouder": None, "rol": "Koning van Perzië; in zijn zesde jaar was de tempel in Jeruzalem klaar",
     "ref": ["Ezra 4:24", "Ezra 6:15"], "gebeurtenissen": ["tempel-klaar"], "verhaal": "v76",
     "opmerking": "Dat de Darius van Ezra 4–6 Darius I is, wordt algemeen aangenomen."},
    {"id": "darius-meder", "naam": "Darius de Meder", "alt": ["Darius"], "personenId": "darius_meder", "lijn": "regering",
     "van": d(539, "benaderd", "Daniël 6:1", begin="regering", opmerking="Hij ontving het koninkrijk na de dood van Belsazar, ‘omtrent twee en zestig jaren oud zijnde’ (Daniël 6:1)."),
     "tot": d(538, "benaderd", ["Daniël 9:1", "wiki-darius-meder"], einde="onbekend", opmerking="De Bijbel noemt alleen zijn eerste jaar (Daniël 9:1; 11:1); hoe lang hij regeerde, staat er niet."),
     "ouder": None, "rol": "Koning over Babel na Belsazar; liet Daniël in de leeuwenkuil werpen",
     "ref": ["Daniël 6", "Daniël 9:1", "Daniël 11:1"], "gebeurtenissen": ["leeuwenkuil"], "verhaal": "v75",
     "opmerking": "Wie hij buiten de Bijbel was, is omstreden; zeker is het niet. Genoemd worden onder meer Gubaru, die volgens de Nabonidus-kroniek voor Kores de bestuurders in Babel aanstelde, Kores zelf, of een Meedse vorst. Oudere boeken (onder anderen Calvijn) stellen hem gelijk aan Cyaxares II, een Meedse koning en oom van Kores die alleen de Griekse schrijver Xenophon noemt."},
    {"id": "jojakim", "naam": "Jojakim", "alt": ["Eljakim"], "personenId": "jojakim", "lijn": "regering",
     "van": d(609, "benaderd", ["2 Koningen 23:29–36", "abc3"], begin="regering", opmerking="Farao Necho maakte hem koning na de dood van Josia (2 Koningen 23:29–34). Necho trok in 609 v.Chr. naar de Eufraat (Babylonische kroniek)."),
     "tot": d(598, "benaderd", "2 Koningen 23:36; 24:6", einde="stierf", opmerking="Hij regeerde elf jaar en stierf kort voordat Jeruzalem begin 597 v.Chr. werd ingenomen."),
     "ouder": None, "rol": "Koning van Juda; in zijn tijd werd Daniël weggevoerd",
     "ref": ["2 Koningen 23:34–24:6", "Daniël 1:1–2", "Jeremia 36"], "gebeurtenissen": ["daniel-weggevoerd"], "verhaal": "v73"},
    {"id": "jojachin", "naam": "Jojachin", "alt": ["Jechonia", "Chonja"], "personenId": "jojachin", "lijn": "leven",
     "van": d(598, "benaderd", "2 Koningen 24:8", begin="regering", opmerking="Hij was achttien jaar toen hij koning werd en regeerde drie maanden. De lijn begint bij zijn koningschap, niet bij zijn geboorte."),
     "tot": d(561, "berekend", "2 Koningen 25:27", einde="onbekend", marge=[562, 561],
              opmerking="In het zevenendertigste jaar van zijn wegvoering kreeg hij genade van Evil-Merodach (2 Koningen 25:27), omgerekend begin 561 v.Chr. Daarna at hij aan de tafel van de koning ‘al de dagen zijns levens’ (2 Koningen 25:29); wanneer hij stierf, staat er niet."),
     "ouder": "jojakim", "rol": "Koning van Juda (drie maanden), daarna gevangene in Babel",
     "ref": ["2 Koningen 24:8–17", "2 Koningen 25:27–30", "Jeremia 52:31–34"], "gebeurtenissen": ["inname-jeruzalem", "dood-nebukadnezar"], "verhaal": "v71",
     "opmerking": "Babylonische rantsoenlijsten uit de tijd van Nebukadnezar noemen “Ja’u-kinu, koning van Juda” en zijn zonen (cojs-jojachin)."},
    {"id": "zedekia", "naam": "Zedekia", "alt": ["Mattanja"], "personenId": "zedekia", "lijn": "regering",
     "van": d(597, "historisch", ["abc5", "2 Koningen 24:17–18"], begin="regering", opmerking="De Babylonische kroniek zegt dat Nebukadnezar een koning naar zijn eigen keus aanstelde; de Bijbel noemt hem Zedekia."),
     "tot": d(586, "benaderd", "2 Koningen 25:2–7", einde="onbekend", marge=[587, 586],
              opmerking="In zijn elfde jaar werd Jeruzalem ingenomen en werd hij naar Babel gevoerd: in 586 v.Chr., volgens anderen 587. Wanneer hij stierf, staat er niet."),
     "ouder": None, "rol": "Laatste koning van Juda", "ref": ["2 Koningen 24:17–25:7", "Jeremia 39:1–7"],
     "gebeurtenissen": ["verwoesting-jeruzalem"], "verhaal": "v71"},
    {"id": "daniel", "naam": "Daniël", "alt": ["Beltsazar"], "personenId": "daniel", "lijn": "in Babel",
     "van": d(605, "benaderd", "Daniël 1:1–6", begin="weggevoerd",
              opmerking="De lijn begint bij de wegvoering, niet bij de geboorte: wanneer Daniël geboren werd, staat niet in de Bijbel. Hij was toen een van de jongelingen uit Juda (Daniël 1:3–6). Het derde jaar van Jojakim is volgens de gangbare uitleg 605 v.Chr."),
     "tot": d(536, "benaderd", "Daniël 10:1", einde="onbekend", marge=[536, 535],
              opmerking="‘Daniël bleef tot het eerste jaar van den koning Kores toe’ (Daniël 1:21). Het laatste jaartal in het boek is het derde jaar van Kores (Daniël 10:1), ongeveer 536 v.Chr. Hoe oud hij werd en wanneer hij stierf, staat er niet."),
     "ouder": None, "rol": "Uit Juda weggevoerd naar Babel; diende aan het hof van Nebukadnezar tot in de tijd van Kores",
     "ref": ["Daniël 1:1–6", "Daniël 1:21", "Daniël 10:1"], "gebeurtenissen": ["daniel-weggevoerd", "val-babylon", "leeuwenkuil"], "verhaal": "v73"},
    {"id": "jeremia", "naam": "Jeremia", "alt": [], "personenId": "jeremia", "lijn": "profeet",
     "van": d(627, "berekend", "Jeremia 1:2", begin="roeping", marge=[627, 626], opmerking="Het woord van de HEERE kwam tot hem in het dertiende jaar van koning Josia, omgerekend 627/626 v.Chr."),
     "tot": d(586, "benaderd", "Jeremia 43:6–7", einde="onbekend", opmerking="Na de val van Jeruzalem werd hij meegenomen naar Egypte en profeteerde daar nog (Jeremia 44). Wanneer hij stierf, staat er niet."),
     "ouder": None, "rol": "Profeet in Jeruzalem; zag de val van de stad", "ref": ["Jeremia 1:1–3", "Jeremia 25:1", "Jeremia 29:10", "Jeremia 39–40"],
     "gebeurtenissen": ["verwoesting-jeruzalem"], "verhaal": "v71"},
    {"id": "ezechiel", "naam": "Ezechiël", "alt": [], "personenId": None, "lijn": "in Babel",
     "van": d(597, "berekend", ["Ezechiël 1:2", "abc5"], begin="weggevoerd", opmerking="Hij werd met koning Jojachin weggevoerd en telt de jaren vanaf ‘de wegvoering van den koning Jojachin’ (Ezechiël 1:2)."),
     "tot": d(571, "berekend", "Ezechiël 29:17", einde="onbekend", marge=[571, 570], opmerking="Het laatste jaartal in zijn boek is het zevenentwintigste jaar (Ezechiël 29:17), omgerekend ongeveer 571 v.Chr."),
     "ouder": None, "rol": "Priester en profeet bij de ballingen aan de rivier Chebar", "ref": ["Ezechiël 1:1–3", "Ezechiël 29:17", "Ezechiël 40:1"],
     "gebeurtenissen": ["inname-jeruzalem"], "verhaal": None},
]

# ---------------------------------------------------------------- gebeurtenissen
def g(id, titel, tekst, jaar, status, bron, personen, plaats, verhaal=None, belangrijk=False, **extra):
    x = {"id": id, "titel": titel, "tekst": tekst, "jaar": jaar, "tot": None, "status": status, "bron": bron,
         "personen": personen, "plaats": plaats, "verhaal": verhaal, "belangrijk": belangrijk}
    x.update(extra)
    return x


GEBEURTENISSEN = [
    g("val-nineve", "Ninevé verwoest",
      "De legers van Babel en de Meden nemen Ninevé in, de hoofdstad van Assyrië, en maken er een puinhoop van. Na nog een paar jaar strijd rond Haran is het Assyrische rijk verdwenen.",
      612, "historisch", ["abc3"], ["nabopolassar"], "ninivest", belangrijk=True,
      opmerking="De kroniek noemt de maand Abu (juli/augustus) in het veertiende jaar van Nabopolassar; Haran viel in 610/609 v.Chr."),
    g("karkemis", "Slag bij Karkemis",
      "Kroonprins Nebukadnezar verslaat het leger van Farao Necho bij Karkemis aan de Eufraat en achtervolgt het tot bij Hamath. Daarna trekt hij door Syrië.",
      605, "historisch", ["abc5", "Jeremia 46:2"], ["nebukadnezar"], "karkemis",
      opmerking="Jeremia 46:2 noemt deze slag in het vierde jaar van Jojakim."),
    g("daniel-weggevoerd", "Daniël naar Babel",
      "Nebukadnezar belegert Jeruzalem en neemt jongens uit de koninklijke familie mee naar Babel, onder wie Daniël en zijn drie vrienden.",
      605, "benaderd", ["Daniël 1:1–6"], ["daniel", "nebukadnezar", "jojakim"], "salem", verhaal="v73", belangrijk=True, stap="daniel:daniel:1",
      opmerking="Daniël 1:1 noemt het derde jaar van Jojakim, Jeremia 46:2 het vierde jaar voor de slag bij Karkemis. Volgens de gangbare uitleg tellen ze anders (wel of niet het eerste, onvolledige jaar) en gaat het om hetzelfde jaar, 605 v.Chr. Buiten de Bijbel is deze wegvoering niet beschreven."),
    g("inname-jeruzalem", "Jeruzalem ingenomen, Jojachin weggevoerd",
      "Na een beleg neemt Nebukadnezar Jeruzalem in. Hij voert koning Jojachin weg naar Babel, met duizenden anderen, onder wie Ezechiël, en maakt Zedekia koning.",
      597, "historisch", ["abc5", "2 Koningen 24:10–17", "Jeremia 52:28"], ["nebukadnezar", "jojachin", "zedekia", "ezechiel"], "salem", stap="2koningen:ballingschap:6",
      opmerking="Volgens de Babylonische kroniek op de tweede dag van de maand Addaru in het zevende jaar van Nebukadnezar (februari/maart 597 v.Chr.). Ook het boek Jeremia noemt ‘het zevende jaar’ (Jeremia 52:28); 2 Koningen 24:12 noemt het achtste jaar (een andere telling)."),
    g("verwoesting-jeruzalem", "Jeruzalem en de tempel verwoest",
      "Na een beleg van ongeveer anderhalf jaar breekt het leger van Babel de stad binnen. De tempel, het paleis en de huizen worden verbrand en de muren afgebroken.",
      586, "benaderd", ["2 Koningen 25:1–10", "Jeremia 52:12–14", "livius-nebukadnezar"], ["nebukadnezar", "zedekia", "jeremia"], "salem", verhaal="v71", belangrijk=True,
      stap="2koningen:ballingschap:7", marge=[587, 586],
      opmerking="De Bijbel noemt het elfde jaar van Zedekia en het negentiende jaar van Nebukadnezar (2 Koningen 25:2, 8); Jeremia 52:29 noemt bij een groep weggevoerden het achttiende jaar. Omgerekend komen onderzoekers op 586 of 587 v.Chr. Het bewaarde deel van de Babylonische kroniek stopt eerder, na het elfde jaar van Nebukadnezar."),
    g("dood-nebukadnezar", "Nebukadnezar sterft",
      "Na een lange regering sterft Nebukadnezar. Zijn zoon Evil-Merodach wordt koning en haalt Jojachin uit de gevangenis.",
      562, "historisch", ["livius-nebukadnezar", "2 Koningen 25:27–30"], ["nebukadnezar", "jojachin"], "babelst", stap="2koningen:ballingschap:8",
      opmerking="Jojachin kreeg genade ‘in het jaar, als hij koning werd’ (2 Koningen 25:27), in de twaalfde maand: omgerekend begin 561 v.Chr. Evil-Merodach heet in Babylonische bronnen Amel-Marduk."),
    g("kores-medie", "Kores verovert Medië",
      "Koning Astyages van Medië trekt op tegen Kores, maar zijn eigen leger keert zich tegen hem. Kores neemt Ekbatana in, de koningsstad van de Meden.",
      550, "historisch", ["abc7"], ["kores"], "ekbatana",
      opmerking="Nabonidus-kroniek, zesde jaar van Nabonidus."),
    g("sardis", "Kores verovert Lydië",
      "Kores verslaat koning Croesus van Lydië en neemt diens hoofdstad Sardis in. Daarna onderwerpen zijn legers ook de Griekse steden aan de kust.",
      547, "benaderd", ["livius-sardes", "cahill-sardis", "herodotus"], ["kores"], "nt4_sardis", marge=[547, 540],
      opmerking="Het jaar staat niet vast. Een beschadigde regel in de Nabonidus-kroniek (547 v.Chr.) wordt vaak als “Lydië” gelezen, maar dat is onzeker; Griekse schrijvers rekenden 546. Sommige onderzoekers denken aan een later jaar, vóór de val van Babel."),
    g("val-babylon", "Babel valt",
      "Kores verslaat het leger van Babel bij Opis; kort daarna trekt zijn leger zonder strijd Babel binnen en wordt Nabonidus gevangengenomen. Volgens Daniël 5 werd koning Belsazar in die nacht gedood.",
      539, "historisch", ["abc7", "cyruscilinder", "Daniël 5:30"], ["kores", "nabonidus", "belsazar", "daniel", "darius-meder"], "babelst", belangrijk=True, stap="daniel:daniel:6",
      opmerking="Volgens de Nabonidus-kroniek trokken de troepen van Kores op de zestiende dag Babel binnen en kwam Kores zelf op 3 Arahsamnu (29 oktober 539 v.Chr.). Dat Belsazar in die nacht werd gedood, staat alleen in de Bijbel (Daniël 5:30)."),
    g("decreet-kores", "Kores laat de Joden teruggaan",
      "In zijn eerste jaar als koning over Babel laat Kores bekendmaken dat de Joden naar Jeruzalem mogen gaan om het huis van de HEERE te herbouwen. Hij geeft de tempelvaten mee terug.",
      538, "benaderd", ["Ezra 1:1–11", "2 Kronieken 36:22–23"], ["kores"], "babelst", verhaal="v76", belangrijk=True, stap="ezra:terugkeer:0", marge=[539, 538],
      opmerking="Het eerste jaar van Kores (Ezra 1:1) is volgens de gangbare omrekening 538 v.Chr. De Cyruscilinder (British Museum) vertelt dat Kores beelden van goden terugbracht naar hun steden en de inwoners liet terugkeren; Juda en Jeruzalem staan er niet in. De cilinder is dus niet dit bevel, maar laat wel zien hoe Kores zulke dingen deed."),
    g("leeuwenkuil", "Daniël in de leeuwenkuil",
      "Onder koning Darius de Meder wordt Daniël in de leeuwenkuil geworpen, omdat hij blijft bidden tot zijn God. God bewaart hem: de leeuwen doen hem niets.",
      538, "benaderd", ["Daniël 6"], ["daniel", "darius-meder"], "babelst", verhaal="v75", stap="daniel:daniel:7", marge=[539, 536],
      opmerking="Daniël 6 noemt geen jaar, alleen dat het onder Darius de Meder was, die het koninkrijk na Belsazar ontving (Daniël 6:1). Het jaartal is daarom een plaatsing bij benadering. Wie deze Darius was, is omstreden."),
    g("tempel-klaar", "De tempel is klaar",
      "In het zesde jaar van koning Darius is het huis van God in Jeruzalem herbouwd. Het volk viert de inwijding met vreugde.",
      515, "benaderd", ["Ezra 6:15–16"], ["darius-i"], "salem", verhaal="v76", stap="ezra:terugkeer:6", marge=[516, 515],
      opmerking="‘op den derden dag der maand Adar’ in het zesde jaar van Darius (Ezra 6:15). Als dat Darius I is, zoals algemeen wordt aangenomen, is het voorjaar 515 v.Chr.; sommigen rekenen 516."),
]

# ---------------------------------------------------------------- steden
STEDEN = [
    {"id": "babylon", "naam": "Babel", "plaatsId": "babelst", "tekst": "Hoofdstad van Nebukadnezar aan de Eufraat. Hierheen werden Daniël en later de ballingen uit Juda gebracht.", "bron": ["2 Koningen 24:15", "Daniël 1:1–6"]},
    {"id": "susa", "naam": "Susan (Susa)", "plaatsId": "susan", "tekst": "Stad in het landschap Elam. Daniël zag zich in een gezicht ‘in den burg Susan’ (Daniël 8:2); later woonden de Perzische koningen hier.", "bron": ["Daniël 8:2", "Nehemia 1:1"]},
    {"id": "ekbatana", "naam": "Ekbatana (Achmetha)", "plaatsId": "ekbatana", "tekst": "Koningsstad van de Meden; Kores nam haar in 550 v.Chr. in. Later vond men hier de rol met het bevel van Kores (Ezra 6:2–3).", "bron": ["abc7", "Ezra 6:2–3"]},
    {"id": "pasargadae", "naam": "Pasargadae", "plaatsId": None, "lat": 30.195, "lng": 53.174, "tekst": "De hoofdstad van Kores in Perzië. Ook zijn graf staat hier.", "bron": ["pleiades-pasargadae"]},
    {"id": "sardis", "naam": "Sardis", "plaatsId": "nt4_sardis", "tekst": "Hoofdstad van Lydië, waar koning Croesus regeerde. Kores nam de stad in, waarschijnlijk in 547 v.Chr.", "bron": ["cahill-sardis", "livius-sardes"]},
    {"id": "nineve", "naam": "Ninevé", "plaatsId": "ninivest", "tekst": "Hoofdstad van Assyrië aan de Tigris. In 612 v.Chr. verwoest door Babel en de Meden.", "bron": ["abc3"]},
    {"id": "harran", "naam": "Haran", "plaatsId": "haran", "tekst": "Hier hield het laatste Assyrische koninkrijk nog stand, tot Babel en de Meden de stad in 610/609 v.Chr. innamen.", "bron": ["abc3"]},
    {"id": "karkemis", "naam": "Karkemis", "plaatsId": "karkemis", "tekst": "Stad aan de Eufraat. In 605 v.Chr. versloeg Nebukadnezar hier het leger van Farao Necho (Jeremia 46:2).", "bron": ["abc5", "Jeremia 46:2"]},
    {"id": "jeruzalem", "naam": "Jeruzalem", "plaatsId": "salem", "tekst": "Stad van de tempel en de koningen van Juda. Ingenomen in 597 v.Chr., verwoest in 586 (of 587) v.Chr. en na de terugkeer weer opgebouwd.", "bron": ["abc5", "2 Koningen 25:9", "Ezra 6:15"]},
    {"id": "tyrus", "naam": "Tyrus", "plaatsId": "tyrus", "tekst": "Fenicische havenstad. Nebukadnezar belegerde haar lang (Ezechiël 29:18); volgens latere geschiedschrijvers dertien jaar.", "bron": ["Ezechiël 29:18", "livius-nebukadnezar"]},
    {"id": "memphis", "naam": "Nof (Memphis)", "plaatsId": "je_nof", "tekst": "Oude hoofdstad van Egypte aan de Nijl; ook hier woonden Joden (Jeremia 44:1). In 525 v.Chr. nam het leger van Cambyses de stad in.", "bron": ["Jeremia 44:1", "livius-cambyses"]},
    {"id": "sais", "naam": "Saïs", "plaatsId": None, "lat": 30.967, "lng": 30.774, "tekst": "Stad in de Nijldelta. De farao's van deze tijd (de 26e dynastie) regeerden vanuit Saïs.", "bron": ["pleiades-sais"]},
    {"id": "tayma", "naam": "Tayma", "plaatsId": None, "lat": 27.622, "lng": 38.55, "tekst": "Oase in Arabië. Koning Nabonidus woonde hier jarenlang, terwijl zijn zoon Belsazar in Babel regeerde.", "bron": ["abc7", "verse-account", "pleiades-tayma"]},
]

# ---------------------------------------------------------------- gebieden
B_RIJK = "Grenzen bij benadering: rijken hadden geen vaste grenzen zoals nu."
GEBIEDEN = [
    {"id": "babylonie", "naam": "Nieuw-Babylonische rijk", "kleur": "terra", "hoofdstad": "babylon",
     "bron": ["abc2", "abc3", "abc5", "abc7", "2 Koningen 24:7", "eigen-tekening"],
     "opmerking": B_RIJK + " Of het Assyrische kernland ten oosten van de Tigris na 612 bij Babel of bij de Meden hoorde, is niet goed bekend; het is hier opengelaten. Elam (Susa) is niet bij Babel getekend.",
     "sleutels": [
         sleutel(626, BAB_626, "Nabopolassar koning in Babel (ABC 2); de steden van Babylonië waren nog jaren betwist."),
         sleutel(616, BAB_616, "Heel Babylonië: in zijn tiende jaar trekt Nabopolassar de Eufraat op (ABC 3)."),
         sleutel(609, BAB_609, "Na Ninevé (612) en Haran (610/609) tot aan de Balich en de Taurus (ABC 3)."),
         sleutel(605, BAB_605, "Na Karkemis en Hamath (ABC 5)."),
         sleutel(604, BAB_604, "Heel “Hattu” tot aan de rivier van Egypte (ABC 5; 2 Koningen 24:7). Juda en de Fenicische steden zijn vazallen."),
         sleutel(553, BAB_604),
         sleutel(549, BAB_549, "Nabonidus in Tayma (ABC 7, zevende jaar)."),
         sleutel(539, BAB_549, "Laatste jaar: Kores neemt het rijk over."),
     ]},
    {"id": "assyrie", "naam": "Assyrië", "kleur": "grijs", "hoofdstad": "nineve", "bron": ["abc3", "eigen-tekening"],
     "opmerking": B_RIJK + " In 626 is alleen het kerngebied getekend; hoeveel gezag Assyrië toen nog in Syrië en Kanaän had, is onzeker.",
     "sleutels": [
         sleutel(626, ASS_626),
         sleutel(613, ASS_626),
         sleutel(612, ASS_612, "Na de val van Ninevé houdt Assur-uballit stand in Haran (ABC 3)."),
         sleutel(610, ASS_612, "Haran valt (ABC 3): daarna bestaat Assyrië niet meer."),
     ]},
    {"id": "medie", "naam": "Medië", "kleur": "olijf", "hoofdstad": "ekbatana", "bron": ["abc3", "abc7", "livius-cyaxares", "bmcr-media", "herodotus", "eigen-tekening"],
     "opmerking": B_RIJK + " Hoe groot het rijk van de Meden was, is onder onderzoekers omstreden; Herodotus noemt de rivier de Halys als grens met Lydië (1.72), maar dat is hier niet getekend. Getekend is alleen het kerngebied rond Ekbatana.",
     "sleutels": [sleutel(614, MEDIE, "De Meden nemen Assur in (ABC 3); eerder is hun rijk in de kronieken niet te volgen."), sleutel(550, MEDIE, "Kores neemt Ekbatana in (ABC 7).")]},
    {"id": "lydie", "naam": "Lydië", "kleur": "oker", "hoofdstad": "sardis", "bron": ["herodotus", "cahill-sardis", "livius-sardes", "eigen-tekening"],
     "opmerking": B_RIJK + " Onder Croesus alles ten westen van de Halys, behalve Lycië en Cilicië (Herodotus 1.28).",
     "sleutels": [sleutel(626, LYD_626, "Alleen het kernland rond Sardis."),
                  sleutel(560, LYD_560, "Onder Croesus (Herodotus 1.28)."),
                  sleutel(547, LYD_560, "Kores neemt Sardis in (jaartal onzeker).")]},
    {"id": "egypte", "naam": "Egypte", "kleur": "lila", "hoofdstad": "sais", "bron": ["2 Koningen 23:29–35", "2 Koningen 24:7", "Jeremia 46:2", "abc3", "abc5", "livius-cambyses", "pleiades-sais", "eigen-tekening"],
     "opmerking": B_RIJK + " Egypte onder de farao's van Saïs (26e dynastie): de Nijldelta en het Nijldal tot de eerste waterval bij Elephantine.",
     "sleutels": [sleutel(626, EGY), sleutel(610, EGY),
                  sleutel(609, EGY_609, "Farao Necho zet koningen van Juda af en aan (2 Koningen 23:33–35) en zijn leger staat bij Karkemis (Jeremia 46:2; ABC 3 en 5). Hoe ver zijn gezag werkelijk reikte, is onzeker."),
                  sleutel(606, EGY_609),
                  sleutel(605, EGY, "Na Karkemis trekt de koning van Egypte niet meer uit zijn land (2 Koningen 24:7)."),
                  sleutel(525, EGY, "Cambyses verovert Egypte.")]},
    {"id": "perzie", "naam": "Perzische rijk", "kleur": "kobalt", "hoofdstad": "pasargadae", "bron": ["abc7", "cyruscilinder", "behistun-lijst", "herodotus", "livius-cambyses", "eigen-tekening"],
     "opmerking": B_RIJK + " Het oosten (tot aan de Indus) is getekend volgens de landen die Darius I in 522 opsomt (Behistun); wanneer Kores die precies veroverde, is niet bekend.",
     "sleutels": [
         sleutel(559, PER_559, "Kores, koning van Ansan (Perzië)."),
         sleutel(553, PER_559),
         sleutel(550, PER_550, "Kores neemt Medië over (ABC 7)."),
         sleutel(548, PER_550),
         sleutel(547, PER_547, "Lydië, Cappadocië en Armenië (jaartal van Lydië onzeker)."),
         sleutel(540, PER_547),
         sleutel(539, PER_539, "Babel en heel zijn rijk, Elam en Assyrië (ABC 7; Cyruscilinder; Behistun)."),
         sleutel(530, PER_530, "Het oosten tot aan de Indus (Behistun, 522)."),
         sleutel(526, PER_530),
         sleutel(525, PER_525, "Egypte, veroverd door Cambyses."),
         sleutel(515, PER_525),
     ]},
    {"id": "juda", "naam": "Juda", "kleur": "koraal", "hoofdstad": "jeruzalem", "bron": ["2 Koningen 23–25", "bijbelreis-plaatsen", "eigen-tekening"],
     "opmerking": B_RIJK + " Het koninkrijk Juda, van Mizpa tot Berseba; vanaf 604 onderworpen aan Babel. De uitbreiding naar het noorden onder Josia (2 Koningen 23:15–19) is niet getekend.",
     "sleutels": [sleutel(626, JUDA), sleutel(586, JUDA, "Jeruzalem verwoest: einde van het koninkrijk Juda (586 of 587).")]},
]

KOPPELINGEN = [
    {"verhaal": "v71", "jaar": 586, "tot": None, "status": "benaderd", "personen": ["jeremia", "zedekia", "nebukadnezar", "jojachin"], "gebeurtenissen": ["verwoesting-jeruzalem", "dood-nebukadnezar"]},
    {"verhaal": "v73", "jaar": 605, "tot": 603, "status": "benaderd", "personen": ["daniel", "nebukadnezar", "jojakim"], "gebeurtenissen": ["karkemis", "daniel-weggevoerd"],
     "opmerking": "Daniël 1 begint in het derde jaar van Jojakim; Daniël 2 speelt in het tweede jaar van Nebukadnezar (Daniël 2:1), ongeveer 603 v.Chr."},
    {"verhaal": "v74", "jaar": 603, "tot": 562, "status": "benaderd", "personen": ["nebukadnezar", "daniel"], "gebeurtenissen": [],
     "opmerking": "Daniël 3 noemt geen jaar: het was ergens in de regering van Nebukadnezar, na Daniël 2. De kaart toont daarom de hele tijd van Nebukadnezar."},
    {"verhaal": "v75", "jaar": 539, "tot": 538, "status": "benaderd", "personen": ["daniel", "darius-meder", "kores"], "gebeurtenissen": ["val-babylon", "leeuwenkuil"]},
    {"verhaal": "v76", "jaar": 538, "tot": 515, "status": "benaderd", "personen": ["kores", "darius-i"], "gebeurtenissen": ["decreet-kores", "tempel-klaar"]},
]


def bouw():
    plaatsen = laad_plaatsen()
    steden = []
    for s in STEDEN:
        s = dict(s)
        if s["plaatsId"]:
            lat, lng = plaatsen[s["plaatsId"]]
            s["lat"], s["lng"] = lat, lng
        steden.append({k: s[k] for k in ("id", "naam", "plaatsId", "lat", "lng", "tekst", "bron")})
    return {
        "id": "daniel-babylon",
        "titel": "Daniël en Babylon",
        "ondertitel": "Van Babel naar Perzië: de wereld van Daniël, 627–515 v.Chr.",
        "as": {"soort": "vchr", "van": 627, "tot": 515, "stap": 1, "label": "jaar voor Christus"},
        "start": 605,
        "bronnen": BRONNEN,
        "personen": PERSONEN,
        "gebeurtenissen": GEBEURTENISSEN,
        "gebieden": GEBIEDEN,
        "steden": steden,
        "koppelingen": KOPPELINGEN,
    }


def laad_plaatsen():
    """Leest lat/lng van de genoemde plaatsen uit public/bijbelreis/plaatsen.js (die blijven de bron)."""
    import re
    tekst = open(os.path.join(HIER, "..", "public", "bijbelreis", "plaatsen.js"), encoding="utf-8").read()
    uit = {}
    for m in re.finditer(r"^\s{2}([a-z0-9_]+): \{ n: \"[^\"]*\", ll: \[([\d.\-]+), ([\d.\-]+)\]", tekst, re.M):
        uit[m.group(1)] = (float(m.group(2)), float(m.group(3)))
    return uit


def compact(tekst):
    """Lijsten van alleen getallen (en lijsten daarvan) op één regel: het bestand blijft leesbaar en klein."""
    import re
    getal = r"-?\d+(?:\.\d+)?"
    tekst = re.sub(r"\[\s*(" + getal + r"(?:,\s*" + getal + r")*)\s*\]", lambda m: "[" + re.sub(r",\s*", ",", m.group(1)) + "]", tekst)
    paar = r"\[" + getal + "," + getal + r"\]"
    tekst = re.sub(r"\[\s*(" + paar + r"(?:,\s*" + paar + r")*)\s*\]", lambda m: "[" + re.sub(r",\s*\[", ",[", m.group(1)) + "]", tekst)
    tekst = re.sub(r"\[\s*(\[" + paar + r".*?\])\s*\]", lambda m: "[" + m.group(1) + "]", tekst)
    return tekst


def main():
    data = bouw()
    tekst = compact(json.dumps(data, ensure_ascii=False, indent=1)) + "\n"
    if "--controle" in sys.argv:
        oud = open(UIT, encoding="utf-8").read()
        if oud != tekst:
            raise SystemExit("daniel-babylon.json wijkt af van wat het script bouwt")
        print("ok: daniel-babylon.json is gelijk aan de bouw")
        return
    os.makedirs(os.path.dirname(UIT), exist_ok=True)
    open(UIT, "w", encoding="utf-8").write(tekst)
    n = sum(len(s["geometrie"]["coordinates"][0]) for gb in data["gebieden"] for s in gb["sleutels"])
    print(f"geschreven: {os.path.relpath(UIT)} ({len(tekst) // 1024} kB, {len(data['gebieden'])} gebieden, "
          f"{sum(len(gb['sleutels']) for gb in data['gebieden'])} sleutels, {n} punten)")


if __name__ == "__main__":
    main()
