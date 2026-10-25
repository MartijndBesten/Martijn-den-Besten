import { describe, expect, it } from "vitest";
import { CLASSICS, COMBINATIONS, DEVICES, GOLDEN, MEGA, TOPICS, composeInvention, generateInvention } from "../src/content/inventions";
import { readTime } from "../src/components/Announcements";
import { seeded } from "../src/lib/random";

describe("uitvindingen van de ideeënmachine", () => {
  it("heeft genoeg variatie om herhaald gebruik leuk te houden", () => {
    expect(COMBINATIONS).toBeGreaterThan(10000);
    const rng = seeded(2026);
    const names = new Set(Array.from({ length: 200 }, () => generateInvention(rng).name));
    expect(names.size).toBeGreaterThanOrEqual(150);
  });

  it("bevat de klassiekers uit de opdracht", () => {
    const names = CLASSICS.map((c) => c.name);
    expect(names).toContain("De Automatische Uitstelversneller");
    expect(names).toContain("De Vergaderverkorter 3000");
    expect(names).toContain("De Ideeënstabilisator");
  });

  it("maakt nette namen en zinnen voor elke combinatie van onderwerp en apparaat", () => {
    for (const t of TOPICS) {
      for (const d of DEVICES) {
        const text = d.text(t);
        expect(text).toMatch(/^[A-Z].*[.]$/);
        expect(text).not.toMatch(/undefined|\s{2}/);
      }
    }
    const rng = seeded(5);
    for (let i = 0; i < 300; i++) {
      const { name } = composeInvention(rng);
      expect(name).toMatch(/^De \S/);
      expect(name).not.toMatch(/undefined|\s{2}|- /);
    }
  });

  it("vervoegt werkwoorden bij meervoud correct", () => {
    const sokken = TOPICS.find((t) => t.stem === "Sokken")!;
    const stabilisator = DEVICES.find((d) => d.suffix === "stabilisator")!;
    expect(stabilisator.text(sokken)).toContain("hetzelfde blijven.");
    const koffie = TOPICS.find((t) => t.stem === "Koffie")!;
    expect(stabilisator.text(koffie)).toContain("hetzelfde blijft.");
  });

  it("levert altijd een volledige octrooikaart", () => {
    const rng = seeded(11);
    for (let i = 0; i < 100; i++) {
      const inv = generateInvention(rng);
      expect(inv.patent).toMatch(/^NL-20\d\d\/\d{4}$/);
      expect(inv.status.length).toBeGreaterThan(3);
      expect(inv.description.length).toBeGreaterThan(20);
    }
  });

  it("kent een mega- en een gouden modus", () => {
    const mega = generateInvention(seeded(3), { mega: true });
    expect(mega.mega).toBe(true);
    expect(MEGA.map((m) => m.name)).toContain(mega.name);
    const gold = generateInvention(seeded(3), { gold: true });
    expect(gold.status).toBe("Officieel geniaal");
    expect(GOLDEN.map((g) => g.name)).toContain(gold.name);
  });

  it("herhaalt recente klassiekers niet", () => {
    const avoid = CLASSICS.map((c) => c.name);
    const rng = seeded(9);
    for (let i = 0; i < 100; i++) expect(avoid).not.toContain(generateInvention(rng, { avoid }).name);
  });
});

describe("mededelingen", () => {
  it("geven lange teksten meer leestijd, met een minimum van zeven seconden", () => {
    expect(readTime("Kort.")).toBe(7000);
    const long = "x".repeat(160);
    expect(readTime(long)).toBeGreaterThan(readTime("x".repeat(80)));
    expect(readTime(long)).toBeGreaterThanOrEqual(3000 + 160 * 70);
  });
});
