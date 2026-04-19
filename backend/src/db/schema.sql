-- Esquema de la base de datos para el explorador de embeddings
-- Crea las tablas necesarias para usuarios y sus embeddings generados

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_input TEXT NOT NULL,
  model TEXT NOT NULL,
  vector TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
