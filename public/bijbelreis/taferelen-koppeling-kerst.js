// Koppelingen van de taferelen bij het thema Kerst (taferelen-kerst.js) aan de stappen van het boek `kerst`. Uitleg van de
// velden: taferelen-koppeling.js. Dit bestand wordt ná de andere koppelingen geladen en voegt alleen toe.
// Niet elke stap heeft een eigen beeld: een stap met reis zonder koppeling krijgt geen beeld (daar vertelt de kaart), en een
// stap zonder reis houdt dan het standaardbeeld van zijn plaats (Ararat, Ur, Jeruzalem, Rome, Egypte).
// Bewust géén beeld (t: ""): de geboorte en de kribbe (Lukas 2:6–7), de achtste dag (2:21): daar is het Kind het onderwerp
// en valt er niets anders te tekenen; en Rama (Mattheüs 2:16–18): geen beeld bij de kindermoord.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  // De belofte: van Adam tot David
  "kerst:kerst-belofte:7": { t: "kerst-rachab", tekst: "Rachab bond het scharlaken snoer aan het venster van haar huis op de stadsmuur (Jozua 2:15, 21)." },
  "kerst:kerst-belofte:8": { t: "ruth-veld", tekst: "Ruth kwam met Naomi in Bethlehem, in het begin van de gersteoogst (Ruth 1:22)." },
  "kerst:kerst-belofte:9": { t: "kerst-bethlehem", tekst: "In Bethlehem werd de jongste zoon van Isaï gehaald: hij weidde de schapen (1 Samuël 16:11)." },
  // Van David tot Jozef
  "kerst:kerst-koningen:0": { t: "kerst-cederhuis", tekst: "‘Ik woon in een cederen huis, en de ark Gods woont in het midden der gordijnen’ (2 Samuël 7:2)." },
  "kerst:kerst-koningen:3": { t: "kerst-tronk", tekst: "Er zal een Rijsje voortkomen uit de afgehouwen tronk van Isaï (Jesaja 11:1)." },
  "kerst:kerst-koningen:4": { t: "kerst-bethlehem", tekst: "‘En gij, Bethlehem Efratha! zijt gij klein om te wezen onder de duizenden van Juda?’ (Micha 5:1)." },
  "kerst:kerst-koningen:7": { t: "kerst-geslacht", tekst: "Van Zerubbabel tot Jozef noemt de Bijbel alleen nog namen (Mattheüs 1:13–16)." },
  "kerst:kerst-koningen:8": { t: "kerst-nazareth", tekst: "Nazareth, een stad in Galilea, waar Jozef woonde, uit het huis van David (Lukas 1:26–27)." },
  "kerst:kerst-koningen:9": { t: "kerst-geslacht", tekst: "Van Abraham tot David, van David tot Babel, van Babel tot Christus: driemaal veertien geslachten (Mattheüs 1:17)." },
  // De aankondiging
  "kerst:kerst-aankondiging:0": { t: "kerst-reukaltaar", tekst: "Het lot wees Zacharias aan om in de tempel het reukoffer te brengen (Lukas 1:9)." },
  "kerst:kerst-aankondiging:1": { t: "kerst-reukaltaar", tekst: "Een engel van de Heere stond aan de rechterkant van het reukofferaltaar (Lukas 1:11)." },
  "kerst:kerst-aankondiging:3": { t: "kerst-nazareth", tekst: "In de zesde maand werd de engel Gabriël gezonden naar Nazareth (Lukas 1:26)." },
  "kerst:kerst-aankondiging:4": { t: "kerst-nazareth", tekst: "‘Zie, de dienstmaagd des Heeren; mij geschiede naar uw woord’ (Lukas 1:38)." },
  "kerst:kerst-aankondiging:6": { t: "kerst-bergland", tekst: "Maria bleef ongeveer drie maanden bij Elisabeth in het bergland van Juda (Lukas 1:39, 56)." },
  "kerst:kerst-aankondiging:7": { t: "kerst-tafeltje", tekst: "Zacharias vroeg om een schrijftafeltje en schreef: ‘Johannes is zijn naam’ (Lukas 1:63)." },
  "kerst:kerst-aankondiging:8": { t: "kerst-bergland", tekst: "In het hele bergland van Judea werd over deze dingen gesproken (Lukas 1:65)." },
  "kerst:kerst-aankondiging:9": { t: "kerst-droom", tekst: "De engel van de Heere verscheen Jozef in een droom; toen hij wakker werd, deed hij wat hem gezegd was (Mattheüs 1:20, 24)." },
  // De geboorte in Bethlehem
  "kerst:kerst-geboorte:1": { t: "kerst-op-weg", tekst: "Jozef ging van Nazareth naar Bethlehem, de stad van David, met Maria (Lukas 2:4–5)." },
  "kerst:kerst-geboorte:2": { t: "" },
  "kerst:kerst-geboorte:3": { t: "kerst-herders", tekst: "Herders hielden ’s nachts de wacht over hun kudde, en de heerlijkheid van de Heere omscheen hen (Lukas 2:8–9)." },
  "kerst:kerst-geboorte:4": { t: "kerst-herders", tekst: "‘Ere zij God in de hoogste hemelen, en vrede op aarde, in de mensen een welbehagen’ (Lukas 2:14)." },
  "kerst:kerst-geboorte:5": { t: "kerst-herders-gaan", tekst: "‘Laat ons dan heengaan naar Bethlehem’; en zij kwamen met haast (Lukas 2:15–16)." },
  "kerst:kerst-geboorte:6": { t: "" },
  "kerst:kerst-geboorte:7": { t: "kerst-duiven", tekst: "Zij brachten het offer dat de wet noemt: een paar tortelduiven of twee jonge duiven (Lukas 2:24)." },
  "kerst:kerst-geboorte:8": { t: "kerst-tempel", tekst: "Door de Geest kwam Simeon in de tempel, toen de ouders het Kind binnenbrachten (Lukas 2:27)." },
  "kerst:kerst-geboorte:9": { t: "kerst-tempel", tekst: "Anna ging niet weg uit de tempel en diende God met vasten en bidden, nacht en dag (Lukas 2:37)." },
  // De wijzen, Egypte en Nazareth
  "kerst:kerst-wijzen:0": { t: "kerst-poort", tekst: "Wijzen van het oosten kwamen in Jeruzalem en vroegen: ‘Waar is de geboren Koning der Joden?’ (Mattheüs 2:1–2)." },
  "kerst:kerst-wijzen:1": { t: "kerst-bethlehem", tekst: "‘Te Bethlehem, in Judea gelegen; want alzo is geschreven door den profeet’ (Mattheüs 2:5)." },
  "kerst:kerst-wijzen:2": { t: "kerst-poort", tekst: "Herodes zond de wijzen naar Bethlehem: onderzoek nauwkeurig naar het Kind (Mattheüs 2:8)." },
  "kerst:kerst-wijzen:3": { t: "kerst-ster-weg", tekst: "De ster ging hun voor en bleef staan boven de plaats waar het Kind was (Mattheüs 2:9)." },
  "kerst:kerst-wijzen:4": { t: "kerst-geschenken", tekst: "Zij deden hun schatten open en brachten Hem geschenken: goud, wierook en mirre (Mattheüs 2:11)." },
  "kerst:kerst-wijzen:5": { t: "kerst-vlucht", tekst: "Jozef stond op en vertrok in de nacht met het Kind en Zijn moeder naar Egypte (Mattheüs 2:14)." },
  "kerst:kerst-wijzen:6": { t: "" },
  "kerst:kerst-wijzen:9": { t: "kerst-nazareth", tekst: "Jozef ging wonen in een stad die Nazareth heet (Mattheüs 2:23)." },
  // Twaalf jaar
  "kerst:kerst-twaalf:0": { t: "kerst-nazareth", tekst: "In Nazareth groeide het Kind op, en de genade van God was over Hem (Lukas 2:39–40)." },
  "kerst:kerst-twaalf:1": { t: "kerst-pascha", tekst: "Elk jaar reisden Zijn ouders naar Jeruzalem, voor het feest van het Pascha (Lukas 2:41)." },
  "kerst:kerst-twaalf:2": { t: "kerst-pascha", tekst: "Na de feestdagen ging het gezelschap terug, maar het Kind bleef in Jeruzalem (Lukas 2:43)." },
  "kerst:kerst-twaalf:3": { t: "kerst-pascha", tekst: "Zij zochten Hem een dagreis lang onder de familie en de bekenden (Lukas 2:44)." },
  "kerst:kerst-twaalf:4": { t: "kerst-tempel", tekst: "Na drie dagen vonden zij Hem in de tempel, in het midden van de leraren (Lukas 2:46)." },
  "kerst:kerst-twaalf:5": { t: "kerst-tempel", tekst: "‘Zie, Uw vader en ik hebben U met angst gezocht’ (Lukas 2:48)." },
  "kerst:kerst-twaalf:6": { t: "kerst-tempel", tekst: "‘Wist gij niet, dat Ik moet zijn in de dingen Mijns Vaders?’ (Lukas 2:49)." },
  "kerst:kerst-twaalf:8": { t: "kerst-nazareth", tekst: "Jezus nam toe in wijsheid, en in grootte, en in genade bij God en de mensen (Lukas 2:52)." },
});
