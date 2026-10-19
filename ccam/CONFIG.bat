@echo off
REM ============================================================================
REM  CONFIG.bat - Configuration centralisee du processus CCAM (v2)
REM ----------------------------------------------------------------------------
REM  Tous les chemins sont RELATIFS au dossier de ce script (plus de D:\...).
REM  Placez CONFIG.bat a la racine de l'arborescence CCAM_console :
REM
REM    CCAM_console\
REM      CONFIG.bat                  <- ce fichier
REM      run_ccam_v2.bat             <- orchestrateur unique
REM      CreaArbo_DZIP_CCAM_v2.bat   <- etape 1 : preparation
REM      Generation_CCAM_REELLE_ALL_v2.bat <- etape 2 : generation
REM      GenTab\CCAM_console.exe
REM      GenTabv2\CCAM_console_v2.exe
REM      7z.exe / fciv.exe
REM      Generation\<version>\...    <- espace de travail cree par les scripts
REM      Logs\...                    <- journaux d'execution
REM
REM  Ce fichier est charge par les autres scripts via :
REM      call "%~dp0CONFIG.bat"
REM ============================================================================

REM Chargement unique (protection contre le double chargement)
if defined CCAM_CONFIG_LOADED goto :eof
set "CCAM_CONFIG_LOADED=1"

REM --- Racine des outils : dossier contenant ce script -----------------------
set "CCAM_ROOT=%~dp0"
if "%CCAM_ROOT:~-1%"=="\" set "CCAM_ROOT=%CCAM_ROOT:~0,-1%"

REM --- Arborescence ----------------------------------------------------------
set "DIR_GENERATION=%CCAM_ROOT%\Generation"
set "DIR_LOGS=%CCAM_ROOT%\Logs"
set "DIR_GENTAB=%CCAM_ROOT%\GenTab"
set "DIR_GENTABV2=%CCAM_ROOT%\GenTabv2"

REM --- Outils ----------------------------------------------------------------
set "EXE_GENTAB=%DIR_GENTAB%\CCAM_console.exe"
set "EXE_GENTABV2=%DIR_GENTABV2%\CCAM_console_v2.exe"

REM 7z.exe : utilise celui present a la racine, sinon celui du PATH
set "EXE_7Z=%CCAM_ROOT%\7z.exe"
if not exist "%EXE_7Z%" set "EXE_7Z=7z.exe"

REM fciv.exe : calcul des empreintes MD5 (fallback PowerShell dans les scripts)
set "EXE_FCIV=%CCAM_ROOT%\fciv.exe"

REM --- Prefixe de version du package d'exploitation (ex : 1.40.E84) ---------
set "PREFIXE_PACKAGE=1.40"

REM --- Parametres par defaut (surcharges par la ligne de commande) ----------
REM %1 Version Table ancien format   (ex : 0184)
set "DEF_VERSION_TABLE=0184"
REM %2 Version base CCAM             (ex : v5300)
set "DEF_VERSION_BASE=v5300"
REM %3 Date de generation AAAA-MM-JJ (ex : 2018-07-04)
set "DEF_DATE_GENERATION=2018-07-04"
REM %4 Version package exploitation  (ex : E84)
set "DEF_VERSION_PACKAGE=E84"
REM %5 Version Table nouveau format  (ex : 1084)
set "DEF_VERSION_TABLE_NF=1084"

REM --- Parametres lies a la reception CNAM ----------------------------------
REM Date de reception des ZIP AAAAMMJJ (ex : 20180704)
set "DEF_DATE_RECEPTION=20180704"
REM Version CCAM simplifiee (ex : 05300 pour v5300)
set "DEF_VERSION_SIMPLIFIEE=05300"

REM --- Comportements ---------------------------------------------------------
REM AUTO_MAJ_R_TB20=1 : remplace automatiquement les dates AAAAMMJJ du fichier
REM R_TB20.txt par la date de reception (etape manuelle dans l'ancien process)
set "AUTO_MAJ_R_TB20=1"

goto :eof
