// Koppelingen van de derde reeks taferelen (taferelen-3.js) aan stappen. Velden en afspraken: taferelen-koppeling.js en
// docs/bijbelreis-taferelen/README.md. Dit bestand wordt ná de andere koppelingen geladen en voegt alleen toe; het vervangt
// alleen een koppeling die bewust leeg was (genesis:jozef:2: daar paste het standaardbeeld van een put niet, de kuil was leeg).
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  "genesis:begin:0": { t: "schepping", tekst: "God maakte de twee grote lichten en de sterren, de vissen in de zee en de vogels (Genesis 1:16–21)." },
  "genesis:begin:1": { t: "eden", tekst: "Een rivier ging uit Eden om de hof te bewateren, en werd tot vier hoofden (Genesis 2:10)." },
  "genesis:abraham:12": { t: "sterren", tekst: "‘Zie nu op naar den hemel, en tel de sterren, indien gij ze tellen kunt’ (Genesis 15:5)." },
  "genesis:abraham:23": { t: "put-nahor", tekst: "De knecht deed de tien kemelen nederknielen buiten de stad, bij een waterput (Genesis 24:10–11)." },
  "genesis:jozef:2": { t: "kuil-karavaan", tekst: "De kuil was leeg; een reisgezelschap van Ismaëlieten kwam uit Gilead (Genesis 37:24–25)." },
  "genesis:jozef:6": { t: "farao-droom", tekst: "Zeven vette en zeven magere koeien, zeven volle en zeven dunne aren (Genesis 41:2–7)." },
  "exodus:uittocht:1": { t: "duisternis", tekst: "Een dikke duisternis over Egypte, maar bij Israël was het licht in hun woningen (Exodus 10:22–23)." },
  "exodus:sinai:7": { t: "gouden-kalf", tekst: "Het gegoten kalf met een altaar ervoor; de tafelen verbroken beneden aan den berg (Exodus 32:4–5, 19)." },
  "numeri:woestijn:3": { t: "druiventros", tekst: "Een tros wijndruiven, gedragen met tweeën op een draagstok (Numeri 13:23)." },
  "numeri:moab:0": { t: "ezelin", tekst: "In een pad der wijngaarden, met een muur aan weerszijden, ging de ezelin liggen (Numeri 22:24–27)." },
  "1samuel:samuel:1": { t: "lamp-silo", tekst: "Samuël had zich neergelegd eer de lamp Gods werd uitgedaan (1 Samuël 3:3)." },
  "2koningen:elisa:4": { t: "naaman", tekst: "Naäman doopte zich zevenmaal in de Jordaan, en hij werd rein (2 Koningen 5:14)." },
  "2koningen:ballingschap:1": { t: "watergang", tekst: "Hizkia leidde het water van Gihon beneden naar het westen der stad Davids (2 Kronieken 32:30)." },
  "daniel:daniel:3": { t: "beeld-droom", tekst: "Een beeld van goud, zilver, koper, ijzer en leem; een steen sloeg het aan de voeten (Daniël 2:32–34)." },
  "jezus-1:nt-begin:4": { t: "kana", tekst: "Zes stenen watervaten, gevuld tot boven toe; het water werd wijn (Johannes 2:6–9)." },
  "jezus-1:nt-galilea:4": { t: "rots-zand", tekst: "Het huis op de steenrots viel niet; het huis op het zand viel, en zijn val was groot (Mattheüs 7:24–27)." },
  "jezus-2:nt-feesten-jeruzalem:0": { t: "bethesda", tekst: "Het badwater Bethesda bij de Schaapspoort, hebbende vijf zalen (Johannes 5:2–3)." },
  "jezus-2:nt-reis-naar-jeruzalem:1": { t: "herberg", tekst: "De Samaritaan bracht hem in de herberg en gaf de waard twee penningen (Lukas 10:34–35)." },
  "jezus-2:nt-reis-naar-jeruzalem:4": { t: "zwijnen", tekst: "Hij werd gezonden om de zwijnen te weiden, en begeerde de draf die zij aten (Lukas 15:15–16)." },
  "jezus-3:nt-lijden:1": { t: "haan", tekst: "Rond het vuur op de binnenplaats; en terstond kraaide de haan (Lukas 22:55, 60)." },
});
