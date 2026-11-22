// Deelverzoeken (HTTP Range) voor de Worker die de site zelf serveert: nodig om video op een iPhone af te spelen.
import { describe, expect, it } from "vitest";
import { leesBereik } from "../worker/bereik";

describe("leesBereik", () => {
  it("geen of onbekende Range-kop: het hele bestand", () => {
    expect(leesBereik(null, 1000)).toBeNull();
    expect(leesBereik("items=0-5", 1000)).toBeNull();
    expect(leesBereik("bytes=0-5,10-20", 1000)).toBeNull();
    expect(leesBereik("bytes=-", 1000)).toBeNull();
  });
  it("begin en eind, open eind en de laatste N bytes", () => {
    expect(leesBereik("bytes=0-1", 1000)).toEqual({ van: 0, tot: 1 }); // de proefvraag van Safari
    expect(leesBereik("bytes=100-199", 1000)).toEqual({ van: 100, tot: 199 });
    expect(leesBereik("bytes=900-", 1000)).toEqual({ van: 900, tot: 999 });
    expect(leesBereik("bytes=-100", 1000)).toEqual({ van: 900, tot: 999 });
    expect(leesBereik("bytes=-5000", 1000)).toEqual({ van: 0, tot: 999 });
  });
  it("een eind voorbij het bestand wordt afgekapt; een begin erbuiten is ongeldig", () => {
    expect(leesBereik("bytes=500-99999", 1000)).toEqual({ van: 500, tot: 999 });
    expect(leesBereik("bytes=1000-", 1000)).toBe("ongeldig");
    expect(leesBereik("bytes=5-2", 1000)).toBe("ongeldig");
    expect(leesBereik("bytes=-0", 1000)).toBe("ongeldig");
    expect(leesBereik("bytes=0-", 0)).toBe("ongeldig");
  });
});
