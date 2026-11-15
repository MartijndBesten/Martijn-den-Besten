#!/usr/bin/env python3
"""Zoek een Bijbelse plaats in OpenBible.info Bible Geocoding Data (CC BY 4.0).
Gebruik: python3 -I plaats-zoek.py "Thessalonica" ["Berea" ...]   (Engelse naam, deel van de naam mag; --exact voor exacte naam)
Toont per oude plaats: de verzen, en per identificatie de score (0-1000), de moderne naam, [lat, lng] en de nauwkeurigheid."""
import json, sys, os
# De gegevens staan niet in de repository (ca. 15 MB). Haal ancient.jsonl en modern.jsonl uit
# https://github.com/openbibleinfo/Bible-Geocoding-Data (map data/) en wijs er met OBI_DATA naar.
D = os.environ.get("OBI_DATA") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "obi")
exact = "--exact" in sys.argv
zoek = [a.lower() for a in sys.argv[1:] if not a.startswith("--")]
modern = {}
for l in open(os.path.join(D, "modern.jsonl"), encoding="utf-8"):
    d = json.loads(l); modern[d["id"]] = d
for l in open(os.path.join(D, "ancient.jsonl"), encoding="utf-8"):
    d = json.loads(l); naam = d.get("friendly_id", "")
    if not any((z == naam.lower()) if exact else (z in naam.lower()) for z in zoek): continue
    extra = json.loads(d.get("extra") or "{}")
    print(f"\n=== {naam}  (verzen: {', '.join(extra.get('osises', [])[:12])}{' …' if len(extra.get('osises', [])) > 12 else ''})")
    assoc = {a.get("modern_id"): a.get("score") for a in extra.get("associations", [])}
    for i in d.get("identifications", []):
        s = i.get("score") or {}
        for r in (i.get("resolutions") or [{}])[:2]:
            ll = r.get("lonlat") or ""
            m = modern.get(i.get("id")) or {}
            if not ll and m.get("lonlat"): ll = m["lonlat"]
            latlng = ""
            if ll:
                lon, lat = ll.split(","); latlng = f"[{float(lat):.4f}, {float(lon):.4f}]"
            namen = "; ".join(n["name"] for n in (m.get("names") or [])[:3]) or m.get("friendly_id", "")
            prec = (m.get("precision") or {}).get("description", "")
            print(f"   score {assoc.get(i.get('id'), '?'):>5} (tijd {s.get('time_total', '?')}, stemmen {s.get('vote_total', '?')}/{s.get('vote_count', '?')})  {latlng:22} {i.get('class', ''):8} {namen}  [{prec}]  {i.get('id')}")
