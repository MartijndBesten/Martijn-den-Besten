// Presentatie en boekje: van de gegevens van de atlas (BR) naar één pakket met dia’s.
// Er wordt niets geschreven of bedacht: elke tekst komt uit inhoud/*.js, geschiedenissen/*.js en niveaus/*.js.
// Het pakket bevat alles wat de speler (boekje-speler.js) nodig heeft, zodat hetzelfde pakket ook in het losse
// bestand past. Geen DOM nodig: dit draait ook in de unittests. Uitleg: docs/bijbelreis-boekje/README.md.
(function (global) {
  "use strict";
  const NIVS = ["a", "b", "c"];
  const FS = { b: "Uit de Bijbel", u: "Uitleg", h: "Historische achtergrond" };
  const MAX_VRAGEN = 4;
  const eersteZin = (t) => { const m = String(t || "").match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : String(t || ""); };
  function hav(a, b) {
    const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }
  const roundKm = (km) => (km < 100 ? Math.round(km / 5) * 5 : Math.round(km / 10) * 10);

  // ---------- adres ----------
  // #<deel-id> · #<deel-id>/3-8 · #boek=<boek-id> · #v<nr> · met &niveau=a|b|c, &toon=boekje en &dia=<nr>.
  // Ook #<boek-id>/<deel-id> wordt begrepen.
  function lees(hash) {
    const delen = String(hash || "").replace(/^#/, "").split("&").map((x) => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    const kop = delen.shift() || "", k = {};
    delen.forEach((x) => { const i = x.indexOf("="); if (i > 0) k[x.slice(0, i)] = x.slice(i + 1); });
    const uit = { niveau: NIVS.includes(k.niveau) ? k.niveau : null, toon: k.toon === "boekje" ? "boekje" : null, dia: /^\d+$/.test(k.dia || "") ? +k.dia : null };
    let m;
    if (!kop) return { ...uit, soort: null };
    if ((m = kop.match(/^v(\d{1,3})$/))) return { ...uit, soort: "verhaal", nr: +m[1] };
    if ((m = kop.match(/^boek=([\w-]+)$/))) return { ...uit, soort: "boek", boek: m[1] };
    if ((m = kop.match(/^([\w-]+)(?:\/([\w-]+))?(?:\/(\d+)(?:-(\d+))?)?$/))) {
      let deel = m[1], boek = null, van = m[3], tot = m[4];
      if (m[2] && /^\d+$/.test(m[2]) && !m[3]) { van = m[2]; tot = null; } else if (m[2]) { const r = m[2].match(/^(\d+)-(\d+)$/); if (r && !m[3]) { van = r[1]; tot = r[2]; } else { boek = m[1]; deel = m[2]; } }
      return { ...uit, soort: "deel", deel, boek, van: van ? +van : null, tot: tot ? +tot : van ? +van : null };
    }
    return { ...uit, soort: "onbekend" };
  }
  function maakHash(k, extra) {
    let h = k.soort === "verhaal" ? "v" + k.nr : k.soort === "boek" ? "boek=" + k.boek : k.deel + (k.van ? "/" + k.van + (k.tot && k.tot !== k.van ? "-" + k.tot : "") : "");
    if (k.niveau) h += "&niveau=" + k.niveau;
    if (extra && extra.toon === "boekje") h += "&toon=boekje";
    return "#" + h;
  }

  // ---------- hulpmiddelen ----------
  // Vaste ‘willekeur’ uit een tekst: dezelfde link geeft altijd dezelfde volgorde van antwoorden.
  function zaad(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let x = Math.imul(h ^ (h >>> 15), 1 | h); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  function schud(lijst, t) { const a = lijst.slice(), r = zaad(t); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // Een paar vragen, gelijk verdeeld over de lijst (eerste, laatste en wat ertussen ligt).
  function spreid(lijst, n) { if (lijst.length <= n) return lijst.slice(); return Array.from({ length: n }, (_, i) => lijst[Math.round((i * (lijst.length - 1)) / (n - 1))]); }

  function maak(BR, keuze) {
    const P = BR.plaatsen || {}, Wp = BR.W || {}, NIV = BR.niveaus || { soorten: {}, verhalen: {} };
    const niveau = NIVS.includes(keuze.niveau) ? keuze.niveau : "b";
    const stapVan = new Map();
    BR.boeken.forEach((b) => b.delen.forEach((d) => d.steps.forEach((s, i) => stapVan.set(`${b.id}:${d.id}:${i}`, { b, d, i, s }))));
    const pk = { v: 1, soort: keuze.soort, niveau, niveauNaam: (NIV.soorten[niveau] || {}).n || "", leeftijd: (NIV.soorten[niveau] || {}).leeftijd || "", dias: [], routes: [], plaatsen: {}, taferelen: {}, meldingen: [] };
    const versie = (g, n) => (g && (NIV.verhalen[g.nr] || {})[n || niveau]) || null;

    // Plaatsen en routes komen één keer in het pakket; een kaart verwijst ernaar.
    const plaats = (id) => { const p = P[id]; if (!p) return false; if (!pk.plaatsen[id]) { const q = { n: p.n, ll: p.ll }; ["c", "s", "t", "alt", "ctx", "k"].forEach((x) => { if (p[x] != null) q[x] = p[x]; }); pk.plaatsen[id] = q; } return true; };
    const ll = (x) => (Array.isArray(x) ? x : P[x] ? P[x].ll : Wp[x] || null);
    const routeNr = new Map();
    function routesVan(sleutel) {
      if (routeNr.has(sleutel)) return routeNr.get(sleutel);
      const x = stapVan.get(sleutel), uit = [];
      ((x && x.s.r) || []).forEach((r) => {
        const pts = [], ids = [];
        r.p.forEach((q) => { const c = ll(q); if (!c) return; pts.push([Math.round(c[0] * 1e4) / 1e4, Math.round(c[1] * 1e4) / 1e4]); ids.push(typeof q === "string" && P[q] && plaats(q) ? q : null); });
        if (pts.length < 2) return;
        const e = { pts, ids, w: r.w || x.d.c }; if (r.recon) e.recon = 1;
        pk.routes.push(e); uit.push(pk.routes.length - 1);
      });
      routeNr.set(sleutel, uit);
      return uit;
    }
    // Het tafereel van een stap (taferelen.js): de bestaande tekening, onveranderd.
    function tafereel(sleutel) {
      const x = stapVan.get(sleutel);
      if (!x || !BR.tafereel) return null;
      const b = BR.tafereel.van({ ...x.s, key: sleutel, at: x.s.at || [] });
      if (!b) return null;
      if (!pk.taferelen[b.id]) pk.taferelen[b.id] = { n: b.tf.n, label: b.tf.label, svg: b.tf.svg, bij: b.tf.bij || "" };
      return b.algemeen ? { id: b.id, plaats: b.plaats, algemeen: 1 } : { id: b.id, tekst: b.tekst || "" };
    }
    // De kaart van één stap. eerder: sleutels van de stappen die dun op de achtergrond staan.
    function kaartVan(sleutel, eerder, alleen) {
      const x = stapVan.get(sleutel); if (!x) return null;
      const s = x.s, k = { at: (s.at || []).filter((id) => (!alleen || alleen.includes(id)) && plaats(id)), r: routesVan(sleutel) };
      if (alleen) k.r = k.r.filter((i) => { const r = pk.routes[i], e = [r.ids[0], r.ids[r.ids.length - 1]].filter(Boolean); return e.every((id) => alleen.includes(id)); });
      k.eerder = (eerder || []).flatMap(routesVan);
      if (niveau !== "a") { k.ctx = (x.d.ctx || []).filter(plaats); k.alt = 1; }
      if (s.kings) { k.kon = 1; Object.keys(P).forEach((id) => { if (P[id].k) plaats(id); }); }
      if (s.zoom) k.zoom = s.zoom;
      if (s.view) k.view = s.view;
      if (s.rays4 && ll(s.rays4)) k.stralen = ll(s.rays4);
      if (s.look && ll(s.look[0]) && ll(s.look[1])) k.kijk = { a: ll(s.look[0]), b: ll(s.look[1]), t: s.look[2] || "" };
      if (s.later) { const pts = s.later.p.map(ll).filter(Boolean); if (pts.length > 1) { k.later = { pts, lab: s.later.lab || "" }; if (s.later.at && ll(s.later.at)) k.later.at = ll(s.later.at); } }
      if (!k.at.length && !k.r.length && !k.view && !k.stralen) k.view = "wide";
      return k;
    }
    // Overzichtskaart: alle routes van de gekozen stappen tegelijk, met de plaatsen van die stappen.
    function overzicht(sleutels, alleen) {
      const at = [], r = [];
      sleutels.forEach((key) => { const x = stapVan.get(key); if (!x) return; (x.s.at || []).forEach((id) => { if (!at.includes(id) && (!alleen || alleen.includes(id)) && !P[id].k && plaats(id)) at.push(id); }); routesVan(key).forEach((i) => { if (pk.routes[i].w !== "rood") r.push(i); }); });
      if (!at.length && !r.length) return null;
      const zoom = Math.max(0, ...sleutels.map((key) => (stapVan.get(key) || { s: {} }).s.zoom || 0));
      return { at, r, overzicht: 1, ...(zoom && !r.length ? { zoom } : {}) };
    }
    // Jaartal met zijn grond (dateringen.js), alleen op niveau c: een jaartal staat er nooit als vaststaand feit.
    function datering(x, sleutel) {
      const D = BR.dateringen || { soorten: {}, delen: {}, verhalen: [] };
      if (!x || !x.tijd) return null;
      const r = sleutel ? D.delen[sleutel] : (D.verhalen.find(([a, b]) => x.nr >= a && x.nr <= b) || []).slice(2);
      const schatting = /ruwe schatting/.test(x.tijd), soort = (r && r[0]) || "historie";
      const onzeker = !!(r && r[1]) || /\(onzeker\)/.test(x.tijd) || schatting;
      return { tekst: x.tijd.replace(/\s*\((onzeker|ruwe schatting)\)/, ""), grond: (D.soorten[soort] || {}).n || soort, onzeker: onzeker ? (schatting ? "ruwe schatting" : "onzeker") : "", noot: x.tijdNoot || "" };
    }
    const wie = (lijst) => (lijst || []).map(([n, l]) => n + (l ? (/^\d+$/.test(l) ? ` (${l} jaar)` : ` (${l})`) : ""));
    // Vragen: het eerste antwoord in de gegevens is het goede; hier staan ze in een vaste, geschudde volgorde.
    function vragen(lijst, twee) {
      const gekozen = spreid(lijst, MAX_VRAGEN);
      return gekozen.map((q, i) => { const goed = q.a[0], a = schud(twee ? q.a.slice(0, 2) : q.a, q.q); return { s: "vraag", nr: i + 1, van: gekozen.length, q: q.q, a, goed: a.indexOf(goed), why: q.why || "" }; });
    }
    const overlapt = (refA, refs) => {
      const a = BR.parseRef && BR.parseRef(refA); if (!a) return true;
      const n = (c, v) => c * 1000 + Math.min(v, 999);
      return refs.some((ref) => { const b = BR.parseRef(ref); return !b || a.ranges.some((x) => b.ranges.some((y) => x.slug === y.slug && n(x.c1, x.v1) <= n(y.c2, y.v2) && n(y.c1, y.v1) <= n(x.c2, x.v2))); });
    };

    // ---------- een deel van een reis (of een stuk ervan) ----------
    function deelDias(b, d, van, tot, metTitel) {
      const n = d.steps.length, a = Math.max(1, Math.min(n, van || 1)), z = Math.max(a, Math.min(n, tot || n)), heel = a === 1 && z === n;
      const sleutels = []; for (let i = a - 1; i < z; i++) sleutels.push(`${b.id}:${d.id}:${i}`);
      const dt = niveau === "c" ? datering(d, `${b.id}:${d.id}`) : null;
      const bereik = heel ? "" : a === z ? `stap ${a}` : `stap ${a}–${z}`;
      const titel = { s: "titel", kop: b.n, t: d.n, ref: d.ref, lees: heel ? d.ref : [...new Set(sleutels.map((key) => stapVan.get(key).s.ref))].join(" · "), intro: niveau === "a" ? eersteZin(d.intro) : d.intro || "", kaart: overzicht(sleutels), stappen: sleutels.length };
      if (bereik) titel.bereik = bereik + " van " + n;
      if (dt) titel.tijd = dt;
      if (niveau === "c" && d.who) titel.wie = wie(d.who);
      if (!metTitel) titel.deel = 1;
      // In een thema (Kerst) horen de streeknamen bij het deel: de eerste delen spelen in het Oude Testament (geen veld nt).
      const ot = !!b.thema && !d.nt;
      if (ot && titel.kaart) titel.kaart.ot = 1;
      pk.dias.push(titel);
      sleutels.forEach((key) => {
        const { s, i } = stapVan.get(key);
        const eerder = []; for (let j = 0; j < i; j++) eerder.push(`${b.id}:${d.id}:${j}`);
        const dia = { s: "stap", sleutel: key, nr: i + 1, van: n, kop: `Stap ${i + 1} van ${n}`, t: s.t, ref: s.ref, txt: niveau === "a" ? eersteZin(s.txt) : s.txt, kaart: kaartVan(key, eerder) };
        const km = s.r ? roundKm(s.r.reduce((som, r) => { const pts = r.p.map(ll).filter(Boolean); return som + pts.slice(1).reduce((x, q, j) => x + hav(pts[j], q), 0); }, 0)) : 0;
        if (niveau !== "a") { if (s.fact) { dia.fact = s.fact; if (s.fs && FS[s.fs]) dia.fs = FS[s.fs]; } if (km) dia.km = km; }
        if (niveau === "c" && s.who) dia.wie = wie(s.who);
        const tf = tafereel(key); if (tf) dia.tf = tf;
        if (ot && dia.kaart) dia.kaart.ot = 1;
        pk.dias.push(dia);
      });
      // Elders in de Bijbel en het weetje van het deel: alleen bij het hele deel, op niveau c.
      if (niveau === "c" && heel && (d.cross || []).length) pk.dias.push({ s: "tekst", kop: d.n, t: "Elders in de Bijbel", kruis: d.cross, ...(d.stat ? { txt: d.stat, label: "Wist je dat?" } : {}) });
      // Vragen (speurtocht). Samen ontdekken en Zelf op reis: de vragen van de geschiedenissen bij deze stappen, zoals
      // de atlas doet; anders, en op niveau c, de meerkeuzevragen van het deel (bij een stuk: alleen over die stappen).
      const set = new Set(sleutels), refs = sleutels.map((key) => stapVan.get(key).s.ref);
      const eigen = (BR.geschiedenissen || []).filter((g) => (g.stappen || []).some((key) => set.has(key))).sort((x, y) => x.nr - y.nr).flatMap((g) => (versie(g) || {}).vragen || []);
      const mc = ((d.quiz || {}).mc || []).filter((q) => heel || overlapt(q.why, refs));
      const lijst = niveau === "a" ? (eigen.length ? eigen : mc) : niveau === "b" && eigen.length >= MAX_VRAGEN ? eigen : mc;
      vragen(lijst, niveau === "a").forEach((v) => pk.dias.push({ ...v, kop: d.n }));
      return { titel, sleutels };
    }

    // ---------- een geschiedenis ----------
    function verhaalDias(g) {
      const v = versie(g), stappen = (g.stappen || []).filter((key) => stapVan.has(key));
      const eerste = stappen[0] && stapVan.get(stappen[0]);
      pk.titel = g.t; pk.ref = g.ref; pk.kleur = eerste ? eerste.d.c : g.nr >= 80 ? "lila" : "kobalt"; pk.nt = eerste ? !!eerste.b.nt : g.nr >= 80; pk.nr = g.nr;
      const alleen = niveau === "a" && v && v.plaatsen ? v.plaatsen : null;
      const titel = { s: "titel", kop: `Geschiedenis ${g.nr}`, t: g.t, ref: g.ref, lees: g.ref, intro: "", kaart: overzicht(stappen, alleen) };
      if (niveau === "c") { const dt = g.tl === null || g.tijd === null ? null : g.tijd ? datering(g) : eerste ? datering({ ...eerste.d, tijdNoot: g.tijdNoot || eerste.d.tijdNoot }, `${eerste.b.id}:${eerste.d.id}`) : null; if (dt) titel.tijd = dt; if ((g.wie || []).length) titel.wie = g.wie.slice(); }
      pk.dias.push(titel);
      // De vertelling op dit niveau, in onderdelen: a korte stappen, b een eigen vertelling, c de bestaande vertelling.
      let delen;
      if (niveau !== "c" && v && v.delen) delen = v.delen.map((x) => ({ kop: x.kop || "", t: x.t, stap: x.stap }));
      else {
        const ind = (BR.indeling || {})[g.nr], tekst = g.uitleg || "";
        const begin = ind && ind.length > 1 ? ind.map(([, bg], i) => (i === 0 ? 0 : tekst.indexOf(bg))) : null;
        delen = begin && !begin.some((x, i) => x < 0 || (i && x <= begin[i - 1])) ? ind.map(([kop, , stap], i) => ({ kop, stap, t: tekst.slice(begin[i], begin[i + 1]).trim() })) : [{ kop: "", t: tekst }];
        if (niveau !== "c") pk.meldingen.push(`Deze geschiedenis is nog niet bewerkt voor ${pk.niveauNaam}; hier staat de vertelling van Verder ontdekken.`);
      }
      const gehad = [];
      delen.forEach((x, i) => {
        const key = x.stap && stapVan.has(x.stap) ? x.stap : null;
        // Een deel zonder eigen kop (Samen ontdekken) krijgt de titel van de geschiedenis.
        const dia = { s: "stap", nr: i + 1, van: delen.length, kop: x.kop ? `${g.t} · ${i + 1} van ${delen.length}` : `${i + 1} van ${delen.length}`, t: x.kop || g.t, ref: key ? stapVan.get(key).s.ref : g.ref, txt: x.t, kaart: key ? kaartVan(key, gehad.filter((y) => y !== key), alleen) : overzicht(stappen, alleen) };
        if (key) { dia.sleutel = key; const tf = tafereel(key); if (tf) dia.tf = tf; if (!gehad.includes(key)) gehad.push(key); }
        if (!dia.kaart) delete dia.kaart;
        pk.dias.push(dia);
      });
      if (niveau === "a" && v && v.samen) pk.voorlezer = v.samen;
      if (niveau === "c") {
        if (g.betekenis || (g.cross || []).length) pk.dias.push({ s: "tekst", kop: g.t, t: "Uitleg", txt: g.betekenis || "", ...((g.cross || []).length ? { kruis: g.cross, kruisKop: "Elders in de Bijbel" } : {}) });
        ((v && v.verdieping) || []).forEach((x) => pk.dias.push({ s: "tekst", kop: "Verdieping", t: x.kop, txt: x.t, refs: x.refs || [] }));
      }
      const lijst = niveau === "c" ? (g.quiz || []).concat((v && v.vragen) || []) : (v && v.vragen) || g.quiz || [];
      vragen(lijst, niveau === "a").forEach((q) => pk.dias.push({ ...q, kop: g.t }));
    }

    // ---------- kiezen ----------
    if (keuze.soort === "verhaal") {
      const g = (BR.geschiedenissen || []).find((x) => x.nr === keuze.nr);
      if (!g) return null;
      verhaalDias(g);
      pk.keuze = { soort: "verhaal", nr: g.nr, niveau };
    } else if (keuze.soort === "boek") {
      const b = BR.boeken.find((x) => x.id === keuze.boek);
      if (!b) return null;
      pk.titel = b.n; pk.ref = b.delen.map((d) => d.ref).join(" · "); pk.kleur = b.delen[0].c; pk.nt = !!b.nt;
      const voorblad = { s: "titel", kop: "Op reis door de Bijbel", t: b.n, ref: "", lees: "", intro: niveau === "a" ? eersteZin(b.intro) : b.intro || "", delen: b.delen.map((d) => [d.n, d.ref]) };
      pk.dias.push(voorblad);
      const alle = [];
      b.delen.forEach((d) => { alle.push(...deelDias(b, d, null, null, false).sleutels); });
      voorblad.kaart = overzicht(alle); voorblad.stappen = alle.length;
      pk.keuze = { soort: "boek", boek: b.id, niveau };
    } else if (keuze.soort === "deel") {
      let b = null, d = null;
      BR.boeken.forEach((x) => x.delen.forEach((y) => { if (y.id === keuze.deel && (!keuze.boek || keuze.boek === x.id) && !d) { b = x; d = y; } }));
      if (!d) return null;
      pk.titel = d.n; pk.ref = d.ref; pk.kleur = d.c; pk.nt = b.thema ? !!d.nt : !!b.nt;
      const n = d.steps.length, van = keuze.van ? Math.max(1, Math.min(n, keuze.van)) : null, tot = van ? Math.max(van, Math.min(n, keuze.tot || van)) : null;
      deelDias(b, d, van, tot, true);
      pk.keuze = { soort: "deel", deel: d.id, niveau, ...(van && !(van === 1 && tot === n) ? { van, tot } : {}) };
    } else return null;
    pk.dias.push({ s: "slot" });
    pk.hash = maakHash(pk.keuze);
    return pk;
  }

  const api = { lees, maakHash, maak, eersteZin, NIVS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  (global.BR = global.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} }).boekjeInhoud = api;
})(typeof window !== "undefined" ? window : globalThis);
