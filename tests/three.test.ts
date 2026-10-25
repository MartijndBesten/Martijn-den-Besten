import { describe, expect, it } from "vitest";
import { CONSOLE_ANCHORS, quadToMatrix3d } from "../src/three/consoleInfo";
import { OBJECT_ANCHORS } from "../src/three/stillInfo";

/** Past een matrix3d-string toe op een punt (x, y) en geeft het schermpunt terug. */
function apply(m: string, x: number, y: number) {
  const v = m.slice(9, -1).split(",").map(Number);
  const X = v[0] * x + v[4] * y + v[12];
  const Y = v[1] * x + v[5] * y + v[13];
  const W = v[3] * x + v[7] * y + v[15];
  return { x: X / W, y: Y / W };
}

describe("3D: display precies op het scherm", () => {
  it("legt de hoeken van de rechthoek op de hoeken van de vierhoek", () => {
    const quad = [
      { x: 12, y: 8 },
      { x: 310, y: 20 },
      { x: 18, y: 190 },
      { x: 300, y: 214 },
    ];
    const m = quadToMatrix3d(400, 240, quad);
    const corners = [
      [0, 0],
      [400, 0],
      [0, 240],
      [400, 240],
    ];
    corners.forEach(([x, y], i) => {
      const p = apply(m, x, y);
      expect(p.x).toBeCloseTo(quad[i].x, 2);
      expect(p.y).toBeCloseTo(quad[i].y, 2);
    });
  });
});

describe("3D: ankerpunten van de console", () => {
  it("heeft alle bediening binnen beeld, in beide composities", () => {
    const need = {
      wide: ["idee", "niets", "knob", "afronden", "domein", "serious", "koffie", "ambitie", "realisme", "stop", "lever", "leverEnd", "rail", "gaugeLoad", "gaugeProgress"],
      compact: ["idee", "niets", "knob", "stop", "lever", "leverEnd", "rail", "gaugeLoad", "gaugeProgress"],
    } as const;
    for (const layout of ["wide", "compact"] as const) {
      const { anchors, screen } = CONSOLE_ANCHORS[layout];
      for (const id of need[layout]) {
        const a = anchors[id];
        expect(a, `${layout}/${id}`).toBeDefined();
        expect(a.x).toBeGreaterThan(0.02);
        expect(a.x).toBeLessThan(0.98);
        expect(a.y).toBeGreaterThan(0.02);
        expect(a.y).toBeLessThan(0.98);
      }
      expect(screen.quad).toHaveLength(4);
      // het display moet groot genoeg zijn om te lezen
      expect(screen.w).toBeGreaterThan(layout === "compact" ? 0.55 : 0.28);
    }
  });
  it("zet grote knoppen niet over elkaar heen", () => {
    for (const layout of ["wide", "compact"] as const) {
      const a = CONSOLE_ANCHORS[layout].anchors;
      const ids = ["idee", "niets", "knob", "stop"];
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++) {
          const p = a[ids[i]];
          const q = a[ids[j]];
          expect(Math.hypot(p.x - q.x, p.y - q.y), `${layout} ${ids[i]}-${ids[j]}`).toBeGreaterThan(p.r + q.r);
        }
    }
  });
});

describe("3D: vooraf gerenderde objecten", () => {
  it("heeft ankerpunten voor archief, generator, installatie en donkere zaal", () => {
    expect(OBJECT_ANCHORS.mini.window).toHaveLength(4);
    for (const p of [OBJECT_ANCHORS.archief.slot, OBJECT_ANCHORS.archief.drawer, OBJECT_ANCHORS.kinetisch.wheel, OBJECT_ANCHORS.kinetisch.hook, OBJECT_ANCHORS.donker.object]) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(1);
    }
  });
});
