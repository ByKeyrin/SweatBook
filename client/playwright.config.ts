import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright — tests E2E du client SweatBook (Sprint 1).
 *
 * - `webServer` démarre automatiquement le client Vite avant les tests.
 * - Port surchargeable via E2E_PORT (défaut 5173, le port standard du projet).
 *   ⚠️ Contexte Sprint 1 : un stub jetable (/tmp/sweatbook-stub) occupe :5173
 *   et :3001. Tant qu'il tourne, lancer avec `E2E_PORT=5174 npx playwright test`
 *   pour tester la VRAIE app (sinon reuseExistingServer attrape le stub).
 * - Les traces ne sont produites qu'au premier retry, en cas d'échec.
 * - Artefacts (git-ignorés) : `playwright-report/` et `test-results/`.
 */

const PORT = Number(process.env.E2E_PORT ?? 5173);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000, // un test > 30 s est un échec
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
