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

`src/components/IdeaMachine.tsx`: half technisch, half absurd. Onderdelen:

1. trechter met ruwe gedachten;
2. glazen twijfelbuis;
3. denkkamer met een bewoner die meekijkt;
4. twee tandwielen die echt in elkaar grijpen (12 en 8 tanden, overbrenging 1,5×);
5. inspiratielamp;
6. schoorsteen;
7. ideeënmeter tot ‘veel te veel’;
8. lopende band;
9. vogeltje.

**Een tik geeft deze reeks (± 2 s):**

1. Een gedachte reist door de buis.
2. De denkkamer en de tandwielen versnellen. De romp rommelt, de meter slaat uit en er komt rook uit de schoorsteen.
3. Er gebeurt iets onverwachts: de lamp springt los, er verschijnt een Eureka-vlag, de machine stempelt zichzelf ‘Goedgekeurd’, of er komt een veer met ster uit de trechter.
4. Een octrooikaart rolt over de band. De kaart toont naam, octrooinummer, illustratie, beschrijving en een scheve status.

**Bij veel gebruik:**

- **Oververhit**: rode gloed, rook en een knipperend lampje.
- **Vastgelopen**: 12 tikken binnen 6 s. De machine kantelt en print een storingsrapport. Dit is ook een missie.
- **Elke 9e uitvinding** is een mega-idee: de romp zwelt op en er komt een XXL-kaart uit.
- **Het vogeltje** zet de gouden modus aan voor vijf uitvindingen.

**Genummerde callouts** leggen de onderdelen uit. Ze zijn met muis, touch en toetsenbord te bedienen.

**Uitvindingen:**

- Ze komen uit `src/content/inventions.ts`: onderwerp × apparaat × bijvoeglijk naamwoord × model, met grammaticaal passende beschrijvingen (ook bij meervoud).
- Daarnaast zijn er 16 klassiekers en de mega- en gouden reeksen.
- Er zijn meer dan 10.000 combinaties, volledig lokaal, zonder AI-API.

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
