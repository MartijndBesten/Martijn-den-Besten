// Gestructureerde gegevens (schema.org Product + Offer) voor de homepage van strooizouthouten.nl, met de actuele prijzen,
// staffels en beschikbaarheid uit de database. Zo zien zoekmachines dezelfde prijs als de bezoeker (eis van Google).
// Alleen producten die te bestellen zijn; ‘binnenkort’-producten niet.

import { aanbiedingGeldig, type Instellingen } from "../shared/strooizout";
import { laadCatalogus, laadInstellingen, laadMagazijn, opVoorraad, publiek, teKoop, type Catalogus, type SzEnv } from "./strooizout-basis";
import { STROOIZOUT_DOMEIN } from "./strooizout-domein";

const BASIS = `https://${STROOIZOUT_DOMEIN}`;
const bedrag = (cent: number) => (cent / 100).toFixed(2);

/** JSON-LD voor de webshop: verkoper (Denckh) en per product een Offer met staffelprijzen en beschikbaarheid. */
export function productGegevens(cat: Catalogus, inst: Instellingen, magazijn: Map<number, number>, nu = new Date().toISOString()): Record<string, unknown> {
  const verkoper = {
    "@type": "Organization",
    "@id": `${BASIS}/#verkoper`,
    name: inst.verkoper_naam || "Denckh",
    url: "https://denckh.nl",
    ...(inst.verkoper_email ? { email: inst.verkoper_email } : {}),
    ...(inst.verkoper_btw ? { vatID: inst.verkoper_btw } : {}),
    ...(inst.verkoper_adres
      ? { address: { "@type": "PostalAddress", streetAddress: inst.verkoper_adres.split(",")[0].trim(), addressLocality: (inst.verkoper_adres.split(",")[1] ?? "Houten").trim(), addressCountry: "NL" } }
      : {}),
  };
  const producten = cat.producten.filter(teKoop).map((p) => {
    const pub = publiek(cat, p, inst.bezorg_per_stuk_cent, magazijn);
    const treden = pub.aanbiedingen.filter((a) => aanbiedingGeldig(a, nu) && a.vanaf_aantal > 1 && a.prijs_cent < pub.prijs_cent).sort((a, b) => a.vanaf_aantal - b.vanaf_aantal);
    const ligt = opVoorraad(cat, p, magazijn);
    const availability = pub.voorraad === 0 ? "OutOfStock" : ligt === false ? "PreOrder" : "InStock";
    const tarief = (cent: number, min?: number, max?: number) => ({
      "@type": "UnitPriceSpecification",
      price: bedrag(cent),
      priceCurrency: "EUR",
      valueAddedTaxIncluded: inst.btw_modus === "inclusief",
      ...(min ? { eligibleQuantity: { "@type": "QuantitativeValue", minValue: min, ...(max ? { maxValue: max } : {}), unitCode: "C62" } } : {}),
    });
    return {
      "@type": "Product",
      "@id": `${BASIS}/#${p.slug}`,
      name: p.naam,
      description: p.beschrijving || p.kort,
      sku: p.slug,
      image: p.afbeelding.startsWith("/") ? `${BASIS}${p.afbeelding}` : undefined,
      brand: { "@type": "Brand", name: "Strooizout voor de buurt" },
      ...(p.gewicht_gram ? { weight: { "@type": "QuantitativeValue", value: p.gewicht_gram / 1000, unitCode: "KGM" } } : {}),
      offers: {
        "@type": "Offer",
        url: `${BASIS}/`,
        price: bedrag(pub.prijs_cent),
        priceCurrency: "EUR",
        availability: `https://schema.org/${availability}`,
        ...(availability === "PreOrder" && inst.beschikbaar_vanaf ? { availabilityStarts: inst.beschikbaar_vanaf } : {}),
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${BASIS}/#verkoper` },
        areaServed: { "@type": "City", name: "Houten" },
        availableDeliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModePickUp", ...(inst.bezorgen_aan && !p.alleen_afhalen ? ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"] : [])],
        priceSpecification: [
          tarief(pub.prijs_cent, treden.length ? 1 : undefined, treden.length ? treden[0].vanaf_aantal - 1 : undefined),
          ...treden.map((a, i) => tarief(a.prijs_cent, a.vanaf_aantal, treden[i + 1] ? treden[i + 1].vanaf_aantal - 1 : undefined)),
        ],
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "NL",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnInStore",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };
  });
  return { "@context": "https://schema.org", "@graph": [verkoper, ...producten] };
}

/** Voegt de JSON-LD toe aan de HTML van de homepage. Bij een fout (of zonder HTMLRewriter) de pagina ongewijzigd. */
export async function metProductGegevens(antwoord: Response, env: SzEnv): Promise<Response> {
  if (!antwoord.ok || !(antwoord.headers.get("Content-Type") ?? "").includes("text/html") || typeof HTMLRewriter === "undefined") return antwoord;
  try {
    const [cat, inst, magazijn] = await Promise.all([laadCatalogus(env.DB), laadInstellingen(env.DB), laadMagazijn(env.DB)]);
    const json = JSON.stringify(productGegevens(cat, inst, magazijn)).replace(/</g, "\\u003c");
    // Verificatie voor Google Search Console / Merchant Center, in te vullen in het beheer (alleen veilige tekens).
    const verificatie = /^[A-Za-z0-9_-]{10,120}$/.test(inst.google_verificatie) ? `<meta name="google-site-verification" content="${inst.google_verificatie}" />` : "";
    const nieuw = new HTMLRewriter()
      .on("head", {
        element: (el) => {
          el.append(`${verificatie}<script type="application/ld+json">${json}</script>`, { html: true });
        },
      })
      .transform(antwoord);
    const h = new Headers(nieuw.headers);
    h.delete("ETag"); // de inhoud is aangevuld; cachebeleid van de pagina zelf blijft gelijk
    return new Response(nieuw.body, { status: nieuw.status, headers: h });
  } catch (e) {
    console.error("Strooizout: productgegevens niet toegevoegd", String(e));
    return antwoord;
  }
}
