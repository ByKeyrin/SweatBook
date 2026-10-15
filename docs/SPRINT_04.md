# 📅 Sprint 4 — Planning hebdomadaire

> **Objectif** : transformer la page « Planning » (simple placeholder depuis
> le Sprint 1) en planning hebdomadaire interactif : grille lundi → dimanche,
> navigation entre les semaines, planification de séances (type + durée prévue)
> — le tout persisté dans le localStorage.
>
> **Statut** : 🟡 Fonctionnel en local (persistance localStorage — voir « Écarts
> et décisions »). Des écarts avec le cahier de recette et les contrats de
> tests restent à traiter (voir « Écarts et décisions »).

---

## 🎯 Objectif du sprint

Reprendre la feuille de route du [SPRINT_03.md](./SPRINT_03.md) (« Planning
hebdomadaire : relié à /api/plan (Sprint 4 ?) ») et le cahier de recette
(docs/FUNCTIONAL.md §4.3) :

1. Créer les **composants du planning** (`DayCard`, `WeekNav`,
   `PlanSessionForm`) ;
2. Assembler le tout dans **`PlanningScreen`** : navigation + grille 7 jours +
   formulaire ;
3. Gérer l'état avec le hook **`usePlanning`** (CRUD des séances planifiées +
   navigation entre semaines) ;
4. **Persister** les planifications dans le localStorage (le backend
   `/api/plan` est reporté au Sprint 5 — skip conditionnel des tests API) ;
5. 🎯 Critère de réussite : Kevin peut préparer sa semaine — planifier une
   séance par jour, naviguer entre les semaines, retrouver ses planifications
   après rechargement.

---

## 🧩 Composants créés

| Fichier | Rôle | Auteur |
|---|---|---|
| `client/src/features/planning/DayCard.tsx` | Une journée de la semaine : séances planifiées, « Repos », bouton « + Ajouter » | Pixel |
| `client/src/features/planning/WeekNav.tsx` | Navigation « ◀ Précédente / Suivante ▶ » + libellé « Semaine 43 — 20 au 26 octobre » (date-fns) | Pixel |
| `client/src/features/planning/PlanSessionForm.tsx` | Formulaire de planification validé (jour, type, durée prévue, notes) | Pixel |
| `client/src/features/planning/PlanningScreen.tsx` | Page conteneur : WeekNav + grille de 7 DayCard + PlanSessionForm | Pixel (réécrit) |
| `client/src/hooks/usePlanning.ts` | Hook d'état : CRUD des `PlannedSession`, navigation entre semaines, persistance localStorage (`sweatbook_plan`) | Pixel |
| `client/src/types/index.ts` | Ajout de `PlannedType`, `PlannedSession`, `PLANNED_TYPE_LABELS`, `PLANNED_TYPE_ICONS` | Pixel |
| `client/package.json` | Ajout de la dépendance `date-fns@^4.4.0` | Pixel |
| `docs/PLANNING.md` | Documentation du module Planning | BIC |
| `docs/SPRINT_04.md` | Ce document | BIC |

Documentation détaillée : **[PLANNING.md](./PLANNING.md)** (composants, hook,
données, navigation des semaines, exemples d'utilisation).

---

## ✅ Fonctionnalités livrées

1. **Grille de la semaine** — 7 cartes (`DayCard`) lundi → dimanche, grille
   responsive (1 colonne mobile, 2 tablette, 7 desktop) ; chaque jour affiche
   sa date en français (« Lun 20 oct »).
2. **Planification de séances** — pour chaque jour, un ou plusieurs
   entraînements : type (`Course` 🏃 / `Force` 💪 / `Tennis` 🎾), durée prévue
   (min), notes facultatives (500 car. max) ; bouton « + Ajouter » sur chaque
   jour qui présélectionne le jour dans le formulaire.
3. **Formulaire validé** — validations en français affichées sous les champs
   (`role="alert"`) : jour 0–6 obligatoire, type obligatoire, durée > 0 et ≤
   24 h, notes ≤ 500 car. ; accepte la virgule décimale ; réinitialisation
   après envoi en conservant le jour sélectionné.
4. **Navigation entre les semaines** — « ◀ Précédente », « Suivante ▶ » et
   « Revenir à la semaine en cours » ; libellé avec numéro de semaine ISO et
   intervalle de dates (« Semaine 43 — 20 au 26 octobre », mois écrit une fois
   s'il est commun aux deux bornes) ; semaines passées et futures planifiables
   (règle FUNCTIONAL.md §5.3.5).
5. **« Repos » par défaut** — un jour sans séance planifiée affiche « Repos »
   dans un encadré pointillé.
6. **Suppression** — bouton « ✕ » sur chaque séance planifiée, avec
   `aria-label` explicite (« Supprimer la séance Course »).
7. **Persistance localStorage** — les planifications survivent au rechargement
   (clé `sweatbook_plan`), avec sauvegarde automatique à chaque changement
   (`usePlanning`).
8. **Accessibilité** — `aria-label` sur les suppressions, `role="alert"` sur
   les erreurs, emojis décoratifs en `aria-hidden`, `focus:ring-*` sur les
   éléments interactifs.

---

## 🧪 Tests prévus

### E2E (Playwright) — `tests/e2e/planning.spec.js` (3 tests, contrat écrit en amont)

| # | Test | Ce qu'il vérifie |
|---|---|---|
| 1 | affiche la grille des 7 jours (lundi → dimanche) | les 7 jours sont visibles |
| 2 | change de semaine avec les boutons précédent/suivant | le titre de la semaine change puis revient |
| 3 | planifie une sortie facile le lundi | select « Sortie facile » (`easy`) + « distance prévue » 8 km → statut « 🟡 À faire » |

> ⚠️ **Écart d'interface** : ces tests reflètent le cahier de recette initial
> (titre « Semaine du … », type `easy` = « Sortie facile », **distance**
> prévue, statut « À faire »), alors que l'implémentation livre un libellé
> « Semaine 43 — 20 au 26 octobre », des types `course`/`force`/`tennis`, une
> **durée** prévue et aucun statut 🟢/🟡. Les tests 2 et 3 échoueront en
> l'état, le test 1 est partiellement couvert (les options du `<select>`
> jour contiennent les noms de jours). Voir « Écarts et décisions ».

### API (Vitest) — `tests/api/plan.test.js`

Contrat `GET /api/plan/:weekStart`, `POST /api/plan`, `PUT /api/plan/:id`,
`DELETE /api/plan/:id` (docs/TECHNICAL.md §5.2) + règles métier §5.3
(semaine identifiée par son lundi, `day_of_week` 0–6, une seule entrée par
jour, semaine future ou passée acceptée). **Non applicable au Sprint 4** : le
backend n'existe pas encore, la suite est en `skipIf(!API_READY)` et servira
de critère de validation au branchement du Sprint 5.

> 📌 **Point d'attention** : ce contrat valide `planned_type` dans
> `SessionType | 'rest'` et `planned_km` — alors que l'UI livre
> `PlannedType ('course' | 'force' | 'tennis')` et `planned_duration_min`.
> L'alignement des modèles conditionne le passage au vert de ces tests.

### E2E (Playwright, client) — à venir

Comme au Sprint 3 (`client/tests/progression.spec.ts` + helpers
`client/tests/helpers/`), une suite `client/tests/planning.spec.ts` couvrant
l'**UI livrée** reste à écrire (aucun helper planning n'existe encore dans
`client/tests/helpers/`).

---

## ⚖️ Écarts et décisions

### 1. Modèle `PlannedSession` ≠ contrat `PlanEntry` (API/SQL)

`types/index.ts` accueille depuis le Sprint 1 le type **`PlanEntry`** aligné
sur le schéma SQL et l'API (`planned_type: SessionType | 'rest'`,
`planned_km?`, `session_id?` — TECHNICAL.md §6.4, `tests/api/plan.test.js`).
Le Sprint 4 introduit un **deuxième modèle**, `PlannedSession`
(`planned_type: 'course' | 'force' | 'tennis'`, `planned_duration_min`,
`notes?`, sans `session_id` ni `planned_km`), qui s'écarte du contrat :
- les types `course/force/tennis` rappellent le modèle multi-sport du brief
  Sprint 1 (`BriefSession`), explicitement écarté car non conforme au schéma ;
- un `POST /api/plan` avec `planned_type: 'course'` serait refusé en 400 par
  le contrat testé (`SessionType | 'rest'` uniquement).
Au branchement du backend, il faudra soit aligner l'UI sur `PlanEntry`, soit
faire évoluer le schéma et `tests/api/plan.test.js` — arbitrage nécessaire.

### 2. Durée prévue au lieu de distance prévue

FUNCTIONAL.md §4.3 prévoit « un type de séance prévue, une **distance**
prévue, ou Repos ». L'UI livre une **durée** prévue obligatoire
(`planned_duration_min`) et aucune distance — comme le confirme le test E2E 3
(« distance prévue ») qui échouera. Soit le cahier de recette est mis à jour,
soit le formulaire reçoit un champ `planned_km`.

### 3. Statuts 🟢 Fait / 🟡 À faire / ⚪ Repos non implémentés

Le cahier de recette (§4.3) et les règles métier (§5.3.3–5.3.4) prévoient un
rapprochement plan ↔ séance réalisée (`session_id`, marquage « 🟢 Fait »,
dé-liaison à la suppression d'une séance). Le Sprint 4 n'affiche que
« Repos » (jour vide) vs la liste des séances planifiées : aucune liaison
avec le Journal (`useSessions`) n'existe encore.

### 4. Plusieurs entrées par jour

La règle 5.3.2 (« une seule entrée par jour » — validée par
`tests/api/plan.test.js`) n'est pas appliquée : `DayCard` affiche une **liste**
de séances et `addPlan` en accepte plusieurs par jour. À arbitrer : contraindre
l'UI (une entrée/jour) ou assouplir le contrat API.

### 5. Tests E2E historiques non alignés

`tests/e2e/planning.spec.js` attend « Semaine du … », `selectOption('easy')`,
« distance prévue » et le statut « À faire » ; l'UI livrée affiche
« Semaine 43 — 20 au 26 octobre », `course/force/tennis`, « Durée prévue
(min) » et aucun statut. Comme au Sprint 3 : mettre à jour les tests vers
l'UI livrée, ou compléter l'UI pour la recette.

### 6. Points mineurs

- **Clé de stockage** `sweatbook_plan` (tiret bas) alors que le Journal
  utilise `sweatbook.sessions` (point) — harmoniser la convention.
- **`currentWeekStartIso()`** (`usePlanning.ts`) est documentée mais jamais
  appelée (code mort).
- La compilation TypeScript passe au vert (`tsc --noEmit`), aucune erreur.

---

## 📋 Ce qui reste à faire

- [ ] **Arbitrer le modèle de données** : aligner `PlannedSession` sur
      `PlanEntry` (ou faire évoluer le schéma SQL + `tests/api/plan.test.js`)
      avant le branchement `/api/plan` du Sprint 5 ;
- [ ] **Arbitrer le contrat UI/tests** : mettre à jour
      `tests/e2e/planning.spec.js` vers l'UI livrée (libellés, durée,
      types `course/force/tennis`) ou compléter l'UI pour FUNCTIONAL.md §4.3
      (distance prévue, statuts 🟢/🟡/⚪) ;
- [ ] Implémenter les **statuts visuels** et la liaison `session_id`
      (règles 5.3.3–5.3.4 : « 🟢 Fait » quand une séance du Journal est liée,
      dé-liaison à la suppression) ;
- [ ] Appliquer la règle **« une seule entrée par jour »** (5.3.2) — ou
      modifier la règle si le multi-sport par jour est voulu ;
- [ ] Ajouter le champ **distance prévue** (`planned_km`) si le cahier de
      recette est maintenu ;
- [ ] Écrire la suite **`client/tests/planning.spec.ts`** (+ helper
      `client/tests/helpers/planning.ts` avec `seedPlans`) sur le modèle du
      Sprint 3 ;
- [ ] Faire passer les **tests API** `tests/api/plan.test.js` une fois le
      backend en place (branchement `usePlanning` sur `/api/plan`) ;
- [ ] Retirer le code mort **`currentWeekStartIso`** et harmoniser la clé
      localStorage (`sweatbook_plan` vs `sweatbook.sessions`) ;
- [ ] Harmoniser CONVENTIONS.md §2.1 (« bloc multi-lignes obligatoire ») et
      TEMPLATES.md (descriptions mono-ligne pour les interfaces de props) ;
- [ ] Retirer le stub `/tmp/sweatbook-stub` quand le vrai backend sera en place.

---

## 🚀 Prochain sprint

**Sprint 5 — Backend + API REST** : mettre en place `server/` (Express +
SQLite), exposer les contrats `/api/sessions`, `/api/stats` et `/api/plan`,
puis brancher le Journal, la Progression et le Planning dessus. Critère de
réussite : `tests/api/sessions.test.js` + `tests/api/stats.test.js` +
`tests/api/plan.test.js` au vert (dé-skip conditionnel `API_READY`).

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 4. Le code est
signé Pixel ; le git est géré par Pixel (aucun commit effectué par BIC).* 📖
