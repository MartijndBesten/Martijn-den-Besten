// De webshop: held, producten, hoe het werkt, ophalen/bezorgen/betalen en veelgestelde vragen.

import { useEffect, useMemo, useState } from "react";
import { aanbiedingGeldig, datumTijd, euro, gewichtTekst, parsePostcodes, type PubliekProduct, type Winkel } from "../../shared/strooizout";
import { IcoonBus, IcoonEuro, IcoonHuis, IcoonKlok, IcoonLet, IcoonPijlRechts, IcoonSneeuw, IcoonVink } from "./iconen";
import { useMand } from "./mandje";
import { Aantal, maxVoor } from "./opmaak";
import { Link } from "./router";
import { useWinkel } from "./winkeldata";

function Sneeuw() {
  // Een paar langzaam vallende vlokjes; uit bij ‘minder beweging’ (CSS).
  const vlokken = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 73) % 100}%`,
        size: 3 + ((i * 7) % 5),
        duur: 14 + ((i * 5) % 10),
        wacht: -((i * 3.7) % 20),
        dx: `${((i % 5) - 2) * 18}px`,
        op: 0.5 + ((i * 13) % 5) / 10,
      })),
    [],
  );
  return (
    <div className="sz-sneeuw" aria-hidden="true">
      {vlokken.map((v, i) => (
        <span
          key={i}
          style={{ left: v.left, width: v.size, height: v.size, animationDuration: `${v.duur}s`, animationDelay: `${v.wacht}s`, opacity: v.op, ["--dx" as string]: v.dx }}
        />
      ))}
    </div>
  );
}

export function RondeStatus({ winkel }: { winkel: Winkel }) {
  if (winkel.open && winkel.ronde) {
    return (
      <div className="sz-status sz-status--open" role="status">
        <IcoonKlok />
        <div>
          <strong>Bestellen kan nu</strong>
          {winkel.ronde.sluit_op ? <>Deze bestelronde sluit op {datumTijd(winkel.ronde.sluit_op)}.</> : <>De bestelronde ‘{winkel.ronde.naam}’ is open.</>}
        </div>
      </div>
    );
  }
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

function Held({ winkel }: { winkel: Winkel | null }) {
  const hoofd = winkel?.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel?.producten[0];
  return (
    <section className="sz-held" aria-labelledby="sz-titel">
      <Sneeuw />
      <div className="sz-wrap sz-held__in">
        <div>
          <span className="sz-held__label">
            <IcoonSneeuw /> Voor inwoners van Houten
          </span>
          <h1 id="sz-titel">Strooizout voor de buurt</h1>
          <p className="sz-held__slogan">Samen veilig de winter door.</p>
          <p className="sz-held__tekst">
            We kopen strooizout samen in, zodat het voordelig en dichtbij is. Reserveer je zakken, haal ze gratis op in Houten of laat ze bezorgen. Betalen doe je pas bij ontvangst.
          </p>
          {winkel && <RondeStatus winkel={winkel} />}
          <div className="sz-held__acties">
            <a href="#producten" className="sz-knop">
              Bekijk en bestel <IcoonPijlRechts />
            </a>
            {hoofd && (
              <span className="sz-held__prijs">
                <strong className="sz-tnum">{euro(hoofd.prijs_cent)}</strong> per zak van 25 kg
              </span>
            )}
          </div>
        </div>
        <div className="sz-held__beeld">
          <img src="/strooizout/beeld/strooizout-25kg.webp" alt="Zak strooizout van 25 kilo" width={940} height={940} fetchPriority="high" />
          <div className="sz-held__kaart">
            <strong>Gratis ophalen in Houten</strong>
            {winkel?.instellingen.bezorgen_aan ? "Of laten bezorgen in de buurt." : "Bezorgen is nu niet mogelijk."}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductKaart({ p, winkel }: { p: PubliekProduct; winkel: Winkel }) {
  const { voegToe, regels } = useMand();
  const inMand = regels.find((r) => r.product_id === p.id)?.aantal ?? 0;
  const max = Math.max(0, maxVoor(p) - inMand);
  const [aantal, setAantal] = useState(1);
  const [toegevoegd, setToegevoegd] = useState(false);
  useEffect(() => {
    if (!toegevoegd) return;
    const t = window.setTimeout(() => setToegevoegd(false), 1800);
    return () => window.clearTimeout(t);
  }, [toegevoegd]);
  useEffect(() => {
    if (aantal > max && max > 0) setAantal(max);
  }, [aantal, max]);

  const geldig = p.aanbiedingen.filter((a) => aanbiedingGeldig(a, winkel.nu));
  const direct = geldig.filter((a) => a.vanaf_aantal <= 1).sort((a, b) => a.prijs_cent - b.prijs_cent)[0];
  const staffels = geldig.filter((a) => a.vanaf_aantal > 1).sort((a, b) => a.vanaf_aantal - b.vanaf_aantal);
  const uitverkocht = p.voorraad === 0;
  const kan = winkel.open && !uitverkocht && max > 0;

  return (
    <article className="sz-product" aria-labelledby={`sz-p-${p.id}`}>
      <div className="sz-product__beeld">
        <img src={p.afbeelding} alt={p.afbeelding_alt || p.naam} loading="lazy" width={800} height={600} />
        {direct ? <span className="sz-badge sz-badge--actie">{direct.naam}</span> : p.pakket.length > 0 ? <span className="sz-badge">Pakket</span> : null}
      </div>
      <div className="sz-product__body">
        <h3 id={`sz-p-${p.id}`}>{p.naam}</h3>
        {p.kort && <p className="sz-product__kort">{p.kort}</p>}
        <div className="sz-prijsregel">
          <span className="sz-prijs">{euro(direct ? direct.prijs_cent : p.prijs_cent)}</span>
          {direct && <span className="sz-prijs__oud">{euro(p.prijs_cent)}</span>}
          <span className="sz-prijs__per">per {p.eenheid}</span>
        </div>
        {staffels.map((s) => (
          <p key={s.id} className="sz-melding sz-melding--info" style={{ margin: 0 }}>
            <IcoonEuro />
            <span>
              {s.naam}: vanaf {s.vanaf_aantal} stuks {euro(s.prijs_cent)} per {p.eenheid}
            </span>
          </p>
        ))}
        {p.pakket.length > 0 && (
          <p className="sz-product__kort">
            Bevat: {p.pakket.map((d) => `${d.aantal}× ${d.naam}`).join(", ")}
          </p>
        )}
        {p.specificaties.length > 0 && (
          <dl className="sz-specs">
            {p.specificaties.map((s) => (
              <div key={s.label} style={{ display: "contents" }}>
                <dt>{s.label}</dt>
                <dd>{s.waarde}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.beschrijving && (
          <details className="sz-product__meer">
            <summary>Meer over dit product</summary>
            <p>{p.beschrijving}</p>
          </details>
        )}
        <p className={`sz-voorraad${uitverkocht ? " sz-voorraad--op" : p.voorraad === null ? " sz-voorraad--ronde" : ""}`}>
          {uitverkocht ? "Uitverkocht" : p.voorraad === null ? "Wordt per bestelronde ingekocht" : `Nog ${p.voorraad} beschikbaar`}
          {p.gewicht_gram > 0 && ` · ${gewichtTekst(p.gewicht_gram)}`}
        </p>
        <div className="sz-product__koop">
          <Aantal waarde={Math.min(aantal, Math.max(1, max))} max={Math.max(1, max)} label={p.naam} onChange={setAantal} />
          <button
            type="button"
            className="sz-knop"
            disabled={!kan}
            onClick={() => {
              voegToe(p.id, Math.min(aantal, max));
              setToegevoegd(true);
              setAantal(1);
            }}
          >
            {toegevoegd ? (
              <>
                <IcoonVink /> Toegevoegd
              </>
            ) : uitverkocht ? (
              "Uitverkocht"
            ) : max === 0 && inMand > 0 ? (
              "Maximum in mandje"
            ) : (
              "In mandje"
            )}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {toegevoegd ? `${p.naam} is toegevoegd aan je mandje.` : ""}
        </span>
        {inMand > 0 && !toegevoegd && <p className="sz-klein" style={{ margin: 0 }}>{inMand} in je mandje</p>}
      </div>
    </article>
  );
}

const STAPPEN = [
  { t: "Reserveer online", p: "Kies je aantal en vul je gegevens in. Dat kost ongeveer een minuut. Je hebt geen account nodig." },
  { t: "Wij kopen samen in", p: "Na de sluitdatum van de bestelronde kopen we in één keer in. We laten je weten wanneer je bestelling klaarligt." },
  { t: "Ophalen of bezorgen", p: "Haal je zakken gratis op in Houten, of laat ze bezorgen. Je betaalt pas bij ontvangst of via Tikkie." },
];

function Vragen({ winkel }: { winkel: Winkel }) {
  const inst = winkel.instellingen;
  const vragen = [
    {
      v: "Is mijn reservering een garantie dat ik zout krijg?",
      a: "Nee. We kopen per bestelronde gezamenlijk in. Lukt de inkoop niet (helemaal), dan laten we het je weten en betaal je niets voor wat niet geleverd wordt.",
    },
    { v: "Wanneer en hoe betaal ik?", a: `Pas bij het afhalen of bezorgen${inst.tikkie_aan ? ", of via een Tikkie die je van ons krijgt" : ""}. Je betaalt nooit vooraf via deze website.` },
    {
      v: "Waar haal ik mijn bestelling op?",
      a: `In ${inst.afhaal_plek || "Houten"}. Het precieze adres zie je op je bestelpagina zodra we je reservering hebben bevestigd. Zo blijft het privéadres van de organisator afgeschermd.`,
    },
    {
      v: "Bezorgen jullie ook bij gladheid?",
      a: inst.bezorg_uitleg || "We bezorgen alleen als het veilig kan.",
    },
    { v: "Hoe bewaar ik strooizout?", a: "Droog en goed afgesloten, het liefst van de grond (bijvoorbeeld op een plank of pallet), zodat het niet gaat klonteren. Bewaar het buiten bereik van kinderen en huisdieren." },
    { v: "Hoe strooi ik?", a: "Strooi dun en gelijkmatig. Meer zout werkt niet beter. Volg de aanwijzingen op de verpakking." },
    { v: "Kan ik mijn reservering annuleren?", a: "Ja, kosteloos zolang je bestelling nog niet is afgehaald of bezorgd. Dat kan via de link naar je bestelpagina, of neem contact op." },
  ];
  return (
    <div className="sz-vragen">
      {vragen.map((q) => (
        <details className="sz-vraag" key={q.v}>
          <summary>{q.v}</summary>
          <p>{q.a}</p>
        </details>
      ))}
    </div>
  );
}

export function WinkelPagina() {
  const { winkel, fout, herlaad } = useWinkel();
  const inst = winkel?.instellingen;
  const postcodes = inst ? parsePostcodes(inst.bezorg_postcodes) : [];
  const bezorgMomenten = winkel?.momenten.filter((m) => m.soort === "bezorgen") ?? [];

  return (
    <>
      <Held winkel={winkel} />

      <section className="sz-sectie" id="producten" aria-labelledby="sz-producten-titel">
        <div className="sz-wrap">
          <div className="sz-sectie__kop">
            <span className="sz-oog">Assortiment</span>
            <h2 id="sz-producten-titel">Kies wat je nodig hebt</h2>
            <p>Voeg producten toe aan je mandje. Bij het bestellen kies je of je ophaalt of laat bezorgen.</p>
          </div>
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
            <div className="sz-producten" aria-busy="true">
              <div className="sz-skelet" />
            </div>
          ) : winkel.producten.length === 0 ? (
            <p className="sz-melding sz-melding--info">
              <IcoonInfoKlein /> Er staan nog geen producten klaar. Kijk later nog eens.
            </p>
          ) : (
            <div className="sz-producten">
              {winkel.producten.map((p) => (
                <ProductKaart key={p.id} p={p} winkel={winkel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sz-sectie sz-sectie--ijs" aria-labelledby="sz-hoe-titel">
        <div className="sz-wrap">
          <div className="sz-sectie__kop">
            <span className="sz-oog">Zo werkt het</span>
            <h2 id="sz-hoe-titel">In drie stappen geregeld</h2>
          </div>
          <ol className="sz-stappen">
            {STAPPEN.map((s, i) => (
              <li className="sz-stap" key={s.t}>
                <div className="sz-stap__nr">{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {inst && (
        <section className="sz-sectie" aria-labelledby="sz-info-titel">
          <div className="sz-wrap">
            <div className="sz-sectie__kop">
              <span className="sz-oog">Ophalen, bezorgen en betalen</span>
              <h2 id="sz-info-titel">Duidelijk vooraf</h2>
            </div>
            <div className="sz-info">
              <div className="sz-infokaart">
                <div className="sz-infokaart__icoon">
                  <IcoonHuis />
                </div>
                <h3>Ophalen</h3>
                <ul>
                  <li>{inst.afhalen_aan ? "Gratis" : "Op dit moment niet mogelijk"}</li>
                  <li>In {inst.afhaal_plek || "Houten"}</li>
                  <li>Het precieze adres krijg je na bevestiging</li>
                </ul>
              </div>
              <div className="sz-infokaart">
                <div className="sz-infokaart__icoon">
                  <IcoonBus />
                </div>
                <h3>Bezorgen</h3>
                {inst.bezorgen_aan ? (
                  <ul>
                    <li>
                      {inst.bezorg_methode === "per_stuk" ? `${euro(inst.bezorg_per_stuk_cent)} per zak strooizout` : `${euro(inst.bezorg_per_kg_cent)} per kg`}
                    </li>
                    <li>Alleen in Houten{postcodes.length > 0 && ` (postcodes ${postcodes.join(", ")})`}</li>
                    {bezorgMomenten.length > 0 && <li>{bezorgMomenten.length === 1 ? "Eén bezorgmoment" : `${bezorgMomenten.length} bezorgmomenten`} om uit te kiezen</li>}
                    <li>Alleen als het veilig kan; bij gladheid kan het later worden</li>
                  </ul>
                ) : (
                  <p>Bezorgen is op dit moment niet mogelijk. Ophalen kan wel.</p>
                )}
              </div>
              <div className="sz-infokaart">
                <div className="sz-infokaart__icoon">
                  <IcoonEuro />
                </div>
                <h3>Betalen</h3>
                <ul>
                  <li>Bij afhalen of bezorgen</li>
                  {inst.tikkie_aan && <li>Of via een Tikkie die je van ons krijgt</li>}
                  <li>Nooit vooraf via deze website</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {winkel && (
        <section className="sz-sectie sz-sectie--ijs" aria-labelledby="sz-vragen-titel">
          <div className="sz-wrap">
            <div className="sz-sectie__kop">
              <span className="sz-oog">Vragen</span>
              <h2 id="sz-vragen-titel">Veelgestelde vragen</h2>
              <p>
                Lees ook de <Link naar="/strooizout/voorwaarden">voorwaarden</Link> en de <Link naar="/strooizout/privacy">privacyverklaring</Link>.
              </p>
            </div>
            <Vragen winkel={winkel} />
          </div>
        </section>
      )}
    </>
  );
}

function IcoonInfoKlein() {
  return <IcoonSneeuw />;
}
