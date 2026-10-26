# Bijbelreis: releases en herstelpunten

Deploy: embedded Worker vanaf `origin/main`:

```
npm run build && node scripts/embed-assets.mjs && npx wrangler deploy -c wrangler.embedded.jsonc
```

Terugdraaien naar het vorige herstelpunt:

```
npx wrangler rollback <versie-id> -c wrangler.embedded.jsonc
```

Dat zet alleen de code terug. De voortgang van gebruikers staat in hun eigen browser (localStorage) en verandert daardoor niet.

| Versie | Datum | Commit op `main` | Worker-versie | Herstelpunt (vorige versie) | Controle na publicatie |
|---|---|---|---|---|---|
| 3.0 + afronding | 25-10-2026 | `6a3bc77` | `d5b8af16-ca11-466e-b060-5da3fe5de375` | zie OPLEVERING-3.md | zie OPLEVERING-3.md |
| 3.1 ontdekkingsatlas | 26-10-2026 | `960c31b` (PR #7) | `177476eb-5e8c-42b4-9739-565f2eb9ce5a` | `d5b8af16-ca11-466e-b060-5da3fe5de375` | live-assets byte-gelijk aan de build; `/api/health` 200; e2e tegen productie: 106 geslaagd, 2 overgeslagen, 0 mislukt |
