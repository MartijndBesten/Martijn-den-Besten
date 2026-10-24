// Gedeelde stemtellers. Eén keer ophalen, daarna lokaal bijwerken met de echte telling van de server.

import { useEffect, useSyncExternalStore } from "react";
import { api } from "../lib/api";

type VotesState = { status: "idle" | "loading" | "ready" | "error"; counts: Record<string, number> };

let state: VotesState = { status: "idle", counts: {} };
const listeners = new Set<() => void>();

function set(next: VotesState) {
  state = next;
  listeners.forEach((l) => l());
}

export function loadVotes(force = false) {
  if (!force && (state.status === "loading" || state.status === "ready")) return;
  set({ ...state, status: "loading" });
  void api.votes().then((r) => {
    if (r.ok) set({ status: "ready", counts: r.data.counts });
    else set({ ...state, status: "error" });
  });
}

export function setCount(id: string, count: number) {
  set({ status: "ready", counts: { ...state.counts, [id]: count } });
}

export function useVotes(): VotesState {
  const snap = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
  useEffect(() => loadVotes(), []);
  return snap;
}
