/**
 * ============================================================
 *  Tests API — 🏃 Suivi running (tests/api/running.test.js)
 * ============================================================
 *
 *  Contrat testé :
 *     GET /api/running → 200 : statistiques coureur
 *        { total_km, total_duration_min, session_count,
 *          avg_min_per_km, vma_kmh }
 *
 *  Le « suivi running » couvre (docs/FUNCTIONAL.md §4.4) :
 *   - total : kilomètres cumulés, temps total, nombre de sorties ;
 *   - allure moyenne globale (min/km) ;
 *   - VMA estimée.
 *
 *  📌 Règles métier testées (docs/FUNCTIONAL.md §5.1) :
 *     allure_globale = durée_totale (min) ÷ distance_totale (km)
 *       (une allure PONDÉRÉE par la distance — jamais la moyenne des allures)
 *     VMA_estimée ≈ vitesse_max_sur_fractionné × 1,05
 *
 *  🚀 Lancer ces tests : `cd server && npm run dev` puis `npm test -- --run`.
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { apiGet, apiPost, apiDelete, makeSession } from '../helpers/test-utils.js';

// Fixtures : 10 km faciles + 5 km de fractionné (pour la VMA),
// supprimées à la fin des tests.
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
  test('renvoie 200 et les statistiques attendues', async () => {
    const { status, body } = await apiGet('/running');

    expect(status).toBe(200);
    expect(body).toBeTypeOf('object');

    // Champs attendus (docs/FUNCTIONAL.md §4.4) :
    expect(body).toHaveProperty('total_km');           // kilomètres cumulés
    expect(body).toHaveProperty('total_duration_min'); // temps total
    expect(body).toHaveProperty('session_count');      // nombre de sorties
    expect(body).toHaveProperty('avg_min_per_km');     // allure moyenne globale
    expect(body).toHaveProperty('vma_kmh');            // VMA estimée
  });

  test('compte les kilomètres, le temps et les séances', async () => {
    const { body } = await apiGet('/running');

    // Nos 2 fixtures font 15 km / 85 min — la base peut contenir d'autres
    // séances, donc on vérifie un minimum, pas une valeur exacte.
    expect(body.total_km).toBeGreaterThanOrEqual(15);
    expect(body.session_count).toBeGreaterThanOrEqual(2);
    expect(body.total_duration_min).toBeGreaterThanOrEqual(85);
  });

  test('calcule l\'allure globale pondérée (durée totale ÷ distance totale)', async () => {
    const { body } = await apiGet('/running');

    // Règle 5.1 : on ne fait PAS la moyenne des allures,
    // mais durée_totale ÷ distance_totale.
    const expectedPace = body.total_duration_min / body.total_km;
    expect(body.avg_min_per_km).toBeCloseTo(expectedPace, 1);
  });

  test('estime la VMA à partir du fractionné (vitesse max × 1,05)', async () => {
    const { body } = await apiGet('/running');

    // Notre fixture de fractionné : 5 km en 25 min = 12 km/h
    // → VMA estimée ≥ 12 × 1,05 = 12,6 km/h (règle 5.1).
    expect(body.vma_kmh).toBeGreaterThanOrEqual(12.6);
  });
});
