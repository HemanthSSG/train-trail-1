@echo off
setlocal
cd /d "%~dp0"
if not exist "data\railway_prakasam.db" (
  echo ERROR: data\railway_prakasam.db not found.
  echo Place the supplied SQLite database in backend\data\ first.
  pause
  exit /b 1
)
if not exist "node_modules" (
  call npm install
  if errorlevel 1 exit /b 1
)
set PRAKASAM_DB_PATH=./data/railway_prakasam.db
call npm start
