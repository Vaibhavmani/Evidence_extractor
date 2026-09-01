#!/usr/bin/env bash

set -e

echo "================================================================"
echo "       SECURE EXCEL MEDIA EXTRACTOR (LOCAL EDITION)             "
echo "================================================================"
echo ""

echo "[1/3] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not found in PATH."
    echo "Please install Node.js (v18 or higher) from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js version: $(node -v)"
echo ""

echo "[2/3] Verifying and installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing required dependencies via npm..."
    npm install
else
    echo "[OK] Dependencies already installed."
fi

echo ""
echo "[3/3] Starting local application server..."
echo "[INFO] 100% local browser processing active. Zero cloud upload."
echo "Launching local server at http://localhost:3000 ..."
echo ""

npm run dev -- --open --port 3000
