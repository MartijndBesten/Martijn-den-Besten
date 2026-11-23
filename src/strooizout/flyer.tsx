// Drukwerk en deelbeelden: A5-flyer, WhatsApp (vierkant), buurt-app/linkvoorbeeld (breed) en een A4-bord voor de
// verkoop aan de weg. Prijzen, staffel, bezorgtarief en ‘op voorraad vanaf’ komen live uit de webshop.
// ?alleen=a5 | vierkant | breed | bord toont één onderdeel op ware grootte (scripts/strooizout/maak-flyer.cjs).

import { useEffect, useState } from "react";
import { dagTekst, euro } from "../../shared/strooizout";
import { laadWinkel } from "./api";
import { Logo } from "./iconen";
import { KORTE_URL, metBron, QrCode, WEG_URL, WINKEL_URL } from "./qr";
import "./flyer.css";

type Staffel = { vanaf: number; prijs: number };
type Gegevens = { prijs: number; staffels: Staffel[]; bezorg: number | null; bezorgPer: "zak" | "bezorging"; bezorgVanaf: number; plek: string; vanaf: string | null };

function useGegevens(): Gegevens {
  const [g, setG] = useState<Gegevens>({ prijs: 1049, staffels: [{ vanaf: 2, prijs: 949 }, { vanaf: 4, prijs: 899 }], bezorg: 200, bezorgPer: "bezorging", bezorgVanaf: 2, plek: "Houten", vanaf: "2026-11-26" });
  useEffect(() => {
    void laadWinkel().then((r) => {
      if (!r.ok) return;
      const zout = r.data.producten.find((p) => p.slug === "strooizout-25-kg") ?? r.data.producten[0];
      const i = r.data.instellingen;
      const staffels = (zout?.aanbiedingen ?? [])
        .filter((x) => x.actief && x.vanaf_aantal > 1 && !x.start && !x.eind && x.prijs_cent < (zout?.prijs_cent ?? 0))
        .sort((x, y) => x.vanaf_aantal - y.vanaf_aantal)
        .map((a) => ({ vanaf: a.vanaf_aantal, prijs: a.prijs_cent }));
      setG({
        prijs: zout?.prijs_cent ?? 1049,
        staffels,
        bezorg: !i.bezorgen_aan ? null : i.bezorg_methode === "per_adres" ? i.bezorg_per_adres_cent : i.bezorg_methode === "per_stuk" ? (zout?.bezorg_cent ?? i.bezorg_per_stuk_cent) : null,
        bezorgPer: i.bezorg_methode === "per_adres" ? "bezorging" : "zak",
        bezorgVanaf: i.bezorg_min_zakken,
        plek: i.afhaal_plek || "Houten",
        vanaf: zout?.op_voorraad ? null : i.beschikbaar_vanaf || null,
      });
    });
  }, []);
  return g;
}

/** ‘1 zak’, ‘2–3 zakken’, ‘4 of meer’ met de prijs per zak. */
function prijsRegels(g: Gegevens): { label: string; prijs: number }[] {
  const r = [{ label: "1 zak", prijs: g.prijs }];
  g.staffels.forEach((s, i) => {
    const tot = g.staffels[i + 1]?.vanaf;
    r.push({ label: tot ? (tot - 1 > s.vanaf ? `${s.vanaf}–${tot - 1} zakken` : `${s.vanaf} zakken`) : `${s.vanaf} of meer`, prijs: s.prijs });
  });
  if (r.length === 1) r[0].label = "per zak";
  return r;
}
const laagste = (g: Gegevens) => Math.min(g.prijs, ...g.staffels.map((s) => s.prijs));
const nb = (t: string) => t.replace(/ /g, " ");

function Denckh() {
  return (
    <span className="fl-denckh">
      Een initiatief van <img src="/bijbelreis/denckh-logo-signature.svg" alt="Denckh" />
    </span>
  );
}

function Prijzen({ g }: { g: Gegevens }) {
  const regels = prijsRegels(g);
  return (
    <table className="fl-prijzen">
      <tbody>
        {regels.map((r, i) => (
          <tr key={r.label} className={i === regels.length - 1 && regels.length > 1 ? "is-best" : ""}>
            <th scope="row">{r.label}</th>
            <td>
              {euro(r.prijs)} <small>per zak</small>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const bezorgRegel = (g: Gegevens) => (g.bezorg === null ? null : `Bezorgen binnen de rondweg${g.bezorgVanaf > 1 ? `, vanaf ${g.bezorgVanaf} zakken` : ""}: ${nb(`${euro(g.bezorg)} per ${g.bezorgPer}`)}`);

export function FlyerA5({ g }: { g: Gegevens }) {
  return (
    <article className="fl-a5" aria-label="Flyer A5">
      <header className="fl-a5__kop">
        <Logo className="fl-logo-groot" />
      </header>
      <div>
        <h1 className="fl-kop">Strooizout uit je eigen buurt.</h1>
        <p className="fl-sub">Geen aparte rit naar de bouwmarkt. Bestel samen met je buren en houd je stoep veilig.</p>
      </div>
      <div className="fl-a5__product">
        <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
        <div>
          <p className="fl-a5__naam">25 kg strooizout</p>
          <Prijzen g={g} />
          {g.vanaf && <p className="fl-a5__vanaf">Op voorraad vanaf {dagTekst(g.vanaf)}</p>}
        </div>
      </div>
      <ul className="fl-punten">
        <li>Gratis afhalen in {g.plek}</li>
        {bezorgRegel(g) && <li>{bezorgRegel(g)}</li>}
        <li>Betalen met een betaalverzoek</li>
      </ul>
      <div className="fl-a5__bestel">
        <QrCode className="fl-qr" tekst={metBron(WINKEL_URL, "flyer")} label={`QR-code naar ${WINKEL_URL}`} kleur="#0b2340" />
        <div>
          <p className="fl-a5__scan">Scan en bestel</p>
          <p className="fl-a5__url">{KORTE_URL}</p>
        </div>
      </div>
      <footer className="fl-a5__voet">
        <p>Neem er eentje mee voor je buren.</p>
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
        <h1 className="fl-kop">Strooizout uit je eigen buurt.</h1>
        <p className="fl-deel__prijs">
          25 kg vanaf <b>{euro(laagste(g))}</b> per zak
        </p>
        <p className="fl-deel__staffel">{prijsRegels(g).map((r) => nb(`${r.label} ${euro(r.prijs)}`)).join("  ·  ")}</p>
        <ul className="fl-punten">
          <li>Gratis afhalen in {g.plek}</li>
          {vorm === "vierkant" && bezorgRegel(g) && <li>{bezorgRegel(g)}</li>}
          {g.vanaf && <li>Op voorraad vanaf {dagTekst(g.vanaf)}</li>}
        </ul>
      </div>
      {vorm === "vierkant" ? (
        <div className="fl-deel__onder">
          <QrCode tekst={metBron(WINKEL_URL, "deelbeeld")} label={`QR-code naar ${WINKEL_URL}`} kleur="#0b2340" />
          <div>
            <strong>Samen bestellen?</strong>
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
      {g.staffels.length > 0 && <p className="fl-bord__staffel">{prijsRegels(g).slice(1).map((r) => nb(`${r.label} ${euro(r.prijs)}`)).join("  ·  ")} per zak</p>}
      <QrCode className="fl-bord__qr" tekst={metBron(WEG_URL, "bord")} label={`QR-code naar ${WEG_URL}`} kleur="#0b2340" />
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
        <p>Hou je buurt veilig. Strooi bewust.</p>
        <Denckh />
      </footer>
    </article>
  );
}

const DEEL_TEKST = (g: Gegevens) =>
  [
    "Hoi buren! Geen aparte rit naar de bouwmarkt: in Houten kun je strooizout bestellen.",
    "",
    `25 kg strooizout: ${prijsRegels(g).map((r) => `${r.label} ${euro(r.prijs)}`).join(", ")} per zak.`,
    `Samen bestellen is voordeliger. Gratis afhalen in ${g.plek}${g.bezorg !== null ? `, of laten bezorgen binnen de rondweg${g.bezorgVanaf > 1 ? ` (vanaf ${g.bezorgVanaf} zakken)` : ""} voor ${euro(g.bezorg)} per ${g.bezorgPer}` : ""}.`,
    g.vanaf ? `Op voorraad vanaf ${dagTekst(g.vanaf)}; bestellen kan nu.` : "",
    "",
    `Bestellen: ${metBron(WINKEL_URL, "whatsapp")}`,
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
