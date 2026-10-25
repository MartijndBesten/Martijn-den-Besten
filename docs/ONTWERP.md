# Ontwerpsysteem ‘Octrooibureau’

De site ziet eruit als het archief van een overdreven officieel instituut: elk idee krijgt een octrooitekening. De humor zit in de details (callouts, schaal ‘1 : ongeveer’, stempel ‘Ok.’), het ontwerp zelf is rustig en volwassen.

## Kleuren

| Token | Waarde | Gebruik |
| --- | --- | --- |
| `--ivory` | `#f3ecdf` | Achtergrond |
| `--paper` | `#ece3d2` | Platen, panelen |
| `--ink` | `#1a2033` | Tekst, lijnen, donkere vlakken |
| `--indigo` | `#4a4f8c` | Accent (spaarzaam), serieuze modus |
| `--terra` / `--terra-deep` | `#b65a3a` / `#9a4529` | Hoofdaccent. Kleine tekst altijd in `--terra-deep` (contrast) |
| `--sage` | `#8a9a7b` | Accent, tandwielen, ‘voltooid’ |
| `--oker` | `#c2913a` | Accent op donker, lampen, koper |
| `--tint-*` | | Lichte vlakken voor zalen en panelen |

Regel: per tekening hooguit één of twee accentkleuren. Grote vlakken in tinten, nooit in volle accentkleur (behalve indigo-paneel en inktsecties).

## Typografie

- **Instrument Serif**: koppen, cijfers, citaten; cursief voor accenten (`<em>` kleurt automatisch terracotta).
- **Geist**: lopende tekst en knoppen.
- **Geist Mono**: labels, fig.-nummers, metadata (klein, kapitalen, ruime spatiëring).

## Illustratiesysteem

- `IdeaMachine` (FIG. 1): interactieve hoofdtekening.
- `MiniFig`: kleine octrooitekeningen (knop, sokkel, lamp, ticket, certificaat, zandloper, vitrine, tandwiel, kalender, sleutel).
- `Artwork`: procedurele octrooiplaten per museumobject (seed in `shared/museum.ts`).
- Lijnen: 1–1,4 px inkt, arcering via SVG-patronen, constructielijnen gestippeld.

## Beweging

Alleen beweging met een functie:

- `.reveal`: elementen schuiven één keer rustig binnen bij scrollen.
- `.draw` op een SVG: lijnen worden één keer ‘getekend’ zodra de tekening in beeld komt.
- Scroll stuurt de tandwielen en de lopende band van FIG. 1 en schuift de hero-typografie licht mee.
- Hover/focus licht onderdelen van tekeningen op; klikken produceert iets.

Alles respecteert `prefers-reduced-motion`.

## Geheime nachtdienst

De Konami-code zet `data-theme="nacht"` op `<html>`: een donker inktblauw palet met oker accent. Alle kleuren lopen via tokens, dus nieuwe componenten werken automatisch mee.
