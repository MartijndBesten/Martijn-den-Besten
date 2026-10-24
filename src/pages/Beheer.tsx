// Directiekamer: moderatie van ingezonden ideeën. Vereist het beheertoken (Worker-secret ADMIN_TOKEN).

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, type AdminIdea } from "../lib/api";
import "../styles/pages.css";

const KEY = "mdb:beheer-token";

function readToken(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export default function Beheer() {
  const [token, setToken] = useState(readToken);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [message, setMessage] = useState("");

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
        <h1>Moderatie ideeënloket</h1>
        {!token ? (
          <form className="panel beheer__login" onSubmit={login}>
            <div className="field">
              <label htmlFor="beheer-token">Beheertoken</label>
              <input id="beheer-token" className="input" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" />
              <small>Het token wordt alleen voor deze browsersessie bewaard.</small>
            </div>
            <button type="submit" className="btn btn--kobalt">Inloggen</button>
            {message && <p className="form-message form-message--error" style={{ marginTop: 12 }}>{message}</p>}
          </form>
        ) : (
          <>
            <div className="beheer__bar">
              {(["pending", "approved", "rejected"] as const).map((s) => (
                <button key={s} type="button" className={`btn btn--small ${status === s ? "btn--inkt" : "btn--creme"}`} aria-pressed={status === s} onClick={() => {
                  setStatus(s);
                  setMessage("");
                }}>
                  {s === "pending" ? "Wachtrij" : s === "approved" ? "Goedgekeurd" : "Afgewezen"}
                </button>
              ))}
              <button type="button" className="btn btn--small btn--creme" onClick={() => void refresh()}>Vernieuwen</button>
              <button
                type="button"
                className="btn btn--small btn--koraal"
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
                      {i.status !== "approved" && <button type="button" className="btn btn--small btn--groen" onClick={() => void act(i.id, "approve")}>Goedkeuren</button>}
                      {i.status !== "rejected" && <button type="button" className="btn btn--small btn--creme" onClick={() => void act(i.id, "reject")}>Afwijzen</button>}
                      <button type="button" className="btn btn--small btn--koraal" onClick={() => void act(i.id, "delete")}>Verwijderen</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
