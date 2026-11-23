// Homepage: donkere winterhero met het product, één bestelkaart (aantal → gegevens) en daaronder kort hoe het werkt,
// de buurtboodschap en bewust strooien. Beweging komt uit CSS en de hulpjes in beweging.ts.

import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { aanbiedingGeldig, alsPrijsProduct, bereken, dagTekst, euro, stukprijs, type Levering, type PubliekProduct, type Winkel } from "../../shared/strooizout";
import { minderBeweging, useOnthul, useTween } from "./beweging";
import { IcoonDelen, IcoonKlok, IcoonLet, IcoonPijlRechts, IcoonVink } from "./iconen";
import { useMand } from "./mandje";
import { maxVoor } from "./opmaak";
import { metBron, WINKEL_URL } from "./qr";
import { useWinkel } from "./winkeldata";
import { extern, useRouter } from "./router";
import { Scene, Straat } from "./scene";

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
function Beschikbaarheid({ p, winkel, straks }: { p: PubliekProduct; winkel: Winkel; straks?: boolean }) {
  const vanaf = winkel.instellingen.beschikbaar_vanaf;
  if (straks) {
    return (
      <p className="sz-beschikbaar">
        <IcoonKlok />
        <span>Binnenkort te bestellen</span>
      </p>
    );
  }
  if (p.voorraad === 0) return <p className="sz-beschikbaar sz-beschikbaar--op">Uitverkocht. Bestellen is niet meer mogelijk.</p>;
  // Kort: ‘Op voorraad vanaf 26 november’ (zonder weekdag), zodat het op één regel past.
  const tekst = p.op_voorraad ? "Op voorraad" : vanaf ? `Op voorraad vanaf ${dagTekst(vanaf).replace(/^\S+dag\s/, "")}` : "Bestel nu; je hoort wanneer het binnen is";
  return (
    <p className={`sz-beschikbaar${p.op_voorraad ? " sz-beschikbaar--ja" : ""}`}>
      <IcoonKlok />
      <span>
        {tekst}
        {p.voorraad !== null && p.voorraad <= 10 && ` · nog ${p.voorraad} te bestellen`}
      </span>
    </p>
  );
}

type Trede = { vanaf: number; tot: number | null; prijs: number };

/** Prijstreden: losse prijs en daarna elke staffel (‘vanaf 2’, ‘vanaf 4’), met de laagste geldige prijs per trede. */
function tredenVoor(p: PubliekProduct, nu: string): Trede[] {
  const drempels = [...new Set(p.aanbiedingen.filter((a) => aanbiedingGeldig(a, nu) && a.vanaf_aantal > 1 && a.prijs_cent < p.prijs_cent).map((a) => a.vanaf_aantal))].sort((a, b) => a - b);
  const grenzen = [1, ...drempels];
  const treden = grenzen.map((vanaf, i) => ({ vanaf, tot: grenzen[i + 1] ? grenzen[i + 1] - 1 : null, prijs: stukprijs(alsPrijsProduct(p), vanaf, nu).cent }));
  // Treden die geen lagere prijs geven (bijv. een duurdere staffel) samenvoegen met de vorige.
  return treden.filter((t, i) => i === 0 || t.prijs < treden[i - 1].prijs);
}

const tredeLabel = (t: Trede, eenheid: string, meervoud: string) => (t.tot === null ? `${t.vanaf} of meer` : t.tot === t.vanaf ? `${t.vanaf} ${t.vanaf === 1 ? eenheid : meervoud}` : `${t.vanaf}–${t.tot} ${meervoud}`);

/** Bedrag dat soepel naar zijn nieuwe waarde loopt; schermlezers horen alleen het eindbedrag. */
function Bedrag({ cent, className }: { cent: number; className?: string }) {
  const nu = useTween(cent);
  return (
    <>
      <strong className={`sz-tnum ${className ?? ""}`} aria-hidden="true">
        {euro(nu)}
      </strong>
      <span className="sr-only" role="status">
        Totaal {euro(cent)}
      </span>
    </>
  );
}

/** Een keuze in de bestelkaart: een product dat te bestellen is, of een dat eraan komt (zichtbaar, nog niet te bestellen). */
export type Keuze = { p: PubliekProduct; straks: boolean };

/** ‘Strooizout 10 kg in je eigen emmer’ → ‘10 kg’ en ‘eigen emmer’, voor een compacte keuzeknop. */
function keuzeTekst(p: PubliekProduct): { kop: string; sub: string } {
  const m = /^Strooizout (\d+) kg\s*(.*)$/.exec(p.naam);
  if (!m) return { kop: p.naam, sub: "" };
  return { kop: `${m[1]}\u00a0kg`, sub: m[2].replace(/^in (je )?/, "") || p.eenheid };
}

/** De compacte productkeuze boven in de bestelkaart: zak van 25 kg of een van de varianten van 10 kg. */
function Productkeuze({ keuzes, gekozen, nu, onKies }: { keuzes: Keuze[]; gekozen: number; nu: string; onKies: (id: number) => void }) {
  return (
    <div className="wn-keuze" role="radiogroup" aria-label="Kies je verpakking" style={{ "--wn-n": keuzes.length } as React.CSSProperties}>
      {keuzes.map(({ p, straks }) => {
        const t = keuzeTekst(p);
        const laagste = Math.min(p.prijs_cent, ...p.aanbiedingen.filter((a) => aanbiedingGeldig(a, nu)).map((a) => a.prijs_cent));
        return (
          <label key={p.id} className={`wn-keuze__optie${p.id === gekozen ? " is-actief" : ""}`} data-straks={straks}>
            <input type="radio" name="sz-product" checked={p.id === gekozen} onChange={() => onKies(p.id)} />
            <b>{t.kop}</b>
            <span>{t.sub}</span>
            <em className="sz-tnum">
              {laagste < p.prijs_cent && <small>vanaf </small>}
              {euro(laagste)}
            </em>
            {straks && <i>Binnenkort</i>}
          </label>
        );
      })}
    </div>
  );
}

function Bestelkaart({ p, straks, keuzes, winkel, onAantal, onKies }: { p: PubliekProduct; straks: boolean; keuzes: Keuze[]; winkel: Winkel; onAantal: (n: number) => void; onKies: (id: number) => void }) {
  const { zet, regels, leeg } = useMand();
  const { navigeer } = useRouter();
  const inst = winkel.instellingen;
  const max = Math.max(1, maxVoor(p));
  const treden = useMemo(() => tredenVoor(p, winkel.nu), [p, winkel.nu]);
  // Standaard de eerste voordeeltrede (2 zakken), tenzij er al iets in het mandje zit.
  const [aantal, setAantal] = useState(() => Math.max(1, Math.min(max, regels.find((r) => r.product_id === p.id)?.aantal ?? treden[1]?.vanaf ?? 1)));
  const [levering, setLevering] = useState<Levering>("ophalen");
  const [verder, setVerder] = useState(false);
  const stap2 = useRef<HTMLDivElement>(null);

  const zakken = aantal * (p.zakken_per_stuk ?? 1);
  const bezorgKan = inst.bezorgen_aan && !p.alleen_afhalen && zakken >= inst.bezorg_min_zakken;
  useEffect(() => {
    if (levering === "bezorgen" && !bezorgKan) setLevering("ophalen");
  }, [levering, bezorgKan]);
  useEffect(() => onAantal(straks ? 1 : aantal), [aantal, straks, onAantal]);
  // Het mandje volgt de keuze hier (één product op de homepage).
  useEffect(() => {
    if (verder) zet(p.id, aantal);
  }, [verder, aantal, p.id, zet]);

  const som = useMemo(() => bereken([{ product: alsPrijsProduct(p), aantal }], levering, inst, winkel.nu), [p, aantal, levering, inst, winkel.nu]);
  const eenheid = p.eenheid;
  const meervoud = eenheid === "zak" ? "zakken" : eenheid === "emmer" ? "emmers" : "stuks";
  // Zout per 10 kg (in een emmer) tel je in porties: ‘2 × 10 kg’ leest beter dan ‘2 emmers’ als je je eigen emmer meeneemt.
  const perKilo = eenheid === "emmer" && p.gewicht_gram > 0 ? `${p.gewicht_gram / 1000}\u00a0kg` : "";
  const andere = keuzes.filter((k) => !k.straks && k.p.id !== p.id);
  const hoofdKeuze = keuzes.find((k) => !k.straks);
  const actief = treden.reduce((gekozen, t, i) => (aantal >= t.vanaf ? i : gekozen), 0);
  const volgende = treden[actief + 1];
  const tip = volgende && volgende.vanaf - aantal === 1 && volgende.vanaf <= max ? volgende : null;
  const beste = treden.length > 1 && actief === treden.length - 1;
  const stuk = som.regels[0]?.stukprijs_cent ?? p.prijs_cent;
  const kan = winkel.open && !straks && p.voorraad !== 0;
  const bezorgTekst = !inst.bezorgen_aan ? "niet mogelijk" : p.alleen_afhalen ? "alleen afhalen" : !bezorgKan ? `vanaf ${inst.bezorg_min_zakken} zakken` : `+ ${euro(bereken([{ product: alsPrijsProduct(p), aantal }], "bezorgen", inst, winkel.nu).bezorg_cent)}`;

  /** Meer dan één product in dezelfde bestelling: verder op de bestelpagina, met deze keuze alvast in het mandje. */
  function combineer() {
    leeg();
    zet(p.id, aantal);
    navigeer("/strooizout/bestellen");
  }

  function naarStap2() {
    leeg(); // op de homepage bestel je dit ene product
    setVerder(true);
    window.setTimeout(() => {
      stap2.current?.scrollIntoView({ behavior: minderBeweging() ? "auto" : "smooth", block: "start" });
      window.setTimeout(() => stap2.current?.querySelector<HTMLInputElement>("input:not([type=radio])")?.focus({ preventScroll: true }), minderBeweging() ? 0 : 380);
    }, 60);
  }

  const totaal: ReactNode = (
    <div className="sz-bestelkaart__totaal">
      <span className="wn-totaal__label">
        Totaal
        <small className="sz-tnum">
          {aantal} × {euro(stuk)}
          {som.bezorg_cent > 0 && ` + ${euro(som.bezorg_cent)} bezorgen`}
        </small>
      </span>
      <Bedrag cent={som.totaal_cent} />
      {som.korting_cent > 0 && (
        <small className="wn-bespaar" key={som.korting_cent}>
          <s>{euro(som.subtotaal_cent + som.korting_cent + som.bezorg_cent)}</s> je bespaart {euro(som.korting_cent)}
        </small>
      )}
    </div>
  );

  return (
    <section className="sz-bestelkaart wn-kaart" aria-labelledby="sz-product-titel" data-beste={beste} data-open={verder}>
      <header className="wn-kaart__kop">
        <h2 id="sz-product-titel">{p.naam.replace(/^Strooizout (\d+) kg(.*)$/, "$1 kg strooizout$2")}</h2>
        <Beschikbaarheid p={p} winkel={winkel} straks={straks} />
      </header>
      {keuzes.length > 1 && <Productkeuze keuzes={keuzes} gekozen={p.id} nu={winkel.nu} onKies={onKies} />}

      {!winkel.open ? (
        <RondeStatus winkel={winkel} />
      ) : straks ? (
        <div className="wn-straks">
          <p>{p.kort}</p>
          <p className="wn-straks__prijs">
            <b className="sz-tnum">{euro(p.prijs_cent)}</b> per {perKilo || eenheid}
            {p.alleen_afhalen && " · alleen afhalen"}
          </p>
          <p className="wn-straks__noot">Nog niet te bestellen. Zodra het klaarstaat, bestel je het hier.</p>
          {hoofdKeuze && (
            <button type="button" className="sz-knop sz-knop--vol wn-cta" onClick={() => onKies(hoofdKeuze.p.id)}>
              Bestel nu {keuzeTekst(hoofdKeuze.p).kop}
              <IcoonPijlRechts />
            </button>
          )}
        </div>
      ) : (
        <>
          {treden.length > 1 && (
            <div className="wn-rail" role="group" aria-label={`Prijs per ${eenheid}`} style={{ "--wn-n": treden.length, "--wn-i": actief } as React.CSSProperties}>
              <span className="wn-rail__duim" aria-hidden="true" />
              {treden.map((t, i) => (
                <button key={t.vanaf} type="button" className="wn-rail__trede" aria-pressed={i === actief} disabled={t.vanaf > max} onClick={() => setAantal(Math.min(max, t.vanaf))}>
                  <span>{tredeLabel(t, eenheid, meervoud)}</span>
                  <b className="sz-tnum">
                    {euro(t.prijs)}
                    <span className="sr-only"> per {eenheid}</span>
                  </b>
                </button>
              ))}
            </div>
          )}

          <div className="wn-teller" role="group" aria-label={`Aantal ${meervoud}`}>
            <button type="button" className="wn-teller__knop" onClick={() => setAantal((n) => Math.max(1, n - 1))} disabled={aantal <= 1} aria-label={`Eén minder ${p.naam}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 12h12" />
              </svg>
            </button>
            <output className="wn-teller__getal" aria-live="polite" aria-atomic="true">
              <b key={aantal} className="sz-tnum">
                {aantal}
              </b>
              <span>{perKilo ? `× ${perKilo}` : aantal === 1 ? eenheid : meervoud}</span>
            </output>
            <button type="button" className="wn-teller__knop wn-teller__knop--meer" onClick={() => setAantal((n) => Math.min(max, n + 1))} disabled={aantal >= max} aria-label={`Eén meer ${p.naam}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 12h12M12 6v12" />
              </svg>
            </button>
          </div>

          <div className="wn-tip" data-aan={!!tip} aria-live="polite">
            <div>
              {tip && (
                <p>
                  <span>
                    Nog 1 {eenheid} erbij en je betaalt <b>{euro(tip.prijs)}</b> per {eenheid}.
                  </span>
                  <button type="button" onClick={() => setAantal(tip.vanaf)}>
                    Maak er {tip.vanaf} van
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="wn-lever" role="radiogroup" aria-label="Afhalen of bezorgen" data-keuze={levering}>
            <span className="wn-lever__duim" aria-hidden="true" />
            <label className={levering === "ophalen" ? "is-actief" : ""}>
              <input type="radio" name="sz-levering" checked={levering === "ophalen"} onChange={() => setLevering("ophalen")} disabled={!inst.afhalen_aan} />
              <b>Afhalen</b>
              <span>gratis</span>
            </label>
            <label className={`${levering === "bezorgen" ? "is-actief" : ""}${!bezorgKan ? " is-uit" : ""}`}>
              <input type="radio" name="sz-levering" checked={levering === "bezorgen"} onChange={() => setLevering("bezorgen")} disabled={!bezorgKan} />
              <b>Bezorgen</b>
              <span className="sz-tnum">{bezorgTekst}</span>
            </label>
          </div>
          {levering === "bezorgen" && <p className="wn-noot">We bezorgen binnen de rondweg van Houten.</p>}
          {p.melding && <p className="wn-noot wn-noot--let">{p.melding}</p>}

          {!verder ? (
            <>
              {totaal}
              <button type="button" className="sz-knop sz-knop--vol wn-cta" disabled={!kan} onClick={naarStap2}>
                Bestellen
                <IcoonPijlRechts />
              </button>
              <ul className="wn-zeker">
                <li>
                  <IcoonVink /> Betalen met betaalverzoek
                </li>
                <li>
                  <IcoonVink /> Gratis annuleren
                </li>
              </ul>
              {andere.length > 0 && (
                <button type="button" className="sz-knop sz-knop--tekst wn-combineer" onClick={combineer}>
                  Meer producten in één bestelling
                </button>
              )}
            </>
          ) : (
            <div ref={stap2} className="wn-stap2">
              <p className="wn-stap2__kop">
                <span>Stap 2 van 2</span> Je gegevens
              </p>
              <Suspense fallback={<p>Even laden…</p>}>
                <Afrekenen ingebed={{ levering, voorKnop: totaal }} />
              </Suspense>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Deel de webshop met buren: het deelmenu van de telefoon, anders WhatsApp. */
function Delen({ winkel }: { winkel: Winkel | null }) {
  const zak = winkel?.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel?.producten[0];
  const laagste = zak ? Math.min(zak.prijs_cent, ...zak.aanbiedingen.filter((a) => aanbiedingGeldig(a, winkel!.nu)).map((a) => a.prijs_cent)) : null;
  const tekst = `Strooizout uit je eigen buurt${laagste ? `: 25 kg vanaf ${euro(laagste)} per zak` : ""}. Zullen we samen bestellen?`;
  return (
    <button
      type="button"
      className="wn-delen"
      onClick={async () => {
        const url = metBron(WINKEL_URL, "delen");
        const data = { title: "Strooizout voor de buurt", text: tekst, url };
        try {
          if (navigator.share) return await navigator.share(data);
        } catch {
          return; // geannuleerd
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(`${tekst} ${url}`)}`, "_blank", "noopener");
      }}
    >
      <IcoonDelen /> Deel met je buren
    </button>
  );
}

function Stappen() {
  return (
    <section className="wn-stappen" aria-labelledby="wn-zo">
      <div className="sz-wrap">
        <h2 id="wn-zo" className="wn-oog wn-oog--licht">
          Zo werkt het
        </h2>
        <ol className="wn-stappen__lijst">
          {["Bestel online", "Ontvang je afhaalcode", "Haal op of laat bezorgen"].map((stap) => (
            <li key={stap}>
              <span className="wn-stappen__icoon" aria-hidden="true" />
              <b>{stap}</b>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BuurBand({ winkel }: { winkel: Winkel | null }) {
  return (
    <section className="wn-buur" aria-labelledby="wn-buur">
      <div className="sz-wrap wn-buur__in">
        <div className="wn-buur__tekst">
          <p className="wn-oog" data-onthul>
            Hou je buurt veilig
          </p>
          <h2 id="wn-buur" data-onthul>
            Een beetje zout. <span>Een beetje aandacht.</span>
          </h2>
          <p className="wn-buur__sub" data-onthul>
            Strooi ook bij een buur die dat zelf niet kan. En zwaai eens naar elkaar!
          </p>
          <div data-onthul>
            <Delen winkel={winkel} />
          </div>
        </div>
        <div className="wn-buur__beeld" data-onthul>
          <Straat />
        </div>
      </div>
    </section>
  );
}

/**
 * Het filmpje met de fietsers. Eerst staat er alleen een startbeeld met een afspeelknop; de video zelf wordt pas
 * geladen na een tik, zodat de pagina er niet trager van wordt. Het filmpje heeft muziek en geen gesproken tekst.
 */
function Film() {
  const [speelt, setSpeelt] = useState(false);
  return (
    <section className="wn-film" aria-labelledby="wn-film">
      <div className="sz-wrap">
        <h2 id="wn-film" className="wn-oog wn-oog--licht" data-onthul>
          Bekijk het filmpje
        </h2>
        <div className="wn-film__kader" data-onthul>
          {speelt ? (
            <video
              src="/strooizout/film/fiets.mp4"
              poster="/strooizout/film/fiets.webp"
              controls
              autoPlay
              playsInline
              aria-label="Filmpje van 18 seconden, met muziek: twee fietsers glijden uit op een glad fietspad. Na het strooien rijdt iedereen veilig door."
            />
          ) : (
            <button type="button" className="wn-film__start" onClick={() => setSpeelt(true)} aria-label="Speel het filmpje af: fietsers op een glad fietspad (18 seconden, met muziek)">
              <img src="/strooizout/film/fiets.webp" alt="" width={540} height={960} loading="lazy" decoding="async" />
              <span className="wn-film__knop" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <path d="M8 5.2v13.6a1 1 0 0 0 1.52.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Bewust() {
  return (
    <section className="wn-sectie wn-bewust" aria-labelledby="sz-bewust">
      <div className="sz-wrap">
        <p className="wn-oog wn-oog--licht" data-onthul>
          Goed gebruik
        </p>
        <h2 id="sz-bewust" data-onthul>
          Strooi bewust
        </h2>
        <ul className="wn-bewust__lijst">
          <li data-onthul>
            <b>Eerst sneeuw verwijderen</b>
            <span>Strooi alleen waar nodig.</span>
          </li>
          <li data-onthul>
            <b>Een beetje is genoeg</b>
            <span>Te veel zout schaadt planten en dieren.</span>
          </li>
          <li data-onthul>
            <b>Bij strenge vorst</b>
            <span>Gebruik zo nodig zand of split voor grip.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function WinkelPagina() {
  const { winkel, fout, herlaad } = useWinkel();
  const hoofd = winkel?.producten.find((p) => p.slug === "strooizout-25-kg") ?? winkel?.producten[0];
  // De keuzes in de bestelkaart: wat te bestellen is, en daarna wat eraan komt (zichtbaar, niet te bestellen).
  const keuzes = useMemo<Keuze[]>(() => [...(winkel?.producten ?? []).map((p) => ({ p, straks: false })), ...(winkel?.binnenkort ?? []).map((p) => ({ p, straks: true }))], [winkel]);
  const [gekozenId, setGekozenId] = useState<number | null>(null);
  const gekozen = keuzes.find((k) => k.p.id === gekozenId) ?? keuzes.find((k) => k.p.id === hoofd?.id) ?? keuzes[0];
  const [aantal, setAantal] = useState(2);
  const pagina = useRef<HTMLDivElement>(null);
  useOnthul(pagina);
  const vanaf = hoofd ? Math.min(hoofd.prijs_cent, ...hoofd.aanbiedingen.filter((a) => aanbiedingGeldig(a, winkel!.nu)).map((a) => a.prijs_cent)) : null;

  return (
    <div ref={pagina} className="wn-pagina">
      <section className="wn-hero">
        <div className="wn-hero__lucht" aria-hidden="true" />
        <div className="sz-wrap wn-hero__in">
          <div className="wn-hero__tekst">
            <p className="wn-oog">Strooizout kopen in Houten</p>
            <h1>
              Strooizout uit <span>je eigen buurt.</span>
            </h1>
            <p className="wn-payoff">Hou je buurt veilig.</p>
            <p className="wn-vanaf" data-klaar={vanaf !== null}>
              {vanaf !== null && (
                <>
                  <span className="wn-vanaf__voor">25 kg </span>vanaf <b className="sz-tnum">{euro(vanaf)}</b>
                  <span className="wn-vanaf__na"> per zak</span>
                </>
              )}
            </p>
          </div>
          <Scene aantal={aantal} soort={gekozen?.p.eenheid === "emmer" ? (gekozen.p.slug.includes("eigen") ? "emmer-open" : "emmer") : "zak"} className="wn-hero__scene" />
          <div className="wn-hero__bestel">
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
              <div className="sz-skelet wn-skelet" aria-busy="true" />
            ) : !hoofd || !gekozen ? (
              <p className="sz-melding sz-melding--let">Er staat nu niets te koop. Kijk later nog eens.</p>
            ) : (
              <Bestelkaart key={gekozen.p.id} p={gekozen.p} straks={gekozen.straks} keuzes={keuzes} winkel={winkel} onAantal={setAantal} onKies={setGekozenId} />
            )}
          </div>
        </div>
      </section>
      <Stappen />
      <BuurBand winkel={winkel} />
      <Film />
      <Bewust />
    </div>
  );
}
