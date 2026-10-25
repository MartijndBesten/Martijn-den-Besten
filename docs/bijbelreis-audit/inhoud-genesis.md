# Inhoudscontrole Bijbelreis 2.0 — groep `genesis`

Bestanden: `public/bijbelreis/inhoud/genesis.js`, `scripts/bijbel-controle/genesis.txt` (nieuw).
Maatstaf: Statenvertaling in `public/bijbelreis/bijbel/` (SV-versnummering; Genesis 32: worsteling = 32:22–32).
Stapvolgorde, stap-, deel- en plaats-ids zijn ongewijzigd (gecontroleerd met een vergelijking oud/nieuw: alleen `recon` en teksten/verwijzingen verschillen).

## Aantallen

| | |
| --- | --- |
| Delen / stappen gecontroleerd | 5 / 67 (plus intro's, `stat`, `cross`, quiz, stamboom, leeftijden, `ordAlles`) |
| Stappen met een wijziging in `txt`/`ref`/`who` | 65 van 67 (vaak aanvulling of SV-citaat; de inhoudelijke fouten staan in de tabellen) |
| Weetjes (`fact`) aangepast | 57 (vaak alleen versverwijzing of voorzichtiger formulering); alle 67 stappen hebben nu `fs` (b 43, u 13, h 11) |
| Routes van `recon` voorzien | 17 (in 15 stappen) |
| Kruisverwijzingen nieuw, gecorrigeerd of gesplitst | 28 regels |
| Quizvragen aangepast | 24 (plus 2 nieuwe `ordAlles`-vragen) |
| Controleregels toegevoegd | 506 (nieuw bestand; ook NT- en OT-kruisverwijzingen) |
| Resultaat `python3 scripts/bijbel-check.py scripts/bijbel-controle/genesis.txt` | **506 gecontroleerd, 0 mis** |
| `node --check` / `node scripts/bijbelreis-check.mjs` | geslaagd / ‘Geen problemen gevonden’ |

## Chronologie (Schema 2.0)

| Deel | `tijd` | `tl` | Grondslag (`tijdNoot`) |
| --- | --- | --- | --- |
| boek | `Oergeschiedenis · aartsvaders ca. 2166–1805 v.Chr.` (was `ca. 2100–1800 v.Chr.`) | — | suggereert niet meer dat Genesis 1–11 in de aartsvadertijd valt |
| begin | `null` | `null` | geen jaartal: Genesis 5 en 11 geven leeftijden, geen jaartallen; uitleggers verschillen (volledigheid registers, LXX-getallen) |
| abraham | ca. 2166–1991 v.Chr. | [-2166, -1991] | uittocht ca. 1446 (1 Kon 6:1) + 430 jaar (Ex 12:40) → Jakob in Egypte ca. 1876; Jakob 130 (47:9), Izak 60 bij Jakob (25:26), Abraham 100 bij Izak (21:5), 175 (25:7); alternatieven (Gal 3:17-lezing, uittocht 13e eeuw) genoemd |
| izak | ca. 2066–1886 v.Chr. | [-2066, -1886] | idem; Izak 180 (35:28) |
| jakob | ca. 2006–1859 v.Chr. | [-2006, -1859] | 130 bij aankomst ca. 1876, nog 17 jaar, 147 (47:28) |
| jozef | ca. 1915–1805 v.Chr. | [-1915, -1805] | 30 bij de farao (41:46), 7 + 2 jaar (45:6) → ca. 39 in 1876; 110 (50:26) |

## Correcties per deel

### Boek en deel ‘Het begin’

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| deel `stat` | Noach buiten Genesis in 11 verzen | 12 verzen (Lukas 3:36 spelt ‘Noe’) | telling in SV-corpus + Lukas 3:36 |
| `cross` Johannes 1:1–3 | ‘In het begin was het Woord’ | SV-citaat ‘In den beginne was het Woord’ | Joh 1:1 |
| `cross` Mattheüs 24 | ‘vergelijkt de toekomst’ | ‘vergelijkt Zijn komst’ | Mt 24:37 |
| `cross` Handelingen 2 | ‘iedereen verstaat elkaar weer’ | iedereen hoort de apostelen in zijn eigen taal | Hand 2:6, 2:11 |
| stap 0 Schepping | — | ‘naar Zijn beeld’ toegevoegd; ‘schept’ | Gen 1:1, 1:27 |
| stap 1 Eden `txt` | ‘Er stromen rivieren door, onder andere de Tigris en de Eufraat’; ‘Adam en Eva luisteren naar de slang’ | één rivier uit Eden, vier hoofden; schepping uit stof en rib; slang bedriegt Eva, zij geeft Adam; straf; belofte 3:15; uit de hof | Gen 2:7–14, 2:22, 3:6, 3:13–15, 3:23–24 |
| stap 1 `fact` | Tigris/Eufraat als feit | Hiddekel en Frath ‘meestal uitgelegd als’ Tigris en Eufraat (`fs: h`) | Gen 2:14 |
| stap 2 Kaïn en Abel `txt` | ‘Kaïn is jaloers en doodt hem’ (afgezwakt, oorzaak niet uit de tekst) | offers, God ziet Abels offer aan, Kaïn ontstoken, ‘de zonde ligt aan de deur’, doodslag in het veld, vloek, teken | Gen 4:2–15 |
| stap 2 `fact` | ‘oudste mens in de Bijbel’ | ‘van niemand noemt de Bijbel een hogere leeftijd’ | Gen 5:27 |
| stap 3 Ark `txt` | ‘Bouw een grote boot’ als citaat; oordeel ontbrak | SV ‘Maak u een ark van goferhout’; genade; HEERE sluit de deur; water boven de bergen; alles op het droge sterft, alleen wie in de ark is blijft over; ark ‘rust’ op Ararat | Gen 6:8, 6:14, 7:16–23, 8:4 |
| stap 3 `vergelijk.noot` | ‘een el is ongeveer een halve meter’ | el 45–52 cm → 135–155 m | — (`h`) |
| stap 4 Regenboog `ref` | Genesis 9 | Genesis 8:15–9:17 (altaar staat in 8:20) | Gen 8:20 |
| stap 4 `txt` | ‘dankt God’; parafrase als citaat | brandoffers; SV-citaat ‘om de aarde te verderven’; ‘Zijn boog’ | Gen 8:20, 9:11–13 |
| stap 4 `fact` | ‘Elke regenboog herinnert aan die belofte’ | SV-citaat 9:16 | Gen 9:16 |
| stap 5 Babel `txt` | ‘zodat ze beroemd worden’; mensen ‘verspreiden zich’ | naam maken én niet verstrooid worden; de HEERE verstrooit hen | Gen 11:4, 11:8–9 |
| stap 5 `fact` | ‘Precies zoals Genesis 11:3’ (archeologie als bewijs) | ziggurats ‘passen bij’ 11:3; gevonden toren van Babylon is van veel later | `h` |
| stap 6 Sem→Abram `txt` | ‘Tien generaties later wordt Abram geboren, in de stad Ur’ | na Sem nog negen geslachten, laatste is Abram; drie zonen van Terach; Haran sterft in Ur; Sarai onvruchtbaar (geboorteplaats Abram niet genoemd) | Gen 11:10–30 |
| quiz tap Ur | ‘waar Abram geboren werd’ | ‘waar Abram vandaan kwam’ | Gen 11:28–31 |
| quiz mc | ‘1 jaar’ als fout antwoord bij regen (verwarrend: vloed duurde ca. een jaar) | ‘100 dagen’; ‘Wie werd het oudst’ → ‘Van wie noemt de Bijbel de hoogste leeftijd?’; regenboog: ‘verbond’; Babel-antwoord ‘God verwarde hun taal’ | Gen 7:12, 5:27, 9:13, 11:7 |

### Deel ‘Abraham’

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| `stat` | 112 verzen buiten Genesis, 70 in het NT (niet controleerbaar: 2 Korinthe e.a. ontbreken in het corpus) | 75 bij vertrek, 100 bij Izaks geboorte: 25 jaar wachten | Gen 12:4, 21:5 |
| `cross` Hebreeën 11, Romeinen 4, Jakobus 2, Johannes 8:56, Hand 7, Hebreeën 7 | parafrases tussen aanhalingstekens; ‘brood en wijn’ aan Hebreeën 7 toegeschreven | SV-citaten; Hebr 7: ‘den Zoon van God gelijk’, tienden uit de buit | Hebr 11:8, Rom 4:3, Jak 2:23, Joh 8:56, Hand 7:2, Hebr 7:3–4 |
| stap 0 `ref`, `txt` | 11:31–32; ‘Ur, een grote stad bij de Eufraat’ in `txt` | 11:27–32; Ur der Chaldeeën; Lot als zoon van overleden broer Haran; Terach sterft 205 | Gen 11:27–32 |
| stap 0 `fact` | ziggurat ‘kun je nog zien’ (identificatie als feit) | ‘volgens de meeste onderzoekers’ Tell el-Muqayyar; ziggurat voor de maangod; Jozua 24:2 | `h`, Joz 24:2 |
| stap 1 `txt` | — | belofte ‘in u zullen alle geslachten…’ toegevoegd; ‘de zielen’ i.p.v. ‘knechten’ | Gen 12:3, 12:5 |
| stap 1 `fact` | ‘zonder te weten waar hij komen zou’ | SV ‘niet wetende, waar hij komen zou’ | Hebr 11:8 |
| stap 2 `txt`, `who` | ‘grote boom’; ‘om God te danken’; Abram 75 | eikenbos More; de HEERE verschijnt; altaar voor de HEERE; leeftijd weg (niet eenduidig) | Gen 12:6–7 |
| stap 3 `fact` | Bethel = ‘huis van God’ los | met grond: Jakob noemt het zo | Gen 28:17–19 |
| stap 4 `txt` | ‘God beschermt Sarai’ | de HEERE plaagt de farao met grote plagen; Abrams angst gedood te worden | Gen 12:11–20 |
| stap 4 `fact` | ‘de Nijl overstroomt elk jaar’ | ‘overstroomde vroeger’ (stuwdam Aswan) | `h` |
| stap 5 `txt`, `fact` | ‘Geld bestond nog niet’ (maar 13:2 noemt zilver en goud) | aanroepen van de Naam toegevoegd; fact: munten bestonden nog niet, men woog zilver af (23:16) | Gen 13:2–4, 23:16 |
| stap 6 `txt` | zonde van Sodom ontbrak | ‘de mannen van Sodom waren boos en grote zondaars’; SV ‘geen twist’; land droeg hen niet | Gen 13:6–13 |
| stap 8 `txt` | — | ‘derde altaar’ verantwoord (Sichem, Bethel, Mamre) | Gen 12:7–8, 13:18 |
| stap 9 `txt` | ‘vier koningen uit het oosten … tegen de koningen van Sodom en Gomorra’ | Kedor-Laomer van Elam; vier tegen vijf; dal Siddim; alle bezit en Lot | Gen 14:1–12 |
| stap 9 `fact` | ‘De Dode Zee heet in de Bijbel de Zoutzee’ | ‘dal Siddim, dat is de Zoutzee’ | Gen 14:3 |
| stap 10 `txt` | ‘318 van zijn mannen’; ‘tot voorbij Damascus’ | in zijn huis geboren en geoefend; tot Hoba bij Damascus; brengt Lot, vrouwen en volk terug | Gen 14:14–16 |
| stap 11 `txt` | ‘Daarna gaat Abram terug naar Mamre’ (staat er niet) | tienden; weigering van de buit van Sodom | Gen 14:18–23 |
| stap 11 `fact` | ‘van alles wat hij terugkreeg’ | Hebr 7:4 ‘uit den buit’ | Hebr 7:4 |
| stap 12 `who`, `txt` | Abram ‘ca. 85’, Sarai ‘ca. 75’ (niet af te leiden); ‘op een nacht’ | leeftijden weg; ‘Vrees niet … Schild’; ‘rekende het hem tot gerechtigheid’ | Gen 15:1–6 |
| stap 12 `fact` | 2000 sterren (achtergrond) | Bijbelse belofte 400 jaar vreemdelingschap (`b`) | Gen 15:13–14 |
| stap 13 `txt` | ‘Dan komt er ruzie’ | Hagar veracht Sarai, Sarai vernedert haar; Engel: ‘Keer weder’; Abram noemt hem Ismaël | Gen 16:4–15 |
| stap 13 `fact` | ‘de God Die mij ziet’ (HSV-achtig) | SV ‘God des aanziens’ + 16:11 | Gen 16:11, 16:13 |
| stap 14 `txt` | besnijdenis ontbrak | ‘Ik ben God, de Almachtige’; besnijdenis als verbondsteken; naam Izak | Gen 17:1, 17:10–27, 17:19 |
| stap 15 `txt` | ‘brood’; ‘een van hen is de HEERE’ | koeken en kalf; de HEERE verschijnt; 18:14; voorbede tot tien rechtvaardigen | Gen 18:1–14, 18:32 |
| stap 15 `fact` | gastvrijheid ‘in de woestijn’ (Mamre is geen woestijn) | Hebr 13:2 (`b`) | Hebr 13:2 |
| stap 16 Sodom `txt` | zonde van Sodom alleen ‘zo groot’ | mannen van Sodom omsingelen het huis en willen de gasten kwaad doen; blindheid; dochters van Lot / Moab en Ammon (zie open punt 1) | Gen 19:4–11, 19:30–38 |
| stap 16 `fact` | zoutrots ‘vrouw van Lot’ (volksoverlevering) | Lukas 17:32 | Lukas 17:32 |
| stap 17 `who`, `txt`, `r` | Abraham 99, Sara 89 (niet eenduidig); genezing ontbrak | leeftijden weg; Abraham bidt, God geneest; `recon: 1` | Gen 20:1–17 |
| stap 18 `txt` | ‘God heeft mij doen lachen’ | SV ‘een lachen gemaakt’; besnijdenis op dag 8 | Gen 21:4–6 |
| stap 19 `txt`, `who` | geen reden waarom Sara hen wegstuurt; Ismaël ‘ca. 16’ | spotten bij het speenfeest; Gods woord 21:12–13; ‘ouder dan 14’ (86→100 jaar Abraham, 16:16/21:5) | Gen 21:8–21 |
| stap 20 `txt` | ‘plant er een boom en blijft er lang wonen’ | SV ‘plantte een bos … riep den Naam des HEEREN aan’; naam Berseba verklaard | Gen 21:31–33 |
| stap 21 Moria `txt` | ‘God vraagt iets heel moeilijks’; binden en mes weggelaten | God verzoekt Abraham; SV-citaten 22:2 en 22:8; Abraham bindt Izak, legt hem op het altaar, neemt het mes; Engel; ram in plaats van de zoon | Gen 22:1–19 |
| stap 21 `fact` | Moria = tempelberg als feit | alleen 2 Kron 3:1 noemt een berg Moria; ‘veel uitleggers denken’ | 2 Kron 3:1 |
| stap 22 `txt` | — | rouwen en bewenen; akker tegenover Mamre | Gen 23:2, 23:19 |
| stap 23 `txt` | ‘naar zijn familie, bij Haran’ | stad van Nahor in Mesopotamië; Rebekka kleindochter van Nahor; ‘hij had haar lief’ | Gen 24:10, 24:15, 24:67 |
| stap 24 `txt`, `fact` | ‘naast Sara’; spelonk ‘bestaat nog’ | Sara daar begraven; God zegent Izak; fact: Herodiaans gebouw over de traditioneel aangewezen plek | Gen 25:8–11 |
| quiz | tap Moria/Jeruzalem; antwoorden ‘dieren’, ‘vader van een menigte volken’ | ‘waar Salomo de tempel bouwde op de berg Moria’; ‘vee’; ‘menigte van volken’ | 2 Kron 3:1, Gen 13:6, 17:5 |

### Deel ‘Izak’

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| `intro` | ‘enige aartsvader die nooit uit het beloofde land is weggegaan’ (argument uit stilte) | God zei dat hij niet naar Egypte moest gaan | Gen 26:2–3 |
| `stat` | 32 keer samen ‘in de hele Bijbel’ | ‘in de Statenvertaling … 32 verzen’ (geteld in het corpus) + Ex 3:6 | Ex 3:6 |
| `cross` Galaten 4:28, Mt 8:11, Hebr 11:17–20 | parafrases | SV-formuleringen | Gal 4:28, Mt 8:11, Hebr 11:19 |
| stap 0 `txt` | ‘Ze krijgen lang geen kinderen’ | onvruchtbaar, Izak bidt, HEERE verhoort; ‘de meerdere zal den mindere dienen’ | Gen 25:21–26 |
| stap 1 `txt` | ‘Je krijgt soep als …’ | Izak heeft Ezau lief, Rebekka Jakob; ‘Verkoop mij … eerstgeboorte’; eed; ‘brood en soep’; Ezau veracht het eerstgeboorterecht | Gen 25:28–34 |
| stap 2 `txt`, `fact`, `r` | ‘enige aartsvader die nooit naar Egypte ging’ | SV ‘Trek niet af naar Egypte’; bevel van Abimelech; fact: de Bijbel vertelt het niet van Izak; `recon: 1` | Gen 26:2–11 |
| stap 3 `txt`, `fact` | Esek ‘ruzie’ | de HEERE zegent; Esek ‘twist’; citaat 26:22 | Gen 26:12–22 |
| stap 4 `txt`, `fact` | ‘Wees niet bevreesd’ | SV ‘Vrees niet’; fact met Pichol en 21:22–32 | Gen 26:24, 26:26 |
| stap 5 `txt`, `who` | ‘bijna blind’; ‘Rebekka en Jakob bedenken een list’; ‘geitenvellen om zijn armen’ | kan niet meer zien; Rebekka bedenkt, Jakob doet mee; kleren van Ezau; vellen over handen en hals; leugen ‘Ik ben Ezau’; Ezau haat Jakob | Gen 27:1, 27:15–19, 27:34, 27:41 |
| stap 5 `fact` | ‘een zegen kon je niet terugdraaien’ | SV 27:33 ‘ook zal hij gezegend wezen’ | Gen 27:33 |
| stap 6 `ref`, `txt`, `fact` | 28:1–9 (doodsplan staat in 27:41); ‘Rebekka heeft Jakob nooit meer gezien’ | 27:41–28:9; ‘geen vrouw van de dochters van Kanaän’; fact: de Bijbel vertelt niet dat ze hem terugzag | Gen 27:41–28:2 |
| stap 7 `txt`, `r` | — | ‘oud en zat van dagen’; `recon: 1` | Gen 35:29 |
| quiz | ‘bord rode linzensoep’; Rehoboth-vraag; geitenvellen ‘om zijn armen’ | ‘brood en rode linzensoep’; citaat 26:22; ‘over zijn handen en hals’ | Gen 25:34, 26:22, 27:16 |

### Deel ‘Jakob’

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| `stat` | ‘ruim 2300 verzen’ | idem + 49:28 (zie open punt 7) | Gen 49:28 |
| `cross` Johannes 4:5–6 | ‘bij Sichem’ | ‘bij Sichar’, naast het stuk land van Jozef | Joh 4:5–6 |
| `cross` Hosea 12:4–5 | SV-nummering klopt niet; ‘met God worstelde’ | Hosea 12:3–4; ‘vorstelijk gedragen tegen den Engel … weende en smeekte’ | Hos 12:3–4 (SV) |
| `cross` ‘Jeremia 31:15 en Mattheüs 2:18 … bij Bethlehem, waar zij begraven is’ | één niet-klikbare verwijzing; Jeremia noemt Rama | twee verwijzingen; Rama genoemd | Jer 31:15, Mt 2:18 |
| stap 0 `txt`, `fact`, `r` | ‘in zijn eentje naar het noorden’; ‘op dezelfde plek bouwde Abraham een altaar’ | van Berseba naar Haran, zonsondergang, SV 28:15; fact: ‘in de buurt’, tussen Bethel en Ai; `recon: 1` | Gen 28:10–19, 12:8 |
| stap 1 `txt`, `fact` | ‘in zijn eentje’; ‘huilt van blijdschap: familie!’ (motief niet in tekst) | rolt de steen; kust Rachel en weent; vertelt wie hij is; fact met 24:11–15 | Gen 29:10–13 |
| stap 2 `txt` | ‘Het leek hem een paar dagen’; ‘werkt nog zeven jaar voor Rachel’ (alsof hij daarna pas trouwde) | SV-citaat 29:20; na een week ook Rachel, daarvoor nog zeven jaar | Gen 29:20, 29:27–30 |
| stap 3 `txt` | — | rol van Bilha en Zilpa; ‘God geeft Rachel een zoon’ | Gen 30:3–24 |
| stap 4 `txt`, `fact` | ‘Ga terug naar je land’ | SV 31:3; terafim gestolen; zeven dagen; droom van Laban; fact: Jegar-Sahadutha / Galed | Gen 31:3, 31:19–24, 31:47–48 |
| stap 5 `ref`, `txt`, `fact` | ‘Genesis 32’; ‘200 schapen, 30 kamelen, 30 ezels’ (onvolledig) | 32:1–21; gebed 32:11; volledige lijst | Gen 32:1–15 |
| stap 6 `ref`, `txt`, `fact` | ‘Genesis 32’; ‘Israël betekent hij strijdt met God’ als feit | 32:22–32; SV-citaten 32:26, 32:30; fact: ‘wordt vaak uitgelegd als’ | Gen 32:22–31 |
| stap 7 `txt`, `fact`, `r` | — | altaar ‘De God Israëls is God’; ‘honderd stukken geld’; `recon: 1` op de route van Ezau | Gen 33:19–20 |
| stap 8 `ref`, `txt`, `r` | 35:1–15; Genesis 34 ontbrak geheel | ‘Genesis 34; 35:1–15’; Dina en de wraak van Simeon en Levi in twee zinnen (zie open punt 2); `recon: 1` | Gen 34:1–30, 35:1–10 |
| stap 9 `txt`, `r` | ‘bij Efrath begraven’ | ‘aan de weg naar Efrath’; gedenkteken; `recon: 1` | Gen 35:16–20 |
| stap 10 `txt`, `fact`, `r` | ‘Zijn moeder Rebekka zag hij niet meer terug’ | Ezau en Jakob begraven Izak; ‘de Bijbel vertelt niet dat …’; `recon: 1` (Migdal-Eder onbekend) | Gen 35:21–29, 37:1 |
| stap 11 `txt`, `fact` | ‘de broers komen terug met de mantel’ | rok laten brengen, gedoopt in bloed; de broers misleiden Jakob; SV-citaat 37:35 | Gen 37:31–35 |
| stap 12 `fact` | ‘Zeventig mensen gingen naar Egypte’; ‘ruim 400 jaar’ | ‘het huis van Jakob in Egypte telde zeventig zielen’ (incl. Jozef en zonen); 430 jaar | Gen 46:26–27, Ex 12:40–41 |
| stap 14 `txt`, `fact` | — | wagens en ruiters; 70 dagen beweend | Gen 50:3, 50:9 |
| quiz | why ‘Genesis 32’ (2×); ‘bij Bethlehem’; tap Bethlehem | 32:28 en 32:22; ‘aan de weg naar Bethlehem’ | Gen 32:22, 32:28, 35:19 |

### Deel ‘Jozef’

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| `cross` Exodus 13:19 en Jozua 24:32 | één niet-klikbare verwijzing | twee verwijzingen | Ex 13:19, Joz 24:32 |
| `cross` Psalm 105, Hebr 11:22, Ex 1:8, Johannes 4:5 | ‘voeten in de boeien’; ‘farao die Jozef niet kent’; ‘bron ligt op het land’ | ‘voeten in de stok’, heer over zijn huis; gebeente; ‘koning die Jozef niet gekend heeft’; Joh 4:5–6 met Sichar | Ps 105:18–21, Hebr 11:22, Ex 1:8, Joh 4:5–6 |
| stap 0 `txt`, `fact` | — | broers haten hem (37:4, 37:8); fact: betekenis Hebreeuws woord onzeker | Gen 37:3–11 |
| stap 1 `who`, `txt`, `fact`, `r` | ‘Jozef alleen’ (staat er niet); ‘meer dan 100 km: Amsterdam–Arnhem’ (≈ 81 km) | vanuit het dal van Hebron; dwaalt in het veld; vindt hen in Dothan; ‘ca. 100 km in vogelvlucht, bijna Amsterdam–Eindhoven’; `recon: 1` | Gen 37:14–17 |
| stap 2 Put `txt`, `fact` | eten van de broers en Jozefs smeken ontbraken | ‘meester-dromer’, doodslaan, put zonder water, ‘gaan zitten om brood te eten’; fact 42:21 | Gen 37:18–28, 42:21 |
| stap 3 `fact` | ‘Jesaja noemt hem de weg van de zee (Jesaja 9:1)’ (identificatie met de kustweg omstreden) | karavaan uit Gilead (37:25) + voorzichtige zin over de kustroute | Gen 37:25 |
| stap 4 `txt` | ‘de vrouw van Potifar liegt’ | Jozef weigert: ‘hoe zoude ik … zondigen tegen God’; daarna liegt zij | Gen 39:7–20 |
| stap 4 `fact` | ‘vier keer’ | met verzen 39:2, 3, 21, 23 | Gen 39 |
| stap 5 `who`, `txt`, `fact` | ‘Bezoekers: en de bakker’; ‘de bakker niet’ | Schenker, Bakker; binnen drie dagen; de bakker wordt opgehangen; SV-citaat 40:8 | Gen 40:8–22 |
| stap 6 `txt`, `fact` | — | ook de aren; SV 41:16; ‘stelt Jozef over heel Egypte’; naam ‘Zafnath-Paneah’ (gelijk aan personen.js) | Gen 41:1–52 |
| stap 7 `txt` | — | hard doen, verspieders, Simeon gebonden | Gen 42:7–24 |
| stap 8 `txt` | — | Benjamin vijf keer zoveel; ‘slaaf blijven’ | Gen 43:34, 44:33 |
| stap 9 `txt` | ‘heel het paleis’ | de Egyptenaren en het huis van de farao | Gen 45:2 |
| stap 10 `txt`, `fact` | ‘een beetje apart, en dat was juist handig’ | de farao geeft het beste van het land; SV-citaat 46:34 | Gen 46:34, 47:6 |
| stap 11 `txt` | — | SV-citaat 50:20; zorg voor hun kinderen; eed over de beenderen | Gen 50:20–25 |
| quiz | ‘Hoe oud toen zijn broers hem verkochten?’ (37:2 noemt de leeftijd bij het weiden); ‘baas’; ‘onderkoning’ | vraag op 37:2 afgestemd; ‘Wie kocht Jozef?’; ‘voor de farao stond’; why 41:1–4 | Gen 37:2, 39:1, 41:46 |
| `trips` | ‘Hebron → Dothan (alleen!)’ | ‘Hebron → Sichem → Dothan’ | Gen 37:14–17 |

### Stamboom, leeftijden en `ordAlles`

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| leeftijden | ‘Nahor’ 148 (opa) had dezelfde naam als de broer van Abraham in de boom: de app toonde bij beide ‘Broer van Abraham … werd 148 jaar’ | ‘Nahor (opa)’ met eigen uitleg; Nahor-broer: ‘niet dezelfde als …’ | Gen 11:24–26, 22:20–23 |
| Terach, Sara, Hagar, Rebekka, Ezau, Lea, Rachel, Bilha, Zilpa, Dina | refs onvolledig | refs aangevuld (20:12, 16:15, 24:15, 36:43, 30:21, 35:23–26) | zie controlebestand |
| Lot | ‘Neef van Abraham’ | ‘zoon van zijn broer Haran; hoort bij het geslacht na Abraham’ | Gen 11:27 |
| uitleg Adam, Henoch, Methusalach, Noach, Sem, Terach | o.a. ‘Daarom zo jong’; ‘oudste mens’ | met verzen; Henoch ‘stierf niet zoals de anderen’ | Gen 2:7, 5:24, 5:27, 9:28, 11:10–26 |
| `ordAlles` | 1 vraag | + volgorde Adam–Seth–Henoch–Noach en Ruben–Juda–Jozef–Benjamin | Gen 5; 29:32–35, 30:24, 35:18 |

Alle overige leeftijden in de stamboom (Adam 930 … Jozef 110, Sara 127, Ismaël 137) en de volgorde en moeders van de twaalf zonen kloppen met de SV en staan in het controlebestand.

## Routes (`recon`)

`recon: 1` toegevoegd waar de Bijbel alleen begin en eind noemt en de lijn via niet-genoemde plaatsen of tussenpunten loopt: Abraham 3, 6, 8, 13 (heen), 17, 21 (heen); Izak 2, 7; Jakob 0, 7 (Ezau naar Seïr), 8, 9, 10; Jozef 1.
Zonder `recon` gebleven: korte rechte lijnen tussen twee genoemde plaatsen (bijv. Gerar → Berseba, Sodom → Zoar, Gilead → Mahanaïm → Pniël) en routes waarvan de Bijbel de tussenstations noemt (Genesis 14:5–7 de veldtocht van de koningen; Genesis 26:17–22 dal van Gerar → Rehoboth; Genesis 33:17–18 Pniël → Sukkoth → Sichem; Genesis 21:14–21 Berseba → Paran).

## Open punten voor Martijn

1. **Lot en zijn dochters (Genesis 19:30–38).** Opgenomen in één sobere zin (‘zij geven hem wijn en worden zwanger van hun eigen vader’) met de afkomst van Moab en Ammon (belangrijk voor Ruth en latere boeken). Lot die zijn dochters aanbiedt (19:8) is niet opgenomen. Graag bevestigen of aanpassen.
2. **Dina (Genesis 34).** Het hoofdstuk ontbrak geheel. Toegevoegd aan stap ‘Terug in Bethel’ (ref nu `Genesis 34; 35:1–15`) met het SV-woord ‘verkracht’. Alternatief: ‘doet haar geweld aan’. Graag kiezen.
3. **Niet behandelde gedeelten** (stappen kunnen alleen aan het eind worden toegevoegd): Genesis 10 (volkenlijst), 25:1–6 (Ketura), 35:22 (Ruben en Bilha), 36 (Ezau/Edom), 38 (Juda en Tamar). Beslissen of deze een plek krijgen (bijv. als extra stap aan het eind van een deel) of bewust buiten de kinderroute blijven.
4. **Chronologie.** Gekozen: gangbare conservatieve reconstructie (uittocht 1446, 430 jaar in Egypte). De noten noemen de lezing van Galaten 3:17 (430 jaar inclusief Kanaän, ~215 jaar later) en een 13e-eeuwse uittocht. Ook bekend: Genesis 11:26 (Terach 70) tegenover Handelingen 7:4 (Abram vertrok na Terachs dood, dus Terach 130 bij Abrams geboorte); dit raakt de berekende jaartallen niet, omdat vanaf de uittocht wordt teruggerekend.
5. **Moria = tempelberg.** Alleen 2 Kronieken 3:1 noemt de berg Moria; de gelijkstelling met ‘het land Moria’ (Genesis 22:2) is traditie. Fact en quiz zijn voorzichtig geformuleerd; de tap-vraag vraagt naar Jeruzalem ‘waar Salomo de tempel bouwde op de berg Moria’.
6. **Betekenissen van namen** (Abram, Sara, Izak, Israël, Esek, Sitna, Berseba, Benjamin) staan als uitleg (`fs: "u"`), niet als Bijbeltekst; ‘Israël’ is voorzichtig geformuleerd.
7. **Tellingen in `stat`** (Noach 12 verzen buiten Genesis, Abraham/Izak/Jakob 32 verzen, Israël ‘ruim 2300’) zijn geteld in de SV-bestanden van `public/bijbelreis/bijbel/`. Daar ontbreken o.a. Klaagliederen, Zacharia, Joël, 2 Korinthe en Efeze; voor Noach en het drietal verwacht ik daar geen treffers, voor ‘Israël’ wel enkele (corpus: 2293). Niet met het controlescript vast te leggen.
8. **Stamboom-rij van Lot.** Lot staat in de rij van Abraham, maar hoort bij het geslacht daarna. Verplaatsen naar de rij van Izak zou kunnen suggereren dat hij een zoon van Abraham is; daarom alleen de toelichting aangepast. Weergavekeuze voor de hoofdagent/Martijn.

## Voor plaatsen/kaart (niet zelf gewijzigd)

- **`efrath` (graf van Rachel).** Staat op Bethlehem. Genesis 35:19 zegt ‘aan den weg naar Efrath’; 1 Samuël 10:2 plaatst het graf ‘aan de landpale van Benjamin, te Zelzah’ en Jeremia 31:15 noemt Rama (ten noorden van Jeruzalem). Overweeg `c: "b"` met een kandidaat bij Rama en uitleg in `d`.
- **Begrafenisstoet van Jakob (Genesis 50:10–11).** De rouw bij ‘het plein van het doornbos (Goren-Atad), dat aan gene zijde van de Jordaan is’ / Abel-Mizraïm suggereert mogelijk een route om de Dode Zee heen; de getekende route (recon) loopt via Berseba. Ligging onbekend; eventueel vermelden.
- **Babel-route** begint bij Ararat; de Bijbel zegt alleen ‘als zij tegen het oosten togen’ (11:2) en noemt Ararat niet als vertrekpunt. Staat als `recon`, maar overweeg de lijn weg te laten of het beginpunt neutraal te maken.
- **`salem`**: `d` zegt ‘Hier ligt ook de berg Moria’. Voorstel: ‘Volgens 2 Kronieken 3:1 bouwde Salomo hier de tempel op de berg Moria.’
- **`ur`** (`w`, Tell el-Muqayyar): er is een serieuze minderheidsopvatting voor een noordelijk Ur (bij Urfa/Haran). Eventueel `b` met `alt`.
- **`sodom`/`zoar`** (`o`, zuidkant Dode Zee): de noordelijke kandidaat (Tall el-Hammam, bij de Jordaanvlakte van 13:10) wordt ook verdedigd. Eventueel vermelden in `d` of als `alt`.
- **`dan`** in Genesis 14:14: de stad heette toen Laïs en kreeg later de naam Dan (Richteren 18:29). Kan in `d`.
- **`mamre`** is samengenomen met Hebron; correct volgens 23:19 (‘Mamre, hetwelk is Hebron’).
