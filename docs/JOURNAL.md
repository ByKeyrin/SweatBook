# 📓 SweatBook — Module « Journal des séances »

> Documentation du module **Journal** (`client/src/features/journal/` + `client/src/hooks/`),
> produit pendant le **Sprint 2** (voir [SPRINT_02.md](./SPRINT_02.md)).
> Conventions de code : [CONVENTIONS.md](./CONVENTIONS.md) · Gabarits JSDoc : [TEMPLATES.md](./TEMPLATES.md).
> 🟢 **Niveau débutant accepté** : chaque section est illustrée par un exemple.

---

## Table des matières

1. [Description du module](#1-description-du-module)
2. [Composants](#2-composants)
   - [SessionForm](#21-sessionform)
   - [SessionCard](#22-sessioncard)
   - [SessionList](#23-sessionlist)
   - [JournalScreen](#24-journalscreen)
3. [Hook useSessions](#3-hook-usesessions)
4. [Types utilisés](#4-types-utilisés)
5. [Flux de données](#5-flux-de-données)
6. [Exemples d'utilisation](#6-exemples-dutilisation)
7. [Conformité JSDoc (audit)](#7-conformité-jsdoc-audit)

---

## 1. Description du module

Le module Journal permet au coureur de **consigner chaque sortie de course** :
date, type de sortie, distance, durée, fréquence cardiaque, ressenti et notes.
Il couvre le parcours « Je note ma sortie du jour » du cahier de recette
(docs/FUNCTIONAL.md §6.1) avec le **CRUD complet** :

| Action | Parcours couvert |
|---|---|
| **Créer** une séance | « Je note ma sortie du jour » (formulaire + validation) |
| **Lire** la liste des séances | tri plus récente d'abord |
| **Modifier** une séance | ré-ouverture du formulaire pré-rempli |
| **Supprimer** une séance | confirmation obligatoire (« irréversible ») |

Arborescence du module :

```
client/src/
├── features/journal/
│   ├── JournalScreen.tsx   # Page : assemble formulaire + liste (conteneur)
│   ├── SessionForm.tsx     # Formulaire d'ajout / modification + validation
│   ├── SessionCard.tsx     # Carte d'affichage d'une séance + actions
│   └── SessionList.tsx     # Liste triée des SessionCard + état vide
├── hooks/
│   └── useSessions.ts      # CRUD des séances + persistance localStorage
└── types/
    └── index.ts            # Types partagés (Session, SessionType…)
```

> ⚠️ **Persistance** : au Sprint 2, les séances sont stockées dans le
> **localStorage** du navigateur (le backend n'existe pas encore). Au Sprint 3,
> `useSessions` sera rebranché sur l'API REST (`GET/POST/PUT/DELETE /api/sessions`,
> docs/TECHNICAL.md §5.1) sans changer les composants.

---

## 2. Composants

### 2.1 SessionForm

**Fichier** : `client/src/features/journal/SessionForm.tsx`

Composant `SessionForm` — Saisie et validation d'une séance du journal.
Gère à la fois la **création** et la **modification** (via la prop `initial`).

| Prop | Type | Rôle |
|---|---|---|
| `initial?` | `Session` | Séance à modifier (absente en création) |
| `onSubmit` | `(data: Omit<Session, 'id'>) => void` | Données validées à l'enregistrement |
| `onCancel` | `() => void` | Fermeture du formulaire sans enregistrer |

Champs du formulaire (labels conformes aux helpers de test `tests/helpers/test-utils.js`) :

| Label | Nom de champ | Obligatoire | Validation (FUNCTIONAL.md §5.2) |
|---|---|---|---|
| Date | `date` | ✅ | format ISO, jamais dans le futur |
| Type de sortie | `type` | ✅ | un des 5 `SessionType` |
| Distance (km) | `distance_km` | ✅ | > 0, ≤ 500, virgule française acceptée |
| Durée (min) | `duration_min` | ✅ | > 0, ≤ 1440 (24 h) |
| FC moyenne (bpm) | `avg_hr` | ❌ | entier 30–230 |
| Ressenti | `feeling` | ❌ | entier 1–5 |
| Notes | `notes` | ❌ | ≤ 500 caractères |

Points clés :
- Validation **côté client** dans `validateValues()` ; messages d'erreur affichés
  sous chaque champ avec `role="alert"` (accessibilité).
- `noValidate` sur le `<form>` : c'est la validation maison qui s'applique,
  avec des messages **en français**.
- `handleChange` efface l'erreur du champ dès que l'utilisateur le corrige.
- Rien n'est envoyé au parent tant qu'un champ est invalide.

### 2.2 SessionCard

**Fichier** : `client/src/features/journal/SessionCard.tsx`

Composant `SessionCard` — Affiche une séance en carte, avec les boutons
**Modifier** / **Supprimer** (affichés seulement si les callbacks sont fournis).

| Prop | Type | Rôle |
|---|---|---|
| `session` | `Session` | La séance à afficher |
| `onEdit?` | `(session: Session) => void` | Demande de modification |
| `onDelete?` | `(id: number) => void` | Suppression (après confirmation) |

Formats d'affichage (FUNCTIONAL.md §5.4) :

| Donnée | Format | Exemple |
|---|---|---|
| Date | `JJ/MM/AAAA` (`<time dateTime>` accessible) | `13/10/2026` |
| Distance | 1 décimale, virgule française | `15,5 km` |
| Durée | `H:MM` | `1:22` |
| Allure | `M:SS /km` (durée ÷ distance) | `5:17 /km` |
| Type | libellé français (`SESSION_TYPE_LABELS`) | `Sortie longue` |

Points clés :
- La **suppression** passe par `window.confirm()` dont le message contient
  « irréversible » (FUNCTIONAL.md §5.5) — exigence testée en E2E.
- Emoji d'illustration par type (`TYPE_ICONS`), FC et ressenti affichés seulement
  s'ils existent, notes dans un encadré dédié.

### 2.3 SessionList

**Fichier** : `client/src/features/journal/SessionList.tsx`

Composant `SessionList` — Affiche la liste des séances du journal.

| Prop | Type | Rôle |
|---|---|---|
| `sessions` | `Session[]` | Toutes les séances (l'ordre n'a pas d'importance) |
| `onCreate` | `() => void` | Ouvre le formulaire de création |
| `onEdit` | `(session: Session) => void` | Ouvre le formulaire de modification |
| `onDelete` | `(id: number) => void` | Supprime une séance |

Points clés :
- **Tri interne** : date décroissante (la plus récente d'abord), puis `id`
  décroissant pour les séances de même date (tests E2E vérifient l'ordre).
- **État vide** dédié (🗒️ « Aucune séance pour l'instant ») avec un bouton
  d'ajout, plus le bouton « + Nouvelle séance » permanent dans l'en-tête.
- Les `<li>` utilisent `key={session.id}` (id stable, jamais l'index — CONVENTIONS §3).

### 2.4 JournalScreen

**Fichier** : `client/src/features/journal/JournalScreen.tsx`

Composant `JournalScreen` — Page du journal des séances (conteneur « intelligent »).
Elle assemble `SessionForm` + `SessionList`, pilote l'affichage du formulaire
(création ou modification) et branche le hook `useSessions`.

- État interne `editor : EditorTarget | null` :
  - `null` → la liste est affichée ;
  - `{ mode: 'create' }` → formulaire vierge ;
  - `{ mode: 'edit', session }` → formulaire pré-rempli.
- `handleSubmit` distingue création (`addSession`) et modification
  (`updateSession`) puis referme le formulaire.
- La prop **`key`** du formulaire (`session.id` ou `'create'`) force sa
  réinitialisation quand la cible change.

---

## 3. Hook useSessions

**Fichier** : `client/src/hooks/useSessions.ts`

Hook `useSessions` - Gère les séances du journal avec persistance localStorage.
Charge les séances au démarrage, puis **sauvegarde automatiquement** à chaque
ajout, modification ou suppression.

**Valeur retournée** (`UseSessionsResult`) :

| Champ | Type | Rôle |
|---|---|---|
| `sessions` | `Session[]` | Liste des séances enregistrées |
| `addSession` | `(draft: SessionDraft) => Session` | Ajoute une séance, lui attribue un id, la renvoie |
| `updateSession` | `(id: number, draft: SessionDraft) => void` | Modifie une séance existante |
| `deleteSession` | `(id: number) => void` | Supprime une séance |

Détails d'implémentation :
- **Persistance** : clé `sweatbook.sessions` dans `localStorage` ; écriture
  automatique dans un `useEffect` à chaque changement de la liste. Si le
  stockage est plein/indisponible, l'erreur est ignorée (l'app reste utilisable).
- **Chargement paresseux** : `useState<Session[]>(loadSessions)` ne lit le
  localStorage qu'au premier rendu ; un contenu corrompu renvoie `[]`.
- **Génération d'id** : `max(id) + 1` (ids locaux — remplacés par les ids du
  serveur au Sprint 3).
- `SessionDraft = Omit<Session, 'id'>` : les données d'une séance **sans** id,
  utilisées à la création/modification.

---

## 4. Types utilisés

Tous les types partagés vivent dans `client/src/types/index.ts` (source de
vérité : docs/TECHNICAL.md §6.4) :

| Type | Définition | Usage dans le module |
|---|---|---|
| `SessionType` | `'easy' \| 'long' \| 'interval' \| 'tempo' \| 'recovery'` | type de sortie (formulaire, cartes) |
| `Feeling` | `1 \| 2 \| 3 \| 4 \| 5` | ressenti (formulaire) |
| `Session` | séance réalisée (`id`, `date`, `type`, `distance_km`, `duration_min`, `avg_hr?`, `feeling?`, `notes?`) | donnée principale partout |
| `SESSION_TYPE_LABELS` | `Record<SessionType, string>` | libellés français de l'UI |
| `SessionDraft` | `Omit<Session, 'id'>` (exporté par `useSessions.ts`) | payload de création/modification |

Types **internes** du module (non exportés ou locaux) :

| Type | Fichier | Rôle |
|---|---|---|
| `FormValues` | `SessionForm.tsx` | valeurs du formulaire (tout en texte, comme les inputs) |
| `FormErrors` | `SessionForm.tsx` | messages d'erreur par champ |
| `EditorTarget` | `JournalScreen.tsx` | `{ mode: 'create' } \| { mode: 'edit'; session }` |
| `UseSessionsResult` | `useSessions.ts` | contrat de retour du hook (exporté) |

> 📌 Rappel convention : les champs de `Session` sont en **snake_case**
> (`distance_km`…) pour coller au schéma SQL et à l'API — exception assumée
> à la règle camelCase (CONVENTIONS §4.1).

---

## 5. Flux de données

Le flux est **descendant** (props) et **ascendant** (callbacks), sans état global :

```
                    ┌────────────────────────────┐
                    │       JournalScreen        │
                    │  editor: EditorTarget|null │
                    │  useSessions() ────────────┼──► localStorage
                    └──────┬─────────────┬───────┘    (sweatbook.sessions)
               editor=null │             │ editor ≠ null
                           ▼             ▼
                    ┌────────────┐  ┌────────────┐
                    │ SessionList│  │ SessionForm│
                    │ (tri date) │  │ (validat°) │
                    └─────┬──────┘  └─────┬──────┘
                          ▼               │ onSubmit(data: SessionDraft)
                    ┌────────────┐        │
                    │ SessionCard│        │
                    │ onEdit ────┼────────┘ (via JournalScreen.handleSubmit)
                    │ onDelete ──┼──► deleteSession(id)
                    └────────────┘
```

Cycle d'une **création** :
1. L'utilisateur clique sur « + Nouvelle séance » → `onCreate()` → `editor = { mode: 'create' }` ;
2. `SessionForm` affiche les champs (date du jour par défaut) ;
3. `handleSubmit` valide (`validateValues`) — erreurs affichées si besoin ;
4. `onSubmit(draft)` → `addSession(draft)` → nouveau `Session` avec id →
   sauvegarde localStorage automatique ;
5. `editor` repasse à `null` → `SessionList` réaffiche la liste triée.

Cycle d'une **modification** : identique, mais `editor = { mode: 'edit', session }`,
le formulaire est pré-rempli (`initial`) et `updateSession(id, draft)` remplace
la séance **sans créer de doublon**.

Cycle d'une **suppression** : `SessionCard` → `window.confirm(« … irréversible. »)`
→ `onDelete(id)` → `deleteSession(id)`.

---

## 6. Exemples d'utilisation

### Ajouter une séance depuis un composant parent

```tsx
import { useSessions } from '../hooks/useSessions';

export function MaPage() {
  const { sessions, addSession, updateSession, deleteSession } = useSessions();

  // Création — l'id est attribué par le hook
  const created = addSession({
    date: '2026-10-13',
    type: 'easy',
    distance_km: 8,
    duration_min: 42,
    avg_hr: 145,
    feeling: 4,
  });
  console.log(created.id); // ex. 1

  // Modification puis suppression
  updateSession(created.id, { .../* mêmes champs, sans id */ });
  deleteSession(created.id);

  return <p>{sessions.length} séance(s) au journal</p>;
}
```

### Afficher une carte isolée (story / test)

```tsx
import type { Session } from '../types';
import { SessionCard } from './SessionCard';

const session: Session = {
  id: 1,
  date: '2026-10-12',
  type: 'long',
  distance_km: 15.5,
  duration_min: 82,
};

<SessionCard
  session={session}
  onEdit={(s) => console.log('modifier', s.id)}
  onDelete={(id) => console.log('supprimer', id)}
/>;
// → « 12/10/2026 · Sortie longue — 15,5 km · 1:22 · 5:17 /km »
```

### Formulaire en mode création (comme dans JournalScreen)

```tsx
<SessionForm
  onSubmit={(data) => addSession(data)}
  onCancel={() => setEditor(null)}
/>
```

---

## 7. Conformité JSDoc (audit)

Vérification des fichiers du Sprint 2 contre [TEMPLATES.md](./TEMPLATES.md)
et [CONVENTIONS.md §2](./CONVENTIONS.md) :

| Fichier | Exports publics | JSDoc description | `@param` détail props | `@returns` | Verdict |
|---|---|---|---|---|---|
| `SessionForm.tsx` | `SessionForm`, `SessionFormProps` | ✅ | ✅ | ✅ `{JSX.Element}` | ✅ Conforme |
| `SessionCard.tsx` | `SessionCard`, `SessionCardProps` | ✅ | ✅ | ✅ | ✅ Conforme |
| `SessionList.tsx` | `SessionList`, `SessionListProps` | ✅ | ✅ | ✅ | ✅ Conforme |
| `JournalScreen.tsx` | `JournalScreen` | ✅ | n/a (aucune prop) | ✅ | ✅ Conforme |
| `useSessions.ts` | `useSessions`, `UseSessionsResult`, `SessionDraft` | ✅ | ✅ | ✅ + `@example` | ✅ Conforme |

Points forts : helpers internes (`formatDate`, `validateValues`, `loadSessions`…)
également documentés avec `@param`/`@returns` ; commentaires internes en français
expliquant le **pourquoi** ; props documentées champ par champ.

Deux nuances mineures, sans impact bloquant :
1. **Préfixe des descriptions** : `JournalScreen` utilise « JournalScreen - Page du
   journal… » au lieu du gabarit « Composant X - Rôle » (CONVENTIONS §2.2).
   Les autres composants sont conformes.
2. **Multi-lignes** : CONVENTIONS §2.1 impose un bloc multi-lignes pour tout export,
   alors que TEMPLATES.md montre les interfaces de props avec une description sur
   une seule ligne (`/** Props du composant X */`). Les fichiers suivent **TEMPLATES** ;
   les deux documents sont à harmoniser (voir SPRINT_02.md « Ce qui reste à faire »).

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 2. Une erreur
trouvée dans le code ? Mentionnez-la dans une issue !* 📖
