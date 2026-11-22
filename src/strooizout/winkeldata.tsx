// Winkelgegevens (catalogus, ronde, instellingen) één keer laden en delen tussen de pagina's.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Winkel } from "../../shared/strooizout";
import { laadWinkel } from "./api";

type Staat = { winkel: Winkel | null; fout: string; herlaad: () => Promise<Winkel | null> };
const Ctx = createContext<Staat>({ winkel: null, fout: "", herlaad: async () => null });

export function WinkelProvider({ children, actief }: { children: ReactNode; actief: boolean }) {
  const [winkel, setWinkel] = useState<Winkel | null>(null);
  const [fout, setFout] = useState("");
  const herlaad = useCallback(async () => {
    const r = await laadWinkel();
    if (r.ok) {
      setWinkel(r.data);
      setFout("");
      return r.data;
    }
    setFout(r.error);
    return null;
  }, []);
  useEffect(() => {
    if (actief) void herlaad();
  }, [actief, herlaad]);
  return <Ctx.Provider value={{ winkel, fout, herlaad }}>{children}</Ctx.Provider>;
}

export const useWinkel = () => useContext(Ctx);
