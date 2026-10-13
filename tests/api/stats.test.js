/**
 * ============================================================
 *  Tests API — 📈 Statistiques des graphiques (tests/api/stats.test.js)
 * ============================================================
 *
 *  Contrat testé (docs/TECHNICAL.md §5.3) :
 *     GET /api/stats/weekly  → 200 : WeeklyStat[]  (série chronologique)
 *     GET /api/stats/summary → 200 : Summary       (résumé global)
 *
 *  Chaque point suit le type WeeklyStat (docs/TECHNICAL.md §6.4) :
 *     { week_start, session_count, total_km, avg_min_per_km }
 *
 *  📌 Règle testée (docs/FUNCTIONAL.md §5.1) : le volume hebdomadaire
 *  regroupe les séances du lundi au dimanche (semaine = week_start).
 *
 *  🚀 Lancer ces tests : `cd server && npm run dev` puis `npm test -- --run`.
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { apiGet, apiPost, apiDelete, makeSession } from '../helpers/test-utils.js';

// Fixtures : deux séances dans la semaine du lundi 2026-10-05
// (05/10 lundi et 07/10 mercredi), supprimées à la fin des tests.
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

describe('API stats — série hebdomadaire (GET /api/stats/weekly)', () => {
  test('renvoie 200 et une liste de points hebdomadaires', async () => {
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

  test('regroupe les séances par semaine (lundi → dimanche)', async () => {
    const { body } = await apiGet('/stats/weekly');

    // Nos fixtures (05/10 et 07/10) tombent dans la semaine du lundi 2026-10-05
    const week = body.find((point) => point.week_start === '2026-10-05');
    expect(week).toBeDefined();
    expect(week.total_km).toBeGreaterThanOrEqual(15);
    expect(week.session_count).toBeGreaterThanOrEqual(2);
  });

  test('trie les semaines dans l\'ordre chronologique', async () => {
    const { body } = await apiGet('/stats/weekly');

    const weeks = body.map((point) => point.week_start);
    const sorted = [...weeks].sort();
    expect(weeks).toEqual(sorted);
  });
});

describe('API stats — résumé global (GET /api/stats/summary)', () => {
  test('renvoie 200 et un objet de résumé', async () => {
    const { status, body } = await apiGet('/stats/summary');

    expect(status).toBe(200);
    expect(body).toBeTypeOf('object');
    expect(body).toHaveProperty('total_km');
  });
});

describe('API — gestion des erreurs', () => {
  test('un endpoint inconnu renvoie 404 avec { error }', async () => {
    const { status, body } = await apiGet('/nimporte-quoi');

    expect(status).toBe(404);
    expect(body).toHaveProperty('error');
  });
});
