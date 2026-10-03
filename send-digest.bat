@echo off
REM Digest sender launcher - double-click, no terminal typing needed.
cd /d "C:\Users\HP\Documents\effective-lamp"
set /p GMAIL_USER=Gmail address:
set /p GMAIL_APP_PASSWORD=App password (16 letters):
"C:\Program Files\nodejs\node.exe" scripts\send-digest.mjs
echo.
echo --- done (250 = sent; anything else, screenshot this window) ---
pause
