/**
 * Middleware de autenticación JWT.
 * Verifica el token Bearer en el header Authorization de cada petición protegida.
 * Adjunta los datos del usuario al objeto Request si el token es válido.
 */

import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as userRepository from '../repositories/user.repository';

/** Extensión del tipo Request de Express para incluir el usuario autenticado */
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
    }
  }
}

/**
 * Middleware que verifica el token JWT en la cabecera Authorization.
 * Si el token es válido, adjunta userId y userEmail al objeto req.
 * Si no hay token o es inválido, responde con error 401.
 * @param req - Objeto Request de Express
 * @param res - Objeto Response de Express
 * @param next - Función next para continuar al siguiente middleware
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extraer el header de autorización
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido',
      code: 401,
    });
    return;
  }

  // Extraer el token del formato "Bearer <token>"
  const token = authHeader.substring(7);

  // Verificar y decodificar el token
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
      code: 401,
    });
    return;
  }

  // Verificar que el usuario todavía existe en la base de datos
  const user = userRepository.findUserById(payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Usuario no encontrado',
      code: 401,
    });
    return;
  }

  // Adjuntar datos del usuario al request para uso en los controladores
  req.userId = payload.userId;
  req.userEmail = payload.email;

  next();
}
