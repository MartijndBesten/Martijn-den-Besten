// Strooizout voor de buurt: dunne laag rond /api/strooizout. Faalt netjes, met een begrijpelijke melding.

import type { Winkel } from "../../shared/strooizout";

export type Resultaat<T> = { ok: true; data: T } | { ok: false; status: number; error: string; extra: Record<string, unknown> };

export async function vraag<T>(pad: string, init: RequestInit & { token?: string } = {}): Promise<Resultaat<T>> {
  const { token, ...rest } = init;
  const headers: Record<string, string> = { Accept: "application/json", ...(rest.headers as Record<string, string>) };
  if (rest.body && typeof rest.body === "string") headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(pad, { ...rest, headers, cache: "no-store" });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.ok === false) {
      return { ok: false, status: res.status, error: body?.error ?? "Er ging iets mis. Probeer het opnieuw.", extra: body ?? {} };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, error: "Geen verbinding. Controleer je internet en probeer het opnieuw.", extra: {} };
  }
}

export const laadWinkel = () => vraag<Winkel & { ok: true }>("/api/strooizout/winkel");

export type KlantBestelling = {
  nummer: string;
  afhaalcode: string;
  betaalstatus: "open" | "verzoek" | "betaald" | "terugbetaald";
  betaalstatus_tekst: string;
  code: string;
  status: "nieuw" | "bevestigd" | "klaar" | "afgehaald" | "bezorgd" | "geannuleerd";
  status_tekst: string;
  levering: "ophalen" | "bezorgen";
  moment: { soort: string; datum: string; van: string; tot: string; omschrijving: string } | null;
  voornaam: string;
  adres: string;
  betaalwijze: "bij_ontvangst" | "tikkie";
  regels: { naam: string; aantal: number; stukprijs_cent: number; normaalprijs_cent: number; aanbieding: string }[];
  subtotaal_cent: number;
  korting_cent: number;
  bezorg_cent: number;
  totaal_cent: number;
  betaald_cent: number;
  aangemaakt: string;
  kan_annuleren: boolean;
  afhaal_plek: string;
  afhaal_adres: string;
  afhaal_instructie: string;
  bevestiging_tekst: string;
  contact: { naam: string; email: string; telefoon: string };
};
