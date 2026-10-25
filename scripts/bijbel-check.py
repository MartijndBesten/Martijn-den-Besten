#!/usr/bin/env python3
"""Controleert Bijbelverwijzingen en getallen tegen de Statenvertaling in public/bijbelreis/bijbel/.

Gebruik: python3 scripts/bijbel-check.py controle.txt
Elke regel: <verwijzing> | <regex die in de tekst moet voorkomen>, bijvoorbeeld
  Exodus 12:37 | zeshonderd duizend
  1 Samuël 17:4 | zes ellen en een span
Verwijzing: boek + hoofdstuk:vers of hoofdstuk:vers-vers. Boeknamen zoals in de bestandsnamen (genesis, exodus, 1samuel, ...)
of met Nederlandse spelling (1 Samuël, Richteren, Psalm 23:1). De regex is hoofdletterongevoelig.
Exitcode 1 als een controle faalt."""
import json, re, sys, os, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(HERE, "..", "public", "bijbelreis", "bijbel")
BOOKS = {}

def slug(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower().replace(" ", "")
    return {"psalm": "psalmen", "richters": "richteren", "deut": "deuteronomium", "1sam": "1samuel", "2sam": "2samuel", "1kon": "1koningen", "2kon": "2koningen", "1kron": "1kronieken", "2kron": "2kronieken", "marcus": "markus", "lucas": "lukas", "1korintiers": "1korinthe", "1kor": "1korinthe", "hebr": "hebreeen", "matth": "mattheus", "hand": "handelingen", "openb": "openbaring", "spr": "spreuken", "ezech": "ezechiel"}.get(s, s)

def book(name):
    s = slug(name)
    if s not in BOOKS:
        path = os.path.join(DIR, s + ".json")
        if not os.path.exists(path):
            raise KeyError(f"geen bijbelboek '{name}' (bestand {s}.json ontbreekt)")
        BOOKS[s] = json.load(open(path, encoding="utf-8"))
    return BOOKS[s]

def text(ref):
    m = re.match(r"^\s*(\d?\s?[A-Za-zëéïü]+)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?\s*$", ref)
    if not m:
        raise ValueError(f"onbegrijpelijke verwijzing: {ref}")
    b, ch, v1, v2 = m.groups()
    verses = book(b)["hoofdstukken"].get(ch)
    if verses is None:
        raise ValueError(f"{ref}: hoofdstuk {ch} bestaat niet")
    if v1 is None:
        return " ".join(verses)
    a, z = int(v1), int(v2 or v1)
    if a < 1 or z > len(verses):
        raise ValueError(f"{ref}: vers buiten bereik (hoofdstuk heeft {len(verses)} verzen)")
    return " ".join(verses[a - 1 : z])

def main(path):
    bad = 0
    lines = [l for l in open(path, encoding="utf-8").read().splitlines() if l.strip() and not l.startswith("#")]
    for line in lines:
        try:
            ref, pat = [x.strip() for x in line.split("|", 1)]
            t = text(ref)
            if not re.search(pat, t, re.I):
                bad += 1
                print(f"FAIL {ref} | {pat}\n     {t[:260]}")
        except Exception as e:  # noqa: BLE001
            bad += 1
            print(f"FOUT {line}: {e}")
    print(f"{len(lines)} gecontroleerd, {bad} mis")
    return 1 if bad else 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
