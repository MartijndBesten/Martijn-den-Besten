import { useMemo, useState } from "react";
import { BUREAU_BUDGETS, BUREAU_PROBLEMS, BUREAU_SOLUTIONS, BUREAU_STATUSES, generateBureauCase, type BureauCase } from "../content/generators";
import { seeded, shuffle } from "../lib/random";
import { sfx } from "../lib/sound";
import { Link } from "../router";
import { DeptObject } from "../components/Objects";
import "../styles/pages.css";

function Dossier({ c, fresh }: { c: BureauCase; fresh?: boolean }) {
  return (
    <article className={`case ${fresh ? "is-fresh" : ""}`}>
      <header className="case__head">
        <span className="label">Dossier {c.number}</span>
        <span className="stamp">{c.status}</span>
      </header>
      <dl>
        <dt>Probleem</dt>
        <dd>{c.problem}</dd>
        <dt>Oplossing</dt>
        <dd>{c.solution}</dd>
        <dt>Budget</dt>
        <dd>{c.budget}</dd>
      </dl>
    </article>
  );
}

export default function Bureau() {
  // Vaste, unieke dossiers: elke lijst één keer geschud met een vaste seed.
  const archive = useMemo(() => {
    const rng = seeded(2026);
    const [p, s, b, st] = [shuffle(BUREAU_PROBLEMS, rng), shuffle(BUREAU_SOLUTIONS, rng), shuffle(BUREAU_BUDGETS, rng), shuffle(BUREAU_STATUSES, rng)];
    return Array.from({ length: 6 }, (_, i): BureauCase => ({
      problem: p[i],
      solution: s[i],
      budget: b[i % b.length],
      status: st[i % st.length],
      number: `BOI/2026/${String(1000 + i * 137)}`,
    }));
  }, []);
  const [current, setCurrent] = useState<BureauCase | null>(null);
  const [n, setN] = useState(0);

  return (
    <div className="page bureau">
      <section className="page-hero bureau__hero" aria-labelledby="bureau-title">
        <div className="wrap bureau__hero-grid">
          <div>
          <span className="dept-no">Afd. 06 — Bureau voor Onnodige Innovatie</span>
          <h1 id="bureau-title">
            Oplossingen voor problemen die <em>niet bestaan</em>
          </h1>
          <p className="lede">
            Het bureau werkt onvermoeibaar aan volstrekt overbodige innovaties. Dien geen probleem in: het bureau verzint ze zelf.
          </p>
          <button
            type="button"
            className="btn btn--indigo"
            onClick={() => {
              sfx.clunk();
              setCurrent(generateBureauCase());
              setN((x) => x + 1);
            }}
          >
            Open een nieuw dossier
          </button>
          </div>
          <DeptObject kind="lamp" className="bureau__fig" />
        </div>
      </section>
      <div className="wrap">
        <div aria-live="polite" className="bureau__current">
          {current && <Dossier key={n} c={current} fresh />}
        </div>
        <h2 className="section-title bureau__archive-title">
          Lopende <em>dossiers</em>
        </h2>
        <div className="cases">
          {archive.map((c) => (
            <Dossier key={c.number} c={c} />
          ))}
        </div>
        <p className="bureau__note">
          Heeft u zelf een onnodig idee? Het <Link to="/loket">ideeënloket</Link> heeft daar een speciale afdeling voor.
        </p>
      </div>
    </div>
  );
}
