// Deelverzoeken (HTTP Range) voor bestanden die de Worker zelf serveert. iPhones spelen een <video> alleen af als de
// server op `Range: bytes=…` antwoordt met 206 en het gevraagde stuk; zonder dit blijft de speler leeg.

export type Bereik = { van: number; tot: number };

/**
 * Leest een Range-kop voor een bestand van `grootte` bytes.
 * Geeft het gevraagde stuk (inclusief grenzen), `null` als er geen (bruikbare) Range-kop is en het hele bestand
 * gestuurd moet worden, of "ongeldig" als het bereik buiten het bestand valt (antwoord 416).
 */
export function leesBereik(kop: string | null, grootte: number): Bereik | null | "ongeldig" {
  if (!kop) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(kop.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null; // meerdere bereiken of onbekende eenheid: gewoon alles sturen
  if (grootte <= 0) return "ongeldig";
  if (m[1] === "") {
    // de laatste N bytes
    const n = Number(m[2]);
    if (n <= 0) return "ongeldig";
    return { van: Math.max(0, grootte - n), tot: grootte - 1 };
  }
  const van = Number(m[1]);
  const tot = m[2] === "" ? grootte - 1 : Math.min(Number(m[2]), grootte - 1);
  if (van >= grootte || tot < van) return "ongeldig";
  return { van, tot };
}
