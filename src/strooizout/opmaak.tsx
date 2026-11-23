// Gedeelde onderdelen van de webshop: kop, voet, mandje (lade), mobiele balk, aantalkiezer en totalen.

import { useEffect, useMemo, useRef, useState } from "react";
import { whatsappLink, alsPrijsProduct, bereken, euro, volgendeStaffel, type Berekening, type Levering, type PubliekProduct, type Winkel } from "../../shared/strooizout";
import { IcoonMand, IcoonSluit, IcoonSneeuw, Logo } from "./iconen";
import { useMand, type MandRegel } from "./mandje";
import { Link, useRouter } from "./router";
import { useWinkel } from "./winkeldata";

// ---------- Berekening van het mandje ----------

export type MandBerekening = { berekening: Berekening; producten: Map<number, PubliekProduct>; onbekend: MandRegel[] };

/** Rekent het mandje door met de prijzen van de server. Producten die niet meer bestaan, staan in `onbekend`. */
export function rekenMand(winkel: Winkel | null, regels: MandRegel[], levering: Levering = "ophalen"): MandBerekening {
  const producten = new Map((winkel?.producten ?? []).map((p) => [p.id, p]));
  const geldig = regels.filter((r) => producten.has(r.product_id));
  const inst = winkel?.instellingen ?? { bezorg_methode: "per_adres" as const, bezorg_per_stuk_cent: 50, bezorg_per_kg_cent: 2, bezorg_per_adres_cent: 200 };
  const berekening = bereken(
    geldig.map((r) => ({ product: alsPrijsProduct(producten.get(r.product_id)!), aantal: r.aantal })),
    levering,
    inst,
    winkel?.nu ?? new Date().toISOString(),
  );
  return { berekening, producten, onbekend: regels.filter((r) => !producten.has(r.product_id)) };
}

export function useMandBerekening(levering: Levering = "ophalen"): MandBerekening & { aantal: number } {
  const { winkel } = useWinkel();
  const { regels } = useMand();
  return useMemo(() => {
    const r = rekenMand(winkel, regels, levering);
    return { ...r, aantal: r.berekening.aantal_stuks };
  }, [winkel, regels, levering]);
}

// ---------- Aantalkiezer ----------

export function Aantal({ waarde, max, onChange, label, klein = false, min = 1 }: { waarde: number; max: number; onChange: (n: number) => void; label: string; klein?: boolean; min?: number }) {
  const [tekst, setTekst] = useState(String(waarde));
  useEffect(() => setTekst(String(waarde)), [waarde]);
  const zet = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className={`sz-aantal${klein ? " sz-aantal--klein" : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => zet(waarde - 1)} disabled={waarde <= min} aria-label={`Eén minder ${label}`}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={tekst}
        aria-label={`Aantal ${label}`}
        onChange={(e) => {
          setTekst(e.target.value);
          const n = Number(e.target.value);
          if (Number.isInteger(n) && n >= min && n <= max) onChange(n);
        }}
        onBlur={() => {
          const n = Number(tekst);
          zet(Number.isInteger(n) ? n : waarde);
          setTekst(String(Number.isInteger(n) ? Math.max(min, Math.min(max, n)) : waarde));
        }}
      />
      <button type="button" onClick={() => zet(waarde + 1)} disabled={waarde >= max} aria-label={`Eén meer ${label}`}>
        +
      </button>
    </div>
  );
}

export function maxVoor(p: PubliekProduct): number {
  return Math.max(0, Math.min(p.max_per_bestelling, p.voorraad ?? Number.POSITIVE_INFINITY));
}

// ---------- Staffelkorting ----------

/** ‘Bestel 4 zakken en bespaar € 2,00!’ met een knop om direct naar dat aantal te gaan. */
export function StaffelHint({ staffel, eenheid, onKies, max }: { staffel: ReturnType<typeof volgendeStaffel>; eenheid: string; onKies?: (n: number) => void; max?: number }) {
  if (!staffel || (max !== undefined && staffel.vanaf > max)) return null;
  const meervoud = eenheid === "zak" ? "zakken" : eenheid === "stuk" ? "stuks" : eenheid;
  return (
    <p className="sz-staffel" role="status">
      <span>
        Bestel {staffel.vanaf} {meervoud} en bespaar <span className="sz-nowrap">{euro(staffel.besparing_cent)}</span>!
      </span>
      {onKies && (
        <button type="button" onClick={() => onKies(staffel.vanaf)}>
          Maak er {staffel.vanaf} van
        </button>
      )}
    </p>
  );
}

// ---------- Totalen ----------

export function Totalen({ b, levering, toonBezorgen = true }: { b: Berekening; levering: Levering | null; toonBezorgen?: boolean }) {
  return (
    <dl className="sz-totalen">
      <div>
        <dt>Producten ({b.aantal_stuks})</dt>
        <dd>{euro(b.subtotaal_cent + b.korting_cent)}</dd>
      </div>
      {b.korting_cent > 0 && (
        <div className="sz-korting">
          <dt>{[...new Set(b.regels.map((r) => r.aanbieding).filter(Boolean))].join(", ") || "Korting"}</dt>
          <dd>{euro(-b.korting_cent)}</dd>
        </div>
      )}
      {toonBezorgen && (
        <div>
          <dt>{levering === "bezorgen" ? "Bezorgkosten" : levering === "ophalen" ? "Ophalen" : "Ophalen of bezorgen"}</dt>
          <dd>{levering === "bezorgen" ? euro(b.bezorg_cent) : levering === "ophalen" ? "Gratis" : "Kies bij bestellen"}</dd>
        </div>
      )}
      <div className="sz-totaal">
        <dt>Totaal</dt>
        <dd>{euro(b.totaal_cent)}</dd>
      </div>
    </dl>
  );
}

// ---------- Kop ----------

export function Kop() {
  const { setOpen, bump } = useMand();
  const { aantal } = useMandBerekening();
  const { winkel } = useWinkel();
  const { pad } = useRouter();
  // Het mandje is alleen nodig als er meer dan één product te koop is; anders bestel je direct op de homepage.
  const toonMandje = (winkel?.producten.length ?? 0) > 1 || (aantal > 0 && pad !== "/strooizout");
  const [gescrold, setGescrold] = useState(false);
  const [knal, setKnal] = useState(false);
  const eerste = useRef(true);
  useEffect(() => {
    const kijk = () => setGescrold(window.scrollY > 8);
    kijk();
    window.addEventListener("scroll", kijk, { passive: true });
    return () => window.removeEventListener("scroll", kijk);
  }, []);
  useEffect(() => {
    if (eerste.current) {
      eerste.current = false;
      return;
    }
    setKnal(true);
    const t = window.setTimeout(() => setKnal(false), 450);
    return () => window.clearTimeout(t);
  }, [bump]);
  return (
    <header className={`sz-kop${pad === "/strooizout" ? " sz-kop--nacht" : ""}`} data-scrolled={gescrold}>
      <div className="sz-wrap sz-kop__in">
        <Link naar="/strooizout" className="sz-merk" aria-label="Strooizout voor de buurt, naar de startpagina">
          <Logo opDonker={pad === "/strooizout"} />
        </Link>
        {toonMandje && <button type="button" className="sz-mandknop" onClick={() => setOpen(true)} data-bump={knal} aria-label={`Winkelmandje, ${aantal} ${aantal === 1 ? "artikel" : "artikelen"}`}>
          <IcoonMand />
          <span className="sz-mandknop__tekst">Mandje</span>
          <span className="sz-mandknop__aantal" aria-hidden="true">
            {aantal}
          </span>
        </button>}
      </div>
    </header>
  );
}

// ---------- Voet ----------

export function Voet() {
  const { winkel } = useWinkel();
  const c = winkel?.instellingen;
  const verkoper = [c?.verkoper_adres, c?.verkoper_kvk && `KvK ${c.verkoper_kvk}`, c?.verkoper_btw && `btw ${c.verkoper_btw}`].filter(Boolean).join(" · ");
  return (
    <footer className="sz-voet">
      <div className="sz-wrap sz-voet__in">
        <a className="sz-denckh" href="https://denckh.nl" rel="noopener">
          <span>Een initiatief van</span>
          <img src="/bijbelreis/denckh-logo-signature.svg" alt="Denckh" width={93} height={28} />
        </a>
        <nav className="sz-voet__links" aria-label="Informatie">
          <Link naar="/strooizout/voorwaarden">Voorwaarden</Link>
          <Link naar="/strooizout/privacy">Privacy</Link>
          {(c?.contact_email || c?.verkoper_email) && <a href={`mailto:${c.contact_email || c.verkoper_email}`}>Contact</a>}
          {c?.contact_telefoon && <a href={`tel:${c.contact_telefoon.replace(/[^+\d]/g, "")}`}>{c.contact_telefoon}</a>}
          {c?.contact_telefoon && whatsappLink(c.contact_telefoon) && (
            <a href={whatsappLink(c.contact_telefoon)!} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
        </nav>
        <p className="sz-voet__klein">
          Prijzen inclusief 21% btw. Op is op; bezorgen alleen als het veilig kan. De zak op de afbeeldingen is een illustratie; de verpakking kan er anders uitzien.
        </p>
        {verkoper && (
          <p className="sz-voet__klein sz-voet__bedrijf">
            {c?.verkoper_naam || "Denckh"} · {verkoper}
          </p>
        )}
      </div>
    </footer>
  );
}

// ---------- Mandje (lade) ----------

export function Lade() {
  const { open, setOpen, regels, zet } = useMand();
  const { winkel } = useWinkel();
  const { berekening, producten, onbekend } = useMandBerekening();
  const { navigeer } = useRouter();
  const paneel = useRef<HTMLDivElement>(null);
  const terug = useRef<Element | null>(null);

  // Producten die er niet meer zijn uit het mandje halen (zodra de catalogus geladen is).
  useEffect(() => {
    if (winkel && onbekend.length) onbekend.forEach((r) => zet(r.product_id, 0));
  }, [winkel, onbekend, zet]);

  useEffect(() => {
    if (!open) return;
    terug.current = document.activeElement;
    const vorige = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => paneel.current?.querySelector<HTMLElement>("button, a")?.focus(), 30);
    const toets = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && paneel.current) {
        const f = [...paneel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input")];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", toets);
    return () => {
      document.body.style.overflow = vorige;
      document.removeEventListener("keydown", toets);
      (terug.current as HTMLElement | null)?.focus?.();
    };
  }, [open, setOpen]);

  if (!open) return null;
  const leeg = berekening.regels.length === 0;
  return (
    <>
      <div className="sz-lade-achtergrond" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="sz-lade" role="dialog" aria-modal="true" aria-labelledby="sz-lade-titel" ref={paneel}>
        <div className="sz-lade__kop">
          <h2 id="sz-lade-titel">Je mandje</h2>
          <button type="button" className="sz-sluit" onClick={() => setOpen(false)} aria-label="Mandje sluiten">
            <IcoonSluit />
          </button>
        </div>
        <div className="sz-lade__inhoud">
          {leeg ? (
            <div className="sz-leeg">
              <IcoonSneeuw />
              <p>Je mandje is nog leeg.</p>
              <button type="button" className="sz-knop sz-knop--licht sz-knop--klein" onClick={() => setOpen(false)}>
                Verder kijken
              </button>
            </div>
          ) : (
            berekening.regels.map((r) => {
              const p = producten.get(r.product_id)!;
              const aantal = regels.find((x) => x.product_id === r.product_id)?.aantal ?? r.aantal;
              return (
                <div className="sz-regel" key={r.product_id}>
                  <img src={p.afbeelding || "/strooizout/icoon.svg"} alt="" width={64} height={64} />
                  <div>
                    <div className="sz-regel__naam">
                      <span>{p.naam}</span>
                      <span className="sz-tnum">{euro(r.regel_cent)}</span>
                    </div>
                    <div className="sz-regel__sub">
                      {r.aanbieding && <s>{euro(r.normaalprijs_cent)}</s>} {euro(r.stukprijs_cent)} per {p.eenheid}
                      {r.aanbieding && ` · ${r.aanbieding}`}
                    </div>
                    <div className="sz-regel__acties">
                      <Aantal klein waarde={aantal} max={Math.max(aantal, maxVoor(p))} label={p.naam} onChange={(n) => zet(p.id, n)} />
                      <button type="button" className="sz-weg" onClick={() => zet(p.id, 0)}>
                        Verwijderen
                      </button>
                    </div>
                    <StaffelHint staffel={volgendeStaffel(alsPrijsProduct(p), aantal, winkel?.nu ?? new Date().toISOString())} eenheid={p.eenheid} onKies={(n) => zet(p.id, n)} max={maxVoor(p)} />
                  </div>
                </div>
              );
            })
          )}
        </div>
        {!leeg && (
          <div className="sz-lade__voet">
            <Totalen b={berekening} levering={null} />
            <button
              type="button"
              className="sz-knop sz-knop--vol"
              disabled={!winkel?.open}
              onClick={() => {
                setOpen(false);
                navigeer("/strooizout/bestellen");
              }}
            >
              Verder naar bestellen
            </button>
            {winkel && !winkel.open && <p className="sz-klein">{winkel.melding}</p>}
            {winkel?.open && (
              <p className="sz-klein">
                Ophalen is gratis.
                {winkel.instellingen.bezorgen_aan &&
                  (winkel.instellingen.bezorg_methode === "per_adres"
                    ? ` Bezorgen kost ${euro(winkel.instellingen.bezorg_per_adres_cent)} per bezorging.`
                    : winkel.instellingen.bezorg_methode === "per_stuk"
                      ? ` Bezorgen kost ${euro(winkel.instellingen.bezorg_per_stuk_cent)} per stuk (tenzij anders vermeld).`
                      : ` Bezorgen kost ${euro(winkel.instellingen.bezorg_per_kg_cent)} per kg.`)}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

