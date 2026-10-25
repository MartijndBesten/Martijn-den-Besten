# Verslag groep nt-1: geschiedenissen 80–99

Bestanden:

- `public/bijbelreis/inhoud/nt-jezus-1.js`: nieuw boek `jezus-1` ("De Heere Jezus: geboorte en Galilea", `nt: true`) met drie delen:
  - `nt-geboorte` "Geboorte en jeugd" (12 stappen, ca. 7 v.Chr. – 8 n.Chr.)
  - `nt-begin` "Doop, woestijn en eerste tekenen" (6 stappen, ca. 27–29 n.Chr.)
  - `nt-galilea` "Rond het meer van Galilea" (11 stappen, ca. 28–30 n.Chr.)
  Elk deel heeft een speurtocht (3 tap, 7–8 mc, 1 ord), `trips`, `tijd`/`tl`/`tijdNoot`, kruisverwijzingen en context.
- `public/bijbelreis/geschiedenissen/nt-1.js`: 20 records (nr. 80–99) en 7 kernwoorden (engelen, aanbidden, satan, wonder, wedergeboorte, hart, koninkrijk-van-god).
- `public/bijbelreis/plaatsen/nt-1.js`: 2 nieuwe plaatsen (beide `c: "o"`, punt illustratief).
- `scripts/bijbel-controle/nt-1.txt`: 780 controleregels, alle geslaagd (`python3 scripts/bijbel-check.py scripts/bijbel-controle/nt-1.txt` → 0 mis).

Controles: `node --check` op alle drie de JS-bestanden; `dump.cjs` loopt zonder fouten; alle stapsleutels, plaats-ids,
tussenpunten en tik-ids bestaan; alle verwijzingen (stappen, delen, cross, why, beelden, verbanden, kernwoorden) bestaan in de
SV (zelfde lezer als de app); `npx vitest run tests/bijbelreis.test.ts` groen; `node scripts/bijbelreis-check.mjs` geeft
"Geen problemen gevonden". Alle als SV-citaat opgemaakte aanhalingen zijn letterlijk vergeleken met de SV-tekst (weglatingen met …).

## Per nummer

| nr | titel (eigen) | status | stappen | vorm / ontdek | kw |
| --- | --- | --- | --- | --- | --- |
| 80 | Zacharias en de engel in de tempel | uitgewerkt, gecontroleerd | nt-geboorte:0 | plek / wiezei | engelen |
| 81 | De engel bij Maria en de droom van Jozef | uitgewerkt, gecontroleerd | nt-geboorte:1, 2, 3 | route / koppel | |
| 82 | De geboorte van Johannes de Doper | uitgewerkt, gecontroleerd | nt-geboorte:4 | plek / wiezei | |
| 83 | De geboorte van de Heere Jezus in Bethlehem | uitgewerkt, gecontroleerd | nt-geboorte:5 | route / kaart | |
| 84 | De herders bij de kribbe | uitgewerkt, gecontroleerd | nt-geboorte:6, 7 | plek / onthul | aanbidden |
| 85 | De wijzen uit het oosten en de vlucht naar Egypte | uitgewerkt, gecontroleerd | nt-geboorte:8, 9, 10 | route / verbanden | |
| 86 | De Heere Jezus op twaalfjarige leeftijd in de tempel | uitgewerkt, gecontroleerd | nt-geboorte:11 | route / volgorde | |
| 87 | De doop van de Heere Jezus in de Jordaan | uitgewerkt, gecontroleerd | nt-begin:0, 1 | plek / onthul | |
| 88 | De Heere Jezus verzocht in de woestijn | uitgewerkt, gecontroleerd | nt-begin:2 | plek / koppel | satan |
| 89 | De eerste discipelen volgen de Heere Jezus | uitgewerkt, gecontroleerd | nt-begin:3, nt-galilea:0, 1 | plek / stamboom | |
| 90 | Water wordt wijn op de bruiloft in Kana | uitgewerkt, gecontroleerd | nt-begin:4 | plek / volgorde | |
| 91 | Genezingen in Kapernaüm | uitgewerkt, gecontroleerd | nt-galilea:2, 3 | plek / koppel | wonder |
| 92 | De Bergrede: horen en doen | uitgewerkt, gecontroleerd | nt-galilea:4 | plek / gelijkenis (twee bouwers) | |
| 93 | Nikodemus komt ’s nachts bij de Heere Jezus | uitgewerkt, gecontroleerd | nt-begin:5 | plek / wiezei | wedergeboorte |
| 94 | De Heere Jezus stilt de storm | uitgewerkt, gecontroleerd | nt-galilea:8 | route / volgorde | |
| 95 | De man met het legioen boze geesten | uitgewerkt, gecontroleerd | nt-galilea:9 | plek / onthul | |
| 96 | De knecht van de hoofdman wordt genezen | uitgewerkt, gecontroleerd | nt-galilea:5 | plek / kaart | hart |
| 97 | De zondares in het huis van Simon | uitgewerkt, gecontroleerd | nt-galilea:6 | plek / koppel | |
| 98 | De dochter van Jaïrus wordt opgewekt | uitgewerkt, gecontroleerd | nt-galilea:10 | plek / volgorde | |
| 99 | De gelijkenis van de zaaier | uitgewerkt, gecontroleerd | nt-galilea:7 | gelijkenis / gelijkenis (uitleg van de Heere Jezus, 13:18–23) | koninkrijk-van-god |

Stapsleutels hebben de vorm `jezus-1:<deel>:<index>`. Alle stappen zijn nieuw (het boek was leeg).

## Nieuwe stappen en routes

- **nt-geboorte**: tempel (Zacharias) · Nazareth (Gabriël) · Nazareth (droom Jozef) · Nazareth → stad in Juda (recon) ·
  geboorte Johannes · Nazareth → Bethlehem (Lukas 2:4, recon via de bergrug) · herders · Bethlehem → tempel (Simeon en Anna, recon) ·
  Jeruzalem → Bethlehem (wijzen, Mattheüs 2:9; geen beginpunt ‘uit het oosten’) · Bethlehem → Egypte (recon langs de kust) ·
  Egypte → Nazareth (recon, kust en Megiddo) · Nazareth → Jeruzalem op twaalfjarige leeftijd (recon, door het Jordaandal).
- **nt-begin**: Johannes de Doper · Nazareth → Jordaan (recon) · Jordaan → woestijn (recon) · eerste discipelen (Johannes 1, SV-nummering) ·
  Jordaan → Kana (recon) · Kana → Kapernaüm → Jeruzalem (Johannes 2:12–13, recon) met Nikodemus.
- **nt-galilea**: Nazareth → Kapernaüm (Mattheüs 4:13, recon) · roeping aan het meer · sabbat in Kapernaüm · verlamde door het dak ·
  Bergrede · hoofdman · zondares (geen punt, alleen beeld van Galilea) · zaaier (plek bij het meer, geen route) ·
  storm: Kapernaüm → overkant (recon) · Gadarener · terug naar Kapernaüm (recon, Jaïrus).

## Nieuwe plaatsen (`plaatsen/nt-1.js`)

- `nt1_judagebergte` "Stad in het bergland van Juda" (`o`): Lukas 1:39 noemt geen naam; punt op Ein Karem (traditie; coördinaat
  van Ein Karim uit OpenBible, CC BY 4.0).
- `nt1_bergrede` "Berg van de Bergrede" (`o`): Mattheüs 5:1 noemt geen naam; punt op de traditionele heuvel bij Tabgha (geen
  OpenBible-identificatie; punt illustratief).

## Twijfelpunten voor Martijn

1. **Naam ‘Elisabeth’.** De opdracht noemde "Elisabeth" voor `who`; de HSV schrijft *Elisabet* (SV: *Elizabet*). Ik heb overal
   "Elisabeth" gebruikt voor eenduidigheid met de andere groepen. Kiezen: Elisabeth of Elisabet (HSV)?
2. **Volgorde Lukas 2 / Mattheüs 2.** Het deel volgt een gangbare harmonie: geboorte → herders → Simeon en Anna → wijzen → Egypte →
   Nazareth. Lukas 2:39 (terug naar Nazareth na de voorstelling) en Mattheüs 2 zijn niet expliciet op elkaar afgestemd; ik heb
   daarom geen route voor Lukas 2:39 getekend.
3. **Nikodemus in de sectie `galilea`.** De leidraad zet nr. 93 tussen de Galilese geschiedenissen; de stap staat chronologisch
   (Johannes 2:13–3:21) in het deel `nt-begin` in Jeruzalem. De sectie is `galilea` gelaten volgens de nummering (87–108).
4. **Volgorde in `nt-galilea`.** Markus is aangehouden (zaaier vóór de storm, Markus 4:35 ‘op denzelfden dag’). De leidraad
   heeft de zaaier als laatste (nr. 99).
5. **Jaïrus in Kapernaüm.** De Bijbel noemt zijn stad niet; Kapernaüm is gekozen op grond van Mattheüs 9:1 (‘Zijn stad’) en
   Mattheüs 4:13. In de fact van de stap staat dat dit een reconstructie is.
6. **Zondares (Lukas 7:36–50).** Geen stad genoemd: de stap heeft geen punt (`at: []`) maar een `view` op Galilea. Graag
   controleren of dit in de app goed oogt.
7. **Bethabara/Bethanië.** De SV leest in Johannes 1:28 ‘Bethabara’; de bestaande plaats `nt_doopplaats` heet "Bethanië over
   de Jordaan". In de deel-`stat` staat beide uitgelegd.
8. **Wijzen.** Geen beginpunt en geen terugroute (‘door een anderen weg … naar hun land’): alleen Jeruzalem → Bethlehem.
9. **SV-versnummering** is gevolgd en waar nodig benoemd: Micha 5:2 (nieuwere vertalingen 5:1), Jesaja 9:2 en 9:6 (9:1, 9:5),
   Johannes 1:35–51 (vanaf vers 38 één vers verschoven), Psalm 34:19 (34:18).
10. **Datering.** Alle jaartallen zijn reconstructies met `tijdNoot` (geboorte ca. 6–4 v.Chr. vanwege de dood van Herodes;
    optreden ca. 27–30 n.Chr., met vermelding van de alternatieve chronologie rond 30–33 n.Chr.).
11. **Kleuren in `BR.personen`.** `Jozef` had al de kleur van de aartsvader Jozef (koraal); niet veranderd. Nieuwe sleutels o.a.
    `Jezus` (kobalt), `Maria` (lila), `Johannes de Doper` (olijf); andere NT-groepen kunnen dezelfde sleutels zetten (laatste wint).
12. **Kindermoord in Bethlehem.** Volgens de SV (‘al de kinderen … van twee jaren oud en daaronder’) verteld, zonder afzwakking;
    de HSV leest ‘alle jongens’. Eventueel gelijktrekken.
