// Objecten bij de afdelingen en de zwevende vormen in de hero: vooraf gerenderd in 3D
// (src/three/scenes/objects.ts), met hetzelfde licht en dezelfde materialen als de machines.

import { Still } from "./Still";

export type ObjectKind = "knop" | "sokkel" | "lamp" | "ticket" | "certificaat" | "planeet";

export function DeptObject({ kind, className }: { kind: ObjectKind; className?: string }) {
  return <Still name={`afd-${kind}`} w={400} h={400} className={`obj obj--${kind} ${className ?? ""}`} />;
}

const SHAPES = [
  ["sphere", "bal"],
  ["ring", "ring"],
  ["star", "ster"],
  ["pill", "pil"],
  ["squiggle", "kronkel"],
] as const;

export function Floaters() {
  return (
    <div className="floaters" aria-hidden="true">
      {SHAPES.map(([cls, name]) => (
        <Still key={name} name={`vorm-${name}`} w={240} h={240} className={`floater floater--${cls}`} eager />
      ))}
    </div>
  );
}
