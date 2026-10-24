// Gesynthetiseerde geluidjes via Web Audio. Standaard uit; er worden geen audiobestanden geladen.

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (on && !ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      ctx = null;
    }
  }
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; v?: number };

function play(notes: Note[]): void {
  if (!enabled || !ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const start = ctx.currentTime;
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = n.type ?? "square";
    osc.frequency.value = n.f;
    const v = n.v ?? 0.06;
    gain.gain.setValueAtTime(0, start + n.t);
    gain.gain.linearRampToValueAtTime(v, start + n.t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.t + n.d);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + n.t);
    osc.stop(start + n.t + n.d + 0.02);
  }
}

export const sfx = {
  click: () => play([{ f: 660, t: 0, d: 0.05 }]),
  blip: () => play([{ f: 880, t: 0, d: 0.06 }, { f: 1320, t: 0.06, d: 0.08 }]),
  error: () => play([{ f: 180, t: 0, d: 0.18, type: "sawtooth" }, { f: 140, t: 0.18, d: 0.25, type: "sawtooth" }]),
  success: () => play([523, 659, 784, 1046].map((f, i) => ({ f, t: i * 0.08, d: 0.14, type: "triangle" as const, v: 0.08 }))),
  clunk: () => play([{ f: 90, t: 0, d: 0.2, type: "triangle", v: 0.15 }, { f: 60, t: 0.05, d: 0.25, type: "sine", v: 0.12 }]),
  alarm: () => play([0, 1, 2, 3].flatMap((i) => [{ f: 740, t: i * 0.4, d: 0.18, type: "sawtooth" as const }, { f: 520, t: i * 0.4 + 0.2, d: 0.18, type: "sawtooth" as const }])),
  tick: () => play([{ f: 1200, t: 0, d: 0.02, v: 0.03 }]),
};
