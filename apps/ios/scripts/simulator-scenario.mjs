// Scenario's voor de simulator-test (scripts/simulator-test.mjs) in de echte iOS-webview (WKWebView).
// De testloper in de app (ios/App/App/BijbelreisTest.swift, alleen in DEBUG-builds) voert de stappen uit:
//   js     het lichaam van een async functie in de pagina; een tekst die met "FOUT" begint, laat de stap mislukken
//   terug  webView.goBack(): wat de rand-veeg van iOS doet (allowsBackForwardNavigationGestures moet aan staan)
//   wacht  een uitdrukking die binnen ms (standaard 15 s) waar moet worden
//   draai  "liggend" of "staand": het scherm draaien
//   foto   de test maakt een schermafbeelding van het hele scherm (met statusbalk) onder deze naam
// Naar een andere pagina gaan (lesroutes) gebeurt met setTimeout, zodat de JavaScript-aanroep eerst terugkomt.

// Hulpjes die voor elke js-stap staan.
const HULP = `
const slaap = (ms) => new Promise((k) => setTimeout(k, ms));
const zicht = (sel) => { const e = document.querySelector(sel); return !!e && !e.hidden && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"; };
async function wachtOp(f, ms = 15000) { const t = Date.now() + ms; while (Date.now() < t) { try { if (f()) return true; } catch (e) { /* nog niet */ } await slaap(150); } throw new Error("wachtOp: te lang gewacht op " + f); }
const klik = (sel) => { const e = document.querySelector(sel); if (!e) throw new Error("niet gevonden: " + sel); e.click(); };
`;
const js = (lichaam) => HULP + lichaam;

const KAART = `!!document.querySelector("#map.leaflet-container") && document.querySelectorAll("#map .leaflet-overlay-pane path, #map .leaflet-marker-icon").length > 5`;
const ZICHT = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); return !!e && !e.hidden && e.getClientRects().length > 0; })()`;
const VERHAAL = ZICHT("#p-verhalen .verhaal");

// Veilige zones: knoppen, links, velden en koppen die je ziet, mogen niet onder de statusbalk, de notch of het
// Dynamic Island staan, en niet vast in de zone van de thuisstreep. Iets dat je weg kunt scrollen, telt niet mee.
const VEILIG = js(`
  window.scrollTo(0, 0);
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await slaap(300);
  const p = document.createElement("div");
  p.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
  document.body.appendChild(p);
  const cs = getComputedStyle(p);
  const inz = { boven: parseFloat(cs.paddingTop), rechts: parseFloat(cs.paddingRight), onder: parseFloat(cs.paddingBottom), links: parseFloat(cs.paddingLeft) };
  p.remove();
  const H = innerHeight, B = innerWidth, mis = [];
  const zijwaarts = (e) => { for (let a = e.parentElement; a; a = a.parentElement) { const st = getComputedStyle(a); if (/(auto|scroll)/.test(st.overflowX) && a.scrollWidth > a.clientWidth + 1) return true; } return false; };
  const scrollers = (e) => { const s = []; for (let a = e.parentElement; a; a = a.parentElement) { const st = getComputedStyle(a); if (/(auto|scroll)/.test(st.overflowY + st.overflowX)) s.push(a); if (st.position === "fixed") return { s, vast: true }; } return { s, vast: false }; };
  const kan = (e, richting) => {
    const { s, vast } = scrollers(e);
    if (s.some((a) => richting === "omlaag" ? a.scrollHeight - a.scrollTop - a.clientHeight > 1 : a.scrollTop > 1)) return true;
    if (vast) return false;
    const d = document.scrollingElement;
    return richting === "omlaag" ? d.scrollHeight - d.scrollTop - innerHeight > 1 : d.scrollTop > 1;
  };
  for (const e of document.querySelectorAll("button, a[href], input, select, textarea, [role=tab], h1, h2, h3")) {
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= B) continue;
    const st = getComputedStyle(e);
    if (st.visibility === "hidden" || Number(st.opacity) === 0) continue;
    const x = Math.min(B - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2));
    const boven = document.elementFromPoint(x, y);
    if (!boven || !(boven === e || e.contains(boven) || boven.contains(e))) continue;
    const naam = (e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : "")) + " «" + (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 32) + "»";
    if (r.top < inz.boven - 1 && r.top >= 0 && !kan(e, "terug")) mis.push("onder statusbalk/notch: " + naam + " (top " + Math.round(r.top) + " < " + inz.boven + ")");
    if (inz.onder > 0 && r.bottom > H - inz.onder + 1 && r.bottom <= H + 1 && !kan(e, "omlaag")) mis.push("in de zone van de thuisstreep: " + naam + " (onder " + Math.round(r.bottom) + " > " + (H - inz.onder) + ")");
    // Iets in een rij die opzij scrollt (de delen van een reis, de boekenrij) kun je naar binnen schuiven.
    if (inz.links > 0 && r.left < inz.links - 1 && r.left >= 0 && !zijwaarts(e)) mis.push("links in de notch: " + naam);
    if (inz.rechts > 0 && r.right > B - inz.rechts + 1 && r.right <= B && !zijwaarts(e)) mis.push("rechts in de notch/ronde hoek: " + naam);
  }
  if (mis.length) return "FOUT veilige zones " + JSON.stringify(inz) + ": " + mis.slice(0, 8).join(" | ");
  return { inz, H, B, pagina: location.pathname + location.hash };
`);
const veilig = (waar) => ({ naam: `veilige zones: ${waar}`, js: VEILIG });

// Na een stap: geen verzoek dat de app uit gaat (alleen capacitor://localhost) en geen /api.
const NETWERK = js(`
  const weg = performance.getEntriesByType("resource").map((r) => r.name).filter((u) => !u.startsWith("capacitor://localhost/") || u.includes("/api/"));
  if (weg.length) return "FOUT verzoeken buiten de app: " + weg.slice(0, 5).join(", ");
  return performance.getEntriesByType("resource").length + " bronnen, allemaal uit de app";
`);

const ATLAS_KLAAR = `${KAART} && document.documentElement.dataset.app === "ios" && !!window.bijbelreisApp && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())`;

export const SCENARIOS = {
  // De hoofdroute in de echte webview: navigeren, terug (veeg), een verhaal, de tijdlijn, De wereld in die tijd,
  // de ouderpoort, de lesroutes met de digibordstand, de reservekopie van de voortgang.
  test: [
    { naam: "start: atlas, app-laag en Capacitor geladen, kaart getekend (eerste start)", wacht: ATLAS_KLAAR, ms: 45000, foto: "01-eerste-start" },
    { naam: "geen service worker, geen manifest, geen bezoekmeting", js: js(`
      if (navigator.serviceWorker && (await navigator.serviceWorker.getRegistrations()).length) return "FOUT service worker";
      if (document.querySelector('link[rel="manifest"], script[src*="pwa.js"], script[src*="bezoek.js"]')) return "FOUT manifest, pwa.js of bezoek.js";
      return navigator.userAgent;`) },
    { naam: "reisniveau ‘Zelf op reis’ en welkom gezien, opnieuw laden", js: js(`
      localStorage.setItem("bijbelreis:niveau", JSON.stringify("b"));
      localStorage.setItem("bijbelreis:welkomWeg", "true");
      window.__voorHerladen = true;
      setTimeout(() => location.reload(), 50);
      return "ok";`), wacht: `!window.__voorHerladen && ${ATLAS_KLAAR}`, ms: 45000 },
    veilig("atlas"),
    { naam: "verhaal openen uit de lijst (#v1)", js: js(`location.hash = "#verhalen"; await wachtOp(() => document.querySelector('#vLijst [data-v="1"]')); klik('#vLijst [data-v="1"]'); return location.hash;`), wacht: VERHAAL, foto: "02-verhaal" },
    veilig("verhaal"),
    { naam: "een reis op de kaart (#abraham/4)", js: js(`location.hash = "#abraham/4"; return "ok";`), wacht: `${KAART} && /Abraham|Kanaän|Sichem|Bethel|Egypte/.test(document.body.innerText) && location.hash.startsWith("#abraham")`, foto: "03-reis" },
    { naam: "een venster openen (kies een reis)", js: js(`klik("#kiesBtn"); return "ok";`), wacht: ZICHT("#kiesLade") },
    { naam: "terug (veeg): sluit eerst het venster, de reis blijft", terug: true, wacht: `document.getElementById("kiesLade").hidden && location.hash.startsWith("#abraham")` },
    { naam: "terug (veeg): naar de vorige plek, het verhaal", terug: true, wacht: `${VERHAAL} && /^#v1$/.test(location.hash)` },
    { naam: "tijdlijn", js: js(`klik("#t-tijd"); return "ok";`), wacht: `${ZICHT("#p-tijd")} && document.getElementById("p-tijd").children.length > 0`, foto: "04-tijdlijn" },
    veilig("tijdlijn"),
    { naam: "De wereld in die tijd: de uitnodiging in een verhaal (#v5)", js: js(`location.hash = "#v5"; return "ok";`), wacht: `${VERHAAL} && ${ZICHT(".wt-ingang")}` },
    { naam: "De wereld in die tijd: de laag opent (periodebestand uit de app)", js: js(`klik(".wt-ingang"); return "ok";`), wacht: `${ZICHT("#wtLaag")} && !!document.querySelector(".wt-app .wt-svg .wt-balk") && /#wereld\\/adam-noach\\/1656$/.test(location.hash)`, ms: 20000, foto: "05-wereld" },
    veilig("De wereld in die tijd"),
    { naam: "terug (veeg): uit De wereld in die tijd terug in het verhaal", terug: true, wacht: `!${ZICHT("#wtLaag")} && location.hash === "#v5" && ${VERHAAL}` },
    { naam: "ouderpoort: een link naar buiten (Denckh) vraagt eerst een som", js: js(`document.querySelector(".maker a").click(); return "ok";`), wacht: ZICHT("#appPoort"), foto: "06-ouderpoort" },
    { naam: "ouderpoort: fout antwoord geeft een nieuwe som", js: js(`
      document.getElementById("appPoortIn").value = "1";
      document.querySelector("#appPoort button[type=submit]").click();
      return document.getElementById("appPoortVraag").textContent;`), wacht: `/klopt niet/.test(document.getElementById("appPoortFout").textContent) && location.protocol === "capacitor:"` },
    { naam: "ouderpoort: Sluiten doet niets, de app blijft staan", js: js(`klik("#appPoort [data-poort-dicht]"); return "ok";`), wacht: `document.getElementById("appPoort").hidden && location.protocol === "capacitor:" && location.hash === "#v5"` },
    { naam: "voortgang: reservekopie in Capacitor Preferences (UserDefaults)", js: js(`
      await slaap(1500);
      const r = await window.Capacitor.Plugins.Preferences.get({ key: "bijbelreis-voortgang" });
      if (!r || !r.value) return "FOUT geen reservekopie";
      const n = Object.keys(JSON.parse(r.value)).length;
      return n > 1 ? n + " sleutels bewaard" : "FOUT reservekopie bijna leeg";`) },
    { naam: "lesroutes: vanuit ‘Voor ouders en leiders’ naar de lesroutes in de app", js: js(`
      location.hash = "#v1";
      await wachtOp(() => document.querySelector('details.parents a[href="/bijbelreis/lessen"]'));
      setTimeout(() => document.querySelector('details.parents a[href="/bijbelreis/lessen"]').click(), 50);
      return "ok";`), wacht: `location.pathname === "/bijbelreis/lessen.html" && !!document.querySelector(".ls-routes .ls-route") && !!window.bijbelreisApp`, ms: 20000, foto: "07-lesroutes" },
    veilig("lesroutes"),
    { naam: "lesroutes: een route openen", js: js(`klik(".ls-route"); return "ok";`), wacht: ZICHT(".ls-les") },
    { naam: "lesroutes: Vragen op het digibord (in de app, geen ouderpoort)", js: js(`klik('.ls-les a.bk-knop[href$="/bord"]'); return "ok";`), wacht: `${ZICHT(".lb")} && (!document.getElementById("appPoort") || document.getElementById("appPoort").hidden)`, foto: "08-digibord" },
    veilig("digibordstand"),
    { naam: "digibord: ‘Volledig scherm’ (alleen als WebKit het aanbiedt; ter informatie)", js: js(`
      const k = document.querySelector('[data-bord="scherm"]');
      if (!k) return { knop: false, fullscreenEnabled: document.fullscreenEnabled };
      k.click(); await slaap(1500);
      const vol = !!document.fullscreenElement;
      if (vol) { await document.exitFullscreen().catch(() => {}); await slaap(800); }
      return { knop: true, fullscreenEnabled: document.fullscreenEnabled, volGelukt: vol };`) },
    { naam: "terug (veeg): van het digibord naar de les", terug: true, wacht: `${ZICHT(".ls-les")} && !document.querySelector(".lb")` },
    { naam: "lesroutes: Presentatie gaat via de ouderpoort (staat niet in de app)", js: js(`klik('.ls-les a.bk-knop[href^="/bijbelreis/boekje"]'); return "ok";`), wacht: ZICHT("#appPoort") },
    { naam: "lesroutes: poort sluiten", js: js(`klik("#appPoort [data-poort-dicht]"); return "ok";`), wacht: `document.getElementById("appPoort").hidden && location.pathname === "/bijbelreis/lessen.html"` },
    { naam: "lesroutes: ‘In de atlas’ opent de geschiedenis in de atlas", js: js(`
      const a = document.querySelector('.ls-les a.bk-knop[href^="/bijbelreis#v"]');
      window.__nr = a.getAttribute("href").split("#")[1];
      sessionStorage.setItem("test-nr", window.__nr);
      setTimeout(() => a.click(), 50);
      return window.__nr;`), wacht: `location.pathname === "/" && location.hash === "#" + sessionStorage.getItem("test-nr") && ${VERHAAL}`, ms: 20000 },
    { naam: "terug (veeg): van de atlas terug bij de lesroute", terug: true, wacht: `location.pathname === "/bijbelreis/lessen.html" && ${ZICHT(".ls-les")}`, ms: 20000 },
    { naam: "privacy in de app", js: js(`setTimeout(() => { location.href = "/bijbelreis/privacy.html"; }, 50); return "ok";`), wacht: `location.pathname === "/bijbelreis/privacy.html" && /De app verzamelt niets/.test(document.body.innerText)`, foto: "09-privacy" },
    veilig("privacy"),
    { naam: "hulp: ‘Bronnen en licenties’ vanuit de atlas, in de app", js: js(`
      setTimeout(() => { location.href = "/"; }, 50);
      return "ok";`), wacht: `location.pathname === "/" && !!document.querySelector('.bronlink a[href="/bijbelreis/hulp#bronnen"]')`, ms: 30000 },
    { naam: "hulp: de link opent de hulppagina in de app (#bronnen)", js: js(`setTimeout(() => document.querySelector('.bronlink a').click(), 50); return "ok";`), wacht: `location.pathname === "/bijbelreis/hulp.html" && location.hash === "#bronnen" && !!window.bijbelreisApp`, ms: 20000 },
    { naam: "hulp: de licentie van Leaflet opent in een venster in de app", js: js(`klik('a[href$="LICENSE-leaflet.txt"]'); return "ok";`), wacht: `${ZICHT("#appTekst")} && /Leaflet|BSD|Copyright/i.test(document.querySelector("#appTekst pre").textContent) && location.pathname === "/bijbelreis/hulp.html"`, foto: "09b-licentie" },
    { naam: "geen verzoeken buiten de app", js: NETWERK },
  ],

  // Na het helemaal afsluiten en opnieuw starten: de voortgang staat er nog.
  herstart: [
    { naam: "herstart: atlas geladen", wacht: ATLAS_KLAAR, ms: 45000, foto: "10-na-herstart" },
    { naam: "herstart: voortgang (localStorage) en reservekopie zijn er nog", js: js(`
      const lokaal = Object.keys(localStorage).filter((k) => k.startsWith("bijbelreis:"));
      if (lokaal.length < 3) return "FOUT voortgang weg: " + lokaal.join(",");
      const r = await window.Capacitor.Plugins.Preferences.get({ key: "bijbelreis-voortgang" });
      if (!r || !r.value) return "FOUT reservekopie weg";
      return lokaal.length + " sleutels";`) },
  ],

  // Liggend (iPhone met het Dynamic Island opzij, iPad liggend): veilige zones en weergave.
  liggend: [
    { naam: "liggend: atlas geladen", wacht: ATLAS_KLAAR, ms: 45000 },
    { naam: "liggend: draaien", draai: "liggend", wacht: "innerWidth > innerHeight", ms: 10000 },
    { naam: "liggend: een reis (#abraham/4)", js: js(`location.hash = "#abraham/4"; return "ok";`), wacht: `${KAART} && location.hash.startsWith("#abraham")`, foto: "11-liggend-reis" },
    veilig("liggend, reis"),
    { naam: "liggend: een verhaal (#v26)", js: js(`location.hash = "#v26"; return "ok";`), wacht: VERHAAL, foto: "12-liggend-verhaal" },
    veilig("liggend, verhaal"),
    { naam: "liggend: De wereld in die tijd (Daniël en Babylon)", js: js(`location.hash = "#v75"; await wachtOp(() => zicht(".wt-ingang")); klik(".wt-ingang"); return "ok";`), wacht: `${ZICHT("#wtLaag")} && !!document.querySelector(".wt-app .wt-svg .wt-balk")`, ms: 20000, foto: "13-liggend-wereld" },
    veilig("liggend, De wereld in die tijd"),
    { naam: "liggend: terug (veeg) uit De wereld in die tijd", terug: true, wacht: `!${ZICHT("#wtLaag")} && location.hash === "#v75"` },
    { naam: "weer staand", draai: "staand", wacht: "innerHeight > innerWidth", ms: 10000 },
  ],

  // Schermafbeeldingen voor de App Store, in de echte iOS-weergave. Zelfde vijf schermen als scripts/screenshots.mjs.
  // De voortgang is verzonnen: de test loopt zelf een paar geschiedenissen en reizen door, zoals een kind dat zou doen.
  appstore: [
    { naam: "appstore: atlas geladen", wacht: ATLAS_KLAAR, ms: 45000 },
    { naam: "appstore: voortgang van een kind op ‘Zelf op reis’", js: js(`
      localStorage.clear();
      localStorage.setItem("bijbelreis:niveau", JSON.stringify("b"));
      localStorage.setItem("bijbelreis:welkomWeg", "true");
      sessionStorage.setItem("bijbelreis-app:hersteld", "1");
      window.__voorHerladen = true;
      setTimeout(() => location.reload(), 50);
      return "ok";`), wacht: `!window.__voorHerladen && ${ATLAS_KLAAR}`, ms: 45000 },
    { naam: "appstore: een paar geschiedenissen en reizen doorlopen", js: js(`
      for (const h of ["#v1", "#v2", "#v3", "#v5", "#v8", "#abraham/1", "#abraham/2", "#abraham/3", "#abraham/4", "#abraham/5", "#abraham/6", "#abraham/7", "#uittocht/1", "#uittocht/2", "#uittocht/3"]) { location.hash = h; await slaap(700); }
      const s = document.createElement("style"); s.textContent = ".toast{display:none!important}"; document.head.appendChild(s);
      return "ok";`), ms: 30000 },
    { naam: "appstore: 1 een geschiedenis", js: js(`location.hash = "#v26"; return "ok";`), wacht: `${VERHAAL} && ${KAART}`, foto: "1-verhaal" },
    { naam: "appstore: 2 een reis met tekening", js: js(`
      location.hash = "#uittocht/6";
      await wachtOp(() => document.querySelector(".tafereel"));
      const blad = document.getElementById("bladBtn");
      if (blad && blad.getClientRects().length && getComputedStyle(blad).display !== "none") { blad.click(); await slaap(700); document.querySelector(".tafereel").scrollIntoView({ block: "center" }); }
      document.activeElement && document.activeElement.blur && document.activeElement.blur();
      return "ok";`), wacht: KAART, foto: "2-reis-tafereel" },
    { naam: "appstore: 3 Wie is wie", js: js(`location.hash = "#abraham/7"; await slaap(700); klik("#t-wie"); document.activeElement.blur(); return "ok";`), wacht: ZICHT("#p-wie"), foto: "3-wie-is-wie" },
    { naam: "appstore: 4 Speurtocht met een goed antwoord", js: js(`
      for (let poging = 0; poging < 15; poging++) {
        location.hash = "#abraham"; await slaap(700);
        klik("#t-quiz"); await slaap(300); klik("#qGo");
        await wachtOp(() => document.querySelector("#p-quiz .qtext"));
        if (document.querySelector("#qUndo")) continue;
        const q = document.querySelector("#p-quiz .qtext").textContent.trim();
        let goed = null;
        for (const lv of Object.values(BR.niveaus.verhalen)) for (const v of Object.values(lv || {})) for (const x of (v && v.vragen) || []) if (x.q === q) goed = goed || x.a[0];
        const opts = [...document.querySelectorAll("#p-quiz .opt")];
        const o = opts.find((e) => e.textContent.trim() === goed);
        if (!goed || !o) continue;
        o.click();
        await wachtOp(() => document.querySelector("#qRes .feedback.ok"));
        await slaap(600);
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
        return "poging " + (poging + 1);
      }
      return "FOUT geen speurtochtvraag met één goed antwoord";`), ms: 60000, foto: "4-speurtocht" },
    { naam: "appstore: 5 Paspoort", js: js(`location.hash = "#abraham/7"; await slaap(700); klik("#t-pas"); await wachtOp(() => document.querySelector("#pasVerder .pv-tekst")); window.scrollTo(0, 0); document.activeElement.blur(); return "ok";`), wacht: ZICHT("#p-pas"), foto: "5-paspoort" },
  ],
};

// Zo kan de test het scenario als JSON in de app zetten.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop()) && process.argv[2]) {
  process.stdout.write(JSON.stringify(SCENARIOS[process.argv[2]], null, 1));
}
