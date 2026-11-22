// Eigen muziek onder de promotiefilmpjes: een speels, getokkeld deuntje (pizzicato). Een wandelende getokkelde bas,
// tokkels tegen de tel in en een getokkelde melodie met hier en daar een klokje, op een lichte beat met sleebellen.
// Het begin is sluipend en in mineur (het is glad); zodra er gestrooid wordt gaat hetzelfde getokkel door in majeur.
// Alles is hier in code gemaakt (geen opname, geen muziek van anderen, dus geen rechten of licentie nodig).
// Elk filmpje heeft een eigen arrangement dat op de beelden is afgestemd (een val, licht dat aangaat, een fietsbel,
// een duim omhoog, het eindbeeld).
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
    pluk(t0, noot, vol = 0.16, pan = 0, lang = 0.11) {
      const f = hz(noot);
      stem(t0, lang * 5.5, pan, (t) => vol * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / lang) * (Math.sin(TAU * f * t) + 0.5 * Math.sin(TAU * f * 2 * t) + 0.25 * Math.sin(TAU * f * 3 * t)));
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

/** Het thema: per maat acht achtsten, getokkeld, met een klokje op de zware tellen. */
const THEMA = {
  C: ["E5", "G5", "C6", "G5", "E6", "C6", "G5", "C6"],
  G: ["D5", "G5", "B5", "G5", "D6", "B5", "G5", "B5"],
  Am: ["C5", "E5", "A5", "E5", "C6", "A5", "E5", "A5"],
  F: ["C5", "F5", "A5", "F5", "C6", "A5", "F5", "A5"],
  FG: ["F5", "A5", "C6", "A5", "G5", "B5", "D6", "B5"],
  Gop: ["D5", "G5", "B5", "D6", "G5", "B5", "D6", "G6"], // opbouw naar de volgende inzet
};
/** De wandelende bas (vier tellen) en de tokkel tegen de tel in, per akkoord. */
const LOOPJE = {
  Am: [["A2", "C3", "E3", "C3"], ["E4", "A4"]],
  C: [["C3", "E3", "G3", "E3"], ["E4", "G4"]],
  G: [["G2", "B2", "D3", "B2"], ["D4", "G4"]],
  F: [["F2", "A2", "C3", "A2"], ["F4", "A4"]],
};

/** Eén maat getokkel: wandelende bas op de tel, een tokkel ertegenin, en een lichte beat. */
function tokkelmaat(s, t0, akkoord, { sluipend = false, eerste = 0, tellen = 4 } = {}) {
  const [bas, tegen] = LOOPJE[akkoord];
  for (let i = 0; i < tellen; i++) {
    const t = t0 + i * 0.5;
    s.pluk(t, bas[(eerste + i) % 4], sluipend ? 0.24 : 0.26, -0.1, 0.13);
    tegen.forEach((noot, j) => s.pluk(t + 0.25, noot, sluipend ? (j ? 0 : 0.08) : 0.07, j ? 0.45 : 0.3));
    s.hat(t + 0.25, sluipend ? 0.04 : 0.06, false, 0.3);
    if (sluipend) continue;
    if ((eerste + i) % 2 === 0) s.bons(t, 0.27);
    else s.klap(t, 0.085);
    s.hat(t, 0.03, false, -0.2);
    s.slee(t, 0.022, -0.3);
    s.slee(t + 0.25, 0.014, 0.4);
  }
}

/** Een loopje van snelle tokkels omhoog, als aanloop naar een inzet. */
function aanloopje(s, t0, noten, lengte) {
  noten.forEach((noot, i) => s.pluk(t0 + (i * lengte) / noten.length, noot, 0.12 + (0.1 * i) / noten.length, -0.3 + (0.6 * i) / noten.length, 0.09));
}

function arrangement(s, { begin, akkoorden, einde }) {
  const maat = 2;
  const acht = maat / 8;
  s.bekken(begin, 0.07);
  akkoorden.forEach((naam, m) => {
    const t0 = begin + m * maat;
    const opbouw = naam === "Gop";
    if (naam === "FG") {
      tokkelmaat(s, t0, "F", { tellen: 2 });
      tokkelmaat(s, t0 + 1, "G", { tellen: 2, eerste: 2 });
    } else tokkelmaat(s, t0, opbouw ? "G" : naam);
    s.vlak(t0, maat, AKKOORD[naam === "FG" ? "F" : opbouw ? "G" : naam][0], 0.016);
    THEMA[naam].forEach((noot, i) => {
      s.pluk(t0 + i * acht, noot, i % 4 === 0 ? 0.15 : 0.11, i % 2 ? 0.3 : -0.2, 0.12);
      if (i % 4 === 0) s.bel(t0 + i * acht, noot, 0.07, i ? 0.3 : -0.2, 0.6);
    });
    if (opbouw) {
      aanloopje(s, t0 + 1, ["G3", "B3", "D4", "G4", "B4", "D5", "G5", "B5"], 1);
      s.aanloop(t0 + 1, 1, 0.05);
    }
  });
  // slot: een getokkeld akkoord dat uitklinkt, en twee tokkels als staartje
  const t = begin + akkoorden.length * maat;
  s.bons(t, 0.3);
  s.bekken(t, 0.07);
  ["C3", "G3", "E4", "C5", "E5"].forEach((noot, i) => s.pluk(t + i * 0.012, noot, 0.2, -0.3 + i * 0.15, 0.3));
  s.bel(t, "C6", 0.13, 0, 1.8);
  s.vlak(t, Math.max(0.5, einde - t), AKKOORD.C[0], 0.03);
  s.pluk(t + 0.5, "G3", 0.2, 0.2, 0.14);
  s.pluk(t + 1.0, "C3", 0.24, -0.1, 0.3);
  s.bel(t + 1.0, "C7", 0.06, 0.2, 1.2);
}

function buurt(s, duur) {
  // begin: sluipend getokkel in mineur (het is glad voor de deur), met een koud klokje; dan een loopje omhoog
  tokkelmaat(s, 0, "Am", { sluipend: true });
  tokkelmaat(s, 2, "Am", { sluipend: true, tellen: 1 });
  s.bel(0.25, "E5", 0.08, -0.3, 1.2);
  s.bel(1.25, "A4", 0.07, 0.3, 1.2);
  aanloopje(s, 2.5, ["E3", "A3", "C4", "E4"], 0.5);
  // inzet op 3,0 s (de zak), opbouw naar 13,0 s (alles sluit aan, eindbeeld), slot op 17,0 s
  arrangement(s, { begin: 3, akkoorden: ["C", "G", "Am", "F", "Gop", "C", "FG"], einde: duur });
  // accenten op het beeld: licht aan bij de buren, buren die meedoen, alles sluit aan
  for (const t of [6.3, 8.85]) s.harp(t, ["G6", "C7"], 0.07, 0.1);
  [[10.3, "C6"], [10.8, "D6"], [11.3, "E6"], [11.8, "G6"], [12.2, "A6"]].forEach(([t, noot]) => s.bel(t, noot, 0.09, 0.3, 0.8));
  s.harp(13.0, ["C5", "E5", "G5", "C6", "E6", "G6", "C7"], 0.04, 0.09);
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
  // loopje omhoog tot de zak in beeld komt
  aanloopje(s, 4.0, ["G3", "B3", "D4", "G4"], 0.5);
  // inzet op 4,5 s (de zak), eindbeeld rond 13,2 s, slot op 16,5 s
  arrangement(s, { begin: 4.5, akkoorden: ["C", "G", "Am", "FG", "C", "FG"], einde: duur });
  // als de fietsers weer opstappen: een glijfluitje omhoog
  for (const t of [6.6, 7.7]) s.glij(t, 420, 900, 0.3, 0.07, t < 7 ? -0.3 : 0.3);
  // fietsbel van de voorbijganger
  for (const t of [10.0, 10.11, 10.36, 10.47]) s.bel(t, "E7", 0.08, 0.4, 0.35);
}

function opa(s, duur) {
  // begin: opa schuifelt (getokkel op elke stap), de rollator schiet weg, het hondje glijdt uit
  for (let i = 0; i < 9; i++) {
    s.pluk(i * 0.5, i % 2 ? "E3" : "A2", 0.24, -0.1);
    if (i < 5) s.pluk(i * 0.5 + 0.25, "C4", 0.08, 0.4);
    s.hat(i * 0.5 + 0.25, 0.04);
  }
  s.glij(2.2, 620, 380, 0.3, 0.1, -0.2);
  s.glij(2.55, 1000, 420, 0.4, 0.11, 0.3);
  s.plof(2.95, 0.3);
  s.bel(3.3, "G#4", 0.07, 0, 0.5);
  // de buurjongen komt aangerend: snelle tokkels, een glijfluitje als hij remt, dan de inzet als hij begint te strooien
  aanloopje(s, 3.3, ["A2", "C3", "E3", "A3", "C4", "E4", "A4", "C5", "E5", "A5"], 1.25);
  s.glij(4.6, 900, 520, 0.35, 0.09, 0.2);
  arrangement(s, { begin: 5, akkoorden: ["C", "G", "Am", "FG", "C", "FG"], einde: duur });
  // duim omhoog: twee keer een tinkel
  for (const t of [7.2, 11.8]) s.harp(t, ["E6", "G6", "C7"], 0.06, 0.1);
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
