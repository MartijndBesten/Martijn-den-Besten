// Validatie van ingezonden ideeën. Wordt zowel in de browser als in de worker gebruikt,
// zodat de regels op één plek staan. De worker is leidend: de browser is alleen een hulpje.

export const LIMITS = {
  titleMin: 3,
  titleMax: 80,
  descriptionMax: 500,
  minFillMs: 2500,
} as const;

export const CATEGORIES = ["briljant", "bijna-af", "domeinnaam", "morgen", "onnodig"] as const;
export type Category = (typeof CATEGORIES)[number];

export type IdeaInput = {
  title: string;
  description: string;
  category: Category;
};

export type ValidationResult = { ok: true; value: IdeaInput } | { ok: false; error: string };

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|io|info|biz|top|click)\b\/?)/i;
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const PHONE_PATTERN = /(\+?\d[\d\s-]{8,}\d)/;
// Controletekens behalve gewone regeleinden.
const CONTROL_PATTERN = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g;

export function normalizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(CONTROL_PATTERN, "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function validateIdea(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Het formulier is leeg aangekomen." };
  const data = raw as Record<string, unknown>;
  const title = normalizeText(data.title);
  const description = normalizeText(data.description ?? "");
  const category = typeof data.category === "string" ? data.category : "";

  if (title.length < LIMITS.titleMin) return { ok: false, error: "Geef uw idee een titel van minimaal 3 tekens." };
  if (title.length > LIMITS.titleMax) return { ok: false, error: `De titel mag maximaal ${LIMITS.titleMax} tekens zijn.` };
  if (title.includes("\n")) return { ok: false, error: "De titel past op één regel, net als een goed idee." };
  if (description.length > LIMITS.descriptionMax)
    return { ok: false, error: `De toelichting mag maximaal ${LIMITS.descriptionMax} tekens zijn.` };
  if (!(CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: "Kies een afdeling voor uw idee." };

  const combined = `${title}\n${description}`;
  if (URL_PATTERN.test(combined)) return { ok: false, error: "Links zijn niet toegestaan. Het loket accepteert alleen ideeën." };
  if (EMAIL_PATTERN.test(combined) || PHONE_PATTERN.test(combined))
    return { ok: false, error: "Laat persoonsgegevens zoals e-mailadressen en telefoonnummers weg." };
  if (/(.)\1{9,}/.test(combined)) return { ok: false, error: "Dat zijn wel heel veel dezelfde tekens achter elkaar." };

  return { ok: true, value: { title, description, category: category as Category } };
}
