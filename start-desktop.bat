@echo off
title Secure Excel Media Extractor Desktop Launcher

echo ================================================================
echo      SECURE EXCEL MEDIA EXTRACTOR (NATIVE DESKTOP APP)
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    exit /b 1
)

if not exist "node_modules\electron\" (
    echo [INFO] Installing desktop dependencies...
    call npm install
)

echo [INFO] Launching native desktop window...
call npm run electron:start

pause
