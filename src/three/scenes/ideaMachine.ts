// FIG. 1 in drie dimensies: de grote ideeënmachine.
// Elke beweging heeft een mechanische oorzaak: een idee valt uit de trechter, rolt door de glazen buis
// naar de verwerker (tandwielen draaien, de meter slaat uit), gaat via een tweede buis naar de band,
// wordt door de sorteerarm gekeurd en daarna gestempeld of afgevoerd naar de afkeurbak.
// Goedgekeurde ideeën rijden door de boog naar het uitvoerplatform.

import { Group, Mesh, MeshStandardMaterial, TorusGeometry, Vector3, type Object3D } from "three";
import { createStage, easing, tween, wait, type CameraSpec, type Stage } from "../engine";
import type { MachineLayout } from "../machineInfo";
import {
  ball,
  box,
  cable,
  conveyor,
  fanArch,
  funnel,
  gauge,
  gear,
  glassPipe,
  lamp,
  mat,
  metal,
  PAL,
  pillSwitch,
  pipe,
  plant,
  ribbedPlatform,
  ribbedTrack,
  roundCyl,
  shade,
  sphere,
  ticket,
} from "../kit";

export const CAMERAS: Record<MachineLayout, CameraSpec> = {
  wide: { pos: [8.2, 7.6, 12.8], target: [0.8, 1.5, -0.1], fov: 26 },
  compact: { pos: [7.4, 7.6, 10.4], target: [0.95, 1.72, 0], fov: 35 },
};

export type RunOptions = {
  reject?: boolean;
  double?: boolean;
  mega?: boolean;
  gold?: boolean;
  hiccup?: boolean; // korte hapering in de verwerker
  color?: number;
  onVerdict?: (v: "goedgekeurd" | "afgekeurd") => void; // op het moment van stempelen of afvoeren
};

export type MachineController = {
  stage: Stage;
  run: (o: RunOptions) => Promise<"goedgekeurd" | "afgekeurd">;
  jam: () => void;
  restart: () => void;
  nudge: () => void;
  setHeat: (h: number) => void;
  setGold: (on: boolean) => void;
  anchors: () => Record<string, { x: number; y: number }>;
  setCamera: (name: MachineLayout) => void;
  dispose: () => void;
};

const BALL_COLORS = [PAL.roze, PAL.boter, PAL.mint, PAL.lila, PAL.blauw];

export type BuildOptions = { preserve?: boolean; pixelRatio?: number; shadowSize?: number };

export function buildIdeaMachine(canvas: HTMLCanvasElement, width: number, height: number, cameraName: MachineLayout = "wide", opts: BuildOptions = {}): MachineController {
  const stage = createStage({ canvas, width, height, preserve: opts.preserve, pixelRatio: opts.pixelRatio, shadowSize: opts.shadowSize, shadowArea: 8 });
  const { scene } = stage;
  const root = new Group();
  scene.add(root);

  // ---------- A. Invoertrechter op een zuil ----------
  const HOP = new Vector3(-4.0, 0, -1.35);
  // driepoot van lila buizen, zodat de glazen buis vrij zichtbaar naar beneden loopt
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const leg = pipe([new Vector3(HOP.x + Math.cos(a) * 0.62, 0, HOP.z + Math.sin(a) * 0.62), new Vector3(HOP.x + Math.cos(a) * 0.36, 2.02, HOP.z + Math.sin(a) * 0.36)], 0.055, mat(PAL.lila), 0.1, false);
    root.add(leg);
    const foot = roundCyl(0.12, 0.06, 0.02, mat(PAL.lilaDiep));
    foot.position.set(HOP.x + Math.cos(a) * 0.62, 0, HOP.z + Math.sin(a) * 0.62);
    root.add(foot);
  }
  const collar = new Mesh(new TorusGeometry(0.36, 0.06, 12, 40), metal());
  collar.rotation.x = Math.PI / 2;
  collar.position.set(HOP.x, 2.02, HOP.z);
  root.add(collar);
  const hopper = funnel(0.86, 0.2, 0.85, 0.22, mat(PAL.mint, { gloss: 0.3 }));
  hopper.position.set(HOP.x, 2.18, HOP.z);
  root.add(hopper);
  const waiting: Mesh[] = [];
  [
    [-0.25, 0.1, PAL.roze],
    [0.22, -0.12, PAL.boter],
    [0.02, 0.28, PAL.blauw],
    [-0.12, -0.3, PAL.lila],
  ].forEach(([dx, dz, c]) => {
    const b = ball(0.15, c as number);
    b.position.set(HOP.x + (dx as number), 2.98, HOP.z + (dz as number));
    root.add(b);
    waiting.push(b);
  });

  // ---------- B. Glazen buis naar de verwerker ----------
  const tube1 = glassPipe([new Vector3(HOP.x, 1.95, HOP.z), new Vector3(HOP.x, 1.32, HOP.z), new Vector3(-2.95, 1.32, HOP.z)], 0.17, 0.4);
  root.add(tube1);

  // ---------- C. Verwerker met tandwielen, lampjes en meter ----------
  const proc = new Group();
  proc.position.set(-2.1, 0, -1.15);
  root.add(proc);
  const body = box(1.7, 1.9, 1.5, 0.2, mat(PAL.blauw));
  body.position.y = 0.95;
  proc.add(body);
  const plinth = box(1.9, 0.12, 1.7, 0.05, mat(PAL.nacht));
  plinth.position.y = 0.06;
  proc.add(plinth);
  const vent = new Group();
  for (let i = 0; i < 4; i++) {
    const slot = box(0.6, 0.05, 0.06, 0.02, mat(PAL.blauwDiep));
    slot.position.set(0, 1.92, -0.35 + i * 0.13);
    vent.add(slot);
  }
  vent.position.x = 0.35;
  proc.add(vent);
  const gearA = gear(12, 0.55, 0.14, mat(PAL.boter, { gloss: 0.3 }));
  gearA.position.set(-0.25, 1.15, 0.78);
  const gearB = gear(8, 0.36, 0.14, mat(PAL.roze, { gloss: 0.3 }));
  gearB.position.set(0.42, 0.68, 0.8);
  const gearC = gear(6, 0.25, 0.12, mat(PAL.lila, { gloss: 0.3 }));
  gearC.position.set(0.14, 1.78, 0.8);
  proc.add(gearA, gearB, gearC);
  const lamps = [PAL.mint, PAL.boter, PAL.rood].map((c, i) => {
    const l = lamp(0.07, c);
    l.position.set(-0.55 + i * 0.22, 1.9, 0.45);
    proc.add(l);
    return l;
  });
  lamps[0].setOn(0.4);
  const meterPost = roundCyl(0.06, 0.4, 0.02, metal());
  meterPost.position.set(0.48, 1.88, 0.2);
  proc.add(meterPost);
  const meter = gauge(0.34, "IDEEËN/MIN");
  meter.position.set(0.48, 2.5, 0.2);
  meter.rotation.y = 0.45;
  proc.add(meter);
  // geheime schakelaar (gouden modus)
  const secret = new Group();
  const plate = box(0.22, 0.3, 0.06, 0.03, metal());
  secret.add(plate);
  const keyHead = roundCyl(0.07, 0.06, 0.02, mat(PAL.boterDiep, { metal: 0.6 }));
  keyHead.rotation.x = Math.PI / 2;
  keyHead.position.z = 0.04;
  secret.add(keyHead);
  secret.position.set(0.72, 0.3, 0.77);
  secret.rotation.y = 0;
  proc.add(secret);

  // stroomleiding uit het plafond (roze), zoals een echte installatie
  const power = pipe([new Vector3(-0.2, 7.5, -2.1), new Vector3(-0.2, 3.25, -2.1), new Vector3(-2.35, 3.25, -2.1), new Vector3(-2.35, 3.25, -1.55), new Vector3(-2.35, 1.9, -1.55)], 0.13, mat(PAL.roze, { gloss: 0.25 }), 0.45);
  root.add(power);

  // ---------- D. Tweede glazen buis naar de band ----------
  const tube2 = glassPipe([new Vector3(-1.25, 1.12, -0.85), new Vector3(-0.78, 1.12, -0.85), new Vector3(-0.78, 1.12, 0), new Vector3(-0.42, 1.12, 0)], 0.15, 0.35);
  root.add(tube2);

  // ---------- E. Lopende band ----------
  const BELT_X0 = -0.45;
  const BELT_LEN = 4.0;
  const belt = conveyor(BELT_LEN, 0.82, 0.8);
  belt.position.x = BELT_X0 + BELT_LEN / 2;
  root.add(belt);
  const TOP = belt.top + 0.14;

  // ---------- F. Sorteerarm ----------
  const SORT_X = 1.05;
  const sorter = new Group();
  sorter.position.set(SORT_X, 0, -1.05);
  root.add(sorter);
  sorter.add(roundCyl(0.32, 0.22, 0.06, mat(PAL.lilaDiep)));
  const sCol = box(0.24, 1.2, 0.24, 0.08, mat(PAL.lila));
  sCol.position.y = 0.8;
  sorter.add(sCol);
  const yaw = new Group();
  yaw.position.y = 1.42;
  sorter.add(yaw);
  yaw.add(sphere(0.17, metal()));
  const boom = new Group(); // draait om x (omlaag/omhoog)
  yaw.add(boom);
  const boomArm = box(0.2, 0.2, 1.15, 0.08, mat(PAL.lila));
  boomArm.position.z = 0.55;
  boom.add(boomArm);
  const wrist = new Group();
  wrist.position.z = 1.1;
  boom.add(wrist);
  wrist.add(sphere(0.11, metal()));
  const paddle = box(0.56, 0.42, 0.08, 0.04, mat(PAL.boter));
  paddle.position.set(0, -0.3, 0);
  wrist.add(paddle);
  const sensor = lamp(0.05, PAL.mint);
  sensor.position.set(0, -0.12, 0.06);
  sensor.rotation.x = Math.PI / 2;
  wrist.add(sensor);
  boom.rotation.x = 0.35;

  // sorteerbord op stangen: toont de kleur van het idee dat gekeurd wordt
  const board = new Group();
  board.position.set(SORT_X + 0.55, 0, -0.95);
  root.add(board);
  for (const dx of [-0.42, 0, 0.42]) {
    const rod = pipe([new Vector3(dx, 0.85, 0), new Vector3(dx, 2.55, 0), new Vector3(dx, 2.55, 0.45)], 0.03, mat(PAL.boterDiep, { metal: 0.4 }), 0.12, false);
    board.add(rod);
  }
  const panel = box(1.1, 0.72, 0.06, 0.04, mat(PAL.creme));
  panel.position.set(0, 2.0, 0.02);
  board.add(panel);
  const dots: MeshStandardMaterial[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const dm = new MeshStandardMaterial({ color: [PAL.roze, PAL.mint, PAL.boter, PAL.lila][(r + c) % 4], roughness: 0.4, emissive: 0x000000 });
      const d = sphere(0.075, dm, 16);
      d.scale.z = 0.4;
      d.position.set(-0.36 + c * 0.24, 1.87 + r * 0.26, 0.07);
      board.add(d);
      dots.push(dm);
    }
  }

  // ---------- G. Afkeurbak ----------
  const BIN = new Vector3(SORT_X + 0.1, 0, 1.25);
  const bin = new Group();
  bin.position.copy(BIN);
  root.add(bin);
  const binBody = box(0.78, 0.62, 0.62, 0.08, mat(PAL.blauwDiep));
  binBody.position.y = 0.31;
  bin.add(binBody);
  const binHole = box(0.62, 0.04, 0.46, 0.04, mat(PAL.nacht));
  binHole.position.y = 0.625;
  bin.add(binHole);
  const lid = new Group();
  lid.position.set(0, 0.64, -0.3);
  const lidPlate = box(0.8, 0.06, 0.64, 0.03, mat(PAL.blauw));
  lidPlate.position.z = 0.32;
  lid.add(lidPlate);
  lid.rotation.x = -0.32;
  bin.add(lid);

  // ---------- H. Stempelpers over de band ----------
  const STAMP_X = 2.35;
  const press = new Group();
  press.position.set(STAMP_X, 0, 0);
  root.add(press);
  const pCol = box(0.32, 2.1, 0.32, 0.1, mat(PAL.nacht));
  pCol.position.set(0, 1.05, -0.95);
  press.add(pCol);
  const pArm = box(0.34, 0.28, 1.2, 0.1, mat(PAL.nacht));
  pArm.position.set(0, 2.0, -0.45);
  press.add(pArm);
  const ram = new Group();
  ram.position.y = 1.86;
  press.add(ram);
  const rod = roundCyl(0.06, 0.55, 0.02, metal());
  rod.position.y = -0.55;
  ram.add(rod);
  const head = roundCyl(0.24, 0.2, 0.06, mat(PAL.roze, { gloss: 0.3 }));
  head.position.y = -0.72;
  ram.add(head);
  const inkPad = box(0.3, 0.04, 0.3, 0.02, mat(PAL.rozeDiep));
  inkPad.position.y = -0.74;
  ram.add(inkPad);
  const STAMP_UP = 1.86;
  const STAMP_DOWN = TOP + 0.6;

  // ---------- I. Uitvoerstation: boog en ribbelplatform ----------
  const OUT = new Vector3(4.55, 0, 0);
  const outArch = fanArch(1.2, 1.35, 0.22, mat(PAL.boter, { gloss: 0.2 }), mat(PAL.boterDiep, { gloss: 0.2 }));
  outArch.position.set(BELT_X0 + BELT_LEN + 0.2, 0, 0);
  outArch.rotation.y = Math.PI / 2;
  root.add(outArch);
  const platform = ribbedPlatform(1.1, 1.2, 0.2, mat(PAL.boter), mat(PAL.boterDiep));
  platform.position.copy(OUT);
  root.add(platform);
  const outLamp = lamp(0.12, PAL.boter);
  outLamp.position.set(OUT.x + 0.42, 0.2, -0.45);
  root.add(outLamp);

  // geribbelde baan onder verwerker en band: alles staat op één ondergrond (stijlanker)
  const track = ribbedTrack(6.2, 2.9, 0.05);
  track.position.set(0.2, 0, -0.55);
  root.add(track);
  // een paar geaarde details, zoals op de referentie
  const aloe = plant("aloe", PAL.creme);
  aloe.position.set(-2.55, 0.08, 0.55);
  root.add(aloe);
  const cactus = plant("cactus", PAL.roze);
  cactus.position.set(3.45, 0.08, -1.25);
  root.add(cactus);
  const pillA = pillSwitch(true, PAL.roze);
  pillA.position.set(-3.55, 0, 0.95);
  pillA.rotation.y = 0.35;
  const pillB = pillSwitch(false);
  pillB.position.set(-3.3, 0, 1.45);
  pillB.rotation.y = 0.35;
  root.add(pillA, pillB);

  // kabels tussen de onderdelen
  root.add(cable([new Vector3(-1.4, 0.05, -0.5), new Vector3(-0.4, 0.04, -0.8), new Vector3(0.6, 0.05, -1.05), new Vector3(SORT_X - 0.3, 0.06, -1.05)], 0.035));
  root.add(cable([new Vector3(SORT_X + 0.3, 0.05, -1.05), new Vector3(1.8, 0.04, -1.2), new Vector3(STAMP_X - 0.2, 0.05, -0.95)], 0.035, PAL.rozeDiep));

  // stoomwolkjes bij storing
  const puffs: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const p = sphere(0.18, new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, roughness: 0.9 }), 16);
    p.position.set(-1.75 + i * 0.1, 2.0, -1.15);
    root.add(p);
    puffs.push(p);
  }

  shade(root);
  for (const p of puffs) p.castShadow = false;

  // ---------- Toestand en continue beweging ----------
  let gearSpeed = 0;
  let gearTarget = 0;
  let gearAngle = 0;
  let beltSpeed = 0;
  let beltTarget = 0;
  let beltOffset = 0;
  let heat = 0;
  let jammed = false;
  let motorActive = false;
  let running = 0; // aantal ideeën dat nu door de machine reist
  let generation = 0; // verhoogd bij een storing: lopende reizen breken dan af
  const inflight = new Set<Object3D>();

  const motor = () => {
    if (motorActive) return;
    motorActive = true;
    stage.animate((dt) => {
      gearSpeed += (gearTarget - gearSpeed) * Math.min(1, dt * (jammed ? 9 : 3));
      beltSpeed += (beltTarget - beltSpeed) * Math.min(1, dt * 4);
      gearAngle += gearSpeed * dt;
      beltOffset += beltSpeed * dt;
      gearA.rotation.z = gearAngle;
      gearB.rotation.z = -gearAngle * (12 / 8) + 0.2;
      gearC.rotation.z = -gearAngle * 2 + 0.3;
      belt.setOffset(beltOffset);
      const still = Math.abs(gearSpeed) < 0.01 && Math.abs(beltSpeed) < 0.01 && gearTarget === 0 && beltTarget === 0;
      if (still) motorActive = false;
      return !still;
    });
  };
  const setMotor = (gears: number, beltV: number) => {
    gearTarget = gears;
    beltTarget = beltV;
    motor();
  };

  let meterValue = 0;
  const needleTo = (v: number, dur = 0.5) => {
    const start = meterValue;
    return tween(stage, dur, (k) => {
      meterValue = start + (v - start) * k;
      meter.setValue(meterValue);
    }, easing.spring);
  };

  const flashLamp = (on: number, dur = 0.25) => tween(stage, dur, (k) => outLamp.setOn(on ? k : 1 - k), easing.out);

  // De keurplek (sorteerarm + pers) bedient één idee tegelijk; de rest wacht op de band.
  let station: Promise<void> = Promise.resolve();
  const claimStation = () => {
    let release!: () => void;
    const mine = new Promise<void>((r) => (release = r));
    const before = station;
    station = before.then(() => mine);
    return before.then(() => release);
  };

  const ABORT = Symbol("storing");
  const SPEED = 1.3; // de hele reeks iets vlotter dan ‘natuurlijk’: een bezoeker wacht niet graag
  const T = (s: number) => s / SPEED;

  const puff = () =>
    puffs.forEach((p, i) => {
      void tween(stage, 1.6, (k) => {
        p.position.y = 2.0 + k * 1.2;
        p.scale.setScalar(0.6 + k);
        (p.material as MeshStandardMaterial).opacity = Math.sin(k * Math.PI) * 0.75;
      }, easing.out, i * 0.25);
    });
  const shudder = (dur: number) => tween(stage, dur, (k) => (proc.rotation.z = Math.sin(k * Math.PI * 10) * 0.02 * (1 - k)), easing.linear);

  // Eén idee door de machine laten reizen.
  async function travel(o: RunOptions, delay: number, first: boolean): Promise<"goedgekeurd" | "afgekeurd"> {
    const gen = generation;
    const step = async <X>(p: Promise<X>) => {
      const r = await p;
      if (gen !== generation) throw ABORT;
      return r;
    };
    const size = o.mega ? 1.7 : 1;
    const color = o.gold ? PAL.boterDiep : o.color ?? BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    const b = ball(0.15 * size, color);
    if (o.gold) (b.material as MeshStandardMaterial).metalness = 0.6;
    b.position.set(HOP.x, 2.9, HOP.z);
    b.visible = false;
    root.add(b);
    inflight.add(b);
    let release: (() => void) | null = null;
    try {
      if (delay) await step(wait(stage, delay));
      b.visible = true;
      // trechter in en door de eerste buis
      await step(tween(stage, T(0.32), (k) => b.position.set(HOP.x, 2.9 - k * 0.95, HOP.z), easing.in));
      await step(tween(stage, T(0.75), along(tube1.curve, b), easing.inOut));
      // in de verwerker: even weg, de romp bromt
      b.visible = false;
      lamps[1].setOn(1);
      await step(tween(stage, T(o.mega ? 0.7 : 0.4), (k) => {
        const s = 1 + Math.sin(k * Math.PI * (o.mega ? 14 : 8)) * (o.mega ? 0.025 : 0.012);
        body.scale.set(s, 2 - s, s);
      }, easing.linear));
      body.scale.set(1, 1, 1);
      if (o.hiccup && first) {
        // korte hapering: rook, rode lamp, de naald slaat uit en de machine herpakt zich
        lamps[2].setOn(1);
        const g = gearTarget;
        gearTarget = 0;
        void needleTo(1.02, 0.3);
        puff();
        await step(shudder(0.8));
        proc.rotation.z = 0;
        await step(wait(stage, 0.5));
        lamps[2].setOn(heat > 0.6 ? 0.8 : 0);
        gearTarget = g || 4;
        motor();
        void needleTo(0.5);
      }
      lamps[1].setOn(0.2);
      b.visible = true;
      await step(tween(stage, T(0.6), along(tube2.curve, b), easing.inOut));
      // valt op de band
      const p0 = b.position.clone();
      await step(tween(stage, T(0.18), (k) => b.position.set(p0.x + k * 0.15, p0.y + (TOP + (size - 1) * 0.15 - p0.y) * k, 0), easing.in));
      release = await step(claimStation());
      // rijdt naar de sorteerarm
      const startX = b.position.x;
      await step(tween(stage, T(0.6), (k) => {
        b.position.x = startX + (SORT_X - startX) * k;
        b.rotation.z = -b.position.x * 3;
      }, easing.linear));
      // keuring: arm draait in, sensor licht op
      await step(tween(stage, T(0.32), (k) => {
        boom.rotation.x = 0.35 - k * 0.28;
        yaw.rotation.y = Math.sin(k * Math.PI) * 0.18;
        sensor.setOn(k);
        dots.forEach((d, i) => {
          d.emissive.setHex(o.reject && i % 3 === 0 ? PAL.rood : color);
          d.emissiveIntensity = k * (0.4 + ((i * 7) % 5) / 8);
        });
      }, easing.out));
      void tween(stage, 0.6, (k) => dots.forEach((d) => (d.emissiveIntensity *= 1 - k)), easing.out, 0.7);
      if (o.reject) {
        // afgekeurd: de arm veegt het idee van de band in de bak, de klep klapt open
        if (first) o.onVerdict?.("afgekeurd");
        await step(tween(stage, T(0.42), (k) => {
          boom.rotation.x = 0.07 + k * 0.05;
          wrist.position.z = 1.1 + k * 0.55;
          b.position.z = k * 0.62;
        }, easing.in));
        const bp = b.position.clone();
        await step(Promise.all([
          tween(stage, T(0.45), (k) => {
            b.position.set(bp.x + (BIN.x - bp.x) * k, bp.y + Math.sin(k * Math.PI) * 0.35 - k * (bp.y - 0.55), bp.z + (BIN.z - bp.z) * k);
          }, easing.inOut),
          tween(stage, 0.25, (k) => (lid.rotation.x = -0.32 - k * 1.3), easing.out),
        ]));
        await step(tween(stage, 0.2, (k) => b.scale.setScalar(1 - k), easing.in));
        root.remove(b);
        inflight.delete(b);
        await step(Promise.all([
          tween(stage, 0.4, (k) => (lid.rotation.x = -1.62 + k * 1.3), easing.spring),
          tween(stage, T(0.4), (k) => {
            wrist.position.z = 1.65 - k * 0.55;
            boom.rotation.x = 0.12 + k * 0.23;
            sensor.setOn(1 - k);
          }, easing.inOut),
        ]));
        release();
        return "afgekeurd";
      }
      // goedgekeurd: arm terug, idee door naar de pers
      await step(tween(stage, T(0.25), (k) => {
        boom.rotation.x = 0.07 + k * 0.28;
        sensor.setOn(1 - k);
      }, easing.inOut));
      const sx = b.position.x;
      await step(tween(stage, T(0.5), (k) => {
        b.position.x = sx + (STAMP_X - sx) * k;
        b.rotation.z = -b.position.x * 3;
      }, easing.linear));
      // de pers komt neer en maakt van de bol een octrooikaart
      const t = ticket(color);
      t.position.set(STAMP_X, TOP - 0.08, 0);
      t.scale.setScalar(0.01);
      root.add(t);
      inflight.add(t);
      shade(t);
      await step(tween(stage, T(0.42), (k) => {
        ram.position.y = STAMP_UP - (STAMP_UP - STAMP_DOWN) * k;
        if (k > 0.8) {
          const q = (k - 0.8) / 0.2;
          b.scale.set(1 + q * 0.6, 1 - q * 0.9, 1 + q * 0.6);
        }
      }, easing.in));
      root.remove(b);
      inflight.delete(b);
      t.scale.set(size, 1, size);
      if (first) o.onVerdict?.("goedgekeurd");
      await step(tween(stage, T(0.45), (k) => (ram.position.y = STAMP_DOWN + (STAMP_UP - STAMP_DOWN) * k), easing.out));
      release();
      release = null;
      // over de band, door de boog, naar het platform
      await step(tween(stage, T(0.75), (k) => (t.position.x = STAMP_X + (BELT_X0 + BELT_LEN - 0.1 - STAMP_X) * k), easing.linear));
      const tp = t.position.clone();
      void flashLamp(1);
      await step(tween(stage, T(0.55), (k) => {
        t.position.set(tp.x + (OUT.x - tp.x) * k, tp.y + (0.42 - tp.y) * k + Math.sin(k * Math.PI) * 0.2, 0);
        t.rotation.y = k * 0.5;
      }, easing.inOut));
      await step(tween(stage, 0.35, (k) => (t.position.y = 0.42 + Math.sin(k * Math.PI) * 0.06), easing.out));
      // het kaartje blijft even liggen en schuift dan weg
      void wait(stage, 2.6).then(() =>
        tween(stage, 0.6, (k) => {
          t.position.z = -k * 0.4;
          t.scale.setScalar(size * (1 - k));
        }, easing.in).then(() => {
          root.remove(t);
          inflight.delete(t);
          void flashLamp(0, 0.6);
        }),
      );
      return "goedgekeurd";
    } catch (e) {
      release?.();
      if (e !== ABORT) throw e;
      root.remove(b);
      inflight.delete(b);
      return "afgekeurd";
    }
  }

  const controller: MachineController = {
    stage,
    async run(o) {
      if (jammed) return "afgekeurd";
      running++;
      // de bovenste bal in de trechter zakt weg en komt terug (er is altijd nog een idee)
      const top = waiting[Math.floor(Math.random() * waiting.length)];
      void tween(stage, 0.3, (k) => (top.position.y = 2.98 - k * 0.12), easing.in).then(() => tween(stage, 0.5, (k) => (top.position.y = 2.86 + k * 0.12), easing.spring, 0.8));
      setMotor(4 + heat * 6, 1.3);
      lamps[0].setOn(1);
      void needleTo(Math.min(0.98, 0.45 + heat * 0.5 + (o.mega ? 0.3 : 0)));
      const runs = [travel(o, 0, true)];
      if (o.double) runs.push(travel({ ...o, color: undefined, reject: false, hiccup: false }, 0.45, false));
      const results = await Promise.all(runs);
      running--;
      if (!running && !jammed) {
        setMotor(0, 0);
        lamps[0].setOn(0.4);
        void needleTo(heat * 0.6);
      }
      return results[0];
    },
    jam() {
      jammed = true;
      generation++;
      for (const o of inflight) root.remove(o);
      inflight.clear();
      ram.position.y = STAMP_UP;
      setMotor(0, 0);
      lamps[2].setOn(1);
      void needleTo(1.02, 0.3);
      // rook uit het rooster en een rillende romp
      puff();
      void shudder(0.8).then(() => (proc.rotation.z = -0.03));
    },
    restart() {
      jammed = false;
      proc.rotation.z = 0;
      lamps[2].setOn(0);
      setMotor(3, 0.4);
      void wait(stage, 0.6).then(() => {
        if (!running) setMotor(0, 0);
      });
      void needleTo(0.2);
    },
    nudge() {
      if (running || jammed) return;
      setMotor(1.6, 0.25);
      void wait(stage, 0.7).then(() => {
        if (!running) setMotor(0, 0);
      });
    },
    setHeat(h) {
      heat = h;
      lamps[2].setOn(h > 0.6 ? 0.8 : 0);
      if (!jammed && !running) void needleTo(Math.min(0.95, h * 0.9), 0.4);
    },
    setGold(on) {
      (gearA.children[0] as Mesh).material = on ? mat(PAL.boterDiep, { metal: 0.65 }) : mat(PAL.boter, { gloss: 0.3 });
      keyHead.rotation.z = on ? Math.PI / 2 : 0;
      outLamp.setOn(on ? 0.6 : 0);
      stage.invalidate();
    },
    anchors() {
      const at = (o: Object3D, dx = 0, dy = 0, dz = 0) => {
        const v = new Vector3();
        o.getWorldPosition(v);
        v.add(new Vector3(dx, dy, dz));
        return stage.project(v);
      };
      return {
        trechter: at(hopper, 0, 0.6),
        buis: stage.project(tube1.curve.getPointAt(0.42)),
        verwerker: at(gearA, 0.45, 0.2),
        meter: at(meter, 0, 0.42),
        sorteerarm: at(wrist, 0, 0.25),
        afkeurbak: at(bin, 0, 0.8),
        stempel: at(press, 0, 2.3),
        uitvoer: at(platform, 0, 0.6),
        schakelaar: at(secret),
      };
    },
    setCamera(name) {
      stage.setCamera(CAMERAS[name]);
    },
    dispose() {
      stage.dispose();
    },
  };
  stage.setCamera(CAMERAS[cameraName]);
  stage.render();
  return controller;
}

const along = (curve: { getPointAt: (t: number) => Vector3 }, obj: Object3D, from = 0, to = 1) => (k: number) => {
  obj.position.copy(curve.getPointAt(from + (to - from) * k));
};

export { buildIdeaMachine as default };
