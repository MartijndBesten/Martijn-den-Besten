// Financiën: omzet en kosten, marge per product, brutowinst, bezorgopbrengsten, betaalstatussen en exports.

import { useEffect, useState } from "react";
import { euro } from "../../../shared/strooizout";
import { downloadMetToken, Kpi, kg, rondeQuery, useBeheer } from "./basis";
import type { Cijfers } from "./typen";

type Data = { cijfers: Cijfers; per_wijze: { wijze: string; n: number; som: number }[]; werkelijke_inkoop_cent: number | null; btw_modus: string; btw_tarief: number };

const WIJZE: Record<string, string> = { contant: "Contant", tikkie: "Tikkie", overboeking: "Overboeking", pin: "Pin", provider: "Online", terugbetaling: "Terugbetaald" };

export default function Financien() {
  const { api, ronde, token, meld } = useBeheer();
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    void api<Data>(`/financien?${rondeQuery(ronde)}`).then((r) => (r.ok ? setD(r.data) : meld(r.error, true)));
  }, [api, ronde, meld]);
  const exporteer = async (soort: string) => {
    const f = await downloadMetToken(`/export/${soort}.csv?${rondeQuery(ronde)}`, token, `strooizout-${soort}-${ronde || "laatste"}.csv`);
    if (f) meld(f, true);
  };
  if (!d) return <p>Laden…</p>;
  const c = d.cijfers;
  const werkelijk = d.werkelijke_inkoop_cent;
  // Zonder ingevulde inkoopprijs of geregistreerde inkoop tonen we geen marge (die zou alleen ‘onbekend’ zeggen).
  const marge = c.inkoop_bekend || werkelijk !== null;
  return (
    <>
      <div className="bh-rij bh-rij--tussen">
        <div>
          <h1>Financiën</h1>
          <p className="bh-sub">Bedragen van niet-geannuleerde bestellingen. {marge ? "Inkoop volgens de ingestelde inkoopprijzen, tenzij anders vermeld." : "Marge verschijnt zodra er een inkoopprijs is ingevuld (Producten of Bestelrondes)."}</p>
        </div>
        <div className="bh-knoppen">
          <button type="button" className="bh-knop" onClick={() => void exporteer("financien")}>
            CSV administratie
          </button>
          {marge && (
            <button type="button" className="bh-knop" onClick={() => void exporteer("producten")}>
              CSV marge per product
            </button>
          )}
        </div>
      </div>
      <div className="bh-kpis">
        <Kpi label="Omzet" waarde={euro(c.omzet_cent)} sub={d.btw_modus === "inclusief" && c.btw_cent !== null ? `waarvan ${d.btw_tarief}% btw: ${euro(c.btw_cent)}` : "btw niet van toepassing ingesteld"} nadruk />
        <Kpi label="Producten (normale prijs)" waarde={euro(c.product_omzet_cent + c.korting_cent)} />
        <Kpi label="Staffelkorting en aanbiedingen" waarde={euro(c.korting_cent)} sub="al verwerkt in de omzet" />
        <Kpi label="Omzet producten" waarde={euro(c.product_omzet_cent)} sub="na korting" />
        <Kpi label="Bezorgopbrengst" waarde={euro(c.bezorg_cent)} />
        {marge && (
          <>
            <Kpi label="Inkoopkosten (verwacht)" waarde={euro(c.inkoop_cent)} sub={c.inkoop_onbekend ? "niet alle inkoopprijzen bekend" : undefined} />
            <Kpi label="Brutomarge excl. btw" waarde={c.inkoop_onbekend ? "onvolledig" : euro(c.marge_excl_cent)} sub={`omzet min inkoop, beide zonder btw; producten ${euro(c.product_marge_excl_cent)}. Bezorg- en overige kosten niet meegeteld`} />
            <Kpi label="Werkelijke inkoop" waarde={werkelijk === null ? "–" : euro(werkelijk)} sub={werkelijk === null ? "nog niet geregistreerd" : `marge excl. btw: ${euro(Math.round(((c.omzet_cent - werkelijk) * 100) / (100 + (d.btw_modus === "inclusief" ? d.btw_tarief : 0))))}`} />
          </>
        )}
        <Kpi label="Ontvangen" waarde={euro(c.ontvangen_cent)} />
        <Kpi label="Nog te ontvangen" waarde={euro(c.openstaand_cent)} sub={`${c.betaalstatus.open} openstaand, ${c.betaalstatus.verzoek} verzoek verstuurd`} />
        <Kpi label="Terugbetaald" waarde={euro(c.terugbetaald_cent)} sub={`${c.betaalstatus.terugbetaald} bestellingen`} />
      </div>
      {c.terug_te_betalen_cent > 0 && <p className="sz-melding sz-melding--let">Ontvangen op geannuleerde bestellingen: {euro(c.terug_te_betalen_cent)}. Registreer de terugbetaling.</p>}
      <div className="bh-twee">
        <section className="bh-kaart">
          <h2>{marge ? "Marge per product" : "Verkoop per product"}</h2>
          {c.per_product.length === 0 ? (
            <p className="bh-sub">Nog geen verkopen.</p>
          ) : (
            <div className="bh-tabel-wrap">
              <table className="bh-tabel">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="bh-getal">Aantal</th>
                    <th className="bh-getal">Omzet</th>
                    {marge && <th className="bh-getal">Inkoop</th>}
                    {marge && <th className="bh-getal">Marge excl. btw</th>}
                  </tr>
                </thead>
                <tbody>
                  {c.per_product.map((p) => (
                    <tr key={p.product_id}>
                      <td>
                        {p.naam}
                        <div style={{ fontSize: 13, color: "var(--tekst-3)" }}>{kg(p.gewicht_gram)}</div>
                      </td>
                      <td className="bh-getal">{p.aantal}</td>
                      <td className="bh-getal">{euro(p.omzet_cent)}</td>
                      {marge && <td className="bh-getal">{p.inkoop_onbekend ? "onbekend" : euro(p.inkoop_cent)}</td>}
                      {marge && <td className="bh-getal">{p.marge_excl_cent === null ? "–" : euro(p.marge_excl_cent)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="bh-kaart">
          <h2>Betalingen</h2>
          <table className="bh-tabel">
            <tbody>
              <tr>
                <td>Openstaand</td>
                <td className="bh-getal">{c.betaalstatus.open}</td>
              </tr>
              <tr>
                <td>Betaalverzoek verstuurd</td>
                <td className="bh-getal">{c.betaalstatus.verzoek}</td>
              </tr>
              <tr>
                <td>Betaald</td>
                <td className="bh-getal">{c.betaalstatus.betaald}</td>
              </tr>
              <tr>
                <td>Terugbetaald</td>
                <td className="bh-getal">{c.betaalstatus.terugbetaald}</td>
              </tr>
            </tbody>
          </table>
          <h3>Per betaalwijze</h3>
          {d.per_wijze.length === 0 ? (
            <p className="bh-sub">Nog geen betalingen geregistreerd.</p>
          ) : (
            <table className="bh-tabel">
              <tbody>
                {d.per_wijze.map((w) => (
                  <tr key={w.wijze}>
                    <td>{WIJZE[w.wijze] ?? w.wijze}</td>
                    <td className="bh-getal">{w.n}×</td>
                    <td className="bh-getal">{euro(w.som)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="bh-sub" style={{ marginTop: 12 }}>
            Er worden geen bankgegevens of betaalgeheimen bewaard. Betalingen worden alleen handmatig geregistreerd.
          </p>
        </section>
      </div>
    </>
  );
}
