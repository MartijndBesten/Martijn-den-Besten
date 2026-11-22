// Beheer van Strooizout voor de buurt op /strooizout/beheer. Toegang met het beheertoken (Worker-secret
// STROOIZOUT_TOKEN of ADMIN_TOKEN). Het token staat alleen in deze browsersessie (sessionStorage).

import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { vraag } from "../api";
import { Merkteken } from "../iconen";
import { BeheerProvider, leesToken, TOKEN_SLEUTEL, useBeheer } from "./basis";
import "./beheer.css";

const Overzicht = lazy(() => import("./Overzicht"));
const Bestellingen = lazy(() => import("./Bestellingen"));
const Route = lazy(() => import("./Route"));
const Producten = lazy(() => import("./Producten"));
const Rondes = lazy(() => import("./Rondes"));
const Financien = lazy(() => import("./Financien"));
const Instellingen = lazy(() => import("./Instellingen"));
const Delen = lazy(() => import("./Delen"));

const TABS = [
  { id: "overzicht", naam: "Overzicht", C: Overzicht },
  { id: "bestellingen", naam: "Bestellingen", C: Bestellingen },
  { id: "route", naam: "Bezorgroute", C: Route },
  { id: "producten", naam: "Producten", C: Producten },
  { id: "rondes", naam: "Bestelrondes", C: Rondes },
  { id: "financien", naam: "Financiën", C: Financien },
  { id: "instellingen", naam: "Instellingen", C: Instellingen },
  { id: "delen", naam: "Flyer en delen", C: Delen },
] as const;
type TabId = (typeof TABS)[number]["id"];

function tabUitHash(): TabId {
  const h = window.location.hash.slice(1);
  return (TABS.find((t) => t.id === h)?.id ?? "overzicht") as TabId;
}

function Inloggen({ onToken }: { onToken: (t: string) => void }) {
  const [waarde, setWaarde] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  async function verstuur(e: FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    const t = waarde.trim();
    const r = await vraag("/api/strooizout/beheer/sessie", { token: t });
    setBezig(false);
    if (r.ok) onToken(t);
    else setFout(r.error);
  }
  return (
    <div className="bh-login">
      <form onSubmit={verstuur}>
        <Merkteken className="sz-merk__teken" />
        <h1>Beheer</h1>
        <p className="bh-sub">Strooizout voor de buurt. Log in met je beheercode.</p>
        <div className="bh-veld">
          <label htmlFor="bh-token">Beheercode</label>
          <input id="bh-token" className="sz-invoer" type="password" autoComplete="current-password" value={waarde} onChange={(e) => setWaarde(e.target.value)} required />
        </div>
        {fout && (
          <p className="sz-veld__fout" role="alert" style={{ marginTop: 8 }}>
            {fout}
          </p>
        )}
        <button type="submit" className="sz-knop sz-knop--vol" style={{ marginTop: 16 }} disabled={bezig || waarde.trim().length < 8}>
          {bezig ? "Controleren…" : "Inloggen"}
        </button>
        <p className="sz-klein">De code blijft alleen in dit tabblad bewaard en verdwijnt als je het sluit.</p>
      </form>
    </div>
  );
}

function Schil() {
  const { ronde, setRonde, rondes, uitloggen } = useBeheer();
  const [tab, setTab] = useState<TabId>(tabUitHash);
  useEffect(() => {
    const h = () => setTab(tabUitHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const kies = (id: TabId) => {
    window.history.replaceState({}, "", `#${id}`);
    setTab(id);
    window.scrollTo({ top: 0 });
  };
  const Actief = TABS.find((t) => t.id === tab)!.C;
  return (
    <div className="bh">
      <header className="bh-kop">
        <div className="bh-kop__in">
          <a className="sz-merk" href="/strooizout" target="_blank" rel="noopener">
            <Merkteken className="sz-merk__teken" />
            <span>
              Strooizout beheer
              <small>naar de webshop ↗</small>
            </span>
          </a>
          <div className="bh-kop__rechts">
            <label className="sr-only" htmlFor="bh-ronde">
              Bestelronde
            </label>
            <select id="bh-ronde" value={ronde} onChange={(e) => setRonde(e.target.value)}>
              {rondes.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.naam}
                  {r.status === "open" ? " (open)" : ""}
                </option>
              ))}
              <option value="alle">Alle rondes</option>
            </select>
            <button type="button" className="bh-link" onClick={uitloggen}>
              Uitloggen
            </button>
          </div>
        </div>
      </header>
      <nav className="bh-tabs" aria-label="Onderdelen">
        <div className="bh-tabs__in" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" className="bh-tab" aria-selected={tab === t.id} onClick={() => kies(t.id)}>
              {t.naam}
            </button>
          ))}
        </div>
      </nav>
      <main className="bh-main" role="tabpanel">
        <Suspense fallback={<p>Laden…</p>}>
          <Actief />
        </Suspense>
      </main>
    </div>
  );
}

export default function Beheer() {
  const [token, setToken] = useState(leesToken);
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
  }, []);
  const uitloggen = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_SLEUTEL);
    } catch {
      /* geen opslag */
    }
    setToken("");
  }, []);
  if (!token)
    return (
      <Inloggen
        onToken={(t) => {
          try {
            sessionStorage.setItem(TOKEN_SLEUTEL, t);
          } catch {
            /* geen opslag: alleen in geheugen */
          }
          setToken(t);
        }}
      />
    );
  return (
    <BeheerProvider token={token} uitloggen={uitloggen}>
      <Schil />
    </BeheerProvider>
  );
}
