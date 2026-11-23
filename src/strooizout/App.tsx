// Strooizout voor de buurt: webshop op /strooizout, beheer op /strooizout/beheer. Eigen uiterlijk, eigen bundel.

import { lazy, Suspense, useEffect, useRef } from "react";
import { meldBezoek } from "./meting";
import { extern, RouterProvider, useRouter } from "./router";
import { MandProvider } from "./mandje";
import { WinkelProvider } from "./winkeldata";
import { Kop, Voet, Lade } from "./opmaak";
import { WinkelPagina } from "./winkel";

const Afrekenen = lazy(() => import("./afrekenen"));
const Status = lazy(() => import("./status"));
const Privacy = lazy(() => import("./info").then((m) => ({ default: m.Privacy })));
const Voorwaarden = lazy(() => import("./info").then((m) => ({ default: m.Voorwaarden })));
const Flyer = lazy(() => import("./flyer"));
const Beheer = lazy(() => import("./beheer/Beheer"));
const AanDeWeg = lazy(() => import("./aandeweg"));

const PAGINAS: Record<string, React.ComponentType> = {
  "/strooizout": WinkelPagina,
  "/strooizout/bestellen": Afrekenen,
  "/strooizout/bestelling": Status,
  "/strooizout/privacy": Privacy,
  "/strooizout/voorwaarden": Voorwaarden,
};

function NietGevonden() {
  return (
    <section className="sz-tekstpagina">
      <div className="sz-wrap sz-tekstpagina__in">
        <h1>Deze pagina bestaat niet</h1>
        <p>
          Ga terug naar <a href={extern("/strooizout")}>de webshop</a>.
        </p>
      </div>
    </section>
  );
}

function Laden() {
  return (
    <div className="sz-laden" aria-busy="true">
      <span>Even laden…</span>
    </div>
  );
}

function Pagina() {
  const { pad } = useRouter();
  const main = useRef<HTMLElement>(null);
  const eerste = useRef(true);
  useEffect(() => meldBezoek(pad), [pad]);
  useEffect(() => {
    if (eerste.current) {
      eerste.current = false;
      return;
    }
    main.current?.focus({ preventScroll: true });
  }, [pad]);

  // Beheer en flyer hebben een eigen schil (geen webshopkop, mandje of voet).
  if (pad === "/strooizout/beheer") return <Suspense fallback={<Laden />}><Beheer /></Suspense>;
  if (pad === "/strooizout/flyer") return <Suspense fallback={<Laden />}><Flyer /></Suspense>;
  if (pad === "/strooizout/aan-de-weg")
    return (
      <>
        <Suspense fallback={<Laden />}>
          <AanDeWeg />
        </Suspense>
        <Voet />
      </>
    );

  const Component = PAGINAS[pad] ?? NietGevonden;
  return (
    <>
      <a className="sz-skip" href="#sz-inhoud">Direct naar de inhoud</a>
      <Kop />
      <main id="sz-inhoud" ref={main} tabIndex={-1} style={{ outline: "none" }}>
        <Suspense fallback={<Laden />}>
          <Component key={pad} />
        </Suspense>
      </main>
      <Voet />
      <Lade />
    </>
  );
}

function MetGegevens() {
  const { pad } = useRouter();
  return (
    <WinkelProvider actief={pad !== "/strooizout/beheer"}>
      <MandProvider>
        <Pagina />
      </MandProvider>
    </WinkelProvider>
  );
}

export function App() {
  return (
    <RouterProvider>
      <MetGegevens />
    </RouterProvider>
  );
}
