#!/usr/bin/env python3
"""Zet de King James Version (KJV, 1769, publiek domein) om naar data/kjv/<slug>.json (alleen voor controle; niet in de app).

De KJV is voor de Engelse Bijbelreis wat de Statenvertaling voor de Nederlandse is: de basis voor korte letterlijke
citaten tussen ‘…’ en de controle van verwijzingen (docs/bijbelreis-talen/README.md).

Bron: eBible.org, ‘King James Version + Apocrypha’ (id eng-kjv), USFM: https://ebible.org/Scriptures/eng-kjv_usfm.zip
(publiek domein; de gestandaardiseerde tekst van 1769). Alleen de 66 canonieke boeken. Voetnoten (\\f), Strong-nummers
(\\w …|strong="…"\\w*), cursief (\\add) en alineatekens (¶) gaan eruit; de Godsnaam staat er zoals in de gedrukte KJV:
‘LORD’ (\\nd). Psalmopschriften (\\d) staan in de KJV vóór vers 1 zonder versnummer en horen dus bij geen vers.
Gebruik: python3 -I scripts/bijbelreis-kjv.py <pad naar eng-kjv_usfm.zip>"""
import hashlib, json, os, re, sys, zipfile

# USFM-code → slug (Engelse naam zonder spaties, kleine letters) en de naam zoals de Engelse Bijbelreis hem schrijft.
BOEKEN = [
    ("GEN", "genesis", "Genesis"), ("EXO", "exodus", "Exodus"), ("LEV", "leviticus", "Leviticus"), ("NUM", "numbers", "Numbers"),
    ("DEU", "deuteronomy", "Deuteronomy"), ("JOS", "joshua", "Joshua"), ("JDG", "judges", "Judges"), ("RUT", "ruth", "Ruth"),
    ("1SA", "1samuel", "1 Samuel"), ("2SA", "2samuel", "2 Samuel"), ("1KI", "1kings", "1 Kings"), ("2KI", "2kings", "2 Kings"),
    ("1CH", "1chronicles", "1 Chronicles"), ("2CH", "2chronicles", "2 Chronicles"), ("EZR", "ezra", "Ezra"), ("NEH", "nehemiah", "Nehemiah"),
    ("EST", "esther", "Esther"), ("JOB", "job", "Job"), ("PSA", "psalms", "Psalms"), ("PRO", "proverbs", "Proverbs"),
    ("ECC", "ecclesiastes", "Ecclesiastes"), ("SNG", "songofsolomon", "Song of Solomon"), ("ISA", "isaiah", "Isaiah"),
    ("JER", "jeremiah", "Jeremiah"), ("LAM", "lamentations", "Lamentations"), ("EZK", "ezekiel", "Ezekiel"), ("DAN", "daniel", "Daniel"),
    ("HOS", "hosea", "Hosea"), ("JOL", "joel", "Joel"), ("AMO", "amos", "Amos"), ("OBA", "obadiah", "Obadiah"), ("JON", "jonah", "Jonah"),
    ("MIC", "micah", "Micah"), ("NAM", "nahum", "Nahum"), ("HAB", "habakkuk", "Habakkuk"), ("ZEP", "zephaniah", "Zephaniah"),
    ("HAG", "haggai", "Haggai"), ("ZEC", "zechariah", "Zechariah"), ("MAL", "malachi", "Malachi"),
    ("MAT", "matthew", "Matthew"), ("MRK", "mark", "Mark"), ("LUK", "luke", "Luke"), ("JHN", "john", "John"), ("ACT", "acts", "Acts"),
    ("ROM", "romans", "Romans"), ("1CO", "1corinthians", "1 Corinthians"), ("2CO", "2corinthians", "2 Corinthians"),
    ("GAL", "galatians", "Galatians"), ("EPH", "ephesians", "Ephesians"), ("PHP", "philippians", "Philippians"),
    ("COL", "colossians", "Colossians"), ("1TH", "1thessalonians", "1 Thessalonians"), ("2TH", "2thessalonians", "2 Thessalonians"),
    ("1TI", "1timothy", "1 Timothy"), ("2TI", "2timothy", "2 Timothy"), ("TIT", "titus", "Titus"), ("PHM", "philemon", "Philemon"),
    ("HEB", "hebrews", "Hebrews"), ("JAS", "james", "James"), ("1PE", "1peter", "1 Peter"), ("2PE", "2peter", "2 Peter"),
    ("1JN", "1john", "1 John"), ("2JN", "2john", "2 John"), ("3JN", "3john", "3 John"), ("JUD", "jude", "Jude"), ("REV", "revelation", "Revelation"),
]
BRON = "King James Version (1769; eBible.org eng-kjv, USFM; publiek domein)"


def schoon(x):
    x = re.sub(r"\\f\s.*?\\f\*", "", x, flags=re.S)  # voetnoten
    x = re.sub(r"\\x\s.*?\\x\*", "", x, flags=re.S)  # kruisverwijzingen
    x = re.sub(r"\\\+?w\s+([^|\\]*?)\|[^\\]*?\\\+?w\*", r"\1", x)  # \w woord|strong="…"\w*
    x = re.sub(r"\\\+?(?:nd|add|wj|tl|qs|sc|it|bd|em)\*?", "", x)  # tekenmarkeringen (inhoud blijft staan)
    x = re.sub(r"\\(?:q\d?|p|m|b|pi\d?|li\d?|nb)\b", " ", x)  # alinea- en dichtregels
    x = x.replace("¶", "")
    x = re.sub(r"\\[a-z0-9+]+\*?", "", x)  # wat er verder nog over is
    return re.sub(r"\s+", " ", x).replace(" ,", ",").replace(" .", ".").replace(" ;", ";").replace(" :", ":").strip()


def boek(usfm):
    hoofdstukken, h, v, buf = {}, None, None, []

    def bewaar():
        if h is not None and v is not None:
            hoofdstukken.setdefault(str(h), {})[v] = schoon(" ".join(buf))

    for regel in usfm.splitlines():
        regel = regel.rstrip()
        m = re.match(r"^\\c\s+(\d+)", regel)
        if m:
            bewaar(); h, v, buf = int(m.group(1)), None, []
            continue
        if re.match(r"^\\(id|h|toc\d|mt\d?|ide|is\d?|ip|s\d?|d|r|ms\d?|rem)\b", regel):
            # Kopteksten en psalmopschriften horen bij geen vers. Een opschrift midden in een hoofdstuk (Psalm 119) sluit
            # het vorige vers af; het volgende \v begint opnieuw.
            if v is not None:
                bewaar(); v, buf = None, []
            continue
        for stuk in re.split(r"(\\v\s+\d+\s)", regel):
            m = re.match(r"\\v\s+(\d+)\s", stuk)
            if m:
                bewaar(); v, buf = int(m.group(1)), []
            elif v is not None:
                buf.append(stuk)
    bewaar()
    uit = {}
    for c, verzen in hoofdstukken.items():
        n = max(verzen) if verzen else 0
        if sorted(verzen) != list(range(1, n + 1)):
            raise ValueError(f"verzen ontbreken in hoofdstuk {c}: {sorted(set(range(1, n + 1)) - set(verzen))}")
        uit[c] = [verzen[i] for i in range(1, n + 1)]
    return uit


def main(pad, out):
    z = zipfile.ZipFile(pad)
    namen = z.namelist()
    os.makedirs(out, exist_ok=True)
    totaal = 0
    for code, slug, naam in BOEKEN:
        f = next(n for n in namen if re.search(r"\d\d-" + code + r"eng-kjv\.usfm$", n))
        h = boek(z.read(f).decode("utf-8-sig"))
        totaal += sum(len(v) for v in h.values())
        with open(os.path.join(out, slug + ".json"), "w", encoding="utf-8") as fh:
            json.dump({"boek": naam, "vertaling": BRON, "hoofdstukken": h}, fh, ensure_ascii=False, separators=(",", ":"))
    sha = hashlib.sha256(open(pad, "rb").read()).hexdigest()
    print(f"{len(BOEKEN)} boeken, {totaal} verzen naar {out} (bron sha256 {sha})")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    main(sys.argv[1], os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "kjv"))
