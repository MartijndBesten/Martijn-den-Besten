import { describe, expect, it } from "vitest";
import { ANNOUNCEMENTS } from "../src/content/announcements";
import { DOMAIN_TLDS, generateDomain, generateIdea, IDEA_COMBINATIONS, REEL_COMBINATIONS, PLANS, generateBureauCase } from "../src/content/generators";
import { EGG_COUNT, MISSIONS } from "../src/content/progress";
import { seeded } from "../src/lib/random";
import { EXHIBIT_IDS, isVotableId, ROOMS } from "../shared/museum";
import { validateIdea } from "../shared/validation";

describe("inhoud", () => {
  it("heeft minstens twintig unieke mededelingen", () => {
    expect(ANNOUNCEMENTS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ANNOUNCEMENTS.map((a) => a.text)).size).toBe(ANNOUNCEMENTS.length);
  });
  it("heeft minstens vijftien verrassingen en acht missies", () => {
    expect(EGG_COUNT).toBeGreaterThanOrEqual(15);
    expect(MISSIONS.length).toBeGreaterThanOrEqual(4);
  });
  it("heeft vijf zichtbare zalen met unieke objecten", () => {
    expect(ROOMS).toHaveLength(5);
    expect(new Set(EXHIBIT_IDS).size).toBe(EXHIBIT_IDS.length);
  });
});

describe("generatoren", () => {
  it("kan ruim vijftig ideecombinaties maken", () => {
    expect(IDEA_COMBINATIONS).toBeGreaterThanOrEqual(50);
    expect(REEL_COMBINATIONS).toBeGreaterThanOrEqual(50);
    const rng = seeded(42);
    const titles = new Set(Array.from({ length: 60 }, () => generateIdea(rng).title));
    expect(titles.size).toBeGreaterThanOrEqual(50);
  });
  it("is deterministisch met dezelfde seed", () => {
    expect(generateIdea(seeded(7))).toEqual(generateIdea(seeded(7)));
  });
  it("verzint alleen domeinnamen met niet-bestaande extensies", () => {
    const rng = seeded(1);
    for (let i = 0; i < 200; i++) {
      const d = generateDomain(rng);
      expect(DOMAIN_TLDS.some((t) => d.name.endsWith(t))).toBe(true);
      expect(d.name).toMatch(/^[a-z0-9-]+\.[a-z]+$/);
    }
  });
  it("heeft genoeg plannen en bureau-dossiers", () => {
    expect(PLANS.length).toBeGreaterThanOrEqual(20);
    expect(generateBureauCase(seeded(3)).number).toMatch(/^BOI\/\d{4}\/\d{4}$/);
  });
});

describe("validatie", () => {
  const ok = { title: "Een fiets met wifi", description: "", category: "briljant" };
  it("accepteert een normaal idee en normaliseert witruimte", () => {
    const r = validateIdea({ ...ok, title: "  Een   fiets  " });
    expect(r.ok && r.value.title).toBe("Een fiets");
  });
  it.each([
    [{ ...ok, title: "ab" }],
    [{ ...ok, title: "www.spam.nl" }],
    [{ ...ok, description: "bel 06 12345678" }],
    [{ ...ok, description: "a@b.com" }],
    [{ ...ok, category: "x" }],
    [{ ...ok, title: "aaaaaaaaaaaaaaa" }],
    [null],
  ])("weigert %j", (input) => {
    expect(validateIdea(input).ok).toBe(false);
  });
  it("herkent stembare ID's", () => {
    expect(isVotableId("uitstel-app")).toBe(true);
    expect(isVotableId("inzending-12")).toBe(true);
    expect(isVotableId("inzending-x")).toBe(false);
    expect(isVotableId("<script>")).toBe(false);
  });
});
