/**
 * Configuration Vitest — tests API SweatBook.
 *
 * On limite Vitest aux fichiers de tests API (tests/api/*.test.js).
 * Les fichiers E2E (tests/e2e/*.spec.js) sont réservés à Playwright
 * (`npm run test:e2e`) — ils utilisent `test.describe`, que Vitest
 * ne connaît pas.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/api/**/*.test.js'],
  },
});
