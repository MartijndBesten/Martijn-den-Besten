// Globale speltoestand: missies, verrassingen, modi en meldingen.
// Alles wordt lokaal bewaard in localStorage; er gaat niets naar een server.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EGGS, MISSIONS, type EggId, type MissionId } from "../content/progress";
import { load, remove, save } from "../lib/storage";
import { setSoundEnabled, sfx } from "../lib/sound";

export type Appearance = "ivoor" | "blauwdruk" | "nacht";
export type Effect = "explosie" | null;
export const APPEARANCES: Appearance[] = ["ivoor", "blauwdruk", "nacht"];
export type Toast = { id: number; title: string; text: string; kind: "egg" | "mission" | "info" };

type Persisted = { eggs: EggId[]; missions: MissionId[]; secret: boolean; coffee: number };

type GameApi = {
  eggs: EggId[];
  missions: MissionId[];
  secretUnlocked: boolean;
  coffee: number;
  appearance: Appearance;
  serious: boolean;
  sound: boolean;
  toasts: Toast[];
  findEgg: (id: EggId) => void;
  completeMission: (id: MissionId) => void;
  unlockSecret: () => void;
  addCoffee: () => void;
  setAppearance: (a: Appearance) => void;
  setEffect: (e: Effect) => void;
  setSerious: (on: boolean) => void;
  setSound: (on: boolean) => void;
  notify: (title: string, text: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
  missionProgress: (id: MissionId) => number;
  reset: () => void;
};

const KEY = "mdb:voortgang:v1";
// Moet gelijk blijven aan de sleutel in public/uiterlijk.js (zet het thema vóór het eerste beeld).
export const APPEARANCE_KEY = "mdb:uiterlijk";
const GameContext = createContext<GameApi | null>(null);

const HIDDEN: EggId[] = ["hidden-1", "hidden-2", "hidden-3"];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => {
    const s = load<Partial<Persisted>>(KEY, {});
    return { eggs: s.eggs ?? [], missions: s.missions ?? [], secret: s.secret ?? false, coffee: s.coffee ?? 0 };
  });
  const [appearance, setAppearanceState] = useState<Appearance>(() => {
    const a = load<string>(APPEARANCE_KEY, "ivoor");
    return (APPEARANCES as string[]).includes(a) ? (a as Appearance) : "ivoor";
  });
  const [effect, setEffect] = useState<Effect>(null);
  const [serious, setSerious] = useState(false);
  const [sound, setSoundState] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => save(KEY, state), [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    save(APPEARANCE_KEY, appearance);
  }, [appearance]);

  useEffect(() => {
    if (effect) document.documentElement.dataset.effect = effect;
    else delete document.documentElement.dataset.effect;
  }, [effect]);

  const setAppearance = useCallback((a: Appearance) => setAppearanceState(a), []);

  const notify = useCallback((title: string, text: string, kind: Toast["kind"] = "info") => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, title, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const completeMission = useCallback(
    (id: MissionId) => {
      if (stateRef.current.missions.includes(id)) return;
      const mission = MISSIONS.find((m) => m.id === id);
      setState((s) => (s.missions.includes(id) ? s : { ...s, missions: [...s.missions, id] }));
      sfx.success();
      if (mission) notify("Missie voltooid", mission.title, "mission");
    },
    [notify],
  );

  const findEgg = useCallback(
    (id: EggId) => {
      const current = stateRef.current;
      if (current.eggs.includes(id)) return;
      const eggs = [...current.eggs, id];
      setState((s) => ({ ...s, eggs: s.eggs.includes(id) ? s.eggs : [...s.eggs, id] }));
      notify(`Verrassing: ${EGGS[id].title}`, EGGS[id].text, "egg");
      sfx.blip();
      if (HIDDEN.every((h) => eggs.includes(h))) window.setTimeout(() => completeMission("hidden-buttons"), 400);
      if (eggs.length >= 10) window.setTimeout(() => completeMission("eggs-10"), 800);
    },
    [notify, completeMission],
  );

  const unlockSecret = useCallback(() => setState((s) => ({ ...s, secret: true })), []);
  const addCoffee = useCallback(() => setState((s) => ({ ...s, coffee: s.coffee + 1 })), []);

  const setSound = useCallback((on: boolean) => {
    setSoundEnabled(on);
    setSoundState(on);
    if (on) sfx.blip();
  }, []);

  const missionProgress = useCallback(
    (id: MissionId) => {
      if (state.missions.includes(id)) return 1;
      if (id === "hidden-buttons") return HIDDEN.filter((h) => state.eggs.includes(h)).length / 3;
      if (id === "eggs-10") return Math.min(state.eggs.length, 10) / 10;
      return 0;
    },
    [state],
  );

  const reset = useCallback(() => {
    remove(KEY);
    setState({ eggs: [], missions: [], secret: false, coffee: 0 });
    notify("Voortgang gewist", "Het instituut is alles vergeten. Dat gebeurt vaker.");
  }, [notify]);

  const value = useMemo<GameApi>(
    () => ({
      eggs: state.eggs,
      missions: state.missions,
      secretUnlocked: state.secret,
      coffee: state.coffee,
      appearance,
      serious,
      sound,
      toasts,
      findEgg,
      completeMission,
      unlockSecret,
      addCoffee,
      setAppearance,
      setEffect,
      setSerious,
      setSound,
      notify,
      dismiss,
      missionProgress,
      reset,
    }),
    [state, appearance, serious, sound, toasts, findEgg, completeMission, unlockSecret, addCoffee, setAppearance, setSound, notify, dismiss, missionProgress, reset],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame buiten GameProvider");
  return ctx;
}
