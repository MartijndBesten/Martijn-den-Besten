// Bewaakt dat de visuele regressietest lokaal en in de CI in exact dezelfde omgeving draait:
// één Playwright-versie, één playwright-core en hetzelfde Docker-image (op digest) in script en workflow.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const lees = (p: string) => readFileSync(join(ROOT, p), "utf8");
const pkg = JSON.parse(lees("package.json"));
const lock = JSON.parse(lees("package-lock.json"));
const BEELD = /mcr\.microsoft\.com\/playwright:v([\d.]+)-noble@sha256:[0-9a-f]{64}/;

describe("vaste testomgeving", () => {
  it("Playwright staat exact vast, zonder tweede playwright-core", () => {
    const v = pkg.devDependencies["@playwright/test"];
    expect(v).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.overrides["playwright-core"]).toBe(v);
    const cores = Object.entries(lock.packages as Record<string, { version: string }>).filter(([k]) => k.endsWith("node_modules/playwright-core"));
    expect(cores.length).toBeGreaterThan(0);
    for (const [, p] of cores) expect(p.version).toBe(v);
    expect(lock.packages["node_modules/@playwright/test"].version).toBe(v);
  });
  it("script en CI gebruiken hetzelfde image op digest, met dezelfde Playwright-versie", () => {
    const script = BEELD.exec(lees("scripts/visueel.sh"));
    const ci = BEELD.exec(lees(".github/workflows/ci.yml"));
    expect(script && ci).toBeTruthy();
    expect(script![0]).toBe(ci![0]);
    expect(script![1]).toBe(pkg.devDependencies["@playwright/test"]);
  });
});
