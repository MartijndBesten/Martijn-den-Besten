// Bezoekmeting van de Bijbelreis: hoeveel bezoeken er zijn en hoe lang ze duren. Meer niet.
// Wat er wel en niet wordt bewaard: docs/bijbelreis-bezoek/README.md. Kort:
// - geen cookie en niets in de opslag van de browser: het bezoek-id bestaat alleen in het geheugen van deze pagina;
// - er gaat naar de eigen site (POST /api/bezoek): het id, de pagina (atlas of boekje), de soort apparaat, de hostnaam
//   van de verwijzende site, de seconden dat de pagina in beeld was en het aantal geopende reisstappen (niet welke);
// - staat ‘niet volgen’ aan in de browser (Do Not Track of Global Privacy Control), dan wordt er niets verstuurd;
// - een geautomatiseerde browser (tests, robots) wordt niet geteld.
// Een fout hier mag de site nooit raken: alles staat in try/catch en er wordt nergens op een antwoord gewacht.
(function () {
  "use strict";
  try {
    var nav = navigator;
    if (nav.webdriver || nav.doNotTrack === "1" || window.doNotTrack === "1" || nav.globalPrivacyControl) return;
    // Alleen op de site zelf: een opgeslagen los bestand (boekje) meldt niets.
    if (!/^https?:$/.test(location.protocol) || !window.crypto || !crypto.getRandomValues || !window.JSON) return;
    var bytes = crypto.getRandomValues(new Uint8Array(16)), id = "";
    for (var i = 0; i < bytes.length; i++) id += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
    var pagina = /\/boekje(\.html)?\/?$/.test(location.pathname) ? "boekje" : "atlas";
    var breed = window.innerWidth || document.documentElement.clientWidth || 0;
    var apparaat = breed < 700 ? "telefoon" : breed < 1100 ? "tablet" : "desktop";
    var herkomst = "";
    try { if (document.referrer) herkomst = new URL(document.referrer).hostname.toLowerCase(); } catch (e) { herkomst = ""; }
    if (herkomst === location.hostname || !/^[a-z0-9.-]{1,80}$/.test(herkomst)) herkomst = "";

    // De tijd dat de pagina in beeld was: de klok loopt alleen zolang het tabblad zichtbaar is.
    var nu = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
    var totaal = 0, sinds = document.visibilityState === "hidden" ? null : nu();
    var stappen = Object.create(null), aantal = 0;
    var duur = function () { return Math.round((totaal + (sinds === null ? 0 : nu() - sinds)) / 1000); };

    var meld = function () {
      try {
        var tekst = JSON.stringify({ i: id, p: pagina, a: apparaat, h: herkomst, d: Math.max(0, duur()), s: aantal });
        if (nav.sendBeacon && nav.sendBeacon("/api/bezoek", tekst)) return;
        if (window.fetch) fetch("/api/bezoek", { method: "POST", body: tekst, keepalive: true, credentials: "omit" }).catch(function () {});
      } catch (e) { /* de meting is nooit belangrijker dan de site */ }
    };

    document.addEventListener("bijbelreis:stap", function (e) {
      try { var k = String(e.detail || ""); if (k && !stappen[k]) { stappen[k] = 1; aantal++; } } catch (err) { /* niets */ }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") { if (sinds !== null) { totaal += nu() - sinds; sinds = null; } meld(); }
      else if (sinds === null) sinds = nu();
    });
    // Safari meldt het sluiten van een tabblad niet altijd als ‘verborgen’: pagehide vangt dat op.
    window.addEventListener("pagehide", function () { if (sinds !== null) { totaal += nu() - sinds; sinds = null; } meld(); });
    window.addEventListener("pageshow", function (e) { if (e.persisted && sinds === null && document.visibilityState !== "hidden") sinds = nu(); });
    // En om de twee minuten, zolang de pagina in beeld is: zo telt ook een bezoek waarvan het einde nooit aankomt.
    setInterval(function () { if (sinds !== null) meld(); }, 120000);
    meld();
  } catch (e) { /* de meting is nooit belangrijker dan de site */ }
})();
