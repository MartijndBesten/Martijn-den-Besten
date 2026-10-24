// Officiële mededelingen op de homepage. Voeg gerust nieuwe toe; de volgorde wordt geschud.

export type Announcement = { text: string; dept: string; stamp: string };

export const ANNOUNCEMENTS: Announcement[] = [
  { dept: "Directie", stamp: "INGETROKKEN", text: "De directie heeft besloten geen nieuwe projecten te starten. Dit besluit is inmiddels ingetrokken." },
  { dept: "Onderzoek", stamp: "IN ONDERZOEK", text: "Er is opnieuw een idee ontstaan. De gevolgen worden onderzocht." },
  { dept: "Personeelszaken", stamp: "IN BEHANDELING", text: "Het management heeft behoefte aan vrije tijd. Er is geen tijd beschikbaar om dit verzoek te behandelen." },
  { dept: "Facilitair", stamp: "GEPLAND", text: "De koffieautomaat is vervangen door een grotere koffieautomaat. Er wordt een nog grotere overwogen." },
  { dept: "Planning", stamp: "VERSCHOVEN", text: "De planning voor dit kwartaal is af. Hij geldt vanaf volgend kwartaal." },
  { dept: "Directie", stamp: "GOEDGEKEURD", text: "Het voornemen om minder voornemens te hebben is goedgekeurd. Het is het enige voornemen dit jaar. Er zijn er inmiddels vier." },
  { dept: "Domeinbeheer", stamp: "VERLENGD", text: "Een domeinnaam is automatisch verlengd. Niemand weet meer waarvoor hij was. Het onderzoek loopt." },
  { dept: "Communicatie", stamp: "VERZONDEN", text: "Deze mededeling is per abuis verstuurd. Een rectificatie volgt zodra iemand weet wat er mis was." },
  { dept: "Projectbureau", stamp: "95%", text: "Project ‘Afmaken’ bevindt zich in de laatste fase. Die fase duurt naar verwachting nog enkele jaren." },
  { dept: "Directie", stamp: "OPGERICHT", text: "Er is een werkgroep opgericht om het aantal werkgroepen te verminderen. De werkgroep zoekt nog leden." },
  { dept: "Onderzoek", stamp: "BEVESTIGD", text: "Onderzoek wijst uit dat de beste ideeën ontstaan onder de douche. Er wordt een waterdicht notitieblok besteld." },
  { dept: "Facilitair", stamp: "VERPLAATST", text: "Het rustmoment van 15:00 uur is verplaatst naar een nog nader te bepalen moment in de toekomst." },
  { dept: "Ideeënbeheer", stamp: "OVERVOL", text: "De la voor ideeën voor later is vol. Er is een tweede la bedacht. Die moet nog worden gebouwd." },
  { dept: "Juridische zaken", stamp: "VOORLOPIG", text: "Alle plannen op deze website zijn onder voorbehoud. Dit voorbehoud is eveneens onder voorbehoud." },
  { dept: "Directie", stamp: "GENOTEERD", text: "Er is vandaag niets nieuws begonnen. Dit is een record. Het record is om 10:14 uur verbroken." },
  { dept: "ICT", stamp: "OPGELOST", text: "Het probleem met te veel open tabbladen is opgelost door een nieuw venster te openen." },
  { dept: "Planning", stamp: "UITGESTELD", text: "Het uitstellen van uitstel is uitgesteld. Nadere berichtgeving volgt (later)." },
  { dept: "Kwaliteitszorg", stamp: "ISO-NEE", text: "Het instituut is officieel gecertificeerd door het instituut zelf. Er waren geen bezwaren." },
  { dept: "Onderzoek", stamp: "VEELBELOVEND", text: "Een nieuw idee bleek een oud idee in een andere jas. Het krijgt toch een eigen map." },
  { dept: "Personeelszaken", stamp: "VACATURE", text: "Gezocht: iemand die dingen afmaakt. Sollicitaties worden in behandeling genomen zodra er tijd is." },
  { dept: "Facilitair", stamp: "GEVONDEN", text: "In de schuur is een project uit 2019 teruggevonden. Het verkeert in goede staat en is nog steeds niet af." },
  { dept: "Directie", stamp: "OVERWOGEN", text: "Er is overwogen om eens niets te overwegen. Dit voorstel wordt overwogen." },
  { dept: "Communicatie", stamp: "LIVE", text: "Deze website is gelanceerd. Daarmee is één project officieel afgerond. Er zijn ter viering drie nieuwe bedacht." },
  { dept: "Weerbureau", stamp: "VERWACHTING", text: "Vandaag zwaar bewolkt met kans op ideeën. In de avond neemt de kans toe tot 100%." },
  { dept: "Logistiek", stamp: "ONDERWEG", text: "Het pakket met ‘de oplossing voor alles’ is verzonden. Bezorging verwacht tussen nu en ooit." },
  { dept: "Ideeënbeheer", stamp: "GEARCHIVEERD", text: "Alle onafgemaakte ideeën zijn netjes gearchiveerd in het museum. Het archiveren is nog niet helemaal af." },
];
