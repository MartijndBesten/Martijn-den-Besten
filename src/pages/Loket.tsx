import { IdeaForm } from "../components/IdeaForm";
import { MiniFig } from "../components/MiniFig";
import "../styles/pages.css";

export default function Loket() {
  const params = new URLSearchParams(window.location.search);
  const initial = (params.get("idee") ?? "").slice(0, 80);
  return (
    <div className="page loket">
      <section className="page-hero wrap loket__hero" aria-labelledby="loket-title">
        <div>
          <span className="dept-no">Afd. 05 — Het Officiële Ideeënloket · Formulier ID-1</span>
          <h1 id="loket-title">
            Aanvraag tot het hebben van een <em>idee</em>
          </h1>
          <p className="lede">
            Heeft u een idee dat thuishoort in het Museum van Onafgemaakte Ideeën? Dien het hier in. Elke inzending wordt zorgvuldig beoordeeld, zodra daar tijd voor is.
          </p>
        </div>
        <MiniFig kind="ticket" className="loket__fig" />
      </section>
      <div className="wrap loket__grid">
        <div className="panel loket__form">
          <div className="form-sheet__head" aria-hidden="true">
            <span>Formulier ID-1 · in te vullen in blokletters (of niet)</span>
            <span>Nummer A-{String(Math.floor(Math.random() * 900) + 100)}</span>
          </div>
          <IdeaForm initialTitle={initial} />
        </div>
        <aside className="loket__info">
          <h2>Zo werkt het loket</h2>
          <ol className="steps">
            <li><span><strong>U dient een idee in.</strong> Zonder naam of e-mailadres. Alleen het idee telt.</span></li>
            <li><span><strong>Het idee gaat in de wachtrij.</strong> Niemand anders ziet het nog.</span></li>
            <li><span><strong>De directie beoordeelt.</strong> Goedgekeurde ideeën verschijnen in de publieksvleugel van het museum.</span></li>
            <li><span><strong>Bezoekers stemmen.</strong> Eerlijk geteld: één stem per object per dag.</span></li>
          </ol>
          <p className="label">Spam, links en persoonsgegevens worden automatisch geweigerd. Er geldt een maximum van drie inzendingen per uur.</p>
        </aside>
      </div>
    </div>
  );
}
