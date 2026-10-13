/**
 * ============================================================
 *  Tests E2E — 📈 Graphiques de progression (tests/e2e/progression.spec.js)
 * ============================================================
 *  Parcours couvert (docs/FUNCTIONAL.md §6.1) :
 *   3. « Je vérifie mes progrès »
 *
 *  La page « Graphiques » (StatsPage) affiche 3 graphiques :
 *   1. Volume hebdomadaire (km par semaine)
 *   2. Allure moyenne (min/km au fil du temps)
 *   3. Régularité (nombre de séances par semaine)
 *  → voir docs/FUNCTIONAL.md §4.2
 *
 *  🎓 Astuce : on teste que les graphiques SONT LÀ et utilisables.
 *  On ne teste pas les calculs ici — ça, ce sont les tests API
 *  (tests/api/stats.test.js) qui s'en chargent.
 */
import { test, expect } from '@playwright/test';
import { navigateTo } from '../helpers/test-utils.js';

test.describe('📈 Graphiques de progression', () => {
  /**
   * Test 1 — Chargement de la page.
   * Depuis le Journal, cliquer sur « Graphiques » affiche la page
   * avec ses trois graphiques.
   */
  test('affiche les trois graphiques de progression', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'progression');

    // Les 3 titres de graphiques sont visibles
    await expect(page.getByText(/volume hebdomadaire/i).first()).toBeVisible();
    await expect(page.getByText(/allure moyenne/i).first()).toBeVisible();
    await expect(page.getByText(/régularité/i).first()).toBeVisible();
  });

  /**
   * Test 2 — Les graphiques sont de vrais graphiques (SVG).
   * Recharts dessine dans des balises <svg> : si aucune balise SVG
   * n'apparaît, c'est que les données ne sont pas chargées.
   */
  test('dessine les graphiques (balises SVG présentes)', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'progression');

    // Au moins un graphique SVG est rendu à l'écran
    await expect(page.locator('svg').first()).toBeVisible();
  });

  /**
   * Test 3 — Changement de période.
   * L'utilisateur peut filtrer sur « 4 dernières semaines », « 3 mois »
   * ou « tout » (docs/FUNCTIONAL.md §4.2).
   */
  test('change la période affichée (3 mois)', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'progression');

    // Clique sur le bouton « 3 mois »
    await page.getByRole('button', { name: /3 mois/i }).click();

    // La page reste affichée et les graphiques sont toujours visibles
    await expect(page.getByText(/volume hebdomadaire/i).first()).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
  });
});
