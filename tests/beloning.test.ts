import { describe, expect, it } from "vitest";
import { MACHINE_ANCHORS, PART_TEXT } from "../src/three/machineInfo";
import { rankFor } from "../src/components/StampCard";
import { discoveryLevel, MISSIONS } from "../src/content/progress";

describe("ideeënmachine in 3D: ankerpunten", () => {
  it("heeft voor elk onderdeel een ankerpunt binnen beeld, in beide composities", () => {
    for (const layout of ["wide", "compact"] as const) {
      const a = MACHINE_ANCHORS[layout];
      for (const id of [...PART_TEXT.map((p) => p.id), "schakelaar"]) {
        expect(a[id], `${layout}/${id}`).toBeDefined();
        expect(a[id].x).toBeGreaterThan(0.03);
        expect(a[id].x).toBeLessThan(0.97);
        expect(a[id].y).toBeGreaterThan(0.03);
        expect(a[id].y).toBeLessThan(0.97);
      }
    }
  });
  it("zet de genummerde callouts niet op elkaar", () => {
    for (const layout of ["wide", "compact"] as const) {
      const pts = PART_TEXT.map((p) => MACHINE_ANCHORS[layout][p.id]);
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y), `${layout} ${i}-${j}`).toBeGreaterThan(0.05);
    }
  });
});

describe("beloningen", () => {
  it("kent rangen die meegroeien met voltooide missies", () => {
    expect(rankFor(0)).toBe("Nieuwkomer");
    expect(rankFor(1)).toBe("Bezoeker");
    expect(rankFor(3)).toBe("Vaste gast");
    expect(rankFor(5)).toBe("Ere-uitvinder");
    expect(rankFor(MISSIONS.length)).toBe("Opperbezoeker");
  });
  it("verandert de site pas na 3, 5 en 8 ontdekkingen", () => {
    expect([0, 2, 3, 4, 5, 7, 8, 20].map(discoveryLevel)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
});
