#!/bin/sh
# Visuele regressietest van de Bijbelreis in een vaste omgeving: hetzelfde Playwright-image (op digest) als de CI-job
# ‘Visuele regressie’. Zo zijn browser (Chromium 153, Playwright 1.63.0), besturingssysteem en systeemlettertypen
# lokaal en in de CI gelijk. Extra argumenten gaan door naar Playwright, bijvoorbeeld:
#   npm run test:visueel                         # vergelijken met de referentiebeelden
#   npm run test:visueel -- --update-snapshots   # nieuwe referentiebeelden (alleen na visuele controle, zie de spec)
# Houd BEELD gelijk aan ‘container.image’ in .github/workflows/ci.yml (een unittest bewaakt dat).
set -eu
BEELD="mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27"
cd "$(dirname "$0")/.."
# node_modules in een eigen volume: de modules van de host (bijv. macOS) passen niet in de Linux-container.
exec docker run --rm --ipc=host --network host \
  -v "$PWD":/work -v bijbelreis-visueel-modules:/work/node_modules -w /work \
  -e CI=1 -e BIJBELREIS_VISUEEL=1 -e HTTPS_PROXY -e HTTP_PROXY -e NO_PROXY -e NODE_EXTRA_CA_CERTS \
  ${NODE_EXTRA_CA_CERTS:+-v "$NODE_EXTRA_CA_CERTS":"$NODE_EXTRA_CA_CERTS":ro} \
  "$BEELD" sh -c 'npm ci --no-audit --no-fund >/dev/null && npm run build >/dev/null && npx playwright test e2e/bijbelreis-visueel.spec.ts "$@"' visueel "$@"
