// De Bijbelreis als app: de service worker aanmelden (bijbelreis-sw.js), een nieuwe versie rustig aanbieden en zeggen
// wanneer er geen internet is. Uitleg: docs/bijbelreis-pwa/README.md.
// - Alleen op de atlas zelf (bijbelreis.nl/, lokaal /bijbelreis) en alleen in een gebouwde versie (meta bijbelreis-versie).
// - Een nieuwe versie gaat pas in gebruik als je op ‘Vernieuwen’ tikt, of vanzelf de volgende keer dat de app opent.
// - De voortgang (localStorage bijbelreis:*) wordt hier niet aangeraakt.
// Een fout hier mag de atlas nooit raken: alles staat in try/catch.
(function () {
  "use strict";
  if (typeof document === "undefined" || typeof navigator === "undefined") return;
  var versie = document.querySelector('meta[name="bijbelreis-versie"]');
  var pad = location.pathname;
  var atlas = pad === "/" ? "/" : /^\/bijbelreis(\.html)?$/.test(pad) ? "/bijbelreis" : "";
  // Een andere taal (docs/bijbelreis-talen/README.md): een eigen service worker met een eigen set, op het pad van die taal
  // (/en/, lokaal /bijbelreis/en/). Zo mengt een taal nooit met een andere versie of taal, en blijft de Nederlandse app
  // precies zoals hij was.
  var taal = /^\/(?:bijbelreis\/)?([a-z]{2})\/(?:index\.html)?$/.exec(pad);
  if (taal && taal[1] !== "nl") atlas = pad.replace(/index\.html$/, "");
  var swNaam = taal && taal[1] !== "nl" ? "/bijbelreis-sw-" + taal[1] + ".js" : "/bijbelreis-sw.js";
  if (!versie || !atlas || !("serviceWorker" in navigator) || !window.isSecureContext) return;
  var sw = navigator.serviceWorker;

  // ---------- meldingen onderin ----------
  var vak = null;
  function melding(tekst, knop, actie, soort) {
    try {
      if (!vak) {
        vak = document.createElement("div");
        vak.className = "pwa-melding";
        vak.setAttribute("role", "status");
        document.body.appendChild(vak);
      }
      vak.dataset.soort = soort;
      vak.innerHTML = "";
      var p = document.createElement("p");
      p.textContent = tekst;
      vak.appendChild(p);
      if (knop) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn primary";
        b.textContent = knop;
        b.addEventListener("click", actie);
        vak.appendChild(b);
      }
      var weg = document.createElement("button");
      weg.type = "button";
      weg.className = "pwa-weg";
      weg.setAttribute("aria-label", "Melding sluiten");
      weg.textContent = "×";
      weg.addEventListener("click", sluit);
      vak.appendChild(weg);
      vak.hidden = false;
    } catch (e) { /* geen melding */ }
  }
  function sluit() { if (vak) vak.hidden = true; }

  // ---------- nieuwe versie ----------
  var zelfGevraagd = false, herladen = false, hadBaas = !!sw.controller;
  function nieuweVersie(wachtend) {
    melding("Er is een nieuwe versie van de Bijbelreis.", "Vernieuwen", function () {
      zelfGevraagd = true;
      // De nieuwe versie neemt het over; daarna laadt de pagina opnieuw (controllerchange). Je blijft bij dezelfde stap.
      if (wachtend) wachtend.postMessage({ soort: "nu-wisselen" });
      else location.reload();
    }, "versie");
  }
  sw.addEventListener("controllerchange", function () {
    if (zelfGevraagd) {
      if (!herladen) { herladen = true; location.reload(); }
    } else if (hadBaas) {
      // In een ander tabblad is op ‘Vernieuwen’ getikt: hier ook aanbieden.
      nieuweVersie(null);
    }
    hadBaas = true;
  });

  function volg(reg) {
    // Geen registratie terug (bijv. service workers geblokkeerd in een testbrowser): dan gewoon zonder app-modus.
    if (!reg || !reg.addEventListener) return;
    if (reg.waiting && sw.controller) nieuweVersie(reg.waiting);
    reg.addEventListener("updatefound", function () {
      var nieuw = reg.installing;
      if (!nieuw) return;
      nieuw.addEventListener("statechange", function () {
        if (nieuw.state === "installed" && sw.controller) nieuweVersie(nieuw);
      });
    });
    // Wie de app lang open laat staan, krijgt een nieuwe versie ook: elke keer dat de app weer in beeld komt (hooguit
    // eens per half uur) even kijken.
    var laatst = Date.now();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && navigator.onLine !== false && Date.now() - laatst > 30 * 60 * 1000) {
        laatst = Date.now();
        reg.update().catch(function () {});
      }
    });
  }

  function aanmelden() {
    try {
      sw.register(swNaam + "?schil=" + encodeURIComponent(atlas), { scope: swNaam === "/bijbelreis-sw.js" ? "/" : atlas }).then(volg).catch(function () { /* geen app-modus */ });
    } catch (e) { /* geen app-modus */ }
    bewaarOpslag();
  }
  if (document.readyState === "complete") aanmelden();
  else window.addEventListener("load", aanmelden);

  // ---------- opslag laten staan ----------
  // Alleen in de geïnstalleerde app (op het beginscherm): Chrome en Safari vragen dan niets aan de gebruiker en houden de
  // opslag (ook de voortgang) vast. Firefox laat er een vraag voor zien; die slaan we over om kinderen niet te verwarren.
  function bewaarOpslag() {
    try {
      var app = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
      var st = navigator.storage;
      if (!app || !st || !st.persist || !st.persisted || /Firefox\//.test(navigator.userAgent)) return;
      st.persisted().then(function (al) { if (!al) return st.persist(); }).catch(function () {});
    } catch (e) { /* niets */ }
  }

  // ---------- geen internet ----------
  // Zonder internet? navigator.onLine is niet altijd juist; de service worker merkt daarom de bewaarde pagina als hij die
  // gaf omdat het netwerk niet antwoordde (Server-Timing: bijbelreis-offline). app.js leest data-offline bij het aanvraagformulier.
  var wortel = document.documentElement;
  function zonderNet() { return navigator.onLine === false || wortel.hasAttribute("data-offline"); }
  try {
    var nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.serverTiming && nav.serverTiming.some(function (t) { return t.name === "bijbelreis-offline"; })) wortel.setAttribute("data-offline", "");
  } catch (e) { /* niets */ }
  var offlineT = 0;
  function offline() {
    melding("Je hebt nu geen internet. Wat je eerder hebt bekeken, kun je gewoon gebruiken.", "", null, "offline");
    // Na een tijdje vanzelf weg: de atlas werkt gewoon door.
    clearTimeout(offlineT);
    offlineT = setTimeout(function () { if (vak && vak.dataset.soort === "offline") sluit(); }, 10000);
  }
  window.addEventListener("offline", function () { wortel.setAttribute("data-offline", ""); offline(); });
  window.addEventListener("online", function () {
    wortel.removeAttribute("data-offline");
    if (vak && vak.dataset.soort === "offline") sluit();
    // Foto's die zonder internet niet konden laden, opnieuw proberen.
    var weg = document.querySelectorAll("img[data-offline]");
    for (var i = 0; i < weg.length; i++) {
      var img = weg[i], el = img.nextElementSibling;
      if (el && el.classList.contains("pwa-geenfoto")) el.remove();
      img.removeAttribute("data-offline");
      img.hidden = false;
      var src = img.getAttribute("src");
      img.setAttribute("src", src);
    }
  });
  if (zonderNet()) offline();

  // Een foto die zonder internet niet te laden is (nog niet eerder bekeken): een korte zin in plaats van een leeg vlak.
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || !zonderNet() || img.hasAttribute("data-offline")) return;
    img.setAttribute("data-offline", "");
    img.hidden = true;
    var p = document.createElement("p");
    p.className = "pwa-geenfoto";
    p.textContent = "Deze foto kun je zien als je weer internet hebt.";
    img.insertAdjacentElement("afterend", p);
  }, true);
})();
