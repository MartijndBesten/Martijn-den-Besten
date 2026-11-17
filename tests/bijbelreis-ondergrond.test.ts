import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// De ondergrond (land, reliëf) moet het hele vak beslaan dat de kaart mag tonen (maxBounds in app.js). Anders ligt er op
// een breed scherm zee waar land hoort (17-11-2026: ten oosten van 53° O, in Iran).
const geo = JSON.parse(readFileSync("public/bijbelreis/geo.json", "utf8"));
const relief = JSON.parse(readFileSync("public/bijbelreis/relief.json", "utf8"));
const app = readFileSync("public/bijbelreis/app.js", "utf8");

function bbox(c: unknown, b = [180, 90, -180, -90]): number[] {
  if (Array.isArray(c) && typeof c[0] === "number") return [Math.min(b[0], c[0]), Math.min(b[1], c[1] as number), Math.max(b[2], c[0]), Math.max(b[3], c[1] as number)];
  return (c as unknown[]).reduce((a: number[], x) => bbox(x, a), b);
}

describe("ondergrond dekt het kaartvak", () => {
  const m = /maxBounds: \[\[(\d+), (\d+)\], \[(\d+), (\d+)\]\]/.exec(app)!;
  const [z, w, n, o] = m.slice(1).map(Number);
  it("land loopt tot de randen van maxBounds", () => {
    const [lw, lz, lo, ln] = bbox(geo.land.geometry.coordinates);
    expect(lw).toBeLessThanOrEqual(w + 0.05);
    expect(lo).toBeGreaterThanOrEqual(o - 0.05);
    expect(lz).toBeLessThanOrEqual(z + 0.05);
    expect(ln).toBeGreaterThanOrEqual(n - 0.05);
  });
  it("het reliëf van de regio beslaat hetzelfde vak", () => {
    const [[rz, rw], [rn, ro]] = relief.regio.bounds;
    expect(rw).toBeLessThanOrEqual(w + 0.05);
    expect(ro).toBeGreaterThanOrEqual(o - 0.05);
    expect(rz).toBeLessThanOrEqual(z + 0.05);
    expect(rn).toBeGreaterThanOrEqual(n - 0.05);
  });
});
