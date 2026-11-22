// Homepage: in één oogopslag wat, wat het kost, wanneer, en direct bestellen. Verder weinig woorden.

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { aanbiedingGeldig, alsPrijsProduct, bereken, dagTekst, euro, stukprijs, type Levering, type PubliekProduct, type Winkel } from "../../shared/strooizout";
import { IcoonDelen, IcoonKlok, IcoonLet, IcoonPijlRechts } from "./iconen";
import { useMand } from "./mandje";
import { Aantal, maxVoor } from "./opmaak";
import { WINKEL_URL } from "./qr";
import { useWinkel } from "./winkeldata";
import { extern } from "./router";

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
      <a href={extern(`/strooizout/bestelling#${laatste.code}`)}>
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

/** Keuzes 1 zak / eerste staffel / tweede staffel, met prijs en besparing ten opzichte van losse zakken. */
function keuzesVoor(p: PubliekProduct, nu: string, max: number): { aantal: number; totaal: number; besparing: number; label: string }[] {
  const drempels = [...new Set(p.aanbiedingen.filter((a) => aanbiedingGeldig(a, nu) && a.vanaf_aantal > 1 && a.prijs_cent < p.prijs_cent).map((a) => a.vanaf_aantal))].sort((a, b) => a - b);
  const labels = ["Voordelige keuze", "Extra voordeel"];
  return [1, ...drempels.slice(0, 2)]
    .filter((n) => n <= max)
    .map((n, i) => {
      const totaal = stukprijs(alsPrijsProduct(p), n, nu).cent * n;
      return { aantal: n, totaal, besparing: n * p.prijs_cent - totaal, label: i === 0 ? "" : labels[i - 1] };
    });
}

/** Prijs per zak per staffel, kort: ‘1 zak € 10,49 · 2–3 € 9,49 · vanaf 4 € 8,99’. */
function Staffelprijzen({ p, nu }: { p: PubliekProduct; nu: string }) {
  const treden = [...p.aanbiedingen.filter((a) => aanbiedingGeldig(a, nu) && a.vanaf_aantal > 1 && a.prijs_cent < p.prijs_cent)].sort((a, b) => a.vanaf_aantal - b.vanaf_aantal);
  if (!treden.length) return null;
  const delen = [`1 ${p.eenheid} ${euro(p.prijs_cent)}`];
  treden.forEach((a, i) => {
    const tot = treden[i + 1]?.vanaf_aantal;
    delen.push(`${tot ? (tot - 1 > a.vanaf_aantal ? `${a.vanaf_aantal}–${tot - 1}` : `${a.vanaf_aantal}`) : `vanaf ${a.vanaf_aantal}`} ${euro(a.prijs_cent)}`);
  });
  return <p className="sz-bestelkaart__staffel">Per {p.eenheid}: {delen.map((d) => d.replace(/ /g, "\u00a0")).join(" · ")}</p>;
}

function Bestelmodule({ p, winkel }: { p: PubliekProduct; winkel: Winkel }) {
  const { zet, regels, leeg } = useMand();
  const inst = winkel.instellingen;
  const max = Math.max(1, maxVoor(p));
  const keuzes = useMemo(() => keuzesVoor(p, winkel.nu, max), [p, winkel.nu, max]);
  // Standaard de eerste voordeelkeuze (2 zakken), tenzij er al iets in het mandje zit.
  const [aantal, setAantal] = useState(() => Math.min(max, regels.find((r) => r.product_id === p.id)?.aantal ?? keuzes[1]?.aantal ?? 1));
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
  const kan = winkel.open && p.voorraad !== 0;
  const meervoud = p.eenheid === "zak" ? "zakken" : p.eenheid === "emmer" ? "emmers" : "stuks";

  return (
    <section className="sz-bestelkaart" aria-labelledby="sz-product-titel">
      <div className="sz-bestelkaart__product">
        <img src={p.afbeelding} alt={p.afbeelding_alt || p.naam} width={88} height={88} />
        <div>
          <h2 id="sz-product-titel">{p.naam.replace(/^Strooizout (\d+) kg$/, "$1 kg strooizout")}</h2>
          <Staffelprijzen p={p} nu={winkel.nu} />
          <Beschikbaarheid p={p} winkel={winkel} />
        </div>
      </div>

      {!winkel.open ? (
        <RondeStatus winkel={winkel} />
      ) : (
        <>
          {keuzes.length > 1 && (
            <div className="sz-aantallen" role="radiogroup" aria-label={`Hoeveel ${meervoud}?`}>
              {keuzes.map((k) => (
                <label key={k.aantal} className={`sz-aantalkeuze${aantal === k.aantal ? " is-actief" : ""}`}>
                  <input type="radio" name="sz-keuze" checked={aantal === k.aantal} onChange={() => setAantal(k.aantal)} />
                  {k.label && <span className="sz-aantalkeuze__label">{k.label}</span>}
                  <span className="sz-aantalkeuze__aantal">
                    {k.aantal} {k.aantal === 1 ? p.eenheid : meervoud}
                  </span>
                  <strong className="sz-aantalkeuze__prijs sz-tnum">{euro(k.totaal)}</strong>
                  <span className="sz-aantalkeuze__bespaar">{k.besparing > 0 ? `bespaar ${euro(k.besparing)}` : " "}</span>
                </label>
              ))}
            </div>
          )}
          <div className="sz-bestelkaart__keuze">
            <div className="sz-anders">
              <span>Ander aantal</span>
              <Aantal waarde={aantal} max={max} label={p.naam} onChange={(n) => setAantal(n)} />
            </div>
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
              ? `Bezorgen binnen de rondweg: ${euro(som.bezorg_cent)} (${euro(inst.bezorg_per_stuk_cent)} per zak).`
              : inst.bezorgen_aan && !bezorgKan
                ? `Afhalen is gratis. Bezorgen kan vanaf ${inst.bezorg_min_zakken} zakken, binnen de rondweg.`
                : "Afhalen is gratis, in Houten."}
          </p>

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
          <p className="sz-tip">Neem er eentje mee voor je buren.</p>
        </>
      )}
    </section>
  );
}

/** Een product dat eraan komt (bijv. de emmer van 5 kg): zichtbaar, niet te bestellen. */
function Binnenkort({ p }: { p: PubliekProduct }) {
  return (
    <section className="sz-binnenkort" aria-label={`Binnenkort: ${p.naam}`}>
      <img src={p.afbeelding} alt={p.afbeelding_alt || ""} width={64} height={64} loading="lazy" />
      <div>
        <p className="sz-binnenkort__titel">
          {p.naam.replace(/^Strooizout (\d+) kg in emmer$/, "Emmer met $1 kg strooizout")} <span className="sz-nowrap">{euro(p.prijs_cent)}</span>
        </p>
        <p>{p.kort}</p>
      </div>
      <span className="sz-binnenkort__pil">Binnenkort</span>
    </section>
  );
}

/** Deel de webshop met buren: het deelmenu van de telefoon, anders WhatsApp. */
function Delen({ winkel }: { winkel: Winkel }) {
  const zak = winkel.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel.producten[0];
  const laagste = zak ? Math.min(zak.prijs_cent, ...zak.aanbiedingen.filter((a) => aanbiedingGeldig(a, winkel.nu)).map((a) => a.prijs_cent)) : null;
  const tekst = `Strooizout uit je eigen buurt${laagste ? `: 25 kg vanaf ${euro(laagste)} per zak` : ""}. Zullen we samen bestellen?`;
  return (
    <button
      type="button"
      className="sz-knop sz-knop--licht sz-delen"
      onClick={async () => {
        const data = { title: "Strooizout voor de buurt", text: tekst, url: WINKEL_URL };
        try {
          if (navigator.share) return await navigator.share(data);
        } catch {
          return; // geannuleerd
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(`${tekst} ${WINKEL_URL}`)}`, "_blank", "noopener");
      }}
    >
      <IcoonDelen /> Deel met je buren
    </button>
  );
}

/** Zo werkt het en verantwoord strooien: kort. */
function Uitleg() {
  return (
    <div className="sz-uitleg">
      <div className="sz-wrap sz-uitleg__in">
        <section aria-labelledby="sz-zo">
          <h2 id="sz-zo">Zo werkt het</h2>
          <ol className="sz-stappen">
            <li>
              <span>
                <b>Bestel</b> je aantal. Je krijgt direct een afhaalcode.
              </span>
            </li>
            <li>
              <span>
                <b>Haal gratis af</b> in Houten, of laat bezorgen binnen de rondweg.
              </span>
            </li>
            <li>
              <span>
                <b>Betaal</b> bij ontvangst of met een betaalverzoek.
              </span>
            </li>
          </ol>
          <p className="sz-uitleg__klein">Bestel samen met je buren: hoe meer zakken, hoe lager de prijs per zak. Verdeel ze daarna in de straat.</p>
        </section>
        <section aria-labelledby="sz-bewust" className="sz-bewust">
          <h2 id="sz-bewust">Strooi bewust</h2>
          <p>
            <b>Eerst sneeuw ruimen, daarna alleen strooien waar het nodig is.</b> Strooi dun: een handje per vierkante meter is meestal genoeg. Meer zout werkt niet beter.
          </p>
          <p>Te veel zout is slecht voor planten, bomen, bodem en slootwater, en kan beton, stenen en metaal aantasten. Bij strenge vorst werkt zout minder; zand of split geeft dan grip.</p>
          <p>Heb je een hond? Spoel of veeg na het uitlaten de poten af; zout kan irriteren.</p>
        </section>
      </div>
    </div>
  );
}

export function WinkelPagina() {
  const { winkel, fout, herlaad } = useWinkel();
  const hoofd = winkel?.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel?.producten[0];

  return (
    <>
      <div className="sz-start">
        <div className="sz-wrap sz-start__in">
          <div className="sz-start__kop">
            <h1>Strooizout uit je eigen buurt.</h1>
            <p className="sz-payoff">Hou je buurt veilig. Strooi bewust.</p>
            <p className="sz-intro">Geen aparte rit naar de bouwmarkt. Bestel samen met je buren en houd je stoep veilig.</p>
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
            {winkel?.binnenkort?.map((p) => <Binnenkort key={p.id} p={p} />)}
            {winkel && <Delen winkel={winkel} />}
            <p className="sz-buur">Strooi ook eens bij een buur die dat zelf niet kan.</p>
          </div>
        </div>
      </div>
      <Uitleg />
    </>
  );
}
