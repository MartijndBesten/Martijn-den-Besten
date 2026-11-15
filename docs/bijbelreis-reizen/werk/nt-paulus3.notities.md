# Notities bij het deel `nt-paulus3` (Handelingen 18:23–20:38)

Paulus: de derde reis. 10 stappen, van Antiochië tot het afscheid in Milete (20:38). Het bestaande deel `nt-paulusrome` begint daarna in Milete (21:1).

## Nieuwe plaatsen

Coördinaten uit OpenBible.info Bible Geocoding Data (CC BY 4.0), opgezocht met `scripts/reizen/plaats-zoek.py --exact`.

| Sleutel | Naam | `c` | Punt (lat, lng) | Score | Grond |
| --- | --- | --- | --- | ---: | --- |
| `p3_frygie` | Frygië | r | 39.0, 31.0 | 1000 | Phrygia, ‘point in region’. Streek, dus `r`. |
| `p3_alexandrie` | Alexandrië | v | 31.1825, 29.8965 | 1000 | Alexandria, punt in de zichtbare resten; naam bleef in gebruik. Alleen als geboorteplaats van Apollos (18:24); er loopt geen route heen. |
| `p3_assus` | Assus | v | 39.4906, 26.3367 | 1000 | Assos (Behramkale), punt in de zichtbare resten. |
| `p3_mitylene` | Mitylene | v | 39.1105, 26.547 | 1000 | Mytilini op Lesbos, punt bij het antieke theater. |
| `p3_chios` | Chios | v | 38.3725, 26.1375 | 1000 | Eiland Chios; OpenBible geeft de stad Chios aan de oostkust (‘settlement on island’). Type `gebied` (eiland), zoals Patmos en Samothrake. |
| `p3_samos` | Samos | v | 37.75, 26.8333 | 1000 | Eiland Samos, ‘point on island’ (midden van het eiland). Type `gebied`. |
| `p3_trogyllium` | Trogyllium | w | 37.6594, 27.0033 | 1000 | Kaap Mykale/Trogilium, maar alleen ‘point in region’. Daarom `w` in plaats van `v`: de kaap is bekend, de ankerplaats niet. Type `berg` (kaap), zoals Salmone. |

Tussenpunten (`BR.W`): `p3_zee_efeze`, `p3_zee_samos`, `p3_zee_chios` (zee) en `p3_weg_amfipolis`, `p3_weg_apollonia`, `p3_weg_golf`, `p3_weg_pieria`, `p3_weg_tempe`, `p3_weg_thessalie`, `p3_weg_thermopylae`, `p3_weg_boeotie`, `p3_weg_megara`, `p3_weg_isthmus` (de landweg Filippi–Korinthe). De namen zijn alleen geheugensteun voor de redactie; ze staan niet op de kaart en zijn geen plaatsen uit de tekst.

Hergebruikt: `nt_antiochie`, `nt_tarsus`, `nt_tauruspas`, `nt_derbe`, `nt_lystre`, `nt_ikonium`, `nt_antiochiep`, `nt_efeze`, `nt_troas`, `nt_neapolis`, `nt_filippi`, `nt4_milete` en de gedeelde `nt_thessalonica`, `nt_berea`, `nt_korinthe`, `nt_kenchreeen`, `nt_macedonie`, `nt_achaje`, `nt_galatie`, `nt_asia`.

Alle zeeroutes zijn getoetst aan `geo.json` (land): ze lopen niet over land of een eiland, behalve het laatste stukje naar een haven die op de ondergrond net binnen de kustlijn valt (Efeze, Milete, Mitylene, Assus, Troas).

## Plaatsen uit de tekst die niet (als punt) op de kaart staan

- **Griekenland** (20:2): geen eigen punt. OpenBible geeft voor ‘Greece’ alleen het punt van Athene. Op de kaart licht het gedeelde gebied `nt_achaje` op.
- **Korinthe in 20:2–3**: Handelingen noemt hier geen stad. De route eindigt in Korinthe op grond van 1 Korinthe 16:5–6 (als reconstructie, in het weetje uitgelegd). Korinthe staat bij deze stap bewust niet in `at`.
- **Troas in 20:1**: niet in Handelingen 20:1, wel in 2 Korinthe 2:12–13. De route loopt erlangs; bij deze stap niet in `at`.
- **Syrië** (20:3), **Jeruzalem** en **Rome** (19:21; 20:16, 22): reisdoelen waar Paulus in dit deel niet komt. Niet opgelicht.
- **De school van Tyrannus, de schouwplaats en de tempel van Diana/Artemis**: alle in Efeze; geen aparte punten (OpenBible heeft er geen).
- **Derbe** (Gajus van Derbe, 20:4): alleen als herkomst genoemd; ligt wel op de route van stap 1 (index 0).

## Routes: wat de Bijbel zegt en wat reconstructie is

| Stap (index) | Route | Grond |
| --- | --- | --- |
| 0 | Antiochië → Tarsus → Derbe → Lystre → Ikonium → Antiochië in Pisidië | 18:23 noemt alleen ‘het land van Galatië en Frygië’. `recon: 1`. Gekozen: de steden van de eerste reis (provincie Galatië). Wie Galatië noordelijk opvat, zou een andere lijn tekenen; het weetje zegt dat uitleggers verschillen. |
| 1 | Efeze → Kenchreeën → Korinthe (Apollos, kleur oker) | 18:27 ‘naar Achaje’, 19:1 ‘te Korinthe’. Vaarroute `recon: 1`. Telt niet mee in ‘Alles wat Paulus reisde’. |
| 2 | Antiochië in Pisidië → Efeze | 19:1 ‘de bovenste delen des lands’. `recon: 1`; drie vrije tussenpunten door het binnenland (niet langs Laodicea). |
| 5 | Efeze → Troas (zee) → Neapolis → Filippi → Thessalonica → Berea → Korinthe | 20:1–2 noemt alleen Macedonië en Griekenland. Troas uit 2 Korinthe 2:12–13, Korinthe uit 1 Korinthe 16:5–6. Alles `recon: 1`. Of Paulus van Efeze naar Troas voer of liep, is onbekend. |
| 6 | Korinthe → Berea → Thessalonica → Filippi; Filippi → Neapolis → Troas | 20:3 ‘weder te keren door Macedonië’; 20:6 Filippi en Troas genoemd, vijf dagen. Beide `recon: 1`. |
| 8 | Troas → Assus te voet (`recon: 1`); schip Troas → Assus (grijs, zonder Paulus); Assus → Mitylene → tegenover Chios → Samos → Trogyllium → Milete | 20:13–15 noemt de plaatsen dag voor dag; de laatste lijn daarom zonder `recon`. |
| 9 | Efeze → Milete (grijs) | 20:17: de ouderlingen komen naar Milete. `recon: 1`. Telt niet mee bij Paulus. |

## Twijfelpunten voor de redactie

1. **Namen volgens de HSV**: ik had geen HSV-tekst bij de hand. Gebruikt: Skevas (met ‘Statenvertaling: Sceva’), Artemis (‘Statenvertaling: Diana’), Asia (‘Statenvertaling: Azië’), Trogyllium (‘Statenvertaling: Trogyllion’), Tychikus, Trofimus, Sopater, Gajus, en **Sekundus** in de spelling van de Statenvertaling. Graag naast de HSV leggen, vooral Skevas en Sekundus/Secundus.
2. **Aquila en Priscilla** staan wel in de tekst van stap 1 (index 1), maar niet in `who` en niet in `personen.js`: het deel `nt-paulus2` (Handelingen 18:2) voegt hen toe, en twee personen met dezelfde naam in hetzelfde boek mag niet. Na het samenvoegen kunnen `["Aquila"], ["Priscilla"]` aan `who` van die stap worden toegevoegd.
3. **Gajus** staat niet in `who`: 19:29 noemt een Gajus uit Macedonië en 20:4 Gajus van Derbe (naamgenoten in één boek). **Erastus** (19:22), **Tyrannus**, **Alexander** (19:33), **Sopater, Sekundus, Tychikus en Trofimus** zijn niet als persoon toegevoegd.
4. **‘Zeven mannen’** (stap index 6): het getal staat niet in de tekst, maar volgt uit het tellen van de namen in 20:4. De zeven namen staan er alle bij.
5. **Trogyllium**: de woorden ‘en bleven te Trogyllion’ ontbreken in een deel van de oude handschriften; de Statenvertaling heeft ze. Het OpenBible-punt valt op de grove ondergrond net in zee, tussen Samos en het vasteland (het is een kaap).
6. **Samos en Chios**: de punten zijn de eilandpunten van OpenBible. De route raakt de kust van Samos, niet het punt midden op het eiland. Bij Chios vaart het schip er alleen tegenover (20:15).
7. **Citaat ‘Groot is de Diana der Efezeren!’**: de controletekst heeft in 19:28 ‘de Diana de Efezeren’ (drukfout in de editie); het citaat is daarom dat van 19:34.
8. **19:21 ‘in den Geest’**: naverteld als ‘neemt zich in de Geest voor’, met hoofdletter zoals de Statenvertaling.
9. **Weetjes met `fs: "h"`** zijn algemene kennis, niet in deze sessie in een bron nagezocht: de tempel van Artemis als een van de zeven wereldwonderen; het theater van Efeze met naar schatting meer dan twintigduizend plaatsen; de provincie Galatië tot Ikonium, Lystre en Derbe. Bij het weetje over de zilveren penningen staat dat de munt niet genoemd wordt en dat men ‘meestal’ aan een dagloon denkt (vergelijk Mattheüs 20:2).
10. **Datering** ca. 52–57 n.Chr. (`historie`, niet onzeker gemarkeerd, zoals de andere delen van Handelingen). Sluit aan op `nt-paulusrome` (57–62); het begin moet passen bij wat `nt-paulus2` als eindjaar kiest.
11. **Kleur en letter van het deel**: `teal`, init `E` (Efeze). Gekozen zonder te weten wat `nt-paulus2` kiest; zo nodig aanpassen (de routes zonder `w` volgen de deelkleur vanzelf).
12. **Persoon-ids**: `apollos`, `demetrius_efeze`, `eutychus`. Mocht het deel over de brieven ook een `apollos` toevoegen, dan moeten die samengevoegd worden (boek-id erbij in `boek`).
13. **Geen nieuwe groepsnamen.** Gebruikt: Discipelen, Broeders, Joden, Zonen, Volk, Reisgenoten, Ouderlingen (alle al in `GROEPEN` en in `GROUPS` van `app.js`).

## Bewust weggelaten

- Alexander, die de Joden naar voren schuiven (19:33–34), en de oversten van Azië die Paulus waarschuwen (19:31).
- Uit de toespraak van de stadsschrijver: het beeld ‘dat uit den hemel gevallen is’ (19:35) en de wettelijke vergadering (19:39).
- Uit de afscheidsrede: ‘rein van het bloed van u allen’ (20:26–27), de mannen die uit hun eigen midden zullen opstaan (20:30) en het werken met eigen handen (20:33–34).
- Dat Paulus zijn hoofd had laten scheren en de reis naar Jeruzalem en Antiochië (18:18–22): hoort bij `nt-paulus2`.

## Controles

- `node --check` op de vier bestanden: geslaagd.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/nt-paulus3.txt`: 129 gecontroleerd, 0 mis.
- `python3 scripts/bijbel-check.py scripts/bijbel-controle/personen.txt`: 0 mis.
- `node scripts/bijbelreis-personen-check.mjs`: Geen fouten.
- `npx vitest run tests/bijbelreis.test.ts`: alles geslaagd. Let op: als de machine zwaar belast is, lopen de twee tests die `scripts/niveaus-controle.mjs` aanroepen tegen de standaardtijdslimiet van 5 seconden aan; dat staat los van dit deel (met `--testTimeout=120000` slagen ze).
