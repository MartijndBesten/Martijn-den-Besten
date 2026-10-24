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
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff4e0";
  ctx.fillRect(0, 0, W, H);

  // Randen
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#17153a";
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 22;
  ctx.strokeStyle = "#2a3bdb";
  ctx.strokeRect(70, 70, W - 140, H - 140);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#17153a";
  ctx.strokeRect(92, 92, W - 184, H - 184);

  // Hoekvormen
  const corner = (x: number, y: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, 46, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#17153a";
    ctx.stroke();
  };
  corner(92, 92, "#ff5c47");
  corner(W - 92, 92, "#ffd24d");
  corner(92, H - 92, "#34c77b");
  corner(W - 92, H - 92, "#c6b3ff");

  ctx.textAlign = "center";
  ctx.fillStyle = "#17153a";
  ctx.font = "700 26px 'Space Mono', monospace";
  ctx.fillText("INSTITUUT MARTIJN DEN BESTEN · AFDELING CERTIFICATEN", W / 2, 190);

  ctx.font = "800 104px Bricolage, sans-serif";
  ctx.fillStyle = "#2a3bdb";
  ctx.fillText("Officieel Certificaat", W / 2, 310);

  ctx.fillStyle = "#17153a";
  ctx.font = "400 38px 'Instrument Sans', sans-serif";
  ctx.fillText("Hierbij verklaart het Instituut Martijn den Besten dat", W / 2, 410);

  ctx.font = "800 92px Bricolage, sans-serif";
  ctx.fillStyle = "#ff5c47";
  const who = name.trim() || "u";
  ctx.fillText(who, W / 2, 530);
  ctx.fillStyle = "#17153a";
  ctx.fillRect(W / 2 - 360, 556, 720, 5);

  ctx.font = "600 44px 'Instrument Sans', sans-serif";
  const lines = wrap(ctx, `${achievement}.`, 1100);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 640 + i * 58));

  // Stempel
  ctx.save();
  ctx.translate(1240, 860);
  ctx.rotate(-0.22);
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 92, 71, 0.12)";
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#c4301d";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#c4301d";
  ctx.font = "700 30px 'Space Mono', monospace";
  ctx.fillText("GOEDGEKEURD", 0, -10);
  ctx.font = "700 20px 'Space Mono', monospace";
  ctx.fillText("door zichzelf", 0, 24);
  ctx.fillText("★ ★ ★", 0, 58);
  ctx.restore();

  // Handtekening
  ctx.strokeStyle = "#17153a";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(250, 880);
  ctx.bezierCurveTo(300, 800, 330, 920, 380, 860);
  ctx.bezierCurveTo(420, 810, 440, 900, 490, 850);
  ctx.bezierCurveTo(520, 820, 560, 880, 640, 840);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(230, 905);
  ctx.lineTo(700, 905);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.font = "600 26px 'Instrument Sans', sans-serif";
  ctx.fillText("M. den Besten", 230, 945);
  ctx.font = "400 22px 'Instrument Sans', sans-serif";
  ctx.fillText("Directeur Onafgemaakte Zaken", 230, 978);

  ctx.textAlign = "center";
  ctx.font = "700 20px 'Space Mono', monospace";
  const date = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(`Afgegeven op ${date} · Serienummer ${serial} · Geldig tot nader order`, W / 2, H - 130);
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
    void document.fonts?.ready.then(render);
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
        <form className="panel bg-lila cert__form no-print" onSubmit={(e) => e.preventDefault()}>
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
            <button type="button" className="btn btn--kobalt" onClick={download}>
              Download als afbeelding (PNG)
            </button>
            <button type="button" className="btn btn--creme" onClick={print}>
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
