#!/bin/bash
# Smoke test pour le Sprint 1
# Vérifie que le projet client (Vite/React/TS/Tailwind) est sain :
# structure, dépendances, compilation TypeScript et build de production.
# Usage : ./scripts/smoke-test.sh  (à lancer depuis la racine du repo)
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔍 Vérification du projet SweatBook..."

# Vérifier que client/ existe
if [ ! -d "client" ]; then
  echo "❌ Dossier client/ manquant"
  exit 1
fi

# Vérifier que package.json existe
if [ ! -f "client/package.json" ]; then
  echo "❌ client/package.json manquant"
  exit 1
fi

# Vérifier la structure des dossiers attendue (cf. docs/TECHNICAL.md §3)
echo "📁 Vérification de la structure..."
for path in "client/src" "client/index.html"; do
  if [ ! -e "$path" ]; then
    echo "❌ Élément manquant : $path"
    exit 1
  fi
done
echo "✅ Structure correcte"

# Vérifier les dépendances
cd client
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
  if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation des dépendances"
    exit 1
  fi
fi

# Vérifier TypeScript
# NB : le tsconfig racine est de type "solution" (files: [], references) :
# `tsc --noEmit` seul ne vérifierait rien. `tsc -b` type-check réellement
# src/ (tsconfig.app.json) + vite.config.ts (tsconfig.node.json), et
# tsconfig.e2e.json couvre playwright.config.ts + tests/.
echo "🔍 Vérification TypeScript..."
npx tsc -b
if [ $? -ne 0 ]; then
  echo "❌ Erreurs TypeScript (src)"
  exit 1
fi
npx tsc -p tsconfig.e2e.json --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Erreurs TypeScript (tests e2e)"
  exit 1
fi

# Vérifier le build
echo "🔨 Test du build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Erreur de build"
  exit 1
fi

echo "✅ Smoke test réussi !"
