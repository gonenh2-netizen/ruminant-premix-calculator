# Ruminant Vitamin & Mineral Premix Calculator

Single-page web calculator for formulating vitamin & mineral premixes for **dairy cattle, beef cattle, goats, and sheep**, based on NASEM 2021 / NRC 2007 / NRC 2016 requirement tables.

## Features

- Species + breed + stage selection with milk yield scaling
- Beef quality adjustments (marbling / meat color / shelf life)
- Organic vs inorganic mineral split per nutrient
- Branded-product catalog (Zinpro, Alltech, Novus, Kemin, Selko/Trouw, Biochem, Adisseo)
- Multi-mineral blend support (Availa-4, Bioplex Quadra, IntelliBond Vitals, KemTRACE, …)
- Custom products saved to browser localStorage
- Live pricing in 7 currencies (USD/EUR/ILS/GBP/VND/AZN/IDR)
- Exports: CSV report, Rationall matrix CSV, AMTS/NDS XML

## Install & Run

**Windows:** Double-click `install.cmd` (or run `install.ps1` in PowerShell).
**macOS/Linux:** `bash install.sh`

Or manually:

```bash
git clone https://github.com/gonenh2-netizen/ruminant-premix-calculator.git
cd ruminant-premix-calculator
npm install
npm run dev       # hot-reload dev server
npm run build     # produces dist/index.html (single self-contained file)
```

The built `dist/index.html` is standalone — double-click in Chrome or any modern browser.

## Development with Claude Code

This repo is set up for [Claude Code](https://claude.com/claude-code). See `CLAUDE.md` for the project context, data model, and open task list.

```bash
cd ruminant-premix-calculator
claude      # launches Claude Code in this directory
```

## Data sources

- **Dairy**: NASEM 2021 (Nutrient Requirements of Dairy Cattle, 8th rev.)
- **Goats & Sheep**: NRC 2007 Small Ruminants
- **Beef**: NRC 2016 Beef Cattle (8th rev.), with SEA / *Bos indicus* breed adjustments
- Branded product specs: manufacturer public product sheets

## License

Private use. Brand names (Zinpro, Availa, Bioplex, Mintrex, IntelliBond, Sel-Plex, Selisseo, KemTRACE, E.C.O.Trace) are trademarks of their respective owners.
