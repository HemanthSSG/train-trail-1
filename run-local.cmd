@echo off
setlocal
cd /d "%~dp0backend"
echo ========================================
echo RAILCUE - Local Backend
echo ========================================
if not exist "data\railway_prakasam.db" (
  echo.
  echo ERROR: railway_prakasam.db was not found.
  echo Put the supplied SQLite database at:
  echo %CD%\data\railway_prakasam.db
  echo.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Installing backend dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed. See the error above.
    pause
    exit /b 1
  )
)
set PRAKASAM_DB_PATH=./data/railway_prakasam.db
echo.
echo Starting RAILCUE backend on http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.
call npm start
