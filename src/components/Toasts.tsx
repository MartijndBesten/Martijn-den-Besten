import { useGame } from "../state/GameState";

const ICON = { egg: "✶", mission: "✓", info: "i" } as const;

export function Toasts() {
  const { toasts, dismiss } = useGame();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`}>
          <span className="toast__icon" aria-hidden="true">{ICON[t.kind]}</span>
          <div>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Melding sluiten">×</button>
          {t.kind === "mission" && (
            <span className="toast__stamp stamp" aria-hidden="true">
              Gestempeld
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
