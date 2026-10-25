# Infrastructuur vóór livegang (nulmeting 24 oktober 2026)

Vastgelegd vóór wijzigingen, zodat duidelijk is wat er wel en niet is aangepast.

## Domein

| Vraag | Bevinding |
| --- | --- |
| Registrar | Cloudflare Registrar (geregistreerd 24-10-2026, verloopt 24-10-2027) |
| Nameservers | `kayden.ns.cloudflare.com`, `sloan.ns.cloudflare.com` |
| Cloudflare-zone | `martijndenbesten.com`, status *active*, Free plan |
| Bestaande records (publiek opgevraagd via DNS-over-HTTPS) | Alleen NS en SOA op het hoofddomein. Geen A/AAAA/CNAME op `@` of `www` |
| E-mail | Geen MX-, SPF-, DKIM- of DMARC-records aanwezig: er is (nog) geen e-mail op dit domein |
| Subdomeinen in gebruik | `leren.martijndenbesten.com` → Worker `energie-trainer-h3` (custom domain) |

Het gebruikte API-token mag geen DNS-records lezen of schrijven; DNS is daarom niet handmatig aangepast. Workers Custom Domains maken zelf alleen de records voor `@` en `www` aan.

## Wat is er toegevoegd

- Worker `martijndenbesten` + custom domain `martijndenbesten.com`
- Worker `martijndenbesten-www` + custom domain `www.martijndenbesten.com`
- D1-database `martijndenbesten` (`d348e383-bcf1-4e08-b742-f85abe8fef2c`)
- Worker-secrets `ADMIN_TOKEN` en `HASH_SECRET`

Niets bestaands is verwijderd of overschreven. Andere Workers, databases en zones zijn niet gewijzigd.

## Aandachtspunt e-mail

Er is geen e-mail ingericht. Wil je later e-mail op dit domein, overweeg dan in de tussentijd een ‘null MX’ en SPF `v=spf1 -all` om spoofing te voorkomen. Dat is bewust niet gedaan, omdat het buiten deze opdracht valt en de DNS-rechten ontbraken.

## Opgeruimd

Een eerste poging om de database aan te maken via de Cloudflare-connector van de bouwomgeving kwam in een ander account terecht dan het account met dit domein. Die lege database (0 tabellen) is direct weer verwijderd en opnieuw aangemaakt in het juiste account.
