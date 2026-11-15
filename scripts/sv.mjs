// Toont de Statenvertalingtekst (controletekst, editie 1888) van een verwijzing, per vers genummerd.
// Gebruik: node scripts/sv.mjs "Handelingen 17:1–18:22" ["Romeinen 16:1–2" ...]
// De tekst staat alleen voor controle in data/statenvertaling/; ze zit niet in de app.
import { laadBR, svTekst } from "./niveaus/br.mjs";

const BR = laadBR();
for (const ref of process.argv.slice(2)) console.log(`### ${ref}\n${svTekst(BR, ref) || "(niet gevonden: controleer de schrijfwijze van het boek)"}\n`);
