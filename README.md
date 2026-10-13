# 🏃 SweatBook

![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38b2ac?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-yellow)

> **SweatBook** est une application web de gestion sportive dédiée au **running** 🏅.
> Enregistrez vos séances, visualisez vos progrès et organisez votre semaine d'entraînement,
> le tout dans une interface simple et agréable.

**📖 Ce README est le hub central du projet** — tout est accessible ci-dessous, section par section (cliquez sur un onglet pour le déplier). Pour la documentation complète, voir [`docs/`](docs/).

---

## 🧭 Navigation rapide

| Onglet | Contenu | Doc complète |
|---|---|---|
| [📋 Fonctionnalités](#-fonctionnalités) | Ce que fait l'app | [docs/FUNCTIONAL.md](docs/FUNCTIONAL.md) |
| [🛠️ Stack technique](#%EF%B8%8F-stack-technique) | Technologies utilisées | [docs/TECHNICAL.md](docs/TECHNICAL.md) |
| [🚀 Installation](#-installation) | Démarrage rapide | [docs/TECHNICAL.md#7-guide-de-développement](docs/TECHNICAL.md) |
| [📚 Documentation](#-documentation) | Les deux docs complètes | [docs/](docs/) |
| [🏗️ Architecture](#%EF%B8%8F-architecture) | Schéma simplifié | [docs/TECHNICAL.md#2-architecture-de-lapplication](docs/TECHNICAL.md) |
| [📖 Guide de démarrage](#-guide-de-démarrage) | Premiers pas | [docs/FUNCTIONAL.md#3-parcours-utilisateur](docs/FUNCTIONAL.md) |

---

<a id="fonctionnalites"></a>
<details>
<summary><b>📋 Fonctionnalités</b></summary>

| Fonctionnalité | Description |
|---|---|
| 📓 **Journal des séances** | Notez chaque sortie : date, distance, durée, allure, fréquence cardiaque, ressenti, notes libres. |
| 📈 **Graphiques de progression** | Visualisez l'évolution de votre distance, de votre allure et de votre volume hebdomadaire au fil du temps. |
| 📅 **Planning hebdomadaire** | Planifiez vos entraînements de la semaine (sortie longue, fractionné, récup…) et suivez ce qui reste à faire. |
| 🏃 **Suivi running** | Statistiques dédiées coureur : allure moyenne, VMA estimée, distance totale, allures par type de sortie. |

**À venir (roadmap)**

- [ ] Suivi **powerlifting** et autres sports
- [ ] Objectifs personnalisés (préparation semi-marathon, marathon…)
- [ ] Export CSV / GPX
- [ ] Mode sombre

🔗 **Voir plus →** [Description métier complète (docs/FUNCTIONAL.md)](docs/FUNCTIONAL.md) — fonctionnalités détaillées, règles métier, validations.

</details>

---

<a id="stack-technique"></a>
<details>
<summary><b>🛠️ Stack technique</b></summary>

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface utilisateur typée et composant |
| **Bundler** | [Vite](https://vitejs.dev/) | Serveur de dev rapide + build de production |
| **Styles** | [Tailwind CSS](https://tailwindcss.com/) | Design utilitaire, responsive |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | API REST |
| **Base de données** | [SQLite](https://www.sqlite.org/) (via `better-sqlite3`) | Stockage local, sans serveur de BDD |

🔗 **Voir plus →** [Documentation technique (docs/TECHNICAL.md)](docs/TECHNICAL.md) — composants React, types TypeScript, conventions Git.

</details>

---

<a id="installation"></a>
<details>
<summary><b>🚀 Installation</b></summary>

> **Prérequis** : [Node.js](https://nodejs.org/) **≥ 18** et `npm` installés.
> Vérifiez avec `node --version` dans un terminal.

**1. Cloner le projet**

```bash
git clone https://github.com/ByKeyrin/SweatBook.git
cd SweatBook
```

**2. Installer les dépendances**

```bash
# Backend (API)
cd server
npm install

# Frontend (interface)
cd ../client
npm install
```

**3. Lancer en développement**

Ouvrez **deux terminaux** (l'un pour le serveur, l'autre pour le client) :

```bash
# Terminal 1 — API sur http://localhost:3001
cd server
npm run dev
```

```bash
# Terminal 2 — App sur http://localhost:5173
cd client
npm run dev
```

Ouvrez ensuite **http://localhost:5173** dans votre navigateur. 🎉

**4. Build de production**

```bash
cd client
npm run build   # génère client/dist/
```

🔗 **Voir plus →** [Guide de développement (docs/TECHNICAL.md)](docs/TECHNICAL.md) — commandes utiles, méthode pour ajouter une fonctionnalité, erreurs fréquentes.

</details>

---

<a id="documentation"></a>
<details>
<summary><b>📚 Documentation</b></summary>

Le projet dispose de deux documents complets dans [`docs/`](docs/) :

| Document | Résumé | Pour qui ? |
|---|---|---|
| 📖 [**TECHNICAL.md**](docs/TECHNICAL.md) | Architecture client/serveur, schéma de la base de données (tables `sessions`, `plan_entries`, vue `weekly_stats`), API REST, composants React, types TypeScript, guide de développement et conventions Git. | Développeurs |
| 🎯 [**FUNCTIONAL.md**](docs/FUNCTIONAL.md) | Vision du produit, utilisateur cible (persona), parcours utilisateur, fonctionnalités détaillées, règles de gestion (allure, VMA, volume…), validations et gestion des erreurs. | Tous / métier |

🔗 **Accès direct →** [docs/TECHNICAL.md](docs/TECHNICAL.md) · [docs/FUNCTIONAL.md](docs/FUNCTIONAL.md)

</details>

---

<a id="architecture"></a>
<details>
<summary><b>🏗️ Architecture</b></summary>

Schéma simplifié du flux de données :

```text
┌───────────────────────────┐         ┌──────────────────────────┐
│   Frontend (client/)      │  HTTP   │   Backend (server/)      │
│   React + TypeScript      │ ──────► │   Node.js + Express      │
│   Vite + Tailwind CSS     │  JSON   │   API REST               │
└───────────────────────────┘ ◄────── └────────────┬─────────────┘
                                                   │ better-sqlite3
                                                   ▼
                                      ┌──────────────────────────┐
                                      │   Base de données        │
                                      │   SQLite (fichier local) │
                                      │   sessions / plan_entries│
                                      │   vue weekly_stats       │
                                      └──────────────────────────┘
```

**Structure du projet**

```
SweatBook/
├── client/                  # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Composants réutilisables (graphiques, formulaires…)
│   │   ├── pages/           # Pages de l'app (Journal, Graphiques, Planning…)
│   │   ├── services/        # Appels à l'API (fetch)
│   │   ├── types/           # Types TypeScript partagés
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── server/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/          # Endpoints API (séances, planning…)
│   │   ├── db/              # Schéma SQLite + connexion
│   │   └── index.ts         # Point d'entrée du serveur
│   └── package.json
├── docs/                    # Documentation
│   ├── TECHNICAL.md         # Doc technique (architecture, BDD, API)
│   └── FUNCTIONAL.md        # Description métier (parcours, règles)
└── README.md                # ← Vous êtes ici
```

🔗 **Voir plus →** [Architecture détaillée (docs/TECHNICAL.md)](docs/TECHNICAL.md) — flux d'une donnée, détail des endpoints, arborescence des composants.

</details>

---

<a id="guide-demarrage"></a>
<details>
<summary><b>📖 Guide de démarrage</b></summary>

**Premiers pas avec SweatBook :**

1. **Lancez l'application** — suivez le [🚀 guide d'installation](#installation) ci-dessus, puis ouvrez http://localhost:5173.
2. **Notez votre première sortie** — allez dans **📓 Journal**, cliquez sur « Ajouter une séance » et renseignez date, distance et durée (les autres champs sont optionnels).
3. **Préparez votre semaine** — ouvrez **📅 Planning** et ajoutez vos entraînements prévus (sortie longue, fractionné, récup…).
4. **Suivez vos progrès** — consultez **📈 Graphiques** pour voir l'évolution de votre distance, allure et volume hebdomadaire.

**Parcours utilisateur détaillés :**

- « Je note ma sortie du jour »
- « Je prépare ma semaine »
- « Je vérifie mes progrès »

🔗 **Voir plus →** [Parcours utilisateur (docs/FUNCTIONAL.md)](docs/FUNCTIONAL.md) — scénarios complets, règles de gestion et calculs (allure, VMA estimée…).

</details>

---

## 📸 Screenshots

> *À venir — ajoutez vos captures d'écran dans `docs/screenshots/` puis référencez-les ici.*

| Journal des séances | Graphiques de progression | Planning hebdomadaire |
|---|---|---|
| ![Journal](docs/screenshots/journal.png) | ![Graphiques](docs/screenshots/charts.png) | ![Planning](docs/screenshots/planning.png) |

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez : `git commit -m "feat: ma fonctionnalité"`
4. Poussez : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

---

## 📄 Licence

Distribué sous licence **MIT**.

Fait avec ❤️ et beaucoup de kilomètres 🏃‍♂️
