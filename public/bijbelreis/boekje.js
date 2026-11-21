// Presentatie en boekje (/bijbelreis/boekje): kiezen, laden, delen en het losse bestand maken.
// De dia’s en het boekje zelf komen uit boekje-speler.js; de inhoud uit boekje-inhoud.js; de kaart uit boekje-kaart.js.
// Niets gaat naar een server. Alleen de laatst gekozen instelling (niveau, tempo) staat in localStorage onder
// ‘bijbelreis:boekje’; andere sleutels worden niet aangeraakt. Uitleg: docs/bijbelreis-boekje/README.md.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const IN = BR.boekjeInhoud, SP = BR.boekjeSpeler, KA = BR.boekjeKaart, NIV = BR.niveaus;
  const SLEUTEL = "bijbelreis:boekje";
  const instelling = (() => { try { return JSON.parse(localStorage.getItem(SLEUTEL)) || {}; } catch (e) { return {}; } })();
  const bewaar = (x) => { Object.assign(instelling, x); try { localStorage.setItem(SLEUTEL, JSON.stringify(instelling)); } catch (e) { /* geen opslag: dan niet onthouden */ } };
  const DV = (() => { try { return JSON.parse(document.querySelector('meta[name="bijbelreis-data"]').content); } catch (e) { return {}; } })();
  const dataUrl = (p) => "/bijbelreis/" + p + (DV[p] ? "?v=" + DV[p] : "");
  // Secties en volgorde: secties.js (dezelfde als in de atlas).
  const G = BR.opVolgorde(BR.geschiedenissen || []);
  const SECTIES = BR.secties.map(([k, naam]) => [naam, G.filter((g) => g.sectie === k)]);
  let toastT = 0;
  function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("aan"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("aan"), 2600); }

  // ---------- de ondergrond van de kaart ----------
  let basis = null;
  const basisKlaar = Promise.all([fetch(dataUrl("geo.json")).then((r) => r.json()), fetch(dataUrl("toen.json")).then((r) => (r.ok ? r.json() : null)).catch(() => null)])
    .then(([geo, toen]) => { basis = KA.basisVan(geo, toen); })
    .catch(() => { basis = KA.basisVan({}, null); toast("De kaart kon niet worden geladen."); });
  const letters = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();

  // ---------- kiezen ----------
  const niveauKeuze = (n) => ["a", "b", "c"].map((k) => { const s = NIV.soorten[k]; return `<label><input type="radio" name="niveau" value="${k}"${k === n ? " checked" : ""}><b>${esc(s.n)}</b><small>${esc(s.uitleg)}</small></label>`; }).join("");
  // Thema’s (een boek met `thema`, zoals Kerst) zijn geen Bijbelboek: ze staan in een eigen groep onder de Bijbelboeken.
  function boekOpties() {
    const optie = (b) => `<option value="${esc(b.id)}">${esc(b.n)}</option>`, themas = BR.boeken.filter((b) => b.thema);
    if (!themas.length) return BR.boeken.map(optie).join("");
    return `<optgroup label="Bijbelboeken">${BR.boeken.filter((b) => !b.thema).map(optie).join("")}</optgroup><optgroup label="Thema’s">${themas.map(optie).join("")}</optgroup>`;
  }
  function toonKies(melding) {
    stopSpeler();
    const n = ["a", "b", "c"].includes(instelling.niveau) ? instelling.niveau : "b";
    const k = $("kies");
    k.innerHTML = `<h2 id="kiesTitel">Maak een <em>presentatie</em> of een <em>boekje</em></h2>
      <p>Kies een stuk van de Bijbelreis. Je krijgt een diavoorstelling voor het digibord, de beamer of een telefoon, een boekje om te printen, een los bestand voor zonder internet en een link om te delen.</p>
      ${melding ? `<p class="bk-fout" role="alert">${esc(melding)}</p>` : ""}
      <form class="bk-kaartje" id="kiesForm">
        <fieldset><legend>Wat wil je laten zien?</legend>
          <div class="bk-keuzes" style="grid-template-columns:repeat(2,minmax(0,1fr))">
            <label><input type="radio" name="soort" value="reis" checked><b>Een reis</b><small>Een deel van een Bijbelboek, een stuk ervan of het hele boek</small></label>
            <label><input type="radio" name="soort" value="verhaal"><b>Een geschiedenis</b><small>Eén van de geschiedenissen uit ‘Verhalen’</small></label>
          </div>
        </fieldset>
        <div id="kiesReis" class="bk-kaartje" style="box-shadow:none;padding:0;border:0">
          <div class="bk-veld"><label for="kBoek">Bijbelboek</label><select id="kBoek">${boekOpties()}</select></div>
          <div class="bk-veld"><label for="kDeel">Deel</label><select id="kDeel"></select></div>
          <div class="bk-rij2" id="kStappen"><div class="bk-veld"><label for="kVan">Van stap</label><select id="kVan"></select></div><div class="bk-veld"><label for="kTot">Tot en met stap</label><select id="kTot"></select></div></div>
        </div>
        <div id="kiesVerhaal" hidden>
          <div class="bk-veld"><label for="kVerhaal">Geschiedenis</label><select id="kVerhaal">${SECTIES.map(([naam, lijst]) => `<optgroup label="${esc(naam)}">${lijst.map((g) => `<option value="${g.nr}">${g.nr}. ${esc(g.t)}</option>`).join("")}</optgroup>`).join("")}</select></div>
        </div>
        <fieldset><legend>Niveau</legend><div class="bk-keuzes">${niveauKeuze(n)}</div></fieldset>
        <div><button type="submit" class="bk-knop hoofd">Maak de presentatie</button></div>
      </form>
      <p class="bk-hulp"><b>In de klas of de kinderclub:</b> zet de presentatie op het digibord of de beamer, kies <b>Volledig scherm</b> en blader met de pijltjestoetsen, de spatiebalk of een presentatieklikker. Zonder internet? Kies dan eerst <b>Download als bestand</b>.</p>`;
    const boek = $("kBoek"), deel = $("kDeel"), van = $("kVan"), tot = $("kTot");
    const vulDelen = () => { const b = BR.boeken.find((x) => x.id === boek.value); deel.innerHTML = `<option value="">Het hele boek (${b.delen.length} ${b.delen.length === 1 ? "deel" : "delen"})</option>` + b.delen.map((d) => `<option value="${esc(d.id)}">${esc(d.n)} · ${esc(d.ref)}</option>`).join(""); if (b.delen.length === 1) deel.value = b.delen[0].id; vulStappen(); };
    const vulStappen = () => {
      const b = BR.boeken.find((x) => x.id === boek.value), d = b.delen.find((x) => x.id === deel.value);
      $("kStappen").hidden = !d;
      if (!d) return;
      const opties = d.steps.map((s, i) => `<option value="${i + 1}">${i + 1}. ${esc(s.t)}</option>`).join("");
      van.innerHTML = opties; tot.innerHTML = opties; van.value = "1"; tot.value = String(d.steps.length);
    };
    boek.addEventListener("change", vulDelen); deel.addEventListener("change", vulStappen);
    van.addEventListener("change", () => { if (+tot.value < +van.value) tot.value = van.value; });
    tot.addEventListener("change", () => { if (+tot.value < +van.value) van.value = tot.value; });
    k.querySelectorAll('input[name="soort"]').forEach((r) => r.addEventListener("change", () => { const v = k.querySelector('input[name="soort"]:checked').value; $("kiesReis").hidden = v !== "reis"; $("kiesVerhaal").hidden = v !== "verhaal"; }));
    vulDelen();
    $("kiesForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const niveau = k.querySelector('input[name="niveau"]:checked').value, soort = k.querySelector('input[name="soort"]:checked').value;
      bewaar({ niveau });
      let keuze;
      if (soort === "verhaal") keuze = { soort: "verhaal", nr: +$("kVerhaal").value, niveau };
      else if (!deel.value) keuze = { soort: "boek", boek: boek.value, niveau };
      else { const d = BR.boeken.find((x) => x.id === boek.value).delen.find((x) => x.id === deel.value), a = +van.value, z = +tot.value; keuze = { soort: "deel", deel: deel.value, niveau, ...(a === 1 && z === d.steps.length ? {} : { van: a, tot: z }) }; }
      location.hash = IN.maakHash(keuze).slice(1);
    });
    $("laden").hidden = true; $("bekijk").hidden = true; k.hidden = false;
    document.title = "Presentatie en boekje — Bijbelreis";
  }

  // ---------- bekijken ----------
  let speler = null, pakket = null;
  function stopSpeler() { if (speler) { speler.weg(); speler = null; } }
  async function route() {
    const k = IN.lees(location.hash);
    if (!k.soort) { toonKies(); return; }
    if (k.soort === "onbekend") { toonKies("Dit adres ken ik niet. Kies hieronder wat je wilt laten zien."); return; }
    const niveau = k.niveau || (["a", "b", "c"].includes(instelling.niveau) ? instelling.niveau : "b");
    $("laden").hidden = false; $("laden").textContent = "De presentatie wordt klaargezet…";
    try { await NIV.laad(niveau); } catch (e) { toast("De teksten voor dit niveau konden niet worden geladen."); }
    await Promise.all([basisKlaar, letters]);
    if (IN.lees(location.hash).soort !== k.soort) return; // intussen iets anders gekozen
    const pk = IN.maak(BR, { ...k, niveau });
    if (!pk) { toonKies(k.soort === "verhaal" ? `Geschiedenis ${k.nr} bestaat niet.` : "Dit deel of boek staat niet in de Bijbelreis. Kies hieronder wat je wilt laten zien."); return; }
    pakket = pk;
    stopSpeler();
    $("kies").hidden = true; $("laden").hidden = true;
    const box = $("bekijk"); box.hidden = false;
    document.title = `${pk.titel} · presentatie en boekje — Bijbelreis`;
    speler = SP.maak(box, { pakket: pk, basis, logo: "/bijbelreis/denckh-logo-signature.svg", toon: k.toon === "boekje" ? "boekje" : "presentatie", dia: k.dia || 0, tempo: instelling.tempo, bewaar,
      opToon: (t) => { const h = IN.maakHash(pk.keuze, { toon: t }); if (location.hash !== h) history.replaceState(null, "", h); } });
    const atlas = pk.keuze.soort === "verhaal" ? "#v" + pk.keuze.nr : pk.keuze.soort === "deel" ? "#" + pk.keuze.deel + (pk.keuze.van ? "/" + pk.keuze.van : "") : "";
    speler.extra.innerHTML = `<button type="button" class="bk-knop" id="downloadBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg><span>Download als bestand</span></button>
      <button type="button" class="bk-knop" id="deelBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.9 7.6-4.4M8.2 13.1l7.6 4.4"/></svg><span>Deel de link</span></button>
      <a class="bk-knop" href="/bijbelreis${atlas}">In de atlas</a>
      <a class="bk-knop" href="#" id="andereBtn">Iets anders kiezen</a>`;
    $("downloadBtn").addEventListener("click", download);
    $("deelBtn").addEventListener("click", deel);
    $("andereBtn").addEventListener("click", (e) => { e.preventDefault(); history.pushState(null, "", location.pathname); route(); });
    $("naarAtlas").href = "/bijbelreis" + atlas;
  }

  // ---------- delen ----------
  const adres = () => { const pad = location.pathname.replace(/\.html$/, ""); return location.origin + pad + IN.maakHash(pakket.keuze, { toon: speler && speler.toon }); };
  async function deel() {
    const url = adres(), titel = `${pakket.titel} — Bijbelreis`;
    if (navigator.share) {
      try { await navigator.share({ title: titel, text: `${pakket.titel} (${pakket.niveauNaam}): presentatie en boekje uit de Bijbelreis.`, url }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); toast("De link is gekopieerd. Plak hem in de kerkapp, een bericht of een mail."); }
    catch (e) { window.prompt("Kopieer deze link:", url); }
  }

  // ---------- los bestand ----------
  // Eén HTML-bestand met alles erin: de dia’s van deze keuze, de kaartgegevens van alleen dit gebied, de tekeningen, de
  // stijl en de bediening. Zonder internet te openen, bijvoorbeeld op een school-pc of in een kerkzaal.
  const scriptUrl = (naam) => { const s = document.querySelector(`script[src*="/bijbelreis/${naam}"]`); return s ? s.src : "/bijbelreis/" + naam; };
  const stijlUrl = (naam) => { const s = document.querySelector(`link[href*="/bijbelreis/${naam}"]`); return s ? s.href : "/bijbelreis/" + naam; };
  const tekst = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.text(); });
  function gebied(pk) {
    // Het gebied dat de kaarten van dit pakket samen nodig hebben, ruim genomen (andere beeldverhoudingen, marge).
    let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity;
    pk.dias.forEach((d) => {
      const k = d.kaart; if (!k) return;
      const pts = (k.r || []).concat(k.eerder || []).flatMap((i) => pk.routes[i].pts).concat((k.at || []).concat(k.ctx || []).map((id) => pk.plaatsen[id].ll));
      if (k.stralen) pts.push([k.stralen[0] + 1, k.stralen[1] - 1.2], [k.stralen[0] - 1, k.stralen[1] + 1.2]);
      if (k.later) pts.push(...k.later.pts); if (k.kijk) pts.push(k.kijk.a, k.kijk.b);
      if (Array.isArray(k.view)) pts.push(...k.view); else if (k.view) pts.push(...(k.view === "kanaan" ? KA.KANAAN : KA.WIJD));
      if (!pts.length) return;
      const b = KA.uitsnede(pts, { aspect: 1, marge: 0.5, minLon: KA.breedteBijZoom(k.zoom || 9) * 1.4 });
      w = Math.min(w, b.w); e = Math.max(e, b.e); s = Math.min(s, b.s); n = Math.max(n, b.n);
    });
    if (!isFinite(w)) return { w: 30, e: 40, s: 28, n: 36 };
    const mx = (e - w) * 0.12 + 0.5, my = (n - s) * 0.12 + 0.5;
    return { w: w - mx, e: e + mx, s: s - my, n: n + my };
  }
  async function download() {
    const knop = $("downloadBtn"), oud = knop.querySelector("span").textContent;
    knop.disabled = true; knop.querySelector("span").textContent = "Bezig…";
    try {
      const [kaartJs, spelerJs, atlasCss, eigenCss, logo] = await Promise.all([tekst(scriptUrl("boekje-kaart.js")), tekst(scriptUrl("boekje-speler.js")), tekst(stijlUrl("bijbelreis.css")), tekst(stijlUrl("boekje.css")), tekst("/bijbelreis/denckh-logo-signature.svg")]);
      const html = losBestand(pakket, { kaartJs, spelerJs, atlasCss, eigenCss, logo, basis: KA.knipBasis(basis, gebied(pakket), 0.003) });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" }), url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = bestandsnaam(pakket); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast(`Bestand gemaakt (${Math.round(blob.size / 1024)} kB). Open het in een browser, ook zonder internet.`);
    } catch (e) { toast("Het bestand kon niet worden gemaakt. Probeer het opnieuw."); }
    finally { knop.disabled = false; knop.querySelector("span").textContent = oud; }
  }
  const bestandsnaam = (pk) => "bijbelreis-" + (pk.keuze.soort === "verhaal" ? "geschiedenis-" + pk.keuze.nr : pk.keuze.soort === "boek" ? pk.keuze.boek : pk.keuze.deel + (pk.keuze.van ? `-stap-${pk.keuze.van}-${pk.keuze.tot}` : "")) + "-niveau-" + pk.niveau + ".html";
  // Uit bijbelreis.css alleen de kleuren (:root) en de taferelen; lettertypen blijven weg (die staan niet in het bestand).
  function losStijl(atlasCss, eigenCss) {
    const root = (atlasCss.match(/:root\s*\{[\s\S]*?\n\}/) || [""])[0];
    const i = atlasCss.indexOf("/* ===== Taferelen"), tf = i >= 0 ? atlasCss.slice(i) : "";
    return (root + "\n" + tf + "\n" + eigenCss).replace(/@font-face\s*\{[^}]*\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s+/g, "\n");
  }
  function losBestand(pk, x) {
    const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    const code = (t) => t.replace(/<\/script/gi, "<\\/script");
    const logo = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(x.logo)));
    return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pk.titel)} — Bijbelreis</title>
<meta name="generator" content="Bijbelreis, presentatie en boekje (bijbelreis.nl)">
<style>${losStijl(x.atlasCss, x.eigenCss)}</style>
</head>
<body class="bk-pagina">
<header class="bk-kopbalk"><span class="bk-terug">Op reis door de Bijbel</span><h1>${esc(pk.titel)}</h1></header>
<main class="bk-main"><div id="boekje"></div></main>
<script>
${code(x.kaartJs)}
${code(x.spelerJs)}
BR.boekjeLos = { pakket: ${json(pk)}, basis: ${json(x.basis)}, logo: ${json(logo)} };
BR.boekjeSpeler.los();
</script>
</body>
</html>
`;
  }
  // Voor de tests en het verslag: hetzelfde losse bestand zonder klikken.
  BR.boekjePagina = { losBestand, losStijl, gebied, adres: () => adres(), get pakket() { return pakket; }, get speler() { return speler; } };

  window.addEventListener("hashchange", route);
  route();
})();
