# Zet de pagina's op de exacte maat (Chromium rondt af op hele pixels) en legt snij- en afloopkader vast.
# Gebruik: python3 -I paginamaat.py
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, FloatObject, NameObject

MM = 72 / 25.4

def kader(x0, y0, x1, y1):
    return ArrayObject([FloatObject(round(v, 4)) for v in (x0, y0, x1, y1)])

for bestand, breed, hoog, afloop in (("strooizout-kaartje-a6.pdf", 105, 148, 0), ("strooizout-kaartje-a6-drukklaar.pdf", 111, 154, 3)):
    lezer = PdfReader(bestand)
    schrijver = PdfWriter()
    pagina = lezer.pages[0]
    boven = float(pagina.mediabox.top)  # de tekening begint linksboven
    media = (0, boven - hoog * MM, breed * MM, boven)
    snij = (afloop * MM, media[1] + afloop * MM, media[2] - afloop * MM, boven - afloop * MM)
    for naam, k in (("/MediaBox", media), ("/CropBox", media), ("/BleedBox", media), ("/TrimBox", snij), ("/ArtBox", snij)):
        pagina[NameObject(naam)] = kader(*k)
    schrijver.add_page(pagina)
    schrijver.add_metadata({"/Title": "Strooizout voor de buurt – A6-kaartje" + (" (drukklaar, 3 mm afloop)" if afloop else ""), "/Author": "Denckh", "/Subject": "strooizouthouten.nl"})
    with open(bestand, "wb") as uit:
        schrijver.write(uit)
    print("pagina op maat:", bestand, f"{breed} x {hoog} mm", f"(snijkader {breed - 2 * afloop} x {hoog - 2 * afloop} mm)" if afloop else "")
