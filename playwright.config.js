/**
 * ============================================================
 *  Configuration Playwright — tests E2E (bout en bout) SweatBook
 * ============================================================
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
  // (un échec "pour de vrai" reste en échec, un souci réseau passager non)
  retries: process.env.CI ? 2 : 0,

  // Deux reporters :
  //  - html  : rapport navigable dans playwright-report/ (joli, détaillé)
  //  - list  : résumé détaillé directement dans le terminal
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    // L'application tourne sur ce port en développement (Vite)
    baseURL: 'http://localhost:5173',

    // On garde une capture d'écran quand un test échoue (pratique pour debuguer)
    screenshot: 'only-on-failure',

    // On garde la trace d'exécution (rejouable pas à pas) en cas d'échec
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
  // `npm run dev` lance le serveur (API :3001) + le client (Vite :5173).
  // Si l'app tourne déjà (développement), on réutilise le serveur existant.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
