// Het Control Center als één installatie: een bedieningslessenaar met hellend dek, een toren met het
// centrale display en twee meters, een printer voor domeinnamen, een hendel met capsulebuis, een
// ideeënreservoir met glazen leiding naar het display, een creativiteitsplant en een zwaailicht.
// De bediening zelf is HTML (toegankelijk); deze scène laat zien wat elke knop mechanisch doet.

import { CanvasTexture, ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Shape, SRGBColorSpace, TorusGeometry, Vector3, type Object3D } from "three";
import { createStage, easing, tween, wait, type CameraSpec, type Stage } from "../engine";
import type { ConsoleLayout } from "../consoleInfo";
import { ball, box, cable, gauge, glass, glassPipe, lamp, mat, metal, PAL, pipe, ribbedTrack, roundCyl, shade, sphere } from "../kit";

export const CONSOLE_CAMERAS: Record<ConsoleLayout, CameraSpec> = {
  wide: { pos: [4.6, 8.4, 12.8], target: [0.45, 1.75, -0.1], fov: 31 },
  compact: { pos: [1.4, 8.4, 9.9], target: [0.3, 2.5, 0.1], fov: 40 },
};

type SlotId = "toggles" | "serious" | "niets" | "idee" | "knob" | "afronden" | "domein" | "stop";
type Spec = {
  deskW: number;
  deckD: number;
  tilt: number;
  towerW: number;
  dispW: number;
  dispH: number;
  gaugesOnTop: boolean;
  /** compact: geen printer; het reservoir staat naast de lessenaar op de vloer */
  narrow: boolean;
  railW: number;
  /** Alleen de onderdelen die in deze compositie op het dek staan; de rest zit op mobiel in de lade. */
  slots: Partial<Record<SlotId, [number, number]>>;
};

const SPECS: Record<ConsoleLayout, Spec> = {
  wide: {
    deskW: 9.4,
    deckD: 2.15,
    tilt: 0.3,
    towerW: 6.5,
    dispW: 3.9,
    dispH: 2.25,
    gaugesOnTop: false,
    narrow: false,
    railW: 3.2,
    slots: {
      toggles: [-3.5, -0.44],
      serious: [-3.5, 0.52],
      niets: [-2.05, 0.05],
      idee: [-0.5, 0.05],
      knob: [1.15, 0.05],
      afronden: [2.65, -0.45],
      domein: [2.65, 0.5],
      stop: [3.85, 0.05],
    },
  },
  compact: {
    deskW: 4.7,
    deckD: 3.2,
    tilt: 0.42,
    towerW: 4.5,
    dispW: 4.15,
    dispH: 2.3,
    gaugesOnTop: true,
    narrow: true,
    railW: 2.6,
    slots: {
      idee: [-1.0, -0.64],
      knob: [1.1, -0.64],
      niets: [-1.0, 0.98],
      stop: [1.1, 0.98],
    },
  },
};

export type Tone = "normal" | "err" | "ok" | "off";
export type ConsoleAnchor = { x: number; y: number; r: number };

export type ConsoleController = {
  stage: Stage;
  press: (id: "idee" | "niets" | "domein" | "afronden") => void;
  idea: () => void;
  setCreativity: (level: number) => void;
  setLoad: (v: number) => void;
  setProgress: (v: number | null) => void;
  sleep: () => Promise<void>;
  print: () => void;
  setLever: (pull: number) => void;
  capsule: (color: number) => void;
  setSerious: (on: boolean) => void;
  setToggle: (key: "koffie" | "ambitie" | "realisme", on: boolean) => void;
  setCover: (open: boolean) => void;
  emergency: (on: boolean) => void;
  jam: (on: boolean) => void;
  thump: () => void;
  screen: (tone: Tone) => void;
  anchors: () => Record<string, ConsoleAnchor>;
  screenRect: () => { x: number; y: number; w: number; h: number; quad: { x: number; y: number }[] };
  dispose: () => void;
};

export type ConsoleBuildOptions = { preserve?: boolean; pixelRatio?: number; shadowSize?: number };

const LAMP_COLORS = [PAL.mint, PAL.mint, PAL.mint, PAL.blauw, PAL.blauw, PAL.lila, PAL.lila, PAL.boter, PAL.boter, PAL.roze, PAL.rood];
const SCREEN_TONES: Record<Tone, [number, number]> = {
  normal: [0x4fa7a0, 0.35],
  err: [0xc2486a, 0.4],
  ok: [0x55b487, 0.38],
  off: [0x000000, 0],
};

/** Waarschuwingsstrepen (boter en donkerblauw) voor de noodstopplaat. */
function stripes(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f6d781";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#2f3a66";
  for (let i = -128; i < 256; i += 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 16, 0);
    g.lineTo(i + 16 + 128, 128);
    g.lineTo(i + 128, 128);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function buildConsole(canvas: HTMLCanvasElement, width: number, height: number, layout: ConsoleLayout = "wide", opts: ConsoleBuildOptions = {}): ConsoleController {
  const stage = createStage({ canvas, width, height, preserve: opts.preserve, pixelRatio: opts.pixelRatio, shadowSize: opts.shadowSize, shadowArea: 8 });
  const S = SPECS[layout];
  const root = new Group();
  stage.scene.add(root);

  // ---------- Lessenaar: één gebogen profiel, met afgeronde randen ----------
  const ZF = 1.35; // voorkant
  const HF = 1.05; // hoogte voorkant
  const ZT = ZF - S.deckD * Math.cos(S.tilt); // achterrand van het dek
  const HB = HF + S.deckD * Math.sin(S.tilt); // hoogte achterkant
  const ZB = ZT - 1.05; // achterkant lessenaar
  const profile = new Shape();
  profile.moveTo(-ZF, 0);
  profile.lineTo(-ZF, HF);
  profile.lineTo(-ZT, HB);
  profile.lineTo(-ZB, HB);
  profile.lineTo(-ZB, 0);
  profile.closePath();
  const bev = 0.09;
  const deskGeo = new ExtrudeGeometry(profile, { depth: S.deskW - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 4 });
  deskGeo.rotateY(Math.PI / 2);
  deskGeo.translate(-S.deskW / 2 + bev, 0, 0);
  const desk = new Mesh(deskGeo, mat(PAL.creme, { gloss: 0.25 }));
  root.add(desk);
  // de lessenaar staat op een geribbelde baan, net als de ideeënmachine (stijlanker)
  const base = ribbedTrack(S.deskW + 1.4, ZF - ZB + 1.1, 0.05);
  base.position.set(0, 0, (ZF + ZB) / 2);
  root.add(base);
  // plint en voetjes
  const kick = box(S.deskW - 0.3, 0.16, ZF - ZB - 0.2, 0.06, mat(PAL.nacht));
  kick.position.set(0, 0.08, (ZF + ZB) / 2);
  root.add(kick);

  // hellend bedieningsdek
  const deck = new Group();
  deck.position.set(0, (HF + HB) / 2 + bev, (ZF + ZT) / 2);
  deck.rotation.x = S.tilt;
  root.add(deck);
  // led-strip langs de voorrand: kleurt mee met de creativiteit
  const stripMat = new MeshStandardMaterial({ color: PAL.lila, roughness: 0.3, emissive: PAL.lila, emissiveIntensity: 0.2 });
  const strip = box(S.deskW - 0.6, 0.05, 0.07, 0.025, stripMat);
  strip.position.set(0, 0.0, S.deckD / 2 - 0.06);
  deck.add(strip);

  const plate = (w: number, d: number, color: number, x: number, z: number) => {
    const p = box(w, 0.07, d, 0.06, mat(color, { gloss: 0.2 }));
    p.position.set(x, 0.02, z);
    host.add(p);
    return p;
  };
  // elk onderdeel in een eigen groep, zodat een compositie onderdelen kan weglaten
  let host: Group = deck;
  const mod = (id: SlotId) => {
    host = new Group();
    host.visible = !!S.slots[id];
    deck.add(host);
    return host;
  };
  const at = (id: SlotId) => S.slots[id] ?? [0, 0];

  // ---------- Grote rode ideeënknop ----------
  mod("idee");
  const [ix, iz] = at("idee");
  plate(1.3, 1.3, PAL.roze, ix, iz);
  const ideaRing = roundCyl(0.56, 0.12, 0.04, mat(PAL.nacht, { gloss: 0.3 }));
  ideaRing.position.set(ix, 0.05, iz);
  host.add(ideaRing);
  const ideaCap = new Group();
  ideaCap.position.set(ix, 0.16, iz);
  const ideaCapMesh = roundCyl(0.46, 0.24, 0.12, mat(PAL.rood, { gloss: 0.55 }));
  ideaCap.add(ideaCapMesh);
  host.add(ideaCap);

  // ---------- Even niets doen: een zacht kussen ----------
  mod("niets");
  const [nx, nz] = at("niets");
  plate(1.25, 1.25, PAL.mint, nx, nz);
  const pillow = new Group();
  pillow.position.set(nx, 0.08, nz);
  const pillowMesh = box(0.86, 0.26, 0.74, 0.13, mat(PAL.creme, { gloss: 0.1 }), 6);
  pillowMesh.position.y = 0.13;
  pillow.add(pillowMesh);
  const button = sphere(0.04, mat(PAL.mintDiep));
  button.position.set(0, 0.27, 0);
  pillow.add(button);
  host.add(pillow);

  // ---------- Creativiteitsknop met ledkrans ----------
  mod("knob");
  const [kx, kz] = at("knob");
  plate(1.35, 1.35, PAL.papier, kx, kz);
  const knob = new Group();
  knob.position.set(kx, 0.06, kz);
  host.add(knob);
  const knobBody = roundCyl(0.4, 0.3, 0.08, mat(PAL.boter, { gloss: 0.35 }));
  knob.add(knobBody);
  for (let i = 0; i < 16; i++) {
    const rib = box(0.05, 0.22, 0.08, 0.02, mat(PAL.boterDiep, { gloss: 0.3 }));
    const a = (i / 16) * Math.PI * 2;
    rib.position.set(Math.cos(a) * 0.4, 0.15, Math.sin(a) * 0.4);
    rib.rotation.y = -a;
    knob.add(rib);
  }
  const marker = box(0.06, 0.04, 0.24, 0.02, mat(PAL.nacht));
  marker.position.set(0, 0.31, -0.2);
  knob.add(marker);
  const knobLeds: MeshStandardMaterial[] = [];
  for (let i = 0; i <= 11; i++) {
    const a = -Math.PI * 0.75 + (i / 10) * Math.PI * 1.5;
    const m = new MeshStandardMaterial({ color: i > 10 ? PAL.rood : LAMP_COLORS[Math.min(i, 10)], roughness: 0.3, emissive: i > 10 ? PAL.rood : LAMP_COLORS[Math.min(i, 10)], emissiveIntensity: 0 });
    const led = sphere(0.045, m, 12);
    led.position.set(kx + Math.sin(a) * 0.58, 0.07, kz - Math.cos(a) * 0.58);
    host.add(led);
    knobLeds.push(m);
  }

  // ---------- Project afronden: sleutelschakelaar ----------
  mod("afronden");
  const [ax, az] = at("afronden");
  plate(1.05, 0.8, PAL.boter, ax, az);
  const lock = roundCyl(0.22, 0.1, 0.03, metal());
  lock.position.set(ax, 0.05, az);
  host.add(lock);
  const key = new Group();
  key.position.set(ax, 0.15, az);
  const keyBow = new Mesh(new TorusGeometry(0.1, 0.035, 10, 24), mat(PAL.boterDiep, { metal: 0.6 }));
  keyBow.position.y = 0.2;
  const keyShaft = box(0.05, 0.14, 0.05, 0.015, mat(PAL.boterDiep, { metal: 0.6 }));
  keyShaft.position.y = 0.06;
  key.add(keyBow, keyShaft);
  host.add(key);

  // ---------- Domeinbeheer: muntgleuf ----------
  mod("domein");
  const [dx, dz] = at("domein");
  plate(1.05, 0.8, PAL.blauw, dx, dz);
  const slotBox = box(0.6, 0.18, 0.4, 0.06, mat(PAL.nacht, { gloss: 0.3 }));
  slotBox.position.set(dx, 0.12, dz);
  host.add(slotBox);
  const slotHole = box(0.32, 0.05, 0.05, 0.02, mat(0x11152a));
  slotHole.position.set(dx, 0.22, dz);
  host.add(slotHole);
  const coin = roundCyl(0.11, 0.025, 0.01, mat(PAL.boterDiep, { metal: 0.7 }));
  coin.rotation.x = Math.PI / 2;
  coin.position.set(dx, 0.5, dz);
  coin.visible = false;
  host.add(coin);

  // ---------- Serieuze modus: grote tuimelschakelaar ----------
  mod("serious");
  const [sx, sz] = at("serious");
  plate(1.05, 0.8, PAL.nacht, sx, sz);
  const swBase = box(0.44, 0.1, 0.3, 0.05, metal());
  swBase.position.set(sx, 0.08, sz);
  host.add(swBase);
  const seriousLever = new Group();
  seriousLever.position.set(sx, 0.12, sz);
  const swStick = box(0.08, 0.34, 0.08, 0.03, metal());
  swStick.position.y = 0.17;
  const swTip = roundCyl(0.08, 0.1, 0.03, mat(PAL.roze, { gloss: 0.4 }));
  swTip.position.y = 0.32;
  seriousLever.add(swStick, swTip);
  seriousLever.rotation.x = 0.45;
  host.add(seriousLever);

  // ---------- Instellingen: drie tuimelschakelaars ----------
  mod("toggles");
  const [tx, tz] = at("toggles");
  plate(1.25, 0.8, PAL.lila, tx, tz);
  const toggles: Record<"koffie" | "ambitie" | "realisme", Group> = {} as never;
  (["koffie", "ambitie", "realisme"] as const).forEach((k, i) => {
    const base = roundCyl(0.11, 0.06, 0.02, metal());
    base.position.set(tx - 0.36 + i * 0.36, 0.05, tz);
    host.add(base);
    const t = new Group();
    t.position.set(tx - 0.36 + i * 0.36, 0.1, tz);
    const stick = box(0.05, 0.24, 0.05, 0.02, metal());
    stick.position.y = 0.12;
    const tip = sphere(0.055, mat([PAL.boterDiep, PAL.rozeDiep, PAL.mintDiep][i], { gloss: 0.4 }));
    tip.position.y = 0.25;
    t.add(stick, tip);
    t.rotation.x = 0.4;
    host.add(t);
    toggles[k] = t;
  });

  // ---------- Noodstop met klapkapje ----------
  mod("stop");
  const [px, pz] = at("stop");
  const stopPlate = box(1.0, 0.07, 1.0, 0.06, new MeshStandardMaterial({ map: stripes(), roughness: 0.55 }));
  stopPlate.position.set(px, 0.02, pz);
  host.add(stopPlate);
  const stopCollar = roundCyl(0.34, 0.12, 0.03, mat(PAL.boter, { gloss: 0.3 }));
  stopCollar.position.set(px, 0.05, pz);
  host.add(stopCollar);
  const stopCap = new Group();
  stopCap.position.set(px, 0.15, pz);
  const mush = roundCyl(0.27, 0.16, 0.08, mat(PAL.rood, { gloss: 0.55 }));
  stopCap.add(mush);
  host.add(stopCap);
  const coverHinge = new Group();
  coverHinge.position.set(px, 0.08, pz - 0.38);
  const coverMat = glass().clone();
  (coverMat as MeshStandardMaterial).color.setHex(0xf1c4cf);
  (coverMat as MeshStandardMaterial).opacity = 0.5;
  const cover = box(0.72, 0.42, 0.74, 0.1, coverMat);
  cover.position.set(0, 0.2, 0.38);
  coverHinge.add(cover);
  host.add(coverHinge);

  // ---------- Toren met display ----------
  const TZ = ZT - 0.5; // midden van de toren
  const TH = 2.55;
  const tower = box(S.towerW, TH, 0.9, 0.18, mat(PAL.blauw, { gloss: 0.2 }));
  tower.position.set(0, HB + TH / 2, TZ);
  root.add(tower);
  const bezel = box(S.dispW + 0.3, S.dispH + 0.3, 0.14, 0.1, mat(PAL.nacht, { gloss: 0.3 }));
  const DY = HB + TH / 2 + 0.05;
  bezel.position.set(0, DY, TZ + 0.45);
  root.add(bezel);
  const screenMat = new MeshStandardMaterial({ color: 0x1d2742, roughness: 0.2, metalness: 0.1, emissive: SCREEN_TONES.normal[0], emissiveIntensity: SCREEN_TONES.normal[1] });
  const screen = new Mesh(new PlaneGeometry(S.dispW, S.dispH), screenMat);
  screen.position.set(0, DY, TZ + 0.525);
  root.add(screen);
  const shineMat = new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, roughness: 0.05, depthWrite: false });
  const shine = new Mesh(new PlaneGeometry(S.dispW * 0.9, S.dispH * 0.35), shineMat);
  shine.position.set(-S.dispW * 0.03, DY + S.dispH * 0.28, TZ + 0.53);
  shine.rotation.z = 0.04;
  root.add(shine);

  // meters: belasting en voortgang
  const gR = S.gaugesOnTop ? 0.36 : 0.44;
  const gLoad = gauge(gR, "BELASTING");
  const gProg = gauge(gR, "VOORTGANG", mat(PAL.nacht, { gloss: 0.4 }));
  if (S.gaugesOnTop) {
    for (const [g, x] of [
      [gLoad, -0.95],
      [gProg, 0.95],
    ] as const) {
      const post = roundCyl(0.05, 0.4, 0.02, metal());
      post.position.set(x, HB + TH, TZ);
      root.add(post);
      g.position.set(x, HB + TH + 0.4 + gR, TZ);
      root.add(g);
    }
  } else {
    const gx = S.dispW / 2 + 0.15 + (S.towerW - S.dispW) / 4;
    gLoad.position.set(-gx, DY + 0.25, TZ + 0.45);
    gProg.position.set(gx, DY + 0.25, TZ + 0.45);
    root.add(gLoad, gProg);
  }

  // lampenrij op de toren: telt de creativiteit
  const lamps = LAMP_COLORS.map((c, i) => {
    const l = lamp(0.085, c);
    const span = S.gaugesOnTop ? S.towerW - 0.6 : S.dispW;
    l.position.set(-span / 2 + (i / 10) * span, S.gaugesOnTop ? HB + TH : HB + TH, S.gaugesOnTop ? TZ + 0.3 : TZ + 0.15);
    root.add(l);
    return l;
  });

  // zwaailicht
  const beacon = new Group();
  beacon.position.set(S.towerW / 2 - 0.35, HB + TH, TZ - 0.15);
  root.add(beacon);
  beacon.add(roundCyl(0.2, 0.12, 0.04, mat(PAL.nacht)));
  const beaconMat = new MeshStandardMaterial({ color: 0xf6a37f, roughness: 0.2, emissive: 0xff7a5c, emissiveIntensity: 0, transparent: true, opacity: 0.85 });
  const dome = sphere(0.18, beaconMat, 24);
  dome.scale.y = 1.2;
  dome.position.y = 0.26;
  beacon.add(dome);
  const reflector = box(0.06, 0.16, 0.22, 0.02, metal());
  reflector.position.y = 0.26;
  beacon.add(reflector);

  // roze stroomleiding uit het plafond, net als bij de ideeënmachine
  root.add(pipe([new Vector3(-S.towerW / 2 + 0.6, 9, TZ - 0.2), new Vector3(-S.towerW / 2 + 0.6, HB + TH - 0.1, TZ - 0.2)], 0.13, mat(PAL.roze, { gloss: 0.25 }), 0.4));

  // ---------- Ideeënreservoir met glazen leiding naar de toren ----------
  const RX = S.narrow ? -S.deskW / 2 - 0.5 : layoutReservoirX(S);
  const RZ = S.narrow ? ZT - 0.2 : (ZT + ZB) / 2;
  const RY = S.narrow ? 0.9 : HB; // compact: op een eigen zuil naast de lessenaar
  if (S.narrow) {
    const col = roundCyl(0.16, RY, 0.04, mat(PAL.lila));
    col.position.set(RX, 0, RZ);
    root.add(col);
  }
  const resBase = roundCyl(0.36, 0.14, 0.05, mat(PAL.nacht));
  resBase.position.set(RX, RY, RZ);
  root.add(resBase);
  const jar = roundCyl(0.3, 0.95, 0.12, glass());
  jar.position.set(RX, RY + 0.14, RZ);
  root.add(jar);
  const jarLid = roundCyl(0.33, 0.1, 0.04, metal());
  jarLid.position.set(RX, RY + 1.09, RZ);
  root.add(jarLid);
  const resBalls: Mesh[] = [];
  [PAL.roze, PAL.boter, PAL.mint, PAL.lila, PAL.blauw, PAL.boter, PAL.roze].forEach((c, i) => {
    const b = ball(0.11, c);
    b.position.set(RX + Math.cos(i * 2.1) * 0.13, RY + 0.26 + Math.floor(i / 3) * 0.17, RZ + Math.sin(i * 2.1) * 0.13);
    root.add(b);
    resBalls.push(b);
  });
  const towerLeft = -S.towerW / 2;
  const ideaPipe = glassPipe(
    [new Vector3(RX, RY + 1.15, RZ), new Vector3(RX, HB + TH - 0.35, RZ), new Vector3(towerLeft - 0.02, HB + TH - 0.35, S.narrow ? TZ : RZ)],
    0.14,
    0.35,
  );
  root.add(ideaPipe);

  // ---------- Printer voor domeinnamen ----------
  const PX = -RX;
  const printer = new Group();
  printer.position.set(PX, HB, RZ + 0.05);
  printer.visible = !S.narrow;
  root.add(printer);
  const pBody = box(0.95, 0.55, 0.75, 0.12, mat(PAL.boter, { gloss: 0.25 }));
  pBody.position.y = 0.275;
  printer.add(pBody);
  const pSlot = box(0.6, 0.05, 0.08, 0.02, mat(PAL.nacht));
  pSlot.position.set(0, 0.42, 0.37);
  printer.add(pSlot);
  const pLed = lamp(0.04, PAL.mint);
  pLed.position.set(0.32, 0.55, 0.2);
  printer.add(pLed);
  const paper = new Group();
  paper.position.set(0, 0.42, 0.38);
  printer.add(paper);
  const paperSheet = box(0.52, 0.012, 1, 0.005, mat(0xfffdf8, { gloss: 0.1 }));
  paperSheet.position.z = 0.5;
  paper.add(paperSheet);
  for (let i = 0; i < 3; i++) {
    const line = box(0.32 - i * 0.07, 0.014, 0.03, 0.005, mat(PAL.blauwDiep));
    line.position.set(-0.04, 0.002, 0.25 + i * 0.16);
    paper.add(line);
  }
  paper.scale.set(1, 1, 0.001);
  paper.visible = false;
  // kabel van het dek naar de printer
  if (!S.narrow) root.add(cable([new Vector3(PX - 0.2, HB + 0.1, RZ + 0.4), new Vector3(PX - 0.6, HB + 0.02, RZ + 0.1), new Vector3(S.towerW / 2 - 0.1, HB + 0.3, TZ)], 0.035, PAL.rozeDiep));

  // ---------- Hendel met capsulebuis en uitvoerbak ----------
  const SIDE = S.deskW / 2 + 0.02;
  const LZ = ZF - 0.85;
  const LY = HF * 0.62;
  const hub = roundCyl(0.24, 0.16, 0.05, mat(PAL.nacht, { gloss: 0.3 }));
  hub.rotation.z = -Math.PI / 2;
  hub.position.set(SIDE, LY, LZ);
  root.add(hub);
  const lever = new Group();
  lever.position.set(SIDE + 0.17, LY, LZ);
  root.add(lever);
  const arm = roundCyl(0.065, 1.45, 0.02, metal());
  lever.add(arm);
  const handle = sphere(0.21, mat(PAL.rozeDiep, { gloss: 0.45 }));
  handle.position.y = 1.5;
  lever.add(handle);
  const LEVER_REST = -0.35;
  const LEVER_PULLED = 0.95;
  lever.rotation.x = LEVER_REST;
  // capsulemagazijn aan de zijkant: de hendel laat er één capsule uit vallen, via een glazen goot naar de bak
  const MX = SIDE + 0.3;
  const MZ = LZ - 1.05;
  const bracket = box(0.5, 0.12, 0.36, 0.04, mat(PAL.nacht));
  bracket.position.set(SIDE + 0.2, 0.62, MZ);
  root.add(bracket);
  const magazine = roundCyl(0.24, 1.15, 0.08, glass());
  magazine.position.set(MX, 0.68, MZ);
  root.add(magazine);
  const magLid = roundCyl(0.27, 0.1, 0.04, mat(PAL.lila, { gloss: 0.3 }));
  magLid.position.set(MX, 1.83, MZ);
  root.add(magLid);
  [PAL.roze, PAL.mint, PAL.boter, PAL.blauw, PAL.lila].forEach((c, i) => {
    const cap = sphere(0.13, mat(c, { gloss: 0.4 }), 18);
    cap.scale.y = 1.12;
    cap.position.set(MX + (i % 2 ? 0.05 : -0.05), 0.86 + i * 0.2, MZ);
    root.add(cap);
  });
  const trayPos = new Vector3(MX + 0.15, 0, ZF + 0.2);
  const capTube = glassPipe([new Vector3(MX, 0.7, MZ), new Vector3(MX, 0.42, MZ), new Vector3(MX, 0.42, trayPos.z - 0.45), new Vector3(trayPos.x, 0.3, trayPos.z - 0.2)], 0.16, 0.3);
  root.add(capTube);
  const tray = new Group();
  tray.position.copy(trayPos);
  root.add(tray);
  const trayBase = roundCyl(0.62, 0.12, 0.05, mat(PAL.lila, { gloss: 0.2 }));
  tray.add(trayBase);
  const trayRim = new Mesh(new TorusGeometry(0.6, 0.06, 10, 36), mat(PAL.lilaDiep));
  trayRim.rotation.x = Math.PI / 2;
  trayRim.position.y = 0.13;
  tray.add(trayRim);
  const capsules: Group[] = [];

  // ---------- Creativiteitsplant ----------
  const plant = new Group();
  if (S.gaugesOnTop) plant.position.set(0, HB + TH, TZ - 0.1);
  else plant.position.set(RX - 0.75, HB, RZ + 0.1);
  root.add(plant);
  const pot = roundCyl(0.22, 0.3, 0.06, mat(PAL.roze, { gloss: 0.25 }));
  plant.add(pot);
  const soil = roundCyl(0.19, 0.04, 0.01, mat(0x6b5a55));
  soil.position.y = 0.27;
  plant.add(soil);
  const stem = roundCyl(0.025, 1, 0.01, mat(PAL.mintDiep));
  stem.position.y = 0.3;
  plant.add(stem);
  const leaves: Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const leaf = sphere(0.12, mat(PAL.mint, { gloss: 0.2 }), 16);
    leaf.scale.set(1, 0.3, 0.55);
    const side = i % 2 ? 1 : -1;
    leaf.position.set(side * 0.11, 0.42 + i * 0.13, 0);
    leaf.rotation.z = side * 0.5;
    leaf.visible = false;
    plant.add(leaf);
    leaves.push(leaf);
  }
  const flower = new Group();
  for (let i = 0; i < 6; i++) {
    const petal = sphere(0.07, mat(PAL.boter, { gloss: 0.3 }), 12);
    petal.scale.set(1, 0.35, 0.55);
    const a = (i / 6) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08);
    petal.rotation.y = -a;
    flower.add(petal);
  }
  const heart = sphere(0.05, mat(PAL.rozeDiep));
  flower.add(heart);
  flower.visible = false;
  plant.add(flower);

  // ---------- Rail voor de weglopende knop (op de voorkant) ----------
  const rail = box(S.railW, 0.42, 0.06, 0.08, mat(PAL.nacht, { gloss: 0.3 }));
  rail.position.set(0, HF * 0.52, ZF + bev + 0.02);
  root.add(rail);
  const railSlot = box(S.railW - 0.3, 0.06, 0.04, 0.02, mat(0x11152a));
  railSlot.position.set(0, HF * 0.52, ZF + bev + 0.05);
  root.add(railSlot);

  // rookwolkjes voor een storing
  const puffs: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const p = sphere(0.2, new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0, roughness: 0.9 }), 16);
    p.position.set(-0.6 + i * 0.4, HB + TH, TZ);
    p.castShadow = false;
    root.add(p);
    puffs.push(p);
  }

  shade(root);
  for (const p of puffs) p.castShadow = false;
  for (const m of [screen, shine]) m.castShadow = false;

  // ---------- Toestand ----------
  let level = 3;
  let loadV = 0;
  let progV = 0;
  let stopped = false; // noodstop of storing: alles staat stil
  let sleeping = false;
  let tone: Tone = "normal";
  let ambient = false;
  let ambientUntil = 0;
  const now = () => performance.now() / 1000;

  const setScreen = (t: Tone, k = 1) => {
    const [c, i] = SCREEN_TONES[t];
    screenMat.emissive.setHex(c);
    screenMat.emissiveIntensity = i * k;
  };
  const showLamps = (n: number, k = 1) => lamps.forEach((l, i) => l.setOn(i < n ? 0.85 * k : 0));

  const needle = (g: typeof gLoad, from: () => number, to: number, set: (v: number) => void, dur = 0.5) => {
    const start = from();
    return tween(stage, dur, (k) => {
      const v = start + (to - start) * k;
      set(v);
      g.setValue(v);
    }, easing.spring);
  };

  // Rustige achtergrondbeweging bij hoge creativiteit: lampjes lopen, ballen dansen. Stopt vanzelf.
  const startAmbient = () => {
    ambientUntil = now() + 14;
    if (ambient) return;
    ambient = true;
    let t = 0;
    stage.animate((dt) => {
      t += dt;
      const go = level >= 7 && !stopped && !sleeping && now() < ambientUntil;
      if (!go) {
        ambient = false;
        showLamps(Math.min(level, 11));
        resBalls.forEach((b, i) => (b.position.y = RY + 0.26 + Math.floor(i / 3) * 0.17));
        return false;
      }
      const speed = 2 + (level - 6) * 1.6;
      const head = Math.floor(t * speed) % 11;
      lamps.forEach((l, i) => l.setOn(i < level ? (i === head ? 1.2 : 0.55) : 0));
      resBalls.forEach((b, i) => (b.position.y = RY + 0.26 + Math.floor(i / 3) * 0.17 + Math.abs(Math.sin(t * speed * 0.7 + i)) * 0.04 * (level - 6)));
      if (level >= 11) flower.rotation.y += dt * 4;
      return true;
    });
  };

  const pressCap = (obj: Object3D, depth: number, base: number) =>
    tween(stage, 0.36, (k) => (obj.position.y = base - easing.thump(k) * depth), easing.linear);

  const shake = (amp: number, dur: number) =>
    tween(stage, dur, (k) => {
      root.position.x = Math.sin(k * Math.PI * 14) * amp * (1 - k);
    }, easing.linear).then(() => (root.position.x = 0));

  const puff = () =>
    puffs.forEach((p, i) => {
      void tween(stage, 1.6, (k) => {
        p.position.y = HB + TH + k * 1.3;
        p.scale.setScalar(0.6 + k);
        (p.material as MeshStandardMaterial).opacity = Math.sin(k * Math.PI) * 0.75;
      }, easing.out, i * 0.22);
    });

  const right = new Vector3();
  const projR = (p: Vector3, r: number) => {
    right.setFromMatrixColumn(stage.camera.matrixWorld, 0).normalize();
    const a = stage.project(p.clone());
    const b = stage.project(p.clone().addScaledVector(right, r));
    return { x: a.x, y: a.y, r: Math.hypot(b.x - a.x, (b.y - a.y) * (stage.camera.aspect ? 1 / stage.camera.aspect : 1)) };
  };
  const worldOf = (o: Object3D, dy = 0) => {
    const v = new Vector3(0, dy, 0);
    o.localToWorld(v);
    return v;
  };
  const deckPoint = (x: number, y: number, z: number) => deck.localToWorld(new Vector3(x, y, z));

  const controller: ConsoleController = {
    stage,
    press(id) {
      if (id === "idee") void pressCap(ideaCap, 0.12, 0.16);
      if (id === "niets") {
        void tween(stage, 0.5, (k) => {
          const s = 1 - easing.thump(k) * 0.35;
          pillowMesh.scale.set(1 + (1 - s) * 0.4, s, 1 + (1 - s) * 0.4);
        }, easing.linear);
      }
      if (id === "afronden") {
        void tween(stage, 0.4, (k) => (key.rotation.y = easing.out(k) * (Math.PI / 2)), easing.linear);
      }
      if (id === "domein") {
        coin.visible = true;
        void tween(stage, 0.45, (k) => {
          coin.position.y = 0.5 - k * 0.32;
          coin.rotation.z = k * 6;
        }, easing.in).then(() => (coin.visible = false));
      }
    },
    idea() {
      if (stopped || sleeping) return;
      const b = resBalls[Math.floor(Math.random() * resBalls.length)];
      const color = (b.material as MeshStandardMaterial).color.getHex();
      const runner = ball(0.11, color);
      root.add(runner);
      const curve = ideaPipe.curve;
      void tween(stage, 0.9 - Math.min(level, 10) * 0.03, (k) => runner.position.copy(curve.getPointAt(k)), easing.inOut).then(() => {
        root.remove(runner);
        // het display licht op in de kleur van het idee
        void tween(stage, 0.5, (k) => {
          screenMat.emissive.setHex(color);
          screenMat.emissiveIntensity = SCREEN_TONES[tone][1] + Math.sin(k * Math.PI) * 0.5;
        }, easing.out).then(() => setScreen(tone));
      });
      // een extra bal bij hoge creativiteit: er komen meer ideeën uit dan erin gaan
      if (level >= 8) {
        const extra = ball(0.09, [PAL.roze, PAL.mint, PAL.boter, PAL.lila][Math.floor(Math.random() * 4)]);
        root.add(extra);
        void tween(stage, 1.05, (k) => extra.position.copy(curve.getPointAt(k)), easing.inOut, 0.25).then(() => root.remove(extra));
      }
    },
    setCreativity(n) {
      const prev = level;
      level = n;
      const angle = -Math.PI * 0.75 + (Math.min(n, 11) / 10) * Math.PI * 1.5;
      const from = knob.rotation.y;
      void tween(stage, 0.35, (k) => (knob.rotation.y = from + (-angle - from) * k), easing.spring);
      knobLeds.forEach((m, i) => (m.emissiveIntensity = i <= n && n > 0 ? 1.1 : 0));
      if (!stopped && !sleeping) showLamps(Math.min(n, 11));
      // plant groeit mee
      const h0 = stem.scale.y;
      const h1 = 0.25 + Math.min(n, 10) * 0.075;
      void tween(stage, 0.6, (k) => {
        stem.scale.y = h0 + (h1 - h0) * k;
        flower.position.y = 0.3 + stem.scale.y;
      }, easing.spring);
      leaves.forEach((l, i) => (l.visible = i < Math.floor(Math.min(n, 10) / 2)));
      flower.visible = n >= 8;
      // ledstrip: van lila naar warm roze
      const c = n >= 9 ? PAL.rozeDiep : n >= 6 ? PAL.boter : PAL.lila;
      stripMat.emissive.setHex(c);
      stripMat.color.setHex(c);
      stripMat.emissiveIntensity = 0.15 + Math.min(n, 11) * 0.06;
      if (n >= 7 && n !== prev) startAmbient();
      stage.invalidate();
    },
    setLoad(v) {
      void needle(gLoad, () => loadV, v, (x) => (loadV = x), 0.45);
    },
    setProgress(v) {
      if (v === null) {
        void needle(gProg, () => progV, 0, (x) => (progV = x), 0.8);
        return;
      }
      if (v >= 0.99) {
        // blijft hangen op 99%: de naald probeert het laatste stukje en zakt terug
        void needle(gProg, () => progV, 0.99, (x) => (progV = x), 0.3).then(() =>
          tween(stage, 3.4, (k) => gProg.setValue(0.99 + Math.max(0, Math.sin(k * Math.PI * 6)) * 0.012), easing.linear),
        );
        return;
      }
      void needle(gProg, () => progV, v, (x) => (progV = x), 0.25);
    },
    async sleep() {
      // de machine probeert uit te gaan... en start zichzelf weer op
      sleeping = true;
      for (let i = 10; i >= 0; i--) {
        lamps[i].setOn(0);
        await wait(stage, 0.07);
      }
      await tween(stage, 0.6, (k) => setScreen(tone, 1 - k), easing.inOut);
      void needle(gLoad, () => loadV, 0, (x) => (loadV = x), 0.6);
      await wait(stage, 0.7);
      // opstarten: knipperen, lampjes lopen terug, korte schok
      for (let i = 0; i < 3; i++) {
        setScreen(tone, 0.9);
        await wait(stage, 0.07);
        setScreen("off");
        await wait(stage, 0.08);
      }
      setScreen(tone);
      for (let i = 0; i < 11; i++) {
        lamps[i].setOn(i < level ? 0.85 : 0.25);
        await wait(stage, 0.04);
      }
      sleeping = false;
      showLamps(Math.min(level, 11));
      void shake(0.03, 0.35);
    },
    print() {
      if (S.narrow) return;
      paper.visible = true;
      paper.scale.z = 0.001;
      paper.rotation.x = 0;
      pLed.setOn(1);
      void tween(stage, 0.4, (k) => (pBody.position.y = 0.275 + Math.sin(k * Math.PI * 8) * 0.01), easing.linear);
      void tween(stage, 0.9, (k) => {
        paper.scale.z = 0.001 + k * 0.62;
        paper.rotation.x = k * 0.55;
      }, easing.out).then(() => {
        pLed.setOn(0);
        return wait(stage, 2.2);
      }).then(() =>
        tween(stage, 0.4, (k) => (paper.scale.z = 0.62 * (1 - k) + 0.001), easing.in),
      ).then(() => (paper.visible = false));
    },
    setLever(pull) {
      lever.rotation.x = LEVER_REST + (LEVER_PULLED - LEVER_REST) * pull;
      stage.invalidate();
    },
    capsule(color) {
      const g = new Group();
      const top = sphere(0.14, mat(color, { gloss: 0.4 }), 20);
      top.scale.y = 1.15;
      g.add(top);
      const band = new Mesh(new TorusGeometry(0.14, 0.02, 8, 24), mat(PAL.creme));
      band.rotation.x = Math.PI / 2;
      g.add(band);
      shade(g);
      root.add(g);
      capsules.push(g);
      if (capsules.length > 6) {
        const old = capsules.shift()!;
        void tween(stage, 0.3, (k) => old.scale.setScalar(1 - k), easing.in).then(() => root.remove(old));
      }
      const idx = capsules.length - 1;
      const spot = new Vector3(trayPos.x + Math.cos(idx * 2.4) * 0.3 * (idx ? 1 : 0), 0.28, trayPos.z + Math.sin(idx * 2.4) * 0.28 * (idx ? 1 : 0));
      const curve = capTube.curve;
      void tween(stage, 0.75, (k) => g.position.copy(curve.getPointAt(k)), easing.in).then(() => {
        const p0 = g.position.clone();
        return tween(stage, 0.45, (k) => {
          g.position.set(p0.x + (spot.x - p0.x) * k, p0.y + (spot.y - p0.y) * k + Math.sin(k * Math.PI) * 0.22, p0.z + (spot.z - p0.z) * k);
          g.rotation.z = k * 3;
        }, easing.out);
      });
    },
    setSerious(on) {
      const from = seriousLever.rotation.x;
      void tween(stage, 0.3, (k) => (seriousLever.rotation.x = from + ((on ? -0.45 : 0.45) - from) * k), easing.spring);
    },
    setToggle(k2, on) {
      const t = toggles[k2];
      const from = t.rotation.x;
      void tween(stage, 0.25, (k) => (t.rotation.x = from + ((on ? -0.4 : 0.4) - from) * k), easing.spring);
    },
    setCover(open) {
      const from = coverHinge.rotation.x;
      void tween(stage, 0.4, (k) => (coverHinge.rotation.x = from + ((open ? -1.9 : 0) - from) * k), open ? easing.out : easing.spring);
    },
    emergency(on) {
      stopped = on;
      if (on) {
        void pressCap(stopCap, 0.1, 0.15);
        setScreen("err");
        lamps.forEach((l, i) => l.setOn(i === 10 ? 1 : 0));
        beaconMat.emissiveIntensity = 1.6;
        void needle(gLoad, () => loadV, 0, (x) => (loadV = x), 0.8);
        let t = 0;
        stage.animate((dt) => {
          t += dt;
          reflector.rotation.y += dt * 9;
          beaconMat.emissiveIntensity = 1.1 + Math.sin(t * 9) * 0.6;
          if (!stopped) {
            beaconMat.emissiveIntensity = 0;
            return false;
          }
          return true;
        });
      } else {
        setScreen(tone);
        showLamps(Math.min(level, 11));
      }
    },
    jam(on) {
      stopped = on;
      if (on) {
        setScreen("err");
        lamps.forEach((l, i) => l.setOn(i >= 9 ? 1 : 0));
        void needle(gLoad, () => loadV, 1.03, (x) => (loadV = x), 0.3);
        puff();
        void shake(0.06, 0.8);
      } else {
        setScreen(tone);
        showLamps(Math.min(level, 11));
      }
    },
    thump() {
      void shake(0.08, 0.45);
    },
    screen(t) {
      tone = t;
      if (!stopped && !sleeping) setScreen(t);
      stage.invalidate();
    },
    anchors() {
      const out: Record<string, ConsoleAnchor> = {};
      const put = (id: string, p: Vector3, r: number) => (out[id] = projR(p, r));
      const has = (id: SlotId) => !!S.slots[id];
      if (has("idee")) put("idee", deckPoint(ix, 0.3, iz), 0.5);
      if (has("niets")) put("niets", deckPoint(nx, 0.3, nz), 0.5);
      if (has("knob")) put("knob", deckPoint(kx, 0.3, kz), 0.48);
      if (has("afronden")) put("afronden", deckPoint(ax, 0.25, az), 0.36);
      if (has("domein")) put("domein", deckPoint(dx, 0.25, dz), 0.36);
      if (has("serious")) put("serious", deckPoint(sx, 0.25, sz), 0.36);
      if (has("toggles")) (["koffie", "ambitie", "realisme"] as const).forEach((k, i) => put(k, deckPoint(tx - 0.36 + i * 0.36, 0.25, tz), 0.15));
      if (has("stop")) put("stop", deckPoint(px, 0.3, pz), 0.4);
      const restRot = lever.rotation.x;
      lever.rotation.x = LEVER_REST;
      lever.updateMatrixWorld(true);
      put("lever", worldOf(lever, 1.5), 0.26);
      lever.rotation.x = LEVER_PULLED;
      lever.updateMatrixWorld(true);
      put("leverEnd", worldOf(lever, 1.5), 0.26);
      lever.rotation.x = restRot;
      lever.updateMatrixWorld(true);
      put("rail", worldOf(rail), S.railW / 2);
      put("printer", worldOf(printer, 0.9), 0.5);
      put("tray", worldOf(tray, 0.3), 0.6);
      put("gaugeLoad", worldOf(gLoad, -gR - 0.12), gR);
      put("gaugeProgress", worldOf(gProg, -gR - 0.12), gR);
      put("plant", worldOf(plant, 0.15), 0.3);
      put("lamps", worldOf(lamps[5], 0.3), 0.3);
      return out;
    },
    screenRect() {
      const hw = S.dispW / 2;
      const hh = S.dispH / 2;
      const pts = [
        [-hw, -hh],
        [hw, -hh],
        [-hw, hh],
        [hw, hh],
      ].map(([x, y]) => stage.project(screen.localToWorld(new Vector3(x, y, 0))));
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      // hoeken in de volgorde linksboven, rechtsboven, linksonder, rechtsonder (schermcoördinaten)
      const quad = [pts[2], pts[3], pts[0], pts[1]];
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad };
    },
    dispose() {
      stage.dispose();
    },
  };

  controller.setCreativity(3);
  showLamps(3);
  stage.setCamera(CONSOLE_CAMERAS[layout]);
  stage.render();
  return controller;
}

function layoutReservoirX(S: Spec) {
  // reservoir links naast de toren, printer spiegelbeeldig rechts
  return -(S.towerW / 2 + (S.deskW - S.towerW) / (S.gaugesOnTop ? 4 : 5.5));
}
