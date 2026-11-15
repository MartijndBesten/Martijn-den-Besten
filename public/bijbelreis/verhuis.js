// De Bijbelreis is verhuisd naar een eigen adres. Dit script staat op het oude adres (martijndenbesten.com/bijbelreis).
// Het neemt de voortgang uit deze browser mee (localStorage, sleutels ‘bijbelreis:’) in het fragment van het nieuwe
// adres. Een fragment gaat niet naar een server: de voortgang blijft in de browser. De app op het nieuwe adres voegt
// haar samen met wat daar al staat (app.js, verhuisIn).
(async () => {
  "use strict";
  const naar = document.documentElement.dataset.naar || "https://bijbelreis.nl/";
  const hash = location.hash.slice(1);
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("bijbelreis:")) data[k.slice(11)] = localStorage.getItem(k); }
  } catch { /* geen opslag: alleen doorverwijzen */ }
  let doel = naar + (hash ? "#" + hash : "");
  if (Object.keys(data).length) {
    try {
      const b64 = (bytes) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
      const ruw = new TextEncoder().encode(JSON.stringify(data));
      let pakket = "j." + b64(ruw);
      if (typeof CompressionStream === "function") pakket = "z." + b64(new Uint8Array(await new Response(new Blob([ruw]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()));
      doel = naar + "#verhuis=" + pakket + (hash ? "&naar=" + encodeURIComponent(hash) : "");
    } catch { /* inpakken mislukt: zonder voortgang doorverwijzen is beter dan blijven hangen */ }
  }
  location.replace(doel);
})();
