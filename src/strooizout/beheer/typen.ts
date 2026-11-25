// Antwoorden van de beheer-API (worker/strooizout-beheer.ts).

export type Cijfers = {
  bestellingen: number;
  geannuleerd: number;
  stuks: number;
  zakken: number;
  gewicht_gram: number;
  omzet_cent: number;
  product_omzet_cent: number;
  bezorg_cent: number;
  korting_cent: number;
  inkoop_cent: number;
  inkoop_onbekend: boolean;
  /** Is er ergens een inkoopprijs ingevuld? Zo niet, dan tonen we geen marge. */
  inkoop_bekend: boolean;
  brutowinst_cent: number;
  /** Omzet min inkoop, beide exclusief btw (incl. bezorgopbrengst). */
  marge_excl_cent: number;
  /** Productomzet min inkoop, beide exclusief btw (zonder bezorgopbrengst). */
  product_marge_excl_cent: number;
  btw_cent: number | null;
  ontvangen_cent: number;
  openstaand_cent: number;
  terug_te_betalen_cent: number;
  betaalstatus: { open: number; verzoek: number; betaald: number; terugbetaald: number };
  terugbetaald_cent: number;
  af_te_halen: number;
  te_bezorgen: number;
  afgehaald: number;
  bezorgd: number;
  per_status: Record<string, number>;
  /** Openstaande voorbestellingen (geplaatst voordat de voorraad er lag). */
  voorbestellingen: number;
  per_kanaal: Record<"web" | "straat" | "beheer", { bestellingen: number; omzet_cent: number }>;
  per_product: { product_id: number; naam: string; eenheid: string; aantal: number; omzet_cent: number; inkoop_cent: number; inkoop_onbekend: boolean; gewicht_gram: number; marge_cent: number | null; marge_excl_cent: number | null }[];
};

export type LijstBestelling = {
  id: number;
  nummer: string;
  afhaalcode: string;
  kanaal: "web" | "straat" | "beheer";
  /** Geplaatst voordat de voorraad er lag. */
  voorbestelling: boolean;
  ronde_id: number | null;
  status: string;
  levering: "ophalen" | "bezorgen";
  moment_id: number | null;
  naam: string;
  zakelijk: boolean;
  bedrijfsnaam: string;
  kvk: string;
  btw_nummer: string;
  factuuradres: string;
  email: string;
  telefoon: string;
  adres: string;
  postcode: string;
  plaats: string;
  wijk: string;
  opmerking: string;
  betaalwijze: "bij_ontvangst" | "tikkie";
  totaal_cent: number;
  betaald_cent: number;
  betaalstatus: "open" | "verzoek" | "betaald" | "terugbetaald";
  betaalverzoek_op: string | null;
  stuks: number;
  samenvatting: string;
  aangemaakt: string;
  mogelijk_dubbel: boolean;
  geanonimiseerd: boolean;
};

export type Moment = { id: number; ronde_id: number | null; soort: "ophalen" | "bezorgen"; datum: string; van: string; tot: string; omschrijving: string; max_bestellingen: number | null; actief: number; bezet?: number };

export type BeheerProduct = {
  id: number;
  slug: string;
  naam: string;
  categorie_id: number | null;
  status: "concept" | "binnenkort" | "actief" | "verborgen";
  kort: string;
  beschrijving: string;
  specificaties: { label: string; waarde: string }[];
  prijs_cent: number | null;
  inkoop_cent: number | null;
  bezorg_cent: number | null;
  gewicht_gram: number;
  eenheid: string;
  voorraad: number | null;
  max_per_bestelling: number;
  afbeelding: string;
  afbeelding_alt: string;
  notitie: string;
  volgorde: number;
  /** 1 = alleen afhalen (bijvoorbeeld zout dat bij het afhalen wordt afgewogen). */
  alleen_afhalen: number;
  /** Korte melding voor de klant die dit product bestelt. */
  klant_melding: string;
  onderdelen: { product_id: number; aantal: number }[];
  aanbiedingen: { id?: number; naam: string; vanaf_aantal: number; prijs_cent: number; start: string | null; eind: string | null; actief: boolean }[];
  berekend: { inkoop_cent: number | null; gewicht_gram: number; bezorg_cent: number | null; beschikbaar: number | null };
};
