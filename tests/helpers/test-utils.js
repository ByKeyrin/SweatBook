/**
 * ============================================================
 *  Utilitaires de test partagés — SweatBook
 * ============================================================
 *
 *  Ce fichier contient des fonctions réutilisées par les tests :
 *   - les tests E2E  (tests/e2e/*.spec.js)  → navigation, formulaire
 *   - les tests API  (tests/api/*.test.js)  → appels HTTP vers l'API
 *
 *  💡 Pourquoi un fichier partagé ?
 *  Quand un sélecteur ou une URL change, on le corrige à UN seul endroit
 *  au lieu de tous les fichiers de test.
 */

// ------------------------------------------------------------
// Constantes
// ------------------------------------------------------------

/** URL de base de l'API. Surchargeable avec la variable d'env API_URL. */
export const API_BASE = process.env.API_URL ?? 'http://localhost:3001/api';

/** Les 5 types de sortie autorisés (voir docs/TECHNICAL.md, table `sessions`). */
export const SESSION_TYPES = ['easy', 'long', 'interval', 'tempo', 'recovery'];

// ------------------------------------------------------------
// Fabriques de données ("factories")
// ------------------------------------------------------------

/**
 * Crée un objet séance valide pour les tests.
 * On peut surcharger un champ : makeSession({ distance_km: 3 })
 *
 * Les valeurs par défaut respectent les règles métier (docs/FUNCTIONAL.md §5.2) :
 * date non future, distance > 0, durée > 0...
 */
export function makeSession(overrides = {}) {
  return {
    date: '2026-10-12', // un lundi, format ISO (AAAA-MM-JJ)
    type: 'long',
    distance_km: 15.5,
    duration_min: 82,
    avg_hr: 150,
    feeling: 4,
    notes: 'Sortie longue au bord de la Loire',
    ...overrides,
  };
}

// ------------------------------------------------------------
// Helpers API (pour tests/api/*.test.js)
// ------------------------------------------------------------

/**
 * GET vers l'API. Retourne { status, body }.
 * Exemple : const { status, body } = await apiGet('/sessions');
 */
export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return { status: res.status, body: await readBody(res) };
}

/**
 * POST vers l'API avec un corps JSON. Retourne { status, body }.
 * Exemple : const { status, body } = await apiPost('/sessions', makeSession());
 */
export async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await readBody(res) };
}

/**
 * PUT vers l'API (modification). Retourne { status, body }.
 */
export async function apiPut(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await readBody(res) };
}

/**
 * DELETE vers l'API. Retourne { status, body }.
 * (Une réponse 204 "No Content" n'a pas de corps JSON.)
 */
export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return { status: res.status, body: await readBody(res) };
}

/** Lit le corps d'une réponse : JSON si possible, sinon null. */
async function readBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ------------------------------------------------------------
// Helpers E2E (pour tests/e2e/*.spec.js)
// ------------------------------------------------------------

/**
 * Navigue vers une page de l'app en cliquant dans la barre de navigation.
 *
 * Convention d'interface (voir docs/TECHNICAL.md §6) :
 * la Navbar contient 3 liens : « Journal », « Graphiques », « Planning ».
 *
 * @param {import('@playwright/test').Page} page
 * @param {'journal' | 'progression' | 'planning'} destination
 */
export async function navigateTo(page, destination) {
  const linkNames = {
    journal: /journal/i,
    progression: /graphiques/i,
    planning: /planning/i,
  };
  await page.getByRole('link', { name: linkNames[destination] }).first().click();
}

/**
 * Ouvre le formulaire « Nouvelle séance » (page Journal).
 * @param {import('@playwright/test').Page} page
 */
export async function openSessionForm(page) {
  await page.getByRole('button', { name: /nouvelle séance/i }).click();
}

/**
 * Remplit le formulaire d'une séance et clique sur « Enregistrer ».
 *
 * Les champs sont repérés par leur <label> (voir docs/FUNCTIONAL.md §4.1) :
 * Date, Type de sortie, Distance (km), Durée (min) — le reste est facultatif.
 *
 * @param {import('@playwright/test').Page} page
 * @param {ReturnType<typeof makeSession>} session
 */
export async function fillSessionForm(page, session) {
  await page.getByLabel(/^date/i).fill(session.date);

  // <select> : la valeur est le code interne (easy/long/interval/tempo/recovery)
  // On précise « type de sortie » pour ne pas confondre avec le
  // champ « type de séance prévue » du Planning.
  await page.getByLabel(/type de sortie/i).selectOption(session.type);

  await page.getByLabel(/distance \(km\)/i).fill(String(session.distance_km));
  await page.getByLabel(/durée/i).fill(String(session.duration_min));

  if (session.avg_hr !== undefined) {
    await page.getByLabel(/fréquence cardiaque/i).fill(String(session.avg_hr));
  }
  if (session.feeling !== undefined) {
    await page.getByLabel(/ressenti/i).fill(String(session.feeling));
  }
  if (session.notes !== undefined) {
    await page.getByLabel(/notes/i).fill(session.notes);
  }

  await page.getByRole('button', { name: /enregistrer/i }).click();
}
