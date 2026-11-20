# De wereld in die tijd — Israël, Juda en Assyrië: bronnen en verantwoording

Peildatum: 17 november 2026. Alle webbronnen zijn op die dag geraadpleegd.

| Bestand | Wat |
|---|---|
| `public/bijbelreis/wereld/perioden/israel-assyrie.json` | de periode: as, bronnen, info, personen, gebeurtenissen, gebieden, steden, koppelingen |
| `scripts/bijbelreis-wereld-koningen.py` | bouwt dit bestand én `david-salomo.json` (teksten, data en de grenzen als bouwstenen); `--controle` toetst of de bestanden gelijk zijn aan de bouw (Python met `shapely`) |
| `scripts/bijbel-controle/wereld-israel-assyrie.txt` | 48 controleregels tegen de Statenvertaling: alle regeringsjaren en ijkpunten uit de Bijbel en alle korte citaten |
| `tests/bijbelreis-wereld-koningen.test.ts` | unittest: datamodel, status en bron overal, verwijzingen, geldige ringen, steden in het juiste rijk per jaar, de getallen nagerekend, citaten letterlijk SV |

## 1. Keuzes

- **As**: `vchr`, van **880** tot **681** v.Chr. Begin: vlak vóór Achab (874) en de Assyrische opmars naar het westen.
  Einde: de dood van Sanherib (2 Koningen 19:37), het laatste wat de Bijbel over deze Assyrische koningen vertelt.
  **Startjaar 722** (de val van Samaria).
- **Chronologie**: dezelfde keuzes als de rest van de Bijbelreis (`public/bijbelreis/dateringen.js`,
  `docs/bijbelreis-audit/dateringen.md`): de regeringsjaren uit de Bijbel, vastgezet met de gangbare reconstructie van
  Thiele en de Assyrische ijkpunten 853 (Qarqar) en 841 (Jehu). Achab 874–853, Jehu 841–814, Jerobeam II 793–753,
  Samaria 722, Hizkia 715–686, Sanherib voor Jeruzalem 701. De Assyrische jaartallen komen uit de koningslijst
  (eponiemenlijsten).
- **Jehu 841 of 842**: de Bijbelreis volgt Thiele (Jehu 841–814; Athalia 841 bij v65). Albright rekent 842–815. Het
  verschil komt uit de manier van tellen (met of zonder het eerste, onvolledige regeringsjaar). In de laag: ‘Over deze
  tijdlijn’ → ‘Jehu: 841 of 842?’.
- **Weinig, maar sterke gegevens**: 9 gebeurtenissen (5 belangrijkste), 13 levenslijnen, 9 steden, 6 gebieden met
  34 sleutels, 8 koppelingen.
- **Wat bewust niet in de laag staat** (te weinig grond of te vol voor 8–14 jaar): de koningen van Juda vóór Hizkia
  (Josafat, Joas, Uzzia, Jotham, Achaz; alleen in teksten), Omri en de koningen tussen Jehu en Hosea, Asurnasirpal II,
  Esar-haddon als lijn, het aantal ballingen, de omvang van Israël onder Jerobeam II (‘van den ingang van Hamath’, alleen
  als tekst), Karkemis (pas in 717 Assyrisch), Asdod als provincie, de veldtochten van Sanherib buiten Juda.

## 2. Per gegeven: bron, status, onzekerheid

Statussen: `historisch` = onafhankelijk (buiten de Bijbel) bevestigd; `expliciet` = staat zo in de Bijbel (hier: zonder
jaartal); `berekend` = afgeleid uit Bijbelse getallen; `benaderd` = reconstructie met onzekerheid.

### Gebeurtenissen

| id | jaar | status | bron | onzekerheid |
|---|---|---|---|---|
| qarqar ★ | 853 | historisch | Kurkh-monoliet (Wikipedia ‘Battle of Qarqar’); Shalmaneser III | staat niet in de Bijbel; een andere lezing van de eponiemenlijst geeft 854 |
| jehu-schatting ★ | 841 | historisch | Zwarte Obelisk (British Museum ME 118885); Shalmaneser III | staat niet in de Bijbel; Jehu of een gezant; enkelen lezen Joram |
| jona-nineve ★ | 793–753 (tijdvak) | expliciet | Jona 3:3–10; 2 Koningen 14:25 | **geen jaar** in de Bijbel; alleen ‘in de tijd van Jerobeam II’ |
| pul | 743, marge 745–738 | benaderd | 2 Koningen 15:19–20; Tiglath-Pileser III | jaar van de schatting van Menahem verschilt per reconstructie |
| damascus-valt | 732 | historisch | 2 Koningen 16:7–9; 15:29; Tiglath-Pileser III | — |
| samaria-valt ★ | 722, marge 723–721 | benaderd | 2 Koningen 17:5–6; 18:9–10; Shalmaneser V (Babylonische kroniek); Sargon II | Salmaneser of Sargon; Thiele 723/722 |
| asdod | 711 | historisch | Jesaja 20:1; Sargon II | — (de enige plaats waar de Bijbel Sargon noemt) |
| sanherib-jeruzalem ★ | 701 | historisch | 2 Koningen 18:13–19:36; Sanheribs annalen, reliëfs van Lachis | dat het leger in één nacht werd geslagen staat alleen in de Bijbel (2 Koningen 19:35): geen beeld, geen figuur |
| dood-sanherib | 681 | historisch | 2 Koningen 19:36–37; Sennacherib; koningslijst | — |

★ = `belangrijk: true`. Jona: alleen wat de Bijbel zegt (de opdracht, de prediking, de bekering, Gods genade) en wat
historisch vaststaat (Ninevé was een grote stad aan de Tigris; de hoofdstad was in die tijd Kalhu, pas onder Sanherib
Ninevé). Geen speculatie over een jaar, een zonsverduistering of een plaag.

### Personen (levenslijnen)

| id | lijn | van | tot | grondslag en onzekerheid |
|---|---|---|---|---|
| salmanassar-iii | regering | 859 historisch | 824 historisch | koningslijst; niet in de Bijbel |
| achab | regering | 874 benaderd | 853 benaderd | 22 jaar (1 Kon. 16:29); sneuvelde volgens Thiele in het jaar van Qarqar |
| elia | profeet | 874 benaderd (`begin: genoemd`) | 850 benaderd, **weggenomen** | geen geboortejaar; ‘voer … ten hemel’ (2 Kon. 2:11), jaar omgerekend zoals de Bijbelreis bij Elisa |
| elisa | profeet | 850 benaderd | 795 benaderd | opvolger van Elia; stierf onder Joas van Israël (2 Kon. 13:14–20) |
| jehu | regering | 841 benaderd | 814 benaderd | 28 jaar (2 Kon. 10:36); zie 841/842 hierboven |
| jerobeam-ii | regering | 793 benaderd | 753 benaderd | 41 jaar (2 Kon. 14:23), met medeheerschap |
| tiglatpileser-iii | regering | 745 historisch | 727 historisch | = Pul (Babylonische koningslijst) |
| hosea-koning | regering | 732 benaderd, marge 732–731 | 722 benaderd, marge 723–721, einde onbekend | 9 jaar (2 Kon. 17:1); gevangengezet (17:4) |
| salmanassar-v | regering | 727 historisch | 722 historisch | — |
| sargon-ii | regering | 722 historisch | 705 historisch | sneuvelde in Klein-Azië |
| hizkia | regering | 715 benaderd | 686 benaderd | 14e jaar = 701 (2 Kon. 18:13); 29 jaar (18:2); 18:1 en 18:9–10 passen niet eenvoudig (in ‘Over’) |
| sanherib | regering | 705 historisch | 681 historisch | — |
| jesaja | profeet | 740 benaderd, marge 740–739 | 701 benaderd, einde onbekend | sterfjaar van Uzzia (Jes. 6:1); laatst genoemd bij Hizkia (2 Kon. 20) |

### Gebieden (per sleutel)

Alle sleutels `benaderd`; elk gebied heeft een `opmerking` die met ‘Grenzen bij benadering’ begint. Getekend zijn de
gebieden die Assyrië zelf bestuurde; schatplichtige koninkrijken (Juda, Tyrus, de Filistijnen) houden hun eigen kleur.

| gebied | sleutels | grondslag |
|---|---|---|
| assyrie (grijs) | 880 kernland en Jezira tot de Chabur · 857 · 856 tot de Eufraat (Til Barsip) · 741 · 738 + Noord-Syrië en de kust tot Simirra (Arpad 740, provincies 738) · 733 · 732 + Damascus, Galilea, Gilead (twee delen: Hamath ligt ertussen) · 723 · 722 + Samaria · 721 · 720 + Hamath (met Qarqar) · 681 | koningslijst; Til Barsip; Tiglath-Pileser III; 2 Kon. 15:29; 16:9; 17:6; Sargon II |
| israel (salie) | 880 met Gilead · 842 · 814 zonder Gilead (Hazaël, 2 Kon. 10:32–33) · 798 · 782 Gilead terug (2 Kon. 13:25; 14:25) · 733 · 732 alleen het bergland rond Samaria (2 Kon. 15:29) · 723 · 722 einde | Bijbel; het jaar van het verlies en het herstel van Gilead staat er niet (‘in die dagen’) |
| juda (koraal) | 880 · 681 | van Mizpa tot Berseba, met Lachis; in 701 vielen de vaste steden, Juda bleef |
| aram (oker) | 880 met Basan en Ramoth (1 Kon. 22:3) · 842 · 814 + Gilead · 798 · 782 · 733 · 732 einde | 2 Kon. 10:32–33; 16:9 |
| fenicie (kobalt) | 880 · 681 | Tyrus en Sidon met hun kuststrook; schatplichtig, eigen koningen |
| egypte (lila) | 880 · 681 | **alleen het noorden** (Nijldelta tot de Fajoem), als rand van de kaart |

De unittest legt vast dat Ninevé, Kalhu en Assur in elke sleutel bij Assyrië liggen en Jeruzalem in geen enkele;
Damascus pas vanaf 732, Samaria vanaf 722, Hamath en Qarqar vanaf 720 (niet in 741); Samaria in elke sleutel van
Israël; Gath-Hefer (Galilea) in 733 wel en in 732 niet meer bij Israël; Jeruzalem en Lachis in Juda.

### Steden

`plaatsId` uit `plaatsen.js` (ligging daaruit, de test bewaakt gelijkheid): nineve → `ninivest`, assur → `assur`,
samaria → `samaria`, jeruzalem → `salem`, damascus → `damascusst`, hamath → `dr_hamath`, tyrus → `tyrus`.
Zonder `plaatsId`, met ligging uit **Pleiades** (CC BY 3.0): Kalhu/Nimrud (36,100 N; 43,332 O; Pleiades 894019) en
Qarqar/Tell Qarqur (35,742 N; 36,331 O; Pleiades 995604669). Lachis, Asdod, Joppe en Gath-Hefer zijn bewust geen stip op
de kaart (te dicht bij Jeruzalem en Samaria: de namen en klikvlakken botsten); de gebeurtenissen van 701 (Lachis) en
711 (Asdod) lichten daar wel op.

### Koppelingen naar verhalen

| verhaal | jaar | waarom |
|---|---|---|
| v63 Elia en de profeten van Baäl | 874–853 | tijd van Achab; jaar van de Karmel staat er niet |
| v64 Naäman wordt genezen | 850–795 | tijd van Elisa; de koning van Israël in 2 Kon. 5 heeft geen naam |
| v65 Joas wordt koning in de tempel | 841–796 | Athalia vanaf het jaar van Jehu; Joas 40 jaar |
| v66 Samaria valt | 722 | 2 Kon. 17:6 |
| v67 Hizkia bidt | 701 | Sanherib in het 14e jaar van Hizkia |
| v69, v70 Jona | 793–753 | tijd van Jerobeam II (2 Kon. 14:25) |
| v72 Troost voor Gods volk | 740–700 | de dagen van Jesaja (Jes. 1:1) |

v68 (Josia, 622–609) valt buiten deze as en hoort bij geen enkele periode.

## 3. Wat een mens inhoudelijk moet nalezen

1. **De grenzen**, vooral Assyrië 880 (tot de Chabur) en 738 (Noord-Syrië en de kust), Aram met Basan en Ramoth, en de
   geleidelijke overgang van Gilead tussen Israël en Aram (814–782; de Bijbel geeft geen jaren).
2. **Elia 874–850 en Elisa 850–795**: plaatsingen, overgenomen van de Bijbelreis (v63, v64). 2 Kronieken 21:12 noemt nog
   een brief van Elia aan Joram van Juda; dat is hier niet uitgewerkt.
3. **Pul 743 (745–738)**: het jaar van de schatting van Menahem.
4. **Jesaja tot 701**: laatst genoemd bij Hizkia; hij kan langer geleefd hebben.
5. **De teksten voor kinderen**: toon en eenvoud; Qarqar en de Zwarte Obelisk staan erin als ‘de Bijbel vertelt dit
   niet’ (open punt 3 van het ontwikkelplan: zo gekozen).

## 4. Licenties

- **Statenvertaling**: publiek domein; alleen korte letterlijke citaten tussen ‘…’, gecontroleerd met `data/statenvertaling`.
- **Wikipedia** (Engels, CC BY-SA 4.0): alleen feiten en jaartallen, in eigen woorden; geen tekst overgenomen.
- **Pleiades** (Kalhu, Qarqar): CC BY 3.0; naamsvermelding staat in `bronnen` en in de legenda van de kaart.
- **plaatsen.js** (Bijbelreis): zie `docs/bijbelreis-audit/plaatsen.md`.
- **Grenzen**: eigen werk; geen kaart of grensdataset gebruikt. Het boek *Chronologie van de wereldgeschiedenis* is niet
  gebruikt.

## 5. Controleren

```sh
python3 scripts/bijbelreis-wereld-koningen.py --controle                          # JSON gelijk aan de bouw
python3 scripts/bijbel-check.py scripts/bijbel-controle/wereld-israel-assyrie.txt  # 48 regels tegen de Statenvertaling
npx vitest run tests/bijbelreis-wereld-koningen.test.ts                           # datamodel, verwijzingen, ringen, rekenwerk
```
