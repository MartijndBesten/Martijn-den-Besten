// Voorraad: verwacht, ontvangen, gereserveerd, uitgegeven, in voorraad en beschikbaar. Ontvangst bevestigen.
// Daaronder: straatverkoop registreren (verkoop ter plekke, in één stap uitgegeven en eventueel betaald).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bereken, euro, type PrijsProduct } from "../../../shared/strooizout";
import { useBeheer } from "./basis";
import type { BeheerProduct } from "./typen";

type Rij = { id: number; naam: string; eenheid: string; status: string; beschikbaar: number | null; verwacht: number | null; ontvangen: number; gereserveerd: number; uitgegeven: number; in_magazijn: number; nog_uit_te_geven: number };

function VoorraadRij({ r, bijgewerkt }: { r: Rij; bijgewerkt: () => void }) {
  const { api, meld } = useBeheer();
  const [verwacht, setVerwacht] = useState(r.verwacht === null ? "" : String(r.verwacht));
  const [ontvangen, setOntvangen] = useState("");
  const [bezig, setBezig] = useState(false);
  useEffect(() => setVerwacht(r.verwacht === null ? "" : String(r.verwacht)), [r.verwacht]);

  async function stuur(body: Record<string, unknown>, gelukt: string) {
    setBezig(true);
    const res = await api(`/voorraad/${r.id}`, { method: "POST", body: JSON.stringify(body) });
    setBezig(false);
    if (!res.ok) return meld(res.error, true);
    meld(gelukt);
    setOntvangen("");
    bijgewerkt();
  }

  const gevolgd = r.verwacht !== null;
  return (
    <section className="bh-kaart">
      <h2>{r.naam}</h2>
      {gevolgd ? (
        <div className="bh-voorraad">
          <div>
            <span>Verwacht</span>
            <strong>{r.verwacht}</strong>
          </div>
          <div>
            <span>Ontvangen</span>
            <strong>{r.ontvangen}</strong>
          </div>
          <div>
            <span>Gereserveerd</span>
            <strong>{r.gereserveerd}</strong>
          </div>
          <div>
            <span>Uitgegeven</span>
            <strong>{r.uitgegeven}</strong>
          </div>
          <div className="bh-voorraad--nadruk">
            <span>In voorraad (ligt er)</span>
            <strong>{r.in_magazijn}</strong>
          </div>
          <div className="bh-voorraad--nadruk">
            <span>Nog te reserveren</span>
            <strong>{r.beschikbaar ?? "–"}</strong>
          </div>
        </div>
      ) : (
        <p className="bh-sub">Geen voorraadbeheer: er kan onbeperkt gereserveerd worden. Vul een verwachte voorraad in om het aan te zetten.</p>
      )}
      {gevolgd && r.ontvangen < r.gereserveerd && (
        <p className="sz-melding sz-melding--let" style={{ marginTop: 10 }}>
          Nog {r.gereserveerd - r.ontvangen} {r.eenheid === "zak" ? "zakken" : "stuks"} meer gereserveerd dan ontvangen. Uitgeven kan alleen uit ontvangen voorraad.
        </p>
      )}
      <div className="bh-formulier" style={{ marginTop: 12 }}>
        <div className="bh-veld bh-veld--6">
          <label htmlFor={`vv-${r.id}`}>Verwachte voorraad (totaal ingekocht)</label>
          <div className="bh-rij">
            <input id={`vv-${r.id}`} className="sz-invoer" style={{ maxWidth: 140 }} inputMode="numeric" value={verwacht} onChange={(e) => setVerwacht(e.target.value.replace(/\D/g, ""))} />
            <button type="button" className="bh-knop" disabled={bezig || verwacht === "" || Number(verwacht) === r.verwacht} onClick={() => void stuur({ verwacht: Number(verwacht) }, "Verwachte voorraad opgeslagen")}>
              Opslaan
            </button>
          </div>
          <small>Klanten kunnen tot dit aantal reserveren (min wat al gereserveerd is).</small>
        </div>
        {gevolgd && (
          <div className="bh-veld bh-veld--6">
            <label htmlFor={`vo-${r.id}`}>Ontvangst bevestigen</label>
            <div className="bh-rij">
              <input id={`vo-${r.id}`} className="sz-invoer" style={{ maxWidth: 140 }} inputMode="numeric" placeholder="aantal" value={ontvangen} onChange={(e) => setOntvangen(e.target.value.replace(/[^\d-]/g, ""))} />
              <button type="button" className="bh-knop bh-knop--hoofd" disabled={bezig || !ontvangen || Number(ontvangen) === 0} onClick={() => void stuur({ ontvangen_erbij: Number(ontvangen) }, Number(ontvangen) > 0 ? `${ontvangen} ontvangen` : "Gecorrigeerd")}>
                Bevestigen
              </button>
            </div>
            <small>Aantal dat nu binnen is gekomen. Een negatief getal corrigeert een vergissing.</small>
          </div>
        )}
      </div>
    </section>
  );
}

function Straatverkoop({ producten, bijgewerkt }: { producten: BeheerProduct[]; bijgewerkt: () => void }) {
  const { api, meld } = useBeheer();
  const zout = producten.find((p) => p.slug === "strooizout-25-kg") ?? producten.find((p) => p.status === "actief");
  const [aantal, setAantal] = useState(1);
  const [bezig, setBezig] = useState(false);
  const idem = useRef(crypto.randomUUID());
  const som = useMemo(() => {
    if (!zout || zout.prijs_cent === null) return null;
    const pp: PrijsProduct = { id: zout.id, naam: zout.naam, prijs_cent: zout.prijs_cent, inkoop_cent: zout.inkoop_cent, bezorg_cent: null, gewicht_gram: zout.gewicht_gram, aanbiedingen: zout.aanbiedingen.map((a, i) => ({ id: i, ...a })) };
    return bereken([{ product: pp, aantal }], "ophalen", { bezorg_methode: "per_stuk", bezorg_per_stuk_cent: 0, bezorg_per_kg_cent: 0 }, new Date().toISOString());
  }, [zout, aantal]);
  if (!zout || !som) return null;

  async function registreer(wijze: string) {
    if (wijze === "nog_niet" && !window.confirm("Uitgeven zonder dat er betaald is? De verkoop blijft dan als openstaand staan.")) return;
    setBezig(true);
    const r = await api<{ nummer: string; totaal_cent: number }>("/straatverkoop", {
      method: "POST",
      body: JSON.stringify({ idempotentie: idem.current, product_id: zout!.id, aantal, wijze, ontvangen: wijze !== "nog_niet" }),
    });
    setBezig(false);
    if (!r.ok) return meld(r.error, true);
    meld(`Straatverkoop geregistreerd: ${aantal} × ${euro(r.data.totaal_cent / aantal)} = ${euro(r.data.totaal_cent)}`);
    idem.current = crypto.randomUUID();
    setAantal(1);
    bijgewerkt();
  }

  return (
    <section className="bh-kaart">
      <h2>Straatverkoop registreren</h2>
      <p className="bh-sub">Iemand koopt ter plekke zonder de QR-code te gebruiken. Wordt in één keer uitgegeven, van de voorraad afgeboekt en (als het geld er is) als betaald geregistreerd.</p>
      <div className="bh-rij" style={{ gap: 14 }}>
        <div className="sz-aantal sz-aantal--klein" role="group" aria-label="Aantal zakken">
          <button type="button" onClick={() => setAantal(Math.max(1, aantal - 1))} disabled={aantal <= 1} aria-label="Eén minder">
            −
          </button>
          <input aria-label="Aantal" inputMode="numeric" value={aantal} onChange={(e) => setAantal(Math.max(1, Math.min(200, Number(e.target.value.replace(/\D/g, "")) || 1)))} />
          <button type="button" onClick={() => setAantal(aantal + 1)} aria-label="Eén meer">
            +
          </button>
        </div>
        <strong style={{ fontSize: 24 }} className="sz-tnum">
          {euro(som.totaal_cent)}
        </strong>
        {som.korting_cent > 0 && <span style={{ color: "var(--groen)", fontWeight: 600 }}>staffelkorting {euro(som.korting_cent)}</span>}
      </div>
      <div className="bh-knoppen" style={{ marginTop: 12 }}>
        <button type="button" className="bh-knop bh-knop--hoofd" disabled={bezig} onClick={() => void registreer("contant")}>
          Contant ontvangen
        </button>
        <button type="button" className="bh-knop bh-knop--hoofd" disabled={bezig} onClick={() => void registreer("tikkie")}>
          Tikkie ontvangen
        </button>
        <button type="button" className="bh-knop" disabled={bezig} onClick={() => void registreer("pin")}>
          Pin
        </button>
        <button type="button" className="bh-knop" disabled={bezig} onClick={() => void registreer("nog_niet")}>
          Nog niet betaald
        </button>
      </div>
    </section>
  );
}

export default function Voorraad() {
  const { api, meld } = useBeheer();
  const [rijen, setRijen] = useState<Rij[] | null>(null);
  const [producten, setProducten] = useState<BeheerProduct[]>([]);
  const laad = useCallback(async () => {
    const [v, p] = await Promise.all([api<{ voorraad: Rij[] }>("/voorraad"), api<{ producten: BeheerProduct[] }>("/producten")]);
    if (v.ok) setRijen(v.data.voorraad);
    else meld(v.error, true);
    if (p.ok) setProducten(p.data.producten);
  }, [api, meld]);
  useEffect(() => {
    void laad();
  }, [laad]);
  if (!rijen) return <p>Laden…</p>;
  const zichtbaar = rijen.filter((r) => r.status === "actief" || r.verwacht !== null);
  return (
    <>
      <h1>Voorraad</h1>
      <p className="bh-sub">Klanten reserveren uit de verwachte voorraad. Afhalen en bezorgen kan pas als de voorraad is ontvangen.</p>
      {zichtbaar.map((r) => (
        <VoorraadRij key={r.id} r={r} bijgewerkt={() => void laad()} />
      ))}
      <Straatverkoop producten={producten} bijgewerkt={() => void laad()} />
    </>
  );
}
