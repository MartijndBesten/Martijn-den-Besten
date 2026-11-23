// Privacyverklaring en voorwaarden. De voorwaarden zelf zijn in het beheer aan te passen (Instellingen).

import { useWinkel } from "./winkeldata";
import { Link } from "./router";

function Contact() {
  const { winkel } = useWinkel();
  const c = winkel?.instellingen;
  if (!c?.contact_email && !c?.contact_telefoon) return <>de organisator (contactgegevens volgen op deze pagina)</>;
  return (
    <>
      {c.contact_naam || "de organisator"}
      {c.contact_email && (
        <>
          {" "}(<a href={`mailto:${c.contact_email}`}>{c.contact_email}</a>)
        </>
      )}
      {c.contact_telefoon && <> of telefonisch via {c.contact_telefoon}</>}
    </>
  );
}

/** Verkopergegevens zoals ingesteld in het beheer; ontbrekende gegevens worden niet verzonnen. */
function Verkoper() {
  const { winkel } = useWinkel();
  const c = winkel?.instellingen;
  if (!c) return null;
  return (
    <dl className="sz-verkoper">
      <dt>Verkoper</dt>
      <dd>{c.verkoper_naam || "Denckh"}</dd>
      {c.verkoper_adres && (
        <>
          <dt>Adres</dt>
          <dd>{c.verkoper_adres}</dd>
        </>
      )}
      {c.verkoper_kvk && (
        <>
          <dt>KvK</dt>
          <dd>{c.verkoper_kvk}</dd>
        </>
      )}
      {c.verkoper_btw && (
        <>
          <dt>Btw-id</dt>
          <dd>{c.verkoper_btw}</dd>
        </>
      )}
      {(c.verkoper_email || c.contact_email) && (
        <>
          <dt>E-mail</dt>
          <dd>
            <a href={`mailto:${c.verkoper_email || c.contact_email}`}>{c.verkoper_email || c.contact_email}</a>
          </dd>
        </>
      )}
    </dl>
  );
}

export function Privacy() {
  const { winkel } = useWinkel();
  const maanden = winkel?.instellingen.bewaartermijn_maanden ?? 6;
  return (
    <section className="sz-tekstpagina">
      <div className="sz-wrap sz-tekstpagina__in">
        <h1>Privacyverklaring</h1>
        <p>Strooizout voor de buurt is een initiatief van Denckh in Houten. We gaan zuinig om met je gegevens: we vragen alleen wat nodig is om je bestelling af te handelen. Denckh is verantwoordelijk voor de verwerking.</p>

        <h2>Welke gegevens en waarom</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Gegeven</th>
              <th scope="col">Waarvoor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Naam</td>
              <td>Om je bestelling bij het afhalen of bezorgen aan jou te kunnen geven.</td>
            </tr>
            <tr>
              <td>Mobiel nummer en e-mailadres</td>
              <td>Om je de bevestiging met je afhaalcode te mailen, contact met je op te nemen over je bestelling, het afhaalmoment of de bezorging, en om je een betaalverzoek (Tikkie) te sturen.</td>
            </tr>
            <tr>
              <td>Adres (alleen bij bezorgen)</td>
              <td>Om te kunnen bezorgen en te controleren of je adres in het bezorggebied ligt.</td>
            </tr>
            <tr>
              <td>Bestelling, opmerking en betaalstatus</td>
              <td>Om je bestelling af te handelen en bij te houden wat betaald is. We bewaren geen bankgegevens.</td>
            </tr>
          </tbody>
        </table>
        <p>De grondslag is de uitvoering van je bestelling (artikel 6 lid 1 onder b AVG). We gebruiken je gegevens niet voor reclame en verkopen of delen ze niet met anderen.</p>

        <h2>Geen account, geen cookies, geen tracking</h2>
        <p>
          Je hebt geen account nodig. Deze webshop plaatst geen cookies en gebruikt geen advertentie- of volgsoftware. Je winkelmandje wordt alleen in je eigen browser bewaard. Om te weten hoeveel mensen de webshop bezoeken en via welke weg (bijvoorbeeld de flyer of een gedeelde link), tellen we bezoeken zonder cookies: per dag maken we van je IP-adres en browsertype een code die niet terug te rekenen is en de volgende dag verandert. We bewaren geen IP-adres, alleen de dag, de pagina, het soort apparaat en de verwijzende website. Deze telling bewaren we hooguit ruim een jaar en delen we met niemand. Daarnaast staat voor martijndenbesten.com een anonieme, cookieloze bezoekstatistiek van Cloudflare aan.
        </p>

        <h2>Waar staan je gegevens</h2>
        <p>De gegevens staan in een database van Cloudflare (regio West-Europa), waar ook deze website draait. Alleen de beheerder van het initiatief heeft toegang, via een beveiligde beheeromgeving.</p>

        <h2>Hoe lang we je gegevens bewaren</h2>
        <p>
          Naam, mobiel nummer, e-mailadres, adres, opmerking en afhaalcode worden {maanden} {maanden === 1 ? "maand" : "maanden"} nadat je bestelling is afgehaald, bezorgd of geannuleerd automatisch gewist. Een bestelling die om wat voor reden ook niet wordt afgerond, wissen we uiterlijk na twaalf maanden. Wat overblijft (bedragen, aantallen en het postcodegebied) is niet meer tot jou te herleiden en gebruiken we alleen voor de administratie.
        </p>

        <h2>Wie</h2>
        <Verkoper />

        <h2>Je rechten</h2>
        <p>
          Je mag je gegevens inzien, laten verbeteren of laten verwijderen. Neem daarvoor contact op met <Contact />. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.
        </p>
        <p>
          <Link naar="/strooizout">Terug naar de webshop</Link>
        </p>
      </div>
    </section>
  );
}

/** Platte tekst uit het beheer: lege regel = nieuwe alinea, regel die met "## " begint = tussenkop. */
function Opgemaakt({ tekst }: { tekst: string }) {
  return (
    <>
      {tekst
        .split(/\n\s*\n/)
        .map((blok) => blok.trim())
        .filter(Boolean)
        .map((blok, i) =>
          blok.startsWith("## ") ? (
            <h2 key={i}>{blok.slice(3)}</h2>
          ) : (
            <p key={i} className="sz-witregel">
              {blok}
            </p>
          ),
        )}
    </>
  );
}

export function Voorwaarden() {
  const { winkel } = useWinkel();
  return (
    <section className="sz-tekstpagina">
      <div className="sz-wrap sz-tekstpagina__in">
        <h1>Voorwaarden</h1>
        <p>Dit zijn de afspraken voor bestellingen bij Strooizout voor de buurt.</p>
        {winkel ? <Opgemaakt tekst={winkel.instellingen.voorwaarden} /> : <p>Even laden…</p>}
        <h2>Verkoper</h2>
        <Verkoper />
        <p>
          Vragen? Neem contact op met <Contact />.
        </p>
        <p>
          <Link naar="/strooizout">Terug naar de webshop</Link>
        </p>
      </div>
    </section>
  );
}
