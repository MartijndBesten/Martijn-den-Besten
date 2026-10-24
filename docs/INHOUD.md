# Inhoud wijzigen

Alle teksten staan in gewone TypeScript-bestanden. Wijzig, commit en push naar `main`: de site wordt automatisch opnieuw gebouwd en gepubliceerd (zie [DEPLOYMENT.md](DEPLOYMENT.md)).

| Wat | Bestand |
| --- | --- |
| Officiële mededelingen (homepage) | `src/content/announcements.ts` |
| Statistieken, tijdlijn, paginatitels en -beschrijvingen | `src/content/site.ts` |
| Ideeën, domeinnamen, plannen, Bureau-dossiers | `src/content/generators.ts` |
| Museumzalen en objecten | `shared/museum.ts` |
| Missies, verrassingen, certificaatteksten | `src/content/progress.ts` |
| Tekst ‘Over Martijn’ | `src/pages/Over.tsx` |
| Kleuren en lettertypen | `src/styles/global.css` (bovenaan, `:root`) |

## Voorbeelden

**Nieuwe mededeling** — voeg een regel toe aan `ANNOUNCEMENTS`:

```ts
{ dept: "Directie", stamp: "BESLOTEN", text: "Er is besloten een besluit te nemen." },
```

**Nieuw museumobject** — voeg een object toe aan de juiste zaal in `shared/museum.ts`. Geef het een unieke `id` (alleen kleine letters en streepjes) en een willekeurig `seed`-getal: daarmee wordt automatisch een abstract kunstwerk gegenereerd. Stemmen op het nieuwe object werkt direct; de worker accepteert alleen ID's uit deze lijst.

**Statistiek aanpassen** — wijzig `value` of `note` in `STATS`. Laat de disclaimer staan dat de cijfers fictief zijn.

## Na het wijzigen

```bash
npm run check   # typecheck + tests + build
git commit -am "Nieuwe mededelingen" && git push
```
