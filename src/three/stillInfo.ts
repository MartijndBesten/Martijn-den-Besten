// Ankerpunten van de vooraf gerenderde objecten (zie scripts/render-3d.mjs). Importeert niets uit three.

import anchors from "./anchors.json";

type Pt = { x: number; y: number };
type Objects = {
  archief: { slot: Pt; drawer: Pt; open: Pt; belt: Pt };
  mini: { window: Pt[]; lever: Pt; out: Pt };
  kinetisch: { wheel: Pt; hook: Pt };
  donker: { object: Pt };
};

export const OBJECT_ANCHORS = (anchors as unknown as { objects: Objects }).objects;
