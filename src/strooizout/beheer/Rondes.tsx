// Bestelrondes: starten, sluitdatum, sluiten, inkoopbehoefte, inkoop registreren, levering volgen. Plus ophaal- en bezorgmomenten.

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { dagTekst, euro, parseEuro, RONDE_STATUS } from "../../../shared/strooizout";
import { kg, kort, naarLokaal, useBeheer, vanLokaal, type Ronde } from "./basis";
import type { Moment } from "./typen";

type Behoefte = {
  besteld: { product_id: number; naam: string; aantal: number }[];
  inkoop: { product_id: number; naam: string; eenheid: string; nodig: number; voorraad: number | null; gewicht_gram: number; inkoopprijs_cent: number | null; verwachte_inkoop_cent: number | null; ingekocht: number; ingekocht_stukprijs_cent: number | null }[];
  totaal_gewicht_gram: number;
  verwachte_inkoop_cent: number | null;
  bestellingen: number;
};

const datumVan = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const datumNaar = (d: string) => (d ? new Date(`${d}T12:00:00Z`).toISOString() : null);
const centTekst = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2).replace(".", ","));

function RondeKaart({ r, herlaad }: { r: Ronde; herlaad: () => void }) {
  const { api, meld } = useBeheer();
  const [open, setOpen] = useState(r.status !== "afgerond");
  const [v, setV] = useState({
    naam: r.naam,
    status: r.status,
    sluit_op: naarLokaal(r.sluit_op),
    leverancier: r.leverancier,
    inkoop_datum: datumVan(r.inkoop_datum),
    inkoop_bedrag: centTekst(r.inkoop_bedrag_cent),
    inkoop_notitie: r.inkoop_notitie,
    levering_datum: datumVan(r.levering_datum),
    notitie: r.notitie,
  });
  const [b, setB] = useState<Behoefte | null>(null);
  const [ingekocht, setIngekocht] = useState<Record<number, { aantal: string; prijs: string }>>({});

  const laadBehoefte = useCallback(async () => {
    const res = await api<Behoefte>(`/rondes/${r.id}/behoefte`);
    if (!res.ok) return;
    setB(res.data);
    setIngekocht(Object.fromEntries(res.data.inkoop.map((i) => [i.product_id, { aantal: i.ingekocht ? String(i.ingekocht) : "", prijs: centTekst(i.ingekocht_stukprijs_cent ?? i.inkoopprijs_cent) }])));
  }, [api, r.id]);
  useEffect(() => {
    if (open) void laadBehoefte();
  }, [open, laadBehoefte]);

  async function bewaar(e?: FormEvent, extra: Record<string, unknown> = {}) {
    e?.preventDefault();
    const bedrag = v.inkoop_bedrag.trim() ? parseEuro(v.inkoop_bedrag) : null;
    if (v.inkoop_bedrag.trim() && bedrag === null) return meld("Inkoopbedrag: vul een bedrag in zoals 245,00.", true);
    const res = await api(`/rondes/${r.id}`, {
      method: "PUT",
      body: JSON.stringify({
        naam: v.naam,
        status: v.status,
        sluit_op: vanLokaal(v.sluit_op),
        leverancier: v.leverancier,
        inkoop_datum: datumNaar(v.inkoop_datum),
        inkoop_bedrag_cent: bedrag,
        inkoop_notitie: v.inkoop_notitie,
        levering_datum: datumNaar(v.levering_datum),
        notitie: v.notitie,
        ...extra,
      }),
    });
    if (!res.ok) return meld(res.error, true);
    meld("Ronde opgeslagen");
    herlaad();
    void laadBehoefte();
  }

  async function bewaarInkoop() {
    const inkoop = [];
    for (const [pid, x] of Object.entries(ingekocht)) {
      if (!x.aantal) continue;
      const prijs = parseEuro(x.prijs || "0");
      if (prijs === null) return meld("Controleer de inkoopprijzen.", true);
      inkoop.push({ product_id: Number(pid), aantal: Number(x.aantal), stukprijs_cent: prijs });
    }
    await bewaar(undefined, { inkoop });
  }

  const zet = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  const ingekochtTotaal = Object.values(ingekocht).reduce((s, x) => s + (Number(x.aantal) || 0) * (parseEuro(x.prijs || "0") ?? 0), 0);

  return (
    <section className="bh-kaart">
      <div className="bh-rij bh-rij--tussen">
        <div>
          <h2 style={{ marginBottom: 2 }}>{r.naam}</h2>
          <div style={{ fontSize: 14, color: "var(--tekst-2)" }}>
            <span className={`bh-pil ${r.status === "open" ? "bh-pil--betaald" : "bh-pil--bevestigd"}`}>{RONDE_STATUS[r.status]}</span> · {r.bestellingen} bestellingen
            {r.sluit_op && ` · sluit ${kort(r.sluit_op)}`}
          </div>
        </div>
        <div className="bh-knoppen">
          {r.status === "open" && (
            <button type="button" className="bh-knop" onClick={() => void bewaar(undefined, { status: "gesloten" })}>
              Ronde sluiten
            </button>
          )}
          <button type="button" className="bh-knop" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "Inklappen" : "Details"}
          </button>
        </div>
      </div>
      {open && (
        <>
          <form className="bh-formulier" style={{ marginTop: 14 }} onSubmit={bewaar}>
            <div className="bh-veld bh-veld--6">
              <label>Naam</label>
              <input className="sz-invoer" value={v.naam} onChange={zet("naam")} maxLength={80} />
            </div>
            <div className="bh-veld bh-veld--3">
              <label>Status</label>
              <select className="sz-invoer" value={v.status} onChange={zet("status")}>
                {Object.entries(RONDE_STATUS).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="bh-veld bh-veld--3">
              <label>Sluitdatum</label>
              <input className="sz-invoer" type="datetime-local" value={v.sluit_op} onChange={zet("sluit_op")} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label>Leverancier</label>
              <input className="sz-invoer" value={v.leverancier} onChange={zet("leverancier")} maxLength={120} />
            </div>
            <div className="bh-veld bh-veld--3">
              <label>Ingekocht op</label>
              <input className="sz-invoer" type="date" value={v.inkoop_datum} onChange={zet("inkoop_datum")} />
            </div>
            <div className="bh-veld bh-veld--3">
              <label>Geleverd op</label>
              <input className="sz-invoer" type="date" value={v.levering_datum} onChange={zet("levering_datum")} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label>Totaal inkoopbedrag factuur (€)</label>
              <input className="sz-invoer" inputMode="decimal" value={v.inkoop_bedrag} onChange={zet("inkoop_bedrag")} placeholder="optioneel; anders som van de inkoopregels" />
            </div>
            <div className="bh-veld bh-veld--6">
              <label>Inkoopnotitie</label>
              <input className="sz-invoer" value={v.inkoop_notitie} onChange={zet("inkoop_notitie")} maxLength={1000} />
            </div>
            <div className="bh-veld">
              <label>Notitie</label>
              <textarea className="sz-invoer" value={v.notitie} onChange={zet("notitie")} maxLength={1000} />
            </div>
            <div className="bh-veld">
              <button type="submit" className="bh-knop bh-knop--hoofd" style={{ width: "fit-content" }}>
                Ronde opslaan
              </button>
            </div>
          </form>

          <h3>Inkoopbehoefte</h3>
          {!b ? (
            <p>Laden…</p>
          ) : b.inkoop.length === 0 ? (
            <p className="bh-sub">Nog geen bestellingen in deze ronde.</p>
          ) : (
            <>
              <p className="bh-sub">
                {b.bestellingen} bestellingen · {kg(b.totaal_gewicht_gram)} · verwachte inkoop {b.verwachte_inkoop_cent === null ? "onbekend (inkoopprijs ontbreekt)" : euro(b.verwachte_inkoop_cent)}. Pakketten zijn uitgesplitst in hun onderdelen.
              </p>
              <div className="bh-tabel-wrap">
                <table className="bh-tabel">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="bh-getal">Nodig</th>
                      <th className="bh-getal">Gewicht</th>
                      <th className="bh-getal">Verwacht</th>
                      <th>Ingekocht (aantal)</th>
                      <th>Stukprijs (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.inkoop.map((i) => (
                      <tr key={i.product_id}>
                        <td>{i.naam}</td>
                        <td className="bh-getal">
                          {i.nodig} {i.eenheid}
                        </td>
                        <td className="bh-getal">{kg(i.gewicht_gram)}</td>
                        <td className="bh-getal">{i.verwachte_inkoop_cent === null ? "–" : euro(i.verwachte_inkoop_cent)}</td>
                        <td>
                          <input className="sz-invoer" style={{ width: 90, minHeight: 38 }} inputMode="numeric" aria-label={`Ingekocht aantal ${i.naam}`} value={ingekocht[i.product_id]?.aantal ?? ""} onChange={(e) => setIngekocht((x) => ({ ...x, [i.product_id]: { ...x[i.product_id], aantal: e.target.value.replace(/\D/g, "") } }))} />
                        </td>
                        <td>
                          <input className="sz-invoer" style={{ width: 100, minHeight: 38 }} inputMode="decimal" aria-label={`Stukprijs ${i.naam}`} value={ingekocht[i.product_id]?.prijs ?? ""} onChange={(e) => setIngekocht((x) => ({ ...x, [i.product_id]: { ...x[i.product_id], prijs: e.target.value } }))} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bh-rij" style={{ marginTop: 10 }}>
                <button type="button" className="bh-knop" onClick={() => void bewaarInkoop()}>
                  Inkoop registreren
                </button>
                <span style={{ fontSize: 14, color: "var(--tekst-2)" }}>Som inkoopregels: {euro(ingekochtTotaal)}. Dit is alleen een registratie; er wordt niets besteld.</span>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

function Momenten({ momenten, rondes, herlaad }: { momenten: Moment[]; rondes: Ronde[]; herlaad: () => void }) {
  const { api, meld } = useBeheer();
  const leeg = { soort: "ophalen", datum: "", van: "10:00", tot: "12:00", omschrijving: "", max_bestellingen: "", ronde_id: rondes.find((r) => r.status === "open")?.id ?? "" };
  const [v, setV] = useState<Record<string, string | number>>(leeg);
  async function voegToe(e: FormEvent) {
    e.preventDefault();
    const r = await api("/momenten", { method: "POST", body: JSON.stringify({ ...v, max_bestellingen: v.max_bestellingen === "" ? null : Number(v.max_bestellingen), ronde_id: v.ronde_id === "" ? null : Number(v.ronde_id) }) });
    if (!r.ok) return meld(r.error, true);
    meld("Moment toegevoegd");
    setV(leeg);
    herlaad();
  }
  async function wissel(m: Moment) {
    const r = await api(`/momenten/${m.id}`, { method: "PUT", body: JSON.stringify({ ...m, actief: !m.actief }) });
    if (!r.ok) return meld(r.error, true);
    herlaad();
  }
  async function weg(m: Moment) {
    if (!window.confirm("Dit moment verwijderen? Als er al bestellingen aan hangen, wordt het alleen uitgezet.")) return;
    const r = await api<{ verwijderd: string }>(`/momenten/${m.id}`, { method: "DELETE" });
    if (!r.ok) return meld(r.error, true);
    meld(r.data.verwijderd === "definitief" ? "Moment verwijderd" : "Moment uitgezet");
    herlaad();
  }
  const zet = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  return (
    <section className="bh-kaart">
      <h2>Ophaal- en bezorgmomenten</h2>
      <p className="bh-sub">Zonder momenten kiest de klant geen tijdstip en spreek je het moment zelf af. Met momenten is kiezen verplicht.</p>
      {momenten.length > 0 && (
        <div className="bh-tabel-wrap" style={{ marginBottom: 14 }}>
          <table className="bh-tabel">
            <thead>
              <tr>
                <th>Soort</th>
                <th>Wanneer</th>
                <th>Omschrijving</th>
                <th className="bh-getal">Bezet</th>
                <th>Actief</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {momenten.map((m) => (
                <tr key={m.id}>
                  <td>{m.soort === "bezorgen" ? "Bezorgen" : "Ophalen"}</td>
                  <td>
                    {dagTekst(m.datum)} {m.van}–{m.tot}
                  </td>
                  <td>{m.omschrijving}</td>
                  <td className="bh-getal">
                    {m.bezet ?? 0}
                    {m.max_bestellingen ? ` / ${m.max_bestellingen}` : ""}
                  </td>
                  <td>
                    <button type="button" className="bh-knop" onClick={() => void wissel(m)}>
                      {m.actief ? "Aan" : "Uit"}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="bh-knop bh-knop--gevaar" onClick={() => void weg(m)} aria-label="Moment verwijderen">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form className="bh-formulier" onSubmit={voegToe}>
        <div className="bh-veld bh-veld--3">
          <label>Soort</label>
          <select className="sz-invoer" value={v.soort} onChange={zet("soort")}>
            <option value="ophalen">Ophalen</option>
            <option value="bezorgen">Bezorgen</option>
          </select>
        </div>
        <div className="bh-veld bh-veld--3">
          <label>Datum</label>
          <input className="sz-invoer" type="date" value={v.datum} onChange={zet("datum")} required />
        </div>
        <div className="bh-veld bh-veld--3">
          <label>Van</label>
          <input className="sz-invoer" type="time" value={v.van} onChange={zet("van")} required />
        </div>
        <div className="bh-veld bh-veld--3">
          <label>Tot</label>
          <input className="sz-invoer" type="time" value={v.tot} onChange={zet("tot")} required />
        </div>
        <div className="bh-veld bh-veld--6">
          <label>Omschrijving (optioneel)</label>
          <input className="sz-invoer" value={v.omschrijving} onChange={zet("omschrijving")} maxLength={120} />
        </div>
        <div className="bh-veld bh-veld--3">
          <label>Max. bestellingen</label>
          <input className="sz-invoer" inputMode="numeric" value={v.max_bestellingen} onChange={zet("max_bestellingen")} placeholder="geen" />
        </div>
        <div className="bh-veld bh-veld--3">
          <label>Ronde</label>
          <select className="sz-invoer" value={v.ronde_id} onChange={zet("ronde_id")}>
            <option value="">Alle rondes</option>
            {rondes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.naam}
              </option>
            ))}
          </select>
        </div>
        <div className="bh-veld">
          <button type="submit" className="bh-knop bh-knop--hoofd" style={{ width: "fit-content" }}>
            Moment toevoegen
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Rondes() {
  const { api, meld, laadRondes, setRonde } = useBeheer();
  const [rondes, setRondes] = useState<Ronde[] | null>(null);
  const [momenten, setMomenten] = useState<Moment[]>([]);
  const [naam, setNaam] = useState("");
  const [sluit, setSluit] = useState("");

  const laad = useCallback(async () => {
    const r = await api<{ rondes: Ronde[]; momenten: Moment[] }>("/rondes");
    if (!r.ok) return meld(r.error, true);
    setRondes(r.data.rondes);
    setMomenten(r.data.momenten);
  }, [api, meld]);
  useEffect(() => {
    void laad();
  }, [laad]);

  async function start(e: FormEvent) {
    e.preventDefault();
    const r = await api<{ id: number }>("/rondes", { method: "POST", body: JSON.stringify({ naam, sluit_op: vanLokaal(sluit) }) });
    if (!r.ok) return meld(r.error, true);
    meld("Nieuwe bestelronde gestart: de webshop staat open.");
    setNaam("");
    setSluit("");
    await laadRondes();
    setRonde(String(r.data.id));
    void laad();
  }

  if (!rondes) return <p>Laden…</p>;
  const heeftOpen = rondes.some((r) => r.status === "open");
  return (
    <>
      <h1>Bestelrondes</h1>
      <p className="bh-sub">Bestellen kan alleen in een open ronde, tot de sluitdatum. Daarna verzamel je de bestellingen, koop je in en lever je uit.</p>
      {!heeftOpen && (
        <section className="bh-kaart">
          <h2>Nieuwe bestelronde starten</h2>
          <form className="bh-formulier" onSubmit={start}>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="bh-rnaam">Naam</label>
              <input id="bh-rnaam" className="sz-invoer" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Bijv. Winter 2026 – ronde 1" required />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="bh-rsluit">Sluitdatum (optioneel)</label>
              <input id="bh-rsluit" className="sz-invoer" type="datetime-local" value={sluit} onChange={(e) => setSluit(e.target.value)} />
            </div>
            <div className="bh-veld">
              <button type="submit" className="bh-knop bh-knop--hoofd" style={{ width: "fit-content" }} disabled={naam.trim().length < 2}>
                Ronde starten
              </button>
            </div>
          </form>
        </section>
      )}
      {rondes.map((r) => (
        <RondeKaart key={`${r.id}-${r.status}-${r.sluit_op}`} r={r} herlaad={() => { void laad(); void laadRondes(); }} />
      ))}
      <Momenten momenten={momenten} rondes={rondes} herlaad={() => void laad()} />
    </>
  );
}
