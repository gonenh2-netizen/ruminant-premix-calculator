# ============================================================================
# Ruminant Premix Calculator — one-shot installer for Windows (PowerShell)
# ============================================================================
# Usage:   Right-click install.ps1 → "Run with PowerShell"
# Or:      powershell -ExecutionPolicy Bypass -File install.ps1
#
# What it does:
#   1. Checks Node.js + Git are installed (opens download page if missing).
#   2. Clones the repo to %USERPROFILE%\premix-calculator (updates if already cloned).
#   3. Runs `npm install` to fetch React, Vite, Tailwind.
#   4. Runs `npm run build` to produce a single-file Ruminant_Premix_Calculator.html.
#   5. Copies the built HTML to your Desktop so you can double-click it.
#   6. Prints commands for running the dev server with hot reload.
# ============================================================================

$ErrorActionPreference = 'Stop'
$REPO  = 'https://github.com/gonenh2-netizen/ruminant-premix-calculator.git'
$DEST  = Join-Path $env:USERPROFILE 'premix-calculator'
$DESKTOP = [Environment]::GetFolderPath('Desktop')

function Write-Section($title) {
    Write-Host ''
    Write-Host ('=' * 70) -ForegroundColor Cyan
    Write-Host ('  ' + $title) -ForegroundColor Cyan
    Write-Host ('=' * 70) -ForegroundColor Cyan
}

Write-Section 'Ruminant Premix Calculator — Installer'

# -------- 1. Check Node.js --------
Write-Host ''
Write-Host '[1/5] Checking Node.js...' -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host 'Node.js is not installed.' -ForegroundColor Red
    Write-Host 'Opening https://nodejs.org/ — please install the LTS version, then re-run this script.'
    Start-Process 'https://nodejs.org/en/download/'
    exit 1
}
$nodeVer = & node -v
Write-Host "  Node.js $nodeVer - OK" -ForegroundColor Green

# -------- 2. Check Git --------
Write-Host ''
Write-Host '[2/5] Checking Git...' -ForegroundColor Yellow
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host 'Git is not installed.' -ForegroundColor Red
    Write-Host 'Opening https://git-scm.com/download/win — please install, then re-run this script.'
    Start-Process 'https://git-scm.com/download/win'
    exit 1
}
$gitVer = (& git --version).Split(' ')[2]
Write-Host "  Git $gitVer - OK" -ForegroundColor Green

# -------- 3. Clone or update repo --------
Write-Host ''
Write-Host '[3/5] Getting project source...' -ForegroundColor Yellow
if (Test-Path $DEST) {
    Write-Host "  Repo exists at $DEST - pulling latest..."
    Push-Location $DEST
    & git pull --rebase
    Pop-Location
} else {
    Write-Host "  Cloning to $DEST ..."
    & git clone $REPO $DEST
}

# -------- 4. npm install + build --------
Push-Location $DEST
Write-Host ''
Write-Host '[4/5] Installing npm dependencies (first run takes ~1-2 min)...' -ForegroundColor Yellow
& npm install --no-audit --no-fund

Write-Host ''
Write-Host '[5/5] Building standalone HTML...' -ForegroundColor Yellow
& npm run build

# Copy result to Desktop with a clean name
$built = Join-Path $DEST 'dist\index.html'
$out = Join-Path $DESKTOP 'Ruminant_Premix_Calculator.html'
if (Test-Path $built) {
    Copy-Item $built $out -Force
    Write-Host ''
    Write-Host "  [OK] Built file copied to: $out" -ForegroundColor Green
}

Pop-Location

# -------- Done --------
Write-Section 'Installation complete'
Write-Host ''
Write-Host 'To USE the calculator:'
Write-Host "  Double-click $out" -ForegroundColor Cyan
Write-Host ''
Write-Host 'To DEVELOP (hot reload in browser):'
Write-Host "  cd `"$DEST`""
Write-Host '  npm run dev'
Write-Host ''
Write-Host 'To UPDATE later (pull new features from GitHub):'
Write-Host '  Run this install.ps1 again.'
Write-Host ''
Write-Host 'To work on this with Claude Code:'
Write-Host "  cd `"$DEST`""
Write-Host '  claude        # launches Claude Code in this project (see CLAUDE.md)'
Write-Host ''

# Offer to open the built HTML
$ans = Read-Host 'Open the calculator now? (Y/N)'
if ($ans -match '^[Yy]') {
    Start-Process $out
}
