// Bouwstenen voor alle generatoren op de site. Alles is lokaal: geen AI-API nodig voor een grapje.

import { pick, type Rng } from "../lib/random";

// ---------- Ideeën (Control Center, hero-machine, Ideeëngenerator) ----------

export const IDEA_OBJECTS = [
  "Een broodrooster",
  "Een fietsbel",
  "Een paraplu",
  "Een koffiemok",
  "Een tuinkabouter",
  "Een deurmat",
  "Een boodschappenlijstje",
  "Een wasknijper",
  "Een vergadering",
  "Een kliko",
  "Een sok",
  "Een plantenbak",
  "Een agenda",
  "Een theepot",
  "Een schuurdeur",
  "Een pizzaschep",
] as const;

export const IDEA_FEATURES = [
  "met wifi",
  "met een eigen podcast",
  "op zonne-energie",
  "met een abonnement",
  "die terugpraat",
  "met blockchain",
  "met een tweede versie van zichzelf",
  "die van mening verandert",
  "met spraakbesturing in het Fries",
  "die alleen op dinsdag werkt",
  "met ingebouwde excuses",
  "met een dashboard",
  "die applaudisseert",
  "met een reservedomeinnaam",
  "in de vorm van een driehoek",
  "met turbostand",
] as const;

export const IDEA_PURPOSES = [
  "zodat u op afstand kunt zien dat er nog niets is gebeurd.",
  "om eindelijk iets te hebben om over te vergaderen.",
  "omdat het kan, en dat is het voornaamste argument.",
  "voor de momenten dat u net te veel tijd over heeft (nooit).",
  "zodat uitstel voortaan meetbaar wordt.",
  "om de buren te laten zien dat er plannen zijn.",
  "waarna het project direct drie nieuwe projecten oplevert.",
  "en natuurlijk met een bijbehorende website.",
  "zodat niemand meer hoeft te zeggen: ‘Daar had iemand eens iets voor moeten bedenken.’",
  "met een lancering die gepland staat voor ‘binnenkort’.",
  "om de efficiëntie met 0,4% te verhogen.",
  "zodat het in het museum kan zodra het bijna af is.",
  "want de vorige versie was te af.",
  "ter ondersteuning van een ander idee dat nog niet bestaat.",
  "met een gebruiksaanwijzing van 140 pagina’s.",
  "omdat er nog plek was in de schuur.",
] as const;

export type Idea = { title: string; description: string; serial: string };

/** Hoe hoger de creativiteit, hoe gekker het idee: vanaf 7 twee eigenschappen, vanaf 10 ook nog in drievoud. */
export function generateIdea(rng: Rng = Math.random, creativity = 3): Idea {
  const f1 = pick(IDEA_FEATURES, rng);
  let title = `${pick(IDEA_OBJECTS, rng)} ${f1}`;
  if (creativity >= 7) {
    let f2 = pick(IDEA_FEATURES, rng);
    for (let i = 0; i < 5 && f2 === f1; i++) f2 = pick(IDEA_FEATURES, rng);
    title += ` én ${f2}`;
  }
  if (creativity >= 10) title += ", in drievoud";
  const opener =
    creativity <= 1
      ? pick(["Een redelijk normaal idee", "Een voorzichtig plan", "Een idee met een helm op"], rng)
      : pick(["Een revolutionair concept", "Een baanbrekend plan", "Een volkomen logisch idee", "Een onvermijdelijke uitvinding", "Een product voor de toekomst"], rng);
  const description = `${opener}, ${pick(IDEA_PURPOSES, rng)}`;
  const serial = `ID-${Math.floor(rng() * 90000 + 10000)}`;
  return { title, description, serial };
}

export const IDEA_COMBINATIONS = IDEA_OBJECTS.length * IDEA_FEATURES.length * IDEA_PURPOSES.length;

// ---------- Ideeëngenerator in het museum (drie rollen) ----------

export const REEL_WHAT = [
  "Een app",
  "Een foodtruck",
  "Een podcast",
  "Een vereniging",
  "Een abonnement",
  "Een festival",
  "Een gereedschapskist",
  "Een museum",
  "Een bordspel",
  "Een moestuin",
  "Een pizzeria",
  "Een webshop",
] as const;

export const REEL_WHO = [
  "voor mensen met te veel ideeën",
  "voor kabouters met ambitie",
  "voor vergaderingen",
  "voor zondagochtenden",
  "voor huisdieren met plannen",
  "voor uitgestelde projecten",
  "voor mensen die altijd ‘even’ zeggen",
  "voor dakgoten",
  "voor halflege koffiekopjes",
  "voor domeinnamen zonder website",
] as const;

export const REEL_WHY = [
  "om het nooit af te maken",
  "om de wereld een klein beetje rommeliger te maken",
  "die zichzelf elk jaar verlengt",
  "met een wachtlijst van 3 jaar",
  "die alleen werkt als niemand kijkt",
  "om ruzie te voorkomen over de thermostaat",
  "met gratis stickers",
  "om op verjaardagen over te vertellen",
  "die volledig draait op enthousiasme",
  "met een officieel certificaat",
] as const;

export const REEL_COMBINATIONS = REEL_WHAT.length * REEL_WHO.length * REEL_WHY.length;

// ---------- Domeinnamen ----------

const DOMAIN_PREFIX = ["", "", "nog-een-", "mijn-", "het-", "super", "echt-", "officieel-", "bijna-", "toch-"] as const;
const DOMAIN_CORE = ["idee", "plan", "project", "uitstel", "koffie", "schuur", "planning", "brainstorm", "later", "deeg", "lampje", "hendel", "tandwiel", "kladblok"] as const;
const DOMAIN_SUFFIX = ["", "hub", "lab", "fabriek", "winkel", "zone", "2", "pro", "centrale", "huis", "-xl", "-bv"] as const;
const DOMAIN_TLD = [".ooit", ".straks", ".misschien", ".later", ".bijna", ".plan", ".morgen", ".eventjes"] as const;
const DOMAIN_REASONS = [
  "Gekocht om 01:43 ’s nachts.",
  "Voor een project dat nog bedacht moet worden.",
  "Zodat niemand anders het neemt.",
  "Het was in de aanbieding (niet echt).",
  "Het klonk goed in de auto.",
  "Plan: ‘iets met een app’.",
  "Voor als het andere domein vol is.",
  "Intuïtie. Pure intuïtie.",
] as const;

export type Domain = { name: string; reason: string };

export function generateDomain(rng: Rng = Math.random): Domain {
  const name = `${pick(DOMAIN_PREFIX, rng)}${pick(DOMAIN_CORE, rng)}${pick(DOMAIN_SUFFIX, rng)}${pick(DOMAIN_TLD, rng)}`;
  return { name, reason: pick(DOMAIN_REASONS, rng) };
}

export const DOMAIN_TLDS = DOMAIN_TLD;

// ---------- Nieuwe plannen (hendel) ----------

export const PLANS = [
  "Zelf kaas maken",
  "Een moestuin op het dak",
  "De garage omtoveren tot werkplaats",
  "Een eigen podcast",
  "Een boek schrijven over uitstel",
  "Een houtgestookte pizzaoven bouwen",
  "Alle snoeren in huis labelen",
  "Een app voor boodschappenlijstjes",
  "Een kas van oude ramen",
  "Elke dag 10.000 stappen (vanaf maandag)",
  "Een domeinnaam kopen voor dit plan",
  "Een vijver met een brug",
  "De zolder opruimen (echt nu)",
  "Een eigen lettertype ontwerpen",
  "Een slimme deurbel die grapjes vertelt",
  "Bijenkasten in de tuin",
  "Een fietstocht langs alle molens",
  "Zelf zuurdesem kweken",
  "Een website voor de buurtvereniging",
  "Een boomhut met wifi",
  "Een jaarplanning die het jaar overleeft",
  "Een werkbank die zichzelf opruimt",
  "Een thermostaat met gevoel voor humor",
  "Een tweede schuur voor de spullen uit de eerste schuur",
  "Een cursus ‘Nee zeggen tegen nieuwe plannen’",
  "Een museum voor onafgemaakte ideeën (o wacht)",
] as const;

// ---------- Bureau voor Onnodige Innovatie ----------

export const BUREAU_PROBLEMS = [
  "Sokken zijn te stil.",
  "Water is te nat.",
  "Dinsdag voelt te veel als maandag.",
  "Paraplu’s werken alleen als het regent.",
  "Trappen gaan zowel omhoog als omlaag.",
  "Koffie wordt koud als je hem laat staan.",
  "Er zijn te weinig knoppen in de wereld.",
  "Wolken hebben geen naam.",
  "Deurmatten krijgen nooit een bedankje.",
  "Vergaderingen eindigen soms.",
  "Brood heeft twee kanten.",
  "Planten weten niet hoe laat het is.",
] as const;

export const BUREAU_SOLUTIONS = [
  "Een abonnementsdienst die het probleem maandelijks opnieuw bezorgt.",
  "Een app met blockchain, AI en een donkere modus.",
  "Een commissie van zeven personen die om de week bijeenkomt.",
  "Een slimme sensor met een dashboard dat niemand bekijkt.",
  "Een jaarlijkse conferentie met lanyards.",
  "Een knop die ‘nee’ zegt, maar heel vriendelijk.",
  "Een wetenschappelijk onderzoek van zes jaar.",
  "Een tweede, iets kleinere versie van het probleem.",
  "Een podcast waarin het probleem wordt besproken.",
  "Een officieel keurmerk met een groen vinkje.",
  "Een robotarm die het probleem af en toe aait.",
  "Een domeinnaam. Verder niets.",
] as const;

export const BUREAU_BUDGETS = [
  "€ 3,50 en een kop koffie",
  "Ongeveer een miljoen (schatting op de achterkant van een bierviltje)",
  "Twee weekenden en een bouwmarktbezoek",
  "Onbekend, maar de spreadsheet is prachtig",
  "Eén zaterdagmiddag (raming: drie maanden)",
  "Gratis, behalve de tijd",
] as const;

export const BUREAU_STATUSES = ["PATENT AANGEVRAAGD", "IN DE LA", "GOEDGEKEURD", "TE GOED VOOR DEZE WERELD", "WACHT OP MAANDAG", "OP 95%"] as const;

export type BureauCase = { problem: string; solution: string; budget: string; status: string; number: string };

export function generateBureauCase(rng: Rng = Math.random): BureauCase {
  return {
    problem: pick(BUREAU_PROBLEMS, rng),
    solution: pick(BUREAU_SOLUTIONS, rng),
    budget: pick(BUREAU_BUDGETS, rng),
    status: pick(BUREAU_STATUSES, rng),
    number: `BOI/${new Date().getFullYear()}/${String(Math.floor(rng() * 9000 + 1000))}`,
  };
}

// ---------- Kleine teksten ----------

export const PROJECT_DONE_MESSAGES = [
  "Gefeliciteerd. Dit project heeft drie nieuwe projecten opgeleverd.",
] as const;

export const STUCK_AT_99 = [
  "Bijna klaar…",
  "Laatste puntjes op de i…",
  "Nog één ding…",
  "Even een nieuw idee tussendoor…",
  "Bijna echt klaar…",
] as const;

export const TOUR_LINES = [
  "Let u vooral op het penseelwerk. Er is geen penseel gebruikt.",
  "Dit is een van onze topstukken. Het is bijna af.",
  "Kunstcritici noemen dit ‘onvoltooid’. Wij noemen het ‘in ontwikkeling’.",
  "Fotograferen is toegestaan. Afmaken niet.",
  "Hier ziet u een meesterwerk van uitstel.",
  "Dit object is geleend uit een la in de keuken.",
  "Volgens de overlevering is dit idee ontstaan onder de douche.",
  "Ga gerust iets dichterbij staan. Het idee bijt niet.",
] as const;
