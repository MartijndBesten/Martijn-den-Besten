// Minimale router op basis van de History API. Genoeg voor een handvol pagina's, zonder extra library.

import { createContext, useCallback, useContext, useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { ROUTES, SITE } from "./content/site";

type RouterState = { path: string; hash: string; navigate: (to: string) => void };

const RouterContext = createContext<RouterState>({ path: "/", hash: "", navigate: () => {} });

function normalize(path: string): string {
  const clean = path.replace(/\/+$/, "") || "/";
  return clean.replace(/\.html$/, "");
}

export function routeMeta(path: string) {
  return ROUTES.find((r) => r.path === path);
}

function applyMeta(path: string) {
  const meta = routeMeta(path);
  const title = meta?.title ?? "Fout 404: deze pagina is nog niet afgemaakt — Martijn den Besten";
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta?.description ?? "Deze pagina bestaat (nog) niet.");
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", SITE.url + (path === "/" ? "/" : path));
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", SITE.url + path);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(() => ({ path: normalize(window.location.pathname), hash: window.location.hash }));

  useEffect(() => {
    const onPop = () => setLocation({ path: normalize(window.location.pathname), hash: window.location.hash });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    const path = normalize(url.pathname);
    const samePage = path === normalize(window.location.pathname);
    window.history.pushState({}, "", path + url.search + url.hash);
    setLocation({ path, hash: url.hash });
    if (!samePage && !url.hash) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    applyMeta(location.path);
  }, [location.path]);

  // Bij een hash: na het renderen naar het element scrollen.
  useEffect(() => {
    if (!location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => window.clearTimeout(t);
  }, [location]);

  return <RouterContext.Provider value={{ ...location, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (to.startsWith("http") || routeMeta(normalize(to))?.static) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
