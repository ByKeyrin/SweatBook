import type { Page } from '@playwright/test';
import type { SessionData } from './session';
import { daysAgo, makeSession } from './session';

/**
 * Helpers de test E2E pour les Graphiques de progression (Sprint 3).
 *
 * 📚 Pédagogie : la page Progression lit les séances dans le localStorage
 * (clé `sweatbook.sessions`, cf. client/src/hooks/useSessions.ts). Plutôt que
 * de créer les séances une par une via le formulaire du Journal, ce module
 * écrit directement un jeu de données de test DANS le localStorage, puis
 * recharge la page pour que l'app les lise au démarrage. C'est plus rapide,
 * et ça permet de fabriquer des séances très anciennes (il y a 80 jours) que
 * le formulaire rendrait pénible à saisir.
 *
 * 📝 Contrat d'interface (composants de features/progression/) :
 *  - navigation : lien « Progression » (aria-label « Progression — Graphiques ») ;
 *  - titre de page : « 📈 Progression » ;
 *  - 4 cartes de stats (titres) : « Distance totale », « Séances »,
 *    « Allure moyenne », « FC moyenne » ;
 *  - graphique distance : titre « 📈 Distance — N derniers jours »,
 *    role="img" avec aria-label « Graphique de la distance par jour » ;
 *  - graphique durée : titre « ⏱️ Durée — N derniers jours »,
 *    role="img" avec aria-label « Graphique de la durée par jour » ;
 *  - filtre de période : role="group" « Filtrer par période » contenant les
 *    boutons « 7 jours », « 30 jours », « 90 jours » (30 par défaut) ;
 *  - état vide des graphiques : « Aucune séance sur cette période. ».
 *
 * ⚠️ Si un de ces libellés change dans l'UI, il faut mettre à jour ce helper.
 */

/** Clé du localStorage utilisée par useSessions (la source de vérité). */
export const STORAGE_KEY = 'sweatbook.sessions';

/** Les périodes proposées par le filtre de la page Progression (en jours). */
export const PERIODS = [7, 30, 90] as const;

/**
 * Jeu de données de test « standard » : 8 séances réparties sur 90 jours.
 *
 * La répartition est choisie pour que chaque filtre de période ait un effet
 * VISIBLE et vérifiable :
 *  - 3 séances dans les 7 derniers jours  → visibles avec le filtre « 7 jours » ;
 *  - 2 séances supplémentaires dans les 30 derniers jours ;
 *  - 2 séances supplémentaires dans les 90 derniers jours ;
 *  - 1 séance vieille de 120 jours        → jamais visible (hors 90 jours).
 *
 * @returns {SessionData[]} Les séances de test (sans id, seedSessions les ajoute)
 */
export function makeSeedSessions(): SessionData[] {
  return [
    makeSession({ date: daysAgo(1), distance_km: 10, duration_min: 55 }),
    makeSession({ date: daysAgo(3), distance_km: 8, duration_min: 45 }),
    makeSession({ date: daysAgo(6), distance_km: 12, duration_min: 60 }),
    makeSession({ date: daysAgo(15), distance_km: 15, duration_min: 80 }),
    makeSession({ date: daysAgo(25), distance_km: 7, duration_min: 40 }),
    makeSession({ date: daysAgo(45), distance_km: 21.1, duration_min: 115 }),
    makeSession({ date: daysAgo(70), distance_km: 9, duration_min: 50 }),
    makeSession({ date: daysAgo(80), distance_km: 6, duration_min: 35 }),
    // Hors période : ne doit apparaître avec aucun filtre (7/30/90 jours)
    makeSession({ date: daysAgo(120), distance_km: 99, duration_min: 99 }),
  ];
}

/**
 * Injecte des séances de test dans le localStorage, puis recharge la page pour
 * que l'app les lise — exactement comme si l'utilisateur les avait créées via
 * le Journal (persistance `sweatbook.sessions`).
 *
 * 💡 Pourquoi « goto + écriture + reload » plutôt que addInitScript ?
 * Un script d'initialisation se ré-exécuterait à CHAQUE navigation et
 * ré-écrirait le localStorage, ce qui empêcherait de tester la suppression
 * des données. Ici, l'écriture est ponctuelle : le test reste maître du
 * localStorage.
 *
 * @param {Page} page - La page Playwright à préparer
 * @param {SessionData[]} sessions - Les séances à injecter (défaut : makeSeedSessions())
 * @returns {Promise<void>} Se résout quand la page a rechargé les données
 *
 * @example
 *   await seedSessions(page);                          // jeu standard 90 jours
 *   await seedSessions(page, [makeSession({ date: daysAgo(20) })]); // 1 seule séance
 *   await openProgression(page);
 */
export async function seedSessions(
  page: Page,
  sessions: SessionData[] = makeSeedSessions(),
): Promise<void> {
  // Chaque séance reçoit un id unique, comme le ferait useSessions.addSession()
  const withIds = sessions.map((s, i) => ({ id: i + 1, ...s }));

  // 1. Ouvrir l'app d'abord : le localStorage est lié à l'origine (localhost)
  await page.goto('/');

  // 2. Écrire les séances dans le localStorage du navigateur
  await page.evaluate(
    ([key, value]: [string, unknown]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    [STORAGE_KEY, withIds] as [string, unknown],
  );

  // 3. Recharger : React relit le localStorage au premier rendu
  await page.reload();
}

/**
 * Ouvre la page Progression via la navigation principale.
 * Le lien porte l'aria-label « Progression — Graphiques » (App.tsx).
 *
 * @param {Page} page - La page Playwright, déjà chargée sur l'app
 * @returns {Promise<void>} Se résout quand le titre « 📈 Progression » est visible
 */
export async function openProgression(page: Page): Promise<void> {
  await page.getByRole('navigation').getByRole('link', { name: /progression/i }).click();
  await page.getByRole('heading', { name: /progression/i }).first().waitFor({ state: 'visible' });
}
