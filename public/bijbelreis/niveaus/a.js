// Reisniveau a. Samen ontdekken (4–6 jaar): korte verhaalstappen om samen te lezen, een tip voor wie voorleest, vragen met twee antwoorden.
// Regels: docs/bijbelreis-niveaus/schrijfwijzer.md. Controle: node scripts/niveaus-controle.mjs
BR.niveaus.voegToe("a", {
  1: {
    status: "concept",
    delen: [
      { t: "In het begin maakt God de hemel en de aarde. Het is nog donker en leeg." },
      { t: "God spreekt: ‘Daar zij licht!’ En het wordt licht. Dat is de eerste dag." },
      { t: "Op de tweede dag maakt God de lucht, hoog boven de aarde." },
      { t: "Op de derde dag maakt God het droge land en de zee. Op het land laat Hij gras, planten en bomen groeien." },
      { t: "Op de vierde dag maakt God de zon, de maan en de sterren." },
      { t: "Op de vijfde dag maakt God de vissen in de zee en de vogels in de lucht." },
      { t: "Op de zesde dag maakt God de dieren op het land. En Hij maakt de mens: een man en een vrouw." },
      { t: "God kijkt naar alles wat Hij gemaakt heeft. Het is zeer goed. Op de zevende dag rust God." },
    ],
    samen: "Wijs bij elke dag iets aan dat je om je heen ziet: het licht, de lucht, een plant, de zon, een vogel, een dier. Zo wordt het verhaal herkenbaar.",
    vragen: [
      { q: "Wie heeft alles gemaakt?", a: ["God", "De mensen"], why: "Genesis 1:1" },
      { q: "Wat maakt God als eerste?", a: ["Het licht", "De dieren"], why: "Genesis 1:3" },
      { q: "Wat doet God op de zevende dag?", a: ["Hij rust", "Hij maakt de zon"], why: "Genesis 2:2" },
    ],
  },
  26: {
    status: "concept",
    plaatsen: ["pihachiroth", "schelfzee"],
    delen: [
      { t: "God heeft Zijn volk Israël uit Egypte geleid. Nu staan ze bij de zee.", stap: "exodus:uittocht:4" },
      { t: "Dan zien ze het leger van de farao komen, met heel veel wagens. Het volk is erg bang.", stap: "exodus:uittocht:4" },
      { t: "Mozes zegt tegen het volk dat ze niet bang hoeven te zijn. God zal voor hen strijden." },
      {
        t: "Mozes strekt zijn hand uit over de zee. De hele nacht waait er een sterke wind. Er komt een droge weg dwars door de zee.",
        stap: "exodus:uittocht:5",
      },
      {
        t: "Het water staat als een muur aan beide kanten. Het volk loopt over de droge bodem naar de overkant.",
        stap: "exodus:uittocht:5",
      },
      { t: "De Egyptenaren gaan erachteraan. Dan komt het water terug. Van het leger van de farao blijft niemand over." },
      { t: "Zo heeft God Zijn volk gered. Het volk zingt een lied voor God, en Mirjam slaat op een trommel.", stap: "exodus:uittocht:6" },
    ],
    samen: "Dit verhaal vertelt ook dat het leger van de farao in de zee omkwam (Exodus 14:28). Kinderen kunnen daarover vragen stellen. De Bijbel vertelt het als de redding van Israël uit de hand van de Egyptenaren (Exodus 14:30). Neem de tijd voor vragen en houd het bij wat de Bijbel zegt.",
    vragen: [
      { q: "Waarom is het volk bang?", a: ["Het leger van de farao komt eraan", "Ze hebben geen eten"], why: "Exodus 14:10" },
      { q: "Wat maakt God in de zee?", a: ["Een droge weg", "Een grote boot"], why: "Exodus 14:21–22" },
      { q: "Wat doet het volk aan de overkant?", a: ["Ze zingen een lied voor God", "Ze gaan terug naar Egypte"], why: "Exodus 15:1" },
    ],
  },
  83: {
    status: "concept",
    plaatsen: ["nt_nazareth", "efrath"],
    delen: [
      { t: "Maria en Jozef wonen in Nazareth. Maria verwacht een kindje." },
      { t: "De keizer wil dat alle mensen worden opgeschreven, ieder in zijn eigen stad." },
      { t: "Jozef moet daarvoor naar Bethlehem, de stad van koning David. Maria gaat met hem mee.", stap: "jezus-1:nt-geboorte:5" },
      { t: "In Bethlehem wordt de Zoon van Maria geboren. Ze wikkelt Hem in doeken.", stap: "jezus-1:nt-geboorte:5" },
      { t: "Er is geen plaats voor hen in de herberg. Daarom legt Maria het Kind in een kribbe: een voerbak voor dieren." },
      { t: "Het Kind krijgt de naam Jezus, zoals de engel gezegd had. Hij is de Zoon van God." },
    ],
    samen: "Lukas 2 noemt een kribbe en een herberg (Lukas 2:7). Een stal, een os en een ezel worden in dit gedeelte niet genoemd; die komen uit de traditie en uit prentenboeken. De herders bij de kribbe zijn de volgende geschiedenis (84).",
    vragen: [
      {
        q: "Waarom gaan Jozef en Maria op reis?",
        a: ["Ze moeten zich laten opschrijven in Bethlehem", "Ze gaan op bezoek bij familie"],
        why: "Lukas 2:1–5",
      },
      { q: "Waar legt Maria het Kind neer?", a: ["In een kribbe", "In een bedje"], why: "Lukas 2:7" },
      { q: "Welke naam krijgt het Kind?", a: ["Jezus", "David"], why: "Lukas 2:21" },
    ],
  },
});
