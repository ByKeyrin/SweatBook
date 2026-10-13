import type { Page } from '@playwright/test';

/**
 * Helpers de test E2E pour le Journal des séances (Sprint 2).
 *
 * 📚 Pédagogie : ce module factorise la création de données de test et le
 * remplissage du formulaire, pour que chaque test reste court et lisible.
 *
 * 📝 Contrat d'interface (cf. tests/README.md §5.1) — les tests se basent sur
 * les libellés français de l'app :
 *  - bouton d'ouverture : « + Nouvelle séance » ;
 *  - bouton de soumission : « Enregistrer » ;
 *  - labels du formulaire : « Date », « Type de sortie », « Distance (km) »,
 *    « Durée (min) », « Fréquence cardiaque moyenne », « Ressenti », « Notes » ;
 *  - « Type de sortie » est un <select> avec les valeurs `easy`, `long`,
 *    `interval`, `tempo`, `recovery` ; les autres champs sont des <input> ;
 *  - chaque carte de séance porte `data-testid="session-card"` ;
 *  - les dates s'affichent en JJ/MM/AAAA, les distances avec 1 décimale
 *    (ex. `15,5 km`) — docs/FUNCTIONAL.md §5.4.
 *
 * ⚠️ Si un de ces libellés change dans l'UI, il faut mettre à jour ce helper.
 */

/** Les 5 types de sortie autorisés (docs/TECHNICAL.md, table `sessions`). */
export const SESSION_TYPES = ['easy', 'long', 'interval', 'tempo', 'recovery'] as const;

/** Une séance de test — mêmes noms de champs que l'API (tests/helpers/test-utils.js). */
export interface SessionData {
  date: string; // AAAA-MM-JJ (format base de données)
  type: (typeof SESSION_TYPES)[number];
  distance_km: number;
  duration_min: number;
  avg_hr: number;
  feeling: number; // ressenti, entier 1-5
  notes: string;
}

/**
 * Crée un objet séance valide pour les tests.
 * On peut surcharger un ou plusieurs champs :
 *
 *   makeSession()                          → séance par défaut (15,5 km)
 *   makeSession({ distance_km: 3 })        → 3 km, le reste par défaut
 *   makeSession({ date: daysAgo(7) })      → il y a 7 jours
 *
 * Les valeurs par défaut respectent les règles métier (docs/FUNCTIONAL.md §5.2) :
 * date non future, distance > 0, durée > 0, ressenti entre 1 et 5.
 */
export function makeSession(overrides: Partial<SessionData> = {}): SessionData {
  return {
    date: daysAgo(1), // hier — une date passée est toujours valide
    type: 'long',
    distance_km: 15.5,
    duration_min: 82,
    avg_hr: 150,
    feeling: 4,
    notes: 'Sortie longue au bord de la Loire',
    ...overrides,
  };
}

/**
 * Retourne la date d'il y a `n` jours au format ISO (AAAA-MM-JJ).
 *
 * 💡 Pourquoi calculer la date plutôt qu'en coder une en dur ?
 * Une date fixe finirait par se retrouver « dans le futur » si les tests
 * tournent plus tard, et la validation métier la refuserait.
 */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10); // AAAA-MM-JJ
}

/**
 * Convertit une date ISO (AAAA-MM-JJ) au format d'affichage JJ/MM/AAAA
 * (docs/FUNCTIONAL.md §5.4). Utile pour vérifier ce qui s'affiche à l'écran.
 */
export function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Ouvre le formulaire « Nouvelle séance » sur la page Journal.
 * Cliquer une deuxième fois referme le formulaire (comportement attendu).
 */
export async function openSessionForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: /nouvelle séance/i }).click();
  // Le formulaire est prêt dès que le premier champ (Date) est visible
  await page.getByLabel(/^date/i).waitFor({ state: 'visible' });
}

/**
 * Remplit le formulaire « Nouvelle séance » avec les données fournies.
 * Ne soumet PAS : le test choisit lui-même quand cliquer sur « Enregistrer »
 * (utile pour tester les validations avant soumission).
 *
 * Exemple :
 *   await fillForm(page, makeSession({ distance_km: 5 }));
 *   await page.getByRole('button', { name: /enregistrer/i }).click();
 */
export async function fillForm(page: Page, session: Partial<SessionData> = {}): Promise<void> {
  const s = makeSession(session);

  // Champs texte / numériques : .fill() remplace la valeur existante
  await page.getByLabel(/^date/i).fill(s.date); // les <input type="date"> veulent le format AAAA-MM-JJ
  await page.getByLabel(/type de sortie/i).selectOption(s.type);
  await page.getByLabel(/distance/i).fill(String(s.distance_km));
  await page.getByLabel(/durée/i).fill(String(s.duration_min));
  await page.getByLabel(/fréquence cardiaque/i).fill(String(s.avg_hr));
  await page.getByLabel(/ressenti/i).fill(String(s.feeling));
  await page.getByLabel(/notes/i).fill(s.notes);
}
