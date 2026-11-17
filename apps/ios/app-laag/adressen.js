// Waar gaat een adres van de website heen in de app? Eén plek voor die regels: app-laag.js gebruikt ze bij elke klik op
// een link, en scripts/maak-webmap.mjs controleert er bij het maken van de webmap mee dat elk adres in de atlas een
// bestemming heeft (anders stopt het script).
//
// In de app staat de webmap op capacitor://localhost/ en is er geen worker. Een adres zonder bestandsextensie laadt daar
// altijd index.html (de router van Capacitor), dus ‘/bijbelreis/lessen’ zou stil de atlas openen. Daarom:
//   soort "app"  → een pagina in de app (url = pad + fragment in de webmap)
//   soort "site" → staat niet in de app; gaat via de ouderpoort naar bijbelreis.nl in Safari
//   soort "bestand" → een bestand met extensie: zoals het is (bestaat het niet in de webmap, dan faalt maak-webmap)
(function (W) {
  "use strict";
  var SITE = "https://bijbelreis.nl";
  var ATLAS = /^\/(index\.html|bijbelreis(\.html)?)?$/;
  var PAGINA = { lessen: "/bijbelreis/lessen.html", privacy: "/bijbelreis/privacy.html", hulp: "/bijbelreis/hulp.html" };

  function adres(pad, hash) {
    pad = String(pad || "/");
    hash = hash ? String(hash) : "";
    if (hash && hash.charAt(0) !== "#") hash = "#" + hash;
    var kaal = pad.length > 1 ? pad.replace(/\/+$/, "") : pad;
    var m;
    if (ATLAS.test(kaal)) return { soort: "app", url: "/" + hash };
    // Lesroutes, privacy en hulp: ook met /bijbelreis/ ervoor, met of zonder .html
    if ((m = /^\/(?:bijbelreis\/)?(lessen|privacy|hulp)(\.html)?$/.exec(kaal))) return { soort: "app", url: PAGINA[m[1]] + hash };
    // Verhaalpagina's van de website (/verhaal/26-…): in de app dezelfde geschiedenis in de atlas.
    if ((m = /^\/(?:bijbelreis\/)?verhaal\/(\d{1,3})(?:-[a-z0-9-]*)?(\.html)?$/.exec(kaal))) return { soort: "app", url: "/#v" + Number(m[1]) };
    if (/^\/(?:bijbelreis\/)?verhalen(\.html)?$/.test(kaal)) return { soort: "app", url: "/#verhalen" };
    // Presentatie en boekje staan niet in de app (downloaden en afdrukken werken niet in de webview): via de website.
    if (/^\/bijbelreis\/boekje(\.html)?$/.test(kaal)) return { soort: "site", url: SITE + "/bijbelreis/boekje" + hash };
    if (/\.[a-z0-9]{2,6}$/i.test(kaal)) return { soort: "bestand", url: kaal + hash };
    return { soort: "site", url: SITE + kaal + hash };
  }

  W.bijbelreisAdres = adres;
})(typeof window !== "undefined" ? window : this);
