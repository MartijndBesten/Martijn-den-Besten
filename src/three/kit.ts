// Bouwdoos van de uitvinderswerkplaats: materialen en machineonderdelen die overal hetzelfde ogen.
// Mat gelakt metaal, zacht kunststof, geborsteld metaal, transparante buizen en afgeronde randen.

import {
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  CurvePath,
  CylinderGeometry,
  BackSide,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  LatheGeometry,
  LineCurve3,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  QuadraticBezierCurve3,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type ColorRepresentation,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Het palet van de werkplaats: zacht pastel met donkerblauw als contrast. */
export const PAL = {
  creme: 0xf7eee6,
  papier: 0xefe2d8,
  roze: 0xf2b6c3,
  rozeDiep: 0xe58ea3,
  blauw: 0xa8c6e8,
  blauwDiep: 0x7ea3d1,
  boter: 0xf6d781,
  boterDiep: 0xe9bf55,
  mint: 0xb3e1cb,
  mintDiep: 0x86c8aa,
  lila: 0xd5c7f2,
  lilaDiep: 0xb3a0e4,
  nacht: 0x2f3a66,
  inkt: 0x232845,
  metaal: 0xc9ccd8,
  rood: 0xe9707f,
} as const;

const cache = new Map<string, Material>();

/** Mat gelakt materiaal; `gloss` maakt het iets glanzender (kunststof), `metal` maakt het metaal. */
export function mat(color: ColorRepresentation, o: { gloss?: number; metal?: number; emissive?: ColorRepresentation; emissiveIntensity?: number } = {}): MeshStandardMaterial {
  const key = `${color}|${o.gloss ?? 0}|${o.metal ?? 0}|${o.emissive ?? ""}|${o.emissiveIntensity ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit as MeshStandardMaterial;
  const m = new MeshStandardMaterial({
    color,
    roughness: o.metal ? 0.34 : 0.62 - (o.gloss ?? 0) * 0.35,
    metalness: o.metal ?? 0,
    emissive: o.emissive ?? 0x000000,
    emissiveIntensity: o.emissiveIntensity ?? 0,
  });
  cache.set(key, m);
  return m;
}

/** Een eigen (niet gedeeld) materiaal, voor onderdelen die van kleur of gloed veranderen. */
export const ownMat = (color: ColorRepresentation, o: Parameters<typeof mat>[1] = {}) => mat(color, o).clone();

export const glass = () =>
  new MeshStandardMaterial({ color: 0xd6e5f7, transparent: true, opacity: 0.42, roughness: 0.04, metalness: 0.15, envMapIntensity: 2.2, depthWrite: false });

export const metal = () => mat(PAL.metaal, { metal: 0.75 });

export function shade(o: Object3D, cast = true, receive = true): Object3D {
  o.traverse((c) => {
    const m = c as Mesh;
    if (m.isMesh) {
      m.castShadow = cast && !(m.material as Material).transparent;
      m.receiveShadow = receive;
    }
  });
  return o;
}

export function box(w: number, h: number, d: number, r: number, material: Material, seg = 4): Mesh {
  return new Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), material);
}

/** Cilinder met afgeronde randen (draaiprofiel), staand op y = 0. */
export function roundCyl(r: number, h: number, bevel: number, material: Material, segments = 48): Mesh {
  const b = Math.min(bevel, r * 0.5, h * 0.5);
  const pts: Vector2[] = [new Vector2(0, 0), new Vector2(r - b, 0)];
  for (let i = 1; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    pts.push(new Vector2(r - b + Math.cos(a) * b, b + Math.sin(a) * b));
  }
  pts.push(new Vector2(r, h - b));
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new Vector2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b));
  }
  pts.push(new Vector2(0, h));
  return new Mesh(new LatheGeometry(pts, segments), material);
}

export function sphere(r: number, material: Material, seg = 32): Mesh {
  return new Mesh(new SphereGeometry(r, seg, Math.round(seg * 0.75)), material);
}

/** Pad van rechte stukken met afgeronde bochten, zoals een echte buisleiding. */
export function bentPath(points: Vector3[], bend = 0.4): CurvePath<Vector3> {
  const path = new CurvePath<Vector3>();
  let start = points[0].clone();
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const inDir = p.clone().sub(points[i - 1]).normalize();
    const outDir = points[i + 1].clone().sub(p).normalize();
    const r = Math.min(bend, p.distanceTo(points[i - 1]) / 2, p.distanceTo(points[i + 1]) / 2);
    const a = p.clone().addScaledVector(inDir, -r);
    const b = p.clone().addScaledVector(outDir, r);
    if (start.distanceTo(a) > 1e-4) path.add(new LineCurve3(start, a));
    path.add(new QuadraticBezierCurve3(a, p.clone(), b));
    start = b;
  }
  path.add(new LineCurve3(start, points[points.length - 1].clone()));
  return path;
}

/** Een buis langs een pad, met kragen op de uiteinden. */
export function pipe(points: Vector3[], radius: number, material: Material, bend = 0.45, collars = true): Group & { curve: CurvePath<Vector3> } {
  const g = new Group() as Group & { curve: CurvePath<Vector3> };
  const curve = bentPath(points, bend);
  g.curve = curve;
  g.add(new Mesh(new TubeGeometry(curve, Math.max(40, points.length * 24), radius, 20, false), material));
  if (collars) {
    for (const [p, q] of [
      [points[0], points[1]],
      [points[points.length - 1], points[points.length - 2]],
    ]) {
      const ring = new Mesh(new CylinderGeometry(radius * 1.35, radius * 1.35, radius * 0.9, 24), metal());
      ring.position.copy(p).addScaledVector(q.clone().sub(p).normalize(), radius * 0.45);
      ring.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), q.clone().sub(p).normalize());
      g.add(ring);
    }
  }
  return g;
}

/** Transparante buis (voor ideeën die erdoorheen rollen) met metalen kragen. */
export function glassPipe(points: Vector3[], radius: number, bend = 0.45): Group & { curve: CurvePath<Vector3> } {
  const g = pipe(points, radius, glass(), bend, true);
  // dunne binnenwand geeft het glas een rand
  const inner = new Mesh(new TubeGeometry(g.curve, 80, radius * 0.94, 16, false), new MeshStandardMaterial({ color: 0x9fb9dc, transparent: true, opacity: 0.22, side: BackSide, depthWrite: false }));
  g.add(inner);
  // glanslijn: maakt het glas leesbaar tegen een lichte achtergrond
  const shine = new Mesh(new TubeGeometry(g.curve, 80, radius * 0.16, 8, false), new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.1, depthWrite: false }));
  shine.position.set(-radius * 0.45, radius * 0.55, radius * 0.35);
  g.add(shine);
  return g;
}

/** Vloeiende kabel tussen punten. */
export function cable(points: Vector3[], radius: number, color: ColorRepresentation = PAL.nacht): Mesh {
  const curve = new CatmullRomCurve3(points, false, "centripetal");
  return new Mesh(new TubeGeometry(curve, points.length * 16, radius, 10, false), mat(color, { gloss: 0.3 }));
}

/** Tandwiel met afgeronde tanden, plat in het xy-vlak (draait om z). */
export function gear(teeth: number, radius: number, thick: number, material: Material): Group {
  const s = new Shape();
  const depth = radius * 0.18;
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const pts = [
      [a - step * 0.32, radius - depth],
      [a - step * 0.18, radius],
      [a + step * 0.18, radius],
      [a + step * 0.32, radius - depth],
      [a + step * 0.68, radius - depth],
    ];
    pts.forEach(([ang, r], i) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (k === 0 && i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  const hole = new Shape();
  hole.absarc(0, 0, radius * 0.18, 0, Math.PI * 2, true);
  s.holes.push(hole);
  for (let i = 0; i < 5; i++) {
    const h = new Shape();
    const a = (i / 5) * Math.PI * 2;
    h.absarc(Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, radius * 0.13, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const geo = new ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.22, bevelSize: radius * 0.035, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -thick / 2);
  const g = new Group();
  g.add(new Mesh(geo, material));
  const hub = new Mesh(new CylinderGeometry(radius * 0.24, radius * 0.24, thick * 1.8, 24), metal());
  hub.rotation.x = Math.PI / 2;
  g.add(hub);
  return g;
}

/** Trechter (draaiprofiel met wanddikte). */
export function funnel(rTop: number, rBottom: number, h: number, neck: number, material: Material): Mesh {
  const t = 0.06;
  const pts = [
    new Vector2(rBottom - t, -neck),
    new Vector2(rBottom, -neck),
    new Vector2(rBottom, 0),
    new Vector2(rTop, h),
    new Vector2(rTop + 0.05, h + 0.04),
    new Vector2(rTop + 0.02, h + 0.1),
    new Vector2(rTop - t, h + 0.06),
    new Vector2(rBottom - t, 0.02),
  ];
  const own = material.clone();
  own.side = DoubleSide;
  return new Mesh(new LatheGeometry(pts, 56), own);
}

/** Wijzerplaat-textuur: crème met gekleurde zones, streepjes en een label. */
export function dialTexture(label: string, zones: [number, number, string][] = [
  [0, 0.55, "#9fd3b9"],
  [0.55, 0.8, "#f2cf6a"],
  [0.8, 1, "#ea8ea2"],
]): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fbf6ef";
  g.beginPath();
  g.arc(128, 128, 128, 0, Math.PI * 2);
  g.fill();
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  for (const [f0, f1, col] of zones) {
    g.strokeStyle = col;
    g.lineWidth = 18;
    g.beginPath();
    g.arc(128, 128, 92, a0 + (a1 - a0) * f0, a0 + (a1 - a0) * f1);
    g.stroke();
  }
  g.strokeStyle = "#2f3a66";
  for (let i = 0; i <= 20; i++) {
    const a = a0 + ((a1 - a0) * i) / 20;
    const r1 = i % 5 ? 100 : 94;
    g.lineWidth = i % 5 ? 2 : 4;
    g.beginPath();
    g.moveTo(128 + Math.cos(a) * r1, 128 + Math.sin(a) * r1);
    g.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112);
    g.stroke();
  }
  g.fillStyle = "#2f3a66";
  g.font = "600 20px 'Geist Mono', monospace";
  g.textAlign = "center";
  g.fillText(label, 128, 196);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Analoge meter: behuizing, wijzerplaat en een naald die je kunt draaien (0..1). */
export function gauge(radius: number, label: string, body: Material = mat(PAL.nacht, { gloss: 0.4 })): Group & { setValue: (v: number) => void } {
  const g = new Group() as Group & { setValue: (v: number) => void };
  const housing = roundCyl(radius, radius * 0.45, radius * 0.12, body);
  housing.rotation.x = Math.PI / 2;
  g.add(housing);
  const face = new Mesh(new CircleGeometry(radius * 0.86, 48), new MeshStandardMaterial({ map: dialTexture(label), roughness: 0.5 }));
  face.position.z = radius * 0.46;
  g.add(face);
  const rim = new Mesh(new TorusGeometry(radius * 0.88, radius * 0.06, 12, 48), metal());
  rim.position.z = radius * 0.46;
  g.add(rim);
  const needle = new Group();
  const n = box(radius * 0.06, radius * 0.72, radius * 0.04, radius * 0.02, mat(PAL.rood, { gloss: 0.5 }));
  n.position.y = radius * 0.3;
  needle.add(n);
  needle.add(new Mesh(new CylinderGeometry(radius * 0.09, radius * 0.09, radius * 0.08, 20), metal()).rotateX(Math.PI / 2));
  needle.position.z = radius * 0.5;
  g.add(needle);
  const glassCap = new Mesh(new SphereGeometry(radius * 0.88, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.22), glass());
  glassCap.rotation.x = Math.PI / 2;
  glassCap.position.z = radius * 0.2;
  g.add(glassCap);
  g.setValue = (v: number) => {
    // 0 = linksonder, 1 = rechtsonder (zelfde boog als de wijzerplaat)
    needle.rotation.z = Math.PI * 0.7 - Math.min(1.05, Math.max(0, v)) * Math.PI * 1.4;
  };
  g.setValue(0);
  return g;
}

/** Lopende band met latten die werkelijk bewegen. Loopt langs de x-as. */
export function conveyor(length: number, width: number, height: number): Group & { setOffset: (o: number) => void; top: number } {
  const g = new Group() as Group & { setOffset: (o: number) => void; top: number };
  const railMat = mat(PAL.roze, { gloss: 0.2 });
  for (const z of [-width / 2 - 0.06, width / 2 + 0.06]) {
    const rail = box(length + 0.3, 0.26, 0.12, 0.05, railMat);
    rail.position.set(0, height, z);
    g.add(rail);
  }
  const bed = box(length, 0.1, width, 0.04, mat(PAL.nacht, { gloss: 0.2 }));
  bed.position.set(0, height - 0.06, 0);
  g.add(bed);
  for (const x of [-length / 2, length / 2]) {
    const roller = new Mesh(new CylinderGeometry(0.13, 0.13, width + 0.04, 24), metal());
    roller.rotation.x = Math.PI / 2;
    roller.position.set(x, height - 0.04, 0);
    g.add(roller);
  }
  // latten (instanced): bewegen mee als de band loopt
  const n = Math.round(length / 0.22);
  const slatGeo = new RoundedBoxGeometry(0.14, 0.05, width - 0.06, 2, 0.02);
  const slats = new InstancedMesh(slatGeo, mat(PAL.creme), n);
  const m4 = new Matrix4();
  const place = (o: number) => {
    for (let i = 0; i < n; i++) {
      let x = -length / 2 + ((i * (length / n) + o) % length + length) % length;
      x = Math.min(length / 2 - 0.08, Math.max(-length / 2 + 0.08, x));
      m4.makeTranslation(x, height + 0.02, 0);
      slats.setMatrixAt(i, m4);
    }
    slats.instanceMatrix.needsUpdate = true;
  };
  place(0);
  g.add(slats);
  // poten
  for (const x of [-length / 2 + 0.3, length / 2 - 0.3]) {
    for (const z of [-width / 2, width / 2]) {
      const leg = box(0.12, height - 0.1, 0.12, 0.04, mat(PAL.blauwDiep));
      leg.position.set(x, (height - 0.1) / 2, z);
      g.add(leg);
    }
  }
  g.setOffset = place;
  g.top = height + 0.05;
  return g;
}

/** Platform met fijne ribbels, zoals op het referentiebeeld. */
export function ribbedPlatform(w: number, d: number, h: number, material: Material, ribMaterial: Material = material): Group {
  const g = new Group();
  const base = box(w, h, d, Math.min(h / 2, 0.12), material);
  base.position.y = h / 2;
  g.add(base);
  const n = Math.floor(w / 0.09);
  const ribs = new InstancedMesh(new CylinderGeometry(0.022, 0.022, d * 0.86, 8), ribMaterial, n);
  const m4 = new Matrix4();
  const rot = new Matrix4().makeRotationX(Math.PI / 2);
  for (let i = 0; i < n; i++) {
    m4.makeTranslation(-w / 2 + 0.09 * (i + 0.8), h + 0.012, 0).multiply(rot);
    ribs.setMatrixAt(i, m4);
  }
  g.add(ribs);
  return g;
}

/** Boog (poortje) met afgeronde randen, staand in het xy-vlak. */
export function arch(w: number, h: number, thick: number, material: Material): Mesh {
  const s = new Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h);
  s.lineTo(w / 2, h);
  s.lineTo(w / 2, 0);
  const r = w * 0.3;
  s.lineTo(r, 0);
  s.lineTo(r, h * 0.45);
  s.absarc(0, h * 0.45, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  s.lineTo(-w / 2, 0);
  const geo = new ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -thick / 2);
  return new Mesh(geo, material);
}

/** Lampje met regelbare gloed. */
export function lamp(radius: number, color: ColorRepresentation): Group & { setOn: (on: number) => void } {
  const g = new Group() as Group & { setOn: (on: number) => void };
  const socket = roundCyl(radius * 1.1, radius * 0.6, radius * 0.2, metal());
  g.add(socket);
  const m = new MeshStandardMaterial({ color, roughness: 0.25, emissive: color, emissiveIntensity: 0 });
  const bulb = sphere(radius, m, 24);
  bulb.position.y = radius * 0.9;
  g.add(bulb);
  g.setOn = (on: number) => {
    m.emissiveIntensity = on * 1.4;
  };
  return g;
}

/** Idee-bolletje. */
export function ball(r: number, color: ColorRepresentation): Mesh {
  const m = sphere(r, new MeshStandardMaterial({ color, roughness: 0.32, metalness: 0 }), 28);
  m.castShadow = true;
  return m;
}

/** Kaartje (de uitvinding) met een gekleurde band. */
export function ticket(color: ColorRepresentation): Group {
  const g = new Group();
  const card = box(0.62, 0.04, 0.44, 0.03, mat(PAL.creme, { gloss: 0.2 }));
  g.add(card);
  const band = box(0.62, 0.05, 0.1, 0.02, mat(color));
  band.position.set(0, 0.005, -0.15);
  g.add(band);
  for (let i = 0; i < 3; i++) {
    const line = box(0.38 - i * 0.08, 0.05, 0.03, 0.01, mat(PAL.blauwDiep));
    line.position.set(-0.08 + i * 0.04, 0.006, -0.02 + i * 0.07);
    g.add(line);
  }
  return g;
}
