// Presentatie en boekje: de speler. Zet een pakket (boekje-inhoud.js) op het scherm als diavoorstelling en als
// afdrukbaar boekje. Dezelfde code draait op de pagina /bijbelreis/boekje en in het losse bestand dat je downloadt;
// daarom gebruikt hij niets van de pagina zelf. Uitleg: docs/bijbelreis-boekje/README.md.
(function (global) {
  "use strict";
  const BR = (global.BR = global.BR || {});
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const kleur = (k) => `var(--${k}-deep, var(--${k}))`;
  const fmt = (n) => Number(n).toLocaleString("nl-NL");
  const minderBeweging = () => !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ICOON = {
    boek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg>',
    vorige: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
    volgende: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    speel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12.5-7.5z"/></svg>',
    pauze: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><path d="M7 14h10v7H7z"/></svg>',
  };
  // Tempo van vanzelf afspelen: seconden voor een dia met weinig tekst; een lange tekst krijgt naar verhouding meer tijd.
  const TEMPO = [["rustig", "Rustig", 14], ["gewoon", "Gewoon", 10], ["vlot", "Vlot", 6]];
  // Bronvermelding: zoals het colofon van de atlas (bijbelreis.html), voor wat deze kaart en dit boekje gebruiken.
  const BRONNEN = [
    "Kaart: eigen tekening uit Natural Earth (publiek domein).",
    'Het landschap van toen (oude kust, meren en Nijlarmen): <a href="https://github.com/AWMC/geodata">Ancient World Mapping Center, geodata</a>, naar de Barrington Atlas en © OpenStreetMap-bijdragers, <a href="https://opendatacommons.org/licenses/odbl/1-0/">Open Database License 1.0</a>. Kop van de Perzische Golf rond 3000–2000 v.Chr.: naar Forti e.a. 2022, Quaternary Research, figuur 14 (<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>), bewerkt.',
    'Ligging van Bijbelse plaatsen mede gebaseerd op <a href="https://github.com/openbibleinfo/Bible-Geocoding-Data">OpenBible.info Bible Geocoding Data</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; bewerkt (eigen keuze van identificaties, zekerheid en teksten).',
    'Bijbeltekst: Statenvertaling, editie 1888 (publiek domein), digitale transcriptie <a href="https://github.com/jajpater/statenvertaling">jajpater/statenvertaling</a> (CC0). Tekst tussen ‘enkele aanhalingstekens’ staat letterlijk zo in de Statenvertaling.',
    "Vertelling, tekeningen en vragen: de Bijbelreis, een hulpmiddel náást de eigen Bijbel of kinderbijbel.",
  ];
  const LEGENDA = {
    v: '<span class="bk-lg-pin"></span>Plek bekend', w: '<span class="bk-lg-pin open"></span>Waarschijnlijk of betwist', alt: '<span class="bk-lg-alt"></span>Andere mogelijke plek',
    o: '<span class="bk-lg-vaag">?</span>Onbekend: alleen de streek', r: '<span class="bk-lg-gebied"></span>Gebied', recon: '<span class="bk-lg-lijn recon"></span>Reconstructie: de Bijbel noemt begin en eind', eerder: '<span class="bk-lg-lijn eerder"></span>Eerdere stappen',
  };
  const legenda = (lg) => { const l = ["v"].concat(lg.filter((x) => x !== "v")).filter((x) => LEGENDA[x]); return `<p class="bk-legenda">${l.map((x) => `<span>${LEGENDA[x]}</span>`).join("")}</p>`; };

  // Breedte van tekst met het echte lettertype van de kaart (voor botsingsvrije namen).
  let doek = null, familie = null;
  function meet(t, fs, vet) {
    if (!doek) { doek = document.createElement("canvas").getContext("2d"); familie = (getComputedStyle(document.documentElement).getPropertyValue("--font-sans") || "").trim() || "system-ui, sans-serif"; }
    doek.font = `${vet ? 700 : 600} ${fs}px ${familie}`;
    return doek.measureText(t).width;
  }

  let teller = 0;
  function maak(host, o) {
    const pk = o.pakket, D = pk.dias, KA = BR.boekjeKaart, id = "bk" + ++teller;
    // Alles wat buiten de speler luistert, stopt bij weg() (een nieuwe keuze op de pagina maakt een nieuwe speler).
    const ac = new AbortController(), mee = { signal: ac.signal };
    let kijker = null;
    const ctx = { basis: o.basis, plaatsen: pk.plaatsen, routes: pk.routes };
    let toon = o.toon === "boekje" ? "boekje" : "presentatie", nu = Math.max(0, Math.min(D.length - 1, o.dia || 0)), speelt = false, klok = 0, tempo = TEMPO.some((t) => t[0] === o.tempo) ? o.tempo : "gewoon", boekjeKlaar = false, getoond = new Set();
    host.classList.add("bk-speler");
    host.style.setProperty("--rc", kleur(pk.kleur || "terra"));
    host.innerHTML = `
      <div class="bk-balk" role="toolbar" aria-label="Presentatie en boekje">
        <div class="bk-seg" role="group" aria-label="Weergave"><button type="button" class="bk-knop" data-toon="presentatie">Presentatie</button><button type="button" class="bk-knop" data-toon="boekje">Boekje</button></div>
        <button type="button" class="bk-knop" data-actie="print">${ICOON.print}<span>Afdrukken of opslaan als PDF</span></button>
        <span class="bk-balk-extra"></span>
      </div>
      ${pk.meldingen && pk.meldingen.length ? `<p class="bk-melding" role="note">${pk.meldingen.map(esc).join(" ")}</p>` : ""}
      <section class="bk-podium" aria-roledescription="diavoorstelling" aria-label="Presentatie: ${esc(pk.titel)}">
        <div class="bk-dias"></div>
        <div class="bk-voortgang" aria-hidden="true"><div></div></div>
        <div class="bk-bediening">
          <button type="button" class="bk-rond" data-actie="vorige" aria-label="Vorige dia" title="Vorige (pijl naar links)">${ICOON.vorige}</button>
          <span class="bk-teller"></span>
          <button type="button" class="bk-rond" data-actie="volgende" aria-label="Volgende dia" title="Volgende (pijl naar rechts of spatie)">${ICOON.volgende}</button>
          <span class="bk-tussen"></span>
          <button type="button" class="bk-knop bk-speel" data-actie="speel" aria-pressed="false" aria-label="Vanzelf afspelen">${ICOON.speel}<span>Vanzelf afspelen</span></button>
          <label class="bk-tempo"><span aria-hidden="true">Tempo</span><select data-tempo aria-label="Tempo van vanzelf afspelen">${TEMPO.map(([k, n]) => `<option value="${k}"${k === tempo ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <button type="button" class="bk-knop" data-actie="vol" aria-pressed="false" aria-label="Volledig scherm">${ICOON.vol}<span>Volledig scherm</span></button>
        </div>
        <p class="bk-sr" aria-live="polite"></p>
      </section>
      <div class="bk-boekje" aria-label="Boekje: ${esc(pk.titel)}" role="region" hidden></div>`;
    const $ = (s) => host.querySelector(s);
    const podium = $(".bk-podium"), dias = $(".bk-dias"), boek = $(".bk-boekje");

    // ---------- één dia ----------
    const tafereel = (tf, alt) => {
      const t = tf && pk.taferelen[tf.id]; if (!t) return "";
      return `<figure class="tafereel bk-tf${tf.algemeen ? " algemeen" : ""}" data-tf="${esc(tf.id)}"><div class="tf-kader"><svg class="tf-svg" viewBox="0 0 320 140" role="img" aria-label="${esc(t.label)}" focusable="false">${t.svg}</svg></div><figcaption>${tf.algemeen ? `<b>${esc(tf.plaats)}</b> ${esc(t.bij || t.n)} <small>Algemene tekening</small>` : `<b>${esc(t.n)}</b> ${esc(tf.tekst)}`}</figcaption></figure>` + (alt || "");
    };
    const lees = (r) => (r ? `<p class="bk-lees">${ICOON.boek}<span>Lees in je Bijbel: <b>${esc(r)}</b></span></p>` : "");
    const tijd = (t) => (t ? `<p class="bk-tijd"><span>${esc(t.tekst)}</span><span class="bk-grond">${esc(t.grond)}${t.onzeker ? " · " + esc(t.onzeker) : ""}</span></p>` : "");
    const wie = (w) => (w && w.length ? `<p class="bk-wie">${w.map((x) => `<span>${esc(x)}</span>`).join("")}</p>` : "");
    const kruis = (k, kop) => (k && k.length ? `${kop ? `<p class="bk-label">${esc(kop)}</p>` : ""}<ul class="bk-kruis">${k.map(([r, t]) => `<li><b>${esc(r)}</b> ${esc(t)}</li>`).join("")}</ul>` : "");
    const maker = () => `<p class="bk-maker"><a href="https://denckh.nl" rel="noopener"><span>Gemaakt door</span><img src="${esc(o.logo)}" alt="Denckh" width="93" height="28"></a></p>`;
    function diaHtml(d, i) {
      const kop = `<p class="bk-kop">${esc(d.kop || "")}</p>`;
      if (d.s === "titel") return `<div class="bk-d bk-d-titel"><div class="bk-d-tekst">${kop}<h2 class="bk-titel">${esc(d.t)}</h2>${d.ref ? `<p class="bk-ref">${esc(d.ref)}${d.bereik ? ` · ${esc(d.bereik)}` : ""}</p>` : ""}${tijd(d.tijd)}<div class="bk-txt">${d.intro ? `<p>${esc(d.intro)}</p>` : ""}${d.delen ? `<ol class="bk-delen">${d.delen.map(([n, r]) => `<li><b>${esc(n)}</b> <span>${esc(r)}</span></li>`).join("")}</ol>` : ""}${wie(d.wie)}${i === 0 && pk.voorlezer ? `<p class="bk-voorlezer"><b>Voor wie voorleest.</b> ${esc(pk.voorlezer)}</p>` : ""}</div>${lees(d.lees)}<p class="bk-niveau">Reisniveau: ${esc(pk.niveauNaam)}</p></div>${d.kaart ? `<div class="bk-d-beeld"><div class="bk-d-kaart" data-kaart="${i}"></div></div>` : ""}</div>`;
      if (d.s === "stap") return `<div class="bk-d bk-d-stap${d.kaart || d.tf ? "" : " zonder"}">${d.kaart || d.tf ? `<div class="bk-d-beeld">${d.kaart ? `<div class="bk-d-kaart" data-kaart="${i}"></div>` : ""}${tafereel(d.tf)}</div>` : ""}<div class="bk-d-tekst">${kop}<h2 class="bk-titel">${esc(d.t)}</h2><p class="bk-ref">${esc(d.ref)}${d.km ? ` · ca. ${fmt(d.km)} km` : ""}</p>${wie(d.wie)}<div class="bk-txt"><p>${esc(d.txt)}</p>${d.fact ? `<p class="bk-weetje"><b>Wist je dat?${d.fs ? ` <small>${esc(d.fs)}</small>` : ""}</b> ${esc(d.fact)}</p>` : ""}</div></div></div>`;
      if (d.s === "tekst") return `<div class="bk-d bk-d-tekstdia"><div class="bk-d-tekst">${kop}<h2 class="bk-titel">${esc(d.t)}</h2><div class="bk-txt">${d.label ? `<p class="bk-label">${esc(d.label)}</p>` : ""}${d.txt ? `<p>${esc(d.txt)}</p>` : ""}${d.refs && d.refs.length ? `<p class="bk-refs">${d.refs.map(esc).join(" · ")}</p>` : ""}${kruis(d.kruis, d.kruisKop)}</div></div></div>`;
      if (d.s === "vraag") return `<div class="bk-d bk-d-vraag"><div class="bk-d-tekst">${kop.replace("bk-kop\">", `bk-kop">Vraag ${d.nr} van ${d.van} · `)}<h2 class="bk-titel bk-vraagtekst">${esc(d.q)}</h2><ol class="bk-opties">${d.a.map((a, j) => `<li><button type="button" class="bk-optie" data-optie="${j}"><span class="bk-letter" aria-hidden="true">${"ABCD"[j]}</span><span>${esc(a)}</span></button></li>`).join("")}</ol><p class="bk-antwoord" hidden></p><button type="button" class="bk-knop bk-toonantwoord">Laat het antwoord zien</button></div></div>`;
      return `<div class="bk-d bk-d-slot"><div class="bk-d-tekst"><p class="bk-kop">Bronnen</p><h2 class="bk-titel">${esc(pk.titel)}</h2>${lees(D[0].lees || pk.ref)}<ul class="bk-bronnen">${BRONNEN.map((b) => `<li>${b}</li>`).join("")}</ul>${maker()}<p class="bk-adres">Op reis door de Bijbel · <a href="https://bijbelreis.nl/" rel="noopener">bijbelreis.nl</a></p></div></div>`;
    }

    // ---------- kaart tekenen ----------
    function kaartIn(el, d, opties) {
      const W = Math.max(120, Math.round(el.clientWidth)), H = Math.max(90, Math.round(el.clientHeight));
      // Lettergrootte van de namen volgt het podium (achter in een zaal leesbaar), niet de maat van het kaartvlak.
      const staand = podium.clientWidth < podium.clientHeight * 1.05;
      const fs = opties.fs || Math.max(12.5, Math.min(30, staand ? Math.min(W / 25, podium.clientHeight * 0.02) : podium.clientHeight * 0.0235));
      const r = KA.teken(d.kaart, ctx, { W, H, fs, id: id + "-" + opties.id, nt: pk.nt && !d.kaart.ot, niveau: pk.niveau, meet, anim: opties.anim });
      el.innerHTML = r.svg;
      return r;
    }

    // ---------- presentatie ----------
    function toonDia(i, opts) {
      opts = opts || {};
      nu = Math.max(0, Math.min(D.length - 1, i));
      const d = D[nu], beweeg = !minderBeweging() && !opts.stil;
      dias.innerHTML = `<div class="bk-dia" role="group" aria-roledescription="dia" aria-label="${nu + 1} van ${D.length}" data-soort="${d.s}" data-nr="${nu}">${diaHtml(d, nu)}</div>`;
      const el = dias.firstElementChild;
      el.querySelectorAll(".bk-d-kaart").forEach((k) => { const r = kaartIn(k, d, { id: "p" + nu, anim: beweeg }); k.insertAdjacentHTML("afterend", legenda(r.legenda)); });
      // Is de legenda erbij gekomen, dan krijgt de kaart iets minder hoogte: nog één keer tekenen op de echte maat.
      el.querySelectorAll(".bk-d-kaart").forEach((k) => { const svg = k.querySelector("svg"), vb = svg && svg.viewBox.baseVal; if (vb && (Math.abs(vb.height - k.clientHeight) > 2 || Math.abs(vb.width - k.clientWidth) > 2)) kaartIn(k, d, { id: "p" + nu, anim: beweeg }); });
      if (beweeg) requestAnimationFrame(() => { el.classList.add("bk-loopt"); el.querySelectorAll(".tafereel").forEach((f) => f.classList.add("tf-loopt")); });
      pas(el);
      $(".bk-voortgang div").style.width = (((nu + 1) / D.length) * 100).toFixed(2) + "%";
      $(".bk-teller").textContent = `${nu + 1} / ${D.length}`;
      $('[data-actie="vorige"]').disabled = nu === 0;
      $('[data-actie="volgende"]').disabled = nu === D.length - 1;
      const naam = d.s === "titel" ? d.t : d.s === "stap" ? `${d.kop}: ${d.t}` : d.s === "vraag" ? `Vraag ${d.nr}: ${d.q}` : d.s === "tekst" ? d.t : "Bronnen";
      $(".bk-sr").textContent = `Dia ${nu + 1} van ${D.length}. ${naam}`;
      el.querySelectorAll(".bk-optie").forEach((b) => b.addEventListener("click", () => antwoord(+b.dataset.optie)));
      const ta = el.querySelector(".bk-toonantwoord"); if (ta) ta.addEventListener("click", () => antwoord(null));
      getoond.add(nu);
      if (o.opDia) o.opDia(nu);
      if (speelt) plan();
    }
    // De tekst zo groot als past: begin groot en maak kleiner tot alles in het tekstvak staat (alleen op een breed podium).
    function pas(el) {
      const vak = el.querySelector(".bk-d-tekst"); if (!vak) return;
      const staand = podium.clientWidth < podium.clientHeight * 1.05;
      vak.style.fontSize = "";
      if (staand) return;
      // Begin ruim boven de gewone maat: een korte tekst (Voorlezen) staat dan extra groot op het scherm.
      const basis = parseFloat(getComputedStyle(vak).fontSize), min = Math.max(14, podium.clientHeight * 0.019);
      let f = basis * (el.querySelector(".bk-d-stap") ? 1.35 : el.querySelector(".bk-d-tekstdia") ? 1.2 : 1);
      vak.style.fontSize = f.toFixed(1) + "px";
      while (vak.scrollHeight > vak.clientHeight + 1 && f > min) { f = Math.max(min, f * 0.93); vak.style.fontSize = f.toFixed(1) + "px"; }
    }
    function antwoord(j) {
      const d = D[nu], el = dias.querySelector(".bk-d-vraag"); if (!el || d.s !== "vraag" || el.classList.contains("klaar")) return;
      el.classList.add("klaar");
      el.querySelectorAll(".bk-optie").forEach((b, k) => { b.disabled = true; b.classList.toggle("goed", k === d.goed); b.classList.toggle("fout", k === j && j !== d.goed); if (k === d.goed) b.setAttribute("aria-label", d.a[k] + " (het goede antwoord)"); });
      const a = el.querySelector(".bk-antwoord");
      a.hidden = false;
      a.innerHTML = `${j == null ? "" : j === d.goed ? "<b>Goed!</b> " : "<b>Niet goed.</b> "}Het goede antwoord is <b>${esc(d.a[d.goed])}</b>.${d.why ? ` <span>Lees: ${esc(d.why)}</span>` : ""}`;
      el.querySelector(".bk-toonantwoord").hidden = true;
      $(".bk-sr").textContent = "Het goede antwoord is: " + d.a[d.goed];
    }
    const open = () => D[nu].s === "vraag" && !(dias.querySelector(".bk-d-vraag") || { classList: { contains: () => true } }).classList.contains("klaar");
    function volgende() { if (open()) { antwoord(null); if (speelt) plan(); return; } if (nu < D.length - 1) toonDia(nu + 1); else stopSpelen(); }
    function vorige() { if (nu > 0) toonDia(nu - 1); }

    // ---------- vanzelf afspelen ----------
    function duur() {
      const d = D[nu], basis = (TEMPO.find((t) => t[0] === tempo) || TEMPO[1])[2] * 1000;
      if (d.s === "vraag") return open() ? basis : basis * 0.6;
      const tekst = (d.txt || "") + (d.intro || "") + (d.fact || ""), kaart = dias.querySelector(".bk-loopt [data-kop]") ? 2500 : 0;
      return Math.min(basis * 3, Math.max(basis, (basis * tekst.length) / 380)) + kaart;
    }
    function plan() { clearTimeout(klok); if (!speelt) return; klok = setTimeout(() => { if (!speelt) return; if (nu >= D.length - 1 && !open()) { stopSpelen(); return; } volgende(); }, duur()); }
    function zetSpelen(aan) {
      speelt = aan; const b = $('[data-actie="speel"]');
      b.setAttribute("aria-pressed", String(aan)); b.innerHTML = (aan ? ICOON.pauze : ICOON.speel) + `<span>${aan ? "Pauzeer" : "Vanzelf afspelen"}</span>`; b.setAttribute("aria-label", aan ? "Pauzeer" : "Vanzelf afspelen");
      podium.classList.toggle("bk-speelt", aan);
      if (aan) { if (nu >= D.length - 1) toonDia(0); else plan(); } else clearTimeout(klok);
    }
    const stopSpelen = () => zetSpelen(false);

    // ---------- volledig scherm ----------
    const echtVol = () => document.fullscreenElement === podium;
    function zetVol(aan) {
      if (aan) {
        if (podium.requestFullscreen && document.fullscreenEnabled) podium.requestFullscreen().catch(() => nepVol(true));
        else nepVol(true);
      } else if (echtVol()) document.exitFullscreen(); else nepVol(false);
    }
    function nepVol(aan) { podium.classList.toggle("bk-vol", aan); document.documentElement.classList.toggle("bk-vol-aan", aan); volKnop(); herteken(); }
    function volKnop() { const aan = echtVol() || podium.classList.contains("bk-vol"), b = $('[data-actie="vol"]'); b.setAttribute("aria-pressed", String(aan)); b.querySelector("span").textContent = aan ? "Klein scherm" : "Volledig scherm"; b.setAttribute("aria-label", aan ? "Klein scherm" : "Volledig scherm"); }
    document.addEventListener("fullscreenchange", () => { volKnop(); herteken(); }, mee);

    // ---------- bediening ----------
    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-actie], [data-toon]"); if (!b || !host.contains(b)) return;
      const a = b.dataset.actie;
      if (b.dataset.toon) zetToon(b.dataset.toon);
      else if (a === "vorige") vorige(); else if (a === "volgende") volgende();
      else if (a === "speel") zetSpelen(!speelt); else if (a === "vol") zetVol(!(echtVol() || podium.classList.contains("bk-vol")));
      else if (a === "print") afdrukken();
    });
    $("[data-tempo]").addEventListener("change", (e) => { tempo = e.target.value; if (o.bewaar) o.bewaar({ tempo }); if (speelt) plan(); });
    // Tikken op de dia: volgende. Vegen: vorige of volgende. Knoppen, links en keuzelijsten doen gewoon hun eigen werk.
    let veeg = null, geveegd = false;
    dias.addEventListener("pointerdown", (e) => { veeg = { x: e.clientX, y: e.clientY }; geveegd = false; });
    dias.addEventListener("pointerup", (e) => {
      if (!veeg) return; const dx = e.clientX - veeg.x, dy = e.clientY - veeg.y; veeg = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { geveegd = true; dx < 0 ? volgende() : vorige(); }
    });
    dias.addEventListener("click", (e) => {
      if (geveegd) { geveegd = false; return; }
      if (e.target.closest("button, a, select, input, summary, label")) return;
      if (global.getSelection && String(global.getSelection())) return;
      volgende();
    });
    document.addEventListener("keydown", (e) => {
      if (toon !== "presentatie" || e.altKey || e.ctrlKey || e.metaKey || !host.isConnected) return;
      if (e.target.closest && e.target.closest("input, select, textarea, [contenteditable]")) return;
      const knop = e.target.closest && e.target.closest("button, a, summary");
      const k = e.key;
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(k) || (k === " " && !knop) || (k === "Enter" && !knop)) { e.preventDefault(); volgende(); }
      else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(k) || (k === "Backspace" && !knop)) { e.preventDefault(); vorige(); }
      else if (k === "Home") { e.preventDefault(); toonDia(0); } else if (k === "End") { e.preventDefault(); toonDia(D.length - 1); }
      else if (k === "f" || k === "F") { e.preventDefault(); zetVol(!(echtVol() || podium.classList.contains("bk-vol"))); }
      else if (k === "Escape" && podium.classList.contains("bk-vol")) nepVol(false);
    }, mee);
    let rt = 0;
    function herteken() { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => { if (toon === "presentatie") toonDia(nu, { stil: true }); }); }
    if (global.ResizeObserver) { let maat = ""; kijker = new ResizeObserver(() => { const m = podium.clientWidth + "x" + podium.clientHeight; if (m !== maat && maat) herteken(); maat = m; }); kijker.observe(podium); }

    // ---------- boekje ----------
    function maakBoekje() {
      if (boekjeKlaar) return;
      boekjeKlaar = true;
      const blok = [];
      const kaart = (d, i, W, H) => { if (!d.kaart) return ""; const r = KA.teken(d.kaart, ctx, { W, H, fs: 13, id: id + "-b" + i, nt: pk.nt && !d.kaart.ot, niveau: pk.niveau, meet }); return `<div class="bk-b-kaart">${r.svg}</div>${legenda(r.legenda)}`; };
      let vragen = [];
      const vragenBlok = () => {
        if (!vragen.length) return;
        const kop = vragen[0].kop;
        blok.push(`<section class="bk-b bk-b-vragen"><p class="bk-kop">${esc(kop)}</p><h2>Vragen</h2><ol class="bk-b-vraaglijst">${vragen.map((v) => `<li><p>${esc(v.q)}</p><ol class="bk-b-opties" type="a">${v.a.map((a) => `<li>${esc(a)}</li>`).join("")}</ol></li>`).join("")}</ol><p class="bk-b-antwoorden"><b>Antwoorden.</b> ${vragen.map((v, j) => `${j + 1}: ${"abcd"[v.goed]} (${esc(v.a[v.goed])}${v.why ? ", " + esc(v.why) : ""})`).join(" · ")}</p></section>`);
        vragen = [];
      };
      D.forEach((d, i) => {
        if (d.s !== "vraag") vragenBlok();
        if (d.s === "titel" && i === 0) blok.push(`<section class="bk-b bk-b-voorblad"><p class="bk-kop">Op reis door de Bijbel${d.kop && d.kop !== "Op reis door de Bijbel" ? " · " + esc(d.kop) : ""}</p><h1>${esc(d.t)}</h1>${d.ref ? `<p class="bk-ref">${esc(d.ref)}${d.bereik ? ` · ${esc(d.bereik)}` : ""}</p>` : ""}${tijd(d.tijd)}${d.intro ? `<p class="bk-intro">${esc(d.intro)}</p>` : ""}${d.delen ? `<ol class="bk-delen">${d.delen.map(([n, r]) => `<li><b>${esc(n)}</b> <span>${esc(r)}</span></li>`).join("")}</ol>` : ""}${wie(d.wie)}${kaart(d, i, 720, d.delen ? 400 : 460)}${pk.voorlezer ? `<p class="bk-voorlezer"><b>Voor wie voorleest.</b> ${esc(pk.voorlezer)}</p>` : ""}${pk.meldingen && pk.meldingen.length ? `<p class="bk-melding">${pk.meldingen.map(esc).join(" ")}</p>` : ""}${lees(d.lees)}<p class="bk-niveau">Reisniveau: ${esc(pk.niveauNaam)}</p></section>`);
        else if (d.s === "titel") blok.push(`<section class="bk-b bk-b-deel"><p class="bk-kop">${esc(d.kop)}</p><h2>${esc(d.t)}</h2><p class="bk-ref">${esc(d.ref)}</p>${tijd(d.tijd)}${d.intro ? `<p class="bk-intro">${esc(d.intro)}</p>` : ""}${kaart(d, i, 720, 320)}${lees(d.lees)}</section>`);
        else if (d.s === "stap") blok.push(`<section class="bk-b bk-b-stap${d.tf ? " met-tf" : ""}"><p class="bk-kop">${esc(d.kop)}</p><h3>${esc(d.t)}</h3><p class="bk-ref">${esc(d.ref)}${d.km ? ` · ca. ${fmt(d.km)} km` : ""}</p>${kaart(d, i, 720, 236)}<div class="bk-b-rij"><div class="bk-b-tekst">${wie(d.wie)}<p>${esc(d.txt)}</p>${d.fact ? `<p class="bk-weetje"><b>Wist je dat?${d.fs ? ` <small>${esc(d.fs)}</small>` : ""}</b> ${esc(d.fact)}</p>` : ""}</div>${tafereel(d.tf)}</div></section>`);
        else if (d.s === "tekst") blok.push(`<section class="bk-b bk-b-tekst"><p class="bk-kop">${esc(d.kop)}</p><h3>${esc(d.t)}</h3>${d.label ? `<p class="bk-label">${esc(d.label)}</p>` : ""}${d.txt ? `<p>${esc(d.txt)}</p>` : ""}${d.refs && d.refs.length ? `<p class="bk-refs">${d.refs.map(esc).join(" · ")}</p>` : ""}${kruis(d.kruis, d.kruisKop)}</section>`);
        else if (d.s === "vraag") vragen.push(d);
        else if (d.s === "slot") blok.push(`<section class="bk-b bk-b-slot"><h2>Bronnen</h2>${lees(D[0].lees || pk.ref)}<ul class="bk-bronnen">${BRONNEN.map((b) => `<li>${b}</li>`).join("")}</ul>${maker()}<p class="bk-adres">Op reis door de Bijbel · <a href="https://bijbelreis.nl/" rel="noopener">bijbelreis.nl</a></p></section>`);
      });
      vragenBlok();
      boek.innerHTML = `<div class="bk-vel">${blok.join("")}</div>`;
    }
    function afdrukken() { stopSpelen(); maakBoekje(); setTimeout(() => global.print(), 50); }
    global.addEventListener("beforeprint", maakBoekje, mee);

    function zetToon(t) {
      toon = t === "boekje" ? "boekje" : "presentatie";
      host.querySelectorAll("[data-toon]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.toon === toon)));
      podium.hidden = toon !== "presentatie"; boek.hidden = toon !== "boekje";
      host.dataset.toon = toon;
      if (toon === "boekje") { stopSpelen(); maakBoekje(); } else toonDia(nu, { stil: getoond.has(nu) });
      if (o.opToon) o.opToon(toon);
    }
    zetToon(toon);
    return {
      host, extra: $(".bk-balk-extra"), get dia() { return nu; }, get toon() { return toon; }, get speelt() { return speelt; },
      naar: toonDia, volgende, vorige, zetToon, zetSpelen, maakBoekje, afdrukken,
      weg() { stopSpelen(); if (echtVol()) document.exitFullscreen(); if (podium.classList.contains("bk-vol")) nepVol(false); ac.abort(); if (kijker) kijker.disconnect(); cancelAnimationFrame(rt); host.innerHTML = ""; },
    };
  }

  // Het losse bestand: alles staat er al in (BR.boekjeLos), zonder server.
  function los() {
    const L = BR.boekjeLos, host = document.getElementById("boekje");
    if (!L || !host) return;
    const s = maak(host, { pakket: L.pakket, basis: L.basis, logo: L.logo, toon: /toon=boekje/.test(location.hash) ? "boekje" : "presentatie" });
    s.extra.innerHTML = `<a class="bk-knop" href="https://bijbelreis.nl/" rel="noopener">Naar de Bijbelreis</a>`;
  }

  BR.boekjeSpeler = { maak, los, BRONNEN, TEMPO };
})(typeof window !== "undefined" ? window : globalThis);
