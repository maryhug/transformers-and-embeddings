/**
 * Controlador de embeddings.
 * Maneja las peticiones HTTP para generar, guardar, listar, comparar y eliminar embeddings.
 * Soporta dos proveedores: OpenAI (API remota) y Transformers.js (modelo local).
 */

import type { Request, Response } from 'express';
import * as openaiService from '../services/openai.service';
import * as transformersService from '../services/transformers.service';
import * as embeddingRepository from '../repositories/embedding.repository';
import type { ISaveEmbeddingRequest, ICompareRequest } from '../types/embedding.types';

/**
 * Calcula la similitud coseno entre dos vectores de embeddings.
 * La similitud coseno mide el ángulo entre dos vectores en un espacio
 * de alta dimensión.
 * El resultado va de 0 (completamente diferentes) a 1 (significado idéntico).
 *
 * Fórmula: cos(θ) = (A · B) / (||A|| × ||B||)
 * Donde A · B es el producto punto y ||x|| es la magnitud (norma euclidiana)
 *
 * @param vectorA - Primer vector de embedding
 * @param vectorB - Segundo vector de embedding
 * @returns Puntaje de similitud entre 0 y 1
 */
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Los vectores deben tener la misma dimensión para compararse (${vectorA.length} vs ${vectorB.length})`
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Genera un embedding usando el modelo de OpenAI (text-embedding-ada-002, 1536 dims).
 * POST /api/embeddings/openai
 * @param req - Request con body { text }
 * @param res - Response con { vector, dimensions, model } o error
 */
export async function generateWithOpenAI(req: Request, res: Response): Promise<void> {
  const { text } = req.body as { text: string };

  if (!text || typeof text !== 'string') {
    res.status(400).json({ success: false, error: 'El campo texto es requerido', code: 400 });
    return;
  }

  const result = await openaiService.generateOpenAIEmbedding(text);

  if (!result.success) {
    res.status(result.code).json({ success: false, error: result.error, code: result.code });
    return;
  }

  res.json({ success: true, data: result.data });
}

/**
 * Genera un embedding usando Transformers.js local (all-MiniLM-L6-v2, 384 dims).
 * No requiere API key. El modelo se descarga (~23 MB) la primera vez y se cachea.
 * POST /api/embeddings/transformers
 * @param req - Request con body { text }
 * @param res - Response con { vector, dimensions, model } o error
 */
export async function generateWithTransformers(req: Request, res: Response): Promise<void> {
  const { text } = req.body as { text: string };

  if (!text || typeof text !== 'string') {
    res.status(400).json({ success: false, error: 'El campo texto es requerido', code: 400 });
    return;
  }

  const result = await transformersService.generateTransformersEmbedding(text);

  if (!result.success) {
    res.status(result.code).json({ success: false, error: result.error, code: result.code });
    return;
  }

  res.json({ success: true, data: result.data });
}

/**
 * Guarda un embedding generado en la base de datos.
 * POST /api/embeddings/save
 * @param req - Request con body { text, vector, model, dimensions } y userId en req
 * @param res - Response con el embedding guardado o error
 */
export function saveEmbedding(req: Request, res: Response): void {
  const { text, vector, model, dimensions } = req.body as ISaveEmbeddingRequest;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
    return;
  }

  if (!text || !vector || !model || !dimensions) {
    res.status(400).json({
      success: false,
      error: 'Texto, vector, modelo y dimensiones son requeridos',
      code: 400,
    });
    return;
  }

  if (!Array.isArray(vector)) {
    res.status(400).json({ success: false, error: 'El vector debe ser un arreglo', code: 400 });
    return;
  }

  try {
    const embedding = embeddingRepository.saveEmbedding(userId, text, model, vector, dimensions);
    res.status(201).json({ success: true, data: { embedding } });
  } catch {
    res.status(500).json({ success: false, error: 'Error al guardar el embedding', code: 500 });
  }
}

/**
 * Obtiene todos los embeddings guardados del usuario autenticado.
 * GET /api/embeddings
 */
export function getEmbeddings(req: Request, res: Response): void {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
    return;
  }

  const embeddings = embeddingRepository.findEmbeddingsByUserId(userId);
  res.json({ success: true, data: { embeddings } });
}

/**
 * Compara dos embeddings guardados usando similitud coseno.
 * Avisa si los modelos son diferentes (dimensiones distintas = error claro).
 * POST /api/embeddings/compare
 */
export function compareEmbeddings(req: Request, res: Response): void {
  const { id1, id2 } = req.body as ICompareRequest;
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
    return;
  }

  if (!id1 || !id2) {
    res.status(400).json({
      success: false,
      error: 'Se requieren los IDs de dos embeddings para comparar',
      code: 400,
    });
    return;
  }

  const embedding1 = embeddingRepository.findEmbeddingById(id1);
  const embedding2 = embeddingRepository.findEmbeddingById(id2);

  if (!embedding1 || !embedding2) {
    res.status(404).json({
      success: false,
      error: 'Uno o ambos embeddings no encontrados',
      code: 404,
    });
    return;
  }

  if (embedding1.user_id !== userId || embedding2.user_id !== userId) {
    res.status(403).json({
      success: false,
      error: 'Acceso no autorizado a los embeddings',
      code: 403,
    });
    return;
  }

  // Advertir si se comparan modelos distintos (dimensiones incompatibles)
  if (embedding1.dimensions !== embedding2.dimensions) {
    res.status(400).json({
      success: false,
      error: `No se pueden comparar embeddings de dimensiones distintas: ${embedding1.model} tiene ${embedding1.dimensions} dims y ${embedding2.model} tiene ${embedding2.dimensions} dims. Compara embeddings del mismo modelo.`,
      code: 400,
    });
    return;
  }

  try {
    const similarity = cosineSimilarity(embedding1.vector, embedding2.vector);
    res.json({ success: true, data: { similarity, embedding1, embedding2 } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al comparar';
    res.status(400).json({ success: false, error: msg, code: 400 });
  }
}

/**
 * Elimina un embedding por su ID.
 * DELETE /api/embeddings/:id
 */
export function deleteEmbedding(req: Request, res: Response): void {
  const id = parseInt(req.params.id, 10);
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
    return;
  }

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: 'ID de embedding inválido', code: 400 });
    return;
  }

  const deleted = embeddingRepository.deleteEmbedding(id, userId);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'Embedding no encontrado o no tienes permiso para eliminarlo',
      code: 404,
    });
    return;
  }

  res.json({ success: true, data: { message: 'Embedding eliminado correctamente' } });
}
