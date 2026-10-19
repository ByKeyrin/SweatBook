# 📋 Compte-rendu v2 : Scripts CCAM automatisés (chemins relatifs)

**Auteur :** ROTOR (agent backend)
**Date :** 19 octobre 2026
**Périmètre :** Adaptation des scripts batch du processus de génération CCAM (SESAM-Vitale)
**Suite de :** `CR_Processus_CCAM.md` (BIC)

---

## Objectif

Adapter les scripts batch du dossier `DOCUMENTS/PROFESSIONNEL/GIE SESAM-Vitale/CCAM` (Google Drive) pour :

1. **Supprimer les chemins absolus** `D:\Documents Sauvegardes\Professionel\OutilsGIE\CCAM_console\...` → **chemins relatifs** basés sur `%~dp0` (dossier du script).
2. **Centraliser la configuration** dans un fichier unique `CONFIG.bat`.
3. **Orchestrer le flux complet** en une seule commande (`run_ccam_v2.bat`) : préparation → génération → validation.
4. **Fiabiliser** : gestion des codes retour, logs détaillés, contrôles de présence, validation des livrables, manifeste de checksums.

---

## Scripts créés

| Fichier | Rôle | Basé sur |
|---------|------|----------|
| `CONFIG.bat` | Configuration centralisée (chemins relatifs + paramètres par défaut) | nouveau |
| `run_ccam_v2.bat` | Orchestrateur unique : préparation → génération → validation | `run_ccam.bat` (décrit dans le CR mais **absent de Drive**) |
| `CreaArbo_DZIP_CCAM_v2.bat` | Étape 1 : arborescence + extraction des archives CNAM | `CreaArbo_DZIP_CCAM.bat` |
| `Generation_CCAM_REELLE_ALL_v2.bat` | Étape 2 : génération des livraisons (éditeurs / industriels, AGR / HOM) | `Generation_CCAM_REELLE_ALL.bat` |

Emplacement dans le dépôt : `ccam/`. À copier à la racine de l'arborescence `CCAM_console` (à côté de `GenTab\`, `GenTabv2\`, `7z.exe`, `fciv.exe`).

> **Note :** `run_ccam.bat` annoncé dans le CR de BIC n'existe pas dans le dossier Drive (recherche globale infructueuse). `run_ccam_v2.bat` est donc le premier orchestrateur réel du processus.

---

## Architecture cible

```
CCAM_console\                      ← %~dp0 des scripts (racine auto-détectée)
├── CONFIG.bat
├── run_ccam_v2.bat
├── CreaArbo_DZIP_CCAM_v2.bat
├── Generation_CCAM_REELLE_ALL_v2.bat
├── GenTab\CCAM_console.exe
├── GenTabv2\CCAM_console_v2.exe
├── 7z.exe
├── fciv.exe
├── Generation\
│   └── <version base>\            (ex : v5300) — créé par les scripts
│       ├── ZIP\                   ← archives CNAM déposées ici
│       ├── G003 … G016\
│       │   ├── Archives\          (zips extraits)
│       │   └── Fait\CCAM-REEL-<ver table>\   (sorties GenTab)
│       ├── Nouveau Format\
│       │   ├── Archives\
│       │   └── Fait\CCAM-REEL-<ver table NF>\
│       ├── Livraison <date> (table reelle v<ver table> (base <ver base>))\
│       └── 1.40.<ver package>\    (packagings AGR / HOM)
└── Logs\                          ← journaux + manifestes de checksums
```

---

## Changements détaillés

### 1. `CONFIG.bat` (nouveau)

- `CCAM_ROOT=%~dp0` : racine = dossier du script (plus aucune lettre de lecteur en dur).
- Tous les chemins dérivés : `DIR_GENERATION`, `DIR_LOGS`, `DIR_GENTAB`, `DIR_GENTABV2`, `EXE_GENTAB`, `EXE_GENTABV2`, `EXE_7Z`, `EXE_FCIV`.
- `7z.exe` : utilise celui de la racine, sinon celui du `PATH`.
- Paramètres par défaut surchargeables en ligne de commande : `DEF_VERSION_TABLE` (0184), `DEF_VERSION_BASE` (v5300), `DEF_DATE_GENERATION` (2018-07-04), `DEF_VERSION_PACKAGE` (E84), `DEF_VERSION_TABLE_NF` (1084), `DEF_DATE_RECEPTION` (20180704), `DEF_VERSION_SIMPLIFIEE` (05300).
- Option `AUTO_MAJ_R_TB20=1` : remplace les dates `AAAAMMJJ` de `R_TB20.txt` par la date de réception (anciennement **manuel**, avec sauvegarde `R_TB20.txt.bak`).

### 2. `run_ccam_v2.bat` (nouvel orchestrateur)

- **Détection automatique du dossier courant** (`%~dp0`) : lancé depuis n'importe quel répertoire.
- **Paramètres optionnels** : `run_ccam_v2.bat [VER_TABLE] [VER_BASE] [DATE] [VER_PACKAGE] [VER_TABLE_NF]` (défauts = `CONFIG.bat`).
- **Étape 1 — Préparation** : extraction automatique de l'archive mère `vXXXXX.zip` si présente dans `ZIP\`, puis `CreaArbo_DZIP_CCAM_v2.bat`.
- **Étape 2 — Génération** : `Generation_CCAM_REELLE_ALL_v2.bat`.
- **Étape 3 — Validation** : contrôle de présence des livrables attendus pour chaque table G003→G016 (`tablebin.srt` éditeurs, base zippée industriels, `MD5.md5`) + Nouveau format (`table_v2.srt`, zip), puis génération d'un **manifeste de checksums MD5** (`Logs\manifest_checksums_<version>_<horodatage>.md5`, via `fciv.exe` ou PowerShell `Get-FileHash` en secours).
- **Logs détaillés** : `Logs\run_ccam_v2_<AAAAMMJJ_HHMMSS>.log` (horodaté, paramètres, chaque commande, codes retour).
- **Gestion d'erreurs** : arrêt immédiat à la première étape en échec, codes retour normalisés :
  `0` OK · `1` paramètres invalides · `2` prérequis manquants · `3` préparation · `4` génération · `5` validation.

### 3. `CreaArbo_DZIP_CCAM_v2.bat`

- Chemins **100 % relatifs** via `CONFIG.bat` (`%WORK% = Generation\<version base>`).
- Contrôle de présence des archives (`CCAM<versimpl>.zip` obligatoire ; `CCAMTB…` et `G0XX` avertissement si absents).
- Vérification du code retour de `7z.exe` à chaque extraction (l'original enchaînait silencieusement).
- Boucle `for /L` G003→G016 (remplace le compteur `goto`), sortie `exit /b` avec codes retour.
- Paramètres inchangés : `[version base] [date réception] [version simplifiée]` (tous optionnels).

### 4. `Generation_CCAM_REELLE_ALL_v2.bat`

- Chemins **100 % relatifs** via `CONFIG.bat`.
- Paramètres : `[ver table] [ver base] [date] [ver package] [ver table NF]` (tous optionnels).
- Contrôle de présence des moteurs `GenTab\CCAM_console.exe` et `GenTabv2\CCAM_console_v2.exe`.
- **Mise à jour automatique des dates de `R_TB20.txt`** (option `AUTO_MAJ_R_TB20`), avec sauvegarde.
- Vérification du code retour de `CCAM_console.exe` / `CCAM_console_v2.exe` par table.
- **Validation des résultats** : présence de `tablebin.srt` (G0XX) et `table_v2.srt` (nouveau format) avant copie ; compteur d'erreurs ; `exit /b 5` si livrable manquant.
- Copies éditeurs / industriels / packagings AGR (`str-1.40.<pkg>-ALL-00-AGR\srt_exploit-<ver table>`) et HOM (`…-HOM`) conservées à l'identique.
- Fichiers `MD5.md5` générés via `fciv.exe` (secours PowerShell `Get-FileHash`).
- Journal par exécution : `Logs\Generation_v2_<version>_<ver table>.log` + log GenTab par table (`Logs\CCAM_console_<G0XX>_<version>.log`).

---

## Utilisation

```bat
REM 1. Placer les archives CNAM dans Generation\v5300\ZIP\ (ou y déposer v5300.zip)

REM 2. Lancer le flux complet avec les défauts de CONFIG.bat :
run_ccam_v2.bat

REM 3. Ou avec des paramètres explicites :
run_ccam_v2.bat 0184 v5300 2018-07-04 E84 1084

REM Exécution pas-à-pas (équivalent de l'ancien process) :
CreaArbo_DZIP_CCAM_v2.bat v5300 20180704 05300
Generation_CCAM_REELLE_ALL_v2.bat 0184 v5300 2018-07-04 E84 1084
```

---

## Points d'attention / limites

- **Non testé sous Windows** : scripts écrits et relus (syntaxe cmd, encodage ASCII sans accents, fins de ligne CRLF) mais l'environnement de production Windows + `CCAM_console.exe` n'est pas disponible ici. Un test à blanc sur une version réelle est recommandé avant mise en production.
- **Date de réception** : `DEF_DATE_RECEPTION` / `DEF_VERSION_SIMPLIFIEE` restent dans `CONFIG.bat` (non exposés en ligne de commande de `run_ccam_v2.bat` pour rester compatible avec les signatures historiques de `CreaArbo` et `Generation`).
- **Locales Windows** : l'horodatage des logs utilise PowerShell (`Get-Date`), indépendant de la locale.
- Les fichiers `R_TB20.dbf` / `R_TB20.txt` doivent être préparés comme avant (étape manuelle « copie à la racine de la version » documentée dans `Procédure.txt`) ; seule la mise à jour des dates est automatisée.
- L'étape « Livraison » (mise à disposition aux éditeurs/industriels) reste manuelle : le CR recommande un registre de versions + notifications (hors périmètre de cette adaptation).

---

## Livrables

- `ccam/CONFIG.bat`
- `ccam/run_ccam_v2.bat`
- `ccam/CreaArbo_DZIP_CCAM_v2.bat`
- `ccam/Generation_CCAM_REELLE_ALL_v2.bat`
- `ccam/CR_Processus_CCAM_v2.md` (ce document)
- Scripts sources téléchargés depuis Drive pour référence : `CreaArbo_DZIP_CCAM.bat`, `Generation_CCAM_REELLE_ALL.bat`, `Procédure.txt` (conservés dans `/home/lecak/tmp/ccam_src/`)
