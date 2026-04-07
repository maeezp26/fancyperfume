@echo off
echo ==========================================
echo   FANCY PERFUME — Starting Backend
echo ==========================================
cd /d "%~dp0back"
if not exist node_modules (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)
echo.
echo Backend starting on http://localhost:5000
echo.
npm run dev
pause
