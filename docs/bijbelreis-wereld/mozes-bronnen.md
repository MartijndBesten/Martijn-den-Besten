# De wereld in die tijd — Mozes, Egypte en de woestijnreis: bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/mozes.json` | de periode: as, bronnen, info, personen, gebeurtenissen, landstreken, legerplaatsen, reis, koppelingen |
| `scripts/bijbelreis-wereld-mozes.py` | bouwt het JSON-bestand (alleen Python-standaardbibliotheek); `--controle` toetst of het bestand gelijk is aan de bouw |
| `scripts/bijbel-controle/wereld-mozes.txt` | 51 controleregels tegen de Statenvertaling: elk getal waarop de tijdlijn rust en elk kort citaat (0 mis) |
| `tests/bijbelreis-wereld-mozes.test.ts` | unittest: Bijbelse getallen, volgorde, koppelingen, reis, landstreken, citaten, uitbreiding van de rekenkern |

## 1. Besluiten en keuzes

- **As in levensjaren van Mozes (0–120)**, besluit van Martijn (17-11-2026). De datering van de uittocht is omstreden:
  de vroege datering (rond 1446 v.Chr., terugrekenend met de 480 jaar van 1 Koningen 6:1 vanaf de tempelbouw, ca. 966)
  en de late datering (13e eeuw v.Chr.). De Bijbel noemt de farao niet bij naam. De levensjaren van Mozes staan wel in de
  Bijbel: 40 bij de vlucht (Handelingen 7:23), 80 voor de farao (Exodus 7:7; Handelingen 7:30), 120 bij zijn dood
  (Deuteronomium 34:7). In ‘Over deze tijdlijn’ staat waarom er geen jaartallen v.Chr. staan.
- **Geen farao** bij naam, ook niet als mogelijkheid. Geen dynastie of jaartal v.Chr. als feit.
- **Binnen een jaar**: de Bijbel noemt maanden na de uittocht (Numeri 33:3; Exodus 16:1; 19:1; 40:17; Numeri 10:11;
  33:38; Deuteronomium 1:3). Daarmee staan de gebeurtenissen op volgorde, en op een plek binnen het jaar die bij die
  maanden past. Waar in het jaar Mozes jarig was, staat er niet; de as telt daarom afgerond (jaar 80 loopt van 79,5 tot
  80,5) en elk jaar kan één jaar verschillen. Het anker: de uittocht op 80,2, gekozen zodat Aäron (83 bij Exodus 7:7)
  bij zijn dood 123 is (Numeri 33:39) terwijl Mozes 120 is. Dat is een rekenkeuze binnen de marge, geen datum.
- **Geen politieke grenzen.** Egypte (Nijldal en delta), de Sinaï-woestijn, Midian, Edom, Moab en Kanaän staan er als
  landstreken: een zacht vlak zonder grenslijn (`soort: "streek"`), altijd `benaderd`, eigen grove tekening langs de
  geografie (de Nijl uit `geo.json`, Natural Earth). Geen grensdataset of kaart overgenomen. Een landstreek heeft alleen
  een naam en bronnen; de losse uitlegteksten in het bouwscript, die nooit in de app kwamen, zijn weg (21-11-2026).
- **De route is hergebruikt**, niet opnieuw getekend: elk reisdeel verwijst naar een stap van de atlas
  (`exodus:mozes:2`, `exodus:uittocht:3` … `numeri:moab:4`) en neemt de lijn `r` van die stap over, met dezelfde
  reconstructies (gestippeld) en dezelfde plaatsen uit `plaatsen.js`, met hun zekerheid (`c`) en andere mogelijke
  plekken (`alt`): de berg Sinaï (Jebel Musa; ook Jebel Serbal, Har Karkom), de Schelfzee (Golf van Suez; ook
  Bittermeren, Timsahmeer, Ballahmeren) en de berg Hor (Har Zin; ook Jebel Harun). Een dunne lijn: Mozes alleen (vlucht,
  Horeb, terug naar Egypte).
- **38 jaar onbekend**: tussen Kades (tweede jaar) en de tocht naar de berg Hor (veertigste jaar) weten we niet waar het
  volk precies trok (Deuteronomium 2:14; de legerplaatsen van Numeri 33:19–36 zijn niet te dateren en grotendeels
  onbekend). De reiziger staat dan vaag, met een gestippelde ring, bij de laatste bekende plek.
- **Wat er tegelijk in de wereld gebeurde**: één voorzichtig blok in ‘Over deze tijdlijn’ met beide dateringen
  (Nieuwe Rijk van Egypte; de bouw van Pi-Ramesse in de 13e eeuw, waarschijnlijk Raämses uit Exodus 1:11), zonder farao
  en zonder gelijktijdige gebeurtenis als feit. Geen ‘tegelijk’-gebeurtenissen op de tijdlijn: zonder vaste datering kun
  je geen gelijktijdigheid beweren.
- **Afspelen**: de uittocht tot de Sinaï ligt in een paar maanden, de 38 jaar daarna zijn leeg. Met `as.tempo` loopt de
  tijd in de drukke stukken veel langzamer (de uittocht het langzaamst), zodat een kind de reis ziet ontvouwen: ongeveer
  100 seconden op ‘Normaal’.

## 2. Gegevens: status en bron

### Personen (7)

| Persoon | Begin | Einde | Status / toelichting |
|---|---|---|---|
| Mozes | jaar 0 (Exodus 2:2) | jaar 120, 120 jaar (Deuteronomium 34:7) | expliciet |
| Aäron | 3 jaar vóór Mozes (Exodus 7:7: 80 en 83) | jaar 120, 123 jaar (Numeri 33:38–39) | berekend; lijn afgekapt bij jaar 0, leeftijd wel bekend |
| Mirjam | in beeld bij jaar 0 (Exodus 2:4; Numeri 26:59) | jaar 119 of 120 (Numeri 20:1) | benaderd; geboortejaar onbekend, jaar van overlijden afgeleid (‘in de eerste maand’, waarschijnlijk het 40e jaar) |
| Jethro | Mozes in Midian (Exodus 2:16–21) | laatst genoemd Exodus 18:27 | benaderd; einde onbekend |
| Zippora | Mozes in Midian (Exodus 2:21) | laatst bij naam Exodus 18:2–6 | benaderd; einde onbekend |
| Jozua | eerst genoemd bij Amalek (Exodus 17:9) | leeft door (Jozua 24:29: 110 jaar) | geen geboortejaar |
| Kaleb | jaar 41 (Jozua 14:7: 40 bij de verspieding) | leeft door: 85 in jaar 126 (Jozua 14:10) | berekend; een jaar verschil mogelijk |

Geen verzonnen geboortejaar: wie geen geboortejaar in de Bijbel heeft, begint als ‘eerst genoemd’ (`van.begin: "genoemd"`).

### Gebeurtenissen (21)

| Jaar | Gebeurtenis | Bron | Status |
|---|---|---|---|
| 0 | Geboren en bewaard | Exodus 2:1–10 | expliciet |
| 40 | Vlucht naar Midian | Handelingen 7:23–29; Exodus 2:11–15 | expliciet |
| 40–79 | Herder in Midian (tijdvak) | Handelingen 7:29–30 | expliciet |
| 80 | De brandende braamstruik | Handelingen 7:30 (40 + 40) | berekend |
| 80 | Voor de farao: tien plagen | Exodus 7:7 | expliciet |
| 80 | Pascha en uittocht (1e maand, 15e dag) | Numeri 33:3; Exodus 12:37 | berekend |
| 80 | Schelfzee | Exodus 14:21–31 | berekend |
| 80 | Manna (2e maand) | Exodus 16:1, 35 | berekend |
| 80 | Amalek bij Rafidim | Exodus 17:8–16 | berekend |
| 80 | Sinaï: de Tien Geboden (3e maand) | Exodus 19:1; 20 | berekend |
| 80 | Gouden kalf | Exodus 24:18; 32 | berekend |
| 81 | Tabernakel opgericht (2e jaar, 1e maand) | Exodus 40:17 | berekend |
| 81 | Vertrek van de Sinaï (2e jaar, 2e maand, 20e dag) | Numeri 10:11–12 | berekend |
| 81 | Twaalf verspieders (Kaleb 40) | Numeri 13–14; Jozua 14:7 | berekend |
| 81–119 | Veertig jaar in de woestijn (tijdvak) | Numeri 14:33–34; Deuteronomium 2:14 | expliciet |
| 119/120 | Mirjam sterft te Kades | Numeri 20:1 | benaderd (marge 119–120) |
| 120 | Aäron sterft op de berg Hor (40e jaar, 5e maand) | Numeri 20:28; 33:38–39 | berekend |
| 120 | De koperen slang | Numeri 21:4–9 | berekend (na Aäron; plaats niet genoemd) |
| 120 | Velden van Moab (Sihon, Og, Bileam) | Numeri 21:21–35; 22:1 | berekend |
| 120 | Afscheid (40e jaar, 11e maand) | Deuteronomium 1:3; 31:2 | expliciet |
| 120 | Mozes sterft op de berg Nebo | Deuteronomium 34:1–7 | expliciet |

### Koppelingen (16)

v21–v36: alle geschiedenissen van Exodus, Leviticus, Numeri en Deuteronomium in de Bijbelreis. v32 (De Grote
Verzoendag) staat bij de tabernakel, met de opmerking dat Leviticus 16 de zevende maand noemt maar geen jaar. ‘Kies dan
het leven’ (`numeri:kies-het-leven`) is een reisdeel zonder eigen geschiedenis en heeft dus geen uitnodiging.

### Landstreken (6) en legerplaatsen (19)

Alle landstreken `benaderd`, zonder grenslijn, sleutels in jaar 0 en 120 (dezelfde vorm). Legerplaatsen met `plaatsId`
uit `plaatsen.js` (ligging, zekerheid en alternatieven daar, verantwoord in `docs/bijbelreis-audit/plaatsen.md`).
Kleine legerplaatsen (Sukkoth, Etham, Pi-Hachiroth, Mara, Rafidim, Kibroth-Taäva, Hazeroth, Ezeon-Geber, Punon, Arnon,
Edreï) zijn ‘haltes’: een naam, geen knop (dicht op elkaar te klein om te tikken).

## 3. Webbronnen

| Id | Bron | Waarvoor |
|---|---|---|
| `bas-uittocht` | Biblical Archaeology Society, “Dating the Exodus”, https://library.biblicalarchaeology.org/sidebar/dating-the-exodus/ | vroege (ca. 1446, via 1 Koningen 6:1 en de tempelbouw ca. 966) en late datering (13e eeuw) |
| `wiki-datum-uittocht` | Wikipedia, “Date of the Exodus”, https://en.wikipedia.org/wiki/Date_of_the_Exodus (CC BY-SA 4.0, alleen als bron) | de Bijbel noemt de farao’s niet bij naam; de meeste onderzoekers kiezen de 13e eeuw |
| `wiki-nieuwe-rijk` | Wikipedia, “New Kingdom of Egypt”, https://en.wikipedia.org/wiki/New_Kingdom_of_Egypt | ca. 1570–1069 v.Chr.; grootste uitbreiding in de Levant (15e eeuw) |
| `wiki-pi-ramesse` | Wikipedia, “Pi-Ramesses”, https://en.wikipedia.org/wiki/Pi-Ramesses | hoofdstad in de oostelijke delta, 13e eeuw; door veel onderzoekers gelijkgesteld aan Raämses (Exodus 1:11) |
| `bijbelreis-plaatsen` | `plaatsen.js` en de reisdelen van Exodus en Numeri | ligging (OpenBible.info CC BY 4.0, Pleiades CC BY; zie `docs/bijbelreis-audit/plaatsen.md`) en routes |
| `natural-earth` | Natural Earth (publiek domein) | Nijl en kust waarlangs de landstreken getekend zijn |

Er is geen tekst uit deze bronnen overgenomen. Het boek ‘Chronologie van de wereldgeschiedenis’ is niet gebruikt.

## 4. Door een mens na te lezen

1. De **rekenkeuze binnen het jaar** (uittocht op 80,2 zodat Aäron 123 is als Mozes 120 is): is de uitleg in ‘Over
   deze tijdlijn’ helder genoeg voor ouders, en mag de braamstruik als ‘80’ (berekend: 40 + 40) staan?
2. **Mirjam** als ‘zijn zuster’ in Exodus 2:4: de Bijbel noemt daar geen naam; Numeri 26:59 noemt één zuster. Zo staat
   het in de opmerking, en zo staat het ook al in `inhoud/exodus.js`.
3. **Mirjams sterfjaar** (‘in de eerste maand’, Numeri 20:1) als waarschijnlijk het veertigste jaar: gangbare uitleg uit
   de volgorde van Numeri 20 en 33, maar het staat er niet.
4. **De koperen slang** zonder plaats; de atlas zet de stap bij Punon met een voorbehoud. Hier geen plek op de kaart.
5. **Het blok ‘En wat gebeurde er tegelijk in de wereld?’**: is het voorzichtig genoeg? Het noemt het Nieuwe Rijk en
   Pi-Ramesse, geen farao.
6. **De landstreken**: Midian (meestal ten oosten van de Golf van Akaba gezocht), de zuidgrens van Kanaän en de
   uitgestrektheid van de Sinaï-woestijn zijn grove keuzes.
7. **Kaleb begint bij jaar 41** (uitgerekend uit Jozua 14:7); hij komt pas bij de verspieding in beeld.
8. De **Leviticus-koppeling (v32)** staat bij de tabernakel; de Grote Verzoendag zelf heeft geen jaar.

## 5. Licenties

- Statenvertaling: publiek domein (controle in `data/statenvertaling/`).
- Ondergrond en Nijl: Natural Earth (publiek domein); landschap van toen: AWMC (ODbL), zie `docs/bijbelreis-audit/ondergrond.md`.
- Liggingen: via `plaatsen.js` (OpenBible.info CC BY 4.0, Pleiades CC BY), zoals in de atlas vermeld.
- Wikipedia-artikelen: alleen als bron voor feiten, geen tekst overgenomen.
