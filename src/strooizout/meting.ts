// Bezoekmeting zonder cookies: per pagina één melding met de herkomst (verwijzende site) en de bron (?via=flyer …).
// Bron en herkomst staan alleen in sessionStorage van deze tab, zodat een bestelling kan meegeven waar ze vandaan komt.
// Geen identificatie in de browser; de server telt een per dag wisselende hash (worker/strooizout.ts › bezoek).

const lees = (k: string) => {
  try {
    return sessionStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
};
const zet = (k: string, v: string) => {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* niet beschikbaar */
  }
};

/** Bij het openen: ?via=… en de verwijzende site onthouden (alleen de eerste keer in deze tab). */
function onthoud() {
  const via = new URLSearchParams(window.location.search).get("via");
  if (via && /^[a-z0-9][a-z0-9-]{0,23}$/i.test(via)) zet("strooizout:via", via.toLowerCase());
  if (!lees("strooizout:herkomst")) {
    let host = "direct";
    try {
      if (document.referrer) host = new URL(document.referrer).hostname;
    } catch {
      /* geen geldige verwijzer */
    }
    zet("strooizout:herkomst", host === window.location.hostname ? "direct" : host);
  }
}
if (typeof window !== "undefined") onthoud();

/** Bron en herkomst, om met een bestelling mee te sturen. */
export const herkomst = () => ({ bron: lees("strooizout:via"), herkomst: lees("strooizout:herkomst") || "direct" });

const PAGINA: Record<string, string> = {
  "/strooizout": "winkel",
  "/strooizout/bestellen": "winkel",
  "/strooizout/aan-de-weg": "aan-de-weg",
  "/strooizout/bestelling": "bestelling",
  "/strooizout/privacy": "info",
  "/strooizout/voorwaarden": "info",
  "/strooizout/flyer": "flyer",
};

/** Eén melding per paginaweergave; de server telt hooguit één bezoeker per pagina per dag. */
export function meldBezoek(pad: string) {
  const pagina = PAGINA[pad];
  if (!pagina || navigator.webdriver) return;
  const { bron, herkomst: h } = herkomst();
  void fetch("/api/strooizout/bezoek", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pagina, bron, herkomst: h }), keepalive: true }).catch(() => {});
}
