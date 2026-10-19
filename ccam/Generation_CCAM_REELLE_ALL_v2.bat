@echo off
setlocal
REM ============================================================================
REM  Generation_CCAM_REELLE_ALL_v2.bat - Etape 2 : generation des livraisons (v2)
REM ----------------------------------------------------------------------------
REM  Produit les livraisons CCAM :
REM    - base editeurs    : ancien format G003-G016 + nouveau format
REM    - base industriels : ancien format G003-G016 + nouveau format
REM    - packagings AGR (agrement) et HOM (homologation)
REM  Chemins RELATIFS (variables definies dans CONFIG.bat) - plus de D:\...
REM
REM  Parametres (tous optionnels, defauts dans CONFIG.bat) :
REM    %1 Version Table ancien format  ex : 0184
REM    %2 Version base CCAM            ex : v5300
REM    %3 Date de generation           ex : 2018-07-04
REM    %4 Version package exploitation ex : E84
REM    %5 Version Table nouveau format ex : 1084
REM
REM  Prerequis : etape 1 (CreaArbo_DZIP_CCAM_v2.bat) executee.
REM              Fichiers R_TB20.dbf / R_TB20.txt (dates mises a jour) dans
REM              Generation\%2\  (copie automatique vers les tables).
REM
REM  Codes retour : 0 = OK, 2 = prerequis manquant, 4 = generation echouee,
REM                 5 = validation des resultats echouee
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

REM --- Journalisation --------------------------------------------------------
if not exist "%DIR_LOGS%" mkdir "%DIR_LOGS%"
set "LOG_FILE=%DIR_LOGS%\Generation_v2_%VERBASE%_%VER_TABLE%.log"
if defined CCAM_LOG_FILE set "LOG_FILE=%CCAM_LOG_FILE%"
call :log "=== Generation_CCAM_REELLE_ALL_v2 - DEBUT ==="
call :log "Version table ancien format : %VER_TABLE%"
call :log "Version table nouveau format: %VER_TABLE_NF%"
call :log "Version base                : %VERBASE%"
call :log "Date de generation          : %DATE_GEN%"
call :log "Version package exploitation: %VER_PACKAGE%"

REM --- Chemins derives --------------------------------------------------------
set "WORK=%DIR_GENERATION%\%VERBASE%"
set "LIVRAISON=%WORK%\Livraison %DATE_GEN% (table reelle v%VER_TABLE% (base %VERBASE%))"
set "PACKAGING=%WORK%\%PREFIXE_PACKAGE%.%VER_PACKAGE%"
set "ERRORS=0"

REM --- Verification des prerequis -------------------------------------------
if not exist "%WORK%\ZIP" (
    call :log "ERREUR : etape 1 non executee (dossier %WORK%\ZIP absent)"
    exit /b 2
)
if not exist "%EXE_GENTAB%" (
    call :log "ERREUR : moteur de generation absent : %EXE_GENTAB%"
    exit /b 2
)
if not exist "%EXE_GENTABV2%" (
    call :log "ERREUR : moteur de generation v2 absent : %EXE_GENTABV2%"
    exit /b 2
)

REM --- Mise a jour automatique des dates de R_TB20.txt -----------------------
if not "%AUTO_MAJ_R_TB20%"=="1" goto :fin_rtb20
if not exist "%WORK%\R_TB20.txt" goto :fin_rtb20
call :log "Mise a jour des dates de R_TB20.txt vers %DATE_RECEPTION%"
if exist "%WORK%\R_TB20.txt.bak" del "%WORK%\R_TB20.txt.bak"
copy "%WORK%\R_TB20.txt" "%WORK%\R_TB20.txt.bak" >nul
powershell -NoProfile -Command "(Get-Content -Raw '%WORK%\R_TB20.txt') -replace '20[0-9][0-9][0-9][0-9][0-9][0-9]','%DATE_RECEPTION%' | Set-Content -NoNewline '%WORK%\R_TB20.txt'"
if errorlevel 1 call :log "ATTENTION : mise a jour des dates de R_TB20.txt echouee"
:fin_rtb20

REM --- Preparation des repertoires de livraison ------------------------------
call :log "--- Preparation des livraisons ---"
for %%D in (
    "%LIVRAISON%"
    "%LIVRAISON%\base a destination des editeurs"
    "%LIVRAISON%\base a destination des editeurs\Nouveau format"
    "%LIVRAISON%\base a destination des industriels"
    "%LIVRAISON%\base a destination des industriels\Nouveau format"
    "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-AGR\srt_exploit-%VER_TABLE%\Base nouveau format"
    "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-HOM\srt_exploit-%VER_TABLE%\Base nouveau format"
) do if not exist "%%~D" mkdir "%%~D"

REM --- Boucle sur les tables G003 a G016 ------------------------------------
for /L %%C in (3,1,16) do call :generer_table %%C

REM --- Generation de la base Nouveau Format ---------------------------------
call :log "--- Generation Nouveau Format ---"
if not exist "%WORK%\Nouveau Format\Fait" mkdir "%WORK%\Nouveau Format\Fait"

REM Copie des fichiers R_TB20 modifies
if exist "%WORK%\R_TB20.dbf" copy "%WORK%\R_TB20.dbf" "%WORK%\Nouveau Format\Archives" >nul
if exist "%WORK%\R_TB20.txt" copy "%WORK%\R_TB20.txt" "%WORK%\Nouveau Format\Archives" >nul

REM GENERATION nouveau format (GenTab v2)
"%EXE_GENTABV2%" "%WORK%\Nouveau Format\Archives" "%WORK%\Nouveau Format\Fait" %VER_TABLE_NF% REEL "Base reelle (base nationale %VERBASE% nouveau format)" > "%DIR_LOGS%\CCAM_console_NF_%VERBASE%.log"
if errorlevel 1 (
    call :log "ERREUR : generation Nouveau Format echouee (voir CCAM_console_NF_%VERBASE%.log)"
    set /a ERRORS+=1
)

set "OUT_NF=%WORK%\Nouveau Format\Fait\CCAM-REEL-%VER_TABLE_NF%"
if exist "%OUT_NF%\BaseFiltree" (
    "%EXE_7Z%" a "%OUT_NF%\base_multigrilles_ccam-exploitation-%VER_TABLE_NF%.zip" "%OUT_NF%\BaseFiltree" -mtc=on >nul
)
call :maj_md5 "%OUT_NF%"

REM Copie vers les livraisons
if exist "%OUT_NF%\bin\table_v2.srt" (
    copy "%OUT_NF%\bin\table_v2.srt" "%LIVRAISON%\base a destination des editeurs\Nouveau format" >nul
    copy "%OUT_NF%\bin\table_v2.srt" "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-AGR\srt_exploit-%VER_TABLE%\Base nouveau format" >nul
) else (
    call :log "ERREUR : table_v2.srt non genere pour le Nouveau Format"
    set /a ERRORS+=1
)
if exist "%OUT_NF%\*.zip" (
    copy "%OUT_NF%\*.zip" "%LIVRAISON%\base a destination des industriels\Nouveau format" >nul
    copy "%OUT_NF%\*.zip" "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-HOM\srt_exploit-%VER_TABLE%\Base nouveau format" >nul
)
if exist "%OUT_NF%\GenTab.log" copy "%OUT_NF%\GenTab.log" "%LIVRAISON%\Nouveau format" >nul 2>nul
if exist "%OUT_NF%\MD5.md5" copy "%OUT_NF%\MD5.md5" "%LIVRAISON%\Nouveau format" >nul 2>nul

REM --- Validation des resultats ---------------------------------------------
call :log "--- Validation des resultats ---"
call :validation_livraison
if not "%ERRORS%"=="0" (
    call :log "=== Generation_CCAM_REELLE_ALL_v2 - FIN avec %ERRORS% ERREUR(S) ==="
    exit /b 5
)
call :log "=== Generation_CCAM_REELLE_ALL_v2 - FIN (OK) ==="
exit /b 0

REM ---------------------------------------------------------------------------
REM  Generation d'une table G0XX (ancien format)
REM ---------------------------------------------------------------------------
:generer_table
set /a NUM=%1
if %NUM% LSS 10 (set "TAB=G00%NUM%") else (set "TAB=G0%NUM%")
call :log "--- Table %TAB% ---"

REM Preparation des repertoires de sortie
if not exist "%WORK%\%TAB%\Fait" mkdir "%WORK%\%TAB%\Fait"

REM Copie des fichiers R_TB20 modifies
if exist "%WORK%\R_TB20.dbf" copy "%WORK%\R_TB20.dbf" "%WORK%\%TAB%\Archives" >nul
if exist "%WORK%\R_TB20.txt" copy "%WORK%\R_TB20.txt" "%WORK%\%TAB%\Archives" >nul

REM GENERATION table CCAM en mode console (GenTab v1)
REM   parametre 1 : repertoire sources contenant les fichiers .dbf
REM   parametre 2 : repertoire destination des fichiers generes
REM   parametre 3 : version de la base CCAM
REM   parametre 4 : type (TEST ou REEL)
REM   parametre 5 : commentaire (sans ; ni caracteres accentues)
"%EXE_GENTAB%" "%WORK%\%TAB%\Archives" "%WORK%\%TAB%\Fait" %VER_TABLE% REEL "Base reelle (base nationale %VERBASE% %TAB%)" > "%DIR_LOGS%\CCAM_console_%TAB%_%VERBASE%.log"
if errorlevel 1 (
    call :log "ERREUR : generation %TAB% echouee (voir CCAM_console_%TAB%_%VERBASE%.log)"
    set /a ERRORS+=1
    goto :eof
)

set "OUT=%WORK%\%TAB%\Fait\CCAM-REEL-%VER_TABLE%"

REM Compression du fichier pour Homologation
if exist "%OUT%\BaseFiltree" "%EXE_7Z%" a "%OUT%\base_monogrille_%TAB%_ccam-exploitation-%VER_TABLE%.zip" "%OUT%\BaseFiltree" -mtc=on >nul

REM Creation du fichier MD5
call :maj_md5 "%OUT%"

REM Preparation Livraison - creation des sous-repertoires
for %%D in (
    "%LIVRAISON%\base a destination des editeurs\%TAB%"
    "%LIVRAISON%\base a destination des industriels\%TAB%"
    "%LIVRAISON%\%TAB%"
    "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-AGR\srt_exploit-%VER_TABLE%\%TAB%"
    "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-HOM\srt_exploit-%VER_TABLE%\%TAB%"
) do if not exist "%%~D" mkdir "%%~D"

REM Copie des fichiers dans le repertoire de livraison
if exist "%OUT%\bin\tablebin.srt" (
    copy "%OUT%\bin\tablebin.srt" "%LIVRAISON%\base a destination des editeurs\%TAB%" >nul
) else (
    call :log "ERREUR : tablebin.srt non genere pour %TAB%"
    set /a ERRORS+=1
)
if exist "%OUT%\*.zip" copy "%OUT%\*.zip" "%LIVRAISON%\base a destination des industriels\%TAB%" >nul
if exist "%OUT%\GenTab.log" copy "%OUT%\GenTab.log" "%LIVRAISON%\%TAB%" >nul
if exist "%OUT%\MD5.md5" copy "%OUT%\MD5.md5" "%LIVRAISON%\%TAB%" >nul

REM Copie dans les packagings AGR / HOM
if exist "%OUT%\bin\tablebin.srt" copy "%OUT%\bin\tablebin.srt" "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-AGR\srt_exploit-%VER_TABLE%\%TAB%" >nul
if exist "%OUT%\*.zip" copy "%OUT%\*.zip" "%PACKAGING%\%PREFIXE_PACKAGE%.%VER_PACKAGE%-ALL-00-HOM\srt_exploit-%VER_TABLE%\%TAB%" >nul
goto :eof

REM ---------------------------------------------------------------------------
REM  Creation / mise a jour du fichier MD5 d'un repertoire de sortie
REM ---------------------------------------------------------------------------
:maj_md5
if not exist "%~1" goto :eof
if not exist "%EXE_FCIV%" goto :md5_powershell
"%EXE_FCIV%" -add "%~1" -r -md5 > "%~1\MD5.md5"
goto :eof
:md5_powershell
powershell -NoProfile -Command "Get-ChildItem -Recurse -File '%~1' | Get-FileHash -Algorithm MD5 | ForEach-Object { $_.Hash + ' *' + $_.Path } | Set-Content '%~1\MD5.md5'"
goto :eof

REM ---------------------------------------------------------------------------
REM  Validation de la livraison : presence des livrables attendus
REM ---------------------------------------------------------------------------
:validation_livraison
if not exist "%LIVRAISON%" (
    call :log "ERREUR : repertoire de livraison absent : %LIVRAISON%"
    set /a ERRORS+=1
    goto :eof
)
if exist "%LIVRAISON%\base a destination des editeurs\Nouveau format\table_v2.srt" (
    call :log "OK    : editeurs / Nouveau format / table_v2.srt"
) else (
    call :log "ERREUR : editeurs / Nouveau format / table_v2.srt absent"
    set /a ERRORS+=1
)
call :log "Validation terminee - %ERRORS% erreur(s)"
goto :eof

REM ---------------------------------------------------------------------------
REM  Journalisation : console + fichier de log
REM ---------------------------------------------------------------------------
:log
echo [%date% %time%] %~1
>>"%LOG_FILE%" echo [%date% %time%] %~1
goto :eof
