// Algemene teksten van de site. Pas hier de statistieken, routes en de pagina 'Over Martijn' aan.

export const SITE = {
  name: "Martijn den Besten",
  slogan: "Officiële website van een man met meer ideeën dan tijd.",
  url: "https://martijndenbesten.com",
};

export type RouteMeta = { path: string; title: string; description: string; nav?: string; color: string; static?: boolean };

export const ROUTES: RouteMeta[] = [
  { path: "/", nav: "Hoofdkwartier", color: "terra", title: "Martijn den Besten — Officiële website van een man met meer ideeën dan tijd", description: "Het officiële hoofdkwartier van Martijn den Besten: mededelingen, statistieken, een Control Center vol knoppen en een museum van onafgemaakte ideeën." },
  { path: "/control-center", nav: "Control Center", color: "indigo", title: "Martijn Control Center — Druk op alles", description: "Een bedieningsmachine vol knoppen, hendels en schakelaars. Start een idee, rond een project af tot 99% of druk op de officiële noodstop." },
  { path: "/museum", nav: "Museum", color: "steen", title: "Museum van Onafgemaakte Ideeën — Martijn den Besten", description: "Een interactief museum met zes zalen vol briljante, bijna afgeronde en nog te bedenken ideeën. Stem op uw favoriet of dien zelf een idee in." },
  { path: "/over", nav: "Over Martijn", color: "sage", title: "Over Martijn — Instituut Martijn den Besten", description: "Wie is Martijn den Besten? Oprichter, directeur en enige medewerker van het instituut voor onafgemaakte zaken." },
  // Statische pagina (public/bijbelreis.html): wordt niet door React gerenderd, wel in navigatie en sitemap.
  { path: "/bijbelreis", nav: "Bijbelreis", color: "lila", static: true, title: "Bijbelreis — Op reis door het Oude Testament — Martijn den Besten", description: "Interactieve kaart voor kinderen: reis mee met Abraham, Izak, Jakob, Jozef, Mozes en de andere verhalen uit het Oude Testament. Met speurtocht, afstanden en een stempelpaspoort." },
  { path: "/loket", color: "oker", title: "Het Officiële Ideeënloket — Martijn den Besten", description: "Dien een idee in bij het Instituut Martijn den Besten. Elke inzending wordt zorgvuldig beoordeeld (zodra er tijd is)." },
  { path: "/bureau", color: "sage", title: "Bureau voor Onnodige Innovatie — Martijn den Besten", description: "Het bureau dat volstrekt onnodige oplossingen bedenkt voor problemen die niet bestaan." },
  { path: "/certificaat", color: "oker", title: "Officieel certificaat — Instituut Martijn den Besten", description: "Laat het instituut officieel vaststellen wat u heeft bereikt (of niet). Download uw certificaat als afbeelding." },
  { path: "/einde", color: "ivory", title: "Het einde — Martijn den Besten", description: "U heeft het einde van de website bereikt." },
  { path: "/beheer", color: "ivory", title: "Directiekamer — Martijn den Besten", description: "Moderatie van ingezonden ideeën." },
];

export const NAV = ROUTES.filter((r) => r.nav);
export const routeMetaOf = (path: string) => ROUTES.find((r) => r.path === path);

export type Stat = { label: string; value: number; suffix?: string; note: string; color: string; live?: boolean };

export const STATS: Stat[] = [
  { label: "Ideeën bedacht", value: 14892, note: "En terwijl u dit leest komen er bij.", color: "oker", live: true },
  { label: "Projecten gestart", value: 1204, note: "Waarvan 1.198 ‘tijdelijk gepauzeerd’.", color: "steen" },
  { label: "Projecten afgerond", value: 3, note: "Waarvan twee per ongeluk.", color: "terra" },
  { label: "Kopjes koffie", value: 27311, note: "Gemeten door de koffieautomaat zelf.", color: "sage" },
  { label: "Pogingen om niets te doen", value: 412, note: "Geslaagd: 0.", color: "indigo" },
  { label: "Nieuwe plannen tijdens bestaande plannen", value: 8077, note: "Gemiddeld 6,7 per plan.", color: "ivory" },
];

export const TIMELINE = [
  { year: "Ooit", text: "Eerste idee. Het ging over een boomhut. De boomhut kwam er niet, de ideeën wel." },
  { year: "Daarna", text: "Ontdekking dat je een domeinnaam kunt kopen vóórdat je weet waarvoor." },
  { year: "Later", text: "Oprichting van een schuur. Sindsdien de grootste collectie ‘bijna af’ van de straat." },
  { year: "Recent", text: "Start van het project ‘minder projecten’. Het loopt voorspoedig (het telt als project)." },
  { year: "Vandaag", text: "Oprichting van het Instituut Martijn den Besten en deze website. Eén project af!" },
  { year: "Morgen", text: "Wordt nog bedacht. Waarschijnlijk vanavond onder de douche." },
];
