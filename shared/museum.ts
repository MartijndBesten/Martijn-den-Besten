// Inhoud van het Museum van Onafgemaakte Ideeën.
// Gedeeld tussen frontend en worker: de worker accepteert alleen stemmen op deze ID's
// (plus goedgekeurde inzendingen met een ID in de vorm "inzending-<nummer>").

export type Exhibit = {
  id: string;
  title: string;
  year: string;
  material: string;
  status: string;
  text: string;
  progress?: number;
  seed: number;
};

export type Room = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  intro: string;
  color: "kobalt" | "boter" | "lila" | "groen" | "koraal" | "nacht";
  exhibits: Exhibit[];
};

export const ROOMS: Room[] = [
  {
    id: "zaal-1",
    number: 1,
    title: "Briljante ideeën",
    subtitle: "Ideeën die de wereld hadden kunnen veranderen",
    intro:
      "In deze zaal hangen ideeën die zo goed waren dat niemand ze durfde uit te voeren. Ook de bedenker niet.",
    color: "kobalt",
    exhibits: [
      {
        id: "uitstel-app",
        title: "De Uitstel-app",
        year: "2019 – heden",
        material: "Goede voornemens op glas",
        status: "Wordt morgen gebouwd",
        text: "Een app die u eraan herinnert dat u iets kunt uitstellen. Met slimme notificaties als: ‘Dit kan ook volgende week.’ De lancering is uiteraard uitgesteld.",
        seed: 11,
      },
      {
        id: "zelfvouwende-was",
        title: "Zelfvouwende was",
        year: "ca. 2021",
        material: "Katoen, hoop",
        status: "Ligt nog in de mand",
        text: "Een wasmand die de was vouwt terwijl u slaapt. Het prototype bestond uit een wasmand. Het vouwen is nooit begonnen.",
        seed: 23,
      },
      {
        id: "gedachtenspiegel",
        title: "Achteruitkijkspiegel voor gedachten",
        year: "2022",
        material: "Reflectie (letterlijk)",
        status: "Kijkt nog terug",
        text: "Een kleine spiegel waarmee u ziet welke gedachte u net kwijt bent geraakt. Werkt uitstekend, behalve als u hem nodig heeft.",
        seed: 37,
      },
      {
        id: "vergaderzandloper",
        title: "De Vergaderzandloper",
        year: "2023",
        material: "Zand, geduld",
        status: "Loopt nog",
        text: "Een zandloper die pas leegloopt als iedereen iets zinnigs heeft gezegd. Het eerste exemplaar loopt sinds 2023 en is nog steeds vol.",
        seed: 41,
      },
      {
        id: "idee-rem",
        title: "De Ideeënrem",
        year: "Tijdloos",
        material: "Remvoering, wilskracht",
        status: "Werkt niet",
        text: "Een rem voor als er te veel ideeën tegelijk komen. Tijdens de ontwikkeling ontstonden er elf nieuwe ideeën. De rem is daarmee officieel getest.",
        seed: 53,
      },
    ],
  },
  {
    id: "zaal-2",
    number: 2,
    title: "Bijna afgerond",
    subtitle: "Projecten die permanent op 95% staan",
    intro:
      "Wetenschappers noemen het ‘de laatste vijf procent’. Hier noemen we het gewoon ‘de collectie’. Druk gerust op ‘afmaken’. Het helpt niet.",
    color: "boter",
    exhibits: [
      {
        id: "schuurtje",
        title: "Het opgeruimde schuurtje",
        year: "Voorjaar (welk jaar is onbekend)",
        material: "Planken, schroeven, één doos ‘diversen’",
        status: "95% — alleen die ene doos nog",
        text: "Alles heeft een plek. Behalve de doos ‘diversen’, die heeft drie plekken gehad en ligt nu weer in het midden.",
        progress: 95,
        seed: 67,
      },
      {
        id: "fotoalbum",
        title: "Het digitale fotoalbum",
        year: "2017 – heden",
        material: "14.000 foto’s, 0 albums",
        status: "97% — nog even sorteren",
        text: "Alle foto’s zijn verzameld. Nu alleen nog sorteren, benoemen, dubbele verwijderen, en een album maken. Verder is het af.",
        progress: 97,
        seed: 71,
      },
      {
        id: "handleiding",
        title: "De handleiding van alles",
        year: "2020",
        material: "Eén A4’tje, dubbelzijdig",
        status: "99,9% — hoofdstuk 1 volgt",
        text: "Een complete handleiding voor alle projecten. De inhoudsopgave is af. De inhoud niet. De inhoudsopgave is wel erg mooi.",
        progress: 99.9,
        seed: 79,
      },
      {
        id: "moestuin",
        title: "Moestuin 2.0",
        year: "Elk voorjaar opnieuw",
        material: "Aarde, zaadjes, plannen",
        status: "95% — de oogst ontbreekt",
        text: "Het plan was perfect. De bakken staan. De grond is gekocht. De zaadjes liggen nog in de verpakking, op een zonnige plek.",
        progress: 95,
        seed: 83,
      },
    ],
  },
  {
    id: "zaal-3",
    number: 3,
    title: "Het domeinenarchief",
    subtitle: "Een verzameling plekken op internet waar nog niets staat",
    intro:
      "Sommige mensen sparen postzegels. Anderen sparen domeinnamen. Deze vitrines tonen een fictieve verzameling. Alle prijskaartjes zijn gelukkig niet echt.",
    color: "lila",
    exhibits: [
      {
        id: "domein-later",
        title: "doeiklaterwel.nl",
        year: "Verworven om 02:14",
        material: "DNS-record, euforie",
        status: "Gebruikt: nooit",
        text: "Gekocht na een briljante ingeving om kwart over twee ’s nachts. De ingeving is vergeten. Het domein verlengt zich trouw elk jaar.",
        seed: 97,
      },
      {
        id: "domein-app",
        title: "ietsmeteenapp.com",
        year: "Verworven tijdens een verjaardag",
        material: "Enthousiasme, één biertje",
        status: "Plan: ‘iets met een app’",
        text: "Het businessplan was één zin lang en die zin was de domeinnaam. Experts noemen dit ‘lean’.",
        seed: 101,
      },
      {
        id: "domein-reserve",
        title: "reserve-reservedomein.nl",
        year: "Verworven ter bescherming van een ander domein",
        material: "Voorzichtigheid",
        status: "Beschermt: niets",
        text: "Gekocht zodat niemand anders het zou kopen. Niemand anders wilde het kopen.",
        seed: 107,
      },
    ],
  },
  {
    id: "zaal-4",
    number: 4,
    title: "De Ideeëngenerator",
    subtitle: "Een machine die nooit stil staat",
    intro:
      "Trek aan de hendel en de machine combineert drie onderdelen tot een gloednieuw onafgemaakt idee. Het museum is niet aansprakelijk voor gevolgen.",
    color: "groen",
    exhibits: [],
  },
  {
    id: "zaal-5",
    number: 5,
    title: "Het archief van Morgen",
    subtitle: "Projecten die waarschijnlijk binnenkort bedacht worden",
    intro:
      "Deze ideeën bestaan nog niet, maar we zijn er vrij zeker van dat ze er komen. Wrijf over de mist om een glimp op te vangen.",
    color: "koraal",
    exhibits: [
      {
        id: "morgen-podcast",
        title: "Een podcast over plannen",
        year: "Verwacht: volgende week dinsdag",
        material: "Microfoon (nog niet gekocht)",
        status: "Wordt bedacht onder de douche",
        text: "Een podcast waarin elke aflevering een nieuwe podcast wordt aangekondigd. Aflevering 1 kondigt aflevering 1 aan.",
        seed: 131,
      },
      {
        id: "morgen-boek",
        title: "Het boek ‘Afmaken in 3 stappen’",
        year: "Verwacht: na de zomer",
        material: "Papier, ironie",
        status: "Stap 1 is bedacht",
        text: "Stap 1: begin. Stap 2: ga door. Stap 3: wordt nog uitgewerkt.",
        seed: 137,
      },
      {
        id: "morgen-vereniging",
        title: "Vereniging voor Mensen met Te Veel Ideeën",
        year: "Verwacht: zodra er tijd is",
        material: "Statuten (concept)",
        status: "Eerste vergadering: uitgesteld",
        text: "De vereniging heeft al 400 leden. Ze hebben allemaal een ander idee over waar de eerste vergadering moet zijn.",
        seed: 149,
      },
      {
        id: "morgen-website",
        title: "Een tweede website",
        year: "Verwacht: zodra deze af is",
        material: "Een nieuw domein, vermoedelijk",
        status: "Domein al gekocht (waarschijnlijk)",
        text: "Een website over het maken van deze website. Hij wordt bedacht op het moment dat u dit leest.",
        seed: 151,
      },
    ],
  },
];

export const SECRET_ROOM = {
  id: "zaal-6",
  number: 6,
  title: "De Geheime Zaal",
  subtitle: "De Zaal van Afgemaakte Projecten",
  intro: "Collectie: 1 object. Het licht is uit om energie te besparen. Gebruik uw zaklamp.",
};

export const EXHIBIT_IDS: string[] = ROOMS.flatMap((r) => r.exhibits.map((e) => e.id)).concat(["geheime-zaal"]);

export const SUBMISSION_PREFIX = "inzending-";

export function isVotableId(id: string): boolean {
  return EXHIBIT_IDS.includes(id) || /^inzending-\d{1,9}$/.test(id);
}
