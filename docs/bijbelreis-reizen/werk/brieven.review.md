# Redactieverslag `brieven` (Romeinen–Filemon; 1 Petrus 1:1)

Tweede lezer, november 2026. Elke stap, de intro, `stat`, `cross`, `tijdNoot`, de wie-regels, de speurtocht, de zes plaatsen (`br_…`) en de zes personen zijn zin voor zin naast de Statenvertaling gelegd (`node scripts/sv.mjs`). Namen zijn vergeleken met de HSV-tekst op herzienestatenvertaling.nl.

## Hersteld

| Waar | Oud | Nieuw | Grond |
| --- | --- | --- | --- |
| Stap 1, weetje (Febe) | ‘Dat Febe de brief meenam, staat er ook niet letterlijk. Uitleggers leiden het af uit haar aanbeveling.’ | ‘… staat er ook niet; uitleggers leiden het af uit haar aanbeveling. Het staat wel in het onderschrift dat in de Statenvertaling onder de brief staat, maar die onderschriften zijn later toegevoegd. Ook dat zij uit Kenchreeën vertrok en welke weg zij nam, zegt de brief niet: de lijn op de kaart is een reconstructie.’ | Romeinen 16:1–2 zegt alleen dat Rome haar moet ontvangen. ‘Niet letterlijk’ suggereerde dat het er wel ongeveer staat. Het onderschrift (Romeinen 16:27 in de controletekst: ‘gezonden door Febe’) ziet de lezer in zijn eigen Statenvertaling; daarom genoemd |
| `trips` | ‘Kenchreeën → Rome (Febe)’ | ‘Kenchreeën → Rome (Febe; reconstructie)’ | zelfde reden |
| Stap 2, weetje | – | toegevoegd: toen Paulus de tweede brief schreef, was hij nog niet in Korinthe aangekomen: ‘ik ben ten derden male gereed, om tot u te komen’ (2 Korinthe 12:14) | de lijn loopt door tot Korinthe; in de brieven is dat laatste stuk nog een voornemen |
| Stap 3, `txt` | ‘aan de gemeenten in de streek Galatië’ | ‘aan de gemeenten in Galatië’ | ‘streek’ kiest tegen de provincie; het weetje zegt juist dat uitleggers daarover verschillen |
| Stap 8, weetje (Timotheüs) | ‘… eindigt hij in Rome (…). Of Timotheüs over land of over zee moest reizen, zegt de brief niet.’ | ‘… eindigt hij in Rome, waar Onesiforus Paulus vond (…). De lijn laat zien wat Paulus vraagt; of Timotheüs de reis gemaakt heeft, en over land of over zee, zegt de Bijbel niet.’ | de lijn is een gevraagde reis, geen reis die de Bijbel vertelt |
| Stap 9, weetje (Titus) | – | toegevoegd: ‘De lijn laat zien wat Paulus vraagt; of Titus de reis gemaakt heeft, zegt de Bijbel niet.’ | idem (Titus 3:12) |
| `trips` | ‘Troas → Rome (Timotheüs)’; ‘Kreta → Nikopolis (Titus)’ | ‘… (Paulus vraagt Timotheüs te komen)’; ‘… (Paulus vraagt Titus te komen)’ | idem |

Controleregels toegevoegd in `scripts/bijbel-controle/brieven.txt` (kopje ‘Redactie’).

## Nagezocht

- **Namen in de wie-lijst en de stappen volgens de HSV**: Febe, Kenchreeën, Tertius, Gajus, Tychikus, Epafroditus, Onesimus, Filemon, Archippus, Onesiforus, Karpus, Artemas, Zenas, Silvanus, Nikopolis, Kolosse, Hiërapolis, Kreta, Kappadocië, Bithynië: alle zo in de HSV. Geen wijzigingen.
- **Onderschriften**: de controletekst heeft ze aan het slot van de brieven (Romeinen 16:27, 1 Korinthe 16:24 ‘vanuit Filippi’, Efeze 6:24, Filippenzen 4:23, Kolossenzen 4:18, 1 en 2 Thessalonicenzen ‘vanuit Athene’, 1 Timotheüs 6:21, 2 Timotheüs 4:22, Titus 3:15 ‘Nicopolis in Macedonië’, Filemon 1:25). Ze worden nergens als Bijbeltekst aangehaald; `tijdNoot` zegt dat ze later zijn toegevoegd. Dat is de gangbare opvatting in de naslagwerken die ik zag; een bron die het ontstaan precies dateert, heb ik niet nagekeken.
- **Nikopolis**: meer steden met die naam; meestal denkt men aan Nicopolis in Epirus (door Augustus gesticht na Actium). Klopt met het weetje en met `c: "w"`.
- **Provincie Galatië** (stap 3, weetje): zie het verslag van `nt-paulus3`; blijft staan.
- **Datering**: Claudius en Gallio zie `nt-paulus2`. Nero 54–68 n.Chr. klopt. Dat Paulus onder Nero stierf, staat er als ‘oude overlevering’; zo laten staan.

## Bewust laten staan

- De lijn Kenchreeën → Rome zelf (stap 1). Het weetje zegt nu ronduit dat de Bijbel niet zegt dat Febe de brief bracht, dat zij uit Kenchreeën vertrok of welke weg zij nam. Of de lijn dan nog op de kaart hoort, is een besluit voor de redactie (zie hieronder).
- De lijnen Troas → Rome en Kreta → Nikopolis: gevraagde reizen; nu zo benoemd in weetje en `trips`.
- ‘Paulus schrijft twee brieven aan de gemeente in Korinthe’: de Bijbel heeft er twee; 1 Korinthe 5:9 noemt een eerdere brief, maar dat valt buiten deze stap.
- Wie-regel Tychikus begint het citaat met een hoofdletter (‘De geliefde broeder …’) waar de Statenvertaling een kleine letter heeft; de citaattest staat een hoofdletter aan het begin toe.
- ‘Silvanus is hoogstwaarschijnlijk dezelfde als Silas’: als waarschijnlijkheid gebracht, met de grond erbij.

## Voor de menselijke redacteur

1. **Febe-lijn**: houden of schrappen? Alles wat de lijn draagt, is de aanbeveling in Romeinen 16:1–2. Schrappen kan zonder de tekst te raken (dan vervalt ook de eerste regel van `trips`).
2. **Datering ‘ca. 50–67’**: wie de brief aan de Galaten vóór het apostelconvent plaatst, komt enkele jaren eerder uit (ca. 48–49). Dat heb ik niet in een bron nagezocht en daarom niet toegevoegd; de redactie kan overwegen de ondergrens ruimer te noemen.
3. **Stap 2**: de lijn Efeze → Troas → Macedonië → Korinthe combineert een voornemen (1 Korinthe 16:5–8), een verslag (2 Korinthe 2:12–13; 7:5) en de aankomst die alleen Handelingen 20:2–3 vertelt. Het weetje zegt dat nu; de redactie kan overwegen de lijn in Macedonië te laten eindigen.
4. **Stap 6**: de lijn Kolosse → Laodicea is ‘de weg van de brief’ (Kolossenzen 4:16); dat de brief zelf of een afschrift ging, zegt de tekst niet.
