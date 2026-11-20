// De inhoud in een andere taal (docs/bijbelreis-talen/README.md). Draait op een pagina in een andere taal ná alle
// inhoudsbestanden en vóór app.js, en legt de vertaling (taal/<taal>/inhoud.js, BR.vertaling[taal]) over de Nederlandse
// gegevens heen. Alles heeft taalonafhankelijke sleutels: plaatsen en personen hun id, delen ‘boek:deel’, stappen
// ‘boek:deel:index’ (dezelfde sleutels als de voortgang), geschiedenissen hun nummer.
//
// Regel: wat niet vertaald is, staat er in die taal niet. Zo komt er nooit Nederlandse tekst op een Engelse pagina:
// - een geschiedenis zonder vertaling verdwijnt (de lijst noemt haar ‘nog niet beschikbaar’);
// - een boek of deel zonder vertaalde stap verdwijnt; in een deel dat blijft, staan alle stappen (de sleutels en de
//   volgorde blijven dus gelijk), maar een stap met alleen een vertaalde titel krijgt een korte melding in plaats van tekst;
// - een veld zonder vertaling (weetje, verbanden, overlevering, …) valt weg; namen van personen en groepen in ‘wie’ gaan
//   via de namenlijst, getallen blijven staan;
// - plaatsen houden hun ligging en zekerheid; hun naam is altijd vertaald (de kaart), hun uitleg alleen waar die er is.
// Bijbelboeken in verwijzingen krijgen hun naam in die taal (boeken); verschilt de versnummering, dan staat de verwijzing
// in de vertaling zelf (zie de tabel in de documentatie).
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
(function () {
  "use strict";
  var T = BR.taal;
  if (!T || T.code === "nl") return;
  var V = BR.vertaling && BR.vertaling[T.code];
  if (!V) return;
  var heeft = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };
  var NAMEN = V.namen || {};

  // ---------- verwijzingen en jaartallen ----------
  // ‘1 Samuël 17:4’ → ‘1 Samuel 17:4’. De boeknamen staan in V.boekNamen (Nederlands → taal), langste eerst vervangen.
  var BOEKNAMEN = Object.keys(V.boekNamen || {}).sort(function (a, b) { return b.length - a.length; });
  var boekRe = BOEKNAMEN.length ? new RegExp("(^|;\\s*|\\s[–-]\\s)(" + BOEKNAMEN.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")(?=\\s\\d)", "g") : null;
  function ref(r) { return r && boekRe ? String(r).replace(boekRe, function (m, voor, n) { return voor + V.boekNamen[n]; }) : r; }
  BR.refTaal = ref;
  // ‘ca. 1446 v.Chr.’ → ‘c. 1446 BC’ (V.tijd: [[regex-bron, vervanging], …]).
  var TIJD = (V.tijd || []).map(function (x) { return [new RegExp(x[0], "g"), x[1]]; });
  function tijd(t) { if (typeof t !== "string") return t; TIJD.forEach(function (x) { t = t.replace(x[0], x[1]); }); return t; }
  // Een naam in ‘wie’: ["Mozes", "80"] → ["Moses", "80"]. Een leeftijd of aantal in woorden (‘600.000 mannen’) valt weg.
  function wieRij(rij) {
    if (!rij || !heeft(NAMEN, rij[0])) return null;
    var uit = [NAMEN[rij[0]]];
    if (rij.length > 1 && /^\d+$/.test(String(rij[1]))) uit.push(rij[1]);
    return uit;
  }
  function wieLijst(lijst) { return (lijst || []).map(wieRij).filter(Boolean); }
  // Velden overnemen uit de vertaling; ‘weg’ zijn velden die zonder vertaling verdwijnen.
  function neem(doel, bron, velden) { velden.forEach(function (k) { if (heeft(bron, k)) doel[k] = bron[k]; }); }
  function wis(doel, bron, velden) { velden.forEach(function (k) { if (!heeft(bron, k)) delete doel[k]; }); }

  // ---------- plaatsen ----------
  Object.keys(BR.plaatsen).forEach(function (id) {
    var p = BR.plaatsen[id], v = V.plaatsen && V.plaatsen[id];
    if (typeof v === "string") v = { n: v };
    v = v || {};
    if (heeft(v, "n")) p.n = v.n;
    neem(p, v, ["d", "nu", "bron"]);
    wis(p, v, ["d", "nu", "bron"]);
    // Namen van andere mogelijke plekken (betwist): vertaald, of zonder naam (‘andere mogelijke plek’).
    if (p.alt) p.alt = p.alt.map(function (a, i) { return [a[0], a[1], v.alt && v.alt[i] ? v.alt[i] : ""]; });
  });

  // ---------- personen ----------
  var mensen = {};
  Object.keys(V.mensen || {}).forEach(function (id) {
    var m = BR.mensen && BR.mensen[id], v = V.mensen[id];
    if (!m) return;
    var oud = m.n;
    neem(m, v, ["n", "alias", "kort", "leeftijd", "elders", "vervolg", "ook", "basis", "overlevering"]);
    wis(m, v, ["alias", "kort", "leeftijd", "elders", "vervolg", "ook", "overlevering"]);
    if (!heeft(v, "basis")) delete m.basis;
    // De kleur van een persoon hoort bij de naam (BR.personen).
    if (BR.personen[oud] && !BR.personen[m.n]) BR.personen[m.n] = BR.personen[oud];
    mensen[id] = m;
  });
  // Familiebanden naar personen die niet vertaald zijn, vallen weg (die personen bestaan in deze taal niet).
  Object.keys(mensen).forEach(function (id) {
    var m = mensen[id];
    if (m.v && !mensen[m.v]) delete m.v;
    if (m.m && !mensen[m.m]) delete m.m;
    if (m.p) m.p = m.p.filter(function (k) { return mensen[k]; });
  });
  BR.mensen = mensen;
  Object.keys(NAMEN).forEach(function (n) { if (BR.personen[n] && !BR.personen[NAMEN[n]]) BR.personen[NAMEN[n]] = BR.personen[n]; });

  // ---------- boeken, delen en stappen ----------
  var STAP_VELDEN = ["t", "stamp", "txt", "fact", "fs", "who", "ref", "look", "later", "onthul", "vergelijk"];
  var MELDING = V.nogNiet || { t: "", txt: "" };
  BR.boeken = BR.boeken.filter(function (b) {
    var vb = (V.boeken || {})[b.id];
    b.delen = b.delen.filter(function (d) {
      var key = b.id + ":" + d.id, vd = (V.delen || {})[key];
      if (!vd) return false;
      neem(d, vd, ["n", "short", "intro", "ref", "refKort", "stat", "cross", "tijdNoot", "denk", "init", "quiz"]);
      if (!heeft(vd, "ref")) d.ref = ref(d.ref);
      if (heeft(vd, "who")) d.who = vd.who; else d.who = wieLijst(d.who);
      d.tijd = heeft(vd, "tijd") ? vd.tijd : tijd(d.tijd);
      wis(d, vd, ["stat", "cross", "tijdNoot", "denk", "refKort"]);
      if (!heeft(vd, "init")) d.init = (d.n || "?")[0];
      if (!heeft(vd, "quiz")) d.quiz = { tap: [], mc: [], ord: [] };
      // Reizen (Hoe ver?): de namen per index; een reis zonder vertaalde naam valt weg.
      d.trips = (d.trips || []).map(function (t, i) { return vd.trips && vd.trips[i] ? Object.assign({}, t, { n: vd.trips[i] }) : null; }).filter(Boolean);
      d.steps.forEach(function (s, i) {
        var vs = (V.stappen || {})[key + ":" + i] || {};
        var volledig = heeft(vs, "txt");
        neem(s, vs, STAP_VELDEN);
        if (!heeft(vs, "ref")) s.ref = ref(s.ref);
        if (!heeft(vs, "who")) s.who = wieLijst(s.who);
        if (!volledig) {
          // Alleen de titel (en de stempel) vertaald: een korte melding in plaats van de tekst.
          if (!heeft(vs, "t")) s.t = MELDING.t;
          if (!heeft(vs, "stamp")) s.stamp = MELDING.stamp || "";
          s.txt = MELDING.txt;
          s.nogNiet = true;
        }
        wis(s, vs, ["fact", "fs", "look", "later", "onthul", "vergelijk"]);
        if (s.later && !heeft(vs, "later")) delete s.later;
        if (s.look && !heeft(vs, "look")) delete s.look;
      });
      return true;
    });
    if (!b.delen.length) return false;
    // Verdiepende delen (bij) waarvan het hoofddeel er niet is, vallen ook weg.
    b.delen = b.delen.filter(function (d) { return !d.bij || b.delen.some(function (x) { return x.id === d.bij; }); });
    b.n = vb && vb.n ? vb.n : (V.boekNamen || {})[b.n] || b.n;
    b.tijd = vb && heeft(vb, "tijd") ? vb.tijd : tijd(b.tijd);
    b.intro = vb && vb.intro ? vb.intro : "";
    b.wie = vb && vb.wie ? vb.wie : [];
    if (vb && vb.ordAlles) b.ordAlles = vb.ordAlles; else delete b.ordAlles;
    delete b.stamboom;
    return true;
  });

  // ---------- geschiedenissen ----------
  var G_VELDEN = ["t", "ref", "uitleg", "betekenis", "wie", "ontdek", "quiz", "cross", "tijd", "tijdNoot", "kw", "status"];
  var stappen = {};
  BR.boeken.forEach(function (b) { b.delen.forEach(function (d) { d.steps.forEach(function (s, i) { stappen[b.id + ":" + d.id + ":" + i] = s; }); }); });
  BR.geschiedenissen = (BR.geschiedenissen || []).filter(function (g) {
    var v = (V.geschiedenissen || {})[g.nr];
    if (!v || !(g.stappen || []).every(function (k) { return stappen[k]; })) return false;
    neem(g, v, G_VELDEN);
    wis(g, v, ["betekenis", "ontdek", "cross", "tijdNoot", "kw"]);
    if (!heeft(v, "tijd")) g.tijd = tijd(g.tijd);
    return true;
  });
  BR.kernwoorden = V.kernwoorden || {};
  BR.indeling = V.indeling || {};
  BR.leidraad = {};
  if (V.dateringen && BR.dateringen) BR.dateringen.soorten = V.dateringen;
  if (V.niveaus && BR.niveaus) BR.niveaus.soorten = V.niveaus;
  // Verwijzingen in deze taal lezen (app.js gebruikt parseRef om gedeelten te vergelijken).
  Object.keys(V.slugs || {}).forEach(function (n) { BR.SLUGS[n] = V.slugs[n]; });
})();
