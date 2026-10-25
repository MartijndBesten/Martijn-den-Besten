// Bijbelreis: de kaart, het reisboek, de speurtocht, de afstanden en het paspoort.
// Inhoud komt uit plaatsen.js en inhoud/*.js (BR.boeken). Geen externe bronnen: alles staat op deze site.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;
  const fmt = (n) => n.toLocaleString("nl-NL");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const store = {
    get(k, d) { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)); } catch { /* geen opslag: dan geen stempels */ } },
  };
  const color = (key) => `var(--${key}-deep, var(--${key}))`;
  const GROUPS = new Set(["Mannen", "Bezoekers", "Koningen", "Broers", "Kinderen", "Familie", "Mensen", "Volk", "Soldaten", "Leger", "Spionnen", "Vrouwen", "Priesters", "Profeten", "Vijanden", "Knechten", "Boden", "Zonen", "Dochters"]);

  // ---------- rekenen ----------
  function hav(a, b) {
    const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }
  const len = (p) => p.slice(1).reduce((s, q, i) => s + hav(p[i], q), 0);
  const roundKm = (km) => (km < 100 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- inhoud klaarzetten ----------
  const P = BR.plaatsen, W = BR.W;
  const missing = new Set();
  function ll(k) {
    if (Array.isArray(k)) return k;
    if (P[k]) return P[k].ll;
    if (W[k]) return W[k];
    missing.add(k);
    return [31.5, 35.2];
  }
  const BOEKEN = BR.boeken;
  const ALLPARTS = [], STEP_BY_KEY = new Map();
  BOEKEN.forEach((b) => b.delen.forEach((d) => {
    d.boek = b;
    d.key = b.id + ":" + d.id;
    d.steps.forEach((s, i) => {
      s.deel = d; s.i = i; s.key = d.key + ":" + i; s.at = s.at || []; STEP_BY_KEY.set(s.key, s);
      (s.r || []).forEach((r) => { r.w = r.w || d.c; r.pts = r.p.map(ll); r.cum = [0]; r.pts.slice(1).forEach((q, j) => r.cum.push(r.cum[j] + hav(r.pts[j], q))); r.len = r.cum[r.cum.length - 1]; });
      s.km = s.r ? roundKm(s.r.reduce((a, r) => a + r.len, 0)) : 0;
    });
    ALLPARTS.push(d);
  }));
  if (missing.size) console.error("Bijbelreis: onbekende plaatsen of tussenpunten:", [...missing].join(", "));
  const partKm = (d) => d.steps.reduce((a, s) => a + (s.r || []).filter((r) => r.w === d.c).reduce((b, r) => b + r.len, 0), 0);
  const scrollToMap = () => { if (isNarrow()) document.querySelector(".mapwrap").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); };

  // ---------- kaart ----------
  const WIDE = [[29.0, 30.5], [38.6, 47.6]], KANAAN = [[30.9, 34.2], [33.4, 36.4]];
  const map = L.map("map", { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 4, maxZoom: 11, attributionControl: false, maxBounds: [[22, 4], [47, 57]], maxBoundsViscosity: 0.8, zoomControl: false });
  L.control.zoom({ position: "topleft", zoomInTitle: "Inzoomen", zoomOutTitle: "Uitzoomen" }).addTo(map);
  L.control.scale({ imperial: false, maxWidth: 120, position: "bottomleft" }).addTo(map);
  map.fitBounds(WIDE, { padding: [20, 20] });
  // Lagen van onder naar boven: land en streken, reliëf (vermenigvuldigd), moderne grenzen, water, routes (overlayPane), plaatsen.
  [["basis", 250], ["relief", 300], ["water", 360], ["modern", 380]].forEach(([n, z]) => { map.createPane(n).style.zIndex = z; map.getPane(n).style.pointerEvents = "none"; });
  const icon = (html, cls = "pl") => L.divIcon({ className: cls, iconSize: [0, 0], html });

  const KLEINE_RIVIEREN = [
    { n: "Jabbok", p: [[31.95, 35.93], [32.07, 36.09], [32.17, 36.05], [32.27, 35.92], [32.21, 35.78], [32.19, 35.66], [32.1, 35.56]] },
    { n: "Jarmuk", p: [[32.75, 36.2], [32.73, 36.0], [32.68, 35.8], [32.69, 35.64]] },
    { n: "Arnon", p: [[31.35, 36.1], [31.45, 35.9], [31.5, 35.7], [31.47, 35.55]] },
    { n: "Kison", p: [[32.55, 35.25], [32.65, 35.15], [32.75, 35.05], [32.82, 35.02]] },
    { n: "Besor", p: [[31.15, 34.95], [31.25, 34.75], [31.33, 34.55], [31.38, 34.4]] },
  ];
  const PEAKS = [
    { n: "Hermon", h: 2814, ll: [33.41, 35.86], z: 7 }, { n: "Karmel", h: 546, ll: [32.73, 35.05], z: 8.25 }, { n: "Tabor", h: 575, ll: [32.69, 35.39], z: 8.75 },
    { n: "Gerizim", h: 881, ll: [32.195, 35.265], z: 9.75 }, { n: "Ebal", h: 940, ll: [32.235, 35.27], z: 9.75 }, { n: "Nebo", h: 817, ll: [31.77, 35.73], z: 8.25 },
    { n: "Gilboa", h: 497, ll: [32.47, 35.42], z: 9.25 }, { n: "Sinaï (Jebel Musa)", h: 2285, ll: [28.54, 33.98], z: 6.5 }, { n: "Libanon", h: 3088, ll: [34.31, 36.1], z: 7.75 },
  ];
  const REGIONS = [
    { t: "Kanaän", tijd: "ot", ll: [31.75, 34.8], z: [6.5, 7.6], k: "land" }, { t: "Egypte", ll: [29.6, 31.0], z: [4, 8], k: "land" }, { t: "Sinaï", ll: [29.6, 33.8], z: [5, 8], k: "land" },
    { t: "Sinear", tijd: "ot", ll: [32.0, 45.3], z: [4, 7], k: "land" }, { t: "Arabische woestijn", ll: [31.3, 40.2], z: [4, 7], k: "land" }, { t: "Aram", tijd: "ot", ll: [35.2, 38.6], z: [5, 7.5], k: "land" },
    { t: "Negev", ll: [30.7, 34.8], z: [7, 9], k: "land" }, { t: "Moab", tijd: "ot", ll: [31.3, 35.85], z: [7.5, 10], k: "land" }, { t: "Edom", tijd: "ot", ll: [30.3, 35.5], z: [7, 9], k: "land" },
    { t: "Filistijnen", tijd: "ot", ll: [31.42, 34.38], z: [8.25, 10], k: "land" }, { t: "Basan", tijd: "ot", ll: [32.95, 36.1], z: [7.5, 10], k: "land" }, { t: "Elam", tijd: "ot", ll: [32.0, 48.8], z: [4.5, 7], k: "land" },
    { t: "Assyrië", tijd: "ot", ll: [36.0, 42.6], z: [4.5, 7], k: "land" }, { t: "Perzië", tijd: "ot", ll: [31.5, 51.5], z: [4, 6.5], k: "land" },
    { t: "Grote Zee", ll: [33.3, 32.6], z: [4, 9], k: "sea" }, { t: "Dode Zee", ll: [31.45, 35.52], z: [8.5, 12], k: "sea" }, { t: "Meer van Galilea", ll: [32.82, 35.59], z: [8.75, 12], k: "sea" },
    { t: "Rode Zee", ll: [26.5, 35.4], z: [4, 8], k: "sea" }, { t: "Perzische Golf", ll: [28.6, 49.9], z: [4, 7], k: "sea" },
    { t: "Eufraat", ll: [37.35, 38.75], z: [5, 9], k: "sea" }, { t: "Tigris", ll: [34.7, 43.75], z: [5, 9], k: "sea" }, { t: "Nijl", ll: [29.3, 31.42], z: [6, 9], k: "sea" },
    { t: "Jordaan", ll: [32.35, 35.66], z: [8, 12], k: "sea" }, { t: "Jabbok", ll: [32.0, 36.2], z: [8.5, 12], k: "sea", tijd: "ot" },
    // Streken in de tijd van het Nieuwe Testament (Romeinse provincies en landstreken zoals de Bijbel ze noemt).
    { t: "Galilea", ll: [32.88, 35.32], z: [7.25, 10], k: "land", tijd: "nt" }, { t: "Samaria", ll: [32.2, 35.12], z: [7.5, 10], k: "land", tijd: "nt" },
    { t: "Judea", ll: [31.55, 34.98], z: [7.25, 10], k: "land", tijd: "nt" }, { t: "Dekapolis", ll: [32.55, 35.95], z: [7.75, 10], k: "land", tijd: "nt" },
    { t: "Syrië", ll: [34.6, 37.3], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Cilicië", ll: [37.15, 34.9], z: [5.5, 8], k: "land", tijd: "nt" },
    { t: "Pamfylië", ll: [37.1, 31.3], z: [5.5, 8], k: "land", tijd: "nt" }, { t: "Galatië", ll: [39.3, 32.6], z: [4.75, 7.5], k: "land", tijd: "nt" },
    { t: "Asia", ll: [38.7, 28.7], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Macedonië", ll: [40.9, 22.3], z: [4.75, 7.5], k: "land", tijd: "nt" },
    { t: "Achaje", ll: [37.6, 22.0], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Italië", ll: [41.2, 15.2], z: [4, 7], k: "land", tijd: "nt" },
    { t: "Kreta", ll: [35.25, 24.6], z: [5, 8], k: "land", tijd: "nt" }, { t: "Cyprus", ll: [35.1, 33.15], z: [5, 8], k: "land", tijd: "nt" },
    { t: "Adria", ll: [38.0, 18.6], z: [4, 7], k: "sea", tijd: "nt" },
  ];

  const lyRoutes = L.layerGroup().addTo(map), lyPlaces = L.layerGroup().addTo(map), lyKings = L.layerGroup();
  const lySpecial = L.layerGroup().addTo(map), lyQuiz = L.layerGroup().addTo(map), lyNL = L.layerGroup().addTo(map);
  const partRoutes = new Map();
  let geoReady = false, insetGeo = null;

  function drawBase(geo) {
    const base = { pane: "basis", interactive: false };
    // De zee als eigen vlak: het reliëf mengt alleen met lagen binnen de kaart, niet met de achtergrond van de pagina.
    L.rectangle([[10, 5], [55, 70]], { ...base, className: "seabg" }).addTo(map);
    L.geoJSON(geo.land, { ...base, className: "landglow" }).addTo(map);
    L.geoJSON(geo.land, { ...base, className: "land" }).addTo(map);
    geo.regions.forEach((f) => L.geoJSON(f, { ...base, className: "rg-" + f.properties.k }).addTo(map));
    geo.lakes.forEach((f) => L.geoJSON(f, { pane: "water", interactive: false, className: "lake" }).addTo(map));
    geo.rivers.forEach((f) => L.geoJSON(f, { pane: "water", interactive: false, className: "river" }).addTo(map));
    KLEINE_RIVIEREN.forEach((r) => L.polyline(r.p, { pane: "water", className: "river klein", interactive: false }).addTo(map));
    insetGeo = geo;
    geoReady = true;
    drawInset();
  }
  // Reliëf (schaduw van bergen en dalen) en moderne grenzen zijn aanvullingen: als ze niet laden, werkt de kaart gewoon.
  fetch("/bijbelreis/relief.json").then((r) => (r.ok ? r.json() : null)).then((rel) => {
    if (!rel) return;
    Object.values(rel).filter((o) => o && o.src && o.bounds).forEach((o) => L.imageOverlay(o.src, o.bounds, { pane: "relief", interactive: false, className: "relief", alt: "" }).addTo(map));
  }).catch(() => {});
  const lyModern = L.layerGroup();
  let modernLoaded = false;
  function loadModern() {
    if (modernLoaded) return Promise.resolve();
    modernLoaded = true;
    return fetch("/bijbelreis/grenzen.json").then((r) => r.json()).then((g) => {
      const feats = g.features || [];
      L.geoJSON({ type: "FeatureCollection", features: feats.filter((f) => f.geometry.type !== "Point") }, { pane: "modern", interactive: false, className: "border" }).addTo(lyModern);
      // Alleen landen die Nederland erkent krijgen een naam (geen ‘Noord-Cyprus’).
      feats.filter((f) => f.geometry.type === "Point" && f.properties.naam !== "Noord-Cyprus").forEach((f) => lyModern.addLayer(L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { interactive: false, keyboard: false, icon: icon(`<span class="country">${esc(f.properties.naam)}</span>`) })));
    }).catch(() => { modernLoaded = false; toast("De moderne grenzen konden niet worden geladen."); });
  }
  const peakMarkers = PEAKS.map((p) => L.marker(p.ll, { interactive: false, keyboard: false, icon: icon(`<span class="peak off"><i></i><span>${esc(p.n)} ${fmt(p.h)} m</span></span>`) }).addTo(map));
  const regionMarkers = REGIONS.map((r) => L.marker(r.ll, { interactive: false, keyboard: false, icon: icon(`<span class="region ${r.k}">${esc(r.t)}</span>`) }).addTo(map));

  // Plaatsen: één marker per plaats, met een icoon per soort.
  const PIN = {
    stad: '<circle class="f" cx="7" cy="7" r="4.6"/>', altaar: '<path class="f" d="M7 1.2 12.8 7 7 12.8 1.2 7z"/>', put: '<circle class="f" cx="7" cy="7" r="4.6"/><circle cx="7" cy="7" r="1.8" fill="var(--halo)"/>',
    berg: '<path class="f" d="M7 1.5 12.5 12H1.5z"/>', tent: '<path class="f" d="M7 1.5 13 12.5H1z"/><path d="M7 7v5.5" stroke="var(--halo)" stroke-width="1.6"/>',
    kamp: '<rect class="f" x="2.2" y="2.2" width="9.6" height="9.6" rx="2"/>', gebied: '<circle class="f" cx="7" cy="7" r="5"/>', water: '<circle class="f" cx="7" cy="7" r="4.6"/>', ctx: '<circle class="f" cx="7" cy="7" r="4"/>',
  };
  // Zekerheid van de ligging (zie docs/BIJBELREIS.md): v identificeerbaar, w waarschijnlijk, b betwist, o onbekend, r gebied.
  const ZEKER = {
    v: ["Identificeerbaar", "De plek is bekend: de naam bleef in gebruik of de opgraving is algemeen aanvaard."],
    w: ["Waarschijnlijk", "Waarschijnlijk lag het hier, maar helemaal zeker is het niet."],
    b: ["Betwist", "Onderzoekers noemen verschillende plekken. Op de kaart staat de meest gangbare; de andere zijn kleine ringen."],
    o: ["Onbekend", "Niemand weet waar dit precies lag. Het vraagteken staat alleen ongeveer in de goede streek."],
    r: ["Gebied", "Dit is een streek of gebergte, geen precieze plek."],
  };
  const certOf = (p) => (p.ctx ? "v" : ZEKER[p.c] ? p.c : "w");
  // Welke stappen spelen zich op een plek af? (voor de pop-up ‘Hier in de reis’)
  const STEPS_AT = {};
  BOEKEN.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => (s.at || []).forEach((id) => (STEPS_AT[id] = STEPS_AT[id] || []).push([d, i])))));
  function placePopup(id) {
    const p = P[id], c = certOf(p), here = STEPS_AT[id] || [];
    const list = here.slice(0, 8).map(([d, i]) => `<li><button type="button" class="linkbtn" data-go="${d.key}:${i}">${esc(d.boek.n)} · ${esc(d.steps[i].t)}</button></li>`).join("");
    return `<div class="pop"><h3>${esc(p.n)}</h3><p class="zk zk-${c}"><i></i>${ZEKER[c][0]}</p><p>${esc(p.d || "")}</p>${p.nu ? `<p class="nu"><b>Nu:</b> ${esc(p.nu)}</p>` : ""}${c !== "v" && c !== "r" ? `<p class="st">${ZEKER[c][1]}</p>` : ""}${list ? `<p class="label">Hier in de reis</p><ul>${list}</ul>${here.length > 8 ? `<p class="st">en nog ${here.length - 8} keer</p>` : ""}` : ""}${p.bron ? `<p class="st">Ligging: ${esc(p.bron)}</p>` : ""}</div>`;
  }
  const markers = {}, altMarkers = {};
  Object.entries(P).forEach(([id, p]) => {
    const c = certOf(p);
    const t = p.ctx ? "ctx" : c === "r" ? "gebied" : p.t || "stad";
    const pin = c === "o" && !p.ctx ? `<span class="fuzz" aria-hidden="true">?</span>` : c === "r" ? `<span class="area" aria-hidden="true"></span>` : `<span class="${["pin", "t-" + t, p.ctx ? "ctx" : "c-" + c, p.k ? "k" : ""].join(" ")}"><svg viewBox="0 0 14 14" aria-hidden="true">${PIN[t] || PIN.stad}</svg></span>`;
    const lab = ["lab", "s-" + (c === "r" ? "c" : p.s || "r"), p.ctx ? "ctx" : "", p.k ? "k" : "", c === "r" ? "gb" : ""].join(" ");
    const m = L.marker(p.ll, { icon: icon(`${pin}<span class="${lab}">${esc(p.n)}${p.nu ? `<small class="nu">${esc(p.nu)}</small>` : ""}</span>`), keyboard: !p.ctx, title: p.n, alt: p.n });
    m.pid = id; m.pside = c === "r" ? "c" : p.s || "r";
    if (!p.ctx) m.bindPopup(() => placePopup(id), { maxWidth: 280, autoPanPaddingTopLeft: [50, 150], autoPanPaddingBottomRight: [20, 90] });
    if (p.k) lyKings.addLayer(m);
    markers[id] = m;
    if (c === "b" && p.alt) altMarkers[id] = p.alt.map(([la, lo, n]) => L.marker([la, lo], { interactive: false, keyboard: false, icon: icon(`<span class="altpin" aria-hidden="true"></span><span class="lab s-r alt">${esc(n || "andere mogelijke plek")}</span>`) }));
  });
  const lyAlt = L.layerGroup().addTo(map);

  const CAMEL = `<div class="camel"><svg viewBox="0 0 48 40" aria-hidden="true"><path class="leg a" d="M12 30v8"/><path class="leg b" d="M17 30v8"/><path class="leg b" d="M29 30v8"/><path class="leg a" d="M34 30v8"/><path class="body" d="M6 25c0-6 4-10 9-9 2-6 9-7 11 0 1-3 6-3 7 1 1 2 2 3 2 6l3-12c1-3 4-4 7-3l3 1-1 3h-4l-4 16c-1 2-2 3-4 3H9c-2 0-3-2-3-6z"/><path class="saddle" d="M15 17c4-2 10-2 15 1l-2 6H16z"/><circle class="eye" cx="42.5" cy="11.5" r="1"/></svg><span class="walker"></span></div>`;
  const camel = L.marker([31.5, 35.2], { icon: icon(CAMEL), interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(map);
  function camelStyle(who, walking, flip, gone) {
    const e = camel.getElement(); const el = e && e.querySelector(".camel"); if (!el) return;
    el.querySelector(".saddle").style.fill = color(who || "kobalt");
    // In het Nieuwe Testament geen kameel maar een eenvoudige stip: geen afbeelding bij de reizen van de Heere Jezus.
    el.classList.toggle("nt", !!boek.nt); el.querySelector(".walker").style.background = color(who || "kobalt");
    el.classList.toggle("walk", !!walking);
    el.classList.toggle("gone", !!gone);
    if (flip !== undefined) el.classList.toggle("flip", flip);
  }

  let boek = BOEKEN[0], deel = boek.delen[0], cur = -1, mode = "reis", animToken = 0, showAll = false;
  let focus = null; // { keys: Set van stapsleutels, at: [plaats-ids] } wanneer een geschiedenis op de kaart staat

  function showPartPlaces() {
    lyPlaces.clearLayers();
    const ids = new Set(deel.ctx || []);
    deel.steps.forEach((s) => s.at.forEach((id) => { if (P[id] && !P[id].k) ids.add(id); }));
    ids.forEach((id) => markers[id] && lyPlaces.addLayer(markers[id]));
    lyAlt.clearLayers();
    ids.forEach((id) => (altMarkers[id] || []).forEach((m) => lyAlt.addLayer(m)));
  }
  // Labels: eerst bepalen welke zichtbaar mogen zijn (zoomniveau, actieve stap), daarna botsingsvrij plaatsen.
  // Volgorde van voorrang: plaatsen van de stap, plaatsen van het deel, overige plaatsen, streken en bergtoppen.
  // Elk label probeert zijn eigen kant en daarna rechts, links, boven, onder; past niets, dan verdwijnt het (behalve actieve).
  const SIDES = ["r", "l", "t", "b"];
  function labelRect(pt, w, h, side) {
    if (side === "r") return [pt.x + 11, pt.y - 7, w, h];
    if (side === "l") return [pt.x - 11 - w, pt.y - 7, w, h];
    if (side === "t") return [pt.x - w / 2, pt.y - 10 - h, w, h];
    if (side === "b") return [pt.x - w / 2, pt.y + 11, w, h];
    return [pt.x - w / 2, pt.y - h / 2, w, h];
  }
  const hits = (a, b) => a[0] < b[0] + b[2] + 2 && b[0] < a[0] + a[2] + 2 && a[1] < b[1] + b[3] + 1 && b[1] < a[1] + a[3] + 1;
  function uiRects() {
    const box = map.getContainer().getBoundingClientRect();
    return [...document.querySelectorAll(".leaflet-control-zoom, .maptools > *, .mapbar, .legend, .leaflet-control-scale")].filter((e) => e.offsetParent).map((e) => { const r = e.getBoundingClientRect(); return [r.left - box.left, r.top - box.top, r.width, r.height]; });
  }
  function refreshLabels() {
    const z = map.getZoom();
    // In het overzicht van een deel lichten alle plaatsen van dat deel op; bij een stap alleen die van de stap.
    const on = new Set(focus ? focus.at : mode !== "reis" ? [] : cur >= 0 ? deel.steps[cur].at : deel.steps.flatMap((s) => s.at));
    const size = map.getSize(), items = [];
    Object.entries(markers).forEach(([id, m]) => {
      const el = m.getElement(); if (!el || !map.hasLayer(m)) return;
      const lab = el.querySelector(".lab");
      const vis = z >= (P[id].z || 7) || on.has(id);
      lab.classList.toggle("off", !vis);
      lab.classList.toggle("on", on.has(id));
      lab.classList.remove("clash");
      const pt = map.latLngToContainerPoint(P[id].ll);
      if (vis && pt.x > -150 && pt.y > -40 && pt.x < size.x + 150 && pt.y < size.y + 40) items.push({ el: lab, pt, side: m.pside, pr: on.has(id) ? 3 : P[id].ctx ? 1 : 2, z: P[id].z || 7, pin: certOf(P[id]) !== "r" });
    });
    const tst = boek.nt ? "nt" : "ot";
    REGIONS.forEach((r, i) => { const el = regionMarkers[i].getElement(); if (!el) return; const off = z < r.z[0] || z > r.z[1] || (r.tijd && r.tijd !== tst); el.firstChild.classList.toggle("off", off); el.firstChild.classList.remove("clash"); if (!off) items.push({ el: el.firstChild, pt: map.latLngToContainerPoint(r.ll), side: "c", pr: 0, z: r.z[0] }); });
    PEAKS.forEach((p, i) => { const el = peakMarkers[i].getElement(); if (!el) return; el.firstChild.classList.toggle("off", z < p.z); el.firstChild.classList.remove("clash"); if (z >= p.z) items.push({ el: el.firstChild, pt: map.latLngToContainerPoint(p.ll), side: "peak", pr: 0.5, z: p.z }); });
    // Eén leesronde voor alle maten, daarna alleen schrijven.
    items.forEach((it) => { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; });
    const placed = uiRects();
    // De kameel staat aan het eind van een reis precies op een plaats: labels wijken voor hem uit.
    const ce = camel.getElement(), cel = ce && ce.querySelector(".camel");
    if (cel && map.hasLayer(camel) && !cel.classList.contains("gone")) { const c = map.latLngToContainerPoint(camel.getLatLng()); placed.push([c.x - 24, c.y - 40, 48, 40]); }
    items.filter((it) => it.pin).forEach((it) => placed.push([it.pt.x - 7, it.pt.y - 7, 14, 14]));
    items.sort((a, b) => b.pr - a.pr || a.z - b.z);
    items.forEach((it) => {
      if (it.side === "c" || it.side === "peak") {
        const r = it.side === "peak" ? [it.pt.x - 6, it.pt.y - 8, it.w, it.h] : labelRect(it.pt, it.w, it.h, "c");
        const out = it.pr < 1 && (r[0] < 0 || r[1] < 0 || r[0] + r[2] > size.x || r[1] + r[3] > size.y);
        if ((out || placed.some((q) => hits(r, q))) && it.pr < 3) { it.el.classList.add("clash"); return; }
        placed.push(r); return;
      }
      const order = [it.side].concat(SIDES.filter((s) => s !== it.side));
      let side = null, rect = null;
      for (const s of order) { const r = labelRect(it.pt, it.w, it.h, s); if (!placed.some((q) => hits(r, q))) { side = s; rect = r; break; } }
      if (!side && it.pr < 3) { it.el.classList.add("clash"); return; }
      if (!side) {
        // Een actief label moet zichtbaar blijven: kies de kant met de minste overlap.
        const overlap = (r) => placed.reduce((a, q) => a + Math.max(0, Math.min(r[0] + r[2], q[0] + q[2]) - Math.max(r[0], q[0])) * Math.max(0, Math.min(r[1] + r[3], q[1] + q[3]) - Math.max(r[1], q[1])), 0);
        side = order.slice().sort((a, b) => overlap(labelRect(it.pt, it.w, it.h, a)) - overlap(labelRect(it.pt, it.w, it.h, b)))[0];
      }
      rect = rect || labelRect(it.pt, it.w, it.h, side);
      SIDES.forEach((s) => it.el.classList.toggle("s-" + s, s === side));
      placed.push(rect);
    });
  }
  let labelT;
  const queueLabels = () => { cancelAnimationFrame(labelT); labelT = requestAnimationFrame(refreshLabels); };
  map.on("zoomend moveend resize", queueLabels);
  map.on("moveend", drawInsetBox);

  function fit(pts, maxZoom, done) {
    const b = L.latLngBounds(pts);
    // Ruimte laten voor de knoppen en, als die open is, de legenda.
    const lg = $("legend"), lgW = lg.classList.contains("open") && !lg.hidden && !isNarrow() ? lg.offsetWidth + 16 : 0;
    const opts = { paddingTopLeft: [Math.max(60, lgW), 56], paddingBottomRight: [isNarrow() ? 24 : 150, 90], maxZoom: maxZoom || 9 };
    if (reduceMotion) { map.fitBounds(b, opts); done && done(); return; }
    map.flyToBounds(b, { ...opts, duration: 0.8 });
    done && setTimeout(done, 850);
  }

  // ---------- inzetkaartje ----------
  const insetSvg = document.querySelector("#inset svg");
  const ix = (lon) => ((lon + 12) / 72) * 230, iy = (lat) => ((63 - lat) / 36) * 125;
  function drawInset() {
    if (!insetGeo) return;
    const ring = (r) => r.map(([lon, lat]) => `${ix(lon).toFixed(1)},${iy(lat).toFixed(1)}`).join(" ");
    const polys = insetGeo.inset.geometry.type === "Polygon" ? [insetGeo.inset.geometry.coordinates] : insetGeo.inset.geometry.coordinates;
    const landPath = polys.map((poly) => poly.map((r) => "M" + ring(r) + "Z").join("")).join("");
    const nlPath = insetGeo.nl.map((r) => "M" + ring(r) + "Z").join("");
    insetSvg.innerHTML = `<rect class="sea-i" width="230" height="125" rx="8"/><path class="land-i" d="${landPath}"/><path class="nl-i" d="${nlPath}"/><text x="${ix(5.3) - 2}" y="${iy(52.2) - 5}">NL</text><rect class="box-i" id="insetBox" x="0" y="0" width="0" height="0" rx="2"/>`;
    drawInsetBox();
  }
  function drawInsetBox() {
    const box = $("insetBox"); if (!box) return;
    const b = map.getBounds();
    const x1 = ix(b.getWest()), x2 = ix(b.getEast()), y1 = iy(b.getNorth()), y2 = iy(b.getSouth());
    box.setAttribute("x", Math.max(0, x1).toFixed(1)); box.setAttribute("y", Math.max(0, y1).toFixed(1));
    box.setAttribute("width", Math.max(3, Math.min(230, x2) - Math.max(0, x1)).toFixed(1)); box.setAttribute("height", Math.max(3, Math.min(125, y2) - Math.max(0, y1)).toFixed(1));
  }
  const insetLabel = () => { const open = !$("inset").hidden; $("insetBtn").textContent = isNarrow() ? (open ? "Sluit" : "Waar?") : open ? "Kaartje sluiten" : "Waar ligt dit?"; $("insetBtn").setAttribute("aria-label", open ? "Overzichtskaartje sluiten" : "Waar ligt dit? Overzichtskaartje met Nederland"); };
  $("insetBtn").addEventListener("click", () => { const open = $("inset").hidden; $("inset").hidden = !open; $("insetBtn").setAttribute("aria-expanded", open); insetLabel(); });
  insetLabel();

  // ---------- routes tekenen ----------
  function routeLayer(d) {
    if (partRoutes.has(d.key)) return partRoutes.get(d.key);
    const g = L.layerGroup();
    d.steps.forEach((s, i) => (s.r || []).forEach((r) => {
      // De omranding is ook het klikvlak (breed genoeg voor een vinger); de gekleurde lijn ligt erbovenop.
      r.casing = L.polyline(r.pts, { className: `rt rt-casing${r.recon ? " recon" : ""} future`, bubblingMouseEvents: false }).addTo(g);
      r.line = L.polyline(r.pts, { className: `rt${r.recon ? " recon" : ""} future`, color: color(r.w), interactive: false }).addTo(g);
      r.casing.bindPopup(() => `<div class="pop"><p class="label">${esc(d.boek.n)} · ${esc(d.n)} · stap ${i + 1}</p><h3>${esc(s.t)}</h3><p class="st">${esc(s.ref)} · ca. ${fmt(roundKm(r.len))} km</p><p>${r.recon ? "<b>Reconstructie.</b> De Bijbel noemt alleen waar de reis begon en eindigde; de lijn volgt een bekende oude weg." : "De Bijbel noemt de plaatsen langs deze route."}</p>${i !== cur || deel !== d ? `<button type="button" class="btn small" data-go="${d.key}:${i}">Bekijk deze stap</button>` : ""}</div>`, { maxWidth: 270, autoPanPaddingTopLeft: [50, 150], autoPanPaddingBottomRight: [20, 90] });
      r.arrows = arrows(r, g);
    }));
    partRoutes.set(d.key, g);
    return g;
  }
  function angleDeg(a, b) { const p1 = map.project(a, 6), p2 = map.project(b, 6); return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI; }
  function pointAt(r, f) {
    const L0 = r.len * f;
    for (let i = 1; i < r.pts.length; i++) {
      if (r.cum[i] >= L0) { const t = (L0 - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1); const a = r.pts[i - 1], b = r.pts[i]; return { ll: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], a: angleDeg(a, b) }; }
    }
    return { ll: r.pts[r.pts.length - 1], a: 0 };
  }
  function arrows(r, group) {
    const fs = r.len > 400 ? [0.35, 0.8] : r.len > 60 ? [0.6] : [];
    return fs.map((f) => { const q = pointAt(r, f); const m = L.marker(q.ll, { interactive: false, keyboard: false, icon: icon(`<span class="arr off" style="--arr:${color(r.w)};transform:rotate(${q.a.toFixed(1)}deg)"></span>`) }); group.addLayer(m); return m; });
  }
  function routeState() {
    deel.steps.forEach((s, i) => (s.r || []).forEach((r) => {
      let st = showAll ? "past" : i < cur ? "past" : i === cur ? "active" : "future";
      if (r.w === "rood" && i !== cur) st = "future";
      if (focus) st = focus.keys.has(s.key) ? "active" : "future";
      [r.line, r.casing].forEach((l) => { const el = l && l.getElement(); if (!el) return; el.classList.remove("past", "active", "future", "hl"); el.classList.add(st); });
      r.arrows.forEach((a) => { const e = a.getElement(); if (e) { e.firstChild.classList.toggle("off", st === "future"); e.firstChild.classList.toggle("dim", st === "past"); } });
    }));
  }
  function partial(r, d) {
    if (d >= r.len) return r.pts.slice();
    let i = 1; while (i < r.pts.length && r.cum[i] < d) i++;
    const a = r.pts[i - 1], b = r.pts[i], t = (d - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1);
    return r.pts.slice(0, i).concat([[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]]);
  }
  function animate(s) {
    const token = ++animToken;
    const routes = s.r || [];
    const who = routes.length ? routes[0].w : deel.c;
    if (!routes.length && !s.at.length) { camelStyle(who, false, undefined, true); return; }
    const end = routes.length ? routes[routes.length - 1].pts.slice(-1)[0] : ll(s.at[0]);
    if (!routes.length || reduceMotion) { routes.forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }); camel.setLatLng(end); camelStyle(who, false, undefined, false); queueLabels(); return; }
    const total = routes.reduce((a, r) => a + r.len, 0);
    const dur = Math.max(1400, Math.min(5200, total * 3.2));
    routes.forEach((r) => { r.line.setLatLngs([r.pts[0], r.pts[0]]); r.casing.setLatLngs([r.pts[0], r.pts[0]]); });
    camel.setLatLng(routes[0].pts[0]); camelStyle(who, true, undefined, false);
    const t0 = performance.now();
    let lastLL = routes[0].pts[0], lastWho = who;
    function frame(now) {
      if (token !== animToken) return;
      const f = Math.min(1, (now - t0) / dur);
      const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      let d = e * total, pos = null, w = who;
      routes.forEach((r) => {
        const dd = Math.max(0, Math.min(r.len, d));
        const pts = partial(r, dd);
        const drawn = pts.length > 1 ? pts : [r.pts[0], r.pts[0]];
        r.line.setLatLngs(drawn); r.casing.setLatLngs(drawn);
        if (d > 0 && !pos) { pos = pts[pts.length - 1]; w = r.w; }
        if (dd === r.len && d > r.len) pos = null;
        d -= r.len;
      });
      if (!pos) pos = end;
      const pa = map.latLngToLayerPoint(lastLL), pb = map.latLngToLayerPoint(pos);
      camelStyle(w, true, Math.abs(pb.x - pa.x) > 0.5 ? pb.x < pa.x : undefined, false);
      camel.setLatLng(pos); lastLL = pos; lastWho = w;
      if (f < 1) requestAnimationFrame(frame); else { camelStyle(lastWho, false); queueLabels(); }
    }
    requestAnimationFrame(frame);
  }
  function drawSpecial(s) {
    lySpecial.clearLayers();
    if (s.rays4) {
      const b = ll(s.rays4);
      [["noord", [b[0] + 0.75, b[1]]], ["zuid", [b[0] - 0.75, b[1]]], ["oost", [b[0], b[1] + 0.9]], ["west", [b[0], b[1] - 0.9]]].forEach(([t, e]) => {
        L.polyline([b, e], { className: "ray", interactive: false }).addTo(lySpecial);
        lySpecial.addLayer(L.marker(e, { interactive: false, keyboard: false, icon: icon(`<span class="raylab">${t}</span>`) }));
      });
    }
    if (s.look) {
      const a = ll(s.look[0]), b = ll(s.look[1]);
      L.polyline([a, b], { className: "ray look", interactive: false }).addTo(lySpecial);
      lySpecial.addLayer(L.marker([(a[0] + b[0]) / 2 + 0.03, (a[1] + b[1]) / 2], { interactive: false, keyboard: false, icon: icon(`<span class="raylab look">${esc(s.look[2] || "")}</span>`) }));
    }
    if (s.later) {
      L.polyline(s.later.p.map(ll), { className: "ray", interactive: false }).addTo(lySpecial);
      if (s.later.lab) lySpecial.addLayer(L.marker(ll(s.later.at || s.later.p[Math.floor(s.later.p.length / 2)]), { interactive: false, keyboard: false, icon: icon(`<span class="raylab">${esc(s.later.lab)}</span>`) }));
    }
  }

  // ---------- reisboek ----------
  const seen = new Set(store.get("gezien", []));
  // Personen: koppeling van namen in de stappen aan de centrale lijst BR.mensen (personen.js), per boek.
  const MENSEN = BR.mensen || {};
  const MENS_IDX = {};
  Object.entries(MENSEN).forEach(([id, m]) => [m.n].concat(m.alias || []).forEach((n) => (m.boek || []).concat("*").forEach((b) => { const k = b + "|" + n; if (b !== "*" || !MENS_IDX[k]) MENS_IDX[k] = id; })));
  const mensOf = (name, boekId) => MENS_IDX[boekId + "|" + name] || null;
  const MENS_STAPPEN = {};
  BOEKEN.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => (s.who || []).forEach(([n]) => { const id = mensOf(n, b.id); if (id) (MENS_STAPPEN[id] = MENS_STAPPEN[id] || []).push([d, i]); }))));
  function personChip([name, age]) {
    const c = color(BR.personen[name] || "grijs");
    const group = GROUPS.has(name);
    const label = group ? age || name.toLowerCase() : name;
    const sub = !group && age ? ` <small>${/^\d+$/.test(age) ? age + " jaar" : esc(age)}</small>` : "";
    const id = !group && mensOf(name, boek.id);
    return id ? `<button type="button" class="chip" data-mens="${id}" title="Wie is ${esc(name)}?"><i style="background:${c}">${esc(name[0])}</i>${esc(label)}${sub}</button>` : `<span class="chip"><i style="background:${c}">${esc(name[0])}</i>${esc(label)}${sub}</span>`;
  }
  const FS = { b: "Uit de Bijbel", u: "Uitleg", h: "Historische achtergrond" };
  function tijdText(d) {
    if (d.tijd === null || (d.tl === null && !d.tijd)) return "Oergeschiedenis · geen jaartallen";
    return d.tijd ? d.tijd + (d.tijdNoot ? " · reconstructie" : "") : "";
  }
  function renderCrumb() {
    const n = deel.steps.length, got = deel.steps.filter((s) => seen.has(s.key)).length;
    $("sCrumb").innerHTML = `<button type="button" class="linkbtn" data-crumb="boek">${esc(boek.n)}</button><span aria-hidden="true">›</span><button type="button" class="linkbtn" data-crumb="deel"${cur < 0 ? ' aria-current="page"' : ""}>${esc(deel.n)}</button>${cur >= 0 ? `<span aria-hidden="true">›</span><span aria-current="step">Stap ${cur + 1} van ${n}</span>` : `<span class="muted">${got} van ${n} gezien</span>`}`;
    $("sProg").firstElementChild.style.width = ((cur >= 0 ? (cur + 1) / n : got / n) * 100).toFixed(1) + "%";
    const t = tijdText(deel);
    $("sTijd").hidden = !t; $("sTijd").innerHTML = t ? `<span>${esc(t)}</span>${deel.tijdNoot ? `<button type="button" class="linkbtn" data-tab="tijd">Hoe weten we dat?</button>` : ""}` : "";
  }
  function setAccent() {
    document.body.style.setProperty("--acc", color(deel.c));
    document.body.style.setProperty("--acc-deep", color(deel.c));
    document.querySelectorAll(".deel").forEach((b) => b.setAttribute("aria-pressed", b.dataset.deel === deel.id));
    document.querySelectorAll(".boek").forEach((b) => b.setAttribute("aria-pressed", b.dataset.boek === boek.id));
  }
  function chooseBoek(b, d, step = -1, opts) {
    boek = b; d = d || b.delen[0];
    renderDelen();
    chooseDeel(d, step, opts);
  }
  function chooseDeel(d, step = -1, opts = {}) {
    deel = d; boek = d.boek; cur = -1;
    partRoutes.forEach((g, key) => { if (key !== d.key) map.removeLayer(g); });
    map.addLayer(routeLayer(d));
    showPartPlaces(); setAccent(); renderDots();
    select(step, opts);
  }

  function select(i, opts = {}) {
    focus = null; $("map").classList.remove("symbool", "gelijkenis");
    cur = Math.max(-1, Math.min(deel.steps.length - 1, i));
    showAll = false;
    map.closePopup();
    const sp = $("sSpecial"); sp.innerHTML = "";
    const lees = $("leesBtn");
    if (cur >= 0) {
      const s = deel.steps[cur];
      if (!seen.has(s.key)) { seen.add(s.key); store.set("gezien", [...seen]); toast(`Nieuwe stempel: ${s.stamp}!`); }
      $("sRef").textContent = s.ref;
      $("sKm").textContent = s.km ? "ca. " + fmt(s.km) + " km" : "";
      $("sTitle").textContent = cur + 1 + ". " + s.t;
      $("sWho").innerHTML = (s.who || []).map(personChip).join("");
      $("sText").textContent = s.txt; $("sTextLabel").hidden = false;
      $("sFact").innerHTML = `<b>Wist je dat?${s.fs && FS[s.fs] ? ` <span class="fs fs-${s.fs}">${FS[s.fs]}</span>` : ""}</b>` + esc(s.fact); $("sFact").hidden = !s.fact;
      renderAfstand(s);
      lees.hidden = !parseRef(s.ref); lees.dataset.ref = s.ref;
      if (s.sterren) starGame(sp);
      if (s.onthul) revealGame(sp, s.onthul);
      if (s.vergelijk) compareBars(sp, s.vergelijk);
      s.kings ? map.addLayer(lyKings) : map.removeLayer(lyKings);
      drawSpecial(s);
      deel.steps.forEach((t, j) => (t.r || []).forEach((r) => { if (j !== cur) { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); } }));
      routeState();
      let pts = s.rays4 ? [[ll(s.rays4)[0] + 0.8, ll(s.rays4)[1] - 1], [ll(s.rays4)[0] - 0.8, ll(s.rays4)[1] + 1]] : (s.r ? s.r.flatMap((r) => r.pts) : []).concat(s.at.map(ll));
      if (s.later) pts = pts.concat(s.later.p.map(ll));
      if (s.look) pts = pts.concat(s.look.slice(0, 2).map(ll));
      // Geen plaats bekend (bijv. ‘ergens in Israël’): toon de streek in plaats van een verzonnen punt.
      if (!pts.length) fit(Array.isArray(s.view) ? s.view : s.view === "kanaan" ? KANAAN : WIDE, Array.isArray(s.view) ? 9 : 6, () => animate(s));
      else if (pts.every((p) => p[0] === pts[0][0] && p[1] === pts[0][1])) {
        const z = s.zoom || 9; reduceMotion ? map.setView(pts[0], z) : map.flyTo(pts[0], z, { duration: 0.8 }); setTimeout(() => animate(s), reduceMotion ? 0 : 850);
      } else fit(pts, s.zoom || 9, () => animate(s));
      $("where").textContent = `${deel.short} · ${cur + 1} van ${deel.steps.length}`;
    } else {
      $("sRef").textContent = deel.ref;
      const km = partKm(deel);
      $("sKm").textContent = deel.steps.length + " stappen" + (km > 50 ? ` · ca. ${fmt(Math.round(km / 100) * 100)} km` : "");
      $("sTitle").textContent = deel.n;
      $("sWho").innerHTML = (deel.who || []).map(personChip).join("");
      $("sText").textContent = deel.intro; $("sTextLabel").hidden = true;
      $("sFact").innerHTML = "<b>Wist je dat?</b>" + esc(deel.stat || ""); $("sFact").hidden = !deel.stat;
      $("sVer").hidden = true;
      lees.hidden = true;
      if (deel.cross && deel.cross.length) sp.innerHTML = `<p class="label">Elders in de Bijbel</p><ul class="xrefs">${deel.cross.map(([r, t]) => `<li>${parseRef(r) ? `<button type="button" class="linkbtn" data-ref="${esc(r)}">${esc(r)}</button>` : `<b>${esc(r)}</b>`}<span>${esc(t)}</span></li>`).join("")}</ul>`;
      map.removeLayer(lyKings); lySpecial.clearLayers();
      deel.steps.forEach((t) => (t.r || []).forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }));
      showAll = true; routeState(); showAll = false;
      animToken++;
      const first = deel.steps.find((s) => s.at.length || s.r);
      const startLL = first ? (first.r ? first.r[0].pts[0] : ll(first.at[0])) : null;
      if (startLL) camel.setLatLng(startLL);
      camelStyle(deel.c, false, false, !startLL || deel.id === "begin");
      if (!opts.noFly) fit(partBounds(deel), 8);
      $("where").textContent = deel.n;
    }
    const idx = ALLPARTS.indexOf(deel), atEnd = cur >= deel.steps.length - 1, next = ALLPARTS[idx + 1];
    $("prev").disabled = $("prev2").disabled = cur <= -1 && idx === 0;
    $("next").disabled = $("next2").disabled = atEnd && !next;
    $("next").textContent = $("next2").textContent = cur < 0 ? "Start ▶" : atEnd && next ? `Naar ${next.short} ▶` : "Verder ▶";
    renderDots(); renderCrumb();
    if (cur >= 0) store.set("laatst", deel.steps[cur].key);
    if (!opts.keepHash) history.replaceState(null, "", "#" + deel.id + (cur >= 0 ? "/" + (cur + 1) : ""));
    queueLabels();
  }
  // Afstand direct bij de stap: hemelsbreed langs de getekende lijn, met een vergelijking die een kind kent.
  function renderAfstand(s) {
    const box = $("sVer");
    if (!s.km || s.km < 15) { box.hidden = true; return; }
    const days = Math.max(1, Math.round(s.km / 25)), x = s.km / NL_KM;
    box.hidden = false;
    box.innerHTML = `<p><b>Hoe ver?</b> Ongeveer ${fmt(s.km)} km. Lopend is dat zo’n ${days} ${days === 1 ? "dag" : "dagen"} (25 km per dag). ${x >= 1.15 ? `Dat is ${fmt(Math.round(x * 10) / 10)} keer Nederland van Groningen tot Maastricht.` : x >= 0.85 ? "Dat is ongeveer heel Nederland, van Groningen tot Maastricht." : `Dat is ${Math.round(x * 100)}% van Nederland, van Groningen tot Maastricht.`}</p><button type="button" class="linkbtn" id="verBtn">Vergelijk met Nederland op de kaart</button>`;
    $("verBtn").onclick = () => { stepTrip = s; setMode("ver"); };
  }
  function partBounds(d) {
    const pts = d.steps.flatMap((s) => (s.r ? s.r.filter((r) => r.w !== "rood").flatMap((r) => r.pts) : []).concat(s.at.filter((id) => P[id] && !P[id].k).map(ll)));
    return pts.length ? pts : WIDE;
  }
  function goNext() { if (cur < deel.steps.length - 1) select(cur + 1); else { const n = ALLPARTS[ALLPARTS.indexOf(deel) + 1]; if (n) { if (n.boek !== boek) chooseBoek(n.boek, n); else chooseDeel(n); } } }
  function goPrev() { if (cur > -1) select(cur - 1); else { const p = ALLPARTS[ALLPARTS.indexOf(deel) - 1]; if (p) { if (p.boek !== boek) chooseBoek(p.boek, p, p.steps.length - 1); else chooseDeel(p, p.steps.length - 1); } } }

  function renderBoeken() {
    $("boeken").innerHTML = BOEKEN.map((b) => `<button type="button" class="boek" data-boek="${b.id}" aria-pressed="${b === boek}">${esc(b.n)}<small>${esc(b.tijd || "")}</small></button>`).join("");
  }
  function renderDelen() {
    $("delen").innerHTML = boek.delen.map((d) => `<button type="button" class="deel" data-deel="${d.id}" style="--pc:${color(d.c)}" aria-pressed="${d === deel}"><i>${esc(d.init || d.n[0])}</i>${esc(d.short)}<small>${esc(d.ref.replace(/^(\d\s)?[^\d\s]+\s/, ""))}</small></button>`).join("");
  }
  $("boeken").addEventListener("click", (e) => { const b = e.target.closest(".boek"); if (b) chooseBoek(BOEKEN.find((x) => x.id === b.dataset.boek)); });
  $("delen").addEventListener("click", (e) => { const b = e.target.closest(".deel"); if (b) chooseDeel(boek.delen.find((x) => x.id === b.dataset.deel)); });
  function renderDots() {
    const box = $("chapters"); const by = {};
    deel.steps.forEach((s, i) => { const m = s.ref.match(/(\d+)(?::|$|–|;| )/); const ch = m ? m[1] : "?"; (by[ch] = by[ch] || []).push(i); });
    $("stepsLabel").textContent = "Alle stappen: " + deel.n;
    box.innerHTML = Object.entries(by).sort((a, b) => a[0] - b[0]).map(([ch, idx]) => `<div class="row"><span>Hfst. ${ch}</span><div class="dots">${idx.map((i) => `<button type="button" class="dot${seen.has(deel.steps[i].key) ? " seen" : ""}" data-step="${i}" aria-current="${i === cur ? "step" : "false"}" title="${esc(deel.steps[i].t)}" aria-label="Stap ${i + 1}: ${esc(deel.steps[i].t)}">${i + 1}</button>`).join("")}</div></div>`).join("");
  }
  $("chapters").addEventListener("click", (e) => { const b = e.target.closest(".dot"); if (b) { select(+b.dataset.step); scrollToMap(); } });
  $("prev").onclick = $("prev2").onclick = goPrev;
  $("next").onclick = $("next2").onclick = goNext;
  $("whole").onclick = () => {
    showAll = true; animToken++;
    deel.steps.forEach((t) => (t.r || []).forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }));
    routeState(); lySpecial.clearLayers(); map.removeLayer(lyKings);
    fit(partBounds(deel), 8); scrollToMap();
  };
  document.addEventListener("keydown", (e) => {
    if (mode !== "reis" || e.target.closest("input, select, textarea, [role='tablist']") || e.altKey || e.ctrlKey || e.metaKey || !$("lade").hidden) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  });

  // ---------- Bijbeltekst (Statenvertaling) ----------
  const bibleCache = {};
  const parseRef = BR.parseRef;
  async function loadBible(slug) {
    if (!bibleCache[slug]) bibleCache[slug] = fetch(`/bijbelreis/bijbel/${slug}.json`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
    return bibleCache[slug];
  }
  async function openBible(ref) {
    const q = parseRef(ref); if (!q) return;
    $("ladeTitel").textContent = ref;
    $("verzen").innerHTML = "<p class='ref'>Even geduld…</p>";
    $("lade").hidden = false; $("ladeSluit").focus();
    try {
      const books = {};
      await Promise.all([...new Set(q.ranges.map((rg) => rg.slug))].map(async (sl) => (books[sl] = await loadBible(sl))));
      let html = "";
      q.ranges.forEach((rg) => {
        const data = books[rg.slug];
        for (let c = rg.c1; c <= Math.min(rg.c2, Object.keys(data.hoofdstukken).length); c++) {
          const verses = data.hoofdstukken[String(c)]; if (!verses) continue;
          const from = c === rg.c1 ? rg.v1 : 1, to = c === rg.c2 ? Math.min(rg.v2, verses.length) : verses.length;
          if (from > verses.length) continue;
          html += `<h4>${esc(data.boek)} ${c}</h4><p>` + verses.slice(from - 1, to).map((v, i) => `<sup>${from + i}</sup>${esc(v)} `).join("") + "</p>";
        }
      });
      $("verzen").innerHTML = (html || "<p class='ref'>Deze tekst is niet gevonden.</p>") + `<p class="ref" style="margin-top:12px">${esc(books[q.slug].vertaling)}. Oude spelling: lees het samen met een volwassene.</p>`;
    } catch {
      $("verzen").innerHTML = "<p class='ref'>De Bijbeltekst kon niet worden geladen. Probeer het straks nog eens.</p>";
    }
  }
  let ladeFrom = null;
  $("leesBtn").addEventListener("click", () => { ladeFrom = $("leesBtn"); openBible($("leesBtn").dataset.ref); });
  const closeLade = () => { $("lade").hidden = true; if (ladeFrom && ladeFrom.isConnected) ladeFrom.focus(); };
  $("ladeSluit").addEventListener("click", closeLade);
  $("lade").addEventListener("click", (e) => { if (e.target === $("lade")) closeLade(); });
  document.addEventListener("keydown", (e) => {
    const open = !$("lade").hidden ? $("lade") : !$("kast").hidden ? $("kast") : null; if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); open === $("lade") ? closeLade() : closeKast(); return; }
    if (e.key !== "Tab") return;
    // Focus blijft in het venster zolang het open is.
    const f = [...open.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")].filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  // ---------- mini-spellen ----------
  function starGame(host) {
    const box = document.createElement("div"); box.className = "sky";
    box.innerHTML = '<canvas aria-label="Tik op de sterren om ze te tellen"></canvas><div class="count">Tik op de sterren: 0</div><div class="msg"></div>';
    host.appendChild(box);
    const cv = box.querySelector("canvas"), ctx = cv.getContext("2d"), cnt = box.querySelector(".count"), msg = box.querySelector(".msg");
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const stars = Array.from({ length: 420 }, () => ({ x: rnd(), y: rnd(), r: rnd() < 0.08 ? 1.9 : 0.4 + rnd() * 1.1, lit: false }));
    let n = 0;
    function draw() {
      if (!cv.isConnected) return;
      const w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.forEach((s) => {
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.lit ? 3.4 : s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.lit ? "#ffd24d" : "rgba(235,240,255," + (0.45 + s.r / 4) + ")"; ctx.fill();
        if (s.lit) { ctx.beginPath(); ctx.arc(s.x * w, s.y * h, 7, 0, Math.PI * 2); ctx.strokeStyle = "rgba(255,210,77,.5)"; ctx.stroke(); }
      });
    }
    cv.addEventListener("click", (e) => {
      const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      let best = null, bd = Infinity;
      stars.forEach((s) => { if (s.lit) return; const d = Math.hypot((s.x - x) * b.width, (s.y - y) * b.height); if (d < bd) { bd = d; best = s; } });
      if (best && bd < 28) { best.lit = true; n++; draw(); }
      cnt.textContent = "Tik op de sterren: " + n;
      if (n >= 12) msg.textContent = `${n} geteld… en er zijn er nog ${fmt(stars.length - n)} op dit plaatje. Aan de echte hemel nog veel meer. Zo groot wordt Abrams nageslacht!`;
    });
    requestAnimationFrame(draw);
    window.addEventListener("resize", draw, { passive: true });
  }
  function revealGame(host, o) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<p class="label">${esc(o.titel)}</p><div class="days">${o.items.map(([d]) => `<button type="button" class="day" aria-expanded="false"><b>${esc(d)}</b><span>?</span></button>`).join("")}</div>`;
    host.appendChild(wrap);
    wrap.querySelectorAll(".day").forEach((b, i) => (b.onclick = () => { const open = b.classList.toggle("open"); b.setAttribute("aria-expanded", open); b.querySelector("span").textContent = open ? o.items[i][1] : "?"; }));
  }
  function compareBars(host, o) {
    const max = Math.max(...o.rijen.map((r) => r[1]));
    const wrap = document.createElement("div");
    wrap.innerHTML = `<p class="label">${esc(o.titel)}</p><div class="compare">${o.rijen.map(([n, m, t], i) => `<div><span>${esc(n)}</span><span style="display:flex;align-items:center;gap:6px"><span class="bar${i ? " alt" : ""}" style="width:${((m / max) * 70).toFixed(1)}%"></span><small>${esc(t)}</small></span></div>`).join("")}</div>${o.noot ? `<p class="ref">${esc(o.noot)}</p>` : ""}`;
    host.appendChild(wrap);
  }

  // ---------- tabbladen ----------
  const TABS = ["verhalen", "reis", "wie", "tijd", "quiz", "pas"];
  function setMode(m) {
    mode = m;
    const tab = m === "ver" ? "reis" : m; // ‘Hoe ver?’ hoort bij de reis en heeft geen eigen tab meer
    TABS.forEach((t) => { $("t-" + t).setAttribute("aria-selected", t === tab); $("t-" + t).tabIndex = t === tab ? 0 : -1; });
    ["verhalen", "reis", "wie", "tijd", "quiz", "ver", "pas"].forEach((t) => ($("p-" + t).hidden = t !== m));
    if (m !== "verhalen") clearFocus();
    tapHandler = null;
    $("mapbar").hidden = m !== "reis";
    $("legend").hidden = !(m === "reis" || m === "verhalen"); $("legendBtn").hidden = !(m === "reis" || m === "verhalen");
    $("map").classList.toggle("quizmode", m === "quiz");
    lyQuiz.clearLayers();
    if (m !== "ver") { lyNL.clearLayers(); nlOn = false; $("nlBtn").textContent = "Leg Nederland op de kaart"; $("nlHint").hidden = true; }
    if (m === "quiz") { partRoutes.forEach((g) => map.removeLayer(g)); map.removeLayer(lyPlaces); map.removeLayer(lyKings); map.removeLayer(camel); lySpecial.clearLayers(); quizIntro(); }
    else {
      const g = routeLayer(deel); if (!map.hasLayer(g)) map.addLayer(g);
      if (!map.hasLayer(lyPlaces)) map.addLayer(lyPlaces);
      if (!map.hasLayer(camel)) map.addLayer(camel);
      if (m === "reis") select(cur);
      if (m === "verhalen") renderVerhalen();
      if (m === "ver") { renderTrips(); showTrip(); }
      if (m === "pas") renderStamps();
      if (m === "wie") renderWie();
      if (m === "tijd") renderTijd();
    }
    queueLabels();
  }
  TABS.forEach((t) => $("t-" + t).addEventListener("click", () => setMode(t)));
  document.querySelector(".tabs").addEventListener("keydown", (e) => {
    const i = TABS.indexOf(mode);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length]; setMode(n); $("t-" + n).focus(); }
  });


  // ---------- de 150 geschiedenissen ----------
  // Een geschiedenis is een laag boven de reisstappen: ze wijst naar stappen (kaart, route, stempel) en voegt uitleg,
  // kernwoord, een ontdekking en vragen toe. Leidraad en nummering: docs/bijbelreis-150/.
  const LEIDRAAD = BR.leidraad || {};
  const G = (BR.geschiedenissen || []).slice().sort((a, b) => a.nr - b.nr);
  const GBYNR = new Map(G.map((g) => [g.nr, g]));
  const KW = BR.kernwoorden || {};
  const SECTIES = [
    ["Schepping en oergeschiedenis", 1, 7], ["De aartsvaders", 8, 20], ["Mozes en de uittocht", 21, 31], ["In de woestijn", 32, 36],
    ["Het beloofde land", 37, 41], ["Richters en Ruth", 42, 47], ["Samuël, Saul, David en Salomo", 48, 62], ["Koningen, profeten en ballingschap", 63, 75],
    ["Terugkeer en wachten op de Koning", 76, 79], ["Geboorte en jeugd van de Heere Jezus", 80, 86], ["Doop, wonderen en onderwijs", 87, 108],
    ["Onderweg naar Jeruzalem", 109, 117], ["Lijden, sterven en opstanding", 118, 132], ["De eerste gemeente", 133, 142], ["De reizen van Paulus", 143, 148], ["Openbaring", 149, 150],
  ];
  const sectieOf = (nr) => SECTIES.find(([, a, b]) => nr >= a && nr <= b)[0];
  const VORM = { route: "Reis op de kaart", plek: "Gebeurtenis op een plek", stamboom: "Familie", gelijkenis: "Gelijkenis", thema: "Profetie en verbanden", symbool: "Beelden en tekens" };
  const verhaalStore = store.get("verhalen", {});
  const saveVerhaal = (nr, patch) => { verhaalStore[nr] = { ...(verhaalStore[nr] || {}), ...patch }; store.set("verhalen", verhaalStore); };
  const norm = (t) => String(t || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  G.forEach((g) => {
    const plaatsen = (g.stappen || []).flatMap((k) => (STEP_BY_KEY.get(k) || { at: [] }).at).map((id) => P[id] && P[id].n);
    g.zoek = norm([g.nr, g.t, g.ref, (g.wie || []).join(" "), g.kw && KW[g.kw] ? KW[g.kw].n : "", sectieOf(g.nr), plaatsen.join(" "), VORM[g.vorm] || ""].join(" "));
  });
  let vTest = "alle", vZoek = "", vOpen = null;

  function renderVerhalen() {
    if (vOpen) return renderVerhaal(vOpen);
    const box = $("p-verhalen");
    const done = G.filter((g) => verhaalStore[g.nr]).length;
    box.innerHTML = `<h2>150 <em>geschiedenissen</em></h2>
      <p class="ref">Van de schepping tot Openbaring. Kies een geschiedenis, of zoek op Bijbelboek, persoon, plaats of thema. Je kunt ook gewoon bij 1 beginnen en steeds ‘Volgende’ kiezen.</p>
      <div class="prog big" aria-hidden="true"><div style="width:${((done / 150) * 100).toFixed(1)}%"></div></div>
      <p class="ref">${done ? `Je hebt ${done} van de 150 geschiedenissen gelezen.` : `${G.length} van de 150 geschiedenissen zijn beschikbaar.`}</p>
      <label class="label" for="vZoek">Zoeken</label>
      <input type="search" id="vZoek" placeholder="Bijvoorbeeld: Jozef, Jericho, Lukas, gebed" value="${esc(vZoek)}" autocomplete="off">
      <div class="pick" role="group" aria-label="Testament">${[["alle", "Alles"], ["ot", "Oude Testament · 79"], ["nt", "Nieuwe Testament · 71"]].map(([k, n]) => `<button type="button" data-vt="${k}" aria-pressed="${vTest === k}" style="--pc:var(--acc)">${n}</button>`).join("")}</div>
      <div id="vLijst" class="vlijst"></div>
      <details class="kwlijst"><summary>Kernwoorden (${Object.keys(KW).length})</summary><div class="chips">${Object.entries(KW).sort((a, b) => a[1].n.localeCompare(b[1].n, "nl")).map(([id, k]) => `<button type="button" class="chip" data-kw="${id}">${esc(k.n)}</button>`).join("")}</div></details>`;
    $("vZoek").addEventListener("input", (e) => { vZoek = e.target.value; renderLijst(); });
    box.querySelectorAll("[data-vt]").forEach((b) => (b.onclick = () => { vTest = b.dataset.vt; box.querySelectorAll("[data-vt]").forEach((x) => x.setAttribute("aria-pressed", x === b)); renderLijst(); }));
    box.querySelectorAll("[data-kw]").forEach((b) => (b.onclick = () => { vZoek = KW[b.dataset.kw].n; $("vZoek").value = vZoek; renderLijst(); $("vZoek").scrollIntoView({ block: "nearest" }); }));
    renderLijst();
    focusOverview();
  }
  function renderLijst() {
    const q = norm(vZoek).split(/\s+/).filter(Boolean);
    const okT = (nr) => vTest === "alle" || (vTest === "ot" ? nr <= 79 : nr >= 80);
    let html = "", hits = 0;
    SECTIES.forEach(([naam, a, b]) => {
      const items = [];
      for (let nr = a; nr <= b; nr++) {
        if (!okT(nr)) continue;
        const g = GBYNR.get(nr);
        if (q.length && !(g && q.every((w) => g.zoek.includes(w)))) continue;
        hits++;
        const st = verhaalStore[nr];
        items.push(g
          ? `<li><button type="button" class="vitem${st && st.q != null ? " klaar" : st ? " gezien" : ""}" data-v="${nr}"><span class="vnr">${nr}</span><span class="vt"><b>${esc(g.t)}</b><small>${esc(g.ref)}${g.kw && KW[g.kw] ? ` · <i>${esc(KW[g.kw].n)}</i>` : ""}</small></span>${st && st.q != null ? '<span class="vok" aria-label="gestempeld">✓</span>' : ""}</button></li>`
          : `<li><span class="vitem off"><span class="vnr">${nr}</span><span class="vt"><b>Nog niet beschikbaar</b><small>${esc(LEIDRAAD[nr] || "")}</small></span></span></li>`);
      }
      if (items.length) html += `<h3 class="vsectie">${esc(naam)} <small>${a}–${b}</small></h3><ul class="vul">${items.join("")}</ul>`;
    });
    $("vLijst").innerHTML = html || `<p class="ref">Niets gevonden voor ‘${esc(vZoek)}’. Probeer een andere naam, plaats of Bijbelboek.</p>`;
    if (q.length) $("vLijst").insertAdjacentHTML("afterbegin", `<p class="ref" role="status">${hits} gevonden</p>`);
  }
  $("p-verhalen").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });

  function openVerhaal(nr, opts = {}) {
    const g = GBYNR.get(nr); if (!g) return;
    vOpen = nr;
    if (mode !== "verhalen") setMode("verhalen"); else renderVerhaal(nr);
    if (!opts.keepHash) history.replaceState(null, "", "#v" + nr);
    if (!verhaalStore[nr]) saveVerhaal(nr, { g: 1 });
    if (isNarrow()) $("p-verhalen").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); else $("reisboek").scrollTo({ top: 0 });
  }
  function renderVerhaal(nr) {
    const g = GBYNR.get(nr), box = $("p-verhalen"); if (!g) { vOpen = null; return renderVerhalen(); }
    const k = g.kw && KW[g.kw];
    const steps = (g.stappen || []).map((x) => STEP_BY_KEY.get(x)).filter(Boolean);
    const prevG = G.slice().reverse().find((x) => x.nr < nr), nextG = G.find((x) => x.nr > nr);
    const tijd = g.tl === null || g.tijd === null ? "" : g.tijd || (steps[0] && tijdText(steps[0].deel)) || "";
    box.innerHTML = `<nav class="crumb" aria-label="Waar ben je"><button type="button" class="linkbtn" id="vTerug">← Alle geschiedenissen</button><span class="muted">${esc(sectieOf(nr))}</span></nav>
      <article class="card verhaal" aria-labelledby="vTitel">
        <div class="top"><b>Geschiedenis ${nr} van 150</b><span>${esc(VORM[g.vorm] || "")}</span></div>
        <h2 id="vTitel">${esc(g.t)}</h2>
        <p class="tijd"><span>${esc(g.ref)}</span>${tijd ? `<span>· ${esc(tijd)}${g.tijdNoot ? "" : ""}</span>` : ""}</p>
        <div class="chips">${(g.wie || []).map((n) => personChip([n])).join("")}</div>
        <p class="label bl">Wat de Bijbel vertelt</p>
        <p>${esc(g.uitleg)}</p>
        ${parseRef(g.ref) ? `<button type="button" class="btn small bijbellink" data-ref="${esc(g.ref)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg>Lees het zelf in de Bijbel</button>` : ""}
        ${g.betekenis ? `<div class="fact"><b>Uitleg <span class="fs fs-u">Uitleg</span></b>${esc(g.betekenis)}</div>` : ""}
        ${k ? `<div class="kernwoord"><p class="label">Kernwoord</p><h3>${esc(k.n)}</h3><p>${esc(k.uitleg)}</p>${(k.refs || []).length ? `<ul class="xrefs">${k.refs.map(([r, t]) => `<li>${parseRef(r) ? `<button type="button" class="linkbtn" data-ref="${esc(r)}">${esc(r)}</button>` : `<b>${esc(r)}</b>`}<span>${esc(t)}</span></li>`).join("")}</ul>` : ""}</div>` : ""}
        ${steps.length ? `<div class="stack"><p class="label">Volg het op de kaart</p><ul class="golist">${steps.map((s) => `<li><button type="button" class="linkbtn" data-go="${s.key}">${esc(s.t)}</button><small>${esc(s.ref)}</small></li>`).join("")}</ul></div>` : g.vorm === "symbool" || g.vorm === "thema" ? `<p class="ref">${g.vorm === "symbool" ? "De visioenen in dit gedeelte zijn beelden; ze staan niet als plaatsen op de kaart." : "Dit gedeelte is een profetie: het gaat om wat God belooft, niet om een reis."}</p>` : ""}
        <div id="vOntdek" class="stack"></div>
        <div id="vQuiz" class="stack"></div>
        ${(g.cross || []).length ? `<p class="label">Elders in de Bijbel</p><ul class="xrefs">${g.cross.map(([r, t]) => `<li>${parseRef(r) ? `<button type="button" class="linkbtn" data-ref="${esc(r)}">${esc(r)}</button>` : `<b>${esc(r)}</b>`}<span>${esc(t)}</span></li>`).join("")}</ul>` : ""}
        ${g.tijdNoot ? `<details class="noot"><summary>Hoe weten we wanneer dit was?</summary><p>${esc(g.tijdNoot)}</p></details>` : ""}
        <div class="navrow">
          <button type="button" class="btn" ${prevG ? `data-v="${prevG.nr}"` : "disabled"}>◀ ${prevG ? prevG.nr : ""}</button>
          <button type="button" class="btn primary" ${nextG ? `data-v="${nextG.nr}"` : "disabled"}>${nextG ? `${nextG.nr}. ${esc(nextG.t.length > 22 ? nextG.t.slice(0, 21) + "…" : nextG.t)}` : "Einde"} ▶</button>
        </div>
      </article>`;
    $("vTerug").onclick = () => { vOpen = null; history.replaceState(null, "", "#verhalen"); renderVerhalen(); };
    renderOntdek($("vOntdek"), g);
    renderVQuiz($("vQuiz"), g);
    focusStory(g);
    setAccent2(steps[0] ? steps[0].deel.c : g.nr >= 80 ? "lila" : "kobalt");
  }
  function setAccent2(c) { document.body.style.setProperty("--acc", color(c)); document.body.style.setProperty("--acc-deep", color(c)); }

  // De kaart bij een geschiedenis: alle bijbehorende stappen (routes en plaatsen) tegelijk.
  function clearFocus() {
    if (!focus) return;
    (focus.delen || []).forEach((d) => { if (d !== deel) map.removeLayer(routeLayer(d)); });
    focus = null; $("map").classList.remove("symbool", "gelijkenis");
    showPartPlaces(); routeState();
  }
  function focusStory(g) {
    const steps = (g.stappen || []).map((x) => STEP_BY_KEY.get(x)).filter(Boolean);
    animToken++; lySpecial.clearLayers(); map.removeLayer(lyKings); map.closePopup();
    if (focus) clearFocus();
    if (!steps.length) {
      focus = { keys: new Set(), at: [], delen: [] };
      partRoutes.forEach((gr) => map.removeLayer(gr)); lyPlaces.clearLayers(); lyAlt.clearLayers();
      camelStyle(null, false, undefined, true);
      $("map").classList.toggle("symbool", g.vorm === "symbool" || g.vorm === "thema");
      fit(g.nr >= 80 ? [[30.5, 33.5], [34, 37]] : WIDE, 6);
      queueLabels();
      return;
    }
    const d0 = steps[0].deel;
    if (d0 !== deel) { deel = d0; boek = d0.boek; cur = -1; renderDelen(); setAccent(); renderDots(); }
    const delen = [...new Set(steps.map((s) => s.deel))];
    partRoutes.forEach((gr, key) => { if (!delen.some((d) => d.key === key)) map.removeLayer(gr); });
    focus = { keys: new Set(steps.map((s) => s.key)), at: [...new Set(steps.flatMap((s) => s.at))], delen };
    // Alleen de plaatsen van deze geschiedenis (en de vaste context van het deel) op de kaart.
    lyPlaces.clearLayers(); lyAlt.clearLayers();
    focus.at.concat(d0.ctx || []).forEach((id) => { if (markers[id]) lyPlaces.addLayer(markers[id]); (altMarkers[id] || []).forEach((m) => lyAlt.addLayer(m)); });
    delen.forEach((d) => {
      map.addLayer(routeLayer(d));
      d.steps.forEach((s) => (s.r || []).forEach((r) => {
        r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts);
        const st = focus.keys.has(s.key) ? "active" : "future";
        [r.line, r.casing].forEach((l) => { const el = l.getElement(); if (el) { el.classList.remove("past", "active", "future", "hl"); el.classList.add(st); } });
        r.arrows.forEach((a) => { const e = a.getElement(); if (e) { e.firstChild.classList.toggle("off", st === "future"); e.firstChild.classList.remove("dim"); } });
      }));
    });
    const pts = steps.flatMap((s) => (s.r || []).filter((r) => r.w !== "rood").flatMap((r) => r.pts)).concat(focus.at.map(ll));
    const last = steps[steps.length - 1], lr = last.r && last.r[last.r.length - 1];
    const end = lr ? lr.pts[lr.pts.length - 1] : focus.at.length ? ll(focus.at[0]) : null;
    if (end) camel.setLatLng(end);
    camelStyle(lr ? lr.w : d0.c, false, undefined, !end);
    $("map").classList.toggle("gelijkenis", g.vorm === "gelijkenis" && !focus.at.length);
    if (pts.length) fit(pts, Math.max(...steps.map((s) => s.zoom || 9)));
    else { const v = steps.find((s) => s.view); fit(v && Array.isArray(v.view) ? v.view : v && v.view === "wide" ? WIDE : KANAAN, 8); }
    queueLabels();
  }
  function focusOverview() {
    if (focus) clearFocus();
    select(-1, { keepHash: true, noFly: false });
  }

  // ---------- ontdekken: één bouwsteen per soort ----------
  function renderOntdek(host, g) {
    const o = g.ontdek; if (!o) return;
    host.innerHTML = `<p class="label">Ontdek</p><h3 class="otitel">${esc(o.titel || "")}</h3><div class="ontdek"></div>`;
    const box = host.querySelector(".ontdek");
    const soort = ONTDEK[o.soort] || ONTDEK.onthul;
    soort(box, o, g);
  }
  const refLink = (r) => (r && parseRef(r) ? ` <button type="button" class="linkbtn small" data-ref="${esc(r)}">${esc(r)}</button>` : r ? ` <small>${esc(r)}</small>` : "");
  const ONTDEK = {
    onthul(box, o) { revealGame(box, { titel: "", items: o.items || [] }); },
    volgorde(box, o) {
      const items = o.items || [], opts = shuffle(items), picked = [];
      box.innerHTML = `<p class="ref">Tik ze aan in de goede volgorde.</p><div class="opts">${opts.map((x) => `<button type="button" class="opt" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div><button type="button" class="btn small" data-undo>Opnieuw</button><div class="res"></div>`;
      const btns = [...box.querySelectorAll(".opt")];
      btns.forEach((b) => (b.onclick = () => {
        if (picked.includes(b.dataset.v)) return;
        picked.push(b.dataset.v); b.innerHTML = `<span class="num">${picked.length}</span>${esc(b.dataset.v)}`;
        if (picked.length === items.length) {
          const ok = picked.every((v, i) => v === items[i]);
          btns.forEach((x) => { x.disabled = true; x.classList.add(picked.indexOf(x.dataset.v) === items.indexOf(x.dataset.v) ? "ok" : "no"); });
          box.querySelector(".res").innerHTML = `<div class="feedback ${ok ? "ok" : "mid"}">${ok ? "Helemaal goed!" : "Bijna."}<span>De goede volgorde: ${esc(items.join(" → "))}.</span></div>`;
        }
      }));
      box.querySelector("[data-undo]").onclick = () => ONTDEK.volgorde(box, o);
    },
    koppel(box, o) {
      const paren = o.paren || [], rechts = shuffle(paren.map((p) => p[1]));
      let sel = null, goed = 0;
      box.innerHTML = `<p class="ref">Tik links en dan rechts wat erbij hoort.</p><div class="koppel"><div>${paren.map((p, i) => `<button type="button" class="opt l" data-i="${i}">${esc(p[0])}</button>`).join("")}</div><div>${rechts.map((r) => `<button type="button" class="opt r" data-r="${esc(r)}">${esc(r)}</button>`).join("")}</div></div><div class="res" role="status"></div>`;
      box.querySelectorAll(".l").forEach((b) => (b.onclick = () => { box.querySelectorAll(".l").forEach((x) => x.classList.remove("sel")); if (!b.disabled) { sel = b; b.classList.add("sel"); } }));
      box.querySelectorAll(".r").forEach((b) => (b.onclick = () => {
        if (!sel || b.disabled) return;
        const ok = paren[+sel.dataset.i][1] === b.dataset.r;
        if (ok) { sel.disabled = b.disabled = true; sel.classList.add("ok"); b.classList.add("ok"); sel.classList.remove("sel"); sel = null; goed++; }
        else { b.classList.add("no"); setTimeout(() => b.classList.remove("no"), 600); }
        box.querySelector(".res").innerHTML = goed === paren.length ? `<div class="feedback ok">Alles goed gekoppeld!</div>` : ok ? "" : `<div class="feedback no">Dat hoort niet bij elkaar. Probeer het nog eens.</div>`;
      }));
    },
    wiezei(box, o) {
      box.innerHTML = (o.items || []).map(([citaat, goed, fout], i) => `<div class="wiezei" data-i="${i}"><p class="citaat">‘${esc(citaat)}’</p><div class="pick">${shuffle([goed].concat(fout || [])).map((n) => `<button type="button" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div><div class="res"></div></div>`).join("");
      box.querySelectorAll(".wiezei").forEach((w) => w.querySelectorAll("button").forEach((b) => (b.onclick = () => {
        const it = o.items[+w.dataset.i], ok = b.dataset.n === it[1];
        w.querySelectorAll("button").forEach((x) => { x.disabled = true; if (x.dataset.n === it[1]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no");
        w.querySelector(".res").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "Goed!" : `Het was ${esc(it[1])}.`}</div>`;
      })));
    },
    gelijkenis(box, o) { kaartjes(box, (o.beelden || o.items || []), "Wat betekent het?"); },
    symbolen(box, o) { kaartjes(box, (o.items || []), "Wat zegt de Bijbel zelf?"); },
    verbanden(box, o) {
      box.innerHTML = `<ol class="verbanden">${(o.items || []).map(([r1, b, r2, v]) => `<li><div class="vb1">${refLink(r1)}<p>${esc(b)}</p></div><button type="button" class="btn small" aria-expanded="false">Hoe kwam het uit?</button><div class="vb2" hidden>${refLink(r2)}<p>${esc(v)}</p></div></li>`).join("")}</ol>`;
      box.querySelectorAll(".verbanden li").forEach((li) => (li.querySelector(".btn").onclick = (e) => { const d = li.querySelector(".vb2"); d.hidden = !d.hidden; e.target.setAttribute("aria-expanded", !d.hidden); }));
    },
    stamboom(box, o) {
      const rijen = o.rijen || [];
      // Twee vormen: generaties (rijen met namen) of een lijst [naam, relatie, verwijzing].
      if (rijen.length && rijen.every((r) => r.length === 3 && parseRef(r[2]))) {
        box.innerHTML = `<ul class="famlijst">${rijen.map(([n, rel, r]) => { const id = mensOf(n, boek.id) || MENS_IDX["*|" + n]; return `<li>${id ? `<button type="button" class="chip" data-mens="${id}">${esc(n)}</button>` : `<b>${esc(n)}</b>`}<span>${esc(rel)}</span>${refLink(r)}</li>`; }).join("")}</ul>`;
        return;
      }
      box.innerHTML = `<div class="tree">${(o.rijen || []).map((row, i) => (i ? '<div class="arrow" aria-hidden="true">▼</div>' : "") + `<div class="gen">${row.map((n) => { const id = mensOf(n, boek.id) || MENS_IDX["*|" + n]; return id ? `<button type="button" class="person" data-mens="${id}">${esc(n)}</button>` : `<span class="person">${esc(n)}</span>`; }).join("")}</div>`).join("")}</div>${o.ref ? `<p class="ref">${refLink(o.ref)}</p>` : ""}`;
    },
    kaart(box, o) {
      box.innerHTML = `<p>${esc(o.vraag || "Wijs de plek aan op de kaart.")}</p><button type="button" class="btn small">Wijs aan op de kaart</button><div class="res" role="status"></div>`;
      box.querySelector(".btn").onclick = () => {
        fit(o.v === "wide" ? WIDE : o.v === "kanaan" ? KANAAN : Array.isArray(o.v) ? o.v : KANAAN, 8.5);
        $("map").classList.add("quizmode"); scrollToMap();
        tapHandler = (latlng) => {
          $("map").classList.remove("quizmode"); tapHandler = null;
          const goal = ll(o.id), km = hav([latlng.lat, latlng.lng], goal), ok = km <= (o.v === "wide" ? 120 : 15) * 2;
          lyQuiz.clearLayers();
          L.marker(goal, { interactive: false, icon: icon(`<span class="goal"></span><span class="lab s-r on" style="display:block">${esc(P[o.id] ? P[o.id].n : "")}</span>`) }).addTo(lyQuiz);
          box.querySelector(".res").innerHTML = `<div class="feedback ${ok ? "ok" : "mid"}">${ok ? "Raak!" : `Je zat ${fmt(Math.round(km))} km ernaast.`}</div>`;
          setTimeout(() => lyQuiz.clearLayers(), 6000);
        };
      };
    },
  };
  function kaartjes(box, items, vraag) {
    box.innerHTML = `<div class="days kaartjes">${items.map(([beeld]) => `<button type="button" class="day" aria-expanded="false"><b>${esc(beeld)}</b><span>${esc(vraag)}</span></button>`).join("")}</div>`;
    box.querySelectorAll(".day").forEach((b, i) => (b.onclick = (e) => {
      if (e.target.closest("[data-ref]")) return;
      const open = b.classList.toggle("open"); b.setAttribute("aria-expanded", open);
      const [, bet, r] = items[i];
      b.querySelector("span").innerHTML = open ? `${esc(bet)}${r ? ` <small>(${esc(r)})</small>` : ""}` : esc(vraag);
    }));
  }
  let tapHandler = null;

  // ---------- vragen bij een geschiedenis ----------
  function renderVQuiz(host, g) {
    const Qs = g.quiz || []; if (!Qs.length) return;
    let i = 0, score = 0;
    const order = Qs.map((q) => ({ ...q, opts: shuffle(q.a) }));
    function show() {
      if (i >= order.length) {
        const best = verhaalStore[g.nr] && verhaalStore[g.nr].q;
        if (best == null || score > best) saveVerhaal(g.nr, { q: score });
        host.innerHTML = `<p class="label">Vragen</p><div class="feedback ok">Klaar: ${score} van ${order.length} goed.<span>${score === order.length ? "Alles goed! Je hebt de stempel van deze geschiedenis." : "Je hebt de stempel van deze geschiedenis. Lees het nog eens na en probeer het opnieuw."}</span></div><button type="button" class="btn small" id="vqOpnieuw">Nog een keer</button>`;
        host.querySelector("#vqOpnieuw").onclick = () => renderVQuiz(host, g);
        toast(`Stempel: geschiedenis ${g.nr}`);
        return;
      }
      const q = order[i];
      host.innerHTML = `<p class="label">Vraag ${i + 1} van ${order.length}</p><p class="qtext">${esc(q.q)}</p><div class="opts">${q.opts.map((o) => `<button type="button" class="opt">${esc(o)}</button>`).join("")}</div><div class="res"></div>`;
      host.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = b.textContent === q.a[0]; if (ok) score++;
        host.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.textContent === q.a[0]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no");
        host.querySelector(".res").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "Goed!" : "Helaas."}<span>Het goede antwoord: ${esc(q.a[0])}.${q.why ? ` Lees ${refLink(q.why)}.` : ""}</span></div><button type="button" class="btn primary small" id="vqVolgende">${i + 1 < order.length ? "Volgende vraag ▶" : "Klaar"}</button>`;
        host.querySelector("#vqVolgende").onclick = () => { i++; show(); };
        host.querySelector("#vqVolgende").focus({ preventScroll: true });
      }));
    }
    host.innerHTML = `<p class="label">Vragen</p><p class="ref">${order.length} vragen over deze geschiedenis.</p><button type="button" class="btn small" id="vqStart">Begin met de vragen</button>`;
    host.querySelector("#vqStart").onclick = show;
  }

  // ---------- tijdlijn ----------
  // Jaartallen zijn reconstructies (zie tijdNoot per deel); Genesis 1–11 krijgt bewust geen jaartal.
  function renderTijd() {
    const undated = ALLPARTS.filter((d) => !d.tl), dated = ALLPARTS.filter((d) => d.tl).sort((a, b) => a.tl[0] - b.tl[0] || a.tl[1] - b.tl[1]);
    const jaar = (y) => (y < 0 ? `${fmt(-y)} v.Chr.` : `${fmt(y)} n.Chr.`);
    const row = (d) => `<li class="tl-item${d === deel ? " cur" : ""}" style="--pc:${color(d.c)}"><span class="tl-dot" aria-hidden="true"></span><div><p class="tl-when">${esc(tijdText(d) || "")}</p><button type="button" class="tl-go" data-go="${d.key}:-1"${d === deel ? ' aria-current="true"' : ""}><b>${esc(d.n)}</b><small>${esc(d.boek.n)} · ${esc(d.ref)}</small></button>${d.tijdNoot ? `<details><summary>Hoe weten we dat?</summary><p>${esc(d.tijdNoot)}</p></details>` : ""}</div></li>`;
    let h = "", prev = null;
    dated.forEach((d) => {
      if (prev && d.tl[0] - prev.tl[1] >= 40) h += `<li class="tl-gap" aria-hidden="true">ruim ${fmt(Math.floor((d.tl[0] - prev.tl[1]) / 10) * 10)} jaar later</li>`;
      h += row(d); prev = !prev || d.tl[1] > prev.tl[1] ? d : prev;
    });
    $("p-tijd").innerHTML = `<h2>Wanneer <em>gebeurde</em> het?</h2><p class="ref">De Bijbel rekent in levensjaren en regeringsjaren, niet in onze jaartelling. De jaartallen hier zijn een reconstructie: vooral de vroegste data zijn onzeker, en onderzoekers verschillen daarover van mening. Genesis 1–11 krijgt geen jaartal.</p><ol class="tijdlijn">${undated.map((d) => row(d)).join("")}${undated.length ? `<li class="tl-gap" aria-hidden="true">geen jaartallen bekend</li>` : ""}${h}</ol>`;
    const c = $("p-tijd").querySelector(".cur"); if (c) requestAnimationFrame(() => c.scrollIntoView({ block: "nearest" }));
  }

  // ---------- boekenkast: alle 66 boeken, met wat er al is ----------
  const KAST = [
    ["Wet", "Genesis Exodus Leviticus Numeri Deuteronomium"],
    ["Geschiedenis", "Jozua Richteren Ruth 1_Samuël 2_Samuël 1_Koningen 2_Koningen 1_Kronieken 2_Kronieken Ezra Nehemia Esther"],
    ["Poëzie en wijsheid", "Job Psalmen Spreuken Prediker Hooglied"],
    ["Profeten", "Jesaja Jeremia Klaagliederen Ezechiël Daniël Hosea Joël Amos Obadja Jona Micha Nahum Habakuk Sefanja Haggaï Zacharia Maleachi"],
    ["Evangeliën en Handelingen", "Mattheüs Markus Lukas Johannes Handelingen"],
    ["Brieven en Openbaring", "Romeinen 1_Korinthe 2_Korinthe Galaten Efeze Filippenzen Kolossenzen 1_Thessalonicenzen 2_Thessalonicenzen 1_Timotheüs 2_Timotheüs Titus Filemon Hebreeën Jakobus 1_Petrus 2_Petrus 1_Johannes 2_Johannes 3_Johannes Judas Openbaring"],
  ];
  const slugOf = (n) => n.toLowerCase().replace(/_/g, "").replace(/[ëéïü]/g, (c) => ({ ë: "e", é: "e", ï: "i", ü: "u" })[c]);
  const SAMEN = { deuteronomium: "numeri", nehemia: "ezra", mattheus: "jezus-1", markus: "jezus-1", lukas: "jezus-1", johannes: "jezus-1", jesaja: "profeten", jeremia: "profeten", zacharia: "profeten", maleachi: "profeten" };
  function renderKast() {
    $("kastLijst").innerHTML = KAST.map(([g, list], gi) => `${gi === 4 ? '<p class="label nt">Nieuwe Testament</p>' : gi === 0 ? '<p class="label nt">Oude Testament</p>' : ""}<p class="label">${g}</p><div class="kastrij">${list.split(" ").map((x) => {
      const n = x.replace(/_/g, " "), id = SAMEN[slugOf(x)] || slugOf(x), b = BOEKEN.find((q) => q.id === id);
      const st = b ? (SAMEN[slugOf(x)] ? `in ‘${b.n.split(" en ")[0].split(":")[0]}’` : `${b.delen.reduce((a, d) => a + d.steps.length, 0)} stappen`) : "in ontwikkeling";
      return b ? `<button type="button" class="kb" data-boek="${b.id}"${b === boek ? ' aria-current="true"' : ""}><b>${esc(n)}</b><small>${esc(st)}</small></button>` : `<span class="kb off"><b>${esc(n)}</b><small>${st}</small></span>`;
    }).join("")}</div>`).join("");
  }
  let kastFrom = null;
  $("kastBtn").onclick = () => { kastFrom = document.activeElement; renderKast(); $("kast").hidden = false; $("kastSluit").focus(); };
  const closeKast = () => { $("kast").hidden = true; if (kastFrom) kastFrom.focus(); };
  $("kastSluit").onclick = closeKast;
  $("kast").addEventListener("click", (e) => { const b = e.target.closest(".kb[data-boek]"); if (b) { closeKast(); setMode("reis"); chooseBoek(BOEKEN.find((x) => x.id === b.dataset.boek)); } else if (e.target === $("kast")) closeKast(); });

  // ---------- wie is wie ----------
  let wieSel = null;
  function renderWie() {
    const box = $("p-wie");
    const sb = boek.stamboom;
    if (sb) {
      wieSel = wieSel || "Abraham";
      box.innerHTML = `<h2>De <em>familie</em> van Abraham</h2><p>Tik op een naam om meer te weten. De aartsvaders zijn Abraham, Izak en Jakob: opa, vader en zoon.</p><div class="card" id="wieInfo"></div><div class="tree" id="tree"></div><div class="card"><h3>Hoe oud werden ze?</h3><p class="ref">Van Adam tot Jozef, volgens Genesis 5, 11 en verder. Tik op een naam.</p><div class="chain" id="chain"></div></div>`;
      const person = (x) => { const c = x.deel ? color(boek.delen.find((d) => d.id === x.deel).c) : x.m ? color(sb.moeders[x.m]) : "var(--grijs)"; return `<button type="button" class="person${x.deel ? " main" : ""}" data-n="${esc(x.n)}" style="--c:${c}" aria-pressed="false">${x.m && !x.deel && sb.rijen[4].includes(x) ? '<span class="m"></span>' : x.m && sb.rijen[4].includes(x) ? '<span class="m"></span>' : ""}${esc(x.n)}${x.a ? `<small>${x.a} jaar</small>` : ""}</button>`; };
      $("tree").innerHTML = sb.rijen.map((row, i) => (i ? '<div class="arrow" aria-hidden="true">▼</div>' : "") + `<div class="gen">${row.map(person).join("")}</div>` + (i === 4 ? `<div class="mothers">${Object.entries(sb.moeders).map(([m, c]) => `<span style="--c:${color(c)}">moeder ${esc(m)}</span>`).join("")}</div>` : "")).join("");
      const max = Math.max(...sb.leeftijden.map((x) => x[1]));
      $("chain").innerHTML = sb.leeftijden.map(([n, a]) => `<button type="button" data-n="${esc(n)}" aria-pressed="false" style="--c:${sb.kleuren[n] ? color(sb.kleuren[n]) : "var(--grijs)"}"><span>${esc(n)}</span><span class="bar" style="width:${((a / max) * 100).toFixed(1)}%"></span><span class="age">${a}</span></button>`).join("");
      wieInfoGenesis(wieSel);
    } else {
      const list = boek.wie || [];
      wieSel = list.find((x) => x.n === wieSel) ? wieSel : list[0] && list[0].n;
      box.innerHTML = `<h2>Wie is <em>wie</em> in ${esc(boek.n)}?</h2><p>Tik op een naam om meer te weten.</p><div class="card" id="wieInfo"></div><div class="wie" id="wieList">${list.map((x) => `<button type="button" data-n="${esc(x.n)}" aria-pressed="false"><b>${esc(x.n)}</b><small>${esc(x.rol || "")}</small></button>`).join("")}</div>`;
      if (list.length) wieInfoBoek(wieSel); else $("wieInfo").innerHTML = "<p>Voor dit boek is nog geen lijst met personen.</p>";
    }
  }
  // Eén persoon met familie, gebeurtenissen, plaatsen en verwijzingen, allemaal uit BR.mensen en de stappen.
  const mensChip = (id) => MENSEN[id] ? `<button type="button" class="chip" data-mens="${id}"><i style="background:${color(BR.personen[MENSEN[id].n] || "grijs")}">${esc(MENSEN[id].n[0])}</i>${esc(MENSEN[id].n)}</button>` : "";
  const refBtn = (r) => (parseRef(r) ? `<button type="button" class="linkbtn" data-ref="${esc(r)}">${esc(r)}</button>` : `<b>${esc(r)}</b>`);
  function mensDetails(id) {
    const m = MENSEN[id]; if (!m) return "";
    const kids = Object.keys(MENSEN).filter((k) => MENSEN[k].v === id || MENSEN[k].m === id);
    const sibs = m.v || m.m ? Object.keys(MENSEN).filter((k) => k !== id && ((m.v && MENSEN[k].v === m.v) || (m.m && MENSEN[k].m === m.m))) : [];
    const partners = (m.p || []).concat(Object.keys(MENSEN).filter((k) => (MENSEN[k].p || []).includes(id) && !(m.p || []).includes(k)));
    const fam = [["Vader", m.v ? [m.v] : []], ["Moeder", m.m ? [m.m] : []], ["Getrouwd met", partners], ["Kinderen", kids], ["Broers en zussen", sibs]].filter(([, l]) => l.some((k) => MENSEN[k]));
    const steps = MENS_STAPPEN[id] || [];
    const places = [...new Set(steps.flatMap(([d, i]) => d.steps[i].at || []))].filter((p) => P[p] && !P[p].ctx);
    let h = "";
    if (m.leeftijd && m.leeftijd.length) h += `<p class="ref">${m.leeftijd.map(([a, r]) => `${a} jaar (${esc(r)})`).join(" · ")}</p>`;
    if (fam.length) h += `<dl class="fam">${fam.map(([t, l]) => `<dt>${t}</dt><dd>${l.map(mensChip).join("")}</dd>`).join("")}</dl>`;
    if (steps.length) h += `<p class="label">In de reis</p><ul class="golist">${steps.map(([d, i]) => `<li><button type="button" class="linkbtn" data-go="${d.key}:${i}">${esc(d.steps[i].t)}</button><small>${esc(d.steps[i].ref)}</small></li>`).join("")}</ul>`;
    if (places.length) h += `<p class="label">Plaatsen</p><div class="chips">${places.map((p) => `<button type="button" class="chip place" data-place="${p}">${esc(P[p].n)}</button>`).join("")}</div>`;
    if (m.elders && m.elders.length) h += `<p class="label">Elders in de Bijbel</p><ul class="xrefs">${m.elders.map(([r, t]) => `<li>${refBtn(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
    if (m.vervolg && m.vervolg.length) h += `<p class="label">Het verhaal gaat verder</p><ul class="xrefs">${m.vervolg.map(([r, t]) => `<li>${refBtn(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
    return h;
  }
  function showMens(id) {
    const m = MENSEN[id]; if (!m) return;
    if (mode !== "wie") setMode("wie");
    wieSel = m.n;
    $("wieInfo").innerHTML = `<h3>${esc(m.n)}</h3>${m.alias && m.alias.length ? `<p class="ref">Ook: ${m.alias.map(esc).join(", ")}</p>` : ""}<p>${esc(m.kort || "")}</p>${mensDetails(id)}`;
    document.querySelectorAll("#p-wie [aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === m.n));
    $("wieInfo").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  function wieInfoGenesis(name) {
    wieSel = name;
    const sb = boek.stamboom;
    const all = sb.rijen.flat(); const t = all.find((x) => x.n === name); const ch = sb.leeftijden.find((x) => x[0] === name);
    const d = t && t.deel ? boek.delen.find((x) => x.id === t.deel) : null;
    const age = (t && t.a) || (ch && ch[1]);
    const info = (t && t.i) || sb.uitleg[name] || `Staat in het geslachtsregister van Genesis ${ch ? (ch[2].startsWith("5") ? "5" : "11") : ""}.`;
    $("wieInfo").innerHTML = `<h3>${esc(name)}</h3>${age ? `<p class="ref">Werd ${age} jaar${ch ? ` (Genesis ${esc(ch[2])})` : ""}</p>` : ""}<p>${esc(info)}</p>${d ? `<button type="button" class="btn primary" id="wieGo" style="--acc:${color(d.c)};--acc-deep:${color(d.c)}">Bekijk de reis van ${esc(name)} ▶</button>` : ""}`;
    if (d) $("wieGo").onclick = () => { setMode("reis"); chooseDeel(d); };
    const mid = mensOf(name, boek.id); if (mid) $("wieInfo").insertAdjacentHTML("beforeend", mensDetails(mid));
    document.querySelectorAll(".person, .chain button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === name));
  }
  function wieInfoBoek(name) {
    wieSel = name;
    const x = (boek.wie || []).find((p) => p.n === name); if (!x) return;
    const d = x.deel ? boek.delen.find((q) => q.id === x.deel) : null;
    $("wieInfo").innerHTML = `<h3>${esc(x.n)}</h3>${x.rol ? `<p class="ref">${esc(x.rol)}</p>` : ""}<p>${esc(x.i || "")}</p>${d ? `<button type="button" class="btn primary" id="wieGo" style="--acc:${color(d.c)};--acc-deep:${color(d.c)}">Bekijk de reis van ${esc(d.short)} ▶</button>` : ""}`;
    if (d) $("wieGo").onclick = () => { setMode("reis"); chooseDeel(d); };
    const mid = mensOf(name.split(/ en /)[0], boek.id); if (mid) $("wieInfo").insertAdjacentHTML("beforeend", mensDetails(mid));
    document.querySelectorAll("#wieList button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === name));
  }
  $("p-wie").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (b && !b.closest("#wieInfo")) boek.stamboom ? wieInfoGenesis(b.dataset.n) : wieInfoBoek(b.dataset.n); });

  // ---------- speurtocht ----------
  let Q = [], qi = 0, score = 0, awaitingTap = null, qPart = "alles";
  const quizOf = (d) => d.quiz || { tap: [], mc: [], ord: [] };
  function quizIntro() {
    const opts = [["alles", "Alles uit " + boek.n, "var(--boter)"]].concat(boek.delen.map((d) => [d.id, d.n, color(d.c)]));
    if (!boek.delen.find((d) => d.id === qPart) && qPart !== "alles") qPart = "alles";
    const best = store.get("best:" + boek.id + ":" + qPart, null);
    $("p-quiz").innerHTML = `<div class="card"><h2>Speur<em>tocht</em></h2><p>10 vragen. Soms wijs je een plek aan op de kaart, soms kies je het goede antwoord of zet je dingen in de goede volgorde.</p><p class="label">Over wie?</p><div class="pick">${opts.map(([id, n, c]) => `<button type="button" data-q="${id}" style="--pc:${c}" aria-pressed="${id === qPart}">${esc(n)}</button>`).join("")}</div><p class="ref">In de speurtocht staan er geen namen op de kaart. Kijk goed naar de zeeën en rivieren!</p>${best != null ? `<p><b>Jouw beste score hier: ${fmt(best)} van 10</b></p>` : ""}<button type="button" class="btn primary" id="qGo">Start de speurtocht</button></div>`;
    $("p-quiz").querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => { qPart = b.dataset.q; quizIntro(); }));
    $("qGo").onclick = startQuiz;
    fit(WIDE, 6);
  }
  function startQuiz() {
    const delen = qPart === "alles" ? boek.delen : [boek.delen.find((d) => d.id === qPart)];
    const tap = shuffle(delen.flatMap((d) => quizOf(d).tap || [])), mc = shuffle(delen.flatMap((d) => quizOf(d).mc || [])), ord = shuffle(delen.flatMap((d) => quizOf(d).ord || []).concat(qPart === "alles" ? boek.ordAlles || [] : []));
    const nOrd = Math.min(2, ord.length), nTap = Math.min(4, tap.length), nMc = Math.min(10 - nOrd - nTap, mc.length);
    Q = shuffle([...tap.slice(0, nTap).map((x) => ({ t: "tap", ...x })), ...mc.slice(0, nMc).map((x) => ({ t: "mc", ...x })), ...ord.slice(0, nOrd).map((x) => ({ t: "ord", ...x }))]);
    if (!Q.length) { $("p-quiz").innerHTML = "<div class='card'><p>Voor dit deel zijn nog geen vragen.</p></div>"; return; }
    qi = 0; score = 0; ask();
  }
  const head = () => `<div class="qhead"><span>Vraag ${qi + 1} van ${Q.length}</span><span>Punten: ${fmt(score)}</span></div><div class="progress"><div style="width:${((qi / Q.length) * 100).toFixed(0)}%"></div></div>`;
  const nextBtn = () => `<button type="button" class="btn primary" id="qNext">${qi + 1 < Q.length ? "Volgende vraag ▶" : "Bekijk je score"}</button>`;
  function bindNext() { $("qNext").onclick = () => { qi++; lyQuiz.clearLayers(); qi < Q.length ? ask() : finish(); }; $("qNext").focus({ preventScroll: true }); }
  const viewOf = (v) => (v === "wide" ? WIDE : v === "kanaan" ? KANAAN : v);
  function ask() {
    const q = Q[qi]; awaitingTap = null; lyQuiz.clearLayers();
    const box = $("p-quiz");
    if (q.t === "tap") {
      box.innerHTML = `${head()}<p class="qtext">${esc(q.q)}</p><div class="tapcall"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 11V5a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v2M17 11a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2"/></svg><span>Tik op de kaart${isNarrow() ? " hierboven" : ""}.</span></div><div id="qRes"></div>`;
      fit(viewOf(q.v), 8.5); awaitingTap = q; scrollToMap();
    } else if (q.t === "mc") {
      const opts = shuffle(q.a);
      box.innerHTML = `${head()}<p class="qtext">${esc(q.q)}</p><div class="opts">${opts.map((o) => `<button type="button" class="opt">${esc(o)}</button>`).join("")}</div><div id="qRes"></div>`;
      box.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = b.textContent === q.a[0];
        box.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.textContent === q.a[0]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no"); else score++;
        $("qRes").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "Goed zo!" : "Helaas."}<span>Het goede antwoord: ${esc(q.a[0])}. Lees maar na in ${esc(q.why)}.</span></div>${nextBtn()}`;
        bindNext();
      }));
    } else {
      const opts = shuffle(q.items); const picked = [];
      box.innerHTML = `${head()}<p class="qtext">${esc(q.q)}</p><p class="ref">Tik ze aan in de goede volgorde: eerst wat het eerst kwam.</p><div class="opts">${opts.map((o) => `<button type="button" class="opt" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div><button type="button" class="btn" id="qUndo">Opnieuw kiezen</button><div id="qRes"></div>`;
      const btns = [...box.querySelectorAll(".opt")];
      btns.forEach((b) => (b.onclick = () => {
        if (picked.includes(b.dataset.v)) return;
        picked.push(b.dataset.v);
        b.innerHTML = `<span class="num">${picked.length}</span>${esc(b.dataset.v)}`;
        if (picked.length === q.items.length) {
          const nOk = picked.filter((v, i) => v === q.items[i]).length, ok = nOk === q.items.length;
          btns.forEach((x) => { x.disabled = true; x.classList.add(picked.indexOf(x.dataset.v) === q.items.indexOf(x.dataset.v) ? "ok" : "no"); });
          $("qUndo").hidden = true;
          if (ok) score++; else if (nOk >= 2) score += 0.5;
          $("qRes").innerHTML = `<div class="feedback ${ok ? "ok" : nOk >= 2 ? "mid" : "no"}">${ok ? "Helemaal goed!" : nOk >= 2 ? "Bijna! Een half punt." : "Helaas."}<span>De goede volgorde: ${esc(q.items.join(" → "))}.</span></div>${nextBtn()}`;
          bindNext();
        }
      }));
      $("qUndo").onclick = () => { picked.length = 0; btns.forEach((b) => (b.textContent = b.dataset.v)); };
    }
  }
  map.on("click", (e) => {
    if (tapHandler) { tapHandler(e.latlng); return; }
    if (mode !== "quiz" || !awaitingTap) return;
    const q = awaitingTap; awaitingTap = null;
    const goal = ll(q.id), tap = [e.latlng.lat, e.latlng.lng], km = hav(tap, goal), wide = q.v === "wide";
    const hit = (wide ? 120 : 15) * (q.loose || 1) * (q.loose && !wide ? 2 : 1), near = hit * 3;
    const res = km <= hit ? "ok" : km <= near ? "mid" : "no";
    if (res === "ok") score++; else if (res === "mid") score += 0.5;
    L.marker(tap, { interactive: false, icon: icon('<span class="tap"></span>') }).addTo(lyQuiz);
    L.marker(goal, { interactive: false, icon: icon(`<span class="goal"></span><span class="lab s-r on" style="display:block">${esc(q.name || (P[q.id] && P[q.id].n) || "")}</span>`) }).addTo(lyQuiz);
    if (res !== "ok") L.polyline([tap, goal], { className: "qline", interactive: false }).addTo(lyQuiz);
    fit([tap, goal], 9);
    $("qRes").innerHTML = `<div class="feedback ${res}">${res === "ok" ? "Raak!" : res === "mid" ? "Bijna! Een half punt." : "Mis."}<span>${res === "ok" && km < 5 ? "Precies goed." : `Je zat ${fmt(roundKm(km) || Math.round(km))} km ernaast.`}</span></div>${nextBtn()}`;
    document.querySelector(".tapcall").hidden = true;
    bindNext();
    if (isNarrow()) $("qRes").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  });
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z"/></svg>';
  function finish() {
    const s = Math.round(score * 2) / 2, nStars = s >= 9 ? 3 : s >= 6 ? 2 : s >= 3 ? 1 : 0;
    const key = "best:" + boek.id + ":" + qPart;
    const best = store.get(key, null), isBest = best == null || s > best;
    if (isBest) store.set(key, s);
    const words = ["Goed geprobeerd! Kijk nog eens bij de Reis en probeer het opnieuw.", "Mooi! Je weet al aardig wat.", "Heel goed! Jij kent de verhalen.", "Super! Jij bent een echte speurneus."];
    $("p-quiz").innerHTML = `<div class="card center"><h2>Klaar!</h2><div class="stars">${[0, 1, 2].map((i) => `<span class="${i < nStars ? "" : "off"}">${STAR}</span>`).join("")}</div><p class="big">${fmt(s)} <small>van ${Q.length}</small></p><p>${words[nStars]}</p>${isBest && best != null ? "<p><b>Nieuw record!</b></p>" : ""}<button type="button" class="btn primary" id="qAgain">Nog een keer</button></div>`;
    $("qAgain").onclick = quizIntro;
    fit(WIDE, 6);
  }

  // ---------- hoe ver ----------
  const NL_KM = roundKm(hav([53.219, 6.567], [50.851, 5.691]));
  const WAYS = [
    { n: "Met schapen en geiten", s: "ongeveer 10 km per dag", v: 10, u: "d", i: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 15a5 5 0 0 1 8-3 5 5 0 0 1 8 3 4 4 0 0 1-1 7H9a4 4 0 0 1-1-7z"/><path d="M11 22v5M21 22v5M24 15h3l1 3"/></svg>' },
    { n: "Wandelen", s: "ongeveer 25 km per dag", v: 25, u: "d", i: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="17" cy="5" r="2.5"/><path d="m11 30 4-9 4 3 2 6M15 21l1-8 5 4h4M16 13l-5 2-2 5"/></svg>' },
    { n: "Fietsen", s: "ongeveer 75 km per dag", v: 75, u: "d", i: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="22" r="5"/><circle cx="25" cy="22" r="5"/><path d="m7 22 6-10h8l4 10M13 12l4 10h-4M19 8h4"/></svg>' },
    { n: "Met de auto", s: "ongeveer 90 km per uur", v: 90, u: "h", i: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-5l3-6h14l5 6h2v5z"/><circle cx="9" cy="22" r="3"/><circle cx="23" cy="22" r="3"/></svg>' },
  ];
  function dur(km, w) {
    const x = km / w.v;
    if (w.u === "h") return `${Math.max(1, Math.round(x))} uur`;
    const d = Math.max(1, Math.round(x));
    const extra = d >= 60 ? `<small>ruim ${Math.floor(d / 30)} maanden</small>` : d >= 14 ? `<small>${Math.round(d / 7)} weken</small>` : "";
    return `${d} ${d === 1 ? "dag" : "dagen"}${extra}`;
  }
  let TRIP_LIST = [], tripLines = [], nlOn = false, nlCenter = null, stepTrip = null;
  function renderTrips() {
    TRIP_LIST = [];
    if (stepTrip) TRIP_LIST.push({ g: "Deze stap", n: `${stepTrip.deel.short}: ${stepTrip.t}`, routes: stepTrip.r, deel: stepTrip.deel });
    BOEKEN.forEach((b) => b.delen.forEach((d) => (d.trips || []).forEach((t) => {
      const routes = t.s === "alles" ? d.steps.flatMap((s) => (s.r || []).filter((r) => r.w === d.c)) : (d.steps[t.s] && d.steps[t.s].r || []).filter((r, i) => t.r == null || i === t.r);
      if (routes.length) TRIP_LIST.push({ g: b.n + " · " + d.n, n: t.n, routes, deel: d });
    })));
    const groups = [...new Set(TRIP_LIST.map((t) => t.g))];
    const sel = $("trip");
    const keep = stepTrip ? "0" : sel.value;
    stepTrip = null;
    sel.innerHTML = groups.map((g) => `<optgroup label="${esc(g)}">${TRIP_LIST.map((t, i) => (t.g === g ? `<option value="${i}">${esc(t.n)}</option>` : "")).join("")}</optgroup>`).join("");
    const first = TRIP_LIST.findIndex((t) => t.deel === deel);
    sel.value = keep && TRIP_LIST[+keep] ? keep : String(first >= 0 ? first : 0);
  }
  function showTrip() {
    const t = TRIP_LIST[+$("trip").value]; if (!t) return;
    const km = roundKm(t.routes.reduce((a, r) => a + r.len, 0));
    $("tripKm").innerHTML = `${fmt(km)} <small>km</small>`;
    $("ways").innerHTML = WAYS.map((w) => `<div class="way">${w.i}<div>${w.n}<small>${w.s}</small></div><b>${dur(km, w)}</b></div>`).join("");
    const times = km / NL_KM;
    $("nlText").innerHTML = times >= 1
      ? `Nederland is van Groningen tot Maastricht ongeveer ${NL_KM} km lang. Deze reis is <b>${fmt(Math.round(times * 10) / 10)} keer</b> zo lang.`
      : `Nederland is van Groningen tot Maastricht ongeveer ${NL_KM} km lang. Deze reis is <b>${Math.round(times * 100)}%</b> daarvan, ongeveer ${km < 60 ? "van Amsterdam naar Utrecht en een stukje verder" : km < 130 ? "van Amsterdam naar Arnhem" : "van Amsterdam naar Maastricht"}.`;
    const full = Math.floor(times), partW = times - full, unit = Math.max(14, Math.min(56, 300 / Math.max(times, 1)));
    $("nlRow").innerHTML = Array.from({ length: Math.min(full, 40) }, () => `<span class="nlbar" style="width:${unit.toFixed(0)}px"></span>`).join("") + (partW > 0.05 ? `<span class="nlbar part" style="width:${Math.max(4, unit * partW).toFixed(0)}px"></span>` : "");
    if (t.deel !== deel) { deel = t.deel; boek = deel.boek; cur = -1; partRoutes.forEach((g, key) => { if (key !== deel.key) map.removeLayer(g); }); map.addLayer(routeLayer(deel)); showPartPlaces(); setAccent(); renderDots(); renderBoeken(); renderDelen(); }
    deel.steps.forEach((s) => (s.r || []).forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }));
    showAll = true; routeState(); showAll = false;
    tripLines.forEach((l) => l.remove());
    tripLines = t.routes.map((r) => L.polyline(r.pts, { className: "rt hl", color: color(deel.c), interactive: false }).addTo(lyQuiz));
    map.removeLayer(lyKings); lySpecial.clearLayers();
    const pts = t.routes.flatMap((r) => r.pts);
    fit(pts, 8.5);
    nlCenter = L.latLng(pts[Math.floor(pts.length / 2)]);
    if (nlOn) drawNL();
  }
  $("trip").addEventListener("change", showTrip);
  function nlShape(c) {
    const k = Math.cos((52.15 * Math.PI) / 180), kc = Math.cos((c.lat * Math.PI) / 180);
    return insetGeo.nl.map((ring) => ring.map(([lon, lat]) => [c.lat + (lat - 52.15), c.lng + ((lon - 5.3) * k) / kc]));
  }
  function drawNL() {
    if (!insetGeo) return;
    lyNL.clearLayers();
    const poly = L.polygon(nlShape(nlCenter), { className: "nl", interactive: false }).addTo(lyNL);
    const h = L.marker(nlCenter, { draggable: true, keyboard: true, title: "Sleep Nederland", icon: icon('<span class="nlhandle">NL</span>') }).addTo(lyNL);
    h.on("drag", (e) => { nlCenter = e.target.getLatLng(); poly.setLatLngs(nlShape(nlCenter)); });
  }
  $("nlBtn").onclick = () => {
    nlOn = !nlOn;
    $("nlBtn").textContent = nlOn ? "Haal Nederland weg" : "Leg Nederland op de kaart";
    $("nlHint").hidden = !nlOn;
    if (nlOn) { drawNL(); scrollToMap(); } else lyNL.clearLayers();
  };

  // ---------- paspoort ----------
  function stampSVG(s) {
    const w = s.r ? s.r[0].w : s.deel.c, c = color(w);
    const rot = ((s.i * 37 + s.deel.id.length * 11) % 17) - 8;
    const fs = s.stamp.length > 10 ? 11 : s.stamp.length > 8 ? 13 : 16;
    const top = s.ref.replace(/^(\d?\s?[A-Za-zëéïü]+)\s.*$/, "$1").toUpperCase().slice(0, 7) + " " + ((s.ref.match(/\s(\d+)/) || [])[1] || "");
    return `<svg viewBox="0 0 100 100" style="transform:rotate(${rot}deg)"><circle class="ring" cx="50" cy="50" r="44" stroke="${c}"/><circle class="ring2" cx="50" cy="50" r="37" stroke="${c}"/><text class="mono" x="50" y="33" font-size="9" fill="${c}">${esc(top)}</text><text x="50" y="57" font-size="${fs}" fill="${c}">${esc(s.stamp)}</text><text class="mono" x="50" y="76" font-size="10" fill="${c}">${s.i + 1}</text></svg>`;
  }
  function renderStamps() {
    const total = ALLPARTS.reduce((a, d) => a + d.steps.length, 0);
    $("stamps").innerHTML = BOEKEN.map((b) => `<p class="label" style="margin-top:4px">${esc(b.n)}</p>` + b.delen.map((d) => {
      const got = d.steps.filter((s) => seen.has(s.key)).length;
      return `<div class="stack" style="gap:6px"><p class="label" style="color:${color(d.c)}">${esc(d.n)} · ${got} van ${d.steps.length}</p><div class="stamps">${d.steps.map((s) => `<button type="button" class="stamp${seen.has(s.key) ? "" : " no"}" data-key="${d.key}" data-s="${s.i}" aria-label="${esc(d.n)}, stap ${s.i + 1}: ${esc(s.t)}${seen.has(s.key) ? ", gestempeld" : ", nog niet bezocht"}">${stampSVG(s)}</button>`).join("")}</div></div>`;
    }).join("")).join("");
    const n = ALLPARTS.reduce((a, d) => a + d.steps.filter((s) => seen.has(s.key)).length, 0);
    $("pasText").textContent = n === total ? `Alle ${total} stempels! Jij hebt de hele reis gemaakt.` : `Je hebt ${n} van de ${total} stempels. Ga verder met de reis om ze allemaal te verzamelen.`;
    const nV = Object.values(verhaalStore).filter((v) => v.q != null).length, nG = Object.keys(verhaalStore).length;
    $("vPasText").textContent = nG ? `${nG} van de 150 geschiedenissen gelezen, ${nV} gestempeld (vragen gemaakt).` : "Lees een geschiedenis bij ‘Verhalen’ en maak de vragen om een stempel te krijgen.";
    $("vGrid").innerHTML = Array.from({ length: 150 }, (_, i) => { const nr = i + 1, v = verhaalStore[nr], g = GBYNR.get(nr); return `<button type="button" class="vcel${v && v.q != null ? " klaar" : v ? " gezien" : ""}" ${g ? `data-v="${nr}"` : "disabled"} aria-label="Geschiedenis ${nr}${g ? ": " + esc(g.t) : " (nog niet beschikbaar)"}${v && v.q != null ? ", gestempeld" : v ? ", gelezen" : ""}">${nr}</button>`; }).join("");
    const bests = [];
    BOEKEN.forEach((b) => [["alles", "alles uit " + b.n]].concat(b.delen.map((d) => [d.id, d.n])).forEach(([id, nm]) => { const v = store.get("best:" + b.id + ":" + id, null); if (v != null) bests.push(`${nm} ${fmt(v)}/10`); }));
    $("bestText").textContent = bests.length ? "Beste scores speurtocht: " + bests.join(" · ") : "Je hebt de speurtocht nog niet gedaan.";
  }
  $("vGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });
  $("stamps").addEventListener("click", (e) => { const b = e.target.closest(".stamp"); if (b) { const d = ALLPARTS.find((x) => x.key === b.dataset.key); setMode("reis"); if (d.boek !== boek) chooseBoek(d.boek, d, +b.dataset.s); else chooseDeel(d, +b.dataset.s); } });
  let resetArmed = false;
  $("resetPas").onclick = () => {
    if (!resetArmed) { resetArmed = true; $("resetPas").textContent = "Zeker weten? Tik nog een keer"; setTimeout(() => { resetArmed = false; $("resetPas").textContent = "Paspoort leegmaken"; }, 4000); return; }
    resetArmed = false; seen.clear(); store.set("gezien", []);
    BOEKEN.forEach((b) => ["alles"].concat(b.delen.map((d) => d.id)).forEach((id) => store.set("best:" + b.id + ":" + id, null)));
    $("resetPas").textContent = "Paspoort leegmaken"; renderStamps(); toast("Paspoort is leeg");
  };
  let toastT;
  function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2200); }

  // ---------- overal klikbaar: naar een stap, een Bijbeltekst, een persoon, een plaats ----------
  function goKey(key) {
    const [b, dId, i] = key.split(":"), d = ALLPARTS.find((x) => x.key === b + ":" + dId); if (!d) return;
    map.closePopup();
    if (mode !== "reis") setMode("reis");
    if (d.boek !== boek) chooseBoek(d.boek, d, +i); else if (d !== deel) chooseDeel(d, +i); else select(+i);
    scrollToMap();
  }
  function showPlace(id) {
    const m = markers[id]; if (!m) return;
    if (!map.hasLayer(m)) lyPlaces.addLayer(m);
    map.flyTo(P[id].ll, Math.max(map.getZoom(), P[id].z || 7), { duration: reduceMotion ? 0 : 0.6 });
    setTimeout(() => m.openPopup(), reduceMotion ? 0 : 650);
    scrollToMap();
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go], [data-ref], [data-mens], [data-place], [data-crumb], [data-tab]"); if (!t) return;
    if (t.dataset.go) goKey(t.dataset.go);
    else if (t.dataset.ref) { ladeFrom = t; openBible(t.dataset.ref); }
    else if (t.dataset.mens) showMens(t.dataset.mens);
    else if (t.dataset.place) showPlace(t.dataset.place);
    else if (t.dataset.crumb === "boek") chooseBoek(boek);
    else if (t.dataset.crumb === "deel") select(-1);
    else if (t.dataset.tab) setMode(t.dataset.tab);
  });

  // ---------- kaartbediening: toen/nu, legenda, grote kaart, twee vingers op een telefoon ----------
  function setNu(on) {
    $("nuBtn").setAttribute("aria-pressed", on); $("toenBtn").setAttribute("aria-pressed", !on);
    $("lgNu").hidden = !on;
    map.getContainer().classList.toggle("nu", on);
    if (on) loadModern().then(() => map.addLayer(lyModern)); else map.removeLayer(lyModern);
    queueLabels();
  }
  $("toenBtn").onclick = () => setNu(false);
  $("nuBtn").onclick = () => setNu(true);
  function setLegend(open) { $("legend").classList.toggle("open", open); $("legendBtn").setAttribute("aria-expanded", open); $("legendBtn").textContent = open && !isNarrow() ? "Legenda sluiten" : "Legenda"; queueLabels(); }
  $("legendBtn").onclick = () => { const open = !$("legend").classList.contains("open"); setLegend(open); store.set("legenda", open); };
  setLegend(store.get("legenda", false));
  const touchy = window.matchMedia("(pointer: coarse)");
  function setFull(on) {
    document.body.classList.toggle("mapfull", on);
    $("fullBtn").setAttribute("aria-pressed", on);
    $("fullBtn").querySelector("span").textContent = on ? "Terug" : "Groot";
    $("fullBtn").setAttribute("aria-label", on ? "Terug naar het reisboek" : "Groot: kaart op volledig scherm");
    setTimeout(() => { map.invalidateSize(); syncDrag(); queueLabels(); }, 60);
    if (!on) $("fullBtn").focus();
  }
  $("fullBtn").onclick = () => setFull(!document.body.classList.contains("mapfull"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && document.body.classList.contains("mapfull") && $("lade").hidden && $("kast").hidden) setFull(false); });
  // Op een telefoon in het reisboek: met één vinger scroll je de pagina, met twee vingers beweeg je de kaart (Leaflet-knijpzoom verschuift ook).
  function syncDrag() {
    const embed = touchy.matches && isNarrow() && !document.body.classList.contains("mapfull");
    embed ? map.dragging.disable() : map.dragging.enable();
    map.getContainer().classList.toggle("embed", embed);
  }
  let gestureT;
  map.getContainer().addEventListener("touchmove", (e) => {
    if (!map.getContainer().classList.contains("embed") || e.touches.length !== 1) return;
    $("gesture").hidden = false; clearTimeout(gestureT); gestureT = setTimeout(() => ($("gesture").hidden = true), 1400);
  }, { passive: true });
  window.addEventListener("resize", () => { syncDrag(); queueLabels(); });

  // ---------- welkom en verder waar je was ----------
  function renderWelkom() {
    const last = store.get("laatst", null), d = last && ALLPARTS.find((x) => last.startsWith(x.key + ":")), i = d ? +last.split(":")[2] : -1;
    const box = $("welkom");
    if (store.get("welkomWeg", false) && !d) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = d && d.steps[i]
      ? `<p class="label">Welkom terug</p><p>Je was bij <b>${esc(d.boek.n)} · ${esc(d.n)}</b>, stap ${i + 1}: ${esc(d.steps[i].t)}.</p><div class="navrow"><button type="button" class="btn primary" data-go="${d.key}:${i}">Ga verder ▶</button><button type="button" class="btn" id="welkomWeg">Begin ergens anders</button></div>`
      : `<p class="label">Zo werkt het</p><ol class="uitleg"><li>Kies bij <b>Verhalen</b> een van de 150 geschiedenissen, of zoek op naam, plaats of Bijbelboek.</li><li>Lees wat de Bijbel vertelt, bekijk het op de <b>kaart</b> en lees de Bijbeltekst zelf.</li><li>Ontdek meer, maak de vragen en verzamel <b>stempels</b>. Bij <b>Reis</b> volg je de routes stap voor stap.</li></ol><button type="button" class="btn small" id="welkomWeg">Begrepen</button>`;
    $("welkomWeg").onclick = () => { store.set("welkomWeg", true); box.hidden = true; };
  }

  // ---------- start ----------
  renderBoeken();
  const [hashId, hashStep] = decodeURIComponent(location.hash.slice(1)).split("/");
  const startDeel = ALLPARTS.find((d) => d.id === hashId) || ALLPARTS.find((d) => d.boek.id === hashId) || ALLPARTS[0];
  const startStep = hashStep && startDeel.steps[+hashStep - 1] ? +hashStep - 1 : -1;
  fetch("/bijbelreis/geo.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(drawBase).catch(() => {
    console.error("Bijbelreis: de kaartondergrond kon niet worden geladen.");
    $("map").insertAdjacentHTML("beforeend", '<p class="maperr" role="status">De kaart kon niet helemaal worden geladen. Controleer de verbinding en laad de pagina opnieuw.</p>');
  });
  TABS.forEach((t) => ($("t-" + t).tabIndex = t === "reis" ? 0 : -1));
  chooseBoek(startDeel.boek, startDeel, startStep, { keepHash: true });
  const vHash = /^v(\d+)$/.exec(hashId || "");
  if (vHash && GBYNR.has(+vHash[1])) openVerhaal(+vHash[1], { keepHash: true });
  else if (!hashId || hashId === "verhalen") setMode("verhalen");
  else setMode("reis");
  if (!hashId) renderWelkom();
  syncDrag();
  window.addEventListener("hashchange", () => {
    const [h, st] = decodeURIComponent(location.hash.slice(1)).split("/");
    const vm = /^v(\d+)$/.exec(h); if (vm && GBYNR.has(+vm[1])) { if (vOpen !== +vm[1]) openVerhaal(+vm[1], { keepHash: true }); return; }
    const d = ALLPARTS.find((x) => x.id === h); if (!d) return;
    const i = st && d.steps[+st - 1] ? +st - 1 : -1;
    if (d !== deel || i !== cur) { setMode("reis"); chooseBoek(d.boek, d, i, { keepHash: true }); }
  });
})();
