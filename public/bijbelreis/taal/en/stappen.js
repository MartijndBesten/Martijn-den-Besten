// De Engelse inhoud van de Bijbelreis, deel 2: de delen van de reis en hun stappen. Status: concept (review draft).
// Sleutels: ‘boek:deel’ en ‘boek:deel:index’ (dezelfde als de voortgang). Een stap met txt is helemaal vertaald; een stap
// met alleen t en stamp staat in het Engels met een korte melding (taal/laag.js). Verwijzingen in KJV-versnummering.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
(function (V) {
  V.delen = V.delen || {};
  V.stappen = V.stappen || {};
  const deel = (key, d) => { V.delen[key] = d; };
  const stap = (key, s) => { V.stappen[key] = s; };

  // ---------- Exodus: de uittocht (geschiedenis 26) ----------
  deel("exodus:uittocht", {
    n: "The exodus", short: "Exodus",
    intro: "Moses and Aaron ask Pharaoh to let the people go. He refuses, through ten plagues. Then, in the night of the Passover, he lets Israel go. But at the sea he changes his mind. God makes a way through the water and saves His people. Later the Bible reminds us of it again and again.",
    tijdNoot: "Reconstruction based on 1 Kings 6:1: the exodus took place 480 years before the fourth year of Solomon (c. 966 BC). The people left on the fifteenth day of the first month (Numbers 33:3). Exodus 12:40 mentions 430 years in Egypt; some old translations and interpreters also count the time of the patriarchs in Canaan (compare Galatians 3:17). Many researchers date the exodus in the 13th century BC.",
    stat: "Numbers 33 lists the whole journey: after Rameses the people set up their camp 41 times, until they reach the Jordan.",
    cross: [
      ["Psalm 106:9–12", "A song about the crossing: ‘He rebuked the Red sea also, and it was dried up’."],
      ["1 Corinthians 5:7", "Paul writes: ‘For even Christ our passover is sacrificed for us’."],
      ["John 1:29", "John the Baptist points to Jesus: ‘Behold the Lamb of God, which taketh away the sin of the world.’"],
      ["Hebrews 11:28–29", "By faith Moses kept the Passover, and the people passed through the Red sea as by dry land."],
      ["Revelation 15:2–3", "In heaven the victors sing ‘the song of Moses the servant of God, and the song of the Lamb’."],
      ["1 Corinthians 10:1–2", "Paul says that the people were, as it were, baptised in the cloud and in the sea."],
    ],
    trips: ["Rameses → Etham", "Pharaoh after Israel", "Red Sea → Elim", "All that the people travelled in the exodus"],
    quiz: {
      tap: [
        { id: "ramses", q: "Tap Rameses, where the exodus began.", v: "wide" },
        { id: "gosen", q: "Tap Goshen, where Israel lived when God sent the plagues.", v: "wide" },
        { id: "schelfzee", q: "Tap the Red Sea, where God made a way through the water.", v: [[27.5, 31.5], [31.5, 36.5]], loose: 2 },
        { id: "elim", q: "Tap Elim, with the twelve wells and seventy palm trees.", v: [[27.5, 31.5], [31.5, 36.5]], loose: 2 },
      ],
      mc: [
        { q: "What did Pharaoh say when Moses asked if the people might go?", a: ["“Who is the LORD … I know not the LORD”", "“Go, and be quick”", "“Come back tomorrow”"], why: "Exodus 5:2" },
        { q: "What was the first plague?", a: ["The water became blood", "Frogs", "Darkness"], why: "Exodus 7:20" },
        { q: "For how many days was it dark in Egypt?", a: ["3 days", "7 days", "40 days"], why: "Exodus 10:22" },
        { q: "What did the Israelites have to put on the doorposts?", a: ["The blood of the lamb", "Oil", "Red paint"], why: "Exodus 12:7" },
        { q: "How many men went out of Egypt?", a: ["About 600,000", "About 6,000", "About 70"], why: "Exodus 12:37" },
        { q: "How did God lead the people by day?", a: ["With a pillar of cloud", "With a pillar of fire", "With a star"], why: "Exodus 13:21" },
        { q: "How did God make a way through the sea?", a: ["With a strong east wind, all night", "With an earthquake", "With a bridge of ice"], why: "Exodus 14:21" },
        { q: "What did Miriam take in her hand for the song?", a: ["A timbrel", "A harp", "A staff"], why: "Exodus 15:20" },
        { q: "How many wells of water were there at Elim?", a: ["12", "7", "70"], why: "Exodus 15:27" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["The ten plagues", "The Passover", "Through the Red Sea", "Marah and Elim"] }],
    },
  });
  stap("exodus:uittocht:0", { t: "Let My people go!", stamp: "Pharaoh" });
  stap("exodus:uittocht:1", { t: "The ten plagues", stamp: "Plagues" });
  stap("exodus:uittocht:2", { t: "The Passover", stamp: "Passover" });
  stap("exodus:uittocht:3", { t: "Out of Egypt!", stamp: "Exodus", who: [["People", "c. 600,000 men"], ["Moses", "80"], ["Aaron", "83"]] });
  stap("exodus:uittocht:4", {
    t: "Trapped at the sea", stamp: "Trapped!", who: [["People"], ["Army", "600 chariots"], ["Pharaoh"]],
    txt: "God has the people turn back and camp at Pi-hahiroth, by the sea. Pharaoh is sorry: “Why did we let our slaves go?” He chases after them with six hundred of his best chariots, all the other chariots of Egypt and his whole army. The people see the Egyptians coming and are terrified. They cry out to the LORD and say to Moses: “Were there no graves in Egypt?” Moses says: “Do not be afraid. The LORD will fight for you.” The pillar of cloud goes and stands behind the people, between Israel and the Egyptians.",
    fact: "We do not know exactly where the people crossed the sea, and Pi-hahiroth, Migdol and Baal-zephon cannot be found again with certainty either. Researchers think of, among other places, the lakes north of the Gulf of Suez, the Gulf of Suez itself and sometimes the Gulf of Aqaba. That is why the Red Sea is shown as an area on the map.",
  });
  stap("exodus:uittocht:5", {
    t: "Through the Red Sea", stamp: "Sea",
    txt: "Moses stretches out his hand over the sea. All night long God makes a strong east wind blow. The sea becomes dry, and the water stands like a wall on the left and on the right. Israel walks over the dry ground to the other side. The Egyptians go after them. But God takes the wheels off their chariots, so that they can hardly move forward. “Let us flee, for the LORD is fighting for them!” they cry. At daybreak Moses stretches out his hand again. The water flows back over the chariots and the horsemen. Not one of them is left. Israel sees the Egyptians lying dead on the seashore. And the people fear the LORD and believe in Him and in Moses.",
    fact: "The Bible comes back to this miracle again and again, for example in Psalm 106:9–11, Psalm 136:13–15 and Hebrews 11:29.",
  });
  stap("exodus:uittocht:6", {
    t: "The song of Moses and Miriam", stamp: "Song", who: [["Moses"], ["Miriam"], ["Women", "with timbrels"]],
    txt: "On the other side Moses sings a song to God with all Israel: “I will sing to the LORD, for He is highly exalted! The horse and its rider He has thrown into the sea.” Miriam, the sister of Aaron, is a prophetess. She takes a timbrel, and all the women follow her, dancing and with timbrels. Miriam sings to them: “Sing to the LORD, for He is highly exalted!”",
    fact: "In Revelation 15:3 the people in heaven sing ‘the song of Moses the servant of God, and the song of the Lamb’.",
  });
  stap("exodus:uittocht:7", { t: "Marah and Elim", stamp: "Elim" });

  // ---------- Genesis: het begin (geschiedenis 1) ----------
  deel("genesis:begin", {
    n: "The beginning", short: "Beginning",
    intro: "Before Abraham lived, Genesis tells how everything began: the creation, the first people, Noah and the ark, and the tower of Babel. Where exactly that happened, we often do not know. That is why only a few places of this part are on the map.",
    tijdNoot: "No date. Genesis 5 and 11 give genealogies with ages, but no years in our calendar. Whoever adds up the ages arrives at a calculation, but interpreters differ about it (for example whether the genealogies name every generation; the old Greek translation gives other numbers). That is why this part is not on the timeline.",
    stat: "Outside Genesis the Bible mentions Noah in 12 more verses, among them the Lord Jesus Himself (Matthew 24:37).",
    cross: [
      ["John 1:1–3", "John begins just like Genesis: ‘In the beginning was the Word’. All things were made by Him."],
      ["Hebrews 11:4–7", "Abel, Enoch and Noah are in the list of people who believed God."],
      ["Matthew 24:37–39", "Jesus compares His coming with the days of Noah."],
      ["1 Peter 3:20", "Eight souls were saved in the ark."],
      ["Acts 2:1–11", "At Babel God confused the language. At Pentecost everyone hears the apostles speak of the wonderful works of God in his own language."],
      ["Revelation 22:1–2", "At the very end of the Bible the tree of life from Eden comes back."],
    ],
    trips: ["Ararat → Babel"],
    quiz: {
      tap: [
        { id: "ararat", q: "Tap the mountains of Ararat, where the ark came to rest.", v: "wide", loose: 2 },
        { id: "babel", q: "Tap Babel, the city of the tower.", v: "wide" },
        { id: "ur", q: "Tap Ur, where Abram came from.", v: "wide" },
      ],
      mc: [
        { q: "What did God do on the seventh day?", a: ["He rested", "He made the people", "He made the sea"], why: "Genesis 2:2" },
        { q: "What were the names of the first two brothers?", a: ["Cain and Abel", "Esau and Jacob", "Shem and Ham"], why: "Genesis 4:1–2" },
        { q: "How long did it rain in the flood?", a: ["40 days and nights", "12 days", "100 days"], why: "Genesis 7:12" },
        { q: "What did the dove bring back to the ark?", a: ["An olive leaf", "A little fish", "A palm branch"], why: "Genesis 8:11" },
        { q: "What is the sign of God’s covenant with Noah?", a: ["The rainbow", "A star", "A dove"], why: "Genesis 9:13" },
        { q: "What happened at the tower of Babel?", a: ["God confused their language", "The tower reached into heaven", "A flood came"], why: "Genesis 11:7–9" },
        { q: "Of whom does the Bible give the highest age?", a: ["Methuselah", "Adam", "Noah"], why: "Genesis 5:27" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["God makes everything", "Cain and Abel", "Noah builds the ark", "The tower of Babel"] }],
    },
  });
  stap("genesis:begin:0", {
    t: "God makes everything", stamp: "Creation",
    onthul: { titel: "Tap a day: what did God make then?", items: [["Day 1", "Light: day and night"], ["Day 2", "The sky above the water"], ["Day 3", "Land, sea and plants"], ["Day 4", "Sun, moon and stars"], ["Day 5", "Fish and birds"], ["Day 6", "Animals and people"], ["Day 7", "God rests"]] },
    txt: "In the beginning God creates the heaven and the earth. In six days He makes light, sky and sea, land and plants, sun, moon and stars, fish and birds, animals and people. He makes man in His image. On the seventh day God rests. Everything He has made is very good.",
    fact: "Genesis 1 says seven times that God saw that it was good. The last time even ‘very good’ (1:31).",
  });
  stap("genesis:begin:1", { t: "The garden of Eden", stamp: "Eden" });
  stap("genesis:begin:2", { t: "Cain and Abel", stamp: "Brothers", who: [["Cain"], ["Abel"], ["Adam", "130 at the birth of Seth"]] });
  stap("genesis:begin:3", { t: "Noah builds the ark", stamp: "Ark", who: [["Noah", "600"], ["Family", "8 people"]] });
  stap("genesis:begin:4", { t: "The rainbow", stamp: "Rainbow", who: [["Noah"], ["Family", "8 people"]] });
  stap("genesis:begin:5", { t: "The tower of Babel", stamp: "Babel" });
  stap("genesis:begin:6", { t: "From Shem to Abram", stamp: "Ur" });

  // ---------- Richteren: Debora en Gideon (geschiedenis 43) ----------
  deel("richteren:debora", {
    n: "Deborah and Gideon", short: "Deborah and Gideon",
    intro: "In the time of the judges the same thing happens again and again: the people forget God, enemies come, the people cry out, and God sends a deliverer. Deborah is a prophetess and judge; with Barak she defeats the army of Sisera. Gideon is a frightened farmer’s son who drives out the Midianites with three hundred men.",
    tijdNoot: "Reconstruction, with great uncertainty. The book of Judges gives years of oppression and of rest for each period (for example 20 years under Jabin, 4:3; 40 years of rest, 5:31; 7 years of Midian, 6:1; 40 years of rest, 8:28). Added together, all those years are longer than fits between Joshua and Saul if you follow 1 Kings 6:1 (480 years from the exodus to the fourth year of Solomon). That is why many interpreters assume that some judges ruled at the same time, in different parts of the land: the periods overlap. One fixed point is Judges 11:26, where Jephthah speaks of 300 years since Israel lived in the land by the Arnon. In this reconstruction Deborah and Gideon fall roughly in the 13th and early 12th century BC; whoever dates the exodus in the 13th century comes out more than a century later.",
    stat: "After Deborah and Barak the land had rest forty years (Judges 5:31), and after Gideon forty years again (8:28). After the judge Ehud even eighty years (3:30).",
    cross: [
      ["Hebrews 11:32", "Gideon, Barak and Samson are in the list of people who trusted God."],
      ["Psalm 83:9–11", "A prayer that God will do to new enemies ‘as to Sisera, as to Jabin, at the brook of Kison’ and make their nobles ‘like Oreb, and like Zeeb’."],
      ["Isaiah 10:26", "The prophet recalls ‘the slaughter of Midian at the rock of Oreb’: so God will defeat Assyria too."],
      ["Isaiah 9:4", "‘As in the day of Midian’: God breaks the yoke, just as in the time of Gideon."],
      ["1 Samuel 12:11", "Samuel names Jerubbaal (Gideon) as one of the deliverers whom God sent."],
      ["Nehemiah 9:27", "Nehemiah sums up the time of the judges: when the people cried to God in their trouble, He gave them saviours."],
    ],
    trips: ["Deborah: palm tree → Kedesh", "Barak: Kedesh → Tabor", "Gideon: Ophrah → well of Harod", "All that Deborah and Gideon travelled"],
    quiz: {
      tap: [
        { id: "hazorst", q: "Tap Hazor, the city of King Jabin.", v: "kanaan" },
        { id: "ri_tabor", q: "Tap Mount Tabor, where Barak stood with his army.", v: "kanaan" },
        { id: "ri_kedes", q: "Tap Kedesh, the home town of Barak.", v: "kanaan" },
        { id: "ri_harod", q: "Tap the well of Harod, where the three hundred men were chosen.", v: "kanaan", loose: 1 },
        { id: "ri_ofra", q: "Tap Ophrah, where Gideon lived.", v: "kanaan", loose: 2 },
      ],
      mc: [
        { q: "Where did Deborah sit when the people came to her?", a: ["Under a palm tree", "In a palace in Hazor", "On Mount Tabor"], why: "Judges 4:5" },
        { q: "How many chariots of iron did Sisera have?", a: ["900", "300", "12"], why: "Judges 4:3" },
        { q: "Who killed Sisera?", a: ["Jael, with a tent peg", "Barak, with his sword", "Deborah, with a stone"], why: "Judges 4:21" },
        { q: "What was Gideon doing when the angel of the LORD came?", a: ["Threshing wheat by the winepress", "Keeping sheep", "Sleeping under a tree"], why: "Judges 6:11" },
        { q: "What did Gideon lay on the ground at night to ask for a sign?", a: ["A fleece of wool", "A cloak", "A pitcher"], why: "Judges 6:37" },
        { q: "How many men did Gideon keep?", a: ["300", "3,000", "10,000"], why: "Judges 7:7" },
        { q: "What did Gideon’s men have in their hands?", a: ["Trumpets, pitchers and lamps", "Swords and shields", "Bows and arrows"], why: "Judges 7:16" },
        { q: "What did Gideon say when the people wanted to make him king?", a: ["The LORD shall rule over you", "All right, but only for ten years", "Ask my father"], why: "Judges 8:23" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["Deborah calls Barak", "The battle at the Kishon", "Gideon by the winepress", "Three hundred men at the well of Harod", "Pitchers and lamps in the night"] }],
    },
  });
  stap("richteren:debora:0", { t: "The same thing again and again", stamp: "Cycle" });
  stap("richteren:debora:1", { t: "Deborah under the palm tree", stamp: "Palm", who: [["Deborah", "prophetess"], ["Jabin", "king of Hazor"], ["Sisera", "900 chariots of iron"]] });
  stap("richteren:debora:2", { t: "Barak to Tabor", stamp: "Tabor", who: [["Deborah"], ["Barak"], ["Soldiers", "10,000 men"]] });
  stap("richteren:debora:3", { t: "The battle at the Kishon", stamp: "Kishon", who: [["Barak"], ["Soldiers", "10,000 men"], ["Sisera", "900 chariots"], ["Deborah"]] });
  stap("richteren:debora:4", { t: "Jael and the tent peg", stamp: "Jael", who: [["Sisera", "on foot"], ["Jael"], ["Barak"]] });
  stap("richteren:debora:5", {
    t: "Gideon by the winepress", stamp: "Ophrah", who: [["Gideon"], ["Midianites", "like grasshoppers"]],
    txt: "For seven years the Midianites come every year with their camels, as many as grasshoppers. They eat up everything and leave no sheep, ox or ass. The Israelites hide in dens in the mountains. Then they cry out to the LORD. In Ophrah Gideon threshes wheat by the winepress, hidden from the Midianites. The angel of the LORD, the Son of God, comes and sits under the oak and says: “The LORD is with you, mighty man of valour!” Gideon: “If the LORD is with us, why has all this happened? My family is the poorest in Manasseh and I am the least in my father’s house.” God: ‘Surely I will be with thee’. Fire comes out of the rock and consumes Gideon’s offering. Gideon builds an altar and calls it ‘Jehovah-shalom’: the LORD is peace.",
    fact: "Normally you thresh wheat in an open place where the wind blows, so that the chaff blows away. Gideon does it in a winepress, a pit in the rock. That way the Midianites do not see it.",
  });
  stap("richteren:debora:6", {
    t: "The fleece", stamp: "Fleece", who: [["Gideon"], ["People", "Manasseh, Asher, Zebulun and Naphtali"]],
    txt: "That same night God says: “Throw down the altar of Baal that belongs to your father.” Gideon does it at night with ten servants, because he is afraid. The men of the city want to kill him, but his father Joash says: “Let Baal stand up for himself.” From then on Gideon is also called Jerubbaal. The Midianites camp in the valley of Jezreel. The Spirit of the LORD comes upon Gideon; he blows the trumpet and the tribes come. Then Gideon asks for a sign: a fleece of wool on the ground. First only the fleece is wet with dew, a bowl full of water. The next night only the fleece is dry and the ground is wet. God does both.",
    fact: "A fleece is the shorn coat of a sheep, with the wool still on it. Gideon asked twice for a sign, and God patiently gave it both times.",
  });
  stap("richteren:debora:7", {
    t: "Three hundred men at the well of Harod", stamp: "300", who: [["Gideon"], ["Soldiers", "300 men"], ["Midianites", "countless"]],
    vergelijk: { titel: "From 32,000 to 300", rijen: [["At the start", 32000, "32,000 men"], ["After “whoever is afraid, go home”", 10000, "10,000 men"], ["After the test at the water", 300, "300 men"]], noot: "Judges 7:3 and 7:6–7. God did not want Israel to say: ‘Mine own hand hath saved me.’" },
    txt: "Gideon sets up his camp by the well of Harod. The army of Midian lies north of him in the valley, by the hill of Moreh. God says: “You have too many people. Otherwise Israel will say afterwards: we saved ourselves.” Whoever is afraid may go home: 22,000 men leave, 10,000 stay. “Still too many.” At the water God watches how they drink. Whoever brings the water to his mouth with his hand and laps it, stays: there are three hundred of them. The rest go home. God says: “By these three hundred I will save you.”",
    fact: "The army of Midian was enormous: 120,000 men fell and 15,000 were left (8:10). That is 135,000 men, against three hundred.",
  });
  stap("richteren:debora:8", {
    t: "Pitchers, lamps and trumpets", stamp: "Lamps", who: [["Gideon"], ["Phurah"], ["Soldiers", "300 men in 3 companies"], ["Midianites", "fleeing"]],
    txt: "At night Gideon creeps with his servant Phurah to the camp of the enemy. He hears a soldier tell his dream: a cake of barley bread rolls into the camp and overturns the tent. “That is the sword of Gideon!” Gideon bows down and thanks God. He divides the three hundred into three companies. Everyone gets a trumpet and an empty pitcher with a lamp inside. In the middle of the night, all around the camp: trumpets blow, pitchers are broken, lamps are held up, and they cry: “The sword of the LORD, and of Gideon!” Panic breaks out in the camp. The Midianites fight against each other and flee towards the Jordan. Gideon pursues them, also across the Jordan, and defeats their kings. But from the gold of the spoil Gideon makes an ephod, a priest’s garment, and puts it in Ophrah. All Israel begins to worship it, and it becomes a snare to Gideon and his family. Yet the land has rest forty years.",
    fact: "After the victory the people want to make Gideon king. He says: ‘I will not rule over you, neither shall my son rule over you: the LORD shall rule over you’ (8:23).",
  });

  // ---------- 1 Samuël: Saul en David (geschiedenis 52) ----------
  deel("1samuel:saul-david", {
    n: "Saul and David", short: "Saul and David",
    intro: "King Saul begins well, but he does not do what God says. God chooses a new king: David, the youngest son of Jesse from Bethlehem. David defeats Goliath and becomes famous. Saul becomes jealous and hunts him for years. David flees through all Judah, from cave to cave, until Saul dies on Mount Gilboa.",
    tijdNoot: "Reconstruction: Saul reigned forty years (Acts 13:21) and died just before David became king; David was thirty then (2 Samuel 5:4). In the usual chronology that is c. 1010 BC. Other datings move these years by a few decades.",
    stat: "Saul had three thousand men when he sought David at En-gedi and in Ziph (24:2, 26:2). David had six hundred (23:13, 27:2).",
    cross: [
      ["Acts 13:22", "Paul calls David ‘a man after mine own heart’. It already says so in 1 Samuel 13:14."],
      ["Psalm 23", "David was a shepherd before he became king. ‘The LORD is my shepherd; I shall not want.’"],
      ["Psalm 34", "David wrote this song after he had pretended to be mad before the king of Gath (see the heading of the psalm)."],
      ["Psalm 57; 142", "Two prayers of David ‘in the cave’, while he was fleeing from Saul (see the headings)."],
      ["Matthew 12:3–4", "Jesus recalls how David ate the shewbread at Nob."],
      ["Ruth 4:17", "Obed, the son of Ruth and Boaz, was David’s grandfather."],
      ["1 Chronicles 10:13", "Saul died because he did not obey God and asked a woman with a familiar spirit."],
    ],
    trips: ["Bethlehem → valley of Elah", "Fleeing: Gibeah → Adullam", "Keilah → Ziph → En-gedi", "All that David travelled"],
    quiz: {
      tap: [
        { id: "efrath", q: "Tap Bethlehem, where Samuel anointed David.", v: "kanaan", name: "Bethlehem" },
        { id: "elah", q: "Tap the valley of Elah, where David defeated Goliath.", v: "kanaan" },
        { id: "gath", q: "Tap Gath, the city of Goliath.", v: "kanaan" },
        { id: "adullam", q: "Tap Adullam, the cave where David hid.", v: "kanaan" },
        { id: "engedi", q: "Tap En-gedi, where David cut off a piece of Saul’s robe.", v: "kanaan" },
        { id: "ziklag", q: "Tap Ziklag, the city that David got from Achish.", v: "kanaan" },
        { id: "gilboa", q: "Tap Mount Gilboa, where Saul and Jonathan died.", v: "kanaan" },
      ],
      mc: [
        { q: "With whom did Jonathan climb up to the camp of the Philistines?", a: ["Only with his armourbearer", "With the whole army", "With David"], why: "1 Samuel 14:6–13" },
        { q: "Why did God reject Saul as king?", a: ["He did not do what God said in the battle against Amalek", "He was too small", "He did not want to be king any more"], why: "1 Samuel 15:23" },
        { q: "What does God look at, He said to Samuel?", a: ["At the heart", "At how tall someone is", "At the clothes"], why: "1 Samuel 16:7" },
        { q: "What did David do when Saul was troubled?", a: ["He played on the harp", "He told a story", "He went to keep the sheep"], why: "1 Samuel 16:23" },
        { q: "How many stones did David pick out of the brook?", a: ["5", "1", "12"], why: "1 Samuel 17:40" },
        { q: "How tall was Goliath?", a: ["Six cubits and a span (almost 3 metres)", "Three cubits (one and a half metres)", "Ten cubits (almost 5 metres)"], why: "1 Samuel 17:4" },
        { q: "What did Jonathan give to David?", a: ["His robe, sword and bow", "A crown", "A harp"], why: "1 Samuel 18:4" },
        { q: "What did David do in the cave at En-gedi?", a: ["He cut off the skirt of Saul’s robe", "He took Saul prisoner", "He slept all night"], why: "1 Samuel 24" },
        { q: "What did Abigail do when David wanted to take revenge on Nabal?", a: ["She brought him asses loaded with food", "She hid Nabal", "She called Saul for help"], why: "1 Samuel 25:18" },
        { q: "How long did David live in the land of the Philistines?", a: ["A year and four months", "Seven years", "Three weeks"], why: "1 Samuel 27:7" },
        { q: "Who took the body of Saul from the wall of Beth-shan?", a: ["The men of Jabesh-gilead", "David and his men", "The priests of Nob"], why: "1 Samuel 31:11–13" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["Samuel anoints David", "David defeats Goliath", "David spares Saul in the cave", "Saul dies on Gilboa"] }],
    },
  });
  stap("1samuel:saul-david:0", { t: "Jonathan climbs up", stamp: "Michmash", who: [["Jonathan"], ["Armourbearer"], ["Saul"], ["Enemies", "Philistines"]] });
  stap("1samuel:saul-david:1", { t: "Saul does not listen", stamp: "Rejected", who: [["Saul"], ["Samuel"], ["Agag"], ["Enemies", "Amalekites"]] });
  stap("1samuel:saul-david:2", { t: "The youngest son", stamp: "Anointed", who: [["Samuel"], ["Jesse"], ["David", "shepherd boy"]] });
  stap("1samuel:saul-david:3", { t: "A harp for the king", stamp: "Harp" });
  stap("1samuel:saul-david:4", {
    t: "David and Goliath", stamp: "Elah", who: [["David"], ["Goliath"], ["Saul"], ["Enemies", "Philistines"]],
    vergelijk: { titel: "How tall was Goliath?", rijen: [["Goliath", 290, "c. 2.9 m (6 cubits and 1 span)"], ["A door", 200, "c. 2 m"], ["An adult", 175, "c. 1.75 m"], ["A child of 10", 140, "c. 1.40 m"]], noot: "1 Samuel 17:4: six cubits and a span. The conversion is an estimate: a cubit is about 45 cm, a span (from thumb to little finger) about 22 cm." },
    txt: "The Philistines stand on one mountain, Israel on the other, with the valley of Elah between them. For forty days Goliath of Gath comes forward: six cubits and a span tall, with a helmet of brass and a coat of mail of five thousand shekels of brass. “Send a man to fight against me!” Everyone is afraid. Then David brings parched corn and bread for his brothers in the army, and cheeses for the captains. He hears Goliath and says to Saul: ‘thy servant will go and fight with this Philistine.’ In Saul’s armour David cannot walk; he is not used to it. With his shepherd’s staff, his sling and five smooth stones from the brook he goes towards the giant: “You come with a sword, but I come in the name of the LORD.” The stone hits Goliath in his forehead. He falls. With Goliath’s own sword David cuts off his head, and the Philistines flee to Gath and Ekron.",
    fact: "Goliath’s coat of mail weighed five thousand shekels of brass (17:5): if a shekel was about 11.4 grams, that is more than fifty kilos. The iron head of his spear alone weighed six hundred shekels (17:7), almost seven kilos.",
  });
  stap("1samuel:saul-david:5", { t: "David and Jonathan", stamp: "Friends" });
  stap("1samuel:saul-david:6", { t: "On the run", stamp: "Adullam", who: [["David"], ["Ahimelech"], ["Achish"], ["Doeg"], ["Men", "400 men"]] });
  stap("1samuel:saul-david:7", { t: "David spares Saul", stamp: "En-gedi", who: [["David"], ["Men", "600 men"], ["Saul"], ["Army", "3,000 men"], ["Jonathan"]] });
  stap("1samuel:saul-david:8", { t: "Abigail", stamp: "Asses", who: [["Abigail"], ["Nabal"], ["David"], ["Men", "400 men"]] });
  stap("1samuel:saul-david:9", { t: "Ziklag", stamp: "Ziklag", who: [["David"], ["Men", "600 men"], ["Achish"], ["Enemies", "Amalekites"]] });
  stap("1samuel:saul-david:10", { t: "The battle at Gilboa", stamp: "Gilboa", who: [["Saul"], ["Jonathan"], ["Enemies", "Philistines"], ["Armourbearer"]] });

  // ---------- Jona (geschiedenis 69) ----------
  deel("jona:jona", {
    n: "Jonah", short: "Jonah",
    intro: "Jonah is a prophet in Israel. God says: go to Nineveh, the great city in Assyria, and preach against it. But Jonah does not want to. He takes a ship to Tarshish, as far as possible the other way. Yet he comes to Nineveh. And then it turns out that God also cares for that city full of people.",
    tijdNoot: "Reconstruction. The Bible only says that Jonah prophesied around the time of Jeroboam II, the king of Israel (2 Kings 14:23–25). His reign (41 years) is placed in the usual chronology (Thiele) at c. 793–753 BC, including years of co-regency. When exactly Jonah went to Nineveh is not written.",
    stat: "The book of Jonah has only 48 verses, but the word ‘great’ is in it 8 times in the King James Version: a great city, a great wind, a great fish, great kindness. (In the Dutch Statenvertaling it is even 16 times.)",
    cross: [
      ["Matthew 12:40–41", "Jesus says: as Jonah was three days and three nights in the fish, so the Son of man will be three days in the earth. And the men of Nineveh repented at the preaching of Jonah."],
      ["Luke 11:30–32", "Jesus calls Jonah a sign to the people of Nineveh. ‘And, behold, a greater than Jonas is here.’"],
      ["2 Kings 14:25", "Here it says where Jonah came from, Gath-hepher, and that he lived in the time of King Jeroboam."],
      ["Nahum 3:7", "Much later Nahum prophesies against Nineveh again: ‘Nineveh is laid waste: who will bemoan her?’"],
      ["Psalm 139:7–10", "‘Whither shall I flee from thy presence? … dwell in the uttermost parts of the sea; Even there shall thy hand lead me’. Jonah found that out."],
      ["Exodus 34:6", "Jonah knew these words: ‘merciful and gracious, longsuffering, and abundant in goodness’. That is why he knew that God would spare Nineveh (Jonah 4:2)."],
    ],
    trips: ["Gath-hepher → Joppa (the flight)", "To Nineveh (the long way round)", "All that Jonah travelled"],
    quiz: {
      tap: [
        { id: "ninivest", q: "Tap Nineveh, the city where Jonah had to go.", v: "wide" },
        { id: "joppe", q: "Tap Joppa, the port where Jonah took a ship.", v: "kanaan" },
        { id: "tarsis", q: "Tap the arrow to Tarshish, where Jonah wanted to flee.", v: "wide", loose: 2 },
        { id: "jona_gathhefer", q: "Tap Gath-hepher, the village of Jonah.", v: "kanaan", loose: 1 },
      ],
      mc: [
        { q: "Where did God tell Jonah to go?", a: ["Nineveh", "Tarshish", "Babylon"], why: "Jonah 1:2" },
        { q: "In which port did Jonah go on board?", a: ["Joppa", "Tyre", "Ezion-geber"], why: "Jonah 1:3" },
        { q: "What did Jonah do during the storm?", a: ["He lay fast asleep", "He helped to row", "He prayed on the deck"], why: "Jonah 1:5" },
        { q: "How did the sailors find out that the storm came because of Jonah?", a: ["They cast lots", "Jonah told them at once", "The shipmaster dreamed it"], why: "Jonah 1:7" },
        { q: "How long was Jonah in the fish?", a: ["3 days and 3 nights", "1 night", "40 days"], why: "Jonah 1:17" },
        { q: "How big was Nineveh?", a: ["Three days’ journey", "One hour’s walk", "As big as a village"], why: "Jonah 3:3" },
        { q: "What did Jonah cry in Nineveh?", a: ["Yet forty days, and Nineveh shall be overthrown", "Flee to Tarshish", "God loves you"], why: "Jonah 3:4" },
        { q: "What did the king of Nineveh do?", a: ["He put on sackcloth and sat in ashes", "He had Jonah taken prisoner", "He laughed at Jonah"], why: "Jonah 3:6" },
        { q: "What made the gourd wither?", a: ["A worm smote it", "Jonah cut it down", "It rained too hard"], why: "Jonah 4:7" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["Jonah flees to Joppa", "Storm at sea", "Three days in the fish", "Nineveh repents", "The gourd"] }],
    },
  });
  stap("jona:jona:0", {
    t: "Go to Nineveh!", stamp: "Command", look: ["jona_gathhefer", "ninivest", "That is where Jonah had to go"],
    txt: "The word of the LORD comes to Jonah, the son of Amittai: “Arise, go to Nineveh, that great city, and preach against it, for their wickedness has come up before Me.” Nineveh lies far away in Assyria, the mighty empire in the north-east.",
    fact: "Jonah came from Gath-hepher (2 Kings 14:25), in the land of Zebulun (Joshua 19:13), a few kilometres from the later Nazareth. He was a prophet in the time of King Jeroboam II. Nineveh was then one of the great cities of Assyria; it only became the capital later, around 700 BC.",
  });
  stap("jona:jona:1", {
    t: "Fleeing to Joppa", stamp: "Joppa",
    txt: "But Jonah rises up to flee, away from the LORD, like a servant who runs away from the service of his master. He goes to the port of Joppa and finds a ship there that is going to Tarshish. He pays the fare and goes on board.",
    fact: "That is exactly the other way: Nineveh lies in the east, Tarshish far in the west. Where Tarshish lay is not certain. Many researchers think of Tartessus in the south of Spain; others of Sardinia or of Tarsus in Asia Minor.",
  });
  stap("jona:jona:2", {
    t: "Storm at sea", stamp: "Storm", who: [["Jonah"], ["Sailors"]],
    later: { p: [[33.2, 31.8], [33.9, 28], [34.3, 24.5], "tarsis"], lab: "This is how far Jonah wanted to go: to Tarshish", at: [34.1, 26] },
    txt: "The LORD sends out a great wind into the sea. The ship is about to break. The sailors are afraid, each one cries to his own god, and they throw the cargo overboard. And Jonah? He is lying down below in the ship, fast asleep. The shipmaster wakes him up: “Arise, call upon your God!” They cast lots, and the lot falls on Jonah. He says: “I am a Hebrew and I fear the LORD, who has made the sea and the dry land. Throw me into the sea, then it will be calm.” First they still try to row to land. Then they pray to the LORD and throw Jonah into the sea. At once the sea is calm. The men offer a sacrifice to the LORD and make vows.",
    fact: "Where exactly at sea the storm was, the Bible does not say. The sailors still tried to row to land (1:13); so the land was probably not far away. The dotted line shows how far Jonah really wanted to go.",
  });
  stap("jona:jona:3", {
    t: "Three days in the fish", stamp: "Fish",
    txt: "The LORD prepares a great fish that swallows Jonah. For three days and three nights Jonah is in the belly of the fish. There he prays: “I cried to the LORD in my distress, and He answered me. The water had surrounded me, the weeds were around my head. But You have brought up my life from the pit. Salvation is of the LORD!” Then the LORD speaks to the fish, and it spits Jonah out on the dry land.",
    fact: "Where Jonah came to land is not in the Bible. The Lord Jesus later pointed to these three days: that is how long He Himself would be ‘in the heart of the earth’ (Matthew 12:40).",
  });
  stap("jona:jona:4", { t: "To Nineveh", stamp: "Nineveh" });
  stap("jona:jona:5", { t: "Nineveh repents", stamp: "Sackcloth", who: [["King"], ["People", "the people of Nineveh"], ["Jonah"]] });
  stap("jona:jona:6", { t: "Jonah angry, and the gourd", stamp: "Gourd" });

  // ---------- Daniël (geschiedenis 75) ----------
  // Versnummering: Daniël 6 telt in de Statenvertaling één vers meer; SV 6:1 is KJV 5:31, SV 6:11 is KJV 6:10, enz.
  deel("daniel:daniel", {
    n: "Daniel", short: "Daniel",
    intro: "Daniel is still young when the army of Babylon besieges Jerusalem. He is taken away to Babylon, far from the temple. But God is there too. Daniel and his friends stay faithful to Him, even though it almost costs them their lives. And kings have to admit: the God of Daniel is the living God.",
    tijdNoot: "Reconstruction. Daniel 1:1 names the third year of Jehoiakim; according to the usual explanation (Babylonian counting, compare Jeremiah 25:1) that is 605 BC. Belshazzar dies in the night that Babylon falls (5:30); according to Babylonian sources that was in 539 BC. Then come Darius the Median and the first year of Cyrus (1:21; 6:28), c. 539/538 BC. Who Darius the Median was in history is not certain.",
    stat: "The word ‘kingdom’ (also ‘kingdoms’) is in the book of Daniel 59 times in the King James Version. Again and again it is about who really reigns: not the king of Babylon, but God.",
    cross: [
      ["Ezekiel 14:14", "The prophet Ezekiel, who also lived in Babylon, names Daniel in one breath with Noah and Job as an example of a righteous man."],
      ["Hebrews 11:33–34", "People who trusted God ‘stopped the mouths of lions’ and ‘quenched the violence of fire’. Think of the lions’ den and the fiery furnace."],
      ["Matthew 24:15", "The Lord Jesus names ‘Daniel the prophet’ when He speaks about the future."],
      ["Luke 1:33", "The angel says about Jesus: ‘of his kingdom there shall be no end.’ Compare the kingdom that is never destroyed in Nebuchadnezzar’s dream (Daniel 2:44)."],
      ["2 Chronicles 36:6–7", "Here it also says how Nebuchadnezzar bound Jehoiakim and carried the vessels of the temple to Babylon."],
      ["Jeremiah 29:10", "Jeremiah had written that the exile would last seventy years. Daniel read that later in his books (Daniel 9:2)."],
    ],
    trips: ["Jerusalem → Babylon (carried away)", "All that Daniel travelled"],
    quiz: {
      tap: [
        { id: "salem", q: "Tap Jerusalem, where Daniel came from.", v: "wide" },
        { id: "babelst", q: "Tap Babylon, where Daniel served at the king’s court.", v: "wide" },
        { id: "dan_dura", q: "Tap the plain of Dura, where the golden image stood.", v: "wide", loose: 1 },
      ],
      mc: [
        { q: "For how long did Daniel want to eat pulse and drink water, as a test?", a: ["10 days", "3 days", "40 days"], why: "Daniel 1:12" },
        { q: "What were the names of Daniel’s three friends in Babylon?", a: ["Shadrach, Meshach and Abed-nego", "Shem, Ham and Japheth", "Hananiah, Mordecai and Ezra"], why: "Daniel 1:7" },
        { q: "What was the head of the image in the dream made of?", a: ["Gold", "Iron", "Clay"], why: "Daniel 2:32" },
        { q: "What happened to the image in the dream?", a: ["A stone broke it to pieces", "It fell over in the wind", "It became gold from top to bottom"], why: "Daniel 2:34" },
        { q: "How many men did Nebuchadnezzar see walking in the furnace?", a: ["4", "3", "7"], why: "Daniel 3:25" },
        { q: "What did Nebuchadnezzar eat when God humbled him?", a: ["Grass, as oxen", "Bread and water", "Nothing, he fasted"], why: "Daniel 4:33" },
        { q: "What did Belshazzar drink wine from?", a: ["The golden vessels from the temple in Jerusalem", "A cup of iron and clay", "His helmet"], why: "Daniel 5:3" },
        { q: "How many times a day did Daniel pray?", a: ["3 times", "1 time", "7 times"], why: "Daniel 6:10" },
        { q: "How was Daniel saved in the lions’ den?", a: ["God sent His angel, who shut the lions’ mouths", "The lions had just eaten", "Darius had him brought up again at once"], why: "Daniel 6:22" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["Carried away to Babylon", "The dream of the image", "The fiery furnace", "The writing on the wall", "In the lions’ den"] }],
    },
  });
  stap("daniel:daniel:0", { t: "Jerusalem besieged", stamp: "Besieged", who: [["Nebuchadnezzar"], ["Jehoiakim"], ["Daniel", "a youth"]] });
  stap("daniel:daniel:1", { t: "To Babylon", stamp: "Babylon", who: [["Daniel", "a youth"], ["Friends", "Hananiah, Mishael and Azariah"]] });
  stap("daniel:daniel:2", { t: "Pulse and water", stamp: "Ten days", who: [["Daniel"], ["Friends", "Hananiah, Mishael and Azariah"]] });
  stap("daniel:daniel:3", { t: "The king’s dream", stamp: "Image", who: [["Nebuchadnezzar"], ["Daniel"], ["Friends", "praying too"]] });
  stap("daniel:daniel:4", { t: "The fiery furnace", stamp: "Furnace", who: [["Friends", "Shadrach, Meshach and Abed-nego"], ["Nebuchadnezzar"]] });
  stap("daniel:daniel:5", { t: "A king in the grass", stamp: "Grass" });
  stap("daniel:daniel:6", { t: "The writing on the wall", stamp: "Wall" });
  stap("daniel:daniel:7", {
    t: "In the lions’ den", stamp: "Lions", look: ["babelst", "salem", "Daniel prays with his windows open toward Jerusalem"],
    txt: "Darius the Median receives the kingdom; he is about 62 years old. He sets a hundred and twenty princes over it, and above them three presidents; Daniel is the first. The others look for something against him, but they can find nothing wrong in him. So they think up a trick: for thirty days no one may ask anything of any god or man, only of the king. Otherwise: into the den of lions. Daniel simply goes on praying, three times a day, with his windows open toward Jerusalem. The king is sad, but a law of the Medes and Persians cannot be changed. Daniel is thrown into the den; a stone closes the opening. The king does not sleep. Very early in the morning he calls out: “Daniel, has your God been able to save you?” “My God has sent His angel and has shut the lions’ mouths!” Daniel is taken up out of the den, without a single wound. His accusers are thrown into the den with their wives and children; the lions break them in pieces before they reach the bottom.",
    fact: "Afterwards Darius wrote to all peoples about the God of Daniel: ‘he is the living God … and his kingdom that which shall not be destroyed’ (6:26). Daniel prospered under Darius and under Cyrus the Persian (6:28).",
  });

  // ---------- De Heere Jezus: geboorte en jeugd (geschiedenis 83) ----------
  // Versnummering: SV Micha 5:1 is KJV Micah 5:2; SV Jesaja 9:5 is KJV Isaiah 9:6.
  deel("jezus-1:nt-geboorte", {
    n: "Birth and childhood", short: "Birth",
    intro: "God had promised that the Messiah would come, from the house of David, in Bethlehem. Now He sends the angel Gabriel: first to the priest Zacharias in the temple, then to Mary in Nazareth. John is born, and after him the Lord Jesus in Bethlehem. Shepherds, Simeon, Anna and wise men from the east come to honour Him. But King Herod wants to kill the Child, and Joseph flees with Him to Egypt.",
    tijdNoot: "Reconstruction. The Lord Jesus was born while King Herod was still alive (Matthew 2:1, 19). According to the historian Josephus, Herod died c. 4 BC; that is why the birth is usually put at c. 6–4 BC (our calendar was fixed later, a few years out). The angel came to Zacharias about fifteen months earlier (Luke 1:26, 36), so c. 7–5 BC. Twelve years after the birth (Luke 2:42) is c. 7–9 AD (there is no year 0). Other datings also exist, for example c. 3–2 BC.",
    stat: "Luke tells of the birth from Mary’s side, Matthew from Joseph’s. Together, in Matthew 1–2 and Luke 1–2, an angel or a dream from God brings a message five times to Joseph (Matthew 1:20; 2:13, 19, 22) or to the wise men (Matthew 2:12).",
    cross: [
      ["Micah 5:2", "‘But thou, Beth-lehem Ephratah … out of thee shall he come forth unto me that is to be ruler in Israel’."],
      ["Isaiah 7:14", "‘Behold, a virgin shall conceive, and bear a son’."],
      ["Isaiah 9:6", "‘For unto us a child is born, unto us a son is given’."],
      ["Malachi 4:5–6", "God promises to send Elijah the prophet; the angel says that John comes ‘in the spirit and power of Elias’ (Luke 1:17)."],
      ["Galatians 4:4", "‘But when the fulness of the time was come, God sent forth his Son, made of a woman’."],
    ],
    trips: ["Nazareth → Bethlehem", "Bethlehem → Egypt", "Egypt → Nazareth", "Nazareth → Jerusalem (twelve years old)", "All journeys in this part"],
    quiz: {
      tap: [
        { id: "efrath", q: "Tap Bethlehem, the city of David.", v: "kanaan" },
        { id: "nt_nazareth", q: "Tap Nazareth, where Mary lived.", v: "kanaan" },
        { id: "egypte", q: "Tap Egypt, where Joseph fled with the Child.", v: "wide", loose: 2 },
      ],
      mc: [
        { q: "Where was Zacharias when the angel came to him?", a: ["In the temple", "In the field", "In Nazareth"], why: "Luke 1:9–11" },
        { q: "What was the name of the angel who came to Zacharias and Mary?", a: ["Gabriel", "Michael", "Raphael"], why: "Luke 1:26" },
        { q: "What did Zacharias write on the writing table?", a: ["His name is John", "His name is Zacharias", "God is gracious"], why: "Luke 1:63" },
        { q: "Why did Joseph and Mary go to Bethlehem?", a: ["To be taxed (registered)", "To keep the Passover", "To flee from Herod"], why: "Luke 2:1–5" },
        { q: "What was the sign for the shepherds?", a: ["A babe wrapped in swaddling clothes, lying in a manger", "A star above the house", "A voice from heaven"], why: "Luke 2:12" },
        { q: "Which gifts did the wise men give?", a: ["Gold, frankincense and myrrh", "Silver, wool and oil", "Bread, wine and fish"], why: "Matthew 2:11" },
        { q: "Who said: ‘Lord, now lettest thou thy servant depart in peace’?", a: ["Simeon", "Zacharias", "Joseph"], why: "Luke 2:29" },
        { q: "After how many days did Joseph and Mary find the twelve-year-old Jesus in the temple?", a: ["After three days", "After one day", "After seven days"], why: "Luke 2:46" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["Gabriel with Zacharias", "Gabriel with Mary", "John is born", "The Lord Jesus is born", "Flight to Egypt"] }],
    },
  });
  stap("jezus-1:nt-geboorte:0", { t: "An angel in the temple", stamp: "Temple", who: [["Zacharias"], ["Gabriel"], ["People", "the multitude outside"]] });
  stap("jezus-1:nt-geboorte:1", { t: "Gabriel with Mary", stamp: "Nazareth" });
  stap("jezus-1:nt-geboorte:2", { t: "Joseph has a dream", stamp: "Dream" });
  stap("jezus-1:nt-geboorte:3", { t: "Mary with Elisabeth", stamp: "Visit" });
  stap("jezus-1:nt-geboorte:4", { t: "The birth of John", stamp: "John", who: [["Elisabeth"], ["Zacharias"], ["John the Baptist", "newborn"]] });
  stap("jezus-1:nt-geboorte:5", {
    t: "From Nazareth to Bethlehem", stamp: "Bethlehem", who: [["Joseph"], ["Mary"], ["Jesus", "newborn"]],
    txt: "Caesar Augustus commands that everyone must be taxed, each in his own city. So Joseph goes from Nazareth in Galilee to Bethlehem in Judaea, the city of David, because he is of the house and lineage of David. He goes with Mary, his espoused wife, who is expecting a child. While they are in Bethlehem, her firstborn Son is born. She wraps Him in swaddling clothes and lays Him in a manger, a feeding trough for animals, because there is no room for them in the inn.",
    fact: "Long before, the prophet Micah had said: ‘But thou, Beth-lehem Ephratah … out of thee shall he come forth unto me that is to be ruler in Israel’ (Micah 5:2). Which road Joseph and Mary took, the Bible does not say; the route is a reconstruction.",
  });
  stap("jezus-1:nt-geboorte:6", { t: "Shepherds in the field", stamp: "Shepherds", who: [["Shepherds"], ["Angels", "a multitude"], ["Mary"], ["Joseph"]] });
  stap("jezus-1:nt-geboorte:7", { t: "Simeon and Anna in the temple", stamp: "Simeon", who: [["Jesus", "a baby"], ["Simeon"], ["Anna", "prophetess"], ["Mary"], ["Joseph"]] });
  stap("jezus-1:nt-geboorte:8", { t: "Wise men from the east", stamp: "Star", who: [["Wise men"], ["Herod"], ["Mary"], ["Jesus", "a young child"]] });
  stap("jezus-1:nt-geboorte:9", { t: "Flight to Egypt", stamp: "Egypt", who: [["Joseph"], ["Mary"], ["Jesus", "a young child"], ["Herod"]] });
  stap("jezus-1:nt-geboorte:10", { t: "Back to Nazareth", stamp: "Return", who: [["Joseph"], ["Mary"], ["Jesus", "a young child"]] });
  stap("jezus-1:nt-geboorte:11", { t: "Twelve years old in the temple", stamp: "Twelve" });

  // ---------- De Heere Jezus: rond het meer van Galilea (geschiedenis 94) ----------
  // Versnummering: SV Jesaja 9:1 is KJV Isaiah 9:2.
  deel("jezus-1:nt-galilea", {
    n: "Around the Sea of Galilee", short: "Galilee",
    intro: "The Lord Jesus goes to live in Capernaum, by the Sea of Galilee. He calls fishermen to follow Him, heals the sick and sets people free from evil spirits. On a mountain He teaches the people, by the lake He tells parables, and on the lake He calms the storm. On the other side He sets a man free from a legion of evil spirits, and back in Capernaum He raises up the little daughter of Jairus.",
    tijdNoot: "Reconstruction. These events fall in the first part of the public ministry of the Lord Jesus, which lasted three to four years (John names at least three Passovers: 2:13; 6:4; 11:55). With a beginning around 27 AD you come to c. 28–30 AD; whoever places the crucifixion in 33 AD comes out about three years later. The Gospel writers do not tell everything in the same order; here Mark is followed.",
    stat: "The Sea of Galilee is more than 20 km long and more than 10 km wide, and it lies more than 200 metres below sea level. In the Bible it is also called ‘the lake of Gennesaret’ (Luke 5:1) and ‘the sea of Tiberias’ (John 21:1).",
    cross: [
      ["Isaiah 9:2", "‘The people that walked in darkness have seen a great light’. Matthew sees this fulfilled in Galilee (Matthew 4:15–16)."],
      ["Isaiah 53:4", "‘Surely he hath borne our griefs, and carried our sorrows’. Matthew quotes this at the healings in Capernaum (Matthew 8:16–17)."],
      ["Acts 10:38", "Later Peter tells how the Lord Jesus ‘went about doing good, and healing all that were oppressed of the devil’."],
      ["Luke 8:1", "‘he went throughout every city and village, preaching and shewing the glad tidings of the kingdom of God: and the twelve were with him’."],
    ],
    trips: ["Nazareth → Capernaum", "Across the lake to the Gadarenes", "Back across the lake", "All journeys in this part"],
    quiz: {
      tap: [
        { id: "nt_kapernaum", q: "Tap Capernaum, where the Lord Jesus went to live.", v: [[32.5, 35.2], [33.1, 35.9]] },
        { id: "nt_meer", q: "Tap the Sea of Galilee.", v: "kanaan", loose: 2 },
        { id: "nt_gadara", q: "Tap the country of the Gadarenes, on the other side of the lake.", v: [[32.5, 35.2], [33.1, 35.9]], loose: 1 },
      ],
      mc: [
        { q: "What were Simon and Andrew doing when the Lord Jesus called them?", a: ["Casting a net into the sea", "Mending a boat", "Selling fish at the market"], why: "Mark 1:16" },
        { q: "What was wrong with Simon’s wife’s mother?", a: ["A fever", "Leprosy", "A withered hand"], why: "Mark 1:30" },
        { q: "How did the man sick of the palsy come to the Lord Jesus?", a: ["Through an opening in the roof", "Through the back door", "Across the lake, by boat"], why: "Mark 2:4" },
        { q: "On what did the wise man build his house?", a: ["Upon a rock", "Upon the sand", "By the lake"], why: "Matthew 7:24" },
        { q: "What had the centurion built for the Jews?", a: ["A synagogue", "A temple", "A city wall"], why: "Luke 7:5" },
        { q: "What was the Lord Jesus doing in the ship when the storm came?", a: ["He was asleep on a pillow", "He was steering the ship", "He was pulling in the nets"], why: "Mark 4:38" },
        { q: "What did the unclean spirit call itself?", a: ["Legion", "Beelzebub", "Decapolis"], why: "Mark 5:9" },
        { q: "About how old was the daughter of Jairus?", a: ["Twelve years", "Seven years", "Sixteen years"], why: "Luke 8:42" },
      ],
      ord: [{ q: "What happened first? Put it in the right order (as Mark tells it).", items: ["Fishers of men", "A sabbath in Capernaum", "The man let down through the roof", "Storm on the lake", "The man from the tombs", "Jairus and his little daughter"] }],
    },
  });
  stap("jezus-1:nt-galilea:0", { t: "Living in Capernaum", stamp: "Capernaum" });
  stap("jezus-1:nt-galilea:1", { t: "Fishers of men", stamp: "Nets" });
  stap("jezus-1:nt-galilea:2", { t: "A sabbath in Capernaum", stamp: "Synagogue" });
  stap("jezus-1:nt-galilea:3", { t: "Through the roof", stamp: "Roof", who: [["Jesus"], ["Men", "four bearers"], ["Man sick of the palsy"]] });
  stap("jezus-1:nt-galilea:4", { t: "The Sermon on the Mount", stamp: "Mount", who: [["Jesus"], ["Disciples"], ["People", "great multitudes"]] });
  stap("jezus-1:nt-galilea:5", { t: "The centurion", stamp: "Centurion", who: [["Jesus"], ["Centurion"], ["Elders", "elders of the Jews"]] });
  stap("jezus-1:nt-galilea:6", { t: "A woman at the feet of the Lord Jesus", stamp: "Ointment", who: [["Jesus"], ["Simon the Pharisee"], ["Women", "a sinner"]] });
  stap("jezus-1:nt-galilea:7", { t: "The parable of the sower", stamp: "Seed", who: [["Jesus"], ["Disciples"], ["People", "great multitudes"]] });
  stap("jezus-1:nt-galilea:8", {
    t: "Storm on the lake", stamp: "Storm", who: [["Jesus"], ["Disciples"]],
    txt: "In the evening of that day the Lord Jesus says: ‘Let us pass over unto the other side.’ They take Him with them in the ship, and other little ships go with them. A great storm arises. The waves beat into the ship, so that it fills with water. The Lord Jesus is asleep in the back of the ship on a pillow. The disciples wake Him: ‘Master, carest thou not that we perish?’ He arises, rebukes the wind and says to the sea: ‘Peace, be still.’ The wind ceases, and there is a great calm. ‘Why are ye so fearful? how is it that ye have no faith?’ They are greatly afraid and say to each other: ‘What manner of man is this, that even the wind and the sea obey him?’",
    fact: "The lake lies more than 200 metres below sea level, between mountains. Wind can suddenly fall down from the slopes and make high waves. The Bible does not say from which place they set out; the route from Capernaum is a reconstruction.",
  });
  stap("jezus-1:nt-galilea:9", { t: "The man from the tombs", stamp: "Legion", who: [["Jesus"], ["Men", "the possessed man"], ["Disciples"]] });
  stap("jezus-1:nt-galilea:10", { t: "Jairus and his little daughter", stamp: "Arisen", who: [["Jesus"], ["Jairus"], ["Children", "a daughter of 12"], ["Women", "12 years ill"], ["Peter"], ["James"], ["John"]] });

  // ---------- De Heere Jezus: op weg naar Jeruzalem (geschiedenis 112) ----------
  deel("jezus-2:nt-reis-naar-jeruzalem", {
    n: "On the way to Jerusalem", short: "On the way",
    intro: "“He stedfastly set his face to go to Jerusalem” (Luke 9:51). On the way the Lord Jesus tells parables: about a Samaritan who helps, a great supper, a son who was lost and a publican who prays. He blesses children, heals ten lepers and blind Bartimaeus, and in Jericho He goes in to Zacchaeus. The parables are stories that He tells; that is why they are not shown as a journey on the map.",
    tijdNoot: "Reconstruction. From 9:51 Luke tells of a long journey to Jerusalem, but with few time indications; Mark 10 describes the last stretch, through the land beyond the Jordan and by way of Jericho. The order in this part follows Luke first and then Mark. The Gospels do not always tell things in time order, so the exact order is a reconstruction. Whoever places the crucifixion c. 30 AD comes to c. 29–30; whoever keeps to 33 AD comes to c. 32–33.",
    stat: "Of the ten lepers who were cleansed, one came back to give glory to God (Luke 17:15–18).",
    cross: [
      ["Luke 13:22", "He went through the cities and villages, teaching, and journeying toward Jerusalem."],
      ["Matthew 20:29–30", "Matthew tells of two blind men at Jericho."],
      ["John 12:1", "Six days before the Passover the Lord Jesus comes to Bethany."],
    ],
    trips: ["Capernaum → beyond Jordan", "Beyond Jordan → Jericho", "All in this part"],
    quiz: {
      tap: [
        { id: "jericho", q: "Tap Jericho, where Zacchaeus climbed a tree.", v: "kanaan" },
        { id: "salem", q: "Tap Jerusalem, the goal of the journey.", v: "kanaan" },
      ],
      mc: [
        { q: "Which question did the lawyer ask, after which the Lord Jesus told the parable of the Samaritan?", a: ["And who is my neighbour?", "Who is the greatest?", "How often must I forgive?"], why: "Luke 10:29" },
        { q: "What did Mary do when the Lord Jesus was at Martha’s house?", a: ["She sat at His feet and heard His word", "She cooked the meal", "She fetched water"], why: "Luke 10:39" },
        { q: "Why did the Lord Jesus tell the parables of Luke 15?", a: ["The Pharisees murmured that He received sinners and ate with them", "The disciples asked for them", "A sheep was lost"], why: "Luke 15:2–3" },
        { q: "How many lepers came back to give thanks?", a: ["One", "Ten", "Nine"], why: "Luke 17:15–17" },
        { q: "What did the publican pray in the temple?", a: ["God be merciful to me a sinner", "I thank Thee that I am not as other men", "Give me riches"], why: "Luke 18:13" },
        { q: "What did Bartimaeus throw off when he was called?", a: ["His garment", "His stick", "His sandals"], why: "Mark 10:50" },
        { q: "Why did Zacchaeus climb a tree?", a: ["He was little and wanted to see Jesus", "He wanted to hide", "He wanted to pick figs"], why: "Luke 19:3–4" },
        { q: "For what did the Son of man come, according to Mark 10?", a: ["To minister, and to give His life a ransom for many", "To be ministered unto", "To become king of Rome"], why: "Mark 10:45" },
      ],
      ord: [{ q: "Put the parable of the lost son in the right order.", items: ["He asks for his portion of the goods", "He wastes everything in a far country", "He has to feed the swine", "His father runs to meet him", "The fatted calf is killed"] }],
    },
  });
  stap("jezus-2:nt-reis-naar-jeruzalem:0", { t: "On the way to Jerusalem", stamp: "Samaria" });
  stap("jezus-2:nt-reis-naar-jeruzalem:1", { t: "Who is my neighbour?", stamp: "Neighbour" });
  stap("jezus-2:nt-reis-naar-jeruzalem:2", { t: "Martha and Mary", stamp: "Listening" });
  stap("jezus-2:nt-reis-naar-jeruzalem:3", { t: "The great supper", stamp: "Supper" });
  stap("jezus-2:nt-reis-naar-jeruzalem:4", {
    t: "Lost and found", stamp: "Found", who: [["Jesus"], ["Publicans"], ["Pharisees"]],
    txt: "Publicans and sinners come to the Lord Jesus to listen to Him. The Pharisees and scribes murmur: ‘This man receiveth sinners, and eateth with them.’ So the Lord Jesus tells three parables: about a shepherd who looks for one lost sheep, about a woman who looks for one lost piece of silver, and about a father with two sons. The younger son wastes his inheritance in a far country, has to feed the swine and comes back; his father sees him while he is still far away, runs to him and kisses him. There is a feast, for ‘this my son was dead, and is alive again; he was lost, and is found.’ But the elder son becomes angry and will not go in.",
    fact: "For Israel, swine were unclean animals (Leviticus 11:7). That the younger son had to feed the swine shows how low he had sunk. Luke does not say where the Lord Jesus told these parables.",
  });
  stap("jezus-2:nt-reis-naar-jeruzalem:5", { t: "Ten lepers", stamp: "Thanks", who: [["Jesus"], ["Lepers", "10"], ["Samaritan"]] });
  stap("jezus-2:nt-reis-naar-jeruzalem:6", { t: "Two men in the temple", stamp: "Prayer" });
  stap("jezus-2:nt-reis-naar-jeruzalem:7", { t: "Suffer the little children to come unto Me", stamp: "Children" });
  stap("jezus-2:nt-reis-naar-jeruzalem:8", { t: "The rich young ruler", stamp: "Rich" });
  stap("jezus-2:nt-reis-naar-jeruzalem:9", { t: "Who wants to be the greatest?", stamp: "Serving", who: [["Jesus"], ["James"], ["John"], ["Disciples", "12"]] });
  stap("jezus-2:nt-reis-naar-jeruzalem:10", { t: "Bartimaeus", stamp: "Bartimaeus" });
  stap("jezus-2:nt-reis-naar-jeruzalem:11", { t: "Zacchaeus", stamp: "Zacchaeus" });

  // ---------- Handelingen: Paulus, van Damascus tot Filippi (geschiedenis 143) ----------
  deel("handelingen:nt-paulus", {
    n: "Paul: from Damascus to Philippi", short: "Paul",
    intro: "Saul persecutes the church, until the Lord Jesus appears to him on the road to Damascus. The persecutor becomes a preacher. From Antioch the Holy Ghost sends him with Barnabas to Cyprus and to the inland of Asia Minor. On the second journey a man from Macedonia calls: ‘Come over into Macedonia, and help us’, and in Philippi Lydia and a jailer come to faith.",
    tijdNoot: "Reconstruction; the Bible gives no years. The conversion of Saul falls shortly after the death of Stephen, usually c. 33–36 AD. Paul writes that he came to Jerusalem ‘after three years’ and again ‘fourteen years after’ (Galatians 1:18; Galatians 2:1); that is why the first missionary journey is usually dated c. 46–48 and the journey to Philippi c. 49–50. An inscription of the governor Gallio (Acts 18:12) dates his year in Corinth to c. 51–52. Other chronologies are a few years earlier or later.",
    stat: "On the first journey Paul was stoned in Lystra and dragged out of the city as if he were dead (Acts 14:19). Later he wrote: ‘once was I stoned’ (2 Corinthians 11:25).",
    cross: [
      ["Galatians 1:13–18", "Paul himself tells how he persecuted the church, how God called him, and that he first went to Arabia and only after three years to Jerusalem."],
      ["1 Timothy 1:13–15", "‘Who was before a blasphemer, and a persecutor … that Christ Jesus came into the world to save sinners; of whom I am chief.’"],
      ["2 Timothy 3:11", "Paul reminds Timothy of the persecutions at Antioch, Iconium and Lystra: ‘but out of them all the Lord delivered me.’"],
      ["Philippians 1:3–5", "Later Paul writes to the church in Philippi and thanks God for their fellowship in the gospel ‘from the first day’."],
    ],
    trips: ["Jerusalem → Damascus", "Antioch → Cyprus", "Troas → Philippi", "All that Paul travelled (as far as Philippi)"],
    quiz: {
      tap: [
        { id: "damascusst", q: "Tap Damascus.", v: "wide" },
        { id: "nt_tarsus", q: "Tap Tarsus, the city where Paul was born.", v: [[33.5, 23], [41.8, 37]] },
        { id: "nt_salamis", q: "Tap Salamis on Cyprus, the first city of the first journey.", v: [[33.5, 23], [41.8, 37]], loose: 1 },
        { id: "nt_filippi", q: "Tap Philippi in Macedonia.", v: [[33.5, 23], [41.8, 37]] },
      ],
      mc: [
        { q: "What did the voice say to Saul on the road to Damascus?", a: ["Saul, Saul, why persecutest thou me?", "Go back to Jerusalem", "Where art thou?"], why: "Acts 9:4" },
        { q: "How did Saul escape from Damascus?", a: ["In a basket, let down by the wall", "Dressed up as a soldier", "On a ship"], why: "Acts 9:25" },
        { q: "Where were the disciples first called Christians?", a: ["In Antioch", "In Jerusalem", "In Rome"], why: "Acts 11:26" },
        { q: "Who became blind for a time on Cyprus?", a: ["The sorcerer Elymas", "The deputy Sergius Paulus", "Barnabas"], why: "Acts 13:11" },
        { q: "What did the people of Lystra call Paul?", a: ["Mercurius (Hermes)", "Jupiter (Zeus)", "King of Lystra"], why: "Acts 14:12" },
        { q: "Why did Paul and Barnabas part from each other?", a: ["They disagreed about John Mark", "Barnabas became ill", "Paul had to go to Rome"], why: "Acts 15:37–39" },
        { q: "Which city did Lydia come from?", a: ["Thyatira", "Philippi", "Troas"], why: "Acts 16:14" },
        { q: "What did Paul and Silas do at midnight in the prison?", a: ["They prayed and sang praises", "They slept", "They made a hole in the wall"], why: "Acts 16:25" },
      ],
      ord: [{ q: "What happened first? Put it in the right order.", items: ["A light on the road to Damascus", "In a basket down the wall", "Sent out to Cyprus", "Stoned in Lystra", "Lydia in Philippi"] }],
    },
  });
  stap("handelingen:nt-paulus:0", {
    t: "A light on the road to Damascus", stamp: "Light", who: [["Saul"], ["Fellow travellers"]],
    txt: "Saul is still breathing out threatenings and slaughter against the disciples of the Lord. He asks the high priest for letters to the synagogues in Damascus, so that he may bring men and women ‘of this way’ bound to Jerusalem. Close to Damascus, suddenly a light from heaven shines round about him. He falls to the earth and hears a voice: ‘Saul, Saul, why persecutest thou me?’ ‘Who art thou, Lord?’ ‘I am Jesus whom thou persecutest’. The men travelling with him hear the voice but see no one; Saul can no longer see anything, they lead him by the hand into Damascus, and for three days he does not see, does not eat and does not drink.",
    fact: "From Jerusalem to Damascus it is about 215 km as the crow flies. The Bible does not say which road Saul took; the line on the map is a reconstruction.",
  });
  stap("handelingen:nt-paulus:1", {
    t: "Ananias and the basket", stamp: "Basket", who: [["Ananias of Damascus"], ["Saul"], ["Disciples"]],
    txt: "In Damascus lives a disciple, Ananias. In a vision the Lord tells him: go into the street which is called Straight, and ask in the house of Judas for Saul of Tarsus, ‘for, behold, he prayeth’. Ananias answers that he has heard how much evil Saul has done, but the Lord says: ‘he is a chosen vessel unto me, to bear my name before the Gentiles, and kings, and the children of Israel’. Ananias lays his hands on him: ‘Brother Saul’. At once there fall from his eyes as it had been scales; he sees again and is baptized, and straight away he preaches in the synagogues that Jesus is the Son of God. When the Jews want to kill him and watch the gates day and night, the disciples let him down by the wall in a basket at night.",
    fact: "In Acts there are three men called Ananias: the husband of Sapphira (5:1), this disciple in Damascus (9:10) and later the high priest (23:2).",
  });
  stap("handelingen:nt-paulus:2", { t: "Barnabas speaks up for him", stamp: "Barnabas" });
  stap("handelingen:nt-paulus:3", { t: "Christians in Antioch", stamp: "Christians", who: [["Barnabas"], ["Saul"], ["Agabus", "prophet"]] });
  stap("handelingen:nt-paulus:4", { t: "Sent out to Cyprus", stamp: "Cyprus", who: [["Barnabas"], ["Saul"], ["John Mark"], ["Elymas", "sorcerer"], ["Sergius Paulus", "deputy"]] });
  stap("handelingen:nt-paulus:5", { t: "Antioch in Pisidia", stamp: "Synagogue" });
  stap("handelingen:nt-paulus:6", { t: "Iconium, Lystra and Derbe", stamp: "Lystra", who: [["Paul"], ["Barnabas"], ["Lame man", "never had walked"]] });
  stap("handelingen:nt-paulus:7", { t: "Back to Antioch", stamp: "Return" });
  stap("handelingen:nt-paulus:8", { t: "A man from Macedonia", stamp: "Troas" });
  stap("handelingen:nt-paulus:9", { t: "Lydia by the river", stamp: "Lydia", who: [["Paul"], ["Silas"], ["Lydia", "seller of purple"]] });
  stap("handelingen:nt-paulus:10", { t: "Praises in the prison", stamp: "Earthquake" });
})(BR.vertaling.en);
