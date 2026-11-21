#!/usr/bin/env python3
"""Bouwt twee perioden voor de laag ‘De wereld in die tijd’ (docs/bijbelreis-wereld/README.md):

  public/bijbelreis/wereld/perioden/david-salomo.json    David en Salomo tussen de buurvolken (ca. 1050–920 v.Chr.)
  public/bijbelreis/wereld/perioden/israel-assyrie.json  Israël, Juda en Assyrië (ca. 880–681 v.Chr.)

Gebruik: python3 scripts/bijbelreis-wereld-koningen.py            (schrijft beide JSON-bestanden)
         python3 scripts/bijbelreis-wereld-koningen.py --controle (schrijft niets; faalt als een bestand afwijkt)

Werkwijze zoals bij Daniël (scripts/bijbelreis-wereld-daniel.py): de grenzen zijn eigen, grove tekeningen langs
kusten, rivieren (Jordaan, Orontes, Eufraat, Tigris), gebergten en woestijnranden; er is geen kaart en geen
grensdataset overgenomen. Een rijk bestaat uit bouwstenen, zodat bijvoorbeeld Israël, Gilead en Aram in elk
sleuteljaar precies op elkaar aansluiten. Shapely voegt bouwstenen samen; daarna afronden op 0,05 graad en controle op
geldige ringen. Coördinaten: [lengte, breedte] (WGS84). Jaartallen v.Chr. volgen de keuzes van de Bijbelreis
(public/bijbelreis/dateringen.js, docs/bijbelreis-audit/dateringen.md: Thiele/gangbare reconstructie).
Verantwoording: docs/bijbelreis-wereld/david-salomo-bronnen.md en israel-assyrie-bronnen.md.
"""
import json
import os
import re
import sys

from shapely.geometry import MultiPolygon, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

HIER = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HIER, "..", "public", "bijbelreis", "wereld", "perioden")
RASTER = 20  # 1/20 graad = 0,05


def P(*punten):
    return Polygon(punten)


# ================================================================ bouwstenen (lng, lat)
# --- Het land van Israël, ten westen van de Jordaan: van Dan en Ijon in het noorden tot de grens met Juda (bij Bethel,
# dat bij Israël hoorde). Westkant: de kust van Joppe tot de Karmel en Akzib. Oostkant: de bovenloop van de Jordaan, het
# meer van Galilea en de Jordaan tot de Dode Zee.
ISRAEL_WEST = P((35.1, 33.05), (35.35, 33.15), (35.5, 33.4), (35.7, 33.42), (35.72, 33.2), (35.68, 33.0), (35.6, 32.85),
                (35.57, 32.65), (35.57, 32.3), (35.53, 31.8), (35.45, 31.9), (35.25, 31.9), (35.05, 31.9), (34.8, 32.0),
                (34.7, 32.0), (34.8, 32.35), (34.88, 32.6), (34.95, 32.85), (35.05, 32.95))
# Gilead: ten oosten van de Jordaan, van de Jarmuk tot ten noorden van de Dode Zee (Rabba van Ammon ligt erbuiten).
GILEAD = P((35.57, 32.65), (35.95, 32.65), (35.95, 32.45), (35.95, 32.2), (35.85, 31.8), (35.53, 31.8), (35.57, 32.3))
# Israël na 732 (2 Koningen 15:29): alleen het bergland rond Samaria; Galilea en de vlakte van Jizreël worden Assyrisch.
ISRAEL_732 = P((34.88, 32.5), (35.1, 32.5), (35.57, 32.4), (35.57, 32.3), (35.53, 31.8), (35.45, 31.9), (35.25, 31.9),
               (35.05, 31.9), (34.8, 32.0), (34.7, 32.0), (34.8, 32.35))
GALILEA_732 = ISRAEL_WEST.difference(ISRAEL_732)
# Benjamin: de strook tussen Bethel en Jeruzalem (Gibea, Rama, Mizpa); Jeruzalem zelf (de burg van de Jebusieten) erbuiten.
BENJAMIN = P((34.95, 31.9), (35.05, 31.9), (35.25, 31.9), (35.45, 31.9), (35.53, 31.8), (35.3, 31.8), (35.05, 31.8))

# --- Juda: het bergland van Juda met de Sefela en de Negev, van Mizpa tot Berseba. In de tijd van de koningen (Assyrië)
# hoort Lachis erbij; in de tijd van David ligt de westgrens oostelijker, omdat Gath en Ekron Filistijns zijn.
JUDA_K = P((34.75, 31.85), (35.05, 31.9), (35.25, 31.9), (35.45, 31.9), (35.53, 31.8), (35.45, 31.45), (35.4, 31.15),
           (35.3, 30.95), (34.95, 30.85), (34.7, 31.1), (34.7, 31.45), (34.75, 31.65))
JUDA_D = P((34.95, 31.9), (35.05, 31.9), (35.25, 31.9), (35.45, 31.9), (35.53, 31.8), (35.45, 31.45), (35.4, 31.15),
           (35.3, 30.95), (34.95, 30.85), (34.7, 31.15), (34.7, 31.4), (34.95, 31.6), (34.95, 31.8))
JUDA_HEBRON = JUDA_D.difference(BENJAMIN)

# --- Fenicië: de kuststrook van Akzib tot Tripoli, tot de kam van de Libanon (Tyrus, Sidon, Zarfath, Byblos).
FENICIE = P((35.1, 33.05), (35.35, 33.15), (35.5, 33.4), (35.75, 33.65), (35.95, 34.05), (36.05, 34.4), (35.8, 34.45),
            (35.58, 34.15), (35.42, 33.9), (35.28, 33.58), (35.12, 33.27), (35.05, 33.1))
# --- Aram (Syrië) rond Damascus in de 9e en 8e eeuw: met de Bekaa, Basan en de streek van Ramoth in Gilead
# (1 Koningen 22:3); de noordgrens tegen Hamath.
ARAM = P((35.57, 32.65), (35.6, 32.85), (35.68, 33.0), (35.72, 33.2), (35.7, 33.42), (35.75, 33.65), (35.95, 34.05),
         (36.05, 34.4), (36.6, 34.45), (37.3, 34.2), (37.1, 33.3), (36.8, 32.75), (36.6, 32.5), (36.15, 32.35),
         (35.95, 32.45), (35.95, 32.65))
# --- Aram-Zoba in de tijd van David: de Bekaa en de streek van Homs, met Damascus (2 Samuël 8:3–6); zonder Hamath.
ARAM_ZOBA = P((35.6, 32.85), (35.68, 33.0), (35.72, 33.2), (35.7, 33.42), (35.75, 33.65), (35.95, 34.05), (36.05, 34.4),
              (36.4, 34.75), (37.0, 34.9), (37.6, 34.6), (37.3, 33.6), (36.9, 33.0), (36.4, 32.85), (35.95, 32.75))
# --- Hamath aan de Orontes (tot 720 een eigen koninkrijk).
# Qarqar (Tell Qarqur) aan de Orontes hoort erbij: daar vocht Sargon II in 720 tegen de koning van Hamath.
HAMATH = P((36.05, 34.4), (36.6, 34.45), (37.3, 34.2), (38.1, 34.9), (38.6, 35.6), (39.0, 35.85), (38.15, 36.2),
           (37.6, 35.8), (37.2, 35.85), (36.6, 35.95), (36.2, 35.8), (36.2, 35.4), (36.15, 34.9))
# --- Filistea: de kustvlakte van Gaza tot ten noorden van Asdod, met Gath en Ekron.
FILISTEA = P((34.25, 31.3), (34.5, 31.25), (34.7, 31.4), (34.95, 31.6), (34.95, 31.8), (34.95, 31.9), (34.68, 32.0),
             (34.6, 31.8), (34.5, 31.65), (34.4, 31.5))
# --- Moab (ten oosten van de Dode Zee), Ammon (rond Rabba), Edom (ten zuiden van de beek Zered, aan beide kanten van de
# Araba, tot aan Eloth en Ezeon-Geber, 1 Koningen 9:26).
MOAB = P((35.57, 31.78), (35.85, 31.8), (36.1, 31.6), (36.05, 31.1), (35.7, 30.98), (35.5, 31.05), (35.55, 31.35), (35.6, 31.6))
AMMON = P((35.85, 31.8), (35.95, 32.2), (36.1, 32.3), (36.35, 32.2), (36.4, 31.85), (36.1, 31.6))
EDOM = P((35.5, 31.05), (35.7, 30.98), (36.05, 30.95), (35.95, 30.3), (35.6, 29.8), (35.1, 29.45), (34.9, 29.6),
         (35.15, 30.3), (35.3, 30.75))
# --- Egypte, alleen het noorden (de Nijldelta en het Nijldal tot de Fajoem): als rand van de kaart. Egypte liep verder
# naar het zuiden langs de Nijl; dat deel is weggelaten, zodat de kaart op het land van de Bijbel blijft.
EGYPTE_NOORD = P((32.55, 31.05), (32.2, 30.5), (31.6, 30.1), (31.4, 29.6), (31.25, 29.2), (30.6, 29.2), (30.3, 29.3),
                 (30.5, 29.6), (30.7, 30.0), (30.2, 30.6), (29.8, 30.9), (29.9, 31.2), (30.6, 31.5), (31.4, 31.55))

# --- Assyrië.
# 880: het kernland aan de Tigris (Assur, Kalhu, Ninevé) en de Jezira tot de rivier de Chabur.
ASS_880 = P((40.1, 36.95), (40.3, 36.0), (40.45, 35.15), (42.0, 35.0), (43.4, 34.9), (44.3, 35.3), (45.0, 35.8),
            (44.6, 36.6), (43.8, 37.2), (42.4, 37.4), (41.2, 37.3))
# 856: tot aan de Eufraat, met Haran en Til Barsip (Bit-Adini), maar zonder Karkemis.
ASS_856 = P((38.6, 37.35), (38.05, 36.7), (38.15, 36.2), (39.0, 35.85), (39.9, 35.5), (40.45, 35.15), (42.0, 35.0),
            (43.4, 34.9), (44.3, 35.3), (45.0, 35.8), (44.6, 36.6), (43.8, 37.2), (42.4, 37.4), (41.2, 37.3), (40.0, 37.35))
# 740–738: Noord-Syrië met Arpad en de kust van Syrië tot Simirra (de provincies van Tiglath-pilezer III); niet Hamath
# en het dal van de Orontes (met Qarqar), dat tot 720 bij Hamath hoorde.
NW_SYRIE = P((38.05, 36.7), (37.5, 36.75), (36.7, 36.95), (36.3, 36.7), (36.1, 36.2), (35.75, 35.55), (35.85, 35.2),
             (35.85, 34.85), (35.8, 34.45), (36.05, 34.4), (36.15, 34.9), (36.2, 35.4), (36.2, 35.8), (36.6, 35.95),
             (37.2, 35.85), (37.6, 35.8), (38.15, 36.2))

ASS_738 = [ASS_856, NW_SYRIE]
ASS_732 = ASS_738 + [ARAM, GILEAD, GALILEA_732]
ASS_722 = ASS_732 + [ISRAEL_732]
ASS_720 = ASS_722 + [HAMATH]


# ================================================================ geometrie naar GeoJSON
def rond(x):
    return round(round(x * RASTER) / RASTER, 2)


def ring_van(poly):
    poly = poly.simplify(0.04, preserve_topology=True)
    poly = orient(Polygon(poly.exterior), sign=1.0)  # buitenring tegen de klok in (RFC 7946); gaten bestaan niet
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


def geometrie(delen):
    if isinstance(delen, Polygon):
        delen = [delen]
    g = unary_union([d.buffer(0) for d in delen])
    if g.geom_type == "Polygon":
        return {"type": "Polygon", "coordinates": [ring_van(g)]}
    if g.geom_type == "MultiPolygon":
        # Twee losse delen (bijv. Assyrië in 732: het noorden, en Damascus met Galilea en Gilead, met Hamath ertussen).
        delen = sorted((p for p in g.geoms if p.area > 0.01), key=lambda p: -p.area)
        if len(delen) == 1:
            return {"type": "Polygon", "coordinates": [ring_van(delen[0])]}
        return {"type": "MultiPolygon", "coordinates": [[ring_van(p)] for p in delen]}
    raise SystemExit(f"bouwstenen vormen geen gebied: {g.geom_type}")


def sleutel(jaar, delen, opmerking=None):
    s = {"jaar": jaar, "betrouwbaarheid": "benaderd", "geometrie": geometrie(delen)}
    if opmerking:
        s["opmerking"] = opmerking
    return s


def d(jaar, status, bron, **extra):
    """Een gedateerd gegeven: jaar op de as (v.Chr.), status, bron (Bijbelverwijzing of bron-id), eventueel marge/opmerking."""
    x = {"jaar": jaar, "status": status, "bron": bron}
    x.update(extra)
    return x


def g(id, titel, tekst, jaar, status, bron, personen, plaats, verhaal=None, belangrijk=False, tot=None, **extra):
    x = {"id": id, "titel": titel, "tekst": tekst, "jaar": jaar, "tot": tot, "status": status, "bron": bron,
         "personen": personen, "plaats": plaats, "verhaal": verhaal, "belangrijk": belangrijk}
    x.update(extra)
    return x


def persoon(id, naam, personenId, lijn, van, tot, rol, ref, gebeurtenissen, verhaal, ouder=None, alt=None, **extra):
    x = {"id": id, "naam": naam, "alt": alt or [], "personenId": personenId, "lijn": lijn, "van": van, "tot": tot,
         "ouder": ouder, "rol": rol, "ref": ref, "gebeurtenissen": gebeurtenissen, "verhaal": verhaal}
    x.update(extra)
    return x


B_RIJK = "Grenzen bij benadering: rijken en volken hadden geen vaste grenzen zoals nu."
G = "2026-11-17"
SV = "Statenvertaling (1637), publiek domein; gecontroleerd met data/statenvertaling en scripts/bijbel-check.py"
WIKI = "CC BY-SA 4.0 (Wikipedia); alleen feiten gebruikt, in eigen woorden"
PLEIADES = "CC BY 3.0 (naamsvermelding: Pleiades)"
EIGEN = {"id": "eigen-tekening", "soort": "dataset", "titel": "Grenzen: eigen grove tekening langs kusten, rivieren, gebergten en woestijnranden (scripts/bijbelreis-wereld-koningen.py)", "url": None, "licentie": "eigen werk; geen kaart of grensdataset overgenomen", "geraadpleegd": G}
PLAATSEN = {"id": "bijbelreis-plaatsen", "soort": "dataset", "titel": "Bijbelreis plaatsen.js (ligging gecontroleerd met OpenBible.info CC BY 4.0 en Pleiades CC BY)", "url": None, "licentie": "eigen gegevens Bijbelreis; zie docs/bijbelreis-audit/plaatsen.md", "geraadpleegd": G}
DATERINGEN = {"id": "bijbelreis-dateringen", "soort": "historisch", "titel": "Bijbelreis: jaartallen en hun grond (docs/bijbelreis-audit/dateringen.md, public/bijbelreis/dateringen.js): de gangbare koningschronologie (Thiele) als ijkpunt", "url": None, "licentie": "eigen gegevens Bijbelreis", "geraadpleegd": G}
THIELE = {"id": "thiele", "soort": "historisch", "titel": "E. R. Thiele, The Mysterious Numbers of the Hebrew Kings (samenvatting en tabel, Wikipedia, Engels)", "url": "https://en.wikipedia.org/wiki/The_Mysterious_Numbers_of_the_Hebrew_Kings", "licentie": WIKI, "geraadpleegd": G}


# ================================================================ periode 1: David en Salomo
DS_BRONNEN = [
    {"id": "sv", "soort": "bijbel", "titel": "Statenvertaling: 1 Samuël 10–31, 2 Samuël, 1 Koningen 1–14, Handelingen 13:21", "url": None, "licentie": SV, "geraadpleegd": G},
    DATERINGEN, THIELE,
    {"id": "verenigd-koninkrijk", "soort": "historisch", "titel": "Kingdom of Israel (united monarchy) (Wikipedia, Engels): gangbare jaartallen en de discussie onder onderzoekers", "url": "https://en.wikipedia.org/wiki/Kingdom_of_Israel_(united_monarchy)", "licentie": WIKI, "geraadpleegd": G},
    {"id": "sjosjenk", "soort": "historisch", "titel": "Shoshenq I (Wikipedia, Engels): regering, de lijst van Karnak (Bubastitische poort), de vergelijking met Sisak", "url": "https://en.wikipedia.org/wiki/Shoshenq_I", "licentie": WIKI, "geraadpleegd": G},
    {"id": "tel-dan", "soort": "historisch", "titel": "Tel Dan stele (Wikipedia, Engels): “huis van David”, 9e eeuw v.Chr., Israel Museum", "url": "https://en.wikipedia.org/wiki/Tel_Dan_stele", "licentie": WIKI, "geraadpleegd": G},
    {"id": "hiram", "soort": "historisch", "titel": "Hiram I (Wikipedia, Engels): regering volgens Josephus (Tegen Apion 1.17–18, naar Menander van Efeze)", "url": "https://en.wikipedia.org/wiki/Hiram_I", "licentie": WIKI, "geraadpleegd": G},
    PLAATSEN, EIGEN,
]

DS_INFO = [
    {"kop": "Hoe weten we deze jaren?",
     "tekst": "De Bijbel zegt hoe lang Saul, David en Salomo koning waren: elk veertig jaar. Teruggerekend vanaf de scheuring van het rijk, rond 930 v.Chr., kom je voor David op ongeveer 1010–970 v.Chr. Dat is een reconstructie: andere schema’s schuiven deze jaren enkele jaren, sommige enkele tientallen jaren op.",
     "status": "benaderd", "bron": ["2 Samuël 5:4–5", "1 Koningen 11:42", "Handelingen 13:21", "bijbelreis-dateringen", "verenigd-koninkrijk"]},
    {"kop": "Een steen met “huis van David”",
     "tekst": "In Dan vonden archeologen in 1993 en 1994 stukken van een stenen gedenkteken uit de 9e eeuw v.Chr., ruim honderd jaar na David. Volgens de meeste onderzoekers staat erop “huis van David”: zo heette het koningshuis van Juda toen. Het is de oudste bekende vermelding van David buiten de Bijbel; over de lezing wordt nog gediscussieerd.",
     "status": "historisch", "bron": ["tel-dan"]},
    {"kop": "Hoe groot was het rijk?",
     "tekst": "De Bijbel vertelt dat David de buurvolken versloeg en dat zij geschenken brachten. Hoe ver dat gezag reikte, is niet als lijn te tekenen. Onder onderzoekers is de omvang van het rijk van David en Salomo een punt van discussie. Daarom zijn alle grenzen op deze kaart bij benadering.",
     "status": "benaderd", "bron": ["2 Samuël 8:1–14", "1 Koningen 4:21", "verenigd-koninkrijk", "eigen-tekening"]},
]

DS_PERSONEN = [
    persoon("samuel", "Samuël", "samuel", "profeet",
            d(1100, "benaderd", ["1 Samuël 3:19–20", "bijbelreis-dateringen"], begin="roeping", opmerking="De Bijbelreis zet zijn roeping in Silo ruwweg rond 1100 v.Chr.; dat is een ruwe schatting. De lijn begint vóór deze tijdlijn."),
            d(1015, "benaderd", "1 Samuël 25:1", einde="stierf", marge=[1020, 1010], opmerking="‘En Samuël stierf’ (1 Samuël 25:1), toen David voor Saul op de vlucht was. Het jaar staat er niet; omgerekend tussen ongeveer 1020 en 1010 v.Chr."),
            "Profeet en richter; zalfde Saul en later David", ["1 Samuël 3:19–21", "1 Samuël 10:1", "1 Samuël 16:13", "1 Samuël 25:1"], ["saul-koning"], "v50"),
    persoon("saul", "Saul", "saul", "regering",
            d(1050, "benaderd", ["Handelingen 13:21", "bijbelreis-dateringen"], begin="regering", opmerking="Saul was veertig jaar koning (Handelingen 13:21). Teruggerekend vanaf ca. 1010 v.Chr. begon hij rond 1050 v.Chr."),
            d(1010, "benaderd", ["1 Samuël 31:6", "bijbelreis-dateringen"], einde="stierf", opmerking="Hij sneuvelde op de Gilboa, vlak voordat David koning werd (gangbare reconstructie: ca. 1010 v.Chr.)."),
            "De eerste koning van Israël", ["1 Samuël 10:1", "1 Samuël 31:1–6", "Handelingen 13:21"], ["saul-koning", "dood-saul"], "v55"),
    persoon("david", "David", "david", "leven",
            d(1040, "benaderd", ["2 Samuël 5:4", "bijbelreis-dateringen"], begin="geboorte", opmerking="‘Dertig jaar was David oud, als hij koning werd’ (2 Samuël 5:4). Met koning worden rond 1010 v.Chr. komt zijn geboorte omgerekend rond 1040 v.Chr. De Bijbel noemt geen geboortejaar."),
            d(970, "benaderd", ["2 Samuël 5:4–5", "1 Koningen 2:10–11"], einde="stierf", leeftijd=70, leeftijdStatus="berekend",
              opmerking="Hij regeerde veertig jaar: zeven jaar en zes maanden in Hebron en drieëndertig in Jeruzalem (2 Samuël 5:5). Zo werd hij ongeveer zeventig jaar."),
            "Herder uit Bethlehem, koning over Juda en daarna over heel Israël", ["1 Samuël 16:13", "2 Samuël 5:1–12", "1 Koningen 2:10–11"],
            ["goliath", "dood-saul", "david-hebron", "jeruzalem", "buurvolken", "salomo-koning"], "v56"),
    persoon("nathan", "Nathan", "nathan", "profeet",
            d(1003, "benaderd", ["2 Samuël 7:2–4", "bijbelreis-dateringen"], begin="genoemd", opmerking="Hij wordt voor het eerst genoemd als David in Jeruzalem woont (2 Samuël 7:2). Wanneer hij geboren werd of profeet werd, staat er niet; de lijn begint daarom bij de eerste vermelding."),
            d(970, "benaderd", "1 Koningen 1:32–38", einde="onbekend", opmerking="Hij wordt het laatst genoemd bij de zalving van Salomo (1 Koningen 1). Wanneer hij stierf, staat er niet."),
            "Profeet bij koning David; bracht Gods belofte en wees David terecht", ["2 Samuël 7:1–17", "2 Samuël 12:1–14", "1 Koningen 1:11–45"], ["salomo-koning"], "v57"),
    persoon("hiram", "Hiram", "hiram", "regering",
            d(980, "benaderd", ["hiram", "2 Samuël 5:11"], begin="regering", opmerking="Volgens Josephus (naar Menander) regeerde Hiram 34 jaar; onderzoekers rekenen dat om naar ongeveer 980–947 v.Chr. 2 Samuël 5:11 noemt Hiram al bij David, kort na de verovering van Jeruzalem. Dat past niet goed bij een begin rond 980; hoe dat zit, is onzeker."),
            d(947, "benaderd", "hiram", einde="stierf", marge=[947, 946]),
            "Koning van Tyrus; leverde cederhout en vaklieden voor David en Salomo", ["2 Samuël 5:11", "1 Koningen 5:1–12", "1 Koningen 9:10–14"], ["tempel"], "v61",
            opmerking="Hij staat in de Bijbel én in de geschiedenis van Tyrus die Josephus overneemt."),
    persoon("salomo", "Salomo", "salomo", "regering",
            d(970, "benaderd", ["1 Koningen 1:39", "1 Koningen 2:12", "bijbelreis-dateringen"], begin="regering"),
            d(930, "benaderd", ["1 Koningen 11:42–43", "thiele"], einde="stierf", marge=[931, 930], opmerking="Hij regeerde veertig jaar (1 Koningen 11:42). Het einde volgt uit de gangbare reconstructie: de scheuring van het rijk in 931/930 v.Chr."),
            "Zoon van David; bouwde de tempel in Jeruzalem", ["1 Koningen 1–11"], ["salomo-koning", "tempel"], "v60", ouder="david"),
    persoon("rehabeam", "Rehabeam", "rehabeam", "leven",
            d(971, "benaderd", ["1 Koningen 14:21"], begin="geboorte", opmerking="‘Een en veertig jaren was Rehabeam oud, als hij koning werd’ (1 Koningen 14:21). Teruggerekend vanaf 930 v.Chr. werd hij rond 971 v.Chr. geboren, nog in de tijd van David. De Bijbel noemt geen geboortejaar."),
            d(913, "benaderd", ["1 Koningen 14:21", "thiele"], einde="stierf", leeftijd=58, leeftijdStatus="berekend", opmerking="Hij regeerde zeventien jaar (1 Koningen 14:21), tot ongeveer 913 v.Chr.: na het einde van deze tijdlijn."),
            "Zoon van Salomo; na de scheuring koning over Juda", ["1 Koningen 12:1–24", "1 Koningen 14:21–31"], ["scheuring", "sisak-jeruzalem"], "v62", ouder="salomo"),
    persoon("jerobeam", "Jerobeam", "jerobeam_1", "regering",
            d(930, "benaderd", ["1 Koningen 12:20", "thiele"], begin="regering", marge=[931, 930], opmerking="Eerder was hij voor Salomo gevlucht naar Egypte, naar Sisak (1 Koningen 11:40)."),
            d(909, "benaderd", ["1 Koningen 14:20", "thiele"], einde="stierf", opmerking="Hij regeerde tweeëntwintig jaar (1 Koningen 14:20), tot ongeveer 910/909 v.Chr.: na het einde van deze tijdlijn."),
            "Koning over de tien stammen van Israël na de scheuring", ["1 Koningen 11:26–40", "1 Koningen 12:20–33", "1 Koningen 14:20"], ["scheuring"], "v62"),
    persoon("sisak", "Sisak", "sisak", "regering",
            d(943, "benaderd", "sjosjenk", begin="regering", opmerking="Farao Sjosjenk I, de eerste koning van de 22e dynastie. De jaartallen van Egypte in deze tijd zijn niet precies: ook 945–924 v.Chr. komt voor."),
            d(922, "benaderd", "sjosjenk", einde="stierf"),
            "Koning van Egypte; Jerobeam vluchtte naar hem, later trok hij op tegen Jeruzalem", ["1 Koningen 11:40", "1 Koningen 14:25–26"], ["sisak-jeruzalem"], "v62", alt=["Sjosjenk I", "Shoshenq I"],
            opmerking="Dat Sisak dezelfde is als farao Sjosjenk I, is de gangbare opvatting, maar niet onomstreden."),
]

DS_GEBEURTENISSEN = [
    g("saul-koning", "Saul wordt koning",
      "Het volk wil een koning, zoals alle volken om hen heen. Samuël zalft Saul uit de stam Benjamin tot de eerste koning van Israël.",
      1050, "benaderd", ["1 Samuël 10:1", "1 Samuël 10:17–24", "Handelingen 13:21"], ["samuel", "saul"], "mizpa", verhaal="v50", stap="1samuel:samuel:6",
      opmerking="Teruggerekend met de veertig jaar van Saul (Handelingen 13:21) vanaf ca. 1010 v.Chr. Andere dateringen schuiven dit enkele tientallen jaren op."),
    g("goliath", "David verslaat Goliath",
      "In het Eikdal staan Israël en de Filistijnen tegenover elkaar. De jonge David verslaat de reus Goliath uit Gath.",
      1025, "benaderd", ["1 Samuël 17:2", "1 Samuël 17:4", "1 Samuël 17:50"], ["david", "saul"], "elah", verhaal="v52", stap="1samuel:saul-david:4",
      opmerking="De Bijbel noemt geen jaar; David was nog een jongeman (1 Samuël 17:33). Het jaartal volgt de Bijbelreis (ca. 1025 v.Chr., onzeker)."),
    g("dood-saul", "Saul sterft op de Gilboa",
      "De Filistijnen verslaan Israël op het gebergte Gilboa. Saul en drie van zijn zonen, onder wie Jonathan, sneuvelen.",
      1010, "benaderd", ["1 Samuël 31:1–6", "bijbelreis-dateringen"], ["saul", "david"], "gilboa", verhaal="v55", belangrijk=True, stap="1samuel:saul-david:10",
      opmerking="In de gangbare reconstructie ca. 1010 v.Chr., vlak voordat David koning werd. Daarna woonden de Filistijnen in steden van Israël (1 Samuël 31:7)."),
    g("david-hebron", "David koning in Hebron",
      "De mannen van Juda zalven David in Hebron tot koning over Juda. Over de andere stammen regeert Isboseth, een zoon van Saul.",
      1010, "benaderd", ["2 Samuël 2:4", "2 Samuël 2:10–11"], ["david"], "mamre", verhaal="v56", stap="2samuel:david:1",
      opmerking="David regeerde zeven jaar en zes maanden in Hebron (2 Samuël 2:11); omgerekend ca. 1010–1003 v.Chr."),
    g("jeruzalem", "David koning over heel Israël",
      "Alle stammen zalven David tot koning. Hij neemt de burg Sion in en Jeruzalem wordt ‘de stad Davids’ (2 Samuël 5:7).",
      1003, "benaderd", ["2 Samuël 5:3–9", "bijbelreis-dateringen"], ["david"], "salem", verhaal="v56", belangrijk=True, stap="2samuel:david:3",
      opmerking="Na zeven jaar en zes maanden in Hebron (2 Samuël 5:5): omgerekend ca. 1003 v.Chr."),
    g("buurvolken", "David verslaat de buurvolken",
      "David verslaat de Filistijnen, Moab, de Syriërs van Zoba en Damascus, Edom en Ammon. Zij moeten hem geschenken brengen.",
      990, "expliciet", ["2 Samuël 8:1–14", "2 Samuël 10:1–19", "2 Samuël 12:26–31"], ["david"], "dr_zoba", marge=[1003, 970],
      opmerking="De Bijbel noemt geen jaren voor deze oorlogen, alleen dat ze in de tijd van David in Jeruzalem waren. Het jaartal 990 is een plaatsing: de oorlog met Ammon viel in de tijd van David en Bathseba, die de Bijbelreis rond 1000–990 v.Chr. zet."),
    g("salomo-koning", "Salomo wordt koning",
      "Op bevel van de oude koning David wordt Salomo bij de Gihon tot koning gezalfd. Kort daarna sterft David.",
      970, "benaderd", ["1 Koningen 1:32–40", "1 Koningen 2:10–12"], ["salomo", "david", "nathan"], "salem", verhaal="v60", stap="1koningen:salomo:0",
      opmerking="In de gangbare reconstructie ca. 970 v.Chr.: veertig jaar vóór de scheuring (1 Koningen 11:42)."),
    g("tempel", "Salomo bouwt de tempel",
      "In het vierde jaar van zijn regering begint Salomo met de bouw van het huis van de HEERE. Hiram van Tyrus levert cederhout; na zeven jaar is de tempel klaar.",
      966, "benaderd", ["1 Koningen 6:1", "1 Koningen 6:37–38", "1 Koningen 5:1–10"], ["salomo", "hiram"], "salem", verhaal="v61", belangrijk=True, tot=959, stap="1koningen:salomo:4",
      opmerking="Van het vierde tot het elfde jaar van Salomo (1 Koningen 6:37–38); in de gangbare reconstructie ca. 966–959 v.Chr. Andere schema’s verschillen enkele jaren."),
    g("scheuring", "Het rijk scheurt",
      "Rehabeam geeft het volk een hard antwoord. ‘Alzo vielen de Israëlieten van het huis Davids af’ (1 Koningen 12:19): tien stammen kiezen Jerobeam, Juda blijft bij Rehabeam.",
      930, "benaderd", ["1 Koningen 12:1–20", "thiele"], ["rehabeam", "jerobeam", "salomo"], "sichem", verhaal="v62", belangrijk=True, stap="1koningen:salomo:8", marge=[931, 930],
      opmerking="Volgens de gangbare reconstructie (Thiele) 931/930 v.Chr.; andere schema’s verschillen enkele jaren."),
    g("sisak-jeruzalem", "Sisak trekt op tegen Jeruzalem",
      "In het vijfde jaar van Rehabeam komt de koning van Egypte. Hij neemt de schatten van de tempel en van het paleis mee, ook de gouden schilden van Salomo.",
      925, "benaderd", ["1 Koningen 14:25–26", "sjosjenk"], ["sisak", "rehabeam"], "salem", belangrijk=True, marge=[926, 925],
      opmerking="Het vijfde jaar van Rehabeam is omgerekend 926/925 v.Chr. In Karnak (Egypte) staat een lijst van plaatsen in Israël en de Negev die farao Sjosjenk I innam. Jeruzalem staat daar niet op; daarover verschillen de verklaringen. Dat Sisak Sjosjenk I is, is gangbaar, maar niet onomstreden."),
]

DS_STEDEN = [
    {"id": "jeruzalem", "naam": "Jeruzalem", "plaatsId": "salem", "tekst": "De burg van de Jebusieten die David innam; daarna ‘de stad Davids’ (2 Samuël 5:7). Hier bouwde Salomo de tempel.", "bron": ["2 Samuël 5:6–9", "1 Koningen 6:1"]},
    {"id": "hebron", "naam": "Hebron", "plaatsId": "mamre", "tekst": "Hier werd David eerst koning over Juda, zeven jaar en zes maanden.", "bron": ["2 Samuël 2:1–4", "2 Samuël 2:11"]},
    {"id": "sichem", "naam": "Sichem", "plaatsId": "sichem", "tekst": "Hier kwam het volk bijeen om Rehabeam koning te maken; hier scheurde het rijk.", "bron": ["1 Koningen 12:1"]},
    {"id": "dan", "naam": "Dan", "plaatsId": "dan", "tekst": "Stad in het uiterste noorden: Israël woonde ‘van Dan tot Ber-seba’ (1 Koningen 4:25). Hier werden in 1993 en 1994 de stukken van de steen met “huis van David” gevonden.", "bron": ["1 Koningen 4:25", "tel-dan"]},
    {"id": "berseba", "naam": "Berseba", "plaatsId": "berseba", "tekst": "Stad in het uiterste zuiden van het land.", "bron": ["1 Koningen 4:25"]},
    {"id": "gaza", "naam": "Gaza", "plaatsId": "gaza", "tekst": "Filistijnse stad in het zuiden, aan de weg naar Egypte.", "bron": ["1 Koningen 4:24"]},
    {"id": "tyrus", "naam": "Tyrus", "plaatsId": "tyrus", "tekst": "Havenstad van de Feniciërs. Koning Hiram stuurde cederhout en vaklieden naar Jeruzalem.", "bron": ["2 Samuël 5:11", "1 Koningen 5:1–10"]},
    {"id": "rabba", "naam": "Rabba", "plaatsId": "rabba", "tekst": "Hoofdstad van de Ammonieten (nu Amman). Bij het beleg sneuvelde Uria.", "bron": ["2 Samuël 11:1", "2 Samuël 12:26–29"]},
    {"id": "damascus", "naam": "Damascus", "plaatsId": "damascusst", "tekst": "Stad van de Syriërs. David legde er bezettingen; onder Salomo regeerde Rezon hier als tegenstander van Israël.", "bron": ["2 Samuël 8:6", "1 Koningen 11:23–25"]},
    {"id": "zoba", "naam": "Zoba", "plaatsId": "dr_zoba", "tekst": "Koninkrijk van de Syriërs; David versloeg koning Hadad-ezer.", "bron": ["2 Samuël 8:3"]},
    {"id": "hamath", "naam": "Hamath", "plaatsId": "dr_hamath", "tekst": "Stad aan de Orontes. Koning Thoï stuurde zijn zoon met geschenken naar David.", "bron": ["2 Samuël 8:9–10"]},
    {"id": "ezeongeber", "naam": "Ezeon-Geber", "plaatsId": "ezeongeber", "tekst": "Haven aan de Schelfzee in het land van Edom; hier liet Salomo schepen bouwen.", "bron": ["1 Koningen 9:26"]},
]

ONDER = [MOAB, AMMON, EDOM, ARAM_ZOBA]
DS_GEBIEDEN = [
    {"id": "israel", "naam": "Israël", "kleur": "salie", "hoofdstad": None, "bron": ["1 Samuël 31:7", "2 Samuël 2:9", "2 Samuël 5:5", "1 Koningen 4:25", "1 Koningen 12:20", "eigen-tekening"],
     "opmerking": B_RIJK + " Het land ‘van Dan tot Ber-seba’ (1 Koningen 4:25), met Gilead aan de overkant van de Jordaan. Onder Saul en de eerste jaren van David was Jeruzalem nog een stad van de Jebusieten; onder Isboseth hoorde Juda er niet bij, en na de scheuring ook niet.",
     "sleutels": [
         sleutel(1050, [ISRAEL_WEST, GILEAD, JUDA_D], "Het koninkrijk van Saul: alle stammen."),
         sleutel(1011, [ISRAEL_WEST, GILEAD, JUDA_D]),
         sleutel(1010, [ISRAEL_WEST, GILEAD, BENJAMIN], "Isboseth koning over Gilead, Jizreël, Efraïm, Benjamin en heel Israël; Juda volgt David (2 Samuël 2:9–10)."),
         sleutel(1004, [ISRAEL_WEST, GILEAD, BENJAMIN]),
         sleutel(1003, [ISRAEL_WEST, GILEAD, JUDA_D], "David koning over heel Israël en Juda (2 Samuël 5:3–5)."),
         sleutel(931, [ISRAEL_WEST, GILEAD, JUDA_D]),
         sleutel(930, [ISRAEL_WEST, GILEAD], "Na de scheuring: de tien stammen onder Jerobeam (1 Koningen 12:20). Benjamin blijft bij Juda (1 Koningen 12:21)."),
         sleutel(920, [ISRAEL_WEST, GILEAD]),
     ]},
    {"id": "juda-hebron", "naam": "Juda (Hebron)", "kleur": "koraal", "hoofdstad": "hebron", "bron": ["2 Samuël 2:4", "2 Samuël 2:11", "eigen-tekening"],
     "opmerking": B_RIJK + " Juda onder David in Hebron, zeven jaar en zes maanden (2 Samuël 2:11).",
     "sleutels": [sleutel(1010, JUDA_HEBRON, "David koning in Hebron."), sleutel(1004, JUDA_HEBRON, "Daarna wordt David koning over heel Israël.")]},
    {"id": "juda", "naam": "Juda", "kleur": "koraal", "hoofdstad": "jeruzalem", "bron": ["1 Koningen 12:20–21", "eigen-tekening"],
     "opmerking": B_RIJK + " Het koninkrijk Juda na de scheuring, met Benjamin (1 Koningen 12:21).",
     "sleutels": [sleutel(930, JUDA_D, "Rehabeam koning over Juda en Benjamin."), sleutel(920, JUDA_D)]},
    {"id": "onder-david", "naam": "Onder David en Salomo", "kleur": "zand", "hoofdstad": None, "bron": ["2 Samuël 8:2", "2 Samuël 8:6", "2 Samuël 8:14", "2 Samuël 12:29–31", "1 Koningen 4:21", "1 Koningen 11:14–25", "eigen-tekening"],
     "opmerking": B_RIJK + " De buurvolken die David versloeg en die geschenken brachten: Moab, Ammon, Edom en de Syriërs van Zoba en Damascus. Ze bleven eigen volken; daarom is dit geen grens maar een gebied “onder gezag”. Wanneer David hen versloeg, staat er niet (hier rond 990 geplaatst). Onder Salomo was Rezon in Damascus ‘Israëls tegenpartijder’ (1 Koningen 11:25), en Hadad in Edom ook; hoe ver het gezag toen nog reikte, is niet te tekenen. De Bijbel noemt het gebied ‘van de rivier tot het land der Filistijnen’ (1 Koningen 4:21); de weg naar de Eufraat is hier niet getekend.",
     "sleutels": [sleutel(992, ONDER, "Plaatsing: de oorlogen van 2 Samuël 8 en 10–12 hebben geen jaartal."), sleutel(990, ONDER), sleutel(931, ONDER, "Na de dood van Salomo valt dit uiteen; de Bijbel zegt niet precies wanneer elk volk zelfstandig werd.")]},
    {"id": "filistea", "naam": "Filistijnen", "kleur": "terra", "hoofdstad": None, "bron": ["1 Samuël 6:17", "1 Samuël 17:4", "2 Samuël 8:1", "bijbelreis-plaatsen", "eigen-tekening"],
     "opmerking": B_RIJK + " De kustvlakte met de vijf steden van de Filistijnen: Gaza, Askelon, Asdod, Gath en Ekron (1 Samuël 6:17). David versloeg hen (2 Samuël 8:1), maar onder Salomo was in Gath nog een eigen koning (1 Koningen 2:39).",
     "sleutels": [sleutel(1050, FILISTEA), sleutel(920, FILISTEA)]},
    {"id": "fenicie", "naam": "Fenicië", "kleur": "kobalt", "hoofdstad": "tyrus", "bron": ["2 Samuël 5:11", "1 Koningen 5:1", "hiram", "eigen-tekening"],
     "opmerking": B_RIJK + " De kuststrook met Tyrus en Sidon, tot de kam van de Libanon. Tyrus was bevriend met David en Salomo (1 Koningen 5:1).",
     "sleutels": [sleutel(1050, FENICIE), sleutel(920, FENICIE)]},
    {"id": "aram-zoba", "naam": "Aram-Zoba", "kleur": "oker", "hoofdstad": "zoba", "bron": ["2 Samuël 8:3–6", "1 Koningen 11:23–25", "bijbelreis-plaatsen", "eigen-tekening"],
     "opmerking": B_RIJK + " De Syriërs (Arameeërs) van Zoba, met Damascus. Hun koning Hadad-ezer wilde zijn macht uitbreiden tot de Eufraat (2 Samuël 8:3); hoe ver zijn rijk reikte, is niet bekend.",
     "sleutels": [sleutel(1050, ARAM_ZOBA), sleutel(920, ARAM_ZOBA)]},
    {"id": "ammon", "naam": "Ammon", "kleur": "bruin", "hoofdstad": "rabba", "bron": ["2 Samuël 10:1–14", "2 Samuël 12:26–31", "eigen-tekening"],
     "opmerking": B_RIJK + " De Ammonieten rond Rabba, aan de rand van de woestijn.",
     "sleutels": [sleutel(1050, AMMON), sleutel(920, AMMON)]},
    {"id": "moab", "naam": "Moab", "kleur": "olijf", "hoofdstad": None, "bron": ["2 Samuël 8:2", "eigen-tekening"],
     "opmerking": B_RIJK + " Het hoogland ten oosten van de Dode Zee.",
     "sleutels": [sleutel(1050, MOAB), sleutel(920, MOAB)]},
    {"id": "edom", "naam": "Edom", "kleur": "rood", "hoofdstad": None, "bron": ["2 Samuël 8:14", "1 Koningen 9:26", "1 Koningen 11:14–22", "eigen-tekening"],
     "opmerking": B_RIJK + " Het bergland ten zuiden van de Dode Zee, aan beide kanten van de Araba, tot aan de Schelfzee (1 Koningen 9:26).",
     "sleutels": [sleutel(1050, EDOM), sleutel(920, EDOM)]},
]

DS_KOPPELINGEN = [
    {"verhaal": "v50", "jaar": 1050, "tot": None, "status": "benaderd", "personen": ["samuel", "saul"], "gebeurtenissen": ["saul-koning"]},
    {"verhaal": "v51", "jaar": 1050, "tot": 1025, "status": "benaderd", "personen": ["samuel", "saul", "david"], "gebeurtenissen": [],
     "opmerking": "Saul wordt verworpen en David gezalfd. Hoe oud David toen was, zegt de Bijbel niet; de Bijbelreis zet het ruwweg tussen 1050 en 1025 v.Chr."},
    {"verhaal": "v52", "jaar": 1025, "tot": None, "status": "benaderd", "personen": ["david", "saul"], "gebeurtenissen": ["goliath"]},
    {"verhaal": "v53", "jaar": 1050, "tot": 1020, "status": "benaderd", "personen": ["saul", "david"], "gebeurtenissen": ["goliath"],
     "opmerking": "Jonathan vecht bij Michmas vroeg in de regering van Saul; de vriendschap met David begint na Goliath. De precieze jaren staan niet in de Bijbel."},
    {"verhaal": "v54", "jaar": 1020, "tot": 1010, "status": "benaderd", "personen": ["david", "saul", "samuel"], "gebeurtenissen": [],
     "opmerking": "De laatste jaren van Saul. Hoe lang David op de vlucht was, zegt de Bijbel niet precies."},
    {"verhaal": "v55", "jaar": 1010, "tot": None, "status": "benaderd", "personen": ["saul", "david"], "gebeurtenissen": ["dood-saul"]},
    {"verhaal": "v56", "jaar": 1010, "tot": 1003, "status": "benaderd", "personen": ["david"], "gebeurtenissen": ["david-hebron", "jeruzalem"]},
    {"verhaal": "v57", "jaar": 1003, "tot": 990, "status": "benaderd", "personen": ["david", "nathan"], "gebeurtenissen": ["jeruzalem"],
     "opmerking": "Na de verovering van Jeruzalem; het precieze jaar staat niet in de Bijbel."},
    {"verhaal": "v58", "jaar": 1000, "tot": 990, "status": "benaderd", "personen": ["david", "nathan"], "gebeurtenissen": ["buurvolken"],
     "opmerking": "Tijdens de oorlog tegen Ammon (2 Samuël 11:1); het precieze jaar staat niet in de Bijbel."},
    {"verhaal": "v59", "jaar": 990, "tot": 975, "status": "benaderd", "personen": ["david"], "gebeurtenissen": [],
     "opmerking": "In de tweede helft van de regering van David; het precieze jaar staat niet in de Bijbel."},
    {"verhaal": "v60", "jaar": 970, "tot": 950, "status": "benaderd", "personen": ["salomo", "david", "nathan"], "gebeurtenissen": ["salomo-koning"],
     "opmerking": "De droom in Gibeon aan het begin van de regering van Salomo; het bezoek van de koningin van Scheba later, na de bouw van de tempel en het paleis."},
    {"verhaal": "v61", "jaar": 966, "tot": 959, "status": "benaderd", "personen": ["salomo", "hiram"], "gebeurtenissen": ["tempel"]},
    {"verhaal": "v62", "jaar": 940, "tot": 930, "status": "benaderd", "personen": ["salomo", "rehabeam", "jerobeam", "sisak"], "gebeurtenissen": ["scheuring", "sisak-jeruzalem"],
     "opmerking": "In de ouderdom van Salomo en direct na zijn dood. Jerobeam vluchtte in die tijd naar Sisak in Egypte (1 Koningen 11:40)."},
]


def bouw_david():
    return {
        "id": "david-salomo",
        "titel": "David en Salomo",
        "ondertitel": "De koningen van Israël tussen de buurvolken, ca. 1050–920 v.Chr. (reconstructie)",
        "as": {"soort": "vchr", "van": 1050, "tot": 920, "stap": 1, "label": "jaar voor Christus", "status": "benaderd",
               "uitleg": "Omgerekend met de regeringsjaren uit de Bijbel (Saul, David en Salomo elk veertig jaar), teruggeteld vanaf de scheuring van het rijk in 931/930 v.Chr. volgens de gangbare reconstructie (Thiele), zoals in de rest van de Bijbelreis. Er is geen onafhankelijk jaartal uit de tijd van David zelf; alle jaartallen zijn daarom bij benadering."},
        "start": 1003,
        "bronnen": DS_BRONNEN,
        "info": DS_INFO,
        "personen": DS_PERSONEN,
        "gebeurtenissen": DS_GEBEURTENISSEN,
        "gebieden": DS_GEBIEDEN,
        "steden": DS_STEDEN,
        "koppelingen": DS_KOPPELINGEN,
    }


# ================================================================ periode 2: Israël, Juda en Assyrië
IA_BRONNEN = [
    {"id": "sv", "soort": "bijbel", "titel": "Statenvertaling: 1 Koningen 16–22, 2 Koningen 1–19, Jona, Jesaja 1, 6, 20", "url": None, "licentie": SV, "geraadpleegd": G},
    DATERINGEN, THIELE,
    {"id": "assyrische-koningen", "soort": "historisch", "titel": "List of Assyrian kings (Wikipedia, Engels): regeringsjaren, gebaseerd op de Assyrische eponiemenlijsten", "url": "https://en.wikipedia.org/wiki/List_of_Assyrian_kings", "licentie": WIKI, "geraadpleegd": G},
    {"id": "qarqar", "soort": "historisch", "titel": "Battle of Qarqar (Wikipedia, Engels): de Kurkh-monoliet van Salmanassar III, 853 v.Chr.", "url": "https://en.wikipedia.org/wiki/Battle_of_Qarqar", "licentie": WIKI, "geraadpleegd": G},
    {"id": "zwarte-obelisk", "soort": "historisch", "titel": "Black Obelisk of Shalmaneser III (Wikipedia, Engels; British Museum ME 118885)", "url": "https://en.wikipedia.org/wiki/Black_Obelisk_of_Shalmaneser_III", "licentie": WIKI, "geraadpleegd": G},
    {"id": "salmanassar-iii-bron", "soort": "historisch", "titel": "Shalmaneser III (Wikipedia, Engels): veldtochten van 853 en 841 v.Chr.", "url": "https://en.wikipedia.org/wiki/Shalmaneser_III", "licentie": WIKI, "geraadpleegd": G},
    {"id": "jehu-bron", "soort": "historisch", "titel": "Jehu (Wikipedia, Engels): 841–814 (Thiele) of 842–815 v.Chr. (Albright)", "url": "https://en.wikipedia.org/wiki/Jehu", "licentie": WIKI, "geraadpleegd": G},
    {"id": "til-barsip", "soort": "historisch", "titel": "Til Barsip (Wikipedia, Engels): Assyrisch in 856 v.Chr.", "url": "https://en.wikipedia.org/wiki/Til_Barsip", "licentie": WIKI, "geraadpleegd": G},
    {"id": "tiglatpileser", "soort": "historisch", "titel": "Tiglath-Pileser III (Wikipedia, Engels): Pul/Pulu, Arpad 740, de provincies van 738, Damascus 732", "url": "https://en.wikipedia.org/wiki/Tiglath-Pileser_III", "licentie": WIKI, "geraadpleegd": G},
    {"id": "salmanassar-v", "soort": "historisch", "titel": "Shalmaneser V (Wikipedia, Engels): het beleg van Samaria; de Babylonische kroniek", "url": "https://en.wikipedia.org/wiki/Shalmaneser_V", "licentie": WIKI, "geraadpleegd": G},
    {"id": "sargon", "soort": "historisch", "titel": "Sargon II (Wikipedia, Engels): Samaria, Qarqar en Hamath 720, Asdod 711", "url": "https://en.wikipedia.org/wiki/Sargon_II", "licentie": WIKI, "geraadpleegd": G},
    {"id": "sanherib-juda", "soort": "historisch", "titel": "Sennacherib's campaign in Judah (Wikipedia, Engels): de annalen van Sanherib en de reliëfs van Lachis (British Museum), 701 v.Chr.", "url": "https://en.wikipedia.org/wiki/Sennacherib%27s_campaign_in_Judah", "licentie": WIKI, "geraadpleegd": G},
    {"id": "sanherib-bron", "soort": "historisch", "titel": "Sennacherib (Wikipedia, Engels): Ninevé als hoofdstad; vermoord door zijn zonen in 681 v.Chr.", "url": "https://en.wikipedia.org/wiki/Sennacherib", "licentie": WIKI, "geraadpleegd": G},
    {"id": "pleiades-kalhu", "soort": "dataset", "titel": "Pleiades 894019: Nimrud (Kalhu, Kalach)", "url": "https://pleiades.stoa.org/places/894019", "licentie": PLEIADES, "geraadpleegd": G},
    {"id": "pleiades-qarqar", "soort": "dataset", "titel": "Pleiades 995604669: Tell Qarqur (Qarqar)", "url": "https://pleiades.stoa.org/places/995604669", "licentie": PLEIADES, "geraadpleegd": G},
    PLAATSEN, EIGEN,
]

IA_INFO = [
    {"kop": "Hoe weten we deze jaren?",
     "tekst": "De Bijbel noemt hoe lang elke koning regeerde. De Assyriërs gaven elk jaar de naam van een hoge ambtenaar en schreven die namen op lijsten. Twee Assyrische stenen noemen koningen uit de Bijbel: Achab in 853 en Jehu in 841 v.Chr. Daardoor kun je de Bijbelse jaren aan onze jaartelling koppelen.",
     "status": "historisch", "bron": ["assyrische-koningen", "qarqar", "zwarte-obelisk", "thiele"]},
    {"kop": "Jehu: 841 of 842?",
     "tekst": "Deze tijdlijn volgt de Bijbelreis en de reconstructie van Thiele: Jehu werd koning in 841 v.Chr., het jaar waarin hij schatting gaf aan Salmanassar III. Anderen, zoals Albright, rekenen 842 v.Chr. Het verschil komt uit hoe je de regeringsjaren telt.",
     "status": "benaderd", "bron": ["jehu-bron", "thiele", "bijbelreis-dateringen"]},
    {"kop": "Waarom staat Jona zonder jaartal?",
     "tekst": "De Bijbel zegt alleen dat Jona profeteerde in de tijd van koning Jerobeam II (2 Koningen 14:25). Daarom staat zijn tocht naar Ninevé als een tijdvak op de tijdlijn, niet als één jaar.",
     "status": "expliciet", "bron": ["2 Koningen 14:23–25"]},
    {"kop": "Waarom passen de jaren van Hizkia niet precies?",
     "tekst": "De Bijbel noemt bij Hizkia meer jaartallen (2 Koningen 18:1, 9, 10 en 13). Die zijn niet eenvoudig met elkaar te rijmen. Misschien regeerde hij een tijd samen met zijn vader. Deze tijdlijn volgt 715–686 v.Chr., zoals de Bijbelreis; anderen rekenen anders.",
     "status": "benaderd", "bron": ["2 Koningen 18:1–13", "bijbelreis-dateringen"]},
]

IA_PERSONEN = [
    persoon("salmanassar-iii", "Salmanassar III", None, "regering",
            d(859, "historisch", "assyrische-koningen", begin="regering"), d(824, "historisch", "assyrische-koningen", einde="stierf"),
            "Koning van Assyrië; vocht bij Qarqar en kreeg schatting van Jehu", [], ["qarqar", "jehu-schatting"], None, opmerking="Hij staat niet bij naam in de Bijbel."),
    persoon("achab", "Achab", "achab", "regering",
            d(874, "benaderd", ["1 Koningen 16:29", "bijbelreis-dateringen"], begin="regering", opmerking="Hij regeerde 22 jaar (1 Koningen 16:29); omgerekend ca. 874–853 v.Chr. (gangbare reconstructie, Thiele)."),
            d(853, "benaderd", ["1 Koningen 22:37", "thiele"], einde="stierf", opmerking="In 853 v.Chr. vocht hij bij Qarqar; volgens de reconstructie van Thiele sneuvelde hij later in datzelfde jaar bij Ramoth in Gilead."),
            "Koning van Israël in Samaria; diende de Baäl", ["1 Koningen 16:29–33", "1 Koningen 22:29–40"], ["qarqar"], "v63"),
    persoon("elia", "Elia", "elia", "profeet",
            d(874, "benaderd", ["1 Koningen 17:1", "bijbelreis-dateringen"], begin="genoemd", opmerking="Elia trad op in de tijd van Achab (1 Koningen 17:1). Wanneer hij geboren werd of begon, staat er niet; de lijn begint bij het begin van Achab."),
            d(850, "benaderd", ["2 Koningen 2:11", "bijbelreis-dateringen"], einde="weggenomen", opmerking="‘Alzo voer Elia met een onweder ten hemel’ (2 Koningen 2:11), na de dood van Achab en Ahazia. Het jaar staat er niet; omgerekend rond 850 v.Chr., zoals de Bijbelreis bij Elisa."),
            "Profeet uit Tisbe in Gilead; bad op de Karmel", ["1 Koningen 17:1", "1 Koningen 18:20–40", "2 Koningen 2:1–11"], [], "v63"),
    persoon("elisa", "Elisa", "elisa", "profeet",
            d(850, "benaderd", ["2 Koningen 2:12–15", "bijbelreis-dateringen"], begin="genoemd", opmerking="Elia had hem al geroepen (1 Koningen 19:19). De lijn begint toen hij Elia opvolgde, rond 850 v.Chr."),
            d(795, "benaderd", ["2 Koningen 13:14", "2 Koningen 13:20", "bijbelreis-dateringen"], einde="stierf", opmerking="Hij stierf in de tijd van Joas, koning van Israël (2 Koningen 13:14–20); omgerekend rond 795 v.Chr."),
            "Profeet, opvolger van Elia; Naäman werd door Gods woord genezen", ["2 Koningen 2:12–15", "2 Koningen 5:1–19", "2 Koningen 13:14–20"], [], "v64"),
    persoon("jehu", "Jehu", "jehu", "regering",
            d(841, "benaderd", ["2 Koningen 9:13", "zwarte-obelisk", "thiele"], begin="regering", opmerking="In 841 v.Chr. bracht hij schatting aan Salmanassar III (Zwarte Obelisk). Thiele laat zijn regering in dat jaar beginnen; Albright rekent 842."),
            d(814, "benaderd", ["2 Koningen 10:36", "thiele"], einde="stierf", opmerking="Hij regeerde 28 jaar (2 Koningen 10:36)."),
            "Koning van Israël; maakte een einde aan het huis van Achab", ["2 Koningen 9:1–13", "2 Koningen 10:28–36"], ["jehu-schatting"], "v65"),
    persoon("jerobeam-ii", "Jerobeam II", "jerobeam_2", "regering",
            d(793, "benaderd", ["2 Koningen 14:23", "thiele"], begin="regering", opmerking="Hij regeerde 41 jaar (2 Koningen 14:23), eerst een tijd samen met zijn vader Joas (Thiele: vanaf 793/792, alleen vanaf 782/781)."),
            d(753, "benaderd", ["2 Koningen 14:29", "thiele"], einde="stierf"),
            "Koning van Israël; in zijn tijd profeteerde Jona", ["2 Koningen 14:23–29"], ["jona-nineve"], "v69"),
    persoon("tiglatpileser-iii", "Tiglath-pilezer", None, "regering",
            d(745, "historisch", "assyrische-koningen", begin="regering"), d(727, "historisch", "assyrische-koningen", einde="stierf"),
            "Koning van Assyrië; de Bijbel noemt hem ook Pul", ["2 Koningen 15:19", "2 Koningen 15:29", "2 Koningen 16:7–10"], ["pul", "damascus-valt"], None, alt=["Pul", "Tiglath-pileser III"],
            opmerking="Pul en Tiglath-pilezer zijn dezelfde koning: Babylonische lijsten noemen hem Pulu."),
    persoon("hosea-koning", "Hosea", "hosea", "regering",
            d(732, "benaderd", ["2 Koningen 17:1", "thiele"], begin="regering", marge=[732, 731], opmerking="Hij regeerde negen jaar (2 Koningen 17:1); teruggeteld vanaf de val van Samaria ongeveer 732/731 v.Chr."),
            d(722, "benaderd", ["2 Koningen 17:4–6"], einde="onbekend", marge=[723, 721], opmerking="Hij werd gevangengezet (2 Koningen 17:4); wat er daarna met hem gebeurde, staat er niet."),
            "De laatste koning van Israël", ["2 Koningen 17:1–6"], ["samaria-valt"], "v66"),
    persoon("salmanassar-v", "Salmaneser", None, "regering",
            d(727, "historisch", "assyrische-koningen", begin="regering"), d(722, "historisch", "assyrische-koningen", einde="stierf"),
            "Koning van Assyrië; belegerde Samaria", ["2 Koningen 17:3", "2 Koningen 18:9"], ["samaria-valt"], None, alt=["Salmanassar V"]),
    persoon("sargon-ii", "Sargon", None, "regering",
            d(722, "historisch", "assyrische-koningen", begin="regering"), d(705, "historisch", ["assyrische-koningen", "sargon"], einde="stierf", opmerking="Hij sneuvelde in een veldslag in Klein-Azië."),
            "Koning van Assyrië; de Bijbel noemt hem één keer", ["Jesaja 20:1"], ["samaria-valt", "asdod"], None, alt=["Sargon II"],
            opmerking="Sargon schreef later dat hij Samaria had ingenomen; de Bijbel zegt ‘de koning van Assyrië’ (2 Koningen 17:6)."),
    persoon("hizkia", "Hizkia", "hizkia", "regering",
            d(715, "benaderd", ["2 Koningen 18:13", "bijbelreis-dateringen"], begin="regering", opmerking="Teruggerekend: Sanherib kwam in zijn veertiende jaar (2 Koningen 18:13), in 701 v.Chr. 2 Koningen 18:1 en 18:9–10 wijzen op een vroeger begin; misschien regeerde hij eerst samen met zijn vader."),
            d(686, "benaderd", "2 Koningen 18:2", einde="stierf", opmerking="Hij regeerde 29 jaar (2 Koningen 18:2)."),
            "Koning van Juda; vertrouwde op de HEERE", ["2 Koningen 18:1–20:21", "2 Kronieken 29–32"], ["sanherib-jeruzalem"], "v67"),
    persoon("sanherib", "Sanherib", "sanherib", "regering",
            d(705, "historisch", "assyrische-koningen", begin="regering"), d(681, "historisch", ["assyrische-koningen", "sanherib-bron", "2 Koningen 19:37"], einde="stierf"),
            "Koning van Assyrië; trok op tegen Juda en Jeruzalem", ["2 Koningen 18:13–19:37", "Jesaja 36–37"], ["sanherib-jeruzalem", "dood-sanherib"], "v67"),
    persoon("jesaja", "Jesaja", "jesaja", "profeet",
            d(740, "benaderd", ["Jesaja 6:1", "bijbelreis-dateringen"], begin="roeping", marge=[740, 739], opmerking="‘In het jaar, toen de koning Uzzia stierf’ (Jesaja 6:1); omgerekend ca. 740 v.Chr."),
            d(701, "benaderd", ["2 Koningen 20:1", "Jesaja 1:1"], einde="onbekend", opmerking="Hij profeteerde in de dagen van Uzzia, Jotham, Achaz en Hizkia (Jesaja 1:1) en wordt het laatst genoemd bij Hizkia, rond 701 v.Chr. (2 Koningen 20). Wanneer hij stierf, staat er niet."),
            "Profeet in Jeruzalem; bracht Hizkia het antwoord van God", ["Jesaja 1:1", "Jesaja 6:1", "2 Koningen 19:2–7"], ["sanherib-jeruzalem"], "v72"),
]

IA_GEBEURTENISSEN = [
    g("qarqar", "Slag bij Qarqar",
      "Koning Salmanassar van Assyrië trekt met een groot leger naar het westen. Bij Qarqar aan de Orontes vechten de koningen van Syrië, Hamath en Israël samen tegen hem, ook koning Achab.",
      853, "historisch", ["qarqar", "salmanassar-iii-bron"], ["salmanassar-iii", "achab"], [35.742, 36.331], verhaal="v63", belangrijk=True,
      opmerking="De Bijbel vertelt deze slag niet; we kennen hem van een Assyrische steen, de Kurkh-monoliet. Een andere lezing van de Assyrische lijst geeft 854 v.Chr. Ligging van Qarqar: Tell Qarqur (Pleiades)."),
    g("jehu-schatting", "Jehu buigt voor Assyrië",
      "Jehu is pas koning als de koning van Assyrië weer naar het westen komt. Op een zwarte stenen zuil uit Kalhu staat hoe Jehu, of een gezant van hem, buigt en geschenken brengt.",
      841, "historisch", ["zwarte-obelisk", "salmanassar-iii-bron"], ["jehu", "salmanassar-iii"], "samaria", verhaal="v65", belangrijk=True,
      opmerking="Ook dit staat niet in de Bijbel. Wel staat er: ‘In die dagen begon de HEERE Israël af te korten’ (2 Koningen 10:32). De zuil staat nu in het British Museum. De meeste onderzoekers lezen de naam als Jehu; enkelen denken aan Joram."),
    g("jona-nineve", "Jona in Ninevé",
      "God stuurt Jona naar Ninevé, ‘een grote stad Gods, van drie dagreizen’ (Jona 3:3). De mensen van Ninevé bekeren zich, en God is genadig.",
      793, "expliciet", ["Jona 3:3–10", "2 Koningen 14:25"], ["jerobeam-ii"], "ninivest", verhaal="v70", belangrijk=True, tot=753, stap="jona:jona:4",
      opmerking="De Bijbel noemt geen jaar; alleen dat Jona leefde in de tijd van Jerobeam II (2 Koningen 14:25). Daarom staat zijn tocht als een tijdvak van 793 tot 753 v.Chr. De hoofdstad van Assyrië was toen Kalhu; Ninevé werd pas onder Sanherib de hoofdstad."),
    g("pul", "Pul komt naar Israël",
      "‘Toen kwam Pul, de koning van Assyrië, tegen het land’ (2 Koningen 15:19). Koning Menahem van Israël geeft hem duizend talenten zilver.",
      743, "benaderd", ["2 Koningen 15:19–20", "tiglatpileser"], ["tiglatpileser-iii"], "samaria", marge=[745, 738],
      opmerking="Pul (Tiglath-pilezer III) werd koning in 745 v.Chr. Het precieze jaar van deze schatting staat niet vast: de reconstructies verschillen tussen ongeveer 743 en 738 v.Chr."),
    g("damascus-valt", "Damascus valt",
      "Koning Achaz van Juda vraagt Assyrië om hulp tegen Syrië en Israël. Tiglath-pilezer neemt Damascus in, en ook Galilea en Gilead, en voert de mensen weg.",
      732, "historisch", ["2 Koningen 16:7–9", "2 Koningen 15:29", "tiglatpileser"], ["tiglatpileser-iii"], "damascusst"),
    g("samaria-valt", "Samaria valt",
      "Na een beleg van drie jaar ‘nam de koning van Assyrië Samaria in’ (2 Koningen 17:6). De Israëlieten worden weggevoerd naar verre steden; het noordrijk Israël bestaat niet meer.",
      722, "benaderd", ["2 Koningen 17:5–6", "2 Koningen 18:9–10", "salmanassar-v", "sargon"], ["hosea-koning", "salmanassar-v", "sargon-ii"], "samaria", verhaal="v66", belangrijk=True, marge=[723, 721], stap="2koningen:ballingschap:0",
      opmerking="Volgens de meeste onderzoekers 722 v.Chr.; sommigen rekenen 723 of 721. De Babylonische kroniek noemt Salmaneser; Sargon II eiste de overwinning later voor zich op."),
    g("asdod", "Sargon neemt Asdod in",
      "Het leger van koning Sargon neemt de Filistijnse stad Asdod in. Jesaja noemt dat jaar in zijn boek.",
      711, "historisch", ["Jesaja 20:1", "sargon"], ["sargon-ii", "jesaja"], "asdod",
      opmerking="Jesaja noemt het jaar ‘toen Tartan naar Asdod kwam’ (Jesaja 20:1), gezonden door Sargon. Dit is de enige plaats waar de Bijbel Sargon bij naam noemt."),
    g("sanherib-jeruzalem", "Sanherib voor Jeruzalem",
      "Sanherib neemt de vaste steden van Juda in, ook Lachis. Hizkia bidt, Jesaja brengt Gods antwoord, en Jeruzalem wordt niet ingenomen.",
      701, "historisch", ["2 Koningen 18:13–19:36", "sanherib-juda"], ["sanherib", "hizkia", "jesaja"], "lachis", verhaal="v67", belangrijk=True, stap="2koningen:ballingschap:2",
      opmerking="Sanherib liet het beleg van Lachis op stenen platen in zijn paleis in Ninevé afbeelden (nu in het British Museum). In zijn eigen verslag schrijft hij dat hij Hizkia in Jeruzalem insloot “als een vogel in een kooi”; dat hij de stad innam, schrijft hij niet. Dat zijn leger in één nacht werd geslagen, staat alleen in de Bijbel (2 Koningen 19:35)."),
    g("dood-sanherib", "Sanherib sterft",
      "Sanherib ‘bleef te Nineve’ (2 Koningen 19:36). Daar wordt hij door zijn zonen gedood, en zijn zoon Esar-haddon wordt koning.",
      681, "historisch", ["2 Koningen 19:36–37", "sanherib-bron", "assyrische-koningen"], ["sanherib"], "ninivest",
      opmerking="Assyrische en Babylonische bronnen bevestigen dat Sanherib in 681 v.Chr. door een zoon (of zonen) werd vermoord en dat Esar-haddon hem opvolgde."),
]

IA_STEDEN = [
    {"id": "nineve", "naam": "Ninevé", "plaatsId": "ninivest", "tekst": "Grote stad aan de Tigris. Hierheen moest Jona; later maakte Sanherib Ninevé tot hoofdstad van Assyrië.", "bron": ["Jona 1:2", "2 Koningen 19:36", "sanherib-bron"]},
    {"id": "kalhu", "naam": "Kalhu (Kalach)", "plaatsId": None, "lat": 36.1, "lng": 43.332, "tekst": "Hoofdstad van Assyrië in de tijd van Achab, Jehu en Jona. Hier stond de zwarte zuil van Salmanassar III.", "bron": ["Genesis 10:11", "pleiades-kalhu", "zwarte-obelisk"]},
    {"id": "assur", "naam": "Assur", "plaatsId": "assur", "tekst": "De oude hoofdstad van Assyrië, waar het rijk zijn naam aan dankt.", "bron": ["Genesis 10:11", "assyrische-koningen"]},
    {"id": "samaria", "naam": "Samaria", "plaatsId": "samaria", "tekst": "Hoofdstad van het noordrijk Israël, gebouwd door koning Omri. Assyrië nam de stad rond 722 v.Chr. in.", "bron": ["1 Koningen 16:24", "2 Koningen 17:6"]},
    {"id": "jeruzalem", "naam": "Jeruzalem", "plaatsId": "salem", "tekst": "Stad van de tempel en de koningen van Juda. Sanherib nam haar niet in.", "bron": ["2 Koningen 19:32–36"]},
    {"id": "damascus", "naam": "Damascus", "plaatsId": "damascusst", "tekst": "Hoofdstad van Aram (Syrië). Naäman kwam hiervandaan; in 732 v.Chr. nam Assyrië de stad in.", "bron": ["2 Koningen 5:12", "2 Koningen 16:9"]},
    {"id": "hamath", "naam": "Hamath", "plaatsId": "dr_hamath", "tekst": "Stad aan de Orontes, ver in het noorden. Koning Sargon maakte er in 720 v.Chr. een einde aan het eigen koninkrijk.", "bron": ["2 Koningen 14:25", "sargon"]},
    {"id": "qarqar", "naam": "Qarqar", "plaatsId": None, "lat": 35.742, "lng": 36.331, "tekst": "Stad aan de Orontes. Hier vochten in 853 v.Chr. de koningen van het westen, met Achab, tegen Salmanassar III.", "bron": ["pleiades-qarqar", "qarqar"]},
    {"id": "tyrus", "naam": "Tyrus", "plaatsId": "tyrus", "tekst": "Havenstad van de Feniciërs. Izebel, de vrouw van Achab, was een dochter van de koning van de Sidoniërs.", "bron": ["1 Koningen 16:31"]},
]

IA_GEBIEDEN = [
    {"id": "assyrie", "naam": "Assyrië", "kleur": "grijs", "hoofdstad": None, "bron": ["assyrische-koningen", "til-barsip", "tiglatpileser", "salmanassar-v", "sargon", "2 Koningen 15:29", "2 Koningen 16:9", "2 Koningen 17:6", "eigen-tekening"],
     "opmerking": B_RIJK + " Getekend zijn de gebieden die Assyrië zelf bestuurde. Veel volken eromheen moesten schatting betalen maar hielden hun eigen koning, zoals Juda, Tyrus en de Filistijnse steden; die zijn niet bij Assyrië getekend.",
     "sleutels": [
         sleutel(880, ASS_880, "Het kernland aan de Tigris (Assur, Kalhu, Ninevé) en de Jezira tot de Chabur."),
         sleutel(857, ASS_880),
         sleutel(856, ASS_856, "Tot aan de Eufraat: Salmanassar III neemt Til Barsip in (856)."),
         sleutel(741, ASS_856),
         sleutel(738, ASS_738, "Tiglath-pilezer III neemt Arpad in (740) en maakt in 738 provincies in Noord-Syrië en aan de kust."),
         sleutel(733, ASS_738),
         sleutel(732, ASS_732, "Damascus, Galilea en Gilead (2 Koningen 15:29; 16:9). Hamath ligt ertussen en is nog een eigen koninkrijk."),
         sleutel(723, ASS_732),
         sleutel(722, ASS_722, "Samaria ingenomen (2 Koningen 17:6)."),
         sleutel(721, ASS_722),
         sleutel(720, ASS_720, "Sargon II verslaat Hamath bij Qarqar (720)."),
         sleutel(681, ASS_720, "Einde van deze tijdlijn."),
     ]},
    {"id": "israel", "naam": "Israël", "kleur": "salie", "hoofdstad": "samaria", "bron": ["2 Koningen 10:32–33", "2 Koningen 13:25", "2 Koningen 14:25", "2 Koningen 15:29", "2 Koningen 17:6", "eigen-tekening"],
     "opmerking": B_RIJK + " Het noordrijk Israël met Gilead aan de overkant van de Jordaan. Onder Jehu nam Hazaël van Syrië Gilead in (2 Koningen 10:32–33); Joas en Jerobeam II brachten het terug (2 Koningen 13:25; 14:25). Hoe ver Jerobeam II ‘van den ingang van Hamath’ reikte (2 Koningen 14:25), is niet als grens getekend.",
     "sleutels": [
         sleutel(880, [ISRAEL_WEST, GILEAD], "Rond Samaria en Galilea, met Gilead."),
         sleutel(842, [ISRAEL_WEST, GILEAD]),
         sleutel(814, ISRAEL_WEST, "In de dagen van Jehu verliest Israël Gilead aan Hazaël (2 Koningen 10:32–33); het jaar staat er niet."),
         sleutel(798, ISRAEL_WEST),
         sleutel(782, [ISRAEL_WEST, GILEAD], "Joas en Jerobeam II heroveren steden en gebied (2 Koningen 13:25; 14:25)."),
         sleutel(733, [ISRAEL_WEST, GILEAD]),
         sleutel(732, ISRAEL_732, "Kleiner: Galilea en Gilead weggevoerd (2 Koningen 15:29)."),
         sleutel(723, ISRAEL_732),
         sleutel(722, ISRAEL_732, "Einde: Samaria ingenomen (2 Koningen 17:6)."),
     ]},
    {"id": "juda", "naam": "Juda", "kleur": "koraal", "hoofdstad": "jeruzalem", "bron": ["2 Koningen 18:13", "bijbelreis-plaatsen", "eigen-tekening"],
     "opmerking": B_RIJK + " Het koninkrijk Juda, van Mizpa tot Berseba. In 701 nam Sanherib de vaste steden in (2 Koningen 18:13), maar Juda bleef een eigen koninkrijk met Jeruzalem; daarna betaalde het schatting aan Assyrië.",
     "sleutels": [sleutel(880, JUDA_K), sleutel(681, JUDA_K)]},
    {"id": "aram", "naam": "Aram (Syrië)", "kleur": "oker", "hoofdstad": "damascus", "bron": ["1 Koningen 22:3", "2 Koningen 10:32–33", "2 Koningen 16:9", "tiglatpileser", "eigen-tekening"],
     "opmerking": B_RIJK + " Het koninkrijk van de Syriërs rond Damascus, met Basan en Ramoth in Gilead (1 Koningen 22:3). Onder Hazaël kwam Gilead erbij (2 Koningen 10:32–33).",
     "sleutels": [
         sleutel(880, ARAM), sleutel(842, ARAM),
         sleutel(814, [ARAM, GILEAD], "Hazaël neemt Gilead in (2 Koningen 10:32–33)."),
         sleutel(798, [ARAM, GILEAD]),
         sleutel(782, ARAM, "Israël heeft Gilead terug."),
         sleutel(733, ARAM),
         sleutel(732, ARAM, "Einde: Damascus ingenomen (2 Koningen 16:9)."),
     ]},
    {"id": "fenicie", "naam": "Fenicië", "kleur": "kobalt", "hoofdstad": "tyrus", "bron": ["1 Koningen 16:31", "salmanassar-iii-bron", "eigen-tekening"],
     "opmerking": B_RIJK + " De havensteden Tyrus en Sidon met hun kuststrook. Ze bleven eigen koningen houden, maar brachten Assyrië vaak schatting, al in 841 v.Chr.",
     "sleutels": [sleutel(880, FENICIE), sleutel(681, FENICIE)]},
    {"id": "egypte", "naam": "Egypte", "kleur": "lila", "hoofdstad": None, "bron": ["2 Koningen 17:4", "2 Koningen 19:9", "eigen-tekening"],
     "opmerking": B_RIJK + " Alleen het noorden is getekend, als rand van de kaart; Egypte liep verder naar het zuiden langs de Nijl. Hosea zocht hulp bij ‘So, den koning van Egypte’ (2 Koningen 17:4); wie dat precies was, is onzeker.",
     "sleutels": [sleutel(880, EGYPTE_NOORD), sleutel(681, EGYPTE_NOORD)]},
]

IA_KOPPELINGEN = [
    {"verhaal": "v63", "jaar": 874, "tot": 853, "status": "benaderd", "personen": ["achab", "elia"], "gebeurtenissen": ["qarqar"],
     "opmerking": "Elia profeteerde in de tijd van Achab. In welke jaren van Achab de droogte en de Karmel vielen, staat niet in de Bijbel."},
    {"verhaal": "v64", "jaar": 850, "tot": 795, "status": "benaderd", "personen": ["elisa"], "gebeurtenissen": [],
     "opmerking": "Naäman kwam uit Damascus naar Elisa. De koning van Israël in 2 Koningen 5 wordt niet bij naam genoemd; daarom toont de tijdlijn de hele tijd van Elisa."},
    {"verhaal": "v65", "jaar": 841, "tot": 796, "status": "benaderd", "personen": ["jehu"], "gebeurtenissen": ["jehu-schatting"],
     "opmerking": "Athalia nam de macht in Juda in het jaar dat Jehu koning van Israël werd; Joas werd koning in het zevende jaar van Jehu en regeerde veertig jaar (2 Koningen 11:1–4; 12:1)."},
    {"verhaal": "v66", "jaar": 722, "tot": None, "status": "benaderd", "personen": ["hosea-koning", "salmanassar-v", "sargon-ii"], "gebeurtenissen": ["samaria-valt"]},
    {"verhaal": "v67", "jaar": 701, "tot": None, "status": "historisch", "personen": ["hizkia", "sanherib", "jesaja"], "gebeurtenissen": ["sanherib-jeruzalem", "dood-sanherib"]},
    {"verhaal": "v69", "jaar": 793, "tot": 753, "status": "expliciet", "personen": ["jerobeam-ii"], "gebeurtenissen": ["jona-nineve"],
     "opmerking": "Jona leefde in de tijd van Jerobeam II (2 Koningen 14:25). Wanneer hij naar Ninevé moest, staat er niet."},
    {"verhaal": "v70", "jaar": 793, "tot": 753, "status": "expliciet", "personen": ["jerobeam-ii"], "gebeurtenissen": ["jona-nineve"],
     "opmerking": "Het jaar van de prediking in Ninevé staat niet in de Bijbel; alleen de tijd van Jerobeam II."},
    {"verhaal": "v72", "jaar": 740, "tot": 700, "status": "benaderd", "personen": ["jesaja", "hizkia"], "gebeurtenissen": ["sanherib-jeruzalem"],
     "opmerking": "Jesaja profeteerde in de dagen van Uzzia, Jotham, Achaz en Hizkia (Jesaja 1:1). De troost van hoofdstuk 40–43 is gericht aan het volk in de ballingschap, die toen nog moest komen."},
]


def bouw_assyrie():
    return {
        "id": "israel-assyrie",
        "titel": "Israël, Juda en Assyrië",
        "ondertitel": "Van Achab tot Hizkia: de koningen en het grote rijk in het oosten, ca. 880–681 v.Chr.",
        "as": {"soort": "vchr", "van": 880, "tot": 681, "stap": 1, "label": "jaar voor Christus", "status": "historisch",
               "uitleg": "Omgerekend met de regeringsjaren uit de Bijbel en twee Assyrische ijkpunten (853 en 841 v.Chr.), volgens de gangbare reconstructie (Thiele), zoals in de rest van de Bijbelreis. De Assyrische jaartallen komen uit de eponiemenlijsten."},
        "start": 722,
        "bronnen": IA_BRONNEN,
        "info": IA_INFO,
        "personen": IA_PERSONEN,
        "gebeurtenissen": IA_GEBEURTENISSEN,
        "gebieden": IA_GEBIEDEN,
        "steden": IA_STEDEN,
        "koppelingen": IA_KOPPELINGEN,
    }


# ================================================================ uitvoer
def laad_plaatsen():
    """Leest lat/lng van de genoemde plaatsen uit public/bijbelreis/plaatsen.js (die blijven de bron)."""
    tekst = open(os.path.join(HIER, "..", "public", "bijbelreis", "plaatsen.js"), encoding="utf-8").read()
    uit = {}
    for m in re.finditer(r"^\s{2}([a-z0-9_]+): \{ n: \"[^\"]*\", ll: \[([\d.\-]+), ([\d.\-]+)\]", tekst, re.M):
        uit[m.group(1)] = (float(m.group(2)), float(m.group(3)))
    return uit


def met_ligging(data):
    plaatsen = laad_plaatsen()
    steden = []
    for s in data["steden"]:
        s = dict(s)
        if s["plaatsId"]:
            s["lat"], s["lng"] = plaatsen[s["plaatsId"]]
        steden.append({k: s[k] for k in ("id", "naam", "plaatsId", "lat", "lng", "tekst", "bron")})
    data["steden"] = steden
    return data


def compact(tekst):
    """Lijsten van alleen getallen (en lijsten daarvan) op één regel: het bestand blijft leesbaar en klein."""
    getal = r"-?\d+(?:\.\d+)?"
    tekst = re.sub(r"\[\s*(" + getal + r"(?:,\s*" + getal + r")*)\s*\]", lambda m: "[" + re.sub(r",\s*", ",", m.group(1)) + "]", tekst)
    paar = r"\[" + getal + "," + getal + r"\]"
    tekst = re.sub(r"\[\s*(" + paar + r"(?:,\s*" + paar + r")*)\s*\]", lambda m: "[" + re.sub(r",\s*\[", ",[", m.group(1)) + "]", tekst)
    tekst = re.sub(r"\[\s*(\[" + paar + r".*?\])\s*\]", lambda m: "[" + m.group(1) + "]", tekst)
    tekst = re.sub(r"\[\s*(\[\[" + paar + r".*?\]\])\s*\]", lambda m: "[" + m.group(1) + "]", tekst)
    return tekst


def main():
    fout = False
    for data in (met_ligging(bouw_david()), met_ligging(bouw_assyrie())):
        uit = os.path.join(MAP, data["id"] + ".json")
        tekst = compact(json.dumps(data, ensure_ascii=False, indent=1)) + "\n"
        if "--controle" in sys.argv:
            if not os.path.exists(uit) or open(uit, encoding="utf-8").read() != tekst:
                print(f"{data['id']}.json wijkt af van wat het script bouwt")
                fout = True
            else:
                print(f"ok: {data['id']}.json is gelijk aan de bouw")
            continue
        open(uit, "w", encoding="utf-8").write(tekst)
        sl = [s for gb in data["gebieden"] for s in gb["sleutels"]]
        print(f"geschreven: {os.path.relpath(uit)} ({len(tekst) // 1024} kB, {len(data['personen'])} personen, "
              f"{len(data['gebeurtenissen'])} gebeurtenissen, {len(data['gebieden'])} gebieden, {len(sl)} sleutels, "
              f"{len(data['steden'])} steden, {len(data['koppelingen'])} koppelingen)")
    if fout:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
