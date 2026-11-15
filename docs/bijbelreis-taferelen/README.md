# Taferelen van de Bijbelreis

Bij een stap waar alles op één plek gebeurt, beweegt er op de kaart niets. Daar staat een **tafereel**: een getekende,
licht bewegende afbeelding van wat daar gebeurt of hoe het er daar uitziet. Dit document is voor wie verder tekent of de
motor onderhoudt. Wie alleen wil zien wat er is: open `docs/bijbelreis-taferelen/overzicht/desktop.png`.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/taferelen.js` | De motor (`BR.tafereel`), de tekenbouwstenen (`BR.tfTeken`) en de standaardbeelden per soort plaats |
| `public/bijbelreis/taferelen-ot.js` | Eigen taferelen bij het Oude Testament (later ook `taferelen-nt.js`) |
| `public/bijbelreis/taferelen-koppeling.js` | Welke stap welk beeld krijgt (`BR.beelden`) en afwijkende soorten per plaats (`BR.beeldSoort`) |
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
   hooguit 6000 toe. Alle tekenbestanden samen blijven onder 60 kB (nu ruim 31 kB).

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
| `o`, `o2` | warme omlijning (1,2 en 0,7 dik), zoals bij de kameel |
| `l-hout2`, `l-hout`, `l-zand2`, `l-wit`, `l-zee`, `l-duin`, `l-salie`, `l-salie2`, `l-terra`, `l-oker`, `l-water`, `l-lila`, `l-licht` | lijnen zonder vulling |
| `dik`, `breed`, `boog` | lijndikte 2,4 · 5 · 3,2 |
| `steen` (+ `s2`) | een rij tichelstenen als gestreepte lijn |

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
| `tf-w1` … `tf-w9` | wacht 0,45 s per stap voordat de beweging begint |

Regels bij beweging:

- Een onderdeel met een bewegingsklasse heeft zelf **geen** `transform`-attribuut; de beweging zou het overschrijven. Zet
  de plaatsing op een `<g>` eromheen, of andersom.
- Wat verdwijnt (`tf-e-uit`, `tf-e-stort`, `tf-e-stof`) teken je bovenop de eindstand. Voorbeeld Jericho: eerst de
  huizen en het puin, daarbovenop de hele muur met `tf-e-stort`.
- **Minder beweging** hoef je per tafereel niet af te vangen. De css zet bij `prefers-reduced-motion` alle `tf-l-…` en
  `tf-e-…` uit; dan blijft de eindstand staan. Controleer wel dat die eindstand het verhaal vertelt: de muur ligt om, het
  water staat als een muur, de boog staat in de wolken.
- De motor herkent een eenmalige beweging aan `tf-e-` in de tekening en zet dan het knopje ‘Nog een keer’.
- Nieuwe beweging nodig? Voeg een klasse `tf-l-…` of `tf-e-…` met eigen `@keyframes` toe in `bijbelreis.css`, bij de
  andere. Houd de naamgeving aan, anders pauzeert ze niet buiten beeld en staat ze niet stil bij minder beweging.

## 4. Een tafereel toevoegen

1. Lees de tekst: `node scripts/sv.mjs "Jozua 4:1–9"`. Schrijf op wat er letterlijk staat en wat niet.
2. Voeg het tafereel toe in `taferelen-ot.js` of `taferelen-nt.js` (een nieuw bestand laad je in `bijbelreis.html`
   tussen `taferelen.js` en `taferelen-koppeling.js`):

   ```js
   // Jozua 4:8–9, 20: twaalf stenen uit de Jordaan, opgericht in Gilgal.
   "twaalf-stenen": { n: "Twaalf stenen in Gilgal",
     label: "Twaalf grote stenen staan opgestapeld bij het kamp in Gilgal. Erachter stroomt de Jordaan.",
     svg: K.verte + `<path class="k-land" d="M0 96q90-12 180-4t140-6v54H0z"/>` + … },
   ```

   - `n`: korte naam, komt vet onder het beeld.
   - `label`: wat je ziet, in hele zinnen, voor wie het beeld niet ziet. Noem ook wat er beweegt.
   - De ids `stad`, `berg`, `water`, `put`, `kamp`, `altaar`, `tent`, `gebied` en `rivier` zijn van de standaardbeelden.
3. Koppel het in `taferelen-koppeling.js`:

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
   # e2e: eerst een server die public/ serveert (zie de kop van e2e/bijbelreis-taferelen.spec.ts), dan
   E2E_BASE_URL=http://127.0.0.1:8816 npx playwright test e2e/bijbelreis-taferelen.spec.ts --trace off
   ```

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

## 7. Wat nog getekend moet worden

Eerst de plekken die nu **geen** beeld hebben omdat het standaardbeeld daar iets zou tonen wat de Bijbel niet zegt
(zie `BR.beeldSoort` en de lege koppelingen):

- het lege graf met de afgewentelde steen (Golgotha heeft nu geen beeld; vier stappen);
- Gethsémané: de hof met olijfbomen, nacht;
- de herders in het veld bij nacht (Lukas 2:8; zonder engel als figuur: licht mag);
- de tempel (bij `nt_tempel` staat nu de stad Jeruzalem);
- Jeruzalem met de afgebroken muur en de muur van Nehemia in aanbouw (Ezra, Nehemia, Zacharia);
- het schip in de storm bij Malta; Patmos en de zeven kandelaren;
- de palmboom van Debora; de hut en de wonderboom van Jona; de Areopagus; een dorp zonder muur (Bethanië, de tien
  melaatsen); de lege kuil bij Dothan; de hof van Eden wordt niet getekend.

Dan de taferelen uit de opdracht:

- de tabernakel (Exodus 25–27; 35–40); manna; het water uit de rots; de koperen slang;
- de Jordaan die stilstaat en de twaalf stenen (Jozua 3–4);
- Gideons kruiken en fakkels; de tempel van Salomo; het vuur op de Karmel; de wagen en paarden van vuur;
- de muur van Nehemia; de leeuwenkuil; de vurige oven; de storm en de grote vis;
- de ster boven Bethlehem; de kribbe (zonder het Kind af te beelden);
- een vissersboot op het meer; vijf broden en twee vissen;
- het lege graf; de tongen als van vuur; het schip in de storm bij Malta; de zeven kandelaren.

## 8. Wat nog beter kan

- De sandalen bij de braamstruik zijn klein; op een telefoon zijn ze nog net te herkennen.
- De ark is naar de maten van Genesis 6:15 getekend (lang en laag). Dat is juist, maar het oogt als een lang huis.
- De standaardstad heeft altijd een muur. Bij een plaats die de Bijbel een ‘vlek’ (dorp) noemt, hoort dat beeld niet;
  zet zo’n plaats in `BR.beeldSoort` op `""` tot er een dorp getekend is.
- In het Samen-verhaal op een telefoon schuift het beeld de knop ‘Verder’ verder naar beneden.
