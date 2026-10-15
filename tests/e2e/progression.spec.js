/**
 * ============================================================
 *  Tests E2E — 📈 Graphiques de progression (tests/e2e/progression.spec.js)
 * ============================================================
 *  Parcours couvert (docs/FUNCTIONAL.md §6.1) :
 *   3. « Je vérifie mes progrès »
 *
 *  🎓 C'est quoi un test E2E ? Voir tests/e2e/journal.spec.js.
 *
 *  📝 Interface RÉELLE (features/progression/ — Sprint 3) :
 *   - 4 cartes de stats : « Distance totale », « Séances »,
 *     « Allure moyenne », « FC moyenne » (StatsCards.tsx) ;
 *   - 2 graphiques Recharts : « 📈 Distance — N derniers jours » et
 *     « ⏱️ Durée — N derniers jours » (DistanceChart / DurationChart) ;
 *   - un filtre de période : « 7 jours », « 30 jours » (défaut),
 *     « 90 jours » (ProgressionScreen.tsx).
 *
 *  ⚠️ Note de version : docs/FUNCTIONAL.md §4.2 annonçait 3 graphiques
 *  (« Volume hebdomadaire », « Allure moyenne », « Régularité ») et un
 *  filtre « 4 semaines / 3 mois / tout ». Le Sprint 3 a livré l'évolution
 *  distance + durée avec un filtre 7/30/90 jours : ces tests suivent
 *  l'UI réelle (« les sélecteurs suivent le code », et non l'inverse).
 *
 *  🎓 On teste que les graphiques SONT LÀ et utilisables.
 *  On ne teste pas les calculs ici — ça, ce sont les tests API
 *  (tests/api/stats.test.js) qui s'en chargent.
 */
import { test, expect } from '@playwright/test';
import { navigateTo, seedSessions } from '../helpers/test-utils.js';

test.describe('📈 Graphiques de progression', () => {
  /**
   * Test 1 — Chargement de la page.
   * Depuis le Journal, cliquer sur « Graphiques » (lien aria-label
   * « Progression — Graphiques ») affiche la page avec ses deux
   * graphiques et ses cartes de statistiques.
   */
  test('affiche les graphiques de progression', async ({ page }) => {
    await page.goto('/');
    await navigateTo(page, 'progression');

    // Le titre de la page
    await expect(page.getByText('📈 Progression')).toBeVisible();

    // Les titres des 2 graphiques, avec la période affichée (30 jours par défaut)
    await expect(page.getByText(/distance\s*—\s*30 derniers jours/i)).toBeVisible();
    await expect(page.getByText(/durée\s*—\s*30 derniers jours/i)).toBeVisible();

    // Les cartes de statistiques du mois en cours
    await expect(page.getByText('Distance totale')).toBeVisible();
    await expect(page.getByText('FC moyenne')).toBeVisible();
  });

  /**
   * Test 2 — Les graphiques sont de vrais graphiques (SVG).
   * Recharts dessine dans des balises <svg> : si aucune balise SVG
   * n'apparaît, c'est que les données ne sont pas chargées.
   * On injecte donc 2 séances récentes dans le localStorage avant.
   */
  test('dessine les graphiques (balises SVG présentes)', async ({ page }) => {
    // Des données doivent exister pour que les courbes soient tracées
    await seedSessions(page);
    await navigateTo(page, 'progression');

    // Au moins un graphique SVG est rendu à l'écran
    await expect(page.locator('svg').first()).toBeVisible();
  });

  /**
   * Test 3 — Changement de période.
   * L'utilisateur peut filtrer sur « 7 jours », « 30 jours » ou
   * « 90 jours » (≈ 3 mois). Le filtre doit se refléter dans le
   * titre des graphiques.
   */
  test('change la période affichée (90 jours)', async ({ page }) => {
    await seedSessions(page);
    await navigateTo(page, 'progression');

    // Clique sur le bouton « 90 jours » du filtre « Filtrer par période »
    await page
      .getByRole('group', { name: /filtrer par période/i })
      .getByRole('button', { name: /90 jours/i })
      .click();

    // Les titres reflètent la nouvelle période, les graphiques restent dessinés
    await expect(page.getByText(/distance\s*—\s*90 derniers jours/i)).toBeVisible();
    await expect(page.getByText(/durée\s*—\s*90 derniers jours/i)).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
  });
});
