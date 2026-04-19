/**
 * Controlador de autenticación.
 * Maneja las peticiones HTTP para registro, login y obtención del perfil.
 * Delega la lógica de negocio al servicio de autenticación.
 */

import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userRepository from '../repositories/user.repository';
import type { IRegisterRequest, ILoginRequest } from '../types/auth.types';

/**
 * Registra un nuevo usuario en el sistema.
 * POST /api/auth/register
 * @param req - Request con body { username, email, password }
 * @param res - Response con { token, user } o error
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body as IRegisterRequest;

  // Validar que todos los campos requeridos estén presentes
  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      error: 'Nombre de usuario, correo y contraseña son requeridos',
      code: 400,
    });
    return;
  }

  // Validar formato básico de correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      error: 'Formato de correo electrónico inválido',
      code: 400,
    });
    return;
  }

  const result = await authService.register(username.trim(), email.toLowerCase().trim(), password);

  if (!result.success) {
    res.status(result.code).json({ success: false, error: result.error, code: result.code });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
}

/**
 * Inicia sesión con correo y contraseña.
 * POST /api/auth/login
 * @param req - Request con body { email, password }
 * @param res - Response con { token, user } o error de credenciales
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as ILoginRequest;

  // Validar campos requeridos
  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: 'Correo y contraseña son requeridos',
      code: 400,
    });
    return;
  }

  const result = await authService.login(email.toLowerCase().trim(), password);

  if (!result.success) {
    res.status(result.code).json({ success: false, error: result.error, code: result.code });
    return;
  }

  res.json({ success: true, data: result.data });
}

/**
 * Obtiene el perfil del usuario autenticado.
 * GET /api/auth/me
 * @param req - Request con el userId inyectado por el middleware de auth
 * @param res - Response con los datos del usuario o error
 */
export function getMe(req: Request, res: Response): void {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
    return;
  }

  const user = userRepository.findUserById(userId);

  if (!user) {
    res.status(404).json({ success: false, error: 'Usuario no encontrado', code: 404 });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    },
  });
}
