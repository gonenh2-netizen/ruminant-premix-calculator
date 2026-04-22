#!/usr/bin/env bash
# Ruminant Premix Calculator — installer for macOS / Linux
# Usage:  bash install.sh

set -e

REPO='https://github.com/gonenh2-netizen/ruminant-premix-calculator.git'
DEST="$HOME/premix-calculator"

section() { printf '\n\e[36m%s\n%s\n%s\e[0m\n' '============================================================' "  $1" '============================================================'; }

section 'Ruminant Premix Calculator — Installer'

# 1. Node.js
echo
echo '[1/5] Checking Node.js...'
if ! command -v node >/dev/null 2>&1; then
    echo '  Node.js not found. Install from https://nodejs.org/ first.'
    exit 1
fi
echo "  Node.js $(node -v) - OK"

# 2. Git
echo
echo '[2/5] Checking Git...'
if ! command -v git >/dev/null 2>&1; then
    echo '  Git not found. Install from https://git-scm.com/ first.'
    exit 1
fi
echo "  $(git --version) - OK"

# 3. Clone/update
echo
echo '[3/5] Getting project source...'
if [ -d "$DEST" ]; then
    echo "  Repo exists at $DEST — pulling latest..."
    ( cd "$DEST" && git pull --rebase )
else
    echo "  Cloning to $DEST ..."
    git clone "$REPO" "$DEST"
fi

# 4. Install + build
echo
echo '[4/5] Installing npm dependencies...'
( cd "$DEST" && npm install --no-audit --no-fund )

echo
echo '[5/5] Building standalone HTML...'
( cd "$DEST" && npm run build )

BUILT="$DEST/dist/index.html"
OUT="$HOME/Desktop/Ruminant_Premix_Calculator.html"
if [ -f "$BUILT" ]; then
    cp "$BUILT" "$OUT"
    echo "  [OK] Built file copied to: $OUT"
fi

section 'Installation complete'
cat <<EOF

To USE the calculator:
  open "$OUT"   # macOS
  xdg-open "$OUT"  # Linux

To DEVELOP:
  cd "$DEST"
  npm run dev

To UPDATE:
  Run this install.sh again.

To work with Claude Code:
  cd "$DEST"
  claude

EOF
