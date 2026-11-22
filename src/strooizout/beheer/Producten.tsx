// Productbeheer: toevoegen, wijzigen, verbergen, verwijderen, afbeeldingen, prijzen, voorraad, pakketten en aanbiedingen.

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { euro, gewichtTekst, parseEuro } from "../../../shared/strooizout";
import { naarLokaal, useBeheer, vanLokaal } from "./basis";
import type { BeheerProduct } from "./typen";

type Lijst = { producten: BeheerProduct[]; categorieen: { id: number; slug: string; naam: string }[]; afbeeldingen: { id: number; url: string; grootte: number }[]; standaard_bezorg_cent: number };

const INGEBOUWD = [
  { url: "/strooizout/beeld/strooizout-25kg.webp", naam: "Strooizout" },
  { url: "/strooizout/beeld/sneeuwschep.webp", naam: "Sneeuwschep" },
];

const STATUS = { concept: "Concept (niet zichtbaar)", binnenkort: "Binnenkort (zichtbaar, niet te bestellen)", actief: "Actief (te bestellen)", verborgen: "Tijdelijk verborgen" };

const centTekst = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2).replace(".", ","));

type Formulier = Omit<BeheerProduct, "prijs_cent" | "inkoop_cent" | "bezorg_cent" | "voorraad" | "berekend" | "id" | "slug" | "aanbiedingen"> & {
  prijs: string;
  inkoop: string;
  bezorg: string;
  voorraadTekst: string;
  aanbiedingen: { naam: string; vanaf_aantal: number; prijs: string; start: string; eind: string; actief: boolean }[];
};

function leegFormulier(): Formulier {
  return {
    naam: "",
    categorie_id: null,
    status: "concept",
    kort: "",
    beschrijving: "",
    specificaties: [],
    prijs: "",
    inkoop: "",
    bezorg: "",
    gewicht_gram: 0,
    eenheid: "stuk",
    voorraadTekst: "",
    max_per_bestelling: 20,
    afbeelding: "",
    afbeelding_alt: "",
    notitie: "",
    volgorde: 0,
    onderdelen: [],
    aanbiedingen: [],
  };
}

function naarFormulier(p: BeheerProduct): Formulier {
  return {
    ...p,
    prijs: centTekst(p.prijs_cent),
    inkoop: centTekst(p.inkoop_cent),
    bezorg: centTekst(p.bezorg_cent),
    voorraadTekst: p.voorraad === null ? "" : String(p.voorraad),
    aanbiedingen: p.aanbiedingen.map((a) => ({ naam: a.naam, vanaf_aantal: a.vanaf_aantal, prijs: centTekst(a.prijs_cent), start: naarLokaal(a.start), eind: naarLokaal(a.eind), actief: a.actief })),
  };
}

/** Verkleint een foto in de browser tot max. 1400 px en maakt er WebP (of JPEG) van. */
async function verklein(bestand: File): Promise<Blob> {
  const bron = await createImageBitmap(bestand);
  const max = 1400;
  const schaal = Math.min(1, max / Math.max(bron.width, bron.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bron.width * schaal);
  canvas.height = Math.round(bron.height * schaal);
  canvas.getContext("2d")!.drawImage(bron, 0, 0, canvas.width, canvas.height);
  const maak = (type: string, kwaliteit: number) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, kwaliteit));
  let blob = await maak("image/webp", 0.84);
  if (!blob || blob.type !== "image/webp") blob = await maak("image/jpeg", 0.85);
  for (let q = 0.75; blob && blob.size > 850_000 && q > 0.4; q -= 0.1) blob = await maak(blob.type, q);
  if (!blob) throw new Error("Verkleinen mislukt");
  return blob;
}

function Editor({ product, lijst, sluit, opgeslagen }: { product: BeheerProduct | null; lijst: Lijst; sluit: () => void; opgeslagen: () => void }) {
  const { api, meld, token } = useBeheer();
  const [f, setF] = useState<Formulier>(() => (product ? naarFormulier(product) : leegFormulier()));
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [uploaden, setUploaden] = useState(false);
  const zet = <K extends keyof Formulier>(k: K, v: Formulier[K]) => setF((x) => ({ ...x, [k]: v }));
  const anderen = lijst.producten.filter((p) => p.id !== product?.id && p.onderdelen.length === 0);

  async function upload(bestand: File | undefined) {
    if (!bestand) return;
    setUploaden(true);
    try {
      const blob = await verklein(bestand);
      const res = await fetch("/api/strooizout/beheer/afbeeldingen", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": blob.type }, body: blob });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) throw new Error(body?.error ?? "Uploaden mislukt.");
      zet("afbeelding", body.url);
      meld("Afbeelding geüpload");
      opgeslagen();
    } catch (e) {
      meld((e as Error).message || "Uploaden mislukt.", true);
    } finally {
      setUploaden(false);
    }
  }

  async function bewaar(e: FormEvent) {
    e.preventDefault();
    setFout("");
    const geld = (t: string, veld: string): number | null | false => {
      if (!t.trim()) return null;
      const c = parseEuro(t);
      if (c === null) {
        setFout(`${veld}: vul een bedrag in zoals 8,99.`);
        return false;
      }
      return c;
    };
    const prijs = geld(f.prijs, "Verkoopprijs");
    const inkoop = geld(f.inkoop, "Inkoopprijs");
    const bezorg = geld(f.bezorg, "Bezorgkosten");
    if (prijs === false || inkoop === false || bezorg === false) return;
    const aanbiedingen = [];
    for (const a of f.aanbiedingen) {
      const ap = parseEuro(a.prijs);
      if (!a.naam.trim() || ap === null) return setFout("Geef elke aanbieding een naam en een prijs.");
      aanbiedingen.push({ naam: a.naam.trim(), vanaf_aantal: a.vanaf_aantal, prijs_cent: ap, start: vanLokaal(a.start), eind: vanLokaal(a.eind), actief: a.actief });
    }
    const body = {
      naam: f.naam,
      categorie_id: f.categorie_id,
      status: f.status,
      kort: f.kort,
      beschrijving: f.beschrijving,
      specificaties: f.specificaties.filter((s) => s.label.trim() && s.waarde.trim()),
      prijs_cent: prijs,
      inkoop_cent: inkoop,
      bezorg_cent: bezorg,
      gewicht_gram: f.gewicht_gram,
      eenheid: f.eenheid,
      // Voorraad alleen meesturen als de beheerder hem heeft aangepast; anders blijft de live stand staan.
      ...((f.voorraadTekst.trim() === "" ? null : Number(f.voorraadTekst)) !== (product?.voorraad ?? null) || !product ? { voorraad: f.voorraadTekst.trim() === "" ? null : Number(f.voorraadTekst) } : {}),
      voorraad_was: product?.voorraad ?? null,
      max_per_bestelling: f.max_per_bestelling,
      afbeelding: f.afbeelding,
      afbeelding_alt: f.afbeelding_alt,
      notitie: f.notitie,
      volgorde: f.volgorde,
      onderdelen: f.onderdelen,
      aanbiedingen,
    };
    setBezig(true);
    const r = await api(product ? `/producten/${product.id}` : "/producten", { method: product ? "PUT" : "POST", body: JSON.stringify(body) });
    setBezig(false);
    if (!r.ok) {
      if (r.status === 409 && "voorraad" in r.extra) opgeslagen();
      return setFout(r.error);
    }
    meld(product ? "Product opgeslagen" : "Product toegevoegd");
    opgeslagen();
    sluit();
  }

  async function verwijder() {
    if (!product) return;
    if (!window.confirm(`‘${product.naam}’ verwijderen? Een product dat al besteld is, wordt gearchiveerd (blijft in de historie).`)) return;
    const r = await api<{ verwijderd: string }>(`/producten/${product.id}`, { method: "DELETE" });
    if (!r.ok) return meld(r.error, true);
    meld(r.data.verwijderd === "definitief" ? "Product verwijderd" : "Product gearchiveerd");
    opgeslagen();
    sluit();
  }

  return (
    <>
      <div className="bh-achter" onClick={sluit} aria-hidden="true" />
      <aside className="bh-detail" role="dialog" aria-modal="true" aria-labelledby="bh-pe-titel" style={{ width: "min(720px, 100vw)" }}>
        <div className="bh-detail__kop">
          <h2 id="bh-pe-titel">{product ? `Product: ${product.naam}` : "Nieuw product"}</h2>
          <button type="button" className="sz-sluit" onClick={sluit} aria-label="Sluiten">
            ✕
          </button>
        </div>
        <form className="bh-detail__inhoud" onSubmit={bewaar}>
          <div className="bh-formulier">
            <div className="bh-veld bh-veld--6">
              <label htmlFor="pe-naam">Naam</label>
              <input id="pe-naam" className="sz-invoer" value={f.naam} maxLength={80} onChange={(e) => zet("naam", e.target.value)} required />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="pe-status">Status</label>
              <select id="pe-status" className="sz-invoer" value={f.status} onChange={(e) => zet("status", e.target.value as Formulier["status"])}>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <small>Actief kan pas met verkoopprijs, beschrijving en afbeelding.</small>
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="pe-cat">Categorie</label>
              <select id="pe-cat" className="sz-invoer" value={f.categorie_id ?? ""} onChange={(e) => zet("categorie_id", e.target.value ? Number(e.target.value) : null)}>
                <option value="">Geen</option>
                {lijst.categorieen.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.naam}
                  </option>
                ))}
              </select>
            </div>
            <div className="bh-veld bh-veld--3">
              <label htmlFor="pe-eenheid">Eenheid</label>
              <input id="pe-eenheid" className="sz-invoer" value={f.eenheid} maxLength={20} onChange={(e) => zet("eenheid", e.target.value)} />
              <small>Bijv. zak, stuk. ‘zak’ telt mee als zakken.</small>
            </div>
            <div className="bh-veld bh-veld--3">
              <label htmlFor="pe-volgorde">Volgorde</label>
              <input id="pe-volgorde" className="sz-invoer" type="number" value={f.volgorde} onChange={(e) => zet("volgorde", Number(e.target.value) || 0)} />
            </div>

            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-prijs">Verkoopprijs (€, incl.)</label>
              <input id="pe-prijs" className="sz-invoer" inputMode="decimal" value={f.prijs} onChange={(e) => zet("prijs", e.target.value)} placeholder="10,49" />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-inkoop">Inkoopprijs incl. btw (€)</label>
              <input id="pe-inkoop" className="sz-invoer" inputMode="decimal" value={f.inkoop} onChange={(e) => zet("inkoop", e.target.value)} placeholder={product?.onderdelen.length ? "som van onderdelen" : "onbekend"} />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-bezorg">Bezorgkosten per stuk (€)</label>
              <input id="pe-bezorg" className="sz-invoer" inputMode="decimal" value={f.bezorg} onChange={(e) => zet("bezorg", e.target.value)} placeholder={`standaard ${euro(lijst.standaard_bezorg_cent)}`} />
              <small>Leeg = standaardtarief uit Instellingen.</small>
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-voorraad">Voorraad</label>
              <input id="pe-voorraad" className="sz-invoer" inputMode="numeric" value={f.voorraadTekst} onChange={(e) => zet("voorraadTekst", e.target.value.replace(/\D/g, ""))} placeholder="geen limiet" />
              <small>Leeg = per ronde inkopen, geen voorraadgrens.</small>
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-max">Max. per bestelling</label>
              <input id="pe-max" className="sz-invoer" type="number" min={1} max={500} value={f.max_per_bestelling} onChange={(e) => zet("max_per_bestelling", Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="pe-gewicht">Gewicht (gram)</label>
              <input id="pe-gewicht" className="sz-invoer" type="number" min={0} value={f.gewicht_gram} onChange={(e) => zet("gewicht_gram", Math.max(0, Number(e.target.value) || 0))} />
              <small>{f.gewicht_gram ? gewichtTekst(f.gewicht_gram) : "0 = (bij pakket) som van onderdelen"}</small>
            </div>

            <div className="bh-veld">
              <label htmlFor="pe-kort">Korte omschrijving</label>
              <input id="pe-kort" className="sz-invoer" value={f.kort} maxLength={160} onChange={(e) => zet("kort", e.target.value)} />
            </div>
            <div className="bh-veld">
              <label htmlFor="pe-beschrijving">Beschrijving</label>
              <textarea id="pe-beschrijving" className="sz-invoer" value={f.beschrijving} maxLength={3000} onChange={(e) => zet("beschrijving", e.target.value)} />
              <small>Alleen controleerbare informatie: geen claims over werking of milieu zonder bron.</small>
            </div>

            <fieldset className="bh-veld" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Specificaties</legend>
              {f.specificaties.map((s, i) => (
                <div className="bh-rij" key={i} style={{ marginBottom: 6 }}>
                  <input className="sz-invoer" style={{ flex: 1 }} aria-label="Kenmerk" placeholder="Kenmerk" value={s.label} maxLength={40} onChange={(e) => zet("specificaties", f.specificaties.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input className="sz-invoer" style={{ flex: 2 }} aria-label="Waarde" placeholder="Waarde" value={s.waarde} maxLength={120} onChange={(e) => zet("specificaties", f.specificaties.map((x, j) => (j === i ? { ...x, waarde: e.target.value } : x)))} />
                  <button type="button" className="bh-knop bh-knop--gevaar" aria-label="Specificatie verwijderen" onClick={() => zet("specificaties", f.specificaties.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </div>
              ))}
              {f.specificaties.length < 12 && (
                <button type="button" className="bh-knop" onClick={() => zet("specificaties", [...f.specificaties, { label: "", waarde: "" }])}>
                  + Specificatie
                </button>
              )}
            </fieldset>

            <fieldset className="bh-veld" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Afbeelding</legend>
              {f.afbeelding && <img src={f.afbeelding} alt="" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 12, background: "var(--ijs-1)" }} />}
              <div className="bh-afbeeldingen">
                {[...INGEBOUWD, ...lijst.afbeeldingen.map((a) => ({ url: a.url, naam: `Upload ${a.id}` }))].map((a) => (
                  <button type="button" key={a.url} aria-pressed={f.afbeelding === a.url} aria-label={`Kies ${a.naam}`} onClick={() => zet("afbeelding", a.url)}>
                    <img src={a.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
              <label className="bh-knop" style={{ width: "fit-content" }}>
                {uploaden ? "Uploaden…" : "Foto uploaden"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploaden} onChange={(e) => void upload(e.target.files?.[0])} />
              </label>
              <label htmlFor="pe-alt" style={{ marginTop: 6 }}>
                Omschrijving van de afbeelding (voor schermlezers)
              </label>
              <input id="pe-alt" className="sz-invoer" value={f.afbeelding_alt} maxLength={160} onChange={(e) => zet("afbeelding_alt", e.target.value)} />
            </fieldset>

            <fieldset className="bh-veld" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Combinatiepakket (optioneel)</legend>
              <small>Voeg onderdelen toe om er een pakket van te maken. De voorraad van de onderdelen gaat dan omlaag bij een bestelling.</small>
              {f.onderdelen.map((o, i) => (
                <div className="bh-rij" key={i} style={{ marginTop: 6 }}>
                  <select className="sz-invoer" style={{ flex: 2 }} aria-label="Onderdeel" value={o.product_id} onChange={(e) => zet("onderdelen", f.onderdelen.map((x, j) => (j === i ? { ...x, product_id: Number(e.target.value) } : x)))}>
                    {anderen.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.naam}
                      </option>
                    ))}
                  </select>
                  <input className="sz-invoer" style={{ width: 90 }} type="number" min={1} max={100} aria-label="Aantal" value={o.aantal} onChange={(e) => zet("onderdelen", f.onderdelen.map((x, j) => (j === i ? { ...x, aantal: Math.max(1, Number(e.target.value) || 1) } : x)))} />
                  <button type="button" className="bh-knop bh-knop--gevaar" aria-label="Onderdeel verwijderen" onClick={() => zet("onderdelen", f.onderdelen.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </div>
              ))}
              {anderen.length > 0 && f.onderdelen.length < 10 && (
                <button type="button" className="bh-knop" style={{ marginTop: 6, width: "fit-content" }} onClick={() => zet("onderdelen", [...f.onderdelen, { product_id: anderen.find((p) => !f.onderdelen.some((o) => o.product_id === p.id))?.id ?? anderen[0].id, aantal: 1 }])}>
                  + Onderdeel
                </button>
              )}
            </fieldset>

            <fieldset className="bh-veld" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Staffelkorting en aanbiedingen</legend>
              <small>Staffel: bijv. ‘vanaf 4’ en ‘8,99’ geeft vanaf 4 stuks € 8,99 per stuk, voor álle stuks in de bestelling. Optioneel binnen een periode. De laagste geldige prijs telt; de webshop toont zelf ‘Bestel 4 en bespaar …’.</small>
              {f.aanbiedingen.map((a, i) => (
                <div className="bh-kaart" key={i} style={{ marginTop: 8, padding: 12 }}>
                  <div className="bh-formulier">
                    <div className="bh-veld bh-veld--6">
                      <label>Naam</label>
                      <input className="sz-invoer" value={a.naam} maxLength={60} placeholder="Bijv. Buurtactie" onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, naam: e.target.value } : x)))} />
                    </div>
                    <div className="bh-veld bh-veld--3">
                      <label>Vanaf aantal</label>
                      <input className="sz-invoer" type="number" min={1} value={a.vanaf_aantal} onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, vanaf_aantal: Math.max(1, Number(e.target.value) || 1) } : x)))} />
                    </div>
                    <div className="bh-veld bh-veld--3">
                      <label>Prijs per stuk (€)</label>
                      <input className="sz-invoer" inputMode="decimal" value={a.prijs} onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, prijs: e.target.value } : x)))} />
                    </div>
                    <div className="bh-veld bh-veld--6">
                      <label>Vanaf (optioneel)</label>
                      <input className="sz-invoer" type="datetime-local" value={a.start} onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
                    </div>
                    <div className="bh-veld bh-veld--6">
                      <label>Tot en met (optioneel)</label>
                      <input className="sz-invoer" type="datetime-local" value={a.eind} onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, eind: e.target.value } : x)))} />
                    </div>
                    <div className="bh-veld bh-rij bh-rij--tussen">
                      <label className="bh-schakel">
                        <input type="checkbox" checked={a.actief} onChange={(e) => zet("aanbiedingen", f.aanbiedingen.map((x, j) => (j === i ? { ...x, actief: e.target.checked } : x)))} /> Actief
                      </label>
                      <button type="button" className="bh-knop bh-knop--gevaar" onClick={() => zet("aanbiedingen", f.aanbiedingen.filter((_, j) => j !== i))}>
                        Verwijderen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {f.aanbiedingen.length < 10 && (
                <button type="button" className="bh-knop" style={{ marginTop: 6, width: "fit-content" }} onClick={() => zet("aanbiedingen", [...f.aanbiedingen, { naam: "", vanaf_aantal: 1, prijs: "", start: "", eind: "", actief: true }])}>
                  + Aanbieding
                </button>
              )}
            </fieldset>

            <div className="bh-veld">
              <label htmlFor="pe-notitie">Interne notitie (leverancier, bevestigingen)</label>
              <textarea id="pe-notitie" className="sz-invoer" value={f.notitie} maxLength={1000} onChange={(e) => zet("notitie", e.target.value)} />
            </div>
          </div>
          {fout && (
            <p className="sz-melding sz-melding--fout" role="alert">
              {fout}
            </p>
          )}
          <div className="bh-knoppen" style={{ marginTop: 16 }}>
            <button type="submit" className="bh-knop bh-knop--hoofd" disabled={bezig}>
              {bezig ? "Opslaan…" : "Opslaan"}
            </button>
            <button type="button" className="bh-knop" onClick={sluit}>
              Annuleren
            </button>
            {product && (
              <button type="button" className="bh-knop bh-knop--gevaar" style={{ marginLeft: "auto" }} onClick={() => void verwijder()}>
                Verwijderen
              </button>
            )}
          </div>
        </form>
      </aside>
    </>
  );
}

export default function Producten() {
  const { api, meld } = useBeheer();
  const [lijst, setLijst] = useState<Lijst | null>(null);
  const [bewerk, setBewerk] = useState<BeheerProduct | "nieuw" | null>(null);
  const [nieuweCat, setNieuweCat] = useState("");

  const laad = useCallback(async () => {
    const r = await api<Lijst>("/producten");
    if (r.ok) setLijst(r.data);
    else meld(r.error, true);
  }, [api, meld]);
  useEffect(() => {
    void laad();
  }, [laad]);

  async function snelStatus(p: BeheerProduct, status: BeheerProduct["status"]) {
    const r = await api(`/producten/${p.id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    if (!r.ok) return meld(r.error, true);
    meld(status === "actief" ? "Product staat in de webshop" : "Product is uit de webshop gehaald");
    void laad();
  }

  async function categorie(e: FormEvent) {
    e.preventDefault();
    const r = await api("/categorieen", { method: "POST", body: JSON.stringify({ naam: nieuweCat }) });
    if (!r.ok) return meld(r.error, true);
    setNieuweCat("");
    meld("Categorie toegevoegd");
    void laad();
  }

  if (!lijst) return <p>Laden…</p>;
  return (
    <>
      <div className="bh-rij bh-rij--tussen">
        <div>
          <h1>Producten</h1>
          <p className="bh-sub">Alleen producten met status ‘Actief’ staan in de webshop.</p>
        </div>
        <button type="button" className="bh-knop bh-knop--hoofd" onClick={() => setBewerk("nieuw")}>
          + Nieuw product
        </button>
      </div>
      {lijst.categorieen.map((c) => {
        const inCat = lijst.producten.filter((p) => p.categorie_id === c.id);
        return (
          <section className="bh-kaart" key={c.id}>
            <h2>{c.naam}</h2>
            {inCat.length === 0 ? (
              <p className="bh-sub" style={{ margin: 0 }}>
                Nog geen producten.
              </p>
            ) : (
              inCat.map((p) => <ProductRegel key={p.id} p={p} onBewerk={() => setBewerk(p)} onStatus={(s) => void snelStatus(p, s)} />)
            )}
          </section>
        );
      })}
      {lijst.producten.some((p) => p.categorie_id === null) && (
        <section className="bh-kaart">
          <h2>Zonder categorie</h2>
          {lijst.producten
            .filter((p) => p.categorie_id === null)
            .map((p) => (
              <ProductRegel key={p.id} p={p} onBewerk={() => setBewerk(p)} onStatus={(s) => void snelStatus(p, s)} />
            ))}
        </section>
      )}
      <section className="bh-kaart">
        <h2>Categorie toevoegen</h2>
        <form className="bh-rij" onSubmit={categorie}>
          <label className="sr-only" htmlFor="bh-cat">
            Naam van de categorie
          </label>
          <input id="bh-cat" className="sz-invoer" style={{ maxWidth: 320 }} value={nieuweCat} onChange={(e) => setNieuweCat(e.target.value)} placeholder="Naam" />
          <button type="submit" className="bh-knop" disabled={nieuweCat.trim().length < 2}>
            Toevoegen
          </button>
        </form>
      </section>
      {bewerk && <Editor product={bewerk === "nieuw" ? null : bewerk} lijst={lijst} sluit={() => setBewerk(null)} opgeslagen={() => void laad()} />}
    </>
  );
}

function ProductRegel({ p, onBewerk, onStatus }: { p: BeheerProduct; onBewerk: () => void; onStatus: (s: BeheerProduct["status"]) => void }) {
  const marge = p.prijs_cent !== null && p.berekend.inkoop_cent !== null ? p.prijs_cent - p.berekend.inkoop_cent : null;
  return (
    <div className="bh-productkaart">
      {p.afbeelding ? <img src={p.afbeelding} alt="" /> : <div style={{ width: 72, height: 72, borderRadius: 12, background: "var(--ijs-1)" }} />}
      <div>
        <strong>{p.naam}</strong>{" "}
        <span className={`bh-pil ${p.status === "actief" ? "bh-pil--betaald" : p.status === "concept" || p.status === "binnenkort" ? "bh-pil--let" : "bh-pil--geannuleerd"}`}>{p.status}</span>
        {p.onderdelen.length > 0 && <span className="bh-pil" style={{ marginLeft: 6 }}>pakket</span>}
        <div style={{ fontSize: 14, color: "var(--tekst-2)" }}>
          Verkoop {p.prijs_cent === null ? "–" : euro(p.prijs_cent)} · inkoop {p.berekend.inkoop_cent === null ? "onbekend" : euro(p.berekend.inkoop_cent)}
          {marge !== null && ` · marge ${euro(marge)} incl. btw (${euro(marge - Math.round((marge * 21) / 121))} excl.)`} · voorraad {p.berekend.beschikbaar === null ? "geen limiet" : p.berekend.beschikbaar}
        </div>
        {p.notitie && <div style={{ fontSize: 13.5, color: "var(--oker)" }}>{p.notitie}</div>}
      </div>
      <div className="bh-knoppen" style={{ justifyContent: "flex-end" }}>
        {p.status === "actief" ? (
          <button type="button" className="bh-knop" onClick={() => onStatus("verborgen")}>
            Verbergen
          </button>
        ) : (
          p.status === "verborgen" && (
            <button type="button" className="bh-knop" onClick={() => onStatus("actief")}>
              Activeren
            </button>
          )
        )}
        <button type="button" className="bh-knop bh-knop--hoofd" onClick={onBewerk}>
          Bewerken
        </button>
      </div>
    </div>
  );
}
