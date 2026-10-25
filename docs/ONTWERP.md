# Ontwerpsysteem ‘Playful Premium’ · 3D-werkplaats

**70% verfijnd ontwerp, 30% gecontroleerde gekkigheid.** Sinds de versie ‘Playful 3D Workshop’ is het instituut een ruimtelijke uitvinderswereld: pastelkleurige machines met afgeronde vormen, zachte schaduwen en echte mechanische samenhang.

De site is een eigenzinnig instituut: een uitvinderswerkplaats van de toekomst, met een museum en een speeltuin vol knoppen. De basis is rustig: warm ivoor en diep inktblauw. Daarop krijgt elk onderdeel een eigen kleurwereld.

De octrooi-elementen zijn de herkenbare signatuur, maar spaarzaam gebruikt: maatlijnen, fig.-nummers, genummerde callouts en scheve stempels. Ze domineren de vormgeving niet meer.

Vorige richting: ‘Octrooibureau’. Die bleek te serieus. De richting daarvoor was te clownesk. Deze versie zit daartussen.

## Kleuren

Elke accentkleur heeft drie varianten:

- **vol**: voor vlakken en objecten;
- **diep**: voor tekst, met genoeg contrast;
- **zacht**: voor de achtergrond van een kleurwereld.

| Token | Vol | Diep (tekst) | Zacht (wereld) |
| --- | --- | --- | --- |
| Kobalt → donkerblauw | `#34407a` | `#2f3a66` | `#dbe7f7` (lichtblauw) |
| Koraal → poederroze | `#ee9aac` | `#8e2c49` (grote tekst: `#c24d6b`) | `#f8d9e0` |
| Salie → mint | `#a9dcc4` | `#2c6a4f` | `#d5efe3` |
| Lila | `#cdbdf0` | `#5440a6` | `#e6ddf8` |
| Boter | `#f6d781` | `#7a5a00` | `#f9eabf` |
| Terracotta | `#b65a3a` | `#9a4529` | — |

De tokennamen zijn gelijk gebleven; alleen de waarden zijn naar pastel geschoven. De 3D-bouwdoos gebruikt hetzelfde palet (`PAL` in `src/three/kit.ts`).

**Basis:**

- warm crème `#f7f1ec` (achtergrond);
- papier `#efe5de` (vlakken);
- wit `#fffdf8` (kaarten);
- inkt `#191b2e`.

**Regels:**

- Kleine tekst staat nooit in een volle accentkleur. Gebruik de diepe variant of inkt.
- Op koraal, boter, salie en lila staat altijd inkt, nooit wit.
- Op (donker)blauw staat wit.
- Per sectie één kleurwereld, met hooguit twee accenten erbij.
- Geen harde primaire kleuren.
- Geen dikke zwarte cartooncontouren: lijnen zijn 1,5–2,2 px inkt.
- Geen decoratieve AI-gradients. Verlopen worden alleen gebruikt als schaduw op 3D-vormen.

## Kleurwerelden per onderdeel

| Onderdeel | Wereld |
| --- | --- |
| Hero en machine | Crème met een lichtblauwe werkplaats; 3D-machine in roze, boter, mint, lila en lichtblauw |
| Jaarverslag | Boter |
| Mededelingen | Inkt (‘nachtelijk bulletin’) |
| Afdelingen | Bento: boter, lila, kobalt (vol), salie |
| Missies / certificaat | Lila / koraal |
| Control Center | Eén crème lessenaar met lichtblauwe toren; modules op het dek in eigen pastel, noodstop op boter-donkerblauwe strepen |
| Museum | Zaal I boter, II poederroze (bouwplaats), III donkerblauw (labels aan een rail + archiefmachine), IV lila (kleine ideeënmachine), V sterrenhemel met kinetische installatie, VI donkere 3D-zaal met zaklamp |

## Typografie

- **Geist 700–760**: koppen en grote statements. Strak gespatieerd (−0,035 tot −0,065 em).
- **Instrument Serif cursief**: karakteraccenten. `<em>` in een kop wordt automatisch serif-cursief in de accentkleur, bijvoorbeeld ‘Martijn *den* Besten’ of ‘Officiële *mededelingen*’. Ook gebruikt voor citaten en de mededelingen zelf.
- **Geist Mono**: labels, octrooinummers en metadata. Klein, in kapitalen, ruim gespatieerd.

## Vormen en illustraties

- **3D-objecten**: afdelingsobjecten, hero-vormen en museumstukken zijn vooraf gerenderd uit de 3D-bouwdoos (`public/3d/*.webp`, opnieuw maken met `node scripts/render-3d.mjs`). Octrooitekeningen op de uitvindingskaarten blijven bewust lijntekeningen (`InventionFig.tsx`).
- **Kaarten**: ronde hoeken van 22–36 px. Secties zijn ‘platen’ met nog grotere ronde hoeken en een smalle marge, zodat de pagina als losse zalen leest.
- **Knoppen**: pillen met een tastbare onderrand. Bij indrukken zakt de knop in.
- **Stempels**: staan altijd een paar graden scheef (`--tilt`).

## 3D: techniekkeuze

**Gekozen: hybride.** Live three.js voor de twee interactieve machines, vooraf gerenderde 3D-beelden (WebP) uit dezelfde bouwdoos voor al het andere, en gewone HTML voor alle tekst en bediening.

| | Live WebGL (three.js) | React Three Fiber | Spline / Rive-export | 2.5D (vooraf gerenderd + CSS) | Model-viewer / glTF |
| --- | --- | --- | --- | --- | --- |
| Visuele kwaliteit | hoog (echte schaduw, licht, reflectie) | gelijk aan three.js | hoog, maar ‘stock’-look | hoog, statisch per beeld | hoog, alleen losse objecten |
| Interactie | volledig (mechanische reeksen) | volledig | beperkt tot de editor | beperkt (lagen, sprites) | draaien/zoomen |
| iPhone-prestaties | goed met render-op-verzoek | iets zwaarder (React-reconciler) | zware runtime | uitstekend | redelijk |
| Complexiteit / onderhoud | middel, alles in code | middel, extra abstractie | laag, maar buiten de repo | laag | laag, maar modellen buiten code |
| Bundelgrootte | ~148 kB gzip, lazy | +40–60 kB extra | 300 kB+ runtime | 0 kB JS | ~100 kB + modellen |
| Toegankelijkheid | via HTML-laag | via HTML-laag | canvas, moeilijk | via HTML-laag | redelijk |

Waarom hybride:

- Alleen waar interactie het verhaal draagt (de ideeënmachine en het Control Center) draait echte 3D. Die scènes laden pas bij de eerste echte interactie (muis, toets, aanraking), dus Lighthouse en de eerste paginalading merken er niets van.
- Museum, afdelingen, hero-vormen en posters komen uit **dezelfde** bouwdoos, maar worden vooraf gerenderd met `node scripts/render-3d.mjs` (headless Chromium + SwiftShader). Eén visuele taal, nul JavaScript voor statische objecten.
- Een poster die pixel voor pixel gelijk is aan het eerste 3D-frame staat er meteen; de live scène neemt het ongemerkt over.
- **Geen statische afbeelding met onzichtbare klikgebieden**: de machines bewegen echt (tandwielen, band, sorteerarm, pers, hendel, meters), en de HTML-knoppen liggen op geprojecteerde ankerpunten van de 3D-onderdelen.

### Bouwdoos (`src/three/`)

| Bestand | Inhoud |
| --- | --- |
| `engine.ts` | Eén renderer met zacht studiolicht (RoomEnvironment, hemellamp, één schaduwlamp), contactschaduw, render-op-verzoek, `tween` en `easing` (inOut, spring, thump). |
| `kit.ts` | Palet, materialen (mat gelakt, kunststof, geborsteld metaal, glas), onderdelen: afgeronde blokken, buizen met kragen, glazen buizen, kabels, tandwielen, trechter, meter, lopende band, ribbelplatform, boog, lampje, bal, kaartje. |
| `scenes/ideaMachine.ts` | De grote ideeënmachine (live). |
| `scenes/console.ts` | De bedieningsinstallatie van het Control Center (live). |
| `scenes/objects.ts` | Objectstudio voor alle vooraf gerenderde beelden. |
| `useLazy3D.ts` | Gedeelde laadlogica: poster, laden bij interactie, pauze buiten beeld, kwaliteit per apparaat, terugval. |
| `machineInfo.ts`, `consoleInfo.ts`, `stillInfo.ts` | Posterformaten, ankerpunten en teksten, zonder three.js (mogen in de hoofdbundel). |

### Prestaties, batterij en terugval

- Render-op-verzoek: er wordt alleen getekend als er iets beweegt; stilstand = nul frames.
- Buiten beeld wordt de lus gepauzeerd (IntersectionObserver).
- Pixelratio max. 2 (desktop), 1,5 (mobiel) en 1,25 op zwakke apparaten (≤ 4 kernen of ≤ 3 GB); kleinere schaduwkaarten op mobiel.
- Zonder WebGL, met `prefers-reduced-motion` of met databesparing blijft de poster staan en werkt alle bediening via HTML. De machine levert dan direct een uitvinding.
- De functionele e2e-tests draaien bewust **zonder** WebGL (terugvalpad); `e2e/drie-d.spec.ts` draait **met** WebGL en controleert dat de scènes live komen, pixels tekenen en reageren.

## Stijlanker (vast uitgangspunt)

Het referentiebeeld (Behance ‘Playful’: pastelkleurige isometrische machine met ribbelbaan, waaierbogen, glazen buizen en een roze leiding uit het plafond) is **het vaste stijlanker** van de 3D-wereld. Nieuwe 3D-onderdelen moeten hierop aansluiten:

- **Decor**: één zacht poederroze vlak (`#f6e8ea` → `#f2e1e4`) waar alles op staat; geen kleurvlekken of losse achtergrondvormen.
- **Kleur**: warm botergeel als hoofdkleur, poederroze, lichtblauw, mint en lila; het donkere accent is **gedempt jeansblauw** (`#5f7aa3`, leisteen `#4a6089`), nooit hard donkerblauw of zwart.
- **Vorm en materiaal**: afgeronde, gegoten vormen; mat gelakt; een vleugje glans op knoppen en ballen; transparante buizen met een glanslijn.
- **Textuur**: fijne ribbels (de geribbelde baan onder de machines, het ribbelplatform, de waaierboog bij de uitvoer).
- **Compositie**: alles staat op de vloer met een zachte contactschaduw; leidingen en kabels verbinden onderdelen zichtbaar; een leiding komt uit het plafond.
- **Details**: een paar geaarde props (planten in potten, tuimelpillen op de vloer), nooit willekeurig zwevend.
- **Niet doen**: gezichtjes, harde contrasten, glimmende chroom-look, generieke ‘AI-illustratie’ met losse zwevende objecten, letterlijk kopiëren van de referentie.

In code: `PAL` en de onderdelen `ribbedTrack`, `fanArch`, `ribbedPlatform`, `plant` en `pillSwitch` in `src/three/kit.ts`.

## Referentieanalyse

De referentie (Behance) toont een pastelkleurige isometrische machine: buizen, een band, een geribbeld geel platform, een klok, een blauwe bak, een stippenbord op stangen en een roze leiding uit het plafond.

Overgenomen als **principes**, niet als kopie:

- zachte pastels met één donkerblauw contrast;
- afgeronde, ‘gegoten’ vormen met matte lak;
- leidingen en kabels die onderdelen zichtbaar verbinden;
- een leiding uit het plafond als anker in de ruimte;
- objecten staan op de vloer, met contactschaduw. Niets zweeft zonder reden.

Bewust anders: geen klok maar een ideeënmeter, een sorteerarm met keurbord en een stempelpers (oorzaak → gevolg), en een eigen uitvoerstation met boog en ribbelplatform.

## De ideeënmachine (FIG. 1, live 3D)

`src/three/scenes/ideaMachine.ts` + `src/components/IdeaMachine.tsx`. Geen gezichtjes, geen personages: een installatie.

**Eén tik (± 4 s):**

1. Een bal valt uit de invoertrechter (op een driepoot) en rolt door de glazen buis.
2. In de verwerker draaien drie tandwielen (12, 8 en 6 tanden, juiste overbrenging) en slaat de meter uit.
3. Via de tweede buis valt het idee op de lopende band.
4. De sorteerarm keurt het; het stippenbord licht op in de kleur van het idee.
5. Goedgekeurd: de pers stempelt de bal tot octrooikaart, die door de boog naar het platform rijdt. Afgekeurd: de arm veegt het idee in de afkeurbak.

**Varianten:**

| Variant | Kans |
| --- | --- |
| Afgekeurd (status ‘Afgekeurd: …’) | ± 1 op 5 |
| Twee ideeën tegelijk (bijproduct) | ± 1 op 7 |
| Korte hapering in de verwerker (rook, rode lamp, herstelt zichzelf) | ± 1 op 25, na 4 tikken |
| Mega-idee (grotere bal, langer brommen) | elke 9e |
| Vastgelopen met storingsrapport (missie) | 12 tikken binnen 6 s |
| Gouden modus | via de verborgen sleutelschakelaar op de verwerker |

Desktop: brede compositie naast de titel. Mobiel: een eigen camera (compacter, dichterbij) met grotere tikdoelen. Acht genummerde callouts liggen op de 3D-onderdelen.

## Het Control Center (live 3D)

`src/three/scenes/console.ts` + `src/pages/ControlCenter.tsx`: één bedieningslessenaar (MdB-2 ‘Altijd Aan’) in plaats van losse kaarten.

- **Toren**: centraal display (HTML-tekst, met een perspectieftransformatie precies op het 3D-scherm gelegd), meters voor belasting en voortgang, een rij van elf lampjes en een zwaailicht.
- **Hellend dek**: grote rode ideeënknop, creativiteitsknop met ledkrans, sleutelschakelaar ‘Project afronden’, rustkussen ‘Even niets doen’, muntgleuf ‘Domeinnaam’, tuimelschakelaar ‘Serieuze modus’, drie instellingsschakelaars en een noodstop met klapkapje.
- **Rondom**: ideeënreservoir met glazen leiding naar het display, printer voor domeinbonnetjes, hendel met capsulemagazijn en glazen goot naar de uitvoerbak, creativiteitsplant, rail met de weglopende knop.

| Bediening | Wat de machine doet |
| --- | --- |
| Nieuw idee | knop zakt in, een bal reist door de leiding, het display licht op |
| Creativiteit | knop draait, ledkrans en lampjes lopen mee, plant groeit, ledstrip kleurt warmer; vanaf 7 lopen de lampjes en dansen de ballen; ideeën worden gekker (twee eigenschappen, ‘in drievoud’) |
| Project afronden | sleutel draait, voortgangsmeter loopt op en blijft trillend op 99% hangen |
| Even niets doen | lampjes gaan één voor één uit, het scherm dooft… en de machine start zichzelf weer op (Fout 404) |
| Domeinnaam | munt valt in de gleuf, de printer drukt een bonnetje af |
| Hendel | capsule rolt uit het magazijn door de goot in de bak |
| Noodstop | kapje klapt open; daarna gecontroleerde stilstand, rood scherm, draaiend zwaailicht, herstel na 5 s |

Mobiel: een compacte console met display, hoofdknop, draaiknop, rustkussen, noodstop en hendel. De overige bediening zit in een uitklapbare **bedieningslade**. Logboek, bonnetjes en capsules staan in het uitvoerstation onder de console.

## Museum

Elke zaal houdt zijn eigen ruimtelijke karakter, met objecten uit dezelfde bouwdoos:

| Zaal | 3D |
| --- | --- |
| I Briljante ideeën | objecten op sokkels, als **draaiplateau** (8 aanzichten; draaien met muis of vinger) |
| II Bijna afgerond | bijna-af-machines op een werkplaatsvloer met tape, losse tandwielen en schroeven |
| III Domeinenarchief | archiefmachine: een kaartje gaat de gleuf in en vliegt naar een la |
| IV Ideeëngenerator | een kleine ideeënmachine; de rollen staan met perspectief in het venster |
| V Archief van Morgen | kinetische installatie: wiel en slinger draaien als losse 3D-lagen (alleen in beeld, uit te zetten, stil bij minder beweging) |
| VI Geheime Zaal | een donkere 3D-zaal die je met de zaklamp verkent |

Niet alles is realtime 3D: alleen waar het iets toevoegt.

## Jaarverslag

Geen zes gelijke dashboardkaarten, maar een compositie op de botergele achtergrond:

- **14.892 bedachte ideeën** staat het grootst, met een verhoudingsbalk ‘afgerond t.o.v. bedacht: 0,02%’.
- **3 afgeronde projecten** staat als donker insigne op koraal.
- Een **kasboek** met puntjeslijnen bevat de overige drie cijfers.
- Een **koffiekopje** schenk je bij met een tik. Het telt mee als ‘waarvan N van u’ (alleen in deze browser).

Er staat één droge bronvermelding in plaats van overal disclaimers.

## Overgangen tussen secties

Kleine objecten liggen op de naad tussen twee secties. Ze bewegen één keer zodra ze in beeld komen:

| Overgang | Object |
| --- | --- |
| Statusbalk → jaarverslag | Een bal rolt het jaarverslag in |
| Jaarverslag → mededelingen | Een stempel ‘Gezien door de directie’ |
| Mededelingen → afdelingen | Een ster aan een stippeldraad zakt omlaag |
| Afdelingen → statement | Een ring rolt binnen |

Er is geen parallax. Zonder beweging (reduced motion) staat alles meteen op zijn plek.

## Missies en ontdekkingen

**Stempelkaart** (`StampCard.tsx`):

- Acht vakjes met een rang (Nieuwkomer → Bezoeker → Vaste gast → Ere-uitvinder → Opperbezoeker) en een voortgangsbalk.
- Een nieuw verdiende missie krijgt één keer een stempelanimatie. Welke stempels al gezien zijn, staat alleen in localStorage.
- Meldingen voor missies krijgen een ‘Gestempeld’-stempel.

**Ontdekkingsniveaus** (`data-ontdekt` op `<html>`, op basis van het aantal gevonden verrassingen):

| Ontdekkingen | Wat er verandert |
| --- | --- |
| 3 | Een geheim sterretje op het zegel in de kop |
| 5 | Een gouden sleutel in de hero (nieuwe verrassing). Het machinebordje wordt ‘MDB-1 ★’ |
| 8 | De zandloper in de footer loopt eindelijk, en u staat in het ontdekkersregister |

- Bij alle missies krijgt de bezoeker automatisch een **gouden certificaat** als Opperbezoeker.
- Nieuwe bezoekers zien hier niets van. De site blijft rustig.
- Er zijn geen accounts en er worden geen persoonsgegevens opgeslagen.

## Beweging: drie niveaus

| Niveau | Duur | Voorbeelden |
| --- | --- | --- |
| 1. Micro-interacties | `--t-micro` 160 ms | knoppen zakken in, pillen tillen op, callouts schalen |
| 2. Functioneel | `--t-func` 420 ms | tandwielen en band, hendel, schakelaars, header die compacter wordt, plant die meegroeit met creativiteit |
| 3. Bijzondere momenten | `--t-moment` 900 ms | uitvinding uitprinten, verrassing in de machine, noodstop, storingsrapport, geheime zaal |

Easing:

- `--ease-out`: voor binnenkomen;
- `--ease-spring`: voor verende, fysieke reacties;
- `--ease-mech`: voor mechanische bewegingen.

**Prestaties en batterij:**

- De 3D-scènes renderen alleen als er iets beweegt en pauzeren buiten beeld. De hero-vormen zweven drie keer en liggen dan stil.
- Een `IntersectionObserver` pauzeert alle CSS-animaties buiten beeld. Dat geldt voor de machine (`.is-offscreen`) en voor de hero-vormen (`.is-away`).
- Er zijn geen scrollgedreven SVG-metingen meer op de homepage.

Alles respecteert `prefers-reduced-motion`. De machine levert dan direct een uitvinding, zonder reeks.

## Header

- De header staat vast bovenaan. De inhoud heeft een vaste ruimte (`--header-h`), dus de header verschuift geen inhoud.
- Na 24 px scrollen wordt hij 12 px lager. De ondertitel en het zegel krimpen mee.
- Safe areas zijn verwerkt via `env(safe-area-inset-top)`, met `viewport-fit=cover`.
- Op mobiel staan in de header: het logo, de missie-indicator (ring + ‘3/8’) en het menu.
- Uiterlijk en geluid staan op mobiel in het menu.

## Uiterlijken

Er zijn drie uiterlijken, te kiezen in de header (desktop) of in het menu (mobiel):

- Ivoor (standaard);
- Blauwdruk;
- Nachtdienst.

Alle kleuren lopen via tokens. De zachte kleurwerelden krijgen in de donkere uiterlijken donkere tegenhangers.

## Deelbeeld

`public/og.png` is een schermafbeelding van de echte hero op 1200 × 630, zonder header en zonder callouts. `public/apple-touch-icon.png` komt uit `scripts/icon.html`.
