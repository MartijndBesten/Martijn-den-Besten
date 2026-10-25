// De octrooikaart die de ideeënmachine uitprint.

import type { CSSProperties } from "react";
import type { Invention } from "../content/inventions";
import { InventionFig } from "./InventionFig";

export function InventionCard({ invention }: { invention: Invention | null }) {
  if (!invention) {
    return (
      <div className="invention invention--empty">
        <span className="label">Octrooikaart · nog leeg</span>
        <p>Tik op de machine. Er rolt hier binnen twee seconden een gloednieuwe, volstrekt overbodige uitvinding uit.</p>
      </div>
    );
  }
  const tilt = ((invention.seed % 9) - 4) * 1.1;
  return (
    <article
      key={invention.seed}
      className={`invention tone-${invention.tone} ${invention.mega ? "is-mega" : ""} ${invention.gold ? "is-gold" : ""}`}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
    >
      <header className="invention__head">
        <span>Octrooi {invention.patent}</span>
        <span>{invention.mega ? "Formaat: XXL" : invention.gold ? "Gouden reeks" : "Klasse: overbodig"}</span>
      </header>
      <div className="invention__body">
        <div className="invention__fig">
          <InventionFig seed={invention.seed} tone={invention.tone} kind={invention.fig} label={invention.name} />
        </div>
        <div className="invention__text">
          <h3 className="invention__name">{invention.name}</h3>
          <p>{invention.description}</p>
        </div>
      </div>
      <span className="stamp invention__status" style={{ "--tilt": `${-tilt - 5}deg` } as CSSProperties}>
        {invention.status}
      </span>
    </article>
  );
}
