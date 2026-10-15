# 📅 SweatBook — Module « Planning hebdomadaire »

> Documentation du module **Planning** (`client/src/features/planning/` + hook
> `client/src/hooks/usePlanning.ts`), produit pendant le **Sprint 4**
> (voir [SPRINT_04.md](./SPRINT_04.md)).
> Conventions de code : [CONVENTIONS.md](./CONVENTIONS.md) · Gabarits JSDoc : [TEMPLATES.md](./TEMPLATES.md).
> 🟢 **Niveau débutant accepté** : chaque section est illustrée par un exemple.

---

## Table des matières

1. [Description du module](#1-description-du-module)
2. [Composants](#2-composants)
   - [DayCard](#21-daycard)
   - [WeekNav](#22-weeknav)
   - [PlanSessionForm](#23-plansessionform)
   - [PlanningScreen](#24-planningscreen)
3. [Hook usePlanning](#3-hook-useplanning)
4. [Données utilisées (localStorage)](#4-données-utilisées-localstorage)
5. [Navigation des semaines](#5-navigation-des-semaines)
6. [Exemples d'utilisation](#6-exemples-dutilisation)
7. [Conformité JSDoc (audit)](#7-conformité-jsdoc-audit)

---

## 1. Description du module

Le module Planning permet au coureur de **préparer sa semaine** : pour chaque
jour (lundi → dimanche), il planifie des séances (type + durée prévue) ou
laisse le jour au repos. Il couvre le parcours « Je prépare ma semaine » du
cahier de recette (docs/FUNCTIONAL.md §3.2 et §4.3).

La page assemble trois familles d'éléments :

| Élément | Rôle |
|---|---|
| **Navigation** (`WeekNav`) | Affiche la semaine courante et permet d'en changer (précédente / suivante / en cours) |
| **Grille de la semaine** (`DayCard` × 7) | Une carte par jour : séances planifiées du jour + bouton « + Ajouter » |
| **Formulaire** (`PlanSessionForm`) | Planifie une séance : jour, type, durée prévue, notes |

Arborescence du module :

```
client/src/
├── features/planning/
│   ├── PlanningScreen.tsx    # Page : assemble WeekNav + grille DayCard + formulaire
│   ├── WeekNav.tsx           # Navigation « ◀ Précédente / Suivante ▶ » + libellé de semaine
│   ├── DayCard.tsx           # Une journée de la semaine (séances planifiées + ajout)
│   └── PlanSessionForm.tsx   # Formulaire de planification (validé)
├── hooks/
│   └── usePlanning.ts        # État du planning + navigation + persistance localStorage
└── types/index.ts            # PlannedSession, PlannedType, DayOfWeek…
```

> 📌 **Bibliothèque de dates** : le module utilise **date-fns 4** (`date-fns`
> ajouté aux dépendances de `client/` pendant le Sprint 4, avec la locale
> `date-fns/locale` pour les libellés français). date-fns calcule les lundis,
> numéros de semaine ISO et intervalles de dates — moins d'erreurs de
> calendrier que du calcul maison.

> ⚠️ **Modèle de données propre au Sprint 4** : le planning utilise le type
> `PlannedSession` (`types/index.ts`), avec `PlannedType = 'course' | 'force' |
> 'tennis'` et une **durée prévue** (`planned_duration_min`). Ce modèle
> **diffère** du contrat API/SQL `PlanEntry` (`planned_type: SessionType |
> 'rest'`, `planned_km`, `session_id` — docs/TECHNICAL.md §5.2,
> `tests/api/plan.test.js`). Voir « Écarts et décisions » dans
> [SPRINT_04.md](./SPRINT_04.md).

---

## 2. Composants

### 2.1 DayCard

**Fichier** : `client/src/features/planning/DayCard.tsx`

Composant `DayCard` — Affiche un jour de la semaine et ses séances planifiées :
nom du jour, date, liste des séances (ou « Repos » si le jour est vide) et un
bouton « + Ajouter ».

| Prop | Type | Rôle |
|---|---|---|
| `dayOfWeek` | `DayOfWeek` | Le jour représenté (0 = lundi … 6 = dimanche) |
| `date` | `Date` | La date exacte de ce jour (affichée `d MMM`, ex. « 20 oct ») |
| `plans` | `PlannedSession[]` | Les séances planifiées pour ce jour |
| `onAdd` | `(dayOfWeek: DayOfWeek) => void` | Callback d'ajout (« + Ajouter ») |
| `onDelete` | `(id: number) => void` | Callback de suppression (bouton « ✕ ») |

Points clés :
- **En-tête** : nom court du jour (`DAY_SHORT_LABELS` : `Lun`, `Mar`, …) + date
  en français via `date-fns` (`format(date, 'd MMM', { locale: fr })`).
- **Séances planifiées** : une `<ul>` dont chaque `<li>` affiche l'icône
  (`PLANNED_TYPE_ICONS`), le libellé du type (`PLANNED_TYPE_LABELS`), la durée
  prévue en minutes, et les `notes` éventuelles en italique.
- **État vide** : « Repos » dans un encadré pointillé si aucune séance n'est
  planifiée ce jour-là.
- **Suppression** : bouton « ✕ » avec `aria-label` dynamique
  (`Supprimer la séance Course`, etc.).
- **Accessibilité** : emojis décoratifs en `aria-hidden="true"`,
  `focus:ring-*` sur les boutons.
- Les clés de liste utilisent `plan.id` (jamais l'index — CONVENTIONS §3).

### 2.2 WeekNav

**Fichier** : `client/src/features/planning/WeekNav.tsx`

Composant `WeekNav` — Affiche la semaine courante et permet d'en changer :
boutons « ◀ Précédente » / « Suivante ▶ », libellé de la semaine et lien
« Revenir à la semaine en cours ».

| Prop | Type | Rôle |
|---|---|---|
| `weekStart` | `Date` | Le lundi de la semaine affichée |
| `onPrevious` | `() => void` | Callback semaine précédente |
| `onNext` | `() => void` | Callback semaine suivante |
| `onToday` | `() => void` | Callback retour à la semaine en cours |

Points clés :
- **Libellé de semaine** via le helper interne `formatWeekLabel(weekStart)` :
  `Semaine {n° ISO} — {début} au {fin}`, ex. « Semaine 43 — 20 au 26 octobre ».
  Si les deux dates sont dans le même mois, le mois n'est écrit qu'une fois
  (« 20 au 26 octobre ») ; sinon aux deux bornes (« 28 oct au 3 nov »).
- Le numéro de semaine est le **numéro ISO** (`format(weekStart, 'I')`).
- Boutons avec états `hover:`, `active:scale-95` et `focus:ring-*`.

### 2.3 PlanSessionForm

**Fichier** : `client/src/features/planning/PlanSessionForm.tsx`

Composant `PlanSessionForm` — Planifie une séance future dans la semaine
affichée : formulaire validé (jour, type, durée prévue, notes) qui transmet un
`PlannedSessionDraft` au parent via `onSubmit`.

| Prop | Type | Rôle |
|---|---|---|
| `weekStart` | `Date` | Le lundi de la semaine à planifier |
| `defaultDay?` | `DayOfWeek` | Jour présélectionné (défaut : 0 = lundi) |
| `onSubmit` | `(draft: PlannedSessionDraft) => void` | Callback d'enregistrement |

Champs et validations (`validateValues`, messages en français via `role="alert"`) :

| Champ | Obligatoire ? | Règle | Message d'erreur |
|---|---|---|---|
| Jour (`day_of_week`) | ✅ | entier dans 0–6 | « Jour invalide » |
| Type (`planned_type`) | ✅ | `course` / `force` / `tennis` | « Type de séance invalide » |
| Durée prévue (`planned_duration_min`) | ✅ | nombre > 0, max 1440 min (24 h) | « La durée prévue doit être supérieure à 0 » / « … ne peut pas dépasser 24 h » |
| Notes | ❌ | 500 caractères max | « Commentaire trop long (500 caractères max) » |

Points clés :
- Les libellés du `<select>` jour incluent la date (« Lundi 20 oct ») calculée
  avec `addDays(weekStart, index)`.
- **Présélection du jour** : quand l'utilisateur clique « + Ajouter » sur une
  `DayCard`, `defaultDay` change et le formulaire sélectionne ce jour
  (ajustement pendant le rendu — pattern React officiel, sans `useEffect`).
- **Accepte la virgule décimale** dans la durée (`, remplacé par `.`).
- Après envoi, le formulaire se réinitialise **en conservant le jour**
  sélectionné (pratique pour enchaîner les planifications).
- Les erreurs disparaissent champ par champ à la saisie (`handleChange`).
- `notes` vides deviennent `undefined` (`notes.trim() || undefined`).

### 2.4 PlanningScreen

**Fichier** : `client/src/features/planning/PlanningScreen.tsx`

Composant `PlanningScreen` — Page « Planning hebdomadaire » (conteneur).
Elle assemble `WeekNav`, la grille de 7 `DayCard` et `PlanSessionForm`.

- Branche le hook **`usePlanning()`** (voir [section 3](#3-hook-useplanning))
  pour l'état de la semaine, les séances planifiées et le CRUD.
- État local `selectedDay : DayOfWeek` : le jour cliqué via « + Ajouter » est
  passé en `defaultDay` au formulaire.
- Grille responsive : 1 colonne mobile (`grid-cols-1`), 2 en tablette
  (`sm:grid-cols-2`), 7 en desktop (`lg:grid-cols-7`).
- Chaque `DayCard` reçoit `plansByDay[dayOfWeek]` et la date
  `addDays(weekStart, dayOfWeek)`.
- Chaque bloc est enfermé dans un composant `Card`
  (`components/ui/Card.tsx`) : « 🗓️ Planning de la semaine » et
  « ➕ Planifier une séance ».

---

## 3. Hook usePlanning

**Fichier** : `client/src/hooks/usePlanning.ts`

Hook `usePlanning` — Gère le planning hebdomadaire avec persistance
localStorage : charge les séances planifiées au démarrage, sauvegarde
automatiquement à chaque changement, et gère la navigation entre les semaines.

Même philosophie que `useSessions` (Sprint 2) : au Sprint 4, le backend n'est
pas encore branché, donc les données vivent dans le navigateur. Au Sprint 5, il
suffira de remplacer le contenu du hook par des appels `fetch()` sur
`/api/plan` (contrat déjà testé dans `tests/api/plan.test.js`).

**Valeur retournée** (`UsePlanningResult`) :

| Membre | Type | Rôle |
|---|---|---|
| `weekStart` | `Date` | Date du lundi de la semaine affichée |
| `plansByDay` | `PlansByDay` | Séances planifiées de la semaine, groupées par jour |
| `addPlan` | `(draft: PlannedSessionDraft) => PlannedSession` | Ajoute une séance planifiée (id auto) |
| `updatePlan` | `(id, draft) => void` | Modifie une séance planifiée |
| `deletePlan` | `(id) => void` | Supprime une séance planifiée |
| `goToPreviousWeek` | `() => void` | Affiche la semaine précédente |
| `goToNextWeek` | `() => void` | Affiche la semaine suivante |
| `goToCurrentWeek` | `() => void` | Reviens à la semaine en cours |

Types exposés :

```ts
/** Données d'une séance planifiée sans son id (à la création/modification). */
export type PlannedSessionDraft = Omit<PlannedSession, 'id'>

/** Les 7 jours de la semaine, indexés comme DayOfWeek (0 = lundi … 6 = dimanche). */
export type PlansByDay = Record<DayOfWeek, PlannedSession[]>
```

Points clés :
- **Chargement paresseux** : le localStorage n'est lu qu'au premier rendu
  (`useState<PlannedSession[]>(loadPlans)`).
- **Persistance automatique** : un `useEffect` sauvegarde la liste dès qu'elle
  change ; si le stockage est plein ou indisponible, l'erreur est ignorée.
- **Ids** : `nextId()` renvoie `max(id) + 1` sur les planifications présentes.
- **Groupement par jour** : `plansByDay` est un `useMemo` qui ne garde que les
  entrées dont `week_start` correspond à la semaine affichée, puis range
  chaque entrée dans la case de son `day_of_week`.
- Les fonctions du CRUD et de navigation sont stables (`useCallback`).

---

## 4. Données utilisées (localStorage)

Le module **ne fait aucun appel réseau** : il stocke les séances planifiées
dans le **localStorage** du navigateur, sous la clé **`sweatbook_plan`**.

```
localStorage (sweatbook_plan)
        │  lecture au 1er rendu (loadPlans)
        ▼
   usePlanning() ──► plans: PlannedSession[]
        │                │
        │                └──► plansByDay (useMemo, semaine affichée)
        │                          │
        ▼                          ▼
   addPlan / updatePlan / deletePlan   PlanningScreen
   (sauvegarde auto à chaque changement)   ├──► WeekNav (weekStart, navigation)
                                            ├──► DayCard × 7 (plansByDay[jour])
                                            └──► PlanSessionForm (addPlan)
```

**Type `PlannedSession`** (`client/src/types/index.ts`) :

| Champ | Type | Rôle |
|---|---|---|
| `id` | `number` | Identifiant unique (auto) |
| `week_start` | `string` | Date du lundi de la semaine (`'YYYY-MM-DD'`) |
| `day_of_week` | `DayOfWeek` | Jour de la semaine (0 = lundi … 6 = dimanche) |
| `planned_type` | `PlannedType` | `'course' \| 'force' \| 'tennis'` |
| `planned_duration_min` | `number` | Durée prévue en minutes |
| `notes?` | `string` | Commentaire libre (500 car. max) |

Constantes d'affichage : `PLANNED_TYPE_LABELS` (« Course », « Force »,
« Tennis ») et `PLANNED_TYPE_ICONS` (🏃, 💪, 🎾).

Exemple de contenu stocké :

```json
[
  {
    "id": 1,
    "week_start": "2026-10-19",
    "day_of_week": 0,
    "planned_type": "course",
    "planned_duration_min": 45,
    "notes": "Sortie facile, footing au parc"
  }
]
```

→ affiché : carte « Lun 20 oct » avec « 🏃 Course », « 45 min », la note, et
le bouton « ✕ » de suppression.

Flux de vie des données :
1. L'utilisateur planifie une séance → `addPlan` l'ajoute avec un id, le
   `useEffect` la sauvegarde dans le localStorage ;
2. En naviguant entre les semaines, `plansByDay` se recalcule et les 7 cartes
   se réaffichent ;
3. La suppression (`deletePlan`) retire l'entrée et la sauvegarde est immédiate.

> ⚠️ **Persistance localStorage au Sprint 4** : comme aux Sprints 2 et 3, le
> backend n'étant pas branché, le planning reste stocké dans le navigateur.
> Le futur contrat (`GET /api/plan/:weekStart`, `POST /api/plan`,
> `PUT /api/plan/:id`, `DELETE /api/plan/:id` — docs/TECHNICAL.md §5.2) est
> déjà décrit et testé dans `tests/api/plan.test.js` (skip conditionnel
> jusqu'au backend). Attention : le modèle `PlannedSession` de l'UI devra être
> aligné sur `PlanEntry` lors de ce branchement (voir
> [SPRINT_04.md](./SPRINT_04.md) « Écarts et décisions »).

---

## 5. Navigation des semaines

Le planning affiche **une semaine à la fois**, du **lundi au dimanche**
(convention européenne, docs/FUNCTIONAL.md §5.4).

| Notion | Implémentation | Exemple (au 15/10/2026) |
|---|---|---|
| Lundi de la semaine | `startOfWeek(new Date(), { weekStartsOn: 1 })` | `2026-10-12` |
| Semaine précédente | `subWeeks(weekStart, 1)` | lundi `2026-10-05` |
| Semaine suivante | `addWeeks(weekStart, 1)` | lundi `2026-10-19` |
| Revenir à aujourd'hui | recalcul de `startOfWeek(new Date())` | lundi `2026-10-12` |
| Jour de la grille | `addDays(weekStart, dayOfWeek)` | mercredi = `+2 jours` |
| Libellé | `formatWeekLabel` (numéro ISO `I`, locale `fr`) | « Semaine 43 — 12 au 18 octobre » |

Règles :
- `weekStartsOn: 1` est **toujours** passé à `startOfWeek` (lundi, pas
  dimanche) — cohérent avec `DayOfWeek` (0 = lundi).
- La navigation est **illimitée dans les deux sens** : on peut planifier une
  semaine future **ou passée** (règle métier 5.3.5 de FUNCTIONAL.md).
- `plansByDay` ne contient que la semaine affichée : changer de semaine
  n'altère pas les autres semaines planifiées, qui restent dans le localStorage.

---

## 6. Exemples d'utilisation

### 6.1 Utiliser le hook dans une page

```tsx
import { usePlanning } from '../../hooks/usePlanning';

const { weekStart, plansByDay, addPlan, deletePlan, goToNextWeek } = usePlanning();

// Planifier une séance (le hook génère l'id et sauvegarde)
addPlan({
  week_start: '2026-10-19', // lundi de la semaine
  day_of_week: 0,           // lundi
  planned_type: 'course',
  planned_duration_min: 45,
  notes: 'Sortie facile',
});
```

### 6.2 Assembler la grille (comme dans PlanningScreen)

```tsx
import { addDays } from 'date-fns';
import type { DayOfWeek } from '../../types';
import { DayCard } from './DayCard';

{([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((dayOfWeek) => (
  <DayCard
    key={dayOfWeek}
    dayOfWeek={dayOfWeek}
    date={addDays(weekStart, dayOfWeek)}
    plans={plansByDay[dayOfWeek]}
    onAdd={handleAdd}
    onDelete={deletePlan}
  />
))}
```

### 6.3 Brancher le formulaire

```tsx
import { PlanSessionForm } from './PlanSessionForm';

<PlanSessionForm weekStart={weekStart} defaultDay={selectedDay} onSubmit={addPlan} />
```

### 6.4 Navigation

```tsx
import { WeekNav } from './WeekNav';

<WeekNav
  weekStart={weekStart}
  onPrevious={goToPreviousWeek}
  onNext={goToNextWeek}
  onToday={goToCurrentWeek}
/>
```

Avec `plansByDay` vide, chaque `DayCard` affiche « Repos » — la semaine est
prête à être remplie jour après jour.

---

## 7. Conformité JSDoc (audit)

Vérification des fichiers du Sprint 4 contre [TEMPLATES.md](./TEMPLATES.md)
et [CONVENTIONS.md §2](./CONVENTIONS.md) :

| Fichier | Exports publics | JSDoc description | `@param` | `@returns` | Verdict |
|---|---|---|---|---|---|
| `DayCard.tsx` | `DayCard`, `DayCardProps` | ✅ `Composant DayCard - …` | ✅ `props` + détail des 5 props | ✅ `{JSX.Element}` | ✅ Conforme |
| `WeekNav.tsx` | `WeekNav`, `WeekNavProps` | ✅ `Composant WeekNav - …` | ✅ `props` + détail des 4 props | ✅ `{JSX.Element}` | ✅ Conforme |
| `PlanSessionForm.tsx` | `PlanSessionForm`, `PlanSessionFormProps` | ✅ `Composant PlanSessionForm - …` | ✅ `props` + détail des 3 props | ✅ `{JSX.Element}` | ✅ Conforme |
| `usePlanning.ts` | `usePlanning`, `UsePlanningResult`, `PlannedSessionDraft`, `PlansByDay` | ✅ `Hook usePlanning - …` | n/a | ✅ `{UsePlanningResult}` + `@example` | ✅ Conforme |
| `PlanningScreen.tsx` | `PlanningScreen` | ✅ `Composant PlanningScreen - …` | n/a (aucune prop) | ✅ `{JSX.Element}` | ✅ Conforme |

Points forts : helpers internes (`formatWeekLabel`, `validateValues`,
`loadPlans`, `currentWeekStartIso`) documentés avec `@param`/`@returns` ;
interfaces de props et leurs champs documentés un par un ; commentaires
internes en français expliquant le **pourquoi** (« JSON.parse peut échouer si
le contenu est corrompu : on repart de zéro ») ; exports nommés uniquement
(CONVENTIONS §3) ; imports groupés (externes d'abord, puis types relatifs) ;
`@example` présent sur le hook (TEMPLATES §2).

Nuances mineures, sans impact bloquant :
1. **Interfaces de props en mono-ligne** (`/** Props du composant X. */`) :
   suit TEMPLATES.md, mais CONVENTIONS §2.1 exige un bloc multi-lignes pour
   tout export — désalignement déjà signalé aux Sprints 2 et 3, à harmoniser.
2. **Champs de types avec commentaires `//`** dans `types/index.ts`
   (`week_start: string; // date du lundi…`) au lieu des `/** … */` demandés
   par TEMPLATES §4 — cohérent avec le code existant du fichier.
3. `currentWeekStartIso()` (`usePlanning.ts`) est documentée mais **jamais
   appelée** — code mort à retirer ou à utiliser pour initialiser `weekStart`.
4. Certains handlers internes (`handleChange`, `handleSubmit`, `handleAdd`)
   reçoivent un JSDoc mono-ligne `/** … */` alors que CONVENTIONS §2.3 prévoit
   des commentaires `//` dans les fonctions — usage toléré dans tout le repo.

---

*Document rédigé par BIC (agent documentation) pendant le Sprint 4. Une erreur
trouvée dans le code ? Mentionnez-la dans une issue !* 📖
