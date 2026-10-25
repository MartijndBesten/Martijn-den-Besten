// Het officiële ideeënloket. Inzendingen worden pas zichtbaar na goedkeuring.

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { CATEGORIES, LIMITS, validateIdea } from "../../shared/validation";
import { sfx } from "../lib/sound";

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  briljant: "Zaal 1 — Briljante ideeën",
  "bijna-af": "Zaal 2 — Bijna afgerond",
  domeinnaam: "Zaal 3 — Domeinenarchief",
  morgen: "Zaal 5 — Archief van Morgen",
  onnodig: "Bureau voor Onnodige Innovatie",
};

export function IdeaForm({ initialTitle = "", compact = false }: { initialTitle?: string; compact?: boolean }) {
  const uid = useId();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("briljant");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(Date.now());
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTitle(initialTitle), [initialTitle]);
  useEffect(() => {
    if (status) messageRef.current?.focus();
  }, [status]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setStatus({ kind: "error", text: "Vink eerst aan dat u begrijpt dat dit idee waarschijnlijk niet wordt uitgevoerd." });
      return;
    }
    const check = validateIdea({ title, description, category });
    if (!check.ok) {
      setStatus({ kind: "error", text: check.error });
      return;
    }
    setBusy(true);
    const r = await api.submitIdea({ ...check.value, website, elapsedMs: Date.now() - started.current });
    setBusy(false);
    if (r.ok) {
      sfx.success();
      setStatus({ kind: "ok", text: `Uw volgnummer is ${r.data.ticket}. ${r.data.message} Verwachte wachttijd: onbepaald.` });
      setTitle("");
      setDescription("");
      setAgree(false);
    } else {
      sfx.error();
      setStatus({ kind: "error", text: r.error });
    }
  };

  return (
    <form className="idea-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`${uid}-title`}>Titel van uw idee</label>
        <input
          id={`${uid}-title`}
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={LIMITS.titleMax}
          required
          placeholder="Bijvoorbeeld: een paraplu voor binnen"
          autoComplete="off"
        />
        <small>{title.length}/{LIMITS.titleMax} tekens</small>
      </div>
      {!compact && (
        <div className="field">
          <label htmlFor={`${uid}-desc`}>Toelichting (optioneel)</label>
          <textarea
            id={`${uid}-desc`}
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={LIMITS.descriptionMax}
            placeholder="Wat is het, voor wie, en waarom is het nog niet af?"
          />
          <small>{description.length}/{LIMITS.descriptionMax} tekens · geen links, e-mailadressen of telefoonnummers</small>
        </div>
      )}
      <div className="field">
        <label htmlFor={`${uid}-cat`}>Afdeling</label>
        <select id={`${uid}-cat`} className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${uid}-web`}>Laat dit veld leeg</label>
        <input id={`${uid}-web`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div className="field">
        <label className="checkbox">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>Ik begrijp dat dit idee waarschijnlijk nooit wordt uitgevoerd, en dat vind ik prima.</span>
        </label>
      </div>
      <p className="label" style={{ opacity: 0.75 }}>
        Uw inzending wordt pas zichtbaar na goedkeuring door de directie. Er worden geen namen of e-mailadressen gevraagd of bewaard.
      </p>
      <button type="submit" className="btn btn--indigo" disabled={busy}>
        {busy ? "Wordt gestempeld…" : "Idee indienen bij het loket"}
      </button>
      <div aria-live="polite">
        {status && (
          <div ref={messageRef} tabIndex={-1} className={`form-message form-message--${status.kind}`} style={{ marginTop: 16 }}>
            {status.text}
          </div>
        )}
      </div>
    </form>
  );
}
