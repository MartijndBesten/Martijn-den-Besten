# Review van het deel `scheuring` (1 Koningen 11:26–14:31)

Tweede lezer, 15 november 2026. Elke stap, de intro, `stat`, `cross`, `tijdNoot`, de vier wie-regels, de speurtocht en de
twee plaatsen zijn zin voor zin naast de Statenvertaling gelegd (`node scripts/sv.mjs`). Buitenbijbelse gegevens en de
HSV-spelling zijn online nagezocht (bronnen onderaan).

## Hersteld

| # | Waar | Oud | Nieuw | Grond |
| --- | --- | --- | --- | --- |
| 1 | stap 5 (12:32–33), `txt` | ‘Ook bedenkt hij zelf een feest’ | ‘Ook maakt hij een feest zoals het feest in Juda, maar op de vijftiende dag van de achtste maand’ | 12:32: ‘gelijk het feest, dat in Juda was’; alleen de **maand** heeft hij ‘uit zijn hart verdacht’ (12:33). |
| 2 | stap 5, weetje | ‘Het feest in Juda was het Loofhuttenfeest’ (als feit) | ‘Welk feest … is, zegt de tekst niet. Uitleggers denken aan het Loofhuttenfeest: dat begon op de vijftiende dag van de zevende maand (Leviticus 23:34)’ | De tekst noemt de naam niet; het is een afleiding uit de datum. |
| 3 | stap 4 (12:18), `txt` en weetje | ‘die over de schatting gaat (het verplichte werk voor de koning)’ | ‘die over de herendienst gaat, het verplichte werk voor de koning’; in het weetje: het woord komt uit de HSV, de Statenvertaling zegt ‘over de schatting was’ | HSV 12:18 heeft ‘herendienst’ (nagezocht); zo staat de uitleg niet meer als onbenoemde toevoeging in de vertelling. Ook in `personen.js` (`adoram`). |
| 4 | stap 2, weetje (`fs: h`) | lijst ‘van plaatsen in Kanaän waar zijn leger was geweest. Jeruzalem is in het bewaarde deel … niet te lezen.’ | lijst ‘van plaatsen in en rond Kanaän, bij een afbeelding van zijn overwinningen. Een deel van de namen is verloren gegaan; in wat bewaard is, staat Jeruzalem niet.’ | De lijst (Bubastis-poort, Karnak) is een overwinningslijst; dat het leger overal ‘geweest was’, zegt de bron niet. |
| 5 | stap 1, weetje | ‘de meeste uitleggers’ (Benjamin als twaalfde stuk) | ‘veel uitleggers’ | Er zijn meer verklaringen; ‘de meeste’ is niet te staven. Het stond al als uitleg (`fs: u`), niet als feit. |
| 6 | `tijdNoot` | ‘Andere schema’s verschillen enkele jaren.’ | ‘… wijken daarvan af, tot ongeveer tien jaar (Albright: de scheuring ca. 922 v.Chr.)’ | Thiele 931/930, Albright 922: negen jaar verschil. |
| 7 | stap 7 (13:33), `txt` | ‘zijn verkeerde weg’ | ‘zijn slechte weg’ | Statenvertaling: ‘zijn bozen weg’; ‘verkeerd’ verzacht het oordeel van de tekst. |
| 8 | stap 8 (14:17), `txt` | ‘De vrouw gaat terug naar Tirza’ | ‘De vrouw gaat heen en komt in Tirza’ | De tekst zegt niet dat zij uit Tirza vertrok (alleen ‘ga naar uw huis’, 14:12). |
| 9 | stap 5 (12:25), `txt` | ‘bouwt Pniël’ | ‘bouwt Penuel (Pniël)’ | HSV en Statenvertaling hebben hier Penuel/Penuël; de kaart noemt de plaats Pniël (Genesis 32:30). |
| 10 | `sc_zereda` | `c: "b"`, bron ‘Betwist …’ | `c: "o"`, bron ‘Onzeker. Meest genoemd: Deir Ghassaneh (441) …’ | Beste score 441 (onder 500) en tweede 203: geen twee ‘serieuze’ kandidaten. Gelijk aan de keuze bij Dal Zefatha (488 → `o`) en Beth-Heked (380 → `o`). Coördinaten ongewijzigd; `alt` blijft als gegeven staan (wordt alleen bij `b` getekend). |

## Bewust laten staan

- **Sisak = Sjosjenq I**: staat er als opvatting (‘De meeste onderzoekers zien in hem …’), niet als feit. Dat Sisak de eerste bij
  naam genoemde koning van Egypte in de Bijbel is, klopt (1 Koningen 11:40).
- **Het twaalfde stuk**: staat als uitleg (`fs: u`), met ‘De tekst legt dat hier niet uit’.
- **Wiens kleed** (11:29–30): de vertelling laat het open, zoals de tekst.
- **‘om te offeren’** (13:1; Statenvertaling ‘om te roken’): eigen woorden, inhoudelijk juist.
- **Speurtocht**: alle acht goede antwoorden kloppen met de verwijzing; de foute zijn aantoonbaar fout. ‘De ark van het
  verbond’ bij Sisak: de ark is er later nog (2 Kronieken 35:3).
- **Datering** 931–910 (Thiele) met ‘ca.’ en de grond erbij.
- **Tirza `v`** (OpenBible 834), ca. 10 km van Sichem (nagerekend: 9,8 km).

## Voor de menselijke redacteur

1. `sc_zereda` staat nu op `o`. Wie de twee voorstellen (Deir Ghassaneh en Ain Seridah, 3,7 km uit elkaar) toch als
   ‘betwist’ wil tonen, zet `c` terug op `b`; de `alt` staat er nog.
2. Het weetje bij stap 4 is nu deels een woorduitleg (herendienst/schatting) in een weetje met `fs: "b"`.
3. Stappen 3, 6, 7 en 8 hebben acht of negen zinnen (de schrijver meldde dit al); niet ingekort.
4. Overlap met `salomo` stap 7–8 (zelfde gedeelte, andere routekeuze voor Jerobeams terugreis): niet aangeraakt.

## Bronnen (geraadpleegd 15 november 2026)

- Herziene Statenvertaling, 1 Koningen 12: https://herzienestatenvertaling.nl/teksten/1koningen/12
- Bubastis-poort in Karnak, lijst van Sjosjenq I: https://en.wikipedia.org/wiki/Bubastite_Portal
- Koningsdata (Thiele, Albright, Galil, Kitchen): https://en.wikipedia.org/wiki/Kings_of_Israel_and_Judah
- OpenBible.info Bible Geocoding Data (Zeredah 1, Tirzah), lokaal via `scripts/reizen/plaats-zoek.py`.
