# Redactieverslag `nt-paulus2` (Handelingen 17:1–18:22)

Tweede lezer, november 2026. Elke stap, de intro, `stat`, `cross`, `tijdNoot`, de wie-regels, de speurtocht, de plaatsen (`p2_…` en de gedeelde `nt_…`) en de personen zijn zin voor zin naast de Statenvertaling gelegd (`node scripts/sv.mjs`). Namen zijn vergeleken met de HSV-tekst op herzienestatenvertaling.nl (Handelingen 17 en 18).

## Hersteld

| Waar | Oud | Nieuw | Grond |
| --- | --- | --- | --- |
| Stap 1, `txt` (17:7) | ‘ze zeggen dat er een andere Koning is, Jezus’ (leest alsof de aanklagers dat zelf zeggen) | ‘volgens hen gaan zij in tegen de geboden van de keizer en zeggen zij dat er een andere Koning is, Jezus’ | 17:7: de beschuldiging is dat Paulus en de zijnen dit zeggen en ‘tegen de geboden des keizers’ doen |
| Stap 3, `txt` en `who` (17:18) | ‘Epicureïsche en Stoïsche wijsgeren’ | ‘Enkele epicurische en stoïsche wijsgeren’ | HSV: ‘enige epicurische en stoïsche wijsgeren’; de tekst zegt ‘sommigen van’ |
| Stap 3, `txt` (17:18) | ‘Anderen denken dat hij vreemde goden verkondigt’ | ‘Anderen zeggen dat hij een verkondiger van vreemde goden lijkt te zijn’ | de tekst zegt wat zij zeiden, niet wat zij dachten |
| Stap 4, weetje; plaats `p2_areopagus`; persoon `dionysius` | ‘de raad van Athene’ | ‘een raad in Athene’ | Athene had meer dan één raad; ‘de raad’ is te stellig |
| Stap 7, weetje; `tijdNoot` | ‘Daaruit volgt dat hij omstreeks 51–52 … stadhouder was’; ‘het belangrijkste vaste punt’ | ‘Daaruit leidt men af …’; ‘een van de belangrijkste vaste punten’ | de inscriptie noemt de 26e acclamatie van Claudius (januari 51 – augustus 52); het ambtsjaar is een afleiding |
| Wie-regel Gallio | ‘Een inscriptie uit Delphi laat zien …’ | ‘… (niet in de Bijbel) …’ | buitenbijbels gegeven in een regel met een Bijbelverwijzing |
| Stap 9, weetje (18:22) | ‘de Statenvertaling vult aan: naar Jeruzalem’ | toegevoegd: ‘(in de uitgave van 1637 staan die woorden tussen haakjes, als aanvulling)’ | nagekeken, zie hieronder |
| Plaats `p2_amfipolis`, `d` | ‘bij de monding van de rivier de Strymon’ | ‘aan de rivier de Strymon’ | ‘bij de monding’ heb ik niet kunnen bevestigen (de stad ligt aan de rivier, een eind van de kust); alleen de rivier blijft staan |
| Plaats `nt_kenchreeen` (gedeeld), `d` | ‘Paulus scheepte hier in naar Syrië’ | ‘Hier liet Paulus zijn hoofd scheren, vóór de vaart naar Syrië’ | 18:18 noemt Kenchreeën alleen bij het scheren van het hoofd; dat hij daar inscheepte, staat er niet |
| Persoon `priscilla` | alias ‘Priska’ | alias ‘Priska’, ‘Prisca’; ‘(Herziene Statenvertaling: Prisca)’ | HSV 2 Timotheüs 4:19 schrijft Prisca |

Controleregels toegevoegd in `scripts/bijbel-controle/nt-paulus2.txt` (kopje ‘Redactie’).

## Nagezocht (buitenbijbels, Grieks)

- **18:22, ‘naar Jeruzalem’ is een aanvulling**: bevestigd. In de Statenvertaling van 1637 (DBNL-editie) staat ‘ginck hy op [na Ierusalem]’, met haakjes; de tekstweergave op herzienestatenvertaling.nl markeert de woorden in de Statenvertaling eveneens als toegevoegd. De bewering in het weetje klopt dus.
- **Politarchen**: bevestigd dat in Thessaloniki inscripties met die titel gevonden zijn (onder meer de steen van de Vardarpoort, nu in het British Museum). De pagina van het museum zelf was niet te openen; de bevestiging komt uit naslagpagina’s.
- **Aratus**: geboren in Soli in Cilicië, ca. 315/310–240 v.Chr.; regel 5 van de Phaenomena is de aangehaalde regel. ‘Derde eeuw voor Christus’ en ‘uit Cilicië’ kloppen.
- **Suetonius en Claudius**: Suetonius (Claudius 25) noemt de verdrijving zonder jaar; het jaar 49 komt van Orosius (vijfde eeuw) en is omstreden. De tekst zei dat al voorzichtig; niet gewijzigd.
- **Gallio-inscriptie uit Delphi**: brief van Claudius, gedateerd in zijn 26e acclamatie (januari 51 – augustus 52); meestal: ambtsjaar zomer 51 – zomer 52. ‘Omstreeks 51–52’ blijft staan.

## Bewust laten staan

- ‘Vandaar gaat hij op naar Jeruzalem’ (stap 9) en de titel ‘Via Jeruzalem naar Antiochië’: zo de Statenvertaling en de HSV; het weetje zegt dat de woorden een aanvulling zijn.
- Dat Paulus (en niet Aquila) de gelofte deed (stap 8): het weetje noemt de andere lezing.
- De zeeroute Berea–Athene: als reconstructie benoemd.
- ‘Justus … Niet dezelfde als Jozef Barsabas’ (`personen.js`): de Bijbel zegt het niet met zoveel woorden, maar de een is een godvrezende in Korinthe, de ander een discipel in Jeruzalem.
- Citaten in ‘elders’ en in wie-regels beginnen soms met een hoofdletter waar de Statenvertaling een kleine letter heeft (begin van de zin); de citaattest staat dat toe.

## Voor de menselijke redacteur

1. Stap 1 en stap 3 hebben zeven lange zinnen; inhoudelijk klopt alles, maar voor jonge lezers is het veel.
2. ‘Probeert hij Joden en Grieken tot het geloof te bewegen’ (18:4): de Statenvertaling zegt ‘bewoog tot het geloof’, de HSV ‘probeerde … te overtuigen’. Laten staan (HSV-lezing).
3. Het weetje bij stap 9 noemt nu de haakjes van 1637; wie dat te technisch vindt, kan de toevoeging tussen haakjes schrappen zonder dat de rest verandert.
