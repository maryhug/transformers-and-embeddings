/**
 * Repositorio de usuarios.
 * Contiene todas las operaciones de base de datos relacionadas con la tabla users.
 * Implementa el patrón Repository para desacoplar la lógica de acceso a datos.
 */

import { db } from '../db/database';
import type { IUser, IPublicUser } from '../types/auth.types';

/**
 * Busca un usuario por su dirección de correo electrónico.
 * @param email - Correo electrónico a buscar
 * @returns El usuario encontrado o undefined si no existe
 */
export function findUserByEmail(email: string): IUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as IUser | undefined;
}

/**
 * Busca un usuario por su nombre de usuario único.
 * @param username - Nombre de usuario a buscar
 * @returns El usuario encontrado o undefined si no existe
 */
export function findUserByUsername(username: string): IUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as IUser | undefined;
}

/**
 * Busca un usuario por su identificador numérico único.
 * @param id - ID del usuario a buscar
 * @returns El usuario encontrado o undefined si no existe
 */
export function findUserById(id: number): IUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as IUser | undefined;
}

/**
 * Crea un nuevo usuario en la base de datos.
 * @param username - Nombre de usuario único
 * @param email - Correo electrónico único
 * @param passwordHash - Hash bcrypt de la contraseña
 * @returns El usuario público recién creado (sin la contraseña)
 */
export function createUser(
  username: string,
  email: string,
  passwordHash: string
): IPublicUser {
  const stmt = db.prepare(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
  );
  const result = stmt.run(username, email, passwordHash);
  const newUser = findUserById(result.lastInsertRowid as number);
  if (!newUser) {
    throw new Error('Error al crear el usuario en la base de datos');
  }
  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    created_at: newUser.created_at,
  };
}
