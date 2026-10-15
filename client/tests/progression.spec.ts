import { test, expect } from '@playwright/test';
import { makeSession, daysAgo } from './helpers/session';
import { seedSessions, openProgression, STORAGE_KEY } from './helpers/progression';

/**
 * Tests E2E — Sprint 3 : Graphiques de progression.
 *
 * Vérifie le parcours « Je vérifie mes progrès » (docs/FUNCTIONAL.md §4.2) :
 *  1. la page Progression se charge ;
 *  2. les 4 cartes de statistiques sont visibles ;
 *  3. le graphique de distance est affiché ;
 *  4. le graphique de durée est affiché ;
 *  5. le filtre par période (7j / 30j / 90j) filtre réellement les données ;
 *  6. les données affichées proviennent du localStorage.
 *
 * 📚 Convention : comme pour le Journal (tests/journal.spec.ts), les tests
 * utilisent les libellés français de l'UI via getByRole / getByText.
 * Le jeu de données est injecté dans le localStorage par `seedSessions()`
 * (tests/helpers/progression.ts) — la source de vérité du Sprint 3.
 */

test.describe('Graphiques de progression — Sprint 3', () => {
  /**
   * Test 1 — La page Progression se charge.
   * Depuis la racine, cliquer sur l'onglet « Progression » de la navigation
   * affiche la page avec son titre « 📈 Progression ». On vérifie aussi que
   * le serveur répond bien 200.
   */
  test('la page progression se charge', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status(), 'GET / doit répondre 200').toBe(200);

    // Aller à la page Progression via la navigation principale
    await openProgression(page);

    // Le titre de la section est visible
    await expect(
      page.getByRole('heading', { name: /progression/i }).first(),
      'titre « 📈 Progression » affiché',
    ).toBeVisible();
  });

  /**
   * Test 2 — Les 4 cartes de statistiques sont visibles.
   * La rangée du haut résume le mois en cours (StatsCards.tsx) :
   * « Distance totale », « Séances », « Allure moyenne » et « FC moyenne ».
   * Les 4 titres doivent être présents — même avec un journal vide.
   */
  test('les 4 cartes de stats sont visibles', async ({ page }) => {
    await page.goto('/');
    await openProgression(page);

    const cartes = [
      [/^distance totale$/i, 'Distance totale'],
      [/^séances$/i, 'Séances'],
      [/^allure moyenne$/i, 'Allure moyenne'],
      [/^fc moyenne$/i, 'FC moyenne'],
    ] as const;

    for (const [titre, nom] of cartes) {
      await expect(
        page.getByRole('heading', { name: titre }),
        `carte « ${nom} » visible`,
      ).toBeVisible();
    }
  });

  /**
   * Test 3 — Le graphique de distance est affiché.
   * Avec des séances enregistrées, la page affiche le graphique
   * « 📈 Distance — N derniers jours » sous forme de courbe SVG Recharts.
   * Le conteneur du graphique porte le role="img" et son aria-label —
   * c'est le repère accessible le plus stable pour le tester.
   */
  test('le graphique distance est affiché', async ({ page }) => {
    // Des données doivent exister pour que la courbe soit tracée
    await seedSessions(page);
    await openProgression(page);

    // Le titre du graphique indique la période affichée (30 jours par défaut)
    await expect(
      page.getByRole('heading', { name: /distance\s*—\s*\d+ derniers jours/i }),
      'titre « 📈 Distance — N derniers jours » visible',
    ).toBeVisible();

    // Le graphique lui-même est rendu (conteneur role="img" de Recharts)
    await expect(
      page.getByRole('img', { name: /graphique de la distance par jour/i }),
      'courbe de distance rendue',
    ).toBeVisible();
  });

  /**
   * Test 4 — Le graphique de durée est affiché.
   * Même vérification pour le second graphique « ⏱️ Durée — N derniers jours »
   * (minutes de course par jour). Les deux graphiques doivent coexister.
   */
  test('le graphique durée est affiché', async ({ page }) => {
    await seedSessions(page);
    await openProgression(page);

    // Le titre du graphique de durée
    await expect(
      page.getByRole('heading', { name: /durée\s*—\s*\d+ derniers jours/i }),
      'titre « ⏱️ Durée — N derniers jours » visible',
    ).toBeVisible();

    // Le graphique de durée est rendu
    await expect(
      page.getByRole('img', { name: /graphique de la durée par jour/i }),
      'courbe de durée rendue',
    ).toBeVisible();

    // Le graphique de distance est toujours là aussi (les deux coexistent)
    await expect(
      page.getByRole('img', { name: /graphique de la distance par jour/i }),
    ).toBeVisible();
  });

  /**
   * Test 5 — Le filtre par période fonctionne (7j, 30j, 90j).
   * Avec une unique séance vieille de 20 jours :
   *  - « 30 jours » (défaut) l'affiche dans les graphiques ;
   *  - « 7 jours » ne l'affiche plus → état vide « Aucune séance sur cette
   *    période. » dans les DEUX graphiques ;
   *  - « 90 jours » la ré-affiche.
   * C'est la preuve que les boutons filtrent réellement les données.
   */
  test('le filtre par période fonctionne (7j, 30j, 90j)', async ({ page }) => {
    // Une seule séance, il y a 20 jours : visible sur 30j et 90j, pas sur 7j
    await seedSessions(page, [makeSession({ date: daysAgo(20), distance_km: 12 })]);
    await openProgression(page);

    const filtre = page.getByRole('group', { name: /filtrer par période/i });
    const graphiqueDistance = page.getByRole('img', {
      name: /graphique de la distance par jour/i,
    });

    // 30 jours (par défaut) : la séance d'il y a 20 jours est dans la période
    await expect(
      page.getByRole('heading', { name: /distance\s*—\s*30 derniers jours/i }),
      'période par défaut : 30 jours',
    ).toBeVisible();
    await expect(graphiqueDistance, 'la séance est visible sur 30 jours').toBeVisible();

    // 7 jours : la séance est trop ancienne → les deux graphiques sont vides
    await filtre.getByRole('button', { name: /7 jours/i }).click();
    await expect(
      page.getByRole('heading', { name: /distance\s*—\s*7 derniers jours/i }),
      'le titre reflète la période 7 jours',
    ).toBeVisible();
    await expect(
      page.getByText(/aucune séance sur cette période/i),
      'les deux graphiques affichent leur état vide',
    ).toHaveCount(2);
    await expect(graphiqueDistance, 'plus de courbe sur 7 jours').toBeHidden();

    // 90 jours : la séance redevient visible
    await filtre.getByRole('button', { name: /90 jours/i }).click();
    await expect(
      page.getByRole('heading', { name: /distance\s*—\s*90 derniers jours/i }),
      'le titre reflète la période 90 jours',
    ).toBeVisible();
    await expect(
      graphiqueDistance,
      'la séance est de nouveau visible sur 90 jours',
    ).toBeVisible();
  });

  /**
   * Test 6 — Les données affichées viennent du localStorage.
   * On injecte UNE séance au jour J (42 km, 60 min, FC 133) directement dans
   * le localStorage — jamais saisie via l'interface. Si la page l'affiche
   * (« Distance totale » = 42.0 km), c'est bien que les graphiques lisent le
   * localStorage. Ensuite, on vide le localStorage et on recharge : les
   * statistiques retombent à zéro, ce qui prouve la liaison.
   */
  test('les données affichées viennent du localStorage', async ({ page }) => {
    // 1 séance distinctive au jour J (toujours dans le « mois en cours »)
    await seedSessions(page, [
      makeSession({ date: daysAgo(0), distance_km: 42, duration_min: 60, avg_hr: 133 }),
    ]);
    await openProgression(page);

    // La carte « Distance totale » affiche la valeur issue du localStorage
    const carteDistance = page
      .getByRole('heading', { name: /^distance totale$/i })
      .locator('xpath=../..'); // remonte à la carte (titre > div d'en-tête > carte)
    await expect(carteDistance, '42.0 km lus dans le localStorage').toContainText('42.0');

    // La carte « FC moyenne » affiche aussi la valeur injectée
    const carteFc = page
      .getByRole('heading', { name: /^fc moyenne$/i })
      .locator('xpath=../..');
    await expect(carteFc, 'FC 133 lue dans le localStorage').toContainText('133');

    // 2. Vider le localStorage et recharger : tout retombe à zéro
    await page.evaluate((key: string) => window.localStorage.removeItem(key), STORAGE_KEY);
    await page.reload();
    await openProgression(page);

    await expect(
      page.getByRole('heading', { name: /^distance totale$/i }).locator('xpath=../..'),
      'sans localStorage, la distance retombe à 0.0',
    ).toContainText('0.0');
    await expect(
      page.getByRole('heading', { name: /^fc moyenne$/i }).locator('xpath=../..'),
      'sans localStorage, la FC affiche « — »',
    ).toContainText('—');
  });
});
