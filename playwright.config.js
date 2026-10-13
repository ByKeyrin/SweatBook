/**
 * ============================================================
 *  Configuration Playwright — tests E2E (bout en bout) SweatBook
 * ============================================================
 *  Conforme à docs/TECHNICAL.md §8.3 « Stratégie de tests ».
 *
 *  Les tests E2E (end-to-end) ouvrent un VRAI navigateur (Chromium),
 *  cliquent dans l'interface comme un utilisateur, et vérifient
 *  que tout fonctionne de bout en bout (frontend + API + base).
 *
 *  Fichiers de test : tests/e2e/*.spec.js
 *  Documentation :   tests/README.md
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Dossier où chercher les tests E2E
  testDir: './tests/e2e',

  // Un test qui dépasse 30 s est considéré en échec
  timeout: 30_000,

  // Les tests peuvent tourner en parallèle (plus rapide)
  fullyParallel: true,

  // En intégration continue (CI), on relance 2 fois un test qui échoue
  retries: process.env.CI ? 2 : 0,

  // Deux reporters (docs §8.3) :
  //  - html : rapport navigable dans playwright-report/
  //  - list : résumé détaillé directement dans le terminal
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    // L'application tourne sur ce port en développement (Vite)
    baseURL: 'http://localhost:5173',

    // Capture d'écran gardée quand un test échoue (pratique pour debuguer)
    screenshot: 'only-on-failure',

    // Trace navigable (rejouable pas à pas : npx playwright show-trace …)
    // gardée quand un test échoue
    trace: 'retain-on-failure',
  },

  // Un seul "project" : Chromium (Chrome open-source)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Playwright démarre l'app automatiquement avant les tests :
  // `npm run dev` lance l'API (:3001) + le client Vite (:5173).
  // Hors CI, un serveur déjà lancé est réutilisé.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
