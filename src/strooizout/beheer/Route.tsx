// Bezorgroute: bezorgbestellingen per wijk, gesorteerd op postcode en huisnummer, met links naar een navigatieapp.
// Geen betaalde route-API: Google Maps krijgt de adressen als tussenstops (maximaal 9 per link), Apple Kaarten en Waze per adres.

import { useCallback, useEffect, useMemo, useState } from "react";
import { dagTekst, euro } from "../../../shared/strooizout";
import { BetaalPil, kg, rondeQuery, StatusPil, useBeheer } from "./basis";
import type { LijstBestelling, Moment } from "./typen";

type Stop = LijstBestelling & { straat: string; huisnummer: string; gewicht_gram: number };
type Data = { wijken: { wijk: string; stops: Stop[] }[]; startadres: string; momenten: Moment[] };

const adres = (s: Stop) => `${s.straat} ${s.huisnummer}, ${s.postcode} ${s.plaats || "Houten"}`;

/** Google Maps-routelinks: start (optioneel) → max. 9 tussenstops → bestemming per link. */
export function routeLinks(stops: string[], start: string): string[] {
  const links: string[] = [];
  const per = 10;
  for (let i = 0; i < stops.length; i += per) {
    const deel = stops.slice(i, i + per);
    const p = new URLSearchParams({ api: "1", travelmode: "driving" });
    const vertrek = i === 0 ? start : stops[i - 1];
    if (vertrek) p.set("origin", vertrek);
    p.set("destination", deel[deel.length - 1]);
    if (deel.length > 1) p.set("waypoints", deel.slice(0, -1).join("|"));
    links.push(`https://www.google.com/maps/dir/?${p.toString()}`);
  }
  return links;
}

export default function Route() {
  const { api, ronde, meld } = useBeheer();
  const [data, setData] = useState<Data | null>(null);
  const [moment, setMoment] = useState("");
  const [alle, setAlle] = useState(false);
  const [volgorde, setVolgorde] = useState<number[]>([]);

  const laad = useCallback(async () => {
    const p = new URLSearchParams(rondeQuery(ronde));
    if (moment) p.set("moment", moment);
    if (alle) p.set("alle", "1");
    const r = await api<Data>(`/route?${p.toString()}`);
    if (!r.ok) return meld(r.error, true);
    setData(r.data);
    setVolgorde(r.data.wijken.flatMap((w) => w.stops.map((s) => s.id)));
  }, [api, ronde, moment, alle, meld]);
  useEffect(() => {
    void laad();
  }, [laad]);

  const alleStops = useMemo(() => new Map((data?.wijken ?? []).flatMap((w) => w.stops.map((s) => [s.id, s] as const))), [data]);
  const geordend = volgorde.map((id) => alleStops.get(id)).filter((s): s is Stop => !!s);
  const verplaats = (id: number, richting: -1 | 1) =>
    setVolgorde((v) => {
      const i = v.indexOf(id);
      const j = i + richting;
      if (i < 0 || j < 0 || j >= v.length) return v;
      const k = [...v];
      [k[i], k[j]] = [k[j], k[i]];
      return k;
    });
  const links = routeLinks(geordend.map(adres), data?.startadres ?? "");
  const totaalGewicht = geordend.reduce((s, x) => s + x.gewicht_gram, 0);
  const totaalStuks = geordend.reduce((s, x) => s + x.stuks, 0);

  return (
    <>
      <h1>Bezorgroute</h1>
      <p className="bh-sub">Bezorgbestellingen per wijk, op volgorde van postcode en huisnummer. Pas de volgorde aan met de pijltjes; de routelinks volgen die volgorde.</p>
      <div className="bh-filters bh-geen-print">
        {(data?.momenten.length ?? 0) > 0 && (
          <select className="sz-invoer" aria-label="Bezorgmoment" value={moment} onChange={(e) => setMoment(e.target.value)}>
            <option value="">Alle bezorgmomenten</option>
            {data!.momenten.map((m) => (
              <option key={m.id} value={m.id}>
                {dagTekst(m.datum)} {m.van}–{m.tot}
              </option>
            ))}
          </select>
        )}
        <label className="bh-schakel">
          <input type="checkbox" checked={alle} onChange={(e) => setAlle(e.target.checked)} /> Ook al bezorgde bestellingen
        </label>
        <button type="button" className="bh-knop" onClick={() => window.print()}>
          Afdrukken
        </button>
      </div>
      {!data ? (
        <p>Laden…</p>
      ) : geordend.length === 0 ? (
        <div className="bh-kaart">Geen bezorgingen in deze selectie.</div>
      ) : (
        <>
          <div className="bh-kaart bh-geen-print">
            <h2>Navigeren</h2>
            <p className="bh-sub" style={{ marginBottom: 10 }}>
              {geordend.length} adressen · {totaalStuks} artikelen · {kg(totaalGewicht)}
              {data.startadres ? ` · start bij het afhaaladres` : " · tip: vul het afhaaladres in bij Instellingen als startpunt"}
            </p>
            <div className="bh-knoppen">
              {links.map((l, i) => (
                <a key={l} className="bh-knop bh-knop--hoofd" href={l} target="_blank" rel="noopener noreferrer">
                  {links.length === 1 ? "Open route in Google Maps" : `Route deel ${i + 1} van ${links.length}`}
                </a>
              ))}
            </div>
          </div>
          {data.wijken.map((w) => {
            const ids = new Set(w.stops.map((s) => s.id));
            const inWijk = geordend.filter((s) => ids.has(s.id));
            return (
              <section className="bh-kaart bh-wijk" key={w.wijk}>
                <h3>
                  <span>{w.wijk}</span>
                  <small style={{ color: "var(--tekst-3)", fontWeight: 500 }}>
                    {inWijk.length} adressen · {inWijk.reduce((s, x) => s + x.stuks, 0)} artikelen
                  </small>
                </h3>
                {inWijk.map((s) => {
                  const nr = geordend.indexOf(s) + 1;
                  const a = adres(s);
                  return (
                    <div className="bh-stop" key={s.id}>
                      <span className="bh-stop__nr">{nr}</span>
                      <div>
                        <strong>{a}</strong>
                        <div style={{ fontSize: 14 }}>
                          {s.naam} · <a href={`tel:${s.telefoon}`}>{s.telefoon}</a> · {s.nummer}
                        </div>
                        <div style={{ fontSize: 14 }}>{s.samenvatting}</div>
                        {s.opmerking && <div style={{ fontSize: 14, color: "var(--oker)" }}>Opmerking: {s.opmerking}</div>}
                        <div className="bh-rij" style={{ marginTop: 6 }}>
                          <StatusPil status={s.status} />
                          <BetaalPil status={s.betaalstatus} />
                          {s.betaalstatus !== "betaald" && <span style={{ fontSize: 14 }}>nog te ontvangen: {euro(s.totaal_cent - s.betaald_cent)}</span>}
                        </div>
                        <div className="bh-knoppen bh-geen-print" style={{ marginTop: 6 }}>
                          <a className="bh-knop" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`} target="_blank" rel="noopener noreferrer">
                            Google Maps
                          </a>
                          <a className="bh-knop" href={`https://maps.apple.com/?daddr=${encodeURIComponent(a)}`} target="_blank" rel="noopener noreferrer">
                            Apple Kaarten
                          </a>
                          <a className="bh-knop" href={`https://waze.com/ul?q=${encodeURIComponent(a)}&navigate=yes`} target="_blank" rel="noopener noreferrer">
                            Waze
                          </a>
                        </div>
                      </div>
                      <div className="bh-knoppen bh-geen-print" style={{ flexDirection: "column" }}>
                        <button type="button" className="bh-knop" aria-label={`Stop ${nr} eerder`} onClick={() => verplaats(s.id, -1)} disabled={nr === 1}>
                          ↑
                        </button>
                        <button type="button" className="bh-knop" aria-label={`Stop ${nr} later`} onClick={() => verplaats(s.id, 1)} disabled={nr === geordend.length}>
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
