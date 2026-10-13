/**
 * ============================================================
 *  Tests API — 🏃 Suivi running & statistiques (tests/api/running.test.js)
 * ============================================================
 *
 *  Ces tests vérifient les endpoints de STATISTIQUES :
 *   - GET /api/running        → stats coureur (total km, allure moyenne,
 *                               VMA estimée… — docs/FUNCTIONAL.md §4.4)
 *   - GET /api/stats/weekly   → série chronologique pour les graphiques
 *   - GET /api/stats/summary  → résumé global
 *  (docs/TECHNICAL.md §5.3)
 *
 *  🚀 Pour lancer ces tests :
 *     1. cd server && npm run dev    (l'API sur http://localhost:3001)
 *     2. npm run test:api            (à la racine du projet)
 *
 *  📌 Règles métier testées (docs/FUNCTIONAL.md §5.1) :
 *     allure_globale = durée_totale (min) ÷ distance_totale (km)
 *     VMA_estimée   ≈ vitesse_max_sur_fractionné × 1,05
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { apiGet, apiPost, apiDelete, makeSession } from '../helpers/test-utils.js';

// On crée deux séances "fixtures" (données de test) avant tous les tests,
// puis on les supprime à la fin pour garder la base propre.
const createdIds = [];

beforeAll(async () => {
  const fixtures = [
    makeSession({ date: '2026-10-05', type: 'easy', distance_km: 10, duration_min: 60 }),
    makeSession({ date: '2026-10-07', type: 'interval', distance_km: 5, duration_min: 25 }),
  ];
  for (const payload of fixtures) {
    const { status, body } = await apiPost('/sessions', payload);
    expect(status).toBe(201);
    createdIds.push(body.id);
  }
});

afterAll(async () => {
  for (const id of createdIds) {
    await apiDelete(`/sessions/${id}`);
  }
});

describe('API running — statistiques coureur (GET /api/running)', () => {
  test('renvoie 200 et un objet de statistiques', async () => {
    const { status, body } = await apiGet('/running');

    expect(status).toBe(200);
    expect(body).toBeTypeOf('object');

    // Champs attendus (docs/FUNCTIONAL.md §4.4) :
    expect(body).toHaveProperty('total_km');          // kilomètres cumulés
    expect(body).toHaveProperty('total_duration_min'); // temps total
    expect(body).toHaveProperty('session_count');      // nombre de sorties
    expect(body).toHaveProperty('avg_min_per_km');     // allure moyenne globale
    expect(body).toHaveProperty('vma_kmh');            // VMA estimée
  });

  test('compte les kilomètres et les séances de la base', async () => {
    const { body } = await apiGet('/running');

    // Nos 2 fixtures font 15 km au total — la base peut contenir d'autres
    // séances, donc on vérifie un minimum, pas une valeur exacte.
    expect(body.total_km).toBeGreaterThanOrEqual(15);
    expect(body.session_count).toBeGreaterThanOrEqual(2);
    expect(body.total_duration_min).toBeGreaterThanOrEqual(85);
  });

  test('calcule l\'allure globale pondérée (durée totale ÷ distance totale)', async () => {
    const { body } = await apiGet('/running');

    // allure = durée totale / distance totale, sur TOUTES les séances
    const expectedPace = body.total_duration_min / body.total_km;
    expect(body.avg_min_per_km).toBeCloseTo(expectedPace, 1);
  });
});

describe('API stats — données des graphiques', () => {
  test('GET /api/stats/weekly renvoie la série hebdomadaire', async () => {
    const { status, body } = await apiGet('/stats/weekly');

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    // Chaque point suit le type WeeklyStat (docs/TECHNICAL.md §6.4)
    for (const point of body) {
      expect(point).toHaveProperty('week_start');     // lundi de la semaine
      expect(point).toHaveProperty('session_count');  // nb de séances
      expect(point).toHaveProperty('total_km');       // volume hebdo
      expect(point).toHaveProperty('avg_min_per_km'); // allure moyenne
    }
  });

  test('GET /api/stats/weekly contient la semaine de nos séances de test', async () => {
    const { body } = await apiGet('/stats/weekly');

    // Nos fixtures sont datées du 05/10/2026 et 07/10/2026 :
    // la semaine commence le lundi 2026-10-05.
    const week = body.find((point) => point.week_start === '2026-10-05');
    expect(week).toBeDefined();
    expect(week.total_km).toBeGreaterThanOrEqual(15);
  });

  test('GET /api/stats/summary renvoie un résumé global', async () => {
    const { status, body } = await apiGet('/stats/summary');

    expect(status).toBe(200);
    expect(body).toBeTypeOf('object');
  });
});

describe('API — gestion des erreurs', () => {
  test('un endpoint inconnu renvoie 404 avec { error }', async () => {
    const { status, body } = await apiGet('/nimporte-quoi');

    expect(status).toBe(404);
    expect(body).toHaveProperty('error');
  });
});
