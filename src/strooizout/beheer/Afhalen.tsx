// Afhalen: afhaalcode intikken → direct zakken, betaalstatus en afhaalstatus; uitgeven in één atomaire stap.
// Een bestelling kan maar één keer worden uitgegeven (de server weigert een tweede keer, ook gelijktijdig).

import { useEffect, useRef, useState, type FormEvent } from "react";
import { dagTekst, euro, mobielTekst, normaliseerAfhaalcode, type BetaalStatus } from "../../../shared/strooizout";
import { BetaalPil, kort, StatusPil, useBeheer } from "./basis";

type Uitgifte = {
  id: number;
  nummer: string;
  afhaalcode: string;
  naam: string;
  telefoon: string;
  levering: "ophalen" | "bezorgen";
  status: string;
  uitgegeven: boolean;
  uitgegeven_op: string | null;
  geannuleerd: boolean;
  zakken: number;
  regels: { naam: string; aantal: number }[];
  totaal_cent: number;
  betaald_cent: number;
  open_cent: number;
  betaalstatus: BetaalStatus;
  moment: { datum: string; van: string; tot: string } | null;
  opmerking: string;
};

export default function Afhalen() {
  const { api, meld } = useBeheer();
  const [invoer, setInvoer] = useState("");
  const [b, setB] = useState<Uitgifte | null>(null);
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const [wijze, setWijze] = useState("contant");
  const [zonderBetaling, setZonderBetaling] = useState(false);
  const veld = useRef<HTMLInputElement>(null);
  useEffect(() => veld.current?.focus(), []);

  async function zoek(e?: FormEvent) {
    e?.preventDefault();
    setFout("");
    setB(null);
    setZonderBetaling(false);
    const code = normaliseerAfhaalcode(invoer);
    if (!code) return setFout("Typ de code, bijvoorbeeld 4827 of H-4827.");
    const r = await api<{ bestelling: Uitgifte }>(`/afhalen/${encodeURIComponent(code)}`);
    if (!r.ok) return setFout(r.error);
    setB(r.data.bestelling);
  }

  async function geefUit(metBetaling: boolean) {
    if (!b) return;
    setBezig(true);
    const r = await api<{ bestelling: Uitgifte }>(`/afhalen/${encodeURIComponent(b.afhaalcode)}/uitgeven`, {
      method: "POST",
      body: JSON.stringify(metBetaling ? { betaling: { wijze, bedrag_cent: b.open_cent, ontvangen: true } } : {}),
    });
    setBezig(false);
    if (!r.ok) {
      setFout(r.error);
      const actueel = (r.extra as { bestelling?: Uitgifte }).bestelling;
      if (actueel) setB(actueel);
      return;
    }
    setB(r.data.bestelling);
    meld(`${b.afhaalcode} ${b.levering === "bezorgen" ? "bezorgd" : "uitgegeven"}`);
  }

  const betaald = b && (b.betaalstatus === "betaald" || b.open_cent === 0);
  return (
    <>
      <h1>Afhalen</h1>
      <p className="bh-sub">Typ de afhaalcode van de klant. Je ziet direct hoeveel zakken, of er betaald is en of de bestelling al is uitgegeven.</p>
      <form className="bh-afhaalzoek" onSubmit={zoek}>
        <label htmlFor="bh-afhaalcode" className="sr-only">
          Afhaalcode
        </label>
        <span aria-hidden="true">H-</span>
        <input id="bh-afhaalcode" ref={veld} inputMode="numeric" autoComplete="off" placeholder="4827" value={invoer} onChange={(e) => setInvoer(e.target.value)} maxLength={8} />
        <button type="submit" className="bh-knop bh-knop--hoofd">
          Zoeken
        </button>
      </form>
      {fout && (
        <p className="sz-melding sz-melding--fout" role="alert">
          {fout}
        </p>
      )}
      {b && (
        <section className={`bh-uitgifte${b.uitgegeven ? " bh-uitgifte--klaar" : b.geannuleerd ? " bh-uitgifte--weg" : ""}`} aria-live="polite">
          <div className="bh-uitgifte__kop">
            <strong className="bh-uitgifte__code">{b.afhaalcode}</strong>
            <span>
              {b.naam} · {mobielTekst(b.telefoon)} · {b.nummer}
            </span>
          </div>
          <div className="bh-uitgifte__cijfers">
            <div>
              <span>Zakken</span>
              <strong>{b.zakken}</strong>
            </div>
            <div>
              <span>Betaling</span>
              <BetaalPil status={b.betaalstatus} betaald={b.betaald_cent} />
              <small>{b.open_cent > 0 ? `nog ${euro(b.open_cent)}` : `totaal ${euro(b.totaal_cent)}`}</small>
            </div>
            <div>
              <span>{b.levering === "bezorgen" ? "Bezorgstatus" : "Afhaalstatus"}</span>
              <StatusPil status={b.status} />
              {b.uitgegeven_op && <small>{kort(b.uitgegeven_op)}</small>}
            </div>
          </div>
          <p style={{ margin: "0 0 6px" }}>{b.regels.map((r) => `${r.aantal}× ${r.naam}`).join(", ")}</p>
          {b.moment && (
            <p className="bh-sub" style={{ margin: "0 0 6px" }}>
              {dagTekst(b.moment.datum)} {b.moment.van}–{b.moment.tot}
            </p>
          )}
          {b.opmerking && <p style={{ color: "var(--oker)", margin: "0 0 6px" }}>Opmerking: {b.opmerking}</p>}

          {b.uitgegeven ? (
            <p className="bh-uitgifte__melding">Al {b.levering === "bezorgen" ? "bezorgd" : "uitgegeven"} op {kort(b.uitgegeven_op)}. Niet nogmaals meegeven.</p>
          ) : b.geannuleerd ? (
            <p className="bh-uitgifte__melding">Deze bestelling is geannuleerd.</p>
          ) : betaald ? (
            <button type="button" className="sz-knop sz-knop--vol" disabled={bezig} onClick={() => void geefUit(false)}>
              {b.levering === "bezorgen" ? "Bezorgd" : "Uitgeven"} · {b.zakken} {b.zakken === 1 ? "zak" : "zakken"}
            </button>
          ) : (
            <div className="bh-uitgifte__betalen">
              <label htmlFor="bh-uwijze">Ontvangen via</label>
              <select id="bh-uwijze" className="sz-invoer" value={wijze} onChange={(e) => setWijze(e.target.value)}>
                <option value="contant">Contant</option>
                <option value="tikkie">Tikkie / betaalverzoek</option>
                <option value="pin">Pin</option>
                <option value="overboeking">Overboeking</option>
              </select>
              <button type="button" className="sz-knop sz-knop--vol" disabled={bezig} onClick={() => void geefUit(true)}>
                {euro(b.open_cent)} ontvangen en {b.levering === "bezorgen" ? "bezorgd" : "uitgeven"}
              </button>
              {zonderBetaling ? (
                <button type="button" className="bh-knop bh-knop--gevaar" disabled={bezig} onClick={() => void geefUit(false)}>
                  Zeker weten: uitgeven zonder betaling
                </button>
              ) : (
                <button type="button" className="bh-knop" onClick={() => setZonderBetaling(true)}>
                  Uitgeven zonder betaling (later betalen)
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
