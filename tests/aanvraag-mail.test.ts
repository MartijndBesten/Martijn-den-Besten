// De HTML-versie van de aanvraagmail (worker/aanvraag-mail.ts): het sjabloon van Martijn, de plaatshouders, wat
// vervalt als een gegeven ontbreekt, en dat er nooit ruwe invoer van een bezoeker in de HTML komt.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { KNOP_ANTWOORD, REGEL_ANTWOORD, REGEL_WAAR, SJABLOON, escHtml, kort, maakHtml, type MailVelden } from "../worker/aanvraag-mail";
import { maakBericht, type Aanvraag } from "../worker/aanvraag";

const NU = Math.floor(Date.UTC(2026, 10, 16, 9, 0, 0) / 1000); // maandag 16 november 2026, 10:00 in Nederland
const velden = (extra: Partial<MailVelden> = {}): MailVelden => ({
  nummer: 12,
  soort: "gemist gedeelte",
  vraag: "Ik mis het verhaal van Hizkia.",
  wanneer: "maandag 16 november 2026 om 10:00",
  waar: "bijbelreis.nl/#jakob/7",
  antwoord: "ouder@voorbeeld.example",
  ...extra,
});
const aanvraag = (extra: Partial<Aanvraag> = {}): Aanvraag => ({ soort: "gemist", tekst: "Ik mis het verhaal van Hizkia.", email: "ouder@voorbeeld.example", context: "#jakob/7", ...extra });
// Witruimte tussen tags en woorden telt in HTML niet: alles naar één spatie, en geen spatie direct rond een tag.
const plat = (s: string) => s.replace(/\s+/g, " ").replace(/> </g, "><").replace(/ ?(<[^>]+>) ?/g, "$1").trim();
const tekstVan = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

describe("aanvraagmail: het sjabloon", () => {
  const origineel = readFileSync("tests/fixtures/aanvraagmail-sjabloon.html", "utf8");

  it("met alle gegevens is de HTML precies het aangeleverde sjabloon met de plaatshouders ingevuld", () => {
    const v = velden();
    const verwacht = origineel
      .replaceAll("{{NUMMER}}", "12")
      .replaceAll("{{SOORT}}", v.soort)
      .replaceAll("{{VRAAG_KORT}}", v.vraag)
      .replaceAll("{{VRAAG}}", v.vraag)
      .replaceAll("{{WANNEER}}", v.wanneer)
      .replaceAll("{{WAAR}}", v.waar)
      .replaceAll("{{ANTWOORD}}", v.antwoord);
    expect(plat(maakHtml(v))).toBe(plat(verwacht));
  });

  it("het sjabloon en de drie losse stukken bevatten samen dezelfde plaatshouders als het origineel", () => {
    const namen = (s: string) => [...new Set([...s.matchAll(/\{\{([A-Z_]+)\}\}/g)].map((m) => m[1]))].sort();
    expect(namen(origineel)).toEqual(["ANTWOORD", "NUMMER", "SOORT", "VRAAG", "VRAAG_KORT", "WAAR", "WANNEER"]);
    expect(namen(SJABLOON + KNOP_ANTWOORD + REGEL_WAAR + REGEL_ANTWOORD)).toEqual(["ANTWOORD", "ANTWOORD_HREF", "KNOP_ANTWOORD", "NUMMER", "REGEL_ANTWOORD", "REGEL_WAAR", "SOORT", "VRAAG", "VRAAG_KORT", "WAAR", "WANNEER"]);
    // Na het invullen blijft er nooit een plaatshouder staan.
    for (const v of [velden(), velden({ waar: "" }), velden({ antwoord: "" }), velden({ waar: "", antwoord: "" })]) expect(maakHtml(v)).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("laadt niets van buiten: geen afbeelding, script, lettertype of stijlblad; alleen de twee bedoelde links", () => {
    const html = maakHtml(velden());
    expect(html).not.toMatch(/<(img|script|link|iframe|object|embed|form|input|video|audio|svg)\b/i);
    expect(html).not.toMatch(/url\(|@import|@font-face|\son[a-z]+=/i);
    expect([...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1])).toEqual(["https://martijndenbesten.com/beheer", "mailto:ouder@voorbeeld.example", "mailto:ouder@voorbeeld.example"]);
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain("@media (prefers-color-scheme: dark)");
  });
});

describe("aanvraagmail: wat vervalt als een gegeven ontbreekt", () => {
  it("zonder plaats geen regel ‘Waar’; de rest blijft", () => {
    const html = maakHtml(velden({ waar: "" }));
    expect(html).not.toContain(">Waar<");
    expect(tekstVan(html)).toContain("Wanneer maandag 16 november 2026 om 10:00 Antwoord naar ouder@voorbeeld.example");
    expect(html).toContain(">Antwoorden</a>");
  });

  it("zonder e-mailadres geen knop ‘Antwoorden’ en geen regel ‘Antwoord naar’, en nergens een mailto", () => {
    const html = maakHtml(velden({ antwoord: "" }));
    expect(html).not.toContain("Antwoorden");
    expect(html).not.toContain("Antwoord naar");
    expect(html).not.toContain("mailto:");
    expect(tekstVan(html)).toContain("Wanneer maandag 16 november 2026 om 10:00 Waar bijbelreis.nl/#jakob/7 Verstuurd door");
    expect(html).toContain(">Afhandelen in beheer</a>");
  });

  it("zonder plaats en zonder e-mailadres staat er alleen ‘Wanneer’, zonder losse regeleinden", () => {
    const html = maakHtml(velden({ waar: "", antwoord: "" }));
    expect(tekstVan(html)).toContain("Wanneer maandag 16 november 2026 om 10:00 Verstuurd door");
    const cel = html.slice(html.indexOf(">Wanneer<"), html.indexOf("Verstuurd door"));
    expect(cel).not.toContain("<br>");
  });
});

describe("aanvraagmail: invoer van een bezoeker wordt nooit HTML", () => {
  it("tekens met een betekenis in HTML worden ge-escaped, ook in het attribuut van de mailto", () => {
    expect(escHtml(`<a href="x" onclick='y'>&`)).toBe("&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;");
    const html = maakHtml(velden({ vraag: `<script>alert(1)</script> <img src=x onerror=alert(1)> "citaat" & 'enkel' </div></td></table>` }));
    expect(html).not.toMatch(/<script|<img|onerror=alert\(1\)>/);
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &lt;img src=x onerror=alert(1)&gt; &quot;citaat&quot; &amp; &#39;enkel&#39; &lt;/div&gt;&lt;/td&gt;&lt;/table&gt;");
    // De opbouw is niet veranderd: evenveel tabellen en cellen als zonder die tekst.
    const tel = (s: string, wat: string) => s.split(wat).length - 1;
    for (const tag of ["<table", "</table>", "<td", "</td>", "<div", "</div>", "<a ", "</a>"]) expect(tel(html, tag), tag).toBe(tel(maakHtml(velden()), tag));
  });

  it("regeleinden in de vraag worden een nieuwe regel; de voorvertoning is één regel van ongeveer honderd tekens", () => {
    const vraag = "Eerste regel.\nTweede regel met <b>.\r\nDerde regel.";
    const html = maakHtml(velden({ vraag }));
    expect(html).toContain("Eerste regel.<br>\nTweede regel met &lt;b&gt;.<br>\nDerde regel.");
    expect(html).toContain('opacity:0;">Eerste regel. Tweede regel met &lt;b&gt;. Derde regel.</div>');
    const lang = "Staat het verhaal van koning Hizkia en de zonnewijzer er ook in? ".repeat(6).trim();
    expect([...kort(lang)].length).toBeLessThanOrEqual(101);
    expect(kort(lang).endsWith("…")).toBe(true);
    expect(kort(lang)).not.toMatch(/\s…$/);
    expect(kort("Kort.")).toBe("Kort.");
    expect(kort("  met \n\n witruimte  ")).toBe("met witruimte");
    expect(kort("ë".repeat(150))).toBe("ë".repeat(100) + "…"); // telt tekens, geen bytes, en breekt geen teken
  });

  it("een waarde die zelf op een plaatshouder lijkt, wordt niet opnieuw ingevuld", () => {
    const html = maakHtml(velden({ vraag: "Wat is {{ANTWOORD}} en {{WAAR}} en {{KNOP_ANTWOORD}}?", antwoord: "" }));
    expect(html).toContain("Wat is {{ANTWOORD}} en {{WAAR}} en {{KNOP_ANTWOORD}}?");
    expect(html).not.toContain("mailto:");
  });

  it("een bijzonder maar geldig adres blijft leesbaar in de tekst en veilig in de mailto", () => {
    const html = maakHtml(velden({ antwoord: "jan+bijbel%test@voorbeeld.example" }));
    expect(html).toContain(">jan+bijbel%test@voorbeeld.example</a>");
    expect(html).toContain('href="mailto:jan%2Bbijbel%25test@voorbeeld.example"');
  });
});

describe("aanvraagmail: het bericht dat de Worker verstuurt", () => {
  it("onderwerp ‘Aanvraag #N - soort’; de HTML heeft nummer, soort, vraag, tijd, plaats en antwoordadres", () => {
    const b = maakBericht(12, aanvraag(), NU);
    expect(b.onderwerp).toBe("Aanvraag #12 - gemist gedeelte");
    expect(b.onderwerp).toMatch(/^[\x20-\x7E]+$/); // gewone tekens: geen codering nodig in de kopregel
    expect(b.replyTo).toBe("ouder@voorbeeld.example");
    const t = tekstVan(b.html);
    expect(t).toContain("Bijbelreis · nieuwe aanvraag #12".replace("·", "&middot;"));
    expect(t).toContain("gemist gedeelte Ik mis het verhaal van Hizkia. Afhandelen in beheer Antwoorden");
    expect(t).toContain("Wanneer maandag 16 november 2026 om 10:00 Waar bijbelreis.nl/#jakob/7 Antwoord naar ouder@voorbeeld.example");
    // De platte tekst blijft de terugval, met dezelfde gegevens.
    expect(b.tekst).toContain("Waar: https://bijbelreis.nl/#jakob/7");
    expect(b.tekst).toContain("Antwoorden naar: ouder@voorbeeld.example");
  });

  it("elke soort in gewone taal, in het onderwerp en in de HTML", () => {
    for (const [soort, woorden] of [["gemist", "gemist gedeelte"], ["groep", "school, club of kerk"], ["fout", "fout of verbetering"], ["anders", "iets anders"]] as const) {
      const b = maakBericht(3, aanvraag({ soort }), NU);
      expect(b.onderwerp).toBe(`Aanvraag #3 - ${woorden}`);
      expect(b.html).toContain(`text-transform:uppercase;">${woorden}</p>`);
    }
  });

  it("zonder plaats en zonder (geldig) e-mailadres vervallen de regels en de knop, en is er geen antwoordadres", () => {
    for (const email of ["", "geen-adres", "a@voorbeeld.example\r\nBcc: kwaad@voorbeeld.example"]) {
      const b = maakBericht(4, aanvraag({ email, context: "" }), NU);
      expect(b.replyTo).toBe("");
      expect(b.html).not.toContain("mailto:");
      expect(b.html).not.toContain(">Waar<");
      expect(b.html).not.toContain("Antwoord");
      expect(b.html).not.toContain("kwaad@");
    }
  });
});
