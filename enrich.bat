@echo off
REM AI enrichment launcher - double-click, no terminal typing needed.
cd /d "C:\Users\HP\Documents\effective-lamp"
if not defined OPENROUTER_API_KEY set /p OPENROUTER_API_KEY=OpenRouter key (sk-or-v1-...):
"C:\Program Files\nodejs\node.exe" scripts\enrich.mjs
echo.
echo --- done (ok: lines = enriched; fail: lines need attention) ---
pause
