# Taferelen van de Bijbelreis

Bij een stap waar alles op één plek gebeurt, beweegt er op de kaart niets. Daar staat een **tafereel**: een getekende,
licht bewegende afbeelding van wat daar gebeurt of hoe het er daar uitziet. Dit document is voor wie verder tekent of de
motor onderhoudt. Wie alleen wil zien wat er is: open `docs/bijbelreis-taferelen/overzicht/desktop.png`.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/taferelen.js` | De motor (`BR.tafereel`), de tekenbouwstenen (`BR.tfTeken`) en de standaardbeelden per soort plaats |
| `public/bijbelreis/taferelen-ot.js` | Eigen taferelen bij het Oude Testament (later ook `taferelen-nt.js`) |
| `public/bijbelreis/taferelen-ot-2.js` | Tweede reeks bij het Oude Testament, met eigen bouwstenen (riet, stapel stenen, kruik, stad in de verte, schip, scheve projectie voor een bouwwerk) |
| `public/bijbelreis/taferelen-koppeling-ot-2.js` | De koppelingen van die tweede reeks; wordt ná `taferelen-koppeling.js` geladen en voegt toe |
| `public/bijbelreis/taferelen-nt.js` | Eigen taferelen bij het Nieuwe Testament |
| `public/bijbelreis/taferelen-koppeling-nt.js` | De koppelingen van het Nieuwe Testament; wordt ná `taferelen-koppeling.js` geladen en voegt toe |
| `public/bijbelreis/taferelen-koppeling.js` | Welke stap welk beeld krijgt (`BR.beelden`) en afwijkende soorten per plaats (`BR.beeldSoort`) |
| `public/bijbelreis/taferelen-koppeling-nt.js` | De koppelingen voor het Nieuwe Testament (voegt toe aan `BR.beelden`; een latere sleutel gaat vóór een eerdere) |
| `public/bijbelreis/bijbelreis.css` | Onderaan: opmaak, kleurklassen en beweging van de taferelen |
| `public/bijbelreis/app.js` | Drie regels die de motor aanroepen (stapkaart, verhaalweergave, Samen ontdekken) |
| `scripts/taferelen-overzicht.mjs` | Alle taferelen op één pagina, met schermafbeeldingen |
| `tests/bijbelreis-taferelen.test.ts` | Register, koppeling, tekenafspraken, gewicht |
| `e2e/bijbelreis-taferelen.spec.ts` | Het tafereel in de echte pagina |

## 1. Regels voor de beelden

Deze regels zijn hard. Twijfel je, teken het dan niet en zet het bij de vragen in je overdracht.

1. **God en de Heere Jezus worden niet afgebeeld.** Ook niet als silhouet, hand, licht in mensvorm of van achteren.
   Engelen ook niet als figuur. Wat de Bijbel zelf als zichtbaar teken noemt, mag: een wolk, vuur, licht. Een stem is
   niet te tekenen. Voorbeeld: bij de braamstruik staan vlammen en een paar sandalen, geen gestalte; bij de kribbe
   straks een lege voederbak met doeken, niet het Kind.
2. **Mensen alleen als het nodig is**, klein en eenvoudig als een pictogram, zonder gezicht. Liever het landschap, de
   stad, de tenten, het water, de voorwerpen. In de eerste reeks staat geen enkel mens.
3. **Alleen wat de Bijbel zegt.** Aantallen en bijzonderheden kloppen met de tekst: twaalf stenen zijn er twaalf. Staat
   er geen aantal, teken dan geen aantal dat iets suggereert (het standaardaltaar heeft bewust negen stenen en geen twaalf, het
   kamp in Moab veertien tenten waarvan er twee half buiten beeld vallen, de toren van Babel zes lagen en geen zeven). Controleer elke bijzonderheid met
   `node scripts/sv.mjs "Jozua 4:1–9"` (Statenvertaling) en zet de verwijzing als commentaar boven het tafereel.
   Niets gruwelijks: geen bloed, geen doden, geen offerdier.
4. **Rustig.** Een beweging die iets vertelt (water dat wijkt, rook die opstijgt, een boog die verschijnt), geen
   gewiebel om het gewiebel. Eén korte beweging die tot rust komt, of een trage lus. Bliksem flitst hooguit eens per
   zeven seconden.
5. **De stijl van de atlas.** Vlak en warm, zoals de kameel en de kaart: vlakken in papier, zand en aardetinten, een
   dunne donkerbruine omlijning om voorwerpen, geen kleurverlopen, geen schaduwen met vervaging, geen clipart.
   Nachtblauw alleen waar de tekst nacht zegt (de Schelfzee).
6. **Techniek.** Alleen SVG-vormen en CSS-animaties. Geen script, geen afbeeldingen, geen lettertypen, geen
   verwijzingen naar buiten, geen `style`-attribuut. Een tafereel blijft liefst onder de 4000 tekens; de test staat
   hooguit 6000 toe. Alle tekenbestanden samen (zonder de koppelingen) blijven onder 130 kB (nu 72 kB; de grens was 60 kB bij de
   eerste reeks van 31 kB en is verruimd voor de tweede reeks van het Oude Testament en de reeks van het Nieuwe Testament).

Een algemeen beeld is geen foto van die plaats. Daarom staat onder elk standaardbeeld ‘Algemene tekening’ en zegt de
zin eronder wat je ziet (‘Zo zag een stad er toen vaak uit’), niet hoe het daar precies was.

## 2. Hoe de motor kiest

`BR.tafereel.van(stap)` geeft het beeld bij een stap, of niets:

1. Staat de stapsleutel in `BR.beelden`, dan geldt die koppeling. Dat werkt ook bij een stap mét reis. `t: ""` betekent:
   hier bewust geen beeld.
2. Anders, alleen als de stap geen reis heeft (`r` leeg) en een plaats heeft (`at`): het standaardbeeld van de soort van
   de **eerste** plaats. De soort is het veld `t` van de plaats (stad, berg, water, put, kamp, altaar, tent); een gebied
   (`t: "gebied"` of `c: "r"`) krijgt het landschap. `BR.beeldSoort` kan dat per plaats bijsturen.
3. Een stap met reis en zonder koppeling krijgt geen beeld: daar vertelt de kaart het verhaal.

Een sleutel in `BR.beelden` van een stap die (nog) niet bestaat, doet niets. Zo kan een koppeling klaarstaan voor een
deel dat op een andere tak wordt geschreven (nu: `numeri:kies-het-leven:0` tot en met `5`).

Waar het beeld staat:

- **Stapkaart** (tab Reis): direct onder de tekst ‘Wat de Bijbel vertelt’, boven ‘Lees in je Bijbel’. Op alle drie de
  reisniveaus; bij Samen ontdekken iets breder.
- **Geschiedenis** (tab Verhalen): bij het onderdeel van de vertelling dat bij die kaartstap hoort, boven de knop ‘Op de
  kaart’. Elk beeld staat hooguit één keer per geschiedenis. Heeft de vertelling geen onderdelen, dan staat het eerste
  beeld onder de vertelling.
- **Samen ontdekken, geschiedenis**: onder de tekst van de verhaalstap, als die verhaalstap bij een kaartstap hoort.

De beweging loopt alleen zolang het beeld voor minstens een derde in beeld is (klasse `tf-loopt`, gezet door een
`IntersectionObserver`). Heeft de tekening een eenmalige beweging, dan staat er een rond knopje ‘Nog een keer’; tikken
op het beeld doet hetzelfde. Bij ‘minder beweging’ (`prefers-reduced-motion`) staat alles stil in de eindstand en is er
geen knopje.

## 3. Tekenafspraken

**Tekenvlak.** Altijd `viewBox="0 0 320 140"`. Je schrijft alleen de inhoud; de motor zet de `<svg>`-tag, `role="img"`
en het `aria-label` eromheen. De lucht is de achtergrond van de svg (`--tf-lucht`); teken die niet zelf, behalve bij
nacht (`<path class="k-nacht" d="M0 0h320v140H0z"/>`).

**Lagen**, van achter naar voor: lucht en wolken · verte (`K.verte` of een rij bergen in `k-berg2`) · het land
(`k-land`, daarvoor `k-zand`) · het onderwerp · voorgrond (struiken, bomen, riet). Laat vlakken onder elkaar doorlopen
tot de onderrand; dan vallen er geen kieren.

**Nacht.** Teken het land in de gewone kleuren en leg er daarna een sluier over (`k-sluier`, over het hele vlak); de
nachtlucht (`k-nacht`) komt helemaal achteraan. Wat licht geeft (sterren, een verlicht venster, het schijnsel uit de hemel)
teken je ná de sluier. Zo zijn alle nachtbeelden gelijk van toon (het veld van de herders, de ster, Gethsémané). Dezelfde
sluier met `tf-e-dooft` laat het dag worden (het open graf).

**Vormen.** Alleen `g`, `path`, `circle`, `ellipse`, `rect`, met de attributen `class`, `d`, `transform`, `cx`, `cy`,
`r`, `rx`, `ry`, `x`, `y`, `width`, `height`, `pathLength`. Geen `id`, `fill`, `stroke`, `style`, `href`. Rond getallen
af op hele of halve eenheden.

**Kleur** gaat alleen via klassen; die verwijzen naar de variabelen in `:root` van `bijbelreis.css`.

| Klasse | Betekenis |
|---|---|
| `k-land`, `k-zand`, `k-zand2`, `k-duin` | grond: licht land, zand, donker zand, heel licht zand |
| `k-berg`, `k-berg2` | berg dichtbij en berg in de verte |
| `k-groen`, `k-salie`, `k-salie2` | groen land, blad licht en donker |
| `k-zee`, `k-zee2`, `k-water`, `k-water2` | water van licht naar donker |
| `k-terra`, `k-terra2`, `k-oker`, `k-okerz` | aardewerk, tichelsteen, vuur (buiten naar binnen: terra, oker, okerz) |
| `k-hout`, `k-hout2` | hout en donker hout (ook deur- en vensteropeningen) |
| `k-wit`, `k-steen` | witte muur, grijze steen |
| `k-wolk`, `k-donker`, `k-donker2`, `k-rook`, `k-stof`, `k-gloed`, `k-schaduw` | wolk, onweerswolk, rook, stof, gloed, schaduwvlak |
| `k-nacht` | nachtlucht, spaarzaam |
| `k-sluier` | doorschijnende nachtsluier over het land (zie ‘Nacht’) |
| `k-licht` | doorschijnend licht: een schijnsel uit de hemel, de krans om een ster; stapel twee of drie vlakken voor een heldere kern |
| `o`, `o2` | warme omlijning (1,2 en 0,7 dik), zoals bij de kameel |
| `l-hout2`, `l-hout`, `l-zand2`, `l-wit`, `l-zee`, `l-duin`, `l-salie`, `l-salie2`, `l-terra`, `l-oker`, `l-water`, `l-lila`, `l-licht` | lijnen zonder vulling |
| `dik`, `breed`, `boog` | lijndikte 2,4 · 5 · 3,2 |
| `steen` (+ `s2`) | een rij tichelstenen als gestreepte lijn |
| `korrel` (+ `s2`) | een rij witte korrels als gestippelde lijn (manna) |
| `rand` | lijndikte 6,8: een donkere lijn (`l-hout2 rand`) ónder een brede lijn (`breed`) geeft die lijn een omlijning (de slang, de stang) |

Een stip (een ster, een vonk) is een lijntje zonder lengte: `<path class="l-licht" d="M30 14h.1"/>`.

Een nieuwe kleur nodig? Voeg een klasse toe in `bijbelreis.css` die een bestaande variabele gebruikt (eventueel met
`color-mix` van twee variabelen). Geen hexwaarden in een tafereel; de test weigert ze.

**Bouwstenen** in `BR.tfTeken` (in een tekenbestand: `const K = BR.tfTeken`): `K.rook(x, y, schaal)`,
`K.vlam(x, y, schaal, wacht)`, `K.wolk(x, y, schaal, klasse)`, `K.golf(x, y, breedte)`, `K.tent`, `K.tentje`, `K.boom`,
`K.eik`, `K.palm`, `K.struik`, `K.schaap`, `K.muur`, `K.toren`, `K.huis`, `K.stad`, `K.steen`, `K.verte`. Gebruik ze:
dat houdt de stijl gelijk en het bestand klein. Een onderdeel dat je twee keer nodig hebt, wordt een bouwsteen.

**Beweging** komt alleen uit klassen. De tekening zoals je haar schrijft, is de **eindstand**.

| Klasse | Wat |
|---|---|
| `tf-l-rook` | rook stijgt op en vervaagt (lus) |
| `tf-l-drijf` | drijft heel traag heen en weer, voor wolken (lus) |
| `tf-l-golf` | schuift zacht heen en weer, voor golfjes (lus) |
| `tf-l-vlam` | vlam flakkert (lus) |
| `tf-l-gloed` | gloed ademt (lus) |
| `tf-l-flits` | bliksem: één korte flits per zeven seconden (lus) |
| `tf-e-in` | verschijnt (eenmalig) |
| `tf-e-teken` | lijn tekent zichzelf; het pad heeft `pathLength="1"` (eenmalig) |
| `tf-e-zak` | begint 26 hoger en zakt naar zijn plaats, voor water dat afneemt (eenmalig) |
| `tf-e-wijk-l`, `tf-e-wijk-r` | begint 48 naar het midden en wijkt naar links of rechts (eenmalig) |
| `tf-e-uit` | verdwijnt (eenmalig; in de eindstand onzichtbaar) |
| `tf-e-stort` | zakt in elkaar en verdwijnt, voor een muur (eenmalig; in de eindstand onzichtbaar) |
| `tf-e-stof` | stofwolk komt op en trekt weg (eenmalig; in de eindstand onzichtbaar) |
| `tf-l-wieg` | wiegt een paar graden heen en weer om het midden van de onderkant, voor iets wat drijft (lus) |
| `tf-e-val` | valt van boven op zijn plaats (eenmalig) |
| `tf-e-groei` | schiet op vanuit het midden van de onderkant (eenmalig) |
| `tf-e-dooft` | trekt langzaam weg, in vijf seconden: de storm, de duisternis (eenmalig; in de eindstand onzichtbaar) |
| `tf-e-deint` | schommelt en komt tot rust, voor een schip (eenmalig) |
| `tf-e-rijs` | begint 18 lager en stijgt naar zijn plaats: de zon, de wolk (eenmalig) |
| `tf-e-kom` | begint 90 naar links en komt naar zijn plaats: de ster (eenmalig) |
| `tf-e-beef` | schudt kort, voor een aardbeving; zet het op de groep om het hele beeld (eenmalig) |
| `tf-w1` … `tf-w9` | wacht 0,45 s per stap voordat de beweging begint |

Regels bij beweging:

- Een onderdeel met een bewegingsklasse heeft zelf **geen** `transform`-attribuut; de beweging zou het overschrijven. Zet
  de plaatsing op een `<g>` eromheen, of andersom.
- Wat verdwijnt (`tf-e-uit`, `tf-e-stort`, `tf-e-stof`) teken je bovenop de eindstand. Voorbeeld Jericho: eerst de
  huizen en het puin, daarbovenop de hele muur met `tf-e-stort`.
- **Minder beweging** hoef je per tafereel niet af te vangen. De css zet bij `prefers-reduced-motion` alle `tf-l-…` en
  `tf-e-…` uit; dan blijft de eindstand staan. Controleer wel dat die eindstand het verhaal vertelt: de muur ligt om, het
  water staat als een muur, de boog staat in de wolken.
- De motor herkent een eenmalige beweging aan `tf-e-` in de tekening en zet dan het knopje ‘Nog een keer’. Dat knopje
  staat rechtsonder en dekt daar ongeveer 34 bij 34 eenheden af: zet in die hoek niets wat geteld moet kunnen worden.
- Nieuwe beweging nodig? Voeg een klasse `tf-l-…` of `tf-e-…` met eigen `@keyframes` toe in `bijbelreis.css`, bij de
  andere. Houd de naamgeving aan, anders pauzeert ze niet buiten beeld en staat ze niet stil bij minder beweging.
  Zet de regel bóven de regels met `tf-w1` en de pauzeregel eronder: de korte schrijfwijze `animation` wist een
  wachttijd en de pauze die eerder in het bestand staan.

## 4. Een tafereel toevoegen

1. Lees de tekst: `node scripts/sv.mjs "Jozua 4:1–9"`. Schrijf op wat er letterlijk staat en wat niet.
2. Voeg het tafereel toe in `taferelen-ot.js` of `taferelen-nt.js` (een nieuw bestand laad je in `bijbelreis.html`
   na `taferelen.js` en vóór `app.js`):

   ```js
   // Jozua 4:8–9, 20: twaalf stenen uit de Jordaan, opgericht in Gilgal.
   "twaalf-stenen": { n: "Twaalf stenen in Gilgal",
     label: "Twaalf grote stenen staan opgestapeld bij het kamp in Gilgal. Erachter stroomt de Jordaan.",
     svg: K.verte + `<path class="k-land" d="M0 96q90-12 180-4t140-6v54H0z"/>` + … },
   ```

   - `n`: korte naam, komt vet onder het beeld.
   - `label`: wat je ziet, in hele zinnen, voor wie het beeld niet ziet. Noem ook wat er beweegt.
   - De ids `stad`, `berg`, `water`, `put`, `kamp`, `altaar`, `tent`, `gebied` en `rivier` zijn van de standaardbeelden.
3. Koppel het in `taferelen-koppeling.js` (Nieuwe Testament: `taferelen-koppeling-nt.js`):

   ```js
   "jozua:intocht:3": { t: "twaalf-stenen", tekst: "Jozua richtte de twaalf stenen uit de Jordaan op in Gilgal (Jozua 4:20)." },
   ```

   De sleutel is `boek.id:deel.id:stapindex` (index vanaf 0). Zoek hem op met
   `node scripts/taferelen-overzicht.mjs` (meldt per beeld de stappen) of in het inhoudsbestand. De tekst is één korte
   zin die zegt wat je ziet, en eindigt op de verwijzing tussen haakjes en een punt.
4. Past het standaardbeeld bij een plaats niet, stuur dan bij in `BR.beeldSoort` (andere soort, of `""` voor geen
   standaardbeeld) of zet voor die ene stap `{ t: "" }` in `BR.beelden`. Wijzig daarvoor niet `plaatsen.js`.
5. Bekijk het: `node scripts/taferelen-overzicht.mjs` en open de schermafbeeldingen (zie hieronder). Kijk kritisch:
   leest het op telefoonbreedte, klopt elk aantal, staat er niets wat de tekst niet zegt, is de beginstand ook goed?
6. Draai de controles:

   ```sh
   node --check public/bijbelreis/taferelen-ot.js
   npx vitest run tests/bijbelreis.test.ts tests/bijbelreis-taferelen.test.ts
   node scripts/bijbelreis-check.mjs desktop
   # e2e: eerst een server die public/ serveert en /bijbelreis naar bijbelreis.html stuurt (zoals het servertje in
   # scripts/bijbelreis-check.mjs, op een vaste poort), dan
   E2E_BASE_URL=http://127.0.0.1:8816 npx playwright test e2e/bijbelreis-taferelen.spec.ts --trace off
   ```

Een nieuwe reeks naast een andere tekenaar: zet de tekeningen in een eigen bestand (`taferelen-<reeks>.js`) en de
koppelingen in een eigen bestand waarvan de naam met `taferelen-koppeling` begint (dan telt het niet mee bij het gewicht
van de tekeningen). Dat koppelingsbestand voegt toe met `Object.assign(BR.beelden || {}, {…})` en wordt ná
`taferelen-koppeling.js` geladen; een sleutel die er al was, wordt dan vervangen. De test staat dat alleen toe als de
eerdere koppeling bewust leeg was (`t: ""`).

## 5. Het overzicht maken

```sh
node scripts/taferelen-overzicht.mjs                 # naar docs/bijbelreis-taferelen/overzicht/
node scripts/taferelen-overzicht.mjs /tmp/overzicht  # naar een andere map
node scripts/taferelen-overzicht.mjs /tmp/o --alleen sinai,jericho --los
```

Het script zet alle taferelen naast elkaar op één pagina (met de echte `bijbelreis.css`) en maakt:

- `desktop.png` en `telefoon.png`: de eindstand, zoals bij ‘minder beweging’;
- `begin.png`: de beginstand van elke beweging (de muur staat nog, de zee is nog dicht);
- met `--los` ook `los/<id>.png`: elk tafereel apart en groot (handig tijdens het tekenen; niet in de repository).

Het meldt per tafereel het aantal tekens en het aantal stappen dat het krijgt, het totaal aan bytes en hoeveel stappen
een beeld hebben. Werk de plaatjes in `overzicht/` bij als je taferelen toevoegt of wijzigt.

## 6. Wat er is

Standaardbeelden: `stad` (ommuurd, met poort), `berg`, `water` (zee of meer), `rivier`, `put`, `kamp`, `altaar`
(ruwe stenen, vuur en rook), `tent` (bij eiken), `gebied` (landschap).

Eigen taferelen:

| Id | Wat | Tekst | Stappen |
|---|---|---|---|
| `ararat-ark` | de ark op de bergen van Ararat; het water zakt | Genesis 8:3–5 | `genesis:begin:3` |
| `ararat-boog` | de ark, het droge land en de boog in de wolken | Genesis 9:13–16 | `genesis:begin:4` |
| `babel` | de toren in aanbouw, van tichelstenen, met de oven | Genesis 11:2–8 | `genesis:begin:5` |
| `stad-rivier` | Ur en Haran: een stad aan de rivier | Genesis 11:28–12:4; Jozua 24:2–3 | `genesis:ur-kanaan:0`, `1`, `3`–`6` |
| `braamstruik` | de struik die brandt en niet verteert | Exodus 3:1–5 | `exodus:mozes:4`, `5` |
| `schelfzee` | het water wijkt en staat als een muur | Exodus 14:21–22 | `exodus:uittocht:5` |
| `sinai` | de berg met de zware wolk, vuur, rook en bliksem | Exodus 19:16–18; 20:18 | `exodus:sinai:4`, `5` |
| `moab` | het kamp aan de Jordaan, het land aan de overkant | Numeri 22:1; Deuteronomium 34:1–3 | `numeri:moab:1`–`3`, `jozua:intocht:0`, `numeri:kies-het-leven:0`–`5` |
| `jericho` | de muur stort in | Jozua 6:20 | `jozua:intocht:4` |

Tweede reeks bij het Oude Testament (`taferelen-ot-2.js`):

| Id | Wat | Tekst | Stappen |
|---|---|---|---|
| `kistje` | het kistje van biezen in het riet; het wiegt | Exodus 2:3 | `exodus:mozes:1` |
| `manna` | de dauw trekt op, het manna ligt rondom het kamp | Exodus 16:13–15, 31 | `exodus:sinai:0` |
| `rots` | water stroomt uit de rots | Exodus 17:6; Numeri 20:11 | `exodus:sinai:1`, `numeri:woestijn:5` |
| `tabernakel` | de voorhof, het altaar, het wasvat, de tent en de wolk, midden in het kamp | Exodus 26–27; 40:34–38 | `exodus:sinai:8`, `leviticus:verzoendag:0`–`4` |
| `slang` | de koperen slang op de stang | Numeri 21:8–9 | `numeri:woestijn:7` |
| `jordaan` | het water blijft op een hoop staan; twaalf stenen in de droge bedding | Jozua 3:16–17; 4:9 | `jozua:intocht:2` |
| `twaalf-stenen` | de twaalf stenen bij het kamp in Gilgal | Jozua 4:19–20 | `jozua:intocht:3` |
| `gideon` | nacht; de fakkels verschijnen in drie groepen rondom het kamp van Midian | Richteren 7:16–22 | `richteren:debora:8` |
| `ruth-veld` | het gersteveld bij Bethlehem: garven, losse aren, de vaten | Ruth 1:22; 2:3–16 | `ruth:ruth:2`, `3` |
| `eikdal` | het dal tussen de twee legers; de beek, de tas, de staf, de slinger, vijf stenen | 1 Samuël 17:2–3, 40 | `1samuel:saul-david:4` |
| `tempel` | het huis van zestig bij twintig bij dertig el, de zijkamers, het voorhuis, de twee pilaren | 1 Koningen 6:2–10; 7:15–21 | `1koningen:salomo:4`, `2koningen:joas:0`–`2`, `2koningen:ballingschap:4`, `2kronieken:hizkia-josia:0`, `1`, `7` |
| `karmel` | het altaar van twaalf stenen, de groeve met water, vier kruiken; het vuur valt | 1 Koningen 18:31–38 | `1koningen:elia:3` |
| `elia` | een wervelwind en vuur boven de Jordaan; de mantel op de grond | 2 Koningen 2:11–13 | `1koningen:elia:9` |
| `muur-puin` | nacht; de muur van Jeruzalem afgebroken, de poort verbrand | Nehemia 2:13, 17 | `ezra:nehemia:3` |
| `muur-herbouw` | de muur tot de helft, er komen lagen bij; spies en schild bij het werk | Nehemia 4:6, 16–18; 6:1 | `ezra:nehemia:4` |
| `oven` | de oven in het dal Dura, met in de verte het gouden beeld | Daniël 3:1, 19–26 | `daniel:daniel:4` |
| `leeuwenkuil` | doorsnede: de steen met twee zegels op de opening, de leeuwen rustig; het wordt morgen | Daniël 6:17–24 | `daniel:daniel:7` |
| `jona-storm` | het schip in de storm; vaten in zee | Jona 1:4–5, 13 | `jona:jona:2` |
| `jona-vis` | de zee is stil; de grote vis; het droge | Jona 1:15, 17; 2:10 | `jona:jona:3` |
| `wonderboom` | het verdek ten oosten van Ninevé; de wonderboom schiet op | Jona 4:5–8 | `jona:jona:6` |

Wat in deze reeks bewust **niet** is getekend: geen mensen (ook Mozes, de dragers van de ark, David, Elia, Daniël en
Jona niet), geen engel, geen wagen en paarden bij Elia (alleen vuur en wind), geen offerdier op de Karmel, geen kind in
het kistje (het deksel is dicht), geen vorm voor het gouden beeld behalve de maten uit Daniël 3:1.
Nieuwe Testament (`taferelen-nt.js`; de sleutels beginnen met `jezus-1:`, `jezus-2:`, `jezus-3:`, `handelingen:` of
`openbaring:`). In deze reeks staat geen enkel mens; de Heere Jezus, engelen en de Heilige Geest zijn nergens afgebeeld.

| Id | Wat | Tekst | Stappen |
|---|---|---|---|
| `herders-veld` | nacht, de kudde in het veld, Bethlehem in de verte; het licht komt over het veld | Lukas 2:8–9 | `jezus-1:nt-geboorte:6` |
| `ster-bethlehem` | de ster komt en blijft staan boven één huis met licht in de deur | Mattheüs 2:9–11 | `jezus-1:nt-geboorte:8` |
| `jordaan-woestijn` | de Jordaan in de kale woestijn van Judea | Mattheüs 3:1–6; Johannes 1:28 | `jezus-1:nt-begin:0`, `1`, `3` |
| `jakobsput` | de diepe put, de waterkruik die bleef staan, de witte velden, Sichar onder aan de berg | Johannes 4:5–6, 11, 28, 35 | `jezus-1:nt-samaria-nain:1`–`3` |
| `vissersboot` | twee schepen aan de oever, de netten op het zand | Markus 1:16–20; Lukas 5:2 | `jezus-1:nt-galilea:1`, `7` |
| `storm-stil` | het schip slingert in de storm; de storm trekt weg en het wordt stil | Markus 4:37–39 | `jezus-1:nt-galilea:8` |
| `broden-vissen` | vijf broden en twee vissen op het gras; de twaalf korven komen erbij | Johannes 6:9–13 | `jezus-2:nt-brood-en-berg:1` |
| `vijgenboom` | de wilde vijgenboom langs de weg door Jericho | Lukas 19:1–4 | `jezus-2:nt-reis-naar-jeruzalem:11` |
| `intocht-weg` | de weg naar de poort van Jeruzalem; kleden en takken komen op de weg te liggen | Mattheüs 21:8; Johannes 12:13 | `jezus-3:nt-lijdensweek:0` |
| `gethsemane` | de hof met olijfbomen in de nacht, de beek Kedron, de muur van de stad | Mattheüs 26:36; Johannes 18:1 | `jezus-3:nt-lijdensweek:7`, `8` |
| `graf-dicht` | het graf in de rots, in een hof; de grote steen ligt voor de ingang | Mattheüs 27:60; Johannes 19:41 | `jezus-3:nt-lijden:8` |
| `graf-open` | de steen is afgewenteld; het is eerst nog donker, dan komt de zon op | Markus 16:2–4; Johannes 20:1 | `jezus-3:nt-opstanding:0`, `1` |
| `net-vol` | het net vol grote vissen op het land, het kolenvuur met vis en brood | Johannes 21:9–11 | `jezus-3:nt-opstanding:5`, `6` |
| `olijfberg-wolk` | de Olijfberg bij Jeruzalem; de wolk stijgt op | Handelingen 1:9–12 | `jezus-3:nt-opstanding:8` |
| `pinksterhuis` | het huis met de bovenzaal: lijnen als van wind, daarna licht als van vuur in de vensters | Handelingen 1:13; 2:1–3 | `handelingen:nt-gemeente:0` |
| `damascus-licht` | de weg naar Damascus; het licht uit de hemel valt op de weg | Handelingen 9:3 | `handelingen:nt-paulus:0` |
| `gevangenis-filippi` | de binnenste kerker beeft; de deur staat open, het blok open, de ketens los | Handelingen 16:24–26 | `handelingen:nt-paulus:10` |
| `malta-schip` | het schip op de zandbank: het voorschip vast, het achterschip gebroken | Handelingen 27:39–41 | `handelingen:nt-paulusrome:5` |
| `malta-vuur` | het grote vuur in de regen, de bos takken en de adder | Handelingen 28:1–3 | `handelingen:nt-paulusrome:6` |
| `kandelaren` | zeven gouden kandelaren in een boog | Openbaring 1:12, 20 | `openbaring:nt-openbaring:0` |

Keuzes in deze reeks, voor wie verder tekent:

- **Golgotha heeft geen tafereel** (`jezus-3:nt-lijden:6` en `7`). De kruisiging wordt niet afgebeeld; de duisternis
  over het land en het gescheurde voorhangsel zijn overwogen en niet getekend. Een test bewaakt dat het zo blijft.
- **Het lijden is sober**: de weg zonder ruiter, de hof zonder mensen, het graf dicht en het graf open. Geen fakkels,
  geen zwaarden, geen wachters.
- **Licht is nooit een gestalte**: een bundel uit de bovenrand van het beeld (herders, Damascus), een krans om de ster,
  gloed in de vensters (Pinksteren). Bij Pinksteren staan geen vlammen die je kunt tellen: de tekst noemt geen aantal.
- **Aantallen**: vijf broden, twee vissen, twaalf korven, twee schepen (Lukas 5:2), zeven kandelaren; in het blok vier
  gaten en aan de muur twee ketens (Paulus en Silas). Waar de tekst geen aantal noemt, is een getal gekozen dat niets
  suggereert (negen schapen, zes olijfbomen in de hof, vier vensters, elf vissen in het net).
- **Wat de tekst niet zegt, staat er niet**: geen os en ezel, geen aantal wijzen, geen kamelen, geen herdersstaf, geen
  maan boven de hof. Op de kandelaren staat wel een vlam: de tekst noemt die niet, maar een kandelaar draagt licht.

## 7. Wat nog getekend moet worden

Eerst de plekken die nu **geen** beeld hebben omdat het standaardbeeld daar iets zou tonen wat de Bijbel niet zegt
(zie `BR.beeldSoort` en de lege koppelingen):

- de tempel (bij `nt_tempel` staat nu de stad Jeruzalem);
- Jeruzalem met de afgebroken muur bij daglicht (Ezra 3–6, Zacharia, Jeremia 39; `muur-puin` is een nachtbeeld bij
  Nehemia 2) en de tweede tempel in aanbouw (Ezra 3:8–13; 6:13–22);
- het schip in de storm bij Malta; Patmos en de zeven kandelaren;
- de palmboom van Debora; de Areopagus; een dorp zonder muur (Bethanië, de tien
  melaatsen); de lege kuil bij Dothan; de hof van Eden wordt niet getekend.

Dan de taferelen uit de opdracht:

- (getekend in de tweede reeks van het Oude Testament: het kistje in het riet, manna, het water uit de rots, de
  tabernakel, de koperen slang, de Jordaan en de twaalf stenen, Gideon, het veld van Ruth, het Eikdal, de tempel van
  Salomo, de Karmel, Elia bij de Jordaan, de muur van Nehemia, de vurige oven, de leeuwenkuil, de storm, de grote vis
  en de wonderboom)
- nog niet, uit het Oude Testament: de dorsvloer van Boaz (Ruth 3); de gouden kandelaar, de tafel en de ark in de tent
  (Exodus 25); het gouden kalf wordt niet getekend; de beek Krith en de raven (1 Koningen 17); de regenwolk uit de zee
  (1 Koningen 18:44); het schrift op de muur (Daniël 5; zonder hand: alleen de wand en de kandelaar);
- de ster boven Bethlehem; de kribbe (zonder het Kind af te beelden);
- een vissersboot op het meer; vijf broden en twee vissen;
- het lege graf; de tongen als van vuur; het schip in de storm bij Malta; de zeven kandelaren.
- Golgotha blijft zonder beeld (zie de keuzes onder de tabel van het Nieuwe Testament).

Dan de taferelen uit de opdracht:
- de kribbe (Lukas 2:7: een lege voederbak met doeken, zonder het Kind; nog niet getekend, de stap heeft een reis);
- Nieuwe Testament, nog open: de bruiloft in Kana (zes stenen watervaten, Johannes 2:6); het dak dat opengebroken is
  (Markus 2:4); de zeven broden en zeven manden (Markus 8:5–8, nu het standaardbeeld water); Patmos als eiland.

## 8. Wat nog beter kan

- De sandalen bij de braamstruik zijn klein; op een telefoon zijn ze nog net te herkennen.
- De ark is naar de maten van Genesis 6:15 getekend (lang en laag). Dat is juist, maar het oogt als een lang huis.
- De standaardstad heeft altijd een muur. Bij een plaats die de Bijbel een ‘vlek’ (dorp) noemt, hoort dat beeld niet;
  zet zo’n plaats in `BR.beeldSoort` op `""` tot er een dorp getekend is.
- In het Samen-verhaal op een telefoon schuift het beeld de knop ‘Verder’ verder naar beneden.
- Tweede reeks: de tabernakel is het zwaarste tafereel (bijna 4800 tekens) en op een telefoon zijn het altaar, het
  wasvat en de kleuren van de poort klein. De hoop water in de Jordaan oogt als een koepel. `muur-puin` heeft een
  nachtlucht met het land in daglichtkleuren onder één laag `k-schaduw`; een eigen kleurklasse voor nachtland zou mooier zijn. Het gouden beeld bij de
  oven is alleen een hoge smalle vorm, omdat de Bijbel geen gedaante noemt. De leeuwenkuil is een doorsnede: dat is
  een keuze, de Bijbel zegt alleen dat de steen op de mond van de kuil lag.
- `rots` dient voor twee geschiedenissen (Rafidim en Kades); de tekening toont daarom geen berg Horeb.
- Het knopje ‘Nog een keer’ staat rechtsonder over de tekening. Houd die hoek vrij van wat belangrijk is (bij de
  gevangenis van Filippi raakt het de open deur net).
- Nieuwe Testament: de netten bij `vissersboot` zijn een hoop met mazen en drijvers; hangend aan palen zouden ze
  duidelijker zijn. Het afgebroken achterschip bij `malta-schip` lijkt op een tweede bootje. De
  wilde vijgenboom is een grote boom met vijgen, geen botanisch juiste sycomoor. De regen op Malta beweegt niet.
- De nachtbeelden zijn onder de sluier grijsblauw; de huizen van Bethlehem zouden iets warmer mogen.
