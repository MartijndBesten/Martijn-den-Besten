// Welke stap in het Nieuwe Testament krijgt welk tafereel? Aanvulling op taferelen-koppeling.js (daar staat de uitleg);
// de taferelen zelf staan in taferelen-nt.js. Dit bestand voegt alleen toe aan BR.beelden en laat de rest ongemoeid.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  // Bethlehem: het veld van de herders en de ster (Lukas 2; Mattheüs 2)
  "jezus-1:nt-geboorte:6": { t: "herders-veld", tekst: "De herders hielden ’s nachts de wacht over hun kudde, en de heerlijkheid van de Heere omscheen hen (Lukas 2:8–9)." },
  "jezus-1:nt-geboorte:8": { t: "ster-bethlehem", tekst: "De ster ging hun voor en bleef staan boven de plaats waar het Kind was (Mattheüs 2:9)." },
  // De Jordaan in de woestijn van Judea (Mattheüs 3; Johannes 1:28)
  "jezus-1:nt-begin:0": { t: "jordaan-woestijn", tekst: "Johannes preekte in de woestijn van Judea en doopte in de Jordaan (Mattheüs 3:1–6)." },
  "jezus-1:nt-begin:1": { t: "jordaan-woestijn", tekst: "Van Galilea kwam de Heere Jezus naar de Jordaan, naar Johannes, om gedoopt te worden (Mattheüs 3:13)." },
  "jezus-1:nt-begin:3": { t: "jordaan-woestijn", tekst: "Bij de Jordaan, in Bethabara, waar Johannes doopte (Johannes 1:28)." },
  // De put van Jakob bij Sichar (Johannes 4)
  "jezus-1:nt-samaria-nain:1": { t: "jakobsput", tekst: "‘Heere, Gij hebt niet om mede te putten, en de put is diep’ (Johannes 4:11)." },
  "jezus-1:nt-samaria-nain:2": { t: "jakobsput", tekst: "Bij de put van Jakob, onder aan de berg waar de Samaritanen aanbaden (Johannes 4:20)." },
  "jezus-1:nt-samaria-nain:3": { t: "jakobsput", tekst: "De vrouw liet haar waterkruik staan en ging de stad in (Johannes 4:28)." },
  // Het meer van Galilea: de schepen, de storm, het net (Markus 1 en 4; Mattheüs 13; Johannes 21)
  "jezus-1:nt-galilea:1": { t: "vissersboot", tekst: "Zij lieten meteen hun netten liggen en volgden Hem (Markus 1:18)." },
  "jezus-1:nt-galilea:7": { t: "vissersboot", tekst: "Hij ging in een schip zitten, en de hele menigte stond op de oever (Mattheüs 13:2)." },
  "jezus-1:nt-galilea:8": { t: "storm-stil", tekst: "De golven sloegen in het schip. Toen ging de wind liggen en het werd helemaal stil (Markus 4:37–39)." },
  "jezus-3:nt-opstanding:5": { t: "net-vol", tekst: "Het net was vol grote vissen, en op de oever lag een kolenvuur met vis en brood (Johannes 21:9–11)." },
  "jezus-3:nt-opstanding:6": { t: "net-vol", tekst: "Na het eten bij het kolenvuur vroeg de Heere Jezus aan Petrus: ‘Hebt gij Mij lief?’ (Johannes 21:15)." },
  // Vijf broden en twee vissen (Johannes 6)
  "jezus-2:nt-brood-en-berg:1": { t: "broden-vissen", tekst: "Vijf gerstebroden en twee visjes; en twaalf korven vol brokken bleven over (Johannes 6:9–13)." },
  // Jericho: de wilde vijgenboom (Lukas 19)
  "jezus-2:nt-reis-naar-jeruzalem:11": { t: "vijgenboom", tekst: "Zacheüs klom in een wilde vijgenboom langs de weg, om de Heere Jezus te zien (Lukas 19:4)." },
  // De week van het lijden. Sober: de weg, de hof, het graf. Bij Golgotha (jezus-3:nt-lijden:6 en 7) staat bewust geen beeld.
  "jezus-3:nt-lijdensweek:0": { t: "intocht-weg", tekst: "Zij spreidden hun kleren op de weg; anderen hakten takken van de bomen (Mattheüs 21:8)." },
  "jezus-3:nt-lijdensweek:7": { t: "gethsemane", tekst: "Een plaats die Gethsémané heet: een hof over de beek Kedron (Mattheüs 26:36)." },
  "jezus-3:nt-lijdensweek:8": { t: "gethsemane", tekst: "Judas kende die plaats ook: de Heere Jezus was daar dikwijls met Zijn discipelen (Johannes 18:2)." },
  "jezus-3:nt-lijden:8": { t: "graf-dicht", tekst: "Een nieuw graf in een hof, uitgehouwen in de rots, met een grote steen voor de ingang (Mattheüs 27:60)." },
  // De opstanding en de hemelvaart
  "jezus-3:nt-opstanding:0": { t: "graf-open", tekst: "Heel vroeg, toen de zon opging, zagen zij dat de steen was afgewenteld (Markus 16:2–4)." },
  "jezus-3:nt-opstanding:1": { t: "graf-open", tekst: "Vroeg, toen het nog donker was, zag Maria Magdalena dat de steen van het graf was weggenomen (Johannes 20:1)." },
  "jezus-3:nt-opstanding:8": { t: "olijfberg-wolk", tekst: "Een wolk nam Hem weg van hun ogen, op de Olijfberg bij Jeruzalem (Handelingen 1:9–12)." },
  // Handelingen
  "handelingen:nt-gemeente:0": { t: "pinksterhuis", tekst: "Een geluid als van een geweldige wind vervulde het hele huis, en er waren tongen als van vuur (Handelingen 2:2–3)." },
  "handelingen:nt-paulus:0": { t: "damascus-licht", tekst: "Dicht bij Damascus omscheen hem plotseling een licht uit de hemel (Handelingen 9:3)." },
  "handelingen:nt-paulus:10": { t: "gevangenis-filippi", tekst: "Door de aardbeving gingen alle deuren open en raakten de boeien van allen los (Handelingen 16:26)." },
  "handelingen:nt-paulusrome:5": { t: "malta-schip", tekst: "Het voorschip zat vast en het achterschip brak door het geweld van de golven (Handelingen 27:41)." },
  "handelingen:nt-paulusrome:6": { t: "malta-vuur", tekst: "Een groot vuur vanwege de regen en de kou; uit de takken kwam een adder (Handelingen 28:2–3)." },
  // Openbaring
  "openbaring:nt-openbaring:0": { t: "kandelaren", tekst: "‘Ik zag zeven gouden kandelaren’: dat zijn de zeven gemeenten (Openbaring 1:12, 20)." },
});
