# Controleverslag batch 04 (geschiedenissen 20–23)

Tweede lezer. Controlebasis: de Statenvertalingtekst in de invoer en, voor verwijzingen buiten de invoer, `public/bijbelreis/bijbel/<boek>.json`. Alle versies zijn zin voor zin nagelopen. Alle verwijzingen in `why` en `refs` zijn opgezocht.

Controlescript na herstel: `OK: 4 geschiedenis(sen), 12 versies.`

Resultaat: 15 herstellingen, alle 12 versies op `gecontroleerd`, geen versie op `concept`.

---

## 20 — Jozef en zijn broers weer samen

**Hersteld**
1. **a, `plaatsen`**: was `mamre, egypte, gosen`. Is nu `berseba, egypte, gosen`. Genesis 42–46 noemt Hebron of Mamre niet, alleen ‘het land Kanaän’. Berseba wordt wel genoemd (46:1), en ook in stap 9 van a. Dit lost twijfel 1 van de schrijver op.
2. **c, blok ‘Dromen die uitkomen’**: de zin ‘dat de schoven van zijn broers ‘bogen zich neder voor mijn schoof’’ was geen correct Nederlands, omdat het citaat midden in een bijzin stond. Is nu: Jozef had gedroomd: ‘uw schoven kwamen rondom, en bogen zich neder voor mijn schoof’ (Genesis 37:7).
3. **c, blok ‘Waar en wanneer’**: 1 Koningen 6:1 stond wel in `refs`, maar niet in de tekst. De bron van ‘uittocht rond 1446’ wordt nu in de tekst genoemd.

**Bewust zo gelaten**
- Twijfel 2 (Juda als borg, met een heenwijzing naar Christus, Hebreeën 7:22): blijft staan. Het staat er als uitleg van ‘veel uitleggers’, zoals §2 vraagt. In de reformatorische uitleg is dit een gangbare lijn. Ook Hebreeën 7:14 en 7:22 zijn juist geciteerd. De redactie kan dit blok nog weglaten als zij het niet wil, maar inhoudelijk is het niet fout.
- Handelingen 7:14 (vijf en zeventig zielen) tegenover Genesis 46:27 (zeventig) wordt niet behandeld. Dat vind ik terecht, want het hoort niet bij de kern.
- b, zin ‘zoals hij gedroomd had’: dit verband staat zelf in de tekst (42:9). Daarom laat ik het staan.

**Fouten in de invoer (niet hersteld)**
- Kaarttekst `genesis:jozef:9`: tussen ‘ ’ staan zinnen die niet uit de Statenvertaling komen (‘God heeft mij voor jullie uit gezonden, om jullie in leven te houden.’). Ook staat er ‘Leeft’ met een hoofdletter; de Statenvertaling heeft ‘leeft’.
- Kaarttekst `genesis:jakob:12`: het citaat ‘Vrees niet van af te trekken naar Egypte. Ik zal met u aftrekken.’ voegt twee stukken van 46:3–4 samen zonder …. Het begint met een hoofdletter V en laat ‘naar Egypte’ in 46:4 weg. Dat is geen letterlijk citaat.

## 21 — Mozes wordt gered uit het water

**Hersteld**
4. **a, stap 6**: ‘maakt ze een kistje van biezen’ is nu ‘neemt ze een kistje van biezen’. Exodus 2:3 zegt ‘nam zij voor hem een kistje’. Dat zij het kistje zelf maakte, staat er niet.
5. **b, laatste onderdeel**: het woord ‘getogen’ in het citaat werd niet uitgelegd. Er staat nu ‘…getogen’, dat is: getrokken’. Om onder de 1000 tekens te blijven, is ‘Als hij groot is’ ingekort tot ‘Later’.
6. **c, blok ‘Waar en wanneer’**: ‘bedoeld is de Nijl’ stond er als feit. Er staat nu dat dit de gangbare uitleg is (‘meestal wordt uitgelegd dat de Nijl bedoeld is’). De tekst zelf zegt alleen ‘de rivier’.
7. **c, vraag 3**: de oude vraag was ‘Welke ark werd net als het kistje met pek dichtgemaakt?’. Een van de foute antwoorden was ‘Het schip van Jona’. Dat is geen ark, en uit de tekst is niet aan te tonen dat het fout is. De nieuwe vraag is: ‘Waarmee werden zowel de ark van Noach als het kistje van Mozes dichtgemaakt?’ De antwoorden zijn ‘Met pek’ (goed), ‘Met goud’ en ‘Met was’, met `why` Genesis 6:14; Exodus 2:3.

**Bewust zo gelaten**
- Twijfel 3 (spelling van Raämses): buiten citaten blijft ‘Raämses’ staan, net als op de kaart en in de bestaande vertelling, zodat het kind dezelfde naam ziet. In Exodus 1:11 heeft de Statenvertaling ‘Raamses’, maar er komt geen citaat met die naam voor.
- Twijfel 4 (het Hebreeuwse woord voor ‘kistje’ komt alleen ook voor bij de ark van Noach): dit is een bekend en algemeen aanvaard taalfeit (tebah, Genesis 6–9 en Exodus 2:3–5). De verbinding staat er als iets waar ‘veel uitleggers’ op wijzen. Het blijft staan. Het taalfeit is niet te controleren met de invoer; ik heb het beoordeeld op algemene kennis.
- a: het bevel van 1:22 staat er in één zakelijke zin, en de vroedvrouwen staan in `samen`. Dat past bij §3.

**Fouten in de invoer (niet hersteld)**
- Kaartstap `exodus:mozes:1` heet ‘Een mandje in het riet’, maar de tekst spreekt van ‘een kistje van biezen’. De kaarttekst zegt ook ‘Ze maakt een kistje’, terwijl in 2:3 ‘nam’ staat. Verder staat er ‘De zus haalt snel de moeder’, maar ‘snel’ staat niet in 2:8.
- Cross ‘Exodus 6:19’ en het Ontdek-blok (‘Exodus 6:19 noemt haar Jochebed’) kloppen met de nummering van `bijbel/exodus.json`. In dat bestand staat ‘Toen zeide de HEERE tot Mozes: Nu zult gij zien…’ als 5:24, en daardoor schuift Exodus 6 één vers op. In de meeste uitgaven is dit Exodus 6:20. Graag de verzennummering van de bronbestanden nakijken; ik heb dit niet verder onderzocht.

## 22 — Mozes kiest de kant van zijn volk

**Hersteld**
8. **a, stap 5** (‘Mozes vlucht naar het land Midian…’): `stap` was `exodus:mozes:3` en is nu `exodus:mozes:2`. De vlucht en de waterput staan in 2:15, en die horen bij de routestap ‘Mozes vlucht’ (2:11–15).
9. **b, onderdeel ‘God hoort Zijn volk’**: ‘Een verbond is een vaste afspraak die God gemaakt heeft’ is nu ‘Een verbond is een plechtige belofte die God gedaan heeft.’ Het woord ‘afspraak’ doet denken aan twee gelijke partijen, en dat past niet bij 2:24 en ook niet bij de doelgroep.
10. **c, blok ‘Waar en wanneer’, en vraag 4**: ‘De Midianieten stammen af van Midian’ stond er als Bijbels feit. Genesis 25:1–2 noemt alleen Midian als zoon van Abraham en Ketura. Er staat nu dat de Midianieten worden gezien als zijn nakomelingen. Vraag 4 (‘Van wie stammen de Midianieten af?’) rustte op die afleiding. De nieuwe vraag is ‘Wie was Midian volgens Genesis 25?’, met als goed antwoord ‘Een zoon van Abraham en Ketura’.
11. **c, zelfde blok**: ‘dat God hem veertig jaar later verscheen (Handelingen 7:30)’ is nu ‘dat de Engel des Heeren hem … verscheen’. Zo staat het in Handelingen 7:30.
12. **c, zelfde blok**: 1 Koningen 6:1 stond wel in `refs`, maar niet in de tekst. Het wordt nu bij ‘uittocht rond 1446’ genoemd.

**Bewust zo gelaten**
- Twijfel 5 (de doodslag in a): blijft staan zoals het is. Het gebeurt sober in één stap (2:12), zonder details. Als het wordt weggelaten, is de vlucht niet meer te begrijpen, en volgens §3 mag weglaten alleen als de hoofdlijn niet verandert. De `samen`-tip is passend: hij noemt geen eigen oordeel, zegt dat uitleggers verschillen en citeert Handelingen 7:25 letterlijk.
- ‘Rehuël’ in b en c is juist volgens de Statenvertaling (2:18; Numeri 10:29).
- a, `plaatsen` `ramses`: de tekst noemt niet waar Mozes was. Raämses is het beginpunt van de route op de kaart, en dat is aanvaardbaar.

**Fouten in de invoer (niet hersteld)**
- De bestaande vertelling en het Ontdek-blok (‘wiezei’) schrijven ‘Reüel’. De Statenvertaling heeft ‘Rehuël’.
- De kaarttekst `exodus:mozes:2` zegt ‘Mozes groeit op in het paleis’ en ‘vlucht ver weg’. Geen van beide staat in de tekst.

## 23 — God roept Mozes bij de brandende braamstruik

**Hersteld**
13. **a, stap 6**: ‘Ik zal voorzeker met u zijn.’ werd uitgelegd als ‘Ik ben zeker bij je.’ Daardoor viel de toekomende tijd van de belofte weg. Er staat nu ‘Dat betekent: Ik zal zeker bij je zijn.’
14. **c, blok ‘De Naam van God’**: ‘anderen zien Hem als een engel’ is nu ‘anderen denken aan een engel die namens God spreekt’. Met de hoofdletter H koos de zin bij de tweede opvatting toch voor de eerste. Zo blijft de weergave neutraal (twijfel 6). De formulering ‘Veel uitleggers zien in deze Engel de Zoon van God’ is voor de doelgroep goed. Het is de gangbare reformatorische uitleg, en ze staat er niet als enige mogelijkheid.
15. **c, vraag 3**: ‘Welke andere naam gebruikt Stefanus voor de berg…?’ gaat ervan uit dat Horeb en Sinaï dezelfde berg zijn. Het blok zelf noemt dat ‘meestal uitgelegd’. De vraag is nu ‘Welke berg noemt Stefanus als hij over het braambos vertelt?’ (Handelingen 7:30).

**Bewust zo gelaten**
- b laat 4:24–26 (de besnijdenis door Zippora) weg, en ook het teken met het water (4:9). Ik vind dat aanvaardbaar. Voor de roeping is dit geen kern, en c behandelt 4:24–26 uitgebreid en zorgvuldig, terwijl a het in `samen` noemt.
- b, het woord ‘melaats’ wordt niet uitgelegd. Het staat in een letterlijk citaat, ‘melaats, wit als sneeuw’, en het beeld spreekt voor zich. b zit precies op 1000 tekens (twijfel 7), dus een uitleg kan er alleen bij als er iets anders uit gaat.
- a, stap 8 (‘Mozes zegt dat hij niet goed kan spreken. Dan geeft God hem zijn broer Aäron.’): dit is samengevat. Gods antwoord in 4:11–12 en de vraag om iemand anders te sturen (4:13) zijn weggelaten. Dat laatste staat in `samen`. Er is weggelaten, maar niets veranderd.

**Fouten in de invoer (niet hersteld)**
- De bestaande vertelling zegt ‘Hij geeft Mozes drie tekenen: … water uit de rivier wordt bloed’. Het Ontdek-blok ‘Vier wonderen’ zegt hetzelfde. Volgens 4:9 wordt het derde teken bij Horeb alleen aangekondigd en niet gedaan.
- In de kaartteksten `exodus:mozes:4` en `exodus:mozes:5` staan tussen ‘ ’ hertaalde zinnen die geen tekst uit de Statenvertaling zijn. Voorbeelden: ‘Kom niet dichterbij. Trek je schoenen uit…’, ‘Ik zal met je zijn.’ en ‘IK ZAL ZIJN heeft mij gestuurd.’

---

## Twijfelpunten van de schrijver: afhandeling

| Nr | Onderwerp | Besluit |
|---|---|---|
| 1 | `mamre` in 20a.plaatsen | Opgelost: vervangen door `berseba` |
| 2 | Juda als borg (20c) | Blijft staan: het is als uitleg benoemd |
| 3 | Raämses/Raamses | Blijft ‘Raämses’ buiten citaten, gelijk aan de kaart |
| 4 | Hebreeuws woord voor kistje (21c) | Blijft staan: algemeen aanvaard, niet te controleren in de invoer |
| 5 | De doodslag in 22a | Blijft staan, sober, met een passende `samen`-tip |
| 6 | De Engel des HEEREN (23c) | De formulering is neutraal gemaakt (de hoofdletter bij de tweede opvatting is weg) |
| 7 | 23b op 1000 tekens | Blijft staan; er is niets toegevoegd |
