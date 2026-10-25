export {};
// Renderbank voor ontwikkeling: bouwt een scène en geeft de canvas en ankerpunten vrij,
// zodat scripts/render-3d.mjs er posters en museumobjecten van kan maken. Niet in de productiebuild.

const params = new URLSearchParams(location.search);
const w = Number(params.get("w") ?? 1600);
const h = Number(params.get("h") ?? 1300);
const canvas = document.getElementById("c") as HTMLCanvasElement;
canvas.style.width = `${w}px`;
canvas.style.height = `${h}px`;

declare global {
  interface Window {
    __done?: boolean;
    __anchors?: unknown;
    __error?: string;
  }
}

async function main() {
  const scene = params.get("scene") ?? "machine";
  if (scene === "machine") {
    const { buildIdeaMachine } = await import("./scenes/ideaMachine");
    const m = buildIdeaMachine(canvas, w, h, (params.get("cam") as "wide" | "compact") ?? "wide", { preserve: true, pixelRatio: 1 });
    (m.stage.renderer as { setPixelRatio: (n: number) => void }).setPixelRatio(1);
    if (params.get("campos")) {
      const [px, py, pz, tx, ty, tz, fov] = params.get("campos")!.split(",").map(Number);
      m.stage.setCamera({ pos: [px, py, pz], target: [tx, ty, tz], fov });
    }
    m.stage.resize(w, h);
    m.stage.render();
    window.__anchors = m.anchors();
    if (params.get("run")) {
      void m.run({});
      await new Promise((r) => setTimeout(r, Number(params.get("run"))));
    }
  } else if (scene === "console") {
    const { buildConsole, CONSOLE_CAMERAS } = await import("./scenes/console");
    const layout = (params.get("cam") as "wide" | "compact") ?? "wide";
    const c = buildConsole(canvas, w, h, layout, { preserve: true, pixelRatio: 1 });
    if (params.get("campos")) {
      const [px, py, pz, tx, ty, tz, fov] = params.get("campos")!.split(",").map(Number);
      c.stage.setCamera({ pos: [px, py, pz], target: [tx, ty, tz], fov });
    } else c.stage.setCamera(CONSOLE_CAMERAS[layout]);
    c.stage.resize(w, h);
    if (params.get("level")) c.setCreativity(Number(params.get("level")));
    if (params.get("demo")) {
      c.setCover(true);
      c.print();
      c.capsule(0xf2b6c3);
      c.setLever(0.6);
      c.setLoad(0.6);
      c.setProgress(0.5);
      await new Promise((r) => setTimeout(r, 2500));
    }
    c.stage.render();
    window.__anchors = { anchors: c.anchors(), screen: c.screenRect() };
  } else {
    const mod = await import("./scenes/objects");
    await mod.renderObject(canvas, w, h, scene, params);
    if (window.__output) {
      // een strook (draaiplateau) vervangt de gewone canvas als uitvoer
      window.__output.id = "c";
      canvas.removeAttribute("id");
      document.body.append(window.__output);
    }
  }
  window.__done = true;
}
main().catch((e) => {
  window.__error = String(e?.stack ?? e);
});
