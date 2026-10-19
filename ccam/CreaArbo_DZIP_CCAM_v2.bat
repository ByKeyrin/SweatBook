@echo off
setlocal
REM ============================================================================
REM  CreaArbo_DZIP_CCAM_v2.bat - Etape 1 : Preparation / extraction (v2)
REM ----------------------------------------------------------------------------
REM  Cree l'arborescence de travail et dezipppe les archives recues de la CNAM.
REM  Chemins RELATIFS (variables definies dans CONFIG.bat) - plus de D:\...
REM
REM  Parametres (tous optionnels, defauts dans CONFIG.bat) :
REM    %1 Version base CCAM            ex : v5300
REM    %2 Date de reception ZIP        ex : 20180704
REM    %3 Version CCAM simplifiee      ex : 05300
REM
REM  Prerequis : les ZIP de la CNAM sont deja dans  Generation\%1\ZIP\
REM              (run_ccam_v2.bat peut extraire l'archive mere vXXXXX.zip)
REM
REM  Codes retour : 0 = OK, 2 = prerequis manquant, 3 = erreur d'extraction
REM ============================================================================

call "%~dp0CONFIG.bat"

REM --- Parametres avec valeurs par defaut ------------------------------------
set "VERBASE=%~1"
if not defined VERBASE set "VERBASE=%DEF_VERSION_BASE%"
set "DATE_RECEPTION=%~2"
if not defined DATE_RECEPTION set "DATE_RECEPTION=%DEF_DATE_RECEPTION%"
set "VERSIMPL=%~3"
if not defined VERSIMPL set "VERSIMPL=%DEF_VERSION_SIMPLIFIEE%"

REM --- Journalisation --------------------------------------------------------
if not exist "%DIR_LOGS%" mkdir "%DIR_LOGS%"
set "LOG_FILE=%DIR_LOGS%\CreaArbo_v2_%VERBASE%.log"
if defined CCAM_LOG_FILE set "LOG_FILE=%CCAM_LOG_FILE%"
call :log "=== CreaArbo_DZIP_CCAM_v2 - DEBUT ==="
call :log "Version base      : %VERBASE%"
call :log "Date reception    : %DATE_RECEPTION%"
call :log "Version simplifiee: %VERSIMPL%"
call :log "Racine outils     : %CCAM_ROOT%"

REM --- Verification des prerequis -------------------------------------------
if not exist "%DIR_GENERATION%" (
    call :log "ERREUR : dossier Generation introuvable : %DIR_GENERATION%"
    exit /b 2
)
set "WORK=%DIR_GENERATION%\%VERBASE%"
set "ZIPDIR=%WORK%\ZIP"
if not exist "%ZIPDIR%" (
    call :log "ERREUR : dossier des archives CNAM introuvable : %ZIPDIR%"
    call :log "         Placez les ZIP recus de la CNAM dans ce dossier."
    exit /b 2
)
if not exist "%ZIPDIR%\CCAM%VERSIMPL%.zip" (
    call :log "ERREUR : archive principale absente : %ZIPDIR%\CCAM%VERSIMPL%.zip"
    exit /b 2
)

REM --- Creation arborescence Nouveau Format ---------------------------------
call :log "--- Preparation du Nouveau Format ---"
if not exist "%WORK%\Nouveau Format\Archives" mkdir "%WORK%\Nouveau Format\Archives"
if not exist "%WORK%\Nouveau Format\Fait" mkdir "%WORK%\Nouveau Format\Fait"

REM --- Deplacement des ZIP Nouveau Format vers leur repertoire Archives -----
call :log "Deplacement des archives Nouveau Format"
move "%ZIPDIR%\CCAM%VERSIMPL%.zip" "%WORK%\Nouveau Format\Archives" >nul
if errorlevel 1 (
    call :log "ERREUR : deplacement impossible de CCAM%VERSIMPL%.zip"
    exit /b 3
)
if exist "%ZIPDIR%\CCAMTB%VERSIMPL%.zip" (
    move "%ZIPDIR%\CCAMTB%VERSIMPL%.zip" "%WORK%\Nouveau Format\Archives" >nul
) else (
    call :log "ATTENTION : CCAMTB%VERSIMPL%.zip absent (nouveau format)"
)

REM --- Dezippage des archives Nouveau Format --------------------------------
call :log "Extraction CCAM%VERSIMPL%.zip"
"%EXE_7Z%" e "%WORK%\Nouveau Format\Archives\CCAM%VERSIMPL%.zip" -o"%WORK%\Nouveau Format\Archives" -y >nul
if errorlevel 1 (
    call :log "ERREUR : extraction de CCAM%VERSIMPL%.zip echouee"
    exit /b 3
)
if exist "%WORK%\Nouveau Format\Archives\CCAMTB%VERSIMPL%.zip" (
    call :log "Extraction CCAMTB%VERSIMPL%.zip"
    "%EXE_7Z%" e "%WORK%\Nouveau Format\Archives\CCAMTB%VERSIMPL%.zip" -o"%WORK%\Nouveau Format\Archives" -y >nul
    if errorlevel 1 (
        call :log "ERREUR : extraction de CCAMTB%VERSIMPL%.zip echouee"
        exit /b 3
    )
)

REM --- Boucle sur les tables G003 a G016 ------------------------------------
for /L %%C in (3,1,16) do call :traiter_table %%C
if errorlevel 1 exit /b 3

call :log "=== CreaArbo_DZIP_CCAM_v2 - FIN (OK) ==="
exit /b 0

REM ---------------------------------------------------------------------------
REM  Traitement d'une table G0XX
REM ---------------------------------------------------------------------------
:traiter_table
set /a NUM=%1
if %NUM% LSS 10 (set "TAB=G00%NUM%") else (set "TAB=G0%NUM%")
call :log "--- Table %TAB% ---"
if not exist "%WORK%\%TAB%\Archives" mkdir "%WORK%\%TAB%\Archives"

REM Deplacement des archives de la table vers son repertoire Archives
move "%ZIPDIR%\*.%TAB%.*" "%WORK%\%TAB%\Archives" >nul 2>nul
if errorlevel 1 (
    call :log "ATTENTION : aucune archive trouvee pour %TAB% dans %ZIPDIR%"
    goto :eof
)

REM Dezippage des fichiers de la table (ancien format)
if exist "%WORK%\%TAB%\Archives\CCAM%VERSIMPL%.%TAB%.zip" (
    "%EXE_7Z%" e "%WORK%\%TAB%\Archives\CCAM%VERSIMPL%.%TAB%.zip" -o"%WORK%\%TAB%\Archives" -y >nul
    if errorlevel 1 (
        call :log "ERREUR : extraction de CCAM%VERSIMPL%.%TAB%.zip echouee"
        exit /b 3
    )
) else (
    call :log "ATTENTION : CCAM%VERSIMPL%.%TAB%.zip absent"
)
if exist "%WORK%\%TAB%\Archives\CCAMTB%VERSIMPL%.%TAB%.zip" (
    "%EXE_7Z%" e "%WORK%\%TAB%\Archives\CCAMTB%VERSIMPL%.%TAB%.zip" -o"%WORK%\%TAB%\Archives" -y >nul
    if errorlevel 1 (
        call :log "ERREUR : extraction de CCAMTB%VERSIMPL%.%TAB%.zip echouee"
        exit /b 3
    )
)
goto :eof

REM ---------------------------------------------------------------------------
REM  Journalisation : console + fichier de log
REM ---------------------------------------------------------------------------
:log
echo [%date% %time%] %~1
>>"%LOG_FILE%" echo [%date% %time%] %~1
goto :eof
