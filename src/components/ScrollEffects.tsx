// Scrollgedreven effecten voor de hele site:
// - .reveal schuift rustig binnen zodra het in beeld komt;
// - .draw (SVG) wordt ‘getekend’ door de lijnen één keer uit te trekken.
// Beide gebeuren één keer per element en respecteren prefers-reduced-motion.

import { useEffect } from "react";
import { useRouter } from "../router";
import { reducedMotion } from "../lib/hooks";

const SHAPES = "path, line, circle, rect, polyline, polygon, ellipse";

function prepareDrawing(svg: Element) {
  svg.querySelectorAll<SVGGeometryElement>(SHAPES).forEach((el) => {
    if (el.style.getPropertyValue("--len")) return;
    try {
      const len = Math.ceil(el.getTotalLength());
      if (len > 0) el.style.setProperty("--len", String(len));
    } catch {
      /* elementen zonder lengte (bijv. verborgen) overslaan */
    }
  });
}

export function ScrollEffects() {
  const { path } = useRouter();

  useEffect(() => {
    const skip = reducedMotion() || !("IntersectionObserver" in window);
    const io = skip
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              const el = e.target as HTMLElement;
              if (el.classList.contains("draw")) el.classList.add("is-drawing");
              el.classList.add("is-in");
              io?.unobserve(el);
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );

    if (!skip) document.documentElement.classList.add("js-draw");
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(".reveal, .draw").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (skip) {
          el.classList.add("is-in", "is-drawing");
          return;
        }
        if (el.classList.contains("draw")) prepareDrawing(el);
        io!.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    const main = document.getElementById("inhoud");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, [path]);

  return null;
}
