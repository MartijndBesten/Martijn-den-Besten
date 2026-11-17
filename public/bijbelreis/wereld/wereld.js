// ‘De wereld in die tijd’: de laag zelf. Levenslijnen (SVG), een kaart die met de tijd meebeweegt (Leaflet, dezelfde
// ondergrond als de atlas), de gebeurtenissen, en de tijdbediening. Rekenen doet kern.js; openen, sluiten, het adres en de
// vlag regelt ingang.js. Deze module wordt pas geladen als iemand de laag opent.
// Uitleg, datamodel en hoe je een periode toevoegt: docs/bijbelreis-wereld/README.md.
(function () {
  "use strict";
  const K = BR.wereldKern;
  const minderBeweging = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const breed = () => window.matchMedia("(min-width: 1024px)").matches;
  const naast = () => window.matchMedia("(min-width: 1180px)").matches;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const opslag = {
    get(k, d) { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)); } catch { /* geen opslag */ } },
  };
  const SVGNS = "http://www.w3.org/2000/svg";

  // Snelheid: welk deel van de hele as per seconde (zo duurt een periode van 100 of van 2000 jaar ongeveer even lang).
  const SNELHEID = { rustig: 1 / 70, normaal: 1 / 32, snel: 1 / 14 };
  const SNELNAAM = { rustig: "Rustig", normaal: "Normaal", snel: "Snel" };
  const STATUS = {
    expliciet: ["staat in de Bijbel", "Dit getal of feit staat zo in de Bijbel."],
    berekend: ["berekend", "Uitgerekend met getallen uit de Bijbel."],
    traditioneel: ["traditioneel", "Een traditionele tijdrekening of uitleg, geen gegeven uit de Bijbel."],
    historisch: ["historisch", "Onderbouwd met bronnen buiten de Bijbel, zoals kronieken of opgravingen."],
    benaderd: ["bij benadering", "Een reconstructie: niet precies bekend."],
  };
  const chip = (st) => (STATUS[st] ? `<span class="wt-st wt-st-${st}" title="${esc(STATUS[st][1])}">${esc(STATUS[st][0])}</span>` : "");
  const bronTekst = (b) => (Array.isArray(b) ? b : b ? [b] : []).map((x) => esc(x)).join(" · ");
  const ICON = {
    terug: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    speel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
    pauze: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
    opnieuw: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5v4h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vorige: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 6.2v11.6a.8.8 0 0 1-1.25.66L9 13.1a1.3 1.3 0 0 1 0-2.2l7.75-5.36A.8.8 0 0 1 18 6.2z" fill="currentColor"/></svg>',
    volgende: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 6.2v11.6a.8.8 0 0 0 1.25.66L15 13.1a1.3 1.3 0 0 0 0-2.2L7.25 5.54A.8.8 0 0 0 6 6.2z" fill="currentColor"/></svg>',
    sluit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    kaart: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 12l11-4 14 5 11-4v27l-11 4-14-5-11 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 8v27M31 13v27" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/><circle cx="24" cy="23" r="3" fill="currentColor" opacity=".35"/></svg>',
  };

  // Wat een lijn toont: een leven (vanaf de geboorte) of iets anders (een regering, de tijd in Babel, het profeetschap).
  const LIJN = { leven: "leeft", regering: "regeert", "in Babel": "in Babel", profeet: "profeet" };
  const VOOR = { geboorte: "nog niet geboren", regering: "nog geen koning", weggevoerd: "nog niet weggevoerd", roeping: "nog niet geroepen" };
  const BEGIN = { geboorte: "Geboren", regering: "Koning vanaf", weggevoerd: "Weggevoerd", roeping: "Geroepen" };
  const lijnWoord = (p) => (p.begin === "regering" && p.lijn === "regering" ? "koning" : p.begin === "geboorte" ? "leeft" : LIJN[p.lijn] || p.lijn);
  const allesLevens = () => S.M.personen.every((p) => p.begin === "geboorte");
  const kleurVar = (k, diep) => (diep ? `var(--${k}-deep, var(--${k}-diep, var(--${k})))` : `var(--${k})`);

  let S = null; // de open periode: gegevens, model, tijd, keuzes
  let D = null; // verwijzingen naar elementen
  let raf = 0, laatsteFrame = 0, liveT = 0;

  // ---------- openen ----------
  function toon(schil, opts) {
    if (S && S.periode === opts.periode && D && schil.contains(D.app)) {
      S.koppeling = opts.koppeling || null; S.terugNaam = opts.terugNaam || "";
      pauze(); sluitBlad(); kies(null);
      nadruk(); zetTerugKnop();
      layout();
      zetTijd(beginT(opts), { direct: true, door: "schuif" });
      koppelingSchrift();
      schil.focus({ preventScroll: true });
      return;
    }
    stop();
    schil.setAttribute("aria-labelledby", "wtTitel"); schil.removeAttribute("aria-label");
    schil.innerHTML = '<div class="wt-app wt-laadt"><p class="wt-laden" role="status">Even laden…</p></div>';
    fetch(opts.url).then((r) => { if (!r.ok) throw new Error("niet gevonden (" + r.status + ")"); return r.json(); })
      .then((data) => {
        const fout = K.controleer(data, { plaatsen: BR.plaatsen, mensen: BR.mensen, verhalen: new Set((BR.geschiedenissen || []).map((g) => "v" + g.nr)) });
        if (fout.some((f) => /^(geen gegevens|as ontbreekt)/.test(f)) || !((data.personen || []).length || (data.gebieden || []).length || (data.gebeurtenissen || []).length)) throw new Error("onvolledig");
        if (fout.length) console.warn("Bijbelreis, De wereld in die tijd: " + fout.join("; "));
        bouw(schil, data, opts);
      })
      .catch(() => melding(schil, opts));
  }
  function melding(schil, opts) {
    S = null; D = null;
    schil.setAttribute("aria-label", "De wereld in die tijd"); schil.removeAttribute("aria-labelledby");
    schil.innerHTML = `<div class="wt-app wt-fout"><div class="wt-fout-box"><p class="wt-label">De wereld in die tijd</p><h2>Deze tijdlijn kon niet worden geladen.</h2><p>Misschien is er even geen verbinding, of zijn de gegevens voor deze periode er nog niet. Je verhaal en je voortgang blijven gewoon bewaard.</p><div class="wt-fout-knoppen"><button type="button" class="btn primary" data-wt-sluit>Terug naar de Bijbelreis</button><button type="button" class="btn" data-wt-opnieuw>Opnieuw proberen</button></div></div></div>`;
    schil.querySelector("[data-wt-sluit]").onclick = () => BR.wereld.sluit();
    schil.querySelector("[data-wt-opnieuw]").onclick = () => toon(schil, opts);
    schil.onkeydown = (e) => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); BR.wereld.sluit(); } };
    schil.querySelector("[data-wt-sluit]").focus();
  }
  function beginT(opts) {
    const M = S.M, j = opts.jaar != null ? opts.jaar : S.data.start;
    const t = j != null ? K.naarT(j, M.as) : M.tMin;
    return Math.max(M.tMin, Math.min(M.tMax, t));
  }

  // ---------- opbouw ----------
  function bouw(schil, data, opts) {
    const M = K.bereid(data, { plaatsen: BR.plaatsen });
    const snel = opslag.get("wereldSnelheid", "normaal");
    S = {
      periode: opts.periode, data, M, as: M.as, t: M.tMin, venster: [M.tMin, M.tMax], speelt: false,
      snelheid: SNELHEID[snel] ? snel : "normaal", gekozen: null, vergelijk: null, weergave: "lijnen", koppeling: opts.koppeling || null,
      terugNaam: opts.terugNaam || "", momenten: K.momenten(M), bereikt: new Set(), kaart: null, blad: null, rh: 40,
    };
    const as = M.as, label = asLabel(as);
    const titel = esc(data.titel).replace(/^(Van )(\S+)( tot )(\S+)$/, '$1<em>$2</em>$3<em>$4</em>');
    const rijen = M.personen.map((p) => `<li class="wt-rij" data-p="${esc(p.id)}"><button type="button" class="wt-naam" data-p="${esc(p.id)}" aria-describedby="wtSub-${esc(p.id)}"><b>${esc(p.naam)}</b><span class="wt-naam-sub" id="wtSub-${esc(p.id)}"></span></button></li>`).join("");
    const merken = M.gebeurtenissen.map((e) => `<i class="wt-merk${e.belangrijk ? " groot" : ""}" style="left:${pct(e.t)}%" data-ev="${esc(e.id)}"></i>`).join("");
    schil.innerHTML = `<div class="wt-app" data-weergave="lijnen" data-kaart="${M.heeftKaart ? 1 : 0}">
      <header class="wt-kop">
        <button type="button" class="wt-terug" data-wt-sluit>${ICON.terug}<span></span></button>
        <div class="wt-titels"><p class="wt-label">De wereld in die tijd</p><h2 id="wtTitel">${titel}</h2>${data.ondertitel ? `<p class="wt-onder">${esc(data.ondertitel)}</p>` : ""}</div>
        <button type="button" class="wt-overknop" data-wt-over aria-haspopup="dialog" aria-label="Over deze tijdlijn: bronnen en hoe zeker het is">${ICON.info}<span>Over deze tijdlijn</span></button>
      </header>
      <div class="wt-jaarbalk">
        <p class="wt-jaar"><span class="wt-jaar-n" id="wtJaar"></span><span class="wt-jaar-l">${esc(label)}</span>${chip(as.status)}</p>
        <div class="wt-weergaven" role="tablist" aria-label="Weergave">
          <button type="button" role="tab" id="wtTab-lijnen" aria-controls="wtP-lijnen" data-weergave="lijnen">Levenslijnen</button>
          <button type="button" role="tab" id="wtTab-kaart" aria-controls="wtP-kaart" data-weergave="kaart">Kaart</button>
          <button type="button" role="tab" id="wtTab-gebeurtenissen" aria-controls="wtP-gebeurtenissen" data-weergave="gebeurtenissen">Gebeurtenissen</button>
        </div>
      </div>
      <div class="wt-hoofd">
        <section class="wt-p wt-p-lijnen" id="wtP-lijnen" role="tabpanel" aria-labelledby="wtTab-lijnen">
          <div class="wt-grafiek" role="group" aria-label="Levenslijnen. Kies een naam voor meer over die persoon; dezelfde gegevens staan ook in een tabel.">
            <div class="wt-askop"><div class="wt-zoom" role="group" aria-label="Tijdas"><button type="button" data-zoom="uit" aria-label="Uitzoomen op de tijdas">−</button><button type="button" data-zoom="in" aria-label="Inzoomen op de tijdas">+</button></div></div>
            <div class="wt-asvlak" aria-hidden="true"><svg class="wt-as"></svg></div>
            <div class="wt-rol">
              <ul class="wt-namen">${rijen}</ul>
              <div class="wt-vlak"><svg class="wt-svg" aria-hidden="true"></svg></div>
            </div>
          </div>
        </section>
        <section class="wt-p wt-p-kaart" id="wtP-kaart" role="tabpanel" aria-labelledby="wtTab-kaart" hidden>${M.heeftKaart ? '<div class="wt-kaartvlak" role="region" aria-label="Kaart van deze periode"></div><details class="wt-legenda"><summary>Legenda</summary><div class="wt-legenda-in"></div></details>' : `<div class="wt-geenkaart">${ICON.kaart}<h3>Geen kaart voor deze tijd</h3><p>${esc(data.kaartUitleg || "Voor deze periode is er geen betrouwbare kaart.")}</p></div>`}</section>
        <section class="wt-p wt-p-gebeurtenissen" id="wtP-gebeurtenissen" role="tabpanel" aria-labelledby="wtTab-gebeurtenissen" hidden><ol class="wt-momenten"></ol></section>
        <aside class="wt-zij" aria-label="Op dit moment"><div class="wt-nu"></div><div class="wt-info" hidden></div></aside>
      </div>
      <div class="wt-bediening" role="group" aria-label="Tijd">
        <p class="wt-onderschrift" aria-hidden="true"><span class="wt-os-jaar"></span><b class="wt-os-titel">Druk op afspelen en zie de tijd lopen</b><span class="wt-os-tekst"></span></p>
        <div class="wt-schuifrij">
          <div class="wt-schuif"><div class="wt-schuif-merken" aria-hidden="true">${merken}</div><input type="range" id="wtSchuif" min="${M.tMin}" max="${M.tMax}" step="${as.stap || 1}" value="${M.tMin}" aria-label="Jaar"></div>
          <div class="wt-randen" aria-hidden="true"><span>${esc(K.jaarTekst(M.tMin, as))}</span><span>${esc(K.jaarTekst(M.tMax, as))}</span></div>
        </div>
        <div class="wt-knoppen">
          <button type="button" class="wt-stap" data-stap="-1" aria-label="Vorig moment">${ICON.vorige}</button>
          <button type="button" class="wt-speel" aria-label="Afspelen">${ICON.speel}</button>
          <button type="button" class="wt-stap" data-stap="1" aria-label="Volgend moment">${ICON.volgende}</button>
          <div class="wt-snelheid" role="group" aria-label="Snelheid">${Object.keys(SNELHEID).map((k) => `<button type="button" data-snel="${k}" aria-pressed="${k === S.snelheid}">${SNELNAAM[k]}</button>`).join("")}</div>
        </div>
      </div>
      <div class="wt-blad" hidden><div class="wt-blad-box" role="dialog" aria-modal="true" aria-labelledby="wtBladTitel" tabindex="-1"><div class="wt-blad-greep" aria-hidden="true"></div><button type="button" class="wt-blad-sluit" aria-label="Sluiten">${ICON.sluit}</button><div class="wt-blad-in"></div></div></div>
      <p class="sr-only" id="wtLive" aria-live="polite" aria-atomic="true"></p>
      ${tabel()}
    </div>`;
    const $ = (s) => schil.querySelector(s);
    D = {
      schil, app: $(".wt-app"), terug: $(".wt-terug"), jaar: $("#wtJaar"), schuif: $("#wtSchuif"), speel: $(".wt-speel"), as: $(".wt-as"), svg: $(".wt-svg"),
      vlak: $(".wt-vlak"), rol: $(".wt-rol"), namen: $(".wt-namen"), onderschrift: $(".wt-onderschrift"), nu: $(".wt-nu"), info: $(".wt-info"),
      blad: $(".wt-blad"), bladIn: $(".wt-blad-in"), live: $("#wtLive"), lijst: $(".wt-momenten"), kaartvlak: $(".wt-kaartvlak"), legenda: $(".wt-legenda-in"),
      sub: new Map(M.personen.map((p) => [p.id, schil.querySelector(`#wtSub-${CSS.escape(p.id)}`)])),
      rij: new Map(M.personen.map((p) => [p.id, schil.querySelector(`.wt-rij[data-p="${CSS.escape(p.id)}"]`)])),
      merk: new Map(M.gebeurtenissen.map((e) => [e.id, schil.querySelector(`.wt-merk[data-ev="${CSS.escape(e.id)}"]`)])),
      el: new Map(), ev: new Map(), gen: new Map(), oud: {},
    };
    zetTerugKnop();
    koppel();
    nadruk();
    lijstOpbouw();
    zetWeergave("lijnen", false);
    S.t = beginT(opts);
    S.bereikt = new Set(M.gebeurtenissen.filter((e) => e.t <= S.t).map((e) => e.id));
    layout();
    zetTijd(S.t, { direct: true, door: "schuif" });
    if (opts.koppeling) koppelingSchrift();
    new ResizeObserver(() => { if (D) { layout(); if (S.kaart) S.kaart.m.invalidateSize({ pan: false }); } }).observe(D.vlak);
    window.matchMedia("(min-width: 1180px)").addEventListener("change", () => D && zetWeergave(S.weergave, false));
    schil.focus({ preventScroll: true });
  }
  const pct = (t) => (S ? ((t - S.M.tMin) / ((S.M.tMax - S.M.tMin) || 1)) * 100 : 0);
  function asLabel(as) {
    if (as.soort !== "am") return "";
    return String(as.label || "na de schepping").replace(/^jaar\s+/i, "");
  }
  // Een jaar of een tijdvak: ‘1656–1657’, ‘603–562 v.Chr.’
  function bereikTekst(t1, t2) {
    if (!(t2 > t1)) return K.jaarTekst(t1, S.as);
    const a = Math.abs(Math.round(K.naarJaar(t1, S.as))), b = Math.abs(Math.round(K.naarJaar(t2, S.as)));
    return S.as.soort === "am" ? `jaar ${a}–${b}` : `${a}–${K.jaarTekst(t2, S.as)}`.replace(/^(\d+)–(\d+) /, (m, x, y) => `${x}–${y} `);
  }
  const jaarVol = (t) => K.jaarTekst(t, S.as) + (S.as.soort === "am" ? " " + asLabel(S.as) : "");
  function zetTerugKnop() {
    D.terug.querySelector("span").textContent = S.terugNaam ? "Terug naar het verhaal" : "Terug";
    D.terug.setAttribute("aria-label", S.terugNaam ? `Terug naar het verhaal: ${S.terugNaam}` : "Terug naar de Bijbelreis");
  }
  const koppelingNu = () => (S && S.koppeling ? (S.data.koppelingen || []).find((x) => x.verhaal === S.koppeling) || null : null);
  // Bij het openen vanuit een verhaal: zeggen waar dit verhaal in de tijd staat (met de toelichting uit de gegevens).
  function koppelingSchrift() {
    const k = koppelingNu();
    if (!k || (!k.opmerking && k.tot == null)) return false;
    const as = S.as, t1 = K.naarT(k.jaar, as), t2 = k.tot != null ? K.naarT(k.tot, as) : t1;
    onderschrift({ t: Math.min(t1, t2), t2: Math.max(t1, t2), titel: S.terugNaam || "Dit verhaal", tekst: k.opmerking || "" });
    return true;
  }
  // Personen en gebeurtenissen die bij het verhaal horen waaruit de laag openging, krijgen nadruk (niet gekozen).
  function nadruk() {
    const k = (S.data.koppelingen || []).find((x) => x.verhaal === S.koppeling);
    const set = new Set(k ? k.personen || [] : []);
    D.rij.forEach((li, id) => li.classList.toggle("nadruk", set.has(id)));
    D.el.forEach((o, id) => o.g.classList.toggle("nadruk", set.has(id)));
    S.nadruk = set;
  }
  // Een tabel met dezelfde gegevens als de levenslijnen, voor de schermlezer.
  function tabel() {
    const M = S.M;
    const r = M.personen.map((p) => {
      const van = p.van && p.van.jaar != null ? `${K.jaarTekst(p.t0, M.as)} (${STATUS[p.van.status] ? STATUS[p.van.status][0] : ""})` : "onbekend";
      const tot = einde(p, true);
      return `<tr><th scope="row">${esc(p.naam)}</th><td>${esc(van)}</td><td>${esc(tot)}</td><td>${esc((p.ref || []).join("; "))}</td></tr>`;
    }).join("");
    return `<div class="sr-only"><table><caption>Levenslijnen: ${esc(S.data.titel)}</caption><thead><tr><th scope="col">Naam</th><th scope="col">Begin</th><th scope="col">Einde</th><th scope="col">In de Bijbel</th></tr></thead><tbody>${r}</tbody></table></div>`;
  }
  function einde(p, lang) {
    const as = S.M.as, tot = p.tot || {};
    if (p.einde === "onbekend") return lang ? "onbekend (laatst genoemd in " + K.jaarTekst(p.t1, as) + ")" : "einde onbekend";
    if (p.einde === "leeft door") return p.lijn === "regering" ? "regeert na deze periode door" : "leeft na deze periode door";
    const ld = tot.leeftijd != null ? tot.leeftijd : K.leeftijd(p, p.t1);
    const wat = p.einde === "weggenomen" ? (lang ? "God nam hem weg" : "weggenomen") : "stierf";
    return lang ? `${wat} in ${K.jaarTekst(p.t1, as)}${ld != null ? `, ${ld} jaar oud` : ""}` : wat;
  }

  // ---------- bediening ----------
  function koppel() {
    const a = D.app;
    a.addEventListener("click", (e) => {
      const b = e.target.closest("button, [data-e]");
      if (!b) return;
      if (b.matches("[data-wt-sluit]")) return BR.wereld.sluit();
      if (b.matches("[data-wt-over]")) return over(b);
      if (b.matches("[data-weergave]")) return zetWeergave(b.dataset.weergave, true);
      if (b.matches(".wt-speel")) return S.speelt ? pauze() : speel();
      if (b.matches("[data-stap]")) return stap(+b.dataset.stap);
      if (b.matches("[data-snel]")) { S.snelheid = b.dataset.snel; opslag.set("wereldSnelheid", S.snelheid); a.querySelectorAll("[data-snel]").forEach((x) => x.setAttribute("aria-pressed", x === b)); return; }
      if (b.matches("[data-zoom]")) return zoom(b.dataset.zoom === "in" ? 2 : 0.5);
      if (b.matches(".wt-blad-sluit")) return sluitBlad();
      if (b.matches("[data-naar]")) { const t = +b.dataset.naar; if (b.closest(".wt-momenten") && !breed()) zetWeergave("lijnen", false); return naar(t); }
      if (b.matches("[data-vergelijk]")) return vergelijk(b.dataset.vergelijk);
      if (b.matches("[data-e]")) return toonGebeurtenis(b.dataset.e, b);
      if (b.matches("[data-stad]")) return toonStad(b.dataset.stad, b);
      if (b.matches("[data-verhaal]")) return naarVerhaal(+b.dataset.verhaal);
      if (b.matches("[data-p]")) return kies(b.dataset.p, b);
      if (b.matches("[data-wt-info-sluit]")) return sluitInfo();
    });
    D.schuif.addEventListener("input", () => { pauze(); zetTijd(+D.schuif.value, { direct: true, door: "schuif", onderschrift: true }); });
    D.schuif.addEventListener("change", () => meldLive(true));
    D.blad.addEventListener("click", (e) => { if (e.target === D.blad) sluitBlad(); });
    // Tabs met pijltjes.
    a.querySelector(".wt-weergaven").addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const tabs = [...a.querySelectorAll('[role="tab"]')].filter((x) => !x.hidden);
      const i = tabs.indexOf(document.activeElement);
      const j = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault(); e.stopPropagation(); tabs[j].focus(); zetWeergave(tabs[j].dataset.weergave, true);
    });
    D.schil.onkeydown = toets;
    vlakBediening();
    document.addEventListener("visibilitychange", () => { if (document.hidden) pauze(); });
  }
  // Toetsen in de laag: ze gaan niet door naar de atlas eronder (daar zijn de pijltjes voor de reisstappen).
  function toets(e) {
    e.stopPropagation();
    if (!S) return;
    const doel = e.target, inVeld = doel.matches && doel.matches("input, select, textarea");
    const opKnop = doel.matches && doel.matches("button, a, [role='tab']");
    if (e.key === "Escape") {
      e.preventDefault();
      if (!D.blad.hidden) return sluitBlad();
      if (!D.info.hidden) return sluitInfo();
      return BR.wereld.sluit();
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === " " && !opKnop && !inVeld) { e.preventDefault(); return S.speelt ? pauze() : speel(); }
    if (inVeld) return; // de schuif bedient zichzelf met de pijltjes
    if (doel.closest && doel.closest("[role='tablist']")) return;
    const st = S.as.stap || 1;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pauze(); zetTijd(S.t + (e.key === "ArrowRight" ? 1 : -1) * st * (e.shiftKey ? 10 : 1), { direct: true }); meldLive(); }
    else if (e.key === "PageDown") { e.preventDefault(); stap(1); }
    else if (e.key === "PageUp") { e.preventDefault(); stap(-1); }
    else if (e.key === "Home") { e.preventDefault(); pauze(); zetTijd(S.M.tMin, { direct: true }); meldLive(); }
    else if (e.key === "End") { e.preventDefault(); pauze(); zetTijd(S.M.tMax, { direct: true }); meldLive(); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoom(2); }
    else if (e.key === "-") { e.preventDefault(); zoom(0.5); }
  }

  // ---------- afspelen ----------
  function speel() {
    if (S.speelt) return;
    if (S.t >= S.M.tMax - 1e-6) zetTijd(S.M.tMin, { direct: true });
    S.speelt = true; zetSpeelKnop();
    sluitBladAlsKlein();
    if (minderBeweging()) { springVerder(); return; }
    laatsteFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pauze() {
    if (!S || !S.speelt) return;
    S.speelt = false; cancelAnimationFrame(raf); clearTimeout(S.sprong); zetSpeelKnop();
    adresBij(); meldLive(true);
  }
  function stop() { if (S) { S.speelt = false; clearTimeout(S.sprong); cancelAnimationFrame(raf); clearTimeout(S.os); } }
  function zetSpeelKnop() {
    const eind = !S.speelt && S.t >= S.M.tMax - 1e-6, k = S.speelt ? "p" : eind ? "e" : "s";
    if (D.oud.knop === k) return;
    D.oud.knop = k;
    D.speel.innerHTML = S.speelt ? ICON.pauze : eind ? ICON.opnieuw : ICON.speel;
    D.speel.setAttribute("aria-label", S.speelt ? "Pauzeren" : eind ? "Opnieuw afspelen" : "Afspelen");
    D.app.classList.toggle("speelt", S.speelt);
  }
  // Rustiger rond een belangrijke gebeurtenis: dan heb je tijd om te zien wat er gebeurt.
  function tempo(t) {
    const span = S.M.tMax - S.M.tMin, zone = span * 0.012;
    let f = 1;
    for (const e of S.M.gebeurtenissen) if (e.belangrijk) { const d = t < e.t ? e.t - t : t > e.t2 ? t - e.t2 : 0; if (d < zone) f = Math.min(f, 0.28 + 0.72 * (d / zone)); }
    return f;
  }
  function frame(nu) {
    if (!S || !S.speelt) return;
    const dt = Math.min(0.1, (nu - laatsteFrame) / 1000); laatsteFrame = nu;
    const span = S.M.tMax - S.M.tMin;
    let t = S.t + dt * span * SNELHEID[S.snelheid] * tempo(S.t);
    if (t >= S.M.tMax) { t = S.M.tMax; zetTijd(t, { volg: true }); S.speelt = false; zetSpeelKnop(); adresBij(); meldLive(true); return; }
    zetTijd(t, { volg: true });
    raf = requestAnimationFrame(frame);
  }
  // Minder beweging: afspelen springt van moment naar moment, zonder tussenbeeld.
  function springVerder() {
    if (!S.speelt) return;
    const m = S.momenten.find((x) => x.t > S.t + 1e-6);
    if (!m) { zetTijd(S.M.tMax, { direct: true }); S.speelt = false; zetSpeelKnop(); adresBij(); meldLive(true); return; }
    zetTijd(m.t, { direct: true, volg: true });
    S.sprong = setTimeout(springVerder, 1600);
  }
  function stap(r) {
    pauze();
    const lijst = S.momenten, eps = 1e-6;
    const m = r > 0 ? lijst.find((x) => x.t > S.t + eps) : [...lijst].reverse().find((x) => x.t < S.t - eps);
    naar(m ? m.t : r > 0 ? S.M.tMax : S.M.tMin);
  }
  // Naar een jaar: een korte, rustige overgang (bij minder beweging meteen).
  function naar(t) {
    pauze();
    t = Math.max(S.M.tMin, Math.min(S.M.tMax, t));
    const van = S.t, duur = minderBeweging() ? 0 : Math.min(900, 300 + Math.abs(t - van) / (S.M.tMax - S.M.tMin) * 1400);
    cancelAnimationFrame(raf);
    if (!duur) { zetTijd(t, { direct: true, volg: true, onderschrift: true }); adresBij(); meldLive(true); return; }
    const t0 = performance.now();
    const stapje = (nu) => {
      const f = K.vloeiend(Math.min(1, (nu - t0) / duur));
      zetTijd(van + (t - van) * f, { volg: true, onderschrift: f === 1 });
      if (f < 1) raf = requestAnimationFrame(stapje); else { adresBij(); meldLive(true); }
    };
    raf = requestAnimationFrame(stapje);
  }
  let adresT = 0;
  function adresBij() { clearTimeout(adresT); adresT = setTimeout(() => S && BR.wereld.zetAdres(S.periode, Math.round(K.naarJaar(S.t, S.as))), 250); }

  // ---------- de tijd zetten: alleen bijwerken wat verandert ----------
  function zetTijd(t, o = {}) {
    if (!S) return;
    const M = S.M, vorig = S.t;
    t = Math.max(M.tMin, Math.min(M.tMax, t));
    S.t = t;
    if (o.volg) volg(t);
    const vooruit = t > vorig && S.speelt;
    // Gebeurtenissen die nu bereikt worden.
    const nieuw = [];
    M.gebeurtenissen.forEach((e) => {
      const was = S.bereikt.has(e.id), is = t >= e.t - 1e-6;
      if (is && !was) { S.bereikt.add(e.id); if (vooruit || o.onderschrift) nieuw.push(e); }
      else if (!is && was) S.bereikt.delete(e.id);
    });
    teken(t, vorig, vooruit);
    const jt = K.jaarTekst(t, S.as, true);
    if (D.oud.jaar !== jt) { D.jaar.textContent = S.as.soort === "am" ? Math.round(t) : K.jaarTekst(t, S.as); D.oud.jaar = jt; }
    D.schuif.value = t;
    D.schuif.setAttribute("aria-valuetext", jaarVol(t));
    D.schuif.style.setProperty("--pct", pct(t) + "%");
    D.merk.forEach((el, id) => el.classList.toggle("af", S.bereikt.has(id)));
    if (Math.floor(t) !== D.oud.nuJaar || o.direct) { D.oud.nuJaar = Math.floor(t); zijBij(); lijstBij(); }
    if (S.kaart) kaartTijd(t, nieuw);
    if (nieuw.length) { const e = nieuw[nieuw.length - 1]; onderschrift(e); if (S.speelt) meldGebeurtenis(e); }
    else if (o.door === "schuif") {
      // Met de schuif: het laatste dat gebeurd is (of de uitnodiging om af te spelen, vóór de eerste gebeurtenis).
      const e = [...M.gebeurtenissen].reverse().find((x) => x.t <= t + 1e-6);
      if (e) onderschrift(e); else if (S.osId) { S.osId = null; const os = D.onderschrift; os.classList.remove("gevuld"); os.querySelector(".wt-os-jaar").textContent = ""; os.querySelector(".wt-os-titel").textContent = "Druk op afspelen en zie de tijd lopen"; os.querySelector(".wt-os-tekst").textContent = ""; }
    }
    else if (o.onderschrift) { const e = [...M.gebeurtenissen].reverse().find((x) => x.t <= t + 1e-6 && t <= x.t2 + (M.tMax - M.tMin) * 0.02); if (e) onderschrift(e); }
    if (!S.speelt) zetSpeelKnop();
    if (S.gekozen && D.oud.infoJaar !== Math.floor(t)) infoNu();
  }
  function onderschrift(e) {
    const o = D.onderschrift;
    const sleutel = e.id || e.titel + e.t;
    if (S.osId === sleutel) return;
    S.osId = sleutel;
    o.querySelector(".wt-os-jaar").textContent = bereikTekst(e.t, e.t2);
    o.querySelector(".wt-os-titel").textContent = e.titel;
    o.querySelector(".wt-os-tekst").textContent = e.tekst;
    o.classList.add("gevuld");
    o.classList.remove("aan"); void o.offsetWidth; o.classList.add("aan");
  }
  // Voor de schermlezer: niet bij elk beeld, alleen als de tijd stilstaat of als er iets gebeurt.
  function meldLive(nu) {
    clearTimeout(liveT);
    liveT = setTimeout(() => {
      if (!S) return;
      const leven = S.M.personen.filter((p) => K.leeftNog(p, S.t)).length;
      const e = [...S.M.gebeurtenissen].reverse().find((x) => x.t <= S.t + 1e-6 && S.t <= x.t2 + 1);
      D.live.textContent = `${jaarVol(S.t)}. ${e ? e.titel + ". " : ""}${leven} van de ${S.M.personen.length} personen op deze tijdlijn ${allesLevens() ? "leven" : "zijn in beeld"}.`;
    }, nu ? 120 : 700);
  }
  let laatsteMelding = 0;
  function meldGebeurtenis(e) {
    const nu = performance.now();
    if (nu - laatsteMelding < 2000) return;
    laatsteMelding = nu;
    D.live.textContent = `${jaarVol(e.t)}: ${e.titel}.`;
  }

  // ---------- levenslijnen: opbouw (bij formaat, zoom, schuiven) ----------
  function maak(naam, attrs, ouder) {
    const el = document.createElementNS(SVGNS, naam);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (ouder) ouder.appendChild(el);
    return el;
  }
  function layout() {
    if (!S || !D) return;
    const M = S.M, W = D.vlak.clientWidth;
    if (!W) return;
    // De rijen vullen de hoogte (binnen grenzen); passen ze niet, dan scrolt de lijst.
    const n = Math.max(1, M.personen.length), beschikbaar = D.rol.clientHeight;
    const rh = Math.round(Math.max(breed() ? 38 : 34, Math.min(58, beschikbaar ? beschikbaar / n : 40)));
    if (S.rh !== rh) D.app.style.setProperty("--rij-h", rh + "px");
    S.rh = rh;
    const H = M.personen.length * rh;
    const padL = 14, padR = W < 520 ? 34 : 64;
    const sc = K.schaal(S.venster[0], S.venster[1], padL, W - padR);
    S.sc = sc; S.W = W; S.H = H;
    const svg = D.svg;
    svg.setAttribute("width", W); svg.setAttribute("height", H); svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.textContent = "";
    const defs = maak("defs", {}, svg);
    const grad = (id, a, b) => { const g = maak("linearGradient", { id, x1: 0, x2: 1, y1: 0, y2: 0 }, defs); maak("stop", { offset: 0, class: "wt-stop", "stop-opacity": a }, g); maak("stop", { offset: 1, class: "wt-stop", "stop-opacity": b }, g); };
    grad("wtKopVaag", 0, 1); grad("wtStaartVaag", 1, 0);
    // raster
    const { ticks } = K.streepjes(S.venster[0], S.venster[1], sc.k, W < 520 ? 56 : 84);
    const raster = maak("g", { class: "wt-raster" }, svg);
    ticks.forEach((t) => maak("line", { x1: sc.x(t), x2: sc.x(t), y1: 0, y2: H }, raster));
    for (let i = 1; i < M.personen.length; i++) maak("line", { class: "wt-rijlijn", x1: 0, x2: W, y1: i * rh, y2: i * rh }, raster);
    // gebeurtenissen
    const gEv = maak("g", { class: "wt-ev" }, svg);
    D.ev = new Map();
    M.gebeurtenissen.forEach((e) => {
      const g = maak("g", { class: "wt-e" + (e.belangrijk ? " belangrijk" : ""), "data-ev": e.id, style: `--ek: var(--${/^[a-z]+$/.test(e.kleur || "") ? e.kleur : "oker"})` }, gEv);
      const x1 = sc.x(e.t), x2 = sc.x(e.t2);
      let band = null;
      if (x2 - x1 > 0.5) band = maak("rect", { class: "wt-e-band", x: x1, y: 0, width: x2 - x1, height: H }, g);
      else band = maak("rect", { class: "wt-e-band smal", x: x1 - 3, y: 0, width: 6, height: H }, g);
      if (e.margeT) maak("rect", { class: "wt-e-marge", x: sc.x(e.margeT[0]) - 2, y: 0, width: Math.max(4, sc.x(e.margeT[1]) - sc.x(e.margeT[0]) + 4), height: H }, g);
      maak("line", { class: "wt-e-lijn", x1, x2: x1, y1: 0, y2: H }, g);
      D.ev.set(e.id, { g, band });
    });
    // Het verhaal waaruit de laag openging, als het een tijdvak beslaat (bijv. ‘ergens in de regering van Nebukadnezar’).
    const kp = koppelingNu();
    if (kp && kp.tot != null) {
      const a = sc.x(K.naarT(kp.jaar, M.as)), b = sc.x(K.naarT(kp.tot, M.as));
      maak("rect", { class: "wt-kopband", x: Math.min(a, b), y: 0, width: Math.max(2, Math.abs(b - a)), height: H }, svg);
    }
    // generaties: ouder → kind
    const gGen = maak("g", { class: "wt-gen" }, svg);
    D.gen = new Map();
    M.personen.forEach((p) => {
      const o = p.ouder && M.byId.get(p.ouder);
      if (!o) return;
      const x = sc.x(p.t0), y1 = o.rij * rh + rh / 2 + 4, y2 = p.rij * rh + rh / 2 - 4;
      const r = Math.min(6, Math.abs(y2 - y1) / 2);
      const d = y2 > y1 ? `M${x} ${y1} V${y2 - r}` : `M${x} ${y1} V${y2 + r}`;
      const pad = maak("path", { class: "wt-gl" + (p.beginOnzeker ? " vaag" : ""), d, pathLength: 1 }, gGen);
      const stip = maak("circle", { class: "wt-gl-stip", cx: x, cy: o.rij * rh + rh / 2, r: 2.4 }, gGen);
      D.gen.set(p.id, { pad, stip });
    });
    // levenslijnen
    const gL = maak("g", { class: "wt-lijnen" }, svg);
    D.el = new Map();
    M.personen.forEach((p) => {
      const y = p.rij * rh + rh / 2, x0 = sc.x(p.t0), x1 = sc.x(p.t1);
      const g = maak("g", { class: "wt-l" + (p.beginOnzeker ? " onzeker-begin" : ""), "data-p": p.id }, gL);
      maak("rect", { class: "wt-raak", x: Math.min(x0, x1) - 8, y: y - rh / 2, width: Math.abs(x1 - x0) + 16 + (p.einde === "onbekend" ? 40 : 0), height: rh }, g);
      const spoorEind = p.einde === "onbekend" ? x1 + 40 : p.einde === "leeft door" ? W : x1;
      maak("rect", { class: "wt-spoor" + (p.einde === "onbekend" ? " vaag-eind" : ""), x: x0, y: y - 1, width: Math.max(0, spoorEind - x0), height: 2, rx: 1 }, g);
      if (p.beginOnzeker) maak("rect", { class: "wt-kopvaag", x: x0 - 24, y: y - 3.5, width: 24, height: 7, fill: "url(#wtKopVaag)" }, g);
      // Marge: het jaar is niet precies bekend (bijv. 587 of 586). Een zachte band over de lijn.
      [p.margeVan, p.margeTot].forEach((m, i) => { if (m) maak("rect", { class: "wt-marge " + (i ? "eind" : "begin"), x: sc.x(m[0]) - 4, y: y - 8, width: Math.max(8, sc.x(m[1]) - sc.x(m[0]) + 8), height: 16, rx: 8 }, g); });
      const balk = maak("rect", { class: "wt-balk", x: x0, y: y - 3.5, width: 0, height: 7, rx: 3.5 }, g);
      let staart = null;
      if (p.einde === "onbekend") staart = maak("rect", { class: "wt-staart", x: x1 - 1, y: y - 3.5, width: 44, height: 7, fill: "url(#wtStaartVaag)" }, g);
      let eind = null;
      if (p.einde === "stierf") { eind = maak("g", { class: "wt-eind", transform: `translate(${x1} ${y})` }, g); maak("rect", { x: -1.25, y: -9, width: 2.5, height: 18, rx: 1.25 }, eind); }
      if (p.einde === "leeft door") { eind = maak("g", { class: "wt-eind door", transform: `translate(${x1} ${y})` }, g); maak("path", { d: "M1-5 6 0 1 5" }, eind); }
      if (p.einde === "weggenomen") {
        eind = maak("g", { class: "wt-eind weg", transform: `translate(${x1} ${y})` }, g);
        maak("circle", { class: "wt-weg-gloed", r: 11 }, eind);
        maak("circle", { class: "wt-weg-ring", r: 6.5 }, eind);
        maak("path", { class: "wt-weg-pijl", d: "M-3 1.6 0-1.6 3 1.6" }, eind);
      }
      const bloei = maak("circle", { class: "wt-bloei", cx: x0, cy: y, r: 5 }, g);
      const tip = maak("circle", { class: "wt-tip", cx: x0, cy: y, r: 5 }, g);
      const ld = maak("text", { class: "wt-ld", x: x0, y: y + 4 }, g);
      const eindLabel = maak("text", { class: "wt-ld eindlabel", x: x1 + (p.einde === "weggenomen" ? 15 : 7), y: y + 4 }, g);
      eindLabel.textContent = p.einde === "weggenomen" ? `${p.tot && p.tot.leeftijd != null ? p.tot.leeftijd : ""}${W >= 620 ? (p.tot && p.tot.leeftijd != null ? " · " : "") + "God nam hem weg" : ""}` : p.einde === "stierf" && p.tot && p.tot.leeftijd != null ? String(p.tot.leeftijd) : "";
      D.el.set(p.id, { g, balk, tip, ld, eind, eindLabel, staart, bloei, x0, x1, y, oud: {} });
    });
    S.verg = maak("g", { class: "wt-verg" }, svg);
    S.kop = maak("line", { class: "wt-koplijn", x1: 0, x2: 0, y1: 0, y2: H }, svg);
    asTekenen(ticks);
    nadruk();
    gekozenKlassen();
    D.oud = {};
    teken(S.t, S.t, false);
    tekenVergelijk();
  }
  // De as boven de levenslijnen: jaartallen, gebeurtenissen en de kop van de tijd.
  function asTekenen(ticks) {
    const sc = S.sc, svg = D.as, W = S.W, h = 46;
    svg.setAttribute("width", W); svg.setAttribute("height", h); svg.setAttribute("viewBox", `0 0 ${W} ${h}`);
    svg.textContent = "";
    const g = maak("g", { class: "wt-as-ticks" }, svg);
    ticks.forEach((t) => { const x = sc.x(t); if (x < 4 || x > W - 4) return; maak("line", { x1: x, x2: x, y1: h - 6, y2: h }, g); const tx = maak("text", { x, y: 14, "text-anchor": "middle" }, g); tx.textContent = String(Math.abs(Math.round(K.naarJaar(t, S.as)))); });
    const ge = maak("g", { class: "wt-as-ev" }, svg);
    // Eerst alle merkjes (en de kop van de tijd is smal); dan krijgen belangrijke gebeurtenissen als eerste een label.
    // Een label dat een merkje of ander label raakt, valt weg (het merkje blijft, en de lijst noemt alles).
    const bezet = S.M.gebeurtenissen.map((e) => { const x = sc.x(e.t); return [x - 6, x + 6]; });
    const volgorde = [...S.M.gebeurtenissen].sort((a, b) => (b.belangrijk ? 1 : 0) - (a.belangrijk ? 1 : 0) || a.t - b.t);
    S.asEv = new Map();
    volgorde.forEach((e) => {
      const x = sc.x(e.t);
      if (x < -2 || x > W + 2) return;
      const k = maak("g", { class: "wt-as-e", "data-ev": e.id, transform: `translate(${x} 31)` }, ge);
      maak("path", { d: "M0-5 5 0 0 5-5 0z" }, k);
      const titel = e.titel.length > 26 ? e.titel.slice(0, 25) + "…" : e.titel;
      const breedte = titel.length * 6.3 + 10;
      let links = x + 8;
      if (links + breedte > W - 2) links = x - 8 - breedte;
      if (W >= 420 && !bezet.some(([a, b]) => links < b + 4 && links + breedte > a - 4 && !(a === x - 6 && b === x + 6)) && links > 2) {
        const t = maak("text", { x: links - x, y: 4, class: "wt-as-label" }, k); t.textContent = titel;
        bezet.push([links, links + breedte]);
      }
      S.asEv.set(e.id, k);
    });
    S.asKop = maak("path", { class: "wt-as-kop", d: "M-6 0h12l-6 7z" }, svg);
  }

  // ---------- levenslijnen: per beeld ----------
  function teken(t, vorig, vooruit) {
    const sc = S.sc; if (!sc) return;
    const x = sc.x(t);
    S.kop.setAttribute("x1", x); S.kop.setAttribute("x2", x);
    S.asKop.setAttribute("transform", `translate(${x} 39)`);
    S.M.personen.forEach((p) => {
      const o = D.el.get(p.id); if (!o) return;
      const geboren = t >= p.t0 - 1e-6;
      // In het jaar van zijn dood is iemand er niet meer; bij een onbekend einde pas daarna.
      const voorbij = p.einde === "leeft door" ? false : p.einde === "onbekend" ? t > p.t1 + 1e-6 : t >= p.t1 - 1e-6 && p.t1 > p.t0;
      const tc = Math.max(p.t0, Math.min(t, p.t1)), xc = sc.x(tc);
      const staat = !geboren ? "toekomst" : voorbij ? "voorbij" : "leeft";
      const breedte = geboren ? Math.max(0.001, xc - o.x0) : 0;
      if (o.oud.b !== breedte) { o.balk.setAttribute("width", breedte); o.oud.b = breedte; }
      if (staat === "leeft" && o.oud.xc !== xc) { o.tip.setAttribute("cx", xc); o.oud.xc = xc; }
      const ld = staat === "leeft" ? K.leeftijd(p, t) : null;
      const ldTekst = ld == null ? "" : (p.beginOnzeker ? "±" : "") + ld;
      if (o.oud.ld !== ldTekst) { o.ld.textContent = ldTekst; o.oud.ld = ldTekst; }
      if (staat === "leeft") o.ld.setAttribute("x", xc + 9);
      if (o.oud.staat !== staat) {
        o.g.classList.remove("toekomst", "leeft", "voorbij"); o.g.classList.add(staat);
        const li = D.rij.get(p.id); li.classList.remove("toekomst", "leeft", "voorbij"); li.classList.add(staat);
        o.oud.staat = staat;
      }
      // Geboren tijdens het afspelen: een korte bloei op het begin van de lijn.
      if (vooruit && vorig < p.t0 && t >= p.t0 && !minderBeweging()) { o.bloei.classList.remove("aan"); void o.bloei.getBoundingClientRect(); o.bloei.classList.add("aan"); }
      if (vooruit && p.einde === "weggenomen" && vorig < p.t1 && t >= p.t1 && !minderBeweging() && o.eind) { o.eind.classList.remove("licht"); void o.eind.getBoundingClientRect(); o.eind.classList.add("licht"); }
      const sub = !geboren ? (p.van && p.van.jaar == null ? "" : VOOR[p.begin] || "later") : staat === "leeft" ? (ld == null ? lijnWoord(p) : `${p.beginOnzeker ? "ca. " : ""}${ld} jaar`) : einde(p, false) + (p.einde === "stierf" && p.tot && p.tot.leeftijd != null ? ` · ${p.tot.leeftijd}` : "");
      if (D.oud["s" + p.id] !== sub) { D.sub.get(p.id).textContent = sub; D.oud["s" + p.id] = sub; }
      const gl = D.gen.get(p.id);
      if (gl && gl.oud !== geboren) { gl.pad.classList.toggle("aan", geboren); gl.stip.classList.toggle("aan", geboren); gl.oud = geboren; }
    });
    S.M.gebeurtenissen.forEach((e) => {
      const o = D.ev.get(e.id); if (!o) return;
      const af = t >= e.t - 1e-6, nu = af && t <= e.t2 + Math.max(1, (S.M.tMax - S.M.tMin) * 0.004);
      const st = af ? (nu ? "nu" : "af") : "";
      if (o.oud !== st) {
        o.g.classList.toggle("af", af); o.g.classList.toggle("nu", nu);
        const k = S.asEv && S.asEv.get(e.id); if (k) { k.classList.toggle("af", af); k.classList.toggle("nu", nu); }
        if (af && vooruit && !minderBeweging() && o.oud === "") { o.g.classList.remove("rijst"); void o.g.getBoundingClientRect(); o.g.classList.add("rijst"); }
        o.oud = st;
      }
    });
  }
  // Tijdens afspelen loopt het venster mee als je ingezoomd bent.
  function volg(t) {
    const [a, b] = S.venster, span = b - a;
    if (span >= S.M.tMax - S.M.tMin - 1e-6) return;
    if (t > a + span * 0.82 || t < a + span * 0.05) { S.venster = K.schuif(S.venster, t - span * 0.32 - a, [S.M.tMin, S.M.tMax]); layout(); }
  }
  function zoom(f, rond) {
    const M = S.M;
    const min = Math.max((S.as.stap || 1) * 8, (M.tMax - M.tMin) / 40);
    S.venster = K.zoom(S.venster, f, rond != null ? rond : S.t, [M.tMin, M.tMax], min);
    layout();
    D.app.classList.toggle("ingezoomd", S.venster[1] - S.venster[0] < M.tMax - M.tMin - 1e-6);
  }
  // Slepen (schuiven in de tijd), knijpen (zoomen), tikken (persoon kiezen); verticaal scrolt de lijst gewoon.
  function vlakBediening() {
    const v = D.vlak, wijzers = new Map();
    let sleep = null, knijp = null;
    v.addEventListener("pointerdown", (e) => {
      wijzers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (wijzers.size === 2) { const [a, b] = [...wijzers.values()]; knijp = { d: Math.abs(a.x - b.x) || 1, venster: S.venster.slice() }; sleep = null; }
      else sleep = { x: e.clientX, y: e.clientY, venster: S.venster.slice(), bezig: false, id: e.pointerId };
    });
    v.addEventListener("pointermove", (e) => {
      if (!wijzers.has(e.pointerId)) return;
      wijzers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (knijp && wijzers.size === 2) {
        const [a, b] = [...wijzers.values()], d = Math.abs(a.x - b.x) || 1, r = v.getBoundingClientRect();
        S.venster = knijp.venster.slice();
        zoom(d / knijp.d, S.sc.t((a.x + b.x) / 2 - r.left));
        return;
      }
      if (!sleep || e.pointerId !== sleep.id) return;
      const dx = e.clientX - sleep.x, dy = e.clientY - sleep.y;
      if (!sleep.bezig && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { sleep.bezig = true; try { v.setPointerCapture(e.pointerId); } catch { /* al los */ } }
      if (sleep.bezig) { S.venster = K.schuif(sleep.venster, -dx / S.sc.k, [S.M.tMin, S.M.tMax]); layout(); }
    });
    const los = (e) => {
      const was = sleep;
      wijzers.delete(e.pointerId);
      if (wijzers.size < 2) knijp = null;
      if (was && e.pointerId === was.id) {
        sleep = null;
        if (!was.bezig && e.type === "pointerup") {
          // Tik: welke persoon of gebeurtenis?
          const r = v.getBoundingClientRect(), y = e.clientY - r.top, x = e.clientX - r.left;
          const ev = S.M.gebeurtenissen.find((g) => { const a = S.sc.x(g.t), b = S.sc.x(g.t2); return x >= a - 7 && x <= b + 7; });
          const p = S.M.personen[Math.floor(y / S.rh)];
          const opLijn = p && x >= S.sc.x(p.t0) - 16 && x <= S.sc.x(p.t1) + (p.einde === "onbekend" ? 48 : 16);
          if (p && opLijn) kies(p.id);
          else if (ev) toonGebeurtenis(ev.id);
          else if (p) kies(p.id);
        }
      }
    };
    v.addEventListener("pointerup", los);
    v.addEventListener("pointercancel", los);
    v.addEventListener("wheel", (e) => {
      const r = v.getBoundingClientRect();
      if (e.ctrlKey) { e.preventDefault(); zoom(Math.exp(-e.deltaY * 0.01), S.sc.t(e.clientX - r.left)); D.app.classList.toggle("ingezoomd", S.venster[1] - S.venster[0] < S.M.tMax - S.M.tMin - 1e-6); return; }
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (dx && S.venster[1] - S.venster[0] < S.M.tMax - S.M.tMin - 1e-6) { e.preventDefault(); S.venster = K.schuif(S.venster, dx / S.sc.k, [S.M.tMin, S.M.tMax]); layout(); }
    }, { passive: false });
    D.as.addEventListener("click", (e) => { const k = e.target.closest("[data-ev]"); if (k) naar(S.M.gebeurtenissen.find((g) => g.id === k.dataset.ev).t); });
  }

  // ---------- kiezen en vergelijken ----------
  function kies(id, van) {
    if (!S) return;
    S.gekozen = id && S.M.byId.has(id) ? id : null;
    if (!S.gekozen) S.vergelijk = null;
    gekozenKlassen();
    tekenVergelijk();
    if (!S.gekozen) { if (!D.info.hidden) { D.info.hidden = true; D.info.innerHTML = ""; D.nu.hidden = false; zijBij(); } if (S.blad === "persoon") sluitBlad(); return; }
    pauze();
    S.infoVan = van || null;
    infoKaart();
  }
  function gekozenKlassen() {
    D.app.classList.toggle("heeft-keuze", !!S.gekozen);
    D.el.forEach((o, id) => { o.g.classList.toggle("gekozen", id === S.gekozen); o.g.classList.toggle("vergeleken", id === S.vergelijk); });
    D.rij.forEach((li, id) => { li.classList.toggle("gekozen", id === S.gekozen); li.classList.toggle("vergeleken", id === S.vergelijk); const b = li.querySelector("button"); if (id === S.gekozen) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  function vergelijk(id) {
    S.vergelijk = S.vergelijk === id ? null : id;
    gekozenKlassen(); tekenVergelijk();
    const box = D.blad.hidden ? D.info : D.bladIn;
    box.querySelectorAll("[data-vergelijk]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.vergelijk === S.vergelijk));
    const zin = box.querySelector(".wt-vergelijking");
    if (zin) { zin.innerHTML = S.vergelijk ? vergelijkZin(S.M.byId.get(S.gekozen), S.M.byId.get(S.vergelijk)) : ""; if (S.vergelijk) zin.scrollIntoView({ block: "nearest", behavior: minderBeweging() ? "auto" : "smooth" }); }
  }
  function vergelijkZin(a, b) {
    const o = K.overlap(a, b), as = S.as;
    if (!o.jaren) {
      if (o.tussen != null && o.tussen >= 0) {
        const eerst = S.M.byId.get(o.eerst), later = S.M.byId.get(o.later);
        if (o.minstens) return `${esc(a.naam)} en ${esc(b.naam)}: van ${esc(eerst.naam)} weten we niet hoe lang hij leefde.`;
        if (a.begin !== "geboorte" || b.begin !== "geboorte") return `${esc(a.naam)} en ${esc(b.naam)} staan <b>niet tegelijk</b> op deze tijdlijn: er zitten ${o.ongeveer ? "ongeveer " : ""}${Math.round(o.tussen)} jaar tussen.`;
        return `${esc(a.naam)} en ${esc(b.naam)} leefden <b>niet tegelijk</b>. ${esc(later.naam)} werd ${o.ongeveer ? "ongeveer " : ""}${Math.round(o.tussen)} jaar na ${eerst.einde === "weggenomen" ? "het wegnemen" : "de dood"} van ${esc(eerst.naam)} geboren.`;
      }
      return `${esc(a.naam)} en ${esc(b.naam)} leefden niet tegelijk.`;
    }
    const duur = `${o.minstens ? "minstens " : o.ongeveer ? "ongeveer " : ""}${o.jaren} jaar`;
    const periode = `van ${esc(K.jaarTekst(o.van, as))} tot ${esc(K.jaarTekst(o.tot, as))}`;
    if (a.begin !== "geboorte" || b.begin !== "geboorte") return `${esc(a.naam)} (${esc(lijnWoord(a))}) en ${esc(b.naam)} (${esc(lijnWoord(b))}): <b>${duur}</b> tegelijk op deze tijdlijn, ${periode}.${o.minstens ? " Hoe lang daarna nog, is niet bekend." : ""}`;
    return `${esc(a.naam)} en ${esc(b.naam)} leefden <b>${duur}</b> tegelijk: ${periode}.${o.minstens ? " Hoe lang daarna nog, staat niet in de Bijbel." : ""}`;
  }
  // De overlap als vlak tussen de twee lijnen, met de duur erbij.
  function tekenVergelijk() {
    if (!S.verg) return;
    S.verg.textContent = "";
    if (!S.gekozen || !S.vergelijk) return;
    const a = S.M.byId.get(S.gekozen), b = S.M.byId.get(S.vergelijk), o = K.overlap(a, b);
    if (!o.jaren) return;
    const sc = S.sc, rh = S.rh, y1 = Math.min(a.rij, b.rij) * rh + 6, y2 = (Math.max(a.rij, b.rij) + 1) * rh - 6;
    const x1 = sc.x(o.van), x2 = sc.x(o.tot);
    maak("rect", { class: "wt-verg-vlak", x: x1, y: y1, width: Math.max(1, x2 - x1), height: y2 - y1, rx: 8 }, S.verg);
    const t = maak("text", { class: "wt-verg-label", x: (x1 + x2) / 2, y: y1 - 4 >= 10 ? y1 - 4 : y2 + 14, "text-anchor": "middle" }, S.verg);
    t.textContent = `${o.minstens ? "≥ " : o.ongeveer ? "± " : ""}${o.jaren} jaar tegelijk`;
  }
  // De informatie sluiten (blad op de telefoon, zijkolom op een groot scherm), met de focus terug waar je was.
  function sluitInfo() {
    if (!D.blad.hidden) return sluitBlad();
    const f = S.infoVan; S.infoVan = null;
    S.gekozen = null; S.vergelijk = null; gekozenKlassen(); tekenVergelijk();
    D.info.hidden = true; D.info.innerHTML = ""; D.nu.hidden = false; zijBij();
    if (f && f.isConnected) f.focus({ preventScroll: true }); else D.speel.focus({ preventScroll: true });
  }
  function infoKaart() {
    const p = S.M.byId.get(S.gekozen), M = S.M, as = S.as;
    const ouder = p.ouder && M.byId.get(p.ouder), kids = p.kinderen.map((k) => M.byId.get(k));
    const relatie = [ouder ? `zoon van <button type="button" class="wt-link" data-p="${esc(ouder.id)}">${esc(ouder.naam)}</button>` : "", kids.length ? `vader van ${kids.map((k) => `<button type="button" class="wt-link" data-p="${esc(k.id)}">${esc(k.naam)}</button>`).join(", ")}` : ""].filter(Boolean).join(" · ");
    const van = p.van || {}, tot = p.tot || {};
    const margeTekst = (m) => (Array.isArray(m) ? `${m[0]} of ${m[1]}${as.soort === "vchr" ? " v.Chr." : ""}` : m ? String(m) : "");
    const geb = van.jaar != null ? `<b>${esc(p.voorAs ? "vóór " + K.jaarTekst(p.t0, as) : K.jaarTekst(K.naarT(van.jaar, as), as))}</b> ${chip(van.status)}<small>${van.vaderLeeftijd != null && ouder ? `${esc(ouder.naam)} was ${van.vaderLeeftijd} · ` : ""}${bronTekst(van.bron)}${van.marge ? ` · ${esc(margeTekst(van.marge))}` : ""}</small>` : `<b>onbekend</b>`;
    const eindWoord = p.einde === "weggenomen" ? "Weggenomen" : p.einde === "onbekend" ? "Einde" : p.einde === "leeft door" ? "Daarna" : "Stierf";
    const eindTekst = p.einde === "onbekend" ? `<b>onbekend</b><small>laatst genoemd in ${esc(K.jaarTekst(p.t1, as))}${tot.marge ? ` (${esc(margeTekst(tot.marge))})` : ""} · ${bronTekst(tot.bron)}</small>`
      : p.einde === "leeft door" ? `<b>${esc(K.jaarTekst(K.naarT(tot.jaar, as), as))}</b> ${chip(tot.status)}<small>na het einde van deze tijdlijn · ${bronTekst(tot.bron)}</small>`
      : `<b>${esc(K.jaarTekst(p.t1, as))}</b> ${chip(tot.status)}<small>${tot.leeftijd != null ? `${tot.leeftijd} jaar oud${tot.leeftijdStatus === "berekend" ? " (berekend)" : ""} · ` : ""}${bronTekst(tot.bron)}</small>`;
    const noten = [van.opmerking, tot.opmerking].filter(Boolean).map((x) => `<p class="wt-noot">${esc(x)}</p>`).join("");
    // Wie leefden tegelijk, en hoe lang (uitgerekend, niet overgenomen).
    const anderen = M.personen.filter((q) => q.id !== p.id).map((q) => ({ q, o: K.overlap(p, q) }));
    const tegelijk = anderen.filter((x) => x.o.jaren > 0).sort((a, b) => b.o.jaren - a.o.jaren);
    const niet = anderen.filter((x) => !x.o.jaren);
    const ev = M.gebeurtenissen.filter((e) => (e.personen || []).includes(p.id) || (p.gebeurtenissen || []).includes(e.id));
    const vnr = p.verhaal && +p.verhaal.slice(1);
    const verhaal = vnr && BR.atlas && BR.atlas.heeftVerhaal(vnr) ? `<button type="button" class="wt-verhaal" data-verhaal="${vnr}"><span>${S.koppeling === p.verhaal ? "Terug naar het verhaal" : "Lees het verhaal"}</span><b>${vnr}. ${esc(BR.atlas.verhaalTitel(vnr))}</b></button>` : "";
    const html = `<article class="wt-kaartje" aria-labelledby="wtInfoTitel">
      <header class="wt-kaartje-kop"><p class="wt-label">Persoon</p><h3 id="wtInfoTitel" tabindex="-1">${esc(p.naam)}</h3>${relatie ? `<p class="wt-relatie">${relatie}</p>` : ""}<button type="button" class="wt-kaartje-sluit" data-wt-info-sluit aria-label="Sluiten">${ICON.sluit}</button></header>
      ${p.rol ? `<p class="wt-rolzin">${esc(p.rol)}</p>` : ""}
      <dl class="wt-feiten">${p.begin !== "geboorte" ? `<div><dt>Geboren</dt><dd><b>onbekend</b><small>de lijn begint ${p.begin === "regering" ? "bij het begin van de regering" : p.begin === "weggevoerd" ? "bij de wegvoering" : p.begin === "roeping" ? "bij de roeping" : "later"}</small></dd></div>` : ""}<div><dt>${BEGIN[p.begin] || "Vanaf"}</dt><dd>${geb}</dd></div><div><dt>${eindWoord}</dt><dd>${eindTekst}</dd></div><div class="wt-feit-nu"><dt>In ${esc(K.jaarTekst(S.t, as))}</dt><dd class="wt-info-nu"></dd></div></dl>
      ${noten}
      ${tegelijk.length ? `<h4 class="wt-label">${p.begin === "geboorte" && allesLevens() ? "Leefde tegelijk met" : "Tegelijk op de tijdlijn met"}</h4><p class="wt-uitleg">Kies iemand om te vergelijken.</p><p class="wt-vergelijking" aria-live="polite">${S.vergelijk ? vergelijkZin(p, M.byId.get(S.vergelijk)) : ""}</p><ul class="wt-tegelijk">${tegelijk.map(({ q, o }) => `<li><button type="button" data-vergelijk="${esc(q.id)}" aria-pressed="${q.id === S.vergelijk}"><span>${esc(q.naam)}</span><b>${o.minstens ? "≥ " : o.ongeveer ? "± " : ""}${o.jaren} jaar</b></button></li>`).join("")}</ul>` : ""}
      ${niet.length ? `<p class="wt-niet">Niet tegelijk met ${niet.map(({ q }) => `<button type="button" class="wt-link" data-vergelijk="${esc(q.id)}">${esc(q.naam)}</button>`).join(", ")}.</p>` : ""}
      ${!tegelijk.length ? `<p class="wt-vergelijking" aria-live="polite">${S.vergelijk ? vergelijkZin(p, M.byId.get(S.vergelijk)) : ""}</p>` : ""}
      ${ev.length ? `<h4 class="wt-label">Gebeurtenissen</h4><ul class="wt-evlijst">${ev.map((e) => `<li><button type="button" data-naar="${e.t}"><span>${esc(K.jaarTekst(e.t, as, as.soort === "am"))}</span>${esc(e.titel)}</button></li>`).join("")}</ul>` : ""}
      <p class="wt-lees"><span class="wt-label">Lees in je Bijbel</span> ${(p.ref || []).map(esc).join(" · ")}</p>
      ${verhaal}
    </article>`;
    toonInfo(html, "persoon");
    infoNu();
  }
  function infoNu() {
    const p = S.gekozen && S.M.byId.get(S.gekozen); if (!p) return;
    D.oud.infoJaar = Math.floor(S.t);
    const box = S.blad === "persoon" ? D.bladIn : D.info, dd = box.querySelector(".wt-info-nu"), dt = box.querySelector(".wt-feit-nu dt");
    if (!dd) return;
    dt.textContent = "In " + K.jaarTekst(S.t, S.as);
    const ld = K.leeftijd(p, S.t);
    dd.textContent = S.t < p.t0 ? `nog niet geboren (over ${Math.ceil(p.t0 - S.t)} jaar)` : K.leeftNog(p, S.t) ? (ld == null || p.beginOnzeker ? "leeft" : `${ld} jaar oud`) : p.einde === "onbekend" ? "niet bekend of hij nog leeft" : p.einde === "weggenomen" ? "door God weggenomen" : "overleden";
  }
  function toonGebeurtenis(id, van) {
    const e = S.M.gebeurtenissen.find((x) => x.id === id); if (!e) return;
    pauze();
    const as = S.as, vnr = e.verhaal && +e.verhaal.slice(1);
    const html = `<article class="wt-kaartje" aria-labelledby="wtInfoTitel">
      <header class="wt-kaartje-kop"><p class="wt-label">Gebeurtenis</p><h3 id="wtInfoTitel" tabindex="-1">${esc(e.titel)}</h3><p class="wt-relatie">${esc(bereikTekst(e.t, e.t2))}${Array.isArray(e.marge) ? ` <small>(${e.marge[0]}${Math.abs(e.marge[0] - e.marge[1]) > 1 ? "–" : " of "}${e.marge[1]}${as.soort === "vchr" ? " v.Chr." : ""}, niet precies bekend)</small>` : ""} ${chip(e.status)}</p><button type="button" class="wt-kaartje-sluit" data-wt-info-sluit aria-label="Sluiten">${ICON.sluit}</button></header>
      <p class="wt-rolzin">${esc(e.tekst)}</p>
      ${e.opmerking ? `<p class="wt-noot">${esc(e.opmerking)}</p>` : ""}
      ${(e.personen || []).length ? `<p class="wt-relatie">Met ${e.personen.map((p) => S.M.byId.get(p)).filter(Boolean).map((p) => `<button type="button" class="wt-link" data-p="${esc(p.id)}">${esc(p.naam)}</button>`).join(", ")}</p>` : ""}
      <p class="wt-lees"><span class="wt-label">Bron</span> ${bronTekst(e.bron)}</p>
      <button type="button" class="btn" data-naar="${e.t}">Ga naar ${esc(K.jaarTekst(e.t, as))}</button>
      ${vnr && BR.atlas && BR.atlas.heeftVerhaal(vnr) ? `<button type="button" class="wt-verhaal" data-verhaal="${vnr}"><span>${S.koppeling === e.verhaal ? "Terug naar het verhaal" : "Lees het verhaal"}</span><b>${vnr}. ${esc(BR.atlas.verhaalTitel(vnr))}</b></button>` : ""}
    </article>`;
    S.infoVan = van || null;
    S.gekozen = null; gekozenKlassen(); tekenVergelijk();
    toonInfo(html, "gebeurtenis");
  }
  function toonStad(id, van) {
    const s = S.M.steden.find((x) => x.id === id); if (!s) return;
    const html = `<article class="wt-kaartje" aria-labelledby="wtInfoTitel"><header class="wt-kaartje-kop"><p class="wt-label">Stad</p><h3 id="wtInfoTitel" tabindex="-1">${esc(s.naam)}</h3><button type="button" class="wt-kaartje-sluit" data-wt-info-sluit aria-label="Sluiten">${ICON.sluit}</button></header>${s.tekst ? `<p class="wt-rolzin">${esc(s.tekst)}</p>` : ""}<p class="wt-lees"><span class="wt-label">Bron</span> ${bronTekst(s.bron)}</p></article>`;
    S.infoVan = van || null;
    toonInfo(html, "stad");
  }
  // Informatie: op een groot scherm in de zijkolom, op de telefoon als blad van onderen.
  function toonInfo(html, soort) {
    if (breed()) {
      D.info.innerHTML = html; D.info.hidden = false; D.nu.hidden = true;
      if (S.blad) sluitBlad();
      const h = D.info.querySelector("h3"); if (h) h.focus({ preventScroll: true });
    } else openBlad(html, soort);
  }
  function over(van) {
    const d = S.data, as = S.as;
    const info = (d.info || []).map((i) => `<section class="wt-over-blok"><h4>${esc(i.kop)} ${chip(i.status)}</h4><p>${esc(i.tekst)}</p>${i.bron ? `<p class="wt-bron">${bronTekst(i.bron)}</p>` : ""}</section>`).join("");
    const bronnen = (d.bronnen || []).map((b) => `<li>${b.url && /^https:\/\//.test(b.url) ? `<a href="${esc(b.url)}" rel="noopener" target="_blank">${esc(b.titel)}</a>` : esc(b.titel)}${b.licentie ? ` <small>${esc(b.licentie)}</small>` : ""}${b.geraadpleegd ? ` <small>geraadpleegd ${esc(b.geraadpleegd)}</small>` : ""}</li>`).join("");
    const html = `<div class="wt-over">
      <p class="wt-label">Over deze tijdlijn</p><h3 id="wtBladTitel" tabindex="-1">${esc(d.titel)}</h3>
      ${as.uitleg ? `<p>${esc(as.uitleg)}</p>` : ""}
      <h4 class="wt-label">Hoe zeker is het?</h4>
      <ul class="wt-statussen">${Object.keys(STATUS).map((k) => `<li>${chip(k)}<span>${esc(STATUS[k][1])}</span></li>`).join("")}</ul>
      ${info}
      <h4 class="wt-label">Bediening</h4>
      <p>Afspelen laat de tijd lopen; tik op een naam of lijn voor meer. Met de schuif kies je zelf een jaar. Op de computer: pijltjes voor een jaar (met Shift tien), Page Up en Page Down voor het vorige of volgende moment, spatie om af te spelen of te pauzeren, + en − om in en uit te zoomen.</p>
      ${bronnen ? `<h4 class="wt-label">Bronnen</h4><ul class="wt-bronnen">${bronnen}</ul>` : ""}
    </div>`;
    pauze();
    S.infoVan = van || null;
    openBlad(html, "over");
  }
  function openBlad(html, soort) {
    D.bladIn.innerHTML = html;
    const box = D.blad.querySelector(".wt-blad-box");
    const titel = D.bladIn.querySelector("h3");
    if (titel) box.setAttribute("aria-labelledby", titel.id); else box.removeAttribute("aria-labelledby");
    D.blad.hidden = false;
    D.blad.classList.toggle("midden", soort === "over");
    S.blad = soort;
    D.app.classList.add("blad-open");
    requestAnimationFrame(() => D.blad.classList.add("open"));
    (titel || box).focus({ preventScroll: true });
    bladVegen(box);
  }
  function sluitBlad() {
    if (!S || D.blad.hidden) return;
    const soort = S.blad;
    D.blad.hidden = true; D.blad.classList.remove("open"); D.app.classList.remove("blad-open");
    S.blad = null;
    if (soort === "persoon") { S.gekozen = null; S.vergelijk = null; gekozenKlassen(); tekenVergelijk(); }
    const f = S.infoVan; S.infoVan = null;
    if (f && f.isConnected) f.focus({ preventScroll: true }); else D.speel.focus({ preventScroll: true });
  }
  function sluitBladAlsKlein() { if (S.blad && S.blad !== "over") sluitBlad(); }
  // Het blad omlaag vegen sluit het (zoals in de atlas).
  function bladVegen(box) {
    if (box.dataset.veeg) return;
    box.dataset.veeg = "1";
    let y0 = null;
    box.addEventListener("touchstart", (e) => { y0 = box.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
    box.addEventListener("touchend", (e) => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) sluitBlad(); y0 = null; }, { passive: true });
  }
  function naarVerhaal(nr) {
    const vanHier = S.koppeling === "v" + nr;
    BR.wereld.sluit(vanHier ? {} : { na: () => BR.atlas && BR.atlas.openVerhaal(nr) });
  }

  // ---------- zijkolom en lijst ----------
  function zijBij() {
    if (!breed() || D.nu.hidden) return;
    const M = S.M, t = S.t, as = S.as;
    const leven = M.personen.filter((p) => K.leeftNog(p, t));
    const recent = [...M.gebeurtenissen].reverse().find((e) => e.t <= t + 1e-6);
    const volgend = M.gebeurtenissen.find((e) => e.t > t + 1e-6);
    const oudste = leven.filter((p) => !p.beginOnzeker).sort((a, b) => a.t0 - b.t0)[0];
    D.nu.innerHTML = `<p class="wt-label">In ${esc(K.jaarTekst(t, as))}</p>
      <p class="wt-nu-getal"><b>${leven.length}</b> <span>${allesLevens() ? `van de ${M.personen.length} mensen op deze tijdlijn leven${leven.length === 1 ? "t" : ""}${oudste && leven.length > 1 ? `. De oudste is ${esc(oudste.naam)}, ${K.leeftijd(oudste, t)} jaar` : ""}` : `van de ${M.personen.length} personen ${leven.length === 1 ? "is" : "zijn"} nu in beeld${leven.length ? ": " + leven.map((p) => `${esc(p.naam)} <small>(${esc(lijnWoord(p))})</small>`).join(", ") : ""}`}.</span></p>
      ${recent ? `<div class="wt-nu-ev"><p class="wt-label">Laatst gebeurd · ${esc(K.jaarTekst(recent.t, as, as.soort === "am"))}</p><button type="button" class="wt-nu-titel" data-e="${esc(recent.id)}">${esc(recent.titel)}</button><p>${esc(recent.tekst)}</p></div>` : ""}
      ${volgend ? `<p class="wt-nu-straks"><span class="wt-label">Hierna</span> <button type="button" class="wt-link" data-naar="${volgend.t}">${esc(volgend.titel)}</button>, over ${Math.round(volgend.t - t)} jaar</p>` : ""}
      <p class="wt-tip">Kies een naam om te zien wie er tegelijk leefden, en hoe lang.</p>`;
  }
  function lijstOpbouw() {
    const as = S.as, M = S.M;
    // Een geboorte of einde dat al als gebeurtenis in de lijst staat (bijv. ‘Adam sterft’), niet twee keer.
    const dubbel = (m) => m.persoon && M.gebeurtenissen.some((e) => Math.abs(e.t - m.t) < 1e-6 && (e.personen || []).includes(m.persoon));
    D.lijst.innerHTML = S.momenten.map((m, i) => {
      if (dubbel(m)) return `<li class="wt-m dubbel" data-i="${i}" hidden></li>`;
      if (m.soort === "gebeurtenis") {
        const e = M.gebeurtenissen.find((x) => x.id === m.gebeurtenis);
        return `<li class="wt-m gebeurtenis" data-i="${i}"><span class="wt-m-jaar">${esc(K.jaarTekst(e.t, as, as.soort === "am"))}</span><div><button type="button" class="wt-m-titel" data-naar="${e.t}">${esc(e.titel)}</button> ${chip(e.status)}<p>${esc(e.tekst)}</p><p class="wt-bron">${bronTekst(e.bron)}</p></div></li>`;
      }
      const p = M.byId.get(m.persoon);
      const wat = m.soort === "geboorte" ? `${esc(p.naam)} wordt geboren` : m.soort === "weggenomen" ? `God neemt ${esc(p.naam)} weg` : `${esc(p.naam)} sterft${p.tot && p.tot.leeftijd != null ? `, ${p.tot.leeftijd} jaar oud` : ""}`;
      const st = m.soort === "geboorte" ? p.van.status : p.tot.status;
      // Een status alleen als hij afwijkt van die van de tijdrekening (anders staat er dertien keer ‘berekend’).
      return `<li class="wt-m ${m.soort}" data-i="${i}"><span class="wt-m-jaar">${esc(K.jaarTekst(m.t, as, as.soort === "am"))}</span><div><button type="button" class="wt-m-titel klein" data-naar="${m.t}">${wat}</button> ${st !== as.status ? chip(st) : ""}</div></li>`;
    }).join("");
  }
  function lijstBij() {
    const items = D.lijst.children;
    let huidig = -1;
    S.momenten.forEach((m, i) => { if (m.t <= S.t + 1e-6 && !items[i].hidden) huidig = i; });
    for (let i = 0; i < items.length; i++) { items[i].classList.toggle("af", i <= huidig); items[i].classList.toggle("huidig", i === huidig); }
  }

  // ---------- weergave (telefoon: één tegelijk; groot scherm: lijnen en kaart naast elkaar) ----------
  function zetWeergave(w, focus) {
    if (!["lijnen", "kaart", "gebeurtenissen"].includes(w)) w = "lijnen";
    const zij = naast() && S.M.heeftKaart;
    if (zij && w === "kaart") w = "lijnen";
    S.weergave = w;
    D.app.dataset.weergave = w;
    D.app.dataset.naast = zij ? "1" : "0";
    D.app.querySelectorAll('[role="tab"]').forEach((b) => {
      const aan = b.dataset.weergave === w;
      b.setAttribute("aria-selected", aan); b.tabIndex = aan ? 0 : -1;
      if (b.dataset.weergave === "kaart") b.hidden = zij;
    });
    D.app.querySelector(".wt-p-lijnen").hidden = w !== "lijnen";
    D.app.querySelector(".wt-p-gebeurtenissen").hidden = w !== "gebeurtenissen";
    const kaartZichtbaar = w === "kaart" || (zij && w === "lijnen");
    D.app.querySelector(".wt-p-kaart").hidden = !kaartZichtbaar;
    if (w === "lijnen") requestAnimationFrame(layout);
    if (w === "gebeurtenissen") { lijstBij(); const h = D.lijst.querySelector(".huidig"); if (h) h.scrollIntoView({ block: "center" }); }
    if (kaartZichtbaar && S.M.heeftKaart) requestAnimationFrame(() => { maakKaart(); if (S.kaart) { S.kaart.m.invalidateSize({ pan: false }); kaartTijd(S.t, []); } });
    if (focus) { const b = D.app.querySelector(`[role="tab"][data-weergave="${w}"]`); if (b && document.activeElement !== b) b.focus(); }
  }

  // ---------- de kaart (alleen als de periode gebieden, steden of plaatsen heeft) ----------
  function maakKaart() {
    if (S.kaart || !D.kaartvlak || typeof L === "undefined") return;
    const M = S.M;
    const m = L.map(D.kaartvlak, { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 3, maxZoom: 10, attributionControl: false, zoomControl: false, maxBounds: [[5, -15], [60, 75]], maxBoundsViscosity: 0.7 });
    L.control.zoom({ position: "topleft", zoomInTitle: "Inzoomen", zoomOutTitle: "Uitzoomen" }).addTo(m);
    m.createPane("wtGebieden").style.zIndex = 420;
    m.createPane("wtRand").style.zIndex = 450;
    m.createPane("wtLabels").style.zIndex = 640;
    m.getPane("wtRand").style.pointerEvents = "none";
    // De ondergrond houdt ergens op (geo.json: tot 53° O). Daarbuiten: papier met een kaderlijn, zoals in een atlas, en
    // gebieden worden op die rand afgeknipt, met een pijl ‘loopt verder naar het oosten’.
    const zetRand = (gr) => {
      const [z, w, n, o] = gr;
      S.kaart.rand = { w, o };
      L.polygon([[[-10, -60], [-10, 140], [80, 140], [80, -60]], [[z, w], [z, o], [n, o], [n, w]]], { pane: "wtRand", interactive: false, className: "wt-rand-papier" }).addTo(m);
      L.rectangle([[z, w], [n, o]], { pane: "wtRand", interactive: false, className: "wt-rand-lijn", fill: false }).addTo(m);
      m.setMaxBounds([[z - 1, w - 1], [n + 1, o + 2]]);
      // Niet verder uitzoomen dan het land van de ondergrond het scherm vult (anders zie je vooral papier).
      const binnen = m.getBoundsZoom([[z, w], [n, o]], true);
      m.setMinZoom(Math.max(3, binnen - 0.25));
      if (S.kaart.alles) m.fitBounds(S.kaart.alles, { padding: [24, 24], maxZoom: 7, animate: false });
      if (m.getZoom() < binnen) m.setZoom(binnen, { animate: false });
      kaartTijd(S.t, []);
    };
    if (BR.ondergrond) BR.ondergrond(m).then((gr) => { if (S && S.kaart && S.kaart.m === m && Array.isArray(gr)) zetRand(gr); }).catch(() => D.kaartvlak.insertAdjacentHTML("beforeend", '<p class="wt-kaartfout" role="status">De ondergrond kon niet worden geladen.</p>'));
    const gebieden = M.gebieden.map((g) => {
      const laag = L.polygon([], { pane: "wtGebieden", className: `wt-gebied wt-gebied-${g.id}`, interactive: false, smoothFactor: 0.5 }).addTo(m);
      const kleur = /^[a-z]+$/.test(g.kleur || "") ? g.kleur : "terra";
      const label = L.marker([0, 0], { pane: "wtLabels", interactive: false, keyboard: false, icon: L.divIcon({ className: "wt-gebiedlabel", iconSize: [0, 0], html: `<span style="--gk:${kleurVar(kleur, true)}">${esc(g.naam)}</span>` }) });
      const verder = L.marker([0, 0], { pane: "wtLabels", interactive: false, keyboard: false, icon: L.divIcon({ className: "wt-verder", iconSize: [0, 0], html: `<span style="--gk:${kleurVar(kleur, true)}">${esc(g.naam)} loopt verder naar het oosten <b aria-hidden="true">→</b></span>` }) });
      const pad = () => laag.getElement && laag.getElement();
      return { g, laag, label, verder, kleur, pad, aan: false, verderAan: false };
    });
    const steden = M.steden.map((s) => {
      const hoofd = M.gebieden.some((g) => g.hoofdstad === s.id);
      // Kleinere plaatsen krijgen pas een naam als je inzoomt (of als er net iets gebeurt), zodat de kaart rustig blijft.
      const belangrijk = hoofd || M.gebeurtenissen.some((e) => e.belangrijk && (e.plaats === s.plaatsId || e.plaats === s.id));
      const mk = L.marker(s.ll, { pane: "wtLabels", keyboard: false, icon: L.divIcon({ className: "wt-stad" + (hoofd ? " hoofd" : "") + (belangrijk ? " belangrijk" : ""), iconSize: [0, 0], html: `<i aria-hidden="true"></i><button type="button" data-stad="${esc(s.id)}" aria-label="${esc(s.naam)}${hoofd ? ", hoofdstad" : ""}"><span>${esc(s.naam)}</span></button>` }) }).addTo(m);
      return { s, mk };
    });
    const plekken = M.gebeurtenissen.filter((e) => e.plek).map((e) => {
      const mk = L.marker(e.plek.ll, { pane: "wtLabels", keyboard: false, icon: L.divIcon({ className: "wt-plek" + (e.plek.gebied ? " gebied" : ""), iconSize: [0, 0], html: `<button type="button" data-e="${esc(e.id)}" aria-label="${esc(e.titel)}" tabindex="-1"><i></i><b></b></button>` }) });
      return { e, mk, aan: false };
    });
    S.kaart = { m, gebieden, steden, plekken, rand: { w: -180, o: 53 } };
    // Eerste beeld: alles van deze periode, zonder vlucht.
    const zoomKlas = () => { const z = m.getZoom(); D.kaartvlak.classList.toggle("wt-ver", z < 5.75); };
    m.on("zoomend", zoomKlas);
    const punten = [];
    M.gebieden.forEach((g) => g.sleutels.forEach((s) => s.delen.forEach((r) => r.forEach(([lng, lat]) => punten.push([lat, Math.min(lng, S.kaart.rand.o)])))));
    M.steden.forEach((s) => punten.push(s.ll));
    plekken.forEach((p) => punten.push(p.e.plek.ll));
    S.kaart.alles = punten.length ? L.latLngBounds(punten) : null;
    if (punten.length) m.fitBounds(S.kaart.alles, { padding: [28, 28], maxZoom: 7 }); else m.setView([33, 40], 5);
    zoomKlas();
    if (D.legenda) D.legenda.parentElement.open = breed();
    legenda();
    kaartTijd(S.t, []);
  }
  // Het zwaartepunt van een vlak (niet het gemiddelde van de punten): daar staat de naam van een gebied.
  function zwaartepunt(r) {
    let a = 0, x = 0, y = 0;
    for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length], k = p[1] * q[0] - q[1] * p[0]; a += k; x += (p[0] + q[0]) * k; y += (p[1] + q[1]) * k; }
    if (Math.abs(a) < 1e-9) return r.reduce((m, p) => [m[0] + p[0] / r.length, m[1] + p[1] / r.length], [0, 0]);
    return [x / (3 * a), y / (3 * a)];
  }
  function legenda() {
    if (!D.legenda) return;
    const G = S.kaart.gebieden;
    // Naamsvermelding voor bronnen met een CC BY-licentie (bijv. Pleiades voor de ligging van enkele steden).
    const cc = (S.data.bronnen || []).filter((b) => /^CC BY/.test(b.licentie || "")).map((b) => { const m = /naamsvermelding:\s*([^)]+)/.exec(b.licentie); return `${m ? m[1].trim() : b.titel} (${b.licentie.split(" (")[0]})`; });
    const benaderd = S.M.gebieden.some((g) => g.sleutels.some((s) => s.betrouwbaarheid !== "historisch"));
    D.legenda.innerHTML = `<ul>${G.map(({ g, kleur }) => `<li data-g="${esc(g.id)}"><i style="--gk:${kleurVar(kleur, true)};--gv:${kleurVar(kleur)}"></i>${esc(g.naam)}</li>`).join("")}</ul>${benaderd ? '<p><i class="wt-leg-stip"></i>Gestippelde rand: grens bij benadering</p>' : ""}<p class="wt-leg-bron">Ondergrond: Natural Earth. Grenzen: eigen tekening${[...new Set(cc)].length ? `. Ligging van enkele plaatsen: ${esc([...new Set(cc)].join(", "))}` : ""}.</p>`;
  }
  function kaartTijd(t, nieuw) {
    const K2 = S.kaart; if (!K2) return;
    const zichtbaar = new Set();
    K2.gebieden.forEach((o) => {
      const v = K.gebiedOp(o.g, t, S.M.vervaag);
      if (!v) { if (o.aan) { o.laag.setLatLngs([]); o.label.remove(); o.aan = false; } if (o.verderAan) { o.verder.remove(); o.verderAan = false; } return; }
      // Afknippen op de rand van de ondergrond.
      const { w, o: oost } = K2.rand;
      const voorbijRand = v.delen.some((r) => r.some((p) => p[1] > oost + 1e-6));
      const delen = v.delen.map((r) => K.knip(K.knip(r, oost, true), w, false)).filter((r) => r.length >= 3);
      o.laag.setLatLngs(delen);
      const el = o.pad();
      if (el) {
        el.style.opacity = v.dekking.toFixed(3);
        el.style.setProperty("--gk", kleurVar(o.kleur, true));
        el.style.setProperty("--gv", kleurVar(o.kleur));
        el.classList.toggle("benaderd", v.betrouwbaarheid !== "historisch");
      }
      // Het label op het midden van het grootste (zichtbare) deel.
      const c = zwaartepunt(delen[0] || v.delen[0]);
      o.label.setLatLng(c);
      if (!o.aan) { o.label.addTo(K2.m); o.aan = true; }
      const le = o.label.getElement(); if (le) le.style.opacity = v.dekking.toFixed(3);
      // Loopt het gebied verder dan de rand: een pijl op de rand, op de hoogte van het afgeknipte stuk.
      if (voorbijRand) {
        const randPunten = delen.flat().filter((p) => Math.abs(p[1] - oost) < 1e-6);
        // Aan de noordkant van het afgeknipte stuk: daar staan minder namen dan rond Babel.
        const lats = randPunten.map((p) => p[0]), lat = lats.length ? Math.max(...lats) - (Math.max(...lats) - Math.min(...lats)) * 0.2 : c[0];
        o.verder.setLatLng([lat, oost]);
        if (!o.verderAan) { o.verder.addTo(K2.m); o.verderAan = true; }
        const ve = o.verder.getElement(); if (ve) ve.style.opacity = v.dekking.toFixed(3);
      } else if (o.verderAan) { o.verder.remove(); o.verderAan = false; }
      zichtbaar.add(o.g.id);
    });
    if (D.legenda) D.legenda.querySelectorAll("[data-g]").forEach((li) => li.classList.toggle("weg", !zichtbaar.has(li.dataset.g)));
    K2.steden.forEach(({ s, mk }) => {
      const hoofd = K2.gebieden.some((o) => o.aan && o.g.hoofdstad === s.id);
      const el = mk.getElement(); if (el) el.classList.toggle("hoofd-nu", hoofd);
    });
    const span = S.M.tMax - S.M.tMin;
    K2.plekken.forEach((o) => {
      const aan = t >= o.e.t - 1e-6 && t <= o.e.t2 + span * 0.12;
      if (aan && !o.aan) { o.mk.addTo(K2.m); o.aan = true; }
      if (!aan && o.aan) { o.mk.remove(); o.aan = false; }
      const el = o.mk.getElement(); if (el) el.classList.toggle("voorbij", t > o.e.t2 + span * 0.02);
    });
    // Net bereikt: de plek licht rustig op, en de kaart beweegt er kalm naartoe als hij buiten beeld ligt.
    nieuw.filter((e) => e.plek).forEach((e) => {
      const o = K2.plekken.find((x) => x.e === e); const el = o && o.mk.getElement();
      if (el && !minderBeweging()) { el.classList.remove("licht"); void el.offsetWidth; el.classList.add("licht"); }
      if (!K2.m.getBounds().pad(-0.08).contains(e.plek.ll)) {
        if (minderBeweging()) K2.m.setView(e.plek.ll, K2.m.getZoom(), { animate: false });
        else K2.m.flyTo(e.plek.ll, K2.m.getZoom(), { duration: 1.1, easeLinearity: 0.4 });
      }
    });
  }

  function stopLaag() { stop(); if (S && D) { sluitBlad(); pauze(); } }
  BR.wereldLaag = { toon, stop: stopLaag, staat: () => (S ? { periode: S.periode, t: S.t, jaar: K.naarJaar(S.t, S.as), speelt: S.speelt, venster: S.venster.slice(), gekozen: S.gekozen, vergelijk: S.vergelijk, weergave: S.weergave } : null) };
})();
