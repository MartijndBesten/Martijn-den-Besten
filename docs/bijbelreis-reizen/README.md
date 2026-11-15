# Bijbelreis: meer reizen en plaatsen (november 2026)

Opdracht van Martijn (15-11-2026): zoveel mogelijk plaatsen en reizen van mensen uit de Bijbel, feitelijk en met de Bijbel als basis, met duidelijke overzichten.

Dit bestand is de overdracht: wie verder werkt (Claude, Codex of een mens) begint hier.

## 1. Wat er is

| Onderdeel | Waar |
| --- | --- |
| Schrijfopdracht voor een nieuw reisdeel | [`schrijfopdracht.md`](schrijfopdracht.md) |
| Statenvertaling per vers opvragen | `node scripts/sv.mjs "Handelingen 17:1–9"` |
| Plaats opzoeken in OpenBible | `OBI_DATA=<map> python3 -I scripts/reizen/plaats-zoek.py --exact "Berea"` (de data zelf staat niet in de repository: `scripts/reizen/obi/` is uitgesloten; download `ancient.jsonl` en `modern.jsonl` van OpenBible.info Bible Geocoding Data) |
| Notities van de schrijver per deel | `werk/<deel-id>.notities.md` |
| Verslag van de tweede lezer per deel | `werk/<deel-id>.review.md` |
| Controlebestand per deel | `scripts/bijbel-controle/<deel-id>.txt` |
| Overzichten in de app | knoppen ‘Alle reizen’ en ‘Alle plaatsen’ (`renderReizen`, `renderPlaatsen` in `public/bijbelreis/app.js`) |

## 2. De nieuwe reisdelen

| Deel-id | Boek in de app | Bijbelgedeelte |
| --- | --- | --- |
| `ur-kanaan` | Genesis | Genesis 11:27–12:5 (losse, uitgebreide route; apart gepubliceerd) |
| `jakob-jabbok` | Genesis | Genesis 32 (vers voor vers, ingezoomd op de Jabbok; met een tafereel per stap) |
| `kies-het-leven` | Numeri en Deuteronomium | Deuteronomium 30:11–20 (losse, uitgebreide route; apart gepubliceerd) |
| `stammen` | Jozua | Jozua 13–22 |
| `ehud-jefta` | Richteren | Richteren 3:7–31; 10:6–12:7 |
| `davids-rijk` | 2 Samuël | 2 Samuël 5:17–25; 8; 10 |
| `scheuring` | 1 Koningen | 1 Koningen 11:26–14:31 |
| `jehu` | 2 Koningen | 2 Koningen 8:7–15; 8:25–10:36 |
| `asa` | 2 Kronieken | 2 Kronieken 14–16 |
| `hizkia-josia` | 2 Kronieken | 2 Kronieken 29–35 |
| `jeremia-egypte` | Profeten | Jeremia 41–44 |
| `nt-samaria-nain` | Jezus (1) | Johannes 4; Lukas 4:16–30; 7:11–17 |
| `nt-over-de-grens` | Jezus (2) | Markus 7:24–8:26 |
| `nt-paulus2` | Handelingen | Handelingen 17:1–18:22 |
| `nt-paulus3` | Handelingen | Handelingen 18:23–20:38 |
| `brieven` | De brieven (nieuw boek) | Romeinen–Filemon; 1 Petrus 1:1 |

## 3. Werkwijze

1. **Schrijven.** Eén schrijver per deel, in een eigen git-worktree en branch, volgens de schrijfopdracht.
2. **Samenvoegen.** Dubbele plaatsen en personen worden één (Tob, de stamgebieden, Othniël); kleuren van delen in hetzelfde boek verschillen.
3. **Tweede lezer.** Een aparte redacteur legt elk deel zin voor zin naast de Statenvertaling, controleert de buitenbijbelse weetjes bij bronnen en schrijft een verslag.
4. **Controles** (alles moet slagen): zie §7 van de schrijfopdracht, daarna `npx playwright test e2e/bijbelreis.spec.ts --trace off` en `sh scripts/visueel.sh` (referentiebeelden alleen bijwerken na bekijken).
5. **Publiceren**: zie [`../bijbelreis-audit/releases.md`](../bijbelreis-audit/releases.md).

**Wat ‘gecontroleerd’ betekent:** automatisch gecontroleerd en door een aparte AI-redacteur nagelezen tegen de Statenvertaling. Geen theoloog of andere menselijke redacteur heeft ernaar gekeken.

## 4. Vaste regels

- Bestaande stappen nooit verplaatsen, tussenvoegen of verwijderen: de voortgang van gebruikers hangt aan `boek:deel:index`. Nieuwe delen met een nieuw id zijn veilig.
- Geen Bijbeltekst in de app, behalve korte letterlijke aanhalingen tussen ‘ ’; verwijzingen als ‘Lees in je Bijbel: …’.
- Plaatsen alleen met coördinaten uit OpenBible; zekerheid volgens de score; geen punt verplaatsen om de kaart mooier te maken.
- Een deel zonder eigen geschiedenis onder de 150 heeft geen A- en B-vragen; Samen speuren gebruikt dan de meerkeuzevragen van het deel met twee antwoorden.

## 5. Ideeën voor volgende reizen

Nog niet gedaan, wel geschikt (duidelijke plaatsen in de tekst):

- Genesis 14 (de veldtocht van de vier koningen) en Genesis 24 als eigen deel;
- Numeri 20–21 en 33 (de legerplaatsen);
- 1 Samuël 4–7 (de ark bij de Filistijnen);
- 1 Koningen 15–16 en 20–22 (Baësa, Omri, Achab);
- 2 Koningen 3 en 11–14;
- Ezra 7–8 en Nehemia 2–3;
- Handelingen 8–11 uitgebreider (Filippus, Petrus in Lydda, Joppe en Caesarea).

## 6. Open punten voor een menselijke redacteur

De tweede lezers hebben hersteld wat aantoonbaar fout was. Deze punten zijn een keuze en staan per deel in `werk/<deel-id>.review.md`:

- **Gedalja of Gedalia.** De HSV schrijft Gedalia (Jeremia 41 en 43); de app heeft overal Gedalja, ook in bestaande delen. Niet gewijzigd.
- **Handelingen 19:5** (`nt-paulus3`): nu letterlijk aangehaald, met in het weetje dat uitleggers verschillen over wie hier gedoopt worden.
- **Richteren 11** (`ehud-jefta`): de gelofte van Jefta staat er met beide lezingen, zonder keuze. De toegevoegde zin “Of Jefta deze gelofte had mogen doen, zegt Richteren 11 niet” kan weg als de redactie dat liever heeft.
- **2 Koningen 9:22** (`jehu`): ‘hoererijen’ staat nu letterlijk in de tekst, met de uitleg in het weetje.
- **De lijn van Febe** (`brieven`, Kenchreeën → Rome): rust alleen op Romeinen 16:1–2; het weetje zegt dat erbij. Schrappen kan zonder de tekst te raken.
- **Zekerheid van Bezer en Zereda**: nu `o` (score onder de 500); terug naar `w`/`b` kan zonder de tekst te wijzigen.
- **Statenvertaling en HSV lopen uiteen** in 2 Samuël 8:4, 8:18 en 10:18 en in 2 Koningen 8:10. De tekst volgt de Statenvertaling of vertelt alleen wat in beide staat.
- **Buitenbijbelse weetjes**: bevestigd via naslagwerken; de catalogus van het British Museum en enkele wetenschappelijke uitgaven waren niet bereikbaar. Waar dat speelde, is de formulering voorzichtiger gemaakt.
