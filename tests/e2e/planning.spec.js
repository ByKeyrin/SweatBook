/**
 * ============================================================
 *  Tests E2E — 📅 Planning hebdomadaire (tests/e2e/planning.spec.js)
 * ============================================================
 *
 *  La page « Planning » (PlanningPage + WeekPlanner) affiche une grille
 *  lundi → dimanche où l'on planifie ses entraînements.
 *  → voir docs/FUNCTIONAL.md §4.3
 *
 *  Statuts visuels :
 *   🟢 Fait      — la séance est enregistrée (session_id renseigné)
 *   🟡 À faire   — prévu mais pas encore réalisé
 *   ⚪ Repos     — jour de récupération
 */
import { test, expect } from '@playwright/test';
import { navigateTo } from '../helpers/test-utils.js';

test.describe('📅 Planning hebdomadaire', () => {
  /**
   * Test 1 — Affichage de la grille.
   * La semaine va du lundi au dimanche (convention européenne,
   * docs/FUNCTIONAL.md §5.4) : les 7 jours sont affichés.
   */
  test('affiche la grille des 7 jours (lundi → dimanche)', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Les 7 jours de la semaine sont visibles
    for (const day of ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']) {
      await expect(page.getByText(day, { exact: false }).first()).toBeVisible();
    }
  });

  /**
   * Test 2 — Navigation entre les semaines.
   * Les boutons « précédente / suivante » changent la semaine affichée
   * (docs/FUNCTIONAL.md §4.3).
   */
  test('change de semaine avec les boutons précédent/suivant', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Le titre de la semaine contient « Semaine du … »
    const weekTitle = page.getByText(/semaine du/i).first();
    await expect(weekTitle).toBeVisible();
    const weekBefore = await weekTitle.textContent();

    // Clique sur « semaine suivante » → la semaine affichée change
    await page.getByRole('button', { name: /suivante/i }).click();
    await expect(weekTitle).not.toHaveText(weekBefore);

    // Reviens en arrière → on retrouve la semaine initiale
    await page.getByRole('button', { name: /précédente/i }).click();
    await expect(weekTitle).toHaveText(weekBefore);
  });

  /**
   * Test 3 — Planifier un entraînement.
   * On clique sur la case du lundi, on choisit un type de séance et une
   * distance prévue, puis la case passe en statut « 🟡 À faire ».
   */
  test('planifie une sortie facile le lundi', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Clique sur la case du lundi (premier jour de la grille)
    await page.getByText('Lundi', { exact: false }).first().click();

    // Choisit le type « Sortie facile » et une distance prévue
    await page.getByLabel(/type de séance/i).selectOption('easy');
    await page.getByLabel(/distance prévue/i).fill('8');
    await page.getByRole('button', { name: /enregistrer|planifier/i }).click();

    // La case du lundi montre l'entraînement prévu, statut « À faire »
    await expect(page.getByText(/à faire/i).first()).toBeVisible();
    await expect(page.getByText(/8[,.]?0?\s*km/i).first()).toBeVisible();
  });
});
