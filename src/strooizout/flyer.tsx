// Flyer (A5, printvriendelijk) en deelbeelden voor WhatsApp en de buurt-app.
// ?alleen=a5 | vierkant | breed toont één onderdeel op ware grootte (gebruikt door scripts/strooizout-beelden.mjs).

import { useEffect, useState } from "react";
import { euro } from "../../shared/strooizout";
import { laadWinkel } from "./api";
import { Merkteken } from "./iconen";
import { KORTE_URL, QrCode, WINKEL_URL } from "./qr";
import "./flyer.css";

type Gegevens = { prijs: number; bezorg: number | null; plek: string };

function useGegevens(): Gegevens {
  const [g, setG] = useState<Gegevens>({ prijs: 899, bezorg: 50, plek: "Houten" });
  useEffect(() => {
    void laadWinkel().then((r) => {
      if (!r.ok) return;
      const zout = r.data.producten.find((p) => p.slug === "strooizout-25-kg") ?? r.data.producten[0];
      const i = r.data.instellingen;
      setG({
        prijs: zout?.prijs_cent ?? 899,
        bezorg: i.bezorgen_aan && i.bezorg_methode === "per_stuk" ? (zout?.bezorg_cent ?? i.bezorg_per_stuk_cent) : null,
        plek: i.afhaal_plek || "Houten",
      });
    });
  }, []);
  return g;
}

function Logo({ licht = false }: { licht?: boolean }) {
  return (
    <div className={`fl-logo${licht ? " fl-logo--licht" : ""}`}>
      <Merkteken className="fl-logo__teken" />
      <div>
        <strong>Strooizout voor de buurt</strong>
        <span>Samen veilig de winter door.</span>
      </div>
    </div>
  );
}

export function FlyerA5({ g }: { g: Gegevens }) {
  return (
    <article className="fl-a5" aria-label="Flyer A5">
      <header className="fl-a5__kop">
        <Logo />
      </header>
      <div className="fl-a5__held">
        <div>
          <h1>
            Strooizout
            <br />
            25 kg
          </h1>
          <p className="fl-a5__prijs">
            <strong>{euro(g.prijs)}</strong> per zak
          </p>
        </div>
        <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
      </div>
      <ul className="fl-a5__punten">
        <li>
          <span>
            <b>Gratis afhalen</b> in {g.plek}
          </span>
        </li>
        <li>
          <span>
            <b>Optioneel bezorgen</b> in de buurt{g.bezorg !== null && ` (${euro(g.bezorg)} per zak)`}
          </span>
        </li>
        <li>
          <span>
            <b>Betalen bij ontvangst</b> of via Tikkie
          </span>
        </li>
      </ul>
      <div className="fl-a5__bestel">
        <QrCode className="fl-a5__qr" label={`QR-code naar ${WINKEL_URL}`} />
        <div>
          <h2>Zo bestel je</h2>
          <ol>
            <li>Scan de QR-code</li>
            <li>Kies je aantal zakken</li>
            <li>Kies ophalen of bezorgen</li>
          </ol>
          <p>
            Of ga naar <b>{KORTE_URL}</b>
          </p>
        </div>
      </div>
      <footer className="fl-a5__voet">
        We kopen samen in per bestelronde. Een reservering is nog geen levergarantie. Bezorgen alleen als het veilig kan.
      </footer>
    </article>
  );
}

export function Deelbeeld({ g, vorm }: { g: Gegevens; vorm: "vierkant" | "breed" }) {
  if (vorm === "vierkant") {
    return (
      <article className="fl-deel fl-deel--vierkant" aria-label="Deelbeeld 1080 × 1080">
        <Logo />
        <div className="fl-deel__midden">
          <h1>
            Strooizout
            <br />
            25 kg
            <span>{euro(g.prijs)} per zak</span>
          </h1>
          <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
        </div>
        <ul>
          <li>Gratis afhalen in {g.plek}</li>
          <li>Of laten bezorgen{g.bezorg !== null && ` (${euro(g.bezorg)} per zak)`}</li>
        </ul>
        <div className="fl-deel__onder">
          <QrCode label={`QR-code naar ${WINKEL_URL}`} />
          <div>
            <strong>Bestel in een minuut</strong>
            <span>{KORTE_URL}</span>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className="fl-deel fl-deel--breed" aria-label="Deelbeeld 1200 × 630">
      <div className="fl-deel__tekst">
        <Logo />
        <h1>
          Strooizout 25 kg
          <span>voor {euro(g.prijs)}</span>
        </h1>
        <ul>
          <li>Gratis afhalen in {g.plek}</li>
          <li>Of laten bezorgen{g.bezorg !== null && ` (${euro(g.bezorg)} per zak)`}</li>
          <li>Bestellen in een minuut</li>
        </ul>
        <p className="fl-deel__url">{KORTE_URL}</p>
      </div>
      <div className="fl-deel__beeld">
        <img src="/strooizout/beeld/strooizout-25kg.webp" alt="" />
      </div>
    </article>
  );
}

const WHATSAPP_TEKST = (g: Gegevens) =>
  `❄️ Strooizout voor de buurt\nSamen veilig de winter door.\n\nZak strooizout van 25 kg voor ${euro(g.prijs)}. Gratis ophalen in ${g.plek}${g.bezorg !== null ? `, of laten bezorgen voor ${euro(g.bezorg)} per zak` : ""}. Betalen bij ontvangst.\n\nReserveren kan in een minuut: ${WINKEL_URL}`;

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
  if (alleen === "vierkant" || alleen === "breed") return <Deelbeeld g={g} vorm={alleen} />;

  return (
    <main className="fl-overzicht">
      <div className="fl-balk">
        <div>
          <h1>Flyer en deelbeelden</h1>
          <p>Prijs en bezorgtarief komen uit de webshop. De QR-code verwijst rechtstreeks naar {WINKEL_URL}.</p>
        </div>
        <div className="fl-balk__knoppen">
          <button type="button" className="sz-knop" onClick={() => window.print()}>
            Flyer afdrukken (A5)
          </button>
          <a className="sz-knop sz-knop--licht" href="/strooizout/flyer-a5.pdf" download>
            PDF downloaden
          </a>
        </div>
      </div>

      <section className="fl-sectie">
        <h2>Flyer A5</h2>
        <p className="fl-uitleg">Print op A5, of op A4 met ‘Aanpassen aan papier’ uit. Kies bij voorkeur 100% schaal.</p>
        <div className="fl-voorbeeld fl-voorbeeld--a5">
          <FlyerA5 g={g} />
        </div>
      </section>

      <section className="fl-sectie fl-geen-print">
        <h2>Voor WhatsApp en de buurt-app</h2>
        <p className="fl-uitleg">Download de afbeelding en plak de tekst eronder. De vierkante versie werkt het best in WhatsApp; de brede is de voorvertoning bij een gedeelde link.</p>
        <div className="fl-deelrij">
          <figure>
            <div className="fl-voorbeeld fl-voorbeeld--vierkant">
              <Deelbeeld g={g} vorm="vierkant" />
            </div>
            <figcaption>
              <a href="/strooizout/delen-1080.jpg" download>
                Download vierkant (1080 × 1080)
              </a>
            </figcaption>
          </figure>
          <figure>
            <div className="fl-voorbeeld fl-voorbeeld--breed">
              <Deelbeeld g={g} vorm="breed" />
            </div>
            <figcaption>
              <a href="/strooizout/delen-1200x630.jpg" download>
                Download breed (1200 × 630)
              </a>
            </figcaption>
          </figure>
        </div>
        <h3>Tekst om te delen</h3>
        <textarea className="sz-invoer fl-tekst" readOnly value={WHATSAPP_TEKST(g)} rows={8} aria-label="Tekst om te delen" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button
            type="button"
            className="sz-knop sz-knop--licht sz-knop--klein"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(WHATSAPP_TEKST(g));
                setGekopieerd(true);
                window.setTimeout(() => setGekopieerd(false), 2000);
              } catch {
                /* niet toegestaan */
              }
            }}
          >
            {gekopieerd ? "Gekopieerd" : "Tekst kopiëren"}
          </button>
          <a className="sz-knop sz-knop--licht sz-knop--klein" href={`https://wa.me/?text=${encodeURIComponent(WHATSAPP_TEKST(g))}`} target="_blank" rel="noopener noreferrer">
            Open in WhatsApp
          </a>
        </div>
        <p className="fl-uitleg" style={{ marginTop: 14 }}>
          Korte link: <b>{KORTE_URL}</b> (verwijst door naar de webshop).
        </p>
      </section>
    </main>
  );
}
