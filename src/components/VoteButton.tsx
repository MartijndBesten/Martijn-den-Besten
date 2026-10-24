import { useState } from "react";
import { api } from "../lib/api";
import { load, save } from "../lib/storage";
import { sfx } from "../lib/sound";
import { useGame } from "../state/GameState";
import { setCount, useVotes } from "../state/votes";
import { IconHeart } from "./Icons";

const KEY = "mdb:stemmen:v1";

function votedToday(): Record<string, string> {
  return load<Record<string, string>>(KEY, {});
}

export function VoteButton({ id, label }: { id: string; label: string }) {
  const votes = useVotes();
  const { completeMission, notify } = useGame();
  const today = new Date().toISOString().slice(0, 10);
  const [voted, setVoted] = useState(() => votedToday()[id] === today);
  const [busy, setBusy] = useState(false);

  const count = votes.counts[id] ?? 0;
  const countText = votes.status === "error" ? "teller offline" : votes.status === "ready" ? `${count} ${count === 1 ? "stem" : "stemmen"}` : "…";

  const vote = async () => {
    if (voted || busy) return;
    setBusy(true);
    sfx.click();
    const r = await api.vote(id);
    setBusy(false);
    if (r.ok) {
      setCount(id, r.data.count);
      setVoted(true);
      save(KEY, { ...votedToday(), [id]: today });
      completeMission("vote");
    } else {
      notify("Stemmen lukte niet", r.error);
    }
  };

  return (
    <button
      type="button"
      className="vote"
      aria-pressed={voted}
      disabled={busy}
      onClick={vote}
      aria-label={voted ? `U heeft vandaag op ${label} gestemd, ${countText}` : `Stem op ${label}, ${countText}`}
      title={voted ? "U heeft vandaag al gestemd. Morgen mag het weer." : "Eén stem per object per dag"}
    >
      <span className="vote__heart">
        <IconHeart />
      </span>
      {voted ? "Gestemd" : "Mooi idee"}
      <span className="vote__count">{countText}</span>
    </button>
  );
}
