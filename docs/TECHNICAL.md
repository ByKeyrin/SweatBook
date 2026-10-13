# 📖 SweatBook — Documentation technique

> Ce document décrit l'architecture interne de SweatBook. Il s'adresse aux développeurs
> qui souhaitent comprendre ou faire évoluer le code.
> 🟢 **Niveau débutant accepté** : chaque concept est expliqué, n'hésitez pas à suivre pas à pas.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture de l'application](#2-architecture-de-lapplication)
3. [Structure des dossiers](#3-structure-des-dossiers)
4. [Base de données](#4-base-de-données)
5. [API REST](#5-api-rest)
6. [Composants React](#6-composants-react)
7. [Guide de développement](#7-guide-de-développement)

---

## 1. Vue d'ensemble

SweatBook est une **application web full-stack** découpée en deux parties qui communiquent
par HTTP (une API REST, au format JSON) :

```
┌─────────────────────┐         requêtes HTTP (JSON)        ┌─────────────────────┐
│   CLIENT (Frontend) │  ─────────────────────────────────▶ │   SERVEUR (Backend) │
│   React + Vite      │                                     │   Node + Express    │
│   Tailwind CSS      │  ◀───────────────────────────────── │   API REST          │
└─────────────────────┘           réponses JSON             └──────────┬──────────┘
                                                                      │ SQL
                                                                      ▼
                                                           ┌─────────────────────┐
                                                           │   SQLite (fichier)  │
                                                           │   server/data/      │
                                                           └─────────────────────┘
```

**Pourquoi cette architecture ?**
- Le **frontend** s'occupe uniquement de l'affichage et de l'expérience utilisateur.
- Le **backend** s'occupe de la logique métier et de la persistance des données.
- La **base SQLite** stocke tout dans un simple fichier (pas de serveur de BDD à installer).

---

## 2. Architecture de l'application

### 2.1 Frontend (client/)

- **React 18** : bibliothèque d'interfaces par *composants* (fonctions réutilisables qui
  retournent du HTML/JSX). Chaque bouton, formulaire ou graphique est un composant.
- **TypeScript** : surcouche de JavaScript qui ajoute des *types* (ex. : une séance a
  forcément une `date`, une `distance`…). Le compilateur vous prévient en cas d'erreur
  avant même de lancer l'app.
- **Vite** : outil qui :
  - lance un serveur de développement avec **rechargement instantané** à chaque modification ;
  - compile et optimise le code pour la production (`npm run build`).
- **Tailwind CSS** : framework CSS « utilitaire ». Au lieu d'écrire du CSS, on pose des
  classes directement dans le JSX (`class="flex gap-4 text-blue-500"`).

### 2.2 Backend (server/)

- **Node.js** : permet d'exécuter JavaScript côté serveur.
- **Express** : framework minimaliste qui facilite la création de routes HTTP
  (ex. : `GET /api/sessions` renvoie la liste des séances).
- **SQLite** via `better-sqlite3` : base de données relationnelle dans un fichier unique,
  très adaptée aux petites applications et aux débutants.

### 2.3 Flux d'une donnée (exemple : ajouter une séance)

1. L'utilisateur remplit le formulaire « Nouvelle séance » dans React.
2. Le composant appelle `createSession()` (fichier `services/api.ts`) → `fetch('POST /api/sessions')`.
3. Express reçoit la requête sur la route `POST /api/sessions`.
4. Le contrôleur **valide** les données (distance > 0, date valide…).
5. Le contrôleur exécute un `INSERT` SQL dans SQLite.
6. Le serveur répond `201 Created` avec la séance créée (JSON).
7. React met à jour son état (`useState`) → l'interface affiche la nouvelle séance.

---

## 3. Structure des dossiers

```
SweatBook/
├── client/                       # ── FRONTEND ──
│   ├── src/
│   │   ├── components/           # Composants réutilisables
│   │   │   ├── SessionForm.tsx   # Formulaire d'ajout/édition de séance
│   │   │   ├── SessionCard.tsx   # Carte affichant une séance
│   │   │   ├── ProgressChart.tsx # Graphique de progression (Recharts)
│   │   │   └── WeekPlanner.tsx   # Grille du planning hebdomadaire
│   │   ├── pages/                # Pages (une par écran de l'app)
│   │   │   ├── JournalPage.tsx   # Journal des séances
│   │   │   ├── StatsPage.tsx     # Graphiques de progression
│   │   │   └── PlanningPage.tsx  # Planning hebdomadaire
│   │   ├── services/
│   │   │   └── api.ts            # Tous les appels à l'API (fetch)
│   │   ├── types/
│   │   │   └── index.ts          # Types partagés (Session, PlanEntry…)
│   │   ├── App.tsx               # Composant racine + routage
│   │   └── main.tsx              # Point d'entrée (monte React dans index.html)
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                       # ── BACKEND ──
│   ├── src/
│   │   ├── routes/               # Une route Express par ressource
│   │   │   ├── sessions.ts       # CRUD des séances
│   │   │   ├── plan.ts           # Planning hebdomadaire
│   │   │   └── stats.ts          # Agrégats pour les graphiques
│   │   ├── db/
│   │   │   ├── index.ts          # Connexion + initialisation SQLite
│   │   │   └── schema.sql        # Schéma de la base (tables)
│   │   └── index.ts              # Démarrage du serveur Express
│   ├── data/                     # Fichier SQLite (git-ignoré)
│   └── package.json
│
├── docs/
│   ├── TECHNICAL.md              # ← Vous êtes ici
│   └── FUNCTIONAL.md             # Description métier
└── README.md
```

---

## 4. Base de données

### 4.1 Principe

SQLite fonctionne avec **un seul fichier** (`server/data/sweatbook.db`). Le schéma est
décrit dans `server/src/db/schema.sql` et exécuté automatiquement au premier démarrage.

### 4.2 Schéma (tables)

#### Table `sessions` — le journal des séances

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Identifiant unique |
| `date` | TEXT | `NOT NULL` | Date de la séance (format ISO `YYYY-MM-DD`) |
| `type` | TEXT | `NOT NULL` | Type de sortie : `easy`, `long`, `interval`, `tempo`, `recovery` |
| `distance_km` | REAL | `NOT NULL`, `CHECK (distance_km > 0)` | Distance en kilomètres |
| `duration_min` | REAL | `NOT NULL`, `CHECK (duration_min > 0)` | Durée en minutes |
| `avg_hr` | INTEGER | | Fréquence cardiaque moyenne (bpm) |
| `feeling` | INTEGER | `CHECK (feeling BETWEEN 1 AND 5)` | Ressenti de 1 (très dur) à 5 (facile) |
| `notes` | TEXT | | Commentaire libre |
| `created_at` | TEXT | `DEFAULT CURRENT_TIMESTAMP` | Horodatage de création |

```sql
CREATE TABLE IF NOT EXISTS sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT    NOT NULL,
    type         TEXT    NOT NULL CHECK (type IN ('easy','long','interval','tempo','recovery')),
    distance_km  REAL    NOT NULL CHECK (distance_km > 0),
    duration_min REAL    NOT NULL CHECK (duration_min > 0),
    avg_hr       INTEGER,
    feeling      INTEGER CHECK (feeling BETWEEN 1 AND 5),
    notes        TEXT,
    created_at   TEXT    DEFAULT CURRENT_TIMESTAMP
);
```

#### Table `plan_entries` — le planning hebdomadaire

| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Identifiant unique |
| `week_start` | TEXT | `NOT NULL` | Date du lundi de la semaine (`YYYY-MM-DD`) |
| `day_of_week` | INTEGER | `NOT NULL`, `CHECK (0-6)` | Jour (0 = lundi … 6 = dimanche) |
| `planned_type` | TEXT | `NOT NULL` | Type prévue (`easy`, `long`, `interval`, `tempo`, `recovery`, `rest`) |
| `planned_km` | REAL | | Distance prévue (km) |
| `session_id` | INTEGER | `REFERENCES sessions(id)` | Séance réalisée liée (NULL = pas encore fait) |

```sql
CREATE TABLE IF NOT EXISTS plan_entries (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start   TEXT    NOT NULL,
    day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    planned_type TEXT    NOT NULL,
    planned_km   REAL,
    session_id   INTEGER REFERENCES sessions(id)
);
```

#### Vue `weekly_stats` — agrégats pour les graphiques

```sql
CREATE VIEW IF NOT EXISTS weekly_stats AS
SELECT
    date(date, 'weekday 1', '-6 days') AS week_start, -- lundi de la semaine
    COUNT(*)                           AS session_count,
    SUM(distance_km)                   AS total_km,
    AVG(duration_min / distance_km)    AS avg_min_per_km
FROM sessions
GROUP BY week_start
ORDER BY week_start;
```

---

## 5. API REST

Base URL : `http://localhost:3001/api`
Format : **JSON**. Toutes les réponses d'erreur ont la forme `{ "error": "message" }`.

### 5.1 Séances (`/api/sessions`)

| Méthode | Endpoint | Description | Corps / Paramètres | Réponses |
|---|---|---|---|---|
| `GET` | `/sessions` | Liste toutes les séances (plus récente d'abord) | — | `200` → `Session[]` |
| `GET` | `/sessions/:id` | Une séance par son id | — | `200` → `Session` · `404` |
| `POST` | `/sessions` | Crée une séance | `{ date, type, distance_km, duration_min, avg_hr?, feeling?, notes? }` | `201` → `Session` · `400` |
| `PUT` | `/sessions/:id` | Modifie une séance | Mêmes champs que POST (partiel possible) | `200` → `Session` · `400` / `404` |
| `DELETE` | `/sessions/:id` | Supprime une séance | — | `204` · `404` |

**Exemple (curl) :**

```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-10-13","type":"long","distance_km":15.5,"duration_min":82,"feeling":4}'
```

### 5.2 Planning (`/api/plan`)

| Méthode | Endpoint | Description | Paramètres | Réponses |
|---|---|---|---|---|
| `GET` | `/plan/:weekStart` | Entrées du planning pour une semaine (`YYYY-MM-DD`, lundi) | — | `200` → `PlanEntry[]` |
| `POST` | `/plan` | Ajoute une entrée au planning | `{ week_start, day_of_week, planned_type, planned_km?, session_id? }` | `201` · `400` |
| `PUT` | `/plan/:id` | Modifie une entrée | Champs partiels | `200` · `400` / `404` |
| `DELETE` | `/plan/:id` | Supprime une entrée | — | `204` · `404` |

### 5.3 Statistiques (`/api/stats`)

| Méthode | Endpoint | Description | Réponses |
|---|---|---|---|
| `GET` | `/stats/weekly` | Série chronologique (semaine → km, nb séances, allure) | `200` → `WeeklyStat[]` |
| `GET` | `/stats/summary` | Résumé global (total km, allure moyenne, VMA estimée…) | `200` → `Summary` |

**Exemple de réponse `GET /api/stats/weekly` :**

```json
[
  { "week_start": "2026-10-05", "session_count": 3, "total_km": 24.5, "avg_min_per_km": 5.9 },
  { "week_start": "2026-10-12", "session_count": 4, "total_km": 31.2, "avg_min_per_km": 5.7 }
]
```

---

## 6. Composants React

### 6.1 Concepts clés (pour les débutants)

- **Composant** = fonction qui retourne du JSX (du HTML « enrichi »). Ex. : `function SessionCard()`.
- **Props** = paramètres passés au composant (comme des arguments de fonction).
- **État (`useState`)** = variables qui, quand elles changent, rafraîchissent automatiquement l'affichage.
- **`useEffect`** = code exécuté au chargement du composant (idéal pour appeler l'API).

### 6.2 Arborescence des composants

```
App
├── Navbar                    # Navigation (Journal / Graphiques / Planning)
├── JournalPage
│   ├── SessionForm           # Formulaire d'ajout
│   └── SessionCard[]         # Une carte par séance
├── StatsPage
│   └── ProgressChart[]       # Graphiques (distance, allure, volume)
└── PlanningPage
    └── WeekPlanner           # Grille 7 jours
        └── PlanEntryCard[]   # Une case par jour
```

### 6.3 Détail des composants principaux

| Composant | Rôle | Props principales | État interne |
|---|---|---|---|
| `SessionForm` | Saisie/édition d'une séance, validation puis appel API | `onSubmit`, `initial?` | `formData` |
| `SessionCard` | Affiche une séance (date, type, distance, allure calculée) | `session: Session`, `onDelete?` | — |
| `ProgressChart` | Graphique linéaire (via Recharts) de la progression | `data: WeeklyStat[]`, `metric` | — |
| `WeekPlanner` | Grille de la semaine, marque les jours planifiés/faits | `weekStart`, `entries: PlanEntry[]` | `entries` (drag & drop) |

### 6.4 Types TypeScript partagés (`client/src/types/index.ts`)

```ts
export type SessionType = 'easy' | 'long' | 'interval' | 'tempo' | 'recovery';

export interface Session {
  id: number;
  date: string;          // 'YYYY-MM-DD'
  type: SessionType;
  distance_km: number;
  duration_min: number;
  avg_hr?: number;
  feeling?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PlanEntry {
  id: number;
  week_start: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  planned_type: SessionType | 'rest';
  planned_km?: number;
  session_id?: number;   // séance réalisée liée
}

export interface WeeklyStat {
  week_start: string;
  session_count: number;
  total_km: number;
  avg_min_per_km: number;
}
```

---

## 7. Guide de développement

### 7.1 Commandes utiles

| Commande | Dossier | Effet |
|---|---|---|
| `npm install` | `server/` puis `client/` | Installe les dépendances |
| `npm run dev` | `server/` | Démarre l'API avec rechargement auto |
| `npm run dev` | `client/` | Démarre l'app (Vite) sur :5173 |
| `npm run build` | `client/` | Build de production dans `client/dist/` |
| `npm run lint` | `client/` | Vérifie le style du code |
| `npm test` | `server/` | Lance les tests du backend |

### 7.2 Ajouter une fonctionnalité — la méthode

1. **Typez d'abord** : ajoutez/modifiez les interfaces dans `client/src/types/index.ts`
   et le schéma SQL si besoin (`server/src/db/schema.sql`).
2. **Backend** : créez la route dans `server/src/routes/`, testez-la avec `curl` ou un client HTTP.
3. **Frontend** : ajoutez l'appel API dans `client/src/services/api.ts`.
4. **UI** : créez/modifyez les composants concernés.
5. **Vérifiez** : `npm run lint` + test manuel complet dans le navigateur.

### 7.3 Convention de messages Git

On suit les [Conventional Commits](https://www.conventionalcommits.org/) (en français dans la description) :

- `feat: ajout du graphique d'allure`
- `fix: correction du calcul d'allure moyenne`
- `docs: mise à jour de la doc API`
- `refactor: simplification de SessionForm`

### 7.4 Erreurs fréquentes (et solutions)

| Symptôme | Cause | Solution |
|---|---|---|
| `ECONNREFUSED` côté client | Le serveur n'est pas lancé | `cd server && npm run dev` |
| `fetch failed` vers `/api` | Mauvais port / proxy | Vérifier `vite.config.ts` (proxy `/api` → `:3001`) |
| `no such column` au démarrage | Le schéma a changé | Supprimer `server/data/sweatbook.db` et redémarrer (⚠️ supprime les données) |
| `port 5173 already in use` | Un ancien Vite tourne encore | Tuer le processus ou changer de port (`npm run dev -- --port 5174`) |

---

*Document maintenu par l'équipe SweatBook. Une question, une erreur dans la doc ? Ouvrez une issue !*
