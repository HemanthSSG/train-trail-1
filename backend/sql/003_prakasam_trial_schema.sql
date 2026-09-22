-- Temporary Prakasam trial dataset for RAILCUE.
-- Derived from railway_prakasam.db supplied for this trial run.
-- IMPORTANT: this dataset is trial data. Simulated/archival train positions are NOT live.
-- Gate status is kept UNKNOWN unless genuine physical telemetry is supplied.
BEGIN;

CREATE TABLE IF NOT EXISTS train_gate_relationships(
 id BIGSERIAL PRIMARY KEY,
 gate_id BIGINT NOT NULL REFERENCES railway_gates(id) ON DELETE CASCADE,
 train_id BIGINT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
 direction TEXT,
 route_sequence INTEGER,
 normally_passes BOOLEAN DEFAULT TRUE,
 stations_before TEXT,
 stations_after TEXT,
 data_source TEXT NOT NULL,
 verified_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS train_gate_relationships_uq
 ON train_gate_relationships(gate_id,train_id,direction,route_sequence);

CREATE TABLE IF NOT EXISTS train_position_history(
 id BIGSERIAL PRIMARY KEY,
 train_id BIGINT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
 latitude DOUBLE PRECISION,
 longitude DOUBLE PRECISION,
 gate_id BIGINT REFERENCES railway_gates(id) ON DELETE SET NULL,
 station_code TEXT,
 direction TEXT,
 distance_from_gate_km DOUBLE PRECISION,
 stations_remaining INTEGER,
 speed_kmh DOUBLE PRECISION,
 delay_minutes INTEGER,
 is_live BOOLEAN NOT NULL DEFAULT FALSE,
 data_source TEXT NOT NULL,
 recorded_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS gate_status_history(
 id BIGSERIAL PRIMARY KEY,
 gate_id BIGINT NOT NULL REFERENCES railway_gates(id) ON DELETE CASCADE,
 status TEXT NOT NULL,
 source TEXT NOT NULL,
 confidence DOUBLE PRECISION,
 event_type TEXT,
 train_id BIGINT REFERENCES trains(id) ON DELETE SET NULL,
 distance_km DOUBLE PRECISION,
 recorded_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS prediction_results(
 id BIGSERIAL PRIMARY KEY,
 train_id BIGINT REFERENCES trains(id) ON DELETE SET NULL,
 gate_id BIGINT REFERENCES railway_gates(id) ON DELETE SET NULL,
 predicted_arrival_time TEXT,
 predicted_close_time TEXT,
 predicted_open_time TEXT,
 confidence DOUBLE PRECISION,
 sample_size INTEGER,
 model_version TEXT,
 based_on TEXT,
 created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS train_gate_eta(
 id BIGSERIAL PRIMARY KEY,
 gate_id BIGINT NOT NULL REFERENCES railway_gates(id) ON DELETE CASCADE,
 train_id BIGINT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
 distance_km DOUBLE PRECISION,
 stations_remaining INTEGER,
 speed_kmh DOUBLE PRECISION,
 eta_minutes DOUBLE PRECISION,
 data_source TEXT NOT NULL,
 calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
