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

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📓 **Journal des séances** | Notez chaque sortie : date, distance, durée, allure, fréquence cardiaque, ressenti, notes libres. |
| 📈 **Graphiques de progression** | Visualisez l'évolution de votre distance, de votre allure et de votre volume hebdomadaire au fil du temps. |
| 📅 **Planning hebdomadaire** | Planifiez vos entraînements de la semaine (sortie longue, fractionné, récup…) et suivez ce qui reste à faire. |
| 🏃 **Suivi running** | Statistiques dédiées coureur : allure moyenne, VMA estimée, distance totale, allures par type de sortie. |

### À venir (roadmap)

- [ ] Suivi **powerlifting** et autres sports
- [ ] Objectifs personnalisés (préparation semi-marathon, marathon…)
- [ ] Export CSV / GPX
- [ ] Mode sombre

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface utilisateur typée et composant |
| **Bundler** | [Vite](https://vitejs.dev/) | Serveur de dev rapide + build de production |
| **Styles** | [Tailwind CSS](https://tailwindcss.com/) | Design utilitaire, responsive |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) | API REST |
| **Base de données** | [SQLite](https://www.sqlite.org/) (via `better-sqlite3`) | Stockage local, sans serveur de BDD |

---

## 🚀 Installation

> **Prérequis** : [Node.js](https://nodejs.org/) **≥ 18** et `npm` installés.
> Vérifiez avec `node --version` dans un terminal.

### 1. Cloner le projet

```bash
git clone https://github.com/ByKeyrin/SweatBook.git
cd SweatBook
```

### 2. Installer les dépendances

```bash
# Backend (API)
cd server
npm install

# Frontend (interface)
cd ../client
npm install
```

### 3. Lancer en développement

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

### 4. Build de production

```bash
cd client
npm run build   # génère client/dist/
```

---

## 📁 Structure du projet

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

---

## 📸 Screenshots

> *À venir — ajoutez vos captures d'écran dans `docs/screenshots/` puis référencez-les ici.*

| Journal des séances | Graphiques de progression | Planning hebdomadaire |
|---|---|---|
| ![Journal](docs/screenshots/journal.png) | ![Graphiques](docs/screenshots/charts.png) | ![Planning](docs/screenshots/planning.png) |

---

## 📚 Documentation

- 📖 [Documentation technique](docs/TECHNICAL.md) — architecture, base de données, API REST, composants
- 🎯 [Description métier](docs/FUNCTIONAL.md) — utilisateur cible, parcours, règles de gestion

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

Distribué sous licence **MIT**. Voir [LICENSE](LICENSE) pour plus d'informations.

Fait avec ❤️ et beaucoup de kilomètres 🏃‍♂️
