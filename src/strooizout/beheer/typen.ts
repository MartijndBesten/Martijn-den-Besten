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
  brutowinst_cent: number;
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
  per_product: { product_id: number; naam: string; eenheid: string; aantal: number; omzet_cent: number; inkoop_cent: number; inkoop_onbekend: boolean; gewicht_gram: number; marge_cent: number | null }[];
};

export type LijstBestelling = {
  id: number;
  nummer: string;
  afhaalcode: string;
  ronde_id: number | null;
  status: string;
  levering: "ophalen" | "bezorgen";
  moment_id: number | null;
  naam: string;
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
  status: "concept" | "actief" | "verborgen";
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
  onderdelen: { product_id: number; aantal: number }[];
  aanbiedingen: { id?: number; naam: string; vanaf_aantal: number; prijs_cent: number; start: string | null; eind: string | null; actief: boolean }[];
  berekend: { inkoop_cent: number | null; gewicht_gram: number; bezorg_cent: number | null; beschikbaar: number | null };
};
