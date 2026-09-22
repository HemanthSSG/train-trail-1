# Prakasam Rail Run — Temporary Trial Data

Place the supplied SQLite database at:

`backend/data/railway_prakasam.db`

Expected file:
`railway_prakasam.db`

The backend reads it in read-only mode through `better-sqlite3`.

Environment variable:
`PRAKASAM_DB_PATH=./data/railway_prakasam.db`

This is a **temporary simulated trial dataset**. It must not be presented as verified live railway telemetry. Live train and physical gate status remain separate production integrations.
