# Secure Excel Media Extractor PowerShell Launcher

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       SECURE EXCEL MEDIA EXTRACTOR (LOCAL EDITION)             " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/3] Checking Node.js environment..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not found in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18 or higher) from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

$nodeVersion = node -v
Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# 2. Check dependencies
Write-Host "[2/3] Verifying and installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing required dependencies via npm..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Dependency installation failed." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
} else {
    Write-Host "[OK] Dependencies already installed." -ForegroundColor Green
}

Write-Host ""
# 3. Launch App
Write-Host "[3/3] Starting local application server..." -ForegroundColor Yellow
Write-Host "[INFO] 100% local browser processing active. Zero cloud upload." -ForegroundColor Green
Write-Host "Launching local server at http://localhost:3000 ..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

npm run dev -- --open --port 3000
