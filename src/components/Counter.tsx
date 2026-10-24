// Telt op tot de waarde zodra hij in beeld komt. Bij 'live' tikt hij daarna af en toe verder.

import { useEffect, useState } from "react";
import { useInView, reducedMotion } from "../lib/hooks";

const fmt = new Intl.NumberFormat("nl-NL");

export function Counter({ value, live = false }: { value: number; live?: boolean }) {
  const [ref, seen] = useInView<HTMLSpanElement>("-10% 0px");
  const [n, setN] = useState(0);
  const [extra, setExtra] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (reducedMotion()) {
      setN(value);
      return;
    }
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  useEffect(() => {
    if (!live || !seen) return;
    const iv = window.setInterval(() => setExtra((x) => x + 1), 4200);
    return () => window.clearInterval(iv);
  }, [live, seen]);

  return (
    <span ref={ref} className="counter">
      {fmt.format(n + extra)}
    </span>
  );
}
