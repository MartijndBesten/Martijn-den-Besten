import { useEffect, useState } from "react";
import { euro } from "../../../shared/strooizout";
import { Kpi, kg, rondeQuery, useBeheer } from "./basis";
import Bezoek from "./Bezoek";
import type { Cijfers } from "./typen";

export default function Overzicht() {
  const { api, ronde, rondes } = useBeheer();
  const [data, setData] = useState<{ cijfers: Cijfers; waarschuwingen: string[]; werkelijke_inkoop_cent: number | null; winkel_open: boolean } | null>(null);
  const [fout, setFout] = useState("");
  useEffect(() => {
    void api<NonNullable<typeof data>>(`/overzicht?${rondeQuery(ronde)}`).then((r) => (r.ok ? setData(r.data) : setFout(r.error)));
  }, [api, ronde]);
  if (fout) return <p className="sz-melding sz-melding--fout">{fout}</p>;
  if (!data) return <p>Cijfers laden…</p>;
  const c = data.cijfers;
  const r = rondes.find((x) => String(x.id) === ronde);
  return (
    <>
      <h1>Overzicht</h1>
      <p className="bh-sub">
        {r ? `Bestelronde ‘${r.naam}’` : "Alle bestelrondes"} · webshop {data.winkel_open ? "open" : "tijdelijk gesloten"}
      </p>
      {data.waarschuwingen.length > 0 && (
        <ul className="bh-waarschuwing">
          {data.waarschuwingen.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      <div className="bh-kpis">
        <Kpi label="Bestellingen" waarde={c.bestellingen} sub={c.geannuleerd ? `${c.geannuleerd} geannuleerd` : "geen annuleringen"} nadruk />
        <Kpi label="Zakken verkocht" waarde={c.zakken} sub={`${c.stuks} artikelen totaal`} />
        <Kpi label="Totaalgewicht" waarde={kg(c.gewicht_gram)} />
        <Kpi label="Omzet" waarde={euro(c.omzet_cent)} sub={`bezorging ${euro(c.bezorg_cent)} · korting ${euro(c.korting_cent)}`} />
        {(c.inkoop_bekend || data.werkelijke_inkoop_cent !== null) && (
          <>
            <Kpi label="Inkoopkosten" waarde={c.inkoop_onbekend ? (c.inkoop_cent ? `${euro(c.inkoop_cent)}+` : "onbekend") : euro(c.inkoop_cent)} sub={c.inkoop_onbekend ? "niet alle inkoopprijzen bekend" : "volgens inkoopprijzen"} />
            <Kpi label="Brutomarge excl. btw" waarde={c.inkoop_onbekend ? "onvolledig" : euro(c.marge_excl_cent)} sub={`producten ${euro(c.product_marge_excl_cent)}, rest is bezorgopbrengst`} />
          </>
        )}
        <Kpi label="Betaald" waarde={c.betaalstatus.betaald} sub={`${euro(c.ontvangen_cent)} ontvangen`} />
        <Kpi label="Openstaand" waarde={c.betaalstatus.open + c.betaalstatus.verzoek} sub={`${euro(c.openstaand_cent)} nog te ontvangen · ${c.betaalstatus.verzoek} verzoek verstuurd`} />
        <Kpi label="Nog af te halen" waarde={c.af_te_halen} sub={`${c.afgehaald} afgehaald`} />
        {c.voorbestellingen > 0 && <Kpi label="Voorbestellingen open" waarde={c.voorbestellingen} sub="geplaatst voordat de voorraad er lag" />}
        <Kpi label="Nog te bezorgen" waarde={c.te_bezorgen} sub={`${c.bezorgd} bezorgd`} />
        <Kpi label="Aan de weg" waarde={c.per_kanaal.straat.bestellingen + c.per_kanaal.beheer.bestellingen} sub={`${euro(c.per_kanaal.straat.omzet_cent + c.per_kanaal.beheer.omzet_cent)} omzet`} />
        {c.btw_cent !== null && <Kpi label="Waarvan btw (21%)" waarde={euro(c.btw_cent)} sub="over omzet incl. bezorgkosten" />}
      </div>
      {c.terug_te_betalen_cent > 0 && <p className="sz-melding sz-melding--let">Let op: er is {euro(c.terug_te_betalen_cent)} ontvangen op geannuleerde bestellingen. Registreer de terugbetaling bij die bestellingen.</p>}
      <div className="bh-twee">
        <section className="bh-kaart">
          <h2>Per product</h2>
          {c.per_product.length === 0 ? (
            <p className="bh-sub">Nog geen bestellingen.</p>
          ) : (
            <table className="bh-tabel">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="bh-getal">Aantal</th>
                  <th className="bh-getal">Gewicht</th>
                  <th className="bh-getal">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {c.per_product.map((p) => (
                  <tr key={p.product_id}>
                    <td>{p.naam}</td>
                    <td className="bh-getal">{p.aantal}</td>
                    <td className="bh-getal">{kg(p.gewicht_gram)}</td>
                    <td className="bh-getal">{euro(p.omzet_cent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="bh-kaart">
          <h2>Status van bestellingen</h2>
          {Object.entries(c.per_status).map(([s, n]) => {
            const totaal = Object.values(c.per_status).reduce((a, b) => a + b, 0) || 1;
            return (
              <div key={s} style={{ marginBottom: 10 }}>
                <div className="bh-rij bh-rij--tussen" style={{ fontSize: 14.5 }}>
                  <span>{{ nieuw: "Nieuw", bevestigd: "Bevestigd", klaar: "Klaar", afgehaald: "Afgehaald", bezorgd: "Bezorgd", geannuleerd: "Geannuleerd" }[s] ?? s}</span>
                  <span className="sz-tnum">{n}</span>
                </div>
                <div className="bh-staaf" aria-hidden="true">
                  <span style={{ width: `${(n / totaal) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      </div>
      <Bezoek />
    </>
  );
}
