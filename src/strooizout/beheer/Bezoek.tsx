// Bezoek en verkoop: cookieloze bezoekmeting (worker/strooizout.ts › bezoek) naast bestellingen, bronnen (?via=…),
// gemiddeld aantal zakken per bestelling en welke bundels verkopen.

import { useEffect, useState } from "react";
import { Kpi, useBeheer } from "./basis";

type Rij = { [k: string]: string | number };
type Data = {
  dagen: number;
  per_dag: { dag: string; bezoekers: number; bestellingen: number }[];
  bezoekers: number;
  bestellingen: number;
  conversie: number | null;
  gemiddeld_zakken: number | null;
  verdeling: { zakken: string; bestellingen: number }[];
  herkomst: Rij[];
  bron_bezoek: Rij[];
  bron_bestellingen: Rij[];
  apparaat: Rij[];
};

function Lijst({ titel, rijen, sleutel, leeg }: { titel: string; rijen: Rij[]; sleutel: string; leeg: string }) {
  const max = Math.max(1, ...rijen.map((r) => Number(r.n)));
  return (
    <div>
      <h3 className="bh-klein-kop">{titel}</h3>
      {rijen.length === 0 ? (
        <p className="bh-sub">{leeg}</p>
      ) : (
        rijen.map((r) => (
          <div key={String(r[sleutel])} style={{ marginBottom: 8 }}>
            <div className="bh-rij bh-rij--tussen" style={{ fontSize: 14 }}>
              <span>{String(r[sleutel])}</span>
              <span className="sz-tnum">{r.n}</span>
            </div>
            <div className="bh-staaf" aria-hidden="true">
              <span style={{ width: `${(Number(r.n) / max) * 100}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function Bezoek() {
  const { api } = useBeheer();
  const [dagen, setDagen] = useState(30);
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    void api<Data>(`/bezoek?dagen=${dagen}`).then((r) => r.ok && setD(r.data));
  }, [api, dagen]);
  if (!d) return null;
  const max = Math.max(1, ...d.per_dag.map((x) => x.bezoekers));
  const breed = 100 / d.per_dag.length;
  return (
    <section className="bh-kaart" style={{ marginTop: 16 }} aria-labelledby="bh-bezoek">
      <div className="bh-rij bh-rij--tussen">
        <h2 id="bh-bezoek">Bezoek en verkoop</h2>
        <label className="bh-schakel">
          Periode{" "}
          <select className="sz-invoer" style={{ width: "auto", minHeight: 36 }} value={dagen} onChange={(e) => setDagen(Number(e.target.value))}>
            <option value={7}>7 dagen</option>
            <option value={30}>30 dagen</option>
            <option value={90}>90 dagen</option>
          </select>
        </label>
      </div>
      <div className="bh-kpis">
        <Kpi label="Bezoekers" waarde={d.bezoekers} sub="unieke bezoekers per dag, opgeteld" nadruk />
        <Kpi label="Bestellingen" waarde={d.bestellingen} sub="niet geannuleerd" />
        <Kpi label="Conversie" waarde={d.conversie === null ? "–" : `${d.conversie.toLocaleString("nl-NL")}%`} sub="bestellingen per bezoeker" />
        <Kpi label="Gem. zakken per bestelling" waarde={d.gemiddeld_zakken === null ? "–" : d.gemiddeld_zakken.toLocaleString("nl-NL")} />
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height: 90, marginTop: 8 }} role="img" aria-label={`Bezoekers per dag, laatste ${d.dagen} dagen`}>
        {d.per_dag.map((x, i) => (
          <g key={x.dag}>
            <rect x={i * breed + breed * 0.15} width={breed * 0.7} y={30 - (x.bezoekers / max) * 28} height={(x.bezoekers / max) * 28} fill="#cfe6f6">
              <title>{`${x.dag}: ${x.bezoekers} bezoekers, ${x.bestellingen} bestellingen`}</title>
            </rect>
            {x.bestellingen > 0 && <rect x={i * breed + breed * 0.15} width={breed * 0.7} y={28.5} height={1.5} fill="#ffb547" />}
          </g>
        ))}
      </svg>
      <p className="bh-sub" style={{ marginTop: 0 }}>Lichtblauw: bezoekers per dag. Oranje streep: er kwam een bestelling binnen.</p>
      <div className="bh-twee">
        <Lijst titel="Bundels (zakken per bestelling)" rijen={d.verdeling.map((v) => ({ zakken: v.zakken, n: v.bestellingen }))} sleutel="zakken" leeg="Nog geen bestellingen." />
        <Lijst titel="Bestellingen per bron" rijen={d.bron_bestellingen} sleutel="bron" leeg="Nog geen bestellingen." />
        <Lijst titel="Bezoek per bron (QR, flyer, delen)" rijen={d.bron_bezoek} sleutel="bron" leeg="Nog geen bezoek via een gemarkeerde link." />
        <Lijst titel="Herkomst (verwijzende site)" rijen={d.herkomst} sleutel="herkomst" leeg="Nog geen bezoek gemeten." />
      </div>
      <p className="bh-sub">Meting zonder cookies: per dag een niet terug te rekenen code per bezoeker; zoekmachines en linkvoorbeelden tellen niet mee.</p>
    </section>
  );
}
