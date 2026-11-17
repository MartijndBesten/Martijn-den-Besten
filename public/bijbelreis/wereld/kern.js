// ‘De wereld in die tijd’: de rekenkern, zonder scherm. Tijdas, levenslijnen, overlap, de vorm van een gebied op een
// bepaald jaar, en de controle van een periodebestand (perioden/<id>.json). wereld.js tekent; deze kern rekent.
// Uitleg en datamodel: docs/bijbelreis-wereld/README.md. Getest in tests/bijbelreis-wereld.test.ts (los van de browser).
(function (root) {
  "use strict";

  // ---------- tijdas ----------
  // Intern loopt de tijd t altijd vooruit. Op een as ‘vchr’ (jaar v.Chr., van groot naar klein) is t = -jaar.
  // Een as ‘nchr’ mag vóór Christus beginnen (de wereld rond de geboorte van de Heere Jezus): een negatief jaar is dan
  // v.Chr. (-4 = 4 v.Chr.). Een jaar 0 bestaat niet: na 1 v.Chr. komt 1 n.Chr. Intern telt t door zonder gat (t = 0 is
  // 1 v.Chr., t = -3 is 4 v.Chr.), zodat afstanden kloppen: van 4 v.Chr. tot 6 n.Chr. is 9 jaar, niet 10.
  // ‘leeftijd’: een as in levensjaren van één persoon (Mozes, 0–120) als een jaartal in onze jaartelling niet vaststaat.
  // Jaar n is dan ‘n jaar oud’; een jaar telt afgerond (jaar 80 loopt van 79,5 tot 80,5), zodat gebeurtenissen in
  // hetzelfde jaar op volgorde kunnen staan zonder dat er een datum binnen het jaar wordt beweerd.
  const SOORTEN_AS = ["am", "vchr", "nchr", "leeftijd"];
  const telt = (as) => !as || as.soort === "am" || as.soort === "leeftijd";
  const naarT = (jaar, as) => (jaar == null ? null : as && as.soort === "vchr" ? -jaar : as && as.soort === "nchr" && jaar < 0 ? +jaar + 1 : +jaar);
  // Terug naar een jaartal op de as. Bij ‘nchr’ ligt de grens op t = 0,5, zodat Math.round(naarJaar(t)) hetzelfde jaar
  // geeft als jaarTekst(t) (nooit het niet-bestaande jaar 0).
  const naarJaar = (t, as) => (as && as.soort === "vchr" ? -t : as && as.soort === "nchr" && t < 0.5 ? t - 1 : t);
  // Loopt de as over het begin van de jaartelling heen (v.Chr. en n.Chr. op één as)?
  const gemengd = (as) => !!as && as.soort === "nchr" && Math.min(as.van, as.tot) < 0;
  function bereik(as) {
    const a = naarT(as.van, as), b = naarT(as.tot, as);
    return [Math.min(a, b), Math.max(a, b)];
  }
  // Het jaar zoals een mens het leest. Jaar 0 bestaat niet in onze jaartelling: na 1 v.Chr. komt 1 n.Chr.
  function jaarTekst(t, as, kort) {
    const n = Math.round(t);
    if (as && as.soort === "leeftijd" && n < 0) return kort ? String(n) : -n + " jaar vóór de geboorte van " + (as.wie || "de hoofdpersoon");
    if (telt(as)) return kort ? String(n) : "jaar " + n;
    if (as.soort === "nchr") return n <= 0 ? 1 - n + " v.Chr." : n + " n.Chr.";
    if (n <= 0) return (n === 0 ? 1 : -n) + " v.Chr.";
    return n + " n.Chr.";
  }
  // Een jaartal zoals het in de gegevens staat (bijv. een marge) als tekst.
  const jaarAsTekst = (jaar, as) => jaarTekst(naarT(jaar, as), as);
  // Twee jaartallen (marge of tijdvak) kort: ‘587 of 586 v.Chr.’, ‘6–4 v.Chr.’, ‘1 v.Chr.–1 n.Chr.’, ‘jaar 1656–1657’.
  function tweeJaren(j1, j2, as, of) {
    const a = jaarAsTekst(j1, as), b = jaarAsTekst(j2, as), tussen = of ? " of " : "–";
    if (telt(as)) return a + tussen + b.replace(/^jaar /, "");
    const ea = a.replace(/^\d+ /, ""), eb = b.replace(/^\d+ /, "");
    return ea === eb ? a.replace(/ .*$/, "") + tussen + b : a + tussen + b;
  }
  // Het label van een streepje op de as: een kaal getal, of op een gemengde as met v.Chr./n.Chr. erbij.
  const streepTekst = (t, as) => (gemengd(as) ? jaarTekst(t, as) : String(Math.abs(Math.round(naarJaar(t, as)))));
  // Een lineaire schaal tussen tijd en schermpositie.
  function schaal(t0, t1, x0, x1) {
    const k = (x1 - x0) / ((t1 - t0) || 1);
    return { t0, t1, x0, x1, k, x: (t) => x0 + (t - t0) * k, t: (x) => t0 + (x - x0) / k };
  }
  // Mooie streepjes op de as: de kleinste stap waarbij twee labels minstens minPx uit elkaar staan.
  const STAPPEN = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];
  // Op een gemengde as staan de streepjes op ronde jaartallen (10 v.Chr., 1 n.Chr., 10 n.Chr.); het jaar 0 bestaat niet:
  // bij stappen van 5 jaar of meer staat daar 1 n.Chr., bij kleinere stappen niets.
  function streepjes(t0, t1, pxPerJaar, minPx, as) {
    const stap = STAPPEN.find((s) => s * pxPerJaar >= (minPx || 64)) || STAPPEN[STAPPEN.length - 1];
    const uit = [];
    if (gemengd(as)) {
      for (let j = Math.ceil(naarJaar(t0, as) / stap) * stap; j <= naarJaar(t1, as) + 1e-9; j += stap) {
        const t = naarT(j === 0 ? 1 : j, as);
        if ((j !== 0 || stap >= 5) && t >= t0 - 1e-9 && t <= t1 + 1e-9) uit.push(t);
      }
      return { stap, ticks: uit };
    }
    for (let t = Math.ceil(t0 / stap) * stap; t <= t1 + 1e-9; t += stap) uit.push(t);
    return { stap, ticks: uit };
  }
  // Inzoomen rond een vast punt (de afspeelkop of een vinger), binnen de grenzen van de as.
  function zoom(venster, factor, rond, grens, minSpan) {
    const [a, b] = venster, [lo, hi] = grens;
    let span = Math.min(hi - lo, Math.max(minSpan || 10, (b - a) / factor));
    const f = (rond - a) / ((b - a) || 1);
    let na = rond - f * span;
    na = Math.max(lo, Math.min(hi - span, na));
    return [na, na + span];
  }
  function schuif(venster, dt, grens) {
    const [a, b] = venster, span = b - a;
    const na = Math.max(grens[0], Math.min(grens[1] - span, a + dt));
    return [na, na + span];
  }
  const vloeiend = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

  // ---------- gebieden: vormen die met de tijd veranderen ----------
  const PUNTEN = 72;
  const ringen = (g) => (!g ? [] : g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : []);
  function oppervlak(ring) {
    let s = 0;
    for (let i = 0, n = ring.length; i < n; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % n]; s += x1 * y2 - x2 * y1; }
    return s / 2;
  }
  // Gelijk aantal punten, gelijk verdeeld over de omtrek, tegen de klok in. Dan kun je twee vormen punt voor punt mengen.
  function herbemonster(ring, n = PUNTEN) {
    let r = ring.slice();
    if (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop();
    if (oppervlak(r) < 0) r.reverse();
    const lengtes = [0];
    for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; lengtes.push(lengtes[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const totaal = lengtes[lengtes.length - 1] || 1, uit = [];
    let j = 0;
    for (let k = 0; k < n; k++) {
      const d = (k / n) * totaal;
      while (j < r.length - 1 && lengtes[j + 1] < d) j++;
      const a = r[j], b = r[(j + 1) % r.length], seg = lengtes[j + 1] - lengtes[j] || 1, f = (d - lengtes[j]) / seg;
      uit.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }
    return uit;
  }
  // Draai de punten van b zo dat ze zo dicht mogelijk bij die van a liggen (anders draait een vorm tijdens het mengen).
  function lijnUit(a, b) {
    const n = a.length;
    let beste = 0, min = Infinity;
    for (let s = 0; s < n; s++) {
      let som = 0;
      for (let i = 0; i < n && som < min; i++) { const p = a[i], q = b[(i + s) % n]; som += (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; }
      if (som < min) { min = som; beste = s; }
    }
    return b.map((_, i) => b[(i + beste) % n]);
  }
  const midden = (r) => r.reduce((m, p) => [m[0] + p[0] / r.length, m[1] + p[1] / r.length], [0, 0]);
  const meng = (a, b, f) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * f, p[1] + (b[i][1] - p[1]) * f]);
  // Delen van twee sleutels aan elkaar koppelen (grootste bij grootste). Een deel zonder partner krimpt naar zijn eigen
  // midden of groeit eruit.
  function koppelDelen(A, B) {
    const paren = [];
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      const a = A[i], b = B[i];
      if (a && b) paren.push([a, lijnUit(a, b)]);
      else if (a) { const m = midden(a); paren.push([a, a.map(() => m)]); }
      else { const m = midden(b); paren.push([b.map(() => m), b]); }
    }
    return paren;
  }
  function bereidGebied(g, as) {
    const sleutels = (g.sleutels || []).map((s) => {
      const delen = ringen(s.geometrie).map((r) => herbemonster(r)).sort((x, y) => Math.abs(oppervlak(y)) - Math.abs(oppervlak(x)));
      return { t: naarT(s.jaar, as), jaar: s.jaar, betrouwbaarheid: s.betrouwbaarheid || "benaderd", delen };
    }).sort((x, y) => x.t - y.t);
    const overgangen = sleutels.slice(1).map((s, i) => koppelDelen(sleutels[i].delen, s.delen));
    return { ...g, sleutels, overgangen };
  }
  // De vorm op tijd t: ringen als [lat, lng] (voor Leaflet), dekking (0–1) en betrouwbaarheid.
  function gebiedOp(g, t, vervaag) {
    const S = g.sleutels;
    if (!S.length) return null;
    const eerste = S[0].t, laatste = S[S.length - 1].t;
    // Van de eerste tot de laatste sleutel staat het gebied er helemaal; het komt in de laatste `v` jaar ervóór op en
    // vervaagt in `v` jaar erna (een korte, rustige overgang in plaats van een sprong). Eén sleutel: alleen rond dat jaar.
    const v = Math.max(1e-6, vervaag / 2);
    if (t < eerste - v || t > laatste + v) return null;
    const dekking = S.length === 1 ? 1 - Math.min(1, Math.abs(t - eerste) / v) : Math.min(vloeiend((t - eerste + v) / v), vloeiend((laatste + v - t) / v));
    if (dekking <= 0.001) return null;
    let delen, betrouwbaarheid;
    if (t <= eerste || S.length === 1) { delen = S[0].delen; betrouwbaarheid = S[0].betrouwbaarheid; }
    else if (t >= laatste) { delen = S[S.length - 1].delen; betrouwbaarheid = S[S.length - 1].betrouwbaarheid; }
    else {
      let i = 0;
      while (i < S.length - 2 && S[i + 1].t <= t) i++;
      const a = S[i], b = S[i + 1], f = vloeiend((t - a.t) / ((b.t - a.t) || 1));
      delen = g.overgangen[i].map(([p, q]) => meng(p, q, f));
      betrouwbaarheid = a.betrouwbaarheid === "historisch" && b.betrouwbaarheid === "historisch" ? "historisch" : f < 0.5 ? a.betrouwbaarheid : b.betrouwbaarheid;
    }
    return { dekking, betrouwbaarheid, delen: delen.map((r) => r.map(([lng, lat]) => [lat, lng])) };
  }

  // Een ring afknippen op een lengtegraad (alleen het deel west of oost ervan houden): Sutherland–Hodgman tegen één lijn.
  // Punten zijn [lat, lng]. Gebruikt waar de ondergrond van de kaart ophoudt.
  function knip(ring, lng, west) {
    const binnen = (p) => (west ? p[1] <= lng : p[1] >= lng);
    const snij = (a, b) => { const f = (lng - a[1]) / (b[1] - a[1]); return [a[0] + (b[0] - a[0]) * f, lng]; };
    const uit = [];
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if (binnen(a)) { uit.push(a); if (!binnen(b)) uit.push(snij(a, b)); }
      else if (binnen(b)) uit.push(snij(a, b));
    }
    return uit;
  }

  // ---------- de reis op de kaart (Mozes: de woestijnreis) ----------
  // Een periode kan een reis hebben die met de tijd over de kaart loopt. De lijnen komen NIET uit het periodebestand maar
  // uit de bestaande reisstappen van de atlas (inhoud/*.js, stapsleutel ‘boek:deel:index’, de routes `r` van die stap):
  // zo is de route op beide kaarten dezelfde, met dezelfde reconstructies (recon) en dezelfde plaatsen.
  // Een deel: { stap, r: [indexen, standaard 0], van, tot } (jaren op de as; tussen van en tot loopt de reiziger).
  const STAPSLEUTEL = /^[a-z0-9-]+:[a-z0-9-]+:\d+$/;
  function stappenVan(boeken) {
    const m = new Map();
    (boeken || []).forEach((b) => (b.delen || []).forEach((d) => (d.steps || []).forEach((s, i) => m.set(b.id + ":" + d.id + ":" + i, s))));
    return m;
  }
  function puntVan(k, plaatsen, W) {
    if (Array.isArray(k) && k.length === 2 && k.every((x) => typeof x === "number")) return k;
    if (typeof k === "string" && plaatsen && plaatsen[k]) return plaatsen[k].ll;
    if (typeof k === "string" && W && W[k]) return W[k];
    return null;
  }
  // Afstand in graden, met de lengtegraad versmald (genoeg om een lijn gelijkmatig af te lopen).
  const afstand = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos(((a[0] + b[0]) / 2) * Math.PI / 180));
  function bereidReis(reis, as, ctx = {}) {
    if (!reis || !Array.isArray(reis.delen) || !reis.delen.length) return null;
    const stappen = ctx.stappen || stappenVan(ctx.boeken);
    const delen = reis.delen.map((d) => {
      const stap = stappen.get(d.stap);
      const stukken = (d.r || [0]).map((i) => stap && stap.r && stap.r[i]).filter(Boolean).map((r) => {
        const pts = (r.p || []).map((k) => puntVan(k, ctx.plaatsen, ctx.W)).filter(Boolean);
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + afstand(pts[i - 1], pts[i]));
        return { pts, cum, len: cum[cum.length - 1], recon: !!r.recon };
      }).filter((x) => x.pts.length > 1);
      const a = naarT(d.van, as), b = naarT(d.tot, as);
      return { ...d, t0: Math.min(a, b), t1: Math.max(a, b), stukken, len: stukken.reduce((n, x) => n + x.len, 0) };
    }).filter((d) => d.stukken.length).sort((x, y) => x.t0 - y.t0);
    if (!delen.length) return null;
    const onbekend = (reis.onbekend || []).map((o) => ({ ...o, t0: Math.min(naarT(o.van, as), naarT(o.tot, as)), t1: Math.max(naarT(o.van, as), naarT(o.tot, as)) }));
    return { ...reis, delen, onbekend };
  }
  // Het afgelegde deel van een reisdeel bij fractie f (0–1): per stuk de punten tot daar.
  function afgelegd(deel, f) {
    let rest = Math.max(0, Math.min(1, f)) * deel.len;
    return deel.stukken.map((s) => {
      if (rest >= s.len - 1e-12) { rest -= s.len; return { pts: s.pts, recon: s.recon, heel: true }; }
      if (rest <= 0) return { pts: [], recon: s.recon, heel: false };
      const uit = [s.pts[0]];
      for (let i = 1; i < s.pts.length; i++) {
        if (s.cum[i] <= rest) { uit.push(s.pts[i]); continue; }
        const a = s.pts[i - 1], b = s.pts[i], g = (rest - s.cum[i - 1]) / ((s.cum[i] - s.cum[i - 1]) || 1);
        uit.push([a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g]);
        break;
      }
      rest = 0;
      return { pts: uit, recon: s.recon, heel: false };
    });
  }
  // Waar is de reiziger op tijd t? Vóór het eerste deel aan het begin, tussen twee delen aan het eind van het vorige.
  function reisOp(R, t) {
    if (!R) return null;
    const D = R.delen;
    let i = -1;
    for (let k = 0; k < D.length; k++) if (D[k].t0 <= t + 1e-9) i = k;
    const zwerft = R.onbekend.find((o) => t >= o.t0 - 1e-9 && t <= o.t1 + 1e-9) || null;
    if (i < 0) return { i: -1, f: 0, ll: D[0].stukken[0].pts[0], lopend: false, zwerft, richting: 0 };
    const d = D[i], f = t >= d.t1 ? 1 : (t - d.t0) / ((d.t1 - d.t0) || 1);
    const stukken = afgelegd(d, f).filter((s) => s.pts.length);
    const laatste = stukken[stukken.length - 1].pts, ll = laatste[laatste.length - 1], voor = laatste[laatste.length - 2] || ll;
    return { i, f, ll, lopend: f > 0 && f < 1, zwerft, richting: Math.sign(ll[1] - voor[1]) };
  }

  // ---------- het periodebestand klaarzetten ----------
  const STATUS = ["expliciet", "berekend", "traditioneel", "historisch", "benaderd"];
  const EINDE = ["stierf", "weggenomen", "afgezet", "onbekend", "leeft door"];
  function plekVan(p, plaatsen) {
    if (Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === "number")) return { ll: p, gebied: false };
    if (typeof p === "string" && plaatsen && plaatsen[p]) return { ll: plaatsen[p].ll, gebied: plaatsen[p].c === "r", naam: plaatsen[p].n, zeker: plaatsen[p].c };
    return null;
  }
  // [vroegst, laatst] als tijden, oplopend; null zonder marge.
  const margeT = (m, as) => (Array.isArray(m) && m.length === 2 && m.every((x) => typeof x === "number") ? [naarT(m[0], as), naarT(m[1], as)].sort((a, b) => a - b) : null);
  function bereid(data, ctx = {}) {
    const as = data.as, [tMin, tMax] = bereik(as);
    const G = (data.gebeurtenissen || []).map((e) => ({ ...e, t: naarT(e.jaar, as), t2: naarT(e.tot != null ? e.tot : e.jaar, as), plek: plekVan(e.plaats, ctx.plaatsen), margeT: margeT(e.marge, as) }))
      .map((e) => ({ ...e, t: Math.min(e.t, e.t2), t2: Math.max(e.t, e.t2) })).sort((a, b) => a.t - b.t);
    const P = (data.personen || []).map((p, rij) => {
      const van = p.van || {}, tot = p.tot || {};
      const eigen = G.filter((e) => (e.personen || []).includes(p.id));
      const ruwT0 = van.jaar != null ? naarT(van.jaar, as) : eigen.length ? eigen[0].t : tMin;
      let einde = tot.einde || (tot.jaar == null ? "onbekend" : "stierf");
      const ruwT1 = tot.jaar != null ? naarT(tot.jaar, as) : einde === "leeft door" ? tMax : eigen.length ? eigen[eigen.length - 1].t2 : ruwT0;
      // Een lijn mag vóór het begin van de as beginnen of na het einde doorlopen: dan wordt hij afgekapt en loopt hij
      // zichtbaar ‘door’ (bijv. Darius I, koning tot 486 v.Chr. op een as tot 515).
      const voorAs = ruwT0 < tMin, naAs = ruwT1 > tMax;
      const t0 = Math.max(tMin, Math.min(tMax, ruwT0)), t1 = Math.max(t0, Math.min(tMax, ruwT1));
      if (naAs && einde !== "onbekend") einde = "leeft door";
      // Waar begint de lijn? Bij de geboorte (standaard), of bij iets anders (begin van een regering, de wegvoering, de
      // roeping): dan is er geen leeftijd.
      const begin = van.begin || "geboorte";
      // Een geboorte vóór de as die wel bekend is (Aäron, drie jaar ouder dan Mozes): de lijn is afgekapt, maar de leeftijd
      // is uit te rekenen.
      const geboorteBekend = begin === "geboorte" && van.jaar != null && van.status !== "benaderd";
      return { ...p, rij, t0, t1, einde, begin, geboorteBekend, tGeboren: van.jaar != null ? ruwT0 : null, afronden: as.soort === "leeftijd", lijn: p.lijn || "leven", voorAs, naAs, beginOnzeker: van.jaar == null || van.status === "benaderd" || voorAs, eindOnzeker: einde === "onbekend" || einde === "leeft door" || tot.status === "benaderd", margeVan: margeT(van.marge, as), margeTot: margeT(tot.marge, as), kinderen: [] };
    });
    const byId = new Map(P.map((p) => [p.id, p]));
    P.forEach((p) => { const o = p.ouder && byId.get(p.ouder); if (o) o.kinderen.push(p.id); });
    const vervaag = Math.max(as.stap || 1, (tMax - tMin) * 0.035);
    const gebieden = (data.gebieden || []).map((g) => bereidGebied(g, as));
    const steden = (data.steden || []).map((s) => {
      const pl = s.plaatsId && ctx.plaatsen && ctx.plaatsen[s.plaatsId];
      const ll = typeof s.lat === "number" && typeof s.lng === "number" ? [s.lat, s.lng] : pl ? pl.ll : null;
      return { ...s, ll };
    }).filter((s) => s.ll);
    const reis = bereidReis(data.reis, as, ctx);
    const heeftKaart = gebieden.length > 0 || steden.length > 0 || G.some((e) => e.plek) || !!reis;
    // Rustiger afspelen in drukke stukken (as.tempo: [{ van, tot, factor }]): bijv. het jaar van de uittocht.
    const tempo = (as.tempo || []).map((z) => ({ t0: Math.min(naarT(z.van, as), naarT(z.tot, as)), t1: Math.max(naarT(z.van, as), naarT(z.tot, as)), factor: z.factor }));
    return { data, as, tMin, tMax, personen: P, byId, gebeurtenissen: G, gebieden, steden, vervaag, heeftKaart, reis, tempo };
  }

  // ---------- levenslijnen ----------
  // Leeft iemand op tijd t? In het jaar van zijn dood (of wegneming) niet meer; bij een onbekend einde alleen tot het
  // laatste jaar waarin de Bijbel hem nog noemt.
  const leeftNog = (p, t) => t >= p.t0 && (p.einde === "leeft door" || (p.einde === "onbekend" ? t <= p.t1 : t < p.t1));
  // Leeftijd in hele jaren op tijd t (null als de geboorte niet bekend is of de persoon er niet is).
  function leeftijd(p, t) {
    if (t < p.t0 || p.begin !== "geboorte" || (p.voorAs ? !p.geboorteBekend : p.beginOnzeker && (!p.van || p.van.jaar == null))) return null;
    const d = Math.min(t, p.einde === "onbekend" || p.einde === "leeft door" ? t : p.t1) - (p.voorAs ? p.tGeboren : p.t0);
    return p.afronden ? Math.round(d) : Math.floor(d + 1e-9);
  }
  // Hoe lang leefden twee mensen tegelijk? ‘minstens’ als een einde onbekend is en dat einde de grens bepaalt;
  // ‘ongeveer’ als een begin of einde bij benadering is.
  function overlap(a, b) {
    const van = Math.max(a.t0, b.t0), tot = Math.min(a.t1, b.t1);
    if (tot < van) {
      const eerst = a.t1 < b.t0 ? a : b, later = eerst === a ? b : a;
      return { jaren: 0, van: null, tot: null, tussen: later.t0 - eerst.t1, eerst: eerst.id, later: later.id, minstens: eerst.einde === "onbekend", ongeveer: eerst.eindOnzeker || later.beginOnzeker };
    }
    const grens = a.t1 <= b.t1 ? a : b;
    const minstens = grens.einde === "onbekend" || grens.einde === "leeft door";
    const laat = a.t0 >= b.t0 ? a : b;
    const ongeveer = (laat.beginOnzeker && !laat.geboorteBekend) || (!minstens && grens.eindOnzeker);
    return { jaren: Math.round(tot - van), van, tot, minstens, ongeveer };
  }
  // Alle momenten in de tijd: geboorten, einden en gebeurtenissen, op volgorde (voor stap-voor-stap en de lijst).
  function momenten(model) {
    const uit = [];
    model.personen.forEach((p) => {
      if (p.van && p.van.jaar != null) uit.push({ t: p.t0, soort: "geboorte", persoon: p.id });
      if (p.tot && p.tot.jaar != null && p.einde !== "onbekend" && p.einde !== "leeft door") uit.push({ t: p.t1, soort: p.einde === "weggenomen" ? "weggenomen" : p.einde === "afgezet" ? "afgezet" : "einde", persoon: p.id });
    });
    model.gebeurtenissen.forEach((e) => uit.push({ t: e.t, soort: "gebeurtenis", gebeurtenis: e.id }));
    const volg = { gebeurtenis: 0, geboorte: 1, einde: 2, weggenomen: 2, afgezet: 2 };
    return uit.sort((a, b) => a.t - b.t || volg[a.soort] - volg[b.soort]);
  }

  // ---------- controle van een periodebestand ----------
  // refs (optioneel): { plaatsen, mensen, verhalen: Set('v1'…), refOk(tekst) } — wat de atlas zelf kent.
  function controleer(data, refs = {}) {
    const fout = [];
    const f = (m) => fout.push(m);
    if (!data || typeof data !== "object") return ["geen gegevens"];
    if (!/^[a-z0-9-]+$/.test(data.id || "")) f("id ontbreekt of is ongeldig");
    if (!data.titel) f("titel ontbreekt");
    const as = data.as;
    if (!as || !SOORTEN_AS.includes(as.soort) || typeof as.van !== "number" || typeof as.tot !== "number") { f("as ontbreekt of is ongeldig"); return fout; }
    const [tMin, tMax] = bereik(as);
    const binnen = (jaar) => { const t = naarT(jaar, as); return t >= tMin - 1e-9 && t <= tMax + 1e-9; };
    const bronIds = new Set((data.bronnen || []).map((b) => b.id));
    (data.bronnen || []).forEach((b) => { if (!b.id || !b.titel || !b.soort) f(`bron ${b.id || "?"}: id, soort en titel zijn nodig`); });
    const bronOk = (bron, wie) => {
      const lijst = Array.isArray(bron) ? bron : [bron];
      if (!lijst.length || lijst.some((x) => typeof x !== "string" || !x.trim())) return f(`${wie}: bron ontbreekt`);
      lijst.forEach((x) => { if (!bronIds.has(x) && refs.refOk && !refs.refOk(x)) f(`${wie}: bron ‘${x}’ is geen bekende bron-id en geen geldige Bijbelverwijzing`); });
    };
    const statusOk = (s, wie) => { if (!STATUS.includes(s)) f(`${wie}: status ‘${s}’ onbekend`); };
    const ids = new Set();
    const pids = new Set((data.personen || []).map((p) => p.id));
    const gids = new Set((data.gebeurtenissen || []).map((e) => e.id));
    (data.personen || []).forEach((p) => {
      const w = `persoon ${p.id}`;
      if (!p.id || ids.has(p.id)) f(`${w}: id ontbreekt of dubbel`); ids.add(p.id);
      if (!p.naam) f(`${w}: naam ontbreekt`);
      ["van", "tot"].forEach((k) => {
        const x = p[k];
        if (!x) return f(`${w}: ${k} ontbreekt`);
        statusOk(x.status, `${w}.${k}`);
        bronOk(x.bron, `${w}.${k}`);
        // Een persoon mag vóór de as beginnen of erna doorlopen (de lijn wordt afgekapt); een jaartal moet wel een getal zijn.
        if (x.jaar != null && typeof x.jaar !== "number") f(`${w}.${k}: jaar ${x.jaar} is geen getal`);
        if (x.marge != null && !(Array.isArray(x.marge) && x.marge.length === 2 && x.marge.every((j) => typeof j === "number"))) f(`${w}.${k}: marge moet [vroegst, laatst] zijn`);
      });
      if (p.tot && !EINDE.includes(p.tot.einde || "stierf")) f(`${w}: einde ‘${p.tot.einde}’ onbekend`);
      if (p.van && p.tot && p.van.jaar != null && p.tot.jaar != null && naarT(p.tot.jaar, as) < naarT(p.van.jaar, as)) f(`${w}: einde vóór begin`);
      if (p.ouder != null && !pids.has(p.ouder)) f(`${w}: ouder ‘${p.ouder}’ bestaat niet`);
      // ref: de Bijbelgedeelten over deze persoon; leeg voor iemand die niet in de Bijbel staat (bijv. Nabonidus).
      if (p.ref != null && !Array.isArray(p.ref)) f(`${w}: ref moet een lijst zijn`); else (p.ref || []).forEach((r) => refs.refOk && !refs.refOk(r) && f(`${w}: verwijzing ‘${r}’ klopt niet`));
      if (p.personenId && refs.mensen && !refs.mensen[p.personenId]) f(`${w}: personenId ‘${p.personenId}’ bestaat niet in personen.js`);
      if (p.verhaal != null && (!/^v\d+$/.test(p.verhaal) || (refs.verhalen && !refs.verhalen.has(p.verhaal)))) f(`${w}: verhaal ‘${p.verhaal}’ bestaat niet`);
      (p.gebeurtenissen || []).forEach((g) => !gids.has(g) && f(`${w}: gebeurtenis ‘${g}’ bestaat niet`));
    });
    (data.gebeurtenissen || []).forEach((e) => {
      const w = `gebeurtenis ${e.id}`;
      if (!e.id || ids.has(e.id)) f(`${w}: id ontbreekt of dubbel`); ids.add(e.id);
      if (!e.titel || !e.tekst) f(`${w}: titel en tekst zijn nodig`);
      if (typeof e.jaar !== "number" || !binnen(e.jaar)) f(`${w}: jaar ontbreekt of valt buiten de as`);
      if (e.tot != null && (typeof e.tot !== "number" || !binnen(e.tot))) f(`${w}: tot valt buiten de as`);
      if (e.marge != null && !(Array.isArray(e.marge) && e.marge.length === 2 && e.marge.every((j) => typeof j === "number" && binnen(j)))) f(`${w}: marge moet [vroegst, laatst] binnen de as zijn`);
      statusOk(e.status, w);
      bronOk(e.bron, w);
      (e.personen || []).forEach((p) => !pids.has(p) && f(`${w}: persoon ‘${p}’ bestaat niet`));
      if (e.plaats != null && !plekVan(e.plaats, refs.plaatsen || {}) && !(typeof e.plaats === "string" && !refs.plaatsen)) f(`${w}: plaats ‘${e.plaats}’ bestaat niet`);
      if (e.verhaal != null && (!/^v\d+$/.test(e.verhaal) || (refs.verhalen && !refs.verhalen.has(e.verhaal)))) f(`${w}: verhaal ‘${e.verhaal}’ bestaat niet`);
    });
    (data.gebieden || []).forEach((g) => {
      const w = `gebied ${g.id}`;
      if (!g.id || !g.naam) f(`${w}: id en naam zijn nodig`);
      bronOk(g.bron, w);
      const S = g.sleutels || [];
      if (!S.length) f(`${w}: geen sleutels`);
      S.forEach((s, i) => {
        if (typeof s.jaar !== "number" || !binnen(s.jaar)) f(`${w}: sleutel ${i} heeft geen geldig jaar`);
        if (i && naarT(s.jaar, as) <= naarT(S[i - 1].jaar, as)) f(`${w}: sleutels niet op volgorde in de tijd`);
        if (!["benaderd", "gereconstrueerd", "historisch"].includes(s.betrouwbaarheid)) f(`${w}: sleutel ${i} heeft geen betrouwbaarheid (benaderd/gereconstrueerd/historisch)`);
        const rs = ringen(s.geometrie);
        if (!rs.length || rs.some((r) => !Array.isArray(r) || r.length < 4 || r.some((p) => !Array.isArray(p) || p.length < 2 || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90))) f(`${w}: sleutel ${i} heeft geen geldige geometrie (Polygon/MultiPolygon, [lng, lat])`);
      });
      if (g.hoofdstad && !(data.steden || []).some((s) => s.id === g.hoofdstad)) f(`${w}: hoofdstad ‘${g.hoofdstad}’ staat niet bij de steden`);
    });
    (data.steden || []).forEach((s) => {
      const w = `stad ${s.id}`;
      if (!s.id || !s.naam) f(`${w}: id en naam zijn nodig`);
      const heeftLl = typeof s.lat === "number" && typeof s.lng === "number";
      if (!heeftLl && !(s.plaatsId && (!refs.plaatsen || refs.plaatsen[s.plaatsId]))) f(`${w}: geen ligging (lat/lng of bestaande plaatsId)`);
      if (s.plaatsId && refs.plaatsen && !refs.plaatsen[s.plaatsId]) f(`${w}: plaatsId ‘${s.plaatsId}’ bestaat niet`);
      bronOk(s.bron, w);
    });
    (data.koppelingen || []).forEach((k, i) => {
      const w = `koppeling ${i}`;
      if (!/^v\d+$/.test(k.verhaal || "") || (refs.verhalen && !refs.verhalen.has(k.verhaal))) f(`${w}: verhaal ‘${k.verhaal}’ bestaat niet`);
      if (typeof k.jaar !== "number" || !binnen(k.jaar)) f(`${w}: jaar valt buiten de as`);
      (k.personen || []).forEach((p) => !pids.has(p) && f(`${w}: persoon ‘${p}’ bestaat niet`));
      (k.gebeurtenissen || []).forEach((g) => !gids.has(g) && f(`${w}: gebeurtenis ‘${g}’ bestaat niet`));
    });
    if (data.start != null && (typeof data.start !== "number" || !binnen(data.start))) f("start valt buiten de as");
    if (data.kader != null && !(Array.isArray(data.kader) && data.kader.length === 2 && data.kader.every((p) => Array.isArray(p) && p.length === 2 && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180) && data.kader[0][0] < data.kader[1][0] && data.kader[0][1] < data.kader[1][1])) f("kader moet [[zuid, west], [noord, oost]] zijn");
    // Op een as ‘nchr’ is een negatief jaar v.Chr.; een jaar 0 bestaat niet.
    if (as.soort === "nchr") {
      const nul = [];
      (data.personen || []).forEach((p) => ["van", "tot"].forEach((k) => p[k] && (p[k].jaar === 0 || (p[k].marge || []).includes(0)) && nul.push(`persoon ${p.id}.${k}`)));
      (data.gebeurtenissen || []).forEach((e) => (e.jaar === 0 || e.tot === 0 || (e.marge || []).includes(0)) && nul.push(`gebeurtenis ${e.id}`));
      (data.koppelingen || []).forEach((k, i) => (k.jaar === 0 || k.tot === 0) && nul.push(`koppeling ${i}`));
      (data.gebieden || []).forEach((g) => (g.sleutels || []).some((s) => s.jaar === 0) && nul.push(`gebied ${g.id}`));
      if (as.van === 0 || as.tot === 0 || data.start === 0) nul.push("as of start");
      nul.forEach((w) => f(`${w}: het jaar 0 bestaat niet (na 1 v.Chr. komt 1 n.Chr.)`));
    }
    (data.personen || []).forEach((p) => { if (p.ambt != null && (typeof p.ambt !== "string" || !/^[a-zë ]{3,24}$/.test(p.ambt))) f(`persoon ${p.id}: ambt moet een kort woord zijn`); });
    if (as.soort === "leeftijd" && !as.wie) f("as: een leeftijd-as noemt wie (as.wie)");
    (as.tempo || []).forEach((z, i) => {
      if (![z.van, z.tot].every((j) => typeof j === "number" && binnen(j)) || naarT(z.tot, as) <= naarT(z.van, as) || !(z.factor > 0 && z.factor <= 1)) f(`as.tempo ${i}: van < tot binnen de as en factor tussen 0 en 1`);
    });
    (data.gebieden || []).forEach((g) => { if (g.soort != null && g.soort !== "streek") f(`gebied ${g.id}: soort ‘${g.soort}’ onbekend (alleen ‘streek’)`); });
    if (data.reis != null) {
      const R = data.reis;
      if (!Array.isArray(R.delen) || !R.delen.length) f("reis: geen delen");
      bronOk(R.bron, "reis");
      const stappen = refs.stappen;
      let vorig = -Infinity;
      (R.delen || []).forEach((d, i) => {
        const w = `reis deel ${i} (${d.stap})`;
        if (!STAPSLEUTEL.test(d.stap || "")) return f(`${w}: stap moet ‘boek:deel:index’ zijn`);
        if (![d.van, d.tot].every((j) => typeof j === "number" && binnen(j)) || naarT(d.tot, as) < naarT(d.van, as)) f(`${w}: van en tot binnen de as, van ≤ tot`);
        else { if (naarT(d.van, as) < vorig - 1e-9) f(`${w}: niet op volgorde of overlapt het vorige deel`); vorig = naarT(d.tot, as); }
        if (d.r != null && !(Array.isArray(d.r) && d.r.length && d.r.every((x) => Number.isInteger(x) && x >= 0))) f(`${w}: r moet een lijst indexen zijn`);
        if (!stappen) return;
        const s = stappen.get(d.stap);
        if (!s) return f(`${w}: reisstap bestaat niet`);
        (d.r || [0]).forEach((x) => {
          const r = s.r && s.r[x];
          if (!r) return f(`${w}: de stap heeft geen route ${x}`);
          (r.p || []).forEach((k) => { if (!puntVan(k, refs.plaatsen, refs.W)) f(`${w}: punt ‘${k}’ onbekend`); });
        });
      });
      (R.onbekend || []).forEach((o, i) => { if (![o.van, o.tot].every((j) => typeof j === "number" && binnen(j)) || !o.tekst) f(`reis.onbekend ${i}: van, tot (binnen de as) en tekst zijn nodig`); });
    }
    return fout;
  }

  const K = { telt, stappenVan, bereidReis, afgelegd, reisOp, knip, margeT, naarT, naarJaar, gemengd, jaarAsTekst, tweeJaren, streepTekst, bereik, jaarTekst, schaal, streepjes, zoom, schuif, vloeiend, herbemonster, oppervlak, lijnUit, koppelDelen, bereidGebied, gebiedOp, bereid, leeftNog, leeftijd, overlap, momenten, controleer, STATUS, EINDE, PUNTEN };
  root.BR = root.BR || {};
  root.BR.wereldKern = K;
})(typeof window !== "undefined" ? window : globalThis);
