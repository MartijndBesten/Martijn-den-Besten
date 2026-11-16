// De Bijbelreis op een eigen adres (bijbelreis.nl): alleen de atlas, zonder de rest van martijndenbesten.com. Twee routes
// nemen iets aan en schrijven naar de D1-database: de bezoekmeting (POST /api/bezoek, worker/bezoek.ts) en de aanvragen
// van bezoekers (POST /api/aanvraag, worker/aanvraag.ts). Een aanvraag gaat ook als e-mail naar de maker (binding MAIL).
// De bestanden komen uit dezelfde build (dist/client) en zijn ingebed door scripts/embed-assets.mjs.
// De atlas staat op ‘/’; de eigen bestanden houden hun pad onder /bijbelreis/ en /fonts/.

import { FILES, HEADER_RULES } from "./generated/bijbelreis-files";
import { maakBijbelreisWorker } from "./bijbelreis-app";
// Alleen hier: deze module bestaat alleen in de Worker-omgeving, niet in de tests (die gebruiken bijbelreis-app.ts).
import { EmailMessage } from "cloudflare:email";

export default maakBijbelreisWorker(FILES, HEADER_RULES, { EmailMessage });
