# 📈 SweatBook — Module « Graphiques de progression »

> Documentation du module **Progression** (`client/src/features/progression/`),
> produit pendant le **Sprint 3** (voir [SPRINT_03.md](./SPRINT_03.md)).
> Conventions de code : [CONVENTIONS.md](./CONVENTIONS.md) · Gabarits JSDoc : [TEMPLATES.md](./TEMPLATES.md).
> 🟢 **Niveau débutant accepté** : chaque section est illustrée par un exemple.

---

## Table des matières

1. [Description du module](#1-description-du-module)
2. [Composants](#2-composants)
   - [DistanceChart](#21-distancechart)
   - [DurationChart](#22-durationchart)
   - [StatsCards](#23-statscards)
   - [ProgressionScreen](#24-progressionscreen)
3. [Données utilisées](#3-données-utilisées)
4. [Calculs](#4-calculs)
5. [Exemples de graphiques](#5-exemples-de-graphiques)
6. [Conformité JSDoc (audit)](#6-conformité-jsdoc-audit)

---

## 1. Description du module

Le module Progression permet au coureur de **visualiser ses progrès** à partir
des séances enregistrées dans le Journal : distance et durée au fil du temps,
ainsi que des statistiques synthétiques. Il couvre le parcours
« Je vérifie mes progrès » du cahier de recette (docs/FUNCTIONAL.md §3.3 et §4.2).

La page assemble trois familles d'éléments :

| Élément | Rôle |
|---|---|
| **Cartes de statistiques** (`StatsCards`) | 4 chiffres clés : distance totale, nombre de séances, allure moyenne, FC moyenne |
| **Filtre de période** | Boutons « 7 jours » / « 30 jours » / « 90 jours » (30 par défaut) |
| **Graphiques** (`DistanceChart`, `DurationChart`) | Courbes Recharts de la distance et de la durée par jour |

Arborescence du module :

```
client/src/
├── features/progression/
│   ├── ProgressionScreen.tsx   # Page : assemble cartes + filtre + graphiques
│   ├── DistanceChart.tsx       # Courbe « 📈 Distance — N derniers jours »
│   ├── DurationChart.tsx       # Courbe « ⏱️ Durée — N derniers jours »
│   └── StatsCards.tsx          # 4 cartes de statistiques
└── hooks/
    └── useSessions.ts          # Source des séances (persistance localStorage)
```

> 📌 **Bibliothèque de graphiques** : le module utilise **Recharts 3**
> (`recharts` ajouté aux dépendances de `client/` pendant le Sprint 3).
> Recharts dessine dans des balises `<svg>` — ce que les tests E2E vérifient
> (`tests/e2e/progression.spec.js`, test « balises SVG présentes »).

---

## 2. Composants

### 2.1 DistanceChart

**Fichier** : `client/src/features/progression/DistanceChart.tsx`

Composant `DistanceChart` — Affiche l'évolution de la distance : une **courbe
en ligne** reliant la distance totale parcourue chaque jour sur la période
choisie.

| Prop | Type | Rôle |
|---|---|---|
| `sessions` | `Session[]` | Les séances à afficher (déjà filtrées par période) |
| `days` | `number` | Nombre de jours couverts, affiché dans le titre (ex. 30) |

Points clés :
- **Agrégation par jour** via `buildPoints()` : les séances d'une même date
  sont cumulées (`distance` = somme des `distance_km`, `sessionCount` = nombre
  de séances), puis les points sont triés du plus ancien au plus récent.
- **Tooltip personnalisé** (`DistanceTooltip`, sous-composant interne) : bulle
  blanche affichant la date (`JJ/MM`), la distance à 1 décimale et le nombre
  de séances du jour.
- **État vide** : « Aucune séance sur cette période. » si aucun point.
- **Accessibilité** : le graphe est dans un `div` avec `role="img"` et
  `aria-label="Graphique de la distance par jour"`.
- Axe X : dates formatées `JJ/MM` (`formatDay`) ; axe Y : kilomètres
  (`unit=" km"`), courbe bleue `#2563eb`.

### 2.2 DurationChart

**Fichier** : `client/src/features/progression/DurationChart.tsx`

Composant `DurationChart` — Affiche l'évolution de la durée : même logique que
`DistanceChart`, mais en **minutes de course cumulées par jour**.

| Prop | Type | Rôle |
|---|---|---|
| `sessions` | `Session[]` | Les séances à afficher (déjà filtrées par période) |
| `days` | `number` | Nombre de jours couverts, affiché dans le titre (ex. 30) |

Points clés :
- Même structure que `DistanceChart` (agrégation `buildPoints`, tooltip
  `DurationTooltip`, état vide, `role="img"`).
- Axe Y : minutes (`unit=" min"`), courbe verte `#16a34a` ; durée arrondie au
  tooltip (`Math.round`).
- `aria-label="Graphique de la durée par jour"`.

> 📌 Le code de `formatDay` / `buildPoints` est aujourd'hui **dupliqué** entre
> les deux fichiers (une variante par métrique). Une mutualisation dans un
> helper commun est possible — voir SPRINT_03.md « Ce qui reste à faire ».

### 2.3 StatsCards

**Fichier** : `client/src/features/progression/StatsCards.tsx`

Composant `StatsCards` — Affiche les statistiques du mois en cours : une
rangée de **4 cartes**.

| Prop | Type | Rôle |
|---|---|---|
| `sessions` | `Session[]` | Toutes les séances du journal (le mois en cours est extrait) |

Les 4 cartes (calculs détaillés en [section 4](#4-calculs)) :

| Emoji | Titre | Valeur | Unité |
|---|---|---|---|
| 📏 | Distance totale | Σ `distance_km` du mois en cours (1 décimale) | km (mois en cours) |
| 🏃 | Séances | nombre de séances du mois en cours | séances (mois en cours) |
| ⚡ | Allure moyenne | vitesse moyenne du mois (1 décimale) ou `—` | km/h |
| ❤️ | FC moyenne | moyenne des `avg_hr` renseignés (arrondie) ou `—` | bpm |

- Les calculs sont extraits dans le helper interne **`buildCards(sessions)`**
 (documenté `@param`/`@returns`), puis **mémorisés** avec `useMemo`
 (dépendance `[sessions]`) : ils ne sont recalculés que quand les séances
 changent.
- Grille responsive : 2 colonnes mobile, 4 colonnes à partir de `lg:`.
- Chaque carte porte un `data-testid="stat-card"` (contrat des tests E2E,
 `client/tests/helpers/progression.ts`).
- Emojis décoratifs en `aria-hidden="true"`.

### 2.4 ProgressionScreen

**Fichier** : `client/src/features/progression/ProgressionScreen.tsx`

Composant `ProgressionScreen` — Page « Graphiques de progression » (conteneur).
Elle assemble `StatsCards`, le filtre de période et les deux graphiques.

- Branche le hook **`useSessions()`** pour lire les séances (localStorage —
  voir [section 3](#3-données-utilisées)).
- État `periodDays : 7 | 30 | 90` (défaut : **30**) piloté par trois boutons
  (`role="group"`, `aria-label="Filtrer par période"`) ; le bouton actif est
  bleu (`border-blue-600 bg-blue-600`), les autres blancs avec survol.
- Les séances sont filtrées par `filterLastDays()` puis passées aux deux
  graphiques ; `StatsCards` reçoit en revanche **toutes** les séances (elle
  extrait elle-même le mois en cours).
- Chaque graphique est enfermé dans un composant `Card`
  (`components/ui/Card.tsx`).

---

## 3. Données utilisées

Le module **ne fait aucun appel réseau** : il lit les séances du Journal via le
hook `useSessions()` (`client/src/hooks/useSessions.ts`), qui persiste dans le
**localStorage** du navigateur (clé `sweatbook.sessions`).

```
localStorage (sweatbook.sessions)
        │  lecture au 1er rendu (loadSessions)
        ▼
   useSessions() ──► sessions: Session[]
        │
        ▼
 ProgressionScreen ──► filterLastDays(sessions, periodDays)
        │                    │
        │                    ├──► DistanceChart (distance/jour)
        │                    └──► DurationChart (durée/jour)
        └──► StatsCards (toutes les séances → mois en cours)
```

Flux de vie des données :
1. L'utilisateur ajoute / modifie / supprime une séance dans le **Journal** →
   `useSessions` sauvegarde automatiquement dans le localStorage ;
2. En ouvrant **Progression**, `useSessions` recharge la liste → les graphiques
   et cartes se recalculent (« Les calculs sont recalculés partout »,
   scénario 4 de docs/FUNCTIONAL.md §6.1) ;
3. Le filtre de période ne fait que restreindre la fenêtre affichée.

> ⚠️ **Persistance localStorage au Sprint 3** : comme au Sprint 2, le backend
> n'étant pas encore branché, les séances restent stockées dans le navigateur.
> Le futur contrat API (`GET /api/stats/weekly`, `GET /api/stats/summary` —
> docs/TECHNICAL.md §5.3) est déjà décrit et testé dans
> `tests/api/stats.test.js` : le type `WeeklyStat` de `types/index.ts`
> (`week_start`, `session_count`, `total_km`, `avg_min_per_km`) est prêt à
> remplacer les agrégations côté client.

**Types utilisés** (`client/src/types/index.ts`) :

| Type | Usage dans le module |
|---|---|
| `Session` | donnée source des graphiques et des cartes (`date`, `distance_km`, `duration_min`, `avg_hr?`) |
| `WeeklyStat` | non encore consommé — contrat du futur `GET /api/stats/weekly` |

Types **internes** du module (non exportés ou locaux) :

| Type | Fichier | Rôle |
|---|---|---|
| `DistancePoint` | `DistanceChart.tsx` | point du graphe : `date`, `label` (JJ/MM), `distance`, `sessionCount` |
| `DurationPoint` | `DurationChart.tsx` | point du graphe : `date`, `label`, `duration`, `sessionCount` |
| `DistanceTooltipProps` / `DurationTooltipProps` | fichiers respectifs | état du survol fourni par Recharts (`active`, `payload`) |
| `StatCard` | `StatsCards.tsx` | carte d'affichage : `emoji`, `title`, `value`, `unit`, `accent` |
| `PeriodDays` | `ProgressionScreen.tsx` | `7 \| 30 \| 90` (dérivé de `PERIODS`) |

---

## 4. Calculs

### 4.1 Agrégation par jour (graphiques)

`buildPoints()` (dans chaque graphique) regroupe les séances par date ISO
(une `Map<string, Point>`) :

```
distance du jour = Σ distance_km des séances de la date   (DistanceChart)
durée du jour    = Σ duration_min des séances de la date  (DurationChart)
sessionCount     = nombre de séances de la date
```

Les points sont ensuite triés par `date` croissante (`localeCompare`). Les
dates ISO `YYYY-MM-DD` se comparent correctement en chaînes de caractères.

### 4.2 Filtre de période

`filterLastDays(sessions, days)` (dans `ProgressionScreen.tsx`) :

```
sinceIso = aujourd'hui (date locale) − (days − 1) jours, au format 'YYYY-MM-DD'
séances retenues = celles dont date >= sinceIso, triées par date croissante
```

Exemple avec `days = 7` le 15/10/2026 : `sinceIso = '2026-10-09'` → les
séances du 09/10 au 15/10 inclus sont affichées.

### 4.3 Cartes de statistiques (mois en cours)

`buildCards()` (dans `StatsCards.tsx`) filtre d'abord les séances du mois en
cours (préfixe `YYYY-MM` comparé à `session.date`), puis calcule :

| Calcul | Formule | Cas limite |
|---|---|---|
| Distance totale | `Σ distance_km` | `0.0 km` si aucune séance |
| Nombre de séances | `monthSessions.length` | `0` |
| Allure moyenne | `totalKm / (totalMin / 60)` → **km/h** | `—` si `totalMin = 0` |
| FC moyenne | `Σ avg_hr / nb de séances avec avg_hr` (sur **toutes** les séances) | `—` si aucune FC |

> ⚠️ **Points de vigilance signalés à Pixel** (BIC ne modifie pas le code) :
> 1. La carte « Allure moyenne » affiche en réalité une **vitesse en km/h**
>    (`totalKm / heures`). Or FUNCTIONAL.md §4.4 définit l'allure en
>    **min/km** — et le reste de l'app (SessionCard, type `WeeklyStat`)
>    utilise bien `min/km`. Allure min/km = `Σ duration_min / Σ distance_km`.
> 2. La FC moyenne est calculée sur **toutes** les séances, alors que les
>    trois autres cartes portent sur le **mois en cours** (incohérence de périmètre).

### 4.4 Allure — rappel des définitions

| Grandeur | Formule | Exemple | Où |
|---|---|---|---|
| Allure (min/km) | `duration_min / distance_km` | 82 min / 15,5 km = 5:17 /km | SessionCard, `WeeklyStat.avg_min_per_km` |
| Allure pondérée globale | `Σ duration_min / Σ distance_km` | — | futur `GET /api/running` |
| Vitesse (km/h) | `Σ distance_km / (Σ duration_min / 60)` | 82,1 km/h… non : 15,5/(82/60) = 11,3 km/h | carte « Allure moyenne » de StatsCards ⚠️ |

---

## 5. Exemples de graphiques

### 5.1 Ce que rend Recharts

Chaque graphique est un `LineChart` enveloppé dans un `ResponsiveContainer`
(100 % de largeur, hauteur 256 px) :

```
📈 Distance — 30 derniers jours
 12 ┤                    ╭─•
    │         ╭─•─╮     ╭╯
  8 ┤   ╭─•───╯   ╰─•───╯
    │ •─╯
  4 ┼────────────────────────
    01/10  03/10  06/10  …  15/10      ← axe X : labels JJ/MM

Éléments : grille pointillée (CartesianGrid), axe Y avec unité (« km » ou
« min »), tooltip personnalisé au survol, ligne monotone avec points.
```

### 5.2 Jeu de données → points du graphe

Avec ces séances (localStorage) sur la période :

| date | type | distance_km | duration_min |
|---|---|---|---|
| 2026-10-12 | easy | 8 | 45 |
| 2026-10-12 | recovery | 4 | 25 |
| 2026-10-14 | long | 15,5 | 82 |

`DistanceChart` produit ces points (`buildPoints`) :

| label | distance | sessionCount |
|---|---|---|
| 12/10 | 12,0 | 2 |
| 14/10 | 15,5 | 1 |

`DurationChart` produit : `12/10 → 70 min (2 séances)`, `14/10 → 82 min (1 séance)`.

### 5.3 Utilisation des composants

```tsx
import type { Session } from '../types';
import { DistanceChart } from './DistanceChart';
import { DurationChart } from './DurationChart';
import { StatsCards } from './StatsCards';

// sessions déjà filtrées sur les 30 derniers jours (comme dans ProgressionScreen)
<StatsCards sessions={sessions} />
<DistanceChart sessions={filteredSessions} days={30} />
<DurationChart sessions={filteredSessions} days={30} />
```

Avec `filteredSessions` vide, les graphiques affichent
« Aucune séance sur cette période. » — les cartes affichent `0`, `0`, `—`, `—`.

### 5.4 Tooltips personnalisés

Au survol d'un point, Recharts appelle le composant tooltip avec `active` et
`payload` ; `DistanceTooltip` affiche alors :

```
┌─────────────┐
│ 14/10       │
│ Distance :  │
│   15,5 km   │
│ 1 séance    │
└─────────────┘
```

---

## 6. Conformité JSDoc (audit)

Vérification des fichiers du Sprint 3 contre [TEMPLATES.md](./TEMPLATES.md)
et [CONVENTIONS.md §2](./CONVENTIONS.md) :

| Fichier | Exports publics | JSDoc description | `@param` | `@returns` | Verdict |
|---|---|---|---|---|---|
| `DistanceChart.tsx` | `DistanceChart`, `DistanceChartProps` | ✅ `Composant DistanceChart - …` | ✅ `props` | ✅ `{JSX.Element}` | ✅ Conforme |
| `DurationChart.tsx` | `DurationChart`, `DurationChartProps` | ✅ `Composant DurationChart - …` | ✅ `props` | ✅ `{JSX.Element}` | ✅ Conforme |
| `StatsCards.tsx` | `StatsCards`, `StatsCardsProps` | ✅ `Composant StatsCards - …` | ✅ `props` | ✅ `{JSX.Element}` | ✅ Conforme |
| `ProgressionScreen.tsx` | `ProgressionScreen` | ✅ `Composant ProgressionScreen - …` | n/a (aucune prop) | ✅ | ✅ Conforme |

Points forts : helpers internes (`formatDay`, `buildPoints`, `filterLastDays`)
et tooltips (`DistanceTooltip`, `DurationTooltip`, `buildCards`) documentés avec
`@param`/`@returns` ; interfaces et champs documentés un par un ; commentaires
internes en français expliquant le **pourquoi** (« Dates ISO : on compare
directement les chaînes ») ; exports nommés uniquement (CONVENTIONS §3) ;
imports groupés (Recharts d'abord, puis types relatifs).

Nuances mineures, sans impact bloquant :
1. **Interfaces de props en mono-ligne** (`/** Props du composant X. */`) :
   suit TEMPLATES.md, mais CONVENTIONS §2.1 exige un bloc multi-lignes pour
   tout export — désalignement déjà signalé au Sprint 2, à harmoniser.
2. **Détail des props dans le `@param`** : TEMPLATES demande
   `@param {Session} props.session - …` pour chaque prop ; les fichiers se
   contentent de `@param {XxxProps} props - …`. Les champs sont toutefois
   documentés dans l'interface exportée (information présente).
3. `@returns {JSX.Element | null}` sur les tooltips : légèrement différent du
   gabarit `{JSX.Element}`, mais plus fidèle au code (retour `null` possible).

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 3. Une erreur
trouvée dans le code ? Mentionnez-la dans une issue !* 📖
