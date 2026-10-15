# 📊 Rapport de tests — SweatBook

> Fichier généré automatiquement par `scripts/generate-test-report.js`.
> Le workflow GitHub Actions **Test Report** le met à jour et le commit
> à chaque push sur `main`. **Ne pas modifier à la main.**

## 📅 Exécution

| | |
|---|---|
| Date | 2026-10-15T13:14:56.128Z |
| Commit | `ea56caa57f5658a70060ca1dcfa2e15027b38a92` |
| Branche | `main` |

## 📈 Résumé

| Suite | Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---|---:|---:|---:|---:|
| API (Vitest) | 42 | 0 | 33 | 9 |
| E2E (Playwright) | 13 | 8 | 5 | 0 |
| **Total** | **55** | **8** | **38** | **9** |

## 🧪 Tests API (Vitest)

| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---:|---:|---:|---:|
| 42 | 0 | 33 | 9 |

### Détail par fichier de test

**`tests/api/plan.test.js`** — 14 test(s) : ✅ 0 · ❌ 14 · ⏭️ 0

| Test | Statut |
|---|---|
| API plan — lecture GET /api/plan/:weekStart renvoie les entrées de la semaine | ❌ Échoué |
| API plan — lecture GET /api/plan/:weekStart ne renvoie que cette semaine | ❌ Échoué |
| API plan — création POST /api/plan crée une entrée valide (201) | ❌ Échoué |
| API plan — création POST /api/plan accepte une journée « Repos » sans distance | ❌ Échoué |
| API plan — création POST /api/plan accepte une semaine future | ❌ Échoué |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un day_of_week hors bornes (0-6) | ❌ Échoué |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un type planifié inconnu | ❌ Échoué |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une distance prévue <= 0 | ❌ Échoué |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une week_start manquante | ❌ Échoué |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse deux entrées le même jour (une seule entrée par jour) | ❌ Échoué |
| API plan — modification et suppression PUT /api/plan/:id modifie une entrée existante | ❌ Échoué |
| API plan — modification et suppression PUT /api/plan/:id renvoie 404 si l'entrée n'existe pas | ❌ Échoué |
| API plan — modification et suppression DELETE /api/plan/:id supprime l'entrée (204) | ❌ Échoué |
| API plan — modification et suppression DELETE /api/plan/:id renvoie 404 si l'entrée n'existe pas | ❌ Échoué |

<details><summary>🚨 Erreurs</summary>

- **API plan — lecture GET /api/plan/:weekStart renvoie les entrées de la semaine** : `TypeError: fetch failed`
- **API plan — lecture GET /api/plan/:weekStart ne renvoie que cette semaine** : `TypeError: fetch failed`
- **API plan — création POST /api/plan crée une entrée valide (201)** : `TypeError: fetch failed`
- **API plan — création POST /api/plan accepte une journée « Repos » sans distance** : `TypeError: fetch failed`
- **API plan — création POST /api/plan accepte une semaine future** : `TypeError: fetch failed`
- **API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un day_of_week hors bornes (0-6)** : `TypeError: fetch failed`
- **API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un type planifié inconnu** : `TypeError: fetch failed`
- **API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une distance prévue <= 0** : `TypeError: fetch failed`
- **API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une week_start manquante** : `TypeError: fetch failed`
- **API plan — validations (docs/FUNCTIONAL.md §5.3) refuse deux entrées le même jour (une seule entrée par jour)** : `TypeError: fetch failed`
- **API plan — modification et suppression PUT /api/plan/:id modifie une entrée existante** : `TypeError: fetch failed`
- **API plan — modification et suppression PUT /api/plan/:id renvoie 404 si l'entrée n'existe pas** : `TypeError: fetch failed`
- **API plan — modification et suppression DELETE /api/plan/:id supprime l'entrée (204)** : `TypeError: fetch failed`
- **API plan — modification et suppression DELETE /api/plan/:id renvoie 404 si l'entrée n'existe pas** : `TypeError: fetch failed`

</details>

**`tests/api/running.test.js`** — 4 test(s) : ✅ 0 · ❌ 0 · ⏭️ 4

| Test | Statut |
|---|---|
| API running — statistiques coureur (GET /api/running) renvoie 200 et les statistiques attendues | ⏭️ Ignoré |
| API running — statistiques coureur (GET /api/running) compte les kilomètres, le temps et les séances | ⏭️ Ignoré |
| API running — statistiques coureur (GET /api/running) calcule l'allure globale pondérée (durée totale ÷ distance totale) | ⏭️ Ignoré |
| API running — statistiques coureur (GET /api/running) estime la VMA à partir du fractionné (vitesse max × 1,05) | ⏭️ Ignoré |

**`tests/api/sessions.test.js`** — 19 test(s) : ✅ 0 · ❌ 19 · ⏭️ 0

| Test | Statut |
|---|---|
| API sessions — lecture GET /api/sessions renvoie 200 et une liste de séances | ❌ Échoué |
| API sessions — lecture GET /api/sessions/:id renvoie une séance existante | ❌ Échoué |
| API sessions — lecture GET /api/sessions/:id renvoie 404 si la séance n'existe pas | ❌ Échoué |
| API sessions — création POST /api/sessions crée une séance valide (201) | ❌ Échoué |
| API sessions — création POST /api/sessions accepte les champs optionnels vides | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date manquante | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date dans le futur | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un type de séance inconnu | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance <= 0 | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance > 500 km | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée <= 0 | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée > 1440 min (24 h) | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une fréquence cardiaque hors bornes (30-230 bpm) | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un ressenti hors bornes (1-5) | ❌ Échoué |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse des notes de plus de 500 caractères | ❌ Échoué |
| API sessions — modification et suppression PUT /api/sessions/:id modifie une séance existante | ❌ Échoué |
| API sessions — modification et suppression PUT /api/sessions/:id renvoie 404 si la séance n'existe pas | ❌ Échoué |
| API sessions — modification et suppression DELETE /api/sessions/:id supprime la séance (204) | ❌ Échoué |
| API sessions — modification et suppression DELETE /api/sessions/:id renvoie 404 si la séance n'existe pas | ❌ Échoué |

<details><summary>🚨 Erreurs</summary>

- **API sessions — lecture GET /api/sessions renvoie 200 et une liste de séances** : `TypeError: fetch failed`
- **API sessions — lecture GET /api/sessions/:id renvoie une séance existante** : `TypeError: fetch failed`
- **API sessions — lecture GET /api/sessions/:id renvoie 404 si la séance n'existe pas** : `TypeError: fetch failed`
- **API sessions — création POST /api/sessions crée une séance valide (201)** : `TypeError: fetch failed`
- **API sessions — création POST /api/sessions accepte les champs optionnels vides** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date manquante** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date dans le futur** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un type de séance inconnu** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance <= 0** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance > 500 km** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée <= 0** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée > 1440 min (24 h)** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une fréquence cardiaque hors bornes (30-230 bpm)** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un ressenti hors bornes (1-5)** : `TypeError: fetch failed`
- **API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse des notes de plus de 500 caractères** : `TypeError: fetch failed`
- **API sessions — modification et suppression PUT /api/sessions/:id modifie une séance existante** : `TypeError: fetch failed`
- **API sessions — modification et suppression PUT /api/sessions/:id renvoie 404 si la séance n'existe pas** : `TypeError: fetch failed`
- **API sessions — modification et suppression DELETE /api/sessions/:id supprime la séance (204)** : `TypeError: fetch failed`
- **API sessions — modification et suppression DELETE /api/sessions/:id renvoie 404 si la séance n'existe pas** : `TypeError: fetch failed`

</details>

**`tests/api/stats.test.js`** — 5 test(s) : ✅ 0 · ❌ 0 · ⏭️ 5

| Test | Statut |
|---|---|
| API stats — série hebdomadaire (GET /api/stats/weekly) renvoie 200 et une liste de points hebdomadaires | ⏭️ Ignoré |
| API stats — série hebdomadaire (GET /api/stats/weekly) regroupe les séances par semaine (lundi → dimanche) | ⏭️ Ignoré |
| API stats — série hebdomadaire (GET /api/stats/weekly) trie les semaines dans l'ordre chronologique | ⏭️ Ignoré |
| API stats — résumé global (GET /api/stats/summary) renvoie 200 et un objet de résumé | ⏭️ Ignoré |
| API — gestion des erreurs un endpoint inconnu renvoie 404 avec { error } | ⏭️ Ignoré |

## 🌐 Tests E2E (Playwright)

| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---:|---:|---:|---:|
| 13 | 8 | 5 | 0 |

### Détail par fichier de test

**`journal.spec.js`** — 7 test(s) : ✅ 7 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche le journal au chargement | ✅ Passé |
| ajoute une séance depuis le formulaire | ✅ Passé |
| affiche la liste des séances (plus récente d'abord) | ✅ Passé |
| modifie une séance existante | ✅ Passé |
| supprime une séance après confirmation | ✅ Passé |
| refuse une distance invalide avec un message clair | ✅ Passé |
| navigue entre Journal, Graphiques et Planning | ✅ Passé |

**`planning.spec.js`** — 3 test(s) : ✅ 1 · ❌ 2 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche la grille des 7 jours (lundi → dimanche) | ✅ Passé |
| change de semaine avec les boutons précédent/suivant | ❌ Échoué |
| planifie une sortie facile le lundi | ❌ Échoué |

<details><summary>🚨 Erreurs</summary>

- **change de semaine avec les boutons précédent/suivant** : `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
- **planifie une sortie facile le lundi** : `[31mTest timeout of 30000ms exceeded.[39m`

</details>

**`progression.spec.js`** — 3 test(s) : ✅ 0 · ❌ 3 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche les trois graphiques de progression | ❌ Échoué |
| dessine les graphiques (balises SVG présentes) | ❌ Échoué |
| change la période affichée (3 mois) | ❌ Échoué |

<details><summary>🚨 Erreurs</summary>

- **affiche les trois graphiques de progression** : `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
- **dessine les graphiques (balises SVG présentes)** : `Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed`
- **change la période affichée (3 mois)** : `[31mTest timeout of 30000ms exceeded.[39m`

</details>

## 🏁 Statut global

❌ **ÉCHEC** — 38 test(s) en échec sur 55 exécuté(s).
