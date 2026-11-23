# Maakt van de drukversie (RGB, uit de browser) de aanlever-pdf voor de drukker: CMYK, tekst als contouren, geen
# rasterbeelden, 111 x 154 mm met een snijkader van 105 x 148 mm, zonder snijtekens. Daarna controles.
# Gebruik: python3 -I maak-cmyk.py
import re, subprocess, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, FloatObject, NameObject

BRON = "strooizout-kaartje-a6-drukklaar.pdf"
RUW = "cmyk-ruw.pdf"
DOEL = "strooizout-kaartje-a6-drukklaar-CMYK.pdf"
MM = 72 / 25.4
B, H, A = 111, 154, 3

subprocess.run([
    "gs", "-q", "-dBATCH", "-dNOPAUSE", "-dSAFER", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4",
    "-sColorConversionStrategy=CMYK", "-sProcessColorModel=DeviceCMYK", "-dOverrideICC=true",
    "-dNoOutputFonts",  # tekst als contouren: de drukker heeft het lettertype niet nodig
    "-dAutoRotatePages=/None", "-dDownsampleColorImages=false", "-dDownsampleGrayImages=false", "-dDownsampleMonoImages=false",
    f"-sOutputFile={RUW}", BRON,
], check=True)

lezer = PdfReader(RUW)
pagina = lezer.pages[0]
def kader(x0, y0, x1, y1):
    return ArrayObject([FloatObject(round(v, 4)) for v in (x0, y0, x1, y1)])
boven = float(pagina.mediabox.top)
media = (0, boven - H * MM, B * MM, boven)
snij = (A * MM, media[1] + A * MM, media[2] - A * MM, boven - A * MM)
for naam, k in (("/MediaBox", media), ("/CropBox", media), ("/BleedBox", media), ("/TrimBox", snij), ("/ArtBox", snij)):
    pagina[NameObject(naam)] = kader(*k)
# de transparantiegroep van de pagina rekent in CMYK (geen RGB meer in het bestand)
groep = pagina.get("/Group")
if groep is not None and groep.get_object().get("/CS") == "/DeviceRGB":
    groep.get_object()[NameObject("/CS")] = NameObject("/DeviceCMYK")
schrijver = PdfWriter()
schrijver.add_page(pagina)
schrijver.add_metadata({"/Title": "Strooizout voor de buurt - A6-kaartje (drukklaar, CMYK, 3 mm afloop)", "/Author": "Denckh", "/Subject": "strooizouthouten.nl"})
with open(DOEL, "wb") as uit:
    schrijver.write(uit)

# ---- controles
r = PdfReader(DOEL)
p = r.pages[0]
mm = lambda v: round(float(v) / MM, 2)
print("bestand:", DOEL)
for naam in ("/MediaBox", "/BleedBox", "/TrimBox"):
    k = p[naam]
    print(f"  {naam[1:]:9} {mm(k[2]) - mm(k[0]):.1f} x {mm(k[3]) - mm(k[1]):.1f} mm  (links {mm(k[0])}, onder {mm(k[1])})")
tekst = b"".join(o.get_object().get_data() if hasattr(o.get_object(), "get_data") else b"" for o in ([p["/Contents"]] if not isinstance(p["/Contents"], list) else p["/Contents"]))
inh = tekst.decode("latin1")
tel = {op: len(re.findall(r"(?<![A-Za-z])%s(?![A-Za-z])" % op, inh)) for op in ("rg", "RG", "k", "K", "g", "G", "sh", "Do", "Tj", "TJ")}
print("  kleur- en tekenopdrachten in de pagina:", tel)
alles = ""
for o in r.trailer["/Root"].get_object()["/Pages"].get_object()["/Kids"]:
    alles += repr(o.get_object())
def loop(o, diepte=0, gezien=None):
    gezien = gezien if gezien is not None else set()
    uit = []
    o = o.get_object() if hasattr(o, "get_object") else o
    if id(o) in gezien or diepte > 12:
        return uit
    gezien.add(id(o))
    if hasattr(o, "items"):
        for k, v in o.items():
            if k == "/Parent":
                continue
            uit.append(str(k))
            if isinstance(v, str) or v.__class__.__name__ == "NameObject":
                uit.append(str(v))
            uit += loop(v, diepte + 1, gezien)
    elif isinstance(o, list):
        for v in o:
            if v.__class__.__name__ == "NameObject":
                uit.append(str(v))
            uit += loop(v, diepte + 1, gezien)
    return uit
namen = loop(p)
print("  DeviceRGB:", namen.count("/DeviceRGB"), "| DeviceCMYK:", namen.count("/DeviceCMYK"), "| ICCBased:", namen.count("/ICCBased"), "| lettertypen:", namen.count("/Font"), "| beelden (/Image):", namen.count("/Image"), "| verlopen (/Shading):", namen.count("/Shading"))
ok = tel["rg"] == 0 and tel["RG"] == 0 and namen.count("/DeviceRGB") == 0 and namen.count("/Image") == 0
print("  uitkomst:", "alleen CMYK/grijs, geen rasterbeelden" if ok else "LET OP: nog RGB of rasterbeelden aanwezig")
sys.exit(0 if ok else 1)
