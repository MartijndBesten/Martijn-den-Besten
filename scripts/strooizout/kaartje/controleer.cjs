// Controle: de QR-code uit de uiteindelijke pdf's lezen (pdf → beeld → decoderen) en de paginamaten nalezen.
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp"); // vereist: npm i --no-save jsqr
const jsQR = require("jsqr");
(async () => {
  for (const pdf of ["strooizout-kaartje-a6.pdf", "strooizout-kaartje-a6-drukklaar-CMYK.pdf"]) {
    const info = execFileSync("pdfinfo", [path.join(process.cwd(), pdf)]).toString();
    const maat = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info);
    const mm = (pt) => ((Number(pt) / 72) * 25.4).toFixed(1);
    console.log(pdf, "| pagina's:", /Pages:\s+(\d+)/.exec(info)[1], "| formaat:", mm(maat[1]), "x", mm(maat[2]), "mm");
    for (const dpi of [300, 150, 100]) {
      const basis = path.join(process.cwd(), `controle-${dpi}`);
      execFileSync("pdftoppm", ["-r", String(dpi), "-png", "-singlefile", path.join(process.cwd(), pdf), basis]);
      const { data, info: i } = await sharp(`${basis}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const uit = jsQR(new Uint8ClampedArray(data), i.width, i.height);
      console.log(`  ${dpi} dpi (${i.width} × ${i.height} px):`, uit ? uit.data : "NIET GELEZEN");
      fs.rmSync(`${basis}.png`);
    }
    const fonts = execFileSync("pdffonts", [path.join(process.cwd(), pdf)]).toString().trim().split("\n").slice(2).map((r) => r.trim().split(/\s+/)).map((k) => `${k[0]} (ingesloten: ${k[k.length - 5]})`);
    console.log("  lettertypen:", fonts.join(", ") || "geen (omgezet naar vormen)");
  }
})();
