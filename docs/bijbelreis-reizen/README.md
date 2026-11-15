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
