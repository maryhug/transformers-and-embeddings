/**
 * Servicio de autenticación.
 * Contiene la lógica de negocio para registro e inicio de sesión.
 * Maneja el hashing de contraseñas con bcrypt y la generación de tokens JWT.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as userRepository from '../repositories/user.repository';
import type { IPublicUser, IAuthResponse, IJwtPayload } from '../types/auth.types';
import type { ServiceResult } from '../types/db.types';

dotenv.config();

/** Número de rondas de sal para bcrypt — equilibrio entre seguridad y rendimiento */
const SALT_ROUNDS = 10;

/** Secreto para firmar los tokens JWT */
const JWT_SECRET = process.env.JWT_SECRET ?? 'secreto_por_defecto_inseguro';

/** Duración del token JWT */
const JWT_EXPIRES_IN = '7d';

/**
 * Hashea una contraseña en texto plano usando bcrypt.
 * @param password - La contraseña en texto plano a hashear
 * @returns Promise que resuelve con el string de la contraseña hasheada
 */
async function hashPassword(password: string): Promise<string> {
  // Usamos 10 rondas de sal — equilibrio entre seguridad y rendimiento
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con un hash bcrypt.
 * @param password - Contraseña en texto plano ingresada por el usuario
 * @param hash - Hash almacenado en la base de datos
 * @returns Promise que resuelve con true si coinciden, false si no
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT firmado con los datos del usuario.
 * @param userId - ID numérico del usuario
 * @param email - Correo electrónico del usuario
 * @returns String del token JWT firmado
 */
function generateToken(userId: number, email: string): string {
  const payload: IJwtPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Registra un nuevo usuario en el sistema.
 * Valida que el correo y nombre de usuario no estén en uso,
 * hashea la contraseña y genera un token JWT.
 * @param username - Nombre de usuario deseado
 * @param email - Correo electrónico del nuevo usuario
 * @param password - Contraseña en texto plano
 * @returns ServiceResult con el token y datos del usuario o un error descriptivo
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<ServiceResult<IAuthResponse>> {
  // Verificar si el correo ya está registrado
  const existingEmail = userRepository.findUserByEmail(email);
  if (existingEmail) {
    return { success: false, error: 'Correo electrónico ya registrado', code: 409 };
  }

  // Verificar si el nombre de usuario ya está en uso
  const existingUsername = userRepository.findUserByUsername(username);
  if (existingUsername) {
    return { success: false, error: 'Nombre de usuario ya en uso', code: 409 };
  }

  // Validar longitud mínima de contraseña
  if (password.length < 6) {
    return {
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres',
      code: 400,
    };
  }

  // Hashear la contraseña antes de guardarla
  const passwordHash = await hashPassword(password);

  // Crear el usuario en la base de datos
  const user: IPublicUser = userRepository.createUser(username, email, passwordHash);

  // Generar el token JWT para la sesión inmediata
  const token = generateToken(user.id, user.email);

  return { success: true, data: { token, user } };
}

/**
 * Inicia sesión con correo y contraseña.
 * Busca el usuario, verifica el hash de bcrypt y genera un nuevo token JWT.
 * @param email - Correo electrónico del usuario
 * @param password - Contraseña en texto plano a verificar
 * @returns ServiceResult con el token y datos del usuario o error de credenciales
 */
export async function login(
  email: string,
  password: string
): Promise<ServiceResult<IAuthResponse>> {
  // Buscar el usuario por correo
  const user = userRepository.findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Credenciales incorrectas', code: 401 };
  }

  // Comparar la contraseña ingresada con el hash almacenado
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, error: 'Credenciales incorrectas', code: 401 };
  }

  // Generar token JWT para la nueva sesión
  const token = generateToken(user.id, user.email);

  const publicUser: IPublicUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
  };

  return { success: true, data: { token, user: publicUser } };
}

/**
 * Verifica y decodifica un token JWT.
 * @param token - Token JWT a verificar
 * @returns El payload decodificado o null si el token es inválido/expirado
 */
export function verifyToken(token: string): IJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch {
    return null;
  }
}
