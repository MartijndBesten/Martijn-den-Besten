import { describe, expect, it } from "vitest";
import { crank } from "../src/components/IdeaMachine";
import { rankFor } from "../src/components/StampCard";
import { discoveryLevel, MISSIONS } from "../src/content/progress";

describe("ideeënmachine: kruk en zuiger", () => {
  it("houdt de zuiger bij elke hoek binnen de cilinder", () => {
    for (let a = 0; a < 360; a += 5) {
      const { pistonY } = crank(a);
      // cilinder loopt van y 88 tot 174; de zuigerkop is 20 hoog
      expect(pistonY - 20).toBeGreaterThanOrEqual(88);
      expect(pistonY).toBeLessThanOrEqual(180);
    }
  });
  it("beweegt de zuiger echt op en neer", () => {
    const ys = Array.from({ length: 72 }, (_, i) => crank(i * 5).pistonY);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(40);
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
