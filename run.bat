@echo off
echo ===================================================
echo   Starting AbanobLeague Application Services
echo ===================================================
echo.

echo [1/2] Starting Backend API...
start "AbanobLeague - Backend" cmd /k "cd /d %~dp0backend\src\AbanobLeague.API && title Backend API && dotnet run"

echo [2/2] Starting Frontend (React)...
start "AbanobLeague - Frontend" cmd /k "cd /d %~dp0frontend && title Frontend && npm run dev"

echo.
echo Both services are starting in separate windows!
echo - Backend will be available on its configured port (usually https://localhost:7119 or similar).
echo - Frontend will open automatically in your browser (usually http://localhost:5173).
echo.
pause
