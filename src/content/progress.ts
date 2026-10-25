// Bezoekersmissies en verborgen verrassingen. De voortgang staat alleen in de browser van de bezoeker.

export type MissionId =
  | "hidden-buttons"
  | "jam"
  | "creativity-10"
  | "secret-room"
  | "emergency"
  | "project-99"
  | "vote"
  | "eggs-10";

export type Mission = { id: MissionId; title: string; hint: string; goal?: number };

export const MISSIONS: Mission[] = [
  { id: "hidden-buttons", title: "Vind drie verborgen knoppen", hint: "Ze zijn klein. Heel klein. Eén zit in de voettekst.", goal: 3 },
  { id: "jam", title: "Laat de machine vastlopen", hint: "Machines houden niet van haast." },
  { id: "creativity-10", title: "Bereik creativiteitsniveau 10", hint: "Er zit een draaiknop in het Control Center." },
  { id: "secret-room", title: "Ontdek de geheime zaal", hint: "Het museum heeft zes zalen. U ziet er vijf." },
  { id: "emergency", title: "Druk op de officiële noodstop", hint: "Eerst het kapje open." },
  { id: "project-99", title: "Probeer een project af te ronden", hint: "Het lukt bijna." },
  { id: "vote", title: "Stem op een idee in het museum", hint: "Elk object heeft een stemknop." },
  { id: "eggs-10", title: "Vind tien verrassingen", hint: "Typ eens iets. Klik eens vaker. Wacht eens.", goal: 10 },
];

export type EggId =
  | "konami"
  | "koffie"
  | "geheim"
  | "rust"
  | "logo"
  | "machine-jam"
  | "tijd"
  | "board"
  | "colors"
  | "hidden-1"
  | "hidden-2"
  | "hidden-3"
  | "switches"
  | "nothing-flip"
  | "to-eleven"
  | "tab"
  | "idle"
  | "end"
  | "flashlight"
  | "serious"
  | "vogeltje"
  | "mega-idee"
  | "wegloper"
  | "sleutel";

export const EGGS: Record<EggId, { title: string; text: string }> = {
  konami: { title: "Directiemodus", text: "U kent de geheime code. De nachtdienst is ingeschakeld." },
  koffie: { title: "Koffiepauze", text: "Kopje koffie geregistreerd. De statistiek is bijgewerkt." },
  geheim: { title: "Geheim gefluisterd", text: "Iemand heeft het woord ‘geheim’ getypt. De geheime zaal is ontgrendeld." },
  rust: { title: "Rustpoging", text: "Fout 404: rustmoment niet gevonden." },
  logo: { title: "Zelfcertificering", text: "Het logo heeft zichzelf officieel goedgekeurd." },
  "machine-jam": { title: "Vastgelopen", text: "U heeft de ideeënmachine laten vastlopen. Er wordt een commissie opgericht." },
  tijd: { title: "Tijd is op", text: "U probeerde de tijd te pakken. Die was al weg." },
  board: { title: "Klikvaardig", text: "Mededeling: stop alstublieft met klikken op de mededelingen." },
  colors: { title: "Kleurenexplosie", text: "Alle huiskleuren tegelijk aangeraakt. Het palet is even de weg kwijt." },
  "hidden-1": { title: "Verborgen knop 1", text: "Gevonden in de kleine lettertjes." },
  "hidden-2": { title: "Verborgen knop 2", text: "Gevonden in de laatste 0,1%." },
  "hidden-3": { title: "Verborgen knop 3", text: "Gevonden achter een punt." },
  switches: { title: "Geheime combinatie", text: "Koffie aan, ambitie aan, realisme uit. De perfecte instelling." },
  "nothing-flip": { title: "Knop met een mening", text: "De knop ‘Even niets doen’ heeft zich bedacht." },
  "to-eleven": { title: "Tot 11", text: "Deze knop gaat tot 11. Officieel." },
  tab: { title: "Terugkeerder", text: "U was even weg. Er zijn in de tussentijd 3 ideeën bedacht." },
  idle: { title: "Niets gedaan", text: "U heeft even niets gedaan. Dat is hier nog nooit gelukt." },
  end: { title: "Het einde", text: "U heeft het einde van de website bereikt." },
  flashlight: { title: "Zaklampdetective", text: "U vond het enige afgemaakte object in het museum." },
  serious: { title: "Serieus?", text: "U heeft de serieuze modus overleefd." },
  vogeltje: { title: "Gouden modus", text: "U vond de sleutelschakelaar op de ideeënmachine en zette hem op goud. De machine levert even alleen gouden ideeën." },
  "mega-idee": { title: "Veel te groot idee", text: "De machine produceerde een idee dat niet meer door de deur past." },
  sleutel: { title: "Sleutel van het instituut", text: "U heeft de gouden sleutel gevonden. Hij past nergens op. Dat is de grap." },
  wegloper: { title: "Weglopende knop", text: "U heeft de knop die wegloopt toch te pakken gekregen. Hij is er niet blij mee." },
};

export const EGG_COUNT = Object.keys(EGGS).length;

export const ACHIEVEMENTS = [
  "officieel niets heeft opgelost",
  "een idee heeft gehad en het daarbij heeft gelaten",
  "met succes een project heeft uitgesteld",
  "de geheime zaal heeft betreden en weer heeft verlaten",
  "een domeinnaam heeft bedacht en hem níét heeft gekocht",
  "de noodstop heeft ingedrukt zonder dat er iets kapot ging",
  "tot 99% is gekomen en dat prima vond",
  "langer dan vijf minuten heeft rondgekeken in het museum",
] as const;

/** Ontdekkingsniveaus: na 3, 5 en 8 gevonden verrassingen verandert de site subtiel. */
export const DISCOVERY_STEPS = [3, 5, 8] as const;
export function discoveryLevel(found: number): 0 | 1 | 2 | 3 {
  return found >= 8 ? 3 : found >= 5 ? 2 : found >= 3 ? 1 : 0;
}
