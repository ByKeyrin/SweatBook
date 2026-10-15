import { expect, type Locator, type Page } from '@playwright/test';
import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Helpers de test E2E pour le Planning hebdomadaire (Sprint 4).
 *
 * 📚 Pédagogie : la page Planning lit les séances planifiées dans le
 * localStorage (clé `sweatbook_plan`, cf. client/src/hooks/usePlanning.ts).
 * `seedPlanning()` écrit directement un jeu de données de test dans le
 * localStorage puis recharge la page — plus rapide que de remplir le
 * formulaire pour chaque séance, et ça permet de fabriquer des séances
 * sur d'AUTRES semaines (pour tester la navigation).
 *
 * 📝 Contrat d'interface (composants de features/planning/) :
 *  - navigation : lien « Planning » (onglet de App.tsx) ;
 *  - titre de page : « 🗓️ Planning de la semaine » (carte) ;
 *  - navigation de semaine (WeekNav.tsx) : boutons « ◀ Précédente »,
 *    « Suivante ▶ » et « Revenir à la semaine en cours », avec un
 *    libellé « Semaine N — 12 au 18 octobre » ;
 *  - 7 cartes jour (DayCard.tsx) « Lun » … « Dim » + date « 12 oct »,
 *    mention « Repos » si rien n'est planifié, bouton « + Ajouter » ;
 *  - formulaire (PlanSessionForm.tsx) dans la carte
 *    « ➕ Planifier une séance » : champs « Jour » (Lundi…Dimanche),
 *    « Type » (Course / Force / Tennis), « Durée prévue (min) »,
 *    « Notes » et bouton « Planifier la séance » ;
 *  - une séance planifiée s'affiche avec son type (« Course »…) et sa
 *    durée (« 45 min »).
 *
 * ⚠️ Si un de ces libellés change dans l'UI, il faut mettre à jour ce helper.
 */

/** Clé du localStorage utilisée par usePlanning (la source de vérité). */
export const PLAN_STORAGE_KEY = 'sweatbook_plan';

/** Les types de séance planifiée autorisés (client/src/types/index.ts). */
export const PLANNED_TYPES = ['course', 'force', 'tennis'] as const;

/** Les 7 jours abrégés affichés dans la grille (DayCard.tsx). */
export const DAY_SHORT_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

/** Une séance planifiée de test — mêmes noms de champs que usePlanning. */
export interface PlanData {
  id: number;
  week_start: string; // AAAA-MM-JJ, le lundi de la semaine
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = lundi … 6 = dimanche
  planned_type: (typeof PLANNED_TYPES)[number];
  planned_duration_min: number;
  notes?: string;
}

/** Les valeurs acceptées par navigateWeek(). */
export type WeekDirection = 'previous' | 'next' | 'today';

/**
 * Retourne le lundi de la semaine en cours.
 * 💡 `weekStartsOn: 1` = la semaine commence le lundi (convention
 * européenne, docs/FUNCTIONAL.md §5.4) — même règle que usePlanning.
 */
export function currentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

/**
 * Retourne la date du lundi d'une semaine au format ISO (AAAA-MM-JJ).
 * @param {number} [offsetWeeks=0] - décalage en semaines (0 = semaine en cours)
 * @returns {string} Le lundi de la semaine visée
 */
export function weekStartIso(offsetWeeks = 0): string {
  return format(addWeeks(currentWeekStart(), offsetWeeks), 'yyyy-MM-dd');
}

/**
 * Reproduit le libellé de semaine affiché par WeekNav.tsx
 * (ex. « Semaine 42 — 12 au 18 octobre »).
 * @param {Date} weekStart - Le lundi de la semaine
 * @returns {string} Le libellé attendu à l'écran
 */
export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const weekNumber = Number(format(weekStart, 'I', { locale: fr }));
  const sameMonth = format(weekStart, 'yyyy-MM') === format(weekEnd, 'yyyy-MM');
  const range = sameMonth
    ? `${format(weekStart, 'd')} au ${format(weekEnd, 'd MMMM', { locale: fr })}`
    : `${format(weekStart, 'd MMMM', { locale: fr })} au ${format(weekEnd, 'd MMMM', { locale: fr })}`;
  return `Semaine ${weekNumber} — ${range}`;
}

/**
 * Reproduit le libellé de date affiché dans une carte jour (DayCard.tsx),
 * ex. « 12 oct ».
 * @param {Date} date - La date du jour
 * @returns {string} Le libellé attendu à l'écran
 */
export function formatDayDate(date: Date): string {
  return format(date, 'd MMM', { locale: fr });
}

/**
 * Crée une séance planifiée valide pour les tests.
 * On peut surcharger un ou plusieurs champs :
 *
 *   makePlanEntry()                              → course de 45 min le lundi
 *   makePlanEntry({ day_of_week: 2 })            → mercredi
 *   makePlanEntry({ week_start: weekStartIso(1) }) → semaine suivante
 *
 * @param {Partial<PlanData>} overrides - Champs à remplacer
 * @returns {PlanData} Une séance planifiée prête à injecter
 */
export function makePlanEntry(overrides: Partial<PlanData> = {}): PlanData {
  return {
    id: 1,
    week_start: weekStartIso(0), // le lundi de la semaine en cours
    day_of_week: 0,
    planned_type: 'course',
    planned_duration_min: 45,
    notes: 'Séance planifiée depuis les tests',
    ...overrides,
  };
}

/**
 * Jeu de données de test « standard » :
 *  - lundi de la semaine en cours : 45 min de course (visible au chargement) ;
 *  - mercredi de la semaine en cours : 30 min de force ;
 *  - dimanche de la SEMAINE SUIVANTE : 60 min de tennis (invisible tant
 *    qu'on n'a pas navigué — pratique pour tester les flèches).
 *
 * @returns {PlanData[]} Les séances de test
 */
export function makeSeedPlans(): PlanData[] {
  return [
    makePlanEntry({ id: 1, day_of_week: 0, planned_type: 'course', planned_duration_min: 45 }),
    makePlanEntry({ id: 2, day_of_week: 2, planned_type: 'force', planned_duration_min: 30 }),
    makePlanEntry({
      id: 3,
      week_start: weekStartIso(1),
      day_of_week: 6,
      planned_type: 'tennis',
      planned_duration_min: 60,
    }),
  ];
}

/**
 * Injecte des séances planifiées dans le localStorage, puis recharge la
 * page pour que l'app les lise — exactement comme si l'utilisateur les
 * avait créées via le formulaire « ➕ Planifier une séance ».
 *
 * @param {Page} page - La page Playwright à préparer
 * @param {PlanData[]} [plans] - Les séances à injecter (défaut : makeSeedPlans())
 * @returns {Promise<void>} Se résout quand la page a rechargé les données
 *
 * @example
 *   await seedPlanning(page);                          // jeu standard
 *   await seedPlanning(page, [makePlanEntry({ day_of_week: 4 })]); // 1 seule séance
 *   await openPlanning(page);
 */
export async function seedPlanning(page: Page, plans: PlanData[] = makeSeedPlans()): Promise<void> {
  // 1. Ouvrir l'app d'abord : le localStorage est lié à l'origine (localhost)
  await page.goto('/');

  // 2. Écrire les séances planifiées dans le localStorage du navigateur
  await page.evaluate(
    (pair: [string, unknown]) => {
      window.localStorage.setItem(pair[0], JSON.stringify(pair[1]));
    },
    [PLAN_STORAGE_KEY, plans] as [string, unknown],
  );

  // 3. Recharger : React relit le localStorage au premier rendu
  await page.reload();
}

/**
 * Ouvre la page Planning via la navigation principale.
 *
 * @param {Page} page - La page Playwright, déjà chargée sur l'app
 * @returns {Promise<void>} Se résout quand le titre « 🗓️ Planning de la semaine » est visible
 */
export async function openPlanning(page: Page): Promise<void> {
  await page.getByRole('navigation').getByRole('link', { name: /planning/i }).click();
  await page
    .getByRole('heading', { name: /planning de la semaine/i })
    .waitFor({ state: 'visible' });
}

/**
 * Retourne le libellé de la semaine affichée (« Semaine N — … »).
 * @param {Page} page - La page Playwright, sur le Planning
 * @returns {Locator} Le paragraphe du libellé de semaine
 */
export function weekLabel(page: Page): Locator {
  return page.getByText(/semaine \d+ —/i).first();
}

/**
 * Retourne la carte d'un jour de la grille (composant DayCard).
 * Le nom du jour (« Lun »…) est dans le haut de la carte : on remonte
 * de deux niveaux (titre > en-tête > carte) pour obtenir la carte entière.
 *
 * @param {Page} page - La page Playwright, sur le Planning
 * @param {number} dayIndex - 0 = lundi … 6 = dimanche
 * @returns {Locator} Le conteneur de la carte du jour
 *
 * @example
 *   await expect(dayCard(page, 0)).toContainText('Course'); // lundi
 */
export function dayCard(page: Page, dayIndex: number): Locator {
  return page.getByText(DAY_SHORT_LABELS[dayIndex], { exact: true }).locator('xpath=../..');
}

/**
 * Retourne le formulaire « ➕ Planifier une séance » (PlanSessionForm).
 *
 * 💡 Pourquoi le cibler ? Les champs « Jour » et « Type » se cherchent
 * avec getByLabel(/^jour/i)… mais /^jour/i confondrait le champ « Jour »
 * avec le lien « Journal » de la navigation (aria-label). En restreignant
 * la recherche au formulaire, les sélecteurs restent uniques.
 *
 * @param {Page} page - La page Playwright, sur le Planning
 * @returns {Locator} L'élément <form> du formulaire de planification
 */
export function planForm(page: Page): Locator {
  return page.locator('form');
}

/**
 * Navigue entre les semaines du planning avec les boutons de WeekNav.
 *
 * @param {Page} page - La page Playwright, sur le Planning
 * @param {WeekDirection} direction - 'previous' (◀ Précédente),
 *   'next' (Suivante ▶) ou 'today' (Revenir à la semaine en cours)
 * @returns {Promise<void>} Se résout quand la nouvelle semaine est affichée
 *
 * @example
 *   await navigateWeek(page, 'next');     // semaine suivante
 *   await navigateWeek(page, 'today');    // retour à la semaine en cours
 */
export async function navigateWeek(page: Page, direction: WeekDirection): Promise<void> {
  const buttons: Record<WeekDirection, RegExp> = {
    previous: /précédente/i,
    next: /suivante/i,
    today: /semaine en cours/i,
  };

  const before = await weekLabel(page).textContent();
  await page.getByRole('button', { name: buttons[direction] }).click();

  if (direction === 'today') {
    // On retombe toujours sur le libellé exact de la semaine en cours
    await expect(weekLabel(page)).toHaveText(formatWeekLabel(currentWeekStart()));
  } else {
    // Le libellé doit avoir changé (précédente ↔ suivante)
    await expect(weekLabel(page)).not.toHaveText(before ?? '');
  }
}
