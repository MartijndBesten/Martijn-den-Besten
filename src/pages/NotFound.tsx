import { Link } from "../router";
import "../styles/pages.css";

export default function NotFound() {
  return (
    <div className="page notfound">
      <div className="wrap notfound__inner">
        <span className="dept-no">Fout 404 · Afdeling Zoekgeraakte Pagina’s</span>
        <h1>Deze pagina is nog niet afgemaakt.</h1>
        <div className="almost__bar notfound__bar" role="progressbar" aria-label="Voortgang van deze pagina" aria-valuemin={0} aria-valuemax={100} aria-valuenow={95}>
          <span style={{ width: "95%" }} />
          <b>95%</b>
        </div>
        <p className="lede">De pagina die u zoekt is bedacht, maar nooit gebouwd. Ze staat waarschijnlijk in het museum, in zaal 2.</p>
        <div className="hero__ctas">
          <Link to="/" className="btn btn--indigo">Naar het hoofdkwartier</Link>
          <Link to="/museum#zaal-2" className="btn btn--ivory">Naar zaal 2</Link>
        </div>
      </div>
    </div>
  );
}
