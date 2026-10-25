// De uitvindingen van de ideeënmachine. Alles is lokaal samengesteld: geen AI-API, wel veel combinaties.
// Een uitvinding = (bijvoeglijk naamwoord) + onderwerp + apparaat (+ modelaanduiding), met een beschrijving
// die bij het apparaat hoort. Daarnaast een handvol met de hand geschreven klassiekers.

import { pick, type Rng } from "../lib/random";

export type Tone = "koraal" | "kobalt" | "salie" | "lila" | "boter";
export type FigKind = "propeller" | "schaar" | "ringen" | "antenne" | "wijzer" | "schoorsteen" | "veer" | "trechter" | "wolk" | "dubbel";

export type Invention = {
  name: string;
  description: string;
  patent: string;
  status: string;
  tone: Tone;
  fig: FigKind;
  seed: number;
  mega?: boolean;
  gold?: boolean;
};

type Topic = { stem: string; what: string; pl?: boolean };
type Device = { suffix: string; fig: FigKind; text: (t: Topic) => string };

const v = (t: Topic, sg: string, pl: string) => (t.pl ? pl : sg);

export const TOPICS: Topic[] = [
  { stem: "Uitstel", what: "het uitstellen van belangrijke klussen" },
  { stem: "Vergader", what: "iedere vergadering" },
  { stem: "Ideeën", what: "nieuwe ideeën", pl: true },
  { stem: "Koffie", what: "de koffiepauze" },
  { stem: "Maandag", what: "de maandagochtend" },
  { stem: "Deadline", what: "elke deadline" },
  { stem: "Inbox", what: "een overvolle inbox" },
  { stem: "Sokken", what: "losse sokken", pl: true },
  { stem: "Planning", what: "de weekplanning" },
  { stem: "Twijfel", what: "gezonde twijfel" },
  { stem: "Smoesjes", what: "goede smoesjes", pl: true },
  { stem: "Brainstorm", what: "een brainstormsessie" },
  { stem: "Takenlijst", what: "de takenlijst" },
  { stem: "Domeinnamen", what: "ongebruikte domeinnamen", pl: true },
  { stem: "Schuur", what: "de schuur" },
  { stem: "Zondag", what: "de zondagmiddag" },
  { stem: "Hobby", what: "een nieuwe hobby" },
  { stem: "Wachtrij", what: "de wachtrij" },
  { stem: "Thermostaat", what: "de discussie over de thermostaat" },
  { stem: "Voornemens", what: "goede voornemens", pl: true },
];

export const DEVICES: Device[] = [
  { suffix: "versneller", fig: "propeller", text: (t) => `Versnelt alles rondom ${t.what}, behalve het eindresultaat.` },
  { suffix: "verkorter", fig: "schaar", text: (t) => `Brengt ${t.what} terug tot de kern: een afspraak om er later op terug te komen.` },
  { suffix: "stabilisator", fig: "ringen", text: (t) => `Voorkomt dat ${t.what} langer dan twaalf minuten hetzelfde ${v(t, "blijft", "blijven")}.` },
  { suffix: "verdubbelaar", fig: "dubbel", text: (t) => `Verdubbelt ${t.what}. Op verzoek ook driedubbel, maar daar is nog geen knop voor.` },
  { suffix: "vertrager", fig: "wijzer", text: (t) => `Rekt ${t.what} op tot een officieel meerjarenplan met tussentijdse evaluaties.` },
  { suffix: "detector", fig: "antenne", text: (t) => `Piept zodra ${t.what} in de buurt ${v(t, "komt", "komen")}. Piept ook als dat niet zo is.` },
  { suffix: "omvormer", fig: "veer", text: (t) => `Zet ${t.what} om in een gezellig gesprek over iets heel anders.` },
  { suffix: "teller", fig: "wijzer", text: (t) => `Houdt nauwkeurig bij hoe vaak ${t.what} ter sprake ${v(t, "komt", "komen")}. Uitkomst: vaak.` },
  { suffix: "generator", fig: "schoorsteen", text: (t) => `Produceert de hele dag door ${t.what}. Een uit-stand is niet voorzien.` },
  { suffix: "verzachter", fig: "wolk", text: (t) => `Maakt ${t.what} zachter, ronder en een stuk minder dringend.` },
  { suffix: "katapult", fig: "veer", text: (t) => `Lanceert ${t.what} met grote snelheid richting volgende week.` },
  { suffix: "filter", fig: "trechter", text: (t) => `Haalt alle haast uit ${t.what}. Wat overblijft, smaakt naar koffie.` },
  { suffix: "kompas", fig: "wijzer", text: (t) => `Wijst altijd de kortste weg naar ${t.what}, via een kleine omweg.` },
  { suffix: "voorspeller", fig: "antenne", text: (t) => `Voorspelt ${t.what} met honderd procent zekerheid. Achteraf.` },
  { suffix: "schakelaar", fig: "ringen", text: (t) => `Zet ${t.what} met één klik aan, uit en daarna weer twijfelachtig aan.` },
  { suffix: "automaat", fig: "trechter", text: (t) => `Levert ${t.what} op bestelling, verpakt in een doosje met een strik.` },
];

const ADJECTIVES = [
  "Automatische",
  "Draagbare",
  "Zelfdenkende",
  "Halfautomatische",
  "Omgekeerde",
  "Draadloze",
  "Opvouwbare",
  "Universele",
  "Hydraulische",
  "Ambachtelijke",
  "Turbo-",
  "Stille",
] as const;

const MODELS = [" 3000", " Pro", " Mk II", " XL", " (bèta)", " Mini", " Deluxe", " 2.0", " Huiskamereditie"] as const;

export const STATUSES: { text: string; tone: Tone }[] = [
  { text: "In behandeling", tone: "kobalt" },
  { text: "Volstrekt overbodig", tone: "koraal" },
  { text: "Voorlopig goedgekeurd", tone: "salie" },
  { text: "Goedgekeurd door zichzelf", tone: "salie" },
  { text: "Afgewezen: te logisch", tone: "koraal" },
  { text: "Wacht op koffie", tone: "boter" },
  { text: "Aangevraagd in 2019", tone: "lila" },
  { text: "Bijna af", tone: "boter" },
  { text: "Onder voorbehoud", tone: "kobalt" },
  { text: "Handleiding kwijt", tone: "lila" },
  { text: "Te mooi om te bouwen", tone: "lila" },
  { text: "Patent op het patent aangevraagd", tone: "kobalt" },
];

/** Met de hand geschreven klassiekers. Komen af en toe langs, nooit twee keer kort na elkaar. */
export const CLASSICS: { name: string; description: string; fig: FigKind }[] = [
  { name: "De Automatische Uitstelversneller", description: "Versnelt het proces waarmee belangrijke werkzaamheden worden uitgesteld.", fig: "propeller" },
  { name: "De Vergaderverkorter 3000", description: "Reduceert iedere vergadering tot de conclusie dat er een nieuwe vergadering nodig is.", fig: "schaar" },
  { name: "De Ideeënstabilisator", description: "Voorkomt dat een nieuw idee langer dan twaalf minuten hetzelfde blijft.", fig: "ringen" },
  { name: "De Zelfvouwende Takenlijst", description: "Vouwt zichzelf zo klein op dat er niets meer op lijkt te staan. Geruststellend.", fig: "dubbel" },
  { name: "De Koffie-tot-Plan-Omvormer", description: "Zet elk kopje koffie om in precies één nieuw plan. Werkt helaas ook andersom niet.", fig: "schoorsteen" },
  { name: "Het Draagbare Excuus", description: "Een opvouwbaar excuus voor onderweg. Past in elke binnenzak en elke vergadering.", fig: "veer" },
  { name: "De Mapjesmaker", description: "Maakt automatisch een mapje voor elk idee, en een mapje voor de mapjes.", fig: "trechter" },
  { name: "De Wekker die Snoozet voor u", description: "Drukt zelf op snooze, zodat u dat niet meer hoeft te doen. Tijdwinst: nul.", fig: "wijzer" },
  { name: "De Inspiratiemagneet", description: "Trekt ideeën aan op de minst handige momenten: onder de douche en vlak voor het slapen.", fig: "antenne" },
  { name: "Het Halfvolle Glas", description: "Blijft altijd precies halfvol. Optimisten en pessimisten zijn het voor het eerst eens: irritant.", fig: "wolk" },
  { name: "De Deadlinekatapult", description: "Schiet elke deadline vriendelijk maar beslist een week vooruit.", fig: "veer" },
  { name: "De Brainstormbril", description: "Laat alles wat u ziet eruitzien als een kans. Ook de afwas.", fig: "ringen" },
  { name: "De Omgekeerde Postbus", description: "Stuurt uw post terug naar de afzender met het verzoek het iets korter te houden.", fig: "trechter" },
  { name: "De Gedachtenparkeerplaats", description: "Een veilige plek voor gedachten die u later nog wilt hebben. Parkeren is gratis, ophalen niet.", fig: "dubbel" },
  { name: "De Zondagsverlenger", description: "Rekt de zondagmiddag op tot maandagochtend. Bijwerkingen: maandagochtend.", fig: "wijzer" },
  { name: "Het Projectkompas", description: "Wijst altijd naar het project waar u nét niet mee bezig bent.", fig: "wijzer" },
];

/** Veel te grote ideeën: komen pas na een flink aantal pogingen. */
export const MEGA: { name: string; description: string }[] = [
  { name: "Het Ministerie van Bijna Af", description: "Een complete overheidsdienst die alle onafgemaakte projecten van het land beheert. Opening: binnenkort." },
  { name: "Een Tweede Dinsdag", description: "Een extra dag tussen dinsdag en woensdag, uitsluitend bestemd voor projecten die op dinsdag niet af kwamen." },
  { name: "De Alles-Tegelijk-Machine", description: "Doet alles tegelijk, zodat niets meer hoeft te wachten. Past niet in de schuur. Past niet in de straat." },
  { name: "Het Nationale Ideeënreservoir", description: "Een stuwmeer vol ideeën, zodat er in droge tijden altijd iets te bedenken valt." },
  { name: "Een Snelweg naar Later", description: "Twaalf rijstroken, allemaal richting later. Geen afslagen. Wel een wegrestaurant." },
];

/** Gouden modus: de windvaan op de machine draait op goud. */
export const GOLDEN: { name: string; description: string }[] = [
  { name: "De Gouden Afmaakknop", description: "Eén druk en het project is af. Het prototype wacht nog op een knop." },
  { name: "De Tijdverruimer", description: "Voegt aan elke dag één uur toe. Uitsluitend te gebruiken voor nieuwe ideeën." },
  { name: "Het Eeuwige Kopje Koffie", description: "Blijft warm, blijft vol, blijft lekker. De rest van het instituut is jaloers." },
  { name: "De Rustknop die Werkt", description: "Een knop voor ‘even niets doen’ die niet in de war raakt. Wetenschappelijk onmogelijk, toch gebouwd." },
  { name: "Het Idee dat Zichzelf Uitvoert", description: "Bedenkt zichzelf, plant zichzelf en voert zichzelf uit. U hoeft alleen te knikken." },
];

const TONES: Tone[] = ["koraal", "kobalt", "salie", "lila", "boter"];
const FIGS: FigKind[] = ["propeller", "schaar", "ringen", "antenne", "wijzer", "schoorsteen", "veer", "trechter", "wolk", "dubbel"];

function patentNumber(rng: Rng): string {
  return `NL-${2019 + Math.floor(rng() * 8)}/${String(Math.floor(rng() * 9000) + 1000)}`;
}

/** Een samengestelde uitvinding, bijvoorbeeld ‘De Draagbare Koffieverdubbelaar Pro’. */
export function composeInvention(rng: Rng = Math.random): Pick<Invention, "name" | "description" | "fig"> {
  const t = pick(TOPICS, rng);
  const d = pick(DEVICES, rng);
  const adj = rng() < 0.55 ? pick(ADJECTIVES, rng) : "";
  const model = rng() < 0.4 ? pick(MODELS, rng) : "";
  const core = `${t.stem}${d.suffix}`;
  const name = adj.endsWith("-") ? `De ${adj}${core.toLowerCase()}${model}` : `De ${adj ? adj + " " : ""}${core}${model}`;
  return { name, description: d.text(t), fig: d.fig };
}

export const COMBINATIONS = TOPICS.length * DEVICES.length * (ADJECTIVES.length + 1) * (MODELS.length + 1);

export type InventionOptions = { mega?: boolean; gold?: boolean; avoid?: string[] };

export function generateInvention(rng: Rng = Math.random, opts: InventionOptions = {}): Invention {
  const seed = Math.floor(rng() * 1e9);
  const base = { patent: patentNumber(rng), seed, tone: pick(TONES, rng) };
  if (opts.gold) {
    const g = pick(GOLDEN, rng);
    return { ...base, ...g, fig: pick(FIGS, rng), status: "Officieel geniaal", tone: "boter", gold: true };
  }
  if (opts.mega) {
    const m = pick(MEGA, rng);
    return { ...base, ...m, fig: "dubbel", status: "Te groot voor het octrooibureau", tone: "koraal", mega: true };
  }
  const status = pick(STATUSES, rng);
  const avoid = new Set(opts.avoid ?? []);
  const fresh = CLASSICS.filter((c) => !avoid.has(c.name));
  let parts: Pick<Invention, "name" | "description" | "fig">;
  if (fresh.length && rng() < 0.28) parts = pick(fresh, rng);
  else {
    parts = composeInvention(rng);
    for (let i = 0; i < 5 && avoid.has(parts.name); i++) parts = composeInvention(rng);
  }
  return { ...base, ...parts, status: status.text, tone: status.tone };
}
