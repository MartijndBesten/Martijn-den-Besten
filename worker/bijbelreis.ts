// De Bijbelreis op een eigen adres (bijbelreis.nl): alleen de atlas, zonder de rest van martijndenbesten.com. De enige
// route die iets aanneemt is de bezoekmeting (POST /api/bezoek, worker/bezoek.ts), die naar de D1-database schrijft.
// De bestanden komen uit dezelfde build (dist/client) en zijn ingebed door scripts/embed-assets.mjs.
// De atlas staat op ‘/’; de eigen bestanden houden hun pad onder /bijbelreis/ en /fonts/.

import { FILES, HEADER_RULES } from "./generated/bijbelreis-files";
import { maakBijbelreisWorker } from "./bijbelreis-app";

export default maakBijbelreisWorker(FILES, HEADER_RULES);
