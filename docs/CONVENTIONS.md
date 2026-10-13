# 📐 SweatBook — Conventions de code

> Ce document décrit les **conventions de code** du projet SweatBook. Elles s'appliquent
> au frontend (`client/`, React + TypeScript + Tailwind) et, quand c'est pertinent,
> au backend (`server/`, Node + Express).
> 🟢 **Niveau débutant accepté** : chaque règle est illustrée par un exemple.

---

## Table des matières

1. [Conventions de nommage](#1-conventions-de-nommage)
2. [Format des commentaires JSDoc](#2-format-des-commentaires-jsdoc)
3. [Structure des composants React](#3-structure-des-composants-react)
4. [Types TypeScript](#4-types-typescript)
5. [Imports](#5-imports)
6. [Style guide (Tailwind)](#6-style-guide-tailwind)

---

## 1. Conventions de nommage

### 1.1 Fichiers

| Contenu du fichier | Convention | Exemple |
|---|---|---|
| Composant React | `PascalCase.tsx` | `SessionCard.tsx` |
| Page React | `PascalCasePage.tsx` | `JournalPage.tsx` |
| Hook personnalisé | `camelCase.ts` (préfixe `use`) | `useSessions.ts` |
| Service / logique pure | `camelCase.ts` | `api.ts` |
| Types partagés | `index.ts` dans `types/` | `types/index.ts` |
| Test API (Vitest) | `camelCase.test.js` | `sessions.test.js` |
| Test E2E (Playwright) | `camelCase.spec.js` | `journal.spec.js` |
| Script shell | `kebab-case.sh` | `check-docs.sh` |

Règles :
- **Un composant par fichier**, exporté sous le même nom que le fichier.
- Les extensions : `.tsx` dès qu'il y a du JSX, `.ts` sinon.

### 1.2 Composants, hooks, fonctions, variables

| Élément | Convention | Exemple |
|---|---|---|
| Composant React | `PascalCase` | `SessionForm`, `WeekPlanner` |
| Hook personnalisé | `camelCase`, préfixe `use` | `useSessions`, `useWeekPlan` |
| Fonction / méthode | `camelCase` | `createSession()`, `calcPace()` |
| Variable / constante locale | `camelCase` | `formData`, `weekStart` |
| Constante globale (module) | `SCREAMING_SNAKE_CASE` | `API_BASE_URL` |
| Prop de composant | `camelCase` | `initialValue`, `onDelete` |
| Callback (prop) | `on` + verbe, `handle` + verbe (interne) | `onSubmit` / `handleSubmit` |
| Type / interface | `PascalCase` | `Session`, `PlanEntry`, `WeeklyStat` |
| Type de union (enum-like) | `PascalCase` (souvent singulier) | `SessionType` |

Préfixes utiles pour les handlers :
```tsx
// ✅ Props : on + verbe ; handler interne : handle + verbe
function SessionForm({ onSubmit }: SessionFormProps) {
  const handleSubmit = () => { /* ... */ };
}
```

---

## 2. Format des commentaires JSDoc

### 2.1 Format général

- Tout **export public** (composant, hook, fonction de service, type) possède un
  bloc JSDoc **juste au-dessus** de sa déclaration.
- Rédaction **en français**, phrase commençant par un verbe ou une description nominale.
- Bloc multi-lignes obligatoire (même pour une seule ligne de description) :

```ts
/**
 * Récupère toutes les séances depuis l'API.
 * @returns {Promise<Session[]>} Liste des séances (plus récente d'abord)
 */
export async function fetchSessions(): Promise<Session[]> { /* ... */ }
```

### 2.2 Tags utilisés

| Tag | Usage | Exemple |
|---|---|---|
| (description) | 1re ligne : rôle de l'élément, préfixé du nom si composant | `Composant SessionCard - Affiche une séance` |
| `@param {Type} nom - description` | Chaque paramètre / prop | `@param {Session} session - Les données de la séance` |
| `@returns {Type} description` | Valeur retournée | `@returns {JSX.Element} Composant SessionCard` |
| `@throws {Error} description` | Erreurs possibles | `@throws {Error} Si la requête échoue` |
| `@example` | Exemple d'usage (optionnel, pour les helpers) | voir TEMPLATES.md |
| `@deprecated` | Élément à ne plus utiliser | accompagné de l'alternative |

### 2.3 Commentaires internes

- Les commentaires **dans** les fonctions sont en `//`, courts, en français.
- Commenter le **pourquoi**, pas le quoi : `// Allure en min/km (format course)` plutôt que
  `// on calcule x`.
- Une ligne vide au-dessus d'un commentaire de bloc pour aérer.

---

## 3. Structure des composants React

Ordre interne d'un fichier composant (dans cet ordre, toujours) :

1. **Imports** (voir [section 5](#5-imports)).
2. **Constantes locales** du fichier.
3. **Types des props** (`XxxProps`), exportés.
4. **Composant** : fonction fléchée ou `function`, export nommé (pas de `export default`).
5. **Sous-composants internes** (non exportés) éventuels, en bas du fichier.

Gabarit :

```tsx
// 1. Imports
import { useState } from 'react';
import type { Session } from '../types';

// 2. Constantes locales
const TYPE_LABELS: Record<SessionType, string> = { /* ... */ };

// 3. Types des props
export interface SessionCardProps {
  session: Session;
  onDelete?: (id: number) => void;
}

// 4. Composant
/**
 * Composant SessionCard - Affiche une carte de séance
 * @param {SessionCardProps} props - Les props du composant
 * @returns {JSX.Element} Composant SessionCard
 */
export function SessionCard({ session, onDelete }: SessionCardProps) {
  // ...hooks en haut, puis calculs, puis return JSX
}
```

Règles React :
- **Fonction** plutôt que classe ; **hooks en haut** du composant, avant tout autre code.
- Un seul `return JSX` principal ; extraire les blocs conditionnels complexes en
  sous-composants ou en variables JSX (`const footer = <footer>…</footer>;`).
- **Pas de `export default`** : uniquement des **exports nommés** (meilleur support
  du refactoring et du « go to definition »).
- Les clés de listes (`key=`) utilisent l'**id** stable, jamais l'index du tableau.

---

## 4. Types TypeScript

### 4.1 Nommage et organisation

- Tous les types partagés vivent dans `client/src/types/index.ts`.
- Noms en `PascalCase` : interfaces = noms de « choses » (`Session`), unions = catégories
  (`SessionType`).
- Champs alignés sur le **schéma SQL** (snake_case) pour rester cohérent avec l'API
  (`distance_km`, `week_start`…). C'est une exception assumée à la règle `camelCase`.

### 4.2 Exports

- Chaque type exporté est accompagné d'un JSDoc court.
- Exporter le type lui-même, pas un alias inutile.

```ts
/**
 * Type de sortie - Catégories de séances de course
 */
export type SessionType = 'easy' | 'long' | 'interval' | 'tempo' | 'recovery';

/**
 * Séance - Une sortie de course enregistrée dans le journal
 */
export interface Session {
  /** Identifiant unique */
  id: number;
  /** Date de la séance (format ISO YYYY-MM-DD) */
  date: string;
  /** Type de sortie */
  type: SessionType;
  /** Distance en kilomètres (> 0) */
  distance_km: number;
  /** Durée en minutes (> 0) */
  duration_min: number;
  /** Fréquence cardiaque moyenne (bpm) */
  avg_hr?: number;
  /** Ressenti de 1 (très dur) à 5 (facile) */
  feeling?: 1 | 2 | 3 | 4 | 5;
  /** Commentaire libre */
  notes?: string;
}
```

### 4.3 Bonnes pratiques

- Préférer `interface` pour les formes d'objets, `type` pour les unions et les alias.
- `?` pour les champs optionnels (alignés sur les `NULL` SQL).
- Éviter `any` ; utiliser `unknown` + réduction de type si nécessaire.
- Les props de composant : `XxxProps`, exportées depuis le fichier du composant.

---

## 5. Imports

### 5.1 Ordre (groupes séparés par une ligne vide)

1. **Librairies externes** : `react`, `recharts`, etc.
2. **Alias d'application** (si configuré) : `@/…`
3. **Chemins relatifs** : `../types`, `./SessionCard` — du plus haut (`../`) au plus proche (`./`).

Dans un même groupe, ordre **alphabétique**.

```tsx
// 1. Externes
import { useState, useEffect } from 'react';
import { LineChart, Line } from 'recharts';

// 2. Types
import type { Session, WeeklyStat } from '../types';

// 3. Services
import { fetchSessions } from '../services/api';

// 4. Composants (relatifs)
import { SessionCard } from './SessionCard';
```

### 5.2 Règles

- **Chemins relatifs** pour le code interne au `client/src` (pas d'alias obligatoire).
- Importer les types avec `import type { … }` (évite d'embarquer du code inutile).
- Un seul import par module (regrouper les noms accolés) :
  `import { useState, useEffect } from 'react';` et non deux lignes.
- Pas d'imports circulaires : `types/` ne doit importer de rien.

---

## 6. Style guide (Tailwind)

### 6.1 Principes

- Pas de fichier CSS custom sauf besoin impératif : **Tailwind uniquement**, classes
  posées dans le JSX.
- Classes regroupées par intention, dans un **ordre stable** :
  1. **Layout** : `flex`, `grid`, `block`, `inline-flex`…
  2. **Espacement** : `gap-*`, `p-*`, `m-*`
  3. **Taille** : `w-*`, `h-*`, `max-w-*`
  4. **Typographie** : `text-*`, `font-*`, `leading-*`
  5. **Couleurs** : `bg-*`, `text-*` (couleur), `border-*`
  6. **Bordures / rayons** : `rounded-*`, `border`
  7. **Effets** : `shadow-*`, `opacity-*`, `transition-*`
  8. **États** : `hover:`, `focus:`, `disabled:` (en dernier)

```tsx
// ✅ Ordre stable
<button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700">
```

### 6.2 Règles

- **Pas de valeurs magiques** : utiliser les échelles Tailwind (`p-4`, pas `padding: 15px`).
  Si une valeur est réellement spécifique, extraire une constante de classe.
- **Pas de `@apply`** dans du CSS custom (contourne Tailwind et complique la maintenance).
- Classes conditionnelles : concaténation simple ou `clsx` si déjà installé ;
  éviter les ternaires imbriquées.

```tsx
// ✅ Lisible
const classes = isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700';
```

- **Responsiveness** : mobile-first, ajouter `md:` / `lg:` seulement si nécessaire.
- **Accessibilité** : `sr-only` pour les textes d'aide, contraste suffisant, `focus:ring-*`
  sur les éléments interactifs.

---

*Document maintenu par BIC (agent documentation). Une règle manquante ? Ouvrez une issue !*
