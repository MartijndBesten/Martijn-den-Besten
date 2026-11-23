// Het winkelmandje: product-ID's en aantallen, bewaard in deze browser (localStorage). Prijzen komen altijd van de server.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Levering } from "../../shared/strooizout";

export type MandRegel = { product_id: number; aantal: number };
type Mand = {
  regels: MandRegel[];
  zet: (productId: number, aantal: number) => void;
  voegToe: (productId: number, aantal: number) => void;
  leeg: () => void;
  /** Afhalen of bezorgen, zoals gekozen in de bestelkaart: mandje en bestelpagina rekenen met dezelfde keuze. */
  levering: Levering;
  setLevering: (l: Levering) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  bump: number;
};

const SLEUTEL = "strooizout:mandje";
const Ctx = createContext<Mand | null>(null);

function lees(): MandRegel[] {
  try {
    const v = JSON.parse(localStorage.getItem(SLEUTEL) ?? "[]");
    if (!Array.isArray(v)) return [];
    return v.filter((r) => Number.isInteger(r?.product_id) && Number.isInteger(r?.aantal) && r.aantal > 0 && r.aantal <= 500).slice(0, 12);
  } catch {
    return [];
  }
}

export function MandProvider({ children }: { children: ReactNode }) {
  const [regels, setRegels] = useState<MandRegel[]>(lees);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [levering, setLevering] = useState<Levering>("ophalen");

  useEffect(() => {
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify(regels));
    } catch {
      /* geen opslag: mandje blijft alleen in dit tabblad */
    }
  }, [regels]);

  // Zelfde mandje in meerdere tabbladen.
  useEffect(() => {
    const opslag = (e: StorageEvent) => e.key === SLEUTEL && setRegels(lees());
    window.addEventListener("storage", opslag);
    return () => window.removeEventListener("storage", opslag);
  }, []);

  const zet = useCallback((productId: number, aantal: number) => {
    setRegels((r) => {
      const zonder = r.filter((x) => x.product_id !== productId);
      if (aantal <= 0) return zonder;
      const bestaand = r.findIndex((x) => x.product_id === productId);
      const nieuw = { product_id: productId, aantal };
      if (bestaand === -1) return [...zonder, nieuw];
      const kopie = [...r];
      kopie[bestaand] = nieuw;
      return kopie;
    });
  }, []);

  const voegToe = useCallback((productId: number, aantal: number) => {
    setRegels((r) => {
      const bestaand = r.find((x) => x.product_id === productId);
      if (bestaand) return r.map((x) => (x.product_id === productId ? { ...x, aantal: x.aantal + aantal } : x));
      return [...r, { product_id: productId, aantal }];
    });
    setBump((b) => b + 1);
  }, []);

  const leeg = useCallback(() => setRegels([]), []);
  const waarde = useMemo(() => ({ regels, zet, voegToe, leeg, levering, setLevering, open, setOpen, bump }), [regels, zet, voegToe, leeg, levering, open, bump]);
  return <Ctx.Provider value={waarde}>{children}</Ctx.Provider>;
}

export function useMand(): Mand {
  const m = useContext(Ctx);
  if (!m) throw new Error("useMand buiten MandProvider");
  return m;
}
