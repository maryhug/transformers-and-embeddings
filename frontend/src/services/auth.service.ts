/**
 * Servicio de autenticación del frontend.
 * Encapsula todas las llamadas a la API relacionadas con auth.
 */

import { apiFetch } from '../utils/api';
import type { IAuthResponse, IPublicUser } from '../types/auth.types';
import type { IApiResponse } from '../types/embedding.types';

/**
 * Registra un nuevo usuario en el sistema.
 * @param username - Nombre de usuario
 * @param email - Correo electrónico
 * @param password - Contraseña en texto plano
 * @returns Respuesta de la API con token y datos del usuario
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<IApiResponse<IAuthResponse>> {
  return apiFetch<IApiResponse<IAuthResponse>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
    skipAuth: true,
  });
}

/**
 * Inicia sesión con correo y contraseña.
 * @param email - Correo electrónico del usuario
 * @param password - Contraseña en texto plano
 * @returns Respuesta de la API con token y datos del usuario
 */
export async function login(
  email: string,
  password: string
): Promise<IApiResponse<IAuthResponse>> {
  return apiFetch<IApiResponse<IAuthResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

/**
 * Obtiene el perfil del usuario autenticado.
 * @returns Respuesta de la API con los datos públicos del usuario
 */
export async function getMe(): Promise<IApiResponse<IPublicUser>> {
  return apiFetch<IApiResponse<IPublicUser>>('/api/auth/me');
}

/**
 * Guarda el token y datos del usuario en localStorage.
 * @param token - Token JWT
 * @param user - Datos públicos del usuario
 */
export function saveSession(token: string, user: IPublicUser): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Elimina el token y datos del usuario de localStorage (cerrar sesión).
 */
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Obtiene el token JWT almacenado en localStorage.
 * @returns El token JWT o null si no hay sesión activa
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Obtiene los datos del usuario almacenados en localStorage.
 * @returns Los datos del usuario o null si no hay sesión activa
 */
export function getStoredUser(): IPublicUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IPublicUser;
  } catch {
    return null;
  }
}
