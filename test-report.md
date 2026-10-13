# 📊 Rapport de tests — SweatBook

> Fichier généré automatiquement par `scripts/generate-test-report.js`.
> Le workflow GitHub Actions **Test Report** le met à jour et le commit
> à chaque push sur `main`. **Ne pas modifier à la main.**

## 📅 Exécution

| | |
|---|---|
| Date | 2026-10-13T15:14:19.192Z |
| Commit | `local` |
| Branche | `locale` |

## 📈 Résumé

| Suite | Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---|---:|---:|---:|---:|
| API (Vitest) | 42 | 42 | 0 | 0 |
| E2E (Playwright) | 13 | 13 | 0 | 0 |
| **Total** | **55** | **55** | **0** | **0** |

## 🧪 Tests API (Vitest)

| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---:|---:|---:|---:|
| 42 | 42 | 0 | 0 |

### Détail par fichier de test

**`tests/api/plan.test.js`** — 14 test(s) : ✅ 14 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| API plan — lecture GET /api/plan/:weekStart renvoie les entrées de la semaine | ✅ Passé |
| API plan — lecture GET /api/plan/:weekStart ne renvoie que cette semaine | ✅ Passé |
| API plan — création POST /api/plan crée une entrée valide (201) | ✅ Passé |
| API plan — création POST /api/plan accepte une journée « Repos » sans distance | ✅ Passé |
| API plan — création POST /api/plan accepte une semaine future | ✅ Passé |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un day_of_week hors bornes (0-6) | ✅ Passé |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un type planifié inconnu | ✅ Passé |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une distance prévue <= 0 | ✅ Passé |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une week_start manquante | ✅ Passé |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse deux entrées le même jour (une seule entrée par jour) | ✅ Passé |
| API plan — modification et suppression PUT /api/plan/:id modifie une entrée existante | ✅ Passé |
| API plan — modification et suppression PUT /api/plan/:id renvoie 404 si l'entrée n'existe pas | ✅ Passé |
| API plan — modification et suppression DELETE /api/plan/:id supprime l'entrée (204) | ✅ Passé |
| API plan — modification et suppression DELETE /api/plan/:id renvoie 404 si l'entrée n'existe pas | ✅ Passé |

**`tests/api/running.test.js`** — 4 test(s) : ✅ 4 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| API running — statistiques coureur (GET /api/running) renvoie 200 et les statistiques attendues | ✅ Passé |
| API running — statistiques coureur (GET /api/running) compte les kilomètres, le temps et les séances | ✅ Passé |
| API running — statistiques coureur (GET /api/running) calcule l'allure globale pondérée (durée totale ÷ distance totale) | ✅ Passé |
| API running — statistiques coureur (GET /api/running) estime la VMA à partir du fractionné (vitesse max × 1,05) | ✅ Passé |

**`tests/api/sessions.test.js`** — 19 test(s) : ✅ 19 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| API sessions — lecture GET /api/sessions renvoie 200 et une liste de séances | ✅ Passé |
| API sessions — lecture GET /api/sessions/:id renvoie une séance existante | ✅ Passé |
| API sessions — lecture GET /api/sessions/:id renvoie 404 si la séance n'existe pas | ✅ Passé |
| API sessions — création POST /api/sessions crée une séance valide (201) | ✅ Passé |
| API sessions — création POST /api/sessions accepte les champs optionnels vides | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date manquante | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date dans le futur | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un type de séance inconnu | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance <= 0 | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance > 500 km | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée <= 0 | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée > 1440 min (24 h) | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une fréquence cardiaque hors bornes (30-230 bpm) | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un ressenti hors bornes (1-5) | ✅ Passé |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse des notes de plus de 500 caractères | ✅ Passé |
| API sessions — modification et suppression PUT /api/sessions/:id modifie une séance existante | ✅ Passé |
| API sessions — modification et suppression PUT /api/sessions/:id renvoie 404 si la séance n'existe pas | ✅ Passé |
| API sessions — modification et suppression DELETE /api/sessions/:id supprime la séance (204) | ✅ Passé |
| API sessions — modification et suppression DELETE /api/sessions/:id renvoie 404 si la séance n'existe pas | ✅ Passé |

**`tests/api/stats.test.js`** — 5 test(s) : ✅ 5 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| API stats — série hebdomadaire (GET /api/stats/weekly) renvoie 200 et une liste de points hebdomadaires | ✅ Passé |
| API stats — série hebdomadaire (GET /api/stats/weekly) regroupe les séances par semaine (lundi → dimanche) | ✅ Passé |
| API stats — série hebdomadaire (GET /api/stats/weekly) trie les semaines dans l'ordre chronologique | ✅ Passé |
| API stats — résumé global (GET /api/stats/summary) renvoie 200 et un objet de résumé | ✅ Passé |
| API — gestion des erreurs un endpoint inconnu renvoie 404 avec { error } | ✅ Passé |

## 🌐 Tests E2E (Playwright)

| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---:|---:|---:|---:|
| 13 | 13 | 0 | 0 |

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

**`planning.spec.js`** — 3 test(s) : ✅ 3 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche la grille des 7 jours (lundi → dimanche) | ✅ Passé |
| change de semaine avec les boutons précédent/suivant | ✅ Passé |
| planifie une sortie facile le lundi | ✅ Passé |

**`progression.spec.js`** — 3 test(s) : ✅ 3 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche les trois graphiques de progression | ✅ Passé |
| dessine les graphiques (balises SVG présentes) | ✅ Passé |
| change la période affichée (3 mois) | ✅ Passé |

## 🏁 Statut global

✅ **SUCCÈS** — les 55 test(s) exécuté(s) passent tous.
