// Bundelt de gebouwde site (dist/client) in een TypeScript-module, zodat de Worker de bestanden zelf kan serveren.
// Bedoeld voor deployments vanuit omgevingen waar de Static Assets-upload niet werkt (zie docs/DEPLOYMENT.md).

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = "dist/client";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};
const SKIP = new Set(["_headers", ".assetsignore"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (name === ".vite") return [];
    return statSync(full).isDirectory() ? walk(full) : SKIP.has(name) ? [] : [full];
  });
}

const files = {};
for (const full of walk(root)) {
  const path = "/" + relative(root, full).split("\\").join("/");
  const type = TYPES[extname(full)];
  if (!type) throw new Error(`Onbekend bestandstype: ${path}`);
  const buf = readFileSync(full);
  files[path] = [type, createHash("sha256").update(buf).digest("hex").slice(0, 16), buf.toString("base64")];
}

// _headers omzetten naar regels: [patroon, {header: waarde}]
const rules = [];
let current = null;
for (const line of readFileSync(join(root, "_headers"), "utf8").split("\n")) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) {
    current = { pattern: line.trim(), headers: {} };
    rules.push(current);
  } else if (current) {
    const i = line.indexOf(":");
    current.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

mkdirSync("worker/generated", { recursive: true });
// De geschiedenispagina's (scripts/bijbelreis-verhalen.mjs) horen alleen bij bijbelreis.nl; de hoofdsite krijgt ze niet mee.
// Ook de andere talen (docs/bijbelreis-talen/README.md: /bijbelreis/<taal>/, /bijbelreis/taal/ en bijbelreis-sw-<taal>.js).
const alleenReis = (p) => p.startsWith("/bijbelreis/verhaal/") || p === "/bijbelreis/verhalen.html" || /^\/bijbelreis\/([a-z]{2}|taal)\//.test(p) || /^\/bijbelreis-sw-[a-z]{2}\.js$/.test(p);
const hoofdFiles = Object.fromEntries(Object.entries(files).filter(([p]) => !alleenReis(p)));
writeFileSync(
  "worker/generated/files.ts",
  `// Automatisch gegenereerd door scripts/embed-assets.mjs. Niet handmatig bewerken.\n` +
    `export const FILES: Record<string, [type: string, etag: string, base64: string]> = ${JSON.stringify(hoofdFiles)};\n` +
    `export const HEADER_RULES: { pattern: string; headers: Record<string, string> }[] = ${JSON.stringify(rules)};\n`,
);
// De Bijbelreis heeft een eigen Worker (bijbelreis.nl, worker/bijbelreis.ts) met alleen haar eigen bestanden.
const eigen = (p) => p === "/bijbelreis.html" || /^\/bijbelreis-sw(-[a-z]{2})?\.js$/.test(p) || p.startsWith("/bijbelreis/") || p.startsWith("/fonts/");
const reisFiles = Object.fromEntries(Object.entries(files).filter(([p]) => eigen(p)));
const reisRules = rules.filter((r) => ["/*", "/fonts/*", "/bijbelreis/*"].includes(r.pattern));
writeFileSync(
  "worker/generated/bijbelreis-files.ts",
  `// Automatisch gegenereerd door scripts/embed-assets.mjs. Niet handmatig bewerken.\n` +
    `export const FILES: Record<string, [type: string, etag: string, base64: string]> = ${JSON.stringify(reisFiles)};\n` +
    `export const HEADER_RULES: { pattern: string; headers: Record<string, string> }[] = ${JSON.stringify(reisRules)};\n`,
);
const total = Object.values(hoofdFiles).reduce((n, f) => n + f[2].length, 0);
console.log(`embed-assets: ${Object.keys(hoofdFiles).length} bestanden, ${(total / 1024).toFixed(0)} kB base64; Bijbelreis apart: ${Object.keys(reisFiles).length} bestanden`);
