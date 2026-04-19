/**
 * Rutas de embeddings.
 * Define los endpoints para generación (OpenAI y Transformers.js local),
 * guardado, listado, comparación y eliminación de embeddings.
 * Todas las rutas requieren autenticación JWT.
 */

import { Router } from 'express';
import * as embeddingController from '../controllers/embedding.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/** Todas las rutas de embeddings requieren autenticación */
router.use(authMiddleware);

/** POST /api/embeddings/openai — Generar embedding con OpenAI (1536 dims, requiere API key) */
router.post('/openai', (req, res) => {
  void embeddingController.generateWithOpenAI(req, res);
});

/** POST /api/embeddings/transformers — Generar embedding local con Transformers.js (384 dims, sin API key) */
router.post('/transformers', (req, res) => {
  void embeddingController.generateWithTransformers(req, res);
});

/** POST /api/embeddings/save — Guardar embedding en la base de datos */
router.post('/save', embeddingController.saveEmbedding);

/** POST /api/embeddings/compare — Comparar dos embeddings con similitud coseno */
router.post('/compare', embeddingController.compareEmbeddings);

/** GET /api/embeddings — Obtener todos los embeddings del usuario */
router.get('/', embeddingController.getEmbeddings);

/** DELETE /api/embeddings/:id — Eliminar un embedding por ID */
router.delete('/:id', embeddingController.deleteEmbedding);

export default router;
