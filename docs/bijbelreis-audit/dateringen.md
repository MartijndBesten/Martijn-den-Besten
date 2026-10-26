# Dateringen in de Bijbelreis: controle en indeling (26 oktober 2026)

De Bijbel rekent in levensjaren en regeringsjaren, niet in onze jaartelling. Elk jaartal in de Bijbelreis is daarom
omgerekend. Tot 3.1 stond bij een geschiedenis bijvoorbeeld ‘Exodus 14:1–15:21 · ca. 1446 v.Chr.’, zonder enige
kwalificatie. Dat leek een vaststaand feit. Dat is het niet.

## Drie dingen die we uit elkaar houden

| Label in de atlas | Betekenis | Voorbeelden |
| --- | --- | --- |
| **Bijbelse tijdrekening** | Het jaartal is uitgerekend met getallen uit de Bijbel, zoals leeftijden, ‘480 jaar’ (1 Kon. 6:1) en ‘430 jaar’ (Ex. 12:40). Er wordt teruggeteld vanaf een later ijkpunt. De volgorde en de tussenpozen komen uit de Bijbel. Het jaartal zelf hangt af van hoe je rekent. | aartsvaders, Mozes tot Jozua, richters, Ruth, Samuël, Saul |
| **Historische reconstructie** | Het jaartal is vastgezet met bronnen buiten de Bijbel, samen met de gegevens uit de Bijbel. Denk aan Assyrische en Babylonische kronieken, Perzische koningslijsten, Romeinse keizers en Josephus. | David en Salomo (via Thiele), de koningen, ballingschap, terugkeer, Nieuwe Testament |
| **onzeker** (extra label) | Onderzoekers komen tot duidelijk verschillende jaartallen. | uittocht ca. 1446 of in de 13e eeuw; kruisiging 30 of 33 n.Chr.; Openbaring ca. 95 of ca. 68 |
| **geen jaartal** | Genesis 1–11 geeft geen datum in onze jaartelling. | schepping tot Babel |

De volledige indeling staat in `public/bijbelreis/dateringen.js`: per deel, en per geschiedenis als reeks nummers. Een
unittest (`tests/bijbelreis.test.ts`, ‘grond van de jaartallen’) bewaakt drie dingen:

- elk gedateerd deel en elke gedateerde geschiedenis heeft een soort en een toelichting;
- de reeksen overlappen niet;
- uittocht, aartsvaders, richters en kruisiging staan als onzeker gemarkeerd.

## Waar het te zien is

- **Geschiedenis.** Onder de titel staat een regel ‘Wanneer?’ met het jaartal en de labels, bijvoorbeeld ‘ca. 1446 v.Chr. · Bijbelse tijdrekening · onzeker’. ‘Hoe weten we dat?’ klapt de toelichting open en legt de labels uit.
- **Reis.** Het kruimelpad toont het jaartal van het deel met dezelfde labels. Bij de boekkeuze staat een korte grond, bijvoorbeeld ‘ca. 1526–1445 v.Chr. · berekend, onzeker’.
- **Tijdlijn.** Elk deel heeft dezelfde labels. De legenda bovenaan legt de vier labels uit.

## Controle van de getallen

De jaartallen volgen één samenhangende rekenwijze: de ‘vroege’ uittocht via 1 Koningen 6:1, met de gangbare
koningschronologie (Thiele) als ijkpunt. Gecontroleerd zijn de onderstaande waarden.

**Aartsvaders**

| Waarde | Grond |
| --- | --- |
| Abraham geboren ca. 2166 | 1446 + 430 = 1876 (Jakob naar Egypte, 130 jaar oud) → Jakob geboren 2006 → Izak geboren 2066 (Izak 60) → Abraham geboren 2166 (Abraham 100) |
| Abraham † 1991 | Abraham werd 175 |
| Izak † 1886 | Izak werd 180 |
| Jakob † 1859 | Jakob werd 147 |
| Jozef geboren 1915, † 1805 | Jakob was 91 bij Jozefs geboorte; Jozef werd 110 |
| Jozef verkocht 1898 | Jozef was 17 |
| Jakob bij Laban 1929–1909 | twintig jaar |

**Uittocht en intocht**

| Waarde | Grond |
| --- | --- |
| Mozes geboren 1526 | Mozes was 80 bij de uittocht |
| Mozes vlucht 1486 | Mozes was 40 |
| Intocht 1406 | 40 jaar na de uittocht |
| Tempelbouw 966–959 | 4e tot 11e jaar van Salomo |

**Koningen en ballingschap**

| Waarde | Grond |
| --- | --- |
| Saul ca. 1050–1010; David 1010–970 (Hebron 7½ jaar → 1003); Salomo 970–930 | regeringsjaren |
| Achab 874–853 | — |
| Athalia en Joas 841–796 | — |
| Jerobeam II 793–753 (Jona) | — |
| Hizkia 715–686; Sanherib 701 | — |
| Samaria valt 722 | sommigen: 723/721 |
| Josia 622–609 | Megiddo 609 |
| Daniël 605 | — |
| Jeruzalem valt 586 | sommigen: 587 |
| Jojachin vrij 561 | — |
| Babel valt 539 | — |
| Kores 538 | — |
| Darius 520 | — |
| Tempel klaar 515 | sommigen: 516 |
| Xerxes 483 en 474–473 | — |
| Ezra 458 | — |
| Nehemia 445–433 | — |

**Nieuwe Testament**

| Waarde | Grond |
| --- | --- |
| Herodes † ca. 4 v.Chr. | — |
| Tiberius, 15e jaar | ca. 28/29 n.Chr. |
| Pilatus | 26–36 n.Chr. |
| Herodes Agrippa I † | 44 n.Chr. |
| Festus | ca. 59 n.Chr. |
| Paulus' reizen | 46–48 en 49–50 n.Chr. |
| Rome | 60–62 n.Chr. |
| Openbaring | ca. 95 n.Chr. (Irenaeus) of ca. 68 |

**Rechtgezet: twee interne ongelijkheden**

- Geschiedenis 76 zei ‘ca. 538–516 v.Chr.’, het deel *Terugkeer en tempel* ‘ca. 538–515’. Ezra 6:15 wijst op Adar in het zesde jaar van Darius I, meestal 515 v.Chr. Beide zeggen nu 515. De toelichting noemt 516 als alternatief.
- Het deel *Wegvoering* zei ‘ca. 725–560 v.Chr.’, maar de tijdlijn en de toelichting gebruiken 561 (Jojachin vrij). De tekst zegt nu 561.

**Niet veranderd.** De gekozen rekenwijze zelf (de vroege uittocht) is niet veranderd. De toelichtingen noemden de
13e-eeuwse datering al. Wat ontbrak, was dat de zichtbare regel dat ook liet merken.

## Bekende grenzen

- Een reeks per geschiedenis (bijv. 118–135 ‘historie, onzeker’) is grover dan per verhaal. Binnen elke reeks zijn de toelichtingen gelijksoortig nagekeken.
- ‘Historische reconstructie’ betekent niet ‘zeker’. Bij David en Salomo verschillen schema's enkele jaren. Daar staat geen ‘onzeker’-label, omdat de marge klein is ten opzichte van het jaartal. De toelichting noemt het verschil wel.
