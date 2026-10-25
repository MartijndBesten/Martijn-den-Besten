# Inhoudscontrole Bijbelreis 2.0 — groep exodus-ruth

Boeken: Exodus, Numeri en Deuteronomium (`numeri.js`), Jozua, Richteren, Ruth.
Maatstaf: Statenvertaling in `public/bijbelreis/bijbel/` (ook de NT-boeken uit de kruisverwijzingen). Datum: 25 oktober 2026.

Gewijzigde bestanden: `public/bijbelreis/inhoud/{exodus,numeri,jozua,richteren,ruth}.js`, `scripts/bijbel-controle/{exodus,numeri,jozua,richteren,ruth}.txt` en dit verslag. Er zijn geen stappen verplaatst, ingevoegd of verwijderd. Ook plaats-ids en deel-ids zijn ongewijzigd.

## Aantallen

| | Exodus | Num./Deut. | Jozua | Richteren | Ruth | Totaal |
| --- | --- | --- | --- | --- | --- | --- |
| Stappen gecontroleerd | 24 | 16 | 16 | 16 | 7 | **79** |
| Inhoudelijke correcties (tabellen hieronder) | 33 | 28 | 23 | 16 | 4 | **104** |
| Delen met `tijd`/`tl`/`tijdNoot` | 3 | 2 | 2 | 2 | 1 | 10 |
| Stappen met `fs` (b/u/h) | 24 | 16 | 16 | 16 | 7 | 79 |
| Controleregels toegevoegd | 55 | 38 | 37 | 22 | 10 | **162** |
| Controleregels totaal / mis | 247 / 0 | 205 / 0 | 269 / 0 | 228 / 0 | 106 / 0 | 1055 / 0 |

Verder zijn gecontroleerd: 52 ‘Wie is wie’-teksten, 59 kruisverwijzingen (NT nu ook met het script), 43 tikvragen, 85 meerkeuzevragen, 14 volgordevragen en 60 routes. Elke `mc` heeft het goede antwoord als eerste, en de foute antwoorden zijn echt fout. Alle `ord`-reeksen staan in Bijbelse volgorde. `node --check` slaagt op alle vijf bestanden, en `node scripts/bijbelreis-check.mjs` meldt ‘Geen problemen gevonden’.

Verdeling `fs`: b = 53, u = 13, h = 13 (79 stappen). Weetjes met een historische claim (h) zijn voorzichtig geformuleerd.

## Chronologie (nieuw per deel)

| Deel | `tijd` | `tl` | Grondslag (kort; volledige tekst in `tijdNoot`) |
| --- | --- | --- | --- |
| Exodus / Mozes | ca. 1526–1446 v.Chr. | -1526, -1446 | 1 Kon. 6:1 (480 jaar vóór Salomo jr. 4 ≈ 966): uittocht ≈ 1446; Mozes 80 bij de farao (Ex. 7:7). Exodus 1 niet te dateren. Alternatief: 13e eeuw. |
| Exodus / Uittocht | ca. 1446 v.Chr. | -1446, -1446 | Idem. Num. 33:3 (15e dag 1e maand). Opmerking over de 430 jaar (Ex. 12:40, vgl. Gal. 3:17). |
| Exodus / Sinaï | ca. 1446–1445 v.Chr. | -1446, -1445 | Ex. 19:1 (3e maand), Ex. 40:17 (1e dag, 1e maand, 2e jaar). |
| Numeri / Woestijn | ca. 1445–1407 v.Chr. | -1445, -1407 | Num. 10:11; Num. 33:38 (Aäron sterft in het 40e jaar); Deut. 2:14 (38 jaar). |
| Numeri / Moab | ca. 1407–1406 v.Chr. | -1407, -1406 | Deut. 1:3 (40e jaar, 11e maand); Deut. 34:7. |
| Jozua / Intocht | ca. 1406 v.Chr. | -1406, -1406 | 40 jaar na de uittocht; Joz. 4:19. Alternatief rond 1230–1200. |
| Jozua / Het land | ca. 1406–1375 v.Chr. | -1406, -1375 | Kaleb 40 → 85 (Joz. 14:7–10) geeft ca. 1400. Het sterfjaar van Jozua is niet te berekenen; het eindjaar is een ruwe schatting (dat staat in de noot). |
| Richteren / Debora en Gideon | ca. 1240–1120 v.Chr. (onzeker) | -1240, -1120 | De opgetelde jaren zijn langer dan de 480 jaar uit 1 Kon. 6:1 toelaat. Daarom gaat de noot uit van overlappende perioden; ijkpunt Richt. 11:26 (300 jaar). |
| Richteren / Simson | ca. 1100–1050 v.Chr. (onzeker) | -1100, -1050 | Richt. 13:1 en 15:20. Valt volgens veel uitleggers deels samen met Eli en Samuël. |
| Ruth | ca. 1150–1100 v.Chr. (onzeker) | -1150, -1100 | Ruth 1:1; Ruth 4:17; 2 Sam. 5:4 (David koning op zijn 30e, ca. 1010). Spanning met Matt. 1:5 is genoemd. |

Ook het boek-`tijd` is aangepast: Exodus ‘ca. 1526–1445 v.Chr.’, Numeri ‘ca. 1445–1406 v.Chr.’, Jozua ‘ca. 1406–1375 v.Chr.’, Ruth ‘ca. 1150–1100 v.Chr. (onzeker)’. Richteren blijft ‘ca. 1380–1050 v.Chr.’.

## Correcties per boek

### Exodus

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Mirjam | ‘Als meisje hield ze de wacht bij het biezen mandje’ | Enige zus die de Bijbel noemt; ‘waarschijnlijk’ het meisje bij het kistje | Ex. 2:4 noemt geen naam; Num. 26:59 |
| Wie: Aäron | ‘maar God koos hem toch als hogepriester’ (na het kalf) | ‘Toch werd hij gezalfd tot de eerste hogepriester (Lev. 8:12)’ | Hij werd al aangewezen in Ex. 28, vóór het kalf; de zalving staat in Lev. 8 |
| Wie: Amram en Jochebed | ref alleen Ex. 6:20 | Ex. 2:1; 6:20 | Ex. 2:1 ‘huis van Levi … dochter van Levi’ |
| Mozes, intro | ‘Ruim vierhonderd jaar na Jakob’ (bij Mozes’ geboorte) | ‘Honderden jaren nadat Jakob naar Egypte kwam’ | De 430 jaar (Ex. 12:40) lopen tot de uittocht, 80 jaar na Mozes’ geboorte |
| Mozes, who | Mozes 120, Aäron 123 | 80 / 83 | Ex. 7:7 (leeftijd aan het eind van dit deel) |
| Mozes, cross Markus | 12:26, ‘God is een God van levenden’ | 12:26–27, SV-citaat | Dat citaat staat in 12:27 |
| Mozes, cross Joh. 8:58 | ‘Hij gebruikt de Naam die God … noemde’ | ‘Veel uitleggers horen hierin de Naam …’ | Dit is uitleg, geen tekst |
| Mozes, cross Matt. 2 | ‘en kwam daar weer uit’ | geschrapt; citaat behouden | Valt buiten 2:13–15 |
| Mozes stap 1, fact | ‘zijn zus was Mirjam (Ex. 6:20, Num. 26:59)’ | De zus wordt in Ex. 2 niet genoemd; enige bekende zus: Mirjam | Ex. 6:20 noemt Mirjam niet; Num. 26:59 |
| Mozes stap 2, who | Mozes zonder leeftijd | Mozes 40 | Hand. 7:23 |
| Mozes stap 4, fact | ‘Horeb is een andere naam voor de Sinaï’ (stellig) | Belofte 3:12, vervulling Ex. 19; ‘ook in Deut. heet de berg van de wet Horeb’ | Deut. 5:2 |
| Mozes stap 6, txt | Ex. 4:24–26 ontbrak (de HEERE zoekt Mozes te doden; Zippora besnijdt haar zoon) | toegevoegd; zin over Aäron hersteld | Ex. 4:24–26 (niets weglaten) |
| Uittocht, intro | ‘Dit is de belangrijkste gebeurtenis van het OT’ | ‘Later herinnert de Bijbel er steeds weer aan.’ | Een eigen oordeel, geen Bijbeltekst |
| Uittocht, cross 1 Kor. 5:7 | ‘het Lam dat voor ons geslacht is’ | SV: ‘ons Pascha is voor ons geslacht, namelijk Christus’ | 1 Kor. 5:7 |
| Uittocht, cross Openb. | 15:3, ‘het lied’ | 15:2–3, ‘het gezang van Mozes … des Lams’ | SV-tekst; ‘overwinnaars’ staat in 15:2 |
| Uittocht stap 0, txt | ‘Het volk wordt boos op Mozes’ | ‘De opzichters van Israël worden boos op Mozes en Aäron’ | Ex. 5:19–21 (ambtlieden) |
| Uittocht stap 0, fact | ‘Nijlklei … nog altijd te vinden’ | voorzichtiger, fs h | Historische achtergrond |
| Uittocht stap 1, txt | ‘In Gosen … blijven de plagen weg’ | Pas vanaf plaag 4 onderscheid: steekvliegen, vee, hagel, duisternis | Ex. 8:22; 9:6; 9:26; 10:23 |
| Uittocht stap 1, fact | 12:12 als ‘met de plagen’ + ‘De Egyptenaren vereerden de rivier en de zon’ | 12:12 hoort bij de nacht van de laatste plaag; de historische zin is weg | Ex. 12:12 |
| Uittocht stap 2, fact | ‘Het Pascha wordt nog steeds gevierd’ | Lukas 22:15 als SV-citaat | Ander Bijbelgedeelte (fs b) |
| Uittocht stap 3 | ‘600.000 mannen’, ‘430 jaar in Egypte geweest’ | ‘ca./ongeveer 600.000’, ‘430 jaar in Egypte gewoond’ | Ex. 12:37 ‘omtrent’; Ex. 12:40 ‘gewoond’ |
| Uittocht stap 4, txt | ‘600 beste wagens en zijn hele leger’ | ‘… alle andere wagens van Egypte …’ | Ex. 14:7 |
| Uittocht stap 4, fact | Suez of meren | ook Golf van Akaba genoemd; ligging van Migdol/Baäl-Zefon onbekend | Ex. 14:2; betwiste ligging |
| Uittocht stap 5, txt | ‘wielen laten vastlopen’ | ‘wielen eraf gaan … bijna niet vooruit’ + ‘Laten we vluchten …’ | Ex. 14:25 |
| Uittocht stap 5, fact | ‘grootste wonder van het OT’ | Ps. 106:9–11; Ps. 136:13–15; Hebr. 11:29 | Een oordeel is vervangen door verwijzingen |
| Uittocht stap 6, fact | ‘oudste lied in de Bijbel’ | geschrapt; Openb. 15:3 als SV-citaat | Niet te verifiëren |
| Uittocht quiz tap | ‘Gosen, waar de plagen wegbleven’ | ‘waar Israël woonde toen God de plagen stuurde’ | Zie stap 1 |
| Sinaï, cross Deut. 5 | ‘Veertig jaar later’ | ‘Bijna veertig jaar later’ | Ex. 19:1 tegenover Deut. 1:3 |
| Sinaï stap 4, fact | ‘meestal gelijkgesteld aan Jebel Musa’ | Ligging niet zeker; oude traditie (Katharinaklooster, 6e eeuw na Chr.); alternatieven N-Sinaï en Midian | Ligging betwist (opdracht) |
| Sinaï stap 5, txt | ‘De eerste vier gaan over God, de laatste zes …’ | ‘Ze gaan over God en over de mensen om je heen.’ | De indeling 4/6 is traditie en staat niet in Ex. 20 |
| Sinaï stap 5, fact | ‘alle geboden in twee’ | ‘de wet in twee geboden’ + Deut. 5:6–21 | Matt. 22:40 |
| Sinaï stap 7, txt | ‘Mozes bidt … en God vergeeft.’ | God straft met een plaag maar verdelgt niet; nieuw verbond | Ex. 32:33–35; 34:9–10 |
| Sinaï stap 7, fact | vrije parafrase 32:32; ‘wilde zijn leven geven’ | SV-citaat; ‘stelde zichzelf in de plaats van het volk’ | Ex. 32:32 |

### Numeri en Deuteronomium

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Mozes | ‘Omdat hij … op de rots sloeg’ | + ‘God niet geheiligd … in plaats van ertegen te spreken’ | Num. 20:8–12 |
| Wie: Korach | ‘De aarde … verzwolg hen’ (ook de 250) | Aarde verslond Dathan, Abiram en de mensen van Korach; vuur verteerde de 250 | Num. 16:31–35 |
| Wie: Bileam | ‘gaf Balak later een slecht advies (31:16)’ | ‘door zijn raad werd Israël tot zonde verleid (31:16; Openb. 2:14)’ | 31:16 noemt Balak niet; Openb. 2:14 wel |
| Woestijn, stat | ‘murmureert … Bijna altijd …’ | ‘Woorden met murmureren staan … 11 / 10 keer’ | Telling SV (inclusief ‘murmureringen’) |
| Woestijn, cross 2 Kon. 18:4 | ‘Zevenhonderd jaar later’ | ‘Honderden jaren later’ | Schatting, niet als feit |
| Woestijn stap 0, txt | ‘De ark gaat drie dagreizen vooruit’ | Ze reizen drie dagen; de ark gaat voor hen uit | Num. 10:33 |
| Woestijn stap 0, fact | ‘alle mannen van 20+ … Daarom heet het boek Numeri’ | ‘die ten strijde konden trekken (1:3, 46)’; ‘naar deze tellingen’ | Num. 1:3 |
| Woestijn stap 1, txt | ‘graven van de gulzigheid’ | ‘graven van de begeerte’ | Num. 11:34 ‘belust’ |
| Woestijn stap 6, txt | — | ‘Vanuit Kades stuurt Mozes boden’ | Num. 20:14 |
| Woestijn stap 7, txt | ‘Israël bidt’; ‘naar het zuiden, richting de Schelfzee’; ‘giftige slangen’ | ‘doet de HEERE een gelofte’; ‘over de weg naar de Schelfzee’; ‘vurige slangen’ | Num. 21:2, 4, 6 |
| Woestijn stap 7, fact | vrije parafrase Joh. 3:14–15 | SV-citaat | Joh. 3:14–15 |
| Woestijn stap 8, route | Punon → Kerak → Arnon (midden door Moab) | Punon → oostelijk langs de woestijn → bovenloop Arnon (recon) | Num. 21:11, 13; Richt. 11:18; de tekst zegt zelf ‘aan de oostkant omheen’ |
| Woestijn stap 8, fact | ‘de hele generatie van de uittocht’ | ‘alle krijgslieden van die generatie’ | Deut. 2:14 |
| Woestijn stap 9, routes | Arnon–Dibon–Medeba–Hesbon zonder `recon`; Hesbon → Rabba (Amman) → Edreï | Eerste route `recon: 1`; tweede via Gilead in plaats van door Ammon | De Bijbel noemt deze tussenstations hier niet; Num. 21:24 ‘de landpale der kinderen Ammons was vast’ |
| Woestijn stap 9, txt | ‘Nu is het hele gebied ten oosten van de Jordaan van Israël.’ | ‘Zo krijgt Israël het land van Sihon en Og’ | Num. 21:24; Ammon, Moab en Edom niet |
| Woestijn stap 9, fact | ‘Og was een reus’ | ‘de laatste van de reuzen’; el ≈ 45 cm uitgelegd | Deut. 3:11 ‘eens mans elleboog’ |
| Moab, stat | ‘zegt Mozes 221 keer’ | ‘staat 221 keer’ | Telling SV (met of zonder komma) |
| Moab, cross Markus 12 | 12:29–30 ‘eerste en grootste gebod’ | 12:28–30 ‘het eerste van al de geboden’ | ‘groot’ staat in Matt. 22:38, niet in Markus |
| Moab, cross Matt. 17 | ‘Zo stond Mozes toch in het beloofde land.’ | ‘Op een hoge berg … spreken met Hem.’ | Speculatief; de berg wordt niet genoemd |
| Moab stap 0, routes | Edreï → Rabba (Amman) → Hesbon; Bileam idem, eind Hesbon | Via Gilead; Bileams route eindigt bij de Arnon | Num. 21:24; Num. 22:36 |
| Moab stap 0, fact | ‘Pethor lag bij de Eufraat … wekenlang onderweg’ | ‘in Mesopotamië (Deut. 23:4), waarschijnlijk …; waarschijnlijk enkele weken’ | Deut. 23:4; ligging niet zeker (fs h) |
| Moab stap 1, txt | ‘gaan om met de vrouwen van Moab’; ‘Pinehas grijpt in’ | ‘hoereren met hen’; de daad van Pinehas wordt verteld | Num. 25:1, 6–8 (niet afzwakken) |
| Moab stap 2, fact | ‘In het Grieks klinkt die naam als Jezus’ | ‘De naam Jezus is dezelfde naam in het Grieks’ | Uitleg verduidelijkt |
| Moab stap 3, fact | ‘het grootste gebod (Markus 12:29–30)’ | ‘het eerste van al de geboden (Markus 12:28–30)’ | Mark. 12:29 |
| Moab stap 4, fact | ‘ruim 800 meter hoog’ | identificatie genoemd; ‘zo’n 700 à 800 meter’ | Hoogte verschilt per top |
| Moab stap 5, fact | ‘Toch heeft Mozes het beloofde land nog betreden’ | ‘Eeuwen later verscheen Mozes … (Matt. 17:1–3)’ | Speculatie geschrapt |
| Quiz woestijn mc | ‘Wat ging … drie dagreizen vooruit?’ | ‘Wat ging … voor het volk uit om een rustplaats te zoeken?’ | Num. 10:33 |
| Quiz moab mc | why ‘Numeri 23:11’ | ‘Numeri 24:10’ | In 24:10 staat het driemaal zegenen |

### Jozua

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Kaleb | ref Num. 14:30 | Num. 14:6–9, 30 | Het vertrouwen staat in 14:6–9 |
| Wie: Eleazar | ‘stierf kort na Jozua’ | ‘Zijn dood staat direct na die van Jozua’ | Joz. 24:33 geeft geen tijd |
| Intocht, who | Jozua 110 | Jozua (geen leeftijd) | Leeftijd bij de intocht onbekend |
| Intocht stap 1, routes | heenreis zonder `recon` | ook `recon: 1` | De doorwaadplaats is een reconstructie |
| Intocht stap 1, txt | ‘De koning … laat haar huis doorzoeken’ | Koning eist uitlevering; Rachab zegt dat ze weg zijn; achtervolgers naar de Jordaan | Joz. 2:3–7 |
| Intocht stap 2, who | 40.000 | ca. 40.000 | Joz. 4:13 ‘omtrent’ |
| Intocht stap 3, txt | besnijdenis in Gilgal ontbrak | toegevoegd, met ‘smaad van Egypte … Gilgal’ | Joz. 5:2–9 |
| Intocht stap 4, txt | ‘Jozua knielt’ | ‘valt op zijn gezicht ter aarde’ | Joz. 5:14 |
| Intocht stap 5, txt | ‘mantel uit Babel’; ‘36 mannen’ | ‘uit Babylonië’; ‘ongeveer 36’ | Joz. 7:21; 7:5 ‘omtrent’ |
| Intocht stap 5, fact | Hosea 2:14 | Hosea 2:15 (SV-nummering), SV-citaat | SV Hosea 2:15 |
| Intocht stap 6, txt/who | ‘30.000 man … verstopt tussen Bethel en Ai’ | 30.000 ’s nachts achter de stad; ca. 5000 in een hinderlaag tussen Bethel en Ai | Joz. 8:3–4; 8:12 |
| Intocht stap 6, fact | ‘Ai betekent puinhoop’ | ‘waarschijnlijk’ | Naamuitleg |
| Intocht stap 7, fact | ‘altaar uit ongeveer deze tijd … weten we niet zeker’ | Zertal (jaren 1980), door hem gedateerd rond 1200 v.Chr.; betekenis en verband omstreden | Klopte alleen bij een late datering |
| Land, cross Hebr. 4:8 | ‘de echte rust komt pas bij de Heere Jezus’ | 4:8–9 SV: ‘er blijft dan een rust over voor het volk Gods’ | Hebr. 4:9 |
| Land, cross 1 Sam. 1:3 | ‘Ruim driehonderd jaar na Jozua’ | ‘Honderden jaren na Jozua’ | Schatting, niet als feit |
| Land, cross Richt. 2 | 2:7–8 | 2:7–10 | ‘geslacht dat de HEERE niet kende’ staat in 2:10 |
| Land stap 0, fact | ‘stond de ark twintig jaar’ | ‘stond de ark … lange tijd (1 Sam. 7:1–2)’ | 1 Sam. 7:2: twintig jaar tot de klacht van Israël; de ark bleef langer |
| Land stap 1, fact | Gilgal ‘bij Jericho, 250 m onder zee’ | ligging Gilgal onbekend; ‘ruim 200 m onder de zeespiegel’ | Voorzichtiger |
| Land stap 3, fact | ‘grootste stad … de stad is echt verbrand’ | ‘een van de grootste’; datering van de brandlaag omstreden; Richt. 4:2 | Historische claim voorzichtig |
| Land stap 4, ref | Jozua 14:6–15 | Jozua 14:6–15; 15:13–14 | Het verdrijven van de zonen van Enak staat in 15:14 |
| Land stap 4, fact | ‘Van alle mannen die uit Egypte trokken …’ | ‘die bij de Sinaï geteld waren (20+)’; ‘Arba, een groot man onder de Enakieten’ | Num. 14:29–30; 26:64–65. Eleazar ging ook het land in |
| Land stap 5, onthul Juda | ‘met Hebron en Bethlehem’ | Hebron; Bethlehem via ‘Bethlehem-Juda’ (Ruth 1:1) | Bethlehem staat niet in SV Joz. 15 |
| Land stap 5, onthul Efraïm | ‘met Silo’ | ‘Sichem en Timnath-Serah’ (Joz. 20:7; 19:50) | Jozua plaatst Silo niet bij Efraïm |

### Richteren

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Wie: Simson | ‘sterk … zolang hij zijn belofte hield’ | ‘De Geest van de HEERE gaf hem grote kracht … de HEERE was van hem geweken’ | Richt. 16:20 (uitleg geschrapt) |
| Debora stap 0, fact | ‘niet een rechter …’; 21:25 ‘wat goed was’ | ‘vooral een leider die verloste (2:16); sommigen spraken ook recht (4:5)’; SV ‘wat recht was’ | Richt. 2:16; 4:5; 21:25 |
| Debora stap 1, fact | ‘in haar lied’; ‘enige vrouw in de Bijbel die richter was’ | ‘lied van Debora en Barak (5:1)’; ‘in het boek Richteren’ | Richt. 5:1 |
| Debora stap 2, route | via Hazor (stad van Jabin) | zonder Hazor | Een omweg door de vijandelijke stad is onlogisch |
| Debora stap 3, txt | ‘In haar lied zingt Debora’ | ‘In het lied van Debora en Barak staat’ | Richt. 5:1 |
| Debora stap 3, fact | modderpoel als feit | 5:4 ‘de wolken dropen van water’; ‘veel uitleggers denken …’ (fs u) | Reconstructie gemarkeerd |
| Debora stap 4, ref | 4:17–24 | 4:17–24; 5:31 | ‘veertig jaar rust’ staat in 5:31 |
| Debora stap 8, txt | eindigde bij de koningen | + de efod in Ofra werd ‘een valstrik’; veertig jaar rust | Richt. 8:24–28 (niets weglaten) |
| Simson, stat | ‘Van de twaalf richters is zijn verhaal het langst’ | ‘Geen richter krijgt in het boek zoveel ruimte’ | Het getal ‘twaalf’ is een traditionele telling |
| Simson stap 0, fact | ‘Simson was het al voordat hij geboren werd’ | ‘zijn hele leven, van moeders buik af’ | Richt. 13:5, 7 |
| Simson stap 1, fact | ‘een paar kilometer verderop’ | ‘wordt meestal gezocht zo’n zes kilometer verderop’ | Identificatie van Timna |
| Simson stap 2, txt | ‘Woedend gaat Simson naar Askelon’ | ‘Dan komt de Geest van de HEERE over Simson …’ | Richt. 14:19 (de toorn volgt daarna) |
| Simson stap 2, fact | jakhalzen ‘vang je makkelijker’ | alleen: het woord kan ook een jakhals aanduiden | Rationaliserende speculatie geschrapt |
| Simson stap 3, txt | ‘God splijt de rots’ | ‘God splijt de holle plaats in Lechi open’ | Richt. 15:19 |
| Simson stap 4, txt | ‘blijft daar bij een vrouw’ | ‘gaat hij in bij een vrouw die een hoer is’ | Richt. 16:1 (niet afzwakken) |
| Simson stap 4, fact | Hebron 60 km, poort ‘honderden kilo’s’ | twee uitleggingen van ‘in het gezicht van Hebron’ | Richt. 16:3; gewicht speculatief |

### Ruth

| Plek | Was | Wordt | Grond |
| --- | --- | --- | --- |
| Boek/deel tijd | ‘ca. 1100 v.Chr.’ | ‘ca. 1150–1100 v.Chr. (onzeker)’ + noot | Ruth 1:1; 4:17; 2 Sam. 5:4 |
| Wie: Boaz | ‘Zijn moeder was Rachab uit Jericho (Ruth 2:1, Matt. 1:5)’ | ‘Volgens Matt. 1:5 was Rachab zijn moeder; meestal wordt aangenomen dat dit Rachab uit Jericho is.’ (Ruth 2:1 bij ‘familie van Elimelech’) | Ruth 2:1 zegt niets over Rachab |
| Stap 3, txt/who | ‘een hele efa gerst’ | ‘ongeveer een efa’ | Ruth 2:17 ‘omtrent’ |
| Stap 5, fact | losser ‘of voor een weduwe zorgde (Lev. 25:25)’ | ‘bijvoorbeeld verkocht land terugkocht (Lev. 25:25)’ | Lev. 25:25 gaat alleen over land |

## Routes: reconstructie of niet

Dit is per route gecontroleerd. Een route zonder `recon` volgt legerplaatsen of plaatsen die de Bijbel achter elkaar noemt:

- **Uittocht (Num. 33:5–9; Ex. 12:37; 13:20; 14:2; 15:22–27):** Raämses → Sukkoth → Etham → Pi-Hachiroth → door de zee → Mara → Elim. Deze routes zijn geen reconstructie en hebben terecht geen `recon`. De **ligging** van deze stations is wel onzeker (`c: "o"`), en zeker die van de doortocht. Dat staat nu in de fact van ‘Klem bij de zee’.
- **Elim → woestijn Sin en Sin → Rafidim → Sinaï** hebben geen `recon`. Num. 33:10–14 noemt hier nog tussenstations (‘aan de Schelfzee’, Dofka, Aluz) die niet op de kaart staan. Zie ‘Voor plaatsen/kaart’.
- **Sinaï → Kibroth-Taäva → Hazeroth** volgt Num. 33:16–17. De lijn Sinaï → Kibroth loopt via een tussenpunt en heeft terecht `recon`.
- **Reconstructies, terecht met `recon: 1`:** Mozes’ vlucht naar Midian, Midian → Horeb, Horeb → Egypte, de farao achter Israël aan, Hazeroth → Kades, de verspieders, Kades → Hor, Hor → Ezeon-Geber → Punon, Punon → Arnon, Bileams reis, Basan → Sittim, en in Jozua, Richteren en Ruth alle reizen zonder genoemde tussenstations.
- **Op `recon: 1` gezet:** Arnon → Dibon → Medeba → Hesbon (Numeri stap 9) en Sittim → Jericho (Jozua stap 1, heenreis).
- **Gecorrigeerd:** Punon → Arnon liep via Kerak, midden door Moab. Hesbon/Edreï liep via Rabba, de hoofdstad van Ammon (twee keer in Numeri, plus Bileams route). Debora’s route liep via Hazor. Zie de tabellen.

## Onzekere punten die een beslissing van Martijn vragen

1. **Datering van de uittocht.** Volgens de opdracht is de conservatieve datering ca. 1446 v.Chr. gevolgd. Elke `tijdNoot` noemt de 13e-eeuwse datering als alternatief. Moet de tijdlijn de alternatieve datering ook tonen, bijvoorbeeld als tweede balk?
2. **430 jaar (Ex. 12:40).** De `txt` volgt de SV letterlijk (‘in Egypte gewoond’). Dat sommige oude vertalingen en uitleggers de tijd in Kanaän meetellen (vgl. Gal. 3:17), staat alleen in de `tijdNoot`.
3. **Berg Sinaï en de Schelfzee.** De teksten presenteren de ligging nu als betwist. Plaats `sinai` staat in `plaatsen.js` echter als `c: "w"` met ‘Meestal gelijkgesteld …’. Het advies is `c: "b"` met `alt`: dat beslist de plaatsen-agent of Martijn.
4. **Chronologie van de richteren.** De gekozen bereiken (1240–1120 en 1100–1050) zijn een ruwe reconstructie met overlappende perioden. Martijn beslist of hij liever helemaal geen getallen op de tijdlijn wil (`tl: null`) en alleen ‘tijd van de richters’.
5. **Ruth en Rachab.** Er is spanning tussen een datering rond 1150–1100 en Matt. 1:5 (Rachab als moeder van Boaz). De noot zegt dat veel uitleggers een geslachtsregister met weggelaten generaties aannemen. Dit is een twistpunt: er is geen eigen keuze gemaakt.
6. **Woordkeus bij zonde voor 8–12 jaar.** Num. 25 (‘hoereren’, de daad van Pinehas) en Richt. 16:1 (‘een vrouw die een hoer is’) staan nu Bijbelgetrouw in de tekst, volgens ‘niets afzwakken’. Martijn beslist of deze woordkeus voor de doelgroep zo blijft of anders wordt (maar wel eerlijk) verwoord.
7. **Ex. 4:24–26.** Toegevoegd als ‘de HEERE … wil hem doden’, met ‘hem’ ingevuld als Mozes. De SV-tekst zegt ‘hem’; dat het om Mozes gaat, is de gangbare uitleg.
8. **De Tien Geboden 4/6.** De indeling ‘vier over God, zes over de naaste’ is uit `txt` gehaald, omdat ze niet in Ex. 20 staat. Wil Martijn de reformatorische indeling (twee tafelen) noemen, dan kan dat als weetje met `fs: "u"`.
9. **Richteren 16:3 (‘in het gezicht van Hebron’).** De fact noemt twee uitleggingen. De `look`-lijn op de kaart tekent nog ‘Simson draagt de poort richting Hebron’ (Gaza → Hebron). Dat is verdedigbaar, maar het is één van de twee uitleggingen.
10. **Sterfjaar van Jozua.** Dat is niet te berekenen. Het eindjaar -1375 van het deel ‘Het land’ is een ruwe schatting en staat zo in de noot. Een alternatief is het deel laten eindigen bij ca. 1400 (Jozua 14).

## Voor plaatsen/kaart (niet zelf gewijzigd)

- **`sinai`** (`c: "w"`, d ‘Meestal gelijkgesteld …’): de ligging is betwist. Advies: `c: "b"` met `alt`, bijvoorbeeld noordelijke Sinaï-kandidaten en Jebel al-Lawz/Midian, en een `d` zonder ‘meestal’.
- **`schelfzee`**: de `d` noemt ‘Golf van Suez of een meer ten noorden’. Advies: ook de Golf van Akaba als kandidaat noemen.
- **`ex_midian` plus `sinai` (Jebel Musa):** met Midian ten oosten van de Golf van Akaba wordt Mozes’ tocht met de schapen naar Horeb (Ex. 3:1) een omweg van ruim 250 km rond de golf. Dat is geen fout van de route, maar het laat de spanning in de identificaties zien.
- **Num. 33-stations die ontbreken:** ‘aan de Schelfzee’ (33:10, tussen Elim en Sin), Dofka en Aluz (33:12–13), Zalmona (33:41), Oboth en Ije-Abarim (33:43–44), Dibon-Gad en Almon-Diblathaim (33:45–46). Als deze als `c: "o"` worden toegevoegd, kunnen de routes Elim → Sin → Rafidim en Hor → Punon → Arnon de Bijbelse stations volgen.
- **Hazeroth → Kades (Numeri stap 3)** loopt via Ezeon-Geber. In Num. 33:35–36 hoort Ezeon-Geber bij de latere reis naar Kades, in het 40e jaar. Voor de eerste tocht (Deut. 1:2, 19) is dat een mogelijke maar onzekere reconstructie.
- **Hor → Punon (Numeri stap 7)** gaat via Ezeon-Geber. Dat steunt op Num. 21:4 en Deut. 2:8, maar Num. 33:41–42 noemt Hor → Zalmona → Punon. De uitleggingen verschillen. De route is `recon`, maar het is goed dit in `d` van `punon` of `ezeongeber` te vermelden.
- **`punon`** (`c: "o"`): Feinan (Khirbet Feinan) is een gangbare identificatie. Mogelijk past `c: "w"`.
- **`kadesbarnea`**, d ‘De oase waar het volk bijna 38 jaar rondtrok’: de 38 jaar zijn de hele zwerftocht (Deut. 2:14), niet het verblijf in Kades. Voorstel: ‘Hier begonnen en eindigden de jaren van rondtrekken’.
- **`silo`**, d ‘Hier stond de tabernakel ruim 300 jaar’: dat is een schatting die als feit wordt gebracht. Advies: ‘lange tijd’ of ‘volgens een reconstructie ongeveer …’.
- **`hor`**: de traditie (Jebel Harun bij Petra) ligt ín Edom, terwijl Num. 20:23 en 33:37 zeggen ‘aan de pale (het einde) van het land van Edom’. Er bestaat ook een kandidaat bij Kades (Jebel Madurah). Mogelijk past `c: "b"`.
- **`ai`** (`c: "o"`): er zijn twee serieuze kandidaten (et-Tell, Khirbet el-Maqatir). Mogelijk past `c: "b"` met `alt`.
- **`ri_kedes`** (Tel Kedesh in Opper-Galilea): veel onderzoekers zoeken Baraks Kedes en het eikenbos van Zaänannim (Richt. 4:11) bij het Meer van Galilea (Khirbet Qedish), omdat Sisera er te voet heen vluchtte. Advies: `c: "b"` met `alt`.
- **Routes via `jeruz`** (Jozua stap 10 terugweg, Kaleb naar Hebron, Ruth): Jeruzalem was in die tijd een Jebusitische stad (Joz. 15:63). Als tussenpunt voor de bergweg kan dat, maar een punt net naast de stad is netter.
- **Haroseth-Hagojim** (Richteren stap 3, startpunt van Sisera, `[32.7, 35.07]`): de ligging is onbekend. Eventueel kan de plaats als `c: "o"` worden toegevoegd.
- De nieuwe tussenpunten in mijn routes zijn ruwe coördinaten en geen plaatsen. Punon → Arnon: [30.85, 35.75], [30.92, 36.0], [31.25, 36.12], [31.42, 36.0]. Gilead: [32.15, 35.78], [32.45, 35.95].

## Overige opmerkingen

- De versnummering is gecontroleerd tegen de SV. Exodus 8 (plagen) klopt al met de SV-nummering. Hosea 2:14 is gecorrigeerd naar 2:15.
- De NT-boeken staan nu in `bijbel/`. De kopregel ‘NT niet gecontroleerd’ in `exodus.txt` en `numeri.txt` is aangepast, en de NT-kruisverwijzingen van alle vijf boeken hebben nu controleregels.
- De `stat`-getallen zijn opnieuw geteld in de SV. Mozes in Exodus: 290 keer in 261 verzen. ‘Tabernakel’ in Exodus: 58 keer. ‘Murmureren’ en afleidingen: 11 keer in Numeri, 10 in Exodus. ‘HEERE, uw God’ in Deuteronomium: 221 keer (inclusief de varianten zonder komma). Num. 33 telt 41 legerplaatsen na Raämses.
- `fs: "b"` is ook gebruikt voor weetjes uit hetzelfde Bijbelboek maar buiten de `ref` van de stap, telkens met een verwijzing.
