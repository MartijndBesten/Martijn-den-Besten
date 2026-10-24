export type Rng = () => number;

/** Kleine deterministische generator (mulberry32), handig voor tests en vaste kunstwerken. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(list: readonly T[], rng: Rng = Math.random): T {
  return list[Math.floor(rng() * list.length)];
}

export function shuffle<T>(list: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Kiest een element dat niet gelijk is aan het vorige, zodat knoppen nooit twee keer hetzelfde zeggen. */
export function pickFresh<T>(list: readonly T[], previous: T | undefined, rng: Rng = Math.random): T {
  if (list.length < 2) return list[0];
  let next = pick(list, rng);
  while (next === previous) next = pick(list, rng);
  return next;
}
