// Secties en volgorde van de geschiedenissen (Verhalen, Voorlezen, Tijdlijn, boekje en de verhaalpagina's).
// Elke geschiedenis noemt haar sectie (g.sectie). De volgorde is het nummer, behalve bij de geschiedenissen die na de
// eerste 150 zijn toegevoegd (151 en verder): die hebben `na: <nr>` en staan direct na die geschiedenis, zodat ze op
// hun plaats in de Bijbelse volgorde komen. Nummers blijven daardoor vast: voortgang (bijbelreis:verhalen), deellinks
// (#v26), lesroutes en verhaalpagina's veranderen niet. Meer geschiedenissen na hetzelfde nummer: op volgorde van nr.
BR.secties = [
  ["begin", "Schepping en oergeschiedenis"],
  ["aartsvaders", "De aartsvaders"],
  ["mozes", "Mozes en de uittocht"],
  ["woestijn", "In de woestijn"],
  ["kanaan", "Het beloofde land"],
  ["richters", "Richters en Ruth"],
  ["koningen", "Samuël, Saul, David en Salomo"],
  ["profeten", "Koningen, profeten en ballingschap"],
  ["terugkeer", "Terugkeer en wachten op de Koning"],
  ["geboorte", "Geboorte en jeugd van de Heere Jezus"],
  ["galilea", "Doop, wonderen en onderwijs"],
  ["onderweg", "Onderweg naar Jeruzalem"],
  ["pasen", "Lijden, sterven en opstanding"],
  ["gemeente", "De eerste gemeente"],
  ["paulus", "De reizen van Paulus"],
  ["openbaring", "Openbaring"],
];
// De eerste negen secties zijn het Oude Testament.
BR.sectieOT = new Set(BR.secties.slice(0, 9).map(([k]) => k));
BR.sectieNaam = (k) => (BR.secties.find(([s]) => s === k) || [k, k])[1];
BR.plek = (g) => (g.na != null ? g.na + 0.5 + g.nr / 10000 : g.nr);
BR.opVolgorde = (lijst) => lijst.slice().sort((a, b) => BR.plek(a) - BR.plek(b));
