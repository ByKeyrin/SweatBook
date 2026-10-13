/**
 * ============================================================
 *  Tests API — 📅 Planning hebdomadaire (tests/api/plan.test.js)
 * ============================================================
 *
 *  Contrat testé (docs/TECHNICAL.md §5.2) :
 *     GET    /api/plan/:weekStart → 200 : PlanEntry[]
 *     POST   /api/plan            → 201 : PlanEntry | 400
 *     PUT    /api/plan/:id        → 200 : PlanEntry | 400 / 404
 *     DELETE /api/plan/:id        → 204             | 404
 *
 *  Règles métier testées (docs/FUNCTIONAL.md §5.3) :
 *     - la semaine est identifiée par sa date de lundi (week_start) ;
 *     - une seule entrée par jour (« Repos » exclut une séance) ;
 *     - day_of_week entre 0 (lundi) et 6 (dimanche) ;
 *     - on peut planifier une semaine future OU passée.
 *
 *  🚀 Lancer ces tests : `cd server && npm run dev` puis `npm test -- --run`.
 */
import { describe, test, expect, afterAll } from 'vitest';
import { apiGet, apiPost, apiPut, apiDelete, makePlanEntry } from '../helpers/test-utils.js';

const createdIds = [];
afterAll(async () => {
  for (const id of createdIds) {
    await apiDelete(`/plan/${id}`);
  }
});

describe('API plan — lecture', () => {
  test('GET /api/plan/:weekStart renvoie les entrées de la semaine', async () => {
    const entry = makePlanEntry({ week_start: '2026-11-09', day_of_week: 2 });
    const created = await apiPost('/plan', entry);
    expect(created.status).toBe(201);
    createdIds.push(created.body.id);

    const { status, body } = await apiGet('/plan/2026-11-09');

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((e) => e.id === created.body.id)).toBe(true);
  });

  test('GET /api/plan/:weekStart ne renvoie que cette semaine', async () => {
    const { body } = await apiGet('/plan/2026-11-09');

    for (const entry of body) {
      expect(entry.week_start).toBe('2026-11-09');
    }
  });
});

describe('API plan — création', () => {
  test('POST /api/plan crée une entrée valide (201)', async () => {
    const payload = makePlanEntry({ week_start: '2026-11-16', day_of_week: 4, planned_type: 'long', planned_km: 18 });
    const { status, body } = await apiPost('/plan', payload);

    expect(status).toBe(201);
    expect(body).toMatchObject({
      week_start: payload.week_start,
      day_of_week: payload.day_of_week,
      planned_type: payload.planned_type,
      planned_km: payload.planned_km,
    });
    expect(body.id).toBeTypeOf('number');

    createdIds.push(body.id);
  });

  test('POST /api/plan accepte une journée « Repos » sans distance', async () => {
    const { status, body } = await apiPost('/plan', {
      week_start: '2026-11-16',
      day_of_week: 5,
      planned_type: 'rest',
    });

    expect(status).toBe(201);
    createdIds.push(body.id);
  });

  test('POST /api/plan accepte une semaine future', async () => {
    // Règle 5.3.5 : planifier dans le futur est autorisé
    const { status, body } = await apiPost('/plan', makePlanEntry({
      week_start: '2027-01-04',
      day_of_week: 0,
    }));

    expect(status).toBe(201);
    createdIds.push(body.id);
  });
});

describe('API plan — validations (docs/FUNCTIONAL.md §5.3)', () => {
  test('refuse un day_of_week hors bornes (0-6)', async () => {
    const { status, body } = await apiPost('/plan', makePlanEntry({ day_of_week: 7 }));

    expect(status).toBe(400);
    expect(body).toHaveProperty('error');
  });

  test('refuse un type planifié inconnu', async () => {
    const { status } = await apiPost('/plan', makePlanEntry({ planned_type: 'marathon' }));

    expect(status).toBe(400);
  });

  test('refuse une distance prévue <= 0', async () => {
    const { status } = await apiPost('/plan', makePlanEntry({ planned_km: -5 }));

    expect(status).toBe(400);
  });

  test('refuse une week_start manquante', async () => {
    const { week_start, ...sansSemaine } = makePlanEntry();
    const { status } = await apiPost('/plan', sansSemaine);

    expect(status).toBe(400);
  });

  test('refuse deux entrées le même jour (une seule entrée par jour)', async () => {
    const week = '2026-11-23';
    const first = await apiPost('/plan', makePlanEntry({ week_start: week, day_of_week: 1 }));
    expect(first.status).toBe(201);
    createdIds.push(first.body.id);

    // Deuxième entrée le même jour → refusée (règle 5.3.2)
    const second = await apiPost('/plan', makePlanEntry({ week_start: week, day_of_week: 1 }));
    expect(second.status).toBe(400);
  });
});

describe('API plan — modification et suppression', () => {
  test('PUT /api/plan/:id modifie une entrée existante', async () => {
    const created = await apiPost('/plan', makePlanEntry({ week_start: '2026-11-30', day_of_week: 3 }));
    createdIds.push(created.body.id);

    const { status, body } = await apiPut(`/plan/${created.body.id}`, {
      planned_type: 'tempo',
      planned_km: 10,
    });

    expect(status).toBe(200);
    expect(body.planned_type).toBe('tempo');
    expect(body.planned_km).toBe(10);
  });

  test('PUT /api/plan/:id renvoie 404 si l\'entrée n\'existe pas', async () => {
    const { status } = await apiPut('/plan/999999', { planned_km: 5 });

    expect(status).toBe(404);
  });

  test('DELETE /api/plan/:id supprime l\'entrée (204)', async () => {
    const created = await apiPost('/plan', makePlanEntry({ week_start: '2026-12-07', day_of_week: 6 }));

    const del = await apiDelete(`/plan/${created.body.id}`);
    expect(del.status).toBe(204);

    // L'entrée a disparu de la semaine
    const { body } = await apiGet('/plan/2026-12-07');
    expect(body.some((e) => e.id === created.body.id)).toBe(false);
  });

  test('DELETE /api/plan/:id renvoie 404 si l\'entrée n\'existe pas', async () => {
    const { status } = await apiDelete('/plan/999999');

    expect(status).toBe(404);
  });
});
