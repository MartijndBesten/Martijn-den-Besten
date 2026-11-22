// Drukwerk en deelbeelden: A5-flyer, WhatsApp (vierkant), buurt-app/linkvoorbeeld (breed) en een A4-bord voor de
// verkoop aan de weg. Prijzen, staffel, bezorgtarief en ‘op voorraad vanaf’ komen live uit de webshop.
// ?alleen=a5 | vierkant | breed | bord toont één onderdeel op ware grootte (scripts/strooizout/maak-flyer.cjs).

import { useEffect, useState } from "react";
import { dagTekst, euro } from "../../shared/strooizout";
import { laadWinkel } from "./api";
import { Logo } from "./iconen";
import { KORTE_URL, QrCode, WEG_URL, WINKEL_URL } from "./qr";
import "./flyer.css";

type Gegevens = { prijs: number; bezorg: number | null; bezorgVanaf: number; plek: string; staffel: { vanaf: number; prijs: number } | null; vanaf: string | null };

function useGegevens(): Gegevens {
  const [g, setG] = useState<Gegevens>({ prijs: 899, bezorg: 50, bezorgVanaf: 2, plek: "Houten", staffel: { vanaf: 4, prijs: 849 }, vanaf: "2026-11-26" });
  useEffect(() => {
    void laadWinkel().then((r) => {
      if (!r.ok) return;
      const zout = r.data.producten.find((p) => p.slug === "strooizout-25-kg") ?? r.data.producten[0];
      const i = r.data.instellingen;
      const a = (zout?.aanbiedingen ?? []).filter((x) => x.actief && x.vanaf_aantal > 1 && !x.start && !x.eind).sort((x, y) => x.vanaf_aantal - y.vanaf_aantal)[0];
      setG({
        prijs: zout?.prijs_cent ?? 899,
        bezorg: i.bezorgen_aan && i.bezorg_methode === "per_stuk" ? (zout?.bezorg_cent ?? i.bezorg_per_stuk_cent) : null,
        bezorgVanaf: i.bezorg_min_zakken,
        plek: i.afhaal_plek || "Houten",
        staffel: a ? { vanaf: a.vanaf_aantal, prijs: a.prijs_cent } : null,
        vanaf: zout?.op_voorraad ? null : i.beschikbaar_vanaf || null,
      });
    });
  }, []);
  return g;
}

function Denckh() {
  return (
    <span className="fl-denckh">
      Een initiatief van <img src="/bijbelreis/denckh-logo-signature.svg" alt="Denckh" />
    </span>
  );
}

const bezorgRegel = (g: Gegevens) => (g.bezorg === null ? null : `Bezorgen binnen de rondweg${g.bezorgVanaf > 1 ? `, vanaf ${g.bezorgVanaf} zakken` : ""}: ${`${euro(g.bezorg)} per zak`.replace(/ /g, "\u00a0")}`);

export function FlyerA5({ g }: { g: Gegevens }) {
  return (
    <article className="fl-a5" aria-label="Flyer A5">
      <header className="fl-a5__kop">
        <Logo className="fl-logo-groot" />
        <p className="fl-payoff">Hou je buurt veilig.</p>
      </header>
      <div className="fl-a5__product">
        <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
        <div>
          <p className="fl-a5__naam">25 kg strooizout</p>
          <p className="fl-a5__prijs">{euro(g.prijs)}</p>
          {g.staffel && (
            <p className="fl-a5__staffel">
              Vanaf {g.staffel.vanaf} zakken <b>{euro(g.staffel.prijs)}</b> per zak
            </p>
          )}
          {g.vanaf && <p className="fl-a5__vanaf">Op voorraad vanaf {dagTekst(g.vanaf)}</p>}
        </div>
      </div>
      <ul className="fl-punten">
        <li>Gratis afhalen in {g.plek}</li>
        {bezorgRegel(g) && <li>{bezorgRegel(g)}</li>}
        <li>Betalen bij ontvangst</li>
      </ul>
      <div className="fl-a5__bestel">
        <QrCode className="fl-qr" label={`QR-code naar ${WINKEL_URL}`} kleur="#0b2340" />
        <div>
          <p className="fl-a5__scan">Scan en bestel</p>
          <p className="fl-a5__url">{KORTE_URL}</p>
        </div>
      </div>
      <footer className="fl-a5__voet">
        <p>Strooi ook eens bij een buur die dat zelf niet kan.</p>
        <Denckh />
      </footer>
    </article>
  );
}

export function Deelbeeld({ g, vorm }: { g: Gegevens; vorm: "vierkant" | "breed" }) {
  return (
    <article className={`fl-deel fl-deel--${vorm}`} aria-label={vorm === "vierkant" ? "Deelbeeld 1080 × 1080" : "Deelbeeld 1200 × 630"}>
      <div className="fl-deel__tekst">
        <Logo className="fl-logo-groot" />
        <p className="fl-payoff">Hou je buurt veilig.</p>
        <p className="fl-deel__prijs">
          25 kg strooizout <b>{euro(g.prijs)}</b>
        </p>
        <ul className="fl-punten">
          {g.staffel && (
            <li>
              Vanaf {g.staffel.vanaf} zakken {euro(g.staffel.prijs)} per zak
            </li>
          )}
          <li>Gratis afhalen in {g.plek}</li>
          {bezorgRegel(g) && <li>{bezorgRegel(g)}</li>}
          {g.vanaf && <li>Op voorraad vanaf {dagTekst(g.vanaf)}</li>}
        </ul>
      </div>
      {vorm === "vierkant" ? (
        <div className="fl-deel__onder">
          <QrCode label={`QR-code naar ${WINKEL_URL}`} kleur="#0b2340" />
          <div>
            <strong>Bestel in een minuut</strong>
            <span>{KORTE_URL}</span>
          </div>
        </div>
      ) : (
        <div className="fl-deel__beeld">
          <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
          <span className="fl-deel__url">{KORTE_URL}</span>
        </div>
      )}
    </article>
  );
}

/** A4-bord voor de verkoop aan de weg: QR naar de route met code en bevestigde uitgifte (geen zelfbediening). */
export function Bord({ g }: { g: Gegevens }) {
  return (
    <article className="fl-bord" aria-label="Bord A4 verkoop aan de weg">
      <Logo className="fl-logo-bord" />
      <h1 className="fl-bord__titel">Strooizout — 25 kg</h1>
      <p className="fl-bord__prijs">
        <b>{euro(g.prijs)}</b> per zak
      </p>
      {g.staffel && (
        <p className="fl-bord__staffel">
          Vanaf {g.staffel.vanaf} zakken {euro(g.staffel.prijs)} per zak
        </p>
      )}
      <QrCode className="fl-bord__qr" tekst={WEG_URL} label={`QR-code naar ${WEG_URL}`} kleur="#0b2340" />
      <ol className="fl-bord__stappen">
        <li>
          <b>Scan</b> en kies je aantal
        </li>
        <li>
          <b>Laat je code zien</b>
        </li>
        <li>
          <b>Betaal</b> en neem je zakken mee
        </li>
      </ol>
      <footer className="fl-bord__voet">
        <p>Hou je buurt veilig.</p>
        <Denckh />
      </footer>
    </article>
  );
}

const DEEL_TEKST = (g: Gegevens) =>
  [
    "Strooizout voor de buurt. Hou je buurt veilig.",
    "",
    `25 kg strooizout ${euro(g.prijs)}${g.staffel ? `, vanaf ${g.staffel.vanaf} zakken ${euro(g.staffel.prijs)} per zak` : ""}.`,
    `Gratis afhalen in ${g.plek}${g.bezorg !== null ? `, of laten bezorgen binnen de rondweg${g.bezorgVanaf > 1 ? ` (vanaf ${g.bezorgVanaf} zakken)` : ""} voor ${euro(g.bezorg)} per zak` : ""}. Betalen bij ontvangst.`,
    g.vanaf ? `Op voorraad vanaf ${dagTekst(g.vanaf)}; reserveren kan nu.` : "",
    "",
    `Bestellen: ${WINKEL_URL}`,
  ]
    .filter((x, i, a) => x !== "" || a[i - 1] !== "")
    .join("\n");

export default function Flyer() {
  const g = useGegevens();
  const alleen = new URLSearchParams(window.location.search).get("alleen");
  const [gekopieerd, setGekopieerd] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("fl-pagina");
    if (alleen) document.documentElement.classList.add(`fl-alleen-${alleen}`);
    return () => document.documentElement.classList.remove("fl-pagina", `fl-alleen-${alleen}`);
  }, [alleen]);

  if (alleen === "a5") return <FlyerA5 g={g} />;
  if (alleen === "bord") return <Bord g={g} />;
  if (alleen === "vierkant" || alleen === "breed") return <Deelbeeld g={g} vorm={alleen} />;

  return (
    <main className="fl-overzicht">
      <div className="fl-balk">
        <div>
          <h1>Flyer, deelbeelden en bord</h1>
          <p>Prijzen komen uit de webshop. QR-codes: {WINKEL_URL} (flyer en deelbeeld) en {WEG_URL} (bord).</p>
        </div>
        <div className="fl-balk__knoppen">
          <a className="sz-knop" href="/strooizout/flyer-a5.pdf" download>
            Flyer A5 (PDF)
          </a>
          <a className="sz-knop sz-knop--licht" href="/strooizout/bord-a4.pdf" download>
            Bord A4 (PDF)
          </a>
        </div>
      </div>

      <section className="fl-sectie">
        <h2>Flyer A5</h2>
        <div className="fl-voorbeeld fl-voorbeeld--a5">
          <FlyerA5 g={g} />
        </div>
      </section>

      <section className="fl-sectie">
        <h2>WhatsApp en buurt-app</h2>
        <div className="fl-deelrij">
          <figure>
            <div className="fl-voorbeeld fl-voorbeeld--vierkant">
              <Deelbeeld g={g} vorm="vierkant" />
            </div>
            <figcaption>
              <a href="/strooizout/delen-1080.jpg" download>
                WhatsApp (1080 × 1080)
              </a>
            </figcaption>
          </figure>
          <figure>
            <div className="fl-voorbeeld fl-voorbeeld--breed">
              <Deelbeeld g={g} vorm="breed" />
            </div>
            <figcaption>
              <a href="/strooizout/delen-1200x630.jpg" download>
                Buurt-app en linkvoorbeeld (1200 × 630)
              </a>
            </figcaption>
          </figure>
        </div>
        <h3>Tekst om te delen</h3>
        <textarea className="sz-invoer fl-tekst" readOnly value={DEEL_TEKST(g)} rows={8} aria-label="Tekst om te delen" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button
            type="button"
            className="sz-knop sz-knop--licht sz-knop--klein"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(DEEL_TEKST(g));
                setGekopieerd(true);
                window.setTimeout(() => setGekopieerd(false), 2000);
              } catch {
                /* niet toegestaan */
              }
            }}
          >
            {gekopieerd ? "Gekopieerd" : "Tekst kopiëren"}
          </button>
          <a className="sz-knop sz-knop--licht sz-knop--klein" href={`https://wa.me/?text=${encodeURIComponent(DEEL_TEKST(g))}`} target="_blank" rel="noopener noreferrer">
            Open in WhatsApp
          </a>
        </div>
      </section>

      <section className="fl-sectie">
        <h2>Bord voor verkoop aan de weg (A4)</h2>
        <p className="fl-uitleg">De QR-code opent een korte bestelroute met code. De verkoper bevestigt betaling en uitgifte in het beheer (tabblad Afhalen). Laat het bord alleen staan als er iemand bij de zakken is.</p>
        <div className="fl-voorbeeld fl-voorbeeld--bord">
          <Bord g={g} />
        </div>
      </section>
    </main>
  );
}
