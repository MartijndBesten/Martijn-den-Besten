# Ontwerpsysteem ‘Playful Premium’

**70% verfijnd ontwerp, 30% gecontroleerde gekkigheid.**

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
| Kobalt | `#3c5bd6` | `#2a3fa0` | `#cdd6fa` |
| Koraal | `#f2785c` | `#9c3720` (grote tekst: `#d4502f`) | `#f9cfc2` |
| Salie | `#9fc39a` | `#35603b` | `#cfe3c8` |
| Lila | `#c3b2f0` | `#5440a6` | `#dcd0f7` |
| Boter | `#f6d36b` | `#7a5a00` | `#f7e3a1` |
| Terracotta | `#b65a3a` | `#9a4529` | — |

**Basis:**

- ivoor `#f5efe4` (achtergrond);
- papier `#ece4d5` (vlakken);
- wit `#fffdf8` (kaarten);
- inkt `#191b2e`.

**Regels:**

- Kleine tekst staat nooit in een volle accentkleur. Gebruik de diepe variant of inkt.
- Op koraal, boter, salie en lila staat altijd inkt, nooit wit.
- Op kobalt staat wit.
- Per sectie één kleurwereld, met hooguit twee accenten erbij.
- Geen harde primaire kleuren.
- Geen dikke zwarte cartooncontouren: lijnen zijn 1,5–2,2 px inkt.
- Geen decoratieve AI-gradients. Verlopen worden alleen gebruikt als schaduw op 3D-vormen.

## Kleurwerelden per onderdeel

| Onderdeel | Wereld |
| --- | --- |
| Hero en machine | Ivoor met kobalt-zacht podium, koraal/boter/lila vormen |
| Jaarverslag | Boter |
| Mededelingen | Inkt (‘nachtelijk bulletin’) |
| Afdelingen | Bento: boter, lila, kobalt (vol), salie |
| Missies / certificaat | Lila / koraal |
| Control Center | Panelen met elk een eigen kleur. Serieuze modus in vol kobalt, noodstop met boter-inkt waarschuwingsstrepen |
| Museum | Zaal I boter, II koraal (bouwplaats), III kobalt (labels aan een rail), IV lila (gokkast), V sterrenhemel, VI pikzwart met zaklamp |

## Typografie

- **Geist 700–760**: koppen en grote statements. Strak gespatieerd (−0,035 tot −0,065 em).
- **Instrument Serif cursief**: karakteraccenten. `<em>` in een kop wordt automatisch serif-cursief in de accentkleur, bijvoorbeeld ‘Martijn *den* Besten’ of ‘Officiële *mededelingen*’. Ook gebruikt voor citaten en de mededelingen zelf.
- **Geist Mono**: labels, octrooinummers en metadata. Klein, in kapitalen, ruim gespatieerd.

## Vormen en illustraties

- **Plat 3D**: volle vlakken met één glanslicht en één schaduwkant. Zie `Objects.tsx` (afdelingsobjecten en zwevende vormen) en `Artwork.tsx` (procedurele museumobjecten: bol, cilinder, kubus, kegel, ring, blob en boog).
- **Kaarten**: ronde hoeken van 22–36 px. Secties zijn ‘platen’ met nog grotere ronde hoeken en een smalle marge, zodat de pagina als losse zalen leest.
- **Knoppen**: pillen met een tastbare onderrand. Bij indrukken zakt de knop in.
- **Stempels**: staan altijd een paar graden scheef (`--tilt`).

## De ideeënmachine (FIG. 1)

`src/components/IdeaMachine.tsx`: een uitvinding van een creatief industrieel ontwerper, geen personage. Er zitten bewust geen gezichtjes in. De onderdelen hangen mechanisch samen:

- **Tandwiel A** (12 tanden) draait een **kruk**. Een drijfstang zet die draaiing om in de op-en-neer-beweging van de **zuiger** in de glazen cilinder. De kinematica wordt per frame berekend (`crank()`) en een unit-test bewaakt dat de zuiger in de cilinder blijft.
- **Tandwiel B** (8 tanden, overbrenging 1,5×) drijft via een **riem** de **lopende band** aan.
- De **gyroscopische denkkamer** heeft drie ringen rond een kern en draait mee met de aandrijving.
- Verder: trechter, glazen twijfelbuis met klemringen, inspiratielamp, schoorsteen, ideeënmeter tot ‘veel te veel’, ventilatierooster, klinknagels, een achterhuis voor diepte, een **pers** boven de band en een **windvaan** (uitgesneden metalen vogel) op de cilinder.

**Een tik geeft deze reeks (± 2 s):**

1. Een gedachte reist door de buis.
2. In de denkkamer licht de kern koraal op en versnellen de ringen. Tegelijk pompt de zuiger, slaat de meter uit en komt er rook uit de schoorsteen.
3. Er gebeurt iets onverwachts: de lamp springt los, er verschijnt een Eureka-vlag, de machine stempelt zichzelf ‘Goedgekeurd’, of er komt een veer met signaalschijf uit de trechter.
4. De pers stempelt de uitvinding en de band voert hem af.

**Zeldzame reacties:**

- **Losse moer**: ongeveer 1 op 12 kans. De moer stuitert weg en de status meldt ‘Moertje los (geen zorgen)’.
- **Mega-idee**: elke 9e uitvinding.
- **Vastgelopen**: 12 tikken binnen 6 s. De machine print een storingsrapport. Dit is ook een missie.
- **Gouden modus**: de windvaan geeft vijf gouden uitvindingen.

Genummerde callouts leggen de acht onderdelen uit. Ze zijn met muis, touch en toetsenbord te bedienen.

**Uitvindingen:**

- Ze komen uit `src/content/inventions.ts`: onderwerp × apparaat × bijvoeglijk naamwoord × model, met grammaticaal passende beschrijvingen.
- Daarnaast zijn er klassiekers en de mega- en gouden reeksen.
- Er zijn meer dan 10.000 combinaties, volledig lokaal.

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
| 5 | Een gouden sleutel in de hero (nieuwe verrassing). De machine krijgt ‘MDB-1 ★’ en een gouden gedachte in de trechter |
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

- De machine heeft één `requestAnimationFrame`-lus. Die draait alleen als de machine in beeld is en iets te doen heeft. Na een paar seconden zonder interactie komt alles tot stilstand.
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
