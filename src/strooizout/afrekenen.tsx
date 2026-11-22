// Bestellen: mandje, ophalen of bezorgen, gegevens, betalen → controleren → definitief reserveren.
// De server rekent alles opnieuw na; hier alleen weergave en een eerste controle van de invoer.

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BETAALWIJZE, controleerKlant, dagTekst, euro, normaliseerPostcode, parsePostcodes, type Betaalwijze, type Klantgegevens, type Levering } from "../../shared/strooizout";
import { vraag, type KlantBestelling } from "./api";
import { IcoonBus, IcoonHuis, IcoonInfo, IcoonLet, IcoonPijlLinks } from "./iconen";
import { useMand } from "./mandje";
import { Aantal, maxVoor, rekenMand, Totalen } from "./opmaak";
import { Link, useRouter } from "./router";
import { RondeStatus } from "./winkel";
import { useWinkel } from "./winkeldata";

const IDEM = "strooizout:idempotentie";

function idempotentie(): string {
  try {
    const al = sessionStorage.getItem(IDEM);
    if (al) return al;
    const nieuw = crypto.randomUUID();
    sessionStorage.setItem(IDEM, nieuw);
    return nieuw;
  } catch {
    return crypto.randomUUID();
  }
}

type Velden = Record<keyof Klantgegevens, string>;
const LEEG: Velden = { naam: "", email: "", telefoon: "", straat: "", huisnummer: "", postcode: "", plaats: "Houten", opmerking: "" };

function Veld({
  id,
  label,
  fout,
  hulp,
  className = "",
  ...rest
}: { id: keyof Velden; label: string; fout?: string; hulp?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`sz-veld ${className}`}>
      <label htmlFor={`sz-${id}`}>{label}</label>
      <input id={`sz-${id}`} name={id} className="sz-invoer" aria-invalid={fout ? true : undefined} aria-describedby={fout ? `sz-${id}-fout` : hulp ? `sz-${id}-hulp` : undefined} {...rest} />
      {hulp && !fout && (
        <p className="sz-veld__hulp" id={`sz-${id}-hulp`}>
          {hulp}
        </p>
      )}
      {fout && (
        <p className="sz-veld__fout" id={`sz-${id}-fout`}>
          {fout}
        </p>
      )}
    </div>
  );
}

export default function Afrekenen() {
  const { winkel, herlaad } = useWinkel();
  const { regels, zet, leeg } = useMand();
  const { navigeer } = useRouter();
  const inst = winkel?.instellingen;

  const [levering, setLevering] = useState<Levering>("ophalen");
  const [momentId, setMomentId] = useState<number | null>(null);
  const [v, setV] = useState<Velden>(LEEG);
  const [betaal, setBetaal] = useState<Betaalwijze>("bij_ontvangst");
  const [akkoord, setAkkoord] = useState(false);
  const [honing, setHoning] = useState("");
  const [fase, setFase] = useState<"invullen" | "controleren">("invullen");
  const [fouten, setFouten] = useState<Partial<Record<string, string>>>({});
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);
  const start = useRef(Date.now());
  const meldingRef = useRef<HTMLDivElement>(null);

  // Standaard ophalen; als ophalen uit staat, bezorgen.
  useEffect(() => {
    if (inst && !inst.afhalen_aan && inst.bezorgen_aan) setLevering("bezorgen");
    if (inst && !inst.bezorgen_aan) setLevering("ophalen");
  }, [inst]);

  const { berekening, producten } = useMemo(() => rekenMand(winkel, regels, levering), [winkel, regels, levering]);
  const momenten = (winkel?.momenten ?? []).filter((m) => m.soort === levering);
  useEffect(() => {
    if (momentId !== null && !momenten.some((m) => m.id === momentId && !m.vol)) setMomentId(null);
    const vrij = momenten.filter((m) => !m.vol);
    if (momentId === null && vrij.length === 1) setMomentId(vrij[0].id);
  }, [momenten, momentId]);

  const zetV = (k: keyof Velden) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV((x) => ({ ...x, [k]: e.target.value }));
    if (fouten[k]) setFouten((f) => ({ ...f, [k]: undefined }));
  };

  const postcodeHint = useMemo(() => {
    if (levering !== "bezorgen" || !inst) return "";
    const pc = normaliseerPostcode(v.postcode);
    if (!pc) return "";
    return parsePostcodes(inst.bezorg_postcodes).includes(pc.slice(0, 4)) ? "" : "Op deze postcode bezorgen we helaas niet. Je kunt je bestelling wel gratis ophalen.";
  }, [levering, v.postcode, inst]);

  useEffect(() => {
    if (melding) meldingRef.current?.focus();
  }, [melding]);

  if (!winkel) {
    return (
      <div className="sz-afrekenen">
        <div className="sz-wrap">
          <div className="sz-laden" aria-busy="true">Even laden…</div>
        </div>
      </div>
    );
  }

  if (berekening.regels.length === 0) {
    return (
      <div className="sz-afrekenen">
        <div className="sz-wrap" style={{ maxWidth: 640 }}>
          <Link naar="/strooizout" className="sz-terug">
            <IcoonPijlLinks /> Terug naar de webshop
          </Link>
          <h1>Je mandje is leeg</h1>
          <p className="sz-afrekenen__intro">Kies eerst wat je wilt bestellen.</p>
          <Link naar="/strooizout#producten" className="sz-knop">
            Naar de producten
          </Link>
        </div>
      </div>
    );
  }

  function controleer(e: FormEvent) {
    e.preventDefault();
    setMelding("");
    const nieuw: Partial<Record<string, string>> = {};
    const k = controleerKlant(v, levering, inst?.bezorg_postcodes ?? "");
    if (!k.ok) Object.assign(nieuw, k.fouten);
    if (momenten.length && momentId === null) nieuw.moment = levering === "bezorgen" ? "Kies een bezorgmoment." : "Kies een ophaalmoment.";
    if (!akkoord) nieuw.akkoord = "Ga akkoord met de voorwaarden.";
    setFouten(nieuw);
    if (Object.keys(nieuw).length) {
      setMelding("Controleer de gemarkeerde velden.");
      window.setTimeout(() => document.querySelector<HTMLElement>("[aria-invalid='true'], .sz-veld__fout")?.scrollIntoView({ block: "center", behavior: "smooth" }), 30);
      return;
    }
    setFase("controleren");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function verstuur() {
    if (bezig) return;
    setBezig(true);
    setMelding("");
    const r = await vraag<{ bestelling: KlantBestelling }>("/api/strooizout/bestelling", {
      method: "POST",
      body: JSON.stringify({
        idempotentie: idempotentie(),
        regels: berekening.regels.map((x) => ({ product_id: x.product_id, aantal: x.aantal })),
        levering,
        moment_id: momentId,
        betaalwijze: betaal,
        klant: v,
        akkoord,
        bedrijf_extra: honing,
        invultijd_ms: Date.now() - start.current,
      }),
    });
    if (r.ok) {
      try {
        sessionStorage.removeItem(IDEM);
        sessionStorage.setItem("strooizout:net-besteld", r.data.bestelling.code);
        localStorage.setItem("strooizout:laatste", r.data.bestelling.code);
      } catch {
        /* geen opslag */
      }
      leeg();
      navigeer(`/strooizout/bestelling#${r.data.bestelling.code}`, { vervang: true });
      void herlaad();
      return;
    }
    setBezig(false);
    const velden = r.extra.velden as Record<string, string> | undefined;
    if (velden) setFouten(velden);
    if (r.extra.veld === "moment") setFouten((f) => ({ ...f, moment: r.error }));
    if (r.extra.code === "product" || r.extra.code === "voorraad" || r.extra.code === "gesloten" || r.status === 409) void herlaad();
    setMelding(r.error);
    if (velden || r.status === 422 || r.status === 409) setFase("invullen");
  }

  const moment = momenten.find((m) => m.id === momentId);

  return (
    <div className="sz-afrekenen">
      <div className="sz-wrap">
        <Link naar="/strooizout" className="sz-terug">
          <IcoonPijlLinks /> Verder winkelen
        </Link>
        <h1>{fase === "invullen" ? "Bestellen" : "Controleer je reservering"}</h1>
        <p className="sz-afrekenen__intro">
          {fase === "invullen" ? "Nog vier korte stappen. Je betaalt pas bij ontvangst." : "Klopt alles? Dan plaats je de reservering definitief."}
        </p>
        {!winkel.open && <RondeStatus winkel={winkel} />}
        {melding && (
          <div className="sz-melding sz-melding--fout" role="alert" tabIndex={-1} ref={meldingRef} style={{ marginBottom: 18 }}>
            <IcoonLet />
            <span>{melding}</span>
          </div>
        )}

        <div className="sz-afrekenen__grid">
          {fase === "invullen" ? (
            <form onSubmit={controleer} noValidate>
              <section className="sz-blok" aria-labelledby="sz-b1">
                <h2 id="sz-b1">
                  <span className="sz-blok__nr">1</span> Je bestelling
                </h2>
                {berekening.regels.map((r) => {
                  const p = producten.get(r.product_id)!;
                  return (
                    <div className="sz-regel" key={r.product_id}>
                      <img src={p.afbeelding} alt="" width={64} height={64} />
                      <div>
                        <div className="sz-regel__naam">
                          <span>{p.naam}</span>
                          <span className="sz-tnum">{euro(r.regel_cent)}</span>
                        </div>
                        <div className="sz-regel__sub">
                          {euro(r.stukprijs_cent)} per {p.eenheid}
                          {r.aanbieding && ` · ${r.aanbieding}`}
                        </div>
                        <div className="sz-regel__acties">
                          <Aantal klein waarde={r.aantal} max={Math.max(r.aantal, maxVoor(p))} label={p.naam} onChange={(n) => zet(p.id, n)} />
                          <button type="button" className="sz-weg" onClick={() => zet(p.id, 0)}>
                            Verwijderen
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="sz-blok" aria-labelledby="sz-b2">
                <h2 id="sz-b2">
                  <span className="sz-blok__nr">2</span> Ophalen of bezorgen
                </h2>
                <div className="sz-keuzes" role="radiogroup" aria-labelledby="sz-b2">
                  <label className="sz-keuze">
                    <input type="radio" name="levering" value="ophalen" checked={levering === "ophalen"} disabled={!inst?.afhalen_aan} onChange={() => setLevering("ophalen")} />
                    <div>
                      <strong>
                        <IcoonHuis style={{ width: 18, height: 18, display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
                        Ophalen
                      </strong>
                      <span>In {inst?.afhaal_plek || "Houten"}. Adres na bevestiging.</span>
                    </div>
                    <span className="sz-keuze__prijs">Gratis</span>
                  </label>
                  <label className="sz-keuze">
                    <input type="radio" name="levering" value="bezorgen" checked={levering === "bezorgen"} disabled={!inst?.bezorgen_aan} onChange={() => setLevering("bezorgen")} />
                    <div>
                      <strong>
                        <IcoonBus style={{ width: 18, height: 18, display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
                        Bezorgen
                      </strong>
                      <span>{inst?.bezorgen_aan ? "Alleen in Houten." : "Nu niet mogelijk."}</span>
                    </div>
                    <span className="sz-keuze__prijs">{inst?.bezorgen_aan ? `+ ${euro(rekenMand(winkel, regels, "bezorgen").berekening.bezorg_cent)}` : "–"}</span>
                  </label>
                </div>
                {levering === "bezorgen" && inst?.bezorg_uitleg && (
                  <p className="sz-melding sz-melding--info">
                    <IcoonInfo />
                    <span>{inst.bezorg_uitleg}</span>
                  </p>
                )}
                {momenten.length > 0 && (
                  <fieldset className="sz-momenten" style={{ border: 0, padding: 0, margin: "16px 0 0" }} aria-describedby={fouten.moment ? "sz-moment-fout" : undefined}>
                    <legend style={{ fontWeight: 600, marginBottom: 10 }}>{levering === "bezorgen" ? "Kies een bezorgmoment" : "Kies een ophaalmoment"}</legend>
                    <div className="sz-keuzes">
                      {momenten.map((m) => (
                        <label className="sz-keuze" key={m.id}>
                          <input type="radio" name="moment" checked={momentId === m.id} disabled={m.vol} onChange={() => { setMomentId(m.id); setFouten((f) => ({ ...f, moment: undefined })); }} />
                          <div>
                            <strong>{dagTekst(m.datum)}</strong>
                            <span>
                              {m.van}–{m.tot}
                              {m.omschrijving && ` · ${m.omschrijving}`}
                              {m.vol && " · vol"}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {fouten.moment && (
                      <p className="sz-veld__fout" id="sz-moment-fout" style={{ marginTop: 8 }}>
                        {fouten.moment}
                      </p>
                    )}
                  </fieldset>
                )}
              </section>

              <section className="sz-blok" aria-labelledby="sz-b3">
                <h2 id="sz-b3">
                  <span className="sz-blok__nr">3</span> Je gegevens
                </h2>
                <div className="sz-velden">
                  <Veld id="naam" label="Naam" autoComplete="name" value={v.naam} onChange={zetV("naam")} fout={fouten.naam} required />
                  <Veld id="email" label="E-mailadres" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={zetV("email")} fout={fouten.email} className="sz-veld--half" required />
                  <Veld id="telefoon" label="Telefoonnummer" type="tel" inputMode="tel" autoComplete="tel" value={v.telefoon} onChange={zetV("telefoon")} fout={fouten.telefoon} className="sz-veld--half" hulp="Zodat we je kunnen bereiken over ophalen of bezorgen." required />
                  {levering === "bezorgen" && (
                    <>
                      <Veld id="postcode" label="Postcode" autoComplete="postal-code" value={v.postcode} onChange={zetV("postcode")} onBlur={() => { const pc = normaliseerPostcode(v.postcode); if (pc) setV((x) => ({ ...x, postcode: pc })); }} fout={fouten.postcode ?? (postcodeHint || undefined)} className="sz-veld--derde sz-veld--pc" placeholder="3991 AB" required />
                      <Veld id="huisnummer" label="Huisnummer" autoComplete="address-line2" value={v.huisnummer} onChange={zetV("huisnummer")} fout={fouten.huisnummer} className="sz-veld--derde sz-veld--nr" required />
                      <Veld id="plaats" label="Plaats" autoComplete="address-level2" value={v.plaats} onChange={zetV("plaats")} fout={fouten.plaats} className="sz-veld--derde" required />
                      <Veld id="straat" label="Straat" autoComplete="address-line1" value={v.straat} onChange={zetV("straat")} fout={fouten.straat} required />
                    </>
                  )}
                  <div className="sz-veld">
                    <label htmlFor="sz-opmerking">
                      Opmerking <span style={{ fontWeight: 400, color: "var(--tekst-3)" }}>(niet verplicht)</span>
                    </label>
                    <textarea id="sz-opmerking" className="sz-invoer" maxLength={300} value={v.opmerking} onChange={zetV("opmerking")} placeholder={levering === "bezorgen" ? "Bijvoorbeeld: zet de zakken bij de schuur." : ""} aria-invalid={fouten.opmerking ? true : undefined} />
                    {fouten.opmerking && <p className="sz-veld__fout">{fouten.opmerking}</p>}
                  </div>
                  <div className="sz-honing" aria-hidden="true">
                    <label htmlFor="sz-bedrijf-extra">Laat dit veld leeg</label>
                    <input id="sz-bedrijf-extra" name="bedrijf_extra" tabIndex={-1} autoComplete="off" value={honing} onChange={(e) => setHoning(e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="sz-blok" aria-labelledby="sz-b4">
                <h2 id="sz-b4">
                  <span className="sz-blok__nr">4</span> Betalen
                </h2>
                <div className="sz-keuzes" role="radiogroup" aria-labelledby="sz-b4">
                  <label className="sz-keuze">
                    <input type="radio" name="betaal" checked={betaal === "bij_ontvangst"} onChange={() => setBetaal("bij_ontvangst")} />
                    <div>
                      <strong>{levering === "bezorgen" ? "Betalen bij bezorgen" : "Betalen bij afhalen"}</strong>
                      <span>Contant of via een Tikkie op dat moment.</span>
                    </div>
                  </label>
                  {inst?.tikkie_aan && (
                    <label className="sz-keuze">
                      <input type="radio" name="betaal" checked={betaal === "tikkie"} onChange={() => setBetaal("tikkie")} />
                      <div>
                        <strong>Tikkie vooraf</strong>
                        <span>Je krijgt een Tikkie van ons zodra je bestelling klaarligt.</span>
                      </div>
                    </label>
                  )}
                </div>
                <p className="sz-melding sz-melding--info">
                  <IcoonInfo />
                  <span>Een reservering is nog geen levergarantie. We kopen samen in per bestelronde; je betaalt alleen voor wat je echt krijgt.</span>
                </p>
                <div style={{ marginTop: 16 }}>
                  <label className="sz-vink">
                    <input type="checkbox" checked={akkoord} onChange={(e) => { setAkkoord(e.target.checked); setFouten((f) => ({ ...f, akkoord: undefined })); }} aria-invalid={fouten.akkoord ? true : undefined} aria-describedby={fouten.akkoord ? "sz-akkoord-fout" : undefined} />
                    <span>
                      Ik ga akkoord met de <Link naar="/strooizout/voorwaarden" target="_blank">voorwaarden</Link> en heb de <Link naar="/strooizout/privacy" target="_blank">privacyverklaring</Link> gelezen.
                    </span>
                  </label>
                  {fouten.akkoord && (
                    <p className="sz-veld__fout" id="sz-akkoord-fout" style={{ marginTop: 6 }}>
                      {fouten.akkoord}
                    </p>
                  )}
                </div>
              </section>

              <button type="submit" className="sz-knop sz-knop--vol" disabled={!winkel.open}>
                Controleer je bestelling
              </button>
            </form>
          ) : (
            <section className="sz-blok sz-controle" aria-labelledby="sz-controle">
              <h2 id="sz-controle">Je reservering</h2>
              <dl>
                <dt>Producten</dt>
                <dd>
                  {berekening.regels.map((r) => (
                    <div key={r.product_id}>
                      {r.aantal}× {r.naam} <span className="sz-tnum">({euro(r.regel_cent)})</span>
                    </div>
                  ))}
                </dd>
                <dt>{levering === "bezorgen" ? "Bezorgen" : "Ophalen"}</dt>
                <dd>
                  {levering === "bezorgen" ? `${v.straat} ${v.huisnummer}, ${normaliseerPostcode(v.postcode) ?? v.postcode} ${v.plaats}` : `In ${inst?.afhaal_plek || "Houten"} (adres na bevestiging)`}
                  {moment && (
                    <div>
                      {dagTekst(moment.datum)}, {moment.van}–{moment.tot}
                    </div>
                  )}
                </dd>
                <dt>Naam</dt>
                <dd>{v.naam}</dd>
                <dt>Contact</dt>
                <dd>
                  {v.email}
                  <br />
                  {v.telefoon}
                </dd>
                <dt>Betalen</dt>
                <dd>{betaal === "tikkie" ? BETAALWIJZE.tikkie : levering === "bezorgen" ? "Bij bezorgen" : "Bij afhalen"}</dd>
                {v.opmerking && (
                  <>
                    <dt>Opmerking</dt>
                    <dd>{v.opmerking}</dd>
                  </>
                )}
              </dl>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="sz-knop" onClick={() => void verstuur()} disabled={bezig || !winkel.open} aria-busy={bezig}>
                  {bezig ? (
                    <>
                      <span className="sz-spinner" aria-hidden="true" /> Bezig met plaatsen…
                    </>
                  ) : (
                    `Definitief reserveren · ${euro(berekening.totaal_cent)}`
                  )}
                </button>
                <button type="button" className="sz-knop sz-knop--licht" onClick={() => setFase("invullen")} disabled={bezig}>
                  Wijzigen
                </button>
              </div>
              <p className="sz-klein">Je betaalt nu nog niets. Je krijgt direct een bevestiging met een persoonlijke link naar je bestelling.</p>
            </section>
          )}

          <aside className="sz-samenvatting" aria-label="Overzicht">
            <div className="sz-blok">
              <h2 style={{ fontSize: 19 }}>Overzicht</h2>
              <Totalen b={berekening} levering={levering} />
              <p className="sz-klein" style={{ marginTop: 0 }}>
                {inst?.btw_modus === "inclusief" ? `Prijzen inclusief ${inst.btw_tarief}% btw.` : "Alle prijzen zijn eindprijzen."} Betalen bij ontvangst.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
