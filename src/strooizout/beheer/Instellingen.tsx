// Instellingen: webshop open/dicht, afhalen, bezorgen, tarieven, contact, teksten, voorwaarden, btw en bewaartermijn.

import { useEffect, useState, type FormEvent } from "react";
import { binnenBezorggebied, euro, normaliseerPostcode, parseEuro, parseBezorggebied, type Instellingen as Inst } from "../../../shared/strooizout";
import { useBeheer } from "./basis";

export default function Instellingen() {
  const { api, meld } = useBeheer();
  const [v, setV] = useState<Inst | null>(null);
  const [apart, setApart] = useState(false);
  const [tarief, setTarief] = useState({ stuk: "", kg: "", adres: "" });
  const [bezig, setBezig] = useState(false);
  const [proef, setProef] = useState("");
  useEffect(() => {
    void api<{ instellingen: Inst; apart_token: boolean }>("/instellingen").then((r) => {
      if (!r.ok) return meld(r.error, true);
      setV(r.data.instellingen);
      setApart(r.data.apart_token);
      const t = (c: number) => (c / 100).toFixed(2).replace(".", ",");
      setTarief({ stuk: t(r.data.instellingen.bezorg_per_stuk_cent), kg: t(r.data.instellingen.bezorg_per_kg_cent), adres: t(r.data.instellingen.bezorg_per_adres_cent) });
    });
  }, [api, meld]);
  if (!v) return <p>Laden…</p>;

  const zet = <K extends keyof Inst>(k: K, w: Inst[K]) => setV((x) => (x ? { ...x, [k]: w } : x));
  const tekst = (k: keyof Inst) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => zet(k, e.target.value as never);

  async function bewaar(e: FormEvent) {
    e.preventDefault();
    if (!v) return;
    const stuk = parseEuro(tarief.stuk);
    const perKg = parseEuro(tarief.kg);
    const perAdres = parseEuro(tarief.adres);
    if (stuk === null || perKg === null || perAdres === null) return meld("Controleer de bezorgtarieven (bijv. 2,00).", true);
    setBezig(true);
    const r = await api<{ instellingen: Inst }>("/instellingen", { method: "PUT", body: JSON.stringify({ ...v, bezorg_per_stuk_cent: stuk, bezorg_per_kg_cent: perKg, bezorg_per_adres_cent: perAdres }) });
    setBezig(false);
    if (!r.ok) return meld(r.error, true);
    setV(r.data.instellingen);
    meld("Instellingen opgeslagen");
  }

  async function opschonen() {
    if (!window.confirm("Persoonsgegevens wissen van alle afgeronde bestellingen die ouder zijn dan de bewaartermijn? Dit is niet terug te draaien.")) return;
    const r = await api<{ gewist: number }>("/opschonen", { method: "POST" });
    if (!r.ok) return meld(r.error, true);
    meld(`${r.data.gewist} ${r.data.gewist === 1 ? "bestelling" : "bestellingen"} opgeschoond`);
  }

  const gebied = parseBezorggebied(v.bezorg_postcodes);
  return (
    <form onSubmit={bewaar}>
      <div className="bh-rij bh-rij--tussen">
        <div>
          <h1>Instellingen</h1>
          <p className="bh-sub">Wijzigingen zijn direct zichtbaar in de webshop na opslaan.</p>
        </div>
        <button type="submit" className="bh-knop bh-knop--hoofd" disabled={bezig}>
          {bezig ? "Opslaan…" : "Opslaan"}
        </button>
      </div>

      <section className="bh-kaart">
        <h2>Webshop</h2>
        <label className="bh-schakel">
          <input type="checkbox" checked={v.winkel_open} onChange={(e) => zet("winkel_open", e.target.checked)} /> Webshop open (uitzetten = tijdelijk sluiten)
        </label>
        <div className="bh-veld" style={{ marginTop: 8, maxWidth: 260 }}>
          <label htmlFor="in-vanaf">Op voorraad vanaf (datum)</label>
          <input id="in-vanaf" className="sz-invoer" type="date" value={v.beschikbaar_vanaf} onChange={tekst("beschikbaar_vanaf")} />
          <small>Wordt getoond zolang er nog niets ontvangen is (Voorraad). Leeg = niet tonen.</small>
        </div>
        <div className="bh-veld" style={{ marginTop: 8, maxWidth: 520 }}>
          <label htmlFor="in-google">Google-verificatiecode (Search Console of Merchant Center)</label>
          <input id="in-google" className="sz-invoer" value={v.google_verificatie} maxLength={120} spellCheck={false} onChange={tekst("google_verificatie")} placeholder="bijv. AbC123…" />
          <small>Alleen de code uit de meta-tag (content="…"). Wordt op strooizouthouten.nl in de pagina gezet; daarna in Google op ‘Verifiëren’ klikken.</small>
        </div>
        <div className="bh-veld" style={{ marginTop: 8, maxWidth: 260 }}>
          <label htmlFor="in-laag">Waarschuwing bij lage voorraad</label>
          <input id="in-laag" className="sz-invoer" style={{ maxWidth: 120 }} type="number" min={0} max={1000} value={v.lage_voorraad} onChange={(e) => zet("lage_voorraad", Math.max(0, Math.min(1000, Number(e.target.value) || 0)))} />
          <small>Het overzicht waarschuwt als er nog zoveel of minder te bestellen is.</small>
        </div>
        <div className="bh-veld" style={{ marginTop: 8 }}>
          <label htmlFor="in-gesloten">Melding als de webshop gesloten is</label>
          <input id="in-gesloten" className="sz-invoer" value={v.gesloten_melding} maxLength={300} onChange={tekst("gesloten_melding")} />
        </div>
      </section>

      <div className="bh-twee">
        <section className="bh-kaart">
          <h2>Ophalen</h2>
          <label className="bh-schakel">
            <input type="checkbox" checked={v.afhalen_aan} onChange={(e) => zet("afhalen_aan", e.target.checked)} /> Ophalen mogelijk (gratis)
          </label>
          <div className="bh-formulier" style={{ marginTop: 8 }}>
            <div className="bh-veld">
              <label htmlFor="in-plek">Plek (als er geen adres is ingevuld)</label>
              <input id="in-plek" className="sz-invoer" value={v.afhaal_plek} maxLength={80} onChange={tekst("afhaal_plek")} />
              <small>Globaal, bijv. ‘Houten-Zuid’. Wordt getoond zolang het afhaaladres hieronder leeg is.</small>
            </div>
            <div className="bh-veld">
              <label htmlFor="in-adres">Afhaaladres (openbaar)</label>
              <input id="in-adres" className="sz-invoer" value={v.afhaal_adres} maxLength={200} onChange={tekst("afhaal_adres")} />
              <small>Staat bij het bestellen, op de bestelpagina van de klant en in de bevestigingsmail, met je telefoonnummer om af te spreken. Ook startpunt van de bezorgroute. Leeg laten = adres pas delen na bevestiging.</small>
            </div>
            <div className="bh-veld">
              <label htmlFor="in-instr">Ophaalinstructie (na bevestiging)</label>
              <textarea id="in-instr" className="sz-invoer" value={v.afhaal_instructie} maxLength={500} onChange={tekst("afhaal_instructie")} placeholder="Bijv. aanbellen bij de zijdeur; zakken staan in de garage." />
            </div>
          </div>
        </section>

        <section className="bh-kaart">
          <h2>Bezorgen</h2>
          <label className="bh-schakel">
            <input type="checkbox" checked={v.bezorgen_aan} onChange={(e) => zet("bezorgen_aan", e.target.checked)} /> Bezorgen mogelijk
          </label>
          <div className="bh-formulier" style={{ marginTop: 8 }}>
            <div className="bh-veld">
              <label htmlFor="in-pc">Bezorggebied (postcodes)</label>
              <textarea id="in-pc" className="sz-invoer" rows={5} value={v.bezorg_postcodes} maxLength={3000} onChange={tekst("bezorg_postcodes")} spellCheck={false} />
              <small>
                Hele gebieden als 4 cijfers (3991), losse postcodes als 3991 AB. Uitsluiten op een regel die begint met <code>niet:</code>, bijvoorbeeld <code>niet: 3991 CD CE</code>.{" "}
                {gebied.pc4.length || gebied.pc6.length
                  ? `Herkend: ${gebied.pc4.length ? `gebieden ${gebied.pc4.join(", ")}` : ""}${gebied.pc4.length && gebied.pc6.length ? " en " : ""}${gebied.pc6.length ? `${gebied.pc6.length} losse postcodes` : ""}${gebied.niet.length ? `, behalve ${gebied.niet.length} uitgesloten postcodes` : ""}.`
                  : "Nog geen geldige postcodes."}
              </small>
            </div>
            <div className="bh-veld">
              <label htmlFor="in-proef">Postcode controleren</label>
              <input id="in-proef" className="sz-invoer" value={proef} maxLength={7} placeholder="3992 AB" onChange={(e) => setProef(e.target.value)} />
              <small aria-live="polite">
                {!proef.trim()
                  ? "Typ een postcode om te zien of daar bezorgd wordt (met de instelling hierboven, ook vóór opslaan)."
                  : !normaliseerPostcode(proef)
                    ? "Geen geldige postcode."
                    : binnenBezorggebied(proef, v.bezorg_postcodes)
                      ? `${normaliseerPostcode(proef)}: binnen het bezorggebied.`
                      : `${normaliseerPostcode(proef)}: buiten het bezorggebied.`}
              </small>
            </div>
            <fieldset className="bh-veld" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend>Tarief</legend>
              <label className="bh-schakel">
                <input type="radio" name="methode" checked={v.bezorg_methode === "per_adres"} onChange={() => zet("bezorg_methode", "per_adres")} /> Vast bedrag per bezorging (per adres)
              </label>
              <label className="bh-schakel">
                <input type="radio" name="methode" checked={v.bezorg_methode === "per_stuk"} onChange={() => zet("bezorg_methode", "per_stuk")} /> Per stuk (standaard, per product aan te passen)
              </label>
              <label className="bh-schakel">
                <input type="radio" name="methode" checked={v.bezorg_methode === "per_kg"} onChange={() => zet("bezorg_methode", "per_kg")} /> Per kilogram (afgerond naar boven)
              </label>
            </fieldset>
            <div className="bh-veld">
              <label htmlFor="in-min">Bezorgen vanaf (aantal zakken)</label>
              <input id="in-min" className="sz-invoer" style={{ maxWidth: 120 }} type="number" min={0} max={50} value={v.bezorg_min_zakken} onChange={(e) => zet("bezorg_min_zakken", Math.max(0, Math.min(50, Number(e.target.value) || 0)))} />
              <small>0 = altijd bezorgen mogelijk.</small>
            </div>
            <div className="bh-veld">
              <label htmlFor="in-gratis">Gratis bezorgen vanaf (aantal zakken)</label>
              <input id="in-gratis" className="sz-invoer" style={{ maxWidth: 120 }} type="number" min={0} max={500} value={v.bezorg_gratis_vanaf} onChange={(e) => zet("bezorg_gratis_vanaf", Math.max(0, Math.min(500, Number(e.target.value) || 0)))} />
              <small>0 = nooit gratis.</small>
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-adres">Per bezorging (€)</label>
              <input id="in-adres" className="sz-invoer" inputMode="decimal" value={tarief.adres} onChange={(e) => setTarief((t) => ({ ...t, adres: e.target.value }))} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-stuk">Standaard per stuk (€)</label>
              <input id="in-stuk" className="sz-invoer" inputMode="decimal" value={tarief.stuk} onChange={(e) => setTarief((t) => ({ ...t, stuk: e.target.value }))} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-kg">Per kg (€)</label>
              <input id="in-kg" className="sz-invoer" inputMode="decimal" value={tarief.kg} onChange={(e) => setTarief((t) => ({ ...t, kg: e.target.value }))} />
            </div>
            <div className="bh-veld">
              <label htmlFor="in-buitleg">Uitleg bij bezorgen</label>
              <textarea id="in-buitleg" className="sz-invoer" value={v.bezorg_uitleg} maxLength={500} onChange={tekst("bezorg_uitleg")} />
            </div>
            <div className="bh-veld">
              <label htmlFor="in-wijken">Wijknamen voor de route (optioneel)</label>
              <textarea id="in-wijken" className="sz-invoer" value={v.wijken} maxLength={2000} onChange={tekst("wijken")} placeholder={"3992 = Houten-Zuid\n3995 AB = De Gaarden"} />
              <small>Eén per regel: postcode (eventueel met letters) = naam. Zonder naam groepeert de route per postcodegebied.</small>
            </div>
          </div>
        </section>
      </div>

      <div className="bh-twee">
        <section className="bh-kaart">
          <h2>Betalen</h2>
          <label className="bh-schakel">
            <input type="checkbox" checked={v.tikkie_aan} onChange={(e) => zet("tikkie_aan", e.target.checked)} /> Klant kan ‘betaalverzoek vooraf’ kiezen
          </label>
          <p className="bh-sub" style={{ marginTop: 8 }}>
            Klanten betalen altijd met een betaalverzoek: ter plekke bij afhalen of bezorgen, of vooraf als dat hierboven aan staat. Het betaalverzoek (Tikkie) stuur je zelf; registreer de betaling daarna bij de bestelling. Er is geen online betaalprovider gekoppeld.
          </p>
          <h3>Btw</h3>
          <label className="bh-schakel">
            <input type="radio" name="btw" checked={v.btw_modus === "geen"} onChange={() => zet("btw_modus", "geen")} /> Geen btw vermelden (alleen bij KOR of particuliere verkoop)
          </label>
          <label className="bh-schakel">
            <input type="radio" name="btw" checked={v.btw_modus === "inclusief"} onChange={() => zet("btw_modus", "inclusief")} /> Prijzen zijn inclusief btw
          </label>
          {v.btw_modus === "inclusief" && (
            <div className="bh-veld" style={{ maxWidth: 200 }}>
              <label htmlFor="in-btw">Btw-tarief (%)</label>
              <input id="in-btw" className="sz-invoer" type="number" min={0} max={30} value={v.btw_tarief} onChange={(e) => zet("btw_tarief", Math.max(0, Math.min(30, Number(e.target.value) || 0)))} />
            </div>
          )}
          <p className="bh-sub" style={{ marginTop: 8 }}>
            Laat je boekhouder of de Belastingdienst bevestigen wat voor jou geldt.
          </p>
        </section>

        <section className="bh-kaart">
          <h2>Verkoper (in voorwaarden, privacy en voet)</h2>
          <div className="bh-formulier">
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-vnaam">Naam</label>
              <input id="in-vnaam" className="sz-invoer" value={v.verkoper_naam} maxLength={80} onChange={tekst("verkoper_naam")} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-vadres">Adres</label>
              <input id="in-vadres" className="sz-invoer" value={v.verkoper_adres} maxLength={200} onChange={tekst("verkoper_adres")} />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="in-vkvk">KvK-nummer</label>
              <input id="in-vkvk" className="sz-invoer" inputMode="numeric" value={v.verkoper_kvk} maxLength={8} onChange={tekst("verkoper_kvk")} />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="in-vbtw">Btw-id</label>
              <input id="in-vbtw" className="sz-invoer" value={v.verkoper_btw} maxLength={20} onChange={tekst("verkoper_btw")} />
            </div>
            <div className="bh-veld bh-veld--4">
              <label htmlFor="in-vmail">E-mail</label>
              <input id="in-vmail" className="sz-invoer" type="email" value={v.verkoper_email} maxLength={120} onChange={tekst("verkoper_email")} />
            </div>
          </div>
        </section>

        <section className="bh-kaart">
          <h2>Contact</h2>
          <div className="bh-formulier">
            <div className="bh-veld">
              <label htmlFor="in-cnaam">Naam</label>
              <input id="in-cnaam" className="sz-invoer" value={v.contact_naam} maxLength={80} onChange={tekst("contact_naam")} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-cmail">E-mailadres</label>
              <input id="in-cmail" className="sz-invoer" type="email" value={v.contact_email} maxLength={120} onChange={tekst("contact_email")} />
            </div>
            <div className="bh-veld bh-veld--6">
              <label htmlFor="in-ctel">Telefoon</label>
              <input id="in-ctel" className="sz-invoer" type="tel" value={v.contact_telefoon} maxLength={30} onChange={tekst("contact_telefoon")} />
            </div>
          </div>
          <p className="bh-sub" style={{ marginTop: 8 }}>
            Deze gegevens zijn publiek zichtbaar in de webshop.
          </p>
        </section>
      </div>

      <section className="bh-kaart">
        <h2>Teksten</h2>
        <div className="bh-formulier">
          <div className="bh-veld">
            <label htmlFor="in-bev">Bevestigingstekst na bestellen</label>
            <textarea id="in-bev" className="sz-invoer" value={v.bevestiging_tekst} maxLength={800} onChange={tekst("bevestiging_tekst")} />
          </div>
          <div className="bh-veld">
            <label htmlFor="in-vw">Algemene bestelvoorwaarden</label>
            <textarea id="in-vw" className="sz-invoer" style={{ minHeight: 220 }} value={v.voorwaarden} maxLength={5000} onChange={tekst("voorwaarden")} />
            <small>Witregels blijven behouden. Laat de tekst bij twijfel juridisch nakijken.</small>
          </div>
        </div>
      </section>

      <section className="bh-kaart">
        <h2>Privacy en toegang</h2>
        <div className="bh-veld" style={{ maxWidth: 260 }}>
          <label htmlFor="in-bewaar">Bewaartermijn persoonsgegevens (maanden)</label>
          <input id="in-bewaar" className="sz-invoer" type="number" min={1} max={24} value={v.bewaartermijn_maanden} onChange={(e) => zet("bewaartermijn_maanden", Math.max(1, Math.min(24, Number(e.target.value) || 6)))} />
        </div>
        <p className="bh-sub" style={{ marginTop: 8 }}>
          Na afronding (afgehaald, bezorgd of geannuleerd) worden naam, contactgegevens, adres en opmerkingen na deze termijn automatisch gewist bij het openen van het overzicht. Bedragen blijven bewaard.
        </p>
        <button type="button" className="bh-knop" onClick={() => void opschonen()}>
          Nu opschonen
        </button>
        <p className="bh-sub" style={{ marginTop: 12 }}>
          Toegang: {apart ? "eigen beheertoken voor Strooizout (STROOIZOUT_TOKEN) is ingesteld." : "dit beheer gebruikt het algemene beheertoken van de site. Een apart token kan via het Worker-secret STROOIZOUT_TOKEN."}
        </p>
      </section>
      <p className="bh-sub">
        Huidig bezorgtarief:{" "}
        {v.bezorg_methode === "per_adres" ? `${euro(v.bezorg_per_adres_cent)} per bezorging` : v.bezorg_methode === "per_stuk" ? `${euro(v.bezorg_per_stuk_cent)} per stuk` : `${euro(v.bezorg_per_kg_cent)} per kg`}.
      </p>
    </form>
  );
}
