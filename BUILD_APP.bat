@echo off
echo ========================================
echo   Time Tracker Pro - Build Script
echo   by Karas Barsoum
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building Windows executable...
call npm run build:win

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Your app is in the "dist" folder.
echo Look for "Time Tracker Pro.exe"
echo.
pause
