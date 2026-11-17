// App-laag van de Bijbelreis in de iOS-app (Capacitor). Alleen in apps/ios/www; de website laadt dit nooit.
// Wat deze laag doet, zonder iets aan de atlas zelf te veranderen:
// 1. Voortgang veiligstellen: alle sleutels ‘bijbelreis:*’ uit localStorage gaan ook naar Capacitor Preferences
//    (UserDefaults, wordt niet door iOS opgeruimd). Is localStorage bij de start leeg en is er een reservekopie,
//    dan wordt die teruggezet en de pagina één keer opnieuw geladen.
// 2. Ouderpoort (App Store-richtlijn 1.3, Kids-categorie): links naar buiten, delen en mailen gaan pas na een
//    rekensom voor volwassenen.
// 3. ‘Mis je iets?’ opent geen formulier (dat stuurt een e-mailadres naar de server), maar na de ouderpoort de eigen
//    mail van de ouder. De bezoekmeting zit niet in de app (zie scripts/maak-webmap.mjs).
// 4. Delen via het deelmenu van iOS (Capacitor Share), na de ouderpoort.
// 5. Een tekstbestand uit de app (licentie van Leaflet) opent in een venster in plaats van de hele app te vervangen.
// Een fout hier mag de atlas nooit raken: alles staat in try/catch.
(function () {
  "use strict";
  var W = window;
  var cap = W.Capacitor && W.Capacitor.Plugins ? W.Capacitor.Plugins : {};
  var Pref = cap.Preferences || null;
  var Deel = cap.Share || null;
  var PREFIX = "bijbelreis:";
  var RESERVE = "bijbelreis-voortgang";
  var SITE = "https://bijbelreis.nl/";
  var MAIL = "info@denckh.nl";

  // ---------- 1. voortgang ----------
  function momentopname() {
    var uit = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) uit[k] = localStorage.getItem(k);
      }
    } catch (e) { /* geen opslag */ }
    return uit;
  }
  var leegBijStart = Object.keys(momentopname()).length === 0;
  var hersteldKlaar = false, wachtend = false, klok = null, bewustLeeg = false;

  function bewaar() {
    if (!Pref) return;
    if (!hersteldKlaar) { wachtend = true; return; }
    var nu = momentopname();
    // Een lege opslag overschrijft de reservekopie alleen als de atlas zelf de laatste sleutel weghaalde. Is de opslag
    // leeg geraakt buiten de atlas om (iOS ruimt op), dan blijft de kopie staan voor de volgende start.
    if (!Object.keys(nu).length && !bewustLeeg) return;
    try { Pref.set({ key: RESERVE, value: JSON.stringify(nu) }).catch(function () {}); } catch (e) { /* niets */ }
  }
  function straks() { if (klok) clearTimeout(klok); klok = setTimeout(function () { klok = null; bewaar(); }, 800); }

  try {
    // clear() wordt bewust niet gevolgd: de atlas gebruikt het niet, en zo bootst localStorage.clear() in de Web Inspector
    // het opruimen door iOS na (de reservekopie blijft staan).
    var S = Storage.prototype, zet = S.setItem, weg = S.removeItem;
    S.setItem = function (k, v) { var r = zet.apply(this, arguments); try { if (this === W.localStorage && String(k).indexOf(PREFIX) === 0) { bewustLeeg = false; straks(); } } catch (e) { /* niets */ } return r; };
    S.removeItem = function (k) { var r = weg.apply(this, arguments); try { if (this === W.localStorage && String(k).indexOf(PREFIX) === 0) { bewustLeeg = true; straks(); } } catch (e) { /* niets */ } return r; };
  } catch (e) { /* dan alleen bij verbergen bewaren */ }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") bewaar(); });
  W.addEventListener("pagehide", bewaar);

  function klaar() { hersteldKlaar = true; if (wachtend) { wachtend = false; bewaar(); } }
  if (!Pref) klaar();
  else if (!leegBijStart) klaar();
  else {
    var al = false;
    try { al = sessionStorage.getItem("bijbelreis-app:hersteld") === "1"; } catch (e) { /* niets */ }
    Pref.get({ key: RESERVE }).then(function (r) {
      var data = null;
      try { data = r && r.value ? JSON.parse(r.value) : null; } catch (e) { data = null; }
      var sleutels = data && typeof data === "object" ? Object.keys(data).filter(function (k) { return k.indexOf(PREFIX) === 0 && typeof data[k] === "string"; }) : [];
      if (!sleutels.length || al) { klaar(); return; }
      // iOS heeft de opslag van de webview opgeruimd: de reservekopie wint van wat de atlas net als begin schreef.
      try {
        sleutels.forEach(function (k) { zet.call(localStorage, k, data[k]); });
        sessionStorage.setItem("bijbelreis-app:hersteld", "1");
      } catch (e) { klaar(); return; }
      location.reload();
    }).catch(klaar);
  }

  // ---------- 2. ouderpoort ----------
  var EEN = ["", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen"];
  var TIEN = { 13: "dertien", 14: "veertien", 15: "vijftien", 16: "zestien", 17: "zeventien", 18: "achttien", 19: "negentien", 20: "twintig" };
  function woord(n) {
    if (TIEN[n]) return TIEN[n];
    var e = EEN[n - 20];
    return e + (/[ae]$/.test(e) ? "ëntwintig" : "entwintig");
  }
  var poort = null, poortKlaar = null, som = 0, terugFocus = null;
  function maakPoort() {
    if (poort) return poort;
    poort = document.createElement("div");
    poort.className = "lade app-poort";
    poort.id = "appPoort";
    poort.hidden = true;
    poort.setAttribute("role", "dialog");
    poort.setAttribute("aria-modal", "true");
    poort.setAttribute("aria-labelledby", "appPoortTitel");
    poort.innerHTML =
      '<div class="lade__box">' +
      '<div class="lade__head"><h3 id="appPoortTitel">Even een ouder erbij</h3><button type="button" class="btn small" data-poort-dicht>Sluiten</button></div>' +
      '<p class="ref" id="appPoortWat"></p>' +
      '<form id="appPoortForm" novalidate>' +
      '<label class="app-poort-vraag" for="appPoortIn">Voor de ouder: <span id="appPoortVraag"></span></label>' +
      '<input id="appPoortIn" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="4" aria-describedby="appPoortFout" />' +
      '<p class="av-fout" id="appPoortFout" role="alert"></p>' +
      '<button type="submit" class="btn primary">Verder</button>' +
      "</form></div>";
    document.body.appendChild(poort);
    poort.addEventListener("click", function (e) { if (e.target === poort || e.target.closest("[data-poort-dicht]")) sluitPoort(false); });
    poort.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = document.getElementById("appPoortIn");
      if (parseInt(inp.value, 10) === som) { sluitPoort(true); return; }
      nieuweSom();
      document.getElementById("appPoortFout").textContent = "Dat klopt niet. Hier is een nieuwe som.";
      inp.value = ""; inp.focus();
    });
    poort.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); sluitPoort(false); } });
    return poort;
  }
  function nieuweSom() {
    var a = 13 + Math.floor(Math.random() * 17), b = 3 + Math.floor(Math.random() * 7);
    som = a * b;
    document.getElementById("appPoortVraag").textContent = "hoeveel is " + woord(a) + " keer " + EEN[b] + "?";
  }
  function sluitPoort(ok) {
    if (!poort || poort.hidden) return;
    poort.hidden = true;
    var k = poortKlaar; poortKlaar = null;
    if (terugFocus && terugFocus.focus) { try { terugFocus.focus(); } catch (e) { /* niets */ } }
    if (k) k(ok);
  }
  function ouderpoort(wat) {
    maakPoort();
    if (poortKlaar) sluitPoort(false);
    terugFocus = document.activeElement;
    document.getElementById("appPoortWat").textContent = wat + " Vraag het even aan je vader of moeder.";
    document.getElementById("appPoortFout").textContent = "";
    document.getElementById("appPoortIn").value = "";
    nieuweSom();
    poort.hidden = false;
    setTimeout(function () { document.getElementById("appPoortIn").focus(); }, 0);
    return new Promise(function (k) { poortKlaar = k; });
  }
  W.addEventListener("popstate", function () { sluitPoort(false); });

  function naarBuiten(url) {
    // In de app opent Capacitor dit buiten de webview (Safari, Mail); in een gewone browser een nieuw venster.
    try { W.open(url, "_blank", "noopener"); } catch (e) { /* niets */ }
  }

  // ---------- 5. tekstbestand in een venster ----------
  function toonTekst(url, titel) {
    fetch(url).then(function (r) { return r.text(); }).then(function (t) {
      var l = document.getElementById("appTekst");
      if (!l) {
        l = document.createElement("div");
        l.className = "lade app-tekst"; l.id = "appTekst";
        l.setAttribute("role", "dialog"); l.setAttribute("aria-modal", "true"); l.setAttribute("aria-labelledby", "appTekstTitel");
        l.innerHTML = '<div class="lade__box wide"><div class="lade__head"><h3 id="appTekstTitel"></h3><button type="button" class="btn small" data-tekst-dicht>Sluiten</button></div><pre></pre></div>';
        document.body.appendChild(l);
        l.addEventListener("click", function (e) { if (e.target === l || e.target.closest("[data-tekst-dicht]")) l.hidden = true; });
        l.addEventListener("keydown", function (e) { if (e.key === "Escape") l.hidden = true; });
      }
      l.querySelector("h3").textContent = titel;
      l.querySelector("pre").textContent = t;
      l.hidden = false;
      l.querySelector("[data-tekst-dicht]").focus();
    }).catch(function () { /* niets */ });
  }

  // ---------- klikken opvangen (vóór de atlas zelf) ----------
  function stop(e) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }
  W.addEventListener("click", function (e) {
    try {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t || (poort && poort.contains(t))) return;

      var knop = t.closest("[data-deel]");
      if (knop) {
        stop(e);
        var titel = knop.getAttribute("data-deel-titel") || "Bijbelreis", url = SITE + "#" + knop.getAttribute("data-deel");
        ouderpoort("Delen gaat via het deelmenu van dit apparaat, naar een andere app.").then(function (ok) {
          if (!ok) return;
          var tekst = titel + " – Op reis door de Bijbel";
          if (Deel) Deel.share({ title: titel, text: tekst, url: url, dialogTitle: "Delen" }).catch(function () {});
          else if (navigator.share) navigator.share({ title: titel, text: tekst, url: url }).catch(function () {});
          else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
        });
        return;
      }

      var av = t.closest("[data-aanvraag]");
      if (av) {
        stop(e);
        ouderpoort("Je vraag gaat via je eigen mail naar de maker van de Bijbelreis.").then(function (ok) {
          if (!ok) return;
          var regels = [];
          var vooraf = av.getAttribute("data-av-tekst");
          if (vooraf) regels.push(vooraf);
          if (/^#[A-Za-z0-9][A-Za-z0-9/=&_-]{0,78}$/.test(location.hash)) regels.push("", "(Ik was bij " + location.hash + " in de app.)");
          naarBuiten("mailto:" + MAIL + "?subject=" + encodeURIComponent("Bijbelreis (app)") + (regels.length ? "&body=" + encodeURIComponent(regels.join("\n")) : ""));
        });
        return;
      }

      var a = t.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#") return;
      var doel;
      try { doel = new URL(href, location.href); } catch (err) { return; }
      var binnen = doel.protocol === location.protocol && doel.host === location.host;
      if (binnen) {
        if (/\.txt$/i.test(doel.pathname)) { stop(e); toonTekst(doel.pathname, (a.textContent || "Tekst").trim()); }
        return;
      }
      stop(e);
      if (!/^(https?|mailto):$/.test(doel.protocol)) return; // tel:, sms:, javascript: enz. nooit
      var waar = doel.protocol === "mailto:" ? "Deze link opent je mail." : "Deze link opent een website buiten de app (" + doel.hostname.replace(/^www\./, "") + ").";
      ouderpoort(waar).then(function (ok) { if (ok) naarBuiten(doel.href); });
    } catch (err) { /* de app-laag is nooit belangrijker dan de atlas */ }
  }, true);

  // Voor de tests van de webmap (scripts/test-webmap.mjs): de laag is geladen.
  W.bijbelreisApp = { versie: 1, ouderpoort: ouderpoort, bewaar: bewaar };
})();
