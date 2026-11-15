# Presentatie en boekje (`/bijbelreis/boekje`)

Een aparte pagina naast de atlas. Je kiest een stuk van de Bijbelreis (een deel van een reis, een paar stappen daarvan,
een heel Bijbelboek of één van de 150 geschiedenissen) en een reisniveau. Daar maakt de pagina van:

- een **presentatie**: een diavoorstelling op het volle scherm, voor digibord, beamer of een telefoon die je doorgeeft;
- een **boekje**: dezelfde inhoud als A4-bladzijden om te printen of als PDF op te slaan;
- een **los bestand**: één HTML-bestand met alles erin, dat je zonder internet opent (school-pc, kerkzaal);
- een **link** om te delen (kerkapp, groepsbericht, mail).

De pagina schrijft niets zelf. Elke tekst, verwijzing, vraag en tekening komt uit de gegevens van de atlas
(`inhoud/*.js`, `geschiedenissen/*.js`, `niveaus/*.js`, `taferelen*.js`). Er gaat niets naar een server; alleen de laatst
gekozen instelling (niveau en tempo) staat in `localStorage` onder `bijbelreis:boekje`.

**Voor een leerkracht, in drie zinnen.** Kies op bijbelreis.nl/bijbelreis/boekje het Bijbelboek, het deel en het niveau
van je groep en klik op ‘Maak de presentatie’. Zet de presentatie op het digibord met ‘Volledig scherm’ en blader met de
pijltjes, de spatiebalk of een presentatieklikker; bij een vraag laat ‘volgende’ eerst het antwoord zien. Wil je het op
papier of zonder internet, kies dan ‘Afdrukken of opslaan als PDF’ of ‘Download als bestand’.

## Adressen

| Adres | Wat |
| --- | --- |
| `/bijbelreis/boekje` | keuzescherm |
| `/bijbelreis/boekje#jakob` | een deel (de id van het deel, zoals in de atlas) |
| `/bijbelreis/boekje#abraham/3-8` | stap 3 tot en met 8 van een deel; `#abraham/3` is één stap |
| `/bijbelreis/boekje#jozua/intocht` | een deel met het boek ervoor (mag, hoeft niet) |
| `/bijbelreis/boekje#boek=exodus` | een heel Bijbelboek, alle delen achter elkaar |
| `/bijbelreis/boekje#v26` | één van de 150 geschiedenissen |
| `…&niveau=a` / `b` / `c` | Samen ontdekken (4–6), Zelf op reis (7–10), Verder ontdekken (11+); zonder: de laatste keuze, anders b |
| `…&toon=boekje` | opent meteen het boekje in plaats van de presentatie |
| `…&dia=5` | begint bij dia 5 (geteld vanaf 0) |

`/bijbelreis/boekje.html` en `/bijbelreis/boekje/` verwijzen door naar `/bijbelreis/boekje`, op beide workers:

- hoofdsite met Static Assets (`worker/index.ts`): dat doet `html_handling: "auto-trailing-slash"` al;
- hoofdsite ingebed (`worker/embedded.ts`): de bestaande `resolve` en doorverwijzing doen hetzelfde;
- bijbelreis.nl (`worker/bijbelreis.ts` → `worker/bijbelreis-app.ts`): `bijbelreisPagina` in `shared/bijbelreis.ts`.

`scripts/postbuild.mjs` zet een versienummer (inhoudshash) achter de scripts en stijlen van `boekje.html`, net als bij
`bijbelreis.html`, en de meta-tag met de versies van `geo.json` en `toen.json`.

## Wat per niveau in de presentatie staat

| | Samen ontdekken (a) | Zelf op reis (b) | Verder ontdekken (c) |
| --- | --- | --- | --- |
| Reis: tekst van een stap | de eerste zin (zoals de atlas) | de hele tekst | de hele tekst, met de personen |
| ‘Wist je dat?’ en afstand | nee | ja | ja |
| Kaart | alleen de plaatsen van de stap en de hoofdroute; geen rode zijroutes, geen omgeving van het deel | met de omgeving en de andere mogelijke plekken | idem |
| Geschiedenis | de korte stappen van niveau a, met ‘Voor wie voorleest’ | de vertelling van niveau b in onderdelen | de vertelling, uitleg, elders in de Bijbel en de verdieping |
| Jaartal | nee | nee | ja, met de grond (Bijbelse tijdrekening, reconstructie, onzeker) |
| Vragen | 2 antwoorden | 3 antwoorden | 3 antwoorden |

Vragen: hooguit vier, gelijk verdeeld over de lijst. Bij een reis zijn dat de vragen van de geschiedenissen bij die
stappen (zoals de speurtocht van de atlas), of anders de meerkeuzevragen van het deel; bij een stuk van een deel alleen
vragen waarvan de verwijzing bij die stappen hoort. De volgorde van de antwoorden is geschud, maar voor dezelfde link
altijd gelijk.

## Hoe de kaart getekend wordt

Geen Leaflet: `boekje-kaart.js` tekent een SVG uit `geo.json` (land, meren, rivieren, streken) en `toen.json` (het landschap
van toen: oude kusten en baaien, verdwenen meren, Nijlarmen; meren en stuwmeren die er toen niet waren, vallen weg), in
de kleuren van de atlas.

1. **Uitsnede.** Alle punten van de route(s) en de plaatsen van de stap, met marge (meer marge bij grote letters, voor de
   namen aan de rand), in de verhouding van het kaartvlak. Eén plaats krijgt de streek eromheen: de breedte volgt het
   zoomniveau van de stap in de atlas (`zoom`, anders 9; een korte reis 9,75). Een stap zonder plaats toont de streek
   (`view`). Nooit buiten de ondergrond.
2. **Projectie.** Mercator, zoals de atlas. Vlakken en lijnen worden afgeknipt op het beeld en vereenvoudigd tot een
   halve beeldpunt.
3. **Routes.** Eerdere stappen van dezelfde reis dun en doorschijnend op de achtergrond. De route van de stap met een
   lichte rand en een dunne donkere rand eromheen (ook een lichte kleur blijft op een beamer en in zwart-wit te zien), een
   **beginring** en een **pijlpunt** aan het eind in de looprichting; een lange route krijgt ook halverwege een pijl. Een
   reconstructie (`recon: 1`) is gestreept en de kaart krijgt het bijschrift ‘reconstructie’. In de presentatie tekent de
   route zich (een masker langs de lijn), de routes van een stap na elkaar en daarna de pijlpunt; bij
   `prefers-reduced-motion` en in het boekje staat alles meteen.
4. **Plaatsen** met hun zekerheid zoals in de atlas: volle stip (identificeerbaar), stip met witte kern (waarschijnlijk of
   betwist), bij betwist de andere mogelijke plekken als ringetjes, onbekend als vage cirkel met ‘?’, een gebied als zachte
   vlek. Vorm per soort (altaar, tent, put, berg, kamp). Onder de kaart staat een legenda met alleen wat erop staat.
5. **Namen** botsingsvrij: eerst begin en eind van de route en de plaatsen van de stap (vet), dan plaatsen langs de route,
   de omgeving van het deel en de streek- en zeenamen (dezelfde lijst als de atlas, op het passende zoomniveau). Een naam
   probeert acht plekken rond zijn stip en mag geen andere naam, stip, pijl, bord of de route raken. Wat niet past,
   vervalt, behalve begin, eind en de plaatsen van de stap: die mogen een stukje verder, met een lijntje naar hun stip.
6. **Schaalstok** linksonder, met een ronde afstand.

De lettergrootte van de namen volgt de hoogte van het podium (achter in een zaal leesbaar), niet de maat van de kaart.

## Bestanden

| Bestand | Wat |
| --- | --- |
| `public/bijbelreis/boekje.html` | de pagina; laadt dezelfde gegevens als de atlas (zonder Leaflet, personen en ‘Vandaag’) |
| `public/bijbelreis/boekje-inhoud.js` | van de gegevens naar een pakket met dia’s; leest en maakt de adressen |
| `public/bijbelreis/boekje-kaart.js` | de kaarttekenaar (uitsnede, projectie, knippen, routes, plaatsen, namen) |
| `public/bijbelreis/boekje-speler.js` | presentatie en boekje uit een pakket; draait ook in het losse bestand |
| `public/bijbelreis/boekje.js` | keuzescherm, laden, delen, los bestand |
| `public/bijbelreis/boekje.css` | stijl; gebruikt de kleuren en de taferelen uit `bijbelreis.css` |
| `worker/bijbelreis-app.ts` | de worker van bijbelreis.nl, los van de ingebedde bestanden (testbaar) |
| `tests/bijbelreis-boekje.test.ts` | kaarttekenaar, inhoud, adressen en worker |
| `e2e/bijbelreis-boekje.spec.ts` | de pagina in de browser, ook op telefoon en tablet |

## Het losse bestand

‘Download als bestand’ maakt in de browser één HTML-bestand (`bijbelreis-<deel>-niveau-<n>.html`): de dia’s van deze
keuze, alleen de plaatsen, routes en tekeningen die erin voorkomen, de ondergrond van alleen dit gebied (vereenvoudigd),
de speler, de stijl (de kleuren en taferelen uit `bijbelreis.css` plus `boekje.css`, zonder lettertypen: het bestand
gebruikt de lettertypen van de computer) en het logo als data-adres. Geen verzoeken naar buiten. Het bestand opent in
elke moderne browser, ook vanaf een USB-stick; presenteren, afdrukken en het boekje werken er net zo.
Grootte: een deel of geschiedenis ongeveer 130–270 kB (Kies dan het leven 135 kB, geschiedenis 26 141 kB, Van Ur naar
Kanaän 251 kB, Paulus naar Rome 265 kB), een heel Bijbelboek 330–380 kB (Genesis 336 kB, Handelingen 379 kB). Ongeveer
100 kB daarvan is vast (speler, kaarttekenaar, stijl, logo); de rest is de ondergrond van het gebied en de tekst.

## Wat niet kan, en waarom

- **Een videobestand (mp4).** Een video maken in de browser kan alleen door het scherm op te nemen (MediaRecorder op een
  canvas of op het tabblad); dat geeft per browser een ander formaat (vaak webm, geen mp4), vraagt toestemming om het
  scherm te delen en loopt niet betrouwbaar op school-pc’s en telefoons. Daarom is het niet half gebouwd. Wat wel kan:
  presenteren op het volle scherm, vanzelf afspelen in een rustig tempo, een PDF en het losse bestand. Wie toch een
  video wil: zet de presentatie op volledig scherm met ‘Vanzelf afspelen’ en neem het scherm op (Windows: Win+Alt+R met de
  Xbox Game Bar, of het Knipprogramma; Mac: Cmd+Shift+5; iPhone/iPad: schermopname in het bedieningspaneel; Android: de
  schermrecorder). Een vooraf gemaakte opname kan de eigenaar daarna als mp4 op de site of in de kerkapp zetten.
- **Insluiten in een andere site** (iframe in een kerkapp of schoolomgeving). De site staat dat bewust niet toe:
  `frame-ancestors 'none'` en `X-Frame-Options: DENY` in `public/_headers`. Een kerkapp of schoolomgeving kan wel de link
  openen. Insluiten toestaan is een aparte beslissing van de eigenaar (welke sites, en wat dat betekent voor de
  beveiliging); er is niets aan veranderd.
- **Offline zonder het losse bestand.** De pagina zelf heeft geen service worker; zonder internet werkt alleen het losse
  bestand.

## Ingang vanuit de atlas (voor de integrator)

In `app.js`/`bijbelreis.html` is niets veranderd. Voorstel voor twee links:

- bij een deel (onder ‘Laat dit hele deel zien’ of in het kruimelpad): **‘Presentatie of boekje van dit deel’** →
  `/bijbelreis/boekje#<deel.id>&niveau=<niveau>`; bij een gekozen stap eventueel `#<deel.id>/<stap>`;
- bij een geschiedenis (onder ‘Lees in je Bijbel’): **‘Presentatie of boekje’** → `/bijbelreis/boekje#v<nr>&niveau=<niveau>`.

Het niveau meegeven houdt de keuze van de atlas vast; zonder `niveau` gebruikt de pagina haar eigen laatste keuze.

## Controleren

```sh
node --check public/bijbelreis/boekje*.js
npx vitest run tests/bijbelreis-boekje.test.ts
# e2e: een servertje dat public/ serveert, /bijbelreis naar bijbelreis.html en /bijbelreis/boekje naar
# bijbelreis/boekje.html stuurt (zoals in scripts/bijbelreis-check.mjs), op poort 8824; dan
E2E_BASE_URL=http://127.0.0.1:8824 npx playwright test e2e/bijbelreis-boekje.spec.ts --trace off
npm run build   # dist/client/bijbelreis/boekje.html met ?v=… achter scripts en stijlen
```

## Wat nog beter kan

- In het boekje staat bij Zelf op reis en Verder ontdekken meestal één stap per bladzijde (kaart, tekst, tafereel en
  weetje zijn net te hoog voor twee); bij Samen ontdekken passen er vaak twee.
- Bij een reis met veel plaatsen dicht bij elkaar (Paulus’ reizen op een telefoon) staan sommige namen met een lijntje
  wat verder weg; namen langs de route vallen dan weg.
- De overzichtskaart van een deel noemt alleen begin en eind met zekerheid; de andere plaatsen alleen als ze passen.
- De lettertypen van de atlas (Geist, Instrument Serif) zitten niet in het losse bestand; daar gebruikt de browser zijn
  eigen schreefloze letter.
