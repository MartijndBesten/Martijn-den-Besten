// Hoe zeker is een jaartal? De Bijbel rekent in levensjaren en regeringsjaren, niet in onze jaartelling. Elk jaartal in
// de Bijbelreis is daarom omgerekend. Per deel en per geschiedenis staat hier op welke grond, en of onderzoekers het
// er (ruwweg) over eens zijn. Verantwoording per groep: docs/bijbelreis-audit/dateringen.md.
//   bijbel   = Bijbelse tijdrekening: uitgerekend met getallen uit de Bijbel (leeftijden, ‘480 jaar’, ‘430 jaar’),
//              teruggeteld vanaf een later ijkpunt. De volgorde en de tussenpozen komen uit de Bijbel; het jaartal
//              hangt af van hoe je rekent.
//   historie = historische reconstructie: vastgezet met bronnen buiten de Bijbel (Assyrische en Babylonische kronieken,
//              Perzische koningslijsten, Romeinse keizers, Josephus) samen met de gegevens uit de Bijbel.
//   onzeker  = onderzoekers komen tot duidelijk verschillende jaartallen (bijv. uittocht ca. 1446 of in de 13e eeuw;
//              kruisiging 30 of 33 n.Chr.).
// Genesis 1–11 heeft geen jaartal (tijd: null) en staat hier niet.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.dateringen = {
  soorten: {
    bijbel: { n: "Bijbelse tijdrekening", uitleg: "Uitgerekend met getallen uit de Bijbel, zoals leeftijden en ‘480 jaar’ (1 Koningen 6:1). De volgorde staat in de Bijbel; het jaartal hangt af van hoe je rekent." },
    historie: { n: "Historische reconstructie", uitleg: "Vastgezet met bronnen buiten de Bijbel, zoals Assyrische en Babylonische kronieken en Romeinse geschiedschrijvers, samen met de gegevens uit de Bijbel." },
    onzeker: { n: "onzeker", uitleg: "Onderzoekers komen hier tot duidelijk verschillende jaartallen." },
    geen: { n: "geen jaartal", uitleg: "Genesis 1–11 geeft geen datum in onze jaartelling." },
  },
  // [soort, onzeker?]
  delen: {
    "genesis:abraham": ["bijbel", true], "genesis:izak": ["bijbel", true], "genesis:jakob": ["bijbel", true], "genesis:jozef": ["bijbel", true],
    "exodus:mozes": ["bijbel", true], "exodus:uittocht": ["bijbel", true], "exodus:sinai": ["bijbel", true], "leviticus:verzoendag": ["bijbel", true],
    "numeri:woestijn": ["bijbel", true], "numeri:moab": ["bijbel", true], "jozua:intocht": ["bijbel", true], "jozua:land": ["bijbel", true],
    "richteren:debora": ["bijbel", true], "richteren:simson": ["bijbel", true], "ruth:ruth": ["bijbel", true],
    "1samuel:samuel": ["bijbel", true], "1samuel:saul-david": ["bijbel", true],
    "2samuel:david": ["historie", false], "1koningen:salomo": ["historie", false], "1koningen:elia": ["historie", false],
    "2koningen:elisa": ["historie", false], "2koningen:joas": ["historie", false], "2koningen:ballingschap": ["historie", false],
    "daniel:daniel": ["historie", false], "esther:esther": ["historie", false], "ezra:terugkeer": ["historie", false], "ezra:nehemia": ["historie", false],
    "jona:jona": ["historie", false], "profeten:jesaja-troost": ["historie", false], "profeten:jeremia": ["historie", false], "profeten:zacharia-maleachi": ["historie", false],
    "jezus-1:nt-geboorte": ["historie", true], "jezus-1:nt-begin": ["historie", false], "jezus-1:nt-galilea": ["historie", false],
    "jezus-2:nt-brood-en-berg": ["historie", true], "jezus-2:nt-feesten-jeruzalem": ["historie", true], "jezus-2:nt-reis-naar-jeruzalem": ["historie", true],
    "jezus-3:nt-lijdensweek": ["historie", true], "jezus-3:nt-lijden": ["historie", true], "jezus-3:nt-opstanding": ["historie", true],
    "handelingen:nt-gemeente": ["historie", false], "handelingen:nt-paulus": ["historie", false], "handelingen:nt-paulusrome": ["historie", false],
    "openbaring:nt-openbaring": ["historie", true],
  },
  // Geschiedenissen per reeks: [van, tot, soort, onzeker?]
  verhalen: [
    [8, 20, "bijbel", true], // aartsvaders: terug gerekend vanaf de uittocht
    [21, 41, "bijbel", true], // Mozes tot Jozua: uittocht ca. 1446 via 1 Koningen 6:1, of 13e eeuw
    [42, 47, "bijbel", true], // richters en Ruth: grote onzekerheid
    [48, 54, "bijbel", true], // Samuël en Saul: Handelingen 13:21, terug vanaf David
    [55, 56, "historie", false], // David koning (ca. 1010)
    [57, 59, "historie", true], // welk jaar binnen Davids regering staat niet in de Bijbel
    [60, 79, "historie", false], // Salomo tot Maleachi: koningslijsten en kronieken
    [80, 86, "historie", true], // geboorte: vóór de dood van Herodes, ca. 4 v.Chr. (sommigen: later)
    [87, 99, "historie", false], // Lukas 3:1: vijftiende jaar van Tiberius
    [100, 117, "historie", true], // ‘of 32’: hangt af van het jaar van de kruisiging
    [118, 135, "historie", true], // kruisiging 30 of 33 n.Chr.
    [136, 148, "historie", false], // Handelingen: o.a. Herodes Agrippa († 44), Gallio, Festus
    [149, 150, "historie", true], // Openbaring ca. 95 (Irenaeus) of ca. 68
  ],
};
