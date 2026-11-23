// Bestellen op één scherm: aantallen, ophalen of bezorgen, naam en mobiel nummer, betalen, controle en plaatsen.
// Alleen wat nodig is: adres alleen bij bezorgen, e-mail optioneel. De server rekent alles opnieuw na.

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { herkomst } from "./meting";
import { whatsappLink, controleerKlant, dagTekst, euro, normaliseerMobiel, normaliseerPostcode, binnenBezorggebied, BUITEN_GEBIED, volgendeStaffel, alsPrijsProduct, zakkenIn, type Betaalwijze, type Klantgegevens, type Levering, type Winkel } from "../../shared/strooizout";
import type { MandRegel } from "./mandje";

/** ‘per zak’, of bij zout per emmer het gewicht: ‘per 10 kg’ (ook als je je eigen emmer meeneemt). */
const per = (p: { eenheid: string; gewicht_gram: number }) => (p.eenheid === "emmer" && p.gewicht_gram > 0 ? `${p.gewicht_gram / 1000}\u00a0kg` : p.eenheid);

function berekeningZakken(winkel: Winkel | null, regels: MandRegel[]): number {
  const per = new Map((winkel?.producten ?? []).map((p) => [p.id, p.zakken_per_stuk]));
  return zakkenIn(regels.map((r) => ({ aantal: r.aantal, zakken_per_stuk: per.get(r.product_id) ?? 0 })));
}
import { vraag, type KlantBestelling } from "./api";
import { IcoonBus, IcoonHuis, IcoonInfo, IcoonLet, IcoonPijlLinks, WhatsAppKnop } from "./iconen";
import { useMand } from "./mandje";
import { Aantal, maxVoor, rekenMand, StaffelHint, Totalen } from "./opmaak";
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
  optioneel = false,
  ...rest
}: { id: keyof Velden; label: string; fout?: string; hulp?: string; className?: string; optioneel?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`sz-veld ${className}`}>
      <label htmlFor={`sz-${id}`}>
        {label}
        {optioneel && <span className="sz-optioneel"> (optioneel)</span>}
      </label>
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

/**
 * Bestelformulier. Standalone op /strooizout/bestellen (mandje met meerdere producten), of `ingebed` op de homepage:
 * dan kiest de bestelmodule erboven het aantal en ophalen/bezorgen, en toont dit alleen nog gegevens, controle en de knop.
 */
export default function Afrekenen({ ingebed }: { ingebed?: { levering: Levering; voorKnop?: React.ReactNode } } = {}) {
  const { winkel, herlaad } = useWinkel();
  const { regels, zet, leeg } = useMand();
  const { navigeer } = useRouter();
  const inst = winkel?.instellingen;
  // Producten in het mandje die alleen kunnen worden afgehaald (bijvoorbeeld zout in je eigen emmer), en wat de
  // klant voor de gekozen producten moet weten.
  const inMand = (winkel?.producten ?? []).filter((p) => regels.some((r) => r.product_id === p.id));
  const alleenAfhalen = inMand.find((p) => p.alleen_afhalen);
  const meldingen = [...new Set(inMand.map((p) => p.melding).filter(Boolean))];
  const erbij = (winkel?.producten ?? []).filter((p) => p.voorraad !== 0 && !regels.some((r) => r.product_id === p.id));

  const [eigenLevering, setLevering] = useState<Levering>(ingebed?.levering ?? "ophalen");
  const levering = ingebed?.levering ?? eigenLevering;
  const [momentId, setMomentId] = useState<number | null>(null);
  const [v, setV] = useState<Velden>(LEEG);

  const [opmerkingOpen, setOpmerkingOpen] = useState(false);
  const [honing, setHoning] = useState("");
  const [fouten, setFouten] = useState<Partial<Record<string, string>>>({});
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);
  const start = useRef(Date.now());
  const meldingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ingebed) return;
    if (inst && !inst.afhalen_aan && inst.bezorgen_aan) setLevering("bezorgen");
    if (inst && !inst.bezorgen_aan) setLevering("ophalen");
  }, [inst, ingebed]);
  // Betalen gaat altijd met een Tikkie die na de bestelling wordt gestuurd (tenzij dat in het beheer uit staat).
  const betaal: Betaalwijze = inst?.tikkie_aan ? "tikkie" : "bij_ontvangst";
  const mailVerplicht = !!winkel?.mail;
  const zakken = berekeningZakken(winkel, regels);
  const bezorgKan = !!inst?.bezorgen_aan && !alleenAfhalen && zakken >= (inst?.bezorg_min_zakken ?? 0);
  useEffect(() => {
    if (!ingebed && levering === "bezorgen" && !bezorgKan) setLevering("ophalen");
  }, [ingebed, levering, bezorgKan]);

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
    return binnenBezorggebied(pc, inst.bezorg_postcodes) ? "" : BUITEN_GEBIED;
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

  const moment = momenten.find((m) => m.id === momentId);
  const mobiel = normaliseerMobiel(v.telefoon);

  async function plaats(e: FormEvent) {
    e.preventDefault();
    if (bezig) return;
    setMelding("");
    const nieuw: Partial<Record<string, string>> = {};
    const k = controleerKlant(v, levering, inst?.bezorg_postcodes ?? "");
    if (!k.ok) Object.assign(nieuw, k.fouten);
    if (momenten.length && momentId === null) nieuw.moment = levering === "bezorgen" ? "Kies een bezorgmoment." : "Kies een ophaalmoment.";
    setFouten(nieuw);
    if (Object.keys(nieuw).length) {
      setMelding("Controleer de gemarkeerde velden.");
      window.setTimeout(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 30);
      return;
    }
    setBezig(true);
    const r = await vraag<{ bestelling: KlantBestelling }>("/api/strooizout/bestelling", {
      method: "POST",
      body: JSON.stringify({
        ...herkomst(),
        idempotentie: idempotentie(),
        regels: berekening.regels.map((x) => ({ product_id: x.product_id, aantal: x.aantal })),
        levering,
        moment_id: momentId,
        betaalwijze: betaal,
        klant: v,
        akkoord: true,
        bedrijf_extra: honing,
        invultijd_ms: Date.now() - start.current,
      }),
    });
    if (r.ok) {
      try {
        sessionStorage.removeItem(IDEM);
        sessionStorage.setItem("strooizout:net-besteld", r.data.bestelling.code);
        localStorage.setItem("strooizout:laatste", JSON.stringify({ code: r.data.bestelling.code, afhaalcode: r.data.bestelling.afhaalcode }));
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
    if (r.status === 409) void herlaad();
    setMelding(r.error);
  }

  const adresVelden = levering === "bezorgen" && (
    <div className="sz-velden" style={{ marginTop: ingebed ? 0 : 16 }}>
      <Veld id="postcode" label="Postcode" autoComplete="postal-code" value={v.postcode} onChange={zetV("postcode")} onBlur={() => { const pc = normaliseerPostcode(v.postcode); if (pc) setV((x) => ({ ...x, postcode: pc })); }} fout={fouten.postcode ?? (postcodeHint || undefined)} className="sz-veld--derde sz-veld--pc" placeholder="3991 AB" required />
      <Veld id="huisnummer" label="Huisnummer" autoComplete="address-line2" inputMode="text" value={v.huisnummer} onChange={zetV("huisnummer")} fout={fouten.huisnummer} className="sz-veld--derde sz-veld--nr" required />
      <Veld id="straat" label="Straat" autoComplete="address-line1" value={v.straat} onChange={zetV("straat")} fout={fouten.straat} className="sz-veld--derde sz-veld--straat" required />
    </div>
  );
  const momentKeuze = momenten.length > 0 && (
    <fieldset className="sz-momenten" style={{ border: 0, padding: 0, margin: "16px 0 0" }} aria-describedby={fouten.moment ? "sz-moment-fout" : undefined}>
      <legend style={{ fontWeight: 600, marginBottom: 10 }}>{levering === "bezorgen" ? "Kies een bezorgmoment" : "Kies een ophaalmoment"}</legend>
      <div className="sz-keuzes">
        {momenten.map((m) => (
          <label className="sz-keuze sz-keuze--klein" key={m.id}>
            <input type="radio" name="moment" checked={momentId === m.id} disabled={m.vol} aria-invalid={fouten.moment ? true : undefined} onChange={() => { setMomentId(m.id); setFouten((f) => ({ ...f, moment: undefined })); }} />
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
  );
  const gegevens = (
    <div className="sz-velden">
      <Veld id="naam" label="Naam" autoComplete="name" value={v.naam} onChange={zetV("naam")} fout={fouten.naam} className="sz-veld--half" required />
      <Veld id="telefoon" label="Mobiel nummer" type="tel" inputMode="tel" autoComplete="tel" value={v.telefoon} onChange={zetV("telefoon")} fout={fouten.telefoon} className="sz-veld--half" placeholder="06 1234 5678" required />
      <Veld id="email" label="E-mailadres" optioneel={!mailVerplicht} required={mailVerplicht} hulp={mailVerplicht ? "Hier sturen we je afhaalcode naartoe." : undefined} type="email" inputMode="email" autoComplete="email" value={v.email} onChange={zetV("email")} fout={fouten.email} />
      {opmerkingOpen ? (
        <div className="sz-veld">
          <label htmlFor="sz-opmerking">
            Opmerking<span className="sz-optioneel"> (optioneel)</span>
          </label>
          <textarea id="sz-opmerking" className="sz-invoer" maxLength={300} value={v.opmerking} onChange={zetV("opmerking")} placeholder={levering === "bezorgen" ? "Bijvoorbeeld: zet de zakken bij de schuur." : ""} aria-invalid={fouten.opmerking ? true : undefined} autoFocus={!ingebed} />
          {fouten.opmerking && <p className="sz-veld__fout">{fouten.opmerking}</p>}
        </div>
      ) : (
        <div className="sz-veld">
          <button type="button" className="sz-knop sz-knop--tekst" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={() => setOpmerkingOpen(true)}>
            + Opmerking
          </button>
        </div>
      )}
      <div className="sz-honing" aria-hidden="true">
        <label htmlFor="sz-bedrijf-extra">Laat dit veld leeg</label>
        <input id="sz-bedrijf-extra" name="bedrijf_extra" tabIndex={-1} autoComplete="off" value={honing} onChange={(e) => setHoning(e.target.value)} />
      </div>
    </div>
  );
  // Waar afhalen en hoe afspreken (adres en nummer uit de instellingen; leeg = alleen de plaats, adres na bevestiging).
  const afhaalAdres = (inst?.afhaal_adres ?? "").trim();
  const belNummer = (inst?.contact_telefoon ?? "").trim();
  const appLink = whatsappLink(belNummer, "Hoi, ik heb een vraag over strooizout afhalen.");
  const afhaalUitleg = levering === "ophalen" && afhaalAdres && (
    <p className="sz-betaaluitleg">
      <strong>Afhalen</strong>
      <span>
        {afhaalAdres}.
        {belNummer && (
          <>
            {" "}{appLink ? "App of bel" : "Bel"} even om af te spreken: <a href={`tel:${belNummer.replace(/[^+\d]/g, "")}`}>{belNummer}</a>.
          </>
        )}
        {appLink && (
          <span className="sz-wa-rij">
            <WhatsAppKnop href={appLink} klein>
              App om af te spreken
            </WhatsAppKnop>
          </span>
        )}
      </span>
    </p>
  );
  const betaalKeuze = (
    <p className="sz-betaaluitleg">
      <strong>Betalen</strong>
      <span>{inst?.tikkie_aan ? "Na je bestelling sturen we je een Tikkie op je mobiel. Daarna " + (levering === "bezorgen" ? "bezorgen we je bestelling." : "kun je je bestelling komen ophalen.") : levering === "bezorgen" ? "Je betaalt bij het bezorgen met een betaalverzoek." : "Je betaalt bij het afhalen met een betaalverzoek."}</span>
    </p>
  );
  const plaatsKnop = (
    <>
      <button type="submit" className="sz-knop sz-knop--vol" disabled={bezig || !winkel.open} aria-busy={bezig}>
        {bezig ? (
          <>
            <span className="sz-spinner" aria-hidden="true" /> Bezig met plaatsen…
          </>
        ) : (
          ingebed ? "Bestellen met betalingsverplichting" : `Bestellen met betalingsverplichting · ${euro(berekening.totaal_cent)}`
        )}
      </button>
      <p className="sz-klein">
        {mailVerplicht ? "Je krijgt een e-mail met je afhaalcode. " : ""}Door te bestellen ga je akkoord met de <Link naar="/strooizout/voorwaarden">voorwaarden</Link> en de <Link naar="/strooizout/privacy">privacyverklaring</Link>.
      </p>
    </>
  );

  if (ingebed) {
    return (
      <form onSubmit={plaats} noValidate id="sz-bestelformulier" className="sz-ingebed">
        {melding && (
          <div className="sz-melding sz-melding--fout" role="alert" tabIndex={-1} ref={meldingRef} style={{ margin: "0 0 14px" }}>
            <IcoonLet />
            <span>{melding}</span>
          </div>
        )}
        {adresVelden}
        {levering === "bezorgen" && <div style={{ height: 14 }} />}
        {gegevens}
        {momentKeuze}
        {afhaalUitleg}
        {betaalKeuze}
        {ingebed.voorKnop}
        {plaatsKnop}
      </form>
    );
  }

  return (
    <div className="sz-afrekenen sz-afrekenen--kort">
      <div className="sz-wrap">
        <Link naar="/strooizout" className="sz-terug">
          <IcoonPijlLinks /> Verder winkelen
        </Link>
        <h1>Bestellen</h1>
        <p className="sz-afrekenen__intro">Klaar in een minuut. Betalen doe je daarna, met een Tikkie.</p>
        {!winkel.open && <RondeStatus winkel={winkel} />}
        {melding && (
          <div className="sz-melding sz-melding--fout" role="alert" tabIndex={-1} ref={meldingRef} style={{ marginBottom: 18 }}>
            <IcoonLet />
            <span>{melding}</span>
          </div>
        )}

        <div className="sz-afrekenen__grid">
          <form onSubmit={plaats} noValidate id="sz-bestelformulier">
            <section className="sz-blok" aria-labelledby="sz-b1">
              <h2 id="sz-b1">Je bestelling</h2>
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
                        {r.aanbieding ? (
                          <>
                            <s>{euro(r.normaalprijs_cent)}</s> {euro(r.stukprijs_cent)} per {per(p)} · {r.aanbieding}
                          </>
                        ) : (
                          <>
                            {euro(r.stukprijs_cent)} per {per(p)}
                          </>
                        )}
                      </div>
                      <div className="sz-regel__acties">
                        <Aantal klein waarde={r.aantal} max={Math.max(r.aantal, maxVoor(p))} label={p.naam} onChange={(n) => zet(p.id, n)} />
                        <button type="button" className="sz-weg" onClick={() => zet(p.id, 0)}>
                          Verwijderen
                        </button>
                      </div>
                      <StaffelHint staffel={volgendeStaffel(alsPrijsProduct(p), r.aantal, winkel.nu)} eenheid={p.eenheid} onKies={(n) => zet(p.id, n)} max={maxVoor(p)} />
                    </div>
                  </div>
                );
              })}
              {meldingen.map((m) => (
                <p className="sz-melding sz-melding--info sz-regelmelding" key={m}>
                  <IcoonInfo />
                  <span>{m}</span>
                </p>
              ))}
              {erbij.length > 0 && (
                <div className="sz-erbij">
                  <p>Nog iets erbij?</p>
                  {erbij.map((p) => (
                    <button type="button" className="sz-erbij__knop" key={p.id} onClick={() => zet(p.id, 1)}>
                      <span>
                        {p.naam}
                        {p.alleen_afhalen && <small> · alleen afhalen</small>}
                      </span>
                      <b className="sz-tnum">+ {euro(p.prijs_cent)}</b>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="sz-blok" aria-labelledby="sz-b2">
              <h2 id="sz-b2">Ophalen of bezorgen</h2>
              <div className="sz-keuzes" role="radiogroup" aria-labelledby="sz-b2">
                <label className="sz-keuze">
                  <input type="radio" name="levering" value="ophalen" checked={levering === "ophalen"} disabled={!inst?.afhalen_aan} onChange={() => setLevering("ophalen")} />
                  <div>
                    <strong>
                      <IcoonHuis className="sz-inline-icoon" />
                      Ophalen
                    </strong>
                    <span>{afhaalAdres ? `${afhaalAdres}.` : `In ${inst?.afhaal_plek || "Houten"}. Adres na bevestiging.`}</span>
                  </div>
                  <span className="sz-keuze__prijs">Gratis</span>
                </label>
                <label className="sz-keuze">
                  <input type="radio" name="levering" value="bezorgen" checked={levering === "bezorgen"} disabled={!bezorgKan} onChange={() => setLevering("bezorgen")} />
                  <div>
                    <strong>
                      <IcoonBus className="sz-inline-icoon" />
                      Bezorgen
                    </strong>
                    <span>{!inst?.bezorgen_aan ? "Nu niet mogelijk." : alleenAfhalen ? `${alleenAfhalen.naam} kun je alleen afhalen.` : !bezorgKan ? `Vanaf ${inst.bezorg_min_zakken} zakken.` : "Alleen in Houten."}</span>
                  </div>
                  <span className="sz-keuze__prijs">{inst?.bezorgen_aan ? `+ ${euro(rekenMand(winkel, regels, "bezorgen").berekening.bezorg_cent)}` : "–"}</span>
                </label>
              </div>
              {levering === "bezorgen" && (
                <div className="sz-velden" style={{ marginTop: 16 }}>
                  <Veld id="postcode" label="Postcode" autoComplete="postal-code" value={v.postcode} onChange={zetV("postcode")} onBlur={() => { const pc = normaliseerPostcode(v.postcode); if (pc) setV((x) => ({ ...x, postcode: pc })); }} fout={fouten.postcode ?? (postcodeHint || undefined)} className="sz-veld--derde sz-veld--pc" placeholder="3991 AB" required />
                  <Veld id="huisnummer" label="Huisnummer" autoComplete="address-line2" inputMode="text" value={v.huisnummer} onChange={zetV("huisnummer")} fout={fouten.huisnummer} className="sz-veld--derde sz-veld--nr" required />
                  <Veld id="straat" label="Straat" autoComplete="address-line1" value={v.straat} onChange={zetV("straat")} fout={fouten.straat} className="sz-veld--derde sz-veld--straat" required />
                  {inst?.bezorg_uitleg && (
                    <p className="sz-melding sz-melding--info" style={{ gridColumn: "span 6", margin: 0 }}>
                      <IcoonInfo />
                      <span>{inst.bezorg_uitleg}</span>
                    </p>
                  )}
                </div>
              )}
              {momenten.length > 0 && (
                <fieldset className="sz-momenten" style={{ border: 0, padding: 0, margin: "16px 0 0" }} aria-describedby={fouten.moment ? "sz-moment-fout" : undefined}>
                  <legend style={{ fontWeight: 600, marginBottom: 10 }}>{levering === "bezorgen" ? "Kies een bezorgmoment" : "Kies een ophaalmoment"}</legend>
                  <div className="sz-keuzes">
                    {momenten.map((m) => (
                      <label className="sz-keuze" key={m.id}>
                        <input type="radio" name="moment" checked={momentId === m.id} disabled={m.vol} aria-invalid={fouten.moment ? true : undefined} onChange={() => { setMomentId(m.id); setFouten((f) => ({ ...f, moment: undefined })); }} />
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
              <h2 id="sz-b3">Je gegevens</h2>
              <div className="sz-velden">
                <Veld id="naam" label="Naam" autoComplete="name" value={v.naam} onChange={zetV("naam")} fout={fouten.naam} className="sz-veld--half" required />
                <Veld id="telefoon" label="Mobiel nummer" type="tel" inputMode="tel" autoComplete="tel" value={v.telefoon} onChange={zetV("telefoon")} fout={fouten.telefoon} className="sz-veld--half" placeholder="06 1234 5678" hulp="Voor het afhalen of de bezorging, en een eventueel betaalverzoek." required />
                <Veld id="email" label="E-mailadres" optioneel={!mailVerplicht} required={mailVerplicht} hulp={mailVerplicht ? "Hier sturen we je afhaalcode naartoe." : undefined} type="email" inputMode="email" autoComplete="email" value={v.email} onChange={zetV("email")} fout={fouten.email} />
                {opmerkingOpen ? (
                  <div className="sz-veld">
                    <label htmlFor="sz-opmerking">
                      Opmerking<span className="sz-optioneel"> (optioneel)</span>
                    </label>
                    <textarea id="sz-opmerking" className="sz-invoer" maxLength={300} value={v.opmerking} onChange={zetV("opmerking")} placeholder={levering === "bezorgen" ? "Bijvoorbeeld: zet de zakken bij de schuur." : ""} aria-invalid={fouten.opmerking ? true : undefined} autoFocus />
                    {fouten.opmerking && <p className="sz-veld__fout">{fouten.opmerking}</p>}
                  </div>
                ) : (
                  <div className="sz-veld">
                    <button type="button" className="sz-knop sz-knop--tekst" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={() => setOpmerkingOpen(true)}>
                      + Opmerking toevoegen
                    </button>
                  </div>
                )}
                <div className="sz-honing" aria-hidden="true">
                  <label htmlFor="sz-bedrijf-extra">Laat dit veld leeg</label>
                  <input id="sz-bedrijf-extra" name="bedrijf_extra" tabIndex={-1} autoComplete="off" value={honing} onChange={(e) => setHoning(e.target.value)} />
                </div>
              </div>
              {afhaalUitleg && <div style={{ marginTop: 18 }}>{afhaalUitleg}</div>}
              <p className="sz-betaaluitleg" style={{ marginTop: afhaalUitleg ? 10 : 18 }}>
                <strong>Betalen</strong>
                <span>{inst?.tikkie_aan ? "Na je bestelling sturen we je een Tikkie op je mobiel. Daarna " + (levering === "bezorgen" ? "bezorgen we je bestelling." : "kun je je bestelling komen ophalen.") : levering === "bezorgen" ? "Je betaalt bij het bezorgen met een betaalverzoek." : "Je betaalt bij het afhalen met een betaalverzoek."}</span>
              </p>
            </section>

            <section className="sz-blok sz-controleblok" aria-labelledby="sz-b4">
              <h2 id="sz-b4">Controleren en bestellen</h2>
              <ul className="sz-controlelijst">
                <li>{berekening.regels.map((r) => `${r.aantal}× ${r.naam}`).join(", ")}</li>
                <li>
                  {levering === "bezorgen"
                    ? `Bezorgen${v.straat || v.huisnummer ? `: ${v.straat} ${v.huisnummer}`.trimEnd() : ""}${normaliseerPostcode(v.postcode) ? `, ${normaliseerPostcode(v.postcode)}` : ""}`
                    : afhaalAdres ? `Ophalen: ${afhaalAdres}` : `Ophalen in ${inst?.afhaal_plek || "Houten"}`}
                  {moment && ` · ${dagTekst(moment.datum)} ${moment.van}–${moment.tot}`}
                </li>
                <li>
                  {v.naam || "Naam"} · {mobiel ? mobiel.replace(/^(06)(\d{4})(\d{4})$/, "$1 $2 $3") : "mobiel nummer"}
                </li>
                <li>
                  <strong className="sz-tnum">Totaal {euro(berekening.totaal_cent)}</strong>
                  {berekening.korting_cent > 0 && <span className="sz-korting-tekst"> · je bespaart {euro(berekening.korting_cent)}</span>}
                  {" · "}
                  {betaal === "tikkie" ? "betalen met een Tikkie" : levering === "bezorgen" ? "betaalverzoek bij bezorgen" : "betaalverzoek bij afhalen"}
                </li>
              </ul>
              <button type="submit" className="sz-knop sz-knop--vol" disabled={bezig || !winkel.open} aria-busy={bezig}>
                {bezig ? (
                  <>
                    <span className="sz-spinner" aria-hidden="true" /> Bezig met plaatsen…
                  </>
                ) : (
                  `Bestellen met betalingsverplichting · ${euro(berekening.totaal_cent)}`
                )}
              </button>
              <p className="sz-klein">
                Op is op: je betaalt alleen voor wat je krijgt. Door te bestellen ga je akkoord met de <Link naar="/strooizout/voorwaarden">voorwaarden</Link>. Lees ook de{" "}
                <Link naar="/strooizout/privacy">privacyverklaring</Link>.
              </p>
            </section>
          </form>

          <aside className="sz-samenvatting" aria-label="Overzicht">
            <div className="sz-blok">
              <h2 style={{ fontSize: 19 }}>Overzicht</h2>
              <Totalen b={berekening} levering={levering} />
              <p className="sz-klein" style={{ marginTop: 0 }}>
                {inst?.btw_modus === "inclusief" ? `Prijzen inclusief ${inst.btw_tarief}% btw.` : "Alle prijzen zijn eindprijzen."} Betalen met een betaalverzoek.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <div className="sz-totaalbalk" aria-hidden="true">
        <div>
          <strong className="sz-tnum">{euro(berekening.totaal_cent)}</strong>
          <span>{berekening.korting_cent > 0 ? `incl. ${euro(berekening.korting_cent)} korting` : `${berekening.aantal_stuks} ${berekening.aantal_stuks === 1 ? "artikel" : "artikelen"}`}</span>
        </div>
        <button type="submit" form="sz-bestelformulier" className="sz-knop" disabled={bezig || !winkel.open} tabIndex={-1}>
          {bezig ? "Bezig…" : "Bestellen"}
        </button>
      </div>
    </div>
  );
}
