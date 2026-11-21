// Lesroutes (/bijbelreis/lessen): samen de Bijbel ontdekken, thuis, op de zondagsschool of club, bij catechisatie en in
// de klas. De routes staan in lessen-data.js; titels en verwijzingen van de geschiedenissen komen uit
// geschiedenissen/*.js. Deze pagina schrijft niets zelf en stuurt niets naar een server. Alleen het gekozen niveau
// van de presentatie wordt onthouden (localStorage ‘bijbelreis:lessen’). Uitleg: docs/bijbelreis-samen/README.md;
// de beoordeling van een les en het lesverloop: docs/bijbelreis-samen/BEOORDELING.md.
//   #                        overzicht van de routes
//   #<route>                 één route met alle lessen
//   #<route>/<n>             idem, met les n in beeld
//   #<route>/<n>/bord[/<s>]  de digibordstand van les n: één scherm per stap (begin, elke vraag, afronding)
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Een citaat ‘…’ uit de Statenvertaling cursief; de rest gewoon (de apostrof in ‘Farao’s’ sluit het citaat niet af).
  const metCitaat = (t) => esc(t).replace(/‘(.+?)’(?![\p{L}])/gu, "<q>$1</q>");
  const ROUTES = (window.BR && BR.lessen) || [];
  const G = new Map(((window.BR && BR.geschiedenissen) || []).map((g) => [g.nr, g]));
  const SITE = "bijbelreis.nl";
  // De reisniveaus (namen sinds 21-11-2026, zonder leeftijden): code, naam, korte uitleg.
  const NIVEAUS = [["a", "Voorlezen", "Korte stukjes om samen te lezen"], ["b", "Zelf lezen", "Een vertelling om zelf te lezen"], ["c", "Verdiepen", "De volledige vertelling met achtergrond"]];
  const lees = (k, d) => { try { const v = localStorage.getItem("bijbelreis:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const bewaar = (k, v) => { try { localStorage.setItem("bijbelreis:" + k, JSON.stringify(v)); } catch (e) { /* geen opslag: dan niet onthouden */ } };
  const geldig = (n) => NIVEAUS.some(([k]) => k === n);
  // Het niveau van de presentatie: eerst wat hier gekozen is, anders het reisniveau van de atlas, anders Zelf lezen.
  let niveau = [(lees("lessen", {}) || {}).niveau, lees("niveau", null)].find(geldig) || "b";
  let antwoorden = false;

  const atlas = (nr) => "/bijbelreis#v" + nr;
  const boekje = (nr, extra = "") => `/bijbelreis/boekje#v${nr}&niveau=${niveau}${extra}`;
  const titel = (les) => (G.get(les.v) || {}).t || `Geschiedenis ${les.v}`;
  const duur = (l) => (l.verzen ? `${l.verzen} verzen, ca. ${l.min} min voorlezen` : "");
  // De presentatie vertelt de hele geschiedenis; zeg het als dat meer is dan het gedeelte dat je samen leest.
  const meerDanLees = (l) => { const g = G.get(l.v); return g && g.ref && g.ref !== l.lees ? g.ref : ""; };

  // Het lesverloop (onderbouwing en tijden: docs/bijbelreis-samen/BEOORDELING.md). Eerst lezen en direct opzoeken,
  // nu de Bijbel openligt; daarna de presentatie als terugblik, omdat die ook vertelt wat na het gedeelte gebeurt.
  const LESVERLOOP = `<section class="ls-verloop" aria-labelledby="lsVerloop">
      <h3 id="lsVerloop">Een les van ongeveer 20 minuten</h3>
      <ol>
        <li><b>Begin rustig</b> <span class="ls-min">2 min</span> zoals je gewend bent. Open <i>Vragen op het digibord</i>: daar staat groot welk gedeelte jullie lezen. Vertel kort wat eraan voorafging.</li>
        <li><b>Lees samen</b> <span class="ls-min">2–8 min</span> ieder in zijn eigen Bijbel. Hoe lang het gedeelte is, staat bij de les.</li>
        <li><b>Zoek de antwoorden op</b> <span class="ls-min">5 min</span> nu de Bijbel nog openligt. Eén vraag per scherm; toon het antwoord pas als de meesten het gevonden hebben.</li>
        <li><b>Kijk terug met de presentatie</b> <span class="ls-min">5–7 min</span> de vertelling op de kaart, met een paar meerkeuzevragen. De presentatie vertelt de hele geschiedenis, ook wat vóór of na het gelezen gedeelte gebeurt.</li>
        <li><b>Rond af</b> <span class="ls-min">2 min</span> Wat hebben we gezien? Laat de kinderen de geschiedenis in eigen woorden navertellen, in de goede volgorde, en geef de link mee om thuis na te lezen.</li>
      </ol>
      <p class="ls-noot">Met jonge kinderen: lees een paar verzen voor en gebruik de presentatie van Voorlezen als vertelling. Is het gedeelte lang (6 minuten of meer), neem de presentatie dan een volgende keer.</p>
    </section>`;

  function overzicht() {
    document.title = "Lesroutes — Bijbelreis";
    return `<section class="ls-intro" aria-labelledby="lsTitel">
        <h2 id="lsTitel">Samen de Bijbel <em>ontdekken</em></h2>
        <p>Voor thuis, de zondagsschool of club, catechisatie en de klas. Een lesroute is een vaste reeks geschiedenissen. Elke les heeft het Bijbelgedeelte om samen te lezen, vragen die de kinderen in de Bijbel opzoeken, een presentatie voor het digibord en de link om thuis na te lezen. Je hebt geen account nodig.</p>
        <ol class="ls-stappen">
          <li><b>Lees samen</b> het Bijbelgedeelte in je eigen Bijbel.</li>
          <li><b>Stel de vragen.</b> De kinderen zoeken het antwoord op in de Bijbel; op het digibord staat één vraag tegelijk, groot. Het antwoord en de tekst staan erbij voor de leiding.</li>
          <li><b>Kijk terug</b> met de presentatie: de vertelling op de kaart, op het digibord, de beamer of de tablet.</li>
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
    const nr = l.v, t = titel(l), n = i + 1, meer = meerDanLees(l);
    return `<article class="ls-les" id="les-${n}" data-nr="${nr}" aria-labelledby="les-${n}-t" tabindex="-1">
        <p class="ls-les-nr">Les ${n} · Geschiedenis ${nr}</p>
        <h3 id="les-${n}-t">${esc(t)}</h3>
        <p class="ls-lees"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/></svg><span>Lees samen: <b>${esc(l.lees)}</b>${l.verzen ? `<span class="ls-duur"> · ${esc(duur(l))}</span>` : ""}</span></p>
        <div class="ls-knoppen">
          <a class="bk-knop hoofd" href="#${esc(r.id)}/${n}/bord" aria-label="Vragen op het digibord: ${esc(t)}">Vragen op het digibord</a>
          <a class="bk-knop" href="${boekje(nr)}" aria-label="Presentatie van ${esc(t)}">Presentatie</a>
          <a class="bk-knop" href="${atlas(nr)}" aria-label="${esc(t)} in de atlas">In de atlas</a>
          <a class="bk-knop" href="${boekje(nr, "&toon=boekje")}" aria-label="Boekje van ${esc(t)} om te printen">Boekje</a>
        </div>
        ${meer ? `<p class="ls-meer">De presentatie vertelt de hele geschiedenis (${esc(meer)}), ook wat vóór of na dit gedeelte gebeurt. De vragen hieronder gaan alleen over wat jullie samen lezen.</p>` : ""}
        <h4 class="ls-vragen-kop">Vragen om op te zoeken</h4>
        <ol class="ls-vragen">${l.vragen.map(vraag).join("")}</ol>
        <div class="ls-lesvoet">
          <p class="ls-thuis">Thuis nalezen: <a href="${atlas(nr)}">${SITE}/#v${nr}</a></p>
          <p class="ls-lesprint"><span>Alleen deze les printen:</span>
            <button type="button" class="ls-link" data-print="leiding" data-les="${n}" aria-label="Les ${n} printen voor de leiding, met antwoorden">voor de leiding</button>
            <button type="button" class="ls-link" data-print="kinderen" data-les="${n}" aria-label="Werkblad van les ${n}">werkblad</button></p>
        </div>
      </article>`;
  }

  function route(r) {
    document.title = `${r.n} — Lesroutes — Bijbelreis`;
    const extra = r.extra ? `<p class="ls-extra"><a href="/bijbelreis#${esc(r.extra.deel)}">${esc(r.extra.t)}</a></p>` : "";
    return `<nav class="ls-terug" aria-label="Waar ben je"><a href="#">← Alle lesroutes</a></nav>
      <header class="ls-routekop">
        <p class="ls-label">Lesroute · ${r.lessen.length} lessen · ${esc(r.bereik)}<span class="ls-print-bron"> · Bijbelreis · ${SITE}/bijbelreis/lessen#${esc(r.id)}</span></p>
        <h2 id="lsTitel" tabindex="-1">${esc(r.n)}</h2>
        <p>${esc(r.kort)}</p>
        ${extra}
      </header>
      <p class="ls-naam">Naam: <span></span></p>
      ${LESVERLOOP}
      <div class="ls-bediening">
        <div class="ls-groep"><span class="ls-groep-label" id="lsNivLabel">Niveau van de presentatie</span>
          <div class="bk-seg" role="group" aria-labelledby="lsNivLabel">${NIVEAUS.map(([k, naam, uitleg]) => `<button type="button" data-niveau="${k}" aria-pressed="${k === niveau}" title="${esc(uitleg)}">${esc(naam)}</button>`).join("")}</div>
        </div>
        <button type="button" class="bk-knop" id="lsAntw" aria-pressed="${antwoorden}">${antwoorden ? "Verberg de antwoorden" : "Toon de antwoorden"}</button>
        <button type="button" class="bk-knop" data-print="leiding">Afdrukken voor de leiding</button>
        <button type="button" class="bk-knop" data-print="kinderen">Werkblad zonder antwoorden</button>
      </div>
      <p class="ls-noot ls-schermnoot">De antwoorden staan verborgen, zodat je deze pagina ook op het digibord kunt laten zien. Voor de klas is <i>Vragen op het digibord</i> beter te lezen: één vraag per scherm, in grote letters.</p>
      <div class="ls-lessen">${r.lessen.map((l, i) => les(r, l, i)).join("")}</div>
      <div class="ls-slot">
        <p class="ls-noot">Versnummers volgen de Statenvertaling; in een andere vertaling kan een versnummer soms afwijken. Tekst tussen ‘enkele aanhalingstekens’ staat letterlijk zo in de Statenvertaling; de rest van een antwoord is in eigen woorden. De voorleestijd is geschat op 120 woorden per minuut.</p>
      </div>`;
  }

  // ---------- digibordstand: één scherm per stap, groot genoeg om achter in de klas te lezen ----------
  // Stappen: 0 = begin (wat lezen we), 1..n = de vragen, n+1 = afronding. Verder met →, PageDown of spatie (een
  // presentatieclicker stuurt PageDown): bij een vraag eerst het antwoord, dan de volgende vraag. Terug met ← of PageUp.
  let bord = null; // { r, l, i, stap, open }
  const bordAdres = (b) => `#${b.r.id}/${b.i + 1}/bord${b.stap ? "/" + b.stap : ""}`;

  function bordScherm(b) {
    const { r, l, i, stap } = b, t = titel(l), n = l.vragen.length, laatste = n + 1, nr = l.v;
    let label, inhoud;
    if (stap === 0) {
      label = `Les ${i + 1} · ${esc(r.n)}`;
      inhoud = `<h2 class="lb-titel" id="lbKop" tabindex="-1">${esc(t)}</h2>
        <p class="lb-sub">Pak je Bijbel en lees samen</p>
        <p class="lb-lees">${esc(l.lees)}</p>
        ${l.verzen ? `<p class="lb-klein">${esc(duur(l))}</p>` : ""}`;
    } else if (stap <= n) {
      const v = l.vragen[stap - 1];
      label = `Vraag ${stap} van ${n} · ${esc(t)}`;
      inhoud = `<h2 class="lb-vraag" id="lbKop" tabindex="-1">${esc(v.q)}</h2>
        <p class="lb-zoek">Zoek op: <b>${esc(v.ref)}</b></p>
        ${b.open ? `<p class="lb-antwoord" id="lbAntw" tabindex="-1"><span class="lb-a-label">Antwoord</span> ${metCitaat(v.a)}</p>` : ""}`;
    } else {
      label = `Afronding · ${esc(t)}`;
      inhoud = `<h2 class="lb-titel" id="lbKop" tabindex="-1">Wat hebben we gezien?</h2>
        <p class="lb-sub">Vertel de geschiedenis in je eigen woorden na: wat gebeurde er eerst, en wat daarna?</p>
        <p class="lb-thuis">Thuis nalezen: <b>${SITE}/#v${nr}</b></p>
        <p class="lb-acties"><a class="bk-knop hoofd" href="${boekje(nr)}" aria-label="Presentatie van ${esc(t)}">Terugkijken met de presentatie</a></p>`;
    }
    const verborgen = stap >= 1 && stap <= n && !b.open;
    const verder = stap === 0 ? "Naar de vragen" : stap === n ? "Naar de afronding" : "Volgende vraag";
    return `<section class="lb" aria-label="Digibord: ${esc(t)}">
        <div class="lb-balk">
          <p class="lb-label">${label}</p>
          <p class="lb-tel">Scherm ${stap + 1} van ${laatste + 1}</p>
          ${document.fullscreenEnabled ? `<button type="button" class="bk-knop" data-bord="scherm">${document.fullscreenElement ? "Volledig scherm uit" : "Volledig scherm"}</button>` : ""}
          <a class="bk-knop" href="#${esc(r.id)}/${i + 1}">Terug naar de les</a>
        </div>
        <div class="lb-inhoud">${inhoud}</div>
        <div class="lb-nav">
          <button type="button" class="bk-knop" data-bord="terug" ${stap === 0 ? "disabled" : ""}>← Vorige</button>
          ${verborgen ? `<button type="button" class="bk-knop hoofd" data-bord="antwoord">Toon het antwoord</button>` : ""}
          ${stap === laatste ? `<a class="bk-knop hoofd" href="#${esc(r.id)}/${i + 1}">Klaar: terug naar de les</a>` : `<button type="button" class="bk-knop${verborgen ? "" : " hoofd"}" data-bord="verder">${verder} →</button>`}
        </div>
      </section>`;
  }
  // Teken het scherm; de focus gaat naar de kop (nieuw scherm) of het antwoord, zodat een schermlezer het voorleest.
  function bordToon(focus) {
    $("inhoud").innerHTML = bordScherm(bord);
    history.replaceState(null, "", bordAdres(bord));
    const doel = focus && $(focus); if (doel) doel.focus({ preventScroll: true });
  }
  function bordStap(richting) {
    if (!bord) return;
    const n = bord.l.vragen.length;
    if (richting > 0 && bord.stap >= 1 && bord.stap <= n && !bord.open) { bord.open = true; bordToon("lbAntw"); return; }
    const s = Math.max(0, Math.min(n + 1, bord.stap + richting));
    if (s === bord.stap) return;
    bord.stap = s; bord.open = false; bordToon("lbKop");
  }

  function toon() {
    const [id, n, stand, s] = decodeURIComponent(location.hash.slice(1)).split("/");
    const r = ROUTES.find((x) => x.id === id), main = $("inhoud");
    document.body.classList.toggle("ls-met-antwoorden", antwoorden);
    if (!ROUTES.length || !G.size) { main.innerHTML = '<p class="bk-fout" role="alert">De lesroutes konden niet worden geladen. Controleer de verbinding en laad de pagina opnieuw.</p>'; return; }
    const l = r && /^\d+$/.test(n || "") ? r.lessen[+n - 1] : null;
    bord = l && stand === "bord" ? { r, l, i: +n - 1, stap: Math.min(l.vragen.length + 1, Math.max(0, parseInt(s, 10) || 0)), open: false } : null;
    document.body.classList.toggle("ls-bordstand", !!bord);
    if (bord) { document.title = `${titel(l)} — digibord — Bijbelreis`; window.scrollTo({ top: 0 }); bordToon("lbKop"); return; }
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    main.innerHTML = r ? route(r) : overzicht();
    const doel = r && n && $("les-" + (+n)) ? $("les-" + (+n)) : r ? $("lsTitel") : null;
    if (doel) { doel.scrollIntoView({ block: "start" }); doel.focus({ preventScroll: true }); } else window.scrollTo({ top: 0 });
  }

  // De presentatie van een ander niveau: alleen de links veranderen, de pagina blijft waar hij is.
  function zetNiveau(n) {
    if (!geldig(n)) return;
    niveau = n; bewaar("lessen", { niveau: n });
    document.querySelectorAll("[data-niveau]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.niveau === n));
    document.querySelectorAll(".ls-les").forEach((el) => {
      const nr = +el.dataset.nr;
      el.querySelectorAll('a[href^="/bijbelreis/boekje"]').forEach((a) => (a.href = boekje(nr, /toon=boekje/.test(a.getAttribute("href")) ? "&toon=boekje" : "")));
    });
  }
  function zetAntwoorden(aan) {
    antwoorden = aan;
    document.body.classList.toggle("ls-met-antwoorden", aan);
    const k = $("lsAntw"); if (k) { k.setAttribute("aria-pressed", aan); k.textContent = aan ? "Verberg de antwoorden" : "Toon de antwoorden"; }
  }
  // Afdrukken: voor de leiding met antwoorden, als werkblad zonder; de hele route of één les (data-print-les).
  // Daarna weer zoals het op het scherm stond.
  function afdrukken(soort, lesNr) {
    const was = antwoorden;
    zetAntwoorden(soort === "leiding");
    document.body.dataset.print = soort;
    if (lesNr) { document.body.dataset.printLes = lesNr; document.querySelectorAll(".ls-les").forEach((el) => el.classList.toggle("ls-print-deze", el.id === "les-" + lesNr)); }
    const terug = () => {
      zetAntwoorden(was); delete document.body.dataset.print; delete document.body.dataset.printLes;
      document.querySelectorAll(".ls-print-deze").forEach((el) => el.classList.remove("ls-print-deze"));
      window.removeEventListener("afterprint", terug);
    };
    window.addEventListener("afterprint", terug);
    window.print();
  }

  document.addEventListener("click", (e) => {
    // ‘Direct naar de inhoud’: niet via het adres (#inhoud is geen route), maar de focus naar de inhoud.
    if (e.target.closest(".bk-skip")) { e.preventDefault(); $("inhoud").focus(); return; }
    const bk = e.target.closest("[data-bord]");
    if (bk) {
      const w = bk.dataset.bord;
      if (w === "verder") bordStap(1);
      else if (w === "terug") bordStap(-1);
      else if (w === "antwoord" && bord) { bord.open = true; bordToon("lbAntw"); }
      else if (w === "scherm") (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
      return;
    }
    const nk = e.target.closest("[data-niveau]"); if (nk) { zetNiveau(nk.dataset.niveau); return; }
    if (e.target.closest("#lsAntw")) { zetAntwoorden(!antwoorden); return; }
    const pk = e.target.closest("[data-print]"); if (pk) afdrukken(pk.dataset.print, pk.dataset.les);
  });
  // Digibord: pijltjes, PageUp/PageDown (clicker) en spatie; Escape terug naar de les.
  document.addEventListener("keydown", (e) => {
    if (!bord || e.altKey || e.ctrlKey || e.metaKey) return;
    // Een knop of link met de focus doet zelf iets met Enter en spatie.
    if ((e.key === " " || e.key === "Enter") && e.target.closest("button, a")) return;
    if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); bordStap(1); }
    else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); bordStap(-1); }
    else if (e.key === "Escape" && !document.fullscreenElement) location.hash = `${bord.r.id}/${bord.i + 1}`;
  });
  document.addEventListener("fullscreenchange", () => { if (bord) bordToon(null); });
  window.addEventListener("hashchange", toon);
  toon();
})();
