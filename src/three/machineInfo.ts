// Gegevens over de 3D-machines die de pagina nodig heeft vóórdat three.js geladen is:
// de posterformaten, de ankerpunten van de onderdelen en de uitleg per onderdeel.
// Dit bestand importeert bewust niets uit three, zodat het in de hoofdbundel mag.

import anchors from "./anchors.json";

export type MachineLayout = "wide" | "compact";
export type Point = { x: number; y: number };

/** Posterformaat per compositie: de canvas krijgt exact dezelfde verhouding. */
export const MACHINE_POSTER: Record<MachineLayout, { w: number; h: number; src: string; srcset: string }> = {
  wide: { w: 1200, h: 975, src: "/3d/machine-wide-900.webp", srcset: "/3d/machine-wide-900.webp 900w, /3d/machine-wide-1500.webp 1500w" },
  compact: { w: 780, h: 760, src: "/3d/machine-compact-600.webp", srcset: "/3d/machine-compact-600.webp 600w, /3d/machine-compact-1000.webp 1000w" },
};

export const MACHINE_ANCHORS = anchors.machine as Record<MachineLayout, Record<string, Point>>;

export const PART_TEXT = [
  { id: "trechter", label: "Invoertrechter", text: "Ruwe gedachten erin. Er bestaat geen uit-stand." },
  { id: "buis", label: "Glazen twijfelbuis", text: "Laat precies genoeg twijfel door om nooit af te ronden." },
  { id: "verwerker", label: "Verwerker met tandwielen", text: "Twaalf, acht en zes tanden. Draaien harder naarmate er meer haast is. Dat helpt niet." },
  { id: "meter", label: "Ideeënmeter", text: "Meet ideeën per minuut. De schaal eindigt bij ‘veel te veel’." },
  { id: "sorteerarm", label: "Sorteerarm", text: "Keurt elk idee met een sensor. Laat zich soms overtuigen door een goed verhaal." },
  { id: "afkeurbak", label: "Afkeurbak", text: "Voor ideeën die te logisch waren. Wordt nooit geleegd; ze komen vanzelf terug." },
  { id: "stempel", label: "Stempelpers", text: "Perst een idee tot een officiële octrooikaart. Hard maar rechtvaardig." },
  { id: "uitvoer", label: "Uitvoerplatform", text: "Hier verschijnt de uitvinding. Applaus is optioneel, maar wordt gewaardeerd." },
] as const;
