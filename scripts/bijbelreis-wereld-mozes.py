#!/usr/bin/env python3
"""Bouwt public/bijbelreis/wereld/perioden/mozes.json (laag ‘De wereld in die tijd’, periode Mozes, Egypte en de woestijnreis).

Gebruik: python3 scripts/bijbelreis-wereld-mozes.py            (schrijft het JSON-bestand)
         python3 scripts/bijbelreis-wereld-mozes.py --controle (schrijft niets; faalt als het bestand afwijkt)
Daarna: node scripts/bijbelreis-wereld.mjs (register in ingang.js).

De as telt in levensjaren van Mozes (0–120): de datering van de uittocht is omstreden en de Bijbel noemt de farao niet.
Landstreken (Egypte, Sinaï-woestijn, Midian, Edom, Moab, Kanaän) zijn eigen, grove tekeningen langs de geografie (de Nijl
uit geo.json), zonder grenslijn en altijd ‘benaderd’. De route komt niet uit dit bestand maar uit de reisstappen van de
atlas (inhoud/exodus.js en numeri.js). Verantwoording: docs/bijbelreis-wereld/mozes-bronnen.md.
"""
import json, os, sys

WT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GEO = json.load(open(f"{WT}/public/bijbelreis/geo.json"))
D = "2026-11-17"

# ---------- landstreken (lng, lat) ----------
nijl = [r for r in GEO["rivers"] if r["properties"]["n"] == "Nijl"][3]["geometry"]["coordinates"]  # Aswan -> Kairo
nijl = nijl[::3] + [nijl[-1]]
rond = lambda p: [round(p[0], 3), round(p[1], 3)]
# Nijldal: een smalle strook langs de rivier (west- en oostoever), van de eerste waterval (Aswan) tot Kairo; dan de delta.
west = [rond([x - 0.17, y]) for x, y in nijl]
oost = [rond([x + 0.17, y]) for x, y in nijl]
delta_oost = [[31.45, 30.12], [31.75, 30.4], [32.25, 30.52], [32.3, 30.65], [32.2, 30.85], [32.55, 31.05]]
kust = [[32.3, 31.25], [31.85, 31.5], [31.4, 31.55], [31.0, 31.58], [30.4, 31.47], [30.05, 31.33], [29.9, 31.18]]
delta_west = [[30.2, 30.85], [30.75, 30.35], [31.02, 30.12]]
ring_egypte = oost + delta_oost + kust + delta_west + west[::-1]
ring_egypte = ring_egypte + [ring_egypte[0]]

sinai = [[32.58, 31.1], [32.6, 30.6], [32.56, 30.0], [32.72, 29.6], [32.95, 29.25], [33.12, 29.0], [33.4, 28.6], [33.62, 28.24],
         [33.95, 27.95], [34.25, 27.75], [34.33, 27.92], [34.45, 28.3], [34.52, 28.55], [34.64, 28.95], [34.78, 29.3], [34.9, 29.5],
         [34.95, 29.75], [34.9, 30.2], [34.75, 30.65], [34.5, 31.05], [34.24, 31.3], [33.8, 31.13], [33.1, 31.15], [32.58, 31.1]]
midian = [[35.02, 29.5], [34.95, 29.25], [34.85, 28.95], [34.78, 28.6], [34.62, 28.1], [34.8, 27.75], [35.15, 27.45], [35.55, 27.0],
          [36.1, 26.9], [36.55, 27.4], [36.55, 28.2], [36.1, 28.9], [35.6, 29.35], [35.25, 29.55], [35.02, 29.5]]
edom = [[35.42, 30.98], [35.3, 30.7], [35.2, 30.4], [35.1, 30.0], [35.04, 29.65], [35.25, 29.6], [35.5, 29.75], [35.65, 30.1],
        [35.75, 30.5], [35.8, 30.85], [35.7, 31.0], [35.42, 30.98]]
moab = [[35.56, 31.05], [35.57, 31.25], [35.6, 31.45], [35.85, 31.48], [36.1, 31.42], [36.15, 31.2], [36.0, 31.05], [35.75, 31.04], [35.56, 31.05]]
kanaan = [[34.38, 31.42], [34.55, 31.7], [34.72, 32.0], [34.85, 32.4], [34.96, 32.8], [35.08, 32.95], [35.12, 33.1], [35.4, 33.12],
          [35.6, 33.1], [35.6, 32.8], [35.56, 32.4], [35.53, 32.0], [35.48, 31.7], [35.42, 31.4], [35.38, 31.1], [35.1, 30.95],
          [34.75, 31.0], [34.5, 31.2], [34.38, 31.42]]

def streek(id, naam, kleur, ring, bron, tekst):
    geo = {"type": "Polygon", "coordinates": [ring]}
    return {"id": id, "naam": naam, "soort": "streek", "kleur": kleur, "bron": bron,
            "sleutels": [{"jaar": 0, "betrouwbaarheid": "benaderd", "geometrie": geo},
                         {"jaar": 120, "betrouwbaarheid": "benaderd", "geometrie": geo}]}

gebieden = [
    streek("egypte", "Egypte", "terra", ring_egypte, ["Exodus 1:11", "Exodus 12:37", "wiki-nieuwe-rijk"],
           "Het land aan de Nijl: het smalle dal van de rivier en de delta. Waar de Israëlieten woonden en werkten, in het oosten van de delta (Gosen)."),
    streek("sinai", "Sinaï-woestijn", "oker", sinai, ["Exodus 16:1", "Exodus 19:1–2", "Numeri 10:12"],
           "De Bijbel noemt hier verschillende woestijnen: Sur, Sin, Sinaï, Paran en Zin. Waar ze precies begonnen en ophielden, weten we niet."),
    streek("midian", "Midian", "lila", midian, ["Exodus 2:15", "Handelingen 7:29"],
           "Het land van Jethro, waar Mozes veertig jaar herder was. Meestal zoekt men het ten oosten van de Golf van Akaba."),
    streek("edom", "Edom", "koraal", edom, ["Numeri 20:14–21", "Numeri 20:23"],
           "Het bergland van Seïr, waar de nakomelingen van Ezau woonden. De koning van Edom liet Israël niet door zijn land trekken."),
    streek("moab", "Moab", "olijf", moab, ["Numeri 21:13", "Numeri 22:1"],
           "Het land van de Moabieten, ten zuiden van de beek Arnon. De ‘vlakke velden van Moab’ lagen noordelijker, aan de Jordaan bij Jericho."),
    streek("kanaan", "Kanaän", "salie", kanaan, ["Numeri 13:2", "Deuteronomium 34:1–4"],
           "Het land dat God aan Abraham, Izak en Jakob beloofd had. Mozes mocht het van de berg Nebo zien, maar kwam er niet in."),
]

# ---------- steden: legerplaatsen langs de route (ligging uit plaatsen.js) ----------
NAMEN = {"ramses": "Raämses", "sukkotheg": "Sukkoth", "etham": "Etham", "pihachiroth": "Pi-Hachiroth", "schelfzee": "Schelfzee",
         "mara": "Mara", "elim": "Elim", "refidim": "Rafidim", "sinai": "Berg Sinaï", "kibroth": "Kibroth-Taäva", "hazeroth": "Hazeroth",
         "kadesbarnea": "Kades-Barnea", "hor": "Berg Hor", "ezeongeber": "Ezeon-Geber", "punon": "Punon", "arnon": "Beek Arnon",
         "hesbon": "Hesbon", "edrei": "Edreï", "sittim": "Sittim", "nebo": "Berg Nebo"}
def stad(id, tekst, bron):
    return {"id": id, "naam": NAMEN[id], "plaatsId": id, "tekst": tekst, "bron": bron}
steden = [
    stad("ramses", "Een van de schatsteden die Israël voor de farao moest bouwen (Exodus 1:11). Hier begon de uittocht.", "Exodus 12:37"),
    stad("sukkotheg", "De eerste legerplaats na Raämses.", "Exodus 12:37"),
    stad("etham", "‘aan het einde der woestijn’ (Exodus 13:20).", "Exodus 13:20"),
    stad("pihachiroth", "Hier zat het volk klem tussen het leger van de farao en de zee.", "Exodus 14:2"),
    stad("schelfzee", "God maakte een weg door de zee: ‘de wateren waren hun een muur’ (Exodus 14:22).", "Exodus 14:22"),
    stad("mara", "Het water was bitter; God maakte het zoet.", "Exodus 15:23–25"),
    stad("elim", "‘twaalf waterfonteinen, en zeventig palmbomen’ (Exodus 15:27).", "Exodus 15:27"),
    stad("refidim", "Water uit de rots en de strijd tegen Amalek.", "Exodus 17:1–16"),
    stad("sinai", "De berg van God, ook Horeb genoemd. Hier gaf God de wet en werd de tabernakel gebouwd.", ["Exodus 3:1", "Exodus 19:1–2"]),
    stad("kibroth", "Het volk klaagt om vlees en krijgt kwartels.", "Numeri 11:34"),
    stad("hazeroth", "Mirjam en Aäron spreken tegen Mozes.", "Numeri 11:35"),
    stad("kadesbarnea", "Vanaf hier gingen de twaalf verspieders het land in. Hier stierf Mirjam.", ["Numeri 13:26", "Numeri 20:1"]),
    stad("hor", "Hier stierf Aäron, ‘aan de pale van het land van Edom’ (Numeri 20:23).", ["Numeri 20:23", "Numeri 20:28"]),
    stad("ezeongeber", "Een legerplaats aan de Golf van Akaba.", "Numeri 33:35"),
    stad("punon", "Een legerplaats na de berg Hor; de Statenvertaling schrijft ‘Funon’ (Numeri 33:42).", "Numeri 33:42"),
    stad("arnon", "‘de Arnon is de landpale van Moab’ (Numeri 21:13).", "Numeri 21:13"),
    stad("edrei", "Hier won Israël van Og, de koning van Basan.", "Numeri 21:33–35"),
    stad("sittim", "De laatste legerplaats vóór de Jordaan, in de vlakke velden van Moab.", ["Numeri 25:1", "Numeri 22:1"]),
    stad("nebo", "Van deze berg zag Mozes het beloofde land. Hier stierf hij.", ["Deuteronomium 34:1", "Deuteronomium 34:5"]),
]

# Kleine legerplaatsen (vaak met onbekende ligging) zijn ‘haltes’: een naam op de kaart, geen knop.
for s_ in steden:
    if s_["id"] in {"sukkotheg", "etham", "pihachiroth", "mara", "refidim", "kibroth", "hazeroth", "ezeongeber", "punon", "arnon", "edrei"}:
        s_["halte"] = True

# ---------- personen (as: levensjaren van Mozes) ----------
personen = [
    {"id": "mozes", "naam": "Mozes", "personenId": "mozes",
     "van": {"jaar": 0, "status": "expliciet", "bron": "Exodus 2:2", "opmerking": "Het beginpunt van deze tijdlijn: het jaar waarin Mozes geboren werd."},
     "tot": {"jaar": 120, "leeftijd": 120, "status": "expliciet", "bron": "Deuteronomium 34:7", "einde": "stierf"},
     "ouder": None, "rol": "Gered uit het water, veertig jaar in Egypte, veertig jaar herder in Midian en veertig jaar leider van het volk in de woestijn.",
     "ref": ["Exodus 2:1–10", "Handelingen 7:20–36", "Deuteronomium 34:5–7"], "verhaal": "v21"},
    {"id": "aaron", "naam": "Aäron", "personenId": "aaron",
     "van": {"jaar": -3, "status": "berekend", "bron": "Exodus 7:7", "opmerking": "Mozes was 80 en Aäron 83 toen zij tot de farao spraken (Exodus 7:7): Aäron is drie jaar ouder. Zijn lijn begint daarom vóór deze tijdlijn."},
     "tot": {"jaar": 119.55, "leeftijd": 123, "status": "berekend", "bron": ["Numeri 33:38–39", "Numeri 20:28"], "einde": "stierf",
             "opmerking": "Hij stierf op de berg Hor ‘in het veertigste jaar na den uittocht’, 123 jaar oud (Numeri 33:38–39). Mozes was toen 120 (uitgerekend)."},
     "ouder": None, "rol": "Broer van Mozes. Hij sprak voor Mozes tegen de farao en werd de eerste hogepriester.",
     "ref": ["Exodus 4:14–16", "Exodus 7:7", "Numeri 20:22–29"], "verhaal": "v24"},
    {"id": "mirjam", "naam": "Mirjam", "personenId": "mirjam",
     "van": {"jaar": None, "status": "benaderd", "begin": "genoemd", "bron": ["Exodus 2:4", "Numeri 26:59"],
             "opmerking": "Wanneer Mirjam geboren werd, staat niet in de Bijbel. Zij was ouder dan Mozes: ‘zijn zuster’ hield de wacht bij het kistje (Exodus 2:4), en Numeri 26:59 noemt maar één zuster, Mirjam."},
     "tot": {"jaar": 119.15, "status": "benaderd", "marge": [119, 120], "bron": "Numeri 20:1", "einde": "stierf",
             "opmerking": "Zij stierf te Kades ‘in de eerste maand’ (Numeri 20:1). Welk jaar staat er niet bij; uit wat volgt (Numeri 20:22–29; 33:38) is het waarschijnlijk het veertigste jaar na de uittocht."},
     "ouder": None, "rol": "Zus van Mozes en Aäron, profetes. Na de doortocht door de Schelfzee zong zij met een trommel in haar hand.",
     "ref": ["Exodus 2:4", "Exodus 15:20–21", "Numeri 20:1"], "verhaal": "v26"},
    {"id": "jethro", "naam": "Jethro", "personenId": "jethro",
     "van": {"jaar": None, "status": "benaderd", "begin": "genoemd", "bron": "Exodus 2:16–21", "opmerking": "Zijn lijn begint als Mozes in Midian komt; wanneer hij geboren werd, staat er niet."},
     "tot": {"jaar": 80.32, "status": "benaderd", "bron": "Exodus 18:27", "einde": "onbekend", "opmerking": "Na zijn bezoek ging hij terug naar zijn land (Exodus 18:27)."},
     "ouder": None, "rol": "Priester in Midian, de schoonvader van Mozes. Hij gaf Mozes de raad om helpers aan te stellen.",
     "ref": ["Exodus 2:16–21", "Exodus 3:1", "Exodus 18:1–27"], "verhaal": "v22"},
    {"id": "zippora", "naam": "Zippora", "personenId": "zippora",
     "van": {"jaar": None, "status": "benaderd", "begin": "genoemd", "bron": "Exodus 2:21", "opmerking": "Haar lijn begint als Mozes in Midian komt."},
     "tot": {"jaar": 80.32, "status": "benaderd", "bron": "Exodus 18:2–6", "einde": "onbekend", "opmerking": "Zij komt met haar vader en haar zonen bij Mozes aan de berg Gods (Exodus 18:2–6). Daarna noemt de Bijbel haar niet meer bij naam."},
     "ouder": "jethro", "rol": "Dochter van Jethro en vrouw van Mozes, moeder van Gersom en Eliëzer.",
     "ref": ["Exodus 2:21–22", "Exodus 18:2–6"], "verhaal": "v22"},
    {"id": "jozua", "naam": "Jozua", "personenId": "jozua",
     "van": {"jaar": None, "status": "benaderd", "begin": "genoemd", "bron": "Exodus 17:9", "opmerking": "Zijn lijn begint als de Bijbel hem voor het eerst noemt, bij de strijd tegen Amalek. Hoe oud hij toen was, staat er niet."},
     "tot": {"jaar": None, "status": "expliciet", "bron": "Jozua 24:29", "einde": "leeft door", "opmerking": "Na Mozes leidt hij het volk het land in. Hij stierf 110 jaar oud (Jozua 24:29), lang na het einde van deze tijdlijn."},
     "ouder": None, "rol": "De dienaar van Mozes en daarna zijn opvolger.",
     "ref": ["Exodus 17:9–14", "Exodus 33:11", "Numeri 27:18–23"], "verhaal": "v28"},
    {"id": "kaleb", "naam": "Kaleb", "personenId": "kaleb",
     "van": {"jaar": 41, "status": "berekend", "bron": "Jozua 14:7", "opmerking": "Hij was veertig toen Mozes hem uit Kades-Barnea uitzond om het land te verspieden (Jozua 14:7), in het tweede jaar na de uittocht. Uitgerekend: een jaar verschil is mogelijk."},
     "tot": {"jaar": 126, "status": "berekend", "bron": "Jozua 14:10", "einde": "leeft door", "opmerking": "Vijfenveertig jaar na de verspieding was hij nog sterk, 85 jaar oud (Jozua 14:10–11)."},
     "ouder": None, "rol": "Een van de twaalf verspieders. Met Jozua vertrouwde hij op God; zij tweeën mochten het land in.",
     "ref": ["Numeri 13:30", "Numeri 14:6–9", "Jozua 14:6–14"], "verhaal": "v33"},
]

# ---------- gebeurtenissen ----------
def ev(id, titel, tekst, jaar, status, bron, personen=(), plaats=None, verhaal=None, belangrijk=False, tot=None, marge=None, opmerking=None, kleur=None):
    e = {"id": id, "titel": titel, "tekst": tekst, "jaar": jaar, "tot": tot, "status": status, "bron": bron, "personen": list(personen),
         "plaats": plaats, "verhaal": verhaal, "belangrijk": belangrijk}
    if marge: e["marge"] = marge
    if opmerking: e["opmerking"] = opmerking
    if kleur: e["kleur"] = kleur
    return e

OM_MAAND = "Waar in het jaar Mozes jarig was, staat niet in de Bijbel. Daarom kan dit een jaar verschillen."
gebeurtenissen = [
    ev("geboorte", "Mozes wordt geboren en bewaard", "Zijn moeder verbergt hem drie maanden en legt hem dan in een kistje van biezen in de Nijl. De dochter van de farao vindt hem.",
       0, "expliciet", "Exodus 2:1–10", ["mozes", "mirjam"], "gosen", "v21", True),
    ev("vlucht", "Mozes vlucht naar Midian", "Veertig jaar oud kiest Mozes de kant van zijn volk. Als de farao hem wil doden, vlucht hij naar Midian.",
       40, "expliciet", ["Handelingen 7:23–29", "Exodus 2:11–15"], ["mozes"], "ex_midian", "v22", True),
    ev("midian", "Herder in Midian", "Mozes trouwt met Zippora en hoedt de schapen van Jethro. Hij blijft veertig jaar in Midian.",
       40.3, "expliciet", ["Handelingen 7:29–30", "Exodus 2:16–22"], ["mozes", "jethro", "zippora"], None, "v22", False, tot=79.45),
    ev("braamstruik", "De brandende braamstruik", "Bij de berg Horeb roept God Mozes om Zijn volk uit Egypte te leiden. Aäron komt hem tegemoet.",
       79.55, "berekend", ["Handelingen 7:30", "Exodus 3:1–10", "Exodus 4:27"], ["mozes", "aaron"], "sinai", "v23", True,
       opmerking="Veertig jaar na de vlucht (Handelingen 7:23 en 7:30): Mozes is dan 80."),
    ev("voor-farao", "Voor de farao: tien plagen", "Mozes en Aäron zeggen tegen de farao: ‘Laat Mijn volk trekken’ (Exodus 5:1). De farao weigert, en God zendt tien plagen over Egypte.",
       79.75, "expliciet", ["Exodus 7:7", "Exodus 5:1"], ["mozes", "aaron"], "egypte", "v24", True,
       opmerking="‘Mozes was tachtig jaar oud’ en Aäron ‘drie en tachtig jaar oud, toen zij tot Farao spraken’ (Exodus 7:7). De Bijbel noemt de farao niet bij naam."),
    ev("uittocht", "Het Pascha en de uittocht", "Na het Pascha trekt het volk uit Raämses weg, op de vijftiende dag van de eerste maand.",
       80.2, "berekend", ["Numeri 33:3", "Exodus 12:37"], ["mozes", "aaron"], "ramses", "v25", True, opmerking=OM_MAAND),
    ev("schelfzee", "Droog door de Schelfzee", "God maakt een weg door de zee. Het volk gaat erdoor op het droge; het leger van de farao verdrinkt.",
       80.225, "berekend", ["Exodus 14:21–31", "Exodus 15:20–21"], ["mozes", "mirjam"], "schelfzee", "v26", True,
       opmerking="Waar de doortocht precies was, weten we niet; zie de kaart voor andere mogelijke plekken."),
    ev("manna", "Manna in de woestijn Sin", "In de tweede maand na de uittocht geeft God brood uit de hemel: het manna.",
       80.28, "berekend", ["Exodus 16:1", "Exodus 16:35"], ["mozes", "aaron"], "sin", "v27"),
    ev("amalek", "Strijd tegen Amalek", "Bij Rafidim vecht Jozua tegen Amalek. Aäron en Hur houden de handen van Mozes omhoog.",
       80.3, "berekend", "Exodus 17:8–16", ["mozes", "aaron", "jozua"], "refidim", "v28"),
    ev("sinai-wet", "Bij de Sinaï: de Tien Geboden", "In de derde maand komt het volk bij de berg Sinaï. God geeft er Zijn wet.",
       80.325, "berekend", ["Exodus 19:1", "Exodus 20:1–17"], ["mozes", "aaron", "jozua"], "sinai", "v29", True),
    ev("gouden-kalf", "Het gouden kalf", "Terwijl Mozes veertig dagen op de berg is, maakt het volk een gouden kalf.",
       80.45, "berekend", ["Exodus 24:18", "Exodus 32:1–6"], ["mozes", "aaron", "jozua"], "sinai", "v30"),
    ev("tabernakel", "De tabernakel opgericht", "In het tweede jaar, op de eerste dag van de eerste maand, wordt de tabernakel opgericht.",
       81.16, "berekend", "Exodus 40:17", ["mozes", "aaron"], "sinai", "v31", opmerking=OM_MAAND),
    ev("vertrek-sinai", "Vertrek van de Sinaï", "De wolk gaat op van de tabernakel: het volk trekt verder, naar de woestijn Paran.",
       81.3, "berekend", ["Numeri 10:11–12"], ["mozes"], "sinai", None),
    ev("verspieders", "Twaalf verspieders", "Vanuit Kades gaan twaalf mannen het land in. Alleen Jozua en Kaleb zeggen: met God kunnen we het land in.",
       81.42, "berekend", ["Numeri 13:26", "Numeri 14:6–9", "Jozua 14:7"], ["mozes", "jozua", "kaleb"], "kadesbarnea", "v33", True,
       opmerking="Kaleb was toen veertig (Jozua 14:7). Het jaar is uitgerekend: kort na het vertrek van de Sinaï in het tweede jaar (Numeri 10:11)."),
    ev("veertig-jaar", "Veertig jaar in de woestijn", "Omdat het volk God niet vertrouwde, moest het veertig jaar in de woestijn blijven. Van Kades tot de beek Zered duurde het nog 38 jaar. Waar ze al die tijd precies waren, weten we niet.",
       81.48, "expliciet", ["Numeri 14:33–34", "Deuteronomium 2:14"], [], None, None, False, tot=119.1, kleur="zand"),
    ev("mirjam-sterft", "Mirjam sterft te Kades", "Het volk is weer in Kades. Mirjam sterft en wordt daar begraven.",
       119.15, "benaderd", "Numeri 20:1", ["mirjam"], "kadesbarnea", "v34", marge=[119, 120],
       opmerking="‘in de eerste maand’ (Numeri 20:1); het jaar staat er niet bij (waarschijnlijk het veertigste jaar na de uittocht)."),
    ev("aaron-sterft", "Aäron sterft op de berg Hor", "Aäron sterft op de top van de berg Hor, 123 jaar oud. Zijn zoon Eleazar wordt hogepriester.",
       119.55, "berekend", ["Numeri 20:28", "Numeri 33:38–39"], ["aaron"], "hor", "v34", True),
    ev("koperen-slang", "De koperen slang", "Op de weg om Edom heen klaagt het volk. God zendt slangen; wie naar de koperen slang kijkt, blijft leven.",
       119.62, "berekend", "Numeri 21:4–9", ["mozes"], None, "v34", True,
       opmerking="Na de dood van Aäron (Numeri 21:4). Waar het was, noemt de Bijbel niet."),
    ev("velden-moab", "In de vlakke velden van Moab", "Na de overwinning op Sihon en Og legert het volk zich aan de Jordaan, tegenover Jericho. Daar probeert Bileam het volk te vervloeken.",
       119.72, "berekend", ["Numeri 21:21–35", "Numeri 22:1"], ["mozes"], "sittim", "v35"),
    ev("afscheid", "Mozes neemt afscheid", "In het veertigste jaar, in de elfde maand, spreekt Mozes het volk nog één keer toe. ‘Ik ben heden honderd en twintig jaren oud’ (Deuteronomium 31:2).",
       119.9, "expliciet", ["Deuteronomium 1:3", "Deuteronomium 31:2"], ["mozes", "jozua"], "sittim", "v36"),
    ev("mozes-sterft", "Mozes sterft op de berg Nebo", "Vanaf de berg Nebo laat God Mozes het hele land zien. Daar sterft hij, 120 jaar oud.",
       120, "expliciet", ["Deuteronomium 34:1–7"], ["mozes"], "nebo", "v36", True),
]

# ---------- de reis (de lijnen komen uit de reisstappen van de atlas) ----------
reis = {
    "naam": "De reis van Mozes en het volk",
    "bron": ["Exodus 12:37", "Numeri 33:1–49", "Deuteronomium 2:14"],
    "opmerking": "Dezelfde routes als in de reizen van de Bijbelreis (Exodus en Numeri); een gestippelde lijn is een reconstructie. Een dunne lijn: Mozes reist alleen (zijn vlucht naar Midian, naar de berg Horeb en terug naar Egypte).",
    "delen": [
        {"stap": "exodus:mozes:2", "van": 40.0, "tot": 40.25, "alleen": True},
        {"stap": "exodus:mozes:4", "van": 79.47, "tot": 79.55, "alleen": True},
        {"stap": "exodus:mozes:6", "van": 79.57, "tot": 79.67, "alleen": True},
        {"stap": "exodus:uittocht:3", "van": 80.2, "tot": 80.21},
        {"stap": "exodus:uittocht:4", "van": 80.21, "tot": 80.218},
        {"stap": "exodus:uittocht:5", "van": 80.219, "tot": 80.225},
        {"stap": "exodus:uittocht:7", "van": 80.228, "tot": 80.26},
        {"stap": "exodus:sinai:0", "van": 80.262, "tot": 80.28},
        {"stap": "exodus:sinai:1", "van": 80.284, "tot": 80.3},
        {"stap": "exodus:sinai:3", "van": 80.303, "tot": 80.325},
        {"stap": "numeri:woestijn:0", "van": 81.3, "tot": 81.34},
        {"stap": "numeri:woestijn:2", "van": 81.345, "tot": 81.365},
        {"stap": "numeri:woestijn:3", "van": 81.37, "tot": 81.42},
        {"stap": "numeri:woestijn:6", "van": 119.3, "tot": 119.5},
        {"stap": "numeri:woestijn:7", "r": [0, 1], "van": 119.56, "tot": 119.64},
        {"stap": "numeri:woestijn:8", "van": 119.645, "tot": 119.68},
        {"stap": "numeri:woestijn:9", "r": [0, 1], "van": 119.68, "tot": 119.705},
        {"stap": "numeri:moab:0", "van": 119.705, "tot": 119.72},
        {"stap": "numeri:moab:4", "van": 119.94, "tot": 119.99},
    ],
    "onbekend": [{"van": 81.5, "tot": 119.28, "tekst": "38 jaar in de woestijn: waar het volk precies trok, weten we niet (Deuteronomium 2:14)."}],
}

koppelingen = [
    {"verhaal": "v21", "jaar": 0, "personen": ["mozes", "mirjam", "aaron"], "gebeurtenissen": ["geboorte"]},
    {"verhaal": "v22", "jaar": 40, "tot": 79.45, "status": "expliciet", "personen": ["mozes", "jethro", "zippora"], "gebeurtenissen": ["vlucht", "midian"],
     "opmerking": "Mozes is veertig als hij voor zijn volk kiest (Handelingen 7:23). Daarna woont hij veertig jaar in Midian (Handelingen 7:30)."},
    {"verhaal": "v23", "jaar": 79.55, "personen": ["mozes", "aaron"], "gebeurtenissen": ["braamstruik"]},
    {"verhaal": "v24", "jaar": 79.75, "personen": ["mozes", "aaron"], "gebeurtenissen": ["voor-farao"]},
    {"verhaal": "v25", "jaar": 80.2, "personen": ["mozes", "aaron"], "gebeurtenissen": ["uittocht"]},
    {"verhaal": "v26", "jaar": 80.225, "personen": ["mozes", "aaron", "mirjam"], "gebeurtenissen": ["schelfzee"]},
    {"verhaal": "v27", "jaar": 80.28, "personen": ["mozes", "aaron"], "gebeurtenissen": ["manna"]},
    {"verhaal": "v28", "jaar": 80.3, "personen": ["mozes", "aaron", "jozua"], "gebeurtenissen": ["amalek"]},
    {"verhaal": "v29", "jaar": 80.325, "personen": ["mozes", "aaron", "jozua"], "gebeurtenissen": ["sinai-wet"]},
    {"verhaal": "v30", "jaar": 80.45, "personen": ["mozes", "aaron", "jozua"], "gebeurtenissen": ["gouden-kalf"]},
    {"verhaal": "v31", "jaar": 81.16, "personen": ["mozes", "aaron"], "gebeurtenissen": ["tabernakel"]},
    {"verhaal": "v32", "jaar": 81.17, "status": "benaderd", "personen": ["mozes", "aaron"], "gebeurtenissen": ["tabernakel"],
     "opmerking": "Leviticus 8–10 volgt op het oprichten van de tabernakel (Exodus 40:17). Leviticus 16 noemt de zevende maand (16:29), maar geen jaar."},
    {"verhaal": "v33", "jaar": 81.42, "personen": ["mozes", "jozua", "kaleb"], "gebeurtenissen": ["verspieders", "veertig-jaar"]},
    {"verhaal": "v34", "jaar": 119.15, "tot": 119.62, "status": "benaderd", "personen": ["mirjam", "aaron", "mozes"], "gebeurtenissen": ["mirjam-sterft", "aaron-sterft", "koperen-slang"],
     "opmerking": "Numeri 20–21 speelt in het veertigste jaar na de uittocht: Mirjam en Aäron sterven, en daarna komt de koperen slang."},
    {"verhaal": "v35", "jaar": 119.72, "personen": ["mozes"], "gebeurtenissen": ["velden-moab"]},
    {"verhaal": "v36", "jaar": 119.9, "tot": 120, "status": "expliciet", "personen": ["mozes", "jozua"], "gebeurtenissen": ["afscheid", "mozes-sterft"],
     "opmerking": "Het veertigste jaar na de uittocht, de elfde maand (Deuteronomium 1:3). Mozes is 120 (Deuteronomium 31:2; 34:7)."},
]

bronnen = [
    {"id": "sv", "soort": "bijbel", "titel": "Statenvertaling: Exodus, Numeri, Deuteronomium, Jozua 14, Handelingen 7 (controlebasis)", "geraadpleegd": D},
    {"id": "bas-uittocht", "soort": "historisch", "titel": "Biblical Archaeology Society, “Dating the Exodus”", "url": "https://library.biblicalarchaeology.org/sidebar/dating-the-exodus/", "geraadpleegd": D},
    {"id": "wiki-datum-uittocht", "soort": "historisch", "titel": "Wikipedia, “Date of the Exodus”", "url": "https://en.wikipedia.org/wiki/Date_of_the_Exodus", "licentie": "CC BY-SA 4.0 (alleen als bron gebruikt, geen tekst overgenomen)", "geraadpleegd": D},
    {"id": "wiki-nieuwe-rijk", "soort": "historisch", "titel": "Wikipedia, “New Kingdom of Egypt”", "url": "https://en.wikipedia.org/wiki/New_Kingdom_of_Egypt", "licentie": "CC BY-SA 4.0 (alleen als bron gebruikt, geen tekst overgenomen)", "geraadpleegd": D},
    {"id": "wiki-pi-ramesse", "soort": "historisch", "titel": "Wikipedia, “Pi-Ramesses”", "url": "https://en.wikipedia.org/wiki/Pi-Ramesses", "licentie": "CC BY-SA 4.0 (alleen als bron gebruikt, geen tekst overgenomen)", "geraadpleegd": D},
    {"id": "bijbelreis-plaatsen", "soort": "dataset", "titel": "Bijbelreis, plaatsen en reisroutes (plaatsen.js, inhoud/exodus.js en numeri.js); liggingen gecontroleerd met OpenBible.info en Pleiades (docs/bijbelreis-audit/plaatsen.md)", "geraadpleegd": D},
    {"id": "natural-earth", "soort": "dataset", "titel": "Natural Earth (ondergrond, Nijl en kust; publiek domein)", "url": "https://www.naturalearthdata.com/", "geraadpleegd": D},
]

info = [
    {"kop": "Waarom staan er geen jaartallen?", "status": "benaderd", "bron": ["1 Koningen 6:1", "bas-uittocht", "wiki-datum-uittocht"],
     "tekst": "Het jaar van de uittocht staat niet vast. Salomo begon de tempel te bouwen ‘in het vierhonderd en tachtigste jaar, na den uitgang’ van Israël uit Egypte (1 Koningen 6:1). Wie dat terugrekent, komt rond 1446 v.Chr. uit: de vroege datering. Veel onderzoekers kiezen een latere datering, in de 13e eeuw v.Chr. De Bijbel noemt de farao niet bij naam. Daarom telt deze tijdlijn in levensjaren van Mozes: die staan wel in de Bijbel."},
    {"kop": "Hoe is er gerekend?", "status": "berekend", "bron": ["Handelingen 7:23–30", "Exodus 7:7", "Deuteronomium 34:7", "Numeri 33:38"],
     "tekst": "Mozes was 40 toen hij naar Midian vluchtte (Handelingen 7:23–29), 80 toen hij met Aäron voor de farao stond (Exodus 7:7) en 120 toen hij stierf (Deuteronomium 34:7). Tijdens de reis noemt de Bijbel maanden na de uittocht: de woestijn Sin in de tweede maand (Exodus 16:1), de Sinaï in de derde (19:1), de tabernakel in het tweede jaar (40:17), het vertrek van de Sinaï (Numeri 10:11) en de dood van Aäron in het veertigste jaar (33:38). Zo staan de gebeurtenissen op volgorde. Waar in het jaar Mozes jarig was, weten we niet: een jaar op deze tijdlijn kan dus een jaar verschillen."},
    {"kop": "En wat gebeurde er tegelijk in de wereld?", "status": "benaderd", "bron": ["wiki-nieuwe-rijk", "wiki-pi-ramesse", "bas-uittocht"],
     "tekst": "Dat kunnen we niet zeker zeggen, omdat het jaar van de uittocht niet vaststaat. Was de uittocht rond 1446 v.Chr., dan was Egypte in die tijd een groot rijk dat tot ver in Kanaän en Syrië reikte. Was hij in de 13e eeuw v.Chr., dan werd in die tijd in de oostelijke Nijldelta de grote stad Pi-Ramesse gebouwd; veel onderzoekers denken dat dit de stad Raämses uit Exodus 1:11 is. In beide gevallen is het de tijd die historici het Nieuwe Rijk van Egypte noemen (ongeveer 1570–1070 v.Chr.). Verder gaan we niet: geen farao en geen gebeurtenis elders in de wereld als feit."},
    {"kop": "De route op de kaart", "status": "benaderd", "bron": ["Numeri 33:1–49", "Deuteronomium 2:14", "bijbelreis-plaatsen"],
     "tekst": "De lijn is dezelfde als in de reizen van de Bijbelreis. Veel legerplaatsen zijn niet met zekerheid terug te vinden: een open rondje betekent: waar precies, weten we niet. Bij de berg Sinaï, de Schelfzee en de berg Hor staan kleine ringen op andere plekken die onderzoekers voorstellen. Een gestippelde lijn is een reconstructie: de Bijbel noemt daar alleen begin en eind. Waar het volk in de 38 jaar tussen Kades en de beek Zered precies trok, weten we niet. Egypte, Midian, Edom, Moab en Kanaän staan er als landstreken, zonder grenzen."},
]

data = {
    "id": "mozes",
    "titel": "Mozes, Egypte en de woestijnreis",
    "ondertitel": "Van het kistje in de Nijl tot de berg Nebo: 120 jaar, in levensjaren van Mozes",
    "as": {"soort": "leeftijd", "wie": "Mozes", "van": 0, "tot": 120, "stap": 1, "label": "jaar in het leven van Mozes", "status": "berekend",
           "uitleg": "Deze tijdlijn telt niet in jaren voor Christus, maar in levensjaren van Mozes: jaar 80 betekent: toen Mozes 80 jaar oud was. Die getallen staan in de Bijbel; een jaartal in onze jaartelling niet.",
           "tempo": [{"van": 39.9, "tot": 40.35, "factor": 0.025}, {"van": 79.42, "tot": 79.7, "factor": 0.012}, {"van": 79.7, "tot": 80.17, "factor": 0.04},
                     {"van": 80.17, "tot": 80.36, "factor": 0.0025}, {"van": 80.36, "tot": 81.1, "factor": 0.06}, {"van": 81.1, "tot": 81.3, "factor": 0.012}, {"van": 81.3, "tot": 81.5, "factor": 0.006},
                     {"van": 119.1, "tot": 120, "factor": 0.012}]},
    "start": 0,
    "bronnen": bronnen,
    "info": info,
    "personen": personen,
    "gebeurtenissen": gebeurtenissen,
    "gebieden": gebieden,
    "steden": steden,
    "reis": reis,
    "koppelingen": koppelingen,
}

def mooi(o, ind=0):
    """JSON met inspringing; korte objecten en lijsten (en coördinatenringen) op één regel."""
    een = json.dumps(o, ensure_ascii=False, separators=(", ", ": "))
    if len(een) + ind <= 150 or (isinstance(o, list) and o and all(isinstance(x, list) and all(isinstance(y, (int, float)) for y in x) for x in o)):
        return een
    sp = "  " * (ind + 1)
    if isinstance(o, dict):
        return "{\n" + ",\n".join(sp + json.dumps(k, ensure_ascii=False) + ": " + mooi(v, ind + 1) for k, v in o.items()) + "\n" + "  " * ind + "}"
    if isinstance(o, list):
        return "[\n" + ",\n".join(sp + mooi(v, ind + 1) for v in o) + "\n" + "  " * ind + "]"
    return een
txt = mooi(data) + "\n"
UIT = f"{WT}/public/bijbelreis/wereld/perioden/mozes.json"
if "--controle" in sys.argv:
    if open(UIT, encoding="utf-8").read() != txt:
        sys.exit("bijbelreis-wereld-mozes: mozes.json wijkt af van de bouw; draai python3 scripts/bijbelreis-wereld-mozes.py")
    print("bijbelreis-wereld-mozes: mozes.json klopt")
else:
    open(UIT, "w", encoding="utf-8").write(txt)
    print("bijbelreis-wereld-mozes: geschreven", UIT)
