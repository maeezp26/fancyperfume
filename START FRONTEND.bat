@echo off
echo ==========================================
echo   FANCY PERFUME — Starting Frontend
echo ==========================================
cd /d "%~dp0front"
if not exist node_modules (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)
echo.
echo Frontend starting on http://localhost:5173
echo.
npm run dev
pause
