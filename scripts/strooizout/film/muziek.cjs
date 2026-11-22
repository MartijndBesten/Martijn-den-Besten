// Eigen muziek onder de promotiefilmpjes: een winters deuntje met pit. Klokjes en een fel synthje spelen de melodie,
// eronder een stevige beat (kick op elke tel, klap op twee en vier, hi-hats), een drijvende bas en sleebellen.
// Alles is hier in code gemaakt (geen opname, geen muziek van anderen, dus geen rechten of licentie nodig).
// Elk filmpje heeft een eigen arrangement dat op de beelden is afgestemd (de zak die in beeld komt, licht dat aangaat,
// een val, het eindbeeld).
// Gebruik: require("./film/muziek.cjs").maakMuziek("buurt" | "fiets" | "opa", duurInSeconden, "uit.wav")
const fs = require("node:fs");

const SR = 44100;
const TAU = Math.PI * 2;
const NOOT = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
/** "A4" → 440 Hz */
const hz = (naam) => {
  const m = /^([A-G]#?)(\d)$/.exec(naam);
  return 440 * Math.pow(2, (NOOT[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
};

function studio(duur) {
  const n = Math.ceil((duur + 0.05) * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let zaad = 12345;
  const ruis = () => {
    zaad = (zaad * 1664525 + 1013904223) >>> 0;
    return zaad / 2147483648 - 1;
  };
  const zet = (i, v, pan) => {
    if (i < 0 || i >= n) return;
    L[i] += v * (1 - Math.max(0, pan));
    R[i] += v * (1 + Math.min(0, pan));
  };
  const stem = (t0, lengte, pan, fn) => {
    const a = Math.floor(t0 * SR);
    const m = Math.floor(lengte * SR);
    for (let i = 0; i < m; i++) zet(a + i, fn(i / SR), pan);
  };
  return {
    L,
    R,
    n,
    /** klokje: helder, met een paar snel uitstervende boventonen */
    bel(t0, noot, vol = 0.2, pan = 0, lang = 1) {
      const f = typeof noot === "number" ? noot : hz(noot);
      stem(t0, 2.2 * lang, pan, (t) => {
        const aanzet = 1 - Math.exp(-t / 0.002);
        return vol * aanzet * (Math.sin(TAU * f * t) * Math.exp(-t / (0.5 * lang)) + 0.4 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / 0.22) + 0.22 * Math.sin(TAU * f * 3.01 * t) * Math.exp(-t / 0.1) + 0.1 * Math.sin(TAU * f * 4.2 * t) * Math.exp(-t / 0.06));
      });
    },
    /** zachte akkoordlaag */
    vlak(t0, lengte, noten, vol = 0.05) {
      for (const [k, noot] of noten.entries()) {
        const f = hz(noot);
        stem(t0, lengte + 0.8, (k % 2 ? 0.25 : -0.25), (t) => {
          const omhul = Math.min(1, t / 0.45) * Math.min(1, Math.max(0, (lengte + 0.8 - t) / 0.8));
          const zweving = 1 + 0.08 * Math.sin(TAU * 0.6 * t + k);
          return vol * omhul * zweving * (Math.sin(TAU * f * 1.003 * t) + Math.sin(TAU * f * 0.997 * t) + 0.18 * Math.sin(TAU * f * 2 * t));
        });
      }
    },
    bas(t0, noot, vol = 0.16, lang = 0.45) {
      const f = hz(noot);
      stem(t0, lang * 3, 0, (t) => vol * (1 - Math.exp(-t / 0.004)) * Math.exp(-t / lang) * (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)));
    },
    /** getokkelde snaar, kort (voor het sluipende begin van het fietsfilmpje) */
    pluk(t0, noot, vol = 0.16, pan = 0) {
      const f = hz(noot);
      stem(t0, 0.6, pan, (t) => vol * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / 0.11) * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2 * t) + 0.25 * Math.sin(TAU * f * 3 * t)));
    },
    /** sleebel: een kort hoog rinkeltje */
    slee(t0, vol = 0.03, pan = 0.2) {
      let vorig = 0;
      stem(t0, 0.14, pan, (t) => {
        const r = ruis();
        const hoog = r - vorig;
        vorig = r;
        return vol * hoog * Math.exp(-t / 0.035) * (0.6 + 0.4 * Math.sin(TAU * 6200 * t));
      });
    },
    kik(t0, vol = 0.22) {
      let fase = 0;
      stem(t0, 0.3, 0, (t) => {
        fase += (TAU * (46 + 70 * Math.exp(-t / 0.03))) / SR;
        return vol * Math.exp(-t / 0.12) * Math.sin(fase);
      });
    },
    /** glijfluitje: toon die omlaag (of omhoog) glijdt, voor een uitglijder */
    glij(t0, f0, f1, lengte = 0.5, vol = 0.12, pan = 0) {
      let fase = 0;
      stem(t0, lengte, pan, (t) => {
        const u = t / lengte;
        const f = f0 * Math.pow(f1 / f0, u) * (1 + 0.015 * Math.sin(TAU * 7 * t));
        fase += (TAU * f) / SR;
        return vol * Math.sin(Math.PI * Math.min(1, u * 1.05)) * (Math.sin(fase) + 0.2 * Math.sin(2 * fase));
      });
    },
    /** zachte plof bij het neerkomen */
    plof(t0, vol = 0.3) {
      let fase = 0;
      let laag = 0;
      stem(t0, 0.35, 0, (t) => {
        fase += (TAU * (42 + 60 * Math.exp(-t / 0.05))) / SR;
        laag += (ruis() - laag) * 0.06;
        return vol * Math.exp(-t / 0.09) * (Math.sin(fase) + 1.6 * laag);
      });
    },
    /** fel synthje: twee zaagtanden door een filter dat snel dichtgaat (voor melodie en akkoordstoten) */
    synth(t0, noot, vol = 0.1, pan = 0, lang = 0.2) {
      const f = typeof noot === "number" ? noot : hz(noot);
      let f1 = 0;
      let f2 = 0;
      let laag = 0;
      stem(t0, lang * 4, pan, (t) => {
        f1 = (f1 + (f * 1.004) / SR) % 1;
        f2 = (f2 + (f * 0.996) / SR) % 1;
        const a = 1 - Math.exp((-TAU * (700 + 5200 * Math.exp(-t / 0.07))) / SR);
        laag += a * (f1 + f2 - 1 - laag);
        return vol * (1 - Math.exp(-t / 0.003)) * Math.exp(-t / lang) * laag * 1.6;
      });
    },
    /** synthbas: zaagtand met een lage sinus eronder */
    synthbas(t0, noot, vol = 0.2, lang = 0.16) {
      const f = hz(noot);
      let fase = 0;
      let laag = 0;
      stem(t0, lang * 4, 0, (t) => {
        fase = (fase + f / SR) % 1;
        const a = 1 - Math.exp((-TAU * (160 + 1100 * Math.exp(-t / 0.05))) / SR);
        laag += a * (2 * fase - 1 - laag);
        return vol * (1 - Math.exp(-t / 0.003)) * Math.exp(-t / lang) * (laag * 1.3 + 0.8 * Math.sin(TAU * f * t));
      });
    },
    /** kick met een tik erop, voor de beat */
    bons(t0, vol = 0.45) {
      let fase = 0;
      stem(t0, 0.32, 0, (t) => {
        fase += (TAU * (48 + 120 * Math.exp(-t / 0.022))) / SR;
        return vol * (Math.exp(-t / 0.13) * Math.sin(fase) + 0.25 * Math.exp(-t / 0.004) * ruis());
      });
    },
    /** handklap */
    klap(t0, vol = 0.2) {
      let band = 0;
      let laag = 0;
      stem(t0, 0.3, 0.1, (t) => {
        const r = ruis();
        laag += 0.35 * (r - laag);
        band += 0.5 * (laag - band);
        const hoog = laag - band * 0.6;
        const omhul = Math.exp(-(t % 0.011) / 0.004) * (t < 0.033 ? 1 : 0) + (t >= 0.03 ? Math.exp(-(t - 0.03) / 0.085) : 0);
        return vol * hoog * omhul * 2.2;
      });
    },
    /** hi-hat (dicht of open) */
    hat(t0, vol = 0.05, open = false, pan = 0.25) {
      let vorig = 0;
      let vorig2 = 0;
      stem(t0, open ? 0.3 : 0.07, pan, (t) => {
        const r = ruis();
        const hoog = r - 2 * vorig + vorig2;
        vorig2 = vorig;
        vorig = r;
        return vol * hoog * 0.5 * Math.exp(-t / (open ? 0.09 : 0.018));
      });
    },
    /** bekken bij een inzet */
    bekken(t0, vol = 0.12) {
      let vorig = 0;
      stem(t0, 1.8, -0.1, (t) => {
        const r = ruis();
        const hoog = r - vorig;
        vorig = r;
        return vol * hoog * Math.exp(-t / 0.45) * (0.7 + 0.3 * Math.sin(TAU * 5300 * t));
      });
    },
    /** aanloop naar een inzet: ruis die aanzwelt en een toon die omhoog glijdt */
    aanloop(t0, lengte, vol = 0.1) {
      let fase = 0;
      let vorig = 0;
      stem(t0, lengte, 0, (t) => {
        const u = t / lengte;
        const r = ruis();
        const hoog = r - vorig * (1 - u * 0.9);
        vorig = r;
        fase += (TAU * 220 * Math.pow(4, u)) / SR;
        return vol * u * u * (hoog * 0.8 + 0.5 * Math.sin(fase));
      });
    },
    /** rij klokjes kort na elkaar omhoog */
    harp(t0, noten, stap = 0.05, vol = 0.14) {
      noten.forEach((noot, i) => this.bel(t0 + i * stap, noot, vol * (0.8 + (0.2 * i) / noten.length), -0.4 + (0.8 * i) / Math.max(1, noten.length - 1), 0.9));
    },
  };
}

/** Eenvoudige galm (kamfilters en twee allpass-filters), zodat de klokjes ruimte krijgen. */
function galm(x, mix = 0.24) {
  const uit = new Float32Array(x.length);
  for (const [vertraging, terug] of [[1557, 0.8], [1617, 0.79], [1491, 0.8], [1422, 0.78], [1277, 0.77]]) {
    const buf = new Float32Array(vertraging);
    let demp = 0;
    for (let i = 0, p = 0; i < x.length; i++, p = (p + 1) % vertraging) {
      const y = buf[p];
      demp = y * 0.72 + demp * 0.28;
      buf[p] = x[i] + demp * terug;
      uit[i] += y * 0.2;
    }
  }
  for (const vertraging of [225, 556]) {
    const buf = new Float32Array(vertraging);
    for (let i = 0, p = 0; i < uit.length; i++, p = (p + 1) % vertraging) {
      const b = buf[p];
      const y = -0.5 * uit[i] + b;
      buf[p] = uit[i] + 0.5 * y;
      uit[i] = y;
    }
  }
  for (let i = 0; i < x.length; i++) uit[i] = x[i] * (1 - mix * 0.4) + uit[i] * mix;
  return uit;
}

// Akkoorden: [vlak (drie noten), bas]
const AKKOORD = {
  Am: [["A3", "C4", "E4"], "A2"],
  F: [["A3", "C4", "F4"], "F2"],
  C: [["G3", "C4", "E4"], "C3"],
  G: [["G3", "B3", "D4"], "G2"],
  C9: [["G3", "D4", "E4"], "C3"],
};

/** Het thema: per maat acht achtsten, doorlopend, gespeeld door de klokjes en het synthje. */
const THEMA = {
  C: ["E5", "G5", "C6", "G5", "E6", "C6", "G5", "C6"],
  G: ["D5", "G5", "B5", "G5", "D6", "B5", "G5", "B5"],
  Am: ["C5", "E5", "A5", "E5", "C6", "A5", "E5", "A5"],
  F: ["C5", "F5", "A5", "F5", "C6", "A5", "F5", "A5"],
  FG: ["F5", "A5", "C6", "A5", "G5", "B5", "D6", "B5"],
  Gop: ["D5", "G5", "B5", "D6", "G5", "B5", "D6", "G6"], // opbouw naar de volgende inzet
};
const octaaf = (noot, d) => noot.slice(0, -1) + (Number(noot.slice(-1)) + d);

/** De beat van één maat: kick op elke tel, klap op twee en vier, hi-hats ertussen. */
function beat(s, t0, maat, opbouw = false) {
  const acht = maat / 8;
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) s.bons(t0 + i * acht, 0.46);
    if (i === 2 || i === 6) s.klap(t0 + i * acht, 0.19);
    s.hat(t0 + i * acht, i % 2 ? 0.075 : 0.04, i === 7, i % 2 ? 0.3 : -0.2);
    s.hat(t0 + i * acht + acht / 2, 0.022, false, 0.1);
    s.slee(t0 + i * acht, i % 2 ? 0.02 : 0.012, i % 2 ? 0.4 : -0.3);
  }
  // opbouw: roffel van klappen in de tweede helft van de maat
  if (opbouw) for (let i = 0; i < 8; i++) s.klap(t0 + maat / 2 + (i * acht) / 2, 0.07 + i * 0.016);
}

function arrangement(s, { maat, begin, akkoorden, einde }) {
  const acht = maat / 8;
  s.bekken(begin, 0.13);
  akkoorden.forEach((naam, m) => {
    const t0 = begin + m * maat;
    const opbouw = naam === "Gop";
    const helften = naam === "FG" ? ["F", "G"] : opbouw ? ["G", "G"] : [naam, naam];
    beat(s, t0, maat, opbouw);
    helften.forEach((ak, k) => {
      const [vlak, bas] = AKKOORD[ak];
      const t = t0 + (k * maat) / 2;
      s.vlak(t, maat / 2, vlak, 0.03);
      // drijvende bas: grondtoon met sprongen naar het octaaf
      [bas, null, bas, octaaf(bas, 1)].forEach((noot, i) => noot && s.synthbas(t + i * acht, noot, i === 0 ? 0.24 : 0.19));
      // akkoordstoten tegen de tel in
      for (const i of [1, 3]) vlak.forEach((noot, j) => s.synth(t + i * acht, octaaf(noot, 1), 0.035, -0.3 + j * 0.3, 0.09));
    });
    THEMA[naam].forEach((noot, i) => {
      s.bel(t0 + i * acht, noot, i % 4 === 0 ? 0.15 : 0.1, i % 2 ? 0.3 : -0.2, 0.7);
      if (i === 0 || i === 3 || i === 6 || opbouw) s.synth(t0 + i * acht, octaaf(noot, -1), 0.085, i % 2 ? -0.25 : 0.2, 0.17);
    });
    if (opbouw) s.aanloop(t0, maat, 0.1);
  });
  // slot: één klap op de grondtoon die uitklinkt
  const t = begin + akkoorden.length * maat;
  s.bons(t, 0.5);
  s.klap(t, 0.2);
  s.bekken(t, 0.16);
  s.synthbas(t, "C2", 0.3, 0.6);
  s.vlak(t, Math.max(0.5, einde - t), AKKOORD.C[0], 0.05);
  for (const [i, noot] of ["C5", "E5", "G5"].entries()) s.synth(t, noot, 0.06, -0.3 + i * 0.3, 0.5);
  s.bel(t, "C6", 0.19, 0, 2);
  s.bel(t, "E6", 0.13, -0.3, 2);
  s.harp(t + 0.3, ["G5", "C6", "E6", "G6", "C7"], 0.09, 0.09);
}

function buurt(s, duur) {
  // begin: koud en kaal (glad voor de deur), met een tikkende hi-hat; dan een aanloop tot de zak in beeld komt
  s.vlak(0, 1.5, AKKOORD.Am[0], 0.05);
  s.bas(0, "A2", 0.14, 0.8);
  s.bel(0.25, "E5", 0.13, -0.3, 1.2);
  s.bel(1.0, "A4", 0.11, 0.3, 1.2);
  s.vlak(1.5, 1.5, AKKOORD.F[0], 0.05);
  s.bas(1.5, "F2", 0.15, 0.8);
  ["F5", "A5", "C6", "F6"].forEach((noot, i) => s.bel(1.5 + i * 0.25, noot, 0.11 + i * 0.012, -0.3 + i * 0.2, 0.8));
  for (let i = 0; i < 12; i++) s.hat(i * 0.25, 0.03 + i * 0.004, false, i % 2 ? 0.3 : -0.2);
  s.aanloop(1.9, 1.1, 0.11);
  for (let i = 0; i < 6; i++) s.klap(2.25 + i * 0.125, 0.06 + i * 0.022);
  // inzet op 3,0 s (de zak), opbouw naar 13,0 s (alles sluit aan, eindbeeld), slotklap op 17,0 s
  arrangement(s, { maat: 2, begin: 3, akkoorden: ["C", "G", "Am", "F", "Gop", "C", "FG"], einde: duur });
  // accenten op het beeld: licht aan bij de buren, buren die meedoen, alles sluit aan
  for (const t of [6.3, 8.85]) s.harp(t, ["G6", "C7"], 0.07, 0.11);
  [[10.3, "C6"], [10.8, "D6"], [11.3, "E6"], [11.8, "G6"], [12.2, "A6"]].forEach(([t, noot]) => s.bel(t, noot, 0.1, 0.3, 0.8));
  s.bekken(13, 0.15);
  s.harp(13.0, ["C5", "E5", "G5", "C6", "E6", "G6", "C7"], 0.04, 0.1);
}

function fiets(s, duur) {
  const tel = 0.5;
  // begin: sluipend getokkel in mineur terwijl de fietsers aan komen rijden; een glijfluitje en een plof bij elke val
  [["A2", "C3", "E3", "C3"], ["G2", "B2", "D3", "B2"]].forEach((noten, m) => {
    noten.forEach((noot, i) => {
      s.pluk(m * 2 + i * tel, noot, 0.24, -0.1);
      s.pluk(m * 2 + i * tel + tel / 2, m === 0 ? "E4" : "D4", 0.08, 0.4);
      s.hat(m * 2 + i * tel + tel / 2, 0.04);
    });
  });
  for (const val of [1.5, 3.3]) {
    s.glij(val - 0.05, 1050, 330, 0.52, 0.12, val < 2.5 ? -0.3 : 0.3);
    s.plof(val + 0.52, 0.4);
    s.pluk(val + 0.62, "E3", 0.12);
    s.bel(val + 0.95, "G#4", 0.07, 0, 0.5);
  }
  // aanloop tot de zak in beeld komt
  s.aanloop(3.9, 0.6, 0.11);
  for (let i = 0; i < 4; i++) s.klap(4.0 + i * 0.125, 0.07 + i * 0.03);
  // inzet op 4,5 s (de zak), eindbeeld rond 13,2 s, slotklap op 16,5 s
  arrangement(s, { maat: 2, begin: 4.5, akkoorden: ["C", "G", "Am", "FG", "C", "FG"], einde: duur });
  // fietsbel van de voorbijganger
  for (const t of [10.0, 10.11, 10.36, 10.47]) s.bel(t, "E7", 0.08, 0.4, 0.35);
  s.bekken(12.5, 0.13);
}

function opa(s, duur) {
  // begin: opa schuifelt (getokkel op elke stap), de rollator schiet weg, het hondje glijdt uit
  for (let i = 0; i < 9; i++) {
    s.pluk(i * 0.5, i % 2 ? "E3" : "A2", 0.22, -0.1);
    if (i < 5) s.pluk(i * 0.5 + 0.25, "C4", 0.07, 0.4);
    s.hat(i * 0.5 + 0.25, 0.035);
  }
  s.glij(2.2, 620, 380, 0.3, 0.1, -0.2);
  s.glij(2.55, 1000, 420, 0.4, 0.11, 0.3);
  s.plof(2.95, 0.3);
  s.bel(3.3, "G#4", 0.07, 0, 0.5);
  // de buurjongen komt aangerend: aanloop, dan de inzet als hij begint te strooien
  s.aanloop(3.6, 1.4, 0.11);
  for (let i = 0; i < 6; i++) s.klap(4.25 + i * 0.125, 0.06 + i * 0.022);
  arrangement(s, { maat: 2, begin: 5, akkoorden: ["C", "G", "Am", "FG", "C", "FG"], einde: duur });
  // duim omhoog: twee keer een tinkel
  for (const t of [7.2, 11.8]) s.harp(t, ["E6", "G6", "C7"], 0.06, 0.11);
  s.bekken(13, 0.13);
}

/** Maakt de muziek voor een filmpje en schrijft die als WAV (16 bit, stereo). */
function maakMuziek(film, duur, pad) {
  const s = studio(duur);
  ({ fiets, opa }[film] || buurt)(s, duur);
  const kanalen = [galm(s.L), galm(s.R)];
  // uitfaden aan het eind, en het geheel op een rustig niveau zetten
  let piek = 0;
  for (const k of kanalen) {
    for (let i = 0; i < k.length; i++) {
      const t = i / SR;
      k[i] *= Math.min(1, t / 0.02) * Math.min(1, Math.max(0, (duur - t) / 1.1));
      piek = Math.max(piek, Math.abs(k[i]));
    }
  }
  const sterkte = 0.72 / (piek || 1);
  const n = Math.floor(duur * SR);
  const data = Buffer.alloc(44 + n * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + n * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.tanh(kanalen[0][i] * sterkte * 2.1) * 29500), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.tanh(kanalen[1][i] * sterkte * 2.1) * 29500), 46 + i * 4);
  }
  fs.writeFileSync(pad, data);
  return pad;
}

module.exports = { maakMuziek };

if (require.main === module) {
  const [film = "buurt", duur = "18.5", pad = `muziek-${film}.wav`] = process.argv.slice(2);
  console.log("gemaakt:", maakMuziek(film, Number(duur), pad));
}
