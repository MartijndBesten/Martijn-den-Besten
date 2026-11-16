// Koppelingen van het beeldverhaal bij Genesis 32 en 33 (taferelen-jakob.js): elke stap van het deel genesis:jakob-jabbok
// (‘Jakob bij de Jabbok’) krijgt een eigen tafereel, zodat de geschiedenis in twaalf beelden te volgen is. Daarnaast de
// ladder bij Bethel (genesis:jakob:0; de stap heeft een reis en kreeg daarom nog geen beeld). Uitleg van de
// velden: taferelen-koppeling.js. Dit bestand wordt ná de andere koppelingen geladen en voegt alleen toe. Bestaat het
// deel (nog) niet, dan doen deze sleutels niets.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.beelden = Object.assign(BR.beelden || {}, {
  "genesis:jakob:0": { t: "betel-nacht", tekst: "Jakob droomde: ‘een ladder was gesteld op de aarde, welker opperste aan den hemel raakte’ (Genesis 28:12)." },
  "genesis:jakob-jabbok:0": { t: "jabbok-mahanaim", tekst: "Jakob trok verder; de engelen van God ontmoetten hem, en hij noemde die plaats Mahanaïm (Genesis 32:1–2)." },
  "genesis:jakob-jabbok:1": { t: "jabbok-boden", tekst: "De boden kwamen terug: Ezau trekt u tegemoet, en vierhonderd mannen met hem (Genesis 32:6)." },
  "genesis:jakob-jabbok:2": { t: "jabbok-heiren", tekst: "Jakob was zeer bevreesd en verdeelde het volk en het vee in twee heiren (Genesis 32:7)." },
  "genesis:jakob-jabbok:3": { t: "jabbok-gebed", tekst: "Jakob bad: met mijn staf ging ik over de Jordaan, en nu ben ik tot twee heiren geworden (Genesis 32:10)." },
  "genesis:jakob-jabbok:4": { t: "jabbok-geschenk", tekst: "Het geschenk voor Ezau ging vooruit: elke kudde apart, met ruimte tussen kudde en kudde (Genesis 32:16)." },
  "genesis:jakob-jabbok:5": { t: "jabbok-veer", tekst: "In die nacht bracht Jakob zijn vrouwen en zijn elf kinderen over het veer van de Jabbok (Genesis 32:22)." },
  "genesis:jakob-jabbok:6": { t: "jabbok-nacht", tekst: "Jakob bleef alleen over, en een Man worstelde met hem totdat de dageraad opging (Genesis 32:24)." },
  "genesis:jakob-jabbok:7": { t: "jabbok-dageraad", tekst: "‘Uw naam zal voortaan niet Jakob heten, maar Israël’; en Hij zegende hem daar (Genesis 32:28–29)." },
  "genesis:jakob-jabbok:8": { t: "jabbok-pniel", tekst: "De zon ging over hem op toen hij door Pniël gegaan was, en hij hinkte aan zijn heup (Genesis 32:31)." },
  "genesis:jakob-jabbok:9": { t: "jabbok-ezau", tekst: "Ezau liep hem tegemoet, omhelsde hem en kuste hem; en zij weenden (Genesis 33:4)." },
  "genesis:jakob-jabbok:10": { t: "jabbok-aangezicht", tekst: "Jakob zei: ‘neem mijn geschenk van mijn hand’; hij hield bij Ezau aan, zodat hij het nam (Genesis 33:10–11)." },
  "genesis:jakob-jabbok:11": { t: "jabbok-sukkoth", tekst: "Jakob bouwde in Sukkoth een huis voor zich en maakte hutten voor zijn vee (Genesis 33:17)." },
  // De drie stappen van het hoofddeel Jakob over Genesis 32–33 tonen elk één beeld uit de reeks (met dezelfde zin als
  // daar), zodat je de tekeningen ook ziet als je gewoon de reis van Jakob volgt. De hele reeks staat in ‘Van dichtbij’.
  "genesis:jakob:5": { t: "jabbok-gebed", tekst: "Jakob bad: met mijn staf ging ik over de Jordaan, en nu ben ik tot twee heiren geworden (Genesis 32:10)." },
  "genesis:jakob:6": { t: "jabbok-nacht", tekst: "Jakob bleef alleen over, en een Man worstelde met hem totdat de dageraad opging (Genesis 32:24)." },
  "genesis:jakob:7": { t: "jabbok-ezau", tekst: "Ezau liep hem tegemoet, omhelsde hem en kuste hem; en zij weenden (Genesis 33:4)." },
});
