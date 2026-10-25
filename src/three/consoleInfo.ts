// Gegevens over de 3D-console van het Control Center die de pagina nodig heeft vóórdat three.js geladen is.
// Importeert niets uit three.

import anchors from "./anchors.json";

export type ConsoleLayout = "wide" | "compact";
export type ConsoleAnchor = { x: number; y: number; r: number };

export const CONSOLE_POSTER: Record<ConsoleLayout, { w: number; h: number; src: string; srcset: string }> = {
  wide: { w: 1400, h: 980, src: "/3d/console-wide-1000.webp", srcset: "/3d/console-wide-1000.webp 1000w, /3d/console-wide-1600.webp 1600w" },
  compact: { w: 780, h: 1000, src: "/3d/console-compact-600.webp", srcset: "/3d/console-compact-600.webp 600w, /3d/console-compact-1000.webp 1000w" },
};

type Pt = { x: number; y: number };
type Stored = { anchors: Record<string, ConsoleAnchor>; screen: { x: number; y: number; w: number; h: number; quad: Pt[] } };
export const CONSOLE_ANCHORS = (anchors as unknown as { console?: Record<ConsoleLayout, Stored> }).console ?? ({} as Record<ConsoleLayout, Stored>);

/**
 * CSS-transformatie die een rechthoek van w × h pixels precies op een vierhoek legt (perspectief).
 * Zo staat de HTML-tekst van het display echt óp het schuine 3D-scherm. `quad` in pixels:
 * linksboven, rechtsboven, linksonder, rechtsonder.
 */
export function quadToMatrix3d(w: number, h: number, quad: Pt[]): string {
  const src = [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ];
  // 8 vergelijkingen voor de homografie H (h33 = 1)
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const { x: u, y: v } = quad[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // Gauss-eliminatie met pivotering
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const hv = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * hv[k];
    hv[r] = s / A[r][r];
  }
  const [a, bb, c, d, e, f, g, hh] = hv;
  const m = [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((x) => +x.toFixed(8)).join(",")})`;
}
