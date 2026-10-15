/**
 * ============================================================
 *  Tests E2E — 📅 Planning hebdomadaire (tests/e2e/planning.spec.js)
 * ============================================================
 *  Parcours couvert (docs/FUNCTIONAL.md §6.1) :
 *   2. « Je prépare ma semaine »
 *
 *  La page « Planning » (features/planning/ — Sprint 4) assemble :
 *   - WeekNav : « ◀ Précédente » / « Suivante ▶ » + libellé
 *     « Semaine 42 — 12 au 18 octobre » ;
 *   - 7 cartes jour (DayCard) « Lun » … « Dim » avec la date du jour,
 *     la mention « Repos » si rien n'est planifié, et un bouton
 *     « + Ajouter » ;
 *   - le formulaire « ➕ Planifier une séance » (PlanSessionForm) :
 *     champs « Jour », « Type » (Course / Force / Tennis),
 *     « Durée prévue (min) » et « Notes ».
 *  → voir docs/FUNCTIONAL.md §4.3
 *
 *  📝 Les séances planifiées sont persistées dans le localStorage
 *  (clé « sweatbook_plan ») par le hook usePlanning.ts.
 */
import { test, expect } from '@playwright/test';
import { navigateTo } from '../helpers/test-utils.js';

/** Les 7 jours abrégés affichés dans la grille (DayCard.tsx). */
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Retourne la carte d'un jour de la grille (conteneur DayCard).
 * Le nom du jour (« Lun »…) est dans le haut de la carte : on remonte
 * de deux niveaux (titre > en-tête > carte) pour obtenir la carte entière.
 * @param {import('@playwright/test').Page} page
 * @param {number} dayIndex - 0 = lundi … 6 = dimanche
 */
function dayCard(page, dayIndex) {
  return page.getByText(DAY_LABELS[dayIndex], { exact: true }).locator('xpath=../..');
}

test.describe('📅 Planning hebdomadaire', () => {
  /**
   * Test 1 — Affichage de la grille.
   * La semaine va du lundi au dimanche (convention européenne,
   * docs/FUNCTIONAL.md §5.4) : les 7 jours sont affichés, chacun
   * avec son bouton « + Ajouter ».
   */
  test('affiche la grille des 7 jours (lundi → dimanche)', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Les 7 jours de la semaine sont visibles (abréviations Lun…Dim)
    for (let i = 0; i < DAY_LABELS.length; i++) {
      await expect(
        dayCard(page, i).getByText(DAY_LABELS[i], { exact: true }),
        `jour ${DAY_LABELS[i]} visible`,
      ).toBeVisible();
    }

    // Une case par jour : exactement 7 boutons « + Ajouter »
    await expect(page.getByRole('button', { name: '+ Ajouter' })).toHaveCount(7);
  });

  /**
   * Test 2 — Navigation entre les semaines.
   * Les boutons « Précédente / Suivante » changent la semaine affichée
   * (libellé « Semaine N — … », docs/FUNCTIONAL.md §4.3).
   */
  test('change de semaine avec les boutons précédent/suivant', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Le libellé de la semaine contient « Semaine N — du … au … »
    const weekTitle = page.getByText(/semaine \d+ —/i).first();
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
   * Test 3 — Planifier un entraînement (parcours 2 du cahier de recette).
   * On clique sur « + Ajouter » dans la case du lundi, on choisit un
   * type de séance (« Course ») et une durée prévue, puis la séance
   * apparaît dans la case du lundi.
   */
  test('planifie une course le lundi', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'planning');

    // Clique sur « + Ajouter » dans la case du lundi (premier jour de la grille)
    await dayCard(page, 0).getByRole('button', { name: '+ Ajouter' }).click();

    // 💡 On cible les champs DANS le formulaire : en cherchant dans toute la
    // page, /^jour/i confondrait le champ « Jour » avec le lien « Journal ».
    const form = page.locator('form');

    // Le formulaire est déjà ciblé sur le lundi (jour n° 0)
    await expect(form.getByLabel(/^jour/i)).toHaveValue('0');

    // Choisit le type « Course » et une durée prévue de 45 minutes
    await form.getByLabel(/^type/i).selectOption('course');
    await form.getByLabel(/durée prévue/i).fill('45');
    await page.getByRole('button', { name: /planifier la séance/i }).click();

    // La case du lundi affiche l'entraînement prévu (45 min) ;
    // les autres jours restent à « Repos »
    await expect(dayCard(page, 0)).toContainText('Course');
    await expect(dayCard(page, 0)).toContainText('45 min');
    await expect(dayCard(page, 1)).toContainText('Repos');
  });
});
