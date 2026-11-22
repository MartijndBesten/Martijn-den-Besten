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
  contact_naam: "Martijn",
  contact_email: "",
  contact_telefoon: "",
  bevestiging_tekst:
    "Bedankt voor je reservering. We nemen contact met je op zodra de bestelronde is ingekocht en je bestelling klaarligt.",
  voorwaarden: [
    "Een bestelling is een reservering. Je betaalt pas bij het afhalen of bezorgen, of via een Tikkie die je van ons krijgt.",
    "Een reservering is nog geen levergarantie. We kopen gezamenlijk in per bestelronde; lukt de inkoop niet (helemaal), dan hoor je dat van ons en betaal je niets voor wat niet geleverd wordt.",
    "Je kunt je reservering kosteloos annuleren zolang de bestelling nog niet is afgehaald of bezorgd: via je bestelpagina of door contact op te nemen.",
    "Bezorgen doen we alleen binnen het aangegeven gebied in Houten en alleen als het veilig kan. Bij gladheid kan de bezorging later worden.",
    "Prijzen zijn eindprijzen. Bezorgkosten zie je voordat je de reservering plaatst.",
  ].join("\n\n"),
  btw_modus: "geen",
  btw_tarief: 21,
  bewaartermijn_maanden: 6,
  wijken: "",
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
    if (sleutel === "contact_email" && t && !EMAIL.test(t)) return { ok: false, fout: "Het contactadres is geen geldig e-mailadres." };
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

export function betaalstatus(totaal: number, betaald: number): "open" | "deels" | "betaald" {
  if (totaal <= 0 || betaald >= totaal) return "betaald";
  return betaald > 0 ? "deels" : "open";
}

// ---------- Klantgegevens ----------

export const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const GRENZEN = { minInvultijdMs: 2500, maxRegels: 12, maxStuksPerBestelling: 200 };

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

export function normaliseerTelefoon(v: string): string | null {
  const t = v.replace(/[\s\-().]/g, "");
  if (!/^\+?[0-9]{10,15}$/.test(t)) return null;
  if (t.startsWith("+")) return t;
  if (t.startsWith("00")) return `+${t.slice(2)}`;
  return t.startsWith("0") && t.length === 10 ? t : null;
}

/** Valideert de klantgegevens. Bij bezorgen ook het adres en het bezorggebied. Foutmeldingen per veld. */
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
  if (!EMAIL.test(email) || email.length > 120) fouten.email = "Vul een geldig e-mailadres in.";
  const telefoon = normaliseerTelefoon(telefoonRuw);
  if (!telefoon) fouten.telefoon = "Vul een geldig telefoonnummer in, bijvoorbeeld 06 12345678.";
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
    else if (!parsePostcodes(bezorgPostcodes).includes(pc.slice(0, 4))) fouten.postcode = "Op dit adres bezorgen we helaas niet. Je kunt je bestelling wel gratis ophalen.";
    else postcode = pc;
  }
  if (Object.keys(fouten).length) return { ok: false, fouten };
  return { ok: true, waarde: { naam, email, telefoon: telefoon!, straat, huisnummer, postcode, plaats, opmerking } };
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
  /** null = wordt per ronde ingekocht (geen voorraadgetal tonen). */
  voorraad: number | null;
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
