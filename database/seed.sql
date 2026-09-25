-- Sample seed data reference
-- Run scripts/export-network-data.ts to generate JSON, then load via API or ETL pipeline.
-- Example substation insert:

-- INSERT INTO substations (id, name, location, zone_id, voltage_level, incoming_voltage, outgoing_voltage, capacity_mva, load_mw, health, status)
-- VALUES (
--   'SS-001',
--   'Panipat',
--   ST_SetSRID(ST_MakePoint(76.9635, 29.3909), 4326),
--   'zone-north',
--   '220/132kV', 220, 132, 500, 310, 'Healthy', 'Running'
-- );

-- For full seed from generated JSON, use:
--   npx tsx scripts/seed-database.ts (future)

SELECT 'Schema ready. Load data via API or seed script.' AS status;
