@echo off
title Time Tracker Pro - Control Panel
color 0B

:MENU
cls
echo ========================================
echo     TIME TRACKER PRO - CONTROL PANEL
echo         by Karas Barsoum
echo ========================================
echo.
echo  [1] Run Desktop App (Electron)
echo  [2] Run Web Version (Browser)
echo  [3] Build Setup Installer (.exe)
echo  [4] Deploy to GitHub (Online)
echo  [5] Open Project Folder
echo  [6] View Admin Password
echo  [7] Open GitHub Repository
echo  [8] Open Live Website
echo  [9] Exit
echo.
echo ========================================
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto RUN_APP
if "%choice%"=="2" goto RUN_WEB
if "%choice%"=="3" goto BUILD
if "%choice%"=="4" goto DEPLOY
if "%choice%"=="5" goto OPEN_FOLDER
if "%choice%"=="6" goto SHOW_PASSWORD
if "%choice%"=="7" goto OPEN_GITHUB
if "%choice%"=="8" goto OPEN_WEBSITE
if "%choice%"=="9" exit
goto MENU

:RUN_APP
echo.
echo Starting Desktop App...
call npm start
goto MENU

:RUN_WEB
echo.
echo Starting Web Server...
echo Open http://localhost:8080 in your browser
start http://localhost:8080
python -m http.server 8080
goto MENU

:BUILD
echo.
echo Building Setup Installer...
call npm run build:win
echo.
echo BUILD COMPLETE!
echo Setup file: dist\Time Tracker Pro Setup 1.0.0.exe
pause
goto MENU

:DEPLOY
echo.
echo Deploying to GitHub...
git add .
git commit -m "Update Time Tracker Pro"
git push origin main
echo.
echo DEPLOYED! Website will update in 1-2 minutes.
pause
goto MENU

:OPEN_FOLDER
echo.
explorer .
goto MENU

:SHOW_PASSWORD
echo.
echo ========================================
echo          ADMIN ACCESS INFO
echo ========================================
echo.
echo  Admin Password: adminMm
echo.
echo  Admin Features:
echo  - Edit record dates
echo  - Edit clock in/out times
echo  - Modify hours
echo.
echo ========================================
pause
goto MENU

:OPEN_GITHUB
start https://github.com/kerousertik/time-tracker-pro
goto MENU

:OPEN_WEBSITE
start https://kerousertik.github.io/time-tracker-pro/
goto MENU
