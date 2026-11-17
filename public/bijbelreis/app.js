// Bijbelreis: de kaart, het reisboek, de speurtocht, de afstanden en het paspoort.
// Inhoud komt uit plaatsen.js en inhoud/*.js (BR.boeken). Geen externe bronnen: alles staat op deze site.
(() => {
  "use strict";
  // Verhuizing van het oude adres (martijndenbesten.com/bijbelreis): de voortgang komt één keer mee in het fragment
  // ‘#verhuis=…’ (zie verhuis.js). Eerst samenvoegen met wat hier al staat, dan de pagina gewoon opnieuw laden.
  if (/^#verhuis=/.test(location.hash)) { verhuisIn(); return; }
  async function verhuisIn() {
    const m = /^#verhuis=([jz])\.([A-Za-z0-9_-]+)(?:&naar=([^&]*))?$/.exec(location.hash);
    let naar = "";
    try {
      naar = m && m[3] ? decodeURIComponent(m[3]) : "";
      if (!/^[\w\-\/]{1,60}$/.test(naar)) naar = "";
      if (m && localStorage.getItem("bijbelreis:verhuisd") == null) {
        let bytes = Uint8Array.from(atob(m[2].replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
        if (m[1] === "z") bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
        verhuisSamenvoegen(JSON.parse(new TextDecoder().decode(bytes)));
        localStorage.setItem("bijbelreis:verhuisd", "true");
      }
    } catch { /* onleesbaar pakket of geen opslag: gewoon beginnen */ }
    history.replaceState(null, "", location.pathname + location.search + (naar ? "#" + naar : ""));
    location.reload();
  }
  // Niets gaat verloren en niets telt dubbel: stempels worden verenigd, van scores blijft de hoogste, en instellingen
  // (niveau, waar je was) komen alleen mee als hier nog niets staat.
  function verhuisSamenvoegen(oud) {
    const lees = (v) => { try { return JSON.parse(v); } catch { return undefined; } };
    const hoogste = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.max(a, b) : a ?? b);
    Object.entries(oud || {}).forEach(([k, ruw]) => {
      if (typeof ruw !== "string" || !/^[\w:.\-]{1,80}$/.test(k) || k === "verhuisd") return;
      const nieuw = lees(ruw), sleutel = "bijbelreis:" + k, hier = localStorage.getItem(sleutel), al = hier == null ? undefined : lees(hier);
      if (nieuw === undefined) return;
      let uit;
      if (al === undefined || al === null) uit = nieuw;
      else if (k === "gezien" && Array.isArray(al) && Array.isArray(nieuw)) uit = [...new Set(al.concat(nieuw))];
      else if (/^(best|samen|speur):/.test(k)) uit = hoogste(al, nieuw);
      else if (k === "verhalen" && typeof al === "object" && nieuw && typeof nieuw === "object") {
        uit = { ...nieuw, ...al };
        Object.keys(nieuw).forEach((nr) => {
          const a = al[nr], b = nieuw[nr];
          if (!a || !b) return;
          const lv = { ...(b.lv || {}) }; Object.entries(a.lv || {}).forEach(([n, v]) => { lv[n] = hoogste(v, lv[n]); });
          uit[nr] = { ...b, ...a, ...(a.q != null || b.q != null ? { q: hoogste(a.q, b.q) } : {}), ...(Object.keys(lv).length ? { lv } : {}) };
        });
      } else return;
      localStorage.setItem(sleutel, JSON.stringify(uit));
    });
  }
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;
  const fmt = (n) => n.toLocaleString("nl-NL");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const store = {
    get(k, d) { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)); } catch { /* geen opslag: dan geen stempels */ } },
    weg(k) { try { localStorage.removeItem("bijbelreis:" + k); } catch { /* geen opslag */ } },
  };
  const color = (key) => `var(--${key}-deep, var(--${key}))`;
  // Voor tekst: de donkere variant (sommige kleuren hebben -deep, oker en zand -diep); routes en lijnen houden color().
  const tekstKleur = (key) => `var(--${key}-deep, var(--${key}-diep, var(--${key})))`;
  const GROUPS = new Set(["Discipelen", "Schare", "Apostelen", "Farizeeën", "Tollenaars", "Herders", "Wijzen", "Engelen", "Overpriesters", "Schriftgeleerden", "Leraren", "Sadduceeën", "Wachters", "Moordenaars", "Broeders", "Ouderlingen", "Weduwen", "Reisgenoten", "Bemanning", "Eilanders", "Joden", "Melaatsen", "Handelaars", "Raad", "Oudsten", "Gemeente", "Ouders", "Mannen", "Bezoekers", "Koningen", "Broers", "Kinderen", "Familie", "Mensen", "Volk", "Soldaten", "Leger", "Spionnen", "Vrouwen", "Priesters", "Profeten", "Vijanden", "Knechten", "Boden", "Zonen", "Dochters", "Levieten", "Zangers"]);

  // ---------- rekenen ----------
  function hav(a, b) {
    const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }
  const len = (p) => p.slice(1).reduce((s, q, i) => s + hav(p[i], q), 0);
  const roundKm = (km) => (km < 100 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10);
  // Gegevensbestanden die app.js zelf ophaalt, krijgen het versienummer (inhoudshash) uit de pagina, zodat na een nieuwe
  // versie geen oude kaart of oude Bijbeltekst uit de browsercache komt (zie scripts/postbuild.mjs).
  const DV = (() => { try { return JSON.parse(document.querySelector('meta[name="bijbelreis-data"]').content); } catch { return {}; } })();
  const dataUrl = (p) => "/bijbelreis/" + p + (DV[p] ? "?v=" + DV[p] : "");
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
  // Thema’s (een boek met `thema`, nu alleen Kerst) zijn geen Bijbelboek: ze staan onder een eigen kopje ‘Thema’s’, niet
  // in de boekenrij of tussen de 66 boeken, en hun delen vormen één eigen, doorlopende reis. Regels en besluiten:
  // docs/bijbelreis-kerst/README.md. THEMA_UI bevat alleen de vaste woorden van de bediening, geen inhoud.
  const BIJBELBOEKEN = BOEKEN.filter((b) => !b.thema), THEMAS = BOEKEN.filter((b) => b.thema);
  const THEMA_UI = {
    kerst: {
      kort: "Kerst", reis: "de kerstreis",
      zin: "Van Adam langs het geslachtsregister naar Bethlehem, waar de Heere Jezus geboren wordt, en verder tot Hij twaalf jaar is.",
      zinA: "Van Adam tot de geboorte van de Heere Jezus in Bethlehem.",
      einde: "Hier eindigt de kerstreis: van Adam tot Nazareth, waar de Heere Jezus opgroeit.",
      ook: ["https://raadkoord.nl/kerst", "Kerstliederen samen raden?", "Raadkoord Kerst", ", ook van Denckh"],
    },
  };
  const themaUi = (b) => (b && b.thema && THEMA_UI[b.thema]) || null;
  const boekKort = (b) => (themaUi(b) ? themaUi(b).kort : b.thema ? b.n.split(":")[0] : b.n);
  // De ster: het ene terugkerende teken van het thema Kerst (Mattheüs 2:2). Dezelfde vorm als --kerst-ster in bijbelreis.css.
  const STER = '<svg class="kster" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 0 56 38 68 32 62 44 100 50 62 56 68 68 56 62 50 100 44 62 32 68 38 56 0 50 38 44 32 32 44 38z"/></svg>';
  // Seizoen: van de eerste adventszondag tot en met 6 januari staat Kerst extra in beeld (seizoen.js; de datum van het apparaat).
  const SEIZOEN = THEMAS.some((b) => b.thema === "kerst") && BR.seizoen && BR.seizoen.kerstTijd(new Date()) ? "kerst" : "";
  if (SEIZOEN) document.body.dataset.seizoen = SEIZOEN;
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
  // Verdiepende delen: een deel met bij: "<id>" werkt een stuk van een ander deel (het hoofddeel, in hetzelfde boek) van
  // dichtbij uit. Het krijgt geen eigen knop in de delenrij, maar staat onder zijn hoofddeel: als ingang in de intro en bij
  // de stappen die over hetzelfde Bijbelgedeelte gaan. Diepe links en stapsleutels blijven die van het deel zelf.
  const refBereik = (ref) => { const p = BR.parseRef && BR.parseRef(ref); return p ? p.ranges.map((r) => [r.slug, r.c1 * 1000 + r.v1, r.c2 * 1000 + r.v2]) : []; };
  const omvat = (a, b) => b.length > 0 && b.every(([sl, v, t]) => a.some(([sl2, v2, t2]) => sl === sl2 && v >= v2 && t <= t2)); // ligt b helemaal binnen a?
  ALLPARTS.forEach((d) => {
    const h = d.bij && d.boek.delen.find((x) => x.id === d.bij && !x.bij);
    if (!h) return;
    d.hoofd = h; (h.verdiep = h.verdiep || []).push(d);
    const vb = refBereik(d.ref);
    // Stappen van het hoofddeel over hetzelfde gedeelte: hun verwijzing valt binnen die van het verdiepende deel, of omgekeerd.
    const bij = h.steps.filter((s) => { const sb = refBereik(s.ref); return omvat(vb, sb) || omvat(sb, vb); });
    bij.forEach((s) => (s.verdiep = (s.verdiep || []).concat(d)));
    // Na de laatste stap gaat ‘Verder’ terug naar het hoofddeel: naar de stap ná dat gedeelte, anders naar de intro.
    d.verder = bij.length && bij[bij.length - 1].i + 1 < h.steps.length ? bij[bij.length - 1].i + 1 : -1;
  });
  const VOLG = ALLPARTS.filter((d) => !d.hoofd); // de volgorde van Vorige/Verder tussen delen
  // Een thema is een eigen reis: Vorige/Verder blijft binnen het thema, en de Bijbelboeken lopen niet door in een thema.
  const reeks = (d) => VOLG.filter((x) => (d.boek.thema ? x.boek === d.boek : !x.boek.thema));
  const volgendDeel = (d) => { const r = reeks(d); return r[r.indexOf(d) + 1] || null; };
  const vorigDeel = (d) => { const r = reeks(d), i = r.indexOf(d); return i > 0 ? r[i - 1] : null; };
  const metVerdiep = (delen) => delen.filter((d) => !d.hoofd).flatMap((d) => [d].concat(d.verdiep || []));
  const deelNaam = (d) => (d.hoofd ? `${d.hoofd.n} › ${d.n}` : d.n);
  const partKm = (d) => d.steps.reduce((a, s) => a + (s.r || []).filter((r) => r.w === d.c).reduce((b, r) => b + r.len, 0), 0);
  // Naar de kaart: op de telefoon scrolt de pagina naar de kaart; in de reis ís de kaart het scherm en gaat het stapblad
  // terug naar de korte stand.
  const scrollToMap = () => { if (!isNarrow()) return; if (bladAan()) bladZet(false); else document.querySelector(".mapwrap").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); };

  // ---------- kaart ----------
  const WIDE = [[29.0, 30.5], [38.6, 47.6]], KANAAN = [[30.9, 34.2], [33.4, 36.4]];
  // Zo ver zoomt de kaart hooguit zelf in bij een stap, een geschiedenis of een vraag. Bij 13 (en op de telefoon ook bij 12)
  // toonde de kaart alleen nog vage ondergrond, zonder de stad of streek eromheen: Golgotha zonder ‘Jeruzalem’ (telefoontest
  // 16-11-2026). Op de telefoon staat Jeruzalem er bij 11,5 weer bij; een groot scherm toont bij 12 al ruim 30 km. Mahanaïm
  // en Pniël (een halve kilometer uit elkaar) liggen bij beide nog los. Zelf inzoomen kan tot 13.
  const zoomStap = () => (isNarrow() ? 11.5 : 12);
  const map = L.map("map", { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 4, maxZoom: 13, attributionControl: false, maxBounds: [[22, 4], [47, 57]], maxBoundsViscosity: 0.8, zoomControl: false });
  L.control.zoom({ position: "topleft", zoomInTitle: "Inzoomen", zoomOutTitle: "Uitzoomen" }).addTo(map);
  L.control.scale({ imperial: false, maxWidth: 120, position: "bottomleft" }).addTo(map);
  map.fitBounds(WIDE, { padding: [20, 20] });
  // Lagen van onder naar boven: land en streken, reliëf (vermenigvuldigd), moderne grenzen, water, routes (overlayPane), plaatsen.
  [["basis", 250], ["relief", 300], ["water", 360], ["modern", 380], ["kader", 390]].forEach(([n, z]) => { map.createPane(n).style.zIndex = z; map.getPane(n).style.pointerEvents = "none"; });
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
    // Alleen in de stand Toen (toen.json): een meer dat er nu niet meer is, en een kust die niet zeker is.
    { t: "Hulameer", ll: [33.07, 35.72], z: [9.5, 12], k: "sea toen" }, { t: "zee rond 2000 v.Chr.?", ll: [30.85, 47.75], z: [6, 9], k: "sea toen" },
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
    const meerLagen = geo.lakes.map((f) => L.geoJSON(f, { pane: "water", interactive: false, className: "lake" }).addTo(map));
    const rivierLagen = geo.rivers.map((f) => L.geoJSON(f, { pane: "water", interactive: false, className: "river" }).addTo(map));
    KLEINE_RIVIEREN.forEach((r) => L.polyline(r.p, { pane: "water", className: "river klein", interactive: false }).addTo(map));
    // De rand van de kaartplaat: waar het land van de ondergrond ophoudt. Op de telefoon is de kaart in de reis zo hoog
    // dat het overzicht van een lange reis (Paulus naar Rome) verder reikt dan de ondergrond; daar ligt dan papier met een
    // kaderlijn, zoals een kaart in een atlas, in plaats van een zee waar het land recht is afgesneden. Alleen daar
    // zichtbaar (bijbelreis.css: .kader-buiten, .kader-rand).
    let w = 180, z = 90, o = -180, n = -90;
    const loop = (c) => { if (typeof c[0] === "number") { w = Math.min(w, c[0]); o = Math.max(o, c[0]); z = Math.min(z, c[1]); n = Math.max(n, c[1]); } else c.forEach(loop); };
    (geo.land.features || [geo.land]).forEach((f) => loop((f.geometry || f).coordinates));
    if (w < o && z < n) {
      L.polygon([[[-5, -40], [-5, 100], [72, 100], [72, -40]], [[z, w], [z, o], [n, o], [n, w]]], { pane: "kader", interactive: false, className: "kader-buiten" }).addTo(map);
      L.rectangle([[z, w], [n, o]], { pane: "kader", interactive: false, className: "kader-rand" }).addTo(map);
    }
    insetGeo = geo;
    geoReady = true;
    drawInset();
    drawToen(geo, meerLagen, rivierLagen);
  }
  // Het landschap van toen (toen.json): wat in de Bijbelse tijd anders was dan nu. geo.json is het landschap van vandaag.
  // In de stand Toen staan de dichtgeslibde baaien, de verdwenen meren en de oude Nijlarmen op de kaart en zijn de
  // meren en stuwmeren weg die er toen niet (zo) waren; in de stand Nu is het omgekeerd. De klassen alleen-toen en
  // alleen-nu regelen dat in bijbelreis.css. Laadt het bestand niet, dan toont de kaart in beide standen het landschap van nu.
  function drawToen(geo, meerLagen, rivierLagen) {
    fetch(dataUrl("toen.json")).then((r) => (r.ok ? r.json() : null)).then((t) => {
      if (!t) return;
      const teken = (lijst, cls, onder) => (lijst || []).forEach((f) => { const l = L.geoJSON(f, { pane: "water", interactive: false, className: cls }).addTo(map); if (onder) l.bringToBack(); });
      // Vlakken onder de meren en rivieren van geo.json; oevers en oude rivierarmen erbovenop.
      teken(t.onzeker, "alleen-toen toen-onzeker", true); teken(t.meren, "lake alleen-toen toen-meer", true); teken(t.zee, "alleen-toen toen-zee", true);
      teken(t.nu, "lake alleen-nu", true);
      teken(t.kust, "alleen-toen toen-oever"); teken(t.rand, "alleen-toen toen-rand"); teken((t.rivieren || []).filter((f) => f.properties.vast), "river alleen-toen"); teken((t.rivieren || []).filter((f) => !f.properties.vast), "river alleen-toen toen-rivier");
      const alleenNu = (namen, features, lagen) => { const weg = new Set(namen || []); features.forEach((f, i) => { if (weg.has(f.properties.n)) lagen[i].eachLayer((l) => { const el = l.getElement(); if (el) el.classList.add("alleen-nu"); }); }); };
      alleenNu(t.weg, geo.lakes, meerLagen); alleenNu(t.wegRivier, geo.rivers, rivierLagen);
      map.getContainer().classList.add("toen-geladen");
    }).catch(() => {});
  }
  // Reliëf (schaduw van bergen en dalen) en moderne grenzen zijn aanvullingen: als ze niet laden, werkt de kaart gewoon.
  fetch(dataUrl("relief.json")).then((r) => (r.ok ? r.json() : null)).then((rel) => {
    if (!rel) return;
    Object.values(rel).filter((o) => o && o.src && o.bounds).forEach((o) => L.imageOverlay(dataUrl(o.src.replace(/^\/bijbelreis\//, "")), o.bounds, { pane: "relief", interactive: false, className: "relief", alt: "" }).addTo(map));
  }).catch(() => {});
  // Stand ‘Nu’: landsgrenzen, landnamen en gebiedsnamen uit grenzen.json. Maatstaf (docs/bijbelreis-vandaag/README.md): een landnaam
  // krijgen alleen staten die Nederland erkent; een erkende landsgrens is een doorgetrokken lijn met een zachte band, een
  // bestandslijn of omstreden grens is gestippeld; omstreden gebieden staan er met hun gangbare Nederlandse naam, schuin gedrukt.
  const lyModern = L.layerGroup();
  const landNamen = [], gebiedNamen = [];
  let modernLoaded = false;
  function loadModern() {
    if (modernLoaded) return Promise.resolve();
    modernLoaded = true;
    return fetch(dataUrl("grenzen.json")).then((r) => r.json()).then((g) => {
      const feats = g.features || [], vast = (f) => f.properties.soort === "grens" || f.properties.soort === "onbepaald";
      const lijnen = (kies, cls) => L.geoJSON({ type: "FeatureCollection", features: feats.filter((f) => f.geometry.type === "LineString" && kies(f)) }, { pane: "modern", interactive: false, className: cls }).addTo(lyModern);
      // Kleine lijnen (minzoom 6: de Britse bases op Cyprus) pas van dichtbij.
      const grof = (f) => (f.properties.minzoom || 0) < 6;
      lijnen((f) => vast(f) && grof(f), "border band"); lijnen((f) => vast(f) && grof(f), "border"); lijnen((f) => vast(f) && !grof(f), "border fijn");
      lijnen((f) => !vast(f) && grof(f), "border omstreden"); lijnen((f) => !vast(f) && !grof(f), "border omstreden fijn");
      const naam = (f, cls) => L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { interactive: false, keyboard: false, zIndexOffset: -400, icon: icon(`<span class="${cls}">${esc(f.properties.naam)}</span>`) }).addTo(lyModern);
      feats.filter((f) => f.geometry.type === "Point").forEach((f) => {
        const q = f.properties;
        const ankers = q.ankers && q.ankers.length ? q.ankers : [[f.geometry.coordinates[1], f.geometry.coordinates[0], 0]];
        if (q.soort === "gebied") gebiedNamen.push({ m: naam(f, "gebied"), z: q.minzoom || 7, ankers });
        else landNamen.push({ m: naam(f, "country" + (q.rang <= 3 ? " groot" : "")), rang: q.rang || 9, ankers });
      });
    }).catch(() => { modernLoaded = false; toast("De moderne grenzen konden niet worden geladen."); });
  }
  // ---------- laag ‘Vandaag’ (alleen in de stand ‘Nu’) ----------
  // Wat is er nu op de plekken van de Bijbelreis? Gegevens: vandaag.js (BR.vandaag); regels: docs/bijbelreis-vandaag/README.md.
  // Een eigen bordje boven de plek (geen stip, zoals de Bijbelse plaatsen), zodat beide naast elkaar zichtbaar blijven.
  const VD = BR.vandaag || { peil: "", toelichting: "", plekken: [] };
  const lyVandaag = L.layerGroup(), vdMarkers = {};
  const vdLL = (x) => x.ll || (P[x.plaats] ? P[x.plaats].ll : null);
  const VD_BORD = '<svg viewBox="0 0 24 31" aria-hidden="true"><path class="b" d="M4 1.5h16A2.5 2.5 0 0 1 22.5 4v15a2.5 2.5 0 0 1-2.5 2.5h-4.4L12 29.5l-3.6-8H4A2.5 2.5 0 0 1 1.5 19V4A2.5 2.5 0 0 1 4 1.5z"/><path class="w" d="M6.2 7.2h11.6v10.2H6.2z"/><path class="s" d="M6.2 10.6h11.6M9.4 5.4v3.2M14.6 5.4v3.2"/></svg>';
  const vdBron = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
  // Het venster van een plek: op een breed scherm een tekstballon op de kaart, op een telefoon of tablet een blad van onderen
  // (de kaart is daar te klein voor de tekst).
  function vandaagTekst(x) {
    const bp = x.plaats && P[x.plaats];
    const bronnen = niveau === "c" && (x.bronnen || []).length ? `<p class="st">Bronnen: ${x.bronnen.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(vdBron(u))}</a>`).join(", ")}</p>` : "";
    return `<p class="label">Vandaag</p><p>${esc(x.vandaag)}</p><p class="label">In de Bijbel</p><p>${esc(x.bijbel)}</p><p class="vd-lees">Lees in je Bijbel: <b>${esc((x.refs || []).join(" · "))}</b></p>${bp ? `<button type="button" class="btn small" data-place="${esc(x.plaats)}">${esc(bp.n.replace(/\?$/, ""))} in de Bijbelreis</button>` : ""}<p class="st">Peildatum: ${esc(VD.peil)}. De atlas kiest geen partij.</p>${bronnen}`;
  }
  let vdOpen = null;
  const vdBallon = L.popup({ maxWidth: 320, offset: [0, -24], autoPanPaddingTopLeft: [50, 150], autoPanPaddingBottomRight: [20, 90] });
  vdBallon.on("remove", () => { vdOpen = null; });
  function openVandaag(x) {
    if (isNarrow()) {
      map.closePopup();
      $("vvLand").textContent = x.land; $("vvTitel").textContent = x.n; $("vvTekst").innerHTML = vandaagTekst(x);
      openLade("vandaagVenster"); return;
    }
    vdBallon.setLatLng(vdMarkers[x.id].getLatLng()).setContent(`<div class="pop vdpop" tabindex="0" role="group" aria-label="Vandaag: ${esc(x.n)}"><p class="vd-waar">${esc(x.land)}</p><h3>${esc(x.n)}</h3>${vandaagTekst(x)}</div>`).openOn(map);
    vdOpen = x.id; queueLabels();
  }
  VD.plekken.forEach((x) => {
    const ll = vdLL(x); if (!ll) return;
    const m = L.marker(ll, { icon: icon(`<span class="vd-bord">${VD_BORD}</span><span class="vd-lab">${esc(x.n)}</span>`, "pl vandaag"), keyboard: true, title: `Vandaag: ${x.n}`, alt: `Vandaag: ${x.n}`, zIndexOffset: 300 });
    m.on("add", () => { const el = m.getElement(); if (el) el.setAttribute("aria-label", `Vandaag: ${x.n}, ${x.land}`); });
    m.on("click", () => openVandaag(x));
    m.on("keypress", (e) => { if (e.originalEvent && e.originalEvent.key === "Enter") openVandaag(x); });
    m.vd = x; vdMarkers[x.id] = m; lyVandaag.addLayer(m);
  });
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
    // Samen ontdekken: alleen de naam en of we zeker weten waar het was.
    const foto = BR.foto ? BR.foto.ballon(id) : "";
    if (niveau === "a") return `<div class="pop">${foto}<h3>${esc(p.n)}</h3><p class="zk zk-${c}"><i></i>${ZEKER[c][0]}</p>${c !== "v" && c !== "r" ? `<p class="st">${ZEKER[c][1]}</p>` : ""}</div>`;
    // Zelf op reis: minder lijst en geen bronvermelding van de ligging; Verder ontdekken: alles.
    const max = niveau === "c" ? 8 : 4;
    const list = here.slice(0, max).map(([d, i]) => `<li><button type="button" class="linkbtn" data-go="${d.key}:${i}">${esc(d.boek.n)} · ${esc(d.steps[i].t)}</button></li>`).join("");
    return `<div class="pop">${foto}<h3>${esc(p.n)}</h3><p class="zk zk-${c}"><i></i>${ZEKER[c][0]}</p><p>${esc(p.d || "")}</p>${p.nu ? `<p class="nu"><b>Nu:</b> ${esc(p.nu)}</p>` : ""}${c !== "v" && c !== "r" ? `<p class="st">${ZEKER[c][1]}</p>` : ""}${list ? `<p class="label">Hier in de reis</p><ul>${list}</ul>${here.length > max ? `<p class="st">en nog ${here.length - max} keer</p>` : ""}` : ""}${p.bron && niveau === "c" ? `<p class="st">Ligging: ${esc(p.bron)}</p>` : ""}</div>`;
  }
  const markers = {}, altMarkers = {};
  Object.entries(P).forEach(([id, p]) => {
    const c = certOf(p);
    const t = p.ctx ? "ctx" : c === "r" ? "gebied" : p.t || "stad";
    const pin = c === "o" && !p.ctx ? `<span class="fuzz" aria-hidden="true">?</span>` : c === "r" ? `<span class="area" aria-hidden="true"></span>` : `<span class="${["pin", "t-" + t, p.ctx ? "ctx" : "c-" + c, p.k ? "k" : ""].join(" ")}"><svg viewBox="0 0 14 14" aria-hidden="true">${PIN[t] || PIN.stad}</svg></span>`;
    const lab = ["lab", "s-" + (c === "r" ? "c" : p.s || "r"), p.ctx ? "ctx" : "", p.k ? "k" : "", c === "r" ? "gb" : ""].join(" ");
    const m = L.marker(p.ll, { icon: icon(`${pin}<span class="${lab}">${esc(p.n)}${p.nu ? `<small class="nu">${esc(p.nu)}</small>` : ""}</span>`, "pl plaats"), keyboard: !p.ctx, title: p.n, alt: p.n });
    m.pid = id; m.pside = c === "r" ? "c" : p.s || "r";
    if (!p.ctx) m.bindPopup(() => placePopup(id), { maxWidth: 280, autoPanPaddingTopLeft: [50, 150], autoPanPaddingBottomRight: [20, 90] });
    if (p.k) lyKings.addLayer(m);
    markers[id] = m;
    if (c === "b" && p.alt) altMarkers[id] = p.alt.map(([la, lo, n]) => L.marker([la, lo], { interactive: false, keyboard: false, icon: icon(`<span class="altpin" aria-hidden="true"></span><span class="lab s-r alt">${esc(n || "andere mogelijke plek")}</span>`, "pl plaats") }));
  });
  const lyAlt = L.layerGroup().addTo(map);

  const CAMEL = `<div class="camel"><svg viewBox="0 0 48 40" aria-hidden="true"><path class="leg a" d="M12 30v8"/><path class="leg b" d="M17 30v8"/><path class="leg b" d="M29 30v8"/><path class="leg a" d="M34 30v8"/><path class="body" d="M6 25c0-6 4-10 9-9 2-6 9-7 11 0 1-3 6-3 7 1 1 2 2 3 2 6l3-12c1-3 4-4 7-3l3 1-1 3h-4l-4 16c-1 2-2 3-4 3H9c-2 0-3-2-3-6z"/><path class="saddle" d="M15 17c4-2 10-2 15 1l-2 6H16z"/><circle class="eye" cx="42.5" cy="11.5" r="1"/></svg><span class="walker"></span></div>`;
  const camel = L.marker([31.5, 35.2], { icon: icon(CAMEL), interactive: false, keyboard: false, zIndexOffset: 1000 }).addTo(map);
  camel.getElement().querySelector(".camel").classList.add("gone"); // nog nergens: de eerste stap of het overzicht zet hem neer
  function camelStyle(who, walking, flip, gone) {
    const e = camel.getElement(); const el = e && e.querySelector(".camel"); if (!el) return;
    el.querySelector(".saddle").style.fill = color(who || "kobalt");
    // In het Nieuwe Testament geen kameel maar een eenvoudige stip: geen afbeelding bij de reizen van de Heere Jezus.
    el.classList.toggle("nt", ntNu()); el.querySelector(".walker").style.background = color(who || "kobalt");
    el.classList.toggle("walk", !!walking);
    el.classList.toggle("gone", !!gone);
    if (flip !== undefined) el.classList.toggle("flip", flip);
  }

  let boek = BOEKEN[0], deel = boek.delen[0], cur = -1, mode = "reis", animToken = 0, showAll = false;
  // Oude of Nieuwe Testament (kameel of stip, streeknamen van toen): per boek, maar in een thema per deel, want Kerst
  // begint bij Adam en eindigt in Nazareth (veld nt op het deel).
  const ntNu = () => !!(boek.thema ? deel.nt : boek.nt);
  let focus = null; // { keys: Set van stapsleutels, at: [plaats-ids] } wanneer een geschiedenis op de kaart staat

  function showPartPlaces() {
    lyPlaces.clearLayers();
    const ids = new Set(deel.ctx || []);
    deel.steps.forEach((s) => s.at.forEach((id) => { if (P[id] && !P[id].k) ids.add(id); }));
    ids.forEach((id) => markers[id] && lyPlaces.addLayer(markers[id]));
    lyAlt.clearLayers();
    if (niveau !== "a") ids.forEach((id) => (altMarkers[id] || []).forEach((m) => lyAlt.addLayer(m)));
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
    // Op de telefoon ligt in de reis het stapblad over de kaart: daar komen geen namen onder.
    return [...document.querySelectorAll(".leaflet-control-zoom, .maptools > *, .mapacties > *, .mapbar, .legend, .leaflet-control-scale")].filter((e) => e.offsetParent).concat(bladAan() ? [$("reisboek")] : []).map((e) => { const r = e.getBoundingClientRect(); return [r.left - box.left, r.top - box.top, r.width, r.height]; });
  }
  function refreshLabels() {
    const z = map.getZoom();
    // In het overzicht van een deel lichten alle plaatsen van dat deel op; bij een stap alleen die van de stap.
    const on = new Set(focus ? focus.at : mode !== "reis" ? [] : cur >= 0 ? deel.steps[cur].at : deel.steps.flatMap((s) => s.at));
    const size = map.getSize(), items = [];
    // Op een smal scherm met veel actieve namen (Paulus’ reizen) houden alleen begin en eind voorrang; de rest wijkt bij
    // botsing en verschijnt bij inzoomen of op de grote kaart. Op een groot scherm geldt dat in het overzicht van een deel:
    // daar stonden namen anders over elkaar heen (Davids rijk: Gibeon, Baäl-Perazim, Gath en Dal Refaïm bij Jeruzalem).
    const veel = on.size > 4 && (isNarrow() ? !document.body.classList.contains("mapfull") : !focus && mode === "reis" && cur < 0);
    const kern = new Set(focus ? focus.kern || [] : cur >= 0 ? [] : [deel.steps[0].at[0], deel.steps[deel.steps.length - 1].at.slice(-1)[0]]);
    Object.entries(markers).forEach(([id, m]) => {
      const el = m.getElement(); if (!el || !map.hasLayer(m)) return;
      const lab = el.querySelector(".lab");
      const vis = z >= (P[id].z || 7) || on.has(id);
      lab.classList.toggle("off", !vis);
      lab.classList.toggle("on", on.has(id));
      lab.classList.toggle("metnu", on.has(id) && (!isNarrow() || ((cur >= 0 || focus) && on.size <= 3)));
      if (m.options.zIndexOffset !== (on.has(id) ? 600 : 0)) m.setZIndexOffset(on.has(id) ? 600 : 0);
      lab.classList.remove("clash");
      const pt = map.latLngToContainerPoint(P[id].ll);
      if (vis && pt.x > -150 && pt.y > -40 && pt.x < size.x + 150 && pt.y < size.y + 40) items.push({ el: lab, pt, side: m.pside, pr: on.has(id) ? (veel && !kern.has(id) ? 2.5 : 3) : P[id].ctx ? 1 : 2, z: P[id].z || 7, pin: certOf(P[id]) !== "r" });
    });
    // Labels van andere mogelijke plekken (betwist): lagere voorrang; bij botsing blijft alleen de ring staan.
    lyAlt.eachLayer((m) => { const el = m.getElement(), lab = el && el.querySelector(".lab"); if (!lab) return; lab.classList.remove("clash"); const pt = map.latLngToContainerPoint(m.getLatLng()); if (pt.x > -150 && pt.y > -40 && pt.x < size.x + 150 && pt.y < size.y + 40) items.push({ el: lab, pt, side: "r", pr: 0.8, z: 0, pin: true }); });
    const tst = ntNu() ? "nt" : "ot";
    const plaatsNamen = new Set(items.map((it) => it.el.firstChild && it.el.firstChild.textContent));
    // In de stand Nu staan de landen van vandaag op de kaart: de streeknamen van toen (Kanaän, Filistijnen, Aram …) gaan dan uit,
    // zodat een oude naam niet naast een gebied van nu komt te staan.
    const inNu = map.getContainer().classList.contains("nu");
    REGIONS.forEach((r, i) => { const el = regionMarkers[i].getElement(); if (!el) return; const off = z < r.z[0] || z > r.z[1] || (r.tijd && r.tijd !== tst) || plaatsNamen.has(r.t) || (r.k === "land" && inNu); el.firstChild.classList.toggle("off", off); el.firstChild.classList.remove("clash"); if (!off) items.push({ el: el.firstChild, pt: map.latLngToContainerPoint(r.ll), side: "c", pr: 0, z: r.z[0] }); });
    PEAKS.forEach((p, i) => { const el = peakMarkers[i].getElement(); if (!el) return; el.firstChild.classList.toggle("off", z < p.z); el.firstChild.classList.remove("clash"); if (z >= p.z) items.push({ el: el.firstChild, pt: map.latLngToContainerPoint(p.ll), side: "peak", pr: 0.5, z: p.z }); });
    // Stand ‘Nu’: landnamen en namen van omstreden gebieden krijgen eerst een plek (de plaatsnamen wijken ervoor uit); daarna de bordjes van ‘Vandaag’.
    const kaartEl = map.getContainer();
    kaartEl.classList.toggle("z-ver", z < 5.5); kaartEl.classList.toggle("z-dicht", z >= 7.5); kaartEl.classList.toggle("z-fijn", z >= 6);
    if (map.hasLayer(lyModern)) {
      landNamen.forEach((c) => { const el = c.m.getElement(), lab = el && el.firstChild; if (!lab) return; lab.classList.remove("clash"); items.push({ el: lab, side: "land", pr: 3.2, z: c.rang, land: c }); });
      gebiedNamen.forEach((c) => { const el = c.m.getElement(), lab = el && el.firstChild; if (!lab) return; lab.classList.toggle("off", z < c.z); lab.classList.remove("clash"); if (z >= c.z) items.push({ el: lab, side: "land", pr: 3.1, z: c.z, land: c }); });
    }
    // Bordjes van ‘Vandaag’: op de overzichtskaart staan ze rond Jeruzalem te dicht op elkaar; dan blijft het eerste uit de
    // lijst staan en komen de andere bij inzoomen (in de lijst ‘Vandaag’ staan ze altijd allemaal).
    const vdBorden = [];
    if (map.hasLayer(lyVandaag)) VD.plekken.map((x) => vdMarkers[x.id]).filter(Boolean).sort((a, b) => (b.vd.id === vdOpen) - (a.vd.id === vdOpen)).forEach((m) => {
      const el = m.getElement(), lab = el && el.querySelector(".vd-lab"); if (!lab) return;
      const pt = map.latLngToContainerPoint(m.getLatLng()), r = [pt.x - 12, pt.y - 31, 24, 31]; lab.classList.remove("clash");
      const dek = (q) => Math.max(0, Math.min(r[0] + 24, q[0] + 24) - Math.max(r[0], q[0])) * Math.max(0, Math.min(r[1] + 31, q[1] + 31) - Math.max(r[1], q[1])) / (24 * 31);
      const weg = m.vd.id !== vdOpen && vdBorden.some((q) => dek(q) > 0.3);
      el.classList.toggle("dicht", weg);
      if (weg || pt.x < -40 || pt.y < -10 || pt.x > size.x + 40 || pt.y > size.y + 60) return;
      vdBorden.push(r);
      lab.classList.toggle("off", z < 6.5); if (z >= 6.5) items.push({ el: lab, pt, side: "vd", pr: 1.2, z: 0 });
    });
    // Eén leesronde voor alle maten, daarna alleen schrijven.
    items.forEach((it) => { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; });
    const placed = uiRects();
    // De kameel staat aan het eind van een reis precies op een plaats: labels wijken voor hem uit.
    const ce = camel.getElement(), cel = ce && ce.querySelector(".camel");
    let reiziger = null;
    if (cel && map.hasLayer(camel) && !cel.classList.contains("gone")) { const box = map.getContainer().getBoundingClientRect(), r = (cel.classList.contains("nt") ? cel.querySelector(".walker") : cel).getBoundingClientRect(); reiziger = [r.left - box.left - 3, r.top - box.top - 3, r.width + 6, r.height + 6]; placed.push(reiziger); }
    vdBorden.forEach((r) => placed.push(r));
    // Wat een landnaam nooit mag raken: knoppen, de reiziger, de bordjes van ‘Vandaag’ en de plaatsen van de stap. Is de kaart
    // erg vol (Bijbelwereld), dan mag een landnaam wel over de stip van een andere plaats heen.
    const hard = placed.slice();
    items.filter((it) => it.pin && it.pr >= 2.5).forEach((it) => hard.push([it.pt.x - 7, it.pt.y - 7, 14, 14]));
    items.filter((it) => it.pin).forEach((it) => placed.push([it.pt.x - 7, it.pt.y - 7, 14, 14]));
    items.sort((a, b) => b.pr - a.pr || a.z - b.z);
    // Overlap met wat er al staat; de reiziger telt zwaar: een naam onder de kameel of stip is onleesbaar.
    const overlap = (r) => placed.reduce((a, q) => a + Math.max(0, Math.min(r[0] + r[2], q[0] + q[2]) - Math.max(r[0], q[0])) * Math.max(0, Math.min(r[1] + r[3], q[1] + q[3]) - Math.max(r[1], q[1])) * (q === reiziger ? 12 : 1), 0);
    const ppg = (256 * 2 ** z) / 360; // schermpixels per graad (lengte)
    items.forEach((it) => {
      if (it.side === "land") {
        // Landnaam of gebiedsnaam: het eerste anker (van grof naar fijn) dat in beeld ligt, waar de naam in het land past en
        // niets raakt; de naam mag een regel omhoog of omlaag schuiven. Past de naam nergens in het land (een smal land op de
        // overzichtskaart), dan in zee voor de kust (straal -1) en anders op het eerste vrije anker.
        const hw = it.w / 2, hh = it.h / 2;
        const vrij = (a, lijst) => {
          const p = map.latLngToContainerPoint([a[0], a[1]]);
          for (const dy of [0, -it.h - 3, it.h + 3]) { const r = [p.x - hw, p.y - hh + dy, it.w, it.h]; if (r[0] > 4 && r[1] > 4 && r[0] + it.w < size.x - 4 && r[1] + it.h < size.y - 4 && !lijst.some((q) => hits(r, q))) return { a, dy, r }; }
          return null;
        };
        const A = it.land.ankers, past = (a) => a[2] > 0 && hw <= a[2] * ppg * 1.6;
        const eerste = (kies, lijst) => { for (const a of A) { const v = kies(a) && vrij(a, lijst); if (v) return v; } return null; };
        const zoek = (lijst) => eerste(past, lijst) || eerste((a) => a[2] < 0, lijst) || (A.some(past) ? null : eerste((a) => a[2] >= 0, lijst));
        const plek = zoek(placed) || zoek(hard);
        if (!plek) { it.el.classList.add("clash"); return; }
        const ll = it.land.m.getLatLng(); if (ll.lat !== plek.a[0] || ll.lng !== plek.a[1]) it.land.m.setLatLng([plek.a[0], plek.a[1]]);
        it.el.style.margin = plek.dy ? `${plek.dy}px 0 0 0` : "";
        placed.push(plek.r); hard.push(plek.r); return;
      }
      if (it.side === "vd") {
        // Naam bij een bordje van ‘Vandaag’: rechts of links van het bordje; past dat niet, dan alleen het bordje.
        const r = [[it.pt.x + 15, it.pt.y - 28, it.w, it.h], [it.pt.x - 15 - it.w, it.pt.y - 28, it.w, it.h]].find((q) => q[0] > 2 && q[0] + q[2] < size.x - 2 && !placed.some((x) => hits(q, x)));
        if (!r) { it.el.classList.add("clash"); return; }
        it.el.classList.toggle("links", r[0] < it.pt.x); placed.push(r); return;
      }
      if (it.side === "c" || it.side === "peak") {
        // Gebiedsnamen staan midden in hun gebied, maar mogen iets omhoog of omlaag uitwijken (voor de reiziger of een plaats).
        const sx = it.w / 2 + 12, sy = it.h + 6;
        const opties = it.side === "peak" ? [[0, 0]] : [[0, 0], [0, -sy], [0, sy], [sx, 0], [-sx, 0]];
        const rect = ([dx, dy]) => (it.side === "peak" ? [it.pt.x - 6, it.pt.y - 8, it.w, it.h] : (([x, y, w, h]) => [x + dx, y + dy, w, h])(labelRect(it.pt, it.w, it.h, "c")));
        const buiten = (r) => r[0] < 0 || r[1] < 0 || r[0] + r[2] > size.x || r[1] + r[3] > size.y;
        // Telefoon, in de reis: een gebiedsnaam van de stap staat liever een plek opzij (of naar binnen geschoven) dan
        // half buiten beeld.
        const klem = (o) => { const r = rect(o); return [o[0] + Math.round(Math.max(4 - r[0], Math.min(0, size.x - 4 - r[0] - r[2]))), o[1]]; };
        let d = it.pr >= 2.5 && bladAan() ? opties.concat(opties.map(klem)).find((o) => !buiten(rect(o)) && !placed.some((q) => hits(rect(o), q))) : undefined;
        if (d === undefined) d = opties.find((o) => !(it.pr < 1 && buiten(rect(o))) && !placed.some((q) => hits(rect(o), q)));
        if (d === undefined && it.pr < 3) { it.el.classList.add("clash"); it.el.style.margin = ""; return; }
        if (d === undefined) d = opties.slice().sort((a, b) => overlap(rect(a)) + (buiten(rect(a)) ? 1e6 : 0) - overlap(rect(b)) - (buiten(rect(b)) ? 1e6 : 0))[0];
        if (it.side === "c") it.el.style.margin = d[0] || d[1] ? `${d[1]}px 0 0 ${d[0]}px` : "";
        placed.push(rect(d)); return;
      }
      const order = [it.side].concat(SIDES.filter((s) => s !== it.side));
      let side = null, rect = null;
      const binnen = (r) => r[0] >= 2 && r[1] >= 2 && r[0] + r[2] <= size.x - 2 && r[1] + r[3] <= size.y - 2;
      for (const s of order) { const r = labelRect(it.pt, it.w, it.h, s); if (binnen(r) && !placed.some((q) => hits(r, q))) { side = s; rect = r; break; } }
      // Telefoon, in de reis: past de naam van een plaats van de stap aan geen kant binnen de kaart (een lange naam, of
      // een plaats aan de rand), dan komt hij onder of boven de plaats: zo nodig naar binnen geschoven en een regel
      // verder van de plaats af (voorbij de reiziger of een buurplaats), in plaats van half buiten beeld te vallen.
      let marge = "";
      if (!side && it.pr >= 2.5 && bladAan()) for (const [s, dy] of [["b", 0], ["t", 0], ["t", 14], ["b", 14], ["t", 28], ["b", 28]]) {
        const r = labelRect(it.pt, it.w, it.h, s), dx = Math.round(Math.max(4 - r[0], Math.min(0, size.x - 4 - r[0] - r[2]))), q = [r[0] + dx, r[1] + (s === "b" ? dy : -dy), r[2], r[3]];
        if ((dx || dy) && Math.abs(dx) < it.w / 2 + 4 && binnen(q) && !placed.some((x) => hits(q, x))) { side = s; rect = q; marge = s === "b" ? `${dy}px 0 0 ${dx}px` : `0 0 ${dy}px ${dx}px`; break; }
      }
      it.el.style.margin = marge;
      if (!side) for (const s of order) { const r = labelRect(it.pt, it.w, it.h, s); if (!placed.some((q) => hits(r, q))) { side = s; rect = r; break; } }
      if (!side && it.pr < 3) { it.el.classList.add("clash"); return; }
      if (!side) {
        // Een actief label moet zichtbaar blijven: kies de kant met de minste overlap.
        const buiten = (r) => (r[0] < 0 || r[1] < 0 || r[0] + r[2] > size.x || r[1] + r[3] > size.y ? 1e6 : 0);
        side = order.slice().sort((a, b) => buiten(labelRect(it.pt, it.w, it.h, a)) + overlap(labelRect(it.pt, it.w, it.h, a)) - buiten(labelRect(it.pt, it.w, it.h, b)) - overlap(labelRect(it.pt, it.w, it.h, b)))[0];
      }
      rect = rect || labelRect(it.pt, it.w, it.h, side);
      SIDES.forEach((s) => it.el.classList.toggle("s-" + s, s === side));
      placed.push(rect);
    });
    Object.entries(markers).forEach(([id, m]) => {
      const el = m.getElement(); if (!el) return;
      const lab = el.querySelector(".lab");
      el.classList.toggle("stil", !!focus && !on.has(id) && (lab.classList.contains("off") || lab.classList.contains("clash")));
    });
    // Toetsenbord: alleen een plaats die echt te zien is (binnen de kaart, niet onder een knop, ‘Van dichtbij’ of het
    // stapblad) zit in de tabvolgorde. Anders ging de focus naar onzichtbare plaatsen (WCAG 2.4.11), op de telefoon zo’n
    // zeventien keer vóór het stapblad.
    const box = map.getContainer().getBoundingClientRect(), db = $("dichtbijBtn");
    const dekt = uiRects().concat(db.getClientRects().length ? [(({ left, top, width, height }) => [left - box.left, top - box.top, width, height])(db.getBoundingClientRect())] : []);
    const inBeeld = (pt) => pt.x >= 4 && pt.y >= 4 && pt.x <= size.x - 4 && pt.y <= size.y - 4 && !dekt.some((r) => pt.x >= r[0] && pt.x <= r[0] + r[2] && pt.y >= r[1] && pt.y <= r[1] + r[3]);
    Object.values(markers).concat(Object.values(vdMarkers)).forEach((m) => {
      const el = m.options.keyboard && m.getElement(); if (!el) return;
      const t = inBeeld(map.latLngToContainerPoint(m.getLatLng())) ? 0 : -1;
      if (el.tabIndex !== t) el.tabIndex = t;
    });
  }
  let labelT;
  const queueLabels = () => { cancelAnimationFrame(labelT); labelT = requestAnimationFrame(refreshLabels); };
  map.on("zoomend moveend resize", queueLabels);
  map.on("moveend", drawInsetBox);

  function fit(pts, maxZoom, done) {
    // Telefoon: in Paspoort, Tijdlijn en de speurtocht (behalve bij een kaartvraag) is de kaart weg. Dan geen uitsnede;
    // komt hij terug, dan eerst de echte maat (Leaflet onthoudt de maat van vóór het verbergen).
    const kel = map.getContainer(), kmaat = map.getSize();
    if (!kel.clientWidth || !kel.clientHeight) { done && done(); return; }
    if (kel.clientWidth !== kmaat.x || kel.clientHeight !== kmaat.y) map.invalidateSize({ pan: false });
    const b = L.latLngBounds(pts);
    // Ruimte laten voor de knoppen en, als die open is, de legenda.
    const lg = $("legend"), lgW = lg.classList.contains("open") && !lg.hidden && !isNarrow() ? lg.offsetWidth + 16 : 0;
    // Telefoon: de stappenbalk staat onder de kaart, dus onderin alleen ruimte voor ‘Hele reis’/‘Groot’ en de schaal.
    const smal = isNarrow(), balk = !smal && !$("mapbar").hidden;
    const opts = { paddingTopLeft: [smal ? 52 : 64, smal ? 54 : 60], paddingBottomRight: [smal ? 18 : Math.max(40, lgW),  balk ? 96 : smal ? 70 : 64], maxZoom: Math.min(maxZoom || 9, zoomStap()) };
    // Telefoon, in de reis: de kaart is het scherm en het stapblad ligt eroverheen. De route past in het vrije deel: onder
    // de kaartknoppen (met ruimte voor de kameel) en boven het korte blad (met ruimte voor een naam onder de plaats).
    if (bladAan()) {
      Object.assign(opts, bladRuimte());
      // Schuift de kaart nog (Leaflet haalt hem na een maatwissel terug binnen de ondergrond), dan eerst stilzetten:
      // anders loopt die verschuiving door ná de nieuwe uitsnede en staat de route buiten beeld.
      map._enforcingBounds = true; map.stop(); map._enforcingBounds = false;
      // De zuidgrens hoort bij de zoom waar de kaart naartoe gaat (zie kaartGrenzen), niet bij die van de vorige stap.
      kaartGrenzen(Math.min(opts.maxZoom, map.getBoundsZoom(b, false, L.point(opts.paddingTopLeft).add(opts.paddingBottomRight))));
    }
    // Loopt er nog een zoomanimatie (snel na elkaar tikken), dan zou Leaflet de nieuwe uitsnede negeren: eerst afwachten.
    if (map._animatingZoom) { map.once("zoomend", () => fit(pts, maxZoom, done)); return; }
    if (reduceMotion) { map.fitBounds(b, { ...opts, animate: false }); done && done(); return; }
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
  const insetLabel = () => { const open = !$("inset").hidden; $("insetBtn").textContent = open ? "Overzichtskaartje sluiten" : "Waar ligt dit?"; $("insetBtn").setAttribute("aria-label", open ? "Overzichtskaartje sluiten" : "Waar ligt dit? Overzichtskaartje met Nederland"); };
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
  // ---------- de reiziger op de kaart ----------
  // De kameel (in het Nieuwe Testament een wandelaar) loopt per stap langs de lijn van de route. De regels staan in
  // docs/BIJBELREIS.md (‘De reiziger op de kaart’). Er loopt nooit meer dan één reis: alles wat animToken verhoogt
  // (een nieuwe stap, het overzicht, een ander deel, een geschiedenis) breekt de vorige af, ook als die nog wacht.
  // Duur in ms uit de lengte op het scherm: per route vast + perPx × pixels, tussen routeMin en max; de hele stap tussen
  // min en totaal. aanloop: versnellen en vertragen; wissel: verdwijnen en verschijnen (gelijk aan de overgang van .camel
  // in de CSS); kaartWacht: langste wachttijd op een bewegende kaart; vooruit/draai: pixels voor de kijkrichting; dichtbij:
  // zoveel pixels of minder is dezelfde plek (dan loopt hij door in plaats van te verdwijnen en te verschijnen).
  const REIS = { perPx: 4.5, vast: 400, routeMin: 600, max: 5500, min: 1000, totaal: 7000, aanloop: 350, wissel: 300, kaartWacht: 1500, vooruit: 20, draai: 5, dichtbij: 3 };
  const reisDuur = (px) => Math.max(REIS.routeMin, Math.min(REIS.max, REIS.vast + REIS.perPx * px));
  // Gelijkmatige snelheid met een zachte start en stop: aandeel a van de tijd versnellen, even lang vertragen.
  function zacht(f, a) {
    const v = 1 / (1 - a);
    if (f < a) return (v * f * f) / (2 * a);
    if (f > 1 - a) return 1 - (v * (1 - f) * (1 - f)) / (2 * a);
    return v * (f - a / 2);
  }
  const kameelEl = () => { const e = camel.getElement(); return e && e.querySelector(".camel"); };
  // Staat hij zichtbaar op (of vlak bij) dit punt? Gemeten in pixels op zoomniveau z: het niveau waarop de plek getoond wordt.
  const kameelStaatOp = (p, z = map.getMaxZoom()) => { const el = kameelEl(); return !!el && map.hasLayer(camel) && !el.classList.contains("gone") && map.project(camel.getLatLng(), z).distanceTo(map.project(p, z)) <= REIS.dichtbij; };
  const kameelWeg = () => { const el = kameelEl(); if (el) { el.classList.remove("walk"); el.classList.add("gone"); } };
  // Buiten een reis (overzicht van een deel, een geschiedenis): staat hij ergens anders, dan verdwijnt hij daar meteen;
  // de camelStyle-aanroep erna laat hem op de nieuwe plek rustig verschijnen. Zo vliegt hij nooit zichtbaar door de kaart.
  function kameelZet(p) {
    const el = kameelEl();
    if (el && !kameelStaatOp(p)) { el.style.transition = "none"; el.classList.add("gone"); void el.offsetWidth; el.style.transition = ""; }
    camel.setLatLng(p);
  }
  // Staat de kaart stil? Leaflet meldt begin en eind van elke verschuiving of zoom; kaartWacht is het vangnet.
  let kaartBezig = false;
  map.on("movestart", () => { kaartBezig = true; });
  // Na een vlucht schuift Leaflet de kaart soms nog terug binnen de grenzen: dan is hij nog niet stil.
  map.on("moveend", () => { kaartBezig = !!(map._animatingZoom || (map._panAnim && map._panAnim._inProgress)); });
  function alsKaartStil(fn) {
    if (!kaartBezig) { fn(); return; }
    let gedaan = false, t = 0;
    const go = (e) => { if (gedaan || (e && kaartBezig)) return; gedaan = true; map.off("moveend", go); clearTimeout(t); fn(); };
    map.on("moveend", go);
    t = setTimeout(go, REIS.kaartWacht);
  }
  const volleLijn = (r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); };
  const eindVan = (s) => (s.r && s.r.length ? s.r[s.r.length - 1].pts.slice(-1)[0] : s.at.length ? ll(s.at[0]) : null);
  // Breekt de lopende of wachtende reis af; de reiziger staat daarna stil op de bestemming van de stap.
  function reisStop() {
    animToken++;
    const s = cur >= 0 ? deel.steps[cur] : null, end = s && eindVan(s);
    if (!end) return;
    kameelZet(end);
    camelStyle(s.r && s.r.length ? s.r[s.r.length - 1].w : deel.c, false, undefined, false);
  }
  // Zet de reis van een stap klaar, meteen bij het kiezen van de stap: de lijn begint leeg en de reiziger blijft staan
  // als de route begint waar hij staat, en verdwijnt anders. Geeft de functie terug die de reis laat beginnen; select
  // roept die aan als de kaart de stap in beeld heeft.
  function reis(s) {
    const token = ++animToken, leeft = () => token === animToken;
    const routes = s.r || [];
    const who = routes.length ? routes[0].w : deel.c;
    const start = routes.length ? routes[0].pts[0] : s.at.length ? ll(s.at[0]) : null, end = eindVan(s);
    if (!start) { camelStyle(who, false, undefined, true); return () => {}; }
    if (reduceMotion) return () => { if (!leeft()) return; routes.forEach(volleLijn); camel.setLatLng(end); camelStyle(who, false, undefined, false); queueLabels(); };
    routes.forEach((r) => { r.line.setLatLngs([r.pts[0], r.pts[0]]); r.casing.setLatLngs([r.pts[0], r.pts[0]]); });
    const sluitAan = kameelStaatOp(start, s.zoom || 9);
    if (sluitAan) camelStyle(who, false, undefined, false); else kameelWeg();
    const straks = (fn) => setTimeout(() => { if (leeft()) fn(); }, REIS.wissel);
    function loop() {
      // De weg in schermpixels, zoals de lijn getekend is: zo ligt de reiziger precies op de lijn en is de snelheid op het
      // scherm gelijkmatig.
      const z = map.getZoom();
      const paden = routes.map((r) => { const px = r.pts.map((p) => map.project(p, z)), cum = [0]; px.slice(1).forEach((q, j) => cum.push(cum[j] + q.distanceTo(px[j]))); return { r, px, cum, len: cum[cum.length - 1] }; });
      const ruw = paden.map((p) => reisDuur(p.len)), som = ruw.reduce((a, b) => a + b, 0);
      const duren = ruw.map((d) => d * (som > REIS.totaal ? REIS.totaal / som : som < REIS.min ? REIS.min / som : 1));
      const puntOp = (pad, d) => { let k = 1; while (k < pad.cum.length - 1 && pad.cum[k] < d) k++; const a = pad.px[k - 1], b = pad.px[k], t = Math.max(0, Math.min(1, (d - pad.cum[k - 1]) / (pad.cum[k] - pad.cum[k - 1] || 1))); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, k }; };
      const el0 = kameelEl();
      let flip = !!el0 && el0.classList.contains("flip");
      // Kijkrichting: de richting van het stuk lijn dat voor hem ligt; loopt dat bijna recht omhoog of omlaag, dan
      // blijft hij kijken zoals hij keek.
      const kijk = (pad, d) => { const a = puntOp(pad, d), b = puntOp(pad, Math.min(pad.len, d + REIS.vooruit)), dx = b.x - a.x; if (Math.abs(dx) >= REIS.draai) flip = dx < 0; return flip; };
      // Bij vertrek geeft, als het eerste stuk recht omhoog of omlaag loopt, de richting van de hele route de doorslag.
      const kijkBegin = (pad) => { const dx = puntOp(pad, Math.min(pad.len, REIS.vooruit)).x - pad.px[0].x, net = pad.px[pad.px.length - 1].x - pad.px[0].x; if (Math.abs(dx) >= REIS.draai) flip = dx < 0; else if (Math.abs(net) >= REIS.draai) flip = net < 0; return flip; };
      // Het schermpunt waar hij zichtbaar staat; null zolang hij weg is.
      let staat = sluitAan ? paden[0].px[0] : null;
      function been(i) {
        if (i >= paden.length) { camel.setLatLng(end); camelStyle(routes[routes.length - 1].w, false); queueLabels(); return; }
        const pad = paden[i], r = pad.r, T = duren[i], a = Math.min(0.3, REIS.aanloop / T);
        if (pad.len < 1) { volleLijn(r); been(i + 1); return; } // geen zichtbare lengte: niets te lopen
        const stap = () => {
          camelStyle(r.w, true, kijkBegin(pad), false);
          let verstreken = 0, vorige = null;
          // Per beeldje telt hooguit 100 ms mee: na een hapering of een verborgen tabblad loopt hij verder, zonder sprong.
          function kameelFrame(now) {
            if (!leeft()) return;
            if (vorige !== null) verstreken += Math.min(100, now - vorige);
            vorige = now;
            const f = Math.min(1, verstreken / T), d = zacht(f, a) * pad.len, q = puntOp(pad, d);
            const u = map.unproject([q.x, q.y], z), pos = f >= 1 ? r.pts[r.pts.length - 1] : [u.lat, u.lng];
            const lijn = f >= 1 ? r.pts : r.pts.slice(0, q.k).concat([pos]);
            r.line.setLatLngs(lijn); r.casing.setLatLngs(lijn);
            const was = flip; if (kijk(pad, d) !== was) camelStyle(r.w, true, flip, false);
            camel.setLatLng(pos);
            if (f < 1) requestAnimationFrame(kameelFrame); else { staat = pad.px[pad.px.length - 1]; been(i + 1); }
          }
          requestAnimationFrame(kameelFrame);
        };
        const verschijn = () => { camel.setLatLng(r.pts[0]); camelStyle(r.w, false, kijkBegin(pad), false); straks(stap); };
        // Begint deze route waar hij staat, dan loopt hij door; anders verdwijnt hij en verschijnt hij op het begin.
        if (staat && staat.distanceTo(pad.px[0]) <= REIS.dichtbij) stap();
        else if (!staat) verschijn();
        else { staat = null; kameelWeg(); straks(verschijn); }
      }
      been(0);
    }
    return () => {
      if (!leeft()) return;
      alsKaartStil(() => {
        if (!leeft()) return;
        if (routes.length) { loop(); return; }
        camel.setLatLng(start); camelStyle(who, false, undefined, false); queueLabels();
      });
    };
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
  // Zonder boek (‘*’) koppelt een naam alleen als precies één persoon zo heet: personen met dezelfde naam
  // (Jozef, Johannes, Herodes …) worden nooit op de gok samengevoegd.
  const NAAM_IDS = {};
  Object.entries(MENSEN).forEach(([id, m]) => [m.n].concat(m.alias || []).forEach((n) => {
    (NAAM_IDS[n] = NAAM_IDS[n] || new Set()).add(id);
    (m.boek || []).forEach((b) => { MENS_IDX[b + "|" + n] = id; });
  }));
  Object.entries(NAAM_IDS).forEach(([n, ids]) => { if (ids.size === 1) MENS_IDX["*|" + n] = [...ids][0]; });
  const mensOf = (name, boekId) => MENS_IDX[boekId + "|" + name] || null;
  const mensIn = (name, boekId) => mensOf(name, boekId) || MENS_IDX["*|" + name] || null;
  const MENS_STAPPEN = {};
  BOEKEN.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => (s.who || []).forEach(([n]) => { const id = mensOf(n, b.id); if (id) (MENS_STAPPEN[id] = MENS_STAPPEN[id] || []).push([d, i]); }))));
  // ruim: ook koppelen via een unieke naam als de persoon niet bij dit boek staat (geschiedenissen).
  function personChip([name, age], boekId = boek.id, ruim = boekId === "*") {
    const c = color(BR.personen[name] || "grijs");
    const group = GROUPS.has(name);
    const label = group ? age || name.toLowerCase() : name;
    const sub = !group && age ? ` <small>${/^\d+$/.test(age) ? age + " jaar" : esc(age)}</small>` : "";
    const id = !group && (ruim ? mensIn(name, boekId) : mensOf(name, boekId));
    return id ? `<button type="button" class="chip" data-mens="${id}" title="Wie is ${esc(name)}?"><i style="background:${c}">${esc(name[0])}</i>${esc(label)}${sub}</button>` : `<span class="chip"><i style="background:${c}">${esc(name[0])}</i>${esc(label)}${sub}</span>`;
  }
  const FS = { b: "Uit de Bijbel", u: "Uitleg", h: "Historische achtergrond" };
  // Jaartallen: altijd met hun grond erbij (dateringen.js). Bijbelse tijdrekening, historische reconstructie en
  // onzekerheid zijn drie verschillende dingen; een jaartal als ‘ca. 1446 v.Chr.’ is nooit een vaststaand feit.
  const DAT = BR.dateringen || { soorten: {}, delen: {}, verhalen: [] };
  function datering(x) {
    if (!x) return null;
    if (x.tijd === null || (x.tl === null && !x.tijd)) return { tekst: "Geen jaartal", soort: "geen", onzeker: false };
    if (!x.tijd) return null;
    const r = x.key ? DAT.delen[x.key] : (DAT.verhalen.find(([a, b]) => x.nr >= a && x.nr <= b) || []).slice(2);
    const schatting = /ruwe schatting/.test(x.tijd);
    return { tekst: x.tijd.replace(/\s*\((onzeker|ruwe schatting)\)/, ""), soort: (r && r[0]) || "historie", onzeker: !!(r && r[1]) || /\(onzeker\)/.test(x.tijd) || schatting, schatting };
  }
  const datTags = (dt) => dt ? `<span class="dt dt-${dt.soort}" title="${esc((DAT.soorten[dt.soort] || {}).uitleg || "")}">${esc((DAT.soorten[dt.soort] || {}).n || dt.soort)}</span>${dt.onzeker ? `<span class="dt dt-onzeker" title="${esc(DAT.soorten.onzeker ? DAT.soorten.onzeker.uitleg : "")}">${dt.schatting ? "ruwe schatting" : "onzeker"}</span>` : ""}` : "";
  // Korte uitleg onder een jaartal: wat betekent de grond ervan.
  const datUitleg = (dt) => dt ? [(DAT.soorten[dt.soort] || {}).uitleg, dt.onzeker && DAT.soorten.onzeker ? DAT.soorten.onzeker.uitleg : ""].filter(Boolean).join(" ") : "";
  function renderCrumb() {
    const n = deel.steps.length, got = deel.steps.filter((s) => seen.has(s.key)).length;
    $("sCrumb").innerHTML = `${boek.thema ? STER : ""}<button type="button" class="linkbtn" data-crumb="boek"${boek.thema ? ` title="${esc(boek.n)}"` : ""}>${esc(boekKort(boek))}</button><span aria-hidden="true">›</span>${deel.hoofd ? `<button type="button" class="linkbtn" data-crumb="hoofd">${esc(deel.hoofd.n)}</button><span aria-hidden="true">›</span>` : ""}<button type="button" class="linkbtn" data-crumb="deel"${cur < 0 ? ' aria-current="page"' : ""}>${esc(deel.n)}</button>${cur >= 0 ? `<span aria-hidden="true">›</span><span aria-current="step">Stap ${cur + 1} van ${n}</span>` : `<span class="muted">${got} van ${n} gezien</span>`}`;
    $("sTerug").hidden = !deel.hoofd;
    $("sTerug").innerHTML = deel.hoofd ? `<button type="button" class="linkbtn" data-crumb="hoofd">← Terug naar ${esc(deel.hoofd.n)}</button>` : "";
    kiesRegel(n);
    $("sProg").firstElementChild.style.width = ((cur >= 0 ? (cur + 1) / n : got / n) * 100).toFixed(1) + "%";
    const dt = datering(deel);
    $("sTijd").hidden = !dt; $("sTijd").innerHTML = dt ? `<span>${esc(dt.tekst)}</span>${datTags(dt)}${deel.tijdNoot ? `<button type="button" class="linkbtn" data-tab="tijd">Hoe weten we dat?</button>` : ""}` : "";
  }
  function setAccent() {
    document.body.style.setProperty("--rc", color(deel.c));
    document.querySelectorAll(".deel").forEach((b) => b.setAttribute("aria-pressed", b.dataset.deel === (deel.hoofd || deel).id));
    document.querySelectorAll(".boek").forEach((b) => b.setAttribute("aria-pressed", b.dataset.boek === boek.id));
    toonGekozen("boeken"); toonGekozen("delen");
    themaAan();
  }
  // Het eigen uiterlijk van een thema (body[data-thema], bijbelreis.css): aan zolang je in het thema bent (de reis, Hoe
  // ver?, Wie is wie en de speurtocht van dat boek), uit bij Verhalen, Tijdlijn en Paspoort, die over de hele Bijbel gaan.
  const THEMAKLEUR = document.querySelector('meta[name="theme-color"]'), KLEUR0 = THEMAKLEUR ? THEMAKLEUR.content : "";
  function themaAan() {
    const t = boek.thema && ["reis", "ver", "wie", "quiz"].includes(mode) ? boek.thema : "";
    if (t) document.body.dataset.thema = t; else delete document.body.dataset.thema;
    // De statusbalk van de telefoon kleurt mee met de kop.
    if (THEMAKLEUR) THEMAKLEUR.content = t === "kerst" ? "#14213f" : KLEUR0;
  }
  // De rij met boeken en de rij met delen schuiven opzij. Staat het gekozen boek of deel buiten beeld (bijvoorbeeld na
  // een diepe link als #brieven), dan schuift de rij ernaartoe. Alleen de rij zelf schuift, de pagina niet.
  function toonGekozen(id) {
    const el = $(id), b = el && el.querySelector('[aria-pressed="true"]');
    if (!b) return;
    const r = b.getBoundingClientRect(), e = el.getBoundingClientRect();
    if (e.width && (r.left < e.left || r.right > e.right)) el.scrollLeft += r.left - e.left - (e.width - r.width) / 2;
  }
  function chooseBoek(b, d, step = -1, opts) {
    boek = b; d = d || b.delen.find((x) => !x.hoofd) || b.delen[0];
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
    focus = null; wereldUit(); $("map").classList.remove("symbool", "gelijkenis");
    cur = Math.max(-1, Math.min(deel.steps.length - 1, i));
    showAll = false; heleZichtbaar();
    map.closePopup();
    // Verdiepende delen: de ingang in de intro van het hoofddeel en bij de stappen over hetzelfde Bijbelgedeelte.
    const verdiep = cur < 0 ? deel.verdiep || [] : deel.steps[cur].verdiep || [];
    $("sVerdiep").hidden = !verdiep.length;
    $("sVerdiep").innerHTML = verdiep.map((v) => `<button type="button" class="verdiep-in" data-go="${v.key}:-1"><span class="label">Van dichtbij</span><span><b>${esc(v.n)}</b> · ${esc(v.ref)}</span><small>${v.steps.length} stappen</small></button>`).join("");
    // Telefoon, in de reis: dezelfde ingang als één knop op de kaart, direct boven het korte blad. In het korte blad is
    // geen plaats voor de ingang en in het open blad staat hij te ver weg (opmerking van Martijn, 16-11-2026).
    const db = $("dichtbijBtn"), v0 = verdiep[0];
    db.hidden = !v0;
    // Eerst de knop, dan de uitsnede: de uitsnede houdt ruimte vrij voor de knop (bladRuimte). Stond hij er bij de vorige
    // stap nog niet (‘Begin de reis’ vanuit Verhalen), dan lag het begin van de route eronder.
    if (v0) { db.dataset.go = `${v0.key}:-1`; db.innerHTML = `<span><small>Van dichtbij</small><b>${esc(v0.n)}</b></span><span class="n">${v0.steps.length} stappen ▸</span>`; }

    // Telefoon: na elke stap is het stapblad kort, zodat je de kaart ziet bewegen.
    bladZet(false);
    const sp = $("sSpecial"); sp.innerHTML = "";
    const lees = $("leesBtn");
    if (cur >= 0) {
      const s = deel.steps[cur];
      if (!seen.has(s.key)) { seen.add(s.key); store.set("gezien", [...seen]); toast(`Nieuwe stempel: ${s.stamp}!`); }
      // Bezoekmeting (bezoek.js): telt alleen hoeveel stappen er in dit bezoek zijn geopend, niet welke.
      document.dispatchEvent(new CustomEvent("bijbelreis:stap", { detail: s.key }));
      $("sRef").textContent = s.ref;
      $("sKm").textContent = s.km ? "ca. " + fmt(s.km) + " km" : "";
      $("sTitle").textContent = cur + 1 + ". " + s.t;
      $("sWho").innerHTML = (s.who || []).map(personChip).join("");
      $("sText").textContent = s.txt; $("sTextLabel").hidden = false;
      // Samen ontdekken: één zin bij de stap, en de weg naar het verhaal dat je samen leest.
      if (niveau === "a") { const gv = G.find((g) => (g.stappen || []).includes(s.key)); $("sText").innerHTML = esc(eersteZin(s.txt)) + (gv ? `<span class="a-reisverhaal"><button type="button" class="btn primary small" data-v="${gv.nr}">Lees samen: ${esc(gv.t)}</button></span>` : ""); }
      $("sFact").innerHTML = `<b>Wist je dat?${s.fs && FS[s.fs] ? ` <span class="fs fs-${s.fs}">${FS[s.fs]}</span>` : ""}</b>` + esc(s.fact); $("sFact").hidden = !s.fact;
      renderAfstand(s);
      lees.hidden = !s.ref; $("leesRef").textContent = s.ref;
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
      bladKort();
      // Geen plaats bekend (bijv. ‘ergens in Israël’): toon de streek in plaats van een verzonnen punt.
      const loop = reis(s);
      if (!pts.length) fit(Array.isArray(s.view) ? s.view : s.view === "kanaan" ? KANAAN : WIDE, Array.isArray(s.view) ? 9 : 6, loop);
      else if (pts.every((p) => p[0] === pts[0][0] && p[1] === pts[0][1])) {
        const z = Math.min(s.zoom || 9, zoomStap());
        // Eén plek: in het midden van de kaart; op de telefoon in het midden van het vrije deel boven het stapblad.
        if (bladAan()) fit([pts[0], pts[0]], z, loop);
        else { reduceMotion ? map.setView(pts[0], z, { animate: false }) : map.flyTo(pts[0], z, { duration: 0.8 }); setTimeout(loop, reduceMotion ? 0 : 850); }
      } else fit(pts, s.zoom || 9, loop);
      $("where").textContent = `${deel.short} · ${cur + 1} van ${deel.steps.length}`;
    } else {
      $("sRef").textContent = deel.ref;
      const km = partKm(deel);
      $("sKm").textContent = deel.steps.length + " stappen" + (km > 50 ? ` · ca. ${fmt(Math.round(km / 100) * 100)} km` : "");
      $("sTitle").textContent = deel.n;
      $("sWho").innerHTML = (deel.who || []).map(personChip).join("");
      $("sText").textContent = niveau === "a" ? eersteZin(deel.intro) : deel.intro; $("sTextLabel").hidden = true;
      $("sFact").innerHTML = "<b>Wist je dat?</b>" + esc(deel.stat || ""); $("sFact").hidden = !deel.stat;
      $("sVer").hidden = true;
      lees.hidden = true;
      if (deel.cross && deel.cross.length) sp.innerHTML = `<p class="label">Elders in de Bijbel</p><ul class="xrefs">${deel.cross.map(([r, t]) => `<li>${refTekst(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
      map.removeLayer(lyKings); lySpecial.clearLayers();
      deel.steps.forEach((t) => (t.r || []).forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }));
      showAll = true; routeState(); showAll = false;
      animToken++;
      const first = deel.steps.find((s) => s.at.length || s.r);
      const startLL = first ? (first.r ? first.r[0].pts[0] : ll(first.at[0])) : null;
      if (startLL) kameelZet(startLL);
      camelStyle(deel.c, false, false, !startLL || deel.id === "begin");
      bladKort();
      if (!opts.noFly) fit(partBounds(deel), 9.5);
      $("where").textContent = deel.n;
    }
    // Tafereel: een getekend beeld bij de tekst van een stap zonder reis (taferelen.js).
    if (BR.tafereel) BR.tafereel.bijStap($("sText"), cur >= 0 ? deel.steps[cur] : null);
    if (BR.foto) BR.foto.bijStap($("sText"), cur >= 0 ? deel.steps[cur] : null); // foto van de plaats zoals die er nu uitziet (fotos.js)
    const atEnd = cur >= deel.steps.length - 1, next = volgendDeel(deel), tu = themaUi(boek), slot = !!tu && atEnd && !next && !deel.hoofd;
    $("prev").disabled = $("prev2").disabled = cur <= -1 && !deel.hoofd && !vorigDeel(deel);
    $("next").disabled = $("next2").disabled = atEnd && !next && !deel.hoofd;
    $("next").textContent = $("next2").textContent = cur < 0 ? "Start ▶" : atEnd && deel.hoofd ? `Verder met ${deel.hoofd.short} ▶` : atEnd && next ? `Naar ${next.short} ▶` : slot ? `Einde van ${tu.reis}` : "Verder ▶";
    themaPad(slot);
    // Deel: bij de intro en de laatste stap van een deel (niet in het korte stapblad, niet bij Samen ontdekken).
    $("sDeel").innerHTML = cur < 0 || atEnd ? deelKnop(deel.id, deel.n, "Deel deze reis") : ""; $("sDeel").hidden = !$("sDeel").innerHTML;
    // Om over na te denken: open vragen bij een deel (veld `denk`), bij de intro en de laatste stap; niet bij Samen ontdekken.
    const denk = niveau !== "a" && (cur < 0 || atEnd) && Array.isArray(deel.denk) ? deel.denk : [];
    $("sDenk").hidden = !denk.length;
    // Aan het einde van een deel: ‘Mis je iets? Vraag het aan’. Niet bij Samen ontdekken (daar alleen via ‘Voor ouders en leiders’).
    $("sMis").hidden = !(niveau !== "a" && cur >= 0 && atEnd);
    if (denk.length) { $("sDenkLijst").innerHTML = denk.map((q) => `<li>${esc(q)}</li>`).join(""); $("sDenk").open = false; }
    renderDots(); renderCrumb(); meerKnoppen();
    if (cur >= 0) { store.set("laatst", deel.steps[cur].key); store.set("huidig", { k: deel.steps[cur].key }); }
    if (!opts.keepHash) navZet("#" + deel.id + (cur >= 0 ? "/" + (cur + 1) : ""));
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
  // Een verdiepend deel begint en eindigt bij zijn hoofddeel; verder gaat het van deel naar deel in de volgorde VOLG.
  function goNext() { if (cur < deel.steps.length - 1) select(cur + 1); else if (deel.hoofd) chooseDeel(deel.hoofd, deel.verder); else { const n = volgendDeel(deel); if (n) { if (n.boek !== boek) chooseBoek(n.boek, n); else chooseDeel(n); } } }
  function goPrev() { if (cur > -1) select(cur - 1); else if (deel.hoofd) chooseDeel(deel.hoofd); else { const p = vorigDeel(deel); if (p) { if (p.boek !== boek) chooseBoek(p.boek, p, p.steps.length - 1); else chooseDeel(p, p.steps.length - 1); } } }
  // Een thema is één doorlopende reis in delen. In de intro van elk deel staat waar je bent (‘deel 3 van 6’) met de
  // delen op een rij; een deel waarvan je alle stappen gezien hebt, is afgevinkt. Na de laatste stap van het laatste
  // deel staat een slotzin. De verwijzing naar een ander werk van dezelfde maker (Raadkoord Kerst) staat alleen in het
  // thema: in de intro van het eerste deel en na de laatste stap van het laatste.
  function themaPad(slot) {
    const tu = themaUi(boek), pad = $("sThema"), rij = tu && !deel.hoofd ? reeks(deel) : [], i = rij.indexOf(deel);
    pad.hidden = !(tu && cur < 0 && i >= 0);
    if (!pad.hidden) {
      pad.setAttribute("aria-label", `${tu.kort}: deel ${i + 1} van ${rij.length}`);
      pad.innerHTML = `<p class="tp-kop">${STER}<span>${esc(tu.kort)} · deel <b>${i + 1}</b> van ${rij.length}</span></p><ol class="tp-rij">${rij.map((d, j) => { const af = d.steps.every((s) => seen.has(s.key)); return `<li><button type="button" class="tp-deel${af ? " af" : ""}" data-go="${d.key}:-1"${j === i ? ' aria-current="step"' : ""} aria-label="Deel ${j + 1}: ${esc(d.n)}${af ? ", alle stappen gezien" : ""}"><i>${af && j !== i ? "✓" : j + 1}</i><span>${esc(d.short)}</span></button></li>`; }).join("")}</ol>`;
    }
    $("sSlot").hidden = !slot;
    $("sSlot").innerHTML = slot ? `${STER}<span>${esc(tu.einde)}</span>` : "";
    const ook = tu && tu.ook && !deel.hoofd && ((cur < 0 && i === 0) || slot) ? tu.ook : null;
    $("sOok").hidden = !ook;
    $("sOok").innerHTML = ook ? `<a href="${esc(ook[0])}" rel="noopener">${esc(ook[1])} <b>${esc(ook[2])}</b>${esc(ook[3])}</a>` : "";
  }

  // Jaartal van een boek, met de grond van de delen erbij (berekend uit de Bijbel / reconstructie / onzeker).
  function boekTijd(b) {
    if (!b.tijd) return "";
    const dts = b.delen.map(datering).filter((x) => x && x.soort !== "geen");
    const soort = [...new Set(dts.map((x) => (x.soort === "bijbel" ? "berekend" : "reconstructie")))];
    const grond = soort.concat(dts.some((x) => x.onzeker) ? ["onzeker"] : []);
    return b.tijd.replace(/\s*\((onzeker|reconstructie)\)/, "") + (grond.length ? " · " + grond.join(", ") : "");
  }
  function renderBoeken() {
    $("boeken").innerHTML = BIJBELBOEKEN.map((b) => `<button type="button" class="boek" data-boek="${b.id}" aria-pressed="${b === boek}">${esc(b.n)}<small>${esc(boekTijd(b))}</small></button>`).join("");
    // Thema’s: een eigen groep onder de Bijbelboeken; in het seizoen van het thema bovenaan (CSS: body[data-seizoen]).
    $("themaRij").hidden = !THEMAS.length;
    $("themas").innerHTML = THEMAS.map((b) => `<button type="button" class="boek thema" data-boek="${b.id}" data-thema="${esc(b.thema)}" aria-pressed="${b === boek}">${b.thema === "kerst" ? STER : ""}<span>${esc(b.n)}</span></button>`).join("");
  }
  function renderDelen() {
    $("delenLabel").querySelector(".dl-boek").textContent = ` uit ${boek.n}`; // alleen zichtbaar in het keuzeblad (telefoon)
    $("delen").innerHTML = boek.delen.filter((d) => !d.hoofd).map((d) => `<button type="button" class="deel" data-deel="${d.id}" style="--pc:${color(d.c)}" aria-pressed="${d === deel || d === deel.hoofd}"><i>${esc(d.init || d.n[0])}</i>${esc(d.short)}<small>${esc(d.refKort || d.ref.split(/;|,/)[0].replace(/^(\d\s)?[^\d\s]+\s/, ""))}</small></button>`).join("");
  }
  const kiesBoekKnop = (e) => {
    const b = e.target.closest(".boek"); if (!b) return;
    chooseBoek(BOEKEN.find((x) => x.id === b.dataset.boek));
    // In het keuzeblad (telefoon) staan de delen bovenaan: na de keuze van een boek of thema komen die in beeld. De
    // stappenlijst bovenaan hoorde bij het vorige deel en verdwijnt dan.
    if (!$("kiesLade").hidden) { $("kiesStappen").hidden = true; $("kiesLade").querySelector(".lade__box").scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); }
  };
  $("boeken").addEventListener("click", kiesBoekKnop);
  $("themas").addEventListener("click", kiesBoekKnop);
  $("delen").addEventListener("click", (e) => { const b = e.target.closest(".deel"); if (!b) return; chooseDeel(boek.delen.find((x) => x.id === b.dataset.deel)); if (!$("kiesLade").hidden) { sluitLade("kiesLade"); naarBoven(); } });
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
    showAll = true; reisStop();
    deel.steps.forEach((t) => (t.r || []).forEach((r) => { r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts); }));
    routeState(); lySpecial.clearLayers(); map.removeLayer(lyKings);
    fit(partBounds(deel), 8); scrollToMap();
  };
  document.addEventListener("keydown", (e) => {
    if (mode !== "reis" || e.target.closest("input, select, textarea, [role='tablist']") || e.altKey || e.ctrlKey || e.metaKey || LADEN.some((id) => !$(id).hidden)) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  });

  // ---------- Bijbelverwijzingen ----------
  // De Bijbelreis is een hulpmiddel náást de eigen Bijbel of kinderbijbel: verwijzingen staan als tekst, de Bijbeltekst
  // zelf zit niet in de app (zo kan iedereen zijn eigen vertaling gebruiken).
  const parseRef = BR.parseRef;
  const refTekst = (r) => `<span class="bref">${esc(r)}</span>`;
  document.addEventListener("keydown", (e) => {
    const open = LADEN.map($).find((x) => !x.hidden); if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); sluitLade(open.id); return; }
    if (e.key !== "Tab") return;
    // Focus blijft in het venster zolang het open is.
    const f = [...open.querySelectorAll("button, input:not([tabindex='-1']), textarea, a[href], [tabindex]:not([tabindex='-1'])")].filter((x) => x.offsetParent && !x.disabled);
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
    const voor = document.body.dataset.modus; document.body.dataset.modus = m;
    themaAan();
    // Op de telefoon is de kaart per onderdeel anders van maat (in de reis is de kaart het scherm): Leaflet moet dat weten
    // vóórdat de uitsnede van het onderdeel gekozen wordt. Buiten de reis is er geen stapblad en geen grote kaart nodig.
    if (isNarrow()) {
      if (m !== "reis") bladZet(false, true); else if (document.body.classList.contains("mapfull")) setFull(false);
      // Een verborgen kaart (Paspoort, Tijdlijn, speurtocht zonder kaartvraag) houdt zijn laatste maat: anders verschuift de
      // uitsnede terwijl niemand hem ziet.
      if (voor !== m && map.getContainer().clientHeight) { kaartGrenzen(); map.invalidateSize({ pan: false }); }
      syncDrag();
    }
    heleZichtbaar();
    $("legend").hidden = !(m === "reis" || m === "verhalen"); $("legendBtn").hidden = !(m === "reis" || m === "verhalen");
    $("wereldBtn").hidden = !(m === "reis" || m === "verhalen");
    $("map").classList.toggle("quizmode", m === "quiz");
    lyQuiz.clearLayers();
    if (m !== "ver") { lyNL.clearLayers(); nlOn = false; $("nlBtn").textContent = "Leg Nederland op de kaart"; $("nlHint").hidden = true; }
    if (m === "quiz") { partRoutes.forEach((g) => map.removeLayer(g)); map.removeLayer(lyPlaces); map.removeLayer(lyKings); map.removeLayer(camel); lySpecial.clearLayers(); if (qBoek !== boek) { qBoek = boek; qPart = "alles"; } quizIntro(); }
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
    renderSeizoen();
    navZet(null);
    queueLabels();
  }
  // Op de telefoon staan de onderdelen in een vaste onderbalk: een nieuw onderdeel begint bovenaan, niet halverwege.
  TABS.forEach((t) => $("t-" + t).addEventListener("click", () => { const ander = mode !== t; setMode(t); if (ander && isNarrow()) window.scrollTo({ top: 0 }); }));
  document.querySelector(".tabs").addEventListener("keydown", (e) => {
    const i = TABS.indexOf(mode);
    // Pijltjes naar het volgende of vorige onderdeel; Home en End naar het eerste en het laatste (ARIA-patroon voor tabbladen).
    const n = e.key === "ArrowRight" || e.key === "ArrowLeft" ? TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length] : e.key === "Home" ? TABS[0] : e.key === "End" ? TABS[TABS.length - 1] : null;
    if (n) { e.preventDefault(); setMode(n); $("t-" + n).focus(); }
  });


  // ---------- de 150 geschiedenissen ----------
  // Een geschiedenis is een laag boven de reisstappen: ze wijst naar stappen (kaart, route, stempel) en voegt uitleg,
  // kernwoord, een ontdekking en vragen toe. Leidraad en nummering: docs/bijbelreis-150/.
  const LEIDRAAD = BR.leidraad || {};
  const G = (BR.geschiedenissen || []).slice().sort((a, b) => a.nr - b.nr);
  // De uitleg bij het tabblad Verhalen noemt het echte aantal (bijbelreis.html: #tu-verhalen).
  if ($("tu-verhalen")) $("tu-verhalen").textContent = `${G.length} geschiedenissen`;
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

  // ---------- reisniveaus ----------
  // a Samen ontdekken (4–6), b Zelf op reis (7–10), c Verder ontdekken (11+); inhoud in niveaus/*.js. Alleen de keuze wordt
  // lokaal bewaard (bijbelreis:niveau); voortgang en stempels zijn niet per niveau en blijven bij wisselen staan.
  // Wie al onderweg was (van vóór de reisniveaus), houdt de uitgebreide inhoud (c). Een nieuwe reiziger begint met
  // ‘Zelf op reis’ (b) en hoeft niet eerst te kiezen: de keuze staat klein op de startkaart en bovenin (renderWelkom).
  // Die standaard wordt meteen bewaard, anders zou een nieuwe reiziger bij het tweede bezoek voor ‘al onderweg’ doorgaan.
  const NIV = BR.niveaus || { soorten: {}, verhalen: {} };
  const NIVS = ["a", "b", "c"];
  const eerderOnderweg = store.get("gezien", []).length > 0 || Object.keys(verhaalStore).length > 0 || store.get("laatst", null) != null;
  let niveau = NIVS.includes(store.get("niveau", null)) ? store.get("niveau", null) : null;
  if (!niveau && eerderOnderweg) { niveau = "c"; store.set("niveau", "c"); store.set("niveauTip", true); }
  if (!niveau) { niveau = "b"; store.set("niveau", "b"); }
  document.body.dataset.niveau = niveau;
  const versie = (g, n = niveau) => (g && (NIV.verhalen[g.nr] || {})[n]) || null;
  const heeftSamen = (g) => !!versie(g, "a");
  const nivNaam = (n = niveau) => (NIV.soorten[n] || {}).n || "";
  const nivOpties = () => NIVS.map((k) => `<button type="button" class="nivopt" data-niveau="${k}" aria-pressed="${k === niveau}"><b>${esc(nivNaam(k))}</b><span>${esc(NIV.soorten[k].leeftijd)}</span><small>${esc(NIV.soorten[k].uitleg)}</small></button>`).join("");
  // Een nieuwe tekst die nog niet inhoudelijk is gecontroleerd, staat er nooit uit als ‘af’.
  const conceptLabel = (v, wat) => (v && v.status === "concept" ? `<p class="conceptlabel">Proefversie ${esc(wat)} · nog niet inhoudelijk gecontroleerd</p>` : "");
  const norm = (t) => String(t || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  G.forEach((g) => {
    const plaatsen = (g.stappen || []).flatMap((k) => (STEP_BY_KEY.get(k) || { at: [] }).at).map((id) => P[id] && P[id].n);
    g.zoek = norm([g.nr, g.t, g.ref, (g.wie || []).join(" "), g.kw && KW[g.kw] ? KW[g.kw].n : "", sectieOf(g.nr), plaatsen.join(" "), VORM[g.vorm] || ""].join(" "));
  });
  let vTest = "alle", vZoek = "", vOpen = null;

  // Ingang voor ouders, leiding en leerkrachten: de lesroutes (lessen.html, docs/bijbelreis-samen/README.md).
  const LESROUTES = '<p class="ls-ingang"><a href="/bijbelreis/lessen"><span>Samen lezen met kinderen of een groep?</span><b>Lesroutes met presentatie en vragen</b></a></p>';
  function renderVerhalen() {
    renderSeizoen();
    if (vOpen) return renderVerhaal(vOpen);
    const box = $("p-verhalen");
    // Samen ontdekken: groot en zonder zoeken; per etappe van de reis uitklapbaar, de etappe waar je bent staat open.
    if (niveau === "a") {
      const nu = (huidigeGeschiedenis().g || G[0]).nr;
      box.innerHTML = `<h2>Samen <em>ontdekken</em></h2><p class="ref">Kies een geschiedenis om samen te lezen. Elk verhaal gaat in korte stukjes, met een paar vragen aan het eind.</p>${LESROUTES}
        ${SECTIES.map(([naam, a, b], si) => {
          const items = G.filter((g) => g.nr >= a && g.nr <= b), k = items.filter((g) => verhaalStore[g.nr] && verhaalStore[g.nr].q != null).length;
          return `<details class="samensectie"${nu >= a && nu <= b ? " open" : ""}><summary class="vsectie"><span class="vs-n${k === items.length ? " af" : k ? " half" : ""}" aria-hidden="true">${si + 1}</span><span class="vs-t">${esc(naam)}</span><small>${k ? `${k} van ${items.length}` : `${items.length} verhalen`}</small></summary>
          <ul class="vul samenlijst">${items.map((g) => { const st = verhaalStore[g.nr]; return `<li><button type="button" class="vitem${st && st.q != null ? " klaar" : st ? " gezien" : ""}" data-v="${g.nr}"><span class="vnr">${g.nr}</span><span class="vt"><b>${esc(g.t)}</b></span>${st && st.q != null ? '<span class="vok" aria-label="gestempeld">✓</span>' : ""}</button></li>`; }).join("")}</ul></details>`;
        }).join("")}`;
      if (welkomAan) renderWelkom();
      focusHuidig();
      return;
    }
    const done = G.filter((g) => verhaalStore[g.nr]).length;
    box.innerHTML = `<h2>${G.length} <em>geschiedenissen</em></h2>
      <p class="ref">Van de schepping tot Openbaring. Kies een geschiedenis, of zoek op Bijbelboek, persoon, plaats of thema.${done ? ` Je hebt er ${done} gelezen.` : " Je kunt ook gewoon bij 1 beginnen en steeds ‘Volgende’ kiezen."}</p>
      ${LESROUTES}
      <label class="label" for="vZoek">Zoeken</label>
      <input type="search" id="vZoek" placeholder="Bijvoorbeeld: Jozef, Jericho, Lukas, gebed" value="${esc(vZoek)}" autocomplete="off" enterkeyhint="search">
      <div class="pick" role="group" aria-label="Testament">${[["alle", "Alles"], ["ot", "Oude Testament · 79"], ["nt", "Nieuwe Testament · 71"]].map(([k, n]) => `<button type="button" data-vt="${k}" aria-pressed="${vTest === k}" style="--pc:var(--acc)">${n}</button>`).join("")}</div>
      <div id="vLijst" class="vlijst"></div>
      <details class="kwlijst"><summary>Kernwoorden (${Object.keys(KW).length})</summary><div class="chips">${Object.entries(KW).sort((a, b) => a[1].n.localeCompare(b[1].n, "nl")).map(([id, k]) => `<button type="button" class="chip" data-kw="${id}">${esc(k.n)}</button>`).join("")}</div></details>
      <p class="misje"><button type="button" class="linkbtn" data-aanvraag>Mis je iets? Vraag het aan</button></p>`;
    $("vZoek").addEventListener("input", (e) => { vZoek = e.target.value; renderLijst(); });
    box.querySelectorAll("[data-vt]").forEach((b) => (b.onclick = () => { vTest = b.dataset.vt; box.querySelectorAll("[data-vt]").forEach((x) => x.setAttribute("aria-pressed", x === b)); renderLijst(); }));
    box.querySelectorAll("[data-kw]").forEach((b) => (b.onclick = () => { vZoek = KW[b.dataset.kw].n; $("vZoek").value = vZoek; renderLijst(); $("vZoek").scrollIntoView({ block: "nearest" }); }));
    renderLijst();
    if (welkomAan) renderWelkom();
    focusHuidig();
  }
  function renderLijst() {
    const q = norm(vZoek).split(/\s+/).filter(Boolean);
    const okT = (nr) => vTest === "alle" || (vTest === "ot" ? nr <= 79 : nr >= 80);
    let html = "", hits = 0;
    SECTIES.forEach(([naam, a, b], si) => {
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
      let k = 0; for (let n = a; n <= b; n++) if (verhaalStore[n]) k++;
      if (items.length) html += `<h3 class="vsectie"><span class="vs-n${k === b - a + 1 ? " af" : k ? " half" : ""}" aria-hidden="true">${si + 1}</span><span class="vs-t">${esc(naam)}</span><small>${k ? `${k} van ${b - a + 1} gelezen` : `${a}–${b}`}</small></h3><ul class="vul">${items.join("")}</ul>`;
    });
    // Niets gevonden: dan kan de bezoeker het aanvragen, met de zoekterm al ingevuld (de belangrijkste ingang van de aanvraag).
    $("vLijst").innerHTML = html || `<p class="ref">Niets gevonden voor ‘${esc(vZoek)}’. Probeer een andere naam, plaats of Bijbelboek.</p>${vZoek.trim() ? `<p class="misje"><button type="button" class="btn" data-aanvraag="gemist" data-av-tekst="${esc(`Ik zoek ‘${vZoek.trim().slice(0, 120)}’ en kan het niet vinden.`)}">Vraag dit aan</button></p>` : ""}`;
    if (q.length) $("vLijst").insertAdjacentHTML("afterbegin", `<p class="ref" role="status">${hits} gevonden</p>`);
  }
  // Zoeken (geschiedenissen, plaatsen, Vandaag): de lijst zoekt al bij het typen. De zoektoets van het telefoontoetsenbord
  // (Enter) sluit daarom alleen het toetsenbord, zodat de resultaten in beeld komen. Op een computer blijft de focus staan.
  const grofScherm = window.matchMedia("(hover: none) and (pointer: coarse)");
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing || !(e.target instanceof HTMLInputElement) || e.target.type !== "search") return;
    e.preventDefault();
    if (grofScherm.matches) e.target.blur();
  });
  $("p-verhalen").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });
  $("p-reis").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });

  function openVerhaal(nr, opts = {}) {
    const g = GBYNR.get(nr); if (!g) return;
    vOpen = nr; vStap = 0;
    // Wie zonder te kiezen een geschiedenis opent, houdt ‘Zelf op reis’; de keuze komt dan niet bij elk bezoek terug.
    if (!store.get("niveau", null)) store.set("niveau", niveau);
    store.weg("niveauTip");
    if (mode !== "verhalen") setMode("verhalen"); else renderVerhaal(nr);
    if (!opts.keepHash) navZet("#v" + nr);
    if (!verhaalStore[nr]) saveVerhaal(nr, { g: 1 });
    store.set("huidig", { v: nr });
    // Samen ontdekken op de telefoon: kaart en verhaalstap samen in beeld, dus naar boven in plaats van voorbij de kaart.
    if (isNarrow()) niveau === "a" ? window.scrollTo({ top: 0 }) : $("p-verhalen").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); else $("reisboek").scrollTo({ top: 0 });
  }
  const BOEKJE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg>';
  const xrefList = (items) => `<ul class="xrefs">${items.map(([r, t]) => `<li>${refTekst(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
  let vStap = 0; // Samen ontdekken: welke verhaalstap staat open
  function renderVerhaal(nr) {
    const g = GBYNR.get(nr), box = $("p-verhalen"); if (!g) { vOpen = null; return renderVerhalen(); }
    renderSeizoen();
    if (welkomAan) renderWelkom();
    // Een open kaartvraag van de vorige geschiedenis vervalt.
    tapHandler = null; $("map").classList.remove("quizmode"); lyQuiz.clearLayers();
    const steps = (g.stappen || []).map((x) => STEP_BY_KEY.get(x)).filter(Boolean);
    const prevG = G.slice().reverse().find((x) => x.nr < nr), nextG = G.find((x) => x.nr > nr);
    const crumb = `<nav class="crumb" aria-label="Waar ben je"><button type="button" class="linkbtn" id="vTerug">← Alle geschiedenissen</button><span class="muted">${esc(sectieOf(nr))}</span></nav>`;
    const nav = `<div class="navrow">
          <button type="button" class="btn" ${prevG ? `data-v="${prevG.nr}"` : "disabled"}>◀ ${prevG ? prevG.nr : ""}</button>
          <button type="button" class="btn primary" ${nextG ? `data-v="${nextG.nr}"` : "disabled"}>${nextG ? `${nextG.nr}. ${esc(nextG.t.length > 22 ? nextG.t.slice(0, 21) + "…" : nextG.t)}` : "Einde"} ▶</button>
        </div>`;
    const lees = g.ref ? `<p class="leesbijbel">${BOEKJE}<span>Lees in je Bijbel: <b>${esc(g.ref)}</b></span></p>` : "";
    if (niveau === "a") box.innerHTML = crumb + verhaalSamen(g, lees);
    else {
      const v = versie(g), c = niveau === "c", k = g.kw && KW[g.kw];
      const dt = g.tl === null || g.tijd === null ? datering({ tijd: null }) : g.tijd ? datering(g) : steps[0] ? datering(steps[0].deel) : null;
      const noot = g.tijdNoot || (!g.tijd && steps[0] && steps[0].deel.tijdNoot) || "";
      // Zelf op reis: eerst het tijdvak; het jaartal met zijn grond staat erachter. Verder ontdekken: jaartal met grond.
      const wanneer = !dt ? "" : c
        ? `<details class="wanneer"><summary><span class="w-l">Wanneer?</span><b>${esc(dt.tekst)}</b>${datTags(dt)}<span class="w-hoe">Hoe weten we dat?</span></summary><p>${esc(noot)}</p><p class="w-grond">${esc(datUitleg(dt))}</p></details>`
        : `<details class="wanneer"><summary><span class="w-l">Wanneer?</span><b>${dt.soort === "geen" ? "In het begin" : esc(sectieOf(nr))}</b><span class="w-hoe">Jaartal</span></summary><p class="w-jaar"><b>${esc(dt.tekst)}</b>${datTags(dt)}</p><p>${esc(noot)}</p></details>`;
      const golist = steps.length ? `<ul class="golist">${steps.map((s) => `<li><button type="button" class="linkbtn" data-go="${s.key}">${esc(s.t)}</button><small>${esc(s.ref)}</small></li>`).join("")}</ul>` : g.vorm === "symbool" || g.vorm === "thema" ? `<p class="ref">${g.vorm === "symbool" ? "De visioenen in dit gedeelte zijn beelden; ze staan niet als plaatsen op de kaart." : "Dit gedeelte is een profetie: het gaat om wat God belooft, niet om een reis."}</p>` : "";
      const kern = k ? `<h3>${esc(k.n)}</h3><p>${esc(k.uitleg)}</p>${(k.refs || []).length ? xrefList(k.refs) : ""}` : "";
      const blok = (titel, inhoud, open, extra = "") => (inhoud ? `<details class="blok${extra}"${open ? " open" : ""}><summary>${titel}</summary><div class="blok-in">${inhoud}</div></details>` : "");
      const verdieping = c && v && v.verdieping ? conceptLabel(v, "van de verdieping") + v.verdieping.map((d) => `<h4>${esc(d.kop)}</h4><p>${esc(d.t)}</p>${(d.refs || []).length ? `<p class="refs">${d.refs.map(refTekst).join(" · ")}</p>` : ""}`).join("") : "";
      const meer = c
        ? blok("Uitleg", g.betekenis ? `<p>${esc(g.betekenis)}</p>` : "", true) + blok("Verdieping", verdieping, false) + blok(k ? `Kernwoord: ${esc(k.n)}` : "", kern, false) + blok("Volg het op de kaart", golist, false) + blok("Elders in de Bijbel", (g.cross || []).length ? xrefList(g.cross) : "", false)
        : blok("Meer weten", [g.betekenis ? `<h4>Uitleg</h4><p>${esc(g.betekenis)}</p>` : "", k ? `<h4>Kernwoord: ${esc(k.n)}</h4><p>${esc(k.uitleg)}</p>` : "", steps.length ? `<h4>Volg het op de kaart</h4>${golist}` : "", (g.cross || []).length ? `<h4>Elders in de Bijbel</h4>${xrefList(g.cross.slice(0, 2))}` : ""].join(""), false, " meer");
      box.innerHTML = `${crumb}
      <article class="card verhaal" aria-labelledby="vTitel">
        <div class="top"><b>Geschiedenis ${nr}</b><span>${esc(VORM[g.vorm] || "")}</span></div>
        <h2 id="vTitel">${esc(g.t)}</h2>
        <p class="tijd metdeel"><span>${esc(g.ref)}</span>${deelKnop("v" + nr, g.t)}</p>
        ${wanneer}
        <div class="chips">${(g.wie || []).map((n) => personChip([n], verhaalBoek(g), true)).join("")}</div>
        ${!c ? conceptLabel(v, "voor Zelf op reis") : ""}
        <p class="label bl">Wat de Bijbel vertelt</p>
        <div id="vVertelling">${!c && v && v.delen ? vertellingVan(v.delen) : vertelling(g)}</div>
        ${lees}
        <div id="vOntdek" class="stack"></div>
        ${meer}
        <div id="vQuiz" class="stack"></div>
        <p class="deelrij">${deelKnop("v" + nr, g.t, "Deel deze geschiedenis")}</p>
        ${nav}
      </article>`;
      leesVerder($("vVertelling"));
      renderOntdek($("vOntdek"), g);
      renderVQuiz($("vQuiz"), g, c ? (g.quiz || []).concat((v && v.vragen) || []) : (v && v.vragen) || g.quiz);
      if (BR.tafereel) BR.tafereel.inVerhaal(box, steps, (k) => STEP_BY_KEY.get(k));
      if (BR.foto) BR.foto.inVerhaal(box, steps);
    }
    $("vTerug").onclick = () => { vOpen = null; navZet("#verhalen"); renderVerhalen(); heleZichtbaar(); };
    if (niveau === "a" && heeftSamen(g)) samenKoppelen(g); else focusStory(g);
    heleZichtbaar();
    setAccent2(steps[0] ? steps[0].deel.c : g.nr >= 80 ? "lila" : "kobalt");
  }
  // Samen ontdekken: één korte verhaalstap per scherm, grote knoppen, de kaart volgt mee; daarna twee-keuzevragen.
  // Zonder goedgekeurde of proefversie geen moeilijkere tekst alsof die passend is: dan een duidelijke melding.
  function verhaalSamen(g, lees) {
    const v = versie(g, "a");
    if (!v) return `<article class="card verhaal samen" aria-labelledby="vTitel"><h2 id="vTitel">${esc(g.t)}</h2>
        <div class="leeg"><p><b>${NIV.geladen && !NIV.geladen.a ? "De verhalen voor Samen ontdekken konden niet worden geladen." : "Deze geschiedenis is nog niet bewerkt voor Samen ontdekken."}</b></p><p>${NIV.geladen && !NIV.geladen.a ? "Controleer de verbinding en laad de pagina opnieuw. " : ""}Een volwassene kan ook de vertelling voor 7–10 jaar voorlezen.</p>
        <div class="samenkeus"><button type="button" class="btn" data-niveau="b">Lees de vertelling voor 7–10 jaar</button></div></div></article>`;
    const n = v.delen.length, i = Math.min(vStap, n), klaar = i >= n;
    const stip = (j) => `<i class="${j < i ? "af" : j === i ? "nu" : ""}"></i>`;
    return `<article class="card verhaal samen" aria-labelledby="vTitel">
        <h2 id="vTitel">${esc(g.t)}</h2>
        ${conceptLabel(v, "voor Samen ontdekken")}
        ${klaar ? `<div id="vQuiz" class="stack"></div>` : `<div class="a-stap" id="aStap" aria-live="polite"><p class="a-tekst">${esc(v.delen[i].t)}</p></div>
        <div class="a-stippen" role="img" aria-label="Stap ${i + 1} van ${n}">${Array.from({ length: n }, (_, j) => stip(j)).join("")}</div>
        <div class="a-nav"><button type="button" class="btn a-terug" id="aTerug" ${i ? "" : "disabled"} aria-label="Vorige stap">◀</button><button type="button" class="btn primary a-verder" id="aVerder">${i + 1 < n ? "Verder ▶" : "Naar de vragen ▶"}</button></div>`}
        <details class="samenvoor"><summary>Voor wie voorleest</summary><p>${esc(v.samen || "")}</p>${lees}</details>
      </article>`;
  }
  // Na het opbouwen van de Samen-pagina: knoppen koppelen, de kaart naar de plek van deze stap.
  function samenKoppelen(g) {
    const v = versie(g, "a"); if (!v) return;
    const n = v.delen.length;
    if (vStap >= n) { renderVQuiz($("vQuiz"), g, v.vragen, true); focusStory(g); return; }
    const d = v.delen[vStap];
    if (BR.tafereel) BR.tafereel.bijStap($("aStap"), d.stap && STEP_BY_KEY.get(d.stap));
    if (BR.foto) BR.foto.bijStap($("aStap"), d.stap && STEP_BY_KEY.get(d.stap));
    const ga = (j) => { vStap = j; renderVerhaal(g.nr); };
    $("aVerder").onclick = () => ga(vStap + 1);
    $("aTerug").onclick = () => ga(Math.max(0, vStap - 1));
    focusStory(d.stap ? { ...g, stappen: [d.stap] } : g);
  }
  // De vertelling in onderdelen met een rustige tussenkop (indeling.js). Bij een onderdeel dat bij een kaartstap hoort,
  // staat een ontdekmoment: die plek op de kaart bekijken zonder de geschiedenis te verlaten.
  const INDELING = BR.indeling || {};
  function vertelling(g) {
    const delen = INDELING[g.nr], tekst = g.uitleg || "";
    if (!delen || delen.length < 2) return `<p>${esc(tekst)}</p>`;
    const begin = delen.map(([, b], i) => (i === 0 ? 0 : tekst.indexOf(b)));
    if (begin.some((x, i) => x < 0 || (i && x <= begin[i - 1]))) return `<p>${esc(tekst)}</p>`;
    return vertellingVan(delen.map(([kop, , stap], i) => ({ kop, stap, t: tekst.slice(begin[i], begin[i + 1]).trim() })));
  }
  // Onderdelen [{kop, t, stap?}] als leesbare vertelling met ontdekmomenten (ook voor de versies in niveaus.js).
  function vertellingVan(delen) {
    return `<div class="vertelling">${delen.map(({ kop, t, stap }) => {
      const s = stap && STEP_BY_KEY.get(stap);
      return `<section class="vdeel"><h3 class="vkop">${esc(kop)}</h3><p>${esc(t)}</p>${s ? `<button type="button" class="kaartmoment" data-stapkaart="${esc(stap)}" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>Op de kaart: <b>${esc(s.t)}</b></span></button>` : ""}</section>`;
    }).join("")}</div>`;
  }
  // Ontdekmoment: alleen deze stap van de geschiedenis op de kaart; ‘Hele reis’ brengt de hele geschiedenis terug.
  $("p-verhalen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-stapkaart]"); if (!b || !vOpen) return;
    const g = GBYNR.get(vOpen), aan = b.getAttribute("aria-pressed") !== "true";
    $("p-verhalen").querySelectorAll("[data-stapkaart]").forEach((x) => x.setAttribute("aria-pressed", x === b && aan));
    focusStory(aan ? { ...g, stappen: [b.dataset.stapkaart] } : g);
    $("heleBtn").hidden = !aan && !(g.stappen || []).length;
    if (aan) scrollToMap();
  });
  // De knop ‘Hele reis’ alleen als er een route is om naar terug te gaan.
  function heleZichtbaar() { $("heleBtn").hidden = wereldAan || !((mode === "reis" && cur >= 0) || (mode === "verhalen" && vOpen && (GBYNR.get(vOpen).stappen || []).length)); }
  function setAccent2(c) { document.body.style.setProperty("--rc", color(c)); }

  // De kaart bij een geschiedenis: alle bijbehorende stappen (routes en plaatsen) tegelijk.
  function clearFocus() {
    if (!focus) return;
    (focus.delen || []).forEach((d) => { if (d !== deel) map.removeLayer(routeLayer(d)); });
    focus = null; wereldUit(); $("map").classList.remove("symbool", "gelijkenis");
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
    // Plaatsen van de geschiedenis: die van de stappen plus begin en eind van elke (niet-rode) route, zodat geen route
    // van een naamloos punt naar een naamloos punt loopt.
    const eind = steps.flatMap((s) => (s.r || []).filter((r) => r.w !== "rood").flatMap((r) => [r.p[0], r.p[r.p.length - 1]])).filter((x) => typeof x === "string" && P[x] && !P[x].k);
    focus = { keys: new Set(steps.map((s) => s.key)), at: [...new Set(steps.flatMap((s) => s.at).concat(eind))], delen };
    focus.kern = [eind[0] || steps[0].at[0], eind[eind.length - 1] || steps[steps.length - 1].at.slice(-1)[0]].filter(Boolean);
    // Samen ontdekken: alleen de paar plaatsen die het verhaal nodig heeft (niveaus.js), zonder de vaste context.
    // De ligging en het zekerheidsteken van die plaatsen blijven precies zoals ze zijn.
    const samen = niveau === "a" && versie(g, "a");
    if (samen && samen.plaatsen) { focus.at = focus.at.filter((id) => samen.plaatsen.includes(id)); focus.kern = focus.kern.filter((id) => samen.plaatsen.includes(id)); }
    // Alleen de plaatsen van deze geschiedenis (en de vaste context van het deel) op de kaart.
    lyPlaces.clearLayers(); lyAlt.clearLayers();
    focus.at.concat(niveau === "a" ? [] : d0.ctx || []).forEach((id) => { if (markers[id]) lyPlaces.addLayer(markers[id]); });
    // Andere mogelijke plekken alleen voor plaatsen van deze geschiedenis, niet voor de vaste context van het deel.
    if (niveau !== "a") focus.at.forEach((id) => (altMarkers[id] || []).forEach((m) => lyAlt.addLayer(m)));
    delen.forEach((d) => {
      map.addLayer(routeLayer(d));
      d.steps.forEach((s) => (s.r || []).forEach((r) => {
        r.line.setLatLngs(r.pts); r.casing.setLatLngs(r.pts);
        // Samen ontdekken: alleen de hoofdroute, geen rode zijroutes (die blijven bij de andere niveaus gewoon zichtbaar).
        const eindjes = [r.p[0], r.p[r.p.length - 1]].filter((x) => typeof x === "string");
        const verborgen = niveau === "a" && (r.w === "rood" || (samen && samen.plaatsen && !eindjes.every((x) => samen.plaatsen.includes(x))));
        const st = focus.keys.has(s.key) && !verborgen ? "active" : "future";
        [r.line, r.casing].forEach((l) => { const el = l.getElement(); if (el) { el.classList.remove("past", "active", "future", "hl"); el.classList.add(st); } });
        r.arrows.forEach((a) => { const e = a.getElement(); if (e) { e.firstChild.classList.toggle("off", st === "future"); e.firstChild.classList.remove("dim"); } });
      }));
    });
    const binnenSamen = (r) => !(samen && samen.plaatsen) || [r.p[0], r.p[r.p.length - 1]].filter((x) => typeof x === "string").every((x) => samen.plaatsen.includes(x));
    const pts = steps.flatMap((s) => (s.r || []).filter((r) => r.w !== "rood" && binnenSamen(r)).flatMap((r) => r.pts)).concat(focus.at.map(ll));
    const last = steps[steps.length - 1], lr = last.r && last.r[last.r.length - 1];
    const end = lr ? lr.pts[lr.pts.length - 1] : focus.at.length ? ll(focus.at[0]) : null;
    if (end) kameelZet(end);
    // Zonder route geen reisstip: die zou precies op de plaats (en het zekerheidsteken) staan.
    camelStyle(lr ? lr.w : d0.c, false, undefined, !lr);
    $("map").classList.toggle("gelijkenis", g.vorm === "gelijkenis" && !focus.at.length);
    if (pts.length) fit(pts, Math.max(...steps.map((s) => s.zoom || 9)));
    else { const v = steps.find((s) => s.view); fit(v && Array.isArray(v.view) ? v.view : v && v.view === "wide" ? WIDE : KANAAN, 8); }
    queueLabels();
  }
  // ---------- je reis nu: de startkaart volgt de voortgang ----------
  // Welke geschiedenis is ‘nu’? De laatst geopende; anders die bij de laatst bekeken reisstap; anders de eerste na
  // de verste gelezen geschiedenis; voor een nieuwe reiziger geschiedenis 1.
  function huidigeGeschiedenis() {
    const h = store.get("huidig", null);
    if (h && h.v && GBYNR.has(h.v)) return { g: GBYNR.get(h.v), hoe: "verhaal" };
    const key = (h && h.k) || store.get("laatst", null), st = key && STEP_BY_KEY.get(key);
    if (st) {
      const g = G.find((x) => (x.stappen || []).includes(key)) || G.find((x) => (x.stappen || []).some((k) => (STEP_BY_KEY.get(k) || {}).deel === st.deel));
      if (g) return { g, hoe: "stap", key };
    }
    const gelezen = Object.keys(verhaalStore).map(Number).filter((n) => GBYNR.has(n));
    if (gelezen.length) { const max = Math.max(...gelezen); const g = G.find((x) => x.nr > max); return g ? { g, hoe: "volgende" } : { g: GBYNR.get(max), hoe: "verhaal" }; }
    return { g: G[0], hoe: "nieuw" };
  }
  // Wie nog niet begonnen is, ziet eerst de hele Bijbelwereld (geschiedenis 1 heeft geen plaatsen op de kaart).
  function focusHuidig(eigen) {
    const h = huidigeGeschiedenis();
    // Samen ontdekken: nooit de drukke wereldkaart, altijd het verhaal van nu.
    if (niveau === "a") { if (h.g) focusStory(h.g); return; }
    if (!eigen && (wereldAan || h.hoe === "nieuw")) return focusWereld();
    if (h.g) focusStory(h.g);
  }
  // De hele Bijbelwereld: alle plaatsen uit alle reizen, zonder routes; namen naar zoomniveau.
  let wereldAan = false;
  // Dezelfde plaats staat soms twee keer in de gegevens, voor twee tijden (Babel van de toren en Babel van
  // Nebukadnezar): op de wereldkaart één keer, anders staat de naam er dubbel.
  const WERELD = [...new Set(ALLPARTS.flatMap((d) => d.steps.flatMap((s) => s.at)))].filter((id) => P[id] && !P[id].k && !P[id].ctx)
    .filter((id, i, a) => a.findIndex((o) => P[o].n === P[id].n && P[o].ll[0] === P[id].ll[0] && P[o].ll[1] === P[id].ll[1]) === i);
  // Ankerplaatsen met een vaste naam, verspreid over de hele Bijbel: van Ur tot Rome. De rest verschijnt bij inzoomen.
  const ANKERS = ["ur", "haran", "babelst", "ninivest", "susan", "damascusst", "salem", "sinai", "egypte", "nt_nazareth", "nt_antiochie", "nt_tarsus", "nt_efeze", "nt_filippi", "nt_patmos", "nt_malta", "nt_rome"].filter((id) => WERELD.includes(id));
  function focusWereld() {
    animToken++; lySpecial.clearLayers(); map.removeLayer(lyKings); map.closePopup();
    if (focus) clearFocus();
    wereldAan = true;
    focus = { keys: new Set(), at: ANKERS, kern: ["salem"], delen: [], wereld: true };
    partRoutes.forEach((gr) => map.removeLayer(gr));
    lyPlaces.clearLayers(); lyAlt.clearLayers();
    WERELD.forEach((id) => markers[id] && lyPlaces.addLayer(markers[id]));
    camelStyle(null, false, undefined, true);
    $("map").classList.remove("symbool", "gelijkenis"); $("map").classList.add("wereld");
    wereldKnop(); $("heleBtn").hidden = true;
    // Op een smal scherm past het hele gebied niet zonder de rand van de ondergrond te tonen: dan het kerngebied
    // (Macedonië tot Perzië); Rome en Malta liggen een veeg naar links.
    fit(WERELD.filter((id) => !(isNarrow() && P[id].ll[1] < 20)).map(ll), 6); queueLabels();
  }
  function wereldUit() { wereldAan = false; $("map").classList.remove("wereld"); wereldKnop(); }
  function wereldKnop() {
    const b = $("wereldBtn"); b.setAttribute("aria-pressed", wereldAan);
    b.querySelector("span").textContent = wereldAan ? "Jouw reis" : "Bijbelwereld";
    b.setAttribute("aria-label", wereldAan ? "Jouw reis: terug naar de kaart van je geschiedenis" : "Hele Bijbelwereld: alle plaatsen op de kaart");
  }
  $("wereldBtn").onclick = () => {
    if (!wereldAan) { focusWereld(); return; }
    wereldUit();
    if (mode === "reis") select(cur);
    else if (mode === "verhalen" && vOpen) { focusStory(GBYNR.get(vOpen)); heleZichtbaar(); }
    else focusHuidig(true);
  };

  // ---------- ontdekken: één bouwsteen per soort ----------
  // Het boek van een geschiedenis (van de eerste stap), voor de koppeling van namen aan personen.
  const verhaalBoek = (g) => { const s = (g.stappen || []).map((x) => STEP_BY_KEY.get(x)).find(Boolean); return s ? s.deel.boek.id : "*"; };
  function renderOntdek(host, g) {
    const o = g.ontdek; if (!o) return;
    host.innerHTML = `<p class="label">Ontdek</p><h3 class="otitel">${esc(o.titel || "")}</h3><div class="ontdek"></div>`;
    const box = host.querySelector(".ontdek");
    const soort = ONTDEK[o.soort] || ONTDEK.onthul;
    soort(box, o, g);
  }
  const refLink = (r) => (r ? ` ${refTekst(r)}` : "");
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
    stamboom(box, o, g) {
      const rijen = o.rijen || [];
      // Twee vormen: generaties (rijen met namen) of een lijst [naam, relatie, verwijzing].
      if (rijen.length && rijen.every((r) => r.length === 3 && parseRef(r[2]))) {
        box.innerHTML = `<ul class="famlijst">${rijen.map(([n, rel, r]) => { const id = mensIn(n, verhaalBoek(g)); return `<li>${id ? `<button type="button" class="chip" data-mens="${id}">${esc(n)}</button>` : `<b>${esc(n)}</b>`}<span>${esc(rel)}</span>${refLink(r)}</li>`; }).join("")}</ul>`;
        return;
      }
      box.innerHTML = `<div class="tree">${(o.rijen || []).map((row, i) => (i ? '<div class="arrow" aria-hidden="true">▼</div>' : "") + `<div class="gen">${row.map((n) => { const id = mensIn(n, verhaalBoek(g)); return id ? `<button type="button" class="person" data-mens="${id}">${esc(n)}</button>` : `<span class="person">${esc(n)}</span>`; }).join("")}</div>`).join("")}</div>${o.ref ? `<p class="ref">${refLink(o.ref)}</p>` : ""}`;
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
      const open = b.classList.toggle("open"); b.setAttribute("aria-expanded", open);
      const [, bet, r] = items[i];
      b.querySelector("span").innerHTML = open ? `${esc(bet)}${r ? ` <small>(${esc(r)})</small>` : ""}` : esc(vraag);
    }));
  }
  let tapHandler = null;

  // ---------- vragen bij een geschiedenis ----------
  // Vragen bij een geschiedenis. Eén stempel per geschiedenis, op elk niveau dezelfde: wisselen telt niets dubbel.
  // De score per niveau staat apart (lv), zodat een korte Samen-ronde geen eerdere score overschrijft.
  function renderVQuiz(host, g, Qs = g.quiz || [], samen = false) {
    if (!Qs || !Qs.length) return;
    let i = 0, score = 0;
    const order = Qs.map((q) => ({ ...q, opts: shuffle(q.a) }));
    function show(focus) {
      if (i >= order.length) {
        const st = verhaalStore[g.nr] || {}, best = st.q;
        saveVerhaal(g.nr, { q: best == null || score > best ? score : best, lv: { ...(st.lv || {}), [niveau]: Math.max(score, (st.lv || {})[niveau] ?? 0) } });
        host.innerHTML = `<p class="label">Vragen</p><div class="feedback ok">Klaar: ${score} van ${order.length} goed.<span>${score === order.length ? "Alles goed! Je hebt de stempel van deze geschiedenis." : "Je hebt de stempel van deze geschiedenis. Lees het nog eens na en probeer het opnieuw."}</span></div><button type="button" class="btn small" id="vqOpnieuw">Nog een keer</button>${samen ? `<button type="button" class="btn small" id="vqLees">Lees het verhaal nog eens</button>` : ""}`;
        host.querySelector("#vqOpnieuw").onclick = () => renderVQuiz(host, g, Qs, samen);
        if (samen) host.querySelector("#vqLees").onclick = () => { vStap = 0; renderVerhaal(g.nr); };
        toast(`Stempel: geschiedenis ${g.nr}`);
        if (focus) { const f = host.querySelector(".feedback"); f.tabIndex = -1; f.focus({ preventScroll: true }); }
        return;
      }
      const q = order[i];
      host.innerHTML = `<p class="label">Vraag ${i + 1} van ${order.length}</p><p class="qtext">${esc(q.q)}</p><div class="opts">${q.opts.map((o) => `<button type="button" class="opt">${esc(o)}</button>`).join("")}</div><div class="res" aria-live="polite"></div>`;
      if (focus) { const t = host.querySelector(".qtext"); t.tabIndex = -1; t.focus({ preventScroll: true }); }
      host.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = b.textContent === q.a[0]; if (ok) score++;
        host.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.textContent === q.a[0]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no");
        host.querySelector(".res").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "Goed!" : "Helaas."}<span>Het goede antwoord: ${esc(q.a[0])}.${q.why ? ` Lees ${refLink(q.why)}.` : ""}</span></div><button type="button" class="btn primary small" id="vqVolgende">${i + 1 < order.length ? "Volgende vraag ▶" : "Klaar"}</button>`;
        host.querySelector("#vqVolgende").onclick = () => { i++; show(true); };
        host.querySelector("#vqVolgende").focus({ preventScroll: true });
      }));
    }
    if (samen) { show(); return; }
    host.innerHTML = `<p class="label">Vragen</p><p class="ref">${order.length} vragen over deze geschiedenis.</p><button type="button" class="btn small" id="vqStart">Begin met de vragen</button>`;
    host.querySelector("#vqStart").onclick = () => show(true);
  }

  // ---------- tijdlijn ----------
  // Jaartallen zijn reconstructies (zie tijdNoot per deel); Genesis 1–11 krijgt bewust geen jaartal.
  // Samen ontdekken: alleen de volgorde, zonder jaartallen: de 16 etappes van de reis door de Bijbel.
  function renderTijdSamen() {
    const g = (vOpen && GBYNR.get(vOpen)) || huidigeGeschiedenis().g;
    $("p-tijd").innerHTML = `<h2>Wat kwam <em>eerst</em>?</h2><p class="ref">De Bijbel vertelt de geschiedenissen in een volgorde. Zo loopt de reis, van boven naar beneden.</p><ol class="samentijd">${SECTIES.map(([naam, a, b]) => { const nu = g && g.nr >= a && g.nr <= b; const hier = nu ? G.filter((x) => x.nr >= a && x.nr <= b) : []; return `<li class="${nu ? "nu" : ""}"><span class="st-stip" aria-hidden="true"></span><div><b>${esc(naam)}</b>${nu ? '<small>Hier ben je nu</small>' : ""}${hier.map((x) => `<button type="button" class="linkbtn" data-v="${x.nr}">${esc(x.t)}</button>`).join("")}</div></li>`; }).join("")}</ol>`;
  }
  $("p-tijd").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });
  function renderTijd() {
    if (niveau === "a") return renderTijdSamen();
    // Een thema staat niet tussen de Bijbelboeken op de tijdlijn (het vertelt dezelfde tijd nog eens), maar eronder,
    // onder een eigen kopje en in de volgorde van het thema.
    const lijn = VOLG.filter((d) => !d.boek.thema);
    const undated = lijn.filter((d) => !d.tl), dated = lijn.filter((d) => d.tl).sort((a, b) => a.tl[0] - b.tl[0] || a.tl[1] - b.tl[1]);
    const themaKop = (b) => `<h3 class="tl-thema">${b.thema === "kerst" ? STER : ""}<span>Thema: ${esc(boekKort(b))}</span><small>${esc(b.n)}</small></h3>`;
    const themaLijn = (rij) => THEMAS.map((b) => `${themaKop(b)}<ol class="tijdlijn tl-themalijn">${VOLG.filter((d) => d.boek === b).map(rij).join("")}</ol>`).join("");
    const waar = (d) => (d.boek.thema ? "" : esc(d.boek.n) + " · ") + esc(d.ref);
    const jaar = (y) => (y < 0 ? `${fmt(-y)} v.Chr.` : `${fmt(y)} n.Chr.`);
    // Verdiepende delen staan onder hun hoofddeel, niet als eigen punt op de tijdlijn.
    const onder = (d) => (d.verdiep || []).map((v) => `<button type="button" class="tl-sub" data-go="${v.key}:-1"${v === deel ? ' aria-current="true"' : ""}><span>Van dichtbij: <b>${esc(v.n)}</b></span><small>${esc(v.ref)}</small></button>`).join("");
    const isCur = (d) => d === deel || d === deel.hoofd;
    const wanneer = (d) => { const dt = datering(d); return !dt ? "" : `<span>${dt.soort === "geen" ? "Oergeschiedenis" : esc(dt.tekst)}</span><span class="tl-grond">${datTags(dt)}</span>`; };
    // Zelf op reis: de volgorde en de naam van het deel; het jaartal met zijn grond staat achter ‘Wanneer was dat?’.
    if (niveau === "b") {
      const rij = (d) => { const dt = datering(d); return `<li class="tl-item${isCur(d) ? " cur" : ""}" style="--pc:${color(d.c)}"><span class="tl-dot" aria-hidden="true"></span><div><button type="button" class="tl-go" data-go="${d.key}:-1"${d === deel ? ' aria-current="true"' : ""}><b>${esc(d.n)}</b><small>${waar(d)}</small></button>${onder(d)}${dt ? `<details><summary>Wanneer was dat?</summary><p class="tl-when">${dt.soort === "geen" ? "Oergeschiedenis" : esc(dt.tekst)}<span class="tl-grond">${datTags(dt)}</span></p>${d.tijdNoot ? `<p>${esc(d.tijdNoot)}</p>` : ""}</details>` : ""}</div></li>`; };
      $("p-tijd").innerHTML = `<h2>Wanneer <em>gebeurde</em> het?</h2><p class="ref">Van boven naar beneden: in deze volgorde vertelt de Bijbel het. Bij elk deel kun je zien wanneer dat ongeveer was, en hoe zeker dat is.</p><ol class="tijdlijn">${undated.concat(dated).map(rij).join("")}</ol>${themaLijn(rij)}`;
      const c = $("p-tijd").querySelector(".cur"); if (c) requestAnimationFrame(() => c.scrollIntoView({ block: "nearest" }));
      return;
    }
    const row = (d) => `<li class="tl-item${isCur(d) ? " cur" : ""}" style="--pc:${color(d.c)}"><span class="tl-dot" aria-hidden="true"></span><div><p class="tl-when">${wanneer(d)}</p><button type="button" class="tl-go" data-go="${d.key}:-1"${d === deel ? ' aria-current="true"' : ""}><b>${esc(d.n)}</b><small>${waar(d)}</small></button>${onder(d)}${d.tijdNoot ? `<details><summary>Hoe weten we dat?</summary><p>${esc(d.tijdNoot)}</p></details>` : ""}</div></li>`;
    let h = "", prev = null;
    dated.forEach((d) => {
      if (prev && d.tl[0] - prev.tl[1] >= 40) h += `<li class="tl-gap" aria-hidden="true">ruim ${fmt(Math.floor((d.tl[0] - prev.tl[1]) / 10) * 10)} jaar later</li>`;
      h += row(d); prev = !prev || d.tl[1] > prev.tl[1] ? d : prev;
    });
    $("p-tijd").innerHTML = `<h2>Wanneer <em>gebeurde</em> het?</h2><p class="ref">De Bijbel rekent in levensjaren en regeringsjaren, niet in onze jaartelling. Elk jaartal hier is dus omgerekend, en bij elk jaartal staat waarop het rust. Genesis 1–11 krijgt geen jaartal.</p><ul class="tl-uitleg"><li><span class="tl-dot-l" aria-hidden="true"></span><span>De <b>volgorde</b> komt uit de Bijbel.</span></li>${["bijbel", "historie", "onzeker", "geen"].map((k) => `<li class="dtrij">${datTags(k === "onzeker" ? { soort: "x", onzeker: true } : { soort: k }).replace(/<span class="dt dt-x"[^>]*>x<\/span>/, "")}<span>${esc(DAT.soorten[k] ? DAT.soorten[k].uitleg : "")}</span></li>`).join("")}</ul><ol class="tijdlijn">${undated.map((d) => row(d)).join("")}${undated.length ? `<li class="tl-gap" aria-hidden="true">geen jaartallen bekend</li>` : ""}${h}</ol>${themaLijn(row)}`;
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
  const SAMEN = { deuteronomium: "numeri", nehemia: "ezra", mattheus: "jezus-1", markus: "jezus-1", lukas: "jezus-1", johannes: "jezus-1", jesaja: "profeten", jeremia: "profeten", zacharia: "profeten", maleachi: "profeten",
    romeinen: "brieven", "1korinthe": "brieven", "2korinthe": "brieven", galaten: "brieven", efeze: "brieven", filippenzen: "brieven", kolossenzen: "brieven", "1thessalonicenzen": "brieven", "2thessalonicenzen": "brieven", "1timotheus": "brieven", "2timotheus": "brieven", titus: "brieven", filemon: "brieven" };
  function renderKast() {
    $("kastLijst").innerHTML = KAST.map(([g, list], gi) => `${gi === 4 ? '<p class="label nt">Nieuwe Testament</p>' : gi === 0 ? '<p class="label nt">Oude Testament</p>' : ""}<p class="label">${g}</p><div class="kastrij">${list.split(" ").map((x) => {
      const n = x.replace(/_/g, " "), id = SAMEN[slugOf(x)] || slugOf(x), b = BOEKEN.find((q) => q.id === id);
      const st = b ? (SAMEN[slugOf(x)] ? `in ‘${b.n.split(" en ")[0].split(":")[0]}’` : `${b.delen.reduce((a, d) => a + d.steps.length, 0)} stappen`) : "in ontwikkeling";
      return b ? `<button type="button" class="kb" data-boek="${b.id}"${b === boek ? ' aria-current="true"' : ""}><b>${esc(n)}</b><small>${esc(st)}</small></button>` : `<span class="kb off"><b>${esc(n)}</b><small>${st}</small></span>`;
    }).join("")}</div>`).join("");
    // Thema’s horen niet bij de 66 boeken: een eigen groep, onderaan; in het seizoen van het thema bovenaan.
    if (THEMAS.length) $("kastLijst").insertAdjacentHTML(SEIZOEN ? "afterbegin" : "beforeend", `<div class="kastthemas"><p class="label nt">Thema’s</p><div class="kastrij">${THEMAS.map((b) => `<button type="button" class="kthema" data-boek="${b.id}" data-thema="${esc(b.thema)}"${b === boek ? ' aria-current="true"' : ""}><b>${b.thema === "kerst" ? STER : ""}${esc(boekKort(b))}</b><small>${b.delen.length} delen · ${b.delen.reduce((a, d) => a + d.steps.length, 0)} stappen</small></button>`).join("")}</div></div>`);
  }
  // De overzichtsvensters (boekenkast, alle reizen, alle plaatsen) openen en sluiten op dezelfde manier.
  const LADEN = ["kast", "reizenLade", "plaatsenLade", "vandaagLade", "vandaagVenster", "kiesLade", "aanvraagLade"];
  // Er is altijd hooguit één venster zichtbaar. Opent een venster vanuit een ander (een overzicht uit het keuzeblad op de
  // telefoon), dan komt dat andere na Sluiten of Escape terug, met de focus op de knop waarmee je wegging.
  const ladeStapel = [];
  const openLade = (id) => {
    const boven = ladeStapel[ladeStapel.length - 1];
    if (boven && boven.id !== id && !$(boven.id).hidden) $(boven.id).hidden = true; else if (boven && $(boven.id).hidden) ladeStapel.length = 0;
    ladeStapel.push({ id, van: document.activeElement });
    $(id).hidden = false; $(id).querySelector(".lade__head button").focus();
    laagOpen(id);
  };
  const sluitLade = (id, terug = true) => {
    if (!$(id).hidden) laagDicht(id);
    $(id).hidden = true;
    const i = ladeStapel.map((x) => x.id).lastIndexOf(id), weg = i >= 0 ? ladeStapel.splice(i)[0] : null;
    if (!terug) { ladeStapel.forEach((x) => ($(x.id).hidden = true)); ladeStapel.length = 0; return; }
    const onder = ladeStapel[ladeStapel.length - 1];
    if (onder) $(onder.id).hidden = false;
    if (weg && weg.van && weg.van.isConnected) weg.van.focus();
  };
  LADEN.forEach((id) => { $(id).querySelector(".lade__head button").onclick = () => sluitLade(id); $(id).addEventListener("click", (e) => { if (e.target === $(id)) sluitLade(id); }); });

  // ---------- terug: de geschiedenis van de browser ----------
  // ‘Terug’ (de knop van de browser, de terugknop of terugveeg van de telefoon) gaat naar de vorige plek in de Bijbelreis
  // in plaats van de site uit (telefoontest 16-11-2026: elke stap verving het adres, dus terug was altijd weg).
  // Een plek is het onderdeel (Verhalen, Reis, Wie is wie …) met het deel of de geschiedenis uit het adres. Een andere
  // stap in hetzelfde deel is géén nieuwe plek: daarvoor zijn ◀ en Verder, en zo hoeft niemand twintig keer terug.
  // Een venster (lade, keuze voor wie, open stapblad, grote kaart) krijgt een eigen plek: ‘terug’ sluit eerst dat venster.
  // Alles wat binnen één tik gebeurt (bijvoorbeeld een onderdeel én een deel kiezen) telt als één plek.
  let navKlaar = false, navStil = false, navTik = false, navTerug = null;
  const navPlek = (hash) => mode + "|" + String(hash || "").split("/")[0];
  function navZet(hash) {
    const h = hash == null ? location.hash : hash;
    // Wordt er net een venster gesloten (history.back loopt nog), dan komt deze plek pas daarna.
    if (navTerug) { if (hash != null || navTerug.na === undefined) navTerug.na = hash; return; }
    const st = { br: 1, p: navPlek(h), m: mode }, oud = history.state;
    const nieuw = navKlaar && !navStil && !navTik && (!oud || !oud.br || oud.laag || oud.p !== st.p);
    if (hash == null) nieuw ? history.pushState(st, "") : history.replaceState(st, "");
    else nieuw ? history.pushState(st, "", hash) : history.replaceState(st, "", hash);
    if (nieuw) { navTik = true; setTimeout(() => (navTik = false), 0); }
  }
  function laagOpen(id) {
    if (!navKlaar || navStil) return;
    history.pushState(Object.assign({}, history.state, { br: 1, laag: id }), "");
  }
  function laagDicht(id) {
    if (!navKlaar || navStil || navTerug) return;
    const st = history.state;
    if (!st || st.laag !== id) return;
    const klaar = () => { const na = navTerug && navTerug.na; navTerug = null; if (na !== undefined) navZet(na); };
    navTerug = { na: undefined, t: setTimeout(klaar, 700), klaar };
    history.back();
  }
  // Het bovenste open venster (of null).
  function laagBoven() {
    if (!$("niveauKeuze").hidden) return "niveau";
    for (let i = ladeStapel.length - 1; i >= 0; i--) if (!$(ladeStapel[i].id).hidden) return ladeStapel[i].id;
    const lade = LADEN.find((id) => !$(id).hidden); if (lade) return lade;
    if ($("reisboek").classList.contains("open")) return "blad";
    if (document.body.classList.contains("mapfull")) return "full";
    return null;
  }
  function laagSluit(id) {
    navStil = true;
    try { if (id === "niveau") { niveauVenster(false); $("niveauBtn").focus(); } else if (id === "blad") bladZet(false); else if (id === "full") setFull(false); else sluitLade(id); }
    finally { navStil = false; }
  }
  // De plek uit het adres en de opgeslagen staat terugzetten (na ‘terug’ of ‘vooruit’).
  function navHerstel(st) {
    navStil = true;
    try {
      const [h, s] = decodeURIComponent(location.hash.slice(1)).split("/");
      const vm = /^v(\d+)$/.exec(h || "");
      if (vm && GBYNR.has(+vm[1])) { if (vOpen !== +vm[1] || mode !== "verhalen") openVerhaal(+vm[1], { keepHash: true }); return; }
      const d = ALLPARTS.find((x) => x.id === h);
      const doel = st && TABS.concat("ver").includes(st.m) ? st.m : d ? "reis" : "verhalen";
      if (d) { const i = s && d.steps[+s - 1] ? +s - 1 : -1; if (d !== deel || i !== cur) { if (d.boek !== boek) chooseBoek(d.boek, d, i, { keepHash: true }); else chooseDeel(d, i, { keepHash: true }); } }
      if (doel === "verhalen" && vOpen !== null) vOpen = null;
      if (mode !== doel) setMode(doel); else if (doel === "verhalen") { renderVerhalen(); heleZichtbaar(); }
      if (doel === "verhalen" && !h) renderWelkom();
      if (isNarrow()) window.scrollTo({ top: 0 });
    } finally { navStil = false; }
  }
  window.addEventListener("popstate", (e) => {
    if (navTerug) { clearTimeout(navTerug.t); navTerug.klaar(); return; }
    const st = e.state, boven = laagBoven();
    // Eerst een open venster sluiten.
    if (boven && !(st && st.laag === boven)) { laagSluit(boven); return; }
    // Een oude vensterplek waarvan het venster al dicht is: die overslaan.
    if (st && st.laag && !boven) { history.back(); return; }
    if (st && st.laag) return;
    navHerstel(st);
  });
  // ---------- aanvraag: ‘Mis je iets? Vraag het aan’ ----------
  // Een bezoeker vraagt om een Bijbelgedeelte, verhaal of reis die er nog niet is, om iets voor school, club of kerk, of
  // meldt een fout. Het formulier post naar de eigen site (POST /api/aanvraag, worker/aanvraag.ts). Wat er bewaard wordt:
  // docs/bijbelreis-aanvraag/README.md. Elke knop met data-aanvraag opent het; data-av-tekst vult de tekst alvast in.
  const AV_MIN = 10, AV_MAX = 600, AV_EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
  const AV_MISLUKT = "Het versturen lukte niet. Probeer het later nog eens, of mail naar info@denckh.nl.";
  const AV_OFFLINE = "Je bent nu niet verbonden met internet. Versturen kan nu niet. Je tekst blijft staan: probeer het straks nog eens.";
  let avBezig = false;
  const avFout = (id, melding) => {
    $(id).textContent = melding || "";
    const veld = id === "avTekstFout" ? $("avTekst") : id === "avMailFout" ? $("avMail") : null;
    if (veld) { if (melding) veld.setAttribute("aria-invalid", "true"); else veld.removeAttribute("aria-invalid"); }
  };
  const avTeller = () => { const n = [...$("avTekst").value].length; $("avTeller").textContent = `${n} van ${AV_MAX} tekens`; };
  function openAanvraag(soort, tekst) {
    const form = $("avForm");
    // Na een verstuurde aanvraag begint het formulier weer leeg; een half ingevulde tekst blijft staan.
    if (form.hidden) { form.reset(); form.hidden = false; $("avKlaar").hidden = true; }
    ["avTekstFout", "avMailFout", "avFout"].forEach((id) => avFout(id, ""));
    if (soort && form.elements.soort.value !== soort) [...form.elements.soort].forEach((r) => (r.checked = r.value === soort));
    if (tekst) $("avTekst").value = tekst.slice(0, AV_MAX);
    avTeller();
    openLade("aanvraagLade");
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-aanvraag]"); if (b) { e.preventDefault(); openAanvraag(b.dataset.aanvraag || "", b.dataset.avTekst || ""); } });
  $("avTekst").addEventListener("input", () => { avTeller(); if ($("avTekstFout").textContent && [...$("avTekst").value.trim()].length >= AV_MIN) avFout("avTekstFout", ""); });
  $("avMail").addEventListener("input", () => { if ($("avMailFout").textContent) avFout("avMailFout", ""); });
  $("avDicht").onclick = () => sluitLade("aanvraagLade");
  $("avForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (avBezig) return;
    const form = e.currentTarget, tekst = $("avTekst").value.trim(), email = $("avMail").value.trim();
    avFout("avFout", "");
    avFout("avTekstFout", [...tekst].length < AV_MIN ? `Schrijf iets meer: minstens ${AV_MIN} tekens.` : [...tekst].length > AV_MAX ? `Je tekst is te lang: hooguit ${AV_MAX} tekens.` : "");
    avFout("avMailFout", email && !AV_EMAIL.test(email) ? "Dit e-mailadres klopt niet. Kijk het na, of laat het veld leeg." : "");
    if ($("avTekstFout").textContent) { $("avTekst").focus(); return; }
    if ($("avMailFout").textContent) { $("avMail").focus(); return; }
    // Waar de bezoeker was: alleen het adres binnen de atlas (#jakob/7), als het een gewone vorm heeft.
    const context = /^#[A-Za-z0-9][A-Za-z0-9/=&_-]{0,78}$/.test(location.hash) ? location.hash : "";
    // Zonder internet (ook in de app op het beginscherm) niet eens proberen: meteen zeggen dat het nu niet kan.
    if (navigator.onLine === false) { avFout("avFout", AV_OFFLINE); return; }
    avBezig = true; $("avStuur").disabled = true; $("avStuur").textContent = "Versturen…";
    let gelukt = false, melding = AV_MISLUKT, veld = "";
    try {
      const r = await fetch("/api/aanvraag", { method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ soort: form.elements.soort.value, tekst, email, context, website: form.elements.website.value }) });
      const a = await r.json().catch(() => null);
      gelukt = r.ok && !!a && a.ok === true;
      if (!gelukt && a && typeof a.error === "string") { melding = a.error; veld = a.veld || ""; }
    } catch { if (navigator.onLine === false || document.documentElement.hasAttribute("data-offline")) melding = AV_OFFLINE; /* anders: de algemene melding */ }
    avBezig = false; $("avStuur").disabled = false; $("avStuur").textContent = "Versturen";
    if (!gelukt) {
      if (veld === "tekst") { avFout("avTekstFout", melding); $("avTekst").focus(); }
      else if (veld === "email") { avFout("avMailFout", melding); $("avMail").focus(); }
      else avFout("avFout", melding);
      return;
    }
    form.hidden = true; $("avKlaar").hidden = false; $("avKlaar").focus();
  });

  const closeKast = () => sluitLade("kast");
  $("kastBtn").onclick = () => { renderKast(); openLade("kast"); };
  $("kast").addEventListener("click", (e) => { const b = e.target.closest(".kb[data-boek], .kthema[data-boek]"); if (b) { closeKast(); setMode("reis"); chooseBoek(BOEKEN.find((x) => x.id === b.dataset.boek)); } });

  // ---------- overzicht: alle reizen ----------
  // Elke reis uit `trips`, met de afstand langs de getekende route. Per Bijbelboek, of de langste eerst.
  let reizenSort = "boek";
  function renderReizen() {
    const rijen = [];
    BOEKEN.forEach((b) => metVerdiep(b.delen).forEach((d) => (d.trips || []).forEach((t, ti) => {
      const routes = tripRoutes(d, t);
      if (routes.length) rijen.push({ b, d, t, ti, heel: t.s === "alles", km: roundKm(routes.reduce((a, r) => a + r.len, 0)) });
    })));
    const rij = (x) => `<li${x.d.hoofd && reizenSort !== "lang" ? ' class="sub"' : ""}><button type="button" class="orij" data-reis="${x.d.key}|${x.ti}"><span class="o-n"><b>${esc(x.t.n)}</b><small>${esc(x.b.n)} · ${esc(deelNaam(x.d))} · ${x.heel ? "alles bij elkaar" : esc(x.d.steps[x.t.s].ref)}</small></span><span class="o-km">ca. ${fmt(x.km)} km</span></button></li>`;
    const los = rijen.filter((x) => !x.heel);
    $("reizenSort").innerHTML = [["boek", "Per Bijbelboek"], ["lang", "Langste eerst"]].map(([k, n]) => `<button type="button" data-rs="${k}" aria-pressed="${k === reizenSort}" style="--pc:var(--acc)">${n}</button>`).join("");
    $("reizenAantal").textContent = `${los.length} reizen in ${new Set(rijen.map((x) => x.d)).size} delen. Tik op een reis om haar op de kaart te zien.`;
    $("reizenLijst").innerHTML = reizenSort === "lang"
      ? `<ol class="olijst">${los.slice().sort((a, b) => b.km - a.km).map(rij).join("")}</ol>`
      : BOEKEN.filter((b) => rijen.some((x) => x.b === b)).map((b) => `<h4 class="o-kop">${b.thema ? "Thema: " + esc(boekKort(b)) : esc(b.n)}</h4><ul class="olijst">${rijen.filter((x) => x.b === b).map(rij).join("")}</ul>`).join("");
  }
  $("reizenBtn").onclick = () => { renderReizen(); openLade("reizenLade"); };
  $("reizenLade").addEventListener("click", (e) => {
    const s = e.target.closest("[data-rs]"); if (s) { reizenSort = s.dataset.rs; renderReizen(); $("reizenSort").querySelector('[aria-pressed="true"]').focus(); return; }
    const b = e.target.closest("[data-reis]"); if (!b) return;
    const [key, ti] = b.dataset.reis.split("|"), d = ALLPARTS.find((x) => x.key === key);
    sluitLade("reizenLade", false); tripWens = { deel: d, n: d.trips[+ti].n }; setMode("ver"); scrollToMap();
  });

  // ---------- overzicht: alle plaatsen ----------
  // Alle plaatsen op naam, met hoe zeker de ligging is en hoe vaak ze in de reis voorkomen. Tikken toont de plaats op de kaart.
  const PL_SOORT = [["alle", "Alles"], ["v", "Identificeerbaar"], ["wb", "Waarschijnlijk of betwist"], ["o", "Onbekend"], ["r", "Gebied"]];
  const PLAATSLIJST = Object.entries(P).filter(([, p]) => !p.ctx).map(([id, p]) => ({ id, p, n: p.n.replace(/\?$/, ""), c: certOf(p), naam: norm(p.n), zoek: norm([p.n, p.nu || "", p.d || ""].join(" ")) })).sort((a, b) => a.n.localeCompare(b.n, "nl"));
  // Het soort staat er alleen bij als het geen stad of dorp is (het icoon ‘altaar’ of ‘tent’ hoort bij een verhaal, niet bij de plaats).
  const PL_TYPE = { berg: "berg", water: "water", put: "put of bron", kamp: "legerplaats", gebied: "gebied" };
  let plZoek = "", plSoort = "alle";
  function renderPlaatsen() {
    const q = norm(plZoek).split(/\s+/).filter(Boolean);
    const lijst = PLAATSLIJST.filter((x) => (plSoort === "alle" || plSoort.includes(x.c)) && q.every((w) => x.zoek.includes(w)));
    // Bij zoeken eerst de plaatsen waarvan de naam past, dan die waar het woord in de uitleg staat.
    const rang = (x) => (x.naam.startsWith(q[0]) ? 0 : q.every((w) => x.naam.includes(w)) ? 1 : 2);
    if (q.length) lijst.sort((a, b) => rang(a) - rang(b) || a.n.localeCompare(b.n, "nl"));
    const rij = (x) => { const hier = (STEPS_AT[x.id] || []).length; return `<li><button type="button" class="orij" data-place="${x.id}"><span class="zk zk-${x.c}" aria-hidden="true"><i></i></span><span class="o-n"><b>${esc(x.n)}</b><small>${x.c === "r" ? "gebied" : `${PL_TYPE[x.p.t] ? PL_TYPE[x.p.t] + " · " : ""}${ZEKER[x.c][0].toLowerCase()}`}${hier ? ` · ${hier} keer in de reis` : ""}${x.p.nu ? ` · nu: ${esc(x.p.nu)}` : ""}</small></span></button></li>`; };
    $("plSoort").innerHTML = PL_SOORT.map(([k, n]) => `<button type="button" data-ps="${k}" aria-pressed="${k === plSoort}" style="--pc:var(--acc)">${n}</button>`).join("");
    $("plAantal").textContent = lijst.length === PLAATSLIJST.length ? `${lijst.length} plaatsen en gebieden. Tik op een plaats om haar op de kaart te zien.` : `${lijst.length} van de ${PLAATSLIJST.length} plaatsen`;
    if (q.length || plSoort !== "alle") { $("plaatsenLijst").innerHTML = lijst.length ? `<ul class="olijst">${lijst.map(rij).join("")}</ul>` : `<p class="ref">Niets gevonden. Probeer een andere naam.</p>`; return; }
    const letters = [...new Set(lijst.map((x) => x.naam[0].toUpperCase()))];
    $("plaatsenLijst").innerHTML = letters.map((l) => `<h4 class="o-kop">${esc(l)}</h4><ul class="olijst">${lijst.filter((x) => x.naam[0].toUpperCase() === l).map(rij).join("")}</ul>`).join("");
  }
  $("plaatsenBtn").onclick = () => { renderPlaatsen(); $("plZoek").value = plZoek; openLade("plaatsenLade"); };
  $("plZoek").addEventListener("input", (e) => { plZoek = e.target.value; renderPlaatsen(); });
  $("plaatsenLade").addEventListener("click", (e) => {
    const s = e.target.closest("[data-ps]"); if (s) { plSoort = s.dataset.ps; renderPlaatsen(); $("plSoort").querySelector('[aria-pressed="true"]').focus(); return; }
    if (e.target.closest("[data-place]")) sluitLade("plaatsenLade", false); // de plaats zelf opent de algemene klikafhandeling (showPlace)
  });

  // ---------- overzicht: vandaag ----------
  // De plekken van de laag ‘Vandaag’ per streek, met de peildatum en de vaste zin dat de atlas geen partij kiest. Zoeken op naam en land.
  const VD_LIJST = VD.plekken.filter(vdLL).map((x) => ({ x, zoek: norm([x.n, x.land, x.plaats && P[x.plaats] ? P[x.plaats].n : ""].join(" ")) }));
  let vdZoek = "";
  function renderVandaag() {
    const q = norm(vdZoek).split(/\s+/).filter(Boolean);
    const lijst = VD_LIJST.filter((v) => q.every((w) => v.zoek.includes(w)));
    const rij = ({ x }) => { const bp = x.plaats && P[x.plaats]; return `<li><button type="button" class="orij" data-vandaag="${esc(x.id)}"><span class="vd-bord klein" aria-hidden="true">${VD_BORD}</span><span class="o-n"><b>${esc(x.n)}</b><small>${esc(x.land)}${bp ? ` · in de Bijbel: ${esc(bp.n.replace(/\?$/, ""))}` : ""}</small></span></button></li>`; };
    $("vdPeil").textContent = `Peildatum: ${VD.peil}.`;
    $("vdToelichting").textContent = VD.toelichting;
    $("vdAantal").textContent = lijst.length === VD_LIJST.length ? `${lijst.length} plekken. Tik op een plek om haar op de kaart van nu te zien.` : `${lijst.length} van de ${VD_LIJST.length} plekken`;
    if (!lijst.length) { $("vandaagLijst").innerHTML = `<p class="ref">Niets gevonden. Probeer een andere naam of een land.</p>`; return; }
    if (q.length) { $("vandaagLijst").innerHTML = `<ul class="olijst">${lijst.map(rij).join("")}</ul>`; return; }
    const streken = [...new Set(lijst.map((v) => v.x.streek || v.x.land))];
    $("vandaagLijst").innerHTML = streken.map((l) => `<h4 class="o-kop">${esc(l)}</h4><ul class="olijst">${lijst.filter((v) => (v.x.streek || v.x.land) === l).map(rij).join("")}</ul>`).join("");
  }
  const openVandaagLade = () => { renderVandaag(); $("vdZoek").value = vdZoek; openLade("vandaagLade"); };
  $("vandaagLijstBtn").onclick = openVandaagLade;
  $("vandaagLegendaBtn").onclick = openVandaagLade;
  $("vdZoek").addEventListener("input", (e) => { vdZoek = e.target.value; renderVandaag(); });
  $("vandaagLade").addEventListener("click", (e) => { const b = e.target.closest("[data-vandaag]"); if (b) { sluitLade("vandaagLade", false); showVandaag(b.dataset.vandaag); } });
  // Het blad van een plek (telefoon): de knop naar de Bijbelse plaats sluit het blad; de plaats zelf opent de algemene klikafhandeling.
  $("vandaagVenster").addEventListener("click", (e) => { if (e.target.closest("[data-place]")) sluitLade("vandaagVenster", false); });

  // ---------- wie is wie ----------
  let wieSel = null;
  // Samen ontdekken: de personen uit het verhaal van nu, elk met één zin. Geen stamboom.
  const eersteZin = (t) => { const m = String(t || "").match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : String(t || ""); };
  function renderWieSamen() {
    const g = (vOpen && GBYNR.get(vOpen)) || huidigeGeschiedenis().g, boekId = g ? verhaalBoek(g) : "*";
    const ids = (g && g.wie || []).map((n) => mensIn(n, boekId)).filter(Boolean);
    $("p-wie").innerHTML = `<h2>Wie zijn <em>erbij</em>?</h2>${g ? `<p class="ref">In ‘${esc(g.t)}’.</p>` : ""}${ids.length ? `<div class="samenwie">${ids.map((id) => `<button type="button" class="wiekaart" data-mens="${id}"><i style="background:${color(BR.personen[MENSEN[id].n] || "grijs")}">${esc(MENSEN[id].n[0])}</i><span><b>${esc(MENSEN[id].n)}</b><small>${esc(eersteZin(MENSEN[id].kort))}</small></span></button>`).join("")}</div>` : `<p>In dit verhaal komen geen personen met een naam voor.${g && g.nr === 1 ? " God maakt alles." : ""}</p>`}<div class="card" id="wieInfo" hidden></div>`;
  }
  function renderWie() {
    if (niveau === "a") return renderWieSamen();
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
      box.innerHTML = `<h2>Wie is <em>wie</em> ${boek.thema ? "bij " + esc(boekKort(boek)) : "in " + esc(boek.n)}?</h2><p>Tik op een naam om meer te weten.</p><div class="card" id="wieInfo"></div><div class="wie" id="wieList">${list.map((x) => `<button type="button" data-n="${esc(x.n)}" aria-pressed="false"><b>${esc(x.n)}</b><small>${esc(x.rol || "")}</small></button>`).join("")}</div>`;
      if (list.length) wieInfoBoek(wieSel); else $("wieInfo").innerHTML = "<p>Voor dit boek is nog geen lijst met personen.</p>";
    }
  }
  // Eén persoon met familie, gebeurtenissen, plaatsen en verwijzingen, allemaal uit BR.mensen en de stappen.
  const mensChip = (id, afgeleid, ook) => MENSEN[id] ? `<button type="button" class="chip${afgeleid ? " afgeleid" : ""}" data-mens="${id}"${afgeleid ? ' title="Afgeleid: zie ‘Waar staat dat?’"' : ""}><i style="background:${color(BR.personen[MENSEN[id].n] || "grijs")}">${esc(MENSEN[id].n[0])}</i>${esc(MENSEN[id].n)}${afgeleid ? '<small aria-label="afgeleid"> *</small>' : ""}${ook ? `<small class="ook">· ${esc(ook)}</small>` : ""}</button>` : "";
  // Grondslag van een familieband (personen.js, veld basis): ["b", ref] staat zo in de Bijbel; ["a", ref, redenering] is
  // afgeleid door teksten te combineren. Kerkelijke overlevering staat nooit in v/m/p maar apart in ‘overlevering’.
  function grondslag(ouder, soort, ander) {
    const b = (MENSEN[ouder] || {}).basis || {};
    if (soort === "p") return (b.p || {})[ander] || (((MENSEN[ander] || {}).basis || {}).p || {})[ouder] || null;
    return b[soort] || null;
  }
  const refBtn = refTekst;
  function mensDetails(id) {
    const m = MENSEN[id]; if (!m) return "";
    const kids = Object.keys(MENSEN).filter((k) => MENSEN[k].v === id || MENSEN[k].m === id);
    const partners = (m.p || []).concat(Object.keys(MENSEN).filter((k) => (MENSEN[k].p || []).includes(id) && !(m.p || []).includes(k)));
    // Een partner die ook broer of zus is (Sara bij Abraham, Genesis 20:12) staat één keer: bij ‘Getrouwd met’, met uitleg.
    const sibs = m.v || m.m ? Object.keys(MENSEN).filter((k) => k !== id && !partners.includes(k) && ((m.v && MENSEN[k].v === m.v) || (m.m && MENSEN[k].m === m.m))) : [];
    const ook = (k) => (m.ook || {})[k] || null;
    // Per band: [rol, persoon, grondslag]. Broers en zussen volgen uit dezelfde vader of moeder.
    const banden = [];
    if (m.v) banden.push(["Vader", m.v, grondslag(id, "v")]);
    if (m.m) banden.push(["Moeder", m.m, grondslag(id, "m")]);
    partners.forEach((k) => banden.push(["Getrouwd met", k, grondslag(id, "p", k)]));
    kids.forEach((k) => banden.push(["Kind", k, grondslag(k, MENSEN[k].v === id ? "v" : "m")]));
    const afg = new Set(banden.filter(([, , g]) => g && g[0] === "a").map(([, k]) => k));
    const fam = [["Vader", m.v ? [m.v] : []], ["Moeder", m.m ? [m.m] : []], ["Getrouwd met", partners], ["Kinderen", kids], ["Broers en zussen", sibs]].filter(([, l]) => l.some((k) => MENSEN[k]));
    const steps = MENS_STAPPEN[id] || [];
    const places = [...new Set(steps.flatMap(([d, i]) => d.steps[i].at || []))].filter((p) => P[p] && !P[p].ctx);
    let h = "";
    if (m.leeftijd && m.leeftijd.length) h += `<p class="ref">${m.leeftijd.map(([a, r]) => `${a} jaar (${esc(r)})`).join(" · ")}</p>`;
    if (fam.length) h += `<dl class="fam">${fam.map(([t, l]) => `<dt>${t}</dt><dd>${l.map((k) => mensChip(k, t !== "Broers en zussen" && afg.has(k), t === "Getrouwd met" && ook(k) ? ook(k)[0] : "")).join("")}</dd>`).join("")}</dl>`;
    if (banden.length) {
      const soortTekst = (g) => !g ? "Grondslag nog niet vastgelegd" : g[0] === "b" ? "Staat zo in de Bijbel" : "Afgeleid";
      h += `<details class="grond"${niveau === "c" ? " open" : ""}><summary>Waar staat dat?${afg.size ? ' <small>(* = afgeleid)</small>' : ""}</summary><ul class="xrefs">${banden.filter(([, k]) => MENSEN[k]).map(([rol, k, g]) => `<li><span><b>${esc(rol)}: ${esc(MENSEN[k].n)}</b> <span class="gs gs-${g ? g[0] : "x"}">${soortTekst(g)}</span>${g && g[1] ? " " + refBtn(g[1]) : ""}${g && g[2] ? `<br><small>${esc(g[2])}</small>` : ""}${rol === "Getrouwd met" && ook(k) ? `<br><small><b>${esc(ook(k)[0][0].toUpperCase() + ook(k)[0].slice(1))}:</b> ${refBtn(ook(k)[1])}${ook(k)[2] ? ". " + esc(ook(k)[2]) : ""}</small>` : ""}</span></li>`).join("")}${sibs.length ? `<li><span><b>Broers en zussen</b> <span class="gs gs-a">Afgeleid</span><br><small>Ze hebben dezelfde vader of moeder.</small></span></li>` : ""}</ul></details>`;
    }
    if (m.overlevering && m.overlevering.length) h += `<div class="fact overlevering"><b>Overlevering <span class="fs fs-h">Niet uit de Bijbel</span></b><ul>${m.overlevering.map(([t, u]) => `<li>${esc(t)}${u ? ` <small>${esc(u)}</small>` : ""}</li>`).join("")}</ul></div>`;
    // Zelf op reis: de eerste zes plekken in de reis; de rest uitklapbaar. Verder ontdekken: alles.
    const reisItem = ([d, i]) => `<li><button type="button" class="linkbtn" data-go="${d.key}:${i}">${esc(d.steps[i].t)}</button><small>${esc(d.steps[i].ref)}</small></li>`;
    if (steps.length) h += `<p class="label">In de reis</p><ul class="golist">${steps.slice(0, niveau === "c" ? steps.length : 6).map(reisItem).join("")}</ul>${niveau !== "c" && steps.length > 6 ? `<details class="meerreis"><summary>Nog ${steps.length - 6} keer in de reis</summary><ul class="golist">${steps.slice(6).map(reisItem).join("")}</ul></details>` : ""}`;
    if (places.length) h += `<p class="label">Plaatsen</p><div class="chips">${places.map((p) => `<button type="button" class="chip place" data-place="${p}">${esc(P[p].n)}</button>`).join("")}</div>`;
    if (m.elders && m.elders.length) h += `<p class="label">Elders in de Bijbel</p><ul class="xrefs">${m.elders.map(([r, t]) => `<li>${refBtn(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
    if (m.vervolg && m.vervolg.length) h += `<p class="label">Het verhaal gaat verder</p><ul class="xrefs">${m.vervolg.map(([r, t]) => `<li>${refBtn(r)}<span>${esc(t)}</span></li>`).join("")}</ul>`;
    return h;
  }
  function showMens(id) {
    const m = MENSEN[id]; if (!m) return;
    if (mode !== "wie") setMode("wie");
    wieSel = m.n;
    $("wieInfo").hidden = false;
    if (niveau === "a") { $("wieInfo").innerHTML = `<h3>${esc(m.n)}</h3><p>${esc(m.kort || "")}</p>`; $("wieInfo").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" }); return; }
    $("wieInfo").innerHTML = `<h3>${esc(m.n)}</h3>${m.alias && m.alias.length ? `<p class="ref">Ook: ${m.alias.map(esc).join(", ")}</p>` : ""}<p>${esc(m.kort || "")}</p>${mensDetails(id)}`;
    document.querySelectorAll("#p-wie [aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === m.n));
    // De kaart is vaak langer dan het scherm: begin bij de naam (op de telefoon net onder de kop), niet halverwege.
    $("wieInfo").scrollIntoView({ block: isNarrow() ? "start" : "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  function wieInfoGenesis(name) {
    wieSel = name;
    const sb = boek.stamboom;
    const all = sb.rijen.flat(); const t = all.find((x) => x.n === name); const ch = sb.leeftijden.find((x) => x[0] === name);
    const d = t && t.deel ? boek.delen.find((x) => x.id === t.deel) : null;
    const age = (t && t.a) || (ch && ch[1]);
    const info = (t && t.i) || sb.uitleg[name] || `Staat in het geslachtsregister van Genesis ${ch ? (ch[2].startsWith("5") ? "5" : "11") : ""}.`;
    $("wieInfo").innerHTML = `<h3>${esc(name)}</h3>${age ? `<p class="ref">Werd ${age} jaar${ch ? ` (Genesis ${esc(ch[2])})` : ""}</p>` : ""}<p>${esc(info)}</p>${d ? `<button type="button" class="btn primary" id="wieGo">Bekijk de reis van ${esc(name)} ▶</button>` : ""}`;
    if (d) $("wieGo").onclick = () => { setMode("reis"); chooseDeel(d); };
    const mid = mensOf(name, boek.id); if (mid) $("wieInfo").insertAdjacentHTML("beforeend", mensDetails(mid));
    document.querySelectorAll(".person, .chain button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === name));
  }
  function wieInfoBoek(name) {
    wieSel = name;
    const x = (boek.wie || []).find((p) => p.n === name); if (!x) return;
    const d = x.deel ? boek.delen.find((q) => q.id === x.deel) : null;
    $("wieInfo").innerHTML = `<h3>${esc(x.n)}</h3>${x.rol ? `<p class="ref">${esc(x.rol)}</p>` : ""}<p>${esc(x.i || "")}</p>${d ? `<button type="button" class="btn primary" id="wieGo">Bekijk de reis van ${esc(d.short)} ▶</button>` : ""}`;
    if (d) $("wieGo").onclick = () => { setMode("reis"); chooseDeel(d); };
    // ‘Silas, Timotheüs en Lydia’ of ‘Saulus / Paulus’: de eerste naam die bij een persoon hoort.
    const mid = name.split(/ en |, | \/ /).map((n) => mensOf(n.trim(), boek.id)).find(Boolean); if (mid) $("wieInfo").insertAdjacentHTML("beforeend", mensDetails(mid));
    document.querySelectorAll("#wieList button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.n === name));
  }
  $("p-wie").addEventListener("click", (e) => { const b = e.target.closest("[data-n]"); if (b && !b.closest("#wieInfo")) boek.stamboom ? wieInfoGenesis(b.dataset.n) : wieInfoBoek(b.dataset.n); });

  // ---------- speurtocht ----------
  let Q = [], qi = 0, score = 0, awaitingTap = null, qPart = "alles";
  // Het boek van de speurtocht. Bij het openen van het tabblad is dat het boek van de reis; in de speurtocht zelf kun je
  // een ander boek kiezen zonder dat de plek in de reis verandert.
  let qBoek = null;
  const qb = () => qBoek || boek;
  const quizOf = (d) => d.quiz || { tap: [], mc: [], ord: [] };
  // De speurtocht per reisniveau, over het gekozen Bijbelboek of één deel daarvan. Elk niveau heeft een eigen beste
  // score: Samen speuren (a) in samen:<boek>:<deel>, Zelf op reis (b) in speur:b:<boek>:<deel>, Verder ontdekken (c)
  // in de bestaande best:<boek>:<deel> (zo blijven de scores van vóór de reisniveaus staan).
  // ‘Waar gaan de vragen over?’: het hele boek of één deel. Een verdiepend deel (‘Van dichtbij’) heeft eigen vragen die
  // niet in zijn hoofddeel zitten; het staat daarom als kleinere knop direct na zijn hoofddeel.
  const speurOpties = () => [["alles", qb().thema ? "De hele " + (themaUi(qb()) ? themaUi(qb()).reis : qb().n) : "Heel " + qb().n, "var(--boter)", false]].concat(metVerdiep(qb().delen).map((d) => [d.id, d.hoofd ? "Van dichtbij: " + d.n : d.n, color(d.c), !!d.hoofd]));
  const speurKnoppen = (opts) => opts.map(([id, n, c, klein]) => `<button type="button" data-q="${id}" style="--pc:${c}" aria-pressed="${id === qPart}"${klein ? ' class="dichtbij-q"' : ""}>${esc(n)}</button>`).join("");
  // Het boek kiezen: een gewone keuzelijst met de Bijbelboeken en de thema’s.
  const speurBoekKeuze = () => `<label class="label qboek-l" for="qBoek">Boek</label><select id="qBoek" class="qboek">${BIJBELBOEKEN.map((b) => `<option value="${b.id}"${b === qb() ? " selected" : ""}>${esc(b.n)}</option>`).join("")}${THEMAS.length ? `<optgroup label="Thema’s">${THEMAS.map((b) => `<option value="${b.id}"${b === qb() ? " selected" : ""}>${esc(b.n)}</option>`).join("")}</optgroup>` : ""}</select>`;
  const speurOver = () => (qPart === "alles" ? (qb().thema ? (themaUi(qb()) ? themaUi(qb()).reis : qb().n) : qb().n) : (qb().delen.find((d) => d.id === qPart) || {}).n || qb().n);
  const bindBoek = (opnieuw) => { $("qBoek").onchange = (e) => { const b = BOEKEN.find((x) => x.id === e.target.value); if (b) { qBoek = b; qPart = "alles"; opnieuw(); $("qBoek").focus(); } }; };
  const speurSleutel = (n, b, deelId) => (n === "a" ? "samen:" : n === "b" ? "speur:b:" : "best:") + b + ":" + deelId;
  const verhalenIn = (delen) => G.filter((g) => (g.stappen || []).some((k) => delen.includes((STEP_BY_KEY.get(k) || {}).deel)));
  const delenVan = (id) => (id === "alles" ? qb().delen : [qb().delen.find((d) => d.id === id)]);
  // Samen speuren (4–6): zes vragen met twee antwoorden uit de verhalen van dit boek of deel. Over begrip van het
  // verhaal, niet over plaatsnamen of jaartallen.
  function samenSpeur() {
    const opts = speurOpties();
    if (!qb().delen.find((d) => d.id === qPart) && qPart !== "alles") qPart = "alles";
    const best = store.get(speurSleutel("a", qb().id, qPart), null);
    $("p-quiz").innerHTML = `<div class="card samenspeur"><h2>Samen <em>speuren</em></h2><p>Zes vragen over de verhalen. Kies het goede antwoord: er zijn steeds twee mogelijkheden.</p>${speurBoekKeuze()}<p class="label">Over welke verhalen?</p><div class="pick">${speurKnoppen(opts)}</div><p class="qwat">Zes vragen over ${esc(speurOver())}.</p>${best != null ? `<p><b>Beste score: ${fmt(best)} van 6</b></p>` : ""}<button type="button" class="btn primary" id="qGo">Begin</button></div>`;
    $("p-quiz").querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => { qPart = b.dataset.q; samenSpeur(); }));
    bindBoek(samenSpeur);
    $("qGo").onclick = () => {
      Q = shuffle(verhalenIn(delenVan(qPart)).flatMap((g) => ((versie(g, "a") || {}).vragen || []).map((x) => ({ t: "mc", ...x, uit: g.t })))).slice(0, 6);
      // Een deel zonder eigen verhalen (een losse reis): de vragen van de reis zelf, met twee antwoorden.
      if (!Q.length) Q = shuffle(delenVan(qPart).flatMap((d) => (quizOf(d).mc || []).map((x) => ({ ...x, ...bijDeel(d) })))).slice(0, 6).map((x) => ({ t: "mc", ...x, a: x.a.slice(0, 2) }));
      if (!Q.length) { $("p-quiz").innerHTML = "<div class='card'><p>Voor deze verhalen zijn nog geen vragen.</p></div>"; return; }
      quizKey = speurSleutel("a", qb().id, qPart); qi = 0; score = 0; uitslag = []; ask();
    };
    fit(WIDE, 6);
  }
  let quizKey = null;
  function quizIntro() {
    if (niveau === "a") return samenSpeur();
    const opts = speurOpties();
    if (!qb().delen.find((d) => d.id === qPart) && qPart !== "alles") qPart = "alles";
    const best = store.get(speurSleutel(niveau, qb().id, qPart), null);
    $("p-quiz").innerHTML = `<div class="card"><h2>Speur<em>tocht</em></h2><p>Soms wijs je een plek aan op de kaart, soms kies je het goede antwoord of zet je dingen in de goede volgorde.</p>${speurBoekKeuze()}<p class="label">Waar gaan de vragen over?</p><div class="pick">${speurKnoppen(opts)}</div><p class="qwat">Tien vragen over ${esc(speurOver())}. Een goed antwoord geeft een punt, bijna goed een half punt; aan het eind zie je je score en tot drie sterren.</p><p class="ref">In de speurtocht staan er geen namen op de kaart. Kijk goed naar de zeeën en rivieren!</p>${best != null ? `<p><b>Jouw beste score hier: ${fmt(best)} van 10</b></p>` : ""}<button type="button" class="btn primary" id="qGo">Start de speurtocht</button></div>`;
    $("p-quiz").querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => { qPart = b.dataset.q; quizIntro(); }));
    bindBoek(quizIntro);
    $("qGo").onclick = startQuiz;
    fit(WIDE, 6);
  }
  function startQuiz() {
    const delen = delenVan(qPart);
    // Zelf op reis: de meerkeuzevragen komen uit de vertellingen voor 7–10 jaar, met kaart- en volgordevragen.
    // Verder ontdekken: de vragen van de reis plus de verdiepende vragen van de geschiedenissen in deze delen.
    // Elke vraag weet waar hij vandaan komt (uit: de geschiedenis, bij: het deel), zodat hij ook tussen vragen over
    // andere verhalen te begrijpen is (‘Wie komt er met de schapen?’ staat onder ‘Uit: Jakob bij Laban’).
    const eigen = verhalenIn(delen).flatMap((g) => ((versie(g) || {}).vragen || []).map((x) => ({ ...x, uit: g.t })));
    quizKey = speurSleutel(niveau, qb().id, qPart);
    const vanDeel = (soort) => delen.flatMap((d) => (quizOf(d)[soort] || []).map((x) => (delen.length > 1 ? { ...x, ...bijDeel(d) } : x)));
    const tap = shuffle(vanDeel("tap")), ord = shuffle(vanDeel("ord").concat(qPart === "alles" ? qb().ordAlles || [] : []));
    const mc = niveau === "b" && eigen.length >= 4 ? shuffle(eigen) : shuffle(vanDeel("mc").concat(eigen));
    const nOrd = Math.min(niveau === "b" ? 1 : 2, ord.length), nTap = Math.min(niveau === "b" ? 3 : 4, tap.length), nMc = Math.min(10 - nOrd - nTap, mc.length);
    Q = shuffle([...tap.slice(0, nTap).map((x) => ({ t: "tap", ...x })), ...mc.slice(0, nMc).map((x) => ({ t: "mc", ...x })), ...ord.slice(0, nOrd).map((x) => ({ t: "ord", ...x }))]);
    if (!Q.length) { $("p-quiz").innerHTML = "<div class='card'><p>Voor dit deel zijn nog geen vragen.</p></div>"; return; }
    qi = 0; score = 0; uitslag = []; ask();
  }
  // Per beantwoorde vraag: goed (ok), bijna (mid) of fout (no), met het goede antwoord en de Bijbelplaats; voor ‘Lees nog
  // eens na’ op het eindscherm.
  let uitslag = [];
  const bijDeel = (d) => ({ bij: deelNaam(d) });
  const bron = (q) => (q.uit ? `<p class="qbron">Uit: <b>${esc(q.uit)}</b></p>` : q.bij ? `<p class="qbron">Over: <b>${esc(q.bij)}</b></p>` : "");
  const head = () => `<div class="qhead"><span>Vraag ${qi + 1} van ${Q.length}</span><span id="qPunten">Punten: ${fmt(score)}</span></div><div class="progress"><div id="qVoortgang" style="width:${((qi / Q.length) * 100).toFixed(0)}%"></div></div>`;
  // Meteen na het antwoord: de punten en de balk kloppen al, niet pas bij de volgende vraag.
  function beantwoord(q, res, goed) {
    uitslag.push({ q: q.q, res, goed, why: q.why || "" });
    if ($("qPunten")) $("qPunten").textContent = "Punten: " + fmt(score);
    if ($("qVoortgang")) $("qVoortgang").style.width = (((qi + 1) / Q.length) * 100).toFixed(0) + "%";
  }
  // Een antwoord als ‘Ik ben Jozef!’ of een citaat dat al op een punt eindigt, krijgt er geen tweede punt achter.
  const punt = (t) => (/[.!?…’'"]$/.test(String(t).trim()) ? String(t).trim() : String(t).trim() + ".");
  const leesNa = (r) => (r ? ` Lees het in je Bijbel: ${refTekst(r)}.` : "");
  const nextBtn = () => `<button type="button" class="btn primary" id="qNext">${qi + 1 < Q.length ? "Volgende vraag ▶" : "Bekijk je score"}</button>`;
  function bindNext() { $("qNext").onclick = () => { qi++; lyQuiz.clearLayers(); qi < Q.length ? ask() : finish(); }; $("qNext").focus({ preventScroll: true }); }
  const viewOf = (v) => (v === "wide" ? WIDE : v === "kanaan" ? KANAAN : v);
  function ask() {
    const q = Q[qi]; awaitingTap = null; lyQuiz.clearLayers();
    const box = $("p-quiz");
    // De knop waarmee je hier kwam is weg: de focus gaat naar de nieuwe vraag (na het opbouwen, onderaan).
    setTimeout(() => { const t = box.querySelector(".qtext"); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } });
    if (q.t === "tap") {
      box.innerHTML = `${head()}${bron(q)}<p class="qtext">${esc(q.q)}</p><div class="tapcall"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 11V5a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v2M17 11a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2"/></svg><span>Tik op de kaart${isNarrow() ? " hierboven" : ""}.</span></div>${tapKeuze(q)}<div id="qRes" aria-live="polite"></div>`;
      fit(viewOf(q.v), 8.5); awaitingTap = q; scrollToMap();
      box.querySelectorAll("[data-plaats]").forEach((b) => (b.onclick = () => { if (awaitingTap === q) tikAntwoord(L.latLng(ll(b.dataset.plaats))); }));
      const tk = box.querySelector(".tapkeuze"); if (tk) tk.addEventListener("toggle", () => { if (tk.open && awaitingTap === q) toonPlekken(); else if (!tk.open && awaitingTap === q) lyQuiz.clearLayers(); });
    } else if (q.t === "mc") {
      const opts = shuffle(q.a);
      box.innerHTML = `${head()}${bron(q)}<p class="qtext">${esc(q.q)}</p><div class="opts">${opts.map((o) => `<button type="button" class="opt">${esc(o)}</button>`).join("")}</div><div id="qRes" aria-live="polite"></div>`;
      box.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        const ok = b.textContent === q.a[0];
        box.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (x.textContent === q.a[0]) x.classList.add("ok"); });
        if (!ok) b.classList.add("no"); else score++;
        beantwoord(q, ok ? "ok" : "no", q.a[0]);
        $("qRes").innerHTML = `<div class="feedback ${ok ? "ok" : "no"}">${ok ? "Goed zo!" : "Helaas."}<span>Het goede antwoord: ${esc(punt(q.a[0]))}${leesNa(q.why)}</span></div>${nextBtn()}`;
        bindNext();
      }));
    } else {
      const opts = shuffle(q.items); const picked = [];
      box.innerHTML = `${head()}${bron(q)}<p class="qtext">${esc(q.q)}</p><p class="ref">Tik ze aan in de goede volgorde: eerst wat het eerst kwam.</p><div class="opts">${opts.map((o) => `<button type="button" class="opt" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div><button type="button" class="btn" id="qUndo">Opnieuw kiezen</button><div id="qRes" aria-live="polite"></div>`;
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
          beantwoord(q, ok ? "ok" : nOk >= 2 ? "mid" : "no", q.items.join(" → "));
          $("qRes").innerHTML = `<div class="feedback ${ok ? "ok" : nOk >= 2 ? "mid" : "no"}">${ok ? "Helemaal goed!" : nOk >= 2 ? "Bijna! Een half punt." : "Helaas."}<span>De goede volgorde: ${esc(q.items.join(" → "))}.</span></div>${nextBtn()}`;
          bindNext();
        }
      }));
      $("qUndo").onclick = () => { picked.length = 0; btns.forEach((b) => (b.textContent = b.dataset.v)); };
    }
  }
  // Hoe dichtbij moet je zijn: raak binnen ‘hit’ km, bijna binnen drie keer zoveel.
  const tapGrens = (q) => (q.v === "wide" ? 120 : 15) * (q.loose || 1) * (q.loose && q.v !== "wide" ? 2 : 1);
  // Een kaartvraag met het toetsenbord: vier genummerde plekken op de kaart (het goede antwoord en drie andere plaatsen uit
  // deze reis, niet binnen de ‘bijna’-afstand), en knoppen ‘Plek 1’ tot ‘Plek 4’. De namen staan er bewust niet bij: dan
  // blijft het een vraag over wáár het ligt. Een gekozen plek telt als een tik op die plaats.
  let tapPlekken = [];
  function tapKeuze(q) {
    const doel = ll(q.id), naam = (id) => (P[id] && P[id].n) || "";
    const pool = [...new Set(delenVan(qPart).flatMap((d) => (quizOf(d).tap || []).map((t) => t.id).concat(d.steps.flatMap((s) => s.at || []))))]
      .filter((id) => id !== q.id && P[id] && !P[id].ctx && naam(id) && hav(ll(id), doel) > tapGrens(q) * 3);
    const namen = new Set(), keuze = [];
    for (const id of shuffle(pool)) { if (keuze.length >= 3) break; if (!namen.has(naam(id))) { namen.add(naam(id)); keuze.push([id, naam(id)]); } }
    if (!keuze.length) return "";
    tapPlekken = shuffle(keuze.map(([id]) => id).concat([q.id]));
    return `<details class="tapkeuze"><summary>Liever kiezen uit vier plekken?</summary><p class="ref">Op de kaart staan nu vier genummerde plekken. Welke is het?</p><div class="plekken">${tapPlekken.map((id, i) => `<button type="button" class="plaatsopt" data-plaats="${esc(id)}">Plek ${i + 1}</button>`).join("")}</div></details>`;
  }
  function toonPlekken() {
    lyQuiz.clearLayers();
    const pts = tapPlekken.map((id) => ll(id));
    pts.forEach((pt, i) => L.marker(pt, { interactive: false, keyboard: false, icon: icon(`<span class="plekpin" aria-hidden="true">${i + 1}</span>`) }).addTo(lyQuiz));
    fit(pts, 8.5); scrollToMap();
  }
  map.on("click", (e) => {
    if (tapHandler) { tapHandler(e.latlng); return; }
    if (mode !== "quiz" || !awaitingTap) return;
    tikAntwoord(e.latlng);
  });
  function tikAntwoord(latlng) {
    const q = awaitingTap; awaitingTap = null; lyQuiz.clearLayers();
    const goal = ll(q.id), tap = [latlng.lat, latlng.lng], km = hav(tap, goal);
    const hit = tapGrens(q), near = hit * 3;
    const res = km <= hit ? "ok" : km <= near ? "mid" : "no";
    if (res === "ok") score++; else if (res === "mid") score += 0.5;
    beantwoord(q, res, q.name || (P[q.id] && P[q.id].n) || "");
    L.marker(tap, { interactive: false, icon: icon('<span class="tap"></span>') }).addTo(lyQuiz);
    L.marker(goal, { interactive: false, icon: icon(`<span class="goal"></span><span class="lab s-r on" style="display:block">${esc(q.name || (P[q.id] && P[q.id].n) || "")}</span>`) }).addTo(lyQuiz);
    if (res !== "ok") L.polyline([tap, goal], { className: "qline", interactive: false }).addTo(lyQuiz);
    fit([tap, goal], 9);
    $("qRes").innerHTML = `<div class="feedback ${res}">${res === "ok" ? "Raak!" : res === "mid" ? "Bijna! Een half punt." : "Mis."}<span>${res === "ok" && km < 5 ? "Precies goed." : `Je zat ${fmt(roundKm(km) || Math.round(km))} km ernaast.`}</span></div>${nextBtn()}`;
    document.querySelector(".tapcall").hidden = true;
    const tk = document.querySelector(".tapkeuze"); if (tk) tk.hidden = true;
    bindNext();
    if (isNarrow()) $("qRes").scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z"/></svg>';
  function finish() {
    const s = Math.round(score * 2) / 2, samen = niveau === "a", r = s / Q.length;
    const nStars = samen ? (r >= 0.99 ? 3 : r >= 0.6 ? 2 : r > 0 ? 1 : 0) : s >= 9 ? 3 : s >= 6 ? 2 : s >= 3 ? 1 : 0;
    const key = quizKey || speurSleutel(niveau, qb().id, qPart);
    const best = store.get(key, null), isBest = best == null || s > best;
    if (isBest) store.set(key, s);
    const words = samen ? ["Goed geprobeerd! Lees het verhaal nog eens samen.", "Mooi gedaan!", "Heel goed!", "Super! Jullie kennen het verhaal."] : ["Goed geprobeerd! Kijk nog eens bij de Reis en probeer het opnieuw.", "Mooi! Je weet al aardig wat.", "Heel goed! Jij kent de verhalen.", "Super! Jij bent een echte speurneus."];
    // Hoe de score is opgebouwd, en wat je nog eens kunt nalezen: de vragen die niet (helemaal) goed waren, met het goede
    // antwoord en de Bijbelplaats. Zo eindigt de speurtocht bij de Bijbel, niet alleen bij een getal.
    const tel = (r) => uitslag.filter((u) => u.res === r).length, nGoed = tel("ok"), nBijna = tel("mid"), nFout = tel("no");
    const opbouw = `<p class="qopbouw">${nGoed} goed${nBijna ? ` · ${nBijna} bijna (half punt)` : ""} · ${nFout} fout</p>`;
    const mis = uitslag.filter((u) => u.res !== "ok");
    const nalezen = mis.length ? `<div class="nalezen"><p class="label">${samen ? "Lees samen nog eens na" : "Lees nog eens na"}</p><ul>${mis.map((u) => `<li><span class="nl-v">${esc(u.q)}</span><span class="nl-a">${esc(u.goed)}${u.why ? ` · ${refTekst(u.why)}` : ""}</span></li>`).join("")}</ul></div>` : "";
    $("p-quiz").innerHTML = `<div class="card center"><h2>Klaar!</h2><div class="stars">${[0, 1, 2].map((i) => `<span class="${i < nStars ? "" : "off"}">${STAR}</span>`).join("")}</div><p class="big">${fmt(s)} <small>van ${Q.length}</small></p>${uitslag.length === Q.length ? opbouw : ""}<p>${words[nStars]}</p>${isBest && best != null ? "<p><b>Nieuw record!</b></p>" : ""}${nalezen}<button type="button" class="btn primary" id="qAgain">Nog een keer</button></div>`;
    $("qAgain").onclick = quizIntro;
    const kop = $("p-quiz").querySelector("h2"); kop.tabIndex = -1; kop.focus({ preventScroll: true });
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
  // De routes van één reis uit `trips`: één stap (eventueel één route daarvan) of alles van de hoofdpersoon van het deel.
  const tripRoutes = (d, t) => (t.s === "alles" ? d.steps.flatMap((s) => (s.r || []).filter((r) => r.w === d.c)) : ((d.steps[t.s] && d.steps[t.s].r) || []).filter((r, i) => t.r == null || i === t.r));
  let tripWens = null; // gekozen in het overzicht ‘Alle reizen’: { deel, n }
  function renderTrips() {
    TRIP_LIST = [];
    if (stepTrip) TRIP_LIST.push({ g: "Deze stap", n: `${stepTrip.deel.short}: ${stepTrip.t}`, routes: stepTrip.r, deel: stepTrip.deel });
    BOEKEN.forEach((b) => metVerdiep(b.delen).forEach((d) => (d.trips || []).forEach((t) => {
      const routes = tripRoutes(d, t);
      if (routes.length) TRIP_LIST.push({ g: b.n + " · " + deelNaam(d), n: t.n, routes, deel: d });
    })));
    const groups = [...new Set(TRIP_LIST.map((t) => t.g))];
    const sel = $("trip");
    const keep = stepTrip ? "0" : sel.value;
    stepTrip = null;
    sel.innerHTML = groups.map((g) => `<optgroup label="${esc(g)}">${TRIP_LIST.map((t, i) => (t.g === g ? `<option value="${i}">${esc(t.n)}</option>` : "")).join("")}</optgroup>`).join("");
    const first = TRIP_LIST.findIndex((t) => t.deel === deel);
    sel.value = keep && TRIP_LIST[+keep] ? keep : String(first >= 0 ? first : 0);
    if (tripWens) { const i = TRIP_LIST.findIndex((t) => t.deel === tripWens.deel && t.n === tripWens.n); if (i >= 0) sel.value = String(i); tripWens = null; }
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
  // De bovenste regel van een stempel: boek (afgekort) en hoofdstuk, bijv. ‘GENESIS 12’.
  const stempelBoven = (s) => s.ref.replace(/^(\d?\s?[A-Za-zëéïü]+)\s.*$/, "$1").toUpperCase().slice(0, 7) + " " + ((s.ref.match(/\s(\d+)/) || [])[1] || "");
  function stampSVG(s) {
    const w = s.r ? s.r[0].w : s.deel.c, c = color(w);
    const rot = ((s.i * 37 + s.deel.id.length * 11) % 17) - 8;
    const fs = s.stamp.length > 10 ? 11 : s.stamp.length > 8 ? 13 : 16;
    const top = stempelBoven(s);
    return `<svg viewBox="0 0 100 100" style="transform:rotate(${rot}deg)"><circle class="ring" cx="50" cy="50" r="44" stroke="${c}"/><circle class="ring2" cx="50" cy="50" r="37" stroke="${c}"/><text class="mono" x="50" y="33" font-size="9" fill="${c}">${esc(top)}</text> <text x="50" y="57" font-size="${fs}" fill="${c}">${esc(s.stamp)}</text> <text class="mono" x="50" y="76" font-size="10" fill="${c}">${s.i + 1}</text></svg>`;
  }
  // Eén stempelblad per deel. Ingeklapt laten we de stempels nog weg (619 stempels tekenen kost op een telefoon tijd);
  // ze komen er bij het openklappen.
  // De naam begint met precies wat er op de stempel staat (boek en hoofdstuk, woord, nummer; WCAG 2.5.3), dan de uitleg.
  const stempelKnop = (d, s) => `<button type="button" class="stamp${seen.has(s.key) ? "" : " no"}" data-key="${d.key}" data-s="${s.i}" aria-label="${esc(stempelBoven(s))} ${esc(s.stamp)} ${s.i + 1}: ${esc(d.n)}, stap ${s.i + 1}, ${esc(s.t)} (${esc(s.ref)})${seen.has(s.key) ? ", gestempeld" : ", nog niet bezocht"}">${stampSVG(s)}</button>`;
  const stempelsVan = (d) => d.steps.map((s) => stempelKnop(d, s)).join("");
  // Waar je was: de laatst geopende stap. Verder gaat naar de eerstvolgende stap zonder stempel in dat deel (of, als het
  // deel af is, terug naar die stap).
  function pasVerder() {
    const laatst = STEP_BY_KEY.get(store.get("laatst", null));
    if (!laatst) return null;
    const d = laatst.deel, na = d.steps.slice(laatst.i + 1).find((s) => !seen.has(s.key)) || d.steps.find((s) => !seen.has(s.key));
    return { laatst, naar: na || laatst, af: !na };
  }
  function renderStamps() {
    const total = ALLPARTS.reduce((a, d) => a + d.steps.length, 0);
    const pv = pasVerder(), hier = pv ? pv.laatst.deel : null;
    // Doorgaan waar je was, met de laatste stempel erbij.
    $("pasVerder").hidden = !pv;
    $("pasVerder").innerHTML = pv ? `<div class="pv-stempel" aria-hidden="true">${stampSVG(pv.laatst)}</div><div class="pv-tekst"><p class="label">Hier was je</p><p><b>${esc(deelNaam(hier))}</b> · stap ${pv.laatst.i + 1}: ${esc(pv.laatst.t)}</p><button type="button" class="btn primary" data-go="${pv.naar.key}">${pv.af ? `Terug naar stap ${pv.naar.i + 1}` : `Verder: stap ${pv.naar.i + 1}, ${esc(pv.naar.t)}`} <span aria-hidden="true">▶</span></button></div>` : "";
    // Per Bijbelboek een uitklapbaar blad met per deel ‘12 van 25’. Open staat alleen het boek en het deel waar je was
    // (zonder ‘waar je was’: de boeken met stempels); de rest is ingeklapt.
    const openBoek = (b, gotB) => (hier ? hier.boek === b : gotB > 0);
    $("stamps").innerHTML = BOEKEN.map((b) => { const kop = b === THEMAS[0] ? '<p class="label pas-themas">Thema’s</p>' : ""; const gotB = b.delen.reduce((x, d) => x + d.steps.filter((t) => seen.has(t.key)).length, 0), totB = b.delen.reduce((x, d) => x + d.steps.length, 0); return `${kop}<details class="pasboek"${openBoek(b, gotB) ? " open" : ""}><summary><b>${esc(b.n)}</b><span>${gotB} van ${totB}</span></summary>` + metVerdiep(b.delen).map((d) => {
      const got = d.steps.filter((s) => seen.has(s.key)).length, open = hier ? d === hier : got > 0 && got < d.steps.length;
      return `<details class="pasdeel${d.hoofd ? " pas-sub" : ""}" data-deel="${d.key}"${open ? " open" : ""}><summary class="label" style="color:${tekstKleur(d.c)}"><span>${esc(deelNaam(d))} · ${got} van ${d.steps.length}</span><span class="pasprog" aria-hidden="true"><i style="width:${((got / d.steps.length) * 100).toFixed(0)}%;background:${color(d.c)}"></i></span></summary><div class="stamps">${open ? stempelsVan(d) : ""}</div></details>`;
    }).join("") + "</details>"; }).join("");
    const n = ALLPARTS.reduce((a, d) => a + d.steps.filter((s) => seen.has(s.key)).length, 0);
    $("pasText").textContent = n === total ? `Alle ${total} stempels! Jij hebt de hele reis gemaakt.` : `Je hebt ${n} van de ${total} stempels. Ga verder met de reis om ze allemaal te verzamelen.`;
    const nV = Object.values(verhaalStore).filter((v) => v.q != null).length, nG = Object.keys(verhaalStore).length;
    $("vPasText").textContent = nG ? `${nG} van de ${G.length} geschiedenissen gelezen, ${nV} gestempeld (vragen gemaakt).` : "Lees een geschiedenis bij ‘Verhalen’ en maak de vragen om een stempel te krijgen.";
    $("vGrid").innerHTML = Array.from({ length: G.length }, (_, i) => { const nr = i + 1, v = verhaalStore[nr], g = GBYNR.get(nr); return `<button type="button" class="vcel${v && v.q != null ? " klaar" : v ? " gezien" : ""}" ${g ? `data-v="${nr}"` : "disabled"} aria-label="Geschiedenis ${nr}${g ? ": " + esc(g.t) : " (nog niet beschikbaar)"}${v && v.q != null ? ", gestempeld" : v ? ", gelezen" : ""}">${nr}</button>`; }).join("");
    // Beste scores van alle niveaus; een speurtocht over hetzelfde deel telt één keer mee.
    const bests = [], gedaan = new Set();
    BOEKEN.forEach((b) => [["alles", "alles uit " + b.n]].concat(metVerdiep(b.delen).map((d) => [d.id, deelNaam(d)])).forEach(([id, nm]) => NIVS.forEach((n) => {
      const v = store.get(speurSleutel(n, b.id, id), null); if (v == null) return;
      gedaan.add(b.id + ":" + id); bests.push(`${nm} ${fmt(v)}/${n === "a" ? 6 : 10}${n !== niveau ? ` (${nivNaam(n)})` : ""}`);
    })));
    $("bestText").textContent = bests.length ? "Beste scores speurtocht: " + bests.join(" · ") : "Je hebt de speurtocht nog niet gedaan.";
    const pct = (x, t) => `<div class="prog" aria-hidden="true"><div style="width:${t ? ((x / t) * 100).toFixed(1) : 0}%"></div></div>`;
    $("pasStats").innerHTML = `<div><b>${fmt(n)}</b><span>van ${fmt(total)} reisstempels</span>${pct(n, total)}</div><div><b>${nV}</b><span>van ${G.length} geschiedenissen gestempeld</span>${pct(nV, 150)}</div><div><b>${gedaan.size}</b><span>${gedaan.size === 1 ? "speurtocht gedaan" : "speurtochten gedaan"}</span></div>`;
    // Samen ontdekken: dezelfde stempels (niets per niveau, niets dubbel), maar eenvoudiger: twee getallen, de verhalen
    // die je al gelezen hebt, en de stempelbladen dicht.
    if (niveau === "a") {
      const samenG = G.filter((g) => verhaalStore[g.nr]);
      $("pasStats").innerHTML = `<div><b>${nV}</b><span>${nV === 1 ? "verhaal" : "verhalen"} met een stempel</span></div><div><b>${fmt(n)}</b><span>reisstempels</span></div>`;
      $("pasText").textContent = nV ? "Mooi! Maak de vragen bij een verhaal, dan krijg je een stempel." : "Lees samen een verhaal en maak de vragen. Dan krijg je een stempel.";
      $("vPasText").textContent = samenG.length ? "Tik op een verhaal om het nog eens te lezen." : "Hier komen de verhalen die je samen gelezen hebt.";
      $("vGrid").innerHTML = samenG.map((g) => { const v = verhaalStore[g.nr]; return `<button type="button" class="vcel groot${v && v.q != null ? " klaar" : v ? " gezien" : ""}" data-v="${g.nr}" aria-label="Geschiedenis ${g.nr}: ${esc(g.t)}${v && v.q != null ? ", gestempeld" : v ? ", gelezen" : ""}"><span>${g.nr}</span><small>${esc(g.t)}</small></button>`; }).join("");
      $("stamps").querySelectorAll("details").forEach((d) => (d.open = false));
      const sb = BOEKEN.flatMap((b) => ["alles"].concat(b.delen.map((d) => d.id)).map((id) => store.get(speurSleutel("a", b.id, id), null))).filter((x) => x != null);
      $("bestText").textContent = sb.length ? `Samen speuren: beste score ${fmt(Math.max(...sb))} van 6` : "";
    }
  }
  $("vGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });
  $("stamps").addEventListener("toggle", (e) => { const det = e.target; if (!det.classList || !det.classList.contains("pasdeel") || !det.open) return; const box = det.querySelector(".stamps"); if (box.childElementCount) return; const d = ALLPARTS.find((x) => x.key === det.dataset.deel); if (d) box.innerHTML = stempelsVan(d); }, true);
  $("stamps").addEventListener("click", (e) => { const b = e.target.closest(".stamp"); if (b) { const d = ALLPARTS.find((x) => x.key === b.dataset.key); setMode("reis"); if (d.boek !== boek) chooseBoek(d.boek, d, +b.dataset.s); else chooseDeel(d, +b.dataset.s); } });
  let resetArmed = false;
  $("resetPas").onclick = () => {
    if (!resetArmed) { resetArmed = true; $("resetPas").textContent = "Zeker weten? Tik nog een keer"; setTimeout(() => { resetArmed = false; $("resetPas").textContent = "Paspoort leegmaken"; }, 4000); return; }
    resetArmed = false; seen.clear(); store.set("gezien", []);
    BOEKEN.forEach((b) => ["alles"].concat(b.delen.map((d) => d.id)).forEach((id) => { store.set("best:" + b.id + ":" + id, null); store.weg(speurSleutel("a", b.id, id)); store.weg(speurSleutel("b", b.id, id)); }));
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
    const t = e.target.closest("[data-go], [data-mens], [data-place], [data-crumb], [data-tab]"); if (!t) return;
    if (t.dataset.go) goKey(t.dataset.go);
    else if (t.dataset.mens) showMens(t.dataset.mens);
    else if (t.dataset.place) showPlace(t.dataset.place);
    else if (t.dataset.crumb === "boek") chooseBoek(boek);
    else if (t.dataset.crumb === "deel") select(-1);
    else if (t.dataset.crumb === "hoofd") chooseDeel(deel.hoofd || deel);
    else if (t.dataset.tab) setMode(t.dataset.tab);
  });

  // ---------- kaartbediening: toen/nu, legenda, grote kaart, twee vingers op een telefoon ----------
  let nuAan = false;
  function setNu(on) {
    nuAan = !!on;
    $("nuBtn").setAttribute("aria-pressed", on); $("toenBtn").setAttribute("aria-pressed", !on);
    $("lgNu").hidden = !on; $("lgToen").hidden = on;
    map.getContainer().classList.toggle("nu", on);
    $("kaartBtn").querySelector("span").textContent = on ? "Kaart · nu" : "Kaart";
    if (on) loadModern().then(() => { if (nuAan) { map.addLayer(lyModern); queueLabels(); } }); else map.removeLayer(lyModern);
    syncVandaag();
  }
  // Laag ‘Vandaag’: alleen in de stand ‘Nu’, standaard uit; de keuze wordt onthouden (bijbelreis:vandaag). Niet bij Samen ontdekken.
  let vandaagAan = store.get("vandaag", false) === true;
  function syncVandaag() {
    const aan = nuAan && vandaagAan && niveau !== "a";
    $("vandaagBtn").hidden = !nuAan; $("vandaagBtn").setAttribute("aria-pressed", vandaagAan);
    if (aan) map.addLayer(lyVandaag); else { map.removeLayer(lyVandaag); if (vdOpen) map.closePopup(vdBallon); }
    queueLabels();
  }
  function setVandaag(on, zeg) {
    vandaagAan = !!on; store.set("vandaag", vandaagAan); syncVandaag();
    if (zeg) toast(vandaagAan ? `Vandaag: ${Object.keys(vdMarkers).length} plekken. Tik op een blauw bordje.` : "Laag ‘Vandaag’ uit");
  }
  $("vandaagBtn").onclick = () => setVandaag(!vandaagAan, true);
  function showVandaag(id) {
    const m = vdMarkers[id]; if (!m || niveau === "a") return;
    map.closePopup();
    if (!nuAan) setNu(true);
    if (!vandaagAan) setVandaag(true);
    map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 7), { duration: reduceMotion ? 0 : 0.6 });
    setTimeout(() => { if (!map.hasLayer(lyVandaag)) return; const el = m.getElement(); if (el) el.focus({ preventScroll: true }); openVandaag(m.vd); }, reduceMotion ? 0 : 650);
    scrollToMap();
  }
  // Wisselt het reisniveau, dan volgt de laag (bij Samen ontdekken is ze er niet).
  document.addEventListener("click", (e) => { if (e.target.closest("button[data-niveau]")) setTimeout(syncVandaag, 0); });
  $("toenBtn").onclick = () => setNu(false);
  $("nuBtn").onclick = () => setNu(true);
  function setLegend(open) { $("legend").classList.toggle("open", open); $("legendBtn").setAttribute("aria-expanded", open); $("legendBtn").querySelector("span").textContent = open ? "Sluit" : "Legenda"; $("legendBtn").setAttribute("aria-label", open ? "Sluit legenda" : "Legenda"); queueLabels(); }
  $("legendBtn").onclick = () => { const open = !$("legend").classList.contains("open"); setLegend(open); store.set("legenda", open); };
  $("legendSluit").onclick = () => { setLegend(false); store.set("legenda", false); $("legendBtn").focus(); };
  // Op de telefoon schuift de legenda over de pagina: daar niet vanzelf openen.
  setLegend(store.get("legenda", false) && !isNarrow());
  const touchy = window.matchMedia("(pointer: coarse)");
  function setFull(on) {
    if (on !== document.body.classList.contains("mapfull")) on ? laagOpen("full") : laagDicht("full");
    document.body.classList.toggle("mapfull", on);
    $("fullBtn").setAttribute("aria-pressed", on);
    $("fullBtn").querySelector("span").textContent = on ? "Terug" : "Groot";
    $("fullBtn").setAttribute("aria-label", on ? "Terug naar het reisboek" : "Groot: kaart op volledig scherm");
    setTimeout(() => { map.invalidateSize(); syncDrag(); queueLabels(); }, 60);
    if (!on) $("fullBtn").focus();
  }
  $("fullBtn").onclick = () => setFull(!document.body.classList.contains("mapfull"));
  // ‘Hele reis’: terug naar de volledige route van het deel (Reis) of van de geschiedenis (Verhalen).
  $("heleBtn").onclick = () => {
    $("p-verhalen").querySelectorAll("[data-stapkaart]").forEach((x) => x.setAttribute("aria-pressed", false));
    if (mode === "verhalen" && vOpen) focusStory(GBYNR.get(vOpen)); else if (mode === "reis") select(-1);
  };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && document.body.classList.contains("mapfull") && $("lade").hidden && $("kast").hidden) setFull(false); });
  // Op een telefoon in het reisboek: met één vinger scroll je de pagina, met twee vingers beweeg je de kaart (Leaflet-knijpzoom verschuift ook).
  // In de reis is de kaart het scherm en scrolt de pagina niet: daar sleep je de kaart gewoon met één vinger.
  function syncDrag() {
    const embed = touchy.matches && isNarrow() && !document.body.classList.contains("mapfull") && !bladAan();
    embed ? map.dragging.disable() : map.dragging.enable();
    map.getContainer().classList.toggle("embed", embed);
  }
  let gestureT;
  map.getContainer().addEventListener("touchmove", (e) => {
    if (!map.getContainer().classList.contains("embed") || e.touches.length !== 1) return;
    $("gesture").hidden = false; clearTimeout(gestureT); gestureT = setTimeout(() => ($("gesture").hidden = true), 1400);
  }, { passive: true });
  window.addEventListener("resize", () => { syncDrag(); bladKort(); queueLabels(); });

  // ---------- telefoon (tot 900 px): het beeld eerst, de rest één tik verder ----------
  // Zie docs/bijbelreis-audit/telefoon.md. Op de telefoon verhuizen twee onderdelen (de keuze van boek en deel met de
  // overzichten naar het blad ‘Kies een reis’, Bijbelwereld naar het kaartpaneel); de rest is opmaak in het telefoonblok
  // van bijbelreis.css. Boven 900 px verandert er niets.
  const smalMq = window.matchMedia("(max-width: 900px)");
  function telefoonIndeling() {
    // De stappenbalk (◀ en Verder) hoort op de telefoon bij het stapblad: onderaan het blad, na de tekst.
    if (smalMq.matches) { $("kiesPlek").appendChild($("kiezen")); $("kaartPaneel").appendChild($("wereldBtn")); $("reisboek").appendChild($("mapbar")); }
    else {
      $("p-reis").insertBefore($("kiezen"), $("p-reis").firstChild); $("heleBtn").before($("wereldBtn")); document.querySelector(".mapwrap").appendChild($("mapbar"));
      if (!$("kiesLade").hidden) sluitLade("kiesLade", false);
      kaartMenu(false); bladZet(false, true);
    }
  }
  smalMq.addEventListener("change", () => { telefoonIndeling(); syncDrag(); kaartGrenzen(); map.invalidateSize({ pan: false }); bladKort(); toonGekozen("boeken"); toonGekozen("delen"); });
  // Eén kleine regel bovenaan het stapblad: ‘Genesis › Abraham · 2 van 25’; een tik opent het keuzeblad.
  function kiesRegel(n) {
    // Bij een verdiepend deel staat het hoofddeel vooraan in plaats van het boek: ‘Jakob › Jakob bij de Jabbok’.
    // Past de regel niet naast ‘Lees meer’, dan valt het boek (of hoofddeel) weg: het deel en de stap blijven staan
    // (bladPast zet .smal). In het overzicht van een deel staat de naam van het deel al als titel eronder.
    // Bij een thema (Kerst) staat er een ster voor, en in het overzicht van een deel ‘deel 3 van 6’ in plaats van het aantal stappen.
    const pad = [deel.hoofd ? deel.hoofd.short : boekKort(boek)].map((x) => `<span class="kr-kort">${esc(x)}</span><span class="kr-pijl" aria-hidden="true">›</span>`).join("");
    const rij = boek.thema && !deel.hoofd ? reeks(deel) : [];
    const waar = cur >= 0 ? `${cur + 1} van ${n}` : rij.length ? `deel ${rij.indexOf(deel) + 1} van ${rij.length}` : `${n} stappen`;
    // De naam voor de schermlezer is de zichtbare tekst met ervoor ‘Kies een reis. Nu:’ (verborgen tekst, geen aria-label):
    // zo staat wat je ziet altijd in de naam (WCAG 2.5.3), ook als het boek of het deel wegvalt.
    $("kiesBtn").innerHTML = `${boek.thema ? STER : ""}<span class="sr-only">Kies een reis. Nu: </span><span class="kr-pad">${pad}<b>${esc(deel.hoofd ? deel.n : deel.short)}</b></span>${cur < 0 ? `<span class="sr-only">${esc(deelNaam(deel))}, overzicht: </span>` : '<span class="sr-only">stap </span>'}<span class="kr-stap">${waar}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>`;
    $("kiesBtn").removeAttribute("aria-label");
    // De rustige voortgangsstreep in het blad (boven ◀ en Verder): zo ver ben je in dit deel.
    $("reisboek").style.setProperty("--voortgang", ((cur >= 0 ? (cur + 1) / n : 0) * 100).toFixed(1) + "%");
    document.querySelector(".stapkaart").classList.toggle("intro", cur < 0);
    bladPast();
  }

  // ---------- telefoon, in de reis: de kaart is het scherm, met één stapblad eroverheen ----------
  // Zie docs/bijbelreis-audit/telefoon.md §4 (‘Kaart voorop’). Het reisboek (.panel) is op de telefoon in de reis een
  // blad onderaan, over de kaart. Kort (standaard, en na elke stap): waar je bent, de titel, hooguit twee regels tekst en
  // ◀ / Verder. Open: het blad schuift omhoog en scrolt binnenin, met alles wat bij de stap hoort; ◀ en Verder blijven
  // onderaan staan. De opmaak staat in het telefoonblok van bijbelreis.css (body[data-modus="reis"]).
  const zijMq = window.matchMedia("(max-width: 900px) and (orientation: landscape) and (max-height: 520px)");
  function bladAan() { return isNarrow() && document.body.dataset.modus === "reis"; }
  // De maat van het korte blad: daarmee houdt de kaart ruimte vrij (fit, ballon). Gemeten zodra het blad kort is.
  let kortH = 156, bladB = 320;
  function bladMeet() {
    const b = $("reisboek");
    if (!bladAan() || b.classList.contains("open") || !b.offsetParent) return;
    const r = b.getBoundingClientRect(); if (r.height > 60) { kortH = r.height; bladB = r.width; }
    document.querySelector(".kaartvlak").style.setProperty("--blad-h", kortH.toFixed(0) + "px");
    kaartGrenzen();
  }
  // Vrije ruimte op de kaart voor fit(): boven de kaartknoppen (met de kameel erboven), opzij een rand, onder het korte
  // blad. Een liggende telefoon heeft het blad links: dan blijft de ruimte ernaast vrij.
  function bladRuimte() {
    bladMeet();
    // Staat de knop ‘Van dichtbij’ boven het blad, dan blijft ook die ruimte vrij.
    const knop = $("dichtbijBtn").hidden ? 0 : 50;
    return zijMq.matches ? { paddingTopLeft: [bladB + 44, 62], paddingBottomRight: [40, 44] } : { paddingTopLeft: [44, 84], paddingBottomRight: [44, kortH + 30 + knop] };
  }
  // De ondergrond houdt op bij 22° en 47° noorderbreedte; Leaflet houdt de kaart daarbinnen (maxBounds). Onder het
  // korte blad is de kaart toch niet te zien: daar mag de uitsnede zo hoog als het blad voorbij de zuidrand, zodat een
  // route in het zuiden boven het blad past en een overzicht van een lange reis de hoge kaart kan vullen.
  const GRENZEN = L.latLngBounds([[22, 4], [47, 57]]);
  function kaartGrenzen(z = map.getZoom()) {
    let b = GRENZEN;
    if (bladAan() && !zijMq.matches) { const p = map.project([22, 4], z); b = L.latLngBounds([[Math.max(8, map.unproject([p.x, p.y + kortH + 34], z).lat), 4], [47, 57]]); }
    map.options.maxBounds = b;
  }
  map.on("zoomend", () => kaartGrenzen());
  // Een hoge kaart ziet op een lage zoom meer dan de ondergrond: Leaflet wil de kaart dan na elke beweging terugschuiven,
  // ook halverwege een vlucht naar de volgende stap, en breekt die vlucht daarmee af. Tijdens een vlucht wacht dat
  // terugschuiven dus tot de kaart er is (alleen op de telefoon in de reis; verder gedraagt de kaart zich als altijd).
  const vliegNaar = map.flyTo.bind(map); let vluchtT = 0;
  map.flyTo = (c, z, o) => {
    if (bladAan() && !(o && o.animate === false)) {
      map._enforcingBounds = true; clearTimeout(vluchtT);
      vluchtT = setTimeout(() => { map._enforcingBounds = false; kaartGrenzen(); map._panInsideMaxBounds(); }, ((o && o.duration) || 0.8) * 1000 + 120);
    }
    return vliegNaar(c, z, o);
  };
  // De kleine regel past naast ‘Lees meer’? Anders valt het boek weg (niet in het overzicht van een deel).
  function bladPast() {
    const k = $("kiesBtn"); k.classList.remove("smal");
    if (!bladAan() || cur < 0) return;
    k.classList.add("meet"); const teBreed = k.scrollWidth > k.clientWidth + 1; k.classList.remove("meet");
    k.classList.toggle("smal", teBreed);
  }
  // De korte tekst: het begin van de staptekst. Eindigt de tekst na hele zinnen op de laatste regel, dan stopt hij daar;
  // anders loopt hij door en kapt de opmaak hem af met … (Samen ontdekken: de ene zin die er al staat). Titel en tekst
  // samen zijn altijd even hoog (drie regels, op een laag scherm twee), zodat het blad en de knop Verder bij elke stap op
  // dezelfde plek staan.
  function bladKort() {
    const el = $("sKort"), titel = $("sTitle");
    if (!bladAan()) { el.textContent = ""; return; }
    const open = $("reisboek").classList.contains("open");
    const bron = String((cur >= 0 ? deel.steps[cur].txt : deel.intro) || ""), tekst = niveau === "a" ? eersteZin(bron) : bron;
    if (open) { el.textContent = tekst; return; } // pas meten als het blad weer kort is (bladZet roept dit opnieuw aan)
    const regels = window.matchMedia("(max-height: 600px)").matches ? 2 : 3;
    const lhT = parseFloat(getComputedStyle(titel).lineHeight) || 23, nT = Math.max(1, Math.min(2, Math.round(titel.getBoundingClientRect().height / lhT)));
    const n = regels - nT;
    el.hidden = n < 1;
    if (n >= 1) {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 22;
      el.style.webkitLineClamp = String(n); el.style.minHeight = (n * lh).toFixed(1) + "px";
      const hoog = (t) => { el.classList.add("meet"); el.textContent = t; const h = el.getBoundingClientRect().height; el.classList.remove("meet"); return Math.round(h / lh); };
      const past = (t) => hoog(t) <= n;
      // Zinnen: tot en met een punt, vraagteken of uitroepteken (met het aanhalingsteken erachter) dat door een spatie
      // en een hoofdletter of aanhalingsteken gevolgd wordt; ‘ca. 1446’ en ‘v.Chr. werd’ breken dus niet.
      const zinnen = tekst.match(/.+?(?:[.!?…]["’”»)]*(?=\s+["‘“«(]?[A-ZÀ-Ý])|$)\s*/gs) || [tekst];
      let k = 0, deelT = "";
      while (k < zinnen.length && past((deelT + zinnen[k]).trim())) deelT += zinnen[k++];
      el.textContent = (k === zinnen.length || (k && hoog(deelT.trim()) === n) ? deelT : tekst).trim();
    }
    bladMeet();
  }
  function bladZet(open, stil) {
    const b = $("reisboek"); open = !!open && bladAan();
    if (b.classList.contains("open") === open) return;
    const h0 = b.getBoundingClientRect().height;
    b.classList.toggle("open", open); document.body.classList.toggle("bladopen", open);
    open ? laagOpen("blad") : laagDicht("blad");
    const knop = $("bladBtn"); knop.setAttribute("aria-expanded", open); knop.querySelector("span").textContent = open ? "Sluiten" : "Lees meer";
    b.scrollTop = 0;
    if (open) kaartMenu(false); else bladKort();
    // Stond de focus op iets dat nu verborgen is, dan gaat hij naar de knop van het blad.
    const f = document.activeElement; if (!open && f && f !== knop && b.contains(f) && !f.getClientRects().length) knop.focus({ preventScroll: true });
    // Het blad schuift (hoogte van kort naar open of terug); bij ‘minder beweging’ staat het er meteen.
    if (!stil && !reduceMotion && b.animate && bladAan()) b.animate([{ height: h0 + "px" }, { height: b.getBoundingClientRect().height + "px" }], { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    queueLabels();
  }
  $("bladBtn").onclick = () => bladZet(!$("reisboek").classList.contains("open"));
  // De regels zijn geteld met het lettertype dat er op dat moment was: opnieuw als de webletters geladen zijn.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { bladKort(); bladPast(); });
  // Een tik op de titel of de korte tekst opent het blad ook (de knop ‘Lees meer’ blijft de bediening voor toetsenbord
  // en schermlezer); een tik op de kaart of op een kaartknop sluit het.
  $("reisboek").addEventListener("click", (e) => { if (bladAan() && !$("reisboek").classList.contains("open") && e.target.closest("#sTitle, #sKort")) bladZet(true); });
  document.querySelector(".kaartvlak").addEventListener("pointerdown", () => bladZet(false), true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && $("reisboek").classList.contains("open") && LADEN.every((id) => $(id).hidden) && $("niveauKeuze").hidden) { e.preventDefault(); bladZet(false); $("bladBtn").focus({ preventScroll: true }); } });
  // Wie op ‘3 van 25’ tikt, verwacht de stappen: die staan bovenaan het blad, met de huidige stap gemarkeerd en in
  // beeld; daaronder zoals voorheen de keuze van deel en boek (telefoontest 16-11-2026).
  function kiesStappen() {
    const box = $("kiesStappen");
    box.hidden = !deel.steps.length;
    // Een verdiepend deel heet hier ook zo: ‘Van dichtbij: Jakob bij de Jabbok’, met de weg terug naar de hoofdreis.
    $("kiesStappenLabel").textContent = deel.hoofd ? `Van dichtbij: ${deel.n}` : `Stappen van ${deel.n}`;
    // In de hoofdreis staat een verdiepend deel als eigen, gestippelde regel direct na de stappen over hetzelfde gedeelte
    // (zoals de knop ‘Van dichtbij’ op de kaart): zo zie je wat de hoofdreis is en wat een uitstapje van dichtbij.
    const naStap = new Map();
    (deel.verdiep || []).forEach((v) => { let j = -1; deel.steps.forEach((s, i) => { if ((s.verdiep || []).includes(v)) j = i; }); (naStap.get(j) || naStap.set(j, []).get(j)).push(v); });
    const dichtbij = (lijst) => (lijst || []).map((v) => `<li class="ks-dichtbij"><button type="button" class="ks-verdiep" data-ks-go="${v.key}:-1"><span class="ks-v-l">Van dichtbij</span><span class="ks-t"><b>${esc(v.n)}</b> · ${v.steps.length} stappen</span></button></li>`).join("");
    const terug = deel.hoofd ? `<li class="ks-dichtbij"><button type="button" class="ks-verdiep ks-terug" data-ks-go="${deel.hoofd.key}:-1"><span class="ks-v-l">Hoofdreis</span><span class="ks-t">Terug naar <b>${esc(deel.hoofd.n)}</b></span></button></li>` : "";
    $("kiesStappenLijst").innerHTML = deel.steps.map((s, i) => `<li><button type="button" class="ks-stap${seen.has(s.key) ? " gezien" : ""}" data-ks="${i}"${i === cur ? ' aria-current="step"' : ""}><span class="ks-n" aria-hidden="true">${seen.has(s.key) && i !== cur ? "✓" : i + 1}</span><span class="sr-only">Stap ${i + 1}: </span><span class="ks-t">${esc(s.t)}</span>${seen.has(s.key) ? '<span class="sr-only">, gezien</span>' : ""}</button></li>${dichtbij(naStap.get(i))}`).join("") + dichtbij(naStap.get(-1)) + terug;
  }
  $("kiesStappenLijst").addEventListener("click", (e) => {
    const v = e.target.closest("[data-ks-go]"); if (v) { sluitLade("kiesLade"); goKey(v.dataset.ksGo); naarBoven(); return; }
    const b = e.target.closest("[data-ks]"); if (!b) return;
    sluitLade("kiesLade"); select(+b.dataset.ks); naarBoven();
  });
  $("kiesBtn").onclick = () => {
    kiesStappen(); openLade("kiesLade"); toonGekozen("boeken");
    const nu = $("kiesStappenLijst").querySelector('[aria-current="step"]');
    if (nu) nu.scrollIntoView({ block: "center" });
  };
  // Na een tik op een boek blijft het blad open voor de keuze van het deel.
  const naarBoven = () => { if (isNarrow() && window.scrollY > 0) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); };
  // Wat niet nodig is om de stap te volgen, staat achter een knop met een naam. Een opengeklapt weetje, de afstand of het
  // jaartal blijft open bij de volgende stap (tot de pagina herladen wordt); de stappenlijst en ‘Elders’ niet.
  const meerOpen = new Set();
  function meerZet(b, open) {
    const wat = b.dataset.meer;
    b.setAttribute("aria-expanded", open);
    (wat === "stappenBlok" ? $("p-reis") : document.querySelector(".stapkaart")).classList.toggle("open-" + wat, open);
    if (wat === "sFact" || wat === "sVer" || wat === "sTijd") open ? meerOpen.add(wat) : meerOpen.delete(wat);
  }
  function meerKnoppen() {
    document.querySelector(".stapkaart").classList.toggle("intro", cur < 0);
    document.querySelectorAll("#sMeer [data-meer]").forEach((b) => {
      const wat = b.dataset.meer, t = $(wat);
      b.hidden = t.hidden || !t.textContent.trim() || (wat === "sSpecial" && cur >= 0);
      if (wat === "stappenBlok") b.textContent = `Alle stappen (${deel.steps.length})`;
      meerZet(b, !b.hidden && meerOpen.has(wat));
    });
  }
  $("sMeer").addEventListener("click", (e) => {
    const b = e.target.closest("[data-meer]"); if (!b) return;
    const open = b.getAttribute("aria-expanded") !== "true";
    meerZet(b, open);
    if (open && b.dataset.meer === "stappenBlok") $("stappenBlok").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  });
  // De ballon van een plaats (of van Vandaag) ligt op de telefoon vrij: zolang hij open is, wijken de zwevende
  // kaartknoppen (CSS: .kaartvlak.ballon), en hij past in de kaart (kleine marges, met een schuifbalk als hij lang is).
  // Boven 900 px gelden de oorspronkelijke instellingen van de ballon.
  // In de reis ligt het stapblad over de onderkant van de kaart: de ballon blijft daarboven (of, bij een liggende
  // telefoon, ernaast) en het blad gaat terug naar kort.
  map.on("popupopen", (e) => {
    const pop = e.popup, o = pop.options;
    if (!pop._breed) pop._breed = { tl: o.autoPanPaddingTopLeft, br: o.autoPanPaddingBottomRight, mh: o.maxHeight };
    const smal = isNarrow(), blad = bladAan(), zij = blad && zijMq.matches;
    if (blad) { bladZet(false); bladMeet(); }
    const onder = blad && !zij ? kortH + 8 : 8;
    o.autoPanPaddingTopLeft = smal ? [zij ? bladB + 16 : 8, 8] : pop._breed.tl;
    o.autoPanPaddingBottomRight = smal ? [8, onder] : pop._breed.br;
    o.maxHeight = smal ? Math.max(120, map.getSize().y - 52 - onder) : pop._breed.mh;
    document.querySelector(".kaartvlak").classList.toggle("ballon", smal);
    if (smal) { kaartMenu(false); pop.update(); }
  });
  map.on("popupclose", () => document.querySelector(".kaartvlak").classList.remove("ballon"));
  // Het verhaal (Zelf op reis en Verder ontdekken) begint op de telefoon met het eerste onderdeel en ‘Lees verder’.
  function leesVerder(v) {
    if (!v) return;
    const delen = v.querySelectorAll(".vdeel");
    if (delen.length < 2 && v.textContent.length < 700) return;
    v.classList.add("kort");
    v.insertAdjacentHTML("afterend", `<button type="button" class="btn leesverder" id="vLeesVerder" aria-expanded="false" aria-controls="vVertelling">Lees verder${delen.length > 1 ? ` <small>nog ${delen.length - 1} ${delen.length === 2 ? "stuk" : "stukken"}</small>` : ""}</button>`);
    $("vLeesVerder").onclick = () => {
      v.classList.remove("kort"); $("vLeesVerder").remove();
      const kop = delen[1] && delen[1].querySelector(".vkop");
      if (kop) { kop.tabIndex = -1; kop.focus({ preventScroll: true }); }
    };
  }
  // Kaartpaneel: Toen/Nu, Vandaag, Bijbelwereld en Legenda achter één knop. Een tik ernaast sluit het paneel.
  function kaartMenu(open) { $("kaartPaneel").classList.toggle("open", open); $("kaartBtn").setAttribute("aria-expanded", open); queueLabels(); }
  $("kaartBtn").onclick = () => kaartMenu(!$("kaartPaneel").classList.contains("open"));
  // Bijbelwereld laat de hele kaart zien: het paneel gaat dan dicht, anders ligt het over een deel van de wereld.
  $("wereldBtn").addEventListener("click", () => { if ($("kaartPaneel").contains($("wereldBtn"))) kaartMenu(false); });
  document.addEventListener("click", (e) => { if ($("kaartPaneel").classList.contains("open") && !e.target.closest("#kaartPaneel, #legend")) kaartMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && $("kaartPaneel").classList.contains("open") && LADEN.every((id) => $(id).hidden)) { kaartMenu(false); $("kaartBtn").focus(); } });
  // Vooruit en terug met de duim: ◀ en Verder onderaan het stapblad; vegen naar links of rechts over het blad (niet over
  // de kaart) gaat ook naar de volgende of vorige stap. Omhoog vegen over het korte blad opent het, omlaag vegen (aan de
  // greep, of als de tekst bovenaan staat) sluit het. Buiten de reis vegen over de stapkaart, zoals het was.
  ["prev", "next"].forEach((id) => $(id).addEventListener("click", naarBoven));
  (() => {
    const b = $("reisboek"); let x0 = null, y0 = 0, t0 = 0, greep = false, top0 = 0;
    b.addEventListener("touchstart", (e) => {
      x0 = isNarrow() && mode === "reis" && e.touches.length === 1 && e.target.closest(".stapkaart, .mapbar") && !e.target.closest("canvas, input, select, .days, .koppel") ? e.touches[0].clientX : null;
      if (x0 !== null) { y0 = e.touches[0].clientY; t0 = Date.now(); greep = !!e.target.closest(".bladbalk"); top0 = b.scrollTop; }
    }, { passive: true });
    b.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0, open = b.classList.contains("open"); x0 = null;
      if (Date.now() - t0 > 800 || String(window.getSelection() || "")) return;
      if (bladAan() && Math.abs(dy) >= 36 && Math.abs(dy) > 1.5 * Math.abs(dx)) {
        if (dy < 0 && !open) bladZet(true); else if (dy > 0 && open && (greep || (top0 <= 0 && b.scrollTop <= 0))) bladZet(false);
        return;
      }
      if (Math.abs(dx) < 70 || Math.abs(dx) < 2 * Math.abs(dy)) return;
      const knop = $(dx < 0 ? "next" : "prev"); if (knop.disabled) return;
      dx < 0 ? goNext() : goPrev(); naarBoven();
    }, { passive: true });
  })();
  telefoonIndeling();
  // De indeling van het eerste scherm staat meteen vast (nog vóór de teksten van het reisniveau binnen zijn): een diepe
  // link naar een stap begint op de telefoon met de kaart als scherm, niet met een pagina die daarna verspringt.
  { const h = decodeURIComponent(location.hash.slice(1)).split("/")[0]; document.body.dataset.modus = !h || h === "verhalen" || /^v\d+$/.test(h) ? "verhalen" : "reis";
    // Eerste bezoek zonder diepe link: de kaart is op de telefoon meteen lager (startkaart in het eerste scherm).
    if (!h && seen.size === 0 && huidigeGeschiedenis().hoe === "nieuw") document.body.classList.add("eerste"); }

  // ---------- welkom, de start en verder waar je was ----------
  // Een nieuwe bezoeker (nog niets geopend) ziet bovenaan Verhalen de startkaart: één zin die zegt wat dit is, één grote
  // knop die meteen begint (Abraham, van Ur naar Kanaän; sinds de telefoontest van 16-11-2026 direct bij stap 1, niet eerst
  // de intro met nog een knop ‘Start’), klein de keuze voor wie het is, en dat je ook zelf een verhaal
  // kunt kiezen. Niemand hoeft eerst een niveau te kiezen. In de kersttijd is de seizoenskaart de hoofdingang: dan staat
  // hier alleen de zin, en komt Abraham als tweede keuze ónder die kaart (#welkomNa). Zodra er voortgang is, staat er
  // alleen nog één knop: ‘Verder met: <geschiedenis>’ of, na een reisstap, ‘Verder met: Jakob – Bedrogen!’.
  // Aanleiding en metingen: docs/bijbelreis-audit/telefoon.md §4.7.
  const START_ZIN = "Volg de reizen uit de Bijbel op de kaart, stap voor stap. Voor naast je eigen Bijbel.";
  const startDeel = () => ALLPARTS.find((d) => d.id === "abraham") || ALLPARTS[0];
  const isEerste = () => seen.size === 0 && huidigeGeschiedenis().hoe === "nieuw";
  let welkomAan = false; // pas waar als de start van Verhalen getoond is (niet na een diepe link)
  function zetEerste(aan) {
    const was = document.body.classList.contains("eerste");
    document.body.classList.toggle("eerste", aan);
    // Op de telefoon is de kaart bij het eerste bezoek lager, zodat de startknop in het eerste scherm staat.
    if (was !== aan && isNarrow() && mode === "verhalen") map.invalidateSize({ pan: false });
  }
  function renderWelkom() {
    const box = $("welkom"), na = $("welkomNa");
    welkomAan = true;
    // Bij een geopende geschiedenis horen de startkaart en ‘Verder met’ niet: ‘Verder met’ wees dan naar wat je vóór deze
    // geschiedenis las, boven de geschiedenis die je nu leest. Terug in de lijst staat hij er weer (renderVerhalen).
    if (vOpen) { box.hidden = true; box.innerHTML = ""; na.hidden = true; na.innerHTML = ""; zetEerste(false); return; }
    const focusNiv = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("st-nivopt") ? document.activeElement.dataset.niveau : null;
    if (isEerste()) {
      const d = startDeel(), kerst = SEIZOEN === "kerst";
      const wie = `<div class="st-wie"><p class="label" id="stWie">Voor wie?</p><div class="st-niv" role="group" aria-labelledby="stWie">${NIVS.map((k) => `<button type="button" class="st-nivopt" data-niveau="${k}" aria-pressed="${k === niveau}"><b>${esc(NIV.soorten[k].leeftijd)}</b><small>${esc(nivNaam(k))}</small></button>`).join("")}</div></div><p class="ref st-of">Of kies hieronder zelf een verhaal.</p>`;
      const zin = `<p class="st-zin">${START_ZIN}</p>`;
      box.hidden = false;
      if (kerst) {
        box.innerHTML = `<div class="startkaart st-kort">${zin}</div>`;
        na.hidden = false;
        na.innerHTML = `<div class="startkaart st-na"><button type="button" class="btn st-tweede" data-go="${d.key}:0"><span>Of begin bij <b>${esc(d.n)}</b> · van Ur naar Kanaän</span><span aria-hidden="true">▶</span></button>${wie}</div>`;
      } else {
        box.innerHTML = `<div class="startkaart">${zin}<button type="button" class="btn primary st-knop" data-go="${d.key}:0"><span class="st-wat"><b>Begin de reis</b><small>${esc(d.n)} · van Ur naar Kanaän</small></span><span aria-hidden="true">▶</span></button>${wie}</div>`;
        na.hidden = true; na.innerHTML = "";
      }
      zetEerste(true);
      if (focusNiv) { const k = document.querySelector(`.st-nivopt[data-niveau="${focusNiv}"]`); if (k) k.focus({ preventScroll: true }); }
      return;
    }
    na.hidden = true; na.innerHTML = ""; zetEerste(false);
    const h = huidigeGeschiedenis(), g = h.g;
    // Een stap uit een thema hoort bij geen geschiedenis. Was dat het laatste wat je opende, dan gaat ‘Verder met’
    // daarheen; in het seizoen van het thema doet de eigen ingang eronder dat al (renderSeizoen).
    const hk = store.get("huidig", null), ts = hk && hk.k && STEP_BY_KEY.get(hk.k), themaStap = ts && ts.deel.boek.thema && ts.deel.boek.thema !== SEIZOEN ? ts : null;
    if (!themaStap && (!g || h.hoe === "nieuw")) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    const tip = store.get("niveauTip", false) ? `<p class="rk-tip">Nieuw: Bijbelreis heeft nu reisniveaus. Je kijkt met <b>${esc(nivNaam())}</b>. <button type="button" class="linkbtn" data-open-niveau>Wijzigen</button></p>` : "";
    if (themaStap) { box.innerHTML = `<button type="button" class="btn primary verdermet" data-go="${themaStap.key}"><span>Verder met: <b>${esc(themaStap.deel.n)} – ${esc(themaStap.t)}</b></span><span aria-hidden="true">▶</span></button>${tip}`; return; }
    const st = h.hoe === "stap" && STEP_BY_KEY.get(h.key);
    const wat = st ? `${esc(st.deel.n)} – ${esc(st.t)}` : esc(g.t);
    box.innerHTML = `<button type="button" class="btn primary verdermet" ${st ? `data-go="${h.key}"` : `data-v="${g.nr}"`}><span>Verder met: <b>${wat}</b></span><span aria-hidden="true">▶</span></button>${tip}`;
  }

  // De ingang van het seizoen: van de eerste adventszondag tot en met 6 januari staat bovenaan Verhalen één rustige
  // kaart naar het thema Kerst. Sinds 16-11-2026 met een weekritme: elke week is één van de zes delen aan de beurt
  // (BR.seizoen.kerstWeek in seizoen.js). De kaart noemt het deel van deze week, heeft één hoofdknop (‘Lees deel 2’),
  // een rij van zes merktekens (gelezen, deze week, nog te komen) en zegt welk deel volgende zondag komt.
  // Er zit niets op slot: elk merkteken opent zijn deel, en wie later instapt kan bij deel 1 beginnen.
  // Buiten het seizoen staat er niets; het thema blijft bereikbaar onder ‘Thema’s’ en via de links.
  function renderSeizoen() {
    const box = $("seizoen"), b = SEIZOEN && THEMAS.find((x) => x.thema === SEIZOEN), tu = themaUi(b);
    if (!tu || mode !== "verhalen" || vOpen) { box.hidden = true; box.innerHTML = ""; return; }
    const rij = reeks(b.delen[0]), nu = new Date();
    const w = Math.max(0, Math.min(rij.length - 1, BR.seizoen.kerstWeek ? BR.seizoen.kerstWeek(nu) : 0)), dw = rij[w];
    const stappen = rij.flatMap((d) => d.steps), gezien = stappen.filter((s) => seen.has(s.key));
    const klaar = (d) => d.steps.every((s) => seen.has(s.key)), bezig = (d) => d.steps.some((s) => seen.has(s.key));
    const laatst = STEP_BY_KEY.get(store.get("laatst", null)), hier = laatst && laatst.deel.boek === b ? laatst : gezien[gezien.length - 1];
    const inDw = hier && hier.deel === dw ? hier : dw.steps.filter((s) => seen.has(s.key)).pop();
    const hoofd = klaar(dw) ? [`${dw.key}:-1`, `Lees deel ${w + 1} nog eens`] : bezig(dw) ? [inDw.key, `Verder met deel ${w + 1}`] : [`${dw.key}:-1`, `Lees deel ${w + 1}`];
    // Tweede knop: wie later instapt, kan bij deel 1 beginnen; wie in een eerder deel bezig is, kan daar verder.
    const tweede = !gezien.length ? (w > 0 ? [`${rij[0].key}:-1`, "Begin bij deel 1"] : null)
      : hier && hier.deel !== dw && !klaar(hier.deel) ? [hier.key, `Verder waar je was: deel ${rij.indexOf(hier.deel) + 1}`] : null;
    const merk = rij.map((d, i) => {
      const k = klaar(d), staat = `${i === w ? ", deze week" : ""}${k ? ", gelezen" : ""}`;
      return `<li><button type="button" class="sz-merk${k ? " gelezen" : ""}${i === w ? " nu" : ""}" data-go="${d.key}:-1" aria-label="Deel ${i + 1}: ${esc(d.n)}${staat}"${i === w ? ' aria-current="true"' : ""}><span aria-hidden="true">${k ? "✓" : i + 1}</span></button></li>`;
    }).join("");
    const vd = w < rij.length - 1 && BR.seizoen.kerstVolgende ? BR.seizoen.kerstVolgende(nu) : null;
    const volgende = vd ? `<p class="sz-volgende">${vd.getDay() === 0 ? "Volgende zondag" : `Vanaf ${vd.getDate()} ${["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"][vd.getMonth()]}`}: deel ${w + 2} – ${esc(rij[w + 1].n)}</p>` : "";
    // De zin die het thema uitlegt, staat er zolang je er nog niet aan begonnen bent; bij het allereerste bezoek zegt de
    // startkaart erboven al wat dit is, en moet de knop in het eerste scherm passen.
    const zin = !gezien.length && !isEerste() ? `<p class="sz-zin">${esc(niveau === "a" ? tu.zinA : tu.zin)}</p>` : "";
    box.hidden = false; box.dataset.thema = b.thema;
    box.innerHTML = `<p class="sz-label">Thema · Advent en Kerst</p><h2 class="sz-titel" id="szTitel">${esc(b.n)}</h2>${zin}
      <p class="sz-week"><span>Deze week · deel ${w + 1} van ${rij.length}</span><b>${esc(dw.n)}</b></p>
      <div class="sz-knoppen"><button type="button" class="btn sz-knop" data-go="${hoofd[0]}"><span>${hoofd[1]}</span><span aria-hidden="true">▶</span></button>${tweede ? `<button type="button" class="btn sz-tweede" data-go="${tweede[0]}">${tweede[1]}</button>` : ""}</div>
      <ol class="sz-rij" aria-label="De zes delen van de kerstreis">${merk}</ol>${volgende}${deelKnop(rij[0].id, b.n, "Deel de kerstreis")}`;
  }

  // ---------- delen ----------
  // Eén knop ‘Deel’ bij een geschiedenis, bij de intro en de laatste stap van een deel en op de seizoenskaart. Op de
  // telefoon opent hij het deelmenu van het toestel (daar staat WhatsApp vanzelf bij); anders wordt de link gekopieerd;
  // lukt ook dat niet, dan staat de link in een veld om zelf te kopiëren. In de link staat alleen het adres van het
  // verhaal of deel op bijbelreis.nl: geen reisniveau, geen voortgang, niets van de bezoeker. Niet bij Samen ontdekken.
  const SITE = "https://bijbelreis.nl/";
  const DEELICOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  function deelKnop(hash, titel, tekst = "Deel") {
    return niveau === "a" ? "" : `<button type="button" class="deelknop" data-deel="${esc(hash)}" data-deel-titel="${esc(titel)}">${DEELICOON}<span>${esc(tekst)}</span></button>`;
  }
  async function deelLink(knop) {
    const titel = knop.dataset.deelTitel || "Bijbelreis", url = SITE + "#" + knop.dataset.deel;
    if (navigator.share) {
      try { await navigator.share({ title: titel, text: `${titel} – Op reis door de Bijbel`, url }); return; }
      catch (e) { if (e && e.name === "AbortError") return; /* anders: kopiëren */ }
    }
    try { await navigator.clipboard.writeText(url); toast("Link gekopieerd"); return; } catch (e) { /* dan het veld hieronder */ }
    let veld = knop.nextElementSibling && knop.nextElementSibling.classList.contains("deelveld") ? knop.nextElementSibling : null;
    if (!veld) { knop.insertAdjacentHTML("afterend", '<label class="deelveld"><span>Kopieer deze link</span><input type="text" readonly></label>'); veld = knop.nextElementSibling; }
    const inp = veld.querySelector("input"); inp.value = url; inp.focus(); inp.select();
  }
  document.addEventListener("click", (e) => { const k = e.target.closest("[data-deel]"); if (k) deelLink(k); });

  // Reisniveau kiezen en wisselen: overal dezelfde knoppen (data-niveau). Wisselen bouwt het huidige scherm opnieuw op.
  function niveauKnop() {
    $("niveauNaam").textContent = nivNaam();
    $("niveauBtn").setAttribute("aria-label", `Reisniveau: ${nivNaam()} (${NIV.soorten[niveau].leeftijd}). Wijzigen`);
    $("niveauOpties").innerHTML = nivOpties();
  }
  function niveauVenster(open) {
    if (open === $("niveauKeuze").hidden) open ? laagOpen("niveau") : laagDicht("niveau");
    $("niveauKeuze").hidden = !open; $("niveauBtn").setAttribute("aria-expanded", open);
    if (open) { store.weg("niveauTip"); $("niveauOpties").innerHTML = nivOpties(); const k = $("niveauOpties").querySelector('[aria-pressed="true"]') || $("niveauOpties").firstElementChild; k.focus(); }
  }
  function setNiveau(n) {
    if (!NIVS.includes(n)) return;
    const was = niveau;
    niveau = n; store.set("niveau", n); store.weg("niveauTip"); document.body.dataset.niveau = n;
    niveauKnop(); niveauVenster(false);
    if (n !== was) vStap = 0;
    // De teksten van een ander niveau komen pas bij het wisselen binnen (niveaus/<n>.js); daarna het scherm opnieuw.
    const toon = () => {
      if (niveau !== n) return;
      if (mode === "verhalen") { if (vOpen) renderVerhaal(vOpen); else renderVerhalen(); }
      else setMode(mode);
      if (vOpen === null || welkomAan) renderWelkom();
    };
    laadNiveau(n).then(toon);
    if (n !== was) toast(`Reisniveau: ${nivNaam()}`);
  }
  // Mislukt het laden (geen verbinding), dan blijft alles werken met de vaste vertelling, en zegt de app het eerlijk.
  function laadNiveau(n) {
    if (!NIV.laad) return Promise.resolve();
    return NIV.laad(n).catch(() => toast("De verhalen voor dit niveau konden niet worden geladen. Controleer de verbinding."));
  }
  $("niveauBtn").onclick = () => niveauVenster($("niveauKeuze").hidden);
  document.addEventListener("click", (e) => {
    const k = e.target.closest("button[data-niveau]"); if (k) { setNiveau(k.dataset.niveau); if (k.closest("#niveauKeuze")) $("niveauBtn").focus(); return; }
    if (e.target.closest("[data-open-niveau]")) { niveauVenster(true); return; }
    if (!$("niveauKeuze").hidden && !e.target.closest("#niveauKeuze, #niveauBtn")) niveauVenster(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("niveauKeuze").hidden) { e.preventDefault(); niveauVenster(false); $("niveauBtn").focus(); } });
  niveauKnop();
  $("welkom").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (b) openVerhaal(+b.dataset.v); });

  // ---------- start ----------
  // Eerst de teksten van het eigen niveau (niveaus.js haalt ze al op, tegelijk met de rest van de pagina).
  laadNiveau(niveau).then(begin);
  function begin() {
    // Bij herladen bewaart de browser de plek in de geschiedenis, met het onderdeel (zie navZet). Ook een telefoon die het
    // tabblad op de achtergrond heeft weggegooid, laadt zo opnieuw: dan kom je terug in hetzelfde onderdeel.
    const st0 = history.state;
    renderBoeken();
    const [hashId, hashStep] = decodeURIComponent(location.hash.slice(1)).split("/");
    const startDeel = ALLPARTS.find((d) => d.id === hashId) || ALLPARTS.find((d) => d.boek.id === hashId) || ALLPARTS[0];
    const startStep = hashStep && startDeel.steps[+hashStep - 1] ? +hashStep - 1 : -1;
    fetch(dataUrl("geo.json")).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(drawBase).catch(() => {
      console.error("Bijbelreis: de kaartondergrond kon niet worden geladen.");
      $("map").insertAdjacentHTML("beforeend", '<p class="maperr" role="status">De kaart kon niet helemaal worden geladen. Controleer de verbinding en laad de pagina opnieuw.</p>');
    });
    TABS.forEach((t) => ($("t-" + t).tabIndex = t === "reis" ? 0 : -1));
    const vHash = /^v(\d+)$/.exec(hashId || "");
    const naarVerhaal = vHash && GBYNR.has(+vHash[1]);
    // Een adres met een onbekende # (een tikfout, of een geschiedenis die niet bestaat) opent de start, zoals zonder #, en
    // niet stilletjes ‘Het begin’ in de reis.
    const onbekend = !!hashId && hashId !== "verhalen" && !naarVerhaal && !ALLPARTS.some((d) => d.id === hashId || d.boek.id === hashId);
    if (onbekend) history.replaceState(st0, "", location.pathname + location.search);
    const naarVerhalen = !hashId || hashId === "verhalen" || onbekend;
    // Op de telefoon hangt de maat van de kaart af van het onderdeel (in de reis is de kaart het scherm): die staat vast
    // vóór de eerste uitsnede.
    document.body.dataset.modus = naarVerhaal || naarVerhalen ? "verhalen" : "reis";
    if (isNarrow()) { kaartGrenzen(); map.invalidateSize({ pan: false }); }
    chooseBoek(startDeel.boek, startDeel, startStep, { keepHash: true });
    if (naarVerhaal) openVerhaal(+vHash[1], { keepHash: true });
    else if (naarVerhalen) setMode("verhalen");
    else setMode("reis");
    if (!hashId || onbekend) renderWelkom();
    if (st0 && st0.br && st0.m !== mode && TABS.includes(st0.m) && !onbekend) setMode(st0.m);
    syncDrag();
    // Vanaf hier telt elke nieuwe plek in de geschiedenis van de browser (zie ‘terug’).
    history.replaceState({ br: 1, p: navPlek(location.hash), m: mode }, "");
    navKlaar = true;
    // Een adres met # dat iemand zelf intypt of in een link aanklikt. Bij ‘terug’ en ‘vooruit’ (eigen plekken, met
    // history.state) doet popstate het werk al.
    window.addEventListener("hashchange", () => {
      if (history.state && history.state.br) return;
      navStil = true;
      try {
        const [h, st] = decodeURIComponent(location.hash.slice(1)).split("/");
        const vm = /^v(\d+)$/.exec(h);
        if (vm && GBYNR.has(+vm[1])) { if (vOpen !== +vm[1]) openVerhaal(+vm[1], { keepHash: true }); }
        else {
          const d = ALLPARTS.find((x) => x.id === h);
          const i = d && st && d.steps[+st - 1] ? +st - 1 : -1;
          if (d && (d !== deel || i !== cur)) { setMode("reis"); chooseBoek(d.boek, d, i, { keepHash: true }); }
        }
      } finally { navStil = false; }
      history.replaceState({ br: 1, p: navPlek(location.hash), m: mode }, "");
    });
  }
})();
