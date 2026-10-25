# Verslag groep ot-3: geschiedenissen 65–79 (2 Koningen 11 t/m Zacharia en Maleachi)

Stand: 25 oktober 2026. Alle vijftien geschiedenissen zijn uitgewerkt en gecontroleerd tegen de Statenvertaling.

## Gewijzigde bestanden

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/geschiedenissen/ot-3.js` | 15 records (nrs. 65–79) en 5 kernwoorden: `oordeel`, `genade`, `profeet`, `eren`, `gebed` |
| `public/bijbelreis/inhoud/2koningen.js` | alleen een nieuw deel `joas` (4 stappen), ingevoegd tussen `elisa` en `ballingschap`; verder niets gewijzigd |
| `public/bijbelreis/inhoud/profeten.js` | nieuw boek `profeten` met de delen `jesaja-troost` (5 stappen), `jeremia` (5) en `zacharia-maleachi` (6), elk met speurtocht; kleuren voor de nieuwe namen (ook die van het deel `joas`) |
| `scripts/bijbel-controle/ot-3.txt` | 449 controleregels (records, profeten.js, kernwoorden) — 0 mis |
| `scripts/bijbel-controle/2koningen.txt` | 41 regels toegevoegd voor het deel `joas` — bestand nu 295 regels, 0 mis |
| `public/bijbelreis/plaatsen/ot-3.js` | ongewijzigd: geen nieuwe plaatsen nodig |

Controles: `node --check` op alle vier de bestanden, `dump.cjs` zonder fouten, alle `stappen`-sleutels en plaats-ids bestaan, alle
verwijzingen bestaan in de SV, `npx vitest run tests/bijbelreis.test.ts` slaagt. Alle citaten tussen ‘…’ die SV-tekst zijn, zijn
letterlijk nagezocht in de SV-bestanden (een paar weergaven in eigen woorden van gesprekken staan bewust in hedendaags Nederlands).

## Per geschiedenis

| Nr | Titel (eigen) | Vorm | Stappen | Status |
| --- | --- | --- | --- | --- |
| 65 | Joas wordt koning in de tempel | plek | `2koningen:joas:0–3` (**nieuw**) | uitgewerkt, gecontroleerd |
| 66 | Samaria valt en Israël wordt weggevoerd (kw oordeel) | route | `2koningen:ballingschap:0` | uitgewerkt, gecontroleerd |
| 67 | Hizkia bidt en Jesaja brengt Gods antwoord | route | `2koningen:ballingschap:1–3` | uitgewerkt, gecontroleerd |
| 68 | Josia en het teruggevonden wetboek | plek | `2koningen:ballingschap:4–5` | uitgewerkt, gecontroleerd |
| 69 | Jona vlucht voor de HEERE | route | `jona:jona:0–3` | uitgewerkt, gecontroleerd |
| 70 | Ninevé bekeert zich en God is genadig (kw genade) | plek | `jona:jona:4–6` | uitgewerkt, gecontroleerd |
| 71 | Jeruzalem verwoest, Jeremia gespaard (kw profeet) | route | `2koningen:ballingschap:7–8`, `profeten:jeremia:0–4` (**nieuw**) | uitgewerkt, gecontroleerd |
| 72 | Troost voor Gods volk | thema | `profeten:jesaja-troost:0–4` (**nieuw**) | uitgewerkt, gecontroleerd |
| 73 | Daniël en zijn vrienden aan het hof van Babel | route | `daniel:daniel:0–3` | uitgewerkt, gecontroleerd |
| 74 | Drie vrienden buigen niet (kw eren) | plek | `daniel:daniel:4` | uitgewerkt, gecontroleerd |
| 75 | Daniël in de leeuwenkuil (kw gebed) | plek | `daniel:daniel:7` | uitgewerkt, gecontroleerd |
| 76 | Terug naar Jeruzalem: de tempel herbouwd | route | `ezra:terugkeer:0–6` | uitgewerkt, gecontroleerd |
| 77 | Esther wordt koningin in Susan | plek | `esther:esther:0–2` | uitgewerkt, gecontroleerd |
| 78 | Esther waagt haar leven voor haar volk | plek | `esther:esther:3–7` | uitgewerkt, gecontroleerd |
| 79 | De Koning komt, en een bode gaat voor Hem uit | thema | `ezra:terugkeer:5`, `profeten:zacharia-maleachi:0–5` (**nieuw**) | uitgewerkt, gecontroleerd |

Ontdek-soorten (afgewisseld): stamboom (65), verbanden (66, 72, 79), wiezei (67, 74, 78), volgorde (68, 75), kaart (69),
koppel (70, 76), onthul (71, 77), symbolen (73, alleen Daniëls eigen uitleg uit Daniël 2:38–45).

## Nieuwe stappen

- **2 Koningen, deel `joas`** (2 Koningen 11–12): 0 Verborgen in het huis van de HEERE (11:1–3) · 1 De koning leve! (11:4–16) ·
  2 Een kist met een gat (11:17–12:16) · 3 Hazaël en het einde van Joas (12:17–21, route Damascus → Gath → Jeruzalem, `recon: 1`).
  Speurtocht: 3 tap, 8 mc, 1 ord; 2 trips. Tijd ca. 841–796 v.Chr. (Thiele).
- **Profeten, deel `jesaja-troost`** (Jesaja 40–43, thema): Jeruzalem alleen bij 40:1–11 (de tekst noemt Jeruzalem/Sion), Babel en
  Egypte bij 43 (43:3, 43:14); de andere stappen hebben geen plek (`at: []` met een overzichtsbeeld).
- **Profeten, deel `jeremia`** (Jeremia 38:28–40:16): vult de bestaande stap over 2 Koningen 25 aan, zonder de val van de stad
  opnieuw te vertellen: uit het voorhof der bewaring, belofte voor Ebed-Melech, in ketenen naar Rama, bij Gedalja in Mizpa,
  de waarschuwing van Johanan. Routes Jeruzalem → Rama → Mizpa (`recon: 1`).
- **Profeten, deel `zacharia-maleachi`** (thema): Zacharia 1 en 4, Zacharia 8, Zacharia 9:9–10 (met stippellijn `later` naar
  Bethfagé en de tempel, Mattheüs 21), Zacharia 12:10 en 13:7, Maleachi 1 en 3, Maleachi 3:16–4:6 (SV-nummering; in de fact staat
  dat andere vertalingen 3:19–24 hebben). Vervullingen alleen waar het NT ze zelf legt (Mattheüs 3:3; 11:10, 14; 12:17–21; 21:4–5;
  26:31; Johannes 19:37; 1 Petrus 1:24–25; Romeinen 11:34; Lukas 1:17).

## Nieuwe plaatsen

Geen. Gebruikt: `salem`, `gath`, `damascusst`, `rama`, `mizpa`, `anathoth`, `babelst`, `egypte`, `nt_bethfage`, `nt_tempel`, en
tussenpunten uit `BR.W`.

## Twijfelpunten en open punten voor Martijn / de hoofdagent

1. **Personen (`personen.js`, niet mijn bestand).** `bijbelreis-personen-check.mjs` meldt de nieuwe namen als niet gekoppeld. Nodig:
   nieuwe personen `joas_juda` (n of alias **“Joas van Juda”**, boek `2koningen`), `athalia`, `jojada`, `joseba` (alias Jozabath),
   `hazael`, `jeremia`, `ebed_melech`, `johanan`, `maleachi`; en `profeten` toevoegen aan `boek` van `jesaja`, `nebuzaradan`,
   `gedalja`, `zacharia`, `zerubbabel`.
2. **“Joas van Juda”.** In 2 Koningen koppelt de naam “Joas” al aan Joas van Israël (`joas_israel`). Daarom heet de jonge koning in
   `who` “Joas van Juda”. Andere oplossing (bijv. een alias) mag; dan `who` aanpassen.
3. **Rama.** Voor Jeremia 40:1 is de bestaande plaats `rama` gebruikt (punt ar-Ram = Rama in Benjamin, wat bij Jeremia klopt). De
   beschrijving en de zekerheid `b` gaan echter over het Rama van Samuël. Eventueel `d` aanvullen met Jeremia 40:1 / 31:15.
4. **2 Koningen 20 heeft geen reisstap** (ziekte van Hizkia, de schaduw, de gezanten uit Babel). Het staat wel in record 67 (uitleg,
   wiezei, quiz). Ik mocht geen stap aan `ballingschap` toevoegen; een stap achteraan dat deel zou kunnen.
5. **Datering Jesaja 40–43 (nr. 72).** `tl` = de tijd van Jesaja (ca. 740–700 v.Chr.); de `tijdNoot` noemt eerlijk dat veel
   bijbelwetenschappers deze hoofdstukken rond 540 v.Chr. dateren en dat de reformatorische traditie Jesaja als schrijver houdt.
   Graag bevestigen dat deze formulering past.
6. **Maleachi** heeft geen datum in de tekst; ca. 450–430 v.Chr. staat als schatting in de `tijdNoot`.
7. **Bron-SV.** In `bijbel/2kronieken.json` staat bij 2 Kronieken 32:8 “een **vreselijke** arm”; in gedrukte SV-edities staat (voor
   zover ik weet) “een vleselijke arm”. Ik heb die woorden daarom niet geciteerd. Ook mist `bijbel/daniel.json` bij Daniël 6:10 de
   zin tussen haakjes over de open vensters naar Jeruzalem; ik heb de vensters daarom niet genoemd. Het lijkt nuttig de bronbestanden
   hierop na te kijken.
8. **Nr. 78** koppelt ook `esther:esther:7` (Esther 8:3–10:3), dat verder loopt dan de leidraad (Esther 4–8).
   **Nr. 79** koppelt ook `ezra:terugkeer:5` (Haggaï en Zacharia), net als nr. 76.
9. **Nr. 66** koppelt alleen `ballingschap:0`; de stap over Hizkia en de tunnel (18:1–8) hoort bij nr. 67.
10. **Schema `stamboom`** (nr. 65): ik heb `rijen` gevuld als `[naam, relatie, verwijzing]`. Graag nagaan of de weergave dat zo verwacht.
11. **Kleuren** voor de nieuwe namen van het deel `joas` staan in `inhoud/profeten.js` (2koningen.js mocht alleen een nieuw deel krijgen);
   bij het samenvoegen kunnen ze naar de `Object.assign(BR.personen, …)` bovenaan `2koningen.js`.
12. **Inhoudelijk ernstige punten** zijn verteld zoals de Bijbel ze vertelt, zonder af te zwakken: het uitroeien van de koninklijke
   familie, de dood van Athalia en van Joas, de verblinding van Zedekia, het oordeel over Israël (2 Koningen 17), de dood van de
   aanklagers van Daniël met hun gezinnen (Daniël 6:24) en de galg van Haman.
