// Bestellingen: zoeken, filteren, details, status, betaling, notitie, contact en CSV-export.

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BESTEL_STATUS, dagTekst, euro, mobielTekst, parseEuro } from "../../../shared/strooizout";
import { BetaalPil, downloadMetToken, kopieer, kort, rondeQuery, StatusPil, useBeheer } from "./basis";
import type { LijstBestelling, Moment } from "./typen";

type Detail = {
  bestelling: LijstBestelling & {
    straat: string;
    huisnummer: string;
    subtotaal_cent: number;
    korting_cent: number;
    bezorg_cent: number;
    beheer_notitie: string;
    gewicht_gram: number;
    klant_link: string;
    overgangen: string[];
    afgerond_op: string | null;
    geanonimiseerd_op: string | null;
    betaalverzoek_op: string | null;
  };
  regels: { id: number; naam: string; aantal: number; stukprijs_cent: number; aanbieding: string }[];
  betalingen: { id: number; bedrag_cent: number; wijze: string; notitie: string; op: string }[];
  log: { actie: string; details: string; op: string }[];
  moment: Moment | null;
};

const ACTIE: Record<string, string> = {
  bevestigd: "Bevestigen",
  klaar: "Klaar zetten",
  afgehaald: "Afhalen bevestigen",
  bezorgd: "Bezorgen bevestigen",
  geannuleerd: "Annuleren",
  nieuw: "Terug naar nieuw",
};

function waNummer(tel: string): string {
  const t = tel.replace(/[^\d+]/g, "");
  if (t.startsWith("+")) return t.slice(1);
  if (t.startsWith("00")) return t.slice(2);
  if (t.startsWith("0")) return `31${t.slice(1)}`;
  return t;
}

function DetailPaneel({ id, sluit, bijgewerkt, momenten }: { id: number; sluit: () => void; bijgewerkt: () => void; momenten: Moment[] }) {
  const { api, meld } = useBeheer();
  const [d, setD] = useState<Detail | null>(null);
  const [bedrag, setBedrag] = useState("");
  const [wijze, setWijze] = useState("tikkie");
  const [notitie, setNotitie] = useState("");
  const [ontvangen, setOntvangen] = useState(false);
  const [beheerNotitie, setBeheerNotitie] = useState("");
  const [momentId, setMomentId] = useState("");
  const [bezig, setBezig] = useState(false);
  const [bevestigAnnuleren, setBevestigAnnuleren] = useState(false);

  const laad = useCallback(async () => {
    const r = await api<Detail>(`/bestellingen/${id}`);
    if (!r.ok) return meld(r.error, true);
    setD(r.data);
    const open = Math.max(0, r.data.bestelling.totaal_cent - r.data.bestelling.betaald_cent);
    setBedrag(open ? (open / 100).toFixed(2).replace(".", ",") : "");
    setWijze("tikkie");
    setBeheerNotitie(r.data.bestelling.beheer_notitie);
    setMomentId(r.data.bestelling.moment_id ? String(r.data.bestelling.moment_id) : "");
    setOntvangen(false);
    setNotitie("");
  }, [api, id, meld]);
  useEffect(() => {
    void laad();
  }, [laad]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && sluit();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [sluit]);

  async function status(naar: string) {
    if (!d) return;
    if (naar === "geannuleerd" && !bevestigAnnuleren) {
      setBevestigAnnuleren(true);
      return;
    }
    setBezig(true);
    const r = await api(`/bestellingen/${id}/status`, { method: "POST", body: JSON.stringify({ status: naar, van: d.bestelling.status }) });
    setBezig(false);
    setBevestigAnnuleren(false);
    if (!r.ok) return meld(r.error, true);
    meld(`Status: ${BESTEL_STATUS[naar as keyof typeof BESTEL_STATUS]}`);
    await laad();
    bijgewerkt();
  }

  async function betaling(e: FormEvent) {
    e.preventDefault();
    const cent = parseEuro(bedrag);
    if (!cent) return meld("Vul een geldig bedrag in, bijvoorbeeld 17,98.", true);
    setBezig(true);
    const r = await api(`/bestellingen/${id}/betaling`, { method: "POST", body: JSON.stringify({ bedrag_cent: cent, wijze, notitie, ontvangen }) });
    setBezig(false);
    if (!r.ok) return meld(r.error, true);
    meld(wijze === "terugbetaling" ? "Terugbetaling geregistreerd" : "Betaling geregistreerd");
    await laad();
    bijgewerkt();
  }

  async function verwijderBetaling(betalingId: number) {
    if (!window.confirm("Deze betaling verwijderen? Doe dit alleen bij een vergissing.")) return;
    const r = await api(`/betalingen/${betalingId}`, { method: "DELETE" });
    if (!r.ok) return meld(r.error, true);
    meld("Betaling verwijderd");
    await laad();
    bijgewerkt();
  }

  async function verzoek(verstuurd: boolean) {
    const r = await api(`/bestellingen/${id}/betaalverzoek`, { method: "POST", body: JSON.stringify({ verstuurd }) });
    if (!r.ok) return meld(r.error, true);
    meld(verstuurd ? "Gemarkeerd: betaalverzoek verstuurd" : "Betaalverzoek teruggezet");
    await laad();
    bijgewerkt();
  }

  async function bewaar() {
    const r = await api(`/bestellingen/${id}`, { method: "PUT", body: JSON.stringify({ beheer_notitie: beheerNotitie, moment_id: momentId ? Number(momentId) : null }) });
    if (!r.ok) return meld(r.error, true);
    meld("Opgeslagen");
    await laad();
    bijgewerkt();
  }

  const b = d?.bestelling;
  const bericht = b
    ? `Hoi ${b.naam.split(" ")[0]}, over je strooizoutbestelling ${b.nummer}: ${b.status === "klaar" ? (b.levering === "ophalen" ? "je bestelling ligt klaar om op te halen." : "je bestelling gaat mee met de bezorgronde.") : "je bestelling is bevestigd."} Je bestelling bekijken: ${b.klant_link}`
    : "";
  const passendeMomenten = momenten.filter((m) => b && m.soort === b.levering);

  return (
    <>
      <div className="bh-achter" onClick={sluit} aria-hidden="true" />
      <aside className="bh-detail" role="dialog" aria-modal="true" aria-labelledby="bh-detail-titel">
        <div className="bh-detail__kop">
          <h2 id="bh-detail-titel">{b ? `Bestelling ${b.nummer}` : "Bestelling"}</h2>
          <button type="button" className="sz-sluit" onClick={sluit} aria-label="Sluiten">
            ✕
          </button>
        </div>
        <div className="bh-detail__inhoud">
          {!d || !b ? (
            <p>Laden…</p>
          ) : (
            <>
              <div className="bh-rij" style={{ marginBottom: 12 }}>
                <StatusPil status={b.status} />
                <BetaalPil status={b.betaalstatus} betaald={b.betaald_cent} />
                {b.mogelijk_dubbel && <span className="bh-pil bh-pil--let">mogelijk dubbel</span>}
                {b.geanonimiseerd_op && <span className="bh-pil">gegevens gewist</span>}
              </div>
              {d.bestelling.overgangen.length > 0 && (
                <div className="bh-knoppen" style={{ marginBottom: 14 }}>
                  {d.bestelling.overgangen.map((s) => (
                    <button key={s} type="button" className={`bh-knop${s === "geannuleerd" ? " bh-knop--gevaar" : s === "afgehaald" || s === "bezorgd" || s === "bevestigd" ? " bh-knop--hoofd" : ""}`} disabled={bezig} onClick={() => void status(s)}>
                      {s === "geannuleerd" && bevestigAnnuleren ? "Zeker weten? Klik nogmaals" : ACTIE[s] ?? s}
                    </button>
                  ))}
                </div>
              )}
              {b.afhaalcode && (
                <p className="bh-code">
                  Afhaalcode <strong>{b.afhaalcode}</strong>
                </p>
              )}
              <dl className="bh-dl">
                <dt>Naam</dt>
                <dd>{b.naam}</dd>
                <dt>Mobiel</dt>
                <dd>{b.telefoon ? <a href={`tel:${b.telefoon}`}>{mobielTekst(b.telefoon)}</a> : "–"}</dd>
                <dt>E-mail</dt>
                <dd>{b.email ? <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Je strooizoutbestelling ${b.nummer}`)}&body=${encodeURIComponent(bericht)}`}>{b.email}</a> : "–"}</dd>
                <dt>{b.levering === "bezorgen" ? "Bezorgen" : "Ophalen"}</dt>
                <dd>
                  {b.levering === "bezorgen" ? `${d.bestelling.straat} ${d.bestelling.huisnummer}, ${b.postcode} ${b.plaats}` : "Ophalen"}
                  {b.wijk && <div style={{ color: "var(--tekst-3)" }}>{b.wijk}</div>}
                  {d.moment && (
                    <div>
                      {dagTekst(d.moment.datum)} {d.moment.van}–{d.moment.tot}
                    </div>
                  )}
                </dd>
                <dt>Producten</dt>
                <dd>
                  {d.regels.map((r) => (
                    <div key={r.id}>
                      {r.aantal}× {r.naam} à {euro(r.stukprijs_cent)}
                      {r.aanbieding && ` (${r.aanbieding})`}
                    </div>
                  ))}
                </dd>
                <dt>Bedragen</dt>
                <dd className="sz-tnum">
                  Producten {euro(d.bestelling.subtotaal_cent)}
                  {d.bestelling.korting_cent > 0 && ` (korting ${euro(d.bestelling.korting_cent)})`}
                  {d.bestelling.bezorg_cent > 0 && ` + bezorging ${euro(d.bestelling.bezorg_cent)}`}
                  <br />
                  <strong>Totaal {euro(b.totaal_cent)}</strong> · betaald {euro(b.betaald_cent)}
                </dd>
                <dt>Betaalwijze</dt>
                <dd>{b.betaalwijze === "tikkie" ? "Betaalverzoek vooraf (stuur een Tikkie)" : "Betaalverzoek bij afhalen of bezorgen"}</dd>
                {b.opmerking && (
                  <>
                    <dt>Opmerking klant</dt>
                    <dd>{b.opmerking}</dd>
                  </>
                )}
                <dt>Geplaatst</dt>
                <dd>{kort(b.aangemaakt)}</dd>
              </dl>

              {!b.geanonimiseerd_op && (
                <div className="bh-knoppen" style={{ marginBottom: 16 }}>
                  {b.telefoon && (
                    <a className="bh-knop" href={`https://wa.me/${waNummer(b.telefoon)}?text=${encodeURIComponent(bericht)}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp-bericht
                    </a>
                  )}
                  <button
                    type="button"
                    className="bh-knop"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(b.klant_link);
                        meld("Link naar de klantpagina gekopieerd");
                      } catch {
                        window.prompt("Kopieer de link:", b.klant_link);
                      }
                    }}
                  >
                    Klantlink kopiëren
                  </button>
                </div>
              )}

              {!b.geanonimiseerd_op && b.betaalstatus !== "betaald" && b.betaalstatus !== "terugbetaald" && (
                <section className="bh-kaart">
                  <h2>Betaalverzoek</h2>
                  <p className="bh-sub" style={{ marginBottom: 10 }}>
                    Maak een Tikkie of betaalverzoek in je bank-app met dit nummer en bedrag. Daarna markeren als verstuurd; ‘betaald’ registreer je pas als het geld binnen is.
                  </p>
                  <div className="bh-betaalverzoek">
                    <button type="button" className="bh-kopieer" onClick={() => void kopieer(b.telefoon, meld, "Mobiel nummer")}>
                      <span>Mobiel</span>
                      <strong>{mobielTekst(b.telefoon)}</strong>
                      <em>kopieer</em>
                    </button>
                    <button type="button" className="bh-kopieer" onClick={() => void kopieer(((b.totaal_cent - b.betaald_cent) / 100).toFixed(2).replace(".", ","), meld, "Bedrag")}>
                      <span>Openstaand bedrag</span>
                      <strong>{euro(b.totaal_cent - b.betaald_cent)}</strong>
                      <em>kopieer</em>
                    </button>
                  </div>
                  <div className="bh-knoppen" style={{ marginTop: 10 }}>
                    <button type="button" className="bh-knop" onClick={() => void kopieer(`${b.telefoon}\t${((b.totaal_cent - b.betaald_cent) / 100).toFixed(2).replace(".", ",")}\tStrooizout ${b.afhaalcode || b.nummer}`, meld, "Nummer, bedrag en omschrijving")}>
                      Kopieer alles
                    </button>
                    {b.betaalverzoek_op ? (
                      <button type="button" className="bh-knop" onClick={() => void verzoek(false)}>
                        Verstuurd op {kort(b.betaalverzoek_op)} · terugzetten
                      </button>
                    ) : (
                      <button type="button" className="bh-knop bh-knop--hoofd" onClick={() => void verzoek(true)}>
                        Markeer: betaalverzoek verstuurd
                      </button>
                    )}
                  </div>
                </section>
              )}

              <section className="bh-kaart">
                <h2>Betaling registreren</h2>
                <form onSubmit={betaling} className="bh-formulier">
                  <div className="bh-veld bh-veld--6">
                    <label htmlFor="bh-bedrag">Bedrag (€)</label>
                    <input id="bh-bedrag" className="sz-invoer" inputMode="decimal" value={bedrag} onChange={(e) => setBedrag(e.target.value)} />
                  </div>
                  <div className="bh-veld bh-veld--6">
                    <label htmlFor="bh-wijze">Hoe</label>
                    <select id="bh-wijze" className="sz-invoer" value={wijze} onChange={(e) => setWijze(e.target.value)}>
                      <option value="tikkie">Tikkie / betaalverzoek</option>
                      <option value="overboeking">Overboeking</option>
                      <option value="pin">Pin</option>
                      <option value="terugbetaling">Terugbetaling (aan klant)</option>
                    </select>
                  </div>
                  <div className="bh-veld">
                    <label htmlFor="bh-notitie">Notitie (geen rekeningnummers)</label>
                    <input id="bh-notitie" className="sz-invoer" value={notitie} maxLength={200} onChange={(e) => setNotitie(e.target.value)} />
                  </div>
                  <div className="bh-veld">
                    <label className="bh-schakel">
                      <input type="checkbox" checked={ontvangen} onChange={(e) => setOntvangen(e.target.checked)} />
                      {wijze === "terugbetaling" ? "Het geld is echt terugbetaald" : "Het geld is echt ontvangen"}
                    </label>
                  </div>
                  <div className="bh-veld">
                    <button type="submit" className="bh-knop bh-knop--hoofd" style={{ width: "fit-content" }} disabled={!ontvangen || bezig}>
                      Registreren
                    </button>
                  </div>
                </form>
                {d.betalingen.length > 0 && (
                  <>
                    <h3>Geregistreerd</h3>
                    <table className="bh-tabel">
                      <tbody>
                        {d.betalingen.map((p) => (
                          <tr key={p.id}>
                            <td>{kort(p.op)}</td>
                            <td>{p.wijze}</td>
                            <td className="bh-getal">{euro(p.bedrag_cent)}</td>
                            <td>{p.notitie}</td>
                            <td>
                              <button type="button" className="bh-knop bh-knop--gevaar" onClick={() => void verwijderBetaling(p.id)} aria-label="Betaling verwijderen">
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </section>

              <section className="bh-kaart">
                <h2>Notitie en moment</h2>
                <div className="bh-formulier">
                  {passendeMomenten.length > 0 && (
                    <div className="bh-veld">
                      <label htmlFor="bh-moment">{b.levering === "bezorgen" ? "Bezorgmoment" : "Ophaalmoment"}</label>
                      <select id="bh-moment" className="sz-invoer" value={momentId} onChange={(e) => setMomentId(e.target.value)}>
                        <option value="">Geen</option>
                        {passendeMomenten.map((m) => (
                          <option key={m.id} value={m.id}>
                            {dagTekst(m.datum)} {m.van}–{m.tot}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="bh-veld">
                    <label htmlFor="bh-bnotitie">Interne notitie</label>
                    <textarea id="bh-bnotitie" className="sz-invoer" maxLength={1000} value={beheerNotitie} onChange={(e) => setBeheerNotitie(e.target.value)} />
                  </div>
                  <div className="bh-veld">
                    <button type="button" className="bh-knop" onClick={() => void bewaar()}>
                      Opslaan
                    </button>
                  </div>
                </div>
              </section>

              <section className="bh-kaart">
                <h2>Logboek</h2>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                  {d.log.map((l, i) => (
                    <li key={i}>
                      {kort(l.op)} · {l.actie} {l.details && <span style={{ color: "var(--tekst-3)" }}>({l.details})</span>}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default function Bestellingen() {
  const { api, ronde, token, meld } = useBeheer();
  const [lijst, setLijst] = useState<LijstBestelling[] | null>(null);
  const [momenten, setMomenten] = useState<Moment[]>([]);
  const [zoek, setZoek] = useState("");
  const [status, setStatus] = useState("");
  const [levering, setLevering] = useState("");
  const [betaal, setBetaal] = useState("");
  const [moment, setMoment] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const q = useMemo(() => {
    const p = new URLSearchParams();
    if (ronde) p.set("ronde", ronde);
    if (zoek.trim()) p.set("zoek", zoek.trim());
    if (status) p.set("status", status);
    if (levering) p.set("levering", levering);
    if (betaal) p.set("betaal", betaal);
    if (moment) p.set("moment", moment);
    return p.toString();
  }, [ronde, zoek, status, levering, betaal, moment]);

  const laad = useCallback(async () => {
    const r = await api<{ bestellingen: LijstBestelling[] }>(`/bestellingen?${q}`);
    if (r.ok) setLijst(r.data.bestellingen);
    else meld(r.error, true);
  }, [api, q, meld]);

  useEffect(() => {
    const t = window.setTimeout(() => void laad(), zoek ? 250 : 0);
    return () => window.clearTimeout(t);
  }, [laad, zoek]);
  useEffect(() => {
    void api<{ momenten: Moment[] }>("/rondes").then((r) => r.ok && setMomenten(r.data.momenten));
  }, [api]);

  const exporteer = async (soort: string) => {
    const f = await downloadMetToken(`/export/${soort}.csv?${rondeQuery(ronde)}`, token, `strooizout-${soort}-${ronde || "laatste"}.csv`);
    if (f) meld(f, true);
  };

  return (
    <>
      <div className="bh-rij bh-rij--tussen" style={{ marginBottom: 8 }}>
        <div>
          <h1>Bestellingen</h1>
          <p className="bh-sub">{lijst ? `${lijst.length} ${lijst.length === 1 ? "bestelling" : "bestellingen"} in deze selectie` : "Laden…"}</p>
        </div>
        <div className="bh-knoppen">
          <button type="button" className="bh-knop" onClick={() => void exporteer("bestellingen")}>
            CSV bestellingen
          </button>
          <button type="button" className="bh-knop" onClick={() => void laad()}>
            Vernieuwen
          </button>
        </div>
      </div>
      <div className="bh-filters">
        <label className="sr-only" htmlFor="bh-zoek">
          Zoeken
        </label>
        <input id="bh-zoek" className="sz-invoer" type="search" placeholder="Zoek op afhaalcode, naam of mobiel nummer…" value={zoek} onChange={(e) => setZoek(e.target.value)} />
        <select className="sz-invoer" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Alle statussen</option>
          <option value="open">Nog niet afgerond</option>
          {Object.entries(BESTEL_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="sz-invoer" aria-label="Levering" value={levering} onChange={(e) => setLevering(e.target.value)}>
          <option value="">Ophalen en bezorgen</option>
          <option value="ophalen">Ophalen</option>
          <option value="bezorgen">Bezorgen</option>
        </select>
        <select className="sz-invoer" aria-label="Betaling" value={betaal} onChange={(e) => setBetaal(e.target.value)}>
          <option value="">Alle betalingen</option>
          <option value="nietbetaald">Nog niet betaald</option>
          <option value="open">Openstaand</option>
          <option value="verzoek">Betaalverzoek verstuurd</option>
          <option value="betaald">Betaald</option>
          <option value="terugbetaald">Terugbetaald</option>
        </select>
        {momenten.length > 0 && (
          <select className="sz-invoer" aria-label="Moment" value={moment} onChange={(e) => setMoment(e.target.value)}>
            <option value="">Alle momenten</option>
            {momenten.map((m) => (
              <option key={m.id} value={m.id}>
                {m.soort === "bezorgen" ? "Bezorgen" : "Ophalen"} {dagTekst(m.datum)} {m.van}
              </option>
            ))}
          </select>
        )}
      </div>
      {lijst && lijst.length === 0 ? (
        <div className="bh-kaart">Geen bestellingen gevonden.</div>
      ) : (
        <div className="bh-tabel-wrap">
          <table className="bh-tabel">
            <thead>
              <tr>
                <th>Code</th>
                <th>Naam</th>
                <th className="bh-verberg-mobiel">Producten</th>
                <th>Levering</th>
                <th className="bh-getal">Totaal</th>
                <th>Betaling</th>
                <th>Status</th>
                <th className="bh-verberg-mobiel">Geplaatst</th>
              </tr>
            </thead>
            <tbody>
              {(lijst ?? []).map((b) => (
                <tr key={b.id}>
                  <td>
                    <button type="button" className="bh-regelknop" onClick={() => setOpen(b.id)} aria-label={`Bestelling ${b.afhaalcode || b.nummer} openen`}>
                      {b.afhaalcode || b.nummer}
                    </button>
                    <div style={{ fontSize: 12.5, color: "var(--tekst-3)" }}>{b.nummer}</div>
                  </td>
                  <td>
                    {b.naam}
                    <div style={{ fontSize: 13, color: "var(--tekst-3)" }}>{mobielTekst(b.telefoon)}</div>
                    {b.kanaal !== "web" && <span className="bh-pil">{b.kanaal === "straat" ? "aan de weg (QR)" : "straatverkoop"}</span>}
                    {b.voorbestelling && <span className="bh-pil bh-pil--let">voorbestelling</span>}
                    {b.mogelijk_dubbel && (
                      <>
                        {" "}
                        <span className="bh-pil bh-pil--let" title="Zelfde e-mailadres of telefoonnummer in deze ronde">
                          dubbel?
                        </span>
                      </>
                    )}
                  </td>
                  <td className="bh-verberg-mobiel">{b.samenvatting}</td>
                  <td>
                    {b.levering === "bezorgen" ? "Bezorgen" : "Ophalen"}
                    {b.wijk && <div style={{ color: "var(--tekst-3)", fontSize: 13 }}>{b.wijk}</div>}
                  </td>
                  <td className="bh-getal">{euro(b.totaal_cent)}</td>
                  <td>
                    <BetaalPil status={b.betaalstatus} betaald={b.betaald_cent} />
                  </td>
                  <td>
                    <StatusPil status={b.status} />
                  </td>
                  <td className="bh-verberg-mobiel">{kort(b.aangemaakt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open !== null && <DetailPaneel id={open} sluit={() => setOpen(null)} bijgewerkt={() => void laad()} momenten={momenten} />}
    </>
  );
}
