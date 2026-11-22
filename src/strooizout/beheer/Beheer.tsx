// Beheer van Strooizout voor de buurt op /strooizout/beheer. Inloggen met een code per e-mail (geen wachtwoord; de
// sessie blijft dertig dagen op dit apparaat), of als terugval met het beheertoken (Worker-secret STROOIZOUT_TOKEN of
// ADMIN_TOKEN; dat staat alleen in deze browsersessie).

import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { vraag } from "../api";
import { extern } from "../router";
import { Merkteken } from "../iconen";
import { BeheerProvider, EMAIL_SLEUTEL, leesToken, SESSIE_SLEUTEL, TOKEN_SLEUTEL, useBeheer } from "./basis";
import "./beheer.css";

const Overzicht = lazy(() => import("./Overzicht"));
const Bestellingen = lazy(() => import("./Bestellingen"));
const Afhalen = lazy(() => import("./Afhalen"));
const Voorraad = lazy(() => import("./Voorraad"));
const Route = lazy(() => import("./Route"));
const Producten = lazy(() => import("./Producten"));
const Rondes = lazy(() => import("./Rondes"));
const Financien = lazy(() => import("./Financien"));
const Instellingen = lazy(() => import("./Instellingen"));
const Delen = lazy(() => import("./Delen"));

const TABS = [
  { id: "overzicht", naam: "Overzicht", C: Overzicht },
  { id: "afhalen", naam: "Afhalen", C: Afhalen },
  { id: "bestellingen", naam: "Bestellingen", C: Bestellingen },
  { id: "voorraad", naam: "Voorraad", C: Voorraad },
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

/**
 * Inloggen. Is er een mailvoorziening, dan met je e-mailadres en een code van zes cijfers die je per mail krijgt
 * (geen wachtwoord). De beheercode (het token) blijft als terugval bestaan.
 */
function Inloggen({ onToken }: { onToken: (t: string, bewaren: boolean) => void }) {
  const [wijze, setWijze] = useState<"laden" | "mail" | "code">("laden");
  const [kanMail, setKanMail] = useState(false);
  const [kanCode, setKanCode] = useState(true);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_SLEUTEL) ?? "";
    } catch {
      return "";
    }
  });
  const [verstuurd, setVerstuurd] = useState(false);
  const [waarde, setWaarde] = useState("");
  const [fout, setFout] = useState("");
  const [melding, setMelding] = useState("");
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    void vraag<{ met_mail: boolean; met_code: boolean }>("/api/strooizout/beheer/inlog").then((r) => {
      const mail = r.ok && r.data.met_mail;
      setKanMail(mail);
      setKanCode(!r.ok || r.data.met_code);
      setWijze(mail ? "mail" : "code");
    });
  }, []);

  async function vraagCode(e?: FormEvent) {
    e?.preventDefault();
    setBezig(true);
    setFout("");
    const r = await vraag<{ melding: string }>("/api/strooizout/beheer/inlog/code", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
    setBezig(false);
    if (!r.ok) return setFout(r.error);
    try {
      localStorage.setItem(EMAIL_SLEUTEL, email.trim());
    } catch {
      /* geen opslag */
    }
    setWaarde("");
    setVerstuurd(true);
    setMelding(r.data.melding);
  }
  async function metMailcode(e: FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    const r = await vraag<{ token: string }>("/api/strooizout/beheer/inlog", { method: "POST", body: JSON.stringify({ email: email.trim(), code: waarde }) });
    setBezig(false);
    if (r.ok) onToken(r.data.token, true);
    else setFout(r.error);
  }
  async function metBeheercode(e: FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    const t = waarde.trim();
    const r = await vraag("/api/strooizout/beheer/sessie", { token: t });
    setBezig(false);
    if (r.ok) onToken(t, false);
    else setFout(r.error);
  }
  const wissel = (naar: "mail" | "code") => {
    setWijze(naar);
    setWaarde("");
    setFout("");
    setMelding("");
    setVerstuurd(false);
  };
  const foutRegel = fout && (
    <p className="sz-veld__fout" role="alert" style={{ marginTop: 8 }}>
      {fout}
    </p>
  );

  return (
    <div className="bh-login">
      {wijze === "laden" ? (
        <div>
          <Merkteken className="sz-merk__teken" />
          <h1>Beheer</h1>
          <p className="bh-sub">Even laden…</p>
        </div>
      ) : wijze === "mail" && !verstuurd ? (
        <form onSubmit={vraagCode}>
          <Merkteken className="sz-merk__teken" />
          <h1>Beheer</h1>
          <p className="bh-sub">Strooizout voor de buurt. Vul je e-mailadres in; je krijgt een code om in te loggen.</p>
          <div className="bh-veld">
            <label htmlFor="bh-email">E-mailadres</label>
            <input id="bh-email" className="sz-invoer" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {foutRegel}
          <button type="submit" className="sz-knop sz-knop--vol" style={{ marginTop: 16 }} disabled={bezig || !email.includes("@")}>
            {bezig ? "Versturen…" : "Stuur mij een code"}
          </button>
          {kanCode && (
            <button type="button" className="sz-knop sz-knop--tekst" style={{ marginTop: 10 }} onClick={() => wissel("code")}>
              Inloggen met de beheercode
            </button>
          )}
        </form>
      ) : wijze === "mail" ? (
        <form onSubmit={metMailcode}>
          <Merkteken className="sz-merk__teken" />
          <h1>Code invullen</h1>
          <p className="bh-sub" role="status">
            {melding}
          </p>
          <div className="bh-veld">
            <label htmlFor="bh-mailcode">Code uit de e-mail</label>
            <input
              id="bh-mailcode"
              className="sz-invoer bh-login__code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              value={waarde}
              onChange={(e) => setWaarde(e.target.value.replace(/[^0-9 ]/g, ""))}
              autoFocus
              required
            />
          </div>
          {foutRegel}
          <button type="submit" className="sz-knop sz-knop--vol" style={{ marginTop: 16 }} disabled={bezig || waarde.replace(/\D/g, "").length !== 6}>
            {bezig ? "Controleren…" : "Inloggen"}
          </button>
          <button type="button" className="sz-knop sz-knop--tekst" style={{ marginTop: 10 }} disabled={bezig} onClick={() => void vraagCode()}>
            Stuur een nieuwe code
          </button>
          <button type="button" className="sz-knop sz-knop--tekst" onClick={() => wissel("mail")}>
            Ander e-mailadres
          </button>
          <p className="sz-klein">Je blijft dertig dagen ingelogd op dit apparaat, tot je zelf uitlogt.</p>
        </form>
      ) : (
        <form onSubmit={metBeheercode}>
          <Merkteken className="sz-merk__teken" />
          <h1>Beheer</h1>
          <p className="bh-sub">Strooizout voor de buurt. Log in met je beheercode.</p>
          <div className="bh-veld">
            <label htmlFor="bh-token">Beheercode</label>
            <input id="bh-token" className="sz-invoer" type="password" autoComplete="current-password" value={waarde} onChange={(e) => setWaarde(e.target.value)} required />
          </div>
          {foutRegel}
          <button type="submit" className="sz-knop sz-knop--vol" style={{ marginTop: 16 }} disabled={bezig || waarde.trim().length < 8}>
            {bezig ? "Controleren…" : "Inloggen"}
          </button>
          {kanMail && (
            <button type="button" className="sz-knop sz-knop--tekst" style={{ marginTop: 10 }} onClick={() => wissel("mail")}>
              Inloggen met een code per e-mail
            </button>
          )}
          <p className="sz-klein">De code blijft alleen in dit tabblad bewaard en verdwijnt als je het sluit.</p>
        </form>
      )}
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
          <a className="sz-merk" href={extern("/strooizout")} target="_blank" rel="noopener">
            <Merkteken className="sz-merk__teken" opDonker />
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
      // een sessie van de e-mailcode ook op de server ongeldig maken
      const sessie = localStorage.getItem(SESSIE_SLEUTEL);
      if (sessie) void vraag("/api/strooizout/beheer/uitloggen", { method: "POST", token: sessie });
      sessionStorage.removeItem(TOKEN_SLEUTEL);
      localStorage.removeItem(SESSIE_SLEUTEL);
    } catch {
      /* geen opslag */
    }
    setToken("");
  }, []);
  if (!token)
    return (
      <Inloggen
        onToken={(t, bewaren) => {
          try {
            if (bewaren) localStorage.setItem(SESSIE_SLEUTEL, t);
            else sessionStorage.setItem(TOKEN_SLEUTEL, t);
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
