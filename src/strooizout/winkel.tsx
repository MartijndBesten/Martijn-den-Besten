// Homepage: in één oogopslag wat, wat het kost, wanneer, en direct bestellen. Verder weinig woorden.

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { aanbiedingGeldig, alsPrijsProduct, bereken, dagTekst, euro, volgendeStaffel, type Levering, type PubliekProduct, type Winkel } from "../../shared/strooizout";
import { IcoonKlok, IcoonLet, IcoonPijlRechts } from "./iconen";
import { useMand } from "./mandje";
import { Aantal, maxVoor, StaffelHint } from "./opmaak";
import { useWinkel } from "./winkeldata";

const Afrekenen = lazy(() => import("./afrekenen"));

export function RondeStatus({ winkel }: { winkel: Winkel }) {
  if (winkel.open) return null;
  return (
    <div className="sz-status sz-status--dicht" role="status">
      <IcoonLet />
      <div>
        <strong>Op dit moment kun je niet bestellen</strong>
        {winkel.melding}
      </div>
    </div>
  );
}

/** Snel terug naar je laatste bestelling en afhaalcode (alleen in deze browser bewaard). */
function LaatsteBestelling() {
  const [laatste] = useState<{ code: string; afhaalcode: string } | null>(() => {
    try {
      const v = JSON.parse(localStorage.getItem("strooizout:laatste") ?? "null");
      return v && typeof v.code === "string" ? v : null;
    } catch {
      return null;
    }
  });
  if (!laatste) return null;
  return (
    <p className="sz-laatste">
      <a href={`/strooizout/bestelling#${laatste.code}`}>
        Je bestelling{laatste.afhaalcode ? ` ${laatste.afhaalcode}` : ""} bekijken <IcoonPijlRechts />
      </a>
    </p>
  );
}

/** ‘Op voorraad’, ‘Op voorraad vanaf donderdag 26 november’ of ‘Uitverkocht’: alleen wat vaststaat. */
function Beschikbaarheid({ p, winkel }: { p: PubliekProduct; winkel: Winkel }) {
  const vanaf = winkel.instellingen.beschikbaar_vanaf;
  if (p.voorraad === 0) return <p className="sz-beschikbaar sz-beschikbaar--op">Uitverkocht. Reserveren is niet meer mogelijk.</p>;
  const tekst = p.op_voorraad ? "Op voorraad" : vanaf ? `Op voorraad vanaf ${dagTekst(vanaf)}` : "Reserveer nu, we laten weten wanneer het binnen is";
  return (
    <p className={`sz-beschikbaar${p.op_voorraad ? " sz-beschikbaar--ja" : ""}`}>
      <IcoonKlok />
      <span>
        {tekst}
        {p.voorraad !== null && p.voorraad <= 10 && ` · nog ${p.voorraad} te reserveren`}
      </span>
    </p>
  );
}

function Bestelmodule({ p, winkel }: { p: PubliekProduct; winkel: Winkel }) {
  const { zet, regels, leeg } = useMand();
  const inst = winkel.instellingen;
  const max = Math.max(1, maxVoor(p));
  const [aantal, setAantal] = useState(() => Math.min(max, regels.find((r) => r.product_id === p.id)?.aantal ?? 1));
  const [levering, setLevering] = useState<Levering>("ophalen");
  const [verder, setVerder] = useState(false);
  const formulier = useRef<HTMLDivElement>(null);

  const zakken = aantal * Math.max(1, p.zakken_per_stuk);
  const bezorgKan = inst.bezorgen_aan && zakken >= inst.bezorg_min_zakken;
  useEffect(() => {
    if (levering === "bezorgen" && !bezorgKan) setLevering("ophalen");
  }, [levering, bezorgKan]);
  // Het mandje volgt de keuze hier (één product op de homepage).
  useEffect(() => {
    if (verder) zet(p.id, aantal);
  }, [verder, aantal, p.id, zet]);

  const som = useMemo(() => bereken([{ product: alsPrijsProduct(p), aantal }], levering, inst, winkel.nu), [p, aantal, levering, inst, winkel.nu]);
  const staffel = p.aanbiedingen.filter((a) => aanbiedingGeldig(a, winkel.nu) && a.vanaf_aantal > 1).sort((a, b) => a.vanaf_aantal - b.vanaf_aantal)[0];
  const eenheid = p.eenheid === "zak" ? "zakken" : "stuks";
  const kan = winkel.open && p.voorraad !== 0;

  return (
    <section className="sz-bestelkaart" aria-labelledby="sz-product-titel">
      <div className="sz-bestelkaart__product">
        <img src={p.afbeelding} alt={p.afbeelding_alt || p.naam} width={88} height={88} />
        <div>
          <h2 id="sz-product-titel">
            {p.naam.replace(/^Strooizout (\d+) kg$/, "$1 kg strooizout")}{" "}
            <span className="sz-nowrap">
              <span className="sz-streep">—</span> <span className="sz-tnum">{euro(p.prijs_cent)}</span>
            </span>
          </h2>
          {staffel && (
            <p className="sz-bestelkaart__staffel">
              Vanaf {staffel.vanaf_aantal} {eenheid} {euro(staffel.prijs_cent)} per {p.eenheid}.
            </p>
          )}
          <Beschikbaarheid p={p} winkel={winkel} />
        </div>
      </div>

      {!winkel.open ? (
        <RondeStatus winkel={winkel} />
      ) : (
        <>
          <div className="sz-bestelkaart__keuze">
            <Aantal waarde={aantal} max={max} label={p.naam} onChange={(n) => setAantal(n)} />
            <div className="sz-segment" role="radiogroup" aria-label="Afhalen of bezorgen">
              <label className={levering === "ophalen" ? "is-actief" : ""}>
                <input type="radio" name="sz-levering" checked={levering === "ophalen"} onChange={() => setLevering("ophalen")} disabled={!inst.afhalen_aan} />
                Afhalen
              </label>
              <label className={`${levering === "bezorgen" ? "is-actief" : ""}${!bezorgKan ? " is-uit" : ""}`}>
                <input type="radio" name="sz-levering" checked={levering === "bezorgen"} onChange={() => setLevering("bezorgen")} disabled={!bezorgKan} />
                Bezorgen
              </label>
            </div>
          </div>
          <p className="sz-bestelkaart__toelichting" aria-live="polite">
            {levering === "bezorgen"
              ? `Bezorgen in Houten: ${euro(som.bezorg_cent)} (${euro(inst.bezorg_per_stuk_cent)} per zak).`
              : inst.bezorgen_aan && !bezorgKan
                ? `Afhalen is gratis. Bezorgen kan vanaf ${inst.bezorg_min_zakken} zakken.`
                : "Afhalen is gratis, in Houten."}
          </p>
          <StaffelHint staffel={volgendeStaffel(alsPrijsProduct(p), aantal, winkel.nu)} eenheid={p.eenheid} max={max} onKies={(n) => setAantal(n)} />

          <div className="sz-bestelkaart__totaal" aria-live="polite">
            <span>Totaal</span>
            <strong className="sz-tnum">{euro(som.totaal_cent)}</strong>
            {som.korting_cent > 0 && (
              <small>
                <s>{euro(som.subtotaal_cent + som.korting_cent + som.bezorg_cent)}</s> je bespaart {euro(som.korting_cent)}
              </small>
            )}
          </div>

          {!verder ? (
            <button
              type="button"
              className="sz-knop sz-knop--vol sz-knop--groot"
              disabled={!kan}
              onClick={() => {
                leeg(); // op de homepage bestel je dit ene product
                setVerder(true);
                window.setTimeout(() => formulier.current?.querySelector<HTMLInputElement>("input:not([type=radio])")?.focus(), 120);
              }}
            >
              Bestellen
            </button>
          ) : (
            <div ref={formulier} className="sz-bestelkaart__formulier">
              <Suspense fallback={<p>Even laden…</p>}>
                <Afrekenen ingebed={{ levering }} />
              </Suspense>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function WinkelPagina() {
  const { winkel, fout, herlaad } = useWinkel();
  const hoofd = winkel?.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel?.producten[0];

  return (
    <div className="sz-start">
      <div className="sz-wrap sz-start__in">
        <div className="sz-start__kop">
          <h1>Strooizout voor de buurt</h1>
          <p className="sz-payoff">Hou je buurt veilig.</p>
          <img className="sz-start__beeld" src="/strooizout/beeld/strooizout-25kg.webp" alt="" width={940} height={940} fetchPriority="high" />
        </div>
        <div className="sz-start__bestel">
          <LaatsteBestelling />
          {fout && !winkel ? (
            <div className="sz-melding sz-melding--fout" role="alert">
              <IcoonLet />
              <div>
                {fout}{" "}
                <button type="button" className="sz-knop sz-knop--tekst" onClick={() => void herlaad()}>
                  Opnieuw proberen
                </button>
              </div>
            </div>
          ) : !winkel ? (
            <div className="sz-skelet" aria-busy="true" />
          ) : !hoofd ? (
            <p className="sz-melding sz-melding--let">Er staat nu niets te koop. Kijk later nog eens.</p>
          ) : (
            <Bestelmodule p={hoofd} winkel={winkel} />
          )}
          <p className="sz-buur">Strooi ook eens bij een buur die dat zelf niet kan.</p>
        </div>
      </div>
    </div>
  );
}
