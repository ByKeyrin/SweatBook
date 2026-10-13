# 🧪 Tests SweatBook

> **Vous n'avez jamais écrit de test ?** Vous êtes au bon endroit. 😊
> Ce guide explique tout pas à pas : comment lancer les tests, comment ils
> sont rangés, et comment en ajouter de nouveaux.

---

## Table des matières

1. [Les deux types de tests](#1-les-deux-types-de-tests)
2. [Comment lancer les tests](#2-comment-lancer-les-tests)
3. [Structure des tests](#3-structure-des-tests)
4. [Comment ajouter un nouveau test](#4-comment-ajouter-un-nouveau-test)
5. [Conventions d'interface testées](#5-conventions-dinterface-testées)
6. [Questions fréquentes](#6-questions-fréquentes)

---

## 1. Les deux types de tests

| Type | Outil | Ce qu'il vérifie | Vitesse |
|---|---|---|---|
| **Tests API** | [Vitest](https://vitest.dev/) | L'API (`server/`) : codes HTTP, JSON renvoyés, validations | ⚡ Rapide |
| **Tests E2E** | [Playwright](https://playwright.dev/) | L'app complète dans un vrai navigateur Chromium : clics, formulaires, navigation | 🐢 Plus lent |

**Règle d'or** : un bug métier (calcul d'allure, validation) → test API.
Un bug d'interface (bouton, affichage, navigation) → test E2E.

---

## 2. Comment lancer les tests

### Prérequis (une seule fois)

```bash
# Dépendances de test (à la racine du projet)
npm install

# Navigateur pour les tests E2E (≈ 120 Mo, une seule fois)
npx playwright install chromium
```

### Tests API

Les tests API envoient de vraies requêtes HTTP : **l'API doit tourner**.

```bash
# Terminal 1 — démarrer l'API (port 3001)
cd server
npm run dev

# Terminal 2 — lancer les tests (à la racine)
npm run test:api
```

### Tests E2E

Playwright **démarre l'app automatiquement** (`npm run dev` — serveur + client) :

```bash
npm run test:e2e
```

> 💡 Si l'app tourne déjà dans un autre terminal, elle est réutilisée.

### Tout lancer d'un coup

```bash
npm run test:all   # tests API puis tests E2E
```

| Commande | Ce qu'elle fait |
|---|---|
| `npm test` | Vitest en mode **surveillance** : relance les tests dès qu'on modifie un fichier (pratique en développement — `Ctrl+C` pour quitter) |
| `npm run test:api` | Les tests API, **une seule fois** |
| `npm run test:e2e` | Les tests E2E Playwright |
| `npm run test:all` | Tout : API puis E2E |

### Voir le rapport des tests E2E

```bash
npx playwright show-report   # ouvre le rapport HTML (playwright-report/)
```

Quand un test E2E échoue, on garde automatiquement :
- une **capture d'écran** (`test-results/…/test-failed-1.png`),
- une **trace** rejouable pas à pas (`npx playwright show-trace test-results/…/trace.zip`).

---

## 3. Structure des tests

```
tests/
├── e2e/                      # Tests de l'interface (Playwright)
│   ├── journal.spec.js       # 📓 Journal : chargement, ajout, liste, validation, navigation
│   ├── progression.spec.js   # 📈 Graphiques : affichage, SVG, changement de période
│   └── planning.spec.js      # 📅 Planning : grille 7 jours, semaines, planification
├── api/                      # Tests de l'API (Vitest)
│   ├── sessions.test.js      # CRUD séances + toutes les validations métier
│   └── running.test.js       # Statistiques running + données des graphiques
├── helpers/
│   └── test-utils.js         # Fonctions partagées (fabrique de séances, appels HTTP, formulaire)
└── README.md                 # ← Vous êtes ici
```

À la racine :

- `playwright.config.js` — configuration Playwright (Chromium, serveur auto, captures en cas d'échec).
- `package.json` — les scripts de test (`test`, `test:api`, `test:e2e`, `test:all`).

**Fichiers nommés `*.spec.js`** → tests E2E (Playwright les cherche dans `tests/e2e/`).
**Fichiers nommés `*.test.js`** → tests API (Vitest les cherche dans `tests/api/`).

---

## 4. Comment ajouter un nouveau test

### 4.1 Un test API (exemple : vérifier qu'on ne peut pas supprimer 2 fois)

1. Ouvrez `tests/api/sessions.test.js`.
2. Copiez un test existant et changez le `test('description', ...)`.
3. Utilisez les helpers de `tests/helpers/test-utils.js` :

```js
import { apiGet, apiPost, apiDelete, makeSession } from '../helpers/test-utils.js';

test('supprimer deux fois la même séance renvoie 404 la 2ᵉ fois', async () => {
  const created = await apiPost('/sessions', makeSession());

  const first = await apiDelete(`/sessions/${created.body.id}`);
  expect(first.status).toBe(204);

  const second = await apiDelete(`/sessions/${created.body.id}`);
  expect(second.status).toBe(404);
});
```

4. Relancez : `npm run test:api`.

### 4.2 Un test E2E (exemple : filtrer le journal par type)

1. Choisissez le bon fichier (`journal.spec.js` pour le Journal…).
2. Ajoutez un `test(...)` dans le `test.describe(...)` :

```js
test('filtre les séances par type de sortie', async ({ page }) => {
  await page.goto('/');                             // 1. ouvrir la page
  await page.getByRole('button', { name: /filtre/i }).click();  // 2. agir
  await expect(page.getByText('Sortie longue')).toBeVisible();  // 3. vérifier
});
```

3. Relancez : `npm run test:e2e`.

**Anatomie d'un test E2E :**

```js
test('description claire de ce qui doit marcher', async ({ page }) => {
  // 1. ALLER quelque part
  await page.goto('/');
  // 2. FAIRE quelque chose (comme un utilisateur)
  await page.getByRole('button', { name: /nouvelle séance/i }).click();
  // 3. VÉRIFIER le résultat (toujours avec expect)
  await expect(page.getByText('15,5 km')).toBeVisible();
});
```

### 4.3 Les helpers à connaître (`tests/helpers/test-utils.js`)

| Helper | Usage | Exemple |
|---|---|---|
| `makeSession(overrides)` | Crée une séance de test valide | `makeSession({ distance_km: 3 })` |
| `apiGet(path)` | GET vers l'API | `await apiGet('/sessions')` |
| `apiPost(path, body)` | POST vers l'API | `await apiPost('/sessions', makeSession())` |
| `apiPut(path, body)` | PUT vers l'API | `await apiPut('/sessions/1', { notes: 'x' })` |
| `apiDelete(path)` | DELETE vers l'API | `await apiDelete('/sessions/1')` |
| `navigateTo(page, dest)` | Clique dans la Navbar | `await navigateTo(page, 'planning')` |
| `openSessionForm(page)` | Ouvre « + Nouvelle séance » | — |
| `fillSessionForm(page, s)` | Remplit + enregistre une séance | — |

---

## 5. Conventions d'interface testées

Les tests E2E se basent sur les **libellés français** de l'app (docs/FUNCTIONAL.md).
Si vous changez un libellé dans l'UI, pensez aux tests !

| Élément | Attendu par les tests |
|---|---|
| Navbar | 3 liens : **Journal**, **Graphiques**, **Planning** |
| Page Journal | Bouton **« + Nouvelle séance »**, puis bouton **« Enregistrer »** |
| Formulaire séance | Labels : **Date**, **Type de sortie** (valeurs `easy`/`long`/`interval`/`tempo`/`recovery`), **Distance (km)**, **Durée (min)**, **Fréquence cardiaque moyenne**, **Ressenti**, **Notes** |
| Message validation | « La distance doit être supérieure à 0 » (docs/FUNCTIONAL.md §5.2) |
| Page Graphiques | 3 titres : **Volume hebdomadaire**, **Allure moyenne**, **Régularité** + bouton **« 3 mois »** |
| Page Planning | Grille **Lundi → Dimanche**, titre **« Semaine du … »**, boutons **Semaine précédente / suivante**, formulaire **Type de séance prévue** + **Distance prévue (km)** |

**Contrat de l'API testé** (docs/TECHNICAL.md §5) :

| Endpoint | Réponses attendues |
|---|---|
| `GET /api/sessions` | `200` → tableau de séances |
| `GET /api/sessions/:id` | `200` → séance · `404` |
| `POST /api/sessions` | `201` → séance créée · `400` si invalide |
| `PUT /api/sessions/:id` | `200` · `400` / `404` |
| `DELETE /api/sessions/:id` | `204` · `404` |
| `GET /api/running` | `200` → `{ total_km, total_duration_min, session_count, avg_min_per_km, vma_kmh }` |
| `GET /api/stats/weekly` | `200` → `[{ week_start, session_count, total_km, avg_min_per_km }]` |
| `GET /api/stats/summary` | `200` → résumé global |

Toute erreur API a la forme `{ "error": "message clair en français" }`.

---

## 6. Questions fréquentes

**❓ « Mon test API échoue avec `fetch failed` »**
L'API n'est pas lancée : `cd server && npm run dev` (port 3001). On peut changer
l'adresse avec la variable d'environnement : `API_URL=http://autre-chose/api npm run test:api`.

**❓ « Mon test E2E échoue et je ne sais pas pourquoi »**
Regardez la capture d'écran dans `test-results/`, ou rejouez le test pas à pas :
`npx playwright show-trace test-results/<dossier-du-test>/trace.zip`.

**❓ « Playwright ne trouve pas de navigateur »**
`npx playwright install chromium`.

**❓ « Un test est aléatoire (passe parfois, échoue parfois) »**
Souvent un problème de timing : remplacez un `waitForTimeout` par une attente
d'élément (`await expect(...).toBeVisible()`), qui attend tout seul.

**❓ « Qu'est-ce qu'un "bon" nom de test ? »**
Une phrase qui décrit le comportement attendu, en français :
`test('refuse une date dans le futur')` ✅ — `test('test1')` ❌.

---

*Une question sur les tests ? Ouvrez une issue sur le dépôt ! 🏃‍♂️*
