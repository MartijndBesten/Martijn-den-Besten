# De wereld in die tijd — David en Salomo: bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/david-salomo.json` | de periode: as, bronnen, info, personen, gebeurtenissen, gebieden, steden, koppelingen |
| `scripts/bijbelreis-wereld-koningen.py` | bouwt dit bestand én `israel-assyrie.json`; `--controle` toetst of de bestanden gelijk zijn aan de bouw |
| `scripts/bijbel-controle/wereld-david-salomo.txt` | 41 controleregels tegen de Statenvertaling: alle regeringsjaren en leeftijden en alle korte citaten |
| `tests/bijbelreis-wereld-koningen.test.ts` | unittest (zie `israel-assyrie-bronnen.md`), met de rekensommen van deze periode |

## 1. Keuzes

- **Dit is een reconstructie.** Er is geen onafhankelijk jaartal uit de tijd van David zelf. De jaartallen komen uit de
  Bijbel (Saul, David en Salomo elk veertig jaar: Handelingen 13:21, 2 Samuël 5:4, 1 Koningen 11:42), teruggeteld vanaf
  de scheuring van het rijk in 931/930 v.Chr. volgens de gangbare reconstructie (Thiele), zoals de Bijbelreis overal doet
  (`dateringen.md`: Saul ca. 1050–1010, David 1010–970 met Hebron tot 1003, Salomo 970–930, tempel 966–959). De as heeft
  daarom `status: "benaderd"` (in beeld: ‘bij benadering’) en in ‘Over deze tijdlijn’ staat het uitgelegd.
- **As**: `vchr`, van **1050** tot **920** v.Chr.: van Saul tot net na Sisak (925). **Startjaar 1003** (David koning over
  heel Israël).
- **Levenslijnen alleen uit de Bijbel**: David 30 jaar bij zijn troonsbestijging en 40 jaar koning (2 Samuël 5:4) → leven
  ca. 1040–970, 70 jaar (`leeftijdStatus: berekend`); Rehabeam 41 bij zijn troonsbestijging en 17 jaar koning
  (1 Koningen 14:21) → ca. 971–913. Een geboortejaar staat nergens in de Bijbel: altijd `benaderd`, met ‘De Bijbel noemt
  geen geboortejaar’.
- **Samuël valt binnen de as**: hij stierf toen David op de vlucht was (1 Samuël 25:1), omgerekend 1020–1010. Zijn lijn
  begint vóór de as (roeping ca. 1100, de ruwe schatting van de Bijbelreis bij v48).
- **Hiram**: 980–947 volgens Josephus (naar Menander: 34 jaar). 2 Samuël 5:11 noemt Hiram al bij David kort na de
  verovering van Jeruzalem; dat past niet goed bij 980. Dat staat eerlijk in de opmerking; er is geen oplossing verzonnen.
- **Sisak = Sjosjenk I**: de gangbare opvatting, maar niet onomstreden (Jeruzalem staat niet op de lijst in Karnak; de
  Egyptische jaartallen schuiven: 943–922 of 945–924). Het vijfde jaar van Rehabeam is 926/925.
- **De Tel Dan-steen** (9e eeuw v.Chr., “huis van David”) valt na de as: alleen als context in ‘Over deze tijdlijn’ en bij
  de stad Dan, niet als gebeurtenis.
- **Weinig, maar sterke gegevens**: 10 gebeurtenissen (5 belangrijkste), 9 levenslijnen, 12 steden, 10 gebieden met
  27 sleutels, 13 koppelingen (v50–v62).
- **Bewust niet getekend**: Egypte (het hoort bij Sisak, maar een Egypte-vlak maakte de kaart op de telefoon te klein
  voor Jeruzalem; Egypte staat in de teksten), de koningin van Scheba (ligging en tijd onzeker), de weg ‘tot de rivier’
  (Eufraat) en Tadmor, Gath als stip (botste met Jeruzalem; Gath staat in de tekst van de Filistijnen en bij Goliath).

## 2. Per gegeven: bron, status, onzekerheid

### Gebeurtenissen

| id | jaar | status | bron | onzekerheid |
|---|---|---|---|---|
| saul-koning | 1050 | benaderd | 1 Sam. 10; Hand. 13:21 | teruggerekend; andere schema’s tientallen jaren anders |
| goliath | 1025 | benaderd | 1 Sam. 17 | geen jaar in de Bijbel; plaatsing van de Bijbelreis (onzeker) |
| dood-saul ★ | 1010 | benaderd | 1 Sam. 31:1–6 | gangbare reconstructie |
| david-hebron | 1010 | benaderd | 2 Sam. 2:4, 10–11 | 7 jaar en 6 maanden in Hebron |
| jeruzalem ★ | 1003 | benaderd | 2 Sam. 5:3–9 | — |
| buurvolken | 990, marge 1003–970 | expliciet | 2 Sam. 8; 10–12 | **geen jaar** in de Bijbel; 990 is een plaatsing (Ammon-oorlog in de tijd van Bathseba) |
| salomo-koning | 970 | benaderd | 1 Kon. 1:32–40; 2:10–12 | — |
| tempel ★ | 966–959 | benaderd | 1 Kon. 6:1, 37–38; 5:1–10 | 4e tot 11e jaar van Salomo |
| scheuring ★ | 930, marge 931–930 | benaderd | 1 Kon. 12:1–20; Thiele | — |
| sisak-jeruzalem ★ | 925, marge 926–925 | benaderd | 1 Kon. 14:25–26; Shoshenq I | identificatie gangbaar, niet onomstreden |

### Personen

| id | lijn | van | tot | grondslag |
|---|---|---|---|---|
| samuel | profeet | 1100 benaderd (vóór de as) | 1015 benaderd, marge 1020–1010 | 1 Sam. 25:1 |
| saul | regering | 1050 benaderd | 1010 benaderd | Hand. 13:21 |
| david | leven | 1040 benaderd (geboorte, omgerekend) | 970 benaderd, 70 jaar (berekend) | 2 Sam. 5:4–5; 1 Kon. 2:10–11 |
| nathan | profeet | 1003 benaderd (`begin: genoemd`) | 970 benaderd, einde onbekend | 2 Sam. 7:2; 1 Kon. 1 |
| hiram | regering | 980 benaderd | 947 benaderd, marge 947–946 | Josephus/Menander; 2 Sam. 5:11 (zie boven) |
| salomo | regering | 970 benaderd | 930 benaderd, marge 931–930 | 1 Kon. 11:42 |
| rehabeam | leven | 971 benaderd (geboorte, omgerekend) | 913 benaderd (na de as), 58 jaar | 1 Kon. 14:21 |
| jerobeam | regering | 930 benaderd, marge 931–930 | 909 benaderd (na de as) | 1 Kon. 14:20 (22 jaar) |
| sisak | regering | 943 benaderd | 922 benaderd | Shoshenq I (ook 945–924) |

### Gebieden

Alle sleutels `benaderd`, elk gebied met ‘Grenzen bij benadering’. De buurvolken onder David zijn **geen** deel van
Israël geworden: ze blijven hun eigen kleur houden. Het vlak **‘Onder David en Salomo’** (zand, gestippeld) ligt eroverheen
en betekent “onder gezag, bracht geschenken”.

| gebied | sleutels | grondslag |
|---|---|---|
| israel (salie) | 1050 alle stammen · 1011 · 1010 Isboseth, zonder Juda (2 Sam. 2:9–10) · 1004 · 1003 heel Israël en Juda · 931 · 930 de tien stammen, Benjamin bij Juda (1 Kon. 12:20–21) · 920 | Bijbel; ‘van Dan tot Ber-seba’ |
| juda-hebron (koraal) | 1010 · 1004 | 2 Sam. 2:4, 11 |
| juda (koraal) | 930 · 920 | 1 Kon. 12:20–21 |
| onder-david (zand) | 992 · 990 · 931 | 2 Sam. 8; 12:29–31; 1 Kon. 4:21; 11:14–25 (Hadad, Rezon) |
| filistea (terra), fenicie (kobalt), aram-zoba (oker), ammon (bruin), moab (olijf), edom (rood) | 1050 · 920 (vaste vorm) | Bijbel; liggingen uit `plaatsen.js` |

De unittest legt vast: Sichem in Israël onder Isboseth en na de scheuring; Jeruzalem niet bij Israël in 1010 en 930,
wel in 1003; Hebron en Berseba in Juda (Hebron); Jeruzalem in Juda na 930; Gaza bij de Filistijnen en niet bij Israël;
Tyrus in Fenicië; Rabba in Ammon; Damascus en Zoba in Aram-Zoba (Hamath niet); Rabba en Damascus onder David in 990,
Jeruzalem niet.

### Steden

Alle uit `plaatsen.js`: jeruzalem → `salem`, hebron → `mamre` (‘Hebron · Mamre’), sichem, dan, berseba, gaza, tyrus,
rabba, damascus → `damascusst`, zoba → `dr_zoba`, hamath → `dr_hamath`, ezeongeber. Geen Pleiades nodig.

### Koppelingen

v50–v62, met dezelfde jaren als de Bijbelreis (`tl` van de geschiedenissen) en voor een tijdvak een opmerking.

## 3. Wat een mens inhoudelijk moet nalezen

1. **Het vlak ‘Onder David en Salomo’**: eerlijk genoeg als “onder gezag” zonder harde grens? Wordt het begrepen?
2. **Israël in 1050 inclusief Juda** (Jeruzalem was toen nog van de Jebusieten; dat staat alleen in de opmerking).
3. **Hiram 980–947** naast 2 Samuël 5:11.
4. **Samuël 1100–1015** (ruwe schatting; de lijn begint vóór de as).
5. **Egypte niet op de kaart**: is de uitleg in de teksten voldoende?
6. **De teksten voor kinderen**: toon en eenvoud.

## 4. Licenties

Statenvertaling publiek domein (korte citaten, gecontroleerd); Wikipedia (CC BY-SA 4.0) alleen voor feiten in eigen
woorden; grenzen eigen werk, geen kaart of dataset overgenomen; het boek *Chronologie van de wereldgeschiedenis* is niet
gebruikt.
