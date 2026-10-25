import { useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS } from "../content/progress";
import { useGame } from "../state/GameState";
import { sfx } from "../lib/sound";
import "../styles/pages.css";

const W = 1600;
const H = 1132;
const SPECIAL = {
  opper: "alle missies van het instituut heeft voltooid en daarmee officieel Opperbezoeker is",
} as const;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function draw(canvas: HTMLCanvasElement, name: string, achievement: string, serial: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const INK = "#191b2e";
  const TERRA = "#d4502f";
  const OKER = "#f6d36b";
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, W, H);

  // Kleurvlakken in de hoeken: de huiskleuren, net buiten de rand gestoten
  const blob = (x: number, y: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };
  blob(40, 40, 170, "#f9cfc2");
  blob(W - 30, 60, 120, "#f7e3a1");
  blob(W - 60, H - 40, 190, "#dcd0f7");
  blob(60, H - 30, 110, "#cfe3c8");

  // Guilloche-rand: twee in elkaar grijpende golflijnen, zoals op waardepapier
  ctx.strokeStyle = "#3c5bd6";
  ctx.lineWidth = 1;
  const wave = (offset: number, amp: number, phase: number) => {
    const x0 = 60 + offset;
    const y0 = 60 + offset;
    const x1 = W - 60 - offset;
    const y1 = H - 60 - offset;
    const per = (a: number, b: number) => Math.hypot(b - a, 0);
    const edge = (ax: number, ay: number, bx: number, by: number) => {
      const len = per(ax, bx) + per(ay, by);
      const steps = Math.ceil(len / 4);
      const nx = by === ay ? 0 : 1;
      const ny = by === ay ? 1 : 0;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = ax + (bx - ax) * t + nx * Math.sin(t * len * 0.06 + phase) * amp;
        const y = ay + (by - ay) * t + ny * Math.sin(t * len * 0.06 + phase) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    };
    ctx.beginPath();
    edge(x0, y0, x1, y0);
    edge(x1, y0, x1, y1);
    edge(x1, y1, x0, y1);
    edge(x0, y1, x0, y0);
    ctx.stroke();
  };
  wave(0, 6, 0);
  wave(0, 6, Math.PI);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 80, W - 160, H - 160);
  ctx.strokeRect(88, 88, W - 176, H - 176);

  // Rozetten in de hoeken
  const rosette = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    for (let i = 0; i < 18; i++) {
      ctx.rotate(Math.PI / 9);
      ctx.beginPath();
      ctx.ellipse(14, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = OKER;
    ctx.fill();
    ctx.restore();
  };
  rosette(120, 120);
  rosette(W - 120, 120);
  rosette(120, H - 120);
  rosette(W - 120, H - 120);

  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = "400 22px 'Geist Mono', monospace";
  ctx.fillText("INSTITUUT MARTIJN DEN BESTEN  ·  AFDELING CERTIFICATEN  ·  Nº " + serial, W / 2, 180);

  // Titel: twee woorden in verschillende stijlen, samen gecentreerd
  const romanFont = "750 118px 'Geist', sans-serif";
  const italicFont = "italic 400 132px 'Instrument Serif', serif";
  ctx.font = romanFont;
  const w1 = ctx.measureText("Officieel ").width;
  ctx.font = italicFont;
  const w2 = ctx.measureText("Certificaat").width;
  const startX = W / 2 - (w1 + w2) / 2;
  ctx.textAlign = "left";
  ctx.font = romanFont;
  ctx.fillText("Officieel ", startX, 320);
  ctx.font = italicFont;
  ctx.fillStyle = TERRA;
  ctx.fillText("Certificaat", startX + w1, 320);
  ctx.textAlign = "center";

  ctx.fillStyle = INK;
  ctx.font = "400 34px 'Geist', sans-serif";
  ctx.fillText("Hierbij verklaart het Instituut Martijn den Besten dat", W / 2, 410);

  ctx.font = "italic 400 104px 'Instrument Serif', serif";
  const who = name.trim() || "u";
  ctx.fillText(who, W / 2, 540);
  ctx.fillRect(W / 2 - 380, 566, 760, 1.5);

  ctx.font = "400 46px 'Instrument Serif', serif";
  const lines = wrap(ctx, `${achievement}.`, 1100);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 646 + i * 58));

  // Zegel
  ctx.save();
  ctx.translate(1230, 870);
  ctx.rotate(-0.2);
  ctx.fillStyle = "#f2785c";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "400 17px 'Geist Mono', monospace";
  const ring = "GOEDGEKEURD · DOOR ZICHZELF · INSTITUUT MDB · ";
  for (let i = 0; i < ring.length; i++) {
    ctx.save();
    ctx.rotate((i / ring.length) * Math.PI * 2);
    ctx.fillText(ring[i], 0, -94);
    ctx.restore();
  }
  ctx.font = "italic 400 64px 'Instrument Serif', serif";
  ctx.fillText("Ok.", 0, 20);
  ctx.restore();

  // Handtekening
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(250, 880);
  ctx.bezierCurveTo(300, 800, 330, 920, 380, 860);
  ctx.bezierCurveTo(420, 810, 440, 900, 490, 850);
  ctx.bezierCurveTo(520, 820, 560, 880, 640, 840);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(230, 905);
  ctx.lineTo(700, 905);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = "400 30px 'Instrument Serif', serif";
  ctx.fillText("M. den Besten", 230, 945);
  ctx.font = "400 18px 'Geist Mono', monospace";
  ctx.fillText("DIRECTEUR ONAFGEMAAKTE ZAKEN", 230, 978);

  ctx.textAlign = "center";
  ctx.font = "400 18px 'Geist Mono', monospace";
  const date = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(`AFGEGEVEN OP ${date.toUpperCase()}  ·  GELDIG TOT NADER ORDER`, W / 2, H - 128);
}

export default function Certificaat() {
  const params = new URLSearchParams(window.location.search);
  const { missions } = useGame();
  const special = params.get("prestatie") === "opper" && missions.length >= 8 ? SPECIAL.opper : null;
  const [name, setName] = useState("");
  const [achievement, setAchievement] = useState<string>(special ?? ACHIEVEMENTS[0]);
  const [serial] = useState(() => `MdB-${Math.floor(Math.random() * 900000 + 100000)}`);
  const [printUrl, setPrintUrl] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (!cancelled && canvas.current) draw(canvas.current, name, achievement, serial);
    };
    render();
    if (document.fonts) {
      const faces = ['400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"', '400 20px "Geist"', '400 20px "Geist Mono"'];
      void Promise.all(faces.map((f) => document.fonts.load(f).catch(() => null))).then(render);
    }
    return () => {
      cancelled = true;
    };
  }, [name, achievement, serial]);

  const download = () => {
    const c = canvas.current;
    if (!c) return;
    sfx.success();
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificaat-${serial}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  };

  const print = () => {
    const c = canvas.current;
    if (!c) return;
    setPrintUrl(c.toDataURL("image/png"));
    window.setTimeout(() => window.print(), 100);
  };

  return (
    <div className="page certificaat">
      <section className="page-hero wrap no-print" aria-labelledby="cert-title">
        <span className="dept-no">Afd. 07 — Certificaatbureau</span>
        <h1 id="cert-title">Uw officiële certificaat</h1>
        <p className="lede">Laat het instituut vastleggen wat u heeft bereikt. Of juist niet. Uw naam blijft in uw browser en wordt nergens naartoe gestuurd.</p>
      </section>
      <div className="wrap cert__grid">
        <form className="panel bg-steen cert__form no-print" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="cert-name">Naam op het certificaat</label>
            <input id="cert-name" className="input" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Bijvoorbeeld: een oplettende bezoeker" autoComplete="off" />
            <small>Optioneel, maximaal 40 tekens.</small>
          </div>
          <fieldset className="field cert__choices">
            <legend>Prestatie</legend>
            {(special ? [special, ...ACHIEVEMENTS] : ACHIEVEMENTS).map((a) => (
              <label key={a} className="checkbox">
                <input type="radio" name="prestatie" checked={achievement === a} onChange={() => setAchievement(a)} />
                <span>… {a}</span>
              </label>
            ))}
          </fieldset>
          <div className="cert__actions">
            <button type="button" className="btn btn--indigo" onClick={download}>
              Download als afbeelding (PNG)
            </button>
            <button type="button" className="btn btn--ivory" onClick={print}>
              Afdrukken of opslaan als PDF
            </button>
          </div>
        </form>
        <div className="cert__preview no-print">
          <canvas ref={canvas} width={W} height={H} role="img" aria-label={`Certificaat: Het instituut verklaart dat ${name || "u"} ${achievement}.`} />
        </div>
      </div>
      {printUrl && <img className="print-only cert__print" src={printUrl} alt="Certificaat" />}
    </div>
  );
}
