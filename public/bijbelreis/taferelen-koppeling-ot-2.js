// Koppelingen van de tweede reeks taferelen bij het Oude Testament (taferelen-ot-2.js). Uitleg van de velden: taferelen-koppeling.js.
// Dit bestand wordt ná taferelen-koppeling.js geladen en voegt alleen toe; een sleutel die hier staat, gaat voor.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  // Het kistje in het riet (Exodus 2:3)
  "exodus:mozes:1": { t: "kistje", tekst: "Zijn moeder legde het kistje van biezen in het riet aan de oever van de rivier (Exodus 2:3)." },
  // Manna (Exodus 16:13–15)
  "exodus:sinai:0": { t: "manna", tekst: "Toen de dauw was opgetrokken, lag er iets kleins en ronds op de grond: het manna (Exodus 16:14–15)." },
  // Water uit de rots: bij Rafidim (Exodus 17) en bij Kades (Numeri 20)
  "exodus:sinai:1": { t: "rots", tekst: "Mozes sloeg op de rots in Horeb en er kwam water uit, zodat het volk kon drinken (Exodus 17:6)." },
  "numeri:woestijn:5": { t: "rots", tekst: "Uit de rots kwam veel water; het volk dronk, en hun vee ook (Numeri 20:11)." },
  // De tabernakel (Exodus 40) en de dienst bij de tent der samenkomst (Leviticus 8–10; 16)
  "exodus:sinai:8": { t: "tabernakel", tekst: "De wolk bedekte de tent der samenkomst; overdag was de wolk van de HEERE op de tabernakel (Exodus 40:34–38)." },
  "leviticus:verzoendag:0": { t: "tabernakel", tekst: "Het hele volk kwam samen bij de deur van de tent der samenkomst (Leviticus 8:4)." },
  "leviticus:verzoendag:1": { t: "tabernakel", tekst: "Mozes en Aäron gingen in de tent der samenkomst, kwamen eruit en zegenden het volk (Leviticus 9:23)." },
  "leviticus:verzoendag:2": { t: "tabernakel", tekst: "Aäron en zijn zonen mochten niet weggaan van de deur van de tent der samenkomst (Leviticus 10:7)." },
  "leviticus:verzoendag:3": { t: "tabernakel", tekst: "Niemand mocht in de tent der samenkomst zijn als de hogepriester er verzoening deed (Leviticus 16:17)." },
  "leviticus:verzoendag:4": { t: "tabernakel", tekst: "Eén keer per jaar werd er verzoening gedaan voor het heiligdom, de tent en het altaar (Leviticus 16:33–34)." },
  // De koperen slang (Numeri 21:8–9)
  "numeri:woestijn:7": { t: "slang", tekst: "Mozes maakte een koperen slang en zette die op een stang; wie haar aanzag, bleef leven (Numeri 21:9)." },
  // De Jordaan en de twaalf stenen (Jozua 3–4)
  "jozua:intocht:2": { t: "jordaan", tekst: "Het water bleef ver weg op een hoop staan en heel Israël ging over op het droge (Jozua 3:16–17)." },
  "jozua:intocht:3": { t: "twaalf-stenen", tekst: "Jozua richtte de twaalf stenen uit de Jordaan op in Gilgal (Jozua 4:20)." },
  // Gideon (Richteren 7:16–22)
  "richteren:debora:8": { t: "gideon", tekst: "Zij braken de kruiken, hielden de fakkels vast en bliezen op de bazuinen, rondom het leger (Richteren 7:20–21)." },
  // Het veld bij Bethlehem (Ruth 1:22; 2)
  "ruth:ruth:2": { t: "ruth-veld", tekst: "Naomi en Ruth kwamen in Bethlehem aan in het begin van de gersteoogst (Ruth 1:22)." },
  "ruth:ruth:3": { t: "ruth-veld", tekst: "Ruth raapte aren op het veld van Boaz, achter de maaiers aan (Ruth 2:3)." },
  // David in het Eikdal (1 Samuël 17)
  "1samuel:saul-david:4": { t: "eikdal", tekst: "David koos vijf gladde stenen uit de beek; zijn slinger was in zijn hand (1 Samuël 17:40)." },
  // De tempel van Salomo (1 Koningen 6–7) en wat later in het huis van de HEERE gebeurde
  "1koningen:salomo:4": { t: "tempel", tekst: "Het huis was zestig el lang, twintig breed en dertig hoog, met twee koperen pilaren ervoor (1 Koningen 6:2; 7:21)." },
  "2koningen:joas:0": { t: "tempel", tekst: "Zes jaar lang was Joas verborgen in het huis van de HEERE (2 Koningen 11:3)." },
  "2koningen:joas:1": { t: "tempel", tekst: "In het huis van de HEERE stond de koning bij de pilaar, en het hele volk was blij (2 Koningen 11:14)." },
  "2koningen:joas:2": { t: "tempel", tekst: "De kist voor het geld stond bij het altaar, waar men het huis van de HEERE binnenkwam (2 Koningen 12:9)." },
  "2koningen:ballingschap:4": { t: "tempel", tekst: "In het huis van de HEERE vond de hogepriester Hilkia het wetboek (2 Koningen 22:8)." },
  "2kronieken:hizkia-josia:0": { t: "tempel", tekst: "Hizkia deed de deuren van het huis van de HEERE weer open en herstelde ze (2 Kronieken 29:3)." },
  "2kronieken:hizkia-josia:1": { t: "tempel", tekst: "Toen het brandoffer begon, begon ook het lied van de HEERE, met trompetten (2 Kronieken 29:27)." },
  "2kronieken:hizkia-josia:7": { t: "tempel", tekst: "Hilkia vond het wetboek van de HEERE in het huis van de HEERE (2 Kronieken 34:14–15)." },
  // Het vuur op de Karmel (1 Koningen 18:31–38)
  "1koningen:elia:3": { t: "karmel", tekst: "Het vuur van de HEERE viel op het altaar van twaalf stenen en lekte het water in de groeve op (1 Koningen 18:38)." },
  // Elia wordt opgenomen (2 Koningen 2:11)
  "1koningen:elia:9": { t: "elia", tekst: "Er was een vurige wagen met vurige paarden, en Elia voer in een storm naar de hemel (2 Koningen 2:11)." },
  // De muur van Jeruzalem (Nehemia 2–4)
  "ezra:nehemia:3": { t: "muur-puin", tekst: "De muren van Jeruzalem waren afgebroken en de poorten door vuur verteerd (Nehemia 2:13)." },
  "ezra:nehemia:4": { t: "muur-herbouw", tekst: "De muur was al tot de helft opgebouwd, want het volk had hart voor het werk (Nehemia 4:6)." },
  // Daniël (Daniël 3 en 6)
  "daniel:daniel:4": { t: "oven", tekst: "De oven werd zeven keer heter gestookt dan gewoonlijk (Daniël 3:19)." },
  "daniel:daniel:7": { t: "leeuwenkuil", tekst: "Er werd een steen op de opening van de kuil gelegd, en de koning verzegelde die (Daniël 6:18)." },
  // Jona (Jona 1; 4)
  "jona:jona:2": { t: "jona-storm", tekst: "De HEERE wierp een grote wind op de zee, en het schip dreigde te breken (Jona 1:4)." },
  "jona:jona:3": { t: "jona-vis", tekst: "De HEERE beschikte een grote vis; Jona was drie dagen en drie nachten in de vis (Jona 1:17)." },
  "jona:jona:6": { t: "wonderboom", tekst: "God liet een wonderboom opschieten boven Jona, voor schaduw over zijn hoofd (Jona 4:6)." },
});
