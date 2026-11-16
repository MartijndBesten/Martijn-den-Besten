// Directiekamer: moderatie van ingezonden ideeën en de bezoekcijfers van bijbelreis.nl. Vereist het beheertoken
// (Worker-secret ADMIN_TOKEN).

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, type AdminIdea, type BezoekCijfers, type BezoekOverzicht } from "../lib/api";
import "../styles/pages.css";

const KEY = "mdb:beheer-token";

function readToken(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

// ---------- Bezoek bijbelreis.nl ----------
// Wat er gemeten wordt en wat bewust niet: docs/bijbelreis-bezoek/README.md.

/** Seconden als ‘45 s’, ‘3 min 05 s’ of ‘1 u 12 min’. */
function tijd(s: number): string {
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
  return `${Math.floor(s / 3600)} u ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")} min`;
}
const procent = (deel: number, geheel: number) => (geheel ? `${Math.round((deel / geheel) * 100)}%` : "–");
const dagNaam = (dag: string) => new Date(dag + "T12:00:00Z").toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function Totaal({ titel, c }: { titel: string; c: BezoekCijfers }) {
  return (
    <section className="panel bezoek__totaal" aria-label={titel}>
      <span className="label">{titel}</span>
      <p className="bezoek__groot">{c.bezoeken.toLocaleString("nl-NL")} <small>bezoeken</small></p>
      <dl>
        <div><dt>Bezoekers (geschat)</dt><dd>{c.bezoekers === null ? "onbekend" : c.bezoekers.toLocaleString("nl-NL")}</dd></div>
        <div><dt>Gemiddelde duur</dt><dd>{c.bezoeken ? tijd(c.gemiddeld) : "–"}</dd></div>
        <div><dt>Middelste duur (mediaan)</dt><dd>{c.bezoeken ? tijd(c.mediaan) : "–"}</dd></div>
        <div><dt>Korter dan 10 seconden</dt><dd>{c.kort} ({procent(c.kort, c.bezoeken)})</dd></div>
        <div className="bezoek__apparaten"><dt>Apparaat</dt><dd>{c.bezoeken ? `${procent(c.telefoon, c.bezoeken)} telefoon · ${procent(c.tablet, c.bezoeken)} tablet · ${procent(c.desktop, c.bezoeken)} desktop` : "–"}</dd></div>
      </dl>
    </section>
  );
}

function Bezoek({ token, onGeweigerd }: { token: string; onGeweigerd: (melding: string) => void }) {
  const [dagen, setDagen] = useState(30);
  const [data, setData] = useState<BezoekOverzicht | null>(null);
  const [fout, setFout] = useState("");

  const laad = useCallback(async () => {
    const r = await api.adminBezoek(token, dagen);
    if (r.ok) {
      setData(r.data);
      setFout("");
    } else if (r.status === 401) onGeweigerd(r.error);
    else setFout(r.error);
  }, [token, dagen, onGeweigerd]);

  useEffect(() => {
    void laad();
  }, [laad]);

  return (
    <div className="bezoek">
      <div className="beheer__bar">
        {[7, 30, 90].map((n) => (
          <button key={n} type="button" className={`btn btn--small ${dagen === n ? "btn--ink" : "btn--ivory"}`} aria-pressed={dagen === n} onClick={() => setDagen(n)}>
            {n} dagen
          </button>
        ))}
        <button type="button" className="btn btn--small btn--ivory" onClick={() => void laad()}>Vernieuwen</button>
      </div>
      {fout && <p className="form-message form-message--error" role="status">{fout}</p>}
      {!data ? (
        !fout && <p>Cijfers ophalen…</p>
      ) : (
        <>
          <div className="bezoek__totalen">
            <Totaal titel="Laatste 7 dagen" c={data.totalen.d7} />
            <Totaal titel="Laatste 30 dagen" c={data.totalen.d30} />
          </div>
          <p className="bezoek__uitleg">
            Een bezoek is één geladen pagina van bijbelreis.nl (atlas of boekje). De duur is de tijd dat de pagina in beeld was. Bezoekers is een schatting per dag: wie op twee dagen komt, telt twee keer, en een gezin op één apparaat telt als één. Robots en bezoekers met ‘niet volgen’ aan worden niet geteld. Dagen lopen volgens de Nederlandse tijd.
          </p>
          <div className="bezoek__tabel">
            <table>
              <caption>Per dag, laatste {dagen} dagen</caption>
              <thead>
                <tr>
                  <th scope="col">Dag</th>
                  <th scope="col">Bezoeken</th>
                  <th scope="col">Bezoekers</th>
                  <th scope="col">Gemiddeld</th>
                  <th scope="col">Mediaan</th>
                  <th scope="col">&lt; 10 s</th>
                  <th scope="col">Telefoon</th>
                  <th scope="col">Tablet</th>
                  <th scope="col">Desktop</th>
                </tr>
              </thead>
              <tbody>
                {data.dagen.map((d) => (
                  <tr key={d.dag} className={d.bezoeken ? undefined : "bezoek__leeg"}>
                    <th scope="row">{dagNaam(d.dag)}</th>
                    <td>{d.bezoeken}</td>
                    <td>{d.bezoekers === null ? "?" : d.bezoekers}</td>
                    <td>{d.bezoeken ? tijd(d.gemiddeld) : "–"}</td>
                    <td>{d.bezoeken ? tijd(d.mediaan) : "–"}</td>
                    <td>{d.kort}</td>
                    <td>{procent(d.telefoon, d.bezoeken)}</td>
                    <td>{procent(d.tablet, d.bezoeken)}</td>
                    <td>{procent(d.desktop, d.bezoeken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section className="panel bezoek__herkomst">
            <span className="label">Waar bezoekers vandaan komen · laatste {dagen} dagen</span>
            {data.herkomst.length === 0 ? (
              <p>Nog geen bezoeken in deze periode.</p>
            ) : (
              <ol>
                {data.herkomst.map((h) => (
                  <li key={h.herkomst}>
                    <span>{h.herkomst === "direct" ? "Direct (adres getypt, app of bladwijzer)" : h.herkomst}</span>
                    <b>{h.bezoeken}</b>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default function Beheer() {
  const [token, setToken] = useState(readToken);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [message, setMessage] = useState("");
  const [onderdeel, setOnderdeel] = useState<"ideeen" | "bezoek">("ideeen");

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    const r = await api.adminList(token, status);
    if (r.ok) {
      setIdeas(r.data.ideas);
    } else {
      setMessage(r.error);
      if (r.status === 401) {
        setToken("");
        try {
          sessionStorage.removeItem(KEY);
        } catch {
          /* niets */
        }
      }
    }
  }, [token, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const afmelden = useCallback((melding: string) => {
    setMessage(melding);
    setToken("");
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* niets */
    }
  }, []);

  const login = (e: FormEvent) => {
    e.preventDefault();
    try {
      sessionStorage.setItem(KEY, input);
    } catch {
      /* niets */
    }
    setToken(input);
    setInput("");
  };

  const act = async (id: number, action: "approve" | "reject" | "delete") => {
    if (action === "delete" && !window.confirm("Deze inzending definitief verwijderen?")) return;
    const r = await api.adminAction(token, id, action);
    setMessage(r.ok ? "Bijgewerkt." : r.error);
    void refresh();
  };

  return (
    <div className="page beheer">
      <div className="wrap" style={{ paddingBlock: "48px" }}>
        <span className="dept-no">Directiekamer · alleen voor bevoegden</span>
        <h1>{token && onderdeel === "bezoek" ? "Bezoek bijbelreis.nl" : "Moderatie ideeënloket"}</h1>
        {!token ? (
          <form className="panel beheer__login" onSubmit={login}>
            <div className="field">
              <label htmlFor="beheer-token">Beheertoken</label>
              <input id="beheer-token" className="input" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" />
              <small>Het token wordt alleen voor deze browsersessie bewaard.</small>
            </div>
            <button type="submit" className="btn btn--indigo">Inloggen</button>
            {message && <p className="form-message form-message--error" style={{ marginTop: 12 }}>{message}</p>}
          </form>
        ) : (
          <>
            <div className="beheer__bar beheer__onderdelen" role="group" aria-label="Onderdeel">
              <button type="button" className={`btn btn--small ${onderdeel === "ideeen" ? "btn--indigo" : "btn--ivory"}`} aria-pressed={onderdeel === "ideeen"} onClick={() => setOnderdeel("ideeen")}>Ideeënloket</button>
              <button type="button" className={`btn btn--small ${onderdeel === "bezoek" ? "btn--indigo" : "btn--ivory"}`} aria-pressed={onderdeel === "bezoek"} onClick={() => setOnderdeel("bezoek")}>Bezoek bijbelreis.nl</button>
            </div>
            {onderdeel === "bezoek" ? (
              <Bezoek token={token} onGeweigerd={afmelden} />
            ) : (
            <>
            <div className="beheer__bar">
              {(["pending", "approved", "rejected"] as const).map((s) => (
                <button key={s} type="button" className={`btn btn--small ${status === s ? "btn--ink" : "btn--ivory"}`} aria-pressed={status === s} onClick={() => {
                  setStatus(s);
                  setMessage("");
                }}>
                  {s === "pending" ? "Wachtrij" : s === "approved" ? "Goedgekeurd" : "Afgewezen"}
                </button>
              ))}
              <button type="button" className="btn btn--small btn--ivory" onClick={() => void refresh()}>Vernieuwen</button>
              <button
                type="button"
                className="btn btn--small btn--terra"
                onClick={() => {
                  setToken("");
                  try {
                    sessionStorage.removeItem(KEY);
                  } catch {
                    /* niets */
                  }
                }}
              >
                Uitloggen
              </button>
            </div>
            {message && <p className="form-message" role="status">{message}</p>}
            {ideas.length === 0 ? (
              <p>Geen inzendingen in deze lijst.</p>
            ) : (
              <ul className="beheer__list">
                {ideas.map((i) => (
                  <li key={i.id} className="panel">
                    <span className="label">#{i.id} · {i.category} · {new Date(i.created_at * 1000).toLocaleString("nl-NL")}</span>
                    <h2>{i.title}</h2>
                    {i.description && <p>{i.description}</p>}
                    <div className="plaque__actions">
                      {i.status !== "approved" && <button type="button" className="btn btn--small btn--sage" onClick={() => void act(i.id, "approve")}>Goedkeuren</button>}
                      {i.status !== "rejected" && <button type="button" className="btn btn--small btn--ivory" onClick={() => void act(i.id, "reject")}>Afwijzen</button>}
                      <button type="button" className="btn btn--small btn--terra" onClick={() => void act(i.id, "delete")}>Verwijderen</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
