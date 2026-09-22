# RAILCUE Local Run Guide

This branch contains the Prakasam temporary trial backend.

## Requirements
- Node.js LTS
- npm
- The supplied SQLite file `railway_prakasam.db`

## Database placement
Place the SQLite file at `backend/data/railway_prakasam.db`.

The database is intentionally not committed to GitHub because it is a temporary simulated trial dataset.

## Windows CMD — easiest backend start
From the repository root, double-click `run-local.cmd` or run:

    run-local.cmd

Manual commands:

    cd backend
    npm install
    set PRAKASAM_DB_PATH=./data/railway_prakasam.db
    npm start

Backend: http://localhost:8080

## Health checks
Open:
- http://localhost:8080/health
- http://localhost:8080/api/prakasam/health
- http://localhost:8080/api/prakasam/trains/live

## Trial-data limitation
The Prakasam SQLite database contains simulated live train states. It is not verified live railway telemetry. Physical gate state remains `UNKNOWN` unless genuine gate telemetry is integrated.

## Rail-run API
`POST /api/prakasam/rail-run` accepts a start and destination, computes the route, finds nearby railway gates, associates nearby/related trains, calculates train-to-gate distance and ETA, and returns prediction data separately from physical gate status.
