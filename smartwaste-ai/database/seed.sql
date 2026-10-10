-- Demo user: email demo@smartwaste.ai / password demo1234
-- Bcrypt hash of "demo1234" (generated via app.core.security.hash_password).
INSERT INTO users (name, email, hashed_password)
VALUES (
    'Demo User',
    'demo@smartwaste.ai',
    '$2b$12$naCHrww.PxfqygSKOsWO..cAJQJ3HQ8N4VsF9EdR/buybh6V57BHG'
)
ON CONFLICT (email) DO NOTHING;

-- Sample waste reports (shown on Dashboard / Waste Reports / Analytics).
INSERT INTO reports (code, category, location, weight_kg, status, reporter, created_at)
VALUES
    ('WR-1042', 'Plastic', 'Sector 9, Bin A-12', 4.2, 'Collected', 'A. Khan', NOW() - INTERVAL '2 hours'),
    ('WR-1041', 'Organic', 'Sector 4, Bin C-03', 7.8, 'Scheduled', 'S. Malik', NOW() - INTERVAL '4 hours'),
    ('WR-1040', 'E-Waste', 'Sector 9, Depot 2', 2.1, 'In-Progress', 'R. Ahmed', NOW() - INTERVAL '1 day'),
    ('WR-1039', 'Paper', 'Sector 1, Bin B-07', 3.5, 'Pending', 'F. Iqbal', NOW() - INTERVAL '1 day'),
    ('WR-1038', 'Glass', 'Sector 6, Bin D-11', 5.0, 'Collected', 'A. Khan', NOW() - INTERVAL '2 days'),
    ('WR-1037', 'Metal', 'Sector 2, Depot 1', 6.3, 'Missed', 'S. Malik', NOW() - INTERVAL '2 days')
ON CONFLICT (code) DO NOTHING;

-- Sample collection tasks.
INSERT INTO collection_tasks (code, title, meta, due, status, done)
VALUES
    ('CT-211', 'Sector 9 morning route', 'Bins A-01 to A-20 · Crew B · 12 stops', 'Today, 12:00', 'Completed', TRUE),
    ('CT-210', 'Depot 2 e-waste pickup', 'Commercial · Crew A · Truck 4', 'Today, 14:30', 'In-Progress', FALSE),
    ('CT-209', 'Sector 4 organic round', 'Bins C-01 to C-15 · Crew C · 15 stops', 'Today, 16:00', 'Scheduled', FALSE),
    ('CT-208', 'Sector 1 paper collection', 'Bins B-01 to B-10 · Crew B · 10 stops', 'Tomorrow, 09:00', 'Scheduled', FALSE),
    ('CT-207', 'Sector 6 glass pickup', 'Bins D-01 to D-12 · Crew A · 12 stops', 'Yesterday, 17:00', 'Missed', FALSE)
ON CONFLICT (code) DO NOTHING;
