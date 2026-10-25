#!/usr/bin/env python3
"""Zet de Statenvertaling (editie 1888, transcriptie CC0) om naar public/bijbelreis/bijbel/<slug>.json.

Bron: https://github.com/jajpater/statenvertaling (STV.osis.xml, CC0 1.0), met de Nederlandse SV-versnummering
(DutSVV, vergeleken met de GBS-module). Kanttekeningen (<note>) worden weggelaten, <divineName> wordt HEERE.
Gebruik: python3 -I scripts/bijbelreis-sv.py <pad naar STV.osis.xml>"""
import json, os, re, sys
from collections import defaultdict

OSIS = ["Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov","Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos","Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal",
        "Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev"]
SLUG = ["genesis","exodus","leviticus","numeri","deuteronomium","jozua","richteren","ruth","1samuel","2samuel","1koningen","2koningen","1kronieken","2kronieken","ezra","nehemia","esther","job","psalmen","spreuken","prediker","hooglied","jesaja","jeremia","klaagliederen","ezechiel","daniel","hosea","joel","amos","obadja","jona","micha","nahum","habakuk","sefanja","haggai","zacharia","maleachi",
        "mattheus","markus","lukas","johannes","handelingen","romeinen","1korinthe","2korinthe","galaten","efeze","filippenzen","kolossenzen","1thessalonicenzen","2thessalonicenzen","1timotheus","2timotheus","titus","filemon","hebreeen","jakobus","1petrus","2petrus","1johannes","2johannes","3johannes","judas","openbaring"]
NAAM = ["Genesis","Exodus","Leviticus","Numeri","Deuteronomium","Jozua","Richteren","Ruth","1 Samuël","2 Samuël","1 Koningen","2 Koningen","1 Kronieken","2 Kronieken","Ezra","Nehemia","Esther","Job","Psalmen","Spreuken","Prediker","Hooglied","Jesaja","Jeremia","Klaagliederen","Ezechiël","Daniël","Hosea","Joël","Amos","Obadja","Jona","Micha","Nahum","Habakuk","Sefanja","Haggaï","Zacharia","Maleachi",
        "Mattheüs","Markus","Lukas","Johannes","Handelingen","Romeinen","1 Korinthe","2 Korinthe","Galaten","Efeze","Filippenzen","Kolossenzen","1 Thessalonicenzen","2 Thessalonicenzen","1 Timotheüs","2 Timotheüs","Titus","Filemon","Hebreeën","Jakobus","1 Petrus","2 Petrus","1 Johannes","2 Johannes","3 Johannes","Judas","Openbaring"]

# Bekende transcriptiefouten in de bron, hersteld naar de gedrukte SV (editie 1888). Houd deze lijst kort en verantwoord.
ERRATA = {
    ("Acts", 8, 14): ("zonden zij, hen Petrus", "zonden zij tot hen Petrus"),  # 'tot' ontbreekt in de transcriptie
    ("1Kgs", 3, 4): ("offerde5927 Salomo", "offerde Salomo"),          # Strong-nummer in de tekst gelekt
    ("Num", 19, 13): ("een dode4191,", "een dode,"),                     # idem
    ("Joel", 2, 32): ("gelijk als834 de HEERE", "gelijk als de HEERE"),  # idem
    ("2Chr", 32, 10): ("Zo3541", "Zo zegt Sanherib, de koning van Assyrië: Waarom vertrouwt gij, dat gij te Jeruzalem blijft in de vesting?"),  # vers ontbreekt; tekst volgens de gedrukte SV
}

def clean(x):
    x = re.sub(r"<note\b.*?</note>", "", x, flags=re.S)
    x = re.sub(r"<title\b.*?</title>", "", x, flags=re.S)
    x = re.sub(r"<divineName>(.*?)</divineName>", lambda m: re.sub(r"<[^>]+>", "", m.group(1)).upper(), x, flags=re.S)
    x = re.sub(r"<[^>]+>", "", x)
    return re.sub(r"\s+", " ", x).strip().replace(" ,", ",").replace(" .", ".").replace(" ;", ";").replace(" :", ":")

def main(path, out):
    s = open(path, encoding="utf-8").read()
    # Verzen staan als <verse osisID="..."> ... </verse> (of met sID/eID); pak alles tot het volgende verse-element.
    parts = re.split(r'(<verse\b[^>]*osisID="[^"]+"[^>]*>)', s)
    data = defaultdict(lambda: defaultdict(dict))
    for i in range(1, len(parts), 2):
        osis = re.search(r'osisID="([^"]+)"', parts[i]).group(1).split()[0]
        body = parts[i + 1].split("</verse>")[0]
        b, c, v = osis.split(".")
        t = clean(body)
        fix = ERRATA.get((b, int(c), int(v)))
        if fix:
            assert fix[0] in t, f"erratum {b} {c}:{v} past niet meer"
            t = fix[1] if t == fix[0] else t.replace(*fix)
        data[b][int(c)][int(v)] = t
    os.makedirs(out, exist_ok=True)
    for o, slug, naam in zip(OSIS, SLUG, NAAM):
        ch = data[o]
        hs = {}
        for c in sorted(ch):
            vs = ch[c]; n = max(vs)
            assert sorted(vs) == list(range(1, n + 1)), f"{o} {c}: verzen ontbreken"
            hs[str(c)] = [vs[v] for v in range(1, n + 1)]
        json.dump({"boek": naam, "vertaling": "Statenvertaling (editie 1888; transcriptie CC0, github.com/jajpater/statenvertaling)", "hoofdstukken": hs},
                  open(os.path.join(out, slug + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(len(OSIS), "boeken,", sum(len(v) for b in data.values() for v in b.values()), "verzen")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "public", "bijbelreis", "bijbel"))
