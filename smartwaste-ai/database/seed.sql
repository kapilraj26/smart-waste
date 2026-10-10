-- Demo user: email demo@smartwaste.ai / password demo1234
-- Bcrypt hash of "demo1234" (generated via app.core.security.hash_password).
INSERT INTO users (name, email, hashed_password)
VALUES (
    'Demo User',
    'demo@smartwaste.ai',
    '$2b$12$naCHrww.PxfqygSKOsWO..cAJQJ3HQ8N4VsF9EdR/buybh6V57BHG'
)
ON CONFLICT (email) DO NOTHING;
