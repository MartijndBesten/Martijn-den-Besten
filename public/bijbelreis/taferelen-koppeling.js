// Welke stap krijgt welk tafereel? Dit staat hier en niet in de inhoudsbestanden, zodat tekenaars en schrijvers
// elkaar niet in de weg zitten. Motor: taferelen.js (BR.tafereel.van); regels: docs/bijbelreis-taferelen/README.md.
//
// BR.beelden["<boek>:<deel>:<stapindex>"] = { t: "<tafereel-id>", tekst: "één korte zin bij het beeld (verwijzing)." }
//   · De sleutel is de stapsleutel uit app.js (boek.id + ":" + deel.id + ":" + index, index vanaf 0).
//   · Een koppeling gaat vóór het standaardbeeld en werkt ook bij een stap mét reis.
//   · t: "" betekent: bij deze stap bewust geen beeld (het standaardbeeld zou hier niet kloppen met de tekst).
//   · Een sleutel van een stap die (nog) niet bestaat, wordt stil overgeslagen.
//   · De tekst eindigt op een verwijzing tussen haakjes; tests/bijbelreis-taferelen.test.ts controleert dat ze bestaat.
// BR.beeldSoort["<plaats-id>"] = "<soort>" | "" | ["<soort>", "<plaats-id voor de naam>"]
//   · Alleen voor het standaardbeeld: een andere soort dan het veld t van de plaats, of "" voor geen standaardbeeld.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  // De ark en de boog (Genesis 8–9)
  "genesis:begin:3": { t: "ararat-ark", tekst: "Het water nam af en de ark rustte op de bergen van Ararat (Genesis 8:3–4)." },
  "genesis:begin:4": { t: "ararat-boog", tekst: "De boog in de wolken is het teken van Gods verbond met de aarde (Genesis 9:13)." },
  // De toren van Babel (Genesis 11:1–9)
  "genesis:begin:5": { t: "babel", tekst: "Zij bouwden een stad en een toren van tichelstenen, maar zij hielden op met bouwen (Genesis 11:3–8)." },
  // Ur en Haran: de stad aan de rivier (Genesis 11:27–12:4)
  "genesis:ur-kanaan:0": { t: "stad-rivier", tekst: "Ur der Chaldeeën, de stad waar Terach met zijn zonen woonde (Genesis 11:28)." },
  "genesis:ur-kanaan:1": { t: "stad-rivier", tekst: "In Ur der Chaldeeën woonden Abram en Sarai (Genesis 11:29–31)." },
  "genesis:ur-kanaan:3": { t: "stad-rivier", tekst: "Zij kwamen tot Haran en woonden daar; in Haran stierf Terach (Genesis 11:31–32)." },
  "genesis:ur-kanaan:4": { t: "stad-rivier", tekst: "Abram woonde aan de overkant van de rivier. Daar riep de HEERE hem vandaan (Jozua 24:2–3)." },
  "genesis:ur-kanaan:5": { t: "stad-rivier", tekst: "Uit deze stad moet Abram weg, naar het land dat de HEERE hem wijzen zal (Genesis 12:1)." },
  "genesis:ur-kanaan:6": { t: "stad-rivier", tekst: "Abram was vijfenzeventig jaar toen hij uit Haran wegging (Genesis 12:4)." },
  // De brandende braamstruik (Exodus 3)
  "exodus:mozes:4": { t: "braamstruik", tekst: "De braamstruik brandde in het vuur, maar hij verbrandde niet (Exodus 3:2)." },
  "exodus:mozes:5": { t: "braamstruik", tekst: "Uit het midden van de brandende braamstruik riep God tot Mozes (Exodus 3:4)." },
  // De doortocht door de Schelfzee (Exodus 14:21–22)
  "exodus:uittocht:5": { t: "schelfzee", tekst: "Israël ging over het droge; het water stond als een muur, rechts en links (Exodus 14:22)." },
  // De Sinaï (Exodus 19–20)
  "exodus:sinai:4": { t: "sinai", tekst: "Donder en bliksem, een zware wolk, en de hele berg rookte (Exodus 19:16–18)." },
  "exodus:sinai:5": { t: "sinai", tekst: "Het volk zag de bliksem en de rokende berg en bleef op een afstand staan (Exodus 20:18)." },
  // De velden van Moab: het kamp aan de Jordaan, met het land aan de overkant
  "numeri:moab:1": { t: "moab", tekst: "Israël ligt in de vlakke velden van Moab, aan de Jordaan bij Jericho (Numeri 26:3)." },
  "numeri:moab:2": { t: "moab", tekst: "In het kamp, voor de ogen van het hele volk, krijgt Jozua de leiding (Numeri 27:18–19)." },
  "numeri:moab:3": { t: "moab", tekst: "Aan deze kant van de Jordaan, in het land van Moab, legt Mozes de wet uit (Deuteronomium 1:5)." },
  "jozua:intocht:0": { t: "moab", tekst: "Het land ligt aan de overkant: ‘Trek over deze Jordaan’ (Jozua 1:2)." },
  // Het deel ‘Kies dan het leven’ (Deuteronomium 30:11–20). Staat het deel er nog niet, dan gebeurt er niets.
  "numeri:kies-het-leven:0": { t: "moab", tekst: "Israël ligt in de vlakke velden van Moab, aan de Jordaan tegenover Jericho (Numeri 22:1)." },
  "numeri:kies-het-leven:1": { t: "moab", tekst: "Hier, in het land van Moab, spreekt Mozes tot heel Israël (Deuteronomium 1:5)." },
  "numeri:kies-het-leven:2": { t: "moab", tekst: "Aan de overkant ligt het land waar zij heen gaan om het te erven (Deuteronomium 30:16)." },
  "numeri:kies-het-leven:3": { t: "moab", tekst: "Over de Jordaan ligt het land waar het volk naartoe gaat (Deuteronomium 30:18)." },
  "numeri:kies-het-leven:4": { t: "moab", tekst: "Vlak voor de Jordaan klinkt het: ‘Kiest dan het leven’ (Deuteronomium 30:19)." },
  "numeri:kies-het-leven:5": { t: "moab", tekst: "Daar ligt het land dat de HEERE aan Abraham, Izak en Jakob gezworen heeft (Deuteronomium 30:20)." },
  // De muren van Jericho (Jozua 6:20)
  "jozua:intocht:4": { t: "jericho", tekst: "Het volk juichte toen de bazuinen klonken, en de muur stortte in (Jozua 6:20)." },

  // Een standaardbeeld met een eigen zin, omdat de soort van de plaats hier niet past
  "genesis:abraham:7": { t: "altaar", tekst: "Abram kwam terug bij het altaar tussen Bethel en Ai en riep daar de Naam van de HEERE aan (Genesis 13:3–4)." },
  "2samuel:david:2": { t: "stad", tekst: "Alle oudsten van Israël kwamen bij de koning in Hebron (2 Samuël 5:3)." },
  "ezra:terugkeer:2": { t: "altaar", tekst: "Zij bouwden het altaar op zijn oude plaats en offerden daarop brandoffers (Ezra 3:2–3)." },

  // Bewust geen beeld: het standaardbeeld zou iets tonen wat de tekst niet zegt
  "genesis:jozef:2": { t: "" }, // de kuil bij Dothan was leeg, zonder water (Genesis 37:24); geen stad, geen put
  "richteren:ehud-jefta:2": { t: "" }, "1samuel:samuel:9": { t: "" }, // Gilgal is hier geen legerkamp meer
  "ezra:terugkeer:3": { t: "" }, "ezra:terugkeer:5": { t: "" }, "ezra:terugkeer:6": { t: "" }, "ezra:nehemia:3": { t: "" }, // de muur van Jeruzalem ligt nog in puin (Nehemia 1:3)
  "profeten:jeremia:0": { t: "" }, "profeten:jeremia:1": { t: "" }, // de muren zijn afgebroken (Jeremia 39:8)
  "profeten:zacharia-maleachi:0": { t: "" }, "profeten:zacharia-maleachi:1": { t: "" }, "profeten:zacharia-maleachi:2": { t: "" }, "profeten:zacharia-maleachi:3": { t: "" }, "profeten:zacharia-maleachi:4": { t: "" }, // na de ballingschap; de muur is nog niet of pas kort herbouwd
  "jezus-1:nt-geboorte:6": { t: "" }, // de herders zijn ’s nachts in het veld (Lukas 2:8), niet in de stad
  "jezus-2:nt-brood-en-berg:1": { t: "" }, // een woeste plaats bij Bethsaïda (Lukas 9:10)
});
BR.beeldSoort = Object.assign(BR.beeldSoort || {}, {
  // Jeruzalem staat in plaatsen.js als altaar (Salem, Moria); als plaats van een geschiedenis is het een stad.
  salem: "stad", nt_tempel: ["stad", "salem"], nt3_gabbatha: ["stad", "salem"], nt_bethesda: ["stad", "salem"], nt_siloam: ["stad", "salem"],
  // De put van Jakob lag bij Sichar (Johannes 4:5–6).
  nt_sichar: "put",
  // Het land aan de rivier (Genesis 41:1; Exodus 2:3), de Jordaan en de beek Arnon.
  egypte: "rivier", gosen: "rivier", nt_doopplaats: "rivier", arnon: "rivier",
  // Een bron of oase in de woestijn, geen gemetselde put.
  engedi: "gebied", kadesbarnea: "gebied",
  // Geen standaardbeeld: het zou iets tonen wat de Bijbel hier niet zegt (een hof, een dorp, een eiland, een palmboom,
  // een hut; het altaar van Jerobeam in Bethel). Deze plekken vragen om een eigen tafereel; zie de lijst in de README.
  eden: "", bethel: "", ri_palm: "", jona_verdek: "", p2_areopagus: "", nt_golgotha: "", nt_gethsemane: "", nt2_vlek: "", nt_bethanie: "", nt_bethsaida: "", nt_malta: "", nt_patmos: "",
});
