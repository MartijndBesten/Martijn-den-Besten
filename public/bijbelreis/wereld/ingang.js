// ‘De wereld in die tijd’: de ingang. Klein en altijd geladen: de vlag, welke geschiedenissen een periode hebben (het
// register hieronder), de uitnodiging in een geschiedenis, en het openen en sluiten van de laag. De laag zelf (kern.js,
// wereld.js, wereld.css) en de gegevens (perioden/<id>.json) laden pas als iemand hem opent.
// Uitleg: docs/bijbelreis-wereld/README.md.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
(function () {
  "use strict";
  // ---------- de vlag ----------
  // AAN: de uitnodiging staat bij de verhalen met een koppeling. Op één apparaat anders (testen): ?wereld=0 in het adres
  // zet hem uit, ?wereld=1 aan (bijbelreis:wereld in localStorage). Een diepe link (#wereld/<periode>/<jaar>) werkt altijd.
  const AAN = true;

  /* REGISTER:BEGIN — geschreven door scripts/bijbelreis-wereld.mjs uit perioden/*.json; niet met de hand bewerken. */
  const PERIODEN = {"adam-noach":{"titel":"Van Adam tot Abram","verhalen":{"v2":0,"v4":130,"v5":1656,"v6":1657,"v7":1657,"v8":2083}},"daniel-babylon":{"titel":"Daniël en Babylon","verhalen":{"v71":586,"v73":605,"v74":603,"v75":539,"v76":538}},"david-salomo":{"titel":"David en Salomo","verhalen":{"v50":1050,"v51":1050,"v52":1025,"v53":1050,"v54":1020,"v55":1010,"v56":1010,"v57":1003,"v58":1000,"v59":990,"v60":970,"v61":966,"v62":940}},"geboorte-jezus":{"titel":"Herodes en de keizers van Rome","verhalen":{"v80":-7,"v81":-7,"v82":-6,"v83":-6,"v84":-6,"v85":-6,"v86":7,"v87":28,"v100":28,"v125":30}},"israel-assyrie":{"titel":"Israël, Juda en Assyrië","verhalen":{"v63":874,"v64":850,"v65":841,"v66":722,"v67":701,"v69":793,"v70":793,"v72":740}},"mozes":{"titel":"Mozes, Egypte en de woestijnreis","verhalen":{"v21":0,"v22":40,"v23":79.55,"v24":79.75,"v25":80.2,"v26":80.225,"v27":80.28,"v28":80.3,"v29":80.325,"v30":80.45,"v31":81.16,"v32":81.17,"v33":81.42,"v34":119.15,"v35":119.72,"v36":119.9}},"perzie":{"titel":"Perzië: Esther, Ezra en Nehemia","verhalen":{"v77":483,"v78":474,"v79":520}}};
  /* REGISTER:EIND */

  const heeftDom = typeof document !== "undefined" && typeof location !== "undefined";
  let vlag = AAN;
  if (heeftDom) {
    try {
      const q = new URLSearchParams(location.search).get("wereld");
      if (q === "1" || q === "0") localStorage.setItem("bijbelreis:wereld", q);
      const eigen = localStorage.getItem("bijbelreis:wereld");
      vlag = eigen === "1" ? true : eigen === "0" ? false : AAN;
    } catch { /* geen opslag: dan de vaste stand */ }
  }

  // Bij welke periode en welk jaar hoort een geschiedenis?
  function koppeling(nr) {
    for (const [id, p] of Object.entries(PERIODEN)) if (p.verhalen && ("v" + nr) in p.verhalen) return { periode: id, jaar: p.verhalen["v" + nr], titel: p.titel };
    return null;
  }

  // ---------- adres ----------
  // #wereld/<periode>/<jaar>. Het jaar staat zoals op de as van de periode (bij v.Chr. het getal zonder min; op een as
  // die v.Chr. en n.Chr. samen toont, is een jaar v.Chr. negatief: #wereld/geboorte-jezus/-4).
  const ADRES = /^#wereld\/([a-z0-9-]{1,40})(?:\/(-?\d{1,5}))?$/;
  const adres = (periode, jaar) => "#wereld/" + periode + (jaar != null && isFinite(jaar) ? "/" + Math.round(jaar) : "");
  function uitAdres(hash, staat) {
    const m = ADRES.exec(hash || "");
    if (!m) return null;
    const terug = staat && typeof staat.wereldTerug === "string" && /^#[A-Za-z0-9][\w/-]{0,60}$/.test(staat.wereldTerug) ? staat.wereldTerug : "";
    return { periode: m[1], jaar: m[2] != null ? +m[2] : null, terug };
  }

  // ---------- laden ----------
  const DV = (() => { try { return JSON.parse(document.querySelector('meta[name="bijbelreis-data"]').content); } catch { return {}; } })();
  const url = (p) => "/bijbelreis/" + p + (DV[p] ? "?v=" + DV[p] : "");
  let laden = null;
  function laad() {
    if (laden) return laden;
    const script = (p) => new Promise((ok, fout) => { const s = document.createElement("script"); s.src = url(p); s.onload = ok; s.onerror = () => fout(new Error(p)); document.head.appendChild(s); });
    const css = new Promise((ok) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = url("wereld/wereld.css"); l.onload = ok; l.onerror = ok; document.head.appendChild(l); });
    laden = Promise.all([css, script("wereld/kern.js").then(() => script("wereld/wereld.js"))]).then(() => BR.wereldLaag);
    laden.catch(() => { laden = null; });
    return laden;
  }
  const gegevensUrl = (id) => url("wereld/perioden/" + id + ".json");

  // ---------- open en dicht ----------
  let schil = null, terugFocus = null, inertWeg = [];
  const isOpen = () => !!schil && !schil.hidden;
  function maakSchil() {
    schil = document.createElement("div");
    schil.id = "wtLaag";
    schil.className = "wt";
    schil.setAttribute("role", "dialog");
    schil.setAttribute("aria-modal", "true");
    schil.setAttribute("aria-label", "De wereld in die tijd");
    schil.tabIndex = -1;
    // Zonder wereld.css (laden mislukt) toch een net, volledig scherm.
    schil.style.cssText = "position:fixed;inset:0;z-index:1550;background:#f5f0e5;overflow:hidden";
    schil.hidden = true;
    document.body.appendChild(schil);
  }
  // De rest van de pagina is onbereikbaar zolang de laag open is (toetsenbord en schermlezer blijven binnen de laag).
  function zetInert(aan) {
    if (aan) {
      inertWeg = [...document.body.children].filter((el) => el !== schil && el.tagName !== "SCRIPT" && !el.inert && !el.classList.contains("toast") && !el.classList.contains("pwa-melding"));
      inertWeg.forEach((el) => (el.inert = true));
    } else { inertWeg.forEach((el) => (el.inert = false)); inertWeg = []; }
  }
  function open(periode, jaar, opts = {}) {
    if (!heeftDom || !/^[a-z0-9-]{1,40}$/.test(periode || "")) return;
    if (!schil) maakSchil();
    const was = isOpen();
    if (!was) terugFocus = opts.focus || document.activeElement;
    schil.hidden = false;
    document.documentElement.classList.add("wt-open");
    zetInert(true);
    if (!was && BR.laag && !opts.geenGeschiedenis) BR.laag.open("wereld", adres(periode, jaar), { wereldTerug: opts.terug != null ? opts.terug : location.hash });
    if (!schil.firstChild) schil.innerHTML = '<p class="wt-laden" role="status" style="margin:0;padding:40px 24px;font:600 1rem system-ui,sans-serif;color:#474a57">Even laden…</p>';
    schil.focus({ preventScroll: true });
    laad().then((laag) => {
      if (!isOpen()) return;
      laag.toon(schil, { periode, jaar, url: gegevensUrl(periode), koppeling: opts.koppeling || null, terugNaam: opts.terugNaam || "" });
    }).catch(() => {
      if (!isOpen()) return;
      schil.innerHTML = '<div style="max-width:30rem;margin:0 auto;padding:48px 24px;font:1rem/1.5 system-ui,sans-serif;color:#1f2430"><p style="font-weight:700;font-size:1.2rem;margin:0 0 8px">Dit onderdeel kon niet worden geladen.</p><p style="margin:0 0 20px">Controleer de verbinding en probeer het straks nog eens.</p><button type="button" class="btn primary" data-wt-sluit>Terug</button></div>';
      schil.querySelector("[data-wt-sluit]").onclick = () => sluit();
      schil.querySelector("[data-wt-sluit]").focus();
    });
  }
  // stil: de geschiedenis van de browser is al teruggegaan (knop ‘terug’), dus niet nog eens history.back().
  function sluit(opts = {}) {
    if (!isOpen()) return;
    if (BR.wereldLaag) BR.wereldLaag.stop();
    schil.hidden = true;
    document.documentElement.classList.remove("wt-open");
    zetInert(false);
    if (!opts.stil && BR.laag) BR.laag.dicht("wereld");
    const f = terugFocus; terugFocus = null;
    if (f && f.isConnected && typeof f.focus === "function") f.focus({ preventScroll: true });
    if (opts.na) setTimeout(opts.na, 0);
  }
  // Het jaar in het adres bijwerken (vervangen, geen nieuwe plek in de geschiedenis).
  function zetAdres(periode, jaar) {
    if (!isOpen() || !history.state || history.state.laag !== "wereld") return;
    const h = adres(periode, jaar);
    if (location.hash !== h) history.replaceState(history.state, "", h);
  }

  // ---------- de uitnodiging in een geschiedenis ----------
  const LIJNEN = '<svg viewBox="0 0 40 28" aria-hidden="true"><path d="M3 6h22M9 13h26M15 20h18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="25" cy="6" r="2.6" fill="currentColor"/><circle cx="35" cy="13" r="2.6" fill="currentColor"/><path d="M28 2v24" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2.4"/></svg>';
  function inVerhaal(box, g) {
    if (!vlag || !g || !box) return;
    const k = koppeling(g.nr);
    if (!k) return;
    const plek = box.querySelector(".verhaal .wanneer") || box.querySelector(".verhaal .tijd");
    if (!plek || box.querySelector(".wt-ingang")) return;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    plek.insertAdjacentHTML("afterend", `<button type="button" class="wt-ingang" data-wt-periode="${esc(k.periode)}" data-wt-jaar="${k.jaar}"><span class="wt-ingang-beeld">${LIJNEN}</span><span class="wt-ingang-tekst"><b>De wereld in die tijd</b><small>${esc(k.titel)}: wie leefde er tegelijk?</small></span><span class="wt-ingang-pijl" aria-hidden="true">›</span></button>`);
    const knop = box.querySelector(".wt-ingang");
    knop.onclick = () => open(k.periode, k.jaar, { koppeling: "v" + g.nr, terugNaam: g.t, focus: knop });
  }

  BR.wereld = { aan: () => vlag, PERIODEN, koppeling, adres, uitAdres, open, sluit, isOpen, zetAdres, inVerhaal, laad, gegevensUrl };
})();
