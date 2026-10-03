@echo off
REM Headlines refresh - fetches live RSS, rebuilds briefing + feed + alerts + metrics + digest.
cd /d "C:\Users\HP\Documents\effective-lamp"
set NODE="C:\Program Files\nodejs\node.exe"
%NODE% scripts\fetch-rss.mjs --limit 8
if errorlevel 1 goto failed
%NODE% scripts\briefing.mjs
%NODE% scripts\ranker.mjs
%NODE% scripts\alerts.mjs
%NODE% scripts\metrics.mjs
%NODE% scripts\digest.mjs
echo.
echo --- done (data\briefing.json has today's stories) ---
pause
goto end
:failed
echo.
echo --- fetch failed, previous stories.json restored ---
pause
:end
