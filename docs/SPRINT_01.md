# 🏃 Sprint 1 — Initialisation du frontend

> **Objectif** : poser les fondations du frontend de SweatBook (Vite + React + TypeScript +
> Tailwind CSS) et afficher un premier écran fonctionnel avec la navigation entre les
> 3 sections de l'app (Journal, Progression, Planning).
>
> **Statut** : ✅ Terminé (avec les réserves listées dans « Problèmes rencontrés »)

---

## 🎯 Objectif du sprint

Au début du projet, il n'existait **aucun code** dans le dépôt (seulement la documentation
et les tests). Ce sprint vise à :

1. Créer le projet frontend dans `client/` avec la stack **Vite + React + TypeScript**.
2. Installer et configurer **Tailwind CSS** (le framework CSS utilitaire).
3. Préparer la **structure des dossiers** prévue pour tout le projet.
4. Écrire les **types TypeScript** décrivant une séance de running.
5. Afficher un **premier écran** : en-tête, navigation et 3 sections (avec du contenu
   « placeholder », c'est-à-dire provisoire, en attendant les vraies fonctionnalités).
6. Vérifier que l'app démarre et s'affiche correctement (tests manuels **et** automatiques).

---

## 🛠️ Étapes réalisées

### 1. Initialisation de Vite + React + TypeScript

[Vite](https://vite.dev/) est un outil qui crée un squelette de projet React et qui le
relance automatiquement à chaque modification du code.

```bash
cd /tmp/SweatBook
npm create vite@latest client -- --template react-ts   # génère le squelette dans client/
cd client
npm install                                            # installe React, Vite, TypeScript…
```

> 💡 `--template react-ts` = modèle « React + TypeScript ». Le dossier `client/` est créé
> automatiquement — c'est le *frontend* (voir docs/TECHNICAL.md §3).

### 2. Installation de Tailwind CSS v4

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Configuration minimale (Tailwind v4 n'a **pas** besoin de `tailwind.config.js`) :

- `client/vite.config.ts` : ajout du plugin `tailwindcss()` (+ proxy `/api` → `localhost:3001`
  pour préparer la connexion au backend, docs/TECHNICAL.md §7.4) ;
- `client/src/index.css` : remplacé par `@import 'tailwindcss';`.

### 3. Structure des dossiers

```
client/src/
├── components/
│   └── ui/           # Composants réutilisables (Card, SectionPlaceholder…)
├── features/
│   ├── journal/      # 📓 Journal des séances      → JournalScreen.tsx
│   ├── progression/  # 📈 Graphiques de progression → ProgressionScreen.tsx
│   └── planning/     # 🗓️ Planning hebdomadaire     → PlanningScreen.tsx
├── hooks/            # Hooks personnalisés (vide pour l'instant)
├── services/         # Couche API — appel au backend (vide, Sprint 2)
├── types/            # Types TypeScript partagés  → index.ts
├── App.tsx           # Composant principal (en-tête + navigation + contenu)
└── main.tsx          # Point d'entrée (monte <App /> dans index.html)
```

### 4. Types TypeScript (`src/types/index.ts`)

Types alignés sur la base SQLite et l'API REST (docs/TECHNICAL.md §6.4) :

- `SessionType` : `'easy' | 'long' | 'interval' | 'tempo' | 'recovery'`
- `Session` : une séance réalisée (date, type, distance_km, duration_min…)
- `PlanEntry` : une entrée du planning hebdomadaire
- `WeeklyStat` : les agrégats pour les graphiques
- `SESSION_TYPE_LABELS` : les libellés français affichés dans l'UI

### 5. Premier écran (`src/App.tsx`)

- En-tête **💦 SweatBook** + sous-titre ;
- **Navigation** en 3 onglets : Journal · Progression · Planning (onglet actif en bleu,
  design *mobile-first* : une colonne sur téléphone, plus large sur desktop) ;
- Un écran placeholder par section :
  - **Journal** : description + bouton « + Nouvelle séance » (message « Sprint 2 ») ;
  - **Progression** : les 3 futurs graphiques (Volume hebdomadaire, Allure moyenne,
    Régularité) ;
  - **Planning** : grille 7 jours (lundi → dimanche).

### 6. Vérification

- `npm run build` : ✅ TypeScript compile sans erreur + build de production OK ;
- `npm run lint` (oxlint) : ✅ 0 erreur ;
- `npm run dev` : ✅ le serveur de dev répond ;
- **Vérification dans un vrai navigateur (Chromium via Playwright)** : 11 contrôles
  réussis (titre visible, 3 liens de navigation, bouton « Nouvelle séance », contenu des
  3 sections, clics qui fonctionnent). Capture d'écran mobile (390×844) validée.

---

## 💻 Commandes utilisées

| # | Commande | Rôle |
|---|---|---|
| 1 | `npm create vite@latest client -- --template react-ts` | Génère le squelette React+TS dans `client/` |
| 2 | `cd client && npm install` | Installe les dépendances du frontend |
| 3 | `npm install -D tailwindcss @tailwindcss/vite` | Installe Tailwind CSS v4 + son plugin Vite |
| 4 | `npm run build` | Vérifie la compilation TypeScript + le build |
| 5 | `npm run lint` | Vérifie la qualité du code (oxlint) |
| 6 | `npm run dev` | Démarre l'app en local (rechargement auto) |
| 7 | `git add -A && git commit && git push origin main` | Envoie le travail sur GitHub |

---

## ⚠️ Problèmes rencontrés (et solutions)

### 1. Le brief décrivait un modèle de données différent de la doc technique

Le brief du Sprint 1 proposait un type `Session` multi-sport
(`'course' | 'traction' | 'tennis' | 'force'`, champs `duree`, `fcMoyenne`…), alors que
**docs/TECHNICAL.md §6.4**, **docs/FUNCTIONAL.md**, le schéma SQL et les tests déjà présents
dans `tests/` utilisent le modèle running
(`'easy' | 'long' | 'interval' | 'tempo' | 'recovery'`, champs `distance_km`, `duration_min`…).

✅ **Décision** : on garde le modèle de la **doc technique** (qui fait foi) pour rester
cohérent avec la future API, la base de données et les tests. L'interface du brief est
conservée dans `types/index.ts` (sous le nom `BriefSession`, non utilisée) à titre de trace.

### 2. La navigation s'appelle « Progression » ici, « Graphiques » dans les tests

Le brief demande un onglet « Progression » ; les tests E2E (`tests/e2e/journal.spec.js`)
cherchent un lien nommé « Graphiques » (comme dans docs/FUNCTIONAL.md §4.2).

✅ **Décision** : l'onglet affiche **Progression**, avec un `aria-label="Progression —
Graphiques"` : les deux appellations fonctionnent, et le nom accessible reste lisible.

### 3. Le port 5173 est occupé par un processus de test

Au lancement de `npm run dev`, Vite s'est automatiquement décalé sur le **port 5174** car
le port 5173 est occupé par un processus hors dépôt : `node /tmp/sweatbook-stub/stub.mjs`
(un *stub* jetable, fourni avec l'environnement, qui simule l'API sur :3001 et une mini-UI
sur :5173 le temps que le vrai code existe).

✅ **Décision** : on **ne touche pas** au stub (les tests API en ont encore besoin faute de
backend). Quand il sera arrêté, `npm run dev` redémarrera normalement sur
**http://localhost:5173**. En attendant, l'app est vérifiée sur `http://localhost:5174`.

### 4. Template Vite : fichiers inutiles

Le squelette Vite embarque des fichiers de démo (`App.css`, logos, image `hero.png`).
Ils ont été retirés du projet (déplacés hors dépôt) pour garder une base propre.

---

## 📋 Ce qui reste à faire

- [ ] **Formulaire de séance** (« + Nouvelle séance ») : champs date, type, distance,
      durée, ressenti, notes — avec validation (distance > 0, date non future…) ;
- [ ] **Liste des séances** dans le Journal (cartes `SessionCard`, tri plus récente d'abord) ;
- [ ] **Couche API** (`src/services/api.ts`) pour parler au backend (fetch `/api/sessions`) ;
- [ ] **Graphiques de progression** (Recharts) reliés à `/api/stats` ;
- [ ] **Planning hebdomadaire** relié à `/api/plan` ;
- [ ] Aligner la structure des dossiers avec docs/TECHNICAL.md §3 (ou mettre à jour la doc) ;
- [ ] Faire passer les tests E2E de `tests/e2e/journal.spec.js` (parcours complet) ;
- [ ] Retirer le stub `/tmp/sweatbook-stub` quand le vrai backend sera en place.

---

## 🚀 Prochain sprint

**Sprint 2 — Journal des séances (CRUD complet)** :

1. Créer `src/services/api.ts` (appels `GET/POST/PUT/DELETE /api/sessions`) ;
2. Créer `SessionForm.tsx` (formulaire + validation côté client) ;
3. Créer `SessionCard.tsx` (affichage d'une séance, boutons Modifier / Supprimer) ;
4. Brancher le tout sur le backend (à développer en parallèle dans `server/`) ;
5. 🎯 Critère de réussite : les tests `tests/e2e/journal.spec.js` passent.

---

*Document rédigé pendant le Sprint 1. Une question ? Tout est expliqué dans
docs/TECHNICAL.md et docs/FUNCTIONAL.md.* 📖
