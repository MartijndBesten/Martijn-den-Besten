// Minimale router voor /strooizout/*. Elke route heeft ook een eigen HTML-bestand (scripts/postbuild.mjs).

import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

type Router = { pad: string; navigeer: (naar: string, opties?: { vervang?: boolean }) => void };
const Ctx = createContext<Router>({ pad: "/strooizout", navigeer: () => {} });

const schoon = (p: string) => (p.replace(/\/+$/, "").replace(/\.html$/, "") || "/strooizout").toLowerCase();

export const TITELS: Record<string, string> = {
  "/strooizout": "Strooizout voor de buurt — Hou je buurt veilig",
  "/strooizout/bestellen": "Bestellen — Strooizout voor de buurt",
  "/strooizout/bestelling": "Je bestelling — Strooizout voor de buurt",
  "/strooizout/privacy": "Privacy — Strooizout voor de buurt",
  "/strooizout/voorwaarden": "Voorwaarden — Strooizout voor de buurt",
  "/strooizout/flyer": "Flyer en deelbeelden — Strooizout voor de buurt",
  "/strooizout/beheer": "Beheer — Strooizout voor de buurt",
  "/strooizout/aan-de-weg": "Strooizout aan de weg — Strooizout voor de buurt",
};

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pad, setPad] = useState(() => schoon(window.location.pathname));
  useEffect(() => {
    const terug = () => setPad(schoon(window.location.pathname));
    window.addEventListener("popstate", terug);
    return () => window.removeEventListener("popstate", terug);
  }, []);
  useEffect(() => {
    document.title = TITELS[pad] ?? TITELS["/strooizout"];
  }, [pad]);
  const navigeer = useCallback((naar: string, opties: { vervang?: boolean } = {}) => {
    const url = new URL(naar, window.location.origin);
    if (opties.vervang) window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    else window.history.pushState({}, "", url.pathname + url.search + url.hash);
    setPad(schoon(url.pathname));
    if (!url.hash || url.pathname.endsWith("/bestelling")) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  return <Ctx.Provider value={{ pad, navigeer }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function Link({ naar, onClick, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { naar: string }) {
  const { navigeer } = useRouter();
  const klik = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!naar.startsWith("/strooizout")) return;
    e.preventDefault();
    navigeer(naar);
  };
  return (
    <a href={naar} onClick={klik} {...rest}>
      {children}
    </a>
  );
}
