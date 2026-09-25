-- HSETCL Transmission Network Digital Twin — PostGIS Schema
-- PostgreSQL 15+ with PostGIS 3.4+

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Administrative hierarchy
CREATE TABLE zones (
    id          VARCHAR(32) PRIMARY KEY,
    name        VARCHAR(128) NOT NULL,
    code        VARCHAR(8)  NOT NULL,
    boundary    GEOMETRY(Polygon, 4326) NOT NULL,
    color       VARCHAR(16),
    total_substations INT DEFAULT 0,
    total_load_mw   NUMERIC(10,2) DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE circles (
    id          VARCHAR(32) PRIMARY KEY,
    zone_id     VARCHAR(32) NOT NULL REFERENCES zones(id),
    name        VARCHAR(128) NOT NULL,
    boundary    GEOMETRY(Polygon, 4326) NOT NULL,
    color       VARCHAR(16),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE divisions (
    id          VARCHAR(32) PRIMARY KEY,
    circle_id   VARCHAR(32) NOT NULL REFERENCES circles(id),
    zone_id     VARCHAR(32) NOT NULL REFERENCES zones(id),
    name        VARCHAR(128) NOT NULL,
    boundary    GEOMETRY(Polygon, 4326) NOT NULL,
    color       VARCHAR(16),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Electrical assets
CREATE TABLE substations (
    id                  VARCHAR(32) PRIMARY KEY,
    name                VARCHAR(128) NOT NULL,
    location            GEOMETRY(Point, 4326) NOT NULL,
    zone_id             VARCHAR(32) REFERENCES zones(id),
    circle_id           VARCHAR(32) REFERENCES circles(id),
    division_id         VARCHAR(32) REFERENCES divisions(id),
    voltage_level       VARCHAR(32),
    incoming_voltage    INT,
    outgoing_voltage    INT,
    capacity_mva        NUMERIC(8,2),
    load_mw             NUMERIC(8,2),
    power_received_mw   NUMERIC(8,2),
    power_sent_mw       NUMERIC(8,2),
    feeders_in          INT DEFAULT 0,
    feeders_out         INT DEFAULT 0,
    health              VARCHAR(16) DEFAULT 'Healthy',
    status              VARCHAR(16) DEFAULT 'Running',
    temperature_c       NUMERIC(5,1),
    oil_level_pct       NUMERIC(5,1),
    last_maintenance    DATE,
    maintenance_due     DATE,
    scada_tag           VARCHAR(64),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transmission_towers (
    id              VARCHAR(32) PRIMARY KEY,
    tower_number    VARCHAR(16) NOT NULL,
    location        GEOMETRY(Point, 4326) NOT NULL,
    height_m        NUMERIC(6,2),
    tower_type      VARCHAR(32),
    voltage_level   VARCHAR(8),
    health          VARCHAR(16) DEFAULT 'Healthy',
    maintenance_due DATE,
    status          VARCHAR(16) DEFAULT 'Running',
    line_id         VARCHAR(32),
    sequence        INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transmission_lines (
    id                  VARCHAR(32) PRIMARY KEY,
    name                VARCHAR(256) NOT NULL,
    voltage_level       VARCHAR(8) NOT NULL,
    from_substation_id  VARCHAR(32) REFERENCES substations(id),
    to_substation_id    VARCHAR(32) REFERENCES substations(id),
    corridor            GEOMETRY(LineString, 4326) NOT NULL,
    length_km           NUMERIC(8,2),
    load_pct            NUMERIC(5,2),
    flow_mw             NUMERIC(8,2),
    flow_direction      VARCHAR(8) DEFAULT 'forward',
    health              VARCHAR(16) DEFAULT 'Healthy',
    status              VARCHAR(16) DEFAULT 'Running',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE line_tower_junction (
    line_id     VARCHAR(32) REFERENCES transmission_lines(id) ON DELETE CASCADE,
    tower_id    VARCHAR(32) REFERENCES transmission_towers(id) ON DELETE CASCADE,
    sequence    INT NOT NULL,
    PRIMARY KEY (line_id, tower_id)
);

-- Telemetry (future SCADA / IoT integration)
CREATE TABLE telemetry_readings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type  VARCHAR(32) NOT NULL,
    asset_id    VARCHAR(32) NOT NULL,
    metric      VARCHAR(64) NOT NULL,
    value       NUMERIC(12,4),
    unit        VARCHAR(16),
    protocol    VARCHAR(32),
    source_tag  VARCHAR(128),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE maintenance_alerts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type  VARCHAR(32) NOT NULL,
    asset_id    VARCHAR(32) NOT NULL,
    severity    VARCHAR(16) NOT NULL,
    message     TEXT,
    due_date    DATE,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial indexes
CREATE INDEX idx_zones_boundary      ON zones USING GIST (boundary);
CREATE INDEX idx_circles_boundary    ON circles USING GIST (boundary);
CREATE INDEX idx_divisions_boundary  ON divisions USING GIST (boundary);
CREATE INDEX idx_substations_loc     ON substations USING GIST (location);
CREATE INDEX idx_towers_loc          ON transmission_towers USING GIST (location);
CREATE INDEX idx_lines_corridor      ON transmission_lines USING GIST (corridor);
CREATE INDEX idx_telemetry_asset     ON telemetry_readings (asset_type, asset_id, recorded_at DESC);
CREATE INDEX idx_substations_health  ON substations (health);
CREATE INDEX idx_lines_voltage       ON transmission_lines (voltage_level);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_substations_updated
    BEFORE UPDATE ON substations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_lines_updated
    BEFORE UPDATE ON transmission_lines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
