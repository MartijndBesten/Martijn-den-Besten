// Foto’s van Bijbelse plaatsen zoals ze er nu uitzien (Wikimedia Commons, vrije licentie). Zie docs/bijbelreis-fotos/README.md.
// Eén foto per plaats, zelf gehost in /bijbelreis/fotos/<f>.webp (960 breed) en <f>-480.webp; er wordt niets van buiten geladen.
//
// Velden per plaats-id (de sleutel is de id uit plaatsen.js):
//   f          bestandsnaam zonder extensie
//   t          wat je op de foto ziet (onderschrift; alleen wat de foto laat zien)
//   alt        tekst voor wie de foto niet ziet
//   b, h       breedte en hoogte van de grote versie (tegen verspringen tijdens het laden)
//   maker      zoals op de bestandspagina van Commons
//   licentie   bijv. "CC BY-SA 4.0" of "Publiek domein"; licentieUrl: de tekst van die licentie
//   bron       de bestandspagina op commons.wikimedia.org; opgehaald: datum
//
// Waar een foto staat: in het open stapblad / de stapkaart onder de tekst (en onder een tafereel), in de ballon van de plaats
// en één keer bij een geschiedenis. Niet in het korte blad. Een stap met `t: ""` in BR.beelden (bewust geen beeld, zoals de
// kribbe) krijgt ook geen foto.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.fotos = {
  salem: {"f":"jeruzalem","t":"De oude stad van Jeruzalem met haar muren, van boven gezien.","alt":"Luchtfoto van de oude stad van Jeruzalem, omgeven door een stadsmuur, met de heuvels erachter.","b":960,"h":632,"maker":"AVRAHAM GRAICER","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:JERUSALEM_OLD_CITY_WALLS.JPG","opgehaald":"2026-11-16"},
  nt_nazareth: {"f":"nazareth","t":"Nazareth, een stad tussen de heuvels van Galilea.","alt":"Uitzicht over de huizen van Nazareth op de heuvels, met bergen in de verte.","b":960,"h":533,"maker":"Rudko","licentie":"CC0 1.0","licentieUrl":"https://creativecommons.org/publicdomain/zero/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Nazareth_09.08.2011_12-51-25.JPG","opgehaald":"2026-11-16"},
  haran: {"f":"haran","t":"Ruïnes bij Harran, in het zuidoosten van Turkije.","alt":"Ruïnes van oude stenen gebouwen en een hoge vierkante toren in een vlak, droog land.","b":960,"h":611,"maker":"Mehmetkrckrc","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Historical_Harran_University.jpg","opgehaald":"2026-11-16"},
  berseba: {"f":"berseba","t":"Een oude put bij de opgraving van Tel Beër-Sjeva.","alt":"Een gegraven put met een houten afdak en een informatiebord op een droge heuvel.","b":960,"h":720,"maker":"Mujaddara","licentie":"CC BY-SA 3.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/3.0/","bron":"https://commons.wikimedia.org/wiki/File:A_well_of_living_water_-_panoramio.jpg","opgehaald":"2026-11-16"},
  babelst: {"f":"babylon","t":"De ruïnes van Babylon in Irak; een deel van de muren is later herbouwd.","alt":"Lage muren van lichte steen tussen palmbomen in een vlak landschap.","b":960,"h":640,"maker":"Safa.daneshvar","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:001125-Babylon-Iraq-IMG_8057-2.jpg","opgehaald":"2026-11-16"},
  jericho: {"f":"jericho","t":"De heuvel van het oude Jericho (Tell es-Sultan), van boven gezien, tussen de groene velden.","alt":"Luchtfoto van een opgegraven heuvel tussen huizen en groene akkers.","b":960,"h":606,"maker":"Fullo88 (Italiaanse Wikipedia)","licentie":"Publiek domein","licentieUrl":"https://creativecommons.org/publicdomain/mark/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Tell_es-sultan.jpg","opgehaald":"2026-11-16"},
  sichem: {"f":"sichem","t":"De opgraving van het oude Sichem (Tell Balata) bij Nablus.","alt":"Grote oude stenen muren van een opgraving, met huizen tegen de berg erachter.","b":960,"h":640,"maker":"TrickyH","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Tell_Balata.jpg","opgehaald":"2026-11-16"},
  silo: {"f":"silo","t":"De heuvel van Silo en het dal eromheen.","alt":"Een kale heuvel met paden en een dal met olijfbomen en akkers.","b":960,"h":644,"maker":"Deg777","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Tel_Shiloh_(biblical_site)_2017.jpg","opgehaald":"2026-11-16"},
  nt_efeze: {"f":"efeze","t":"De ruïnes van Efeze, met de voorgevel van een oude bibliotheek.","alt":"Een hoge marmeren voorgevel met zuilen tussen ruïnes, onder een blauwe lucht.","b":960,"h":584,"maker":"Herbert Weber","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Library_of_Celsus_6243.jpg","opgehaald":"2026-11-16"},
  nt_kapernaum: {"f":"kapernaum","t":"De opgravingen van Kapernaüm, met de resten van een synagoge.","alt":"Witte stenen zuilen en muren van een oud gebouw zonder dak.","b":960,"h":640,"maker":"Ruby1619","licentie":"CC BY-SA 3.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/3.0/","bron":"https://commons.wikimedia.org/wiki/File:Kefar_Nahum_Capernaum_Talhum.jpg","opgehaald":"2026-11-16"},
  nt_caesarea: {"f":"caesarea","t":"Een oude waterleiding bij Caesarea, langs het strand.","alt":"Een lange rij stenen bogen op het zand onder een blauwe lucht.","b":960,"h":720,"maker":"Mark87 (Engelse Wikipedia)","licentie":"Publiek domein","licentieUrl":"https://creativecommons.org/publicdomain/mark/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Caesarea_Maritima_aqueduct.jpg","opgehaald":"2026-11-16"},
  ninivest: {"f":"ninive","t":"Een herbouwd stuk van de stadsmuur van Ninevé bij Mosul.","alt":"Een hoge muur van lichte steen met kantelen en een toren.","b":960,"h":588,"maker":"Abdulsalam Al Dabbagh","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Mosul_Wall-Nineveh_01.jpg","opgehaald":"2026-11-16"},
  nt_korinthe: {"f":"korinthe","t":"De ruïnes van Korinthe, met de berg Akrokorinthe erachter.","alt":"Een rij oude stenen zuilen voor een hoge rotsberg.","b":960,"h":575,"maker":"Chris Oxford","licentie":"CC BY-SA 3.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/3.0/","bron":"https://commons.wikimedia.org/wiki/File:Ancient_Corinth._Temple_of_Apollo.jpg","opgehaald":"2026-11-16"},
  samaria: {"f":"samaria","t":"Ruïnes bij Sebastia, waar de stad Samaria lag.","alt":"Oude stenen muren en een omgevallen zuil tussen bomen.","b":960,"h":720,"maker":"Bukvoed","licentie":"CC BY 3.0","licentieUrl":"https://creativecommons.org/licenses/by/3.0/","bron":"https://commons.wikimedia.org/wiki/File:Sebastia-410.jpg","opgehaald":"2026-11-16"},
  nt_rome: {"f":"rome","t":"Het Forum Romanum in Rome: de resten van het oude centrum van de stad.","alt":"Ruïnes van tempels, zuilen en een triomfboog midden in de stad Rome.","b":960,"h":480,"maker":"BeBo86","licentie":"CC BY-SA 3.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/3.0/","bron":"https://commons.wikimedia.org/wiki/File:Forum_romanum_6k_(5760x2097).jpg","opgehaald":"2026-11-16"},
  megiddo: {"f":"megiddo","t":"De opgraving van Megiddo, boven de vlakte van Jizreël.","alt":"Lage muren van een opgraving met palmbomen en een groene vlakte in de verte.","b":960,"h":720,"maker":"Immanuel Giel","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Tel_Megiddo_32.jpg","opgehaald":"2026-11-16"},
  arnon: {"f":"arnon","t":"Het diepe dal van de Arnon (Wadi Mujib) in Jordanië.","alt":"Een diep, droog dal tussen kale bergen, met een stenen muurtje op de voorgrond.","b":960,"h":640,"maker":"Gerd Eichmann","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Wadi_Mujib-06-2010-gje.jpg","opgehaald":"2026-11-16"},
  nebo: {"f":"nebo","t":"Het uitzicht vanaf de berg Nebo over het dal van de Jordaan.","alt":"Uitzicht vanaf een berg over een wijd, heiig dal, met bomen en stenen op de voorgrond.","b":960,"h":636,"maker":"Faris knight","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Mount_Nebo-1.JPG","opgehaald":"2026-11-16"},
  nt_olijfberg: {"f":"olijfberg","t":"De Olijfberg bij Jeruzalem, van boven gezien in het avondlicht.","alt":"Luchtfoto van een heuvel bij Jeruzalem met veel lichte stenen en huizen, in warm licht.","b":960,"h":531,"maker":"Godot13","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:2013-Aerial-Mount_of_Olives.jpg","opgehaald":"2026-11-16"},
  nt_athene: {"f":"athene","t":"De Areopagus in Athene, de rotsheuvel gezien vanaf de Akropolis.","alt":"Een kale rotsheuvel met bomen eromheen en de huizen van Athene erachter.","b":960,"h":686,"maker":"ajbear (KiltBear)","licentie":"CC BY-SA 2.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/2.0/","bron":"https://commons.wikimedia.org/wiki/File:Areopagus_from_the_Acropolis.jpg","opgehaald":"2026-11-16"},
  nt_patmos: {"f":"patmos","t":"Het eiland Patmos, gezien vanaf zee.","alt":"Een heuvelachtig eiland met witte huizen boven op de berg, en een schip op zee.","b":960,"h":638,"maker":"Orthodox33","licentie":"Publiek domein","licentieUrl":"https://creativecommons.org/publicdomain/mark/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Patmos2005.jpg","opgehaald":"2026-11-16"},
  ur: {"f":"ur","t":"De tempeltoren van Ur, in de plaats die als het Ur van Abram wordt aangewezen.","alt":"Een groot gebouw van baksteen met trappen, in een vlakke woestijn.","b":960,"h":480,"maker":"Tla2006 (Engelse Wikipedia)","licentie":"Publiek domein","licentieUrl":"https://creativecommons.org/publicdomain/mark/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Ziggarat_of_Ur_001.jpg","opgehaald":"2026-11-16"},
  nt_filippi: {"f":"filippi","t":"Het oude theater van Filippi.","alt":"Een halfronde rij stenen zitplaatsen van een oud theater onder een blauwe lucht.","b":960,"h":720,"maker":"Mathieu Chollet - MChollet","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Ancient_Theater,_Philippi_Archaeological_Site,_June_2019.jpg","opgehaald":"2026-11-16"},
  susan: {"f":"susan","t":"Opgegraven resten van het paleis in Susan (Shush, Iran).","alt":"Lage muren van een opgraving in een droog veld.","b":960,"h":720,"maker":"Saeedhamedian","licentie":"CC0 1.0","licentieUrl":"https://creativecommons.org/publicdomain/zero/1.0/","bron":"https://commons.wikimedia.org/wiki/File:Palace_of_Darius_in_Susa2.jpg","opgehaald":"2026-11-16"},
  nt_tarsus: {"f":"tarsus","t":"Een oude stadspoort in Tarsus.","alt":"Een grote stenen poort met een boog, met palmbomen en een straat ervoor.","b":960,"h":720,"maker":"Leon petrosyan","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Tarsus_17.jpg","opgehaald":"2026-11-16"},
  efrath: {"f":"bethlehem","t":"Het plein in het centrum van Bethlehem.","alt":"Een groot plein in Bethlehem met oude stenen gebouwen en een toren.","b":960,"h":639,"maker":"Alexey Goral","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Manger_Square.jpg","opgehaald":"2026-11-16"},
  mamre: {"f":"hebron","t":"De oude stad van Hebron tussen de heuvels.","alt":"Oude stenen huizen van Hebron tegen een heuvel, met palmbomen ervoor.","b":960,"h":540,"maker":"Baraa Zm","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:Hebron_old_city_0029.jpg","opgehaald":"2026-11-16"},
  karmel: {"f":"karmel","t":"Een dal in het groene gebergte van de Karmel.","alt":"Een dal met struiken en bomen tussen groene hellingen en een rotswand.","b":960,"h":720,"maker":"netanel_h","licentie":"CC BY-SA 3.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/3.0/","bron":"https://commons.wikimedia.org/wiki/File:MountCarmel1.JPG","opgehaald":"2026-11-16"},
  ri_tabor: {"f":"tabor","t":"Het uitzicht vanaf de berg Tabor over het land eromheen.","alt":"Uitzicht vanaf een berg over akkers en een dorp, met wolken in de lucht.","b":960,"h":720,"maker":"Ephraim Harel Herer","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:View_North_from_Har_Tavor.jpg","opgehaald":"2026-11-16"},
  nt_tempel: {"f":"jeruzalem","t":"De oude stad van Jeruzalem van boven gezien; op het grote plein stond vroeger de tempel.","alt":"Luchtfoto van de oude stad van Jeruzalem met het grote tempelplein.","b":960,"h":632,"maker":"AVRAHAM GRAICER","licentie":"CC BY-SA 4.0","licentieUrl":"https://creativecommons.org/licenses/by-sa/4.0/","bron":"https://commons.wikimedia.org/wiki/File:JERUSALEM_OLD_CITY_WALLS.JPG","opgehaald":"2026-11-16"},
};

(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const PAD = "/bijbelreis/fotos/";

  // Welke foto hoort bij deze stap? Bij een stap met een reis de laatste plaats (waar het gebeurt), anders de eerste.
  function van(s) {
    if (!s || !s.at || !s.at.length) return null;
    const k = (BR.beelden || {})[s.key];
    if (k && k.t === "") return null; // bewust geen beeld bij deze stap
    const id = s.r && s.r.length ? s.at[s.at.length - 1] : s.at[0];
    return BR.fotos[id] ? { id, ...BR.fotos[id] } : null;
  }

  function bronregel(f) {
    return `Foto: ${esc(f.maker)}, <a href="${esc(f.licentieUrl)}" rel="noopener license" target="_blank">${esc(f.licentie)}</a> · <a href="${esc(f.bron)}" rel="noopener" target="_blank">Wikimedia Commons</a>`;
  }
  function img(f, sizes, lui) {
    const h = Math.round((f.h / f.b) * 960);
    return `<img src="${PAD}${esc(f.f)}-480.webp" srcset="${PAD}${esc(f.f)}-480.webp 480w, ${PAD}${esc(f.f)}.webp 960w" sizes="${sizes}" width="960" height="${h}"${lui ? ' loading="lazy"' : ""} decoding="async" alt="${esc(f.alt)}">`;
  }
  function maak(f) {
    const el = document.createElement("figure");
    el.className = "plaatsfoto"; el.dataset.foto = f.id;
    el.innerHTML = `<p class="pf-kop">Zo ziet het er nu uit</p>${img(f, "(max-width: 900px) 100vw, 420px", true)}<figcaption><span class="pf-t">${esc(f.t)}</span> <small class="pf-bron">${bronregel(f)}</small></figcaption>`;
    return el;
  }

  BR.foto = {
    van,
    maak,
    // De ballon van een plaats op de kaart: een kleine foto bovenin.
    ballon(id) {
      const f = BR.fotos[id];
      if (!f) return "";
      return `<figure class="plaatsfoto pf-ballon" data-foto="${esc(id)}">${img({ id, ...f }, "260px", false)}<figcaption><small class="pf-bron">${bronregel(f)}</small></figcaption></figure>`;
    },
    // Stapkaart en open stapblad: na de tekst, en na een tafereel als dat er direct na staat; een vorige foto verdwijnt.
    bijStap(anker, s) {
      if (!anker || !anker.parentNode) return;
      anker.parentNode.querySelectorAll(":scope > .plaatsfoto").forEach((e) => e.remove());
      const f = van(s);
      if (!f) return;
      const na = anker.nextElementSibling && anker.nextElementSibling.classList.contains("tafereel") ? anker.nextElementSibling : anker;
      na.after(maak(f));
    },
    // Geschiedenis: één foto, van de eerste stap met een foto, onder de vertelling.
    inVerhaal(box, steps) {
      box.querySelectorAll(".plaatsfoto").forEach((e) => e.remove());
      const f = steps.map(van).find(Boolean), v = box.querySelector("#vVertelling");
      if (!f || !v) return;
      let na = v;
      // Na een tafereel en de knop ‘Lees verder’ die direct na de vertelling staan.
      while (na.nextElementSibling && (na.nextElementSibling.classList.contains("tafereel") || na.nextElementSibling.id === "vLeesVerder")) na = na.nextElementSibling;
      na.after(maak(f));
    },
  };
})();
