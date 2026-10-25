# Verslag groep nt-3: geschiedenissen 118–133 (Mattheüs 21 t/m Handelingen 1)

Bestanden:

- `public/bijbelreis/inhoud/nt-jezus-3.js`: nieuw boek `jezus-3` ‘Lijden, sterven en opstanding’ (`nt: true`), 12 personen in Wie is wie, 3 delen, 27 stappen.
- `public/bijbelreis/geschiedenissen/nt-3.js`: 16 records (118–133) en 6 kernwoorden (zachtmoedigheid, avondmaal, waarheid, kruis, opstanding, hemel). Het bestand staat in een IIFE, zodat de hulpconstanten niet botsen met andere scripts.
- `public/bijbelreis/plaatsen/nt-3.js`: 2 nieuwe plaatsen.
- `scripts/bijbel-controle/nt-3.txt`: 585 regels, `python3 scripts/bijbel-check.py` geeft 0 mis.

Controles: `node --check` op de drie JS-bestanden is in orde. `dump.cjs` loopt zonder fouten. Een eigen controle laat zien dat alle stapsleutels, plaats-ids (`at`, routes, `ctx`, tikvragen, ontdek-kaart), Bijbelverwijzingen (stappen, delen, kruisverwijzingen, `why`, ontdek-verwijzingen, kernwoorden) en persoonskleuren bestaan. Er zijn geen dubbele vragen over alle geschiedenissen. In `tests/bijbelreis.test.ts` slagen alle tests behalve de oude chronologietest `tl[0] < 0`. Die test faalt op alle NT-delen, dus ook op `nt-begin` van nt-1. Die test moet de hoofdagent aanpassen.

## Nieuwe delen en stappen (`jezus-3`)

| Deel | Stappen |
| --- | --- |
| `nt-lijdensweek` ‘De laatste week in Jeruzalem’ (kobalt) | 0 intocht (Mt 21:1–11) · 1 tempelreiniging (Mt 21:12–17) · 2 vragen in de tempel (Mt 21:23–22:46) · 3 Olijfberg, waakt (Mt 24:1–3; 25) · 4 zalving in Bethanië en Judas’ afspraak (Mt 26:1–16) · 5 voetwassing (Lk 22:7–13; Joh 13:1–17) · 6 avondmaal (Mt 26:20–30; Lk 22:14–20) · 7 Gethsémané (Mt 26:30–46) · 8 verraden met een kus (Mt 26:47–56; Joh 18:2–12) |
| `nt-lijden` ‘Verhoord, gekruisigd, begraven’ (lila) | 0 Annas en Kajafas · 1 Petrus verloochent · 2 Judas en de dertig zilverlingen (Mt 27:1–10) · 3 Pilatus: wat is waarheid? · 4 naar Herodes (Lk 23:6–12) · 5 Kruis Hem! (Gabbatha) · 6 gekruisigd op Golgotha · 7 Het is volbracht · 8 in het graf |
| `nt-opstanding` ‘Hij is opgestaan!’ (boter) | 0 de steen weggerold (Mt 28:1–15) · 1 Maria! (Joh 20:1–18) · 2 Emmaüs · 3 Vrede zij ulieden · 4 Thomas · 5 ontbijt bij het meer (Joh 21:1–14) · 6 Hebt gij Mij lief? · 7 Gaat dan henen (Mt 28:16–20) · 8 hemelvaart (Hand 1:1–12; Lk 24:50–53) |

Elk deel heeft een speurtocht (2–3 tikvragen, 8 meerkeuzevragen en 1 volgordevraag), `trips`, `tijd`, `tl: [30, 33]` en een `tijdNoot`. Dagen van de week staan er alleen in waar de tekst ze geeft: Joh 12:1 en 12:12, Mt 26:2 en 26:17, ‘voorbereiding/voorsabbat’ (Mk 15:42), ‘eerste dag der week’, ‘na acht dagen’ en ‘veertig dagen’.

## Nieuwe plaatsen (`plaatsen/nt-3.js`)

- `nt3_gabbatha`: Gabbatha, het rechthuis van Pilatus. Zekerheid `c: "b"`. Het punt ligt bij het paleis van Herodes (OpenBible, meeste stemmen). Als kandidaat staat in `alt` de burcht Antonia (klooster van de Zusters van Sion).
- `nt3_berggalilea`: ‘de berg in Galilea’ (Mt 28:16). Zekerheid `c: "o"`. Het punt ligt op het OpenBible-punt voor de streek Galilea en is alleen een voorbeeld.

Verder hergebruikt: `salem` (Jeruzalem), `nt_tempel`, `nt_olijfberg`, `nt_bethfage`, `nt_bethanie`, `nt_gethsemane`, `nt_golgotha`, `nt_emmaus`, `nt_meer` en `jericho`, met de tussenpunten `kidron` en `nt_jordaanvallei`. Het huis van Kajafas en de opperzaal staan niet als eigen punt op de kaart, omdat de Bijbel de plek niet noemt. Daar wordt `salem` gebruikt.

## Per geschiedenis

Alle 16 zijn uitgewerkt én gecontroleerd tegen de Statenvertaling.

| Nr | Titel (eigen) | Ref | Stappen | Vorm | Kw | Ontdek |
| --- | --- | --- | --- | --- | --- | --- |
| 118 | De intocht in Jeruzalem | Mt 21:1–11 | lijdensweek:0 | route | zachtmoedigheid | verbanden |
| 119 | De handelaars uit de tempel gejaagd | Mt 21:12–17 | lijdensweek:1 | plek | – | wiezei |
| 120 | Gelijkenissen over het Koninkrijk der hemelen | Mt 22:1–25:46 | lijdensweek:2, 3 | gelijkenis | – | gelijkenis (alleen uitleg uit de tekst zelf) |
| 121 | De Meester wast de voeten | Lk 22:24–27; Joh 13:1–17 | lijdensweek:5 | plek | – | koppel |
| 122 | Het Heilig Avondmaal | Lk 22:7–23 | lijdensweek:6 | plek | avondmaal | symbolen |
| 123 | Het verraad in Gethsémané | Mk 14:10–11, 26–50 | lijdensweek:4, 7, 8 | route | – | volgorde |
| 124 | Petrus verloochent de Heere Jezus | Mt 26:31–35, 57–75 | lijden:0, 1 | plek | – | onthul |
| 125 | Voor Pilatus: Kruis Hem! | Lk 22:66–23:25 | lijden:3, 4, 5 | plek | waarheid | wiezei |
| 126 | Gekruisigd op Golgotha | Joh 19:16–30 | lijden:6, 7 | plek | kruis | verbanden |
| 127 | De begrafenis van de Heere Jezus | Joh 19:31–42 | lijden:8 | plek | – | koppel |
| 128 | Het lege graf en de engel | Mt 28:1–8 | opstanding:0 | plek | – | kaart (Jeruzalem) |
| 129 | De Heere is opgestaan | Mt 28:9–15; Joh 20:1–18 | opstanding:0, 1 | plek | opstanding | onthul (getuigen, 1 Kor 15:5–8) |
| 130 | De Emmaüsgangers | Lk 24:13–35 | opstanding:2 | route | – | volgorde |
| 131 | Thomas ziet en gelooft | Joh 20:19–31 | opstanding:3, 4 | plek | – | wiezei |
| 132 | De Heere Jezus en Petrus bij het meer | Joh 21:1–19 | opstanding:5, 6 | plek | – | koppel |
| 133 | De hemelvaart | Hand 1:1–14 | opstanding:8 | plek | hemel | kaart (Olijfberg) |

## Twijfelpunten voor Martijn

1. **Volgorde van de paasgebeurtenissen.** De vier evangeliën noemen verschillende vrouwen en vertellen elk een deel. Ik heb per stap één evangelie gevolgd (Mt 28 en Joh 20) en niet geharmoniseerd. Bij 129 staan Mt 28:9–15 en Joh 20:1–18 samen in één uitleg. De volgorde tussen Joh 21 (bij het meer) en Mt 28:16–20 (de berg in Galilea) noemt de Bijbel niet. Ik heb het meer eerst gezet en dat in de fact vermeld.
2. **Tempelreiniging.** Mattheüs vertelt haar direct na de intocht, Markus 11:11–15 op de volgende dag. Beide staan in de fact en de tijdNoot. In de volgordevraag staat alleen ‘intocht → tempel’, en die volgorde klopt in beide evangeliën.
3. **‘De discipel die Jezus liefhad’** heb ik niet bij naam genoemd. In `who` heet hij ‘Discipel’. Moet hij overal ‘Johannes’ heten, zoals de traditie zegt (vgl. Joh 21:20, 24)?
4. **Namen in `who`.** Ik gebruik ‘Jezus’, ‘Petrus’, ‘Judas Iskariot’, ‘Herodes Antipas’ (in de tekst: ‘Herodes, de viervorst’) en ‘Nicodemus’. Groep nt-1 gebruikt ‘Simon Petrus’ en ‘Nikodemus’. Dat moet eenvormig worden: de HSV schrijft ‘Nicodemus’. Graag een beslissing voor `BR.mensen`. Kleuren die nt-1 of nt-2 al zette, heb ik niet overschreven.
5. **Hemelvaart (133).** De stap zit in mijn boek `jezus-3`, maar de geschiedenis valt onder sectie `gemeente` (133–142). `nt-handelingen.js` heeft geen eigen hemelvaartstap, dus er is geen dubbeling. De route ‘meer van Galilea → Jeruzalem’ in die stap is een reconstructie (`recon: 1`): de Bijbel zegt alleen dat de discipelen weer in Jeruzalem waren (Hand 1:4).
6. **Datering.** `tl: [30, 33]` staat voor ‘ca. 30 of 33 n.Chr.’. Op de tijdlijn ziet dat eruit als een periode van drie jaar. Liever één jaar met de noot (bijv. `[30, 30]`)?
7. **Golgotha en het graf.** Het lege graf staat op `nt_golgotha`, omdat Joh 19:41 zegt dat het graf ‘in de plaats, waar Hij gekruist was’ lag. In de plaatsenlijst heeft `nt_golgotha` zekerheid `c: "w"` met het Tuingraf als `alt`, zonder `c: "b"`. De opdracht noemde Golgotha ‘betwist’. Moet `c` daarom op `"b"`?
8. **Judas’ dood** (Mt 27:5, ‘verworgde zichzelven’) staat er kort en zonder details in, net als in de tekst. Handelingen 1:18–19 wordt alleen genoemd in de fact, met de naam Akeldama.
9. **Tests.** `tests/bijbelreis.test.ts` (chronologie) eist `tl[0] < 0` en moet voor NT-delen worden aangepast.
