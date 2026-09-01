@echo off
title Secure Excel Media Extractor Launcher

echo ================================================================
echo           SECURE EXCEL MEDIA EXTRACTOR (LOCAL EDITION)
echo ================================================================
echo.
echo [1/3] Checking Node.js environment...

where node >nul 2>nul
if %errorlevel% neq 0 goto NO_NODE

echo [OK] Node.js version:
node -v

echo.
echo [2/3] Verifying and installing dependencies...
if not exist "node_modules\" (
    echo [INFO] Installing required dependencies via npm...
    call npm install
    if %errorlevel% neq 0 goto NPM_FAIL
) else (
    echo [OK] Dependencies already installed.
)

echo.
echo [3/3] Starting local application server...
echo [INFO] Processed 100%% locally inside your web browser. Zero server upload.
echo.
echo Launching local server at http://localhost:3000 ...
echo Press Ctrl+C to stop the application.
echo.

call npm run dev -- --open --port 3000
goto END

:NO_NODE
echo.
echo [ERROR] Node.js is not installed or not found in system PATH.
echo Please install Node.js (v18 or higher) from: https://nodejs.org/
echo.
pause
exit /b 1

:NPM_FAIL
echo.
echo [ERROR] Failed to install npm dependencies.
echo Please check your internet connection or npm permissions.
echo.
pause
exit /b 1

:END
pause
