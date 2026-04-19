/**
 * Middleware global de manejo de errores.
 * Captura todos los errores no manejados y retorna una respuesta JSON consistente.
 */

import type { Request, Response, NextFunction } from 'express';

/** Interfaz para errores con código de estado HTTP */
interface IHttpError extends Error {
  statusCode?: number;
  code?: number;
}

/**
 * Middleware de manejo de errores globales de Express.
 * Debe ser el último middleware registrado en la aplicación.
 * @param err - Error capturado
 * @param req - Objeto Request de Express
 * @param res - Objeto Response de Express
 * @param next - Función next (requerida por Express para identificar el middleware de error)
 */
export function errorMiddleware(
  err: IHttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('❌ Error no manejado:', err);

  const statusCode = err.statusCode ?? err.code ?? 500;
  const message = err.message ?? 'Error interno del servidor';

  res.status(typeof statusCode === 'number' ? statusCode : 500).json({
    success: false,
    error: message,
    code: statusCode,
  });
}

/**
 * Middleware para rutas no encontradas (404).
 * Se registra antes del middleware de errores.
 * @param req - Objeto Request de Express
 * @param res - Objeto Response de Express
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: 404,
  });
}
