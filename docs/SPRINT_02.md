# 🏃 Sprint 2 — Journal des séances (CRUD complet)

> **Objectif** : transformer le squelette du Journal (Sprint 1) en fonctionnalité
> complète : ajouter, lister, modifier et supprimer des séances de course, avec
> validation du formulaire et persistance des données.
>
> **Statut** : ✅ Fonctionnel en local (persistance localStorage — voir « Écarts
> et décisions »). Le branchement API reste au Sprint 3.

---

## 🎯 Objectif du sprint

Reprendre les objectifs annoncés en fin de [SPRINT_01.md](./SPRINT_01.md) :

1. Créer le **formulaire de séance** (« + Nouvelle séance ») avec validation
   côté client (distance > 0, date non future, durées et FC bornées…) ;
2. Afficher la **liste des séances** en cartes, de la plus récente à la plus ancienne ;
3. Permettre la **modification** (formulaire pré-rempli, sans doublon) et la
   **suppression avec confirmation** (« irréversible ») ;
4. Ajouter un **hook `useSessions`** pour gérer le CRUD + la persistance ;
5. 🎯 Critère de réussite : les tests `tests/e2e/journal.spec.js` passent.

---

## 🧩 Composants créés

| Fichier | Rôle | Auteur |
|---|---|---|
| `client/src/features/journal/SessionForm.tsx` | Formulaire d'ajout / modification + validation (FUNCTIONAL.md §5.2) | Pixel |
| `client/src/features/journal/SessionCard.tsx` | Carte d'une séance (formats FUNCTIONAL.md §5.4) + boutons Modifier / Supprimer | Pixel |
| `client/src/features/journal/SessionList.tsx` | Liste triée (plus récente d'abord) + état vide + bouton d'ajout | Pixel |
| `client/src/features/journal/JournalScreen.tsx` | Page conteneur : assemble formulaire et liste, pilote le mode création/édition | Pixel (mis à jour) |
| `client/src/hooks/useSessions.ts` | Hook CRUD (`addSession`, `updateSession`, `deleteSession`) + persistance localStorage | Pixel |
| `docs/JOURNAL.md` | Documentation du module Journal | BIC |
| `docs/SPRINT_02.md` | Ce document | BIC |

Documentation détaillée : **[JOURNAL.md](./JOURNAL.md)** (types, flux de données,
exemples d'utilisation).

---

## ✅ Fonctionnalités livrées

1. **Création** — formulaire « ➕ Nouvelle séance » avec champs date (pré-remplie
   au jour local), type de sortie (5 types, libellés français), distance, durée,
   FC moyenne, ressenti, notes ; boutons **Enregistrer** / **Annuler**.
2. **Validation côté client** — messages en français sous chaque champ
   (`role="alert"`) : date obligatoire et non future, type obligatoire, distance
   > 0 et ≤ 500 km (virgule acceptée), durée > 0 et ≤ 1440 min, FC 30–230,
   ressenti 1–5, notes ≤ 500 caractères. Rien n'est enregistré si un champ est
   invalide.
3. **Liste** — tri par date décroissante puis id décroissant, compteurs,
   état vide motivant (🗒️), distances à 1 décimale, durées en H:MM, allure en
   M:SS /km, date en JJ/MM/AAAA (`<time dateTime>` accessible).
4. **Modification** — bouton « Modifier » → formulaire pré-rempli ; la
   modification remplace la séance (aucun doublon).
5. **Suppression** — bouton « Supprimer » → `window.confirm()` dont le message
   contient « irréversible » (FUNCTIONAL.md §5.5).
6. **Persistance localStorage** — les séances survivent au rechargement de la
   page (clé `sweatbook.sessions`), sauvegarde automatique à chaque mutation.
7. **Accessibilité** — labels liés aux champs, `role="alert"` sur les erreurs,
   `focus:ring-*` sur les éléments interactifs, `aria-hidden` sur les emojis.

---

## 🧪 Tests prévus

Les tests existent déjà dans le dépôt (écrits en amont) et décrivent le contrat
à respecter :

### E2E (Playwright) — `tests/e2e/journal.spec.js` (7 tests)

| # | Test | Ce qu'il vérifie |
|---|---|---|
| 1 | affiche le journal au chargement | titre, navigation (Journal/Graphiques/Planning), bouton « Nouvelle séance » |
| 2 | ajoute une séance depuis le formulaire | parcours complet, `15,5 km` et « Sortie longue » visibles |
| 3 | affiche la liste (plus récente d'abord) | ordre des cartes vérifié par position à l'écran |
| 4 | modifie une séance existante | nouvelle distance affichée, ancienne disparue, **aucun doublon** |
| 5 | supprime après confirmation | message « irréversible », séance disparue |
| 6 | refuse une distance invalide | message « distance doit être supérieure à 0 » |
| 7 | navigue entre les 3 pages | Journal → Graphiques → Planning → Journal |

### API (Vitest) — `tests/api/sessions.test.js`

Contrat REST (`GET/POST/PUT/DELETE /api/sessions`) avec validations serveur.
**Non applicable au Sprint 2** (pas de backend) : ces tests seront le critère
de validation du branchement API au Sprint 3.

> 📌 Point de vigilance : les helpers `tests/helpers/test-utils.js` attendent
> des labels précis (« Date », « Type de sortie », « Distance (km) »,
> « Durée (min) », « FC moyenne », « Ressenti », « Notes ») et un bouton
> « Enregistrer » — le `SessionForm` de Pixel les respecte.

---

## ⚖️ Écarts et décisions

### 1. Persistance localStorage au lieu de l'API (`services/api.ts`)

Le plan initial prévoyait la couche API (`src/services/api.ts` + fetch
`/api/sessions`). Le backend n'existe pas encore (seul un stub de test occupe
le port 3001), et les tests E2E rejouent des parcours complets : sans
persistance, chaque rechargement efface les séances.

✅ **Décision** : `useSessions` persiste dans `localStorage` (clé
`sweatbook.sessions`). L'interface du hook (`addSession` / `updateSession` /
`deleteSession`) est déjà celle d'un CRUD serveur : au Sprint 3, on remplace
le corps des fonctions par des `fetch()` sans toucher aux composants.

### 2. Absence de la couche API

`client/src/services/` reste vide (`.gitkeep`). La création de `api.ts`
conformément au template de [TEMPLATES.md §3](./TEMPLATES.md) est repoussée
au Sprint 3 avec le backend Express.

### 3. Coquille repérée dans `JournalScreen.tsx`

Le commentaire d'en-tête contient « **pilite** l'affichage » au lieu de
« **pilote** l'affichage ». Signalé à Pixel (BIC ne modifie pas le code).

---

## 📋 Ce qui reste à faire

- [ ] **Branchement API** : créer `client/src/services/api.ts` (template
      TEMPLATES.md §3) et rebrancher `useSessions` sur `GET/POST/PUT/DELETE
      /api/sessions` (docs/TECHNICAL.md §5.1) ;
- [ ] **Backend Express** (`server/`) : CRUD des séances + SQLite
      (développé en parallèle) ;
- [ ] Faire passer les **tests E2E** `tests/e2e/journal.spec.js` en CI (le code
      respecte le contrat, à vérifier avec `npm run dev` + Playwright) ;
- [ ] Faire passer les **tests API** `tests/api/sessions.test.js` une fois le
      backend en place ;
- [ ] **Graphiques de progression** (Sprint 3 ?) : Recharts + `/api/stats` ;
- [ ] **Planning hebdomadaire** : relié à `/api/plan` ;
- [ ] Harmoniser CONVENTIONS.md §2.1 (« bloc multi-lignes obligatoire ») et
      TEMPLATES.md (descriptions mono-ligne pour les interfaces de props) ;
- [ ] Corriger la coquille « pilite » → « pilote » dans `JournalScreen.tsx` ;
- [ ] Retirer le stub `/tmp/sweatbook-stub` quand le vrai backend sera en place.

---

## 🚀 Prochain sprint

**Sprint 3 — Backend + API REST** : mettre en place `server/` (Express + SQLite),
exposer le contrat `/api/sessions`, puis brancher le Journal dessus. Critère de
réussite : `tests/api/sessions.test.js` + `tests/e2e/journal.spec.js` au vert.

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 2. Le code est
signé Pixel ; le git est géré par Pixel (aucun commit effectué par BIC).* 📖
