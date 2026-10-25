// Zet het gekozen uiterlijk vóór het eerste beeld, zodat er geen flits van het verkeerde thema is.
// De sleutel moet gelijk blijven aan APPEARANCE_KEY in src/state/GameState.tsx.
(function () {
  try {
    var t = JSON.parse(localStorage.getItem("mdb:uiterlijk") || '"ivoor"');
    if (t === "blauwdruk" || t === "nacht" || t === "ivoor") document.documentElement.dataset.theme = t;
  } catch (e) {
    /* geen opslag beschikbaar: standaarduiterlijk */
  }
})();
