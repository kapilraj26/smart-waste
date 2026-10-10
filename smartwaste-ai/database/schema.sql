-- SmartWaste AI — Postgres schema
-- Register page inserts into users; login page authenticates against it.
-- Reports / collections / analytics pages read ONLY from the tables below.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    reporter VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS ix_reports_category ON reports (category);

CREATE TABLE IF NOT EXISTS collection_tasks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    meta VARCHAR(255) NOT NULL DEFAULT '',
    due VARCHAR(100) NOT NULL DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_collection_tasks_status ON collection_tasks (status);

CREATE TABLE IF NOT EXISTS waste_records (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    bin_name VARCHAR(100) NOT NULL DEFAULT '',
    image_path VARCHAR(255) NOT NULL DEFAULT '',
    guidance TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '[]',
    recyclable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_chat_messages_session ON chat_messages (session_id);
