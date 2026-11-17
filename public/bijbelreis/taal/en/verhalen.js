// De Engelse inhoud van de Bijbelreis, deel 3: de geschiedenissen (de vertelling voor Verder ontdekken, uitleg, ontdek,
// vragen, verbanden), hun tussenkoppen (indeling) en kernwoorden. Status: concept (review draft).
// De teksten voor Samen ontdekken en Zelf op reis, en de verdieping, staan in niveaus/a.js, b.js en c.js.
// Citaten tussen ‘…’ staan letterlijk in de King James Version; tussen “…” is navertelde rede.
window.BR = window.BR || { boeken: [], plaatsen: {}, W: {}, personen: {} };
(function (V) {
  V.geschiedenissen = V.geschiedenissen || {};
  V.indeling = V.indeling || {};
  V.kernwoorden = V.kernwoorden || {};
  const UITTOCHT = "Counted from an exodus c. 1446 BC: according to 1 Kings 6:1 Solomon began to build the temple in the 480th year after the exodus (his fourth year as king, c. 966 BC). Many researchers date the exodus later, in the 13th century BC.";

  // ---------- 26 ----------
  V.geschiedenissen[26] = {
    status: "concept",
    t: "Dry through the Red Sea",
    ref: "Exodus 14:1–15:21",
    uitleg: "God has Israel camp at Pi-hahiroth, by the sea. Pharaoh is sorry that he has let his slaves go. He chases them with six hundred chosen chariots and all the chariots of Egypt. The people are terrified and say to Moses that they would rather have stayed in Egypt. Moses answers: ‘Fear ye not, stand still, and see the salvation of the LORD’, and: ‘The LORD shall fight for you, and ye shall hold your peace.’ The pillar of cloud goes and stands behind Israel, between the people and the Egyptians. Moses stretches out his hand over the sea, and God makes a strong east wind blow all night. The water stands like a wall on the right hand and on the left, and Israel walks over the dry ground. The Egyptians go after them, but God takes off the wheels of their chariots. When the water returns, not one of them is left. The people fear the LORD and believe in Him and in Moses. Moses and the Israelites sing: ‘the horse and his rider hath he thrown into the sea.’ Miriam leads the women with a timbrel.",
    betekenis: "God saves His people when there is no way out: He fights for them Himself (14:14). Hebrews 11:29 says that by faith they passed through the Red sea as by dry land.",
    wie: ["Moses", "Miriam"],
    ontdek: {
      soort: "wiezei",
      titel: "Who said it?",
      items: [
        ["Why have we done this, that we have let Israel go from serving us?", "Pharaoh and his servants", ["Moses", "Miriam"]],
        ["Fear ye not, stand still, and see the salvation of the LORD", "Moses", ["Aaron", "Miriam"]],
        ["Let us flee from the face of Israel; for the LORD fighteth for them", "The Egyptians", ["The Israelites", "Moses"]],
        ["Sing ye to the LORD, for he hath triumphed gloriously", "Miriam", ["Pharaoh", "Aaron"]],
      ],
    },
    quiz: [
      { q: "How many chosen chariots did Pharaoh take with him?", a: ["Six hundred", "Seventy", "Twelve"], why: "Exodus 14:7" },
      { q: "Which wind did God make blow all night?", a: ["A strong east wind", "A west wind", "A north wind"], why: "Exodus 14:21" },
      { q: "How many were left of the army that went into the sea?", a: ["Not one", "A hundred", "Half of them"], why: "Exodus 14:28" },
      { q: "Who took a timbrel and led the women?", a: ["Miriam the prophetess", "Zipporah", "Pharaoh’s daughter"], why: "Exodus 15:20" },
    ],
    cross: [
      ["Hebrews 11:29", "By faith they passed through the Red sea as by dry land."],
      ["Psalm 106:9–12", "God saved them; then they believed and sang His praise."],
      ["1 Corinthians 10:1–2", "Paul writes that ‘all our fathers were under the cloud, and all passed through the sea’."],
      ["Revelation 15:3", "In heaven they sing ‘the song of Moses’ and ‘the song of the Lamb’."],
    ],
    tijd: "c. 1446 BC",
    tijdNoot: "Reconstruction: shortly after the exodus. " + UITTOCHT,
  };
  V.indeling[26] = [["Trapped between the sea and the army", "", "exodus:uittocht:4"], ["A way through the sea", "The pillar of cloud goes", "exodus:uittocht:5"], ["The song of Moses and Miriam", "The people fear the", "exodus:uittocht:6"]];

  // ---------- 1 ----------
  V.geschiedenissen[1] = {
    status: "concept",
    t: "God creates heaven and earth",
    ref: "Genesis 1:1–2:3",
    uitleg: "In the beginning God creates the heaven and the earth. At first the earth is without form and void, and it is dark. Then God speaks: ‘Let there be light’. And there is light. So in six days God makes everything. First the light, the sky, the sea and the dry land with the plants. Then the sun, the moon and the stars, the fish and the birds, and last of all the land animals and man. God makes man in His image, male and female. He blesses them and gives them dominion over the fish, the birds and the animals. God sees everything that He has made, and it is very good. On the seventh day God rests from all His work; He blesses that day and sanctifies it.",
    betekenis: "God is the Creator of everything there is. Psalm 33:9 says: ‘he spake, and it was done’. Everything belongs to Him, and man has a special place: he is made in God’s image (Genesis 1:27).",
    wie: [],
    ontdek: {
      soort: "koppel",
      titel: "Which day belongs to it?",
      paren: [["The first day", "The light"], ["The second day", "The firmament: the sky"], ["The third day", "The dry land, the seas and the plants"], ["The fourth day", "The sun, the moon and the stars"], ["The fifth day", "The fish and the birds"], ["The sixth day", "The land animals and man"]],
    },
    quiz: [
      { q: "What did God say when He made the light?", a: ["Let there be light", "Let there be water", "Let there be a man"], why: "Genesis 1:3" },
      { q: "On which day did God make the sun, the moon and the stars?", a: ["On the fourth day", "On the first day", "On the sixth day"], why: "Genesis 1:16–19" },
      { q: "In whose image did God create man?", a: ["In His own image", "In the image of the angels", "In the image of the animals"], why: "Genesis 1:27" },
      { q: "What did God do on the seventh day?", a: ["He rested from all His work", "He made the fish", "He planted the garden in Eden"], why: "Genesis 2:2" },
    ],
    cross: [
      ["John 1:1–3", "All things were made by the Word, the Son of God."],
      ["Hebrews 11:3", "Through faith we understand that the world was made by the word of God."],
      ["Exodus 20:11", "The commandment about the sabbath points back to the six days and the day of rest of the creation."],
    ],
    kw: "schepping",
    tijdNoot: "No date. Genesis 1–11 gives no date in our calendar. Whoever adds up the ages in Genesis 5 and 11 arrives at a calculation, but interpreters differ about it (for example whether the genealogies name every generation). That is why this history is not on the timeline.",
  };
  V.indeling[1] = [["The work of six days", ""], ["Man and the day of rest", "God makes man in His"]];
  V.kernwoorden.schepping = {
    n: "Creation",
    uitleg: "To create is to make what was not there before, and only God can do that. In the beginning God created the heaven and the earth by His word: ‘he spake, and it was done’. Everything that exists has been made by Him and belongs to Him. The New Testament says that all things were made by the Word, the Son of God.",
    refs: [["Genesis 1:1", "‘In the beginning God created the heaven and the earth.’"], ["Psalm 33:6–9", "‘For he spake, and it was done’."], ["John 1:3", "All things were made by the Word."], ["Revelation 4:11", "‘for thou hast created all things’."]],
  };

  // ---------- 43 ----------
  V.geschiedenissen[43] = {
    status: "concept",
    t: "Gideon and the three hundred",
    ref: "Judges 6–8",
    uitleg: "For seven years the LORD gives Israel into the hand of the Midianites, who eat up everything. Gideon threshes wheat by the winepress, to hide it from the Midianites. There the angel of the LORD, the Son of God, comes to him: ‘The LORD is with thee, thou mighty man of valour.’ At God’s command Gideon throws down the altar of Baal at night. Twice he asks God for a sign with a fleece of wool, and God gives it. Of the thirty-two thousand men God keeps only three hundred, ‘lest Israel vaunt themselves against me’. At night the three hundred surround the camp with trumpets and empty pitchers with lamps inside. They blow, break the pitchers and cry: ‘The sword of the LORD, and of Gideon.’ In the camp the LORD turns the sword of the enemies against each other, and they flee.",
    betekenis: "God made the army small on purpose, so that everyone would see that He gave the victory (Judges 7:2). That is also why Gideon later did not want to become king: ‘the LORD shall rule over you’ (Judges 8:23).",
    wie: ["Gideon", "Phurah", "Midianites"],
    ontdek: { soort: "volgorde", titel: "Put the history of Gideon in the right order.", items: ["The angel by the winepress", "The altar of Baal thrown down", "The sign with the fleece", "Three hundred men are left", "Trumpets, pitchers and lamps"] },
    quiz: [
      { q: "What was Gideon doing when the angel of the LORD came to him?", a: ["Threshing wheat by the winepress", "Keeping sheep", "Building an altar"], why: "Judges 6:11" },
      { q: "How many men went home because they were afraid?", a: ["22,000", "300", "10,000"], why: "Judges 7:3" },
      { q: "What did a soldier in the camp of Midian dream?", a: ["A cake of barley bread rolled into the camp and overturned a tent", "Seven lean cows ate seven fat cows", "A ladder stood on the earth and reached to heaven"], why: "Judges 7:13" },
      { q: "What did the three hundred men have in their hands?", a: ["Trumpets and empty pitchers with lamps", "Swords and shields", "Bows and arrows"], why: "Judges 7:16" },
      { q: "What did they cry at the camp of Midian?", a: ["The sword of the LORD, and of Gideon", "Long live King Gideon, long live Israel!", "Flee, the Midianites are coming!"], why: "Judges 7:20" },
    ],
    cross: [
      ["Isaiah 9:4", "Isaiah compares God’s deliverance with what God did ‘in the day of Midian’."],
      ["Hebrews 11:32", "Gideon is named among the believers."],
      ["1 Corinthians 1:27", "‘God hath chosen the weak things of the world to confound the things which are mighty’."],
    ],
    tijdNoot: "Reconstruction with great uncertainty: seven years under Midian and forty years of rest (Judges 6:1; 8:28). The periods of the judges probably overlap (see the part Deborah and Gideon); Gideon then falls roughly in the 12th century BC. Other datings come out more than a century later.",
  };
  V.indeling[43] = [["Gideon by the winepress", "", "richteren:debora:5"], ["Altar, fleece and three hundred men", "At God’s command Gideon", "richteren:debora:6"], ["Trumpets, pitchers and lamps", "At night the three hundred", "richteren:debora:8"]];

  // ---------- 52 ----------
  V.geschiedenissen[52] = {
    status: "concept",
    t: "David and Goliath",
    ref: "1 Samuel 17",
    uitleg: "In the valley of Elah the Philistines and Israel stand facing each other, on two mountains. For forty days the giant Goliath of Gath defies Israel: ‘give me a man, that we may fight together.’ Saul and all Israel are greatly afraid. David brings food for his brothers and hears how the Philistine defies the armies of the living God. He says to Saul: the LORD who saved me from the lion and the bear will also save me out of the hand of this Philistine. He takes off Saul’s armour again. He goes with his staff, his sling and five smooth stones from the brook. ‘Thou comest to me with a sword … but I come to thee in the name of the LORD of hosts’. The stone strikes Goliath in his forehead, and he falls on his face to the ground.",
    betekenis: "David did not fight to become famous himself, but ‘that all the earth may know that there is a God in Israel’ (1 Samuel 17:46). ‘All this assembly shall know that the LORD saveth not with sword and spear: for the battle is the LORD’s’ (1 Samuel 17:47).",
    wie: ["David", "Goliath", "Saul"],
    ontdek: {
      soort: "wiezei", titel: "Who said it?",
      items: [
        ["give me a man, that we may fight together", "Goliath", ["Saul", "Eliab"]],
        ["I know thy pride, and the naughtiness of thine heart", "Eliab, David’s eldest brother", ["Saul", "Goliath"]],
        ["Thou art not able to go against this Philistine to fight with him", "Saul", ["Eliab", "Jesse"]],
        ["the battle is the LORD’s", "David", ["Saul", "Goliath"]],
      ],
    },
    quiz: [
      { q: "For how long did Goliath defy Israel?", a: ["Forty days", "Seven days", "A year"], why: "1 Samuel 17:16" },
      { q: "Why did David take off Saul’s armour again?", a: ["He had never tried it and could not walk in it", "It belonged to the king, and he was not allowed to wear it", "Goliath would recognise him by it"], why: "1 Samuel 17:39" },
      { q: "How many smooth stones did David choose out of the brook?", a: ["Five", "One", "Twelve"], why: "1 Samuel 17:40" },
      { q: "Where did the stone hit Goliath?", a: ["In his forehead", "In his heart", "In his knee"], why: "1 Samuel 17:49" },
    ],
    cross: [
      ["Psalm 144:1", "David: ‘Blessed be the LORD my strength, which teacheth my hands to war’."],
      ["2 Chronicles 20:15", "Later the same is said to King Jehoshaphat: ‘the battle is not yours, but God’s.’"],
    ],
    tijdNoot: "Reconstruction, uncertain: David was still a youth (1 Samuel 17:33) and became king at thirty (2 Samuel 5:4), in the usual chronology c. 1010 BC. How old he was exactly at the fight is not in the Bible.",
  };
  V.indeling[52] = [["Goliath defies Israel", ""], ["David speaks with Saul", "David brings food for his brothers"], ["With a sling and five stones", "He takes off Saul’s armour"]];

  // ---------- 69 ----------
  V.geschiedenissen[69] = {
    status: "concept",
    t: "Jonah flees from the LORD",
    ref: "Jonah 1–2",
    uitleg: "God says to the prophet Jonah: go to the great city of Nineveh and preach against it, for its wickedness has come up before Me. But Jonah flees the other way. In Joppa he goes on board a ship to Tarshish. The LORD sends out a great wind into the sea, and the ship is about to break. The sailors cast lots, and the lot falls on Jonah. He says: ‘Take me up, and cast me forth into the sea; so shall the sea be calm unto you’. When they do that, the sea becomes calm. The sailors fear the LORD and offer Him a sacrifice. The LORD prepares a great fish that swallows Jonah. For three days and three nights he is in the fish. There he prays to the LORD, and at God’s word the fish spits him out on the dry land.",
    betekenis: "Jonah could not run away from God. God kept looking for him and heard his prayer out of the deep: ‘Salvation is of the LORD’ (Jonah 2:9). The Lord Jesus calls the three days of Jonah in the fish a sign of His own death and resurrection (Matthew 12:40).",
    wie: ["Jonah", "Sailors"],
    ontdek: { soort: "kaart", vraag: "Jonah had to go to Nineveh, far in the east. But in which port did he go on board a ship to Tarshish?", id: "joppe", v: "kanaan" },
    quiz: [
      { q: "What did Jonah say about himself to the sailors?", a: ["I am an Hebrew; and I fear the LORD", "I am a merchant from Tarshish", "I come from Nineveh"], why: "Jonah 1:9" },
      { q: "What did the sailors ask the LORD before they threw Jonah into the sea?", a: ["Let us not perish for this man’s life", "Give us a better wind", "Bring us safely to Tarshish"], why: "Jonah 1:14" },
      { q: "What did the sailors do when the sea became calm?", a: ["They offered a sacrifice unto the LORD", "They sailed back to Joppa", "They went to sleep"], why: "Jonah 1:16" },
      { q: "Who prepared the great fish?", a: ["The LORD", "The sailors", "The king of Nineveh"], why: "Jonah 1:17" },
      { q: "With which words does Jonah’s prayer in the fish end?", a: ["Salvation is of the LORD", "I want to go to Tarshish", "Let me die"], why: "Jonah 2:9" },
    ],
    cross: [
      ["Matthew 12:40", "‘For as Jonas was three days and three nights in the whale’s belly; so shall the Son of man be three days and three nights in the heart of the earth.’"],
      ["Psalm 139:9–10", "‘dwell in the uttermost parts of the sea; Even there shall thy hand lead me’."],
      ["2 Kings 14:25", "Jonah, the son of Amittai, came from Gath-hepher and prophesied in the time of King Jeroboam."],
    ],
    tijdNoot: "Reconstruction. The Bible only says that Jonah prophesied in the time of Jeroboam II, king of Israel (2 Kings 14:23–25). His reign is placed in the usual chronology (Thiele) at c. 793–753 BC. When Jonah had to go to Nineveh is not written.",
  };
  V.indeling[69] = [["God’s command and Jonah’s flight", "", "jona:jona:1"], ["A storm and a great fish", "The LORD sends out a great wind", "jona:jona:2"]];

  // ---------- 75 ----------
  // Versnummering: SV Daniël 6:x is KJV Daniel 6:(x−1); SV 6:1 is KJV 5:31.
  V.geschiedenissen[75] = {
    status: "concept",
    t: "Daniel in the lions’ den",
    ref: "Daniel 6",
    uitleg: "King Darius the Median sets 120 princes over his kingdom, with three presidents above them; Daniel is the first. Because Daniel excels, the king wants to set him over the whole kingdom. The other presidents look for something to accuse him of, but they find nothing, for he is faithful. So they have the king sign a law. Whoever asks anything of any god or man for thirty days, except of the king, will be cast into the den of lions. Daniel knows it, but three times a day he kneels and prays to his God, just as he always did. Sadly the king has to let him be cast into the den. A stone is laid on the opening, sealed with the king’s signet. Very early in the morning the king calls into the den, and Daniel answers: ‘My God hath sent his angel, and hath shut the lions’ mouths’. The men who had accused Daniel are cast into the den with their wives and children. The lions overpower them at once. Then Darius writes to all peoples that they must tremble before the God of Daniel, for He is the living God.",
    betekenis: "For Daniel, praying was not a habit he could skip: he prayed ‘as he did aforetime’ (Daniel 6:10). God heard him and saved him, ‘because he believed in his God’ (Daniel 6:23).",
    wie: ["Daniel", "Darius"],
    kw: "gebed",
    ontdek: { soort: "volgorde", titel: "Put it in the right order", items: ["The presidents find no fault in Daniel", "The king signs the law of thirty days", "Daniel kneels and prays three times a day", "Daniel is cast into the den of lions", "The den is sealed with the king’s signet", "The king calls at the den early in the morning", "Darius writes: tremble before the God of Daniel"] },
    quiz: [
      { q: "How many princes did Darius set over the kingdom?", a: ["120", "12", "70"], why: "Daniel 6:1" },
      { q: "For how long did the ban on asking anything of a god or man last?", a: ["30 days", "40 days", "7 days"], why: "Daniel 6:7" },
      { q: "How many times a day did Daniel pray?", a: ["Three times", "Once", "Seven times"], why: "Daniel 6:10" },
      { q: "With what was the stone in front of the den sealed?", a: ["With the signet of the king and of his lords", "With ropes and wax", "With iron chains"], why: "Daniel 6:17" },
      { q: "What did Daniel say to the king from the den?", a: ["My God hath sent his angel", "Get me out quickly", "The lions had fallen asleep"], why: "Daniel 6:22" },
    ],
    cross: [
      ["Hebrews 11:33", "Through faith some ‘stopped the mouths of lions’."],
      ["Matthew 6:6", "The Lord Jesus says: ‘when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret’."],
      ["Psalm 65:2", "‘O thou that hearest prayer, unto thee shall all flesh come.’"],
    ],
    tijdNoot: "Reconstruction. Darius the Median received the kingdom after the death of Belshazzar, when Babylon fell (Daniel 5:30–31); that was in 539 BC. Who this Darius was outside the Bible is not certain; there are different views about it.",
  };
  V.indeling[75] = [["Daniel under King Darius", ""], ["The law and the lions’ den", "So they have the king"], ["The morning at the den", "Very early in the morning the king"]];
  V.kernwoorden.gebed = {
    n: "Prayer",
    uitleg: "To pray is to speak with God. You may tell Him everything and ask Him everything, and thank Him. Daniel prayed three times a day, even when it was forbidden (Daniel 6:10). God hears prayer: ‘O thou that hearest prayer, unto thee shall all flesh come’ (Psalm 65:2). The Lord Jesus taught His disciples to pray: ‘Our Father which art in heaven’ (Matthew 6:9). And Paul writes: ‘Pray without ceasing’ (1 Thessalonians 5:17).",
    refs: [["Daniel 6:10", "Daniel kneeled upon his knees three times a day, and prayed, and gave thanks before his God."], ["Psalm 50:15", "‘And call upon me in the day of trouble: I will deliver thee, and thou shalt glorify me.’"], ["Matthew 6:6–9", "Pray to your Father in secret; ‘After this manner therefore pray ye: Our Father’."], ["Philippians 4:6", "‘in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.’"]],
  };

  // ---------- 83 ----------
  V.geschiedenissen[83] = {
    status: "concept",
    t: "The birth of the Lord Jesus in Bethlehem",
    ref: "Luke 2:1–7",
    uitleg: "Caesar Augustus commands that all the world should be taxed, each one in his own city. So Joseph goes with Mary from Nazareth in Galilee to Bethlehem in Judaea. Bethlehem is the city of David, and Joseph is of the house and lineage of David. Mary is expecting a child, and while they are in Bethlehem, her firstborn Son is born. She wraps Him in swaddling clothes and lays Him in a manger, a feeding trough for animals. There is no room for them in the inn; the Child is born in a place where animals are kept. On the eighth day He is given the name Jesus, as the angel had said (Luke 2:21).",
    betekenis: "Through the command of an emperor the Son of God comes into the world in Bethlehem, as Micah had foretold (Micah 5:2; Matthew 2:5–6). He who was rich became poor for our sakes (2 Corinthians 8:9).",
    wie: ["Joseph", "Mary", "Jesus"],
    ontdek: { soort: "kaart", titel: "Where is it?", vraag: "Tap Bethlehem, the city of David.", id: "efrath", v: "kanaan" },
    quiz: [
      { q: "Which emperor gave the command to tax all the world?", a: ["Augustus", "Tiberius", "Nero"], why: "Luke 2:1" },
      { q: "Why did Joseph have to go to Bethlehem?", a: ["He was of the house and lineage of David", "He had bought a house there", "His parents lived there"], why: "Luke 2:4" },
      { q: "Where did Mary lay the Child?", a: ["In a manger", "In a cradle", "In a basket"], why: "Luke 2:7" },
      { q: "Why was the Child lying in a manger?", a: ["There was no room in the inn", "It was warmer there", "The shepherds had asked for it"], why: "Luke 2:7" },
    ],
    cross: [
      ["Micah 5:2", "‘But thou, Beth-lehem Ephratah … out of thee shall he come forth unto me that is to be ruler in Israel’."],
      ["Isaiah 9:6", "‘For unto us a child is born, unto us a son is given’."],
      ["2 Corinthians 8:9", "‘that, though he was rich, yet for your sakes he became poor’."],
      ["Galatians 4:4", "God sent His Son ‘when the fulness of the time was come’."],
    ],
    tijdNoot: "Reconstruction: before the death of Herod (Matthew 2:1, 19), who according to Josephus died c. 4 BC. The taxing ‘when Cyrenius was governor of Syria’ (Luke 2:2) cannot be dated exactly in history. Other datings (for example 3–2 BC) exist.",
  };
  V.indeling[83] = [["From Nazareth to Bethlehem", ""], ["The birth in Bethlehem", "Mary is expecting a child, and while"]];

  // ---------- 94 ----------
  // Versnummering: SV Psalm 89:10 en 65:8 zijn KJV Psalm 89:9 en 65:7 (opschrift).
  V.geschiedenissen[94] = {
    status: "concept",
    t: "The Lord Jesus calms the storm",
    ref: "Mark 4:35–41",
    uitleg: "In the evening of the day on which the Lord Jesus told the parables, He says to His disciples: ‘Let us pass over unto the other side.’ On the way a great storm arises, and the waves beat into the ship, so that it fills with water. The Lord Jesus is asleep in the back of the ship on a pillow. The disciples wake Him: ‘Master, carest thou not that we perish?’ He arises, rebukes the wind and says to the sea: ‘Peace, be still.’ The wind ceases, and there is a great calm. He asks them why they are so fearful and have no faith. Full of fear they ask each other: ‘What manner of man is this, that even the wind and the sea obey him?’",
    betekenis: "Wind and sea obey the Lord Jesus, as they obey God: ‘He maketh the storm a calm’ (Psalm 107:29). To the question ‘What manner of man is this?’ Mark himself gives the answer: Jesus Christ, the Son of God (Mark 1:1).",
    wie: ["Jesus", "Disciples"],
    ontdek: { soort: "volgorde", titel: "Put it in the right order", items: ["In the evening they sail to the other side", "A great storm arises", "The Lord Jesus is asleep on a pillow", "The disciples wake Him", "‘Peace, be still’", "There is a great calm"] },
    quiz: [
      { q: "Where was the Lord Jesus asleep?", a: ["In the hinder part of the ship, on a pillow", "On the shore", "In the front of the ship, by the sail"], why: "Mark 4:38" },
      { q: "What did the Lord Jesus say to the sea?", a: ["Peace, be still", "Go back!", "Become dry!"], why: "Mark 4:39" },
      { q: "What did He then ask the disciples?", a: ["How is it that ye have no faith?", "Why did you wake Me?", "Who steered the ship?"], why: "Mark 4:40" },
      { q: "Did other boats go with them?", a: ["Yes, other little ships", "No, they were alone", "Yes, a big cargo ship"], why: "Mark 4:36" },
    ],
    cross: [
      ["Psalm 107:29", "‘He maketh the storm a calm, so that the waves thereof are still.’"],
      ["Matthew 8:23–27", "Matthew tells of the same storm: ‘Why are ye fearful, O ye of little faith?’"],
      ["Jonah 1:4", "With Jonah, too, a great storm came on the sea; there the LORD sent out a great wind into the sea."],
    ],
    tijdNoot: "Reconstruction: during the ministry in Galilee; the same day as the parable of the sower (Mark 4:35). Other datings exist.",
  };
  V.indeling[94] = [["A great storm on the way", ""], ["The wind ceases", "He arises, rebukes the wind"]];

  // ---------- 112 ----------
  V.geschiedenissen[112] = {
    status: "concept",
    t: "The lost son",
    ref: "Luke 15:11–32",
    uitleg: "Publicans and sinners come to the Lord Jesus to listen to Him. The Pharisees and scribes murmur: ‘This man receiveth sinners, and eateth with them’ (Luke 15:1–2). So He tells three parables. The third is about a father with two sons. The younger asks for his share of the inheritance and leaves for a far country. There he wastes everything with riotous living. When a famine comes, he has to feed the swine, and he would even gladly eat their food. Then he comes to himself: I will arise and go to my father and say that I have sinned. His father sees him while he is still far away, has compassion, runs to him and kisses him. He has the best robe, a ring and shoes brought, and the fatted calf killed: ‘this my son was dead, and is alive again’. But the elder son becomes angry and will not go in. The father goes out and pleads with him. To his reproach the father answers: ‘Son, thou art ever with me, and all that I have is thine.’",
    betekenis: "The Lord Jesus Himself says what the parables of Luke 15 are about: there is joy in heaven over one sinner that repents (Luke 15:7, 10). The angry elder son is a picture of the Pharisees, who murmured that He received sinners (Luke 15:2, 28–30).",
    wie: ["Jesus", "Publicans", "Pharisees"],
    ontdek: {
      soort: "gelijkenis", titel: "Lost and found",
      beelden: [
        ["The lost sheep", "‘joy shall be in heaven over one sinner that repenteth’.", "Luke 15:7"],
        ["The lost piece of silver", "‘there is joy in the presence of the angels of God over one sinner that repenteth.’", "Luke 15:10"],
        ["The younger son", "‘For this my son was dead, and is alive again; he was lost, and is found.’", "Luke 15:24"],
        ["The elder son", "He becomes angry and will not go in. In the same way the Pharisees murmured that the Lord Jesus received sinners.", "Luke 15:2, 28"],
      ],
    },
    quiz: [
      { q: "Why did the Pharisees and scribes murmur?", a: ["The Lord Jesus received sinners and ate with them", "The Lord Jesus healed on the sabbath", "The disciples did not wash their hands"], why: "Luke 15:2" },
      { q: "How many sheep did the shepherd have in the first parable?", a: ["A hundred", "Ten", "Ninety-nine"], why: "Luke 15:4" },
      { q: "What did the younger son want to say to his father?", a: ["Father, I have sinned against heaven, and before thee", "Father, give me even more money", "Father, it was not my fault"], why: "Luke 15:18" },
      { q: "What did the father do when he saw his son coming from far away?", a: ["He ran, fell on his neck and kissed him", "He locked the door", "He sent a servant with food"], why: "Luke 15:20" },
      { q: "What did the father have killed?", a: ["The fatted calf", "A kid", "A lamb"], why: "Luke 15:23" },
    ],
    cross: [
      ["Psalm 103:13", "‘Like as a father pitieth his children, so the LORD pitieth them that fear him.’"],
      ["Isaiah 55:7", "‘let him return unto the LORD, and he will have mercy upon him’."],
      ["Luke 19:10", "‘For the Son of man is come to seek and to save that which was lost.’"],
    ],
    tijdNoot: "Reconstruction. Luke tells these parables on the journey to Jerusalem, without a date and without a place name. Whoever places the crucifixion c. 30 AD comes to c. 29–30; whoever keeps to 33 AD comes to c. 32–33.",
  };
  V.indeling[112] = [["Leaving for a far country", ""], ["Back to the father", "When a famine comes"], ["The elder son becomes angry", "But the elder son becomes angry"]];

  // ---------- 143 ----------
  V.geschiedenissen[143] = {
    status: "concept",
    t: "Saul on the road to Damascus",
    ref: "Acts 9:1–25",
    uitleg: "Saul persecutes the church and drags men and women off to prison. With letters from the high priest he travels to Damascus, to take believers prisoner there too. Close to the city a light from heaven suddenly shines round about him. He falls to the earth and hears: ‘Saul, Saul, why persecutest thou me?’ ‘Who art thou, Lord?’ ‘I am Jesus whom thou persecutest’. Blind, he is led into Damascus, and for three days he eats and drinks nothing. The Lord sends the disciple Ananias to him: ‘for, behold, he prayeth’. Ananias objects that Saul has done much evil. But the Lord says that Saul is a chosen vessel to bear His name before the Gentiles, kings and Israel. Ananias lays his hands on him, there fall from his eyes as it had been scales, and Saul is baptized. Straight away he preaches in the synagogues that Jesus is the Son of God. When people want to kill him, the disciples let him down by the wall in a basket at night.",
    betekenis: "By God’s grace the greatest persecutor becomes an apostle. Later Paul wrote: ‘Christ Jesus came into the world to save sinners; of whom I am chief’ (1 Timothy 1:15).",
    wie: ["Saul", "Ananias of Damascus"],
    kw: "bekering",
    ontdek: {
      soort: "onthul", titel: "Saul: before and after",
      items: [
        ["Before: at Stephen’s death", "The witnesses lay down their clothes at the feet of Saul, and he consents to the death of Stephen (7:58; 8:1)."],
        ["Before: letters for Damascus", "He wants to bring believers bound to Jerusalem (9:1–2)."],
        ["On the road", "A light from heaven and the voice of the Lord Jesus (9:3–5)."],
        ["Three days", "He does not see, does not eat and does not drink, and he prays (9:9, 11)."],
        ["After: a preacher", "He preaches in the synagogues ‘that he is the Son of God’ (9:20)."],
      ],
    },
    quiz: [
      { q: "What did Saul ask the high priest for?", a: ["Letters to the synagogues in Damascus", "Money for the journey", "Soldiers to protect him"], why: "Acts 9:2" },
      { q: "What did the men travelling with Saul see?", a: ["No one; they only heard a voice", "An angel with a drawn sword", "A pillar of fire as in the wilderness"], why: "Acts 9:7" },
      { q: "In which street in Damascus was Saul staying?", a: ["The street which is called Straight", "The King’s Highway", "Temple Street"], why: "Acts 9:11" },
      { q: "What fell from Saul’s eyes when Ananias laid his hands on him?", a: ["As it had been scales", "Tears", "Dust"], why: "Acts 9:18" },
    ],
    cross: [
      ["Acts 22:6–16", "Paul himself tells of his conversion to the people in Jerusalem."],
      ["Galatians 1:13–16", "Paul writes how he persecuted the church, and how God called him by His grace."],
      ["1 Timothy 1:13–15", "‘Who was before a blasphemer, and a persecutor … but I obtained mercy’."],
      ["Philippians 3:5–6", "Paul calls himself a Pharisee: ‘Concerning zeal, persecuting the church’."],
    ],
    tijdNoot: "Reconstruction: shortly after the death of Stephen. Paul writes that he came to Jerusalem again ‘after three years’ (Galatians 1:18); with the later journeys that usually gives c. 33–36 AD. Other datings are a little earlier or later.",
  };
  V.indeling[143] = [["Saul persecutes the church", ""], ["A light from heaven", "Close to the city a light", "handelingen:nt-paulus:0"], ["Ananias and the baptism of Saul", "The Lord sends the disciple Ananias", "handelingen:nt-paulus:1"]];
  V.kernwoorden.bekering = {
    n: "Conversion",
    uitleg: "Conversion means: turning round. Whoever is converted sees his sin, turns away from it and turns to God. Peter called out: ‘Repent ye therefore, and be converted, that your sins may be blotted out’ (Acts 3:19). The Bible also says that God gives repentance (Acts 11:18), and that there is joy in heaven over one sinner that repents (Luke 15:7). Saul, the persecutor, is an example of such a turning round (Acts 9).",
    refs: [["Ezekiel 33:11", "‘turn ye, turn ye from your evil ways; for why will ye die’."], ["Luke 15:7", "There is joy in heaven over one sinner that repents."], ["Acts 3:19", "‘Repent ye therefore, and be converted, that your sins may be blotted out’."], ["Acts 11:18", "‘Then hath God also to the Gentiles granted repentance unto life.’"]],
  };
})(BR.vertaling.en);
