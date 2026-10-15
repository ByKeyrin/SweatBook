# 📊 Rapport de tests — SweatBook

> Fichier généré automatiquement par `scripts/generate-test-report.js`.
> Le workflow GitHub Actions **Test Report** le met à jour et le commit
> à chaque push sur `main`. **Ne pas modifier à la main.**

## 📅 Exécution

| | |
|---|---|
| Date | 2026-10-15T15:36:02.553Z |
| Commit | `7a541d2dbf2d2a2ee6c37569ba70020457ffe223` |
| Branche | `main` |

## 📈 Résumé

| Suite | Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---|---:|---:|---:|---:|
| API (Vitest) | 42 | 0 | 0 | 42 |
| E2E (Playwright) | 13 | 13 | 0 | 0 |
| **Total** | **55** | **13** | **0** | **42** |

## 🧪 Tests API (Vitest)

> ⏭️ **skipped (backend pending)** — le serveur API (Sprint 5) n'existe pas encore : ces tests sont ignorés au lieu d'échouer. Ils s'exécuteront automatiquement dès que le backend sera disponible (`npm run test:api`).

| Total | ✅ Passés | ❌ Échoués | ⏭️ Ignorés |
|---:|---:|---:|---:|
| 42 | 0 | 0 | 42 |

### Détail par fichier de test

**`tests/api/plan.test.js`** — 14 test(s) : ✅ 0 · ❌ 0 · ⏭️ 14

| Test | Statut |
|---|---|
| API plan — lecture GET /api/plan/:weekStart renvoie les entrées de la semaine | ⏭️ Ignoré — skipped (backend pending) |
| API plan — lecture GET /api/plan/:weekStart ne renvoie que cette semaine | ⏭️ Ignoré — skipped (backend pending) |
| API plan — création POST /api/plan crée une entrée valide (201) | ⏭️ Ignoré — skipped (backend pending) |
| API plan — création POST /api/plan accepte une journée « Repos » sans distance | ⏭️ Ignoré — skipped (backend pending) |
| API plan — création POST /api/plan accepte une semaine future | ⏭️ Ignoré — skipped (backend pending) |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un day_of_week hors bornes (0-6) | ⏭️ Ignoré — skipped (backend pending) |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse un type planifié inconnu | ⏭️ Ignoré — skipped (backend pending) |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une distance prévue <= 0 | ⏭️ Ignoré — skipped (backend pending) |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse une week_start manquante | ⏭️ Ignoré — skipped (backend pending) |
| API plan — validations (docs/FUNCTIONAL.md §5.3) refuse deux entrées le même jour (une seule entrée par jour) | ⏭️ Ignoré — skipped (backend pending) |
| API plan — modification et suppression PUT /api/plan/:id modifie une entrée existante | ⏭️ Ignoré — skipped (backend pending) |
| API plan — modification et suppression PUT /api/plan/:id renvoie 404 si l'entrée n'existe pas | ⏭️ Ignoré — skipped (backend pending) |
| API plan — modification et suppression DELETE /api/plan/:id supprime l'entrée (204) | ⏭️ Ignoré — skipped (backend pending) |
| API plan — modification et suppression DELETE /api/plan/:id renvoie 404 si l'entrée n'existe pas | ⏭️ Ignoré — skipped (backend pending) |

**`tests/api/running.test.js`** — 4 test(s) : ✅ 0 · ❌ 0 · ⏭️ 4

| Test | Statut |
|---|---|
| API running — statistiques coureur (GET /api/running) renvoie 200 et les statistiques attendues | ⏭️ Ignoré — skipped (backend pending) |
| API running — statistiques coureur (GET /api/running) compte les kilomètres, le temps et les séances | ⏭️ Ignoré — skipped (backend pending) |
| API running — statistiques coureur (GET /api/running) calcule l'allure globale pondérée (durée totale ÷ distance totale) | ⏭️ Ignoré — skipped (backend pending) |
| API running — statistiques coureur (GET /api/running) estime la VMA à partir du fractionné (vitesse max × 1,05) | ⏭️ Ignoré — skipped (backend pending) |

**`tests/api/sessions.test.js`** — 19 test(s) : ✅ 0 · ❌ 0 · ⏭️ 19

| Test | Statut |
|---|---|
| API sessions — lecture GET /api/sessions renvoie 200 et une liste de séances | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — lecture GET /api/sessions/:id renvoie une séance existante | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — lecture GET /api/sessions/:id renvoie 404 si la séance n'existe pas | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — création POST /api/sessions crée une séance valide (201) | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — création POST /api/sessions accepte les champs optionnels vides | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date manquante | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une date dans le futur | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un type de séance inconnu | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance <= 0 | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une distance > 500 km | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée <= 0 | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une durée > 1440 min (24 h) | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse une fréquence cardiaque hors bornes (30-230 bpm) | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse un ressenti hors bornes (1-5) | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — validations (docs/FUNCTIONAL.md §5.2) refuse des notes de plus de 500 caractères | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — modification et suppression PUT /api/sessions/:id modifie une séance existante | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — modification et suppression PUT /api/sessions/:id renvoie 404 si la séance n'existe pas | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — modification et suppression DELETE /api/sessions/:id supprime la séance (204) | ⏭️ Ignoré — skipped (backend pending) |
| API sessions — modification et suppression DELETE /api/sessions/:id renvoie 404 si la séance n'existe pas | ⏭️ Ignoré — skipped (backend pending) |

**`tests/api/stats.test.js`** — 5 test(s) : ✅ 0 · ❌ 0 · ⏭️ 5

| Test | Statut |
|---|---|
| API stats — série hebdomadaire (GET /api/stats/weekly) renvoie 200 et une liste de points hebdomadaires | ⏭️ Ignoré — skipped (backend pending) |
| API stats — série hebdomadaire (GET /api/stats/weekly) regroupe les séances par semaine (lundi → dimanche) | ⏭️ Ignoré — skipped (backend pending) |
| API stats — série hebdomadaire (GET /api/stats/weekly) trie les semaines dans l'ordre chronologique | ⏭️ Ignoré — skipped (backend pending) |
| API stats — résumé global (GET /api/stats/summary) renvoie 200 et un objet de résumé | ⏭️ Ignoré — skipped (backend pending) |
| API — gestion des erreurs un endpoint inconnu renvoie 404 avec { error } | ⏭️ Ignoré — skipped (backend pending) |

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
| planifie une course le lundi | ✅ Passé |

**`progression.spec.js`** — 3 test(s) : ✅ 3 · ❌ 0 · ⏭️ 0

| Test | Statut |
|---|---|
| affiche les graphiques de progression | ✅ Passé |
| dessine les graphiques (balises SVG présentes) | ✅ Passé |
| change la période affichée (90 jours) | ✅ Passé |

## 🏁 Statut global

✅ **SUCCÈS** — les 13 test(s) exécuté(s) passent tous.
