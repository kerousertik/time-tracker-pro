@echo off
echo ====================================
echo    Time Tracker Pro - Starting...
echo ====================================
echo.
echo Opening app at http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:8080

python -m http.server 8080
