# Moderatie van ingezonden ideeën

Ingezonden ideeën krijgen de status `pending` en zijn **niet** publiek zichtbaar tot ze zijn goedgekeurd.

## Via de website

1. Ga naar https://martijndenbesten.com/beheer (staat niet in de navigatie en is uitgesloten van zoekmachines).
2. Vul het beheertoken in (Worker-secret `ADMIN_TOKEN`). Het token blijft alleen in deze browsersessie.
3. Kies per inzending: **Goedkeuren**, **Afwijzen** of **Verwijderen** (verwijdert ook de bijbehorende stemmen).

## Via de command line

```bash
# wachtrij bekijken
npx wrangler d1 execute martijndenbesten --remote --command "SELECT id, title, created_at FROM ideas WHERE status='pending'"
# goedkeuren / verwijderen
npx wrangler d1 execute martijndenbesten --remote --command "UPDATE ideas SET status='approved' WHERE id=12"
npx wrangler d1 execute martijndenbesten --remote --command "DELETE FROM ideas WHERE id=12; DELETE FROM votes WHERE item_id='inzending-12'"
```

## Bescherming tegen misbruik

| Maatregel | Details |
| --- | --- |
| Moderatie | Alleen `approved` is publiek |
| Validatie | Titel 3–80 tekens, toelichting max. 500, vaste categorieën; geen links, e-mailadressen of telefoonnummers |
| Rate limiting | Ideeën: 3 per uur en 8 per dag; stemmen: 40 per uur (per bezoeker) |
| Spam | Honeypot-veld en minimale invultijd (bots krijgen een nep-‘succes’) |
| Origin-check | POST alleen vanaf de eigen site; JSON verplicht; max. 4 KB per verzoek |
| Wachtrijlimiet | Maximaal 500 inzendingen in de wachtrij |
| Privacy | Geen namen, e-mailadressen of IP-adressen. Limieten gebruiken een HMAC van IP + datum met een geheime sleutel: per dag anders, niet terug te rekenen. Rate-limitregels worden na 2 dagen opgeschoond |
| Eerlijke tellers | Stemtellers tonen het echte aantal uit D1. Eén stem per object per bezoeker per dag, op basis van een willekeurige anonieme bezoekerscode in de browser (per dag gehasht), met het gehashte IP-adres als terugval. Zo tellen mensen achter een gedeeld IP-adres apart en telt een wisselend IP-adres niet dubbel. Bij een storing staat er ‘teller offline’ in plaats van een verzonnen getal |
