# Verslag groep nt-4: geschiedenissen 134–150 (Handelingen 2 t/m Openbaring 22, met Jesaja 11)

Bestanden:

- `public/bijbelreis/inhoud/nt-handelingen.js`: nieuw boek `handelingen` ‘Handelingen’ (`nt: true`), 11 kaarten in Wie is wie, 3 delen, 35 stappen.
- `public/bijbelreis/inhoud/nt-openbaring.js`: nieuw boek `openbaring` ‘Openbaring’ (`nt: true`), 3 kaarten in Wie is wie, 1 deel, 8 stappen.
- `public/bijbelreis/geschiedenissen/nt-4.js`: 17 records (134–150) en 6 kernwoorden (heilige-geest, vergeving, dienen, bekering, zending, openbaring).
- `public/bijbelreis/plaatsen/nt-4.js`: 11 nieuwe plaatsen.
- `scripts/bijbel-controle/nt-4.txt`: 939 regels. `python3 scripts/bijbel-check.py` geeft 0 mis, ook op de nieuwe SV-tekst (editie 1888).

Persoonskleuren worden in beide inhoudsbestanden alleen gezet als een eerder NT-bestand die naam nog geen kleur gaf. Zo blijven Petrus, Johannes enzovoort even gekleurd als in de evangeliën.

Controles:

- `node --check` op alle vier JS-bestanden is in orde, en `dump.cjs` loopt zonder fouten.
- Een eigen controle laat zien dat de volgende dingen bestaan of kloppen: alle stapsleutels, plaats-ids (`at`, routes, `ctx`, tikvragen, ontdek-kaart), alle verwijzingen (stappen, delen, records, `why`, kruisverwijzingen, symbolen/verbanden, kernwoorden), en dat elke `why` en kruisverwijzing een regel in het controlebestand heeft.
- Er zijn geen dubbele vragen.
- Zeeroutes zijn getoetst tegen het landpolygoon van `geo.json`, zodat ze niet over land lopen.
- `tests/bijbelreis.test.ts`: alles slaagt behalve één test, die faalt op `daniel:daniel:7` (‘Daniël 5:31’). Die fout komt niet uit deze groep.

## Nieuwe delen en stappen

| Deel | Stappen |
| --- | --- |
| `nt-gemeente` ‘De eerste gemeente’ (kobalt), Hand 2–12, tl 30–44 | 0 Pinksteren (2:1–13) · 1 Petrus preekt (2:14–47) · 2 de kreupele bij de Schone Poort (3:1–4:22) · 3 Ananias en Saffira (4:32–5:11) · 4 een engel opent de gevangenis (5:12–42) · 5 zeven mannen (6:1–7) · 6 Stefanus (6:8–8:3) · 7 Filippus in Samaria (8:4–25) · 8 Filippus en de kamerling (8:26–40) · 9 Eneas in Lydda (9:31–35) · 10 Tabitha (9:36–43) · 11 een engel en een laken (10:1–23) · 12 Petrus bij Cornelius (10:23–48) · 13 Petrus bevrijd (12:1–19) · 14 de dood van Herodes (12:19–25) |
| `nt-paulus` ‘Paulus: van Damascus tot Filippi’ (terra), Hand 9–16, tl 33–50 | 0 weg naar Damascus (9:1–9) · 1 Ananias en de mand (9:10–25) · 2 Jeruzalem en Tarsus (9:26–30) · 3 Antiochië (11:19–30) · 4 Cyprus (13:1–12) · 5 Antiochië in Pisidië (13:13–52) · 6 Ikonium, Lystra, Derbe (14:1–20) · 7 terug naar Antiochië (14:21–28) · 8 Troas (15:36–16:10) · 9 Lydia (16:11–15) · 10 gevangenis van Filippi (16:16–40) |
| `nt-paulusrome` ‘Paulus: van Jeruzalem naar Rome’ (koraal), Hand 21–28, tl 57–62 | 0 Milete → Jeruzalem (21:1–16) · 1 gevangen bij de tempel (21:17–22:29) · 2 ’s nachts naar Caesarea (22:30–23:35) · 3 beroep op de keizer (24:27–25:12) · 4 storm (27:1–26) · 5 schipbreuk (27:27–44) · 6 Malta (28:1–10) · 7 naar Rome (28:11–16) · 8 twee jaar in Rome (28:16–31) |
| `nt-openbaring` ‘Johannes op Patmos’ (lila), Openb 1–3, tl 95 | 0 Patmos (1:9–20) · 1–7 de brieven aan Efeze, Smyrna, Pergamum, Thyatira, Sardis, Filadelfia en Laodicea |

De opdracht noemde een deel `nt-paulus` voor 143–148. Dat zouden 20 stappen worden, en het schema vraagt 6–15 stappen per deel. Daarom zijn het twee delen geworden: `nt-paulus` (143–145) en `nt-paulusrome` (146–148).

Elk deel heeft een speurtocht met 3–4 tikvragen, 7–8 meerkeuzevragen en 1 volgordevraag. Handelingen heeft ook `trips`. Openbaring heeft geen trips, omdat er geen routes zijn.

Routes:

- Volg de tekst. Waar de Bijbel tussenstations noemt, staat er geen `recon`, bijvoorbeeld bij Troas–Samothrace–Neapolis–Filippi, Milete–Kos–Rhodus–Patara–Tyrus–Ptolemaïs–Caesarea, Jeruzalem–Antipatris–Caesarea, de vaart Caesarea–Sidon–Myra–Knidus–Salmone–Schone Havens, en Malta–Syracuse–Regium–Puteoli en Forum van Appius–Drie Tabernen–Rome.
- Waar de Bijbel alleen begin en eind noemt, staat `recon: 1`, bijvoorbeeld bij Jeruzalem–Damascus, Caesarea–Tarsus, Tarsus–Antiochië, Pafos–Perge, Attalia–Antiochië, Puteoli–Forum van Appius, de drift na Klauda en de reis door Frygië/Mysië naar Troas.
- Routes van anderen dan de hoofdpersoon hebben een eigen kleur: Filippus olijf, de boden van Cornelius bruin, Herodes rood. Daardoor telt ‘Alles wat Petrus reisde’ alleen Petrus.

## Nieuwe plaatsen (`plaatsen/nt-4.js`, coördinaten OpenBible)

`nt4_milete`, `nt4_kos` (punt midden op het eiland, zoals OpenBible), `nt4_rhodus`, `nt4_patara`, `nt4_ptolemais` (Akko), `nt4_smyrna` (İzmir), `nt4_pergamus` (naam ‘Pergamum’, SV ‘Pergamus’), `nt4_thyatira`, `nt4_sardis`, `nt4_filadelfia` (Alaşehir) en `nt4_laodicea`. Alle plaatsen hebben `c: "v"`.

## Per geschiedenis

| Nr | Titel | Status | Stappen | Vorm / ontdek |
| --- | --- | --- | --- | --- |
| 134 | De Heilige Geest wordt uitgestort | uitgewerkt, gecontroleerd | gemeente:0 | plek / koppel; kw heilige-geest |
| 135 | Petrus preekt op de Pinksterdag | uitgewerkt, gecontroleerd | gemeente:1 | plek / wiezei |
| 136 | De kreupele bij de Schone Poort en meer genezingen | uitgewerkt, gecontroleerd | gemeente:2, 4 | plek / onthul |
| 137 | Ananias en Saffira | uitgewerkt, gecontroleerd | gemeente:3 | plek / volgorde |
| 138 | Stefanus | uitgewerkt, gecontroleerd | gemeente:5, 6 | plek / verbanden; kw vergeving |
| 139 | Filippus in Samaria en de kamerling | uitgewerkt, gecontroleerd | gemeente:7, 8 | route / kaart |
| 140 | Tabitha wordt weer levend | uitgewerkt, gecontroleerd | gemeente:9, 10 | route / onthul; kw dienen |
| 141 | Cornelius, een Romeinse hoofdman | uitgewerkt, gecontroleerd | gemeente:11, 12 | route / wiezei |
| 142 | Petrus bevrijd uit de gevangenis | uitgewerkt, gecontroleerd | gemeente:13, 14 | plek / volgorde |
| 143 | Saulus op weg naar Damascus | uitgewerkt, gecontroleerd | paulus:0, 1 | route / onthul; kw bekering |
| 144 | Paulus en Barnabas op reis | uitgewerkt, gecontroleerd | paulus:2–7 | route / volgorde |
| 145 | Paulus gaat naar Filippi | uitgewerkt, gecontroleerd | paulus:8–10 | route / kaart; kw zending |
| 146 | Paulus gevangen in Jeruzalem | uitgewerkt, gecontroleerd | paulusrome:0–2 | route / wiezei |
| 147 | Een ramp op zee | uitgewerkt, gecontroleerd | paulusrome:3–5 | route / volgorde |
| 148 | Paulus in Rome | uitgewerkt, gecontroleerd | paulusrome:6–8 | route / koppel |
| 149 | Johannes op Patmos | uitgewerkt, gecontroleerd | openbaring:0–7 | symbool / symbolen; kw openbaring |
| 150 | Alle dingen nieuw | uitgewerkt, gecontroleerd | openbaring:0 (Patmos) | thema / verbanden |

Bij 149 staan in de symbolen alleen betekenissen die de tekst zelf geeft (1:20; 4:5; 5:5; 5:8; 12:9; 17:15; 19:8). Er staat geen eindtijdschema in. Bij 150 is er geen geografie voor het nieuwe Jeruzalem. De verbanden lopen van Jesaja 11:1 en 11:9, Jesaja 65:17 en Genesis 3:17 en 3:24 naar Openbaring 21–22.

## Aanpassingen na de nieuwe SV-tekst (editie 1888)

- **Regex aangepast aan de echte SV-woorden.** Op alle klinkercombinaties zijn de regels trema-tolerant gemaakt. Ook zijn ze aangepast aan andere lezingen: ‘Johannes, die genaamd is Markus’ (15:37), ‘willende Paulus behouden’ (27:43), ‘Mij uitverkoren vat’ zonder ‘een’ (9:15), ‘Parmenas, Nicolaüs’ (6:5), ‘Hij leide’ (Openb 1:17), ‘den storm’ (Ps 107:29), ‘den kop’ (Gen 3:15), ‘Indiën’ (1 Joh 1:9), ‘niet gekomen om’ (Mk 10:45), en ‘Paulus’ zuster’ en ‘Salomo’s’ met een apostrof.
- **Citaten in de teksten letterlijk gemaakt.**
  - ‘Mij uitverkoren vat’ (9:15) en ‘wij door vele verdrukkingen moeten ingaan’ (14:22).
  - ‘gebonden zijnde door den Geest’ (20:22) en ‘ik ben een Farizeër, eens Farizeërs zoon’ (23:6).
  - ‘dat Christus Jezus in de wereld gekomen is’ (1 Tim 1:15) en ‘eens ben ik gestenigd’ (2 Kor 11:25).
  - ‘een Hebreër uit de Hebreën … Farizeër’ (Fil 3:5), ‘den storm’ (Ps 107:29), ‘Indiën’ (1 Joh 1:9), ‘u komt de belofte toe’ (2:39) en ‘niet gekomen om gediend’ (Mk 10:45).
  - Citaten die over meer verzen lopen, hebben nu ‘…’ (5:3–4; Openb 1:9).
  - Twee zinnen die eigen woorden waren maar op een citaat leken, zijn hertaald of letterlijk gemaakt: ‘Kom over in Macedonië, en help ons’ en ‘Schrijf wat u ziet …’.
- **Versnummering.** Er waren geen verschuivingen in de verwijzingen van deze groep. Alle stappen en records verwijzen naar bestaande verzen, en elke inhoudelijke regel klopt op de nieuwe tekst.

## Twijfelpunten voor Martijn

1. **HSV-namen die ik niet met zekerheid kon controleren.** Er was geen HSV-tekst beschikbaar. Het gaat om ‘Zeus en Hermes’ (Hand 14:12, met de SV-namen erbij), ‘Pergamum’, ‘Thyatira’, ‘Rhodus’, ‘Schone Havens’ (de HSV heeft mogelijk ‘Goede Havens’), ‘Euroklydon’, ‘Kastor en Pollux’, ‘Nicanor/Nicolaüs’ en ‘Izebel’ (Openb 2:20). Graag tegen de HSV leggen.
2. **Handelingen 8:37** (‘Ik geloof, dat Jezus Christus de Zoon van God is’). Dit vers staat in de SV en de HSV, maar ontbreekt in een deel van de handschriften. Het wordt gebruikt in stap 8 en record 139, waar de titel van de leidraad op dit vers rust. Wil je hierover een uitleg-weetje?
3. **‘De stad van Samaria’ (8:5)** staat op het punt `samaria`. Het kan ook een andere stad in het gebied zijn; dat staat in het weetje (fs `h`).
4. **Herodes in Handelingen 12.** De naam Agrippa I komt uit Josephus en niet uit de Bijbel. In `who` staat hij als ‘Herodes (Agrippa I)’, en de uitleg staat in een weetje met fs `h`.
5. **Drie mannen die Ananias heten** (5:1, 9:10, 23:2). In `who` staan ze als ‘Ananias’ en ‘Ananias van Damascus’; de hogepriester komt niet in `who` voor. Er is een weetje over alle drie.
6. **Jakobus in Handelingen 21:18.** De tekst wordt gevolgd: ‘Jakobus en de ouderlingen’. Om verwarring met Jakobus uit Hand 12:2 te voorkomen staat hij niet in `who`.
7. **Datering.** De dateringen zijn reconstructies: Pinksteren 30 of 33, Herodes † 44 (Josephus), de eerste reis ca. 46–48, Filippi ca. 49–50, Festus ca. 59 en Openbaring ca. 95 (Irenaeus; ook ca. 68 wordt verdedigd). Alles staat in `tijdNoot`.
8. **Twee waypoints in `plaatsen.js` liggen op land** in de ondergrond, en één ligt er net op. Het gaat om `nt_egeisch` [39.9, 25.2], dat op Lemnos ligt, en `nt_messina` [38.27, 15.62], dat in het ondergrondpolygoon op land valt. `nt_cilicischezee` [36.2, 32.5] ligt net op de Turkse kust. Ik heb ze niet gebruikt en eigen zeepunten genomen. Het is aan te raden ze in `plaatsen.js` te verschuiven, bijvoorbeeld naar `nt_egeisch` [40.05, 25.55] en `nt_cilicischezee` [35.95, 32.6].
9. **Het SV-bestand van Handelingen 8:14** heeft ‘zonden zij, hen Petrus en Johannes’. Dat lijkt een transcriptiefout voor ‘tot hen’.
