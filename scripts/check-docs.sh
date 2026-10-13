#!/usr/bin/env bash
# =============================================================================
# check-docs.sh — Vérification de la documentation SweatBook
#
# Vérifie :
#   1. Que les fichiers de documentation existent.
#   2. Que les exports de TypeScript (client/src et server/src) possèdent un
#      commentaire JSDoc juste au-dessus de leur déclaration.
#
# Usage :
#   ./scripts/check-docs.sh          # vérification complète
#   ./scripts/check-docs.sh --help   # aide
#
# Codes de sortie :
#   0 — tout est en ordre
#   1 — au moins une vérification a échoué
# =============================================================================
set -u

# --- Configuration -----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Fichiers de documentation obligatoires (relatifs à la racine du dépôt)
REQUIRED_DOCS=(
  "README.md"
  "docs/TECHNICAL.md"
  "docs/FUNCTIONAL.md"
  "docs/CONVENTIONS.md"
  "docs/TEMPLATES.md"
)

# Dossiers scannés pour la présence de JSDoc sur les exports
SRC_DIRS=(
  "client/src"
  "server/src"
)

ERRORS=0
WARNINGS=0

# --- Couleurs (désactivées si la sortie n'est pas un TTY) --------------------
if [ -t 1 ]; then
  GREEN=$'\033[32m'; RED=$'\033[31m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  GREEN=""; RED=""; YELLOW=""; BOLD=""; RESET=""
fi

ok()   { echo "${GREEN}✔${RESET} $*"; }
fail() { echo "${RED}✘${RESET} $*"; ERRORS=$((ERRORS + 1)); }
warn() { echo "${YELLOW}!${RESET} $*"; WARNINGS=$((WARNINGS + 1)); }

# --- Aide --------------------------------------------------------------------
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  sed -n '2,17p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 0
fi

echo "${BOLD}=== Vérification de la documentation SweatBook ===${RESET}"
echo

# --- 1. Fichiers de documentation --------------------------------------------
echo "${BOLD}[1/2] Fichiers de documentation${RESET}"
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ -f "$ROOT_DIR/$doc" ]; then
    ok "$doc existe"
  else
    fail "$doc manquant"
  fi
done
echo

# --- 2. JSDoc sur les exports TypeScript -------------------------------------
echo "${BOLD}[2/2] Commentaires JSDoc sur les exports${RESET}"

scan_exports() {
  local dir="$1"
  local found_files=0
  local missing=0

  # Parcours récursif des fichiers .ts / .tsx (hors node_modules)
  while IFS= read -r -d '' file; do
    found_files=$((found_files + 1))

    # awk : pour chaque ligne de déclaration d'export, vérifie que le bloc
    # commentaires JSDoc se termine (*/) sur la ligne non-vide précédente.
    local result
    result=$(awk '
      {
        lines[NR] = $0
      }
      END {
        for (i = 1; i <= NR; i++) {
          line = lines[i]
          # Déclarations exportées couvertes : function, const/let/var, class,
          # interface, type, enum. (On ignore "export { … }" et "export default".)
          if (line ~ /^[[:space:]]*export[[:space:]]+(async[[:space:]]+)?(function|const|let|var|class|interface|type|enum)[[:space:]]/) {
            # Cherche la ligne non-vide précédente
            j = i - 1
            while (j > 0 && lines[j] ~ /^[[:space:]]*$/) j--
            prev = (j > 0) ? lines[j] : ""
            if (prev !~ /\*\/[[:space:]]*$/) {
              printf "%d\n", i
            }
          }
        }
      }
    ' "$file")

    if [ -n "$result" ]; then
      missing=$((missing + $(echo "$result" | wc -l)))
      echo "${RED}✘${RESET} ${file#$ROOT_DIR/} — export(s) sans JSDoc aux lignes : $(echo "$result" | tr '\n' ' ')"
    fi
  done < <(find "$ROOT_DIR/$dir" -type f \( -name '*.ts' -o -name '*.tsx' \) \
             -not -path '*/node_modules/*' -print0 2>/dev/null)

  if [ "$found_files" -eq 0 ]; then
    warn "$dir/ — aucun fichier TypeScript trouvé (dossier absent ou vide, ignoré)"
  elif [ "$missing" -eq 0 ]; then
    ok "$dir/ — tous les exports ont un JSDoc ($found_files fichier(s) scanné(s))"
  else
    fail "$dir/ — $missing export(s) sans commentaire JSDoc"
  fi
}

for dir in "${SRC_DIRS[@]}"; do
  scan_exports "$dir"
done
echo

# --- Bilan -------------------------------------------------------------------
if [ "$ERRORS" -eq 0 ]; then
  ok "${BOLD}Documentation conforme${RESET} ($WARNINGS avertissement(s))"
  exit 0
else
  fail "${BOLD}$ERRORS erreur(s) trouvée(s)${RESET} — corrigez avant de commit"
  exit 1
fi
