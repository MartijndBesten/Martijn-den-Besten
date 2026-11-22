// Flyer, deelbeelden, QR-code en korte link.

import { KORTE_URL, metBron, QrCode, WINKEL_URL } from "../qr";
import { extern } from "../router";

export default function Delen() {
  return (
    <>
      <h1>Flyer en delen</h1>
      <p className="bh-sub">De QR-code verwijst rechtstreeks naar de bestelpagina. De korte link verwijst door naar dezelfde pagina.</p>
      <div className="bh-twee">
        <section className="bh-kaart">
          <h2>QR-code</h2>
          <QrCode tekst={metBron(WINKEL_URL, "qr")} label={`QR-code naar ${WINKEL_URL}`} className="bh-qr" />
          <p style={{ marginTop: 10 }}>
            <a href={WINKEL_URL} target="_blank" rel="noopener">
              {WINKEL_URL}
            </a>
          </p>
          <p>
            Korte link: <b>{KORTE_URL}</b>
          </p>
        </section>
        <section className="bh-kaart">
          <h2>Flyer en afbeeldingen</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>
              <a href={extern("/strooizout/flyer")} target="_blank" rel="noopener">
                Flyer en deelbeelden bekijken en afdrukken
              </a>{" "}
              (actuele prijs uit de webshop)
            </li>
            <li>
              <a href="/strooizout/flyer-a5.pdf" target="_blank" rel="noopener">
                Flyer A5 als PDF
              </a>
            </li>
            <li>
              <a href="/strooizout/delen-1080.jpg" target="_blank" rel="noopener">
                Afbeelding voor WhatsApp en de buurt-app (1080 × 1080)
              </a>
            </li>
            <li>
              <a href="/strooizout/delen-1200x630.jpg" target="_blank" rel="noopener">
                Brede afbeelding (1200 × 630, linkvoorbeeld)
              </a>
            </li>
          </ul>
          <p className="bh-sub">De PDF en afbeeldingen zijn gemaakt met de staffelprijzen € 10,49 / € 9,49 / € 8,99 per zak en bezorging € 0,50 per zak. Verander je een prijs, gebruik dan de flyerpagina (prijzen komen live uit de webshop) of laat de bestanden opnieuw maken (scripts/strooizout/maak-flyer.cjs).</p>
        </section>
      </div>
    </>
  );
}
