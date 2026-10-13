import { test, expect } from '@playwright/test';

/**
 * Smoke test E2E — Sprint 1.
 * Vérifie que l'app SweatBook se charge correctement :
 *  1. la page se charge (HTTP 200, racine React montée) ;
 *  2. le titre est visible ;
 *  3. la navigation principale est présente.
 */

test.describe('Smoke — Sprint 1', () => {
  test('la page se charge sans erreur', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status(), 'GET / doit répondre 200').toBe(200);

    // Le composant racine React est bien monté
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();

    // Aucune erreur console bloquante au chargement
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.reload();
    expect(errors, 'aucune erreur JS non gérée').toEqual([]);
  });

  test('le titre est visible', async ({ page }) => {
    await page.goto('/');

    // Le titre du document référence SweatBook
    await expect(page).toHaveTitle(/sweatbook/i);

    // Le titre principal de la page est visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('la navigation est présente', async ({ page }) => {
    await page.goto('/');

    // La barre de navigation est visible
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // Les trois sections principales sont accessibles (cf. docs/TECHNICAL.md §6.2)
    for (const label of ['Journal', 'Graphiques', 'Planning']) {
      await expect(
        nav.getByRole('link', { name: new RegExp(label, 'i') }),
        `lien « ${label} » présent dans la navigation`,
      ).toBeVisible();
    }
  });
});
