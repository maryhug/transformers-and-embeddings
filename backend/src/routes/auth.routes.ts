/**
 * Rutas de autenticación.
 * Define los endpoints para registro, login y obtención del perfil del usuario.
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/** POST /api/auth/register — Registrar nuevo usuario */
router.post('/register', (req, res) => {
  void authController.register(req, res);
});

/** POST /api/auth/login — Iniciar sesión */
router.post('/login', (req, res) => {
  void authController.login(req, res);
});

/** GET /api/auth/me — Obtener perfil del usuario autenticado */
router.get('/me', authMiddleware, authController.getMe);

export default router;
