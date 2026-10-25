// De 3D-studio: één renderer met zacht studiolicht, contactschaduwen en ‘render op verzoek’.
// Er wordt alleen een frame getekend als er iets beweegt; daarna valt de lus stil (batterij!).

import {
  ACESFilmicToneMapping,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type CameraSpec = { pos: [number, number, number]; target: [number, number, number]; fov: number };
export type Animator = (dt: number, t: number) => boolean; // true = nog bezig

export type Stage = {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  invalidate: () => void;
  animate: (fn: Animator) => void;
  setCamera: (spec: CameraSpec) => void;
  resize: (w: number, h: number) => void;
  project: (obj: Object3D | Vector3) => { x: number; y: number };
  render: () => void;
  setPaused: (paused: boolean) => void;
  dispose: () => void;
};

export type StageOptions = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio?: number;
  shadowSize?: number;
  preserve?: boolean; // nodig voor het uitlezen van de canvas bij pre-renders
  shadowArea?: number;
  neutral?: boolean;
};

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createStage(opts: StageOptions): Stage {
  const renderer = new WebGLRenderer({
    canvas: opts.canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: !!opts.preserve,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(opts.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(opts.width, opts.height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = opts.neutral === false ? ACESFilmicToneMapping : NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  // Zacht studiolicht: een omgevingskamer voor reflecties, plus een hemellamp en één schaduwlamp.
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  scene.add(new HemisphereLight(0xfff6ee, 0xe9dcf5, 1.1));
  const sun = new DirectionalLight(0xffffff, 1.9);
  const area = opts.shadowArea ?? 9;
  sun.position.set(5, 11, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(opts.shadowSize ?? 2048, opts.shadowSize ?? 2048);
  sun.shadow.camera.left = -area;
  sun.shadow.camera.right = area;
  sun.shadow.camera.top = area;
  sun.shadow.camera.bottom = -area;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Contactschaduw op een onzichtbare vloer: de pagina zelf is de achtergrond.
  const floor = new Mesh(new PlaneGeometry(80, 80), new ShadowMaterial({ opacity: 0.16, color: 0x3a2a4a }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const camera = new PerspectiveCamera(24, opts.width / opts.height, 0.5, 120);

  const animators = new Set<Animator>();
  let last = 0; // tijdstip van het vorige frame; 0 = de lus stond stil
  let raf = 0;
  let pending = false;
  let paused = false;
  let elapsed = 0;

  const render = () => renderer.render(scene, camera);

  const frame = () => {
    raf = 0;
    pending = false;
    if (paused) return;
    const now = performance.now();
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now;
    elapsed += dt;
    for (const fn of animators) if (!fn(dt, elapsed)) animators.delete(fn);
    render();
    if (animators.size) schedule();
    else last = 0;
  };
  const schedule = () => {
    if (pending || paused) return;
    pending = true;
    raf = requestAnimationFrame(frame);
  };

  const v = new Vector3();
  return {
    scene,
    camera,
    renderer,
    render,
    invalidate: schedule,
    animate(fn) {
      animators.add(fn);
      schedule();
    },
    setCamera(spec) {
      camera.position.set(...spec.pos);
      camera.fov = spec.fov;
      camera.lookAt(new Vector3(...spec.target));
      camera.updateProjectionMatrix();
      schedule();
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      schedule();
    },
    project(obj) {
      if (obj instanceof Vector3) v.copy(obj);
      else obj.getWorldPosition(v);
      v.project(camera);
      return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
    },
    setPaused(p) {
      paused = p;
      if (p) {
        cancelAnimationFrame(raf);
        raf = 0;
        pending = false;
        last = 0;
      } else if (animators.size) schedule();
    },
    dispose() {
      cancelAnimationFrame(raf);
      animators.clear();
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as { dispose?: () => void } | { dispose?: () => void }[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose?.());
        else mat?.dispose?.();
      });
      env.dispose();
      renderer.dispose();
    },
  };
}

// ---------- Tweens: natuurlijke timing voor mechanische bewegingen ----------

export const easing = {
  linear: (t: number) => t,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  // veer: schiet een fractie door en komt dan tot rust
  spring: (t: number) => 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 6),
  // stoot: snel omlaag, rustig terug (stempel, pers)
  thump: (t: number) => (t < 0.25 ? easing.in(t / 0.25) : 1 - easing.out((t - 0.25) / 0.75)),
};

/** Laat een waarde in `duration` seconden verlopen; `apply` krijgt de (geëasde) voortgang 0..1. */
export function tween(stage: Stage, duration: number, apply: (k: number) => void, ease: (t: number) => number = easing.inOut, delay = 0): Promise<void> {
  return new Promise((resolve) => {
    let t = -delay;
    stage.animate((dt) => {
      t += dt;
      if (t < 0) return true;
      const p = Math.min(1, t / duration);
      apply(ease(p));
      if (p >= 1) {
        resolve();
        return false;
      }
      return true;
    });
  });
}

export const wait = (stage: Stage, s: number) => tween(stage, s, () => {}, easing.linear);
