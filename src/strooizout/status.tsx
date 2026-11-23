// Bestelpagina van de klant: /strooizout/bestelling#<code>. De code staat in het fragment en gaat dus niet mee in
// serverlogs of statistieken; de pagina haalt de bestelling op met een POST.

import { useCallback, useEffect, useRef, useState } from "react";
import { dagTekst, euro, whatsappLink } from "../../shared/strooizout";
import { vraag, type KlantBestelling } from "./api";
import { IcoonInfo, IcoonKopie, IcoonLet, IcoonVink, WhatsAppKnop } from "./iconen";
import { extern, Link } from "./router";

const STAPPEN_OPHALEN = [
  { s: "nieuw", t: "Bestelling ontvangen", u: "We hebben je bestelling binnen." },
  { s: "bevestigd", t: "Bevestigd", u: "Je bestelling is bevestigd. Het afhaaladres staat hieronder." },
  { s: "klaar", t: "Klaar om op te halen", u: "Je bestelling ligt voor je klaar." },
  { s: "afgehaald", t: "Afgehaald", u: "Bedankt en een veilige winter!" },
];
const STAPPEN_BEZORGEN = [
  { s: "nieuw", t: "Bestelling ontvangen", u: "We hebben je bestelling binnen." },
  { s: "bevestigd", t: "Bevestigd", u: "Je bestelling is bevestigd." },
  { s: "klaar", t: "Klaar voor bezorging", u: "Je bestelling gaat mee met de bezorgronde." },
  { s: "bezorgd", t: "Bezorgd", u: "Bedankt en een veilige winter!" },
];

export default function Status() {
  const [code] = useState(() => decodeURIComponent(window.location.hash.slice(1)));
  const [b, setB] = useState<KlantBestelling | null>(null);
  const [fout, setFout] = useState("");
  const [net, setNet] = useState(false);
  const [annuleren, setAnnuleren] = useState<"nee" | "vraag" | "bezig">("nee");
  const [gekopieerd, setGekopieerd] = useState<"" | "code" | "link">("");
  const kop = useRef<HTMLHeadingElement>(null);

  const laad = useCallback(async () => {
    if (!code) {
      setFout("Deze link is niet compleet. Open de link uit je bevestiging opnieuw.");
      return;
    }
    const r = await vraag<{ bestelling: KlantBestelling }>("/api/strooizout/bestelling/bekijk", { method: "POST", body: JSON.stringify({ code }) });
    if (r.ok) setB(r.data.bestelling);
    else setFout(r.error);
  }, [code]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("strooizout:net-besteld") === code) {
        setNet(true);
        sessionStorage.removeItem("strooizout:net-besteld");
      }
    } catch {
      /* geen opslag */
    }
    void laad();
  }, [code, laad]);

  useEffect(() => {
    if (b) kop.current?.focus();
  }, [b]);

  async function annuleer() {
    setAnnuleren("bezig");
    const r = await vraag<{ bestelling: KlantBestelling }>("/api/strooizout/bestelling/annuleer", { method: "POST", body: JSON.stringify({ code }) });
    setAnnuleren("nee");
    if (r.ok) setB(r.data.bestelling);
    else setFout(r.error);
  }

  const link = `${window.location.origin}${extern(`/strooizout/bestelling#${code}`)}`;

  if (fout && !b) {
    return (
      <section className="sz-tekstpagina">
        <div className="sz-wrap sz-tekstpagina__in">
          <h1>Bestelling niet gevonden</h1>
          <p className="sz-melding sz-melding--fout" role="alert">
            <IcoonLet />
            <span>{fout}</span>
          </p>
          <p style={{ marginTop: 18 }}>
            <Link naar="/strooizout" className="sz-knop sz-knop--licht">
              Naar de webshop
            </Link>
          </p>
        </div>
      </section>
    );
  }
  if (!b) return <div className="sz-laden" aria-busy="true">Je bestelling wordt opgehaald…</div>;

  const stappen = b.levering === "bezorgen" ? STAPPEN_BEZORGEN : STAPPEN_OPHALEN;
  const huidig = stappen.findIndex((s) => s.s === b.status);
  const betaal = b.betaalstatus;
  // Appen met één tik (alleen bij een mobiel nummer): de afhaalcode staat alvast in het bericht.
  const appAfhalen = whatsappLink(b.contact.telefoon, `Hoi, ik wil mijn strooizout komen afhalen (afhaalcode ${b.afhaalcode}). Wanneer kan ik langskomen?`);
  const appVraag = whatsappLink(b.contact.telefoon, `Hoi, ik heb een vraag over mijn strooizoutbestelling (afhaalcode ${b.afhaalcode}).`);
  const deelTekst = `Mijn strooizoutbestelling: afhaalcode ${b.afhaalcode} (${b.regels.map((r) => `${r.aantal}× ${r.naam}`).join(", ")}). Bekijken: ${link}`;
  const geannuleerd = b.status === "geannuleerd";

  return (
    <section className="sz-afrekenen">
      <div className="sz-wrap sz-bevestiging">
        {net && !geannuleerd && (
          <div className="sz-vinkcirkel" aria-hidden="true">
            <IcoonVink />
          </div>
        )}
        <h1 tabIndex={-1} ref={kop} style={{ outline: "none" }}>
          {geannuleerd ? "Je bestelling is geannuleerd" : net ? `Bedankt, ${b.voornaam}! Je bestelling is geplaatst.` : `Je bestelling, ${b.voornaam}`}
        </h1>
        {b.afhaalcode && !geannuleerd && (
          <div className="sz-codekaart">
            <span className="sz-codekaart__label">{b.levering === "ophalen" ? "Je afhaalcode" : "Je bestelcode"}</span>
            <strong className="sz-codekaart__code" aria-label={`Code ${b.afhaalcode.split("").join(" ")}`}>
              {b.afhaalcode}
            </strong>
            <span className="sz-codekaart__uitleg">
              {b.kanaal === "straat"
                ? `Laat deze code zien aan de verkoper en betaal ${euro(b.totaal_cent - b.betaald_cent)} met het betaalverzoek dat je van de verkoper krijgt.`
                : b.levering === "ophalen"
                  ? "Noem of laat deze code zien bij het afhalen."
                  : "Noem deze code als je contact opneemt."}
            </span>
            <div className="sz-codekaart__knoppen">
              <button
                type="button"
                className="sz-knop sz-knop--klein"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(b.afhaalcode);
                    setGekopieerd("code");
                    window.setTimeout(() => setGekopieerd(""), 2000);
                  } catch {
                    /* niet toegestaan */
                  }
                }}
              >
                <IcoonKopie /> {gekopieerd === "code" ? "Gekopieerd" : "Kopieer code"}
              </button>
              {typeof navigator.share === "function" ? (
                <button type="button" className="sz-knop sz-knop--licht sz-knop--klein" onClick={() => void navigator.share({ title: "Strooizout voor de buurt", text: deelTekst }).catch(() => {})}>
                  Delen of bewaren
                </button>
              ) : null}
              <a className="sz-knop sz-knop--licht sz-knop--klein" href={`https://wa.me/?text=${encodeURIComponent(deelTekst)}`} target="_blank" rel="noopener noreferrer">
                Stuur naar mezelf (WhatsApp)
              </a>
            </div>
          </div>
        )}
        {b.nummer !== b.afhaalcode && (
          <p>
            Bestelnummer <span className="sz-nummer">{b.nummer}</span>
          </p>
        )}
        {net && !geannuleerd && <p className="sz-afrekenen__intro">{b.bevestiging_tekst}</p>}

        {!geannuleerd && (
          <div className="sz-blok">
            <h2>Bewaar deze pagina</h2>
            <p style={{ margin: 0, color: "var(--tekst-2)" }}>
              Maak een schermafbeelding van je code, of bewaar deze link. Via de link zie je altijd de actuele stand van je bestelling{b.levering === "ophalen" ? " en, na bevestiging, het afhaaladres" : ""}. We sturen geen automatische e-mail.
            </p>
            <div className="sz-linkvak">
              <input className="sz-invoer" readOnly value={link} aria-label="Persoonlijke link naar je bestelling" onFocus={(e) => e.currentTarget.select()} />
              <button
                type="button"
                className="sz-knop sz-knop--licht sz-knop--klein"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setGekopieerd("link");
                    window.setTimeout(() => setGekopieerd(""), 2000);
                  } catch {
                    /* kopiëren niet toegestaan: veld is te selecteren */
                  }
                }}
              >
                <IcoonKopie /> {gekopieerd === "link" ? "Gekopieerd" : "Kopieer"}
              </button>
            </div>
          </div>
        )}

        {!geannuleerd && b.kanaal !== "straat" && (
          <div className="sz-blok">
            <h2>Stand van zaken</h2>
            <ol className="sz-tijdlijn">
              {stappen.map((s, i) => (
                <li key={s.s} data-klaar={i <= huidig} data-nu={i === huidig} aria-current={i === huidig ? "step" : undefined}>
                  <span className="sz-tijdlijn__bol">{i <= huidig && <IcoonVink />}</span>
                  <div>
                    <strong>{s.t}</strong>
                    {i === huidig && <span>{s.u}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {b.kan_annuleren &&
          (b.meldingen ?? []).map((m) => (
            <p className="sz-melding sz-melding--info" key={m} style={{ marginBottom: 14 }}>
              <IcoonInfo />
              <span>{m}</span>
            </p>
          ))}

        <div className="sz-blok sz-controle">
          <h2>Details</h2>
          <dl>
            <dt>Producten</dt>
            <dd>
              {b.regels.map((r, i) => (
                <div key={i}>
                  {r.aantal}× {r.naam} <span className="sz-tnum">({euro(r.stukprijs_cent * r.aantal)})</span>
                </div>
              ))}
            </dd>
            {b.korting_cent > 0 && (
              <>
                <dt>Aanbieding</dt>
                <dd className="sz-tnum">{euro(-b.korting_cent)}</dd>
              </>
            )}
            {b.levering === "bezorgen" && (
              <>
                <dt>Bezorgkosten</dt>
                <dd className="sz-tnum">{euro(b.bezorg_cent)}</dd>
              </>
            )}
            <dt>Totaal</dt>
            <dd className="sz-tnum" style={{ fontWeight: 700 }}>
              {euro(b.totaal_cent)}
            </dd>
            <dt>Betaling</dt>
            <dd>
              {betaal === "betaald"
                ? "Betaald, bedankt!"
                : betaal === "terugbetaald"
                  ? "Terugbetaald"
                  : betaal === "verzoek"
                    ? "Betaalverzoek verstuurd naar je mobiel"
                    : b.betaald_cent > 0
                      ? `Deels betaald (${euro(b.betaald_cent)}), rest ${b.levering === "bezorgen" ? "bij bezorgen" : "bij afhalen"}`
                      : b.betaalwijze === "tikkie"
                        ? "Je krijgt een betaalverzoek op je mobiel"
                        : b.levering === "bezorgen"
                          ? "Met een betaalverzoek bij bezorgen"
                          : "Met een betaalverzoek bij afhalen"}
            </dd>
            <dt>{b.levering === "bezorgen" ? "Bezorgen op" : "Ophalen"}</dt>
            <dd>
              {b.kanaal === "straat"
                ? "Aan de weg, bij de verkoper."
                : b.levering === "bezorgen"
                  ? b.adres
                  : b.afhaal_adres || `In ${b.afhaal_plek || "Houten"}. Het adres verschijnt hier zodra je bestelling is bevestigd.`}
              {b.moment && (
                <div>
                  {dagTekst(b.moment.datum)}, {b.moment.van}–{b.moment.tot}
                  {b.moment.omschrijving && ` · ${b.moment.omschrijving}`}
                </div>
              )}
              {b.kanaal !== "straat" && b.levering === "ophalen" && b.afhaal_adres && b.contact.telefoon && b.kan_annuleren && (
                <div style={{ marginTop: 6 }}>
                  {appAfhalen ? "App of bel" : "Bel"} even om af te spreken wanneer je langskomt: <a href={`tel:${b.contact.telefoon.replace(/[^+\d]/g, "")}`}>{b.contact.telefoon}</a>.
                  {appAfhalen && (
                    <span className="sz-wa-rij">
                      <WhatsAppKnop href={appAfhalen}>App om af te spreken</WhatsAppKnop>
                    </span>
                  )}
                </div>
              )}
              {b.afhaal_instructie && <div className="sz-witregel" style={{ color: "var(--tekst-2)", marginTop: 6 }}>{b.afhaal_instructie}</div>}
            </dd>
          </dl>
          {b.levering === "bezorgen" && !geannuleerd && (
            <p className="sz-melding sz-melding--info" style={{ marginTop: 0 }}>
              <IcoonLet />
              <span>We bezorgen alleen als het veilig kan. Bij gladheid kan de bezorging later worden; we laten het je dan weten.</span>
            </p>
          )}
        </div>

        {(b.contact.email || b.contact.telefoon) && (
          <div className="sz-blok">
            <h2>Vragen of iets wijzigen?</h2>
            <p style={{ margin: 0 }}>
              Neem contact op met {b.contact.naam || "ons"}
              {b.contact.telefoon && (
                <>
                  {" "}via <a href={`tel:${b.contact.telefoon.replace(/[^+\d]/g, "")}`}>{b.contact.telefoon}</a>
                </>
              )}
              {b.contact.email && (
                <>
                  {b.contact.telefoon ? " of " : " via "}
                  <a href={`mailto:${b.contact.email}?subject=${encodeURIComponent(`Bestelling ${b.nummer}`)}`}>{b.contact.email}</a>
                </>
              )}
              . Noem je afhaalcode.
            </p>
            {appVraag && (
              <p className="sz-wa-rij" style={{ margin: "12px 0 0" }}>
                <WhatsAppKnop href={appVraag}>Stel je vraag via WhatsApp</WhatsAppKnop>
              </p>
            )}
          </div>
        )}

        {(b.status === "afgehaald" || b.status === "bezorgd") && (
          <div className="sz-blok">
            <h2>Bedenktijd</h2>
            <p style={{ color: "var(--tekst-2)" }}>
              Na ontvangst heb je 14 dagen bedenktijd. Wil je zakken terugbrengen? Neem contact met ons op; zie de <Link naar="/strooizout/voorwaarden">voorwaarden</Link>.
            </p>
          </div>
        )}
        {b.kan_annuleren && (
          <div className="sz-blok">
            <h2>Annuleren</h2>
            {annuleren === "nee" ? (
              <>
                <p style={{ color: "var(--tekst-2)" }}>Heb je je bestelling toch niet nodig? Annuleren is gratis zolang je bestelling nog niet is afgehaald of bezorgd.</p>
                <button type="button" className="sz-knop sz-knop--licht sz-knop--klein" onClick={() => setAnnuleren("vraag")}>
                  Bestelling annuleren
                </button>
              </>
            ) : (
              <div role="alertdialog" aria-labelledby="sz-annuleer-vraag">
                <p id="sz-annuleer-vraag">
                  <strong>Weet je zeker dat je bestelling {b.nummer} wilt annuleren?</strong>
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="sz-knop sz-knop--klein" onClick={() => void annuleer()} disabled={annuleren === "bezig"}>
                    {annuleren === "bezig" ? "Bezig…" : "Ja, annuleren"}
                  </button>
                  <button type="button" className="sz-knop sz-knop--licht sz-knop--klein" onClick={() => setAnnuleren("nee")}>
                    Nee, houden
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {fout && (
          <p className="sz-melding sz-melding--fout" role="alert">
            <IcoonLet />
            <span>{fout}</span>
          </p>
        )}
        <p>
          <Link naar="/strooizout">Terug naar de webshop</Link>
        </p>
      </div>
    </section>
  );
}
