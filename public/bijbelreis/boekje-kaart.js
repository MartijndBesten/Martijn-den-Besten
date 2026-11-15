// Presentatie en boekje: de kaarttekenaar. Tekent per stap een eenvoudige, heldere kaart als SVG (geen Leaflet),
// uit geo.json (kust, water, rivieren) en toen.json (het landschap van toen), in de kleuren van de atlas.
// Geen DOM nodig: alles is rekenwerk en tekst, zodat het ook in het losse bestand en in de unittests werkt.
// Uitleg: docs/bijbelreis-boekje/README.md. Stijl van de klassen bk-…: boekje.css.
(function (global) {
  "use strict";
  const RAD = Math.PI / 180;
  // Dezelfde projectie als de atlas (Mercator), in graden: een graad lengte en een ‘graad’ hoogte zijn op de kaart even lang.
  const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * RAD) / 2)) / RAD;
  const latVan = (y) => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;
  const f1 = (n) => String(Math.round(n * 10) / 10);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const kleur = (k) => `var(--${k}-deep, var(--${k}))`;

  // Tot waar de ondergrond reikt (geo.json): daarbuiten is er geen land om te tekenen.
  const BEREIK = { w: 8.3, e: 52.7, s: 23.8, n: 45.2 };
  const WIJD = [[29.0, 30.5], [38.6, 47.6]], KANAAN = [[30.9, 34.2], [33.4, 36.4]];
  // Kleine rivieren en namen van streken en zeeën: dezelfde lijsten als in app.js (tests/bijbelreis-boekje.test.ts
  // bewaakt dat ze gelijk blijven). z = het zoombereik van de atlas waarin de naam verschijnt.
  const KLEINE_RIVIEREN = [
    { n: "Jabbok", p: [[31.95, 35.93], [32.07, 36.09], [32.17, 36.05], [32.27, 35.92], [32.21, 35.78], [32.19, 35.66], [32.1, 35.56]] },
    { n: "Jarmuk", p: [[32.75, 36.2], [32.73, 36.0], [32.68, 35.8], [32.69, 35.64]] },
    { n: "Arnon", p: [[31.35, 36.1], [31.45, 35.9], [31.5, 35.7], [31.47, 35.55]] },
    { n: "Kison", p: [[32.55, 35.25], [32.65, 35.15], [32.75, 35.05], [32.82, 35.02]] },
    { n: "Besor", p: [[31.15, 34.95], [31.25, 34.75], [31.33, 34.55], [31.38, 34.4]] },
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
    { t: "Galilea", ll: [32.88, 35.32], z: [7.25, 10], k: "land", tijd: "nt" }, { t: "Samaria", ll: [32.2, 35.12], z: [7.5, 10], k: "land", tijd: "nt" },
    { t: "Judea", ll: [31.55, 34.98], z: [7.25, 10], k: "land", tijd: "nt" }, { t: "Dekapolis", ll: [32.55, 35.95], z: [7.75, 10], k: "land", tijd: "nt" },
    { t: "Syrië", ll: [34.6, 37.3], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Cilicië", ll: [37.15, 34.9], z: [5.5, 8], k: "land", tijd: "nt" },
    { t: "Pamfylië", ll: [37.1, 31.3], z: [5.5, 8], k: "land", tijd: "nt" }, { t: "Galatië", ll: [39.3, 32.6], z: [4.75, 7.5], k: "land", tijd: "nt" },
    { t: "Asia", ll: [38.7, 28.7], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Macedonië", ll: [40.9, 22.3], z: [4.75, 7.5], k: "land", tijd: "nt" },
    { t: "Achaje", ll: [37.6, 22.0], z: [4.75, 7.5], k: "land", tijd: "nt" }, { t: "Italië", ll: [41.2, 15.2], z: [4, 7], k: "land", tijd: "nt" },
    { t: "Kreta", ll: [35.25, 24.6], z: [5, 8], k: "land", tijd: "nt" }, { t: "Cyprus", ll: [35.1, 33.15], z: [5, 8], k: "land", tijd: "nt" },
    { t: "Adria", ll: [38.0, 18.6], z: [4, 7], k: "sea", tijd: "nt" },
    { t: "Hulameer", ll: [33.07, 35.72], z: [9.5, 12], k: "sea toen" }, { t: "zee rond 2000 v.Chr.?", ll: [30.85, 47.75], z: [6, 9], k: "sea toen" },
  ];
  // De vorm van een plaats per soort, in een vakje van 14 bij 14 (zoals in app.js).
  const PIN = {
    stad: '<circle class="f" cx="7" cy="7" r="4.6"/>', altaar: '<path class="f" d="M7 1.2 12.8 7 7 12.8 1.2 7z"/>', put: '<circle class="f" cx="7" cy="7" r="4.6"/><circle class="kern" cx="7" cy="7" r="1.8"/>',
    berg: '<path class="f" d="M7 1.5 12.5 12H1.5z"/>', tent: '<path class="f" d="M7 1.5 13 12.5H1z"/><path class="naad" d="M7 7v5.5"/>',
    kamp: '<rect class="f" x="2.2" y="2.2" width="9.6" height="9.6" rx="2"/>', water: '<circle class="f" cx="7" cy="7" r="4.6"/>', ctx: '<circle class="f" cx="7" cy="7" r="4"/>',
  };
  const ZEKER = { v: 1, w: 1, b: 1, o: 1, r: 1 };
  const zekerheid = (p) => (p.ctx ? "v" : ZEKER[p.c] ? p.c : "w");

  // ---------- uitsnede en projectie ----------
  // Het gebied rond de punten [lat, lng], met marge, in de gevraagde beeldverhouding (breed : hoog). minLon is de
  // kleinste breedte in graden: één plaats krijgt zo een streek om zich heen in plaats van een lege vlek.
  function uitsnede(pts, o) {
    o = o || {};
    const aspect = o.aspect || 1.5, marge = o.marge == null ? 0.18 : o.marge;
    if (!pts || !pts.length) pts = WIJD;
    let w = Infinity, e = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach((p) => { w = Math.min(w, p[1]); e = Math.max(e, p[1]); const y = mercY(p[0]); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    let bw = (e - w) * (1 + 2 * marge), bh = (y1 - y0) * (1 + 2 * marge);
    const min = o.minLon || 1.2;
    bw = Math.max(bw, min); bh = Math.max(bh, min / aspect);
    if (bw / bh < aspect) bw = bh * aspect; else bh = bw / aspect;
    // Binnen de ondergrond blijven: eerst verkleinen als het gebied groter is dan de kaartgegevens, dan schuiven.
    const By0 = mercY(BEREIK.s), By1 = mercY(BEREIK.n), k = Math.min(1, (BEREIK.e - BEREIK.w) / bw, (By1 - By0) / bh);
    bw *= k; bh *= k;
    let cx = (w + e) / 2, cy = (y0 + y1) / 2;
    cx = Math.max(BEREIK.w + bw / 2, Math.min(BEREIK.e - bw / 2, cx));
    cy = Math.max(By0 + bh / 2, Math.min(By1 - bh / 2, cy));
    return { w: cx - bw / 2, e: cx + bw / 2, s: latVan(cy - bh / 2), n: latVan(cy + bh / 2) };
  }
  // Van graden naar beeldpunten in een vlak van W bij H.
  function projectie(box, W, H) {
    const y0 = mercY(box.n), y1 = mercY(box.s), kx = W / (box.e - box.w), ky = H / (y0 - y1);
    const x = (lng) => (lng - box.w) * kx, y = (lat) => (y0 - mercY(lat)) * ky;
    const mid = (box.s + box.n) / 2;
    return { x, y, pt: (p) => [x(p[1]), y(p[0])], kx, ky, kmPerPx: (111.32 * Math.cos(mid * RAD)) / kx, box };
  }
  // Het zoomniveau van de atlas dat bij deze breedte in graden hoort (op een kaart van 900 beeldpunten breed).
  const zoomVan = (box) => Math.log2((900 * 360) / (256 * (box.e - box.w)));
  const breedteBijZoom = (z) => (900 * 360) / (256 * Math.pow(2, z));

  // ---------- knippen ----------
  // Een ring [[lon, lat], …] tegen een rechthoek (Sutherland–Hodgman). De rand van de rechthoek ligt buiten beeld.
  function knipRing(ring, b) {
    let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
    for (const p of ring) { if (p[0] < w) w = p[0]; if (p[0] > e) e = p[0]; if (p[1] < s) s = p[1]; if (p[1] > n) n = p[1]; }
    if (e < b.w || w > b.e || n < b.s || s > b.n) return [];
    if (w >= b.w && e <= b.e && s >= b.s && n <= b.n) return ring;
    let uit = ring;
    for (const [as, grens, teken] of [[0, b.w, 1], [0, b.e, -1], [1, b.s, 1], [1, b.n, -1]]) {
      const inn = uit; uit = [];
      if (!inn.length) break;
      let v = inn[inn.length - 1];
      for (const p of inn) {
        const pin = (p[as] - grens) * teken >= 0, vin = (v[as] - grens) * teken >= 0;
        if (pin !== vin) { const t = (grens - v[as]) / (p[as] - v[as]); const q = [v[0] + (p[0] - v[0]) * t, v[1] + (p[1] - v[1]) * t]; q[as] = grens; uit.push(q); }
        if (pin) uit.push(p);
        v = p;
      }
    }
    return uit;
  }
  // Een lijn [[lon, lat], …] tegen een rechthoek: geeft de stukken die erbinnen vallen.
  function knipLijn(lijn, b) {
    const uit = []; let stuk = null;
    for (let i = 1; i < lijn.length; i++) {
      const a = lijn[i - 1], c = lijn[i], dx = c[0] - a[0], dy = c[1] - a[1];
      let t0 = 0, t1 = 1, ok = true;
      for (const [p, q] of [[-dx, a[0] - b.w], [dx, b.e - a[0]], [-dy, a[1] - b.s], [dy, b.n - a[1]]]) {
        if (p === 0) { if (q < 0) { ok = false; break; } } else { const r = q / p; if (p < 0) { if (r > t1) { ok = false; break; } if (r > t0) t0 = r; } else { if (r < t0) { ok = false; break; } if (r < t1) t1 = r; } }
      }
      if (!ok) { stuk = null; continue; }
      const p0 = [a[0] + dx * t0, a[1] + dy * t0], p1 = [a[0] + dx * t1, a[1] + dy * t1];
      if (!stuk || t0 > 0) { stuk = [p0]; uit.push(stuk); }
      stuk.push(p1);
      if (t1 < 1) stuk = null;
    }
    return uit;
  }
  // Douglas–Peucker: punten weglaten die minder dan tol van de lijn afwijken.
  function vereenvoudig(pts, tol) {
    if (pts.length < 3 || !(tol > 0)) return pts;
    const houd = new Uint8Array(pts.length); houd[0] = houd[pts.length - 1] = 1;
    const stapel = [[0, pts.length - 1]];
    while (stapel.length) {
      const [a, b] = stapel.pop(); let max = 0, idx = -1;
      const ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, l2 = dx * dx + dy * dy;
      for (let i = a + 1; i < b; i++) {
        const px = pts[i][0] - ax, py = pts[i][1] - ay, t = l2 ? Math.max(0, Math.min(1, (px * dx + py * dy) / l2)) : 0;
        const d = Math.hypot(px - dx * t, py - dy * t);
        if (d > max) { max = d; idx = i; }
      }
      if (max > tol && idx > 0) { houd[idx] = 1; stapel.push([a, idx], [idx, b]); }
    }
    return pts.filter((_, i) => houd[i]);
  }

  // ---------- ondergrond ----------
  const ringenVan = (g) => (!g ? [] : g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);
  const lijnenVan = (g) => (!g ? [] : g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : []);
  // Eén eenvoudige vorm voor de ondergrond, uit geo.json en toen.json: het landschap van toen. Meren en stuwmeren die
  // er toen niet (zo) waren, vallen weg (toen.weg, toen.wegRivier); wat onzeker is, blijft apart (onzeker, rand).
  function basisVan(geo, toen) {
    const t = toen || {}, weg = new Set(t.weg || []), wegR = new Set(t.wegRivier || []);
    const veel = (lijst, fn) => (lijst || []).flatMap((f) => fn(f.geometry));
    return {
      land: ringenVan(geo.land && geo.land.geometry),
      streken: (geo.regions || []).map((f) => ({ k: f.properties.k, r: ringenVan(f.geometry) })),
      meren: veel((geo.lakes || []).filter((f) => !(toen && weg.has(f.properties.n))), ringenVan),
      rivieren: veel((geo.rivers || []).filter((f) => !(toen && wegR.has(f.properties.n))), lijnenVan).concat(veel((t.rivieren || []).filter((f) => f.properties.vast), lijnenVan)),
      beken: KLEINE_RIVIEREN.map((r) => r.p.map((p) => [p[1], p[0]])),
      toenZee: veel(t.zee, ringenVan), toenMeer: veel(t.meren, ringenVan), onzeker: veel(t.onzeker, ringenVan),
      toenKust: veel(t.kust, lijnenVan), rand: veel(t.rand, lijnenVan), toenRivier: veel((t.rivieren || []).filter((f) => !f.properties.vast), lijnenVan),
      toen: !!toen,
    };
  }
  const VLAKKEN = ["land", "meren", "toenZee", "toenMeer", "onzeker"], LIJNEN = ["rivieren", "beken", "toenKust", "rand", "toenRivier"];
  // De ondergrond voor het losse bestand: alleen wat binnen het gebied valt, vereenvoudigd en afgerond.
  function knipBasis(basis, box, tol) {
    const rond = (pts) => pts.map((p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000]);
    const vlak = (ringen) => ringen.map((r) => vereenvoudig(knipRing(r, box), tol)).filter((r) => r.length > 2).map(rond);
    const lijn = (lijnen) => lijnen.flatMap((l) => knipLijn(l, box)).map((l) => vereenvoudig(l, tol)).filter((l) => l.length > 1).map(rond);
    const uit = { toen: basis.toen, streken: basis.streken.map((s) => ({ k: s.k, r: vlak(s.r) })).filter((s) => s.r.length) };
    VLAKKEN.forEach((k) => { uit[k] = vlak(basis[k] || []); });
    LIJNEN.forEach((k) => { uit[k] = lijn(basis[k] || []); });
    return uit;
  }

  // ---------- namen plaatsen ----------
  const SMAL = "iljtfrI.,:;'’‘!|()[]- ", BREED = "mwMW";
  // Geschatte breedte van een naam (zonder browser). De pagina geeft een echte meting mee (opties.meet).
  function schat(t, fs, vet) {
    let n = 0;
    for (const ch of String(t)) n += SMAL.includes(ch) ? 0.33 : BREED.includes(ch) ? 0.88 : ch >= "A" && ch <= "Z" ? 0.68 : 0.57;
    return n * fs * (vet ? 1.05 : 1);
  }
  const raakt = (a, b, sp) => a[0] < b[0] + b[2] + sp && b[0] < a[0] + a[2] + sp && a[1] < b[1] + b[3] + sp && b[1] < a[1] + a[3] + sp;
  const dekt = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
  // Snijdt het lijnstuk (x1,y1)–(x2,y2) de rechthoek r?
  function lijnRaakt(x1, y1, x2, y2, r) {
    let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
    for (const [p, q] of [[-dx, x1 - r[0]], [dx, r[0] + r[2] - x1], [-dy, y1 - r[1]], [dy, r[1] + r[3] - y1]]) {
      if (p === 0) { if (q < 0) return false; } else { const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } }
    }
    return true;
  }

  // ---------- tekenen ----------
  // kaart: wat er op deze kaart hoort (zie boekje-inhoud.js): { at, r, eerder, ctx, alt, kon, stralen, kijk, later, zoom, view, overzicht }
  // ctx:   { basis, plaatsen, routes } — de ondergrond, de plaatsen (id → { n, ll, c, s, t, alt, ctx, k }) en alle routes.
  // o:     { W, H, fs (lettergrootte van een plaatsnaam), id (uniek per kaart), nt, niveau, meet(tekst, fs, vet) }
  // Geeft { svg, routes: [{ i, pts, recon, len }], legenda: [..], box, label } terug.
  function teken(kaart, ctx, o) {
    const W = o.W, H = o.H, fs = o.fs || 15, m = fs / 13, id = o.id || "k", P = ctx.plaatsen || {}, R = ctx.routes || [];
    const meet = o.meet || schat, simpel = o.niveau === "a";
    const ll = (x) => (Array.isArray(x) ? x : P[x] ? P[x].ll : null);
    const actief = (kaart.r || []).map((i) => ({ i, ...R[i] })).filter((r) => r.pts && !(simpel && r.w === "rood"));
    const eerder = (kaart.eerder || []).map((i) => R[i]).filter((r) => r && r.w !== "rood");
    const at = (kaart.at || []).filter((x) => P[x]);
    // Namen langs de route: begin en eind altijd, tussenpunten als ze een plaats zijn (niet op niveau a).
    const eind = [], langs = [];
    actief.forEach((r) => r.ids.forEach((x, j) => { if (!x || !P[x] || (P[x].k && !kaart.kon)) return; (j === 0 || j === r.ids.length - 1 ? eind : langs).push(x); }));
    const ctxIds = simpel ? [] : (kaart.ctx || []).filter((x) => P[x]);
    const kon = kaart.kon ? Object.keys(P).filter((x) => P[x].k) : [];

    // Uitsnede: wat de stap nodig heeft, met marge; één plaats krijgt de streek eromheen (zoals het zoomniveau van de atlas).
    let pts = actief.flatMap((r) => r.pts).concat(at.map(ll));
    if (kaart.stralen) { const b = kaart.stralen; pts = [[b[0] + 0.8, b[1] - 1], [b[0] - 0.8, b[1] + 1]]; }
    if (kaart.later) pts = pts.concat(kaart.later.pts);
    if (kaart.kijk) pts = pts.concat([kaart.kijk.a, kaart.kijk.b]);
    if (kaart.overzicht) pts = pts.concat(eerder.flatMap((r) => r.pts));
    // Zoals de atlas (hooguit zoom 9 bij een stap), maar een korte reis mag iets dichterbij: dan is de lijn te zien.
    let minLon = breedteBijZoom(kaart.zoom || (actief.length && !kaart.overzicht ? 9.75 : 9));
    if (!pts.length) { const v = kaart.view; pts = Array.isArray(v) ? v : v === "kanaan" ? KANAAN : WIJD; minLon = 1; }
    const aspect = W / H;
    // Ruimte voor de namen aan de rand: de marge groeit mee met de lettergrootte.
    const marge = Math.min(0.32, 0.12 + (fs * 5.5) / Math.min(W, H * aspect));
    const box = uitsnede(pts, { aspect, marge, minLon });
    const pr = projectie(box, W, H);
    const zoom = zoomVan(box);
    const ruim = { w: box.w - (box.e - box.w) * 0.06, e: box.e + (box.e - box.w) * 0.06, s: latVan(mercY(box.s) - (mercY(box.n) - mercY(box.s)) * 0.06), n: latVan(mercY(box.n) + (mercY(box.n) - mercY(box.s)) * 0.06) };

    // Ondergrond.
    const pad = (pp, dicht) => {
      let d = "", lx = null, ly = null;
      pp.forEach((p, i) => { const x = pr.x(p[0]), y = pr.y(p[1]); if (i && i < pp.length - 1 && Math.abs(x - lx) < 0.5 && Math.abs(y - ly) < 0.5) return; d += (i ? "L" : "M") + f1(x) + " " + f1(y); lx = x; ly = y; });
      return d + (dicht ? "Z" : "");
    };
    const B = ctx.basis || {}, tol = 0.6 / pr.kx;
    const vlak = (ringen) => (ringen || []).map((r) => vereenvoudig(knipRing(r, ruim), tol)).filter((r) => r.length > 2).map((r) => pad(r, true)).join("");
    const lijn = (lijnen) => (lijnen || []).flatMap((l) => knipLijn(l, ruim)).map((l) => vereenvoudig(l, tol)).filter((l) => l.length > 1).map((l) => pad(l, false)).join("");
    const deel = (cls, d, extra) => (d ? `<path class="${cls}" d="${d}"${extra || ""}/>` : "");
    const land = vlak(B.land);
    let s = `<rect class="bk-zee" width="${W}" height="${H}"/>`;
    // Het land één keer als vorm, twee keer gebruikt: eerst de zachte gloed langs de kust, dan het land zelf.
    s += land ? `<defs><path id="${id}-land" d="${land}"/></defs><use href="#${id}-land" class="bk-landgloed"/><use href="#${id}-land" class="bk-land"/>` : "";
    (B.streken || []).forEach((g) => { s += deel("bk-streek bk-st-" + g.k, vlak(g.r)); });
    s += deel("bk-onzeker", vlak(B.onzeker)) + deel("bk-meer bk-toenmeer", vlak(B.toenMeer)) + deel("bk-toenzee", vlak(B.toenZee)) + deel("bk-meer", vlak(B.meren));
    s += deel("bk-rivier", lijn(B.rivieren)) + deel("bk-rivier bk-beek", lijn(B.beken)) + deel("bk-rivier bk-toenrivier", lijn(B.toenRivier)) + deel("bk-toenkust", lijn(B.toenKust)) + deel("bk-rand", lijn(B.rand));

    // Routes: eerdere stappen dun op de achtergrond, de route van deze stap met rand, pijlpunt en beginring.
    const xy = (p) => pr.pt(p);
    const lijnPad = (q) => q.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])).join("");
    const k = m * (o.lijn || 1), hinderLijn = [], hinderVak = [], uitRoutes = [];
    let routes = "", koppen = "";
    eerder.forEach((r) => { const q = r.pts.map(xy); routes += `<path class="bk-rt bk-eerder${r.recon ? " recon" : ""}" style="--rk:${kleur(r.w)};stroke-width:${f1(3 * k)}" stroke-dasharray="${r.recon ? f1(8 * k) + " " + f1(7 * k) : "none"}" d="${lijnPad(q)}"/>`; for (let i = 1; i < q.length; i++) hinderLijn.push([q[i - 1][0], q[i - 1][1], q[i][0], q[i][1], 0]); });
    // In de presentatie tekent de route zich: een masker met dezelfde lijn loopt van begin tot eind (boekje.css,
    // .bk-loopt); de routes van een stap na elkaar, de pijlpunt komt aan het eind. Zonder anim staat alles meteen.
    let vorigEind = null, klok = 0.35, maskers = "";
    actief.forEach((r, n) => {
      const q = r.pts.map(xy), d = lijnPad(q), cum = [0];
      for (let i = 1; i < q.length; i++) { cum.push(cum[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1])); hinderLijn.push([q[i - 1][0], q[i - 1][1], q[i][0], q[i][1], 1]); }
      const len = cum[cum.length - 1], klein = kaart.overzicht ? 0.72 : 1;
      const duur = Math.min(3.4, 0.7 + len / 520), na = klok + duur;
      if (o.anim) maskers += `<mask id="${id}-m${n}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="${W + 40}" height="${H + 40}"><path class="bk-maskpad" pathLength="1" style="stroke-width:${f1(40 * k)};animation-delay:${klok.toFixed(2)}s;animation-duration:${duur.toFixed(2)}s" d="${d}"/></mask>`;
      routes += `<g class="bk-route${r.recon ? " recon" : ""}${r.w === "rood" ? " rood" : ""}" data-route="${n}" style="--rk:${kleur(r.w)}"${o.anim ? ` mask="url(#${id}-m${n})"` : ""}><path class="bk-rt bk-donker-rt" style="stroke-width:${f1(10.5 * k * klein)}" d="${d}"/><path class="bk-rt bk-rand-rt" style="stroke-width:${f1(8.5 * k * klein)}" d="${d}"/><path class="bk-rt bk-lijn" style="stroke-width:${f1(4.6 * k * klein)}" stroke-dasharray="${r.recon ? f1(9 * k) + " " + f1(7 * k) : "none"}" d="${d}"/></g>`;
      // Pijlpunt aan het eind, in de looprichting; op een lange route ook een pijl halverwege.
      const hoekOp = (afstand) => { let j = 1; while (j < cum.length - 1 && cum[j] < afstand) j++; const a = q[j - 1], b = q[j], t = Math.max(0, Math.min(1, (afstand - cum[j - 1]) / (cum[j] - cum[j - 1] || 1))); return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, h: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI }; };
      const pijl = (c, cls) => `<path class="bk-pijl ${cls}" style="--rk:${kleur(r.w)}" transform="translate(${f1(c.x)} ${f1(c.y)}) rotate(${f1(c.h)}) scale(${f1(k * klein)})" d="M-13-7.5 3 0-13 7.5-9 0z"/>`;
      if (len > 6) {
        const e = hoekOp(len);
        if (len > 300 * k && !kaart.overzicht) { const h = hoekOp(len * 0.5); koppen += pijl(h, "bk-pijl-half"); }
        koppen += `<g data-kop="${n}" class="bk-anim" style="animation-delay:${na.toFixed(2)}s">${pijl(e, "bk-pijl-eind")}</g>`;
        hinderVak.push([e.x - 11 * k, e.y - 11 * k, 22 * k, 22 * k]);
      }
      // Beginring: waar de route begint (niet als ze verdergaat waar de vorige ophield).
      if (!kaart.overzicht && (!vorigEind || Math.hypot(q[0][0] - vorigEind[0], q[0][1] - vorigEind[1]) > 3)) { routes += `<circle class="bk-begin" style="--rk:${kleur(r.w)};stroke-width:${f1(2.6 * k)}" data-begin="${n}" cx="${f1(q[0][0])}" cy="${f1(q[0][1])}" r="${f1(10.5 * k)}"/>`; }
      vorigEind = q[q.length - 1]; klok = na + 0.15;
      uitRoutes.push({ n, pts: q.map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]), len, recon: !!r.recon, w: r.w });
    });

    // Bijzondere lijnen van een stap: vier windrichtingen, een kijklijn, een stippellijn naar later.
    let extra = ""; const borden = [];
    const bord = (p, t, cls) => { if (!t) return; const w = meet(t, fs * 0.82, true) + fs * 0.9, h = fs * 1.5; borden.push({ x: p[0], y: p[1], w, h, t, cls }); };
    if (kaart.stralen) { const b = kaart.stralen; [["noord", [b[0] + 0.75, b[1]]], ["zuid", [b[0] - 0.75, b[1]]], ["oost", [b[0], b[1] + 0.9]], ["west", [b[0], b[1] - 0.9]]].forEach(([t, e]) => { extra += `<path class="bk-straal" style="stroke-width:${f1(2.5 * k)}" d="${lijnPad([xy(b), xy(e)])}"/>`; bord(xy(e), t, ""); }); }
    if (kaart.kijk) { const a = xy(kaart.kijk.a), b = xy(kaart.kijk.b); extra += `<path class="bk-straal bk-kijk" style="stroke-width:${f1(2.5 * k)}" d="${lijnPad([a, b])}"/>`; bord([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - fs], kaart.kijk.t, "bk-kijk"); }
    if (kaart.later) { const q = kaart.later.pts.map(xy); extra += `<path class="bk-straal" style="stroke-width:${f1(2.5 * k)}" d="${lijnPad(q)}"/>`; bord(xy(kaart.later.at || kaart.later.pts[Math.floor(kaart.later.pts.length / 2)]), kaart.later.lab, ""); }
    borden.forEach((b) => { b.x = Math.max(b.w / 2 + 4, Math.min(W - b.w / 2 - 4, b.x)); b.y = Math.max(b.h / 2 + 4, Math.min(H - b.h / 2 - 4, b.y)); hinderVak.push([b.x - b.w / 2, b.y - b.h / 2, b.w, b.h]); });

    // Schaalstok en, bij een reconstructie, het bijschrift: vaste plekken waar geen naam overheen mag.
    const mooi = (km) => { const p = Math.pow(10, Math.floor(Math.log10(km))), n = km / p; return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p; };
    const km = mooi(Math.max(1, pr.kmPerPx * W * 0.22)), balk = km / pr.kmPerPx, sx = fs * 0.9, sy = H - fs * 0.95;
    const kmTekst = km.toLocaleString("nl-NL") + " km";
    hinderVak.push([sx - 4, sy - fs * 1.5, Math.max(balk, meet(kmTekst, fs * 0.8)) + 12, fs * 1.9]);
    const heeftRecon = actief.some((r) => r.recon) || (kaart.overzicht && eerder.some((r) => r.recon));
    let sleutel = "";
    if (heeftRecon) {
      const t = "reconstructie", tw = meet(t, fs * 0.82), lw = fs * 2.3, bw = tw + lw + fs * 1.3, bh = fs * 1.55, bx = W - bw - fs * 0.5, by = H - bh - fs * 0.5;
      sleutel = `<g class="bk-sleutel"><rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(fs * 0.3)}"/><path class="bk-rt" style="stroke-width:${f1(3.4 * k)}" stroke-dasharray="${f1(6 * k)} ${f1(5 * k)}" d="M${f1(bx + fs * 0.45)} ${f1(by + bh / 2)}h${f1(lw)}"/><text x="${f1(bx + fs * 0.75 + lw)}" y="${f1(by + bh / 2 + fs * 0.29)}" font-size="${f1(fs * 0.82)}">${t}</text></g>`;
      hinderVak.push([bx, by, bw, bh]);
    }

    // Plaatsen: de plaatsen van de stap en de begin- en eindpunten van de route met een vette naam; plaatsen langs de
    // route, de vaste omgeving van het deel en de andere mogelijke plekken klein. De zekerheid blijft zichtbaar.
    const gezien = new Set(), stippen = [], namen = [], legenda = new Set();
    const voeg = (x, rol) => {
      if (gezien.has(x) || !P[x]) return; gezien.add(x);
      const p = P[x], q = xy(p.ll);
      if (q[0] < -20 || q[1] < -20 || q[0] > W + 20 || q[1] > H + 20) return;
      const c = zekerheid(p), hoofd = rol === "at" || rol === "eind", klein = rol === "ctx" || p.ctx;
      const naam = p.n;
      if (c === "o" && !p.ctx) { const r = 15 * m; stippen.push(`<g class="bk-vaag" data-plaats="${esc(x)}"><circle cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(r)}" style="stroke-width:${f1(1.5 * m)}" stroke-dasharray="${f1(4 * m)} ${f1(3 * m)}"/><text x="${f1(q[0])}" y="${f1(q[1] + fs * 0.36)}" font-size="${f1(fs * 1.05)}" text-anchor="middle">?</text></g>`); hinderVak.push([q[0] - r, q[1] - r, 2 * r, 2 * r]); namen.push({ x: q[0], y: q[1], r, t: naam, fs: hoofd ? fs * 1.12 : fs, vet: hoofd, pr: hoofd ? 3 : 2, kant: p.s || "r", moet: hoofd, cls: hoofd ? "aan" : "", id: x }); legenda.add("o"); return; }
      if (c === "r") { const rx = 38 * m, ry = 24 * m; stippen.push(`<ellipse class="bk-gebied" data-plaats="${esc(x)}" cx="${f1(q[0])}" cy="${f1(q[1])}" rx="${f1(rx)}" ry="${f1(ry)}"/>`); namen.push({ x: q[0], y: q[1], r: 0, t: naam, fs: hoofd ? fs * 1.12 : fs, vet: hoofd, pr: hoofd ? 3 : 2, kant: "c", moet: hoofd, cls: "gebied" + (hoofd ? " aan" : ""), id: x }); legenda.add("r"); return; }
      const soort = p.ctx ? "ctx" : p.t || "stad", sc = m * (klein ? 0.75 : hoofd ? 1.25 : 1), r = 6 * sc;
      stippen.push(`<g class="bk-pin t-${soort} ${p.ctx ? "ctx" : "c-" + c}${p.k ? " k" : ""}" data-plaats="${esc(x)}" data-zeker="${c}" transform="translate(${f1(q[0] - 7 * sc)} ${f1(q[1] - 7 * sc)}) scale(${f1(sc)})">${PIN[soort] || PIN.stad}</g>`);
      hinderVak.push([q[0] - r, q[1] - r, 2 * r, 2 * r]);
      namen.push({ x: q[0], y: q[1], r, t: naam, fs: hoofd ? fs * 1.12 : klein ? fs * 0.86 : fs * 0.94, vet: hoofd, pr: hoofd ? (rol === "eind" ? 3.2 : 3) : klein ? 1 : 2, kant: p.s || "r", moet: hoofd, cls: hoofd ? "aan" : klein ? "ctx" : p.k ? "k" : "", id: x });
      if (c === "w" || c === "b") legenda.add("w");
      if (c === "b" && p.alt && kaart.alt && !simpel && hoofd) p.alt.forEach((a) => { const z = xy([a[0], a[1]]), ar = 5.5 * m; if (z[0] < 0 || z[1] < 0 || z[0] > W || z[1] > H) return; stippen.push(`<circle class="bk-alt" cx="${f1(z[0])}" cy="${f1(z[1])}" r="${f1(ar)}" style="stroke-width:${f1(2 * m)}"/>`); hinderVak.push([z[0] - ar, z[1] - ar, 2 * ar, 2 * ar]); namen.push({ x: z[0], y: z[1], r: ar, t: a[2] || "andere mogelijke plek", fs: fs * 0.8, vet: false, pr: 0.8, kant: "r", cls: "alt" }); legenda.add("alt"); });
    };
    // Overzichtskaart: alleen het begin en het eind van de hele tocht moeten er staan; de andere plaatsen als ze passen.
    if (kaart.overzicht) {
      const rr = actief.filter((r) => r.w !== "rood"), kern = [rr.length && rr[0].ids[0], rr.length && rr[rr.length - 1].ids.slice(-1)[0]].filter((x) => x && P[x]);
      (kern.length ? kern : at.slice(0, 2)).forEach((x) => voeg(x, "eind"));
      at.concat(eind).forEach((x) => voeg(x, "langs"));
    } else { eind.forEach((x) => voeg(x, "eind")); at.forEach((x) => voeg(x, "at")); }
    if (!simpel) langs.forEach((x) => voeg(x, "langs"));
    kon.forEach((x) => voeg(x, "langs"));
    (kaart.ook || []).forEach((x) => voeg(x, "langs"));
    ctxIds.forEach((x) => voeg(x, "ctx"));
    if (heeftRecon) legenda.add("recon");
    if (eerder.length && !kaart.overzicht) legenda.add("eerder");

    // Namen van streken en zeeën, zoals de atlas ze op dit zoomniveau toont: laagste voorrang.
    const tijd = o.nt ? "nt" : "ot", plaatsNamen = new Set(namen.map((n) => n.t));
    REGIONS.forEach((g) => {
      if (zoom < g.z[0] - 0.6 || zoom > g.z[1] + 0.6 || (g.tijd && g.tijd !== tijd) || plaatsNamen.has(g.t) || (/toen/.test(g.k) && !B.toen)) return;
      const q = xy(g.ll); if (q[0] < 0 || q[1] < 0 || q[0] > W || q[1] > H) return;
      const zee = /sea/.test(g.k);
      namen.push({ x: q[0], y: q[1], r: 0, t: zee ? g.t : g.t.toUpperCase(), toon: g.t, fs: zee ? fs * 0.98 : fs * 0.72, vet: false, pr: 0, kant: "c", cls: zee ? "zee" : "streek", sp: zee ? 0.03 : 0.26 });
    });

    // Botsingsvrij plaatsen: eerst wat moet (begin, eind, de plaatsen van de stap), dan de rest; een naam die nergens
    // past zonder een andere naam, een stip of de route te raken, vervalt (behalve wat moet: die krijgt de beste plek).
    namen.sort((a, b) => b.pr - a.pr);
    const gezet = [];
    const KANTEN = ["r", "l", "t", "b", "tr", "br", "tl", "bl"];
    let teksten = "";
    namen.forEach((n) => {
      const w = meet(n.t, n.fs, n.vet) * (1 + (n.sp || 0) * 1.6) + 2, h = n.fs * 1.18, g = Math.max(3, n.fs * 0.28), r = n.r;
      const plek = (kant, dy, ver) => {
        const r = n.r + (ver || 0);
        if (kant === "c") return [n.x - w / 2, n.y - h / 2 + (dy || 0)];
        if (kant === "r") return [n.x + r + g, n.y - h / 2];
        if (kant === "l") return [n.x - r - g - w, n.y - h / 2];
        if (kant === "t") return [n.x - w / 2, n.y - r - g - h];
        if (kant === "b") return [n.x - w / 2, n.y + r + g];
        const dx = kant[1] === "r" ? r * 0.75 + g * 0.6 : -r * 0.75 - g * 0.6 - w;
        return [n.x + dx, kant[0] === "t" ? n.y - r * 0.75 - h : n.y + r * 0.75];
      };
      const opties = n.kant === "c" ? [["c", 0], ["c", -h - 3], ["c", h + 3], ["c", -2 * h - 4], ["c", 2 * h + 4]] : [n.kant].concat(KANTEN.filter((x) => x !== n.kant)).map((x) => [x, 0]);
      // Een naam die er moet staan (begin, eind, de plaatsen van de stap) mag verder weg, met een lijntje naar zijn plek.
      if (n.moet && n.kant !== "c") (W < 560 ? [1.4] : [1.5, 2.8]).forEach((f) => KANTEN.forEach((x) => opties.push([x, 0, h * f])));
      let beste = null;
      opties.forEach(([kant, dy, ver], i) => {
        const [x, y] = plek(kant, dy, ver), vak = [x, y, w, h];
        let kost = ver ? 60 + ver * 2 : i * 4;
        if (x < 3 || y < 3 || x + w > W - 3 || y + h > H - 3) kost += 5000 + Math.max(0, 3 - x, 3 - y, x + w - W + 3, y + h - H + 3) * 20;
        gezet.forEach((q) => { if (raakt(vak, q, 2)) kost += 2000 + dekt(vak, q); });
        hinderVak.forEach((q) => { if (raakt(vak, q, 1) && !(n.kant === "c" && n.r === 0 && n.cls.includes("gebied") && Math.abs(q[0] + q[2] / 2 - n.x) < 1)) kost += 1500 + dekt(vak, q); });
        hinderLijn.forEach((l) => { if (lijnRaakt(l[0], l[1], l[2], l[3], [x - 2, y - 1, w + 4, h + 2])) kost += l[4] ? 900 : 60; });
        if (ver) hinderVak.forEach((q) => { if (lijnRaakt(n.x, n.y, x + w / 2, y + h / 2, q) && !(q[0] <= n.x && n.x <= q[0] + q[2] && q[1] <= n.y && n.y <= q[1] + q[3])) kost += 300; });
        if (!beste || kost < beste.kost) beste = { kost, x, y, kant, ver };
      });
      if (!beste || (beste.kost >= 800 && !n.moet)) return;
      gezet.push([beste.x, beste.y, w, h]);
      if (beste.ver) { const ex = Math.max(beste.x, Math.min(beste.x + w, n.x)), ey = Math.max(beste.y + h * 0.15, Math.min(beste.y + h * 0.85, n.y)), a = Math.atan2(ey - n.y, ex - n.x); teksten += `<path class="bk-wijzer" style="stroke-width:${f1(1.3 * m)}" d="M${f1(n.x + Math.cos(a) * (n.r + 2))} ${f1(n.y + Math.sin(a) * (n.r + 2))}L${f1(ex)} ${f1(ey)}"/>`; }
      const anker = n.kant === "c" ? "middle" : "start", tx = n.kant === "c" ? beste.x + w / 2 : beste.x + 1;
      teksten += `<text class="bk-naam ${n.cls}"${n.id ? ` data-naam="${esc(n.id)}"` : ""} x="${f1(tx)}" y="${f1(beste.y + h * 0.78)}" font-size="${f1(n.fs)}" text-anchor="${anker}"${n.sp ? ` letter-spacing="${f1(n.fs * n.sp)}"` : ""}>${esc(n.toon && n.cls === "zee" ? n.toon : n.t)}</text>`;
    });
    let bordSvg = "";
    borden.forEach((b) => { bordSvg += `<g class="bk-bord ${b.cls}"><rect x="${f1(b.x - b.w / 2)}" y="${f1(b.y - b.h / 2)}" width="${f1(b.w)}" height="${f1(b.h)}" rx="${f1(fs * 0.35)}"/><text x="${f1(b.x)}" y="${f1(b.y + fs * 0.29)}" font-size="${f1(fs * 0.82)}" text-anchor="middle">${esc(b.t)}</text></g>`; });

    const schaal = `<g class="bk-schaal"><path style="stroke-width:${f1(Math.max(1.5, 2 * m))}" d="M${f1(sx)} ${f1(sy - fs * 0.35)}v${f1(fs * 0.35)}h${f1(balk)}v${f1(-fs * 0.35)}"/><text x="${f1(sx + 2)}" y="${f1(sy - fs * 0.55)}" font-size="${f1(fs * 0.8)}">${kmTekst}</text></g>`;
    // Beschrijving voor wie de kaart niet ziet: de plaatsen en de route in woorden.
    const naamVan = (x) => (x && P[x] ? P[x].n.replace(/\?$/, "") : "");
    const tochten = actief.filter((r) => r.w !== "rood").map((r) => { const a = naamVan(r.ids[0]), b = naamVan(r.ids[r.ids.length - 1]); return a && b ? `van ${a} naar ${b}${r.recon ? " (reconstructie)" : ""}` : ""; }).filter(Boolean);
    const lijst = [...new Set(at.map(naamVan))];
    const label = kaart.overzicht ? `Overzichtskaart${lijst.length ? " met " + lijst.slice(0, 8).join(", ") : ""}.` : `Kaart${lijst.length ? " met " + lijst.join(", ") : ""}.${tochten.length ? " Route " + tochten.join("; ") + "." : ""}`;
    const svg = `<svg class="bk-kaart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" focusable="false" data-box="${[box.w, box.s, box.e, box.n].map((n) => n.toFixed(3)).join(",")}">` +
      `<defs><clipPath id="${id}-c"><rect width="${W}" height="${H}"/></clipPath>${maskers}</defs><g clip-path="url(#${id}-c)">${s}${routes}${extra}${koppen}${stippen.join("")}${teksten}${bordSvg}${sleutel}${schaal}</g></svg>`;
    return { svg, routes: uitRoutes, legenda: [...legenda], box, label, zoom, kmPerPx: pr.kmPerPx, duur: klok };
  }

  const api = { mercY, latVan, uitsnede, projectie, knipRing, knipLijn, vereenvoudig, basisVan, knipBasis, teken, schat, zoomVan, breedteBijZoom, zekerheid, BEREIK, WIJD, KANAAN, KLEINE_RIVIEREN, REGIONS, PIN };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  (global.BR = global.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} }).boekjeKaart = api;
})(typeof window !== "undefined" ? window : globalThis);
