# Verslag groep ot-1: geschiedenissen 1–31 (Genesis 1 t/m Exodus 40)

Datum: 25 oktober 2026. Bestanden: `public/bijbelreis/geschiedenissen/ot-1.js` (31 records en 11 kernwoorden),
`scripts/bijbel-controle/ot-1.txt` (735 regels, 0 mis tegen de Statenvertaling). `public/bijbelreis/plaatsen/ot-1.js` is
ongewijzigd: er waren geen nieuwe plaatsen nodig. Er zijn geen nieuwe reisstappen gemaakt en er zijn geen inhoudsbestanden gewijzigd.

Controles: `node --check` op beide JS-bestanden, `dump.cjs` loopt zonder fouten. Alle stapsleutels bestaan, de plaats-ids in
`kaart`-ontdekkingen (`babel`, `berseba`) bestaan, en de namen in `wie` staan in `BR.mensen` (naam of alias). Elke quizvraag (`why`),
elke kruisverwijzing, elke verwijzing in `verbanden` en elke kernwoordverwijzing staat als eigen regel in het controlebestand,
naast de citaten en getallen uit `uitleg`, `betekenis` en `ontdek`.

Kernwoorden geschreven: schepping, zonde, verbond, belofte, geloof, trouw, hoop, uittocht, tien-geboden, afgod, tabernakel.

## Per geschiedenis

Status van alle 31: uitgewerkt en gecontroleerd. Nieuwe stappen of plaatsen: geen.

| nr | titel (eigen) | ref | vorm | kw | stappen | t.o.v. eerste koppeling |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | God schept hemel en aarde | Genesis 1:1–2:3 | thema | schepping | begin:0 | – |
| 2 | Adam en Eva in de hof van Eden | Genesis 2:4–25 | plek | | begin:1 | begin:0 weg (dat is Genesis 1) |
| 3 | De slang en de zondeval | Genesis 3 | plek | zonde | begin:1 | – |
| 4 | Kaïn en Abel | Genesis 4 | stamboom | | begin:2 | – |
| 5 | Noach bouwt de ark | Genesis 6:5–7:24 | plek | | begin:3 | – |
| 6 | God sluit een verbond met Noach | Genesis 8:1–9:17 | plek | verbond | begin:3, begin:4 | – |
| 7 | De toren van Babel | Genesis 11:1–9 | plek | | begin:5 | begin:6 en abraham:0 weg |
| 8 | Abram gaat op weg naar Kanaän | Genesis 11:27–12:20 | route | belofte | abraham:0–4 | begin:5 en begin:6 weg |
| 9 | Hagar vlucht, en God ziet haar | Genesis 16 | plek | | abraham:13 | – |
| 10 | Abram en Lot gaan uit elkaar; Sodom wordt verwoest | Genesis 13; 18–19 | route | | abraham:5–8, 15, 16 | – |
| 11 | God belooft Abraham een zoon | Genesis 15; 17; 21:1–7 | plek | | abraham:12, 14, 18 | abraham:19 en 20 weg; abraham:14 (Genesis 17) erbij |
| 12 | Hagar en Ismaël worden weggestuurd | Genesis 21:8–21 | plek | | abraham:19 | abraham:18 en 20 weg |
| 13 | Abraham moet Izak offeren | Genesis 22:1–19 | route | geloof | abraham:21 | – |
| 14 | Een vrouw voor Izak | Genesis 24 | route | | abraham:23 | – |
| 15 | Ezau en Jakob | Genesis 25:19–34; 27:1–28:22 | route | | izak:0, 1, 5, 6, jakob:0 | abraham:24 (dood van Abraham) weg |
| 16 | Jakob bij Laban | Genesis 29–30 | stamboom | | jakob:1–3 | – |
| 17 | Jakob keert terug en worstelt bij de Jabbok | Genesis 31–32 | route | | jakob:4–6 | – |
| 18 | Jozef wordt door zijn broers verkocht | Genesis 37 | route | | jakob:11, jozef:0–3 | – |
| 19 | Jozef blijft trouw in Egypte | Genesis 39–41 | plek | trouw | jozef:4–6 | jozef:3 weg (hoort bij 18) |
| 20 | Jozef en zijn broers weer samen | Genesis 42–46 | route | | jozef:7–10, jakob:12 | – |
| 21 | Mozes wordt gered uit het water | Exodus 1:1–2:10 | plek | hoop | mozes:0, 1 | mozes:2 en 3 weg (horen bij 22) |
| 22 | Mozes kiest de kant van zijn volk | Exodus 2:11–25 | route | | mozes:2, 3 | mozes:1 weg |
| 23 | God roept Mozes bij de brandende braamstruik | Exodus 3–4 | plek | | mozes:4–6 | – |
| 24 | Tien plagen: de farao blijft weigeren | Exodus 5–10 | plek | | uittocht:0, 1 | – |
| 25 | Het Pascha en de uittocht uit Egypte | Exodus 11–13 | route | uittocht | uittocht:1–3 | – |
| 26 | Droog door de Schelfzee | Exodus 14:1–15:21 | route | | uittocht:4–6 | uittocht:7 weg (hoort bij 27) |
| 27 | Water, manna en kwartels in de woestijn | Exodus 15:22–17:7 | route | | uittocht:7, sinai:0, 1 | uittocht:6 en sinai:2 weg |
| 28 | Mozes met opgeheven handen | Exodus 17:8–16 | plek | | sinai:2 | sinai:1 weg |
| 29 | God geeft de Tien Geboden | Exodus 19; 20:1–21; 24 | plek | tien-geboden | sinai:4–6 | sinai:3 (Jethro, Exodus 18) weg |
| 30 | Het gouden kalf | Exodus 32–34 | plek | afgod | sinai:7 | – |
| 31 | De tabernakel wordt gebouwd | Exodus 31; 35–40 | plek | tabernakel | sinai:6, 8 | – |

Ontdek-soorten wisselen af: koppel (1, 10, 15, 19, 28), onthul (2, 5, 9, 11, 21, 23, 27, 31), wiezei (3, 13, 18, 22, 26, 30),
stamboom (4, 16), volgorde (6, 14, 17, 20, 24, 29), kaart (7, 12), verbanden (8, 25).

Chronologie: 1–7 zonder jaartal (`tl: null`), zoals het deel ‘Het begin’. 8–20 zijn gerekend op dezelfde grondslag als de delen
over de aartsvaders (uittocht ca. 1446 v.Chr., 430 jaar, leeftijden in Genesis); 21–31 vanaf de uittocht ca. 1446 v.Chr. Elke
`tijdNoot` noemt waarop de datering rust en dat er andere dateringen zijn.

## Twijfelpunten voor Martijn

1. **Afbakening 5 en 6.** De leidraad noemt Genesis 6–7 en 8–9. Ik heb gekozen voor Genesis 6:5–7:24 en 8:1–9:17, gelijk aan de
   reisstappen. Daardoor vallen Genesis 6:1–4 (de zonen van God en de dochters van de mensen; uitleg omstreden) en 9:18–29
   (Noach dronken, de vloek over Kanaän) buiten deze twee geschiedenissen. Moeten die erbij?
2. **8 met Egypte.** De leidraad zegt Genesis 11–12, dus ook 12:10–20 (Abram laat Sarai zeggen dat ze zijn zuster is). Dat staat
   erin, net als in de reisstap.
3. **10, Lot en zijn dochters (19:30–38).** Die geschiedenis valt binnen Genesis 19 en is in één zin verteld, zonder iets te verzwakken
   (‘zij geven hem wijn en worden zwanger van hun eigen vader’). Is die formulering goed voor 8–14 jaar?
4. **11 en 12 splitsen Genesis 21.** 11 eindigt bij 21:7 (geboorte van Izak), 12 is 21:8–21. De put van Berseba (21:22–34,
   reisstap abraham:20) hoort nu bij geen van de geschiedenissen.
5. **15 laat Genesis 26 weg**, zoals de leidraad (Genesis 25 en 27–28). Ezau’s huwelijk met een dochter van Ismaël (28:6–9) valt
   binnen de verwijzing maar wordt niet apart genoemd.
6. **21, `wie` bevat Mirjam**, net als de reisstap, terwijl Exodus 2 de zus niet bij naam noemt. In de ontdekking staat dat
   uitgelegd. Liever weglaten?
7. **28, titel van de leidraad ‘Bidden helpt!’.** De tekst zegt niet met zoveel woorden dat Mozes bad. Ik heb een beschrijvende
   titel gekozen (‘Mozes met opgeheven handen’); in `betekenis` staat dat opgeheven handen in de Bijbel een gebaar van gebed zijn
   (Psalm 28:2; 1 Timotheüs 2:8). Akkoord?
8. **Chronologie 15–17.** Dat Jakob ongeveer 77 was toen hij vluchtte, is afgeleid (130 jaar bij aankomst in Egypte, Jozef toen ca. 39,
   Jozef geboren na veertien jaar dienst). Dat staat zo in de `tijdNoot`. Bij 12 en 13 is alleen een bandbreedte gegeven
   (de Bijbel noemt de leeftijd van Izak niet).
9. **Dubbel gekoppelde stappen.** uittocht:1 (De tien plagen, Exodus 7–11) hoort bij 24 én 25, omdat Exodus 11 de aankondiging
   van de tiende plaag is. sinai:6 (Exodus 24:12–18; 31:18) hoort bij 29 én 31. begin:1 hoort bij 2 én 3, begin:3 bij 5 én 6.
10. **Woordkeus bij de plagen.** In 24 staan ‘kikvorsen’ en ‘steekvliegen’ (HSV-woorden, ook in de reisstap). De Statenvertaling
    heeft ‘vorsen’ en ‘vermenging van ongedierte’. In citaten staat de SV-tekst. Ook ‘braamstruik’ (SV ‘braambos’) en
    ‘kwartels’ (SV ‘kwakkelen’) volgen de HSV-namen.
11. **SV-citaten met andere naamspelling.** Waar een SV-citaat een naam anders spelt dan de HSV (Habel, Izaak, Rehuel), staat er geen
    citaat maar een omschrijving in eigen woorden. Zo blijven de namen eenduidig.

Bibliotheek: geen nieuwe bouwsteen; deze groep levert alleen inhoud volgens het bestaande schema.
