// Service worker van de Bijbelreis (bijbelreis.nl): de atlas werkt ook zonder internet, en een nieuwe versie komt in één
// keer binnen. Uitleg, wat wel en niet offline werkt en hoe je een update test: docs/bijbelreis-pwa/README.md.
//
// - Eén vaste set per build (de ‘schil’): de pagina, alle scripts en stijlen, de kaartgegevens en de lettertypen. Het blok
//   BOUW hieronder schrijft scripts/bijbelreis-pwa.mjs bij elke build; daardoor is dit bestand per versie anders en haalt
//   de browser het als update op. De nieuwe set wordt helemaal opgehaald en gecontroleerd (inhoudshash per bestand)
//   vóórdat hij in gebruik gaat. Lukt één bestand niet, dan blijft de oude versie in gebruik.
// - Oude en nieuwe bestanden worden nooit gemengd: elk script, stijl- en gegevensbestand heeft zijn inhoudshash in het
//   adres (?v=…), en wat van het netwerk komt voor zo'n adres moet bij die hash passen.
// - Foto's: pas bewaard als ze een keer bekeken zijn (hooguit MAX_BEELDEN), zodat een eerder bekeken verhaal offline werkt.
// - Nooit bewaard: /api/* (bezoekmeting, aanvragen), /beheer, alles wat geen GET is en alles van een andere site.
// - De pagina zelf: eerst het netwerk (zo is hij altijd actueel), zonder verbinding de bewaarde schil.
"use strict";

/* BOUW:BEGIN — dit blok vult scripts/bijbelreis-pwa.mjs bij elke build in; niet met de hand bewerken. */
const BOUW = null;
/* BOUW:EIND */

const SCHIL_VOORVOEGSEL = "bijbelreis-schil-";
const BEELDEN = "bijbelreis-beelden";
const MAX_BEELDEN = 160;
// Na zoveel milliseconden zonder antwoord van het netwerk opent de bewaarde schil (trage of haperende verbinding).
const NAV_WACHT = 6000;
// Op welk adres de atlas staat: ‘/’ op bijbelreis.nl, ‘/bijbelreis’ lokaal (pwa.js geeft het mee bij het aanmelden).
const SCHIL_PAD = (() => {
  const p = new URL(self.location.href).searchParams.get("schil");
  return p === "/bijbelreis" ? p : "/";
})();
const SCHIL = BOUW ? SCHIL_VOORVOEGSEL + BOUW.versie : "";
const IN_SCHIL = new Map(BOUW ? BOUW.schil : []);

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
async function hashKlopt(buf, verwacht) {
  return hex(await crypto.subtle.digest("SHA-256", buf)).startsWith(verwacht);
}
const kopie = (r, buf) => new Response(buf, { status: r.status, statusText: r.statusText, headers: r.headers });

// ---------- installeren: de hele schil, of niets ----------
async function haalOp(pad, hash) {
  const r = await fetch(pad, { cache: "no-cache", credentials: "same-origin", redirect: "follow" });
  if (!r.ok || r.type !== "basic") throw new Error("niet bereikbaar: " + pad + " (" + r.status + ")");
  const buf = await r.arrayBuffer();
  if (hash) {
    if (!(await hashKlopt(buf, hash))) throw new Error("andere versie: " + pad);
  } else if (!new TextDecoder().decode(buf).includes('name="bijbelreis-versie" content="' + BOUW.versie + '"')) {
    throw new Error("andere versie van de pagina");
  }
  return [pad, kopie(r, buf)];
}

async function vulSchil() {
  const lijst = [[SCHIL_PAD, null], ...BOUW.schil];
  const klaar = [];
  // Zes tegelijk: de pagina die net geladen is, krijgt zo geen file op haar eigen verbinding.
  let i = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (i < lijst.length) {
      const [pad, hash] = lijst[i++];
      klaar.push(await haalOp(pad, hash));
    }
  }));
  const cache = await caches.open(SCHIL);
  try {
    for (const [pad, antwoord] of klaar) await cache.put(pad, antwoord);
  } catch (e) {
    await caches.delete(SCHIL);
    throw e;
  }
}

self.addEventListener("install", (e) => {
  if (BOUW) e.waitUntil(vulSchil());
});

// ---------- in gebruik nemen: oude schillen weg, foto's van vroeger weg ----------
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const naam of await caches.keys()) if (naam.startsWith(SCHIL_VOORVOEGSEL) && naam !== SCHIL) await caches.delete(naam);
    if (BOUW) {
      const c = await caches.open(BEELDEN);
      for (const req of await c.keys()) {
        const u = new URL(req.url);
        if (BOUW.beelden[u.pathname] !== u.searchParams.get("h")) await c.delete(req);
      }
    }
    await self.clients.claim();
  })());
});

// De pagina vraagt dit als iemand op ‘Vernieuwen’ tikt (pwa.js).
self.addEventListener("message", (e) => {
  if (e.data && e.data.soort === "nu-wisselen") self.skipWaiting();
});

// ---------- verzoeken ----------
self.addEventListener("fetch", (e) => {
  if (!BOUW) return;
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/^\/(api|beheer)(\/|$)/.test(url.pathname)) return;

  if (req.mode === "navigate") {
    if (url.pathname === SCHIL_PAD) e.respondWith(pagina(req));
    else if (url.pathname.startsWith("/bijbelreis/")) e.respondWith(fetch(req).catch(() => offlinePagina()));
    return;
  }
  const sleutel = url.pathname + url.search;
  if (IN_SCHIL.has(sleutel)) return e.respondWith(uitSchil(req, sleutel));
  if (!url.search && BOUW.beelden[url.pathname]) return e.respondWith(beeld(e, req, url.pathname + "?h=" + BOUW.beelden[url.pathname]));
  const v = url.searchParams.get("v");
  if ((url.pathname.startsWith("/bijbelreis/")) && v && /^[0-9a-f]{6,64}$/.test(v)) e.respondWith(gecontroleerd(req, v));
});

async function uitSchil(req, sleutel) {
  const r = await (await caches.open(SCHIL)).match(sleutel);
  if (r) return r;
  // De schil is weg (opslag opgeruimd door de browser): dan van het netwerk, met dezelfde controle.
  return gecontroleerd(req, IN_SCHIL.get(sleutel));
}

// Een bestand van een andere versie dan deze schil (bijv. een nieuwere pagina van het netwerk): alleen doorgeven als de
// inhoud bij de hash in het adres past. Anders een fout, nooit een bestand van een andere versie.
async function gecontroleerd(req, hash) {
  const r = await fetch(req);
  if (!r.ok || r.type !== "basic") return r;
  const buf = await r.arrayBuffer();
  if (await hashKlopt(buf, hash)) return kopie(r, buf);
  return new Response("Dit bestand hoort bij een andere versie van de Bijbelreis. Vernieuw de pagina.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

async function beeld(e, req, sleutel) {
  const c = await caches.open(BEELDEN);
  const bewaard = await c.match(sleutel);
  if (bewaard) return bewaard;
  const r = await fetch(req);
  if (r.status === 200 && r.type === "basic") {
    e.waitUntil((async () => {
      await c.put(sleutel, r.clone());
      const sleutels = await c.keys();
      for (const oud of sleutels.slice(0, Math.max(0, sleutels.length - MAX_BEELDEN))) await c.delete(oud);
    })().catch(() => {}));
  }
  return r;
}

async function pagina(req) {
  const c = await caches.open(SCHIL);
  const bewaard = await c.match(SCHIL_PAD);
  const net = fetch(req);
  try {
    if (!bewaard) return await net;
    return await new Promise((klaar, fout) => {
      const t = setTimeout(() => klaar(bewaard), NAV_WACHT);
      net.then((r) => { clearTimeout(t); klaar(r); }, (err) => { clearTimeout(t); fout(err); });
    });
  } catch {
    return bewaard ? gemerkt(bewaard) : offlinePagina();
  }
}

// De bewaarde pagina, met een merkje dat pwa.js kan lezen (Server-Timing is voor de pagina zelf zichtbaar), zodat de app
// ook ‘geen internet’ meldt als de browser denkt dat hij online is (navigator.onLine zegt niet altijd de waarheid).
function gemerkt(r) {
  const koppen = new Headers(r.headers);
  koppen.set("Server-Timing", "bijbelreis-offline");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: koppen });
}

function offlinePagina() {
  const html = `<!doctype html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Geen internet — Bijbelreis</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f0e5;color:#1f2430;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:30rem;padding:2rem 1.5rem;text-align:center;line-height:1.5}h1{font-size:1.4rem;margin:0 0 .75rem;color:#243d70}a{color:#243d70;font-weight:600}</style></head><body><main><h1>Even geen internet</h1><p>Deze pagina is nog niet bewaard op dit apparaat. Als je weer internet hebt, kun je hem openen.</p><p><a href="${SCHIL_PAD}">Naar de Bijbelreis</a> (wat je al eerder bekeek, werkt ook zonder internet)</p></main></body></html>`;
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
