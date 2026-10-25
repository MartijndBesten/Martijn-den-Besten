// Gedeelde laadlogica voor de interactieve 3D-scènes (ideeënmachine en Control Center).
//
// - Eerst staat er een poster; three.js wordt pas geladen zodra de bezoeker iets doet (muis, toets,
//   aanraking) én de scène in de buurt van het beeld is. Zo blijft de eerste paginalading licht.
// - Zonder WebGL, met ‘minder beweging’ of met databesparing blijft de poster staan (`static`);
//   alle bediening werkt dan gewoon via de HTML-laag.
// - Buiten beeld wordt de render-lus gepauzeerd; bij een andere compositie (breed/compact) wordt de
//   scène opnieuw opgebouwd.

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type SceneMode = "poster" | "loading" | "live" | "static";
export type Quality = { pixelRatio: number; shadowSize: number };

type Controller = {
  stage: { setPaused: (p: boolean) => void; resize: (w: number, h: number) => void };
  dispose: () => void;
};

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Minder pixels en kleinere schaduwkaarten op kleine schermen en zwakke apparaten. */
export function quality(compact: boolean): Quality {
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 3;
  return {
    pixelRatio: Math.min(window.devicePixelRatio || 1, weak ? 1.25 : compact ? 1.5 : 2),
    shadowSize: weak || compact ? 1024 : 2048,
  };
}

export function useLazy3D<T extends Controller>(opts: {
  stageRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  build: (canvas: HTMLCanvasElement, w: number, h: number) => Promise<T>;
  /** Wisselt de compositie; bij een nieuwe waarde wordt de scène opnieuw opgebouwd. */
  layout: string;
  /** Bijvoorbeeld bij ‘minder beweging’: dan nooit 3D laden. */
  disabled: boolean;
  /** Wordt aangeroepen zodra een (nieuwe) scène klaarstaat, om de huidige toestand over te zetten. */
  onReady?: (c: T) => void;
}) {
  const { stageRef, canvasRef, layout, disabled } = opts;
  const [mode, setModeState] = useState<SceneMode>("poster");
  const modeRef = useRef<SceneMode>("poster");
  const ctl = useRef<T | null>(null);
  const loading = useRef<Promise<T | null> | null>(null);
  const buildRef = useRef(opts.build);
  buildRef.current = opts.build;
  const readyRef = useRef(opts.onReady);
  readyRef.current = opts.onReady;
  const visible = useRef(true);

  const setMode = (m: SceneMode) => {
    modeRef.current = m;
    setModeState(m);
  };

  const create = useCallback(async (): Promise<T | null> => {
    const canvas = canvasRef.current;
    const el = stageRef.current;
    if (!canvas || !el) return null;
    const r = el.getBoundingClientRect();
    const c = await buildRef.current(canvas, Math.max(1, r.width), Math.max(1, r.height));
    ctl.current = c;
    c.stage.setPaused(!visible.current);
    readyRef.current?.(c);
    return c;
  }, [canvasRef, stageRef]);

  const activate = useCallback((): Promise<T | null> => {
    if (ctl.current) return Promise.resolve(ctl.current);
    if (loading.current) return loading.current;
    if (modeRef.current === "static") return Promise.resolve(null);
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (disabled || saveData || !webglAvailable()) {
      setMode("static");
      return Promise.resolve(null);
    }
    setMode("loading");
    loading.current = create()
      .then((c) => {
        setMode(c ? "live" : "static");
        return c;
      })
      .catch(() => {
        setMode("static");
        return null;
      })
      .finally(() => (loading.current = null));
    return loading.current;
  }, [create, disabled]);

  useEffect(() => {
    if (disabled) {
      ctl.current?.dispose();
      ctl.current = null;
      setMode("static");
    }
  }, [disabled]);

  // Laden bij de eerste echte interactie, mits de scène (bijna) in beeld is.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let near = !("IntersectionObserver" in window);
    let wanted = false;
    const io = near
      ? null
      : new IntersectionObserver(
          ([e]) => {
            near = e.isIntersecting;
            visible.current = e.isIntersecting;
            ctl.current?.stage.setPaused(!e.isIntersecting);
            if (near && wanted) void activate();
          },
          { rootMargin: "200px" },
        );
    io?.observe(el);
    const events = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
    const onUser = () => {
      wanted = true;
      events.forEach((e) => window.removeEventListener(e, onUser));
      if (near) void activate();
    };
    events.forEach((e) => window.addEventListener(e, onUser, { passive: true }));
    return () => {
      io?.disconnect();
      events.forEach((e) => window.removeEventListener(e, onUser));
    };
  }, [activate, stageRef]);

  // Andere compositie: opnieuw opbouwen (alleen als er al een scène draaide).
  const builtFor = useRef(layout);
  useEffect(() => {
    if (builtFor.current === layout) return;
    builtFor.current = layout;
    if (!ctl.current) return;
    ctl.current.dispose();
    ctl.current = null;
    // een verbruikte canvas krijgt geen nieuwe WebGL-context: React maakt hem opnieuw aan via `key`
    requestAnimationFrame(() => void create().catch(() => setMode("static")));
  }, [layout, create]);

  // Meeschalen met de pagina.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || mode !== "live" || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(([e]) => ctl.current?.stage.resize(Math.max(1, e.contentRect.width), Math.max(1, e.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, stageRef, layout]);

  useEffect(
    () => () => {
      ctl.current?.dispose();
      ctl.current = null;
    },
    [],
  );

  return { mode, ctl, activate };
}
