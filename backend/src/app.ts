/**
 * Punto de entrada principal del servidor Express.
 * Configura middlewares globales, registra las rutas y arranca el servidor.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import embeddingRoutes from './routes/embedding.routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

// Cargar variables de entorno antes de cualquier otra cosa
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// ── Middlewares globales ───────────────────────────────────────────────────────

/** Habilitar CORS para el frontend de Next.js */
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);

/** Parsear cuerpo de peticiones JSON */
app.use(express.json({ limit: '10mb' }));

/** Parsear cuerpo de peticiones URL-encoded */
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────

/** Ruta de salud para verificar que el servidor está corriendo */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

/** Rutas de autenticación */
app.use('/api/auth', authRoutes);

/** Rutas de embeddings */
app.use('/api/embeddings', embeddingRoutes);

// ── Middlewares de error (deben ir al final) ───────────────────────────────────

/** Ruta no encontrada */
app.use(notFoundMiddleware);

/** Manejador global de errores */
app.use(errorMiddleware);

// ── Iniciar servidor ──────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
