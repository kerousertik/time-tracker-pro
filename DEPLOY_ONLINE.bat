@echo off
echo ========================================
echo   Deploy to GitHub Pages (FREE Hosting)
echo   by Karas Barsoum
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
)

echo.
echo Creating/updating GitHub Pages branch...
git add .
git commit -m "Update Time Tracker Pro"

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Create a GitHub repository at: https://github.com/new
echo    Name it: time-tracker-pro
echo.
echo 2. Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/time-tracker-pro.git

echo    git push -u origin main
echo.
echo 3. Go to your repo Settings ^> Pages
echo    Select "main" branch and "/" root
echo    Click Save
echo.
echo 4. Your app will be live at:
echo    https://github.com/kerousertik/time-tracker-pro
echo.
echo ========================================
pause
