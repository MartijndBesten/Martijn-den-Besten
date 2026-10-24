import { lazy, Suspense, useEffect, useRef } from "react";
import { RouterProvider, useRouter } from "./router";
import { GameProvider } from "./state/GameState";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toasts } from "./components/Toasts";
import { Passport } from "./components/Passport";
import { SeriousMode } from "./components/SeriousMode";
import { EasterEggs } from "./components/EasterEggs";
import Home from "./pages/Home";

const ControlCenter = lazy(() => import("./pages/ControlCenter"));
const Museum = lazy(() => import("./pages/Museum"));
const Over = lazy(() => import("./pages/Over"));
const Loket = lazy(() => import("./pages/Loket"));
const Bureau = lazy(() => import("./pages/Bureau"));
const Certificaat = lazy(() => import("./pages/Certificaat"));
const Einde = lazy(() => import("./pages/Einde"));
const Beheer = lazy(() => import("./pages/Beheer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PAGES: Record<string, React.ComponentType> = {
  "/": Home,
  "/control-center": ControlCenter,
  "/museum": Museum,
  "/over": Over,
  "/loket": Loket,
  "/bureau": Bureau,
  "/certificaat": Certificaat,
  "/einde": Einde,
  "/beheer": Beheer,
};

function Page() {
  const { path } = useRouter();
  const Component = PAGES[path] ?? NotFound;
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Na navigatie de focus naar de inhoud verplaatsen, zodat schermlezers de nieuwe pagina oppakken.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
  }, [path]);

  return (
    <main id="inhoud" ref={main} tabIndex={-1} style={{ outline: "none" }}>
      <Suspense fallback={<div className="page-loading" aria-busy="true"><span className="label">Afdeling wordt geopend…</span></div>}>
        <Component key={path} />
      </Suspense>
    </main>
  );
}

export function App() {
  return (
      <RouterProvider>
        <GameProvider>
          <a className="skip-link" href="#inhoud">Direct naar de inhoud</a>
          <Header />
          <Page />
          <Footer />
          <Passport />
          <Toasts />
          <EasterEggs />
          <SeriousMode />
        </GameProvider>
      </RouterProvider>
  );
}
