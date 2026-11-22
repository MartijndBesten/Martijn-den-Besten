// Verkoop aan de weg: QR op het bord → aantal kiezen → mobiel nummer → code. De verkoper bevestigt betaling en uitgifte
// in het beheer (tabblad Afhalen). Er is (nog) geen betaalprovider die een betaling betrouwbaar bevestigt, dus deze route
// geeft nooit zelf zakken vrij en zegt nergens dat er al betaald is. Zie docs/strooizout/README.md › Verkoop aan de weg.

import { useMemo, useRef, useState, type FormEvent } from "react";
import { herkomst } from "./meting";
import { alsPrijsProduct, bereken, euro, normaliseerMobiel, volgendeStaffel } from "../../shared/strooizout";
import { vraag, type KlantBestelling } from "./api";
import { IcoonLet, Logo } from "./iconen";
import { Aantal, maxVoor, StaffelHint } from "./opmaak";
import { useRouter } from "./router";
import { useWinkel } from "./winkeldata";

export default function AanDeWeg() {
  const { winkel } = useWinkel();
  const { navigeer } = useRouter();
  const p = winkel?.producten.find((x) => x.slug === "strooizout-25-kg") ?? winkel?.producten[0];
  const [aantal, setAantal] = useState(1);
  const [mobiel, setMobiel] = useState("");
  const [fout, setFout] = useState("");
  const [veldFout, setVeldFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const start = useRef(Date.now());
  const idem = useRef(crypto.randomUUID());
  const som = useMemo(() => (p && winkel ? bereken([{ product: alsPrijsProduct(p), aantal }], "ophalen", winkel.instellingen, winkel.nu) : null), [p, winkel, aantal]);

  if (!winkel) return <div className="sz-laden" aria-busy="true">Even laden…</div>;
  if (!p || !som) return <div className="sz-straat"><p className="sz-melding sz-melding--let">Er wordt nu niets verkocht.</p></div>;
  const ligtEr = p.op_voorraad === true;

  async function verstuur(e: FormEvent) {
    e.preventDefault();
    if (bezig) return;
    setFout("");
    if (!normaliseerMobiel(mobiel)) {
      setVeldFout("Vul je mobiele nummer in, bijvoorbeeld 06 1234 5678.");
      return;
    }
    setVeldFout("");
    setBezig(true);
    const wacht = Math.max(0, 2600 - (Date.now() - start.current));
    if (wacht) await new Promise((r) => setTimeout(r, wacht));
    const r = await vraag<{ bestelling: KlantBestelling }>("/api/strooizout/bestelling", {
      method: "POST",
      body: JSON.stringify({
        kanaal: "straat",
        ...herkomst(),
        idempotentie: idem.current,
        regels: [{ product_id: p!.id, aantal }],
        levering: "ophalen",
        betaalwijze: "bij_ontvangst",
        klant: { telefoon: mobiel },
        akkoord: true,
        bedrijf_extra: "",
        invultijd_ms: Date.now() - start.current,
      }),
    });
    if (!r.ok) {
      setBezig(false);
      setFout(r.error);
      return;
    }
    try {
      sessionStorage.setItem("strooizout:net-besteld", r.data.bestelling.code);
      localStorage.setItem("strooizout:laatste", JSON.stringify({ code: r.data.bestelling.code, afhaalcode: r.data.bestelling.afhaalcode }));
    } catch {
      /* geen opslag */
    }
    navigeer(`/strooizout/bestelling#${r.data.bestelling.code}`, { vervang: true });
  }

  return (
    <main className="sz-straat" id="sz-inhoud">
      <Logo />
      <h1>Strooizout — 25 kg</h1>
      <p className="sz-straat__prijs">
        <strong className="sz-tnum">{euro(p.prijs_cent)}</strong> per zak
        {p.aanbiedingen.filter((a) => a.vanaf_aantal > 1).slice(0, 1).map((a) => (
          <span key={a.id}> · vanaf {a.vanaf_aantal} zakken {euro(a.prijs_cent)}</span>
        ))}
      </p>
      {!ligtEr ? (
        <p className="sz-melding sz-melding--let">
          <IcoonLet />
          <span>Er ligt nu geen voorraad aan de weg. Reserveren kan wel op de webshop.</span>
        </p>
      ) : (
        <form className="sz-straat__kaart" onSubmit={verstuur} noValidate>
          <ol className="sz-straat__stappen">
            <li>Kies het aantal zakken.</li>
            <li>Vul je mobiele nummer in.</li>
            <li>Laat je code zien en betaal met het betaalverzoek dat je van de verkoper krijgt.</li>
          </ol>
          <div className="sz-straat__rij">
            <Aantal waarde={aantal} max={Math.max(1, maxVoor(p))} label="zakken" onChange={setAantal} />
            <div className="sz-straat__totaal">
              <span>Te betalen</span>
              <strong className="sz-tnum">{euro(som.totaal_cent)}</strong>
            </div>
          </div>
          <StaffelHint staffel={volgendeStaffel(alsPrijsProduct(p), aantal, winkel.nu)} eenheid={p.eenheid} max={maxVoor(p)} onKies={setAantal} />
          <div className="sz-veld" style={{ marginTop: 14 }}>
            <label htmlFor="sz-weg-mobiel">Mobiel nummer</label>
            <input
              id="sz-weg-mobiel"
              className="sz-invoer"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="06 1234 5678"
              value={mobiel}
              onChange={(e) => setMobiel(e.target.value)}
              aria-invalid={veldFout ? true : undefined}
              aria-describedby={veldFout ? "sz-weg-fout" : undefined}
            />
            {veldFout && (
              <p className="sz-veld__fout" id="sz-weg-fout">
                {veldFout}
              </p>
            )}
          </div>
          {fout && (
            <p className="sz-melding sz-melding--fout" role="alert">
              <IcoonLet />
              <span>{fout}</span>
            </p>
          )}
          <button type="submit" className="sz-knop sz-knop--vol sz-knop--groot" style={{ marginTop: 14 }} disabled={bezig}>
            {bezig ? "Even geduld…" : "Code ophalen"}
          </button>
          <p className="sz-klein">Je betaalt met een betaalverzoek van de verkoper; de zakken krijg je na betaling mee. Prijzen inclusief 21% btw.</p>
        </form>
      )}
      <p className="sz-buur">Strooi ook bij een buur die dat zelf niet kan.</p>
    </main>
  );
}
