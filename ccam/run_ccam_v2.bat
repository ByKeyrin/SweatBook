@echo off
setlocal
REM ============================================================================
REM  run_ccam_v2.bat - Orchestrateur unique du processus CCAM (v2)
REM ----------------------------------------------------------------------------
REM  Enchaine automatiquement les 3 etapes du flux de generation CCAM :
REM    Etape 1 - Preparation  : extraction des archives CNAM (CreaArbo_DZIP_v2)
REM    Etape 2 - Generation   : livraisons editeurs/industriels (Generation_v2)
REM    Etape 3 - Validation   : controle des livrables + manifeste de checksums
REM
REM  Le dossier courant est detecte automatiquement via %~dp0 : ce script peut
REM  etre lance depuis n'importe quel repertoire. Tous les chemins sont
REM  relatifs au dossier du script (cf. CONFIG.bat).
REM
REM  Utilisation :
REM    run_ccam_v2.bat [VER_TABLE] [VER_BASE] [DATE] [VER_PACKAGE] [VER_TABLE_NF]
REM
REM    VER_TABLE     version table ancien format   defaut : 0184
REM    VER_BASE      version base CCAM             defaut : v5300
REM    DATE          date de generation AAAA-MM-JJ defaut : 2018-07-04
REM    VER_PACKAGE   version package exploitation  defaut : E84
REM    VER_TABLE_NF  version table nouveau format  defaut : 1084
REM
REM  Tous les parametres sont optionnels (defauts dans CONFIG.bat).
REM  Les archives CNAM (CCAM05300.zip, CCAMTB05300.zip, CCAM05300.G0XX.zip...)
REM  doivent se trouver dans Generation\VER_BASE\ZIP\ (une archive mere
REM  vXXXXX.zip placee dans ce meme repertoire est automatiquement extraite).
REM
REM  Codes retour : 0 = OK
REM                 1 = parametres invalides
REM                 2 = prerequis manquants
REM                 3 = etape 1 (preparation) echouee
REM                 4 = etape 2 (generation) echouee
REM                 5 = etape 3 (validation) echouee
REM ============================================================================

call "%~dp0CONFIG.bat"

REM --- Parametres avec valeurs par defaut ------------------------------------
set "VER_TABLE=%~1"
if not defined VER_TABLE set "VER_TABLE=%DEF_VERSION_TABLE%"
set "VERBASE=%~2"
if not defined VERBASE set "VERBASE=%DEF_VERSION_BASE%"
set "DATE_GEN=%~3"
if not defined DATE_GEN set "DATE_GEN=%DEF_DATE_GENERATION%"
set "VER_PACKAGE=%~4"
if not defined VER_PACKAGE set "VER_PACKAGE=%DEF_VERSION_PACKAGE%"
set "VER_TABLE_NF=%~5"
if not defined VER_TABLE_NF set "VER_TABLE_NF=%DEF_VERSION_TABLE_NF%"
set "DATE_RECEPTION=%DEF_DATE_RECEPTION%"
set "VERSIMPL=%DEF_VERSION_SIMPLIFIEE%"

REM --- Horodatage du journal d'execution -------------------------------------
set "TS="
for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "TS=%%I"
if not defined TS set "TS=run"

REM --- Journalisation --------------------------------------------------------
if not exist "%DIR_LOGS%" mkdir "%DIR_LOGS%"
set "CCAM_LOG_FILE=%DIR_LOGS%\run_ccam_v2_%TS%.log"
set "LOG_FILE=%CCAM_LOG_FILE%"
call :log "============================================================"
call :log "=== run_ccam_v2 - DEBUT (horodatage %TS%) ==="
call :log "============================================================"
call :log "Version table ancien format : %VER_TABLE%"
call :log "Version table nouveau format: %VER_TABLE_NF%"
call :log "Version base                : %VERBASE%"
call :log "Date de generation          : %DATE_GEN%"
call :log "Date de reception CNAM      : %DATE_RECEPTION%"
call :log "Version package exploitation: %VER_PACKAGE%"
call :log "Version simplifiee          : %VERSIMPL%"
call :log "Racine des outils           : %CCAM_ROOT%"
call :log "Journal                     : %CCAM_LOG_FILE%"

REM --- Chemins derives --------------------------------------------------------
set "WORK=%DIR_GENERATION%\%VERBASE%"
set "ZIPDIR=%WORK%\ZIP"
set "LIVRAISON=%WORK%\Livraison %DATE_GEN% (table reelle v%VER_TABLE% (base %VERBASE%))"
set "ERRORS=0"

REM ===========================================================================
REM  Verification des prerequis
REM ===========================================================================
call :log "--- Verification des prerequis ---"
if not exist "%EXE_GENTAB%" (
    call :log "ERREUR : moteur de generation absent : %EXE_GENTAB%"
    exit /b 2
)
if not exist "%EXE_GENTABV2%" (
    call :log "ERREUR : moteur de generation v2 absent : %EXE_GENTABV2%"
    exit /b 2
)
if exist "%EXE_7Z%" goto :sevenzip_ok
where "%EXE_7Z%" >nul 2>nul
if errorlevel 1 (
    call :log "ERREUR : 7z.exe introuvable (racine ou PATH) : %EXE_7Z%"
    exit /b 2
)
:sevenzip_ok
call :log "Prerequis OK"

REM ===========================================================================
REM  ETAPE 1 - Preparation / extraction des archives CNAM
REM ===========================================================================
call :log "============================================================"
call :log "=== ETAPE 1 - PREPARATION ==="
call :log "============================================================"
if not exist "%DIR_GENERATION%" mkdir "%DIR_GENERATION%"
if not exist "%ZIPDIR%" mkdir "%ZIPDIR%"

REM Extraction automatique de l'archive mere vXXXXX.zip si presente
if not exist "%ZIPDIR%\v*.zip" goto :fin_archive_mere
call :log "Archive mere detectee dans %ZIPDIR% - extraction"
for %%F in ("%ZIPDIR%\v*.zip") do (
    "%EXE_7Z%" x "%%~fF" -o"%ZIPDIR%" -y >nul
    if errorlevel 1 (
        call :log "ERREUR : extraction de %%~nxF echouee"
        exit /b 3
    )
    call :log "Extraction OK : %%~nxF"
)
:fin_archive_mere

REM Lancement de l'etape 1
call "%~dp0CreaArbo_DZIP_CCAM_v2.bat" "%VERBASE%" "%DATE_RECEPTION%" "%VERSIMPL%"
if errorlevel 1 (
    call :log "ERREUR : ETAPE 1 (preparation) echouee"
    exit /b 3
)
call :log "=== ETAPE 1 - PREPARATION OK ==="

REM ===========================================================================
REM  ETAPE 2 - Generation des livraisons
REM ===========================================================================
call :log "============================================================"
call :log "=== ETAPE 2 - GENERATION ==="
call :log "============================================================"
call "%~dp0Generation_CCAM_REELLE_ALL_v2.bat" "%VER_TABLE%" "%VERBASE%" "%DATE_GEN%" "%VER_PACKAGE%" "%VER_TABLE_NF%"
if errorlevel 1 (
    call :log "ERREUR : ETAPE 2 (generation) echouee"
    exit /b 4
)
call :log "=== ETAPE 2 - GENERATION OK ==="

REM ===========================================================================
REM  ETAPE 3 - Validation des resultats + manifeste de checksums
REM ===========================================================================
call :log "============================================================"
call :log "=== ETAPE 3 - VALIDATION ==="
call :log "============================================================"
if not exist "%LIVRAISON%" (
    call :log "ERREUR : repertoire de livraison absent : %LIVRAISON%"
    exit /b 5
)
for /L %%C in (3,1,16) do call :valider_table %%C
call :valider_nouveau_format

REM Generation du manifeste de checksums de la livraison
set "MANIFEST=%DIR_LOGS%\manifest_checksums_%VERBASE%_%TS%.md5"
call :log "Generation du manifeste de checksums : %MANIFEST%"
if not exist "%EXE_FCIV%" goto :manifest_powershell
"%EXE_FCIV%" -add "%LIVRAISON%" -r -md5 > "%MANIFEST%"
goto :fin_manifest
:manifest_powershell
powershell -NoProfile -Command "Get-ChildItem -Recurse -File '%LIVRAISON%' | Get-FileHash -Algorithm MD5 | ForEach-Object { $_.Hash + ' *' + $_.Path } | Set-Content '%MANIFEST%'"
:fin_manifest

if not "%ERRORS%"=="0" (
    call :log "============================================================"
    call :log "=== run_ccam_v2 - FIN EN ERREUR (%ERRORS% erreur(s)) ==="
    call :log "============================================================"
    exit /b 5
)
call :log "============================================================"
call :log "=== run_ccam_v2 - FIN OK - Livraison prete : %LIVRAISON% ==="
call :log "============================================================"
exit /b 0

REM ---------------------------------------------------------------------------
REM  Validation d'une table G0XX : presence des livrables attendus
REM ---------------------------------------------------------------------------
:valider_table
set /a NUM=%1
if %NUM% LSS 10 (set "TAB=G00%NUM%") else (set "TAB=G0%NUM%")
if exist "%LIVRAISON%\base a destination des editeurs\%TAB%\tablebin.srt" (
    call :log "OK    : %TAB% - editeurs/tablebin.srt"
) else (
    call :log "ERREUR : %TAB% - editeurs/tablebin.srt absent"
    set /a ERRORS+=1
)
if exist "%LIVRAISON%\base a destination des industriels\%TAB%\*.zip" (
    call :log "OK    : %TAB% - industriels/base zip"
) else (
    call :log "ERREUR : %TAB% - industriels/base zip absente"
    set /a ERRORS+=1
)
if exist "%LIVRAISON%\%TAB%\MD5.md5" (
    call :log "OK    : %TAB% - MD5.md5"
) else (
    call :log "ERREUR : %TAB% - MD5.md5 absent"
    set /a ERRORS+=1
)
goto :eof

REM ---------------------------------------------------------------------------
REM  Validation du Nouveau Format
REM ---------------------------------------------------------------------------
:valider_nouveau_format
if exist "%LIVRAISON%\base a destination des editeurs\Nouveau format\table_v2.srt" (
    call :log "OK    : Nouveau format - editeurs/table_v2.srt"
) else (
    call :log "ERREUR : Nouveau format - editeurs/table_v2.srt absent"
    set /a ERRORS+=1
)
if exist "%LIVRAISON%\base a destination des industriels\Nouveau format\*.zip" (
    call :log "OK    : Nouveau format - industriels/base zip"
) else (
    call :log "ERREUR : Nouveau format - industriels/base zip absente"
    set /a ERRORS+=1
)
goto :eof

REM ---------------------------------------------------------------------------
REM  Journalisation : console + fichier de log
REM ---------------------------------------------------------------------------
:log
echo [%date% %time%] %~1
>>"%LOG_FILE%" echo [%date% %time%] %~1
goto :eof
