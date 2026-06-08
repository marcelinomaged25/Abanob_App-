@echo off
echo ===================================================
echo   Starting AbanobLeague Application Services
echo ===================================================
echo.

echo [1/3] Starting PostgreSQL Database...
start "AbanobLeague - Database" cmd /k "title PostgreSQL DB && ""%~dp0pgsql\bin\postgres.exe"" -D ""%~dp0pgsql\data"""

echo [2/3] Starting Backend API...
start "AbanobLeague - Backend" cmd /k "cd /d %~dp0backend\src\AbanobLeague.API && title Backend API && dotnet run"

echo [3/3] Starting Frontend (React)...
start "AbanobLeague - Frontend" cmd /k "cd /d %~dp0frontend && title Frontend && npm run dev"

echo.
echo All services are starting in separate windows!
echo - Database will run in its own terminal.
echo - Backend will be available on its configured port (usually https://localhost:7119 or similar).
echo - Frontend will open automatically in your browser (usually http://localhost:5173).
echo.
pause
