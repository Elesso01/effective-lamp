@echo off
REM AI enrichment retry - regenerates ALL stories (use when one came back empty).
cd /d "C:\Users\HP\Documents\effective-lamp"
if not defined OPENROUTER_API_KEY set /p OPENROUTER_API_KEY=OpenRouter key (sk-or-v1-...):
"C:\Program Files\nodejs\node.exe" scripts\enrich.mjs --force
echo.
echo --- done (check data\stories.json, then tell me "enriched") ---
pause
