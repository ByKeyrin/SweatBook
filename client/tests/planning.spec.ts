import { test, expect } from '@playwright/test';
import { addDays, addWeeks } from 'date-fns';
import {
  DAY_SHORT_LABELS,
  currentWeekStart,
  dayCard,
  formatDayDate,
  formatWeekLabel,
  makePlanEntry,
  navigateWeek,
  openPlanning,
  planForm,
  seedPlanning,
  weekLabel,
} from './helpers/planning';

/**
 * Tests E2E — Sprint 4 : Planning hebdomadaire.
 *
 * Vérifie le parcours « Je prépare ma semaine » (docs/FUNCTIONAL.md §4.3) :
 *  1. la page Planning se charge ;
 *  2. les 7 jours de la semaine sont affichés (lundi → dimanche) ;
 *  3. la navigation entre les semaines fonctionne (précédente / suivante) ;
 *  4. le formulaire de planification s'affiche ;
 *  5. planifier une séance ajoute une carte dans le bon jour ;
 *  6. la semaine affichée correspond à la date du jour.
 *
 * 📚 Convention : comme pour le Journal et la Progression, les tests
 * utilisent les libellés français de l'UI via getByRole / getByText /
 * getByLabel. Les données de test sont injectées dans le localStorage
 * (clé « sweatbook_plan ») par `seedPlanning()`
 * (tests/helpers/planning.ts) — la source de vérité du Sprint 4.
 */

test.describe('Planning hebdomadaire — Sprint 4', () => {
  /**
   * Test 1 — La page Planning se charge.
   * Depuis la racine, cliquer sur l'onglet « Planning » de la navigation
   * affiche la page avec son titre « 🗓️ Planning de la semaine ». On
   * vérifie aussi que le serveur répond bien 200.
   */
  test('la page planning se charge', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status(), 'GET / doit répondre 200').toBe(200);

    // Aller à la page Planning via la navigation principale
    await openPlanning(page);

    // Le titre de la section est visible
    await expect(
      page.getByRole('heading', { name: /planning de la semaine/i }),
      'titre « 🗓️ Planning de la semaine » affiché',
    ).toBeVisible();

    // La navigation entre les semaines est là aussi
    await expect(
      page.getByRole('button', { name: /précédente/i }),
      'bouton « ◀ Précédente » visible',
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /suivante/i }),
      'bouton « Suivante ▶ » visible',
    ).toBeVisible();
  });

  /**
   * Test 2 — Les 7 jours de la semaine sont affichés.
   * La grille couvre la semaine complète : lundi → dimanche
   * (convention européenne, docs/FUNCTIONAL.md §5.4). Chaque jour a sa
   * carte (« Lun » … « Dim ») et son bouton « + Ajouter » — donc
   * exactement 7 boutons d'ajout à l'écran.
   */
  test('les 7 jours de la semaine sont affichés', async ({ page }) => {
    await page.goto('/');
    await openPlanning(page);

    // Les 7 cartes de jours sont visibles, dans l'ordre lundi → dimanche
    for (let dayIndex = 0; dayIndex < DAY_SHORT_LABELS.length; dayIndex++) {
      await expect(
        dayCard(page, dayIndex).getByText(DAY_SHORT_LABELS[dayIndex], { exact: true }),
        `carte du jour « ${DAY_SHORT_LABELS[dayIndex]} » visible`,
      ).toBeVisible();
    }

    // Une carte par jour : exactement 7 boutons « + Ajouter »
    await expect(
      page.getByRole('button', { name: '+ Ajouter' }),
      'un bouton « + Ajouter » par jour (7 en tout)',
    ).toHaveCount(7);
  });

  /**
   * Test 3 — La navigation entre les semaines fonctionne.
   * Les boutons « ◀ Précédente » et « Suivante ▶ » changent le libellé
   * « Semaine N — … » ; le bouton « Revenir à la semaine en cours »
   * ramène à la semaine du jour. On vérifie aussi qu'une séance
   * planifiée disparaît puis réapparaît avec la navigation : c'est la
   * preuve que les flèches filtrent réellement les données.
   */
  test('la navigation entre les semaines fonctionne (précédente/suivante)', async ({ page }) => {
    // Une séance le mercredi de la semaine en cours (visible au chargement)
    await seedPlanning(page, [
      makePlanEntry({ day_of_week: 2, planned_type: 'force', planned_duration_min: 30 }),
    ]);
    await openPlanning(page);

    // Semaine en cours : libellé exact + séance visible le mercredi
    await expect(
      weekLabel(page),
      'libellé de la semaine en cours',
    ).toHaveText(formatWeekLabel(currentWeekStart()));
    await expect(dayCard(page, 2), 'séance du mercredi visible').toContainText('Force');

    // Semaine suivante : le libellé change, la séance n'est plus affichée
    await navigateWeek(page, 'next');
    await expect(weekLabel(page), 'libellé de la semaine suivante').toHaveText(
      formatWeekLabel(addWeeks(currentWeekStart(), 1)),
    );
    await expect(dayCard(page, 2), 'la séance disparaît sur la semaine suivante').toContainText(
      'Repos',
    );

    // Semaine précédente : retour à la semaine initiale, séance de retour
    await navigateWeek(page, 'previous');
    await expect(weekLabel(page), 'retour à la semaine initiale').toHaveText(
      formatWeekLabel(currentWeekStart()),
    );
    await expect(dayCard(page, 2), 'la séance réapparaît').toContainText('Force');

    // Le bouton « Revenir à la semaine en cours » fonctionne aussi
    await navigateWeek(page, 'next');
    await navigateWeek(page, 'today');
    await expect(weekLabel(page), '« Revenir à la semaine en cours » ramène au bon jour').toHaveText(
      formatWeekLabel(currentWeekStart()),
    );
  });

  /**
   * Test 4 — Le formulaire de planification s'affiche.
   * La carte « ➕ Planifier une séance » contient le formulaire de
   * PlanSessionForm.tsx : les champs « Jour » (7 jours), « Type »
   * (Course / Force / Tennis), « Durée prévue (min) », « Notes » et le
   * bouton « Planifier la séance ».
   */
  test('le formulaire de planification s’affiche', async ({ page }) => {
    await page.goto('/');
    await openPlanning(page);

    // Le titre de la carte du formulaire
    await expect(
      page.getByRole('heading', { name: /planifier une séance/i }),
      'carte « ➕ Planifier une séance » visible',
    ).toBeVisible();

    // 💡 Les champs sont cherchés DANS le formulaire : /^jour/i confondrait
    // sinon le champ « Jour » avec le lien « Journal » de la navigation.
    const form = planForm(page);

    // Les champs du formulaire sont tous là
    await expect(form.getByLabel(/^jour/i), 'champ « Jour » visible').toBeVisible();
    await expect(form.getByLabel(/^type/i), 'champ « Type » visible').toBeVisible();
    await expect(
      form.getByLabel(/durée prévue/i),
      'champ « Durée prévue (min) » visible',
    ).toBeVisible();
    await expect(form.getByLabel(/^notes/i), 'champ « Notes » visible').toBeVisible();

    // Le champ « Jour » propose les 7 jours de la semaine (lundi → dimanche)
    await expect(
      form.getByLabel(/^jour/i).locator('option'),
      '7 jours proposés dans le menu « Jour »',
    ).toHaveCount(7);

    // Le bouton d'enregistrement est là
    await expect(
      page.getByRole('button', { name: /planifier la séance/i }),
      'bouton « Planifier la séance » visible',
    ).toBeVisible();
  });

  /**
   * Test 5 — Planifier une séance ajoute une carte dans le bon jour.
   * Parcours complet : « + Ajouter » sur la carte du Mardi préremplit le
   * formulaire sur ce jour ; on choisit « Course » et 45 minutes, on
   * valide, et la séance apparaît dans la case du mardi (et seulement
   * là). Un rechargement de la page la conserve : la persistance
   * localStorage fonctionne.
   */
  test('planifier une séance ajoute une carte dans le bon jour', async ({ page }) => {
    await page.goto('/');
    await openPlanning(page);

    // 1. « + Ajouter » dans la case du Mardi préremplit le formulaire
    await dayCard(page, 1).getByRole('button', { name: '+ Ajouter' }).click();
    const form = planForm(page); // champs ciblés dans le formulaire (voir test 4)
    await expect(
      form.getByLabel(/^jour/i),
      'le formulaire est ciblé sur le mardi (jour n° 1)',
    ).toHaveValue('1');

    // 2. Choisit « Course » et une durée prévue de 45 minutes
    await form.getByLabel(/^type/i).selectOption('course');
    await form.getByLabel(/durée prévue/i).fill('45');
    await page.getByRole('button', { name: /planifier la séance/i }).click();

    // 3. La carte de la séance apparaît dans la case du MARDI — et pas ailleurs
    await expect(
      dayCard(page, 1),
      'la séance « Course » est dans la case du mardi',
    ).toContainText('Course');
    await expect(dayCard(page, 1), 'avec sa durée prévue').toContainText('45 min');
    await expect(
      dayCard(page, 0),
      'la case du lundi est toujours au repos',
    ).toContainText('Repos');

    // 4. La séance est persistée : elle survit au rechargement de la page
    await page.reload();
    await openPlanning(page);
    await expect(
      dayCard(page, 1),
      'la séance planifiée est toujours là après rechargement',
    ).toContainText('Course');
  });

  /**
   * Test 6 — La semaine affichée correspond à la date du jour.
   * Au chargement, le Planning affiche la semaine EN COURS : le libellé
   * « Semaine N — … » porte le numéro de semaine d'aujourd'hui, et les
   * dates des 7 cartes couvrent bien les 7 jours autour de la date du
   * jour (lundi → dimanche).
   */
  test('la semaine affichée correspond à la date du jour', async ({ page }) => {
    await page.goto('/');
    await openPlanning(page);

    // Le libellé affiche exactement la semaine en cours
    await expect(
      weekLabel(page),
      'libellé « Semaine N — … » de la semaine du jour',
    ).toHaveText(formatWeekLabel(currentWeekStart()));

    // Chaque carte affiche bien la date attendue de son jour (ex. « 15 oct »)
    const monday = currentWeekStart();
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      await expect(
        dayCard(page, dayIndex),
        `la carte ${DAY_SHORT_LABELS[dayIndex]} affiche la bonne date`,
      ).toContainText(formatDayDate(addDays(monday, dayIndex)));
    }

    // La date du jour fait bien partie de la semaine affichée
    await expect(
      page.getByText(formatDayDate(new Date()), { exact: true }),
      'la date du jour apparaît dans la grille',
    ).toHaveCount(1);
  });
});
