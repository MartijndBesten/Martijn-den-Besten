# Kerst A: van Adam tot Jozef (werknotities)

Bestand: `public/bijbelreis/inhoud/kerst-1.js`. Twee delen in het boek `kerst`: `kerst-belofte` (10 stappen) en `kerst-koningen` (10 stappen).
Controle: `scripts/bijbel-controle/kerst-1.txt` (272 regels, 0 mis). Dit is een werkdocument; niets hiervan staat in de app.

## Stappen

### kerst-belofte, "De belofte: van Adam tot David"

| # | Titel | Verwijzing | Plaats (`at`) | Route |
| --- | --- | --- | --- | --- |
| 0 | De eerste belofte | Genesis 3:1–15 | `eden` (o) | geen |
| 1 | Van Adam tot Noach | Genesis 4:25–5:32; 8:4 | `ararat` (r) | geen; onthul: tien geslachten met leeftijden |
| 2 | Van Sem tot Abram | Genesis 9:26; 11:10–28 | `ur` | geen; onthul: tien geslachten |
| 3 | God roept Abram | Genesis 11:31–12:7 | `ur`, `haran`, `sichem` | Ur → Haran, Haran → Sichem (recon; dezelfde lijnen als `ur-kanaan`) |
| 4 | In uw zaad | Genesis 22:1–18 | `salem` | Berseba → Moria/Jeruzalem (recon; als `abraham`) |
| 5 | Izak en Jakob horen dezelfde belofte | Genesis 26:1–5; 28:10–19 | `gerar`, `bethel` | Berseba → Bethel (recon; als `jakob`); onthul: drie keer de belofte |
| 6 | De scepter van Juda | Genesis 38:27–30; 46:5–12; 49:1–10 | `gosen` (r) | Berseba → Gosen (recon; als `jakob`) |
| 7 | Rachab en Salmon | Mattheüs 1:3–5; Numeri 2:3; Jozua 6:22–25 | `jericho` | geen; onthul: Perez tot Salmon |
| 8 | Ruth en Boaz in Bethlehem | Ruth 1:22; 4:13–22 | `efrath` | Moab → Bethlehem (recon; als `ruth`) |
| 9 | David wordt gezalfd in Bethlehem | 1 Samuël 16:1–13 | `rama`, `efrath` | Rama → Bethlehem (recon; als `saul-david`) |

### kerst-koningen, "Van David tot Jozef"

| # | Titel | Verwijzing | Plaats (`at`) | Route |
| --- | --- | --- | --- | --- |
| 0 | De belofte aan David | 2 Samuël 7:1–17 | `salem` | geen |
| 1 | Twee zonen van David: Salomo en Nathan | Mattheüs 1:6; Lukas 3:31; 1 Kronieken 3:5 | `salem` | geen; onthul: twee lijnen |
| 2 | De koningen van Juda | Mattheüs 1:7–11; 1 Koningen 12:20; 2 Koningen 8:19 | `salem` | geen; onthul: veertien koningen met regeringsjaren |
| 3 | Jesaja: een Zoon, een Kind, een Rijsje | Jesaja 7:1–14; 9:5–6; 11:1 | `salem` | geen; onthul: drie profetieën |
| 4 | Micha wijst Bethlehem aan | Micha 1:1; 5:1 | `ka_moreseth` (nieuw), `efrath` | geen |
| 5 | Jechonia naar Babel | 2 Koningen 24:8–17; Mattheüs 1:11–12 | `salem`, `babelst` | Jeruzalem → Babel (recon; als `ballingschap`) |
| 6 | Zerubbabel keert terug | Ezra 1:1–3; 2:1–2; Haggaï 2:21–24 | `babelst`, `salem` | Babel → Jeruzalem (recon; als `terugkeer`) |
| 7 | Namen zonder geschiedenis | Mattheüs 1:13–15; Lukas 3:23–27 | geen (view kanaan) | geen; onthul: de namen; vergelijk: 9 namen (Mattheüs) tegen 18 (Lukas) |
| 8 | Jozef, de man van Maria | Mattheüs 1:16; Lukas 1:26–27; 2:4; 3:23 | `nt_nazareth` | geen |
| 9 | Driemaal veertien geslachten | Mattheüs 1:17 | `nt_nazareth`, `efrath`, `babelst` | geen; onthul: de drie rijen |

Alle routes zijn bestaande lijnen uit andere delen (zelfde tussenpunten), dus al eerder gecontroleerd op water van toen; `bijbelreis-toen.py --alleen-controle` meldt geen Kerst-route.

## Plaatsen

| Sleutel | Naam | `c` | Punt | Score | Grond |
| --- | --- | --- | --- | --- | --- |
| `ka_moreseth` | Moreseth | w | [31.6334, 34.9166] | 467 | OpenBible "Moresheth-gath", beste identificatie Tel Goded (Tell ej-Judeideh); tegenkandidaat Tel Zayit scoort 43. Score net onder 500, maar zonder serieuze tegenkandidaat: `w`. |

Bewust niet op de kaart:
- **Adam en Seth, Enos tot Lamech**: de Bijbel noemt geen plaats. Stap 0 gebruikt `eden` (onzeker, `o`), stap 1 `ararat` (gebied, `r`) omdat de stap eindigt bij de ark (Genesis 8:4). Geen routes.
- **Sem tot Terach**: geen plaats tot Ur (Genesis 11:28); de stap landt in Ur.
- **Chezib en Enaïm** (Genesis 38:5, 14): bewust weggelaten; de stap gaat over Juda en de scepter, niet over Genesis 38 zelf. Stap 6 landt in Gosen (Genesis 46–49).
- **Moria**: als Jeruzalem (`salem`) volgens 2 Kronieken 3:1, zoals het deel `abraham`.
- **Hezron tot Nahesson, en Abiud tot Jakob**: geen plaats in de tekst; zij staan in `onthul`, de laatste reeks in een stap zonder `at`.
- **Gihon** (zalving van Salomo): niet gebruikt; Salomo staat in een overzichtsstap in Jeruzalem.

## Personen

Nieuw in `personen.js` (aan het eind, met regels in `personen.txt` onder `# --- Kerst A`):
- `thamar` (Thamar, boek kerst), `perez` (Perez, v juda, m thamar; grondslag 1 Kronieken 2:4, b), `achaz` (Achaz), `micha` (Micha de profeet).

`"kerst"` als laatste toegevoegd aan: adam, eva, seth, henoch, noach, sem, terach, abraham, sara, izak, jakob, juda, rachab, salmon, ruth, boaz, obed, samuel, isai, david, nathan, bathseba, salomo, rehabeam, josafat, hizkia, josia, jesaja, jojachin, nebukadnezar, zerubbabel, kores, haggai, jozef_nt, maria.

Naamgenoten:
- **Jozef**: in `who` alleen de man van Maria (`jozef_nt`). Jozef, de zoon van Jakob, staat niet in `who`.
- **Jakob**: in `who` alleen Jakob de aartsvader (stap 5 en 6). Jakob, de vader van Jozef (Mattheüs 1:16), staat alleen in tekst en `onthul`, niet in `who`.
- **Juda**: alleen de zoon van Jakob.
- **Nathan**: in `who` alleen de profeet (kerst-koningen stap 0). Nathan, de zoon van David, staat niet in `who`.
- **Maria**: `maria`.

Wijziging in een gedeeld bestand (nodig om de controle te laten slagen): in `scripts/bijbelreis-personen-check.mjs`
- VERWACHT: `"kerst|Jozef": "jozef_nt", "kerst|Maria": "maria", "kerst|Nathan": "nathan"`. De andere Kerst-schrijvers hebben waarschijnlijk dezelfde regels nodig; bij het samenvoegen één keer laten staan.
- ONGEKOPPELD: `g47|Perez` weggehaald. Perez bestaat nu als persoon, en de stamboom van geschiedenis 47 (Ruth 4:18–22) koppelt daardoor terecht aan hem.

Nieuwe kleuren (`BR.personen`, in kerst-1.js): Seth, Henoch, Thamar, Perez, Salmon, Achaz, Micha, Jechonia.

## Datering

- `kerst-belofte`: `tijd: "van het begin tot ca. 1010 v.Chr."`, `tl: null`. Daardoor staat het deel bovenaan de tijdlijn, bij de delen zonder jaartal, zoals `begin`. In `dateringen.js`: `["bijbel", true]`.
- `kerst-koningen`: `tijd: "ca. 1000–7 v.Chr."`, `tl: [-1000, -7]`. In `dateringen.js`: `["historie", true]`. Het eindjaar sluit aan bij het begin van `nt-geboorte` (ca. 7 v.Chr.). Waar de jaartallen op rusten, staat in de `tijdNoot`: Davids 33 jaar in Jeruzalem, 597 voor Jechonia, 539/538 voor Kores; over de eeuwen na Zerubbabel geeft de Bijbel geen jaren.

## Wat reconstructie is

- Alle routes (`recon: 1`): de Bijbel noemt alleen begin en eind.
- Moreseth: gangbare identificatie (Tel Goded), niet zeker (`w`).
- Eden en Ararat: geen exacte plek (`o`, `r`), zoals in `begin`.
- De jaartallen van beide delen.

## Meeverteld volgens de gangbare uitleg (redactieregel van de eigenaar)

Waar de Bijbel iets openlaat en er een gangbare gereformeerde uitleg is (kanttekeningen bij de Statenvertaling, Calvijn, Matthew Henry), staat die uitleg gewoon in `txt` of `fact`, zonder dat erbij staat dat het uitleg is:

| Waar | Meeverteld | Grond |
| --- | --- | --- |
| belofte 0 | Het Zaad van de vrouw is Christus; Genesis 3:15 is de eerste belofte van de Verlosser (de moederbelofte). | Kanttekeningen bij Genesis 3:15; Calvijn; Romeinen 16:20; 1 Johannes 3:8. |
| belofte 3 | De zegen voor alle volken komt door Christus. | Galaten 3:8, 16; Handelingen 3:25–26. |
| belofte 4 | Het Zaad van Abraham is Christus; de berg Moria is de tempelberg in Jeruzalem. | Galaten 3:16; 2 Kronieken 3:1. |
| belofte 6 | Silo is de Messias; uit Juda komen de koningen tot Hij komt. | Kanttekeningen bij Genesis 49:10; Calvijn; Hebreeën 7:14; Openbaring 5:5. |
| belofte 7 | Rachab, de moeder van Boaz, is Rachab uit Jericho. | Mattheüs 1:5 met Ruth 4:20, Numeri 2:3 en Jozua 6:25; algemeen zo gelezen (ook in `personen.js` als afgeleide band). |
| koningen 0 | De belofte aan David reikt verder dan Salomo, tot de Messias. | Psalm 132:11; Lukas 1:32–33; Handelingen 2:30; Hebreeën 1:5. |
| koningen 1, 8, 9 | **Twee geslachtsregisters**: Mattheüs geeft de lijn van Jozef (de wettige, koninklijke lijn via Salomo; Jozef is voor de wet de vader, zo is de Heere Jezus de wettige erfgenaam van de troon van David). Lukas geeft de lijn van Maria (via Nathan); Heli (Eli) is de vader van Maria en de schoonvader van Jozef. | De gangbare lezing in de reformatorische traditie (o.a. Matthew Henry; ook in kinderbijbels en catechisatiemateriaal). Lukas 3:23 ‘alzo men meende’; Romeinen 1:3. |
| koningen 2 | ‘Gewon’ betekent in een geslachtsregister ook: was de voorvader van (Mattheüs slaat drie koningen over en noemt Jechonia als zoon van Josia). | Vergelijking met 1 Kronieken 3:11–16. |
| koningen 3 | De afgehouwen tronk: het huis van David wordt klein en onaanzienlijk, en juist dan komt de Messias. Jesaja 7:14 vervuld in de Heere Jezus. | Kanttekeningen bij Jesaja 11:1; Mattheüs 1:22–23. |
| koningen 4 | Hij Die er van eeuwigheid is (Micha 5:1, ‘Wiens uitgangen zijn van ouds’). | Kanttekeningen bij Micha 5:1; Mattheüs 2:5–6; Johannes 7:42. |
| koningen 5 | Sealthiël wordt in Babel geboren; de Spruit van Jeremia 23:5 is de Messias. | Mattheüs 1:12 ‘na de Babylonische overvoering’; kanttekeningen bij Jeremia 23:5. |
| koningen 9 | De drie rijen: opkomst tot David, de koningen tot Babel, daarna geen koning meer; in Christus komen de beloften samen. | Mattheüs 1:1, 17. |

Niet meeverteld, omdat er geen algemeen aanvaarde uitleg is (alleen de tekst):
- Kaïnan in Lukas 3:36 (niet in Genesis 11): alleen vermeld dat Lukas die naam noemt.
- Sealthiël als ‘zoon van Neri’ in Lukas 3:27 tegenover ‘Jechonias gewon Salathiël’ in Mattheüs 1:12: niet uitgelegd; de tekst zegt alleen dat Zerubbabel en Sealthiël in beide registers staan.
- Waarom Mattheüs koningen overslaat om op veertien uit te komen: niet uitgelegd.
- Volkstraditie (os en ezel, stal, 25 december e.d.) komt in deze delen niet voor.

## Twijfelpunten voor de redactie

1. **`personen.js`, `jozef_nt.kort`** (van een andere schrijver) zegt nog: "Hoe die twee geslachtsregisters samenhangen, zegt de Bijbel niet." Dat botst niet met de tekst, maar wel met de nieuwe redactieregel (de gangbare lezing meevertellen). Niet door mij aangepast, omdat de persoon bij het deel `nt-geboorte` hoort; wel aanbevolen voor de integrator.
2. `kerst-koningen` stap 1 noemt Bathseba in `who`, maar de tekst gebruikt de omschrijving van Mattheüs (‘degene, die Uria’s vrouw was geweest’). Door de apostrof in "Uria’s" eindigt het citaat voor de citaattest na ‘degene, die Uria’; de rest staat er wel letterlijk.
3. Moreseth staat op de kaart met `w` bij een score van 467 (net onder de grens van ongeveer 500).
4. `kerst-belofte` heeft een `tijd`-tekst maar `tl: null`, zodat het als ongedateerd deel bovenaan de tijdlijn staat met een uitleg ("Hoe weten we dat?"). Wil de integrator het helemaal als `begin` (tijd: null), dan moet de regel in `dateringen.js` weg.
5. Deelkleuren: `olijf` (belofte) en `lila` (koningen). Het eigen Kerst-uiterlijk komt later; deze kleuren kunnen dan wijzigen.

## Voorstellen voor de tekenaar

Zonder God, de Heere Jezus of engelen af te beelden.

**kerst-belofte**
0. Eden: een tuin met bomen aan een rivier; buiten de tuin een slang op de grond. Geen mensen in beeld of alleen van achteren, op weg naar buiten.
1. Ararat: een rij van tien kleine stenen of rollen met namen, die van een bergland naar beneden loopt; bovenaan een ark op een berghelling.
2. Ur: een Mesopotamische stad met een trap-toren aan de rivier; een rij van tien tenten of kruiken als de geslachten.
3. Haran → Kanaän: een karavaan met tenten, schapen en kamelen onderweg; bij Sichem een eenvoudig stenen altaar.
4. Moria: een berg met een altaar van stenen en hout; een ram met zijn horens vast in een struik.
5. Bethel: een stenen kussen in het open veld onder een sterrenhemel, en een opgerichte steen met olie erover (Genesis 28:18). De ladder en de engelen niet tekenen.
6. Gosen: een oude man op een bed met twaalf zonen eromheen; bij Juda een leeuwenwelp en een koninklijke staf (scepter).
7. Jericho: een huis op de stadsmuur met een scharlaken koord uit het venster (Jozua 2:18, 21).
8. Bethlehem: korenvelden met gerstegarven en een stadspoort met oudsten.
9. Bethlehem: een jonge herder met schapen; een oude man met een hoorn olie; zeven broers op een rij.

**kerst-koningen**
0. Jeruzalem: een paleis van cederhout en daarnaast een tent met gordijnen.
1. Jeruzalem: een stamboom die bij David in twee takken splitst; op de ene tak een kroon (Salomo), op de andere geen kroon (Nathan).
2. Jeruzalem: een rij van veertien kronen, sommige glanzend en sommige dof.
3. Jeruzalem: een watergang bij een vijver; een boomstronk met één jong groen takje (het Rijsje uit de tronk van Isaï).
4. Moreseth en Bethlehem: een klein stadje op de heuvels van Juda, met een pijl of lichtstraal naar Bethlehem.
5. Babel: een stoet gevangenen op weg langs de Eufraat; een jonge koning zonder kroon.
6. Jeruzalem: een stoet terugkerenden met ezels en kamelen; een zegelring.
7. Geen plaats: een lange rol of lijst met namen, die geleidelijk vervaagt; een boomstronk.
8. Nazareth: een eenvoudig dorp in de heuvels van Galilea; timmergereedschap (Mattheüs 13:55); een huis.
9. Een overzichtsbeeld: drie rijen van veertien, met als kantelpunten een kroon (David), een gebroken kroon of ketting (Babel) en een ster of licht aan het eind; zonder de Heere Jezus af te beelden.
