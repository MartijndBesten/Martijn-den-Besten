// De Engelse inhoud van de Bijbelreis, deel 1: vaste lijsten, plaatsen, personen en boeken. Status: concept (review
// draft): alles hier moet nog door een menselijke lezer worden nagelezen (docs/bijbelreis-talen/README.md).
// Namen van personen en plaatsen in de spelling van de King James Version (KJV). Citaten tussen ‘…’ staan letterlijk in
// de KJV (tests/bijbelreis-talen.test.ts controleert dat tegen data/kjv/).
// De stappen en delen staan in stappen.js, de geschiedenissen in verhalen.js, de teksten per niveau in niveaus/.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
BR.vertaling = BR.vertaling || {};
BR.vertaling.en = {
  status: "concept",
  // Een stap in een vertaald deel waarvan alleen de titel vertaald is.
  nogNiet: { t: "", stamp: "", txt: "This step is not yet available in English. The route is on the map; you can read the passage in your own Bible." },

  // ---------- Bijbelboeken: de naam in verwijzingen (Nederlands → Engels, zoals de KJV) ----------
  boekNamen: {
    "Genesis": "Genesis", "Exodus": "Exodus", "Leviticus": "Leviticus", "Numeri": "Numbers", "Deuteronomium": "Deuteronomy", "Jozua": "Joshua",
    "Richteren": "Judges", "Ruth": "Ruth", "1 Samuël": "1 Samuel", "2 Samuël": "2 Samuel", "1 Koningen": "1 Kings", "2 Koningen": "2 Kings",
    "1 Kronieken": "1 Chronicles", "2 Kronieken": "2 Chronicles", "Ezra": "Ezra", "Nehemia": "Nehemiah", "Esther": "Esther", "Job": "Job",
    "Psalm": "Psalm", "Psalmen": "Psalms", "Spreuken": "Proverbs", "Prediker": "Ecclesiastes", "Hooglied": "Song of Solomon", "Jesaja": "Isaiah",
    "Jeremia": "Jeremiah", "Klaagliederen": "Lamentations", "Ezechiël": "Ezekiel", "Daniël": "Daniel", "Hosea": "Hosea", "Joël": "Joel",
    "Amos": "Amos", "Obadja": "Obadiah", "Jona": "Jonah", "Micha": "Micah", "Nahum": "Nahum", "Habakuk": "Habakkuk", "Sefanja": "Zephaniah",
    "Haggaï": "Haggai", "Zacharia": "Zechariah", "Maleachi": "Malachi", "Mattheüs": "Matthew", "Markus": "Mark", "Lukas": "Luke",
    "Johannes": "John", "Handelingen": "Acts", "Romeinen": "Romans", "1 Korinthe": "1 Corinthians", "2 Korinthe": "2 Corinthians",
    "Galaten": "Galatians", "Efeze": "Ephesians", "Filippenzen": "Philippians", "Kolossenzen": "Colossians", "1 Thessalonicenzen": "1 Thessalonians",
    "2 Thessalonicenzen": "2 Thessalonians", "1 Timotheüs": "1 Timothy", "2 Timotheüs": "2 Timothy", "Titus": "Titus", "Filemon": "Philemon",
    "Hebreeën": "Hebrews", "Jakobus": "James", "1 Petrus": "1 Peter", "2 Petrus": "2 Peter", "1 Johannes": "1 John", "2 Johannes": "2 John",
    "3 Johannes": "3 John", "Judas": "Jude", "Openbaring": "Revelation",
  },
  // Engelse boeknamen voor BR.parseRef (verwijzing.js): naam zonder spaties → de slug van de Bijbelreis.
  slugs: {
    numbers: "numeri", deuteronomy: "deuteronomium", joshua: "jozua", judges: "richteren", "1kings": "1koningen", "2kings": "2koningen",
    "1chronicles": "1kronieken", "2chronicles": "2kronieken", nehemiah: "nehemia", psalm: "psalmen", psalms: "psalmen", proverbs: "spreuken",
    ecclesiastes: "prediker", songofsolomon: "hooglied", isaiah: "jesaja", jeremiah: "jeremia", lamentations: "klaagliederen", ezekiel: "ezechiel",
    obadiah: "obadja", jonah: "jona", micah: "micha", habakkuk: "habakuk", zephaniah: "sefanja", zechariah: "zacharia", malachi: "maleachi",
    matthew: "mattheus", mark: "markus", luke: "lukas", john: "johannes", acts: "handelingen", romans: "romeinen", "1corinthians": "1korinthe",
    "2corinthians": "2korinthe", galatians: "galaten", ephesians: "efeze", philippians: "filippenzen", colossians: "kolossenzen",
    "1thessalonians": "1thessalonicenzen", "2thessalonians": "2thessalonicenzen", "1timothy": "1timotheus", "2timothy": "2timotheus",
    philemon: "filemon", hebrews: "hebreeen", james: "jakobus", "1peter": "1petrus", "2peter": "2petrus", "1john": "1johannes", "2john": "2johannes",
    "3john": "3johannes", jude: "judas", revelation: "openbaring",
  },
  // Jaartallen: ‘ca. 1446 v.Chr.’ → ‘c. 1446 BC’. De merktekens ‘(onzeker)’ en ‘(ruwe schatting)’ blijven staan: app.js
  // leest ze en haalt ze uit de tekst (datering).
  tijd: [["ca\\. ", "c. "], [" v\\.Chr\\.", " BC"], [" n\\.Chr\\.", " AD"], ["\\(of ", "(or "], ["(\\d) of (\\d)", "$1 or $2"], ["(\\d+)e eeuw", "$1th century"],
    ["Oergeschiedenis", "Primeval history"], ["aartsvaders", "patriarchs"], ["\\(de eerste reis\\)", "(the first journey)"]],

  // ---------- reisniveaus en dateringen ----------
  niveaus: {
    a: { n: "Discover together", leeftijd: "ages 4–6", uitleg: "Short pieces to read together, with simple questions." },
    b: { n: "On my own", leeftijd: "ages 7–10", uitleg: "Histories to read yourself, with the map and different kinds of questions." },
    c: { n: "Explore further", leeftijd: "11+", uitleg: "The full retelling with background, connections and Bible references." },
  },
  dateringen: {
    bijbel: { n: "Biblical chronology", uitleg: "Calculated with numbers from the Bible, such as ages and ‘four hundred and eightieth year’ (1 Kings 6:1). The order is in the Bible; the year depends on how you count." },
    historie: { n: "Historical reconstruction", uitleg: "Fixed with sources outside the Bible, such as Assyrian and Babylonian chronicles and Roman historians, together with the information in the Bible." },
    onzeker: { n: "uncertain", uitleg: "Researchers arrive at clearly different years here." },
    geen: { n: "no date", uitleg: "Genesis 1–11 gives no date in our calendar." },
  },

  // ---------- namen in ‘wie’ (Nederlands → Engels) ----------
  // Personen en groepen in de stappen. Een naam die hier niet staat, valt in het Engels weg.
  namen: {
    "Mensen": "People", "Volk": "People", "Leger": "Army", "Soldaten": "Soldiers", "Vrouwen": "Women", "Vijanden": "Enemies", "Mannen": "Men",
    "Familie": "Family", "Kinderen": "Children", "Boden": "Messengers", "Discipelen": "Disciples", "Herders": "Shepherds", "Engelen": "Angels",
    "Wijzen": "Wise men", "Farizeeën": "Pharisees", "Tollenaars": "Publicans", "Schare": "Multitude", "Apostelen": "Apostles", "Ouderlingen": "Elders",
    "Oudsten": "Elders", "Reisgenoten": "Fellow travellers", "Melaatsen": "Lepers",
    "Adam": "Adam", "Eva": "Eve", "Kaïn": "Cain", "Abel": "Abel", "Noach": "Noah", "Sem": "Shem", "Terach": "Terah", "Abram": "Abram",
    "Mozes": "Moses", "Aäron": "Aaron", "Farao": "Pharaoh", "Mirjam": "Miriam",
    "Debora": "Deborah", "Jabin": "Jabin", "Sisera": "Sisera", "Barak": "Barak", "Jaël": "Jael", "Gideon": "Gideon", "Midianieten": "Midianites", "Pura": "Phurah",
    "Jonathan": "Jonathan", "Wapendrager": "Armourbearer", "Saul": "Saul", "Samuël": "Samuel", "Agag": "Agag", "Isaï": "Jesse", "David": "David",
    "Goliath": "Goliath", "Michal": "Michal", "Achimelech": "Ahimelech", "Achis": "Achish", "Doëg": "Doeg", "Abigaïl": "Abigail", "Nabal": "Nabal",
    "Nebukadnezar": "Nebuchadnezzar", "Jojakim": "Jehoiakim", "Daniël": "Daniel", "Vrienden": "Friends", "Belsazar": "Belshazzar", "Darius": "Darius",
    "Jona": "Jonah", "Zeelieden": "Sailors", "Koning": "King",
    "Zacharias": "Zacharias", "Gabriël": "Gabriel", "Maria": "Mary", "Jozef": "Joseph", "Elisabeth": "Elisabeth", "Johannes de Doper": "John the Baptist",
    "Jezus": "Jesus", "Simeon": "Simeon", "Anna": "Anna", "Herodes": "Herod", "Petrus": "Peter", "Andreas": "Andrew", "Jakobus": "James", "Johannes": "John",
    "Verlamde": "Man sick of the palsy", "Hoofdman": "Centurion", "Simon de Farizeeër": "Simon the Pharisee", "Jaïrus": "Jairus", "Wetgeleerde": "Lawyer",
    "Martha": "Martha", "Maria van Bethanië": "Mary of Bethany", "Waterzuchtige man": "Man with the dropsy", "Samaritaan": "Samaritan",
    "Rijke jongeman": "Rich young ruler", "Bartimeüs": "Bartimaeus", "Zacheüs": "Zacchaeus",
    "Saulus": "Saul", "Ananias van Damascus": "Ananias of Damascus", "Barnabas": "Barnabas", "Agabus": "Agabus", "Johannes Markus": "John Mark",
    "Elymas": "Elymas", "Sergius Paulus": "Sergius Paulus", "Paulus": "Paul", "Kreupele": "Lame man", "Silas": "Silas", "Timotheüs": "Timothy",
    "Lydia": "Lydia", "Gevangenbewaarder": "Jailer",
  },

  // ---------- plaatsen: de naam (altijd), en bij de plaatsen van de vertaalde geschiedenissen ook de uitleg ----------
  // Vorm: id: "Naam" of id: { n, d, nu, bron, alt: [namen van de andere mogelijke plekken] }.
  plaatsen: {
    eden: "Eden?", ararat: "Mountains of Ararat", babel: "Babel", ur: "Ur", haran: "Haran", sichem: "Shechem", dothan: "Dothan", bethel: "Bethel",
    salem: "Jerusalem", efrath: "Bethlehem", mamre: "Hebron · Mamre", egypte: "Egypt", gosen: "Goshen", kikkar: "Plain of Jordan",
    sodom: { n: "Sodom", alt: ["Tall el-Hammam (north)"] }, zoar: "Zoar", dan: "Dan", hoba: "Hobah", berseba: "Beer-sheba", gerar: "Gerar",
    rehoboth: "Rehoboth", blr: "Beer-lahai-roi", paran: "Wilderness of Paran", gilead: "Gilead", mahanaim: "Mahanaim", pniel: "Peniel",
    sukkoth: "Succoth", seir: "Seir (Edom)", mari: "Mari", karkemis: "Carchemish", damascus: "Damascus", ninive: "Nineveh",
    asterot: "Ashteroth Karnaim", kirjataim: "Shaveh Kiriathaim", elparan: "El-paran", kades: "Kadesh", ramses: "Rameses",
    pithom: { n: "Pithom", alt: ["Tell el-Maskhuta"] }, sukkotheg: "Succoth (Egypt)", etham: "Etham", pihachiroth: "Pi-hahiroth",
    schelfzee: { n: "Red Sea", alt: ["Bitter Lakes", "Lake Timsah", "Ballah Lakes"] }, mara: "Marah", elim: "Elim", sin: "Wilderness of Sin",
    refidim: "Rephidim", sinai: { n: "Mount Sinai", alt: ["Jebel Serbal", "Har Karkom"] }, kibroth: "Kibroth-hattaavah", hazeroth: "Hazeroth",
    kadesbarnea: "Kadesh-barnea", ezeongeber: { n: "Ezion-geber", alt: ["Jezirat Fara‘un"] }, hor: { n: "Mount Hor", alt: ["Jebel Harun (near Petra)"] },
    punon: "Punon", arnon: "River Arnon", hesbon: "Heshbon", edrei: "Edrei", sittim: "Shittim", nebo: "Mount Nebo", jericho: "Jericho",
    gilgal: "Gilgal", ai: { n: "Ai", alt: ["Kh. el-Maqatir", "Kh. Nisya"] }, gibeon: "Gibeon", hazorst: "Hazor", silo: "Shiloh",
    timnath: "Timnath-serah", rama: { n: "Ramah", alt: ["Beit Rima", "Rentis"] }, mizpa: "Mizpeh", gibea: "Gibeah", bethsemes: "Beth-shemesh",
    kirjathjearim: "Kirjath-jearim", ekron: "Ekron", gath: "Gath", askelon: "Ashkelon", asdod: "Ashdod", gaza: "Gaza", zora: "Zorah",
    timna: "Timnath", elah: "Valley of Elah", adullam: "Adullam", engedi: "En-gedi", ziklag: { n: "Ziklag", alt: ["Tel Halif", "Kh. a-Ra‘i"] },
    gilboa: "Gilboa", endor: "Endor", jizreel: "Jezreel", jabes: { n: "Jabesh-gilead", alt: ["Tell Abu el-Kharaz"] }, rabba: "Rabbah",
    samaria: "Samaria", karmel: "Mount Carmel", kerith: "Brook Cherith", sarfath: "Zarephath", sidon: "Zidon", tyrus: "Tyre", joppe: "Joppa",
    megiddo: "Megiddo", thisbe: "Tishbe", abelmehola: "Abel-meholah", dothanelisa: "Dothan", sunem: "Shunem", lachis: "Lachish", tekoa: "Tekoa",
    beracha: { n: "Valley of Berachah", alt: ["Khirbet Bereikut"] }, ziz: "Cliff of Ziz", jeruel: "Wilderness of Jeruel", anathoth: "Anathoth",
    horeb: { n: "Horeb", alt: ["Jebel Serbal", "Har Karkom"] }, ninivest: "Nineveh", assur: "Asshur", babelst: "Babylon", susan: "Shushan",
    ekbatana: "Achmetha (Ecbatana)", chebar: "River Chebar", halah: "Halah and Habor", tarsis: "To Tarshish →", bethlehemmoab: "Country of Moab",
    pethor: "Pethor", damascusst: "Damascus", sareptaw: "Zarephath", ex_midian: "Midian", jo_ebal: "Mount Ebal", jo_achor: "Valley of Achor",
    jo_azeka: "Azekah", jo_makkeda: "Makkedah", jo_eglon: { n: "Eglon", alt: ["Tel Hesi"] }, jo_debir: "Debir", jo_merom: "Waters of Merom",
    ri_palm: "Palm tree of Deborah", ri_kedes: { n: "Kedesh-naphtali", alt: ["Kh. Qedish"] }, ri_tabor: "Mount Tabor", ri_kison: "River Kishon",
    ri_ofra: "Ophrah", ri_harod: "Well of Harod", ri_more: "Hill of Moreh", ri_sorek: "Valley of Sorek", ri_lechi: "Lehi", sam_afek: "Aphek",
    sam_ebenhaezer: "Eben-ezer", sam_bezek: "Bezek", sam_michmas: "Michmash", sam_amalek: "Amalek", sam_nob: "Nob", sam_kehila: "Keilah",
    sam_zif: "Ziph", sam_maon: "Maon · Carmel", sam_bethsan: "Beth-shan", sam_bahurim: "Bahurim", sam_lodebar: "Lo-debar", kon_scheba: "To Sheba ↓",
    kon_jordaanelia: "Jordan · Elijah", kon_jordaannaaman: "Jordan · Naaman", kon_medie: "Cities of the Medes", dan_dura: "Plain of Dura",
    dan_medie: "Media", ezra_ahava: "River Ahava", jona_gathhefer: "Gath-hepher", jona_verdek: "East of Nineveh", nt_nazareth: "Nazareth",
    nt_kapernaum: "Capernaum", nt_kana: { n: "Cana", alt: ["Kafr Kanna"] }, nt_nain: "Nain", nt_bethsaida: { n: "Bethsaida", alt: ["el-Araj"] },
    nt_magdala: "Magdala", nt_meer: "Sea of Galilee", nt_gadara: "Country of the Gadarenes", nt_kaesareafilippi: "Caesarea Philippi",
    nt_berg: { n: "A high mountain", alt: ["Hermon"] }, nt_bethanie: "Bethany", nt_bethfage: "Bethphage", nt_olijfberg: "Mount of Olives",
    nt_gethsemane: "Gethsemane", nt_golgotha: { n: "Golgotha", alt: ["Garden Tomb"] }, nt_tempel: "Temple", nt_siloam: "Pool of Siloam",
    nt_bethesda: "Pool of Bethesda", nt_emmaus: { n: "Emmaus", alt: ["Nicopolis", "el-Qubeibeh"] }, nt_doopplaats: { n: "Bethabara", alt: ["Batanea (Bashan)"] },
    nt_woestijn: "Wilderness of Judaea", nt_sichar: "Sychar", nt_machaerus: "Machaerus", nt_antipatris: "Antipatris", nt_lydda: "Lydda",
    nt_azote: "Azotus", nt_caesarea: "Caesarea", nt_tarsus: "Tarsus", nt_antiochie: "Antioch", nt_seleucie: "Seleucia", nt_salamis: "Salamis",
    nt_pafos: "Paphos", nt_perge: "Perga", nt_attalia: "Attalia", nt_antiochiep: "Antioch in Pisidia", nt_ikonium: "Iconium", nt_lystre: "Lystra",
    nt_derbe: "Derbe", nt_troas: "Troas", nt_samothrace: "Samothracia", nt_neapolis: "Neapolis", nt_filippi: "Philippi", nt_myra: "Myra",
    nt_knidus: "Cnidus", nt_salmone: "Salmone", nt_schonehavens: "Fair Havens", nt_clauda: "Clauda", nt_malta: "Melita (Malta)",
    nt_syracuse: "Syracuse", nt_regium: "Rhegium", nt_puteoli: "Puteoli", nt_forumappius: "Appii forum", nt_drietabernen: "The three taverns",
    nt_rome: "Rome", nt_patmos: "Patmos", nt_efeze: "Ephesus", nt1_judagebergte: "A city in the hill country of Juda",
    nt1_bergrede: { n: "Mountain of the Sermon on the Mount", alt: ["Horns of Hattin"] }, nt2_efraim: "Ephraim", nt2_samaria: "Samaria (region)",
    nt2_vlek: "A village (ten lepers)", nt2_perea: "Beyond Jordan", nt3_gabbatha: { n: "Gabbatha", alt: ["Antonia Fortress"] },
    nt3_berggalilea: "The mountain in Galilee", nt4_milete: "Miletus", nt4_kos: "Coos", nt4_rhodus: "Rhodes", nt4_patara: "Patara",
    nt4_ptolemais: "Ptolemais", nt4_smyrna: "Smyrna", nt4_pergamus: "Pergamos", nt4_thyatira: "Thyatira", nt4_sardis: "Sardis",
    nt4_filadelfia: "Philadelphia", nt4_laodicea: "Laodicea", nt_thessalonica: "Thessalonica", nt_berea: "Berea", nt_athene: "Athens",
    nt_korinthe: "Corinth", nt_kenchreeen: "Cenchrea", nt_macedonie: "Macedonia", nt_achaje: "Achaia", nt_galatie: "Galatia", nt_asia: "Asia",
    ramothgilead: "Ramoth-gilead", p2_amfipolis: "Amphipolis", p2_apollonia: "Apollonia", p2_areopagus: "Areopagus (Mars’ hill)", p3_frygie: "Phrygia",
    p3_alexandrie: "Alexandria", p3_assus: "Assos", p3_mitylene: "Mitylene", p3_chios: "Chios", p3_samos: "Samos", p3_trogyllium: "Trogyllium",
    sn_gerizim: "Mount Gerizim", og_gennesaret: "Gennesaret", og_dekapolis: "Decapolis", ej_efraim: "Mount Ephraim", ej_veren: "Passages of Jordan",
    ej_tob: "Tob", ej_mizpa: "Mizpeh of Gilead", ej_jabbok: "Brook Jabbok", ej_aroer: "Aroer", ej_minnith: "Minnith", ej_abelkeramim: "Abel-keramim",
    sc_tirza: "Tirzah", sc_zereda: { n: "Zereda", alt: ["Ain Seridah"] }, jh_bethhaggan: "Beth-haggan", jh_jibleam: "Ibleam", jh_betheked: "Beth-eked",
    jh_basan: "Bashan", as_maresa: "Mareshah", as_zefatha: "Valley of Zephathah", as_ijon: "Ijon", as_abelmaim: "Abel-maim", as_geba: "Geba",
    hj_karchemis: "Carchemish", je_tachpanhes: "Tahpanhes", je_migdol: "Migdol", je_nof: "Noph (Memphis)", je_on: "On (Beth-shemesh)",
    je_pathros: "Pathros", st_ruben: "Reuben", st_gad: "Gad", st_manasse_oost: "Half Manasseh (east)", st_juda: "Judah", st_efraim: "Ephraim",
    st_manasse_west: "Half Manasseh (west)", st_benjamin: "Benjamin", st_simeon: "Simeon", st_zebulon: "Zebulun", st_issaschar: "Issachar",
    st_aser: "Asher", st_naftali: "Naphtali", st_dan: "Dan (tribe)", st_bezer: "Bezer", st_golan: "Golan", dr_refaim: "Valley of Rephaim",
    dr_baalperazim: "Baal-perazim", dr_gezer: "Gezer", dr_zoba: "Zobah", dr_hamath: "Hamath", dr_zoutdal: { n: "Valley of Salt", alt: ["Wadi el-Milh (near Beer-sheba)"] },
    dr_medeba: "Medeba", dr_maacha: "Maachah", dr_helam: "Helam", br_kolosse: "Colosse", br_kreta: "Crete", br_nikopolis: "Nicopolis",
    br_pontus: "Pontus", br_kappadocie: "Cappadocia", br_bithynie: "Bithynia", ka_moreseth: "Moresheth", kb_herdersveld: "Fields near Bethlehem",
    kc_rama: "Ramah",
  },
};

// ---------- plaatsen van de vertaalde geschiedenissen: uitleg, ligging nu en verantwoording ----------
// Versnummering: SV Psalm 76:3 is KJV Psalm 76:2.
(function (P) {
  const zet = (id, v) => { P[id] = Object.assign(typeof P[id] === "string" ? { n: P[id] } : P[id] || {}, v); };
  zet("etham", { d: "‘in the edge of the wilderness’ (Exodus 13:20). Exactly where, we do not know.", nu: "Unknown; near the eastern border of Egypt", bron: "Unknown; suggestions differ widely. The point is illustrative." });
  zet("pihachiroth", { d: "By the sea, ‘between Migdol and the sea’, where the people were trapped between Pharaoh’s army and the water (Exodus 14:2, 9). Exactly where, we do not know.", nu: "Unknown; point near the Bitter Lakes, Egypt", bron: "Unknown; depends on where the crossing was. The point is illustrative." });
  zet("ramses", { d: "One of the treasure cities that the Israelites had to build as slaves (Exodus 1:11). Here the exodus began (Exodus 12:37).", nu: "Qantir / Tell el-Dab‘a, eastern Nile Delta, Egypt", bron: "Usually the Egyptian capital Pi-Ramesse near Qantir; probable." });
  zet("sukkotheg", { d: "The first stop after Rameses (Exodus 12:37). Exactly where, we do not know.", nu: "Unknown; somewhere in the Wadi Tumilat, Egypt", bron: "Unknown; often looked for at Tell el-Maskhuta (Egyptian Tjeku). The point is illustrative." });
  zet("schelfzee", { d: "The sea that God divided (Exodus 14:21). Where exactly the people went through, we do not know. People think of the Gulf of Suez or of the lakes north of it.", nu: "Gulf of Suez, Egypt", bron: "Disputed. Here: the northern tip of the Gulf of Suez. Other suggestions: the Bitter Lakes, Lake Timsah or the Ballah Lakes." });
  zet("ri_ofra", { d: "Home town of Gideon. Here he threshed wheat by the winepress and built an altar (Judges 6). Where exactly Ophrah lay, we do not know; perhaps near the valley of Jezreel.", nu: "Unknown; somewhere in the land of Manasseh", bron: "Unknown; suggested among others Afula and et-Taiyiba. The point is illustrative." });
  zet("ri_harod", { d: "At this well God chose three hundred men (Judges 7:1–7). A large spring at the foot of Mount Gilboa.", nu: "Ein Harod (Ain Jalud), Israel", bron: "Usually Ein Harod; probable." });
  zet("ri_more", { d: "Beyond this hill, in the valley, lay the army of the Midianites (Judges 7:1).", nu: "Givat HaMoreh, northern Israel", bron: "Usually Givat HaMoreh (Jebel Dahi); probable." });
  zet("abelmehola", { d: "Home town of Elisha (1 Kings 19:16).", nu: "Tell Abu Sus, Jordan Valley", bron: "Usually Tell Abu Sus; probable, not certain." });
  zet("elah", { d: "The valley where David defeated Goliath (1 Samuel 17:2). The Philistines lay ‘between Shochoh and Azekah’ (1 Samuel 17:1).", nu: "Emek HaEla (Wadi es-Sant), Israel", bron: "The valley is known; the point lies between Shochoh and Azekah (1 Samuel 17:1)." });
  zet("gath", { d: "A city of the Philistines, the city of Goliath (1 Samuel 17:4).", nu: "Tell es-Safi, Israel", bron: "Tell es-Safi; now generally accepted." });
  zet("efrath", { d: "Also called Ephrath. Rachel was buried by the way there (Genesis 35:19). Ruth and Boaz lived here, and David came from here (1 Samuel 16). Later the Lord Jesus was born here.", nu: "Bethlehem, West Bank", bron: "Bethlehem; the name stayed in use." });
  zet("adullam", { d: "Near this city was the cave where David hid (1 Samuel 22:1).", nu: "Khirbet esh-Sheikh Madhkur, Israel", bron: "Usually Khirbet esh-Sheikh Madhkur; probable. Which cave it was, we do not know." });
  zet("ekron", { d: "A city of the Philistines (1 Samuel 5:10).", nu: "Tel Miqne, Israel", bron: "Tel Miqne; an inscription with the name Ekron was found here." });
  zet("jona_gathhefer", { d: "The village of Jonah, in Galilee (2 Kings 14:25). Close to the later Nazareth.", nu: "Tel Gat Hefer near Mashhad, northern Israel", bron: "Usually Tel Gat Hefer near the village of Mashhad; probable." });
  zet("ninivest", { d: "Capital of Assyria, on the Tigris. Jonah had to preach here. A city ‘of three days’ journey’ (Jonah 3:3).", nu: "Ruins near Mosul, Iraq", bron: "Nineveh (Kuyunjik and Nebi Yunus); identification certain." });
  zet("joppe", { d: "A port (now Jaffa). Here Jonah went on board (Jonah 1:3).", nu: "Jaffa (Tel Aviv-Jaffa), Israel", bron: "Jaffa; the name stayed in use." });
  zet("megiddo", { d: "A fortress city by the valley of Jezreel. Here King Josiah was killed (2 Kings 23:29).", nu: "Tel Megiddo, Israel", bron: "Tel Megiddo; identification generally accepted." });
  zet("babelst", { d: "The capital of Nebuchadnezzar. Daniel, and later all Judah, were carried away here.", nu: "Ruins of Babylon near Hillah, Iraq", bron: "Babylon; identification certain." });
  zet("nt_nazareth", { d: "The village in Galilee where Mary and Joseph lived and where Jesus grew up (Luke 2:39–40, 51).", nu: "Nazareth, Israel", bron: "Nazareth; the name stayed in use." });
  zet("nt_meer", { d: "Also called ‘the sea of Tiberias’ (John 21:1) or ‘the lake of Gennesaret’ (Luke 5:1). Here Peter and Andrew fished, and here Jesus calmed the storm.", nu: "Lake of Tiberias (Kinneret), Israel", bron: "A lake; the name stayed in use." });
  zet("nt_gadara", { d: "The other side of the lake, where Jesus set a man free from evil spirits (Mark 5:1; in Matthew 8:28: ‘the country of the Gergesenes’). Which place on the shore exactly, we do not know.", nu: "East shore of the lake (near Kursi?), Israel", bron: "Manuscripts say Gadarenes, Gerasenes or Gergesenes; often looked for at Kursi (OpenBible: Gergesa = Kursi). Gadara (Umm Qais) lies 10 km from the lake. The point is illustrative." });
  zet("nt_kapernaum", { d: "A city by the Sea of Galilee. Jesus lived here for a time (Matthew 4:13); many miracles happened here.", nu: "Tell Hum (Kfar Nahum), Israel", bron: "Tell Hum; generally accepted." });
  zet("damascusst", { d: "Capital of Aram (Syria). Naaman thought the rivers of Damascus better than the Jordan (2 Kings 5:12).", nu: "Damascus, Syria", bron: "Damascus; the name stayed in use." });
  zet("salem", { d: "Salem, the city of Melchizedek, is probably Jerusalem (Psalm 76:2). Solomon built the temple here, on mount Moriah (2 Chronicles 3:1).", nu: "Old City of Jerusalem", bron: "Jerusalem; the place is certain. That Salem (Genesis 14) is Jerusalem is the usual explanation (Psalm 76:2)." });
})(BR.vertaling.en.plaatsen);

// ---------- personen (BR.mensen) die in de vertaalde geschiedenissen voorkomen ----------
// Alleen deze personen bestaan in het Engels; familiebanden naar personen die niet vertaald zijn, vallen weg.
BR.vertaling.en.mensen = {
  mozes: { n: "Moses", kort: "The leader whom God called to lead His people out of Egypt; through him God gave the law on Sinai.", leeftijd: [[40, "Acts 7:23"], [80, "Exodus 7:7"], [120, "Deuteronomy 34:7"]],
    elders: [["Psalm 90", "The heading of Psalm 90 calls it a prayer of Moses, the man of God."], ["Micah 6:4", "‘I sent before thee Moses, Aaron, and Miriam.’"], ["Matthew 17:3", "On the mount of the transfiguration Moses and Elijah talk with the Lord Jesus."], ["John 1:17", "The law was given by Moses; grace and truth came by Jesus Christ."], ["Hebrews 11:23–29", "By faith Moses chose rather to suffer affliction with the people of God."]],
    vervolg: [["Deuteronomy 34:10", "There arose not a prophet since in Israel like unto Moses."]] },
  mirjam: { n: "Miriam", kort: "Sister of Moses and Aaron, a prophetess; after the crossing of the Red Sea she sang with a timbrel in her hand.",
    elders: [["Micah 6:4", "God names her together with Moses and Aaron."], ["Deuteronomy 24:9", "‘Remember what the LORD thy God did unto Miriam’."]] },
  gideon: { n: "Gideon", alias: ["Jerubbaal"], kort: "A judge who defeated the Midianites with three hundred men; the angel of the LORD called him ‘thou mighty man of valour’ (Judges 6:12).",
    elders: [["1 Samuel 12:11", "Samuel calls him Jerubbaal."], ["Hebrews 11:32", "Named among the heroes of faith."]] },
  pura: { n: "Phurah", kort: "Servant of Gideon, who went with him at night to the camp of the Midianites." },
  david: { n: "David", kort: "The shepherd boy from Bethlehem whom God chose as king: ‘a man after mine own heart’ (Acts 13:22).", leeftijd: [[30, "2 Samuel 5:4"]],
    elders: [["Psalm 23:1", "The psalm of the good Shepherd is a psalm of David."], ["Psalm 78:70–71", "God took David from the sheepfolds to feed His people."], ["Isaiah 9:7", "The Messiah will sit upon the throne of David."], ["Matthew 1:1", "Jesus Christ, the son of David."], ["Acts 13:22", "‘I have found David the son of Jesse, a man after mine own heart’."]] },
  goliath: { n: "Goliath", kort: "A giant from Gath, the champion of the Philistines; David defeated him with a sling and a stone.",
    vervolg: [["1 Samuel 21:9", "The sword of Goliath is at Nob, and David takes it with him."]] },
  saul: { n: "Saul", kort: "The first king of Israel, of the tribe of Benjamin; because he disobeyed God, God rejected him.",
    elders: [["Acts 13:21", "God gave them Saul the son of Cis for forty years."]], vervolg: [["2 Samuel 1:17–27", "David makes a lament over Saul and Jonathan."]] },
  jona: { n: "Jonah", kort: "A prophet, the son of Amittai from Gath-hepher; God sent him to Nineveh.",
    elders: [["2 Kings 14:25", "Jonah foretold that Jeroboam would restore the borders of Israel."], ["Matthew 12:39–41", "The sign of the prophet Jonah: three days and three nights."]] },
  daniel: { n: "Daniel", alias: ["Belteshazzar"], kort: "A youth from Judah who was carried away to Babylon; he kept faithfully praying to God, even when he had to go into the lions’ den.",
    elders: [["Ezekiel 14:14", "Named with Noah and Job as righteous men."], ["Matthew 24:15", "The Lord Jesus names ‘Daniel the prophet’."]] },
  darius_meder: { n: "Darius", kort: "Darius the Median, king after Belshazzar; he had to let Daniel be cast into the lions’ den.", leeftijd: [[62, "Daniel 5:31"]],
    elders: [["Daniel 9:1", "Daniel calls him Darius the son of Ahasuerus, of the seed of the Medes (a different Ahasuerus from the one in Esther)."]] },
  jozef_nt: { n: "Joseph", kort: "The husband of Mary, a just man of the house of David. Not the same as Joseph in Genesis. Matthew gives his genealogy, from David through Solomon to ‘Jacob begat Joseph’ (Matthew 1:6, 16). Luke gives the genealogy of Mary, from David through Nathan; Heli is the father of Mary (Luke 3:23, 31).",
    elders: [["Matthew 1:16", "‘And Jacob begat Joseph the husband of Mary, of whom was born Jesus, who is called Christ.’"], ["Luke 3:23", "‘being (as was supposed) the son of Joseph, which was the son of Heli’."], ["Matthew 1:19–24", "He did as the angel of the Lord had commanded him in a dream."], ["Matthew 2:13–14", "Warned in a dream, he flees with the young child and His mother to Egypt."], ["Matthew 2:19–23", "After the death of Herod he goes back and lives in Nazareth."]],
    basis: { p: { maria: ["b", "Matthew 1:16"] } } },
  maria: { n: "Mary", kort: "A virgin from Nazareth, espoused to Joseph of the house of David; the mother of the Lord Jesus. Luke 3 gives her genealogy, from David through Nathan. To the angel she said: ‘Behold the handmaid of the Lord; be it unto me according to thy word’ (Luke 1:38).",
    elders: [["Luke 1:46–47", "Her song of praise: ‘My soul doth magnify the Lord’."], ["Luke 1:36", "Elisabeth was her cousin."], ["John 2:5", "At the wedding in Cana: ‘Whatsoever he saith unto you, do it.’"]],
    vervolg: [["John 19:25–27", "She stands by the cross; the Lord Jesus entrusts her to the disciple whom He loved."], ["Acts 1:14", "After the ascension she prays with the apostles in Jerusalem."]],
    basis: { p: { jozef_nt: ["b", "Matthew 1:16"] } } },
  jezus: { n: "Jesus", alias: ["The Lord Jesus", "The Son of man"], kort: "The Son of God (Luke 1:35). Mary, the espoused wife of Joseph, was found with child of the Holy Ghost; Joseph called His name Jesus, ‘for he shall save his people from their sins’ (Matthew 1:18–25).", leeftijd: [[12, "Luke 2:42"]],
    elders: [["John 1:14", "‘And the Word was made flesh, and dwelt among us’."], ["Luke 3:23", "When He began, He was about thirty years of age; people supposed that He was the son of Joseph."], ["Matthew 16:16", "Peter confesses: ‘Thou art the Christ, the Son of the living God.’"], ["John 14:6", "‘I am the way, the truth, and the life’."]],
    vervolg: [["Matthew 28:6", "‘He is not here: for he is risen, as he said.’"], ["Acts 1:9", "He was taken up, and a cloud received Him out of their sight."], ["Revelation 1:17–18", "‘I am the first and the last … I am alive for evermore’."]],
    basis: { m: ["b", "Matthew 1:16"] } },
  paulus: { n: "Paul", alias: ["Saul"], kort: "Saul, ‘who also is called Paul’ (Acts 13:9): a Jew from Tarsus in Cilicia, of the tribe of Benjamin, a Pharisee. At first he persecuted the church; on the road to Damascus the Lord Jesus appeared to him. After that he became ‘the apostle of the Gentiles’ (Romans 11:13).",
    elders: [["Acts 7:58", "At the stoning of Stephen the witnesses laid down their clothes ‘at a young man’s feet, whose name was Saul’."], ["Acts 9:3–5", "‘Saul, Saul, why persecutest thou me?’"], ["Acts 22:3", "Born in Tarsus, brought up at the feet of Gamaliel."], ["Philippians 3:5", "‘of the tribe of Benjamin, an Hebrew of the Hebrews’."], ["Romans 11:13", "‘I am the apostle of the Gentiles’."], ["1 Corinthians 15:9", "‘I am the least of the apostles … because I persecuted the church of God.’"], ["2 Timothy 4:7", "‘I have fought a good fight’."]],
    vervolg: [["Acts 13:9", "From here on he is called Paul."], ["Acts 28:30–31", "For two years he preaches the kingdom of God in Rome, with no man forbidding him."]] },
  ananias_damascus: { n: "Ananias of Damascus", kort: "A disciple in Damascus. The Lord sent him to Saul; he laid his hands on him, Saul received his sight and was baptized. Not the same as Ananias, the husband of Sapphira.",
    elders: [["Acts 9:10–18", "‘he is a chosen vessel unto me’."], ["Acts 22:12", "Paul calls him ‘a devout man according to the law’."]] },
};

// ---------- Bijbelboeken in de Engelse reis: naam, jaartal, ‘Wie is wie’ en een volgordevraag over het hele boek ----------
BR.vertaling.en.boeken = {
  genesis: { n: "Genesis", tijd: "Primeval history", ordAlles: [{ q: "Who came first? Put them in the order of the genealogy.", items: ["Adam", "Seth", "Enoch", "Noah"] }] },
  exodus: { n: "Exodus", wie: [
    { n: "Moses", rol: "leader of Israel", i: "Saved as a baby from the Nile, brought up in Pharaoh’s palace, then a shepherd in Midian. God called him at the burning bush to lead His people out of Egypt. He lived to be 120 years old (Deuteronomy 34:7)." },
    { n: "Aaron", rol: "brother of Moses, the first high priest", deel: "uittocht", i: "Three years older than Moses (Exodus 7:7). He spoke for Moses to Pharaoh and did the first plagues with his rod. He made the golden calf. Yet he was anointed as the first high priest (Leviticus 8:12)." },
    { n: "Miriam", rol: "sister of Moses and Aaron, prophetess", deel: "uittocht", i: "She was the girl who watched over the ark of bulrushes (Exodus 2:4; Numbers 26:59). After the crossing of the Red Sea she led the people in song with a timbrel in her hand (Exodus 15:20–21)." },
    { n: "Pharaoh", rol: "king of Egypt", deel: "uittocht", i: "The Bible gives no names, and there are two kings. The first Pharaoh made Israel slaves and had the little boys thrown into the Nile; he died while Moses was in Midian (Exodus 2:23). To the next Pharaoh Moses said: ‘Let my people go’. For ten plagues he refused; his army was drowned in the Red Sea (Exodus 14:28)." },
  ], ordAlles: [{ q: "Put the history of Exodus in the right order.", items: ["Moses in the ark of bulrushes", "The burning bush", "Through the Red Sea", "The Ten Commandments"] }] },
  richteren: { n: "Judges", wie: [
    { n: "Deborah", rol: "prophetess and judge", deel: "debora", i: "She sat under a palm tree between Ramah and Bethel, and the people came up to her for judgment. She called Barak and went with him into battle (Judges 4)." },
    { n: "Barak", rol: "captain of the army", deel: "debora", i: "From Kedesh-naphtali. He only dared to go if Deborah went with him. With ten thousand men he came down from Mount Tabor (Judges 4:6–14)." },
    { n: "Jael", rol: "wife of Heber the Kenite", deel: "debora", i: "Sisera fled to her tent. While he slept, she killed him with a tent peg. Deborah calls her ‘Blessed above women’ (Judges 4:17–22, 5:24)." },
    { n: "Sisera", rol: "captain of Jabin’s army", deel: "debora", i: "He had nine hundred chariots of iron and oppressed Israel for twenty years. At the river Kishon he lost everything and fled on foot (Judges 4:2–3, 15)." },
    { n: "Gideon", rol: "judge, also called Jerubbaal", deel: "debora", i: "The angel of the LORD found him by the winepress in Ophrah. He asked for signs with a fleece and defeated the Midianites with three hundred men (Judges 6–8)." },
    { n: "Phurah", rol: "servant of Gideon", deel: "debora", i: "He went with Gideon at night to the camp of the Midianites and heard there the dream about the cake of barley bread (Judges 7:10–11)." },
  ] },
  "1samuel": { n: "1 Samuel", wie: [
    { n: "Saul", rol: "the first king", deel: "saul-david", i: "A tall, goodly man of the tribe of Benjamin. He became king while he was looking for asses. He won wars, but did not obey God, and God rejected him. He died on Mount Gilboa (31)." },
    { n: "Jonathan", rol: "son of Saul, friend of David", deel: "saul-david", i: "Brave and faithful. With only his armourbearer he climbed up to the camp of the Philistines. He made a covenant with David and protected him against his own father. He was killed together with Saul (31:2)." },
    { n: "David", rol: "shepherd, later king", deel: "saul-david", i: "The youngest son of Jesse from Bethlehem. Samuel anointed him, he defeated Goliath and had to flee from Saul for years. In 2 Samuel he becomes king. ‘the LORD looketh on the heart’ (16:7)." },
    { n: "Jesse", rol: "father of David", deel: "saul-david", i: "A man from Bethlehem with eight sons (17:12). His grandfather and grandmother were Boaz and Ruth (Ruth 4:17). He sent David with bread and cheeses to the army (17:17–18)." },
    { n: "Goliath", rol: "giant from Gath", deel: "saul-david", i: "The champion of the Philistines, six cubits and a span tall (17:4): almost three metres. For forty days he defied Israel. David defeated him with a sling and a stone." },
  ] },
  jona: { n: "Jonah", wie: [
    { n: "Jonah", rol: "prophet from Gath-hepher", deel: "jona", i: "Son of Amittai, from Galilee. He has to go to Nineveh, but flees to Tarshish. After three days in the fish he goes after all. When God spares the city, he is angry: that was exactly why he had fled, for he knew that God is gracious (Jonah 4:1–2)." },
    { n: "Sailors", rol: "the crew of the ship", i: "In the storm they each cry to their own god and cast lots. When they throw Jonah into the sea, it becomes calm. Then they fear the LORD and offer Him a sacrifice." },
    { n: "King", rol: "king of Nineveh", i: "When he hears Jonah’s message, he rises from his throne, covers himself with sackcloth and sits in ashes. He makes the whole city fast, even the animals." },
  ] },
  daniel: { n: "Daniel", wie: [
    { n: "Daniel", rol: "prophet at the court of Babylon", deel: "daniel", i: "Carried away to Babylon as a youth from Judah. There he is given the name Belteshazzar. God gives him understanding of dreams; he serves under Nebuchadnezzar, Belshazzar, Darius and Cyrus and keeps praying to his God." },
    { n: "Nebuchadnezzar", rol: "king of Babylon", i: "The mighty king who besieges Jerusalem and takes away the vessels of the temple. He dreams of a great image, has a golden image made and is humbled by God: he eats grass as oxen, until he acknowledges that God rules." },
    { n: "Darius", rol: "the Median, king after Belshazzar", i: "He was about 62 years old when he took the kingdom (Daniel 5:31), a son of Ahasuerus, of the seed of the Medes (9:1). He makes Daniel one of the three highest rulers. Other rulers trap him with a trick, so that he has to let Daniel be cast into the lions’ den. He does not sleep that night. Who this Darius was in history is not certain." },
  ] },
  "jezus-1": { n: "The Lord Jesus: birth and Galilee", tijd: "c. 7 BC – 30 AD (reconstruction)", wie: [
    { n: "Jesus", rol: "the Son of God", deel: "nt-geboorte", i: "Born in Bethlehem, brought up in Nazareth. When He was about thirty, His public ministry began (Luke 3:23). The name Jesus was given ‘for he shall save his people from their sins’ (Matthew 1:21)." },
    { n: "Mary", rol: "mother of the Lord Jesus", deel: "nt-geboorte", i: "A virgin from Nazareth, espoused to Joseph. To the angel she said: ‘Behold the handmaid of the Lord; be it unto me according to thy word’ (Luke 1:38). She kept everything that happened in her heart (Luke 2:19, 51)." },
    { n: "Joseph", rol: "husband of Mary", deel: "nt-geboorte", i: "A just man of the house of David (Matthew 1:19–20). Four times he received a message from God in a dream (Matthew 1:20; 2:13, 19, 22), and each time he did what he was told (Matthew 1:24; 2:14, 21–22)." },
  ] },
  "jezus-2": { n: "The Lord Jesus on the way", wie: [
    { n: "Jesus", rol: "the Christ, the Son of God", i: "Peter confesses: ‘Thou art the Christ, the Son of the living God’ (Matthew 16:16). He says about Himself: ‘I am the bread of life’, ‘I am the good shepherd’ and ‘I am the resurrection, and the life’ (John 6:35; 10:11; 11:25)." },
  ] },
  handelingen: { n: "Acts", wie: [
    { n: "Saul / Paul", rol: "persecutor, then apostle", deel: "nt-paulus", i: "Born in Tarsus, a pupil of Gamaliel (Acts 22:3). He persecutes the church, but the Lord Jesus appears to him on the road to Damascus. After that he takes the gospel to Cyprus, Asia Minor, Macedonia and finally Rome." },
    { n: "Barnabas", rol: "“the son of consolation”", deel: "nt-paulus", i: "A Levite from Cyprus (Acts 4:36). He brings Saul to the apostles, fetches him to Antioch and goes with him on the first journey. Later they part because of John Mark (15:39)." },
  ] },
};
