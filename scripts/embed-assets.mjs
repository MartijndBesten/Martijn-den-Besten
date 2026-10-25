// Bundelt de gebouwde site (dist/client) in een TypeScript-module, zodat de Worker de bestanden zelf kan serveren.
// Bedoeld voor deployments vanuit omgevingen waar de Static Assets-upload niet werkt (zie docs/DEPLOYMENT.md).

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = "dist/client";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
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

writeFileSync(
  "worker/generated/files.ts",
  `// Automatisch gegenereerd door scripts/embed-assets.mjs. Niet handmatig bewerken.\n` +
    `export const FILES: Record<string, [type: string, etag: string, base64: string]> = ${JSON.stringify(files)};\n` +
    `export const HEADER_RULES: { pattern: string; headers: Record<string, string> }[] = ${JSON.stringify(rules)};\n`,
);
const total = Object.values(files).reduce((n, f) => n + f[2].length, 0);
console.log(`embed-assets: ${Object.keys(files).length} bestanden, ${(total / 1024).toFixed(0)} kB base64`);
