CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  balance NUMERIC(10, 2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  ig_link TEXT,
  status TEXT DEFAULT 'Lead Novo' CHECK (status IN ('Lead Novo', 'Contato Inicial', 'Em Negociação', 'Fechado')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('CALL', 'IG_MESSAGE')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_date DATE DEFAULT CURRENT_DATE,
  calls_count INTEGER DEFAULT 0,
  ig_messages_count INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, target_date)
);

-- Insert a default admin for testing
INSERT INTO users (name, email, password, role) VALUES ('Administrador', 'admin@crm.com', 'admin123', 'ADMIN');
-- Insert a default user for testing
INSERT INTO users (name, email, password, role) VALUES ('Vendedor 1', 'vendedor@crm.com', 'vendedor123', 'USER');
