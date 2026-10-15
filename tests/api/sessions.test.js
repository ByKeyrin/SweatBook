/**
 * ============================================================
 *  Tests API — CRUD des séances (tests/api/sessions.test.js)
 * ============================================================
 *
 *  🎓 C'est quoi un test API ?
 *  On envoie de VRAIES requêtes HTTP à l'API SweatBook (le serveur
 *  Express) et on vérifie les réponses : code de statut + corps JSON.
 *  Pas de navigateur ici — uniquement le "coulisses" de l'app.
 *
 *  🚀 Pour lancer ces tests :
 *     1. cd server && npm run dev    (l'API sur http://localhost:3001)
 *     2. npm test -- --run           (à la racine du projet)
 *
 *  📖 Contrat testé (docs/TECHNICAL.md §5.1) :
 *     GET    /api/sessions      → 200 : Session[]
 *     GET    /api/sessions/:id  → 200 : Session | 404
 *     POST   /api/sessions      → 201 : Session  | 400
 *     PUT    /api/sessions/:id  → 200 : Session  | 400 / 404
 *     DELETE /api/sessions/:id  → 204           | 404
 *
 *  Codes HTTP utiles à connaître :
 *     200 = OK · 201 = créé · 204 = supprimé (sans contenu)
 *     400 = requête invalide (erreur de l'utilisateur)
 *     404 = ressource introuvable
 */
import { describe as vitestDescribe, test, expect, afterAll } from 'vitest';
import { apiGet, apiPost, apiPut, apiDelete, makeSession, API_READY } from '../helpers/test-utils.js';

// ⏭️ Skip conditionnel (Sprint 5) : tant que le backend n'existe pas,
//    la suite entière est ignorée au lieu d'échouer en ECONNREFUSED.
//    Voir la détection du serveur dans tests/helpers/test-utils.js.
const describe = vitestDescribe.skipIf(!API_READY);

// Ids des séances créées pendant les tests, pour les supprimer à la fin
// (on garde la base propre !).
const createdIds = [];
afterAll(async () => {
  for (const id of createdIds) {
    await apiDelete(`/sessions/${id}`);
  }
});

describe('API sessions — lecture', () => {
  test('GET /api/sessions renvoie 200 et une liste de séances', async () => {
    const { status, body } = await apiGet('/sessions');

    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test('GET /api/sessions/:id renvoie une séance existante', async () => {
    // On crée d'abord une séance, pour être sûr qu'il en existe une
    const created = await apiPost('/sessions', makeSession());
    expect(created.status).toBe(201);
    createdIds.push(created.body.id);

    const { status, body } = await apiGet(`/sessions/${created.body.id}`);

    expect(status).toBe(200);
    expect(body.id).toBe(created.body.id);
    expect(body.distance_km).toBe(15.5);
  });

  test('GET /api/sessions/:id renvoie 404 si la séance n\'existe pas', async () => {
    const { status, body } = await apiGet('/sessions/999999');

    expect(status).toBe(404);
    // Toute erreur API a la forme { "error": "message" }
    expect(body).toHaveProperty('error');
  });
});

describe('API sessions — création', () => {
  test('POST /api/sessions crée une séance valide (201)', async () => {
    const payload = makeSession();
    const { status, body } = await apiPost('/sessions', payload);

    expect(status).toBe(201);
    // La séance créée reprend les données envoyées + un id
    expect(body).toMatchObject({
      date: payload.date,
      type: payload.type,
      distance_km: payload.distance_km,
      duration_min: payload.duration_min,
    });
    expect(body.id).toBeTypeOf('number');

    createdIds.push(body.id);
  });

  test('POST /api/sessions accepte les champs optionnels vides', async () => {
    // avg_hr, feeling et notes sont facultatifs (docs/FUNCTIONAL.md §4.1)
    const { status, body } = await apiPost('/sessions', {
      date: '2026-10-11',
      type: 'recovery',
      distance_km: 4,
      duration_min: 25,
    });

    expect(status).toBe(201);
    expect(body.id).toBeTypeOf('number');

    createdIds.push(body.id);
  });
});

describe('API sessions — validations (docs/FUNCTIONAL.md §5.2)', () => {
  // 💡 Chaque test envoie une séance "cassée" et attend un 400
  //    avec un message d'erreur clair { "error": "..." }.

  test('refuse une date manquante', async () => {
    const { date, ...sansDate } = makeSession();
    const { status, body } = await apiPost('/sessions', sansDate);

    expect(status).toBe(400);
    expect(body).toHaveProperty('error');
  });

  test('refuse une date dans le futur', async () => {
    const { status } = await apiPost('/sessions', makeSession({ date: '2099-01-01' }));

    expect(status).toBe(400);
  });

  test('refuse un type de séance inconnu', async () => {
    const { status } = await apiPost('/sessions', makeSession({ type: 'marathon' }));

    expect(status).toBe(400);
  });

  test('refuse une distance <= 0', async () => {
    const { status } = await apiPost('/sessions', makeSession({ distance_km: -3 }));

    expect(status).toBe(400);
  });

  test('refuse une distance > 500 km', async () => {
    const { status } = await apiPost('/sessions', makeSession({ distance_km: 800 }));

    expect(status).toBe(400);
  });

  test('refuse une durée <= 0', async () => {
    const { status } = await apiPost('/sessions', makeSession({ duration_min: 0 }));

    expect(status).toBe(400);
  });

  test('refuse une durée > 1440 min (24 h)', async () => {
    const { status } = await apiPost('/sessions', makeSession({ duration_min: 2000 }));

    expect(status).toBe(400);
  });

  test('refuse une fréquence cardiaque hors bornes (30-230 bpm)', async () => {
    const { status } = await apiPost('/sessions', makeSession({ avg_hr: 300 }));

    expect(status).toBe(400);
  });

  test('refuse un ressenti hors bornes (1-5)', async () => {
    const { status } = await apiPost('/sessions', makeSession({ feeling: 9 }));

    expect(status).toBe(400);
  });

  test('refuse des notes de plus de 500 caractères', async () => {
    const { status } = await apiPost('/sessions', makeSession({ notes: 'x'.repeat(501) }));

    expect(status).toBe(400);
  });
});

describe('API sessions — modification et suppression', () => {
  test('PUT /api/sessions/:id modifie une séance existante', async () => {
    const created = await apiPost('/sessions', makeSession());
    createdIds.push(created.body.id);

    const { status, body } = await apiPut(`/sessions/${created.body.id}`, {
      distance_km: 21.1,
      notes: 'Semi-marathon !',
    });

    expect(status).toBe(200);
    expect(body.distance_km).toBe(21.1);
    expect(body.notes).toBe('Semi-marathon !');
  });

  test('PUT /api/sessions/:id renvoie 404 si la séance n\'existe pas', async () => {
    const { status } = await apiPut('/sessions/999999', { distance_km: 10 });

    expect(status).toBe(404);
  });

  test('DELETE /api/sessions/:id supprime la séance (204)', async () => {
    const created = await apiPost('/sessions', makeSession());

    const del = await apiDelete(`/sessions/${created.body.id}`);
    expect(del.status).toBe(204);

    // Après suppression, la séance n'existe plus
    const check = await apiGet(`/sessions/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  test('DELETE /api/sessions/:id renvoie 404 si la séance n\'existe pas', async () => {
    const { status } = await apiDelete('/sessions/999999');

    expect(status).toBe(404);
  });
});
