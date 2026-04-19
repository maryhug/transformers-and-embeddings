/**
 * Módulo de conexión y configuración de la base de datos SQLite.
 * Inicializa better-sqlite3, crea las tablas si no existen y exporta
 * la instancia de la base de datos para uso en los repositorios.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/** Ruta al archivo de base de datos SQLite desde las variables de entorno */
const DB_PATH = process.env.DATABASE_PATH ?? './data/database.sqlite';

/** Ruta absoluta al archivo de esquema SQL */
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/**
 * Inicializa la base de datos SQLite, crea el directorio si no existe
 * y ejecuta el esquema inicial para crear las tablas necesarias.
 * @returns Instancia de better-sqlite3 lista para usar
 */
function initializeDatabase(): Database.Database {
  // Crear el directorio de datos si no existe
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Crear la instancia de la base de datos
  const db = new Database(DB_PATH);

  // Activar modo WAL para mejor rendimiento en escrituras concurrentes
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Leer y ejecutar el esquema SQL para crear las tablas
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log(`✅ Base de datos inicializada en: ${path.resolve(DB_PATH)}`);
  return db;
}

/** Instancia singleton de la base de datos */
export const db = initializeDatabase();
