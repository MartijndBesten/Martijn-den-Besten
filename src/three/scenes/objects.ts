// Objectstudio: alle vooraf gerenderde 3D-objecten van de site komen uit deze ene bouwdoos
// (dezelfde materialen, hetzelfde licht als de interactieve machines). Wordt alleen door
// scripts/render-3d.mjs gebruikt; de site laadt de resulterende WebP-bestanden.

import {
  Box3,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { createStage, type Stage } from "../engine";
import { ball, box, cable, conveyor, dialTexture, funnel, gear, glass, lamp, mat, metal, PAL, pipe, roundCyl, sphere, ticket } from "../kit";

type Built = { root: Group; anchors?: (stage: Stage) => Record<string, unknown>; cam?: { az?: number; el?: number; fov?: number; pad?: number; target?: Vector3 } };

// ---------- Kleine bouwstenen ----------

/** Museumsokkel: crème blok met donkerblauwe bovenplaat en een messing naamplaatje. */
function pedestal(w = 1.2, h = 0.72): Group {
  const g = new Group();
  const body = box(w, h, w, 0.08, mat(PAL.creme, { gloss: 0.2 }));
  body.position.y = h / 2;
  const top = box(w + 0.08, 0.08, w + 0.08, 0.03, mat(PAL.nacht, { gloss: 0.3 }));
  top.position.y = h + 0.04;
  const plaque = box(w * 0.42, 0.14, 0.03, 0.02, mat(PAL.boterDiep, { metal: 0.6 }));
  plaque.position.set(0, h * 0.62, w / 2 + 0.01);
  g.add(body, top, plaque);
  return g;
}

function star(r: number, depth: number, color: number): Mesh {
  const s = new Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.48 : r;
    if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  s.closePath();
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: r * 0.08, bevelSegments: 4 });
  geo.center();
  return new Mesh(geo, mat(color, { gloss: 0.35 }));
}

function capsuleMesh(r: number, len: number, a: number, b: number): Group {
  const g = new Group();
  const left = new Mesh(new CylinderGeometry(r, r, len / 2, 32), mat(a, { gloss: 0.45 }));
  left.position.y = -len / 4;
  const capA = new Mesh(new SphereGeometry(r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(a, { gloss: 0.45 }));
  capA.position.y = -len / 2;
  const right = new Mesh(new CylinderGeometry(r, r, len / 2, 32), mat(b, { gloss: 0.45 }));
  right.position.y = len / 4;
  const capB = new Mesh(new SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(b, { gloss: 0.45 }));
  capB.position.y = len / 2;
  g.add(left, capA, right, capB);
  return g;
}

function hourglassGlass(r: number, h: number): Mesh {
  const pts: Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const y = t * h;
    const neck = Math.abs(t - 0.5) * 2;
    pts.push(new Vector2(0.06 + r * Math.pow(neck, 0.8), y));
  }
  return new Mesh(new LatheGeometry(pts, 40), glass());
}

/** Gele waarschuwingstape: ‘nog niet af’. */
function tape(len: number): Mesh {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6d781";
  g.fillRect(0, 0, 256, 32);
  g.fillStyle = "#2f3a66";
  for (let x = -32; x < 288; x += 32) {
    g.beginPath();
    g.moveTo(x, 32);
    g.lineTo(x + 16, 32);
    g.lineTo(x + 32, 0);
    g.lineTo(x + 16, 0);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  t.repeat.set(len / 1.2, 1);
  return new Mesh(new PlaneGeometry(len, 0.14), new MeshStandardMaterial({ map: t, roughness: 0.6, side: DoubleSide }));
}

function screw(): Group {
  const g = new Group();
  const head = roundCyl(0.06, 0.03, 0.01, metal());
  const shaft = new Mesh(new CylinderGeometry(0.02, 0.015, 0.18, 12), metal());
  shaft.position.y = -0.09;
  g.add(head, shaft);
  return g;
}

function bulb(color = 0xfff3c4): Group {
  const g = new Group();
  const glassBall = sphere(0.32, new MeshStandardMaterial({ color, roughness: 0.12, emissive: color, emissiveIntensity: 0.25, transparent: true, opacity: 0.88 }));
  glassBall.position.y = 0.52;
  const neck = roundCyl(0.16, 0.2, 0.04, mat(color));
  neck.position.y = 0.2;
  const base = new Group();
  for (let i = 0; i < 4; i++) {
    const ring = new Mesh(new TorusGeometry(0.13, 0.025, 8, 24), metal());
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05 + i * 0.045;
    base.add(ring);
  }
  const tip = sphere(0.06, mat(PAL.nacht));
  tip.position.y = 0.0;
  g.add(glassBall, neck, base, tip);
  return g;
}

// ---------- Zaal 1: objecten op sokkels ----------

function exhibit(id: string): Built {
  const root = new Group();
  const p = pedestal();
  root.add(p);
  const top = new Group();
  top.position.y = 0.8;
  top.scale.setScalar(1.3);
  root.add(top);
  switch (id) {
    case "uitstel-app": {
      // een reuzentelefoon met een sluimerknop en een wekker die nooit afgaat
      const phone = box(0.62, 1.1, 0.12, 0.12, mat(PAL.nacht, { gloss: 0.4 }));
      phone.position.set(0, 0.62, 0);
      phone.rotation.x = -0.08;
      const screen = box(0.52, 0.92, 0.02, 0.06, mat(PAL.blauw, { emissive: PAL.blauw, emissiveIntensity: 0.25 }));
      screen.position.set(0, 0.64, 0.06);
      screen.rotation.x = -0.08;
      const clock = new Mesh(new CylinderGeometry(0.2, 0.2, 0.03, 40), new MeshStandardMaterial({ map: dialTexture("LATER"), roughness: 0.5 }));
      clock.rotation.x = Math.PI / 2 - 0.08;
      clock.position.set(0, 0.78, 0.085);
      const snooze = box(0.36, 0.12, 0.03, 0.05, mat(PAL.roze, { gloss: 0.4 }));
      snooze.position.set(0, 0.36, 0.085);
      snooze.rotation.x = -0.08;
      const stand = box(0.3, 0.1, 0.4, 0.04, mat(PAL.lila));
      stand.position.set(0, 0.05, -0.05);
      const bell = sphere(0.12, mat(PAL.boter, { metal: 0.5 }));
      bell.scale.y = 0.75;
      bell.position.set(0.24, 1.22, 0);
      top.add(phone, screen, clock, snooze, stand, bell);
      break;
    }
    case "zelfvouwende-was": {
      // stapel gevouwen handdoeken; de bovenste vouwt zichzelf (half) op
      [PAL.mint, PAL.roze, PAL.blauw, PAL.boter].forEach((c, i) => {
        const towel = box(0.8, 0.14, 0.56, 0.06, mat(c, { gloss: 0.05 }), 6);
        towel.position.set((i % 2) * 0.03 - 0.015, 0.07 + i * 0.145, 0);
        towel.rotation.y = (i - 1.5) * 0.06;
        top.add(towel);
      });
      const hinge = new Group();
      hinge.position.set(0, 0.66, -0.02);
      const half = box(0.8, 0.05, 0.28, 0.025, mat(PAL.lila, { gloss: 0.05 }), 6);
      half.position.z = -0.14;
      hinge.add(half);
      hinge.rotation.x = 1.0;
      const flat = box(0.8, 0.05, 0.28, 0.025, mat(PAL.lila, { gloss: 0.05 }), 6);
      flat.position.set(0, 0.64, 0.14);
      // een klein mechanisch armpje helpt een handje
      const armBase = roundCyl(0.08, 0.06, 0.02, metal());
      armBase.position.set(0.5, 0, 0.2);
      const arm = pipe([new Vector3(0.5, 0.05, 0.2), new Vector3(0.5, 0.75, 0.2), new Vector3(0.25, 0.85, 0.05)], 0.03, metal(), 0.15, false);
      top.add(hinge, flat, armBase, arm);
      break;
    }
    case "gedachtenspiegel": {
      // ronde achteruitkijkspiegel op een standaard, met gedachtebelletjes erachter
      const post = roundCyl(0.05, 0.75, 0.02, metal());
      const foot = roundCyl(0.28, 0.08, 0.03, mat(PAL.lila));
      const frame = new Mesh(new TorusGeometry(0.42, 0.07, 16, 48), mat(PAL.lilaDiep, { gloss: 0.4 }));
      frame.position.y = 1.1;
      const mirror = new Mesh(new CylinderGeometry(0.42, 0.42, 0.03, 48), new MeshStandardMaterial({ color: 0xdfe9f7, metalness: 0.55, roughness: 0.12, emissive: 0xb9cbe6, emissiveIntensity: 0.25 }));
      mirror.rotation.x = Math.PI / 2;
      mirror.position.y = 1.1;
      const head = new Group();
      head.add(frame, mirror);
      head.rotation.y = -0.4;
      [
        [-0.45, 1.55, -0.3, 0.07],
        [-0.3, 1.7, -0.35, 0.1],
        [-0.05, 1.86, -0.4, 0.14],
      ].forEach(([x, y, z, r]) => {
        const b = sphere(r, mat(PAL.creme, { gloss: 0.2 }));
        b.position.set(x, y, z);
        top.add(b);
      });
      top.add(post, foot, head);
      break;
    }
    case "vergaderzandloper": {
      const h = 1.1;
      const glassBody = hourglassGlass(0.34, h);
      glassBody.position.y = 0.12;
      const capT = roundCyl(0.46, 0.1, 0.04, mat(PAL.nacht, { gloss: 0.3 }));
      capT.position.y = 0.12 + h;
      const capB = roundCyl(0.46, 0.12, 0.04, mat(PAL.nacht, { gloss: 0.3 }));
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        const rod = roundCyl(0.03, h, 0.01, metal());
        rod.position.set(Math.cos(a) * 0.4, 0.12, Math.sin(a) * 0.4);
        top.add(rod);
      }
      // zand: boven bijna vol (de vergadering is net begonnen)
      const sandTop = new Mesh(new CylinderGeometry(0.06, 0.26, 0.3, 32), mat(PAL.boter));
      sandTop.position.y = 0.12 + h * 0.66;
      const sandBot = new Mesh(new CylinderGeometry(0.02, 0.2, 0.08, 32), mat(PAL.boter));
      sandBot.position.y = 0.17;
      top.add(glassBody, capT, capB, sandTop, sandBot);
      break;
    }
    case "idee-rem":
    default: {
      // een gloeilamp met een remklauw erop
      const b = bulb();
      b.scale.setScalar(1.25);
      b.position.y = 0.05;
      const disc = new Mesh(new CylinderGeometry(0.5, 0.5, 0.06, 48), metal());
      disc.rotation.x = Math.PI / 2;
      disc.position.set(0, 0.7, -0.12);
      const caliper = box(0.3, 0.36, 0.3, 0.08, mat(PAL.rood, { gloss: 0.5 }));
      caliper.position.set(0.38, 0.95, -0.12);
      const wire = cable([new Vector3(0.45, 1.05, -0.12), new Vector3(0.6, 1.2, 0), new Vector3(0.55, 0.3, 0.3), new Vector3(0.4, 0.02, 0.4)], 0.025, PAL.nacht);
      top.add(disc, b, caliper, wire);
      break;
    }
  }
  return { root, cam: { az: 0.55, el: 0.3, fov: 26, pad: 1.0 } };
}

// ---------- Zaal 2: bijna afgemaakte machines ----------

function unfinished(id: string): Built {
  const root = new Group();
  // werkplaatsvloer: een plaat met tape eromheen
  const floor = box(2.9, 0.08, 2.0, 0.04, mat(PAL.papier));
  floor.position.y = 0.04;
  root.add(floor);
  const t1 = tape(2.7);
  t1.rotation.x = -Math.PI / 2;
  t1.position.set(0, 0.085, 0.88);
  root.add(t1);
  // losse onderdelen naast het object
  const g1 = gear(8, 0.22, 0.06, mat(PAL.boter, { gloss: 0.3 }));
  g1.rotation.x = -Math.PI / 2;
  g1.position.set(1.05, 0.12, 0.55);
  const s1 = screw();
  s1.rotation.z = Math.PI / 2;
  s1.position.set(0.8, 0.12, 0.7);
  const s2 = screw();
  s2.rotation.z = Math.PI / 2.3;
  s2.position.set(1.2, 0.12, 0.75);
  root.add(g1, s1, s2);
  const obj = new Group();
  obj.position.y = 0.08;
  obj.scale.setScalar(1.15);
  root.add(obj);
  switch (id) {
    case "schuurtje": {
      // schuurtje met één wand nog los ertegenaan
      const wallMat = mat(PAL.blauw, { gloss: 0.1 });
      const back = box(1.6, 1.2, 0.08, 0.03, wallMat);
      back.position.set(0, 0.6, -0.6);
      const side = box(0.08, 1.2, 1.2, 0.03, wallMat);
      side.position.set(-0.8, 0.6, 0);
      const roofShape = new Shape();
      roofShape.moveTo(-0.95, 0);
      roofShape.lineTo(0, 0.55);
      roofShape.lineTo(0.95, 0);
      roofShape.closePath();
      const roofGeo = new ExtrudeGeometry(roofShape, { depth: 1.4, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
      roofGeo.translate(0, 0, -0.7);
      const roof = new Mesh(roofGeo, mat(PAL.roze, { gloss: 0.2 }));
      roof.position.y = 1.2;
      const loose = box(0.08, 1.2, 1.2, 0.03, wallMat);
      loose.position.set(1.2, 0.58, -0.1);
      loose.rotation.z = -0.22;
      const crate = box(0.42, 0.34, 0.36, 0.04, mat(PAL.boter));
      crate.position.set(-0.3, 0.17, -0.2);
      const crate2 = box(0.3, 0.26, 0.3, 0.04, mat(PAL.mint));
      crate2.position.set(0.15, 0.13, -0.3);
      obj.add(back, side, roof, loose, crate, crate2);
      break;
    }
    case "fotoalbum": {
      // een open album met lege pagina's naast een torenhoge stapel losse foto's
      const left = box(0.9, 0.06, 1.1, 0.03, mat(PAL.creme));
      left.position.set(-0.47, 0.04, 0);
      left.rotation.z = 0.06;
      const right = box(0.9, 0.06, 1.1, 0.03, mat(PAL.creme));
      right.position.set(0.47, 0.04, 0);
      right.rotation.z = -0.06;
      const cover = box(1.96, 0.04, 1.18, 0.02, mat(PAL.lilaDiep));
      cover.position.y = 0.0;
      const slot = box(0.5, 0.01, 0.36, 0.01, mat(PAL.papier));
      slot.position.set(-0.47, 0.08, -0.2);
      obj.add(cover, left, right, slot);
      const colors = [PAL.roze, PAL.blauw, PAL.boter, PAL.mint, PAL.lila];
      for (let i = 0; i < 22; i++) {
        const ph = box(0.42, 0.018, 0.32, 0.01, mat(i % 3 ? 0xffffff : colors[i % 5], { gloss: 0.3 }));
        ph.position.set(0.95 + Math.sin(i * 1.7) * 0.04, 0.02 + i * 0.022, -0.55 + Math.cos(i * 2.3) * 0.04);
        ph.rotation.y = Math.sin(i * 0.9) * 0.3;
        root.add(ph);
      }
      break;
    }
    case "handleiding": {
      // één A4'tje op een klembord tegen een kistje, met een potlood dat nooit verder kwam dan hoofdstuk 1
      const crate = box(0.9, 0.5, 0.5, 0.05, mat(PAL.blauw));
      crate.position.set(0, 0.25, -0.45);
      const clip = new Group();
      clip.position.set(0, 0.68, -0.08);
      clip.rotation.x = -0.42;
      const board = box(1.0, 1.35, 0.05, 0.04, mat(PAL.boterDiep));
      const sheet = box(0.86, 1.15, 0.02, 0.01, mat(0xfffdf8));
      sheet.position.set(0, -0.05, 0.035);
      const clamp = box(0.42, 0.12, 0.08, 0.03, metal());
      clamp.position.set(0, 0.62, 0.05);
      clip.add(board, sheet, clamp);
      [0.6, 0.5, 0.38, 0.26].forEach((wl, i) => {
        const line = box(wl, 0.035, 0.02, 0.01, mat(i === 0 ? PAL.nacht : PAL.blauwDiep));
        line.position.set(-0.36 + wl / 2, 0.38 - i * 0.12, 0.05);
        clip.add(line);
      });
      const pencil = new Group();
      const wood = new Mesh(new CylinderGeometry(0.04, 0.04, 0.8, 6), mat(PAL.boter));
      const tip = new Mesh(new CylinderGeometry(0.0, 0.04, 0.12, 6), mat(PAL.creme));
      tip.position.y = -0.46;
      const eraser = roundCyl(0.042, 0.08, 0.01, mat(PAL.roze));
      eraser.position.y = 0.4;
      pencil.add(wood, tip, eraser);
      pencil.rotation.set(0, 0.4, Math.PI / 2);
      pencil.position.set(0.15, 0.06, 0.55);
      obj.add(crate, clip, pencil);
      break;
    }
    case "moestuin":
    default: {
      // een moestuinbak met kiemplantjes en een sproeirobot die nog geen water heeft
      const bed = box(1.7, 0.4, 1.0, 0.06, mat(PAL.roze, { gloss: 0.15 }));
      bed.position.y = 0.2;
      const soil = box(1.56, 0.06, 0.86, 0.03, mat(0x7a645c));
      soil.position.y = 0.39;
      obj.add(bed, soil);
      for (let i = 0; i < 5; i++) {
        const sprout = new Group();
        const stem = roundCyl(0.015, 0.16 + (i % 3) * 0.06, 0.005, mat(PAL.mintDiep));
        const leaf = sphere(0.06, mat(PAL.mint), 12);
        leaf.scale.set(1, 0.35, 0.6);
        leaf.position.y = 0.16 + (i % 3) * 0.06;
        sprout.add(stem, leaf);
        sprout.position.set(-0.6 + i * 0.3, 0.42, (i % 2) * 0.2 - 0.1);
        obj.add(sprout);
      }
      const robot = new Group();
      robot.position.set(0.9, 0, 0.55);
      const rBody = box(0.36, 0.42, 0.3, 0.1, mat(PAL.mint, { gloss: 0.3 }));
      rBody.position.y = 0.35;
      const wheelL = roundCyl(0.09, 0.06, 0.02, mat(PAL.nacht));
      wheelL.rotation.z = Math.PI / 2;
      wheelL.position.set(-0.2, 0.09, 0);
      const wheelR = wheelL.clone();
      wheelR.position.x = 0.2;
      const can = pipe([new Vector3(0, 0.5, 0), new Vector3(0, 0.75, 0), new Vector3(-0.35, 0.85, -0.2)], 0.03, metal(), 0.12, false);
      const rose = funnel(0.08, 0.03, 0.08, 0.02, metal());
      rose.position.set(-0.38, 0.8, -0.22);
      rose.rotation.z = 2.2;
      robot.add(rBody, wheelL, wheelR, can, rose);
      root.add(robot);
      break;
    }
  }
  return { root, cam: { az: 0.6, el: 0.42, fov: 28, pad: 0.92 } };
}

// ---------- Zaal 3: het domeinarchief ----------

function archive(): Built {
  const root = new Group();
  const W = 2.6;
  const cab = box(W, 2.2, 1.2, 0.12, mat(PAL.blauw, { gloss: 0.2 }));
  cab.position.y = 1.1;
  root.add(cab);
  const drawers: Mesh[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const d = box(0.74, 0.56, 0.12, 0.06, mat([PAL.creme, PAL.boter, PAL.roze][(r + c) % 3], { gloss: 0.2 }));
      d.position.set(-0.84 + c * 0.84, 0.42 + r * 0.66, 0.62);
      const handle = box(0.24, 0.05, 0.06, 0.02, metal());
      handle.position.set(0, -0.08, 0.08);
      d.add(handle);
      const label = box(0.3, 0.12, 0.02, 0.01, mat(0xfffdf8));
      label.position.set(0, 0.12, 0.065);
      d.add(label);
      root.add(d);
      drawers.push(d);
    }
  }
  // één la staat open, met kaartjes erin
  const open = drawers[4];
  open.position.z += 0.45;
  for (let i = 0; i < 6; i++) {
    const card = box(0.6, 0.36, 0.02, 0.01, mat(i % 2 ? 0xfffdf8 : PAL.papier));
    card.position.set(0, 0.12, -0.32 + i * 0.07);
    card.rotation.x = -0.15;
    open.add(card);
  }
  // invoer bovenop: een gleuf met een korte band en een sorteerarm
  const intake = box(1.1, 0.34, 0.7, 0.08, mat(PAL.nacht, { gloss: 0.3 }));
  intake.position.set(-0.55, 2.38, 0);
  root.add(intake);
  const slot = box(0.7, 0.06, 0.06, 0.02, mat(0x11152a));
  slot.position.set(-0.55, 2.56, 0.12);
  root.add(slot);
  const belt = conveyor(1.6, 0.42, 0.3);
  belt.position.set(0.45, 2.2, 0.15);
  root.add(belt);
  const arm = new Group();
  arm.position.set(1.0, 2.2, -0.35);
  const col = roundCyl(0.07, 0.75, 0.02, metal());
  arm.add(col);
  const boom = pipe([new Vector3(0, 0.75, 0), new Vector3(0, 0.85, 0.4), new Vector3(-0.15, 0.6, 0.5)], 0.04, mat(PAL.lila), 0.12, false);
  arm.add(boom);
  const stamp = roundCyl(0.12, 0.1, 0.03, mat(PAL.roze));
  stamp.position.set(-0.15, 0.5, 0.5);
  arm.add(stamp);
  root.add(arm);
  const tray = box(0.9, 0.08, 0.6, 0.04, mat(PAL.lila));
  tray.position.set(-0.55, 2.62, 0.75);
  tray.rotation.x = 0.4;
  root.add(tray);
  const lampA = lamp(0.07, PAL.mint);
  lampA.position.set(0.9, 2.2, 0.55);
  lampA.setOn(0.8);
  root.add(lampA);
  return {
    root,
    cam: { az: 0.35, el: 0.28, fov: 28, pad: 0.78 },
    anchors: (stage) => {
      const p = (o: Object3D, dy = 0) => stage.project(o.localToWorld(new Vector3(0, dy, 0)));
      return { slot: p(slot), drawer: p(drawers[7]), open: p(open, 0.2), belt: p(belt, 0.2) };
    },
  };
}

// ---------- Zaal 4: de kleine ideeënmachine (generator) ----------

function mini(): Built {
  const root = new Group();
  const body = box(2.6, 1.7, 1.0, 0.18, mat(PAL.lila, { gloss: 0.2 }));
  body.position.y = 1.05;
  root.add(body);
  const plinth = box(2.8, 0.2, 1.2, 0.08, mat(PAL.nacht));
  plinth.position.y = 0.1;
  root.add(plinth);
  // drie vensters voor de rollen
  const windowFrame = box(2.2, 0.82, 0.08, 0.08, mat(PAL.nacht, { gloss: 0.3 }));
  windowFrame.position.set(0, 1.18, 0.52);
  root.add(windowFrame);
  const win = new Mesh(new PlaneGeometry(2.04, 0.66), new MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.4 }));
  win.position.set(0, 1.18, 0.565);
  root.add(win);
  // trechter bovenop met ideeën
  const hop = funnel(0.42, 0.12, 0.45, 0.12, mat(PAL.mint, { gloss: 0.3 }));
  hop.position.set(-0.75, 1.92, 0);
  root.add(hop);
  [PAL.roze, PAL.boter, PAL.blauw].forEach((c, i) => {
    const b = ball(0.09, c);
    b.position.set(-0.85 + i * 0.1, 2.3, (i - 1) * 0.08);
    root.add(b);
  });
  const g1 = gear(10, 0.32, 0.08, mat(PAL.boter, { gloss: 0.3 }));
  g1.position.set(0.55, 1.98, 0.1);
  root.add(g1);
  const g2 = gear(7, 0.22, 0.08, mat(PAL.roze, { gloss: 0.3 }));
  g2.position.set(0.95, 2.0, 0.1);
  g2.rotation.z = 0.25;
  root.add(g2);
  // hendel rechts
  const hub = roundCyl(0.16, 0.12, 0.04, mat(PAL.nacht));
  hub.rotation.z = -Math.PI / 2;
  hub.position.set(1.32, 1.2, 0.1);
  root.add(hub);
  const arm = pipe([new Vector3(1.42, 1.2, 0.1), new Vector3(1.55, 1.2, 0.1), new Vector3(1.55, 2.05, 0.1)], 0.045, metal(), 0.12, false);
  root.add(arm);
  const knob = sphere(0.15, mat(PAL.rozeDiep, { gloss: 0.45 }));
  knob.position.set(1.55, 2.12, 0.1);
  root.add(knob);
  // uitvoer: een gleuf met een kaartje
  const out = box(1.0, 0.1, 0.4, 0.04, mat(PAL.nacht));
  out.position.set(0, 0.5, 0.62);
  root.add(out);
  const t = ticket(PAL.roze);
  t.position.set(0, 0.48, 0.85);
  t.rotation.x = 0.5;
  root.add(t);
  const lamps = [PAL.mint, PAL.boter, PAL.roze].map((c, i) => {
    const l = lamp(0.06, c);
    l.position.set(-0.95 + i * 0.22, 1.9, 0.35);
    l.setOn(i === 0 ? 0.9 : 0.2);
    root.add(l);
    return l;
  });
  void lamps;
  return {
    root,
    cam: { az: 0.12, el: 0.2, fov: 26, pad: 0.64 },
    anchors: (stage) => {
      const hw = 1.02;
      const hh = 0.33;
      const c = [
        [-hw, hh],
        [hw, hh],
        [-hw, -hh],
        [hw, -hh],
      ].map(([x, y]) => stage.project(win.localToWorld(new Vector3(x, y, 0))));
      return { window: c, lever: stage.project(knob.localToWorld(new Vector3())), out: stage.project(t.localToWorld(new Vector3())) };
    },
  };
}

// ---------- Zaal 5: kinetische installatie (lagen voor 2.5D-beweging) ----------

function kinetic(layer: string): Built {
  const root = new Group();
  const frameMat = mat(PAL.nacht, { gloss: 0.3 });
  if (layer === "frame") {
    const base = box(3.6, 0.2, 0.8, 0.08, frameMat);
    base.position.y = 0.1;
    root.add(base);
    const left = roundCyl(0.07, 2.9, 0.02, metal());
    left.position.set(-1.6, 0.2, 0);
    const right = left.clone();
    right.position.x = 1.6;
    const beam = new Mesh(new CylinderGeometry(0.07, 0.07, 3.2, 16), metal());
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 3.1;
    root.add(left, right, beam);
    // as voor het wiel en ophangpunt voor de slinger
    const axle = roundCyl(0.12, 0.3, 0.04, mat(PAL.roze));
    axle.rotation.x = Math.PI / 2;
    axle.position.set(-0.7, 1.7, -0.1);
    const hook = roundCyl(0.08, 0.16, 0.03, mat(PAL.boter));
    hook.position.set(0.85, 3.0, 0);
    root.add(axle, hook);
    // een baan met ballen onderin
    const track = pipe([new Vector3(-1.5, 0.45, 0.2), new Vector3(1.5, 0.45, 0.2)], 0.04, mat(PAL.lila), 0.1, false);
    root.add(track);
    [PAL.roze, PAL.boter, PAL.mint].forEach((c, i) => {
      const b = ball(0.13, c);
      b.position.set(-1.1 + i * 0.3, 0.6, 0.2);
      root.add(b);
    });
  } else if (layer === "wheel") {
    const w = gear(14, 0.95, 0.12, mat(PAL.boter, { gloss: 0.3 }));
    w.position.set(-0.7, 1.7, 0.05);
    root.add(w);
    [PAL.roze, PAL.mint, PAL.lila, PAL.blauw].forEach((c, i) => {
      const a = (i / 4) * Math.PI * 2;
      const b = ball(0.14, c);
      b.position.set(-0.7 + Math.cos(a) * 0.62, 1.7 + Math.sin(a) * 0.62, 0.2);
      root.add(b);
    });
  } else if (layer === "pendulum") {
    const rod = roundCyl(0.035, 1.9, 0.01, metal());
    rod.position.set(0.85, 1.1, 0);
    root.add(rod);
    const bob = sphere(0.32, mat(PAL.roze, { gloss: 0.45 }));
    bob.position.set(0.85, 0.98, 0);
    root.add(bob);
    const ringy = new Mesh(new TorusGeometry(0.36, 0.05, 12, 40), mat(PAL.lila));
    ringy.position.set(0.85, 0.98, 0);
    ringy.rotation.y = 0.6;
    root.add(ringy);
  }
  return {
    root,
    cam: { az: 0, el: 0.08, fov: 18, pad: 1.0, target: new Vector3(0, 1.6, 0) },
    anchors: (stage) => ({ wheel: stage.project(new Vector3(-0.7, 1.7, 0.05)), hook: stage.project(new Vector3(0.85, 3.0, 0)) }),
  };
}

// ---------- Zaal 6: de donkere zaal ----------

function darkroom(): Built {
  const root = new Group();
  const wallMat = mat(0x3b4270);
  const floor = box(24, 0.1, 14, 0.02, mat(0x343a63));
  floor.position.set(2, -0.05, 2);
  const back = box(24, 8, 0.2, 0.02, wallMat);
  back.position.set(2, 4, -3.5);
  const side = box(0.2, 8, 14, 0.02, wallMat);
  side.position.set(-6, 4, 2);
  root.add(floor, back, side);
  // lijsten aan de muur: leeg (‘uitgeleend’)
  [-3.6, -0.6, 2.6].forEach((x, i) => {
    const frame = box(1.5, 1.1, 0.08, 0.04, mat(PAL.boterDiep, { metal: 0.5 }));
    frame.position.set(x, 2.7, -3.35);
    const inner = box(1.25, 0.85, 0.06, 0.02, mat(i === 1 ? 0x2a2f55 : 0x30365f));
    inner.position.set(x, 2.7, -3.3);
    root.add(frame, inner);
  });
  // het enige afgemaakte object op een sokkel
  const p = pedestal(1.1, 1.1);
  p.position.set(2.6, 0, -0.6);
  root.add(p);
  const done = star(0.38, 0.12, PAL.boter);
  done.position.set(2.6, 1.6, -0.6);
  done.rotation.y = -0.4;
  root.add(done);
  const rope = pipe([new Vector3(1.4, 0.6, 0.6), new Vector3(3.8, 0.6, 0.6)], 0.03, mat(PAL.rood), 0.1, false);
  const postA = roundCyl(0.06, 0.65, 0.02, mat(PAL.boterDiep, { metal: 0.6 }));
  postA.position.set(1.4, 0, 0.6);
  const postB = postA.clone();
  postB.position.x = 3.8;
  root.add(rope, postA, postB);
  return {
    root,
    cam: { az: 0.12, el: 0.18, fov: 34, pad: 0.62, target: new Vector3(0.6, 1.6, -0.8) },
    anchors: (stage) => ({ object: stage.project(new Vector3(2.6, 1.3, -0.6)) }),
  };
}

// ---------- Afdelingsobjecten en hero-vormen ----------

function dept(kind: string): Built {
  const root = new Group();
  switch (kind) {
    case "knop": {
      const base = roundCyl(0.9, 0.36, 0.1, mat(PAL.boter, { gloss: 0.3 }));
      const ring = roundCyl(0.66, 0.16, 0.05, mat(PAL.nacht, { gloss: 0.3 }));
      ring.position.y = 0.36;
      const cap = roundCyl(0.56, 0.32, 0.14, mat(PAL.rood, { gloss: 0.55 }));
      cap.position.y = 0.46;
      root.add(base, ring, cap);
      break;
    }
    case "sokkel": {
      const p = pedestal(1.1, 0.9);
      root.add(p);
      const s = star(0.36, 0.12, PAL.roze);
      s.position.set(0, 1.4, 0);
      s.rotation.y = -0.5;
      root.add(s);
      break;
    }
    case "lamp": {
      const base = roundCyl(0.55, 0.12, 0.04, mat(PAL.nacht, { gloss: 0.3 }));
      const arm = pipe([new Vector3(0, 0.1, 0), new Vector3(0, 1.1, 0.1), new Vector3(0.65, 1.55, 0.1)], 0.05, mat(PAL.blauw, { gloss: 0.3 }), 0.25, false);
      const shade = funnel(0.12, 0.42, 0.45, 0.04, mat(PAL.boter, { gloss: 0.3 }));
      shade.rotation.z = Math.PI + 0.6;
      shade.position.set(0.72, 1.62, 0.1);
      const b = sphere(0.14, new MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffe28a, emissiveIntensity: 0.9 }));
      b.position.set(0.88, 1.38, 0.1);
      root.add(base, arm, shade, b);
      break;
    }
    case "ticket": {
      const body = box(0.9, 1.3, 0.7, 0.16, mat(PAL.mint, { gloss: 0.25 }));
      body.position.y = 0.65;
      const disp = box(0.56, 0.24, 0.05, 0.05, mat(PAL.nacht));
      disp.position.set(0, 1.0, 0.36);
      const slot = box(0.5, 0.05, 0.06, 0.02, mat(0x11152a));
      slot.position.set(0, 0.55, 0.36);
      const t = box(0.38, 0.5, 0.02, 0.02, mat(0xfffdf8));
      t.position.set(0, 0.32, 0.46);
      t.rotation.x = 0.35;
      const btn = roundCyl(0.09, 0.06, 0.02, mat(PAL.rood, { gloss: 0.5 }));
      btn.rotation.x = Math.PI / 2;
      btn.position.set(0.28, 0.8, 0.36);
      root.add(body, disp, slot, t, btn);
      break;
    }
    case "certificaat": {
      const roll = new Mesh(new CylinderGeometry(0.22, 0.22, 1.5, 40), mat(0xfffdf8, { gloss: 0.2 }));
      roll.rotation.z = Math.PI / 2;
      roll.position.y = 0.3;
      const band = new Mesh(new TorusGeometry(0.235, 0.04, 10, 40), mat(PAL.roze));
      band.rotation.y = Math.PI / 2;
      band.position.set(0.1, 0.3, 0);
      const seal = roundCyl(0.2, 0.06, 0.02, mat(PAL.boterDiep, { metal: 0.6 }));
      seal.rotation.x = Math.PI / 2;
      seal.position.set(0.1, 0.24, 0.24);
      const sheet = box(1.1, 0.02, 0.8, 0.01, mat(0xfffdf8));
      sheet.position.set(0, 0.01, 0.55);
      sheet.rotation.y = 0.05;
      root.add(roll, band, seal, sheet);
      break;
    }
    case "planeet": {
      const planet = sphere(0.7, mat(PAL.lila, { gloss: 0.3 }), 48);
      planet.position.y = 1.0;
      const ring = new Mesh(new TorusGeometry(1.05, 0.06, 12, 64), mat(PAL.boter, { gloss: 0.3 }));
      ring.position.y = 1.0;
      ring.rotation.set(1.2, 0.3, 0.2);
      const moon = sphere(0.14, mat(PAL.roze));
      moon.position.set(-1.0, 1.6, 0.3);
      root.add(planet, ring, moon);
      break;
    }
    // hero-vormen
    case "bal":
      root.add(sphere(0.5, mat(PAL.roze, { gloss: 0.45 }), 48));
      break;
    case "ring": {
      const r = new Mesh(new TorusGeometry(0.42, 0.16, 24, 64), mat(PAL.lila, { gloss: 0.4 }));
      r.rotation.set(0.5, 0.4, 0);
      root.add(r);
      break;
    }
    case "ster": {
      const s = star(0.5, 0.18, PAL.boter);
      s.rotation.set(-0.2, 0.4, 0.1);
      root.add(s);
      break;
    }
    case "pil": {
      const c = capsuleMesh(0.22, 0.7, PAL.blauw, PAL.mint);
      c.rotation.z = Math.PI / 2.6;
      root.add(c);
      break;
    }
    case "kronkel":
    default: {
      const pts: Vector3[] = [];
      for (let i = 0; i <= 40; i++) pts.push(new Vector3(-0.9 + i * 0.045, Math.sin(i * 0.47) * 0.16, 0));
      root.add(cable(pts, 0.07, PAL.mint));
      break;
    }
  }
  const floating = ["bal", "ring", "ster", "pil", "kronkel"].includes(kind);
  return { root, cam: { az: 0.5, el: floating ? 0.25 : 0.42, fov: 24, pad: floating ? 1.15 : 1.12 } };
}

// ---------- Studio ----------

function fit(stage: Stage, root: Group, cam: NonNullable<Built["cam"]>) {
  const bb = new Box3().setFromObject(root);
  const center = cam.target ?? bb.getCenter(new Vector3());
  const size = bb.getSize(new Vector3());
  const r = size.length() / 2;
  const fov = cam.fov ?? 26;
  const dist = (r / Math.sin(((fov / 2) * Math.PI) / 180)) * (cam.pad ?? 1.1);
  const az = cam.az ?? 0.5;
  const el = cam.el ?? 0.4;
  stage.setCamera({
    pos: [center.x + Math.sin(az) * Math.cos(el) * dist, center.y + Math.sin(el) * dist, center.z + Math.cos(az) * Math.cos(el) * dist],
    target: [center.x, center.y, center.z],
    fov,
  });
}

declare global {
  interface Window {
    __output?: HTMLCanvasElement;
  }
}

export async function renderObject(canvas: HTMLCanvasElement, w: number, h: number, name: string, params: URLSearchParams): Promise<void> {
  const [kind, id = ""] = name.split(":");
  const built: Built =
    kind === "stuk" ? exhibit(id) : kind === "bijna" ? unfinished(id) : kind === "archief" ? archive() : kind === "mini" ? mini() : kind === "kinetisch" ? kinetic(id) : kind === "donker" ? darkroom() : dept(id);
  const dark = kind === "donker";
  const stage = createStage({ canvas, width: w, height: h, preserve: true, pixelRatio: 1, shadowArea: kind === "donker" ? 8 : 4, shadowSize: 2048 });
  stage.scene.add(built.root);
  built.root.traverse((o) => {
    if ((o as Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  if (dark) {
    // gedempt licht: de zaklamp op de pagina doet de rest
    stage.scene.environmentIntensity = 0.25;
    stage.scene.traverse((o) => {
      const l = o as Object3D & { isLight?: boolean; intensity?: number };
      if (l.isLight && l.intensity !== undefined) l.intensity *= 0.55;
    });
  }
  const floating = kind === "afd" && ["bal", "ring", "ster", "pil", "kronkel"].includes(id);
  if (floating || kind === "kinetisch") {
    // zwevende vormen en losse lagen: geen vloerschaduw
    stage.scene.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && (m.material as { type?: string }).type === "ShadowMaterial") m.visible = false;
    });
  }
  fit(stage, built.root, built.cam ?? {});
  if (kind === "kinetisch") {
    // alle lagen met dezelfde camera, zodat ze precies op elkaar passen
    stage.setCamera({ pos: [0, 2.0, 14], target: [0, 1.6, 0], fov: 17 });
  }
  const frames = Number(params.get("frames") ?? 0);
  if (frames > 1) {
    // draaiplateau: een strook met beelden rondom
    const out = document.createElement("canvas");
    out.width = w * frames;
    out.height = h;
    const g = out.getContext("2d")!;
    for (let i = 0; i < frames; i++) {
      built.root.rotation.y = (i / frames) * Math.PI * 2;
      stage.render();
      g.drawImage(canvas, i * w, 0, w, h);
    }
    window.__output = out;
  } else {
    stage.render();
  }
  if (built.anchors) window.__anchors = built.anchors(stage);
}
