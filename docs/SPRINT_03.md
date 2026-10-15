# 📈 Sprint 3 — Graphiques de progression

> **Objectif** : transformer la page « Graphiques » (simple placeholder depuis
> le Sprint 1) en tableau de bord de progression : statistiques clés, courbes
> de distance et de durée, filtre de période — le tout alimenté par les séances
> du Journal.
>
> **Statut** : 🟡 Fonctionnel en local (persistance localStorage — voir « Écarts
> et décisions »). Quelques écarts avec le cahier de recette restent à traiter
> (voir « Écarts et décisions »).

---

## 🎯 Objectif du sprint

Reprendre la feuille de route du [SPRINT_02.md](./SPRINT_02.md) (« Graphiques de
progression (Sprint 3 ?) ») et le cahier de recette (docs/FUNCTIONAL.md §4.2) :

1. Créer les **composants de graphiques** avec Recharts
   (`DistanceChart`, `DurationChart`) ;
2. Ajouter des **cartes de statistiques** (`StatsCards`) : distance totale,
   nombre de séances, allure moyenne, FC moyenne ;
3. Assembler le tout dans **`ProgressionScreen`** avec un **filtre de période**
   (7 / 30 / 90 jours) ;
4. Alimenter le module avec les séances du Journal via **`useSessions`**
   (localStorage) ;
5. 🎯 Critère de réussite : la page « Graphiques » affiche des courbes SVG
   qui reflètent les séances enregistrées.

---

## 🧩 Composants créés

| Fichier | Rôle | Auteur |
|---|---|---|
| `client/src/features/progression/DistanceChart.tsx` | Courbe Recharts de la distance cumulée par jour + tooltip personnalisé | Pixel |
| `client/src/features/progression/DurationChart.tsx` | Courbe Recharts de la durée cumulée par jour + tooltip personnalisé | Pixel |
| `client/src/features/progression/StatsCards.tsx` | 4 cartes de statistiques (distance totale, séances, allure, FC) | Pixel |
| `client/src/features/progression/ProgressionScreen.tsx` | Page conteneur : cartes + filtre de période (7/30/90 j) + graphiques | Pixel (réécrit) |
| `client/tests/helpers/progression.ts` | Helpers E2E : injection de séances de test dans le localStorage (`seedSessions`) | Pixel |
| `client/package.json` | Ajout de la dépendance `recharts@^3.10.1` | Pixel |
| `docs/PROGRESSION.md` | Documentation du module Progression | BIC |
| `docs/SPRINT_03.md` | Ce document | BIC |

Documentation détaillée : **[PROGRESSION.md](./PROGRESSION.md)** (composants,
données, calculs, exemples de graphiques).

---

## ✅ Fonctionnalités livrées

1. **Cartes de statistiques** — 4 cartes responsive (2 colonnes mobile,
   4 colonnes desktop) : 📏 distance totale du mois en cours (1 décimale),
   🏃 nombre de séances du mois, ⚡ allure moyenne, ❤️ FC moyenne (les deux
   dernières affichent `—` sans donnée).
2. **Graphique « 📈 Distance — N derniers jours »** — courbe Recharts de la
   distance cumulée par jour, tooltip personnalisé (date `JJ/MM`, distance à
   1 décimale, nombre de séances), état vide dédié.
3. **Graphique « ⏱️ Durée — N derniers jours »** — même logique en minutes de
   course par jour (courbe verte).
4. **Filtre de période** — boutons « 7 jours » / « 30 jours » (défaut) /
   « 90 jours » ; les deux graphiques sont recalculés et réaffichés.
5. **Agrégation par jour** — les séances d'une même date sont cumulées
   (distance, durée, compteur), les points triés chronologiquement.
6. **Accessibilité** — `role="img"` + `aria-label` sur chaque graphique,
   `role="group"` sur le filtre, emojis en `aria-hidden`, états `hover:` et
   bouton actif visuellement distinct.
7. **Persistance** — les graphiques reflètent en temps réel les séances du
   Journal (`useSessions`, localStorage `sweatbook.sessions`) : ajouter ou
   supprimer une séance met à jour les courbes et les cartes.

---

## 🧪 Tests prévus

### E2E (Playwright) — `tests/e2e/progression.spec.js` (3 tests, contrat écrit en amont)

| # | Test | Ce qu'il vérifie |
|---|---|---|
| 1 | affiche les trois graphiques de progression | titres « Volume hebdomadaire », « Allure moyenne », « Régularité » |
| 2 | dessine les graphiques (balises SVG présentes) | au moins un `<svg>` de Recharts est visible |
| 3 | change la période affichée (3 mois) | bouton « 3 mois », la page reste utilisable |

> ⚠️ **Écart d'interface** : ces tests reflètent le cahier de recette initial
> (3 graphiques hebdomadaires + période « 4 semaines / 3 mois / tout »), alors
> que l'implémentation livre 2 graphiques quotidiens (distance, durée) +
> 4 cartes de stats, avec un filtre **7 / 30 / 90 jours** (libellés
> « 7 jours », « 30 jours », « 90 jours »). Les tests 1 et 3 échoueront en
> l'état — soit les tests sont mis à jour, soit l'UI est alignée sur
> FUNCTIONAL.md §4.2 (voir « Ce qui reste à faire »).

### Helpers E2E — `client/tests/helpers/progression.ts` (nouveau, côté client)

- `makeSeedSessions()` : jeu de 9 séances réparties sur 120 jours (3 dans les
  7 derniers jours, 2 de plus dans les 30, 2 de plus dans les 90, 1 hors
  période) pour rendre chaque filtre **visible et vérifiable** ;
- `seedSessions(page, sessions?)` : ouvre l'app (`goto`), écrit les séances
  dans le localStorage (`page.evaluate`), puis **recharge** la page pour que
  React les relise — plus rapide que de passer par le formulaire du Journal,
  et compatible avec les tests de suppression (l'écriture est ponctuelle,
  contrairement à `addInitScript`) ;
- `openProgression(page)` : ouvre la page via le lien de navigation
  (aria-label « Progression — Graphiques »).

> 📌 **Contrat d'interface respecté** : le helper documente les sélecteurs
> `data-testid="stat-card"` (4 cartes de `StatsCards`) et
> `data-testid="period-filter"` (boutons de période de `ProgressionScreen`) ;
> les deux attributs sont bien présents dans le code livré par Pixel.

### E2E (Playwright, client) — `client/tests/progression.spec.ts` (6 tests, en cours — Pixel)

| # | Test | Ce qu'il vérifie |
|---|---|---|
| 1 | la page progression se charge | titre « 📈 Progression » |
| 2 | les 4 cartes de stats sont visibles | `data-testid="stat-card"` × 4 |
| 3 | le graphique distance est affiché | titre + `role="img"` (SVG Recharts) |
| 4 | le graphique durée est affiché | titre + `role="img"` (SVG Recharts) |
| 5 | le filtre par période fonctionne (7j, 30j, 90j) | `data-testid="period-filter"` + effets visibles |
| 6 | les données affichées viennent du localStorage | `seedSessions` → courbes alimentées |

Cette suite couvre l'**UI livrée** (et non le contrat historique de
`tests/e2e/progression.spec.js`) — elle utilise `seedSessions` et
`openProgression` de `client/tests/helpers/progression.ts`.

### API (Vitest) — `tests/api/stats.test.js`

Contrat `GET /api/stats/weekly` → `WeeklyStat[]` et `GET /api/stats/summary` →
`Summary` (docs/TECHNICAL.md §5.3). **Non applicable au Sprint 3** (pas de
backend) : les calculs sont faits côté client sur le localStorage. Ces tests
resteront le critère de validation du futur branchement API.

---

## ⚖️ Écarts et décisions

### 1. Persistance localStorage maintenue (pas d'API)

Comme au Sprint 2, `useSessions` reste branché sur le localStorage (clé
`sweatbook.sessions`) : le backend n'existe pas encore. Le module Progression
est donc **totalement autonome** (aucun appel réseau) et se contente de lire
le journal. Le futur branchement (`GET /api/stats/weekly` / `summary`) ne
demandera qu'une bascule du hook, les composants consommant déjà des `Session[]`.

### 2. Périmètre des graphiques différent du cahier de recette

FUNCTIONAL.md §4.2 prévoit 3 graphiques **hebdomadaires** (volume km,
allure min/km, régularité) avec **moyenne glissante** et période
« 4 dernières semaines / 3 mois / tout ». Le Sprint 3 livre deux courbes
**journalières** (distance, durée) + 4 cartes de stats, période
7 / 30 / 90 jours. Le regroupement par semaine (type `WeeklyStat`, déjà défini
dans `types/index.ts`) et la moyenne glissante restent à faire.

### 3. La carte « Allure moyenne » affiche une vitesse (km/h)

`StatsCards` calcule `totalKm / (totalMin / 60)` — une **vitesse en km/h** —
sous un intitulé « Allure moyenne », alors que FUNCTIONAL.md §4.4 et le reste
de l'app (SessionCard, `WeeklyStat.avg_min_per_km`) utilisent l'allure en
**min/km**. De plus, la FC moyenne porte sur toutes les séances quand les
autres cartes portent sur le mois en cours. Signalé à Pixel (BIC ne modifie
pas le code).

### 4. Tests E2E historiques non alignés

`tests/e2e/progression.spec.js` (titres « Volume hebdomadaire / Allure
moyenne / Régularité », bouton « 3 mois ») et `tests/README.md` §5.1
décrivent l'interface attendue par la recette ; l'implémentation actuelle
s'en écarte (cf. §2). À arbitrer : mettre à jour les tests vers l'UI livrée,
ou compléter l'UI pour la recette.

### 5. Code dupliqué entre les deux graphiques

`formatDay` et `buildPoints` sont copiés dans `DistanceChart.tsx` et
`DurationChart.tsx` (une variante par métrique). Un helper commun
(ex. `buildDailyPoints(sessions, metric)`) réduirait la duplication.

---

## 📋 Ce qui reste à faire

- [ ] **Arbitrer le contrat UI/tests** : aligner `tests/e2e/progression.spec.js`
      et `tests/README.md` §5.1 avec l'UI livrée (ou ajouter les graphiques
      « Volume hebdomadaire », « Allure moyenne », « Régularité » prévus par
      FUNCTIONAL.md §4.2) ;
- [x] **`data-testid` du contrat de test** : `stat-card` (StatsCards) et
      `period-filter` (ProgressionScreen) posés par Pixel — contrat
      `client/tests/helpers/progression.ts` respecté ;
- [ ] Corriger la carte **« Allure moyenne »** : afficher des min/km
      (`Σ duration_min / Σ distance_km`) et harmoniser le périmètre de la FC
      moyenne (mois en cours ?) ;
- [ ] Ajouter la **moyenne glissante** sur les graphiques (FUNCTIONAL.md §4.2) ;
- [ ] Éventuellement : graphique **hebdomadaire** (agrégat `WeeklyStat`) et
      mutualisation de `formatDay` / `buildPoints` ;
- [🟡] **Tests E2E** utilisant `seedSessions` : `client/tests/progression.spec.ts`
      (6 tests) en cours d'écriture par Pixel — couvre le filtre 7/30/90 jours
      et les graphiques ; à compléter par les états vides ;
- [ ] Faire passer les **tests API** `tests/api/stats.test.js` une fois le
      backend en place (branchement `useSessions` sur `/api/sessions`) ;
- [ ] **Planning hebdomadaire** : relié à `/api/plan` (Sprint 4 ?) ;
- [ ] Harmoniser CONVENTIONS.md §2.1 (« bloc multi-lignes obligatoire ») et
      TEMPLATES.md (descriptions mono-ligne pour les interfaces de props) ;
- [ ] Corriger la coquille « pilite » → « pilote » dans `JournalScreen.tsx`
      (toujours présente) ;
- [ ] Retirer le stub `/tmp/sweatbook-stub` quand le vrai backend sera en place.

---

## 🚀 Prochain sprint

**Sprint 4 — Backend + API REST** : mettre en place `server/` (Express +
SQLite), exposer les contrats `/api/sessions` et `/api/stats`, puis brancher le
Journal et la Progression dessus. Critère de réussite :
`tests/api/sessions.test.js` + `tests/api/stats.test.js` +
`tests/e2e/journal.spec.js` au vert.

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 3. Le code est
signé Pixel ; le git est géré par Pixel (aucun commit effectué par BIC).* 📖
