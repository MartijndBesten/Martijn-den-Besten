// Lesroutes (/bijbelreis/lessen): samen de Bijbel ontdekken, thuis, op de zondagsschool of club, bij catechisatie en in
// de klas. De routes staan in lessen-data.js; titels en verwijzingen van de geschiedenissen komen uit
// geschiedenissen/*.js. Deze pagina schrijft niets zelf en stuurt niets naar een server. Alleen de gekozen leeftijd
// voor de presentatie wordt onthouden (localStorage ‘bijbelreis:lessen’). Uitleg: docs/bijbelreis-samen/README.md.
//   #                 overzicht van de routes
//   #<route>          één route met alle lessen
//   #<route>/<n>      idem, met les n in beeld
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Een citaat ‘…’ uit de Statenvertaling cursief; de rest gewoon (de apostrof in ‘Farao’s’ sluit het citaat niet af).
  const metCitaat = (t) => esc(t).replace(/‘(.+?)’(?![\p{L}])/gu, "<q>$1</q>");
  const ROUTES = (window.BR && BR.lessen) || [];
  const G = new Map(((window.BR && BR.geschiedenissen) || []).map((g) => [g.nr, g]));
  const SITE = "bijbelreis.nl";
  const NIVEAUS = [["a", "4–6 jaar", "Samen ontdekken"], ["b", "7–10 jaar", "Zelf op reis"], ["c", "11+", "Verder ontdekken"]];
  const lees = (k, d) => { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const bewaar = (k, v) => { try { localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)); } catch (e) { /* geen opslag: dan niet onthouden */ } };
  const geldig = (n) => NIVEAUS.some(([k]) => k === n);
  // De leeftijd van de presentatie: eerst wat hier gekozen is, anders het reisniveau van de atlas, anders 7–10.
  let niveau = [(lees("lessen", {}) || {}).niveau, lees("niveau", null)].find(geldig) || "b";
  let antwoorden = false;

  const atlas = (nr) => "/bijbelreis#v" + nr;
  const boekje = (nr, extra = "") => `/bijbelreis/boekje#v${nr}&niveau=${niveau}${extra}`;
  const titel = (les) => (G.get(les.v) || {}).t || `Geschiedenis ${les.v}`;

  function overzicht() {
    document.title = "Lesroutes — Bijbelreis";
    return `<section class="ls-intro" aria-labelledby="lsTitel">
        <h2 id="lsTitel">Samen de Bijbel <em>ontdekken</em></h2>
        <p>Voor thuis, de zondagsschool of club, catechisatie en de klas. Een lesroute is een vaste reeks geschiedenissen. Elke les heeft het Bijbelgedeelte om samen te lezen, een presentatie voor het digibord en vragen die de kinderen in de Bijbel kunnen opzoeken. Je hebt geen account nodig.</p>
        <ol class="ls-stappen">
          <li><b>Lees samen</b> het Bijbelgedeelte in je eigen Bijbel.</li>
          <li><b>Laat het zien</b> op het digibord, de beamer of de tablet: de presentatie volgt het verhaal op de kaart.</li>
          <li><b>Stel de vragen.</b> De kinderen zoeken het antwoord op in de Bijbel; het antwoord en de tekst staan erbij voor de leiding.</li>
          <li><b>Geef de link mee,</b> zodat de kinderen het thuis nog eens kunnen nalezen.</li>
        </ol>
      </section>
      <h2 class="ls-kop2">Kies een lesroute</h2>
      <ul class="ls-routes">${ROUTES.map((r) => `<li><a class="ls-route" href="#${esc(r.id)}"><span class="ls-route-n">${esc(r.n)}</span><span class="ls-route-kort">${esc(r.kort)}</span><span class="ls-route-meta">${r.lessen.length} lessen · ${esc(r.bereik)}</span></a></li>`).join("")}</ul>
      <p class="ls-noot">Liever zelf een geschiedenis kiezen? Alle 150 staan in <a href="/bijbelreis#verhalen">de atlas onder Verhalen</a>, en elke geschiedenis kan ook als <a href="/bijbelreis/boekje">presentatie of boekje</a>.</p>`;
  }

  function vraag(v) {
    return `<li><p class="ls-q">${esc(v.q)}</p><p class="ls-zoek">Zoek op: <b>${esc(v.ref)}</b></p><p class="ls-a"><span class="ls-a-label">Antwoord:</span> ${metCitaat(v.a)}</p></li>`;
  }

  function les(r, l, i) {
    const nr = l.v, t = titel(l);
    return `<article class="ls-les" id="les-${i + 1}" aria-labelledby="les-${i + 1}-t" tabindex="-1">
        <p class="ls-les-nr">Les ${i + 1} · Geschiedenis ${nr}</p>
        <h3 id="les-${i + 1}-t">${esc(t)}</h3>
        <p class="ls-lees"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg><span>Lees samen: <b>${esc(l.lees)}</b></span></p>
        <div class="ls-knoppen">
          <a class="bk-knop hoofd" href="${boekje(nr)}" aria-label="Presentatie van ${esc(t)}">Presentatie</a>
          <a class="bk-knop" href="${atlas(nr)}" aria-label="${esc(t)} in de atlas">In de atlas</a>
          <a class="bk-knop" href="${boekje(nr, "&toon=boekje")}" aria-label="Boekje van ${esc(t)} om te printen">Boekje</a>
        </div>
        <h4 class="ls-vragen-kop">Vragen om op te zoeken</h4>
        <ol class="ls-vragen">${l.vragen.map(vraag).join("")}</ol>
        <p class="ls-thuis">Thuis nalezen: <a href="${atlas(nr)}">${SITE}/#v${nr}</a></p>
      </article>`;
  }

  function route(r) {
    document.title = `${r.n} — Lesroutes — Bijbelreis`;
    const extra = r.extra ? `<p class="ls-extra"><a href="/bijbelreis#${esc(r.extra.deel)}">${esc(r.extra.t)}</a></p>` : "";
    return `<nav class="ls-terug" aria-label="Waar ben je"><a href="#">← Alle lesroutes</a></nav>
      <header class="ls-routekop">
        <p class="ls-label">Lesroute · ${r.lessen.length} lessen · ${esc(r.bereik)}</p>
        <h2 id="lsTitel" tabindex="-1">${esc(r.n)}</h2>
        <p>${esc(r.kort)}</p>
        ${extra}
      </header>
      <div class="ls-bediening">
        <div class="ls-groep"><span class="ls-groep-label" id="lsNivLabel">Presentatie voor</span>
          <div class="bk-seg" role="group" aria-labelledby="lsNivLabel">${NIVEAUS.map(([k, leeftijd, naam]) => `<button type="button" data-niveau="${k}" aria-pressed="${k === niveau}" title="${esc(naam)}">${esc(leeftijd)}</button>`).join("")}</div>
        </div>
        <button type="button" class="bk-knop" id="lsAntw" aria-pressed="${antwoorden}">${antwoorden ? "Verberg de antwoorden" : "Toon de antwoorden"}</button>
        <button type="button" class="bk-knop" data-print="leiding">Afdrukken voor de leiding</button>
        <button type="button" class="bk-knop" data-print="kinderen">Werkblad zonder antwoorden</button>
      </div>
      <p class="ls-noot ls-schermnoot">De antwoorden staan verborgen, zodat je deze pagina ook op het digibord kunt laten zien.</p>
      <div class="ls-lessen">${r.lessen.map((l, i) => les(r, l, i)).join("")}</div>
      <p class="ls-noot">Versnummers volgen de Statenvertaling; in een andere vertaling kan een versnummer soms afwijken. Tekst tussen ‘enkele aanhalingstekens’ staat letterlijk zo in de Statenvertaling; de rest van een antwoord is in eigen woorden.</p>
      <p class="ls-noot ls-print-bron">Bijbelreis · ${SITE}/bijbelreis/lessen#${esc(r.id)}</p>`;
  }

  function toon() {
    const [id, n] = decodeURIComponent(location.hash.slice(1)).split("/");
    const r = ROUTES.find((x) => x.id === id), main = $("inhoud");
    document.body.classList.toggle("ls-met-antwoorden", antwoorden);
    if (!ROUTES.length || !G.size) { main.innerHTML = '<p class="bk-fout" role="alert">De lesroutes konden niet worden geladen. Controleer de verbinding en laad de pagina opnieuw.</p>'; return; }
    main.innerHTML = r ? route(r) : overzicht();
    const doel = r && n && $("les-" + (+n)) ? $("les-" + (+n)) : r ? $("lsTitel") : null;
    if (doel) { doel.scrollIntoView({ block: "start" }); doel.focus({ preventScroll: true }); } else window.scrollTo({ top: 0 });
  }

  // De presentatie voor een andere leeftijd: alleen de links veranderen, de pagina blijft waar hij is.
  function zetNiveau(n) {
    if (!geldig(n)) return;
    niveau = n; bewaar("lessen", { niveau: n });
    document.querySelectorAll("[data-niveau]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.niveau === n));
    document.querySelectorAll(".ls-les").forEach((el) => {
      const nr = +el.querySelector(".ls-les-nr").textContent.match(/Geschiedenis (\d+)/)[1];
      el.querySelectorAll('a[href^="/bijbelreis/boekje"]').forEach((a) => (a.href = boekje(nr, /toon=boekje/.test(a.getAttribute("href")) ? "&toon=boekje" : "")));
    });
  }
  function zetAntwoorden(aan) {
    antwoorden = aan;
    document.body.classList.toggle("ls-met-antwoorden", aan);
    const k = $("lsAntw"); if (k) { k.setAttribute("aria-pressed", aan); k.textContent = aan ? "Verberg de antwoorden" : "Toon de antwoorden"; }
  }
  // Afdrukken: voor de leiding met antwoorden, als werkblad zonder. Daarna weer zoals het op het scherm stond.
  function afdrukken(soort) {
    const was = antwoorden;
    zetAntwoorden(soort === "leiding");
    document.body.dataset.print = soort;
    const terug = () => { zetAntwoorden(was); delete document.body.dataset.print; window.removeEventListener("afterprint", terug); };
    window.addEventListener("afterprint", terug);
    window.print();
  }

  document.addEventListener("click", (e) => {
    const nk = e.target.closest("[data-niveau]"); if (nk) { zetNiveau(nk.dataset.niveau); return; }
    if (e.target.closest("#lsAntw")) { zetAntwoorden(!antwoorden); return; }
    const pk = e.target.closest("[data-print]"); if (pk) afdrukken(pk.dataset.print);
  });
  window.addEventListener("hashchange", toon);
  toon();
})();
