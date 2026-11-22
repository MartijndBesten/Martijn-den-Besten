// Laadprestaties bijbelreis.nl: koud en warm, desktop en ‘trage Android’ (4× CPU-vertraging, Slow 4G zoals Lighthouse mobiel).
const { chromium, devices } = require('playwright');
const URL = process.argv[2] || 'https://bijbelreis.nl/';
const PROFIELEN = {
  desktop: { ctx: { viewport: { width: 1366, height: 800 } }, cpu: 1, net: null },
  trageAndroid: { ctx: { ...devices['Moto G4'] }, cpu: 4, net: { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 } },
};
async function meet(p, cdp) {
  await p.addInitScript(() => {
    window.__m = { lcp: 0, lt: 0, ltN: 0, inp: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__m.lt += e.duration; window.__m.ltN++; } }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__m.inp = Math.max(window.__m.inp, e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  const t0 = Date.now();
  await p.goto(URL, { waitUntil: 'load', timeout: 120000 });
  // ‘Klaar’: het voorscherm of de lijst Verhalen staat er (de app heeft begin() gedaan).
  await p.waitForFunction(() => document.querySelector('#voorscherm:not([hidden]) .vs-in') || document.querySelector('#vLijst [data-v]'), null, { timeout: 120000 });
  const klaar = Date.now() - t0;
  // Eén interactie voor INP: het voorscherm sluiten of een tabblad kiezen.
  const knop = await p.$('#voorscherm:not([hidden]) [data-vs-sluit]') || await p.$('#t-tijd');
  if (knop) { await knop.click(); await p.waitForTimeout(1500); }
  const r = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const res = performance.getEntriesByType('resource');
    return { ttfb: Math.round(n.responseStart), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), lcp: Math.round(window.__m.lcp), lange: Math.round(window.__m.lt), langeN: window.__m.ltN, inp: Math.round(window.__m.inp),
      verzoeken: res.length + 1, overdracht: Math.round((n.transferSize + res.reduce((s, x) => s + (x.transferSize || 0), 0)) / 1024), scripts: res.filter((x) => x.initiatorType === 'script').length, uitCache: res.filter((x) => x.transferSize === 0 && x.decodedBodySize > 0).length }; });
  return { klaar, ...r };
}
(async () => {
  const b = await chromium.launch();
  for (const [naam, pr] of Object.entries(PROFIELEN)) {
    const ctx = await b.newContext(pr.ctx);
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
    if (pr.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: pr.cpu });
    if (pr.net) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', pr.net); }
    const koud = await meet(p, cdp);
    await p.waitForTimeout(3000); // service worker installeren
    const warm = await meet(p, cdp);
    console.log(naam.padEnd(13), 'koud', JSON.stringify(koud)); console.log(''.padEnd(13), 'warm', JSON.stringify(warm));
    await ctx.close();
  }
  await b.close();
})();
