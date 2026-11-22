// Strooizout voor de buurt: gedeelde regels voor de Worker (bron van waarheid) en de webshop (alleen weergave).
// Prijzen worden altijd op de server opnieuw berekend; wat de browser stuurt, telt alleen als aantal per product-ID.
// Alle bedragen in centen.

// ---------- Instellingen ----------

export type BezorgMethode = "per_stuk" | "per_kg";
export type BtwModus = "geen" | "inclusief";

export type Instellingen = {
  winkel_open: boolean;
  gesloten_melding: string;
  afhalen_aan: boolean;
  /** Publiek: alleen globaal (wijk, plaats). */
  afhaal_plek: string;
  /** Privé: volledig adres, pas zichtbaar voor de klant na bevestiging. */
  afhaal_adres: string;
  afhaal_instructie: string;
  bezorgen_aan: boolean;
  /** Postcodes (4 cijfers) waar bezorgd wordt, gescheiden door komma's. */
  bezorg_postcodes: string;
  bezorg_methode: BezorgMethode;
  bezorg_per_stuk_cent: number;
  bezorg_per_kg_cent: number;
  bezorg_uitleg: string;
  tikkie_aan: boolean;
  contact_naam: string;
  contact_email: string;
  contact_telefoon: string;
  bevestiging_tekst: string;
  voorwaarden: string;
  btw_modus: BtwModus;
  btw_tarief: number;
  bewaartermijn_maanden: number;
  /** Optioneel: wijknaam per postcodegebied, één per regel: `3992 = Houten-Zuid`. */
  wijken: string;
  /** Bezorgen pas vanaf dit aantal zakken (0 = altijd). */
  bezorg_min_zakken: number;
  /** Datum (JJJJ-MM-DD) waarop de voorraad naar verwachting binnen is; leeg = niet tonen. */
  beschikbaar_vanaf: string;
  /** Verkoper (wettelijk verplichte gegevens in voorwaarden en privacyverklaring). Leeg = nog niet ingevuld. */
  verkoper_naam: string;
  verkoper_adres: string;
  verkoper_kvk: string;
  verkoper_btw: string;
  verkoper_email: string;
};

export const STANDAARD_INSTELLINGEN: Instellingen = {
  winkel_open: true,
  gesloten_melding: "De webshop is even gesloten. Kijk later nog eens, of neem contact op.",
  afhalen_aan: true,
  afhaal_plek: "Houten",
  afhaal_adres: "",
  afhaal_instructie: "",
  bezorgen_aan: true,
  bezorg_postcodes: "3991, 3992, 3993, 3994, 3995",
  bezorg_methode: "per_stuk",
  bezorg_per_stuk_cent: 50,
  bezorg_per_kg_cent: 2,
  bezorg_uitleg:
    "We bezorgen alleen als het veilig kan. Bij gladheid, ijzel of sneeuwval kan de bezorging later worden; we laten het je dan weten.",
  tikkie_aan: true,
  contact_naam: "Denckh",
  contact_email: "info@denckh.nl",
  contact_telefoon: "",
  bevestiging_tekst:
    "Bedankt voor je reservering. We nemen contact met je op zodra de bestelronde is ingekocht en je bestelling klaarligt.",
  voorwaarden: [
    "Verkoper is Denckh. De bedrijfsgegevens staan onderaan deze pagina.",
    "Een bestelling is een reservering. Je betaalt bij het afhalen of bezorgen, of met een betaalverzoek (bijv. Tikkie) dat je van ons krijgt. Je betaalt nooit vooraf via de website.",
    "Een reservering is nog geen levergarantie. Lukt de levering niet (helemaal), dan hoor je dat van ons en betaal je niets voor wat niet geleverd wordt.",
    "Je kunt je reservering kosteloos annuleren zolang de bestelling nog niet is afgehaald of bezorgd: via je bestelpagina of door contact op te nemen.",
    "Bezorgen doen we vanaf 2 zakken, alleen binnen het aangegeven gebied in Houten en alleen als het veilig kan. Bij gladheid kan de bezorging later worden.",
    "Alle prijzen zijn inclusief 21% btw. Bezorgkosten zie je voordat je de reservering plaatst.",
  ].join("\n\n"),
  btw_modus: "inclusief",
  btw_tarief: 21,
  bewaartermijn_maanden: 6,
  wijken: "",
  bezorg_min_zakken: 2,
  beschikbaar_vanaf: "2026-11-26",
  // Zoals gepubliceerd op denckh.nl (footer en /privacy/, gecontroleerd 22-11-2026). Aan te passen in het beheer.
  verkoper_naam: "Denckh",
  verkoper_adres: "Vlierweg 54, Houten",
  verkoper_kvk: "83176896",
  verkoper_btw: "NL003791952B15",
  verkoper_email: "info@denckh.nl",
};

type Veld = { soort: "bool" } | { soort: "tekst"; max: number } | { soort: "getal"; min: number; max: number } | { soort: "keuze"; opties: readonly string[] };

export const INSTELLING_VELDEN: Record<keyof Instellingen, Veld> = {
  winkel_open: { soort: "bool" },
  gesloten_melding: { soort: "tekst", max: 300 },
  afhalen_aan: { soort: "bool" },
  afhaal_plek: { soort: "tekst", max: 80 },
  afhaal_adres: { soort: "tekst", max: 200 },
  afhaal_instructie: { soort: "tekst", max: 500 },
  bezorgen_aan: { soort: "bool" },
  bezorg_postcodes: { soort: "tekst", max: 400 },
  bezorg_methode: { soort: "keuze", opties: ["per_stuk", "per_kg"] },
  bezorg_per_stuk_cent: { soort: "getal", min: 0, max: 2500 },
  bezorg_per_kg_cent: { soort: "getal", min: 0, max: 500 },
  bezorg_uitleg: { soort: "tekst", max: 500 },
  tikkie_aan: { soort: "bool" },
  contact_naam: { soort: "tekst", max: 80 },
  contact_email: { soort: "tekst", max: 120 },
  contact_telefoon: { soort: "tekst", max: 30 },
  bevestiging_tekst: { soort: "tekst", max: 800 },
  voorwaarden: { soort: "tekst", max: 5000 },
  btw_modus: { soort: "keuze", opties: ["geen", "inclusief"] },
  btw_tarief: { soort: "getal", min: 0, max: 30 },
  bewaartermijn_maanden: { soort: "getal", min: 1, max: 24 },
  wijken: { soort: "tekst", max: 2000 },
  bezorg_min_zakken: { soort: "getal", min: 0, max: 50 },
  beschikbaar_vanaf: { soort: "tekst", max: 10 },
  verkoper_naam: { soort: "tekst", max: 80 },
  verkoper_adres: { soort: "tekst", max: 200 },
  verkoper_kvk: { soort: "tekst", max: 20 },
  verkoper_btw: { soort: "tekst", max: 20 },
  verkoper_email: { soort: "tekst", max: 120 },
};

/** Controleert één instelling. Geeft de opgeschoonde waarde of een foutmelding. */
export function controleerInstelling(sleutel: string, waarde: unknown): { ok: true; waarde: unknown } | { ok: false; fout: string } {
  const veld = (INSTELLING_VELDEN as Record<string, Veld | undefined>)[sleutel];
  if (!veld) return { ok: false, fout: `Onbekende instelling: ${sleutel}` };
  if (veld.soort === "bool") return typeof waarde === "boolean" ? { ok: true, waarde } : { ok: false, fout: `${sleutel}: kies aan of uit.` };
  if (veld.soort === "tekst") {
    if (typeof waarde !== "string") return { ok: false, fout: `${sleutel}: tekst verwacht.` };
    const t = waarde.replace(/\r\n/g, "\n").trim();
    if (t.length > veld.max) return { ok: false, fout: `${sleutel}: maximaal ${veld.max} tekens.` };
    if ((sleutel === "contact_email" || sleutel === "verkoper_email") && t && !EMAIL.test(t)) return { ok: false, fout: "Dit is geen geldig e-mailadres." };
    if (sleutel === "beschikbaar_vanaf" && t && (!/^\d{4}-\d{2}-\d{2}$/.test(t) || Number.isNaN(Date.parse(t)))) return { ok: false, fout: "Kies een geldige datum." };
    if (sleutel === "verkoper_kvk" && t && !/^\d{8}$/.test(t)) return { ok: false, fout: "Een KvK-nummer heeft 8 cijfers." };
    if (sleutel === "verkoper_btw" && t && !/^NL\d{9}B\d{2}$/.test(t.replace(/[\s.]/g, "").toUpperCase())) return { ok: false, fout: "Een btw-id ziet eruit als NL123456789B01." };
    if (sleutel === "bezorg_postcodes" && t && parsePostcodes(t).length === 0) return { ok: false, fout: "Geef postcodes op als 4 cijfers, gescheiden door komma's." };
    return { ok: true, waarde: t };
  }
  if (veld.soort === "getal") {
    if (typeof waarde !== "number" || !Number.isInteger(waarde) || waarde < veld.min || waarde > veld.max) {
      return { ok: false, fout: `${sleutel}: kies een geheel getal van ${veld.min} tot en met ${veld.max}.` };
    }
    return { ok: true, waarde };
  }
  return typeof waarde === "string" && veld.opties.includes(waarde) ? { ok: true, waarde } : { ok: false, fout: `${sleutel}: ongeldige keuze.` };
}

export function parsePostcodes(lijst: string): string[] {
  return [...new Set((lijst.match(/\b[1-9][0-9]{3}\b/g) ?? []).map(String))];
}

/** Wijknaam bij een postcode volgens de instelling `wijken` (anders het postcodegebied zelf). */
export function wijkVan(postcode: string, wijken: string): string {
  const pc4 = postcode.slice(0, 4);
  if (!pc4) return "Onbekend";
  for (const regel of wijken.split("\n")) {
    const m = regel.match(/^\s*([1-9][0-9]{3})(?:\s*([A-Za-z]{1,2}))?\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    const letters = (m[2] ?? "").toUpperCase();
    if (m[1] === pc4 && (!letters || postcode.replace(/\s/g, "").slice(4).toUpperCase().startsWith(letters))) return m[3];
  }
  return `Postcode ${pc4}`;
}

// ---------- Producten en prijzen ----------

export type Aanbieding = { id: number; naam: string; vanaf_aantal: number; prijs_cent: number; start: string | null; eind: string | null; actief: boolean };

export type PrijsProduct = {
  id: number;
  naam: string;
  prijs_cent: number;
  /** Inkoop per stuk (bij een pakket: som van de onderdelen, als het pakket zelf geen inkoop heeft); null = onbekend. */
  inkoop_cent: number | null;
  /** Bezorgkosten per stuk; null = standaardtarief. */
  bezorg_cent: number | null;
  gewicht_gram: number;
  aanbiedingen: Aanbieding[];
};

export function aanbiedingGeldig(a: Aanbieding, nu: string): boolean {
  if (!a.actief) return false;
  if (a.start && nu < a.start) return false;
  if (a.eind && nu > a.eind) return false;
  return true;
}

/** Laagste geldige stukprijs bij dit aantal: normale prijs of een aanbieding (eventueel pas vanaf een aantal). */
export function stukprijs(p: PrijsProduct, aantal: number, nu: string): { cent: number; aanbieding: string } {
  let beste = { cent: p.prijs_cent, aanbieding: "" };
  for (const a of p.aanbiedingen) {
    if (!aanbiedingGeldig(a, nu) || aantal < a.vanaf_aantal) continue;
    if (a.prijs_cent < beste.cent) beste = { cent: a.prijs_cent, aanbieding: a.naam };
  }
  return beste;
}

export type Levering = "ophalen" | "bezorgen";

export type BerekendeRegel = {
  product_id: number;
  naam: string;
  aantal: number;
  stukprijs_cent: number;
  normaalprijs_cent: number;
  aanbieding: string;
  regel_cent: number;
  inkoop_cent: number | null;
  bezorg_cent: number;
  gewicht_gram: number;
};

export type Berekening = {
  regels: BerekendeRegel[];
  subtotaal_cent: number;
  korting_cent: number;
  bezorg_cent: number;
  totaal_cent: number;
  /** Som van de bekende inkoopprijzen. */
  inkoop_cent: number;
  inkoop_onbekend: boolean;
  gewicht_gram: number;
  aantal_stuks: number;
};

/** Berekent een bestelling. `regels` bevat alleen product en aantal; alles daarna komt uit de productgegevens. */
export function bereken(
  regels: { product: PrijsProduct; aantal: number }[],
  levering: Levering,
  inst: Pick<Instellingen, "bezorg_methode" | "bezorg_per_stuk_cent" | "bezorg_per_kg_cent">,
  nu: string,
): Berekening {
  const uit: BerekendeRegel[] = [];
  for (const { product: p, aantal } of regels) {
    const prijs = stukprijs(p, aantal, nu);
    const bezorgStuk = levering === "bezorgen" && inst.bezorg_methode === "per_stuk" ? (p.bezorg_cent ?? inst.bezorg_per_stuk_cent) : 0;
    uit.push({
      product_id: p.id,
      naam: p.naam,
      aantal,
      stukprijs_cent: prijs.cent,
      normaalprijs_cent: p.prijs_cent,
      aanbieding: prijs.aanbieding,
      regel_cent: prijs.cent * aantal,
      inkoop_cent: p.inkoop_cent,
      bezorg_cent: bezorgStuk,
      gewicht_gram: p.gewicht_gram,
    });
  }
  const gewicht = uit.reduce((s, r) => s + r.gewicht_gram * r.aantal, 0);
  const subtotaal = uit.reduce((s, r) => s + r.regel_cent, 0);
  const normaal = uit.reduce((s, r) => s + r.normaalprijs_cent * r.aantal, 0);
  let bezorg = 0;
  if (levering === "bezorgen") {
    bezorg = inst.bezorg_methode === "per_stuk" ? uit.reduce((s, r) => s + r.bezorg_cent * r.aantal, 0) : Math.ceil(gewicht / 1000) * inst.bezorg_per_kg_cent;
  }
  return {
    regels: uit,
    subtotaal_cent: subtotaal,
    korting_cent: Math.max(0, normaal - subtotaal),
    bezorg_cent: bezorg,
    totaal_cent: subtotaal + bezorg,
    inkoop_cent: uit.reduce((s, r) => s + (r.inkoop_cent ?? 0) * r.aantal, 0),
    inkoop_onbekend: uit.some((r) => r.inkoop_cent === null),
    gewicht_gram: gewicht,
    aantal_stuks: uit.reduce((s, r) => s + r.aantal, 0),
  };
}

/** Btw-deel van een bedrag inclusief btw (afgerond op centen). */
export function btwDeel(inclCent: number, tarief: number): number {
  return Math.round((inclCent * tarief) / (100 + tarief));
}

// ---------- Opmaak ----------

export function euro(cent: number): string {
  const neg = cent < 0;
  const abs = Math.abs(Math.round(cent));
  const tekst = `€ ${Math.floor(abs / 100).toLocaleString("nl-NL")},${String(abs % 100).padStart(2, "0")}`;
  return neg ? `− ${tekst}` : tekst;
}

/** "8,99" of "8.99" of "8" → 899. Ongeldig → null. */
export function parseEuro(invoer: string): number | null {
  const t = invoer.trim().replace(/^€\s*/, "").replace(/\s/g, "");
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(t)) return null;
  const [heel, deel = ""] = t.split(/[.,]/);
  return Number(heel) * 100 + Number(deel.padEnd(2, "0"));
}

export function gewichtTekst(gram: number): string {
  if (gram >= 1000) return `${(gram / 1000).toLocaleString("nl-NL", { maximumFractionDigits: 1 })} kg`;
  return `${gram} g`;
}

export function bestelnummer(id: number): string {
  return `SZ-${String(id).padStart(4, "0")}`;
}

// ---------- Statussen ----------

export const BESTEL_STATUS = {
  nieuw: "Reservering ontvangen",
  bevestigd: "Bevestigd",
  klaar: "Klaar voor afhalen of bezorgen",
  afgehaald: "Afgehaald",
  bezorgd: "Bezorgd",
  geannuleerd: "Geannuleerd",
} as const;
export type BestelStatus = keyof typeof BESTEL_STATUS;

/** Toegestane statuswissels in het beheer. */
export const STATUS_OVERGANG: Record<BestelStatus, BestelStatus[]> = {
  nieuw: ["bevestigd", "klaar", "afgehaald", "bezorgd", "geannuleerd"],
  bevestigd: ["nieuw", "klaar", "afgehaald", "bezorgd", "geannuleerd"],
  klaar: ["bevestigd", "afgehaald", "bezorgd", "geannuleerd"],
  afgehaald: ["klaar"],
  bezorgd: ["klaar"],
  geannuleerd: [],
};

export const RONDE_STATUS = {
  open: "Open voor bestellingen",
  gesloten: "Gesloten, bestellingen verzameld",
  ingekocht: "Ingekocht bij leverancier",
  geleverd: "Geleverd, uitlevering loopt",
  afgerond: "Afgerond",
} as const;
export type RondeStatus = keyof typeof RONDE_STATUS;

export const BETAALWIJZE = { bij_ontvangst: "Betalen bij afhalen of bezorgen", tikkie: "Betalen via Tikkie" } as const;
export type Betaalwijze = keyof typeof BETAALWIJZE;

export const BETAAL_STATUS = { open: "Openstaand", verzoek: "Betaalverzoek verstuurd", betaald: "Betaald", terugbetaald: "Terugbetaald" } as const;
export type BetaalStatus = keyof typeof BETAAL_STATUS;

/**
 * Betaalstatus, uitsluitend afgeleid uit handmatig geregistreerde betalingen (nooit automatisch ‘betaald’).
 * `betaald_cent` = netto (ontvangen min terugbetaald), `ontvangen_cent` = alleen ontvangen bedragen.
 */
export function betaalstatus(b: { totaal_cent: number; betaald_cent: number; ontvangen_cent?: number; betaalverzoek_op?: string | null }): BetaalStatus {
  const ontvangen = b.ontvangen_cent ?? Math.max(0, b.betaald_cent);
  if (ontvangen > 0 && b.betaald_cent <= 0) return "terugbetaald";
  if (b.totaal_cent <= 0 || b.betaald_cent >= b.totaal_cent) return "betaald";
  return b.betaalverzoek_op ? "verzoek" : "open";
}

// ---------- Afhaalcode ----------

/** Korte afhaalcode zoals H-4827 (willekeurig; uniciteit bewaakt de database). */
export function maakAfhaalcode(cijfers = 4): string {
  const min = 10 ** (cijfers - 1);
  const r = new Uint32Array(1);
  crypto.getRandomValues(r);
  return `H-${min + (r[0] % (9 * min))}`;
}

/** "4827", "h4827", "H 4827" → "H-4827". Anders null. */
export function normaliseerAfhaalcode(v: string): string | null {
  const m = v.trim().toUpperCase().replace(/\s/g, "").match(/^H?-?(\d{4,5})$/);
  return m ? `H-${m[1]}` : null;
}

// ---------- Klantgegevens ----------

export const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const GRENZEN = { minInvultijdMs: 2500, maxRegels: 12, maxStuksPerBestelling: 200 };

/** Aantal zakken in een bestelling (voor ‘bezorgen vanaf 2 zakken’). */
export function zakkenIn(regels: { aantal: number; zakken_per_stuk: number }[]): number {
  return regels.reduce((s, r) => s + r.aantal * r.zakken_per_stuk, 0);
}

export type Klantgegevens = {
  naam: string;
  email: string;
  telefoon: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  plaats: string;
  opmerking: string;
};

const s = (v: unknown) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim() : "");

export function normaliseerPostcode(v: string): string | null {
  const m = v.replace(/\s/g, "").toUpperCase().match(/^([1-9][0-9]{3})([A-Z]{2})$/);
  if (!m || ["SA", "SD", "SS"].includes(m[2])) return null;
  return `${m[1]} ${m[2]}`;
}

/**
 * Nederlands mobiel nummer: 06…, +31 6…, 0031 6… of +31 (0)6…, met of zonder spaties/streepjes.
 * Geeft 06xxxxxxxx terug, of null als het geen Nederlands mobiel nummer is.
 */
export function normaliseerMobiel(v: string): string | null {
  const t = v.replace(/\(0\)/g, "").replace(/[\s\-().\/]/g, "");
  const m = t.match(/^(?:06|\+316|00316|316)(\d{8})$/);
  return m ? `06${m[1]}` : null;
}

/** 0612345678 → "06 1234 5678". */
export function mobielTekst(nr: string): string {
  return /^06\d{8}$/.test(nr) ? `${nr.slice(0, 2)} ${nr.slice(2, 6)} ${nr.slice(6)}` : nr;
}

/** Valideert de klantgegevens. Mobiel nummer verplicht, e-mail optioneel; bij bezorgen ook adres en bezorggebied. */
export function controleerKlant(
  invoer: Record<string, unknown>,
  levering: Levering,
  bezorgPostcodes: string,
): { ok: true; waarde: Klantgegevens } | { ok: false; fouten: Partial<Record<keyof Klantgegevens, string>> } {
  const fouten: Partial<Record<keyof Klantgegevens, string>> = {};
  const naam = s(invoer.naam);
  const email = s(invoer.email).toLowerCase();
  const telefoonRuw = s(invoer.telefoon);
  const opmerking = s(invoer.opmerking);
  if (naam.length < 2) fouten.naam = "Vul je naam in.";
  else if (naam.length > 80) fouten.naam = "Je naam mag maximaal 80 tekens zijn.";
  if (email && (!EMAIL.test(email) || email.length > 120)) fouten.email = "Dit e-mailadres klopt niet. Je mag het ook leeg laten.";
  const telefoon = normaliseerMobiel(telefoonRuw);
  if (!telefoonRuw) fouten.telefoon = "Vul je mobiele nummer in.";
  else if (!telefoon) fouten.telefoon = "Vul een Nederlands mobiel nummer in, bijvoorbeeld 06 1234 5678 of +31 6 1234 5678.";
  if (opmerking.length > 300) fouten.opmerking = "Een opmerking mag maximaal 300 tekens zijn.";

  let straat = "";
  let huisnummer = "";
  let postcode = "";
  let plaats = "";
  if (levering === "bezorgen") {
    straat = s(invoer.straat);
    huisnummer = s(invoer.huisnummer);
    plaats = s(invoer.plaats) || "Houten";
    const pc = normaliseerPostcode(s(invoer.postcode));
    if (straat.length < 2 || straat.length > 80) fouten.straat = "Vul je straat in.";
    if (!/^[0-9]{1,5}(\s?[A-Za-z0-9-]{1,6})?$/.test(huisnummer)) fouten.huisnummer = "Vul een huisnummer in, bijvoorbeeld 12 of 12a.";
    if (plaats.length > 60) fouten.plaats = "Plaatsnaam is te lang.";
    if (!pc) fouten.postcode = "Vul een geldige postcode in, bijvoorbeeld 3991 AB.";
    else if (!binnenBezorggebied(pc, bezorgPostcodes)) fouten.postcode = "Op dit adres bezorgen we helaas niet. Je kunt je bestelling wel gratis ophalen.";
    else postcode = pc;
  }
  if (Object.keys(fouten).length) return { ok: false, fouten };
  return { ok: true, waarde: { naam, email, telefoon: telefoon!, straat, huisnummer, postcode, plaats, opmerking } };
}

/** Ligt deze postcode (bijv. "3992 AB") in het ingestelde bezorggebied (lijst van 4-cijferige postcodes)? */
export function binnenBezorggebied(postcode: string, bezorgPostcodes: string): boolean {
  const pc = normaliseerPostcode(postcode);
  return !!pc && parsePostcodes(bezorgPostcodes).includes(pc.slice(0, 4));
}

// ---------- Staffelkorting ----------

/**
 * Eerstvolgende staffel die bij dit aantal nog niet geldt, met de besparing als de klant tot die grens bestelt.
 * Voorbeeld: 3 zakken, staffel vanaf 4 à € 8,49 (normaal € 8,99) → { vanaf: 4, prijs_cent: 849, besparing_cent: 200 }.
 */
export function volgendeStaffel(p: Pick<PrijsProduct, "prijs_cent" | "aanbiedingen">, aantal: number, nu: string): { naam: string; vanaf: number; prijs_cent: number; besparing_cent: number } | null {
  const huidig = stukprijs({ ...p, id: 0, naam: "", inkoop_cent: null, bezorg_cent: null, gewicht_gram: 0 }, aantal, nu).cent;
  const kandidaten = p.aanbiedingen
    .filter((a) => aanbiedingGeldig(a, nu) && a.vanaf_aantal > aantal && a.prijs_cent < huidig)
    .sort((a, b) => a.vanaf_aantal - b.vanaf_aantal);
  const a = kandidaten[0];
  if (!a) return null;
  return { naam: a.naam, vanaf: a.vanaf_aantal, prijs_cent: a.prijs_cent, besparing_cent: a.vanaf_aantal * (p.prijs_cent - a.prijs_cent) };
}

// ---------- Publieke catalogus (zoals de webshop hem ontvangt) ----------

export type PubliekProduct = {
  id: number;
  slug: string;
  naam: string;
  categorie: string;
  kort: string;
  beschrijving: string;
  specificaties: { label: string; waarde: string }[];
  prijs_cent: number;
  bezorg_cent: number | null;
  gewicht_gram: number;
  eenheid: string;
  /** Beschikbaar om te reserveren; null = geen voorraadgrens. */
  voorraad: number | null;
  /** Ligt er nu werkelijk voorraad (ontvangen en nog niet uitgegeven)? null = geen voorraadbeheer. */
  op_voorraad: boolean | null;
  /** Aantal zakken per stuk (1 voor een zak, n voor een pakket met n zakken, 0 voor iets anders). */
  zakken_per_stuk: number;
  max_per_bestelling: number;
  afbeelding: string;
  afbeelding_alt: string;
  pakket: { naam: string; aantal: number }[];
  aanbiedingen: Aanbieding[];
};

export type PubliekMoment = { id: number; soort: Levering; datum: string; van: string; tot: string; omschrijving: string; vol: boolean };

export type Winkel = {
  open: boolean;
  melding: string;
  ronde: { id: number; naam: string; sluit_op: string | null } | null;
  producten: PubliekProduct[];
  categorieen: { slug: string; naam: string }[];
  momenten: PubliekMoment[];
  instellingen: Pick<
    Instellingen,
    | "afhalen_aan"
    | "afhaal_plek"
    | "bezorgen_aan"
    | "bezorg_postcodes"
    | "bezorg_methode"
    | "bezorg_per_stuk_cent"
    | "bezorg_per_kg_cent"
    | "bezorg_uitleg"
    | "tikkie_aan"
    | "contact_naam"
    | "contact_email"
    | "contact_telefoon"
    | "voorwaarden"
    | "btw_modus"
    | "btw_tarief"
    | "bewaartermijn_maanden"
    | "bezorg_min_zakken"
    | "beschikbaar_vanaf"
    | "verkoper_naam"
    | "verkoper_adres"
    | "verkoper_kvk"
    | "verkoper_btw"
    | "verkoper_email"
  >;
  nu: string;
};

export function alsPrijsProduct(p: PubliekProduct): PrijsProduct {
  return { id: p.id, naam: p.naam, prijs_cent: p.prijs_cent, inkoop_cent: 0, bezorg_cent: p.bezorg_cent, gewicht_gram: p.gewicht_gram, aanbiedingen: p.aanbiedingen };
}

/** Datum/tijd in Nederlandse tijd, bijvoorbeeld "vrijdag 4 december, 20:00". */
export function datumTijd(iso: string, opties: { jaar?: boolean; tijd?: boolean } = {}): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const datum = d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: opties.jaar ? "numeric" : undefined, timeZone: "Europe/Amsterdam" });
  if (opties.tijd === false) return datum;
  return `${datum}, ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })}`;
}

/** "2026-12-05" → "zaterdag 5 december". */
export function dagTekst(datum: string): string {
  const d = new Date(`${datum}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return datum;
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}
