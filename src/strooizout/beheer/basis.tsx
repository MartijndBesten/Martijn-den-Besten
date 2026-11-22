// Gedeelde hulp voor het beheer: token, API-aanroepen, meldingen, rondekeuze en kleine weergave-onderdelen.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { BESTEL_STATUS, euro } from "../../../shared/strooizout";
import { vraag, type Resultaat } from "../api";

export const TOKEN_SLEUTEL = "strooizout:beheer-token";

export function leesToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_SLEUTEL) ?? "";
  } catch {
    return "";
  }
}

export type Ronde = {
  id: number;
  naam: string;
  status: "open" | "gesloten" | "ingekocht" | "geleverd" | "afgerond";
  sluit_op: string | null;
  notitie: string;
  leverancier: string;
  inkoop_datum: string | null;
  inkoop_bedrag_cent: number | null;
  inkoop_notitie: string;
  levering_datum: string | null;
  aangemaakt: string;
  gesloten_op: string | null;
  bestellingen: number;
};

type Beheer = {
  token: string;
  api: <T>(pad: string, init?: RequestInit) => Promise<Resultaat<T>>;
  meld: (tekst: string, fout?: boolean) => void;
  ronde: string;
  setRonde: (r: string) => void;
  rondes: Ronde[];
  laadRondes: () => Promise<void>;
  uitloggen: () => void;
};

const Ctx = createContext<Beheer | null>(null);

export function BeheerProvider({ token, uitloggen, children }: { token: string; uitloggen: () => void; children: ReactNode }) {
  const [melding, setMelding] = useState<{ tekst: string; fout: boolean } | null>(null);
  const [ronde, setRonde] = useState("");
  const [rondes, setRondes] = useState<Ronde[]>([]);

  const api = useCallback(
    async <T,>(pad: string, init: RequestInit = {}) => {
      const r = await vraag<T>(`/api/strooizout/beheer${pad}`, { ...init, token });
      if (!r.ok && r.status === 401) uitloggen();
      return r;
    },
    [token, uitloggen],
  );
  const meld = useCallback((tekst: string, fout = false) => setMelding({ tekst, fout }), []);
  useEffect(() => {
    if (!melding) return;
    const t = window.setTimeout(() => setMelding(null), melding.fout ? 6000 : 3000);
    return () => window.clearTimeout(t);
  }, [melding]);

  const laadRondes = useCallback(async () => {
    const r = await api<{ rondes: Ronde[] }>("/rondes");
    if (r.ok) {
      setRondes(r.data.rondes);
      setRonde((huidig) => huidig || (r.data.rondes[0] ? String(r.data.rondes[0].id) : "alle"));
    }
  }, [api]);
  useEffect(() => {
    void laadRondes();
  }, [laadRondes]);

  return (
    <Ctx.Provider value={{ token, api, meld, ronde, setRonde, rondes, laadRondes, uitloggen }}>
      {children}
      {melding && (
        <div className={`bh-melding${melding.fout ? " bh-melding--fout" : ""}`} role={melding.fout ? "alert" : "status"}>
          {melding.tekst}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useBeheer(): Beheer {
  const b = useContext(Ctx);
  if (!b) throw new Error("useBeheer buiten BeheerProvider");
  return b;
}

/** Querystring voor het rondefilter (leeg = nieuwste ronde). */
export const rondeQuery = (ronde: string) => (ronde ? `ronde=${encodeURIComponent(ronde)}` : "");

export function StatusPil({ status }: { status: string }) {
  return <span className={`bh-pil bh-pil--${status}`}>{BESTEL_STATUS[status as keyof typeof BESTEL_STATUS] ?? status}</span>;
}

export function BetaalPil({ status, betaald }: { status: "open" | "deels" | "betaald"; betaald?: number }) {
  const tekst = status === "betaald" ? "Betaald" : status === "deels" ? `Deels${betaald ? ` (${euro(betaald)})` : ""}` : "Open";
  return <span className={`bh-pil bh-pil--${status}`}>{tekst}</span>;
}

export function Kpi({ label, waarde, sub, nadruk = false }: { label: string; waarde: ReactNode; sub?: ReactNode; nadruk?: boolean }) {
  return (
    <div className={`bh-kpi${nadruk ? " bh-kpi--nadruk" : ""}`}>
      <span>{label}</span>
      <strong>{waarde}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

export const kg = (gram: number) => `${(gram / 1000).toLocaleString("nl-NL", { maximumFractionDigits: 1 })} kg`;
export const kort = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" }) : "–";

/** ISO (UTC) → waarde voor <input type="datetime-local"> in Nederlandse tijd. */
export function naarLokaal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const delen = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
  return delen.replace(" ", "T");
}

/** <input type="datetime-local"> in Nederlandse tijd → ISO (UTC). */
export function vanLokaal(waarde: string): string | null {
  if (!waarde) return null;
  const [datum, tijd] = waarde.split("T");
  const [j, m, d] = datum.split("-").map(Number);
  const [u, min] = tijd.split(":").map(Number);
  // Eerst als UTC lezen, dan het verschil met Amsterdam op dat moment corrigeren (zomer- en wintertijd).
  const gok = Date.UTC(j, m - 1, d, u, min);
  const ams = new Date(new Date(gok).toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  const utc = new Date(new Date(gok).toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(gok - (ams.getTime() - utc.getTime())).toISOString();
}

/** Download een beheerbestand (met token) als bestand. */
export async function downloadMetToken(pad: string, token: string, naam: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/strooizout/beheer${pad}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return (await res.json().catch(() => null))?.error ?? "Downloaden mislukt.";
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = naam;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    return null;
  } catch {
    return "Geen verbinding.";
  }
}
