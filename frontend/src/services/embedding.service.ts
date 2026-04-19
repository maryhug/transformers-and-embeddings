/**
 * Servicio de embeddings del frontend.
 * Encapsula todas las llamadas a la API relacionadas con generación y gestión de embeddings.
 * Soporta dos proveedores: OpenAI (remoto) y Transformers.js (local en el servidor).
 */

import { apiFetch } from '../utils/api';
import type { IEmbedding, IEmbeddingResult, IComparisonResult, IApiResponse } from '../types/embedding.types';

/**
 * Genera un embedding usando OpenAI (text-embedding-ada-002, 1536 dimensiones).
 * Requiere OPENAI_API_KEY configurada en el backend.
 * @param text - Texto a convertir en embedding
 * @returns Respuesta con el vector generado, dimensiones y modelo
 */
export async function generateWithOpenAI(
  text: string
): Promise<IApiResponse<IEmbeddingResult>> {
  return apiFetch<IApiResponse<IEmbeddingResult>>('/api/embeddings/openai', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

/**
 * Genera un embedding usando Transformers.js local (all-MiniLM-L6-v2, 384 dimensiones).
 * Corre en el servidor sin necesidad de API key.
 * La primera petición puede tardar ~10-30 s mientras descarga el modelo.
 * @param text - Texto a convertir en embedding
 * @returns Respuesta con el vector generado, dimensiones y modelo
 */
export async function generateWithTransformers(
  text: string
): Promise<IApiResponse<IEmbeddingResult>> {
  return apiFetch<IApiResponse<IEmbeddingResult>>('/api/embeddings/transformers', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

/**
 * Guarda un embedding generado en la base de datos del servidor.
 * @param text - Texto original
 * @param vector - Vector numérico del embedding
 * @param model - Identificador del modelo ('openai' o 'transformers')
 * @param dimensions - Número de dimensiones del vector
 * @returns Respuesta con el embedding guardado
 */
export async function saveEmbedding(
  text: string,
  vector: number[],
  model: string,
  dimensions: number
): Promise<IApiResponse<{ embedding: IEmbedding }>> {
  return apiFetch<IApiResponse<{ embedding: IEmbedding }>>('/api/embeddings/save', {
    method: 'POST',
    body: JSON.stringify({ text, vector, model, dimensions }),
  });
}

/**
 * Obtiene todos los embeddings guardados del usuario autenticado.
 * @returns Respuesta con la lista de embeddings del usuario
 */
export async function getEmbeddings(): Promise<IApiResponse<{ embeddings: IEmbedding[] }>> {
  return apiFetch<IApiResponse<{ embeddings: IEmbedding[] }>>('/api/embeddings');
}

/**
 * Compara dos embeddings guardados usando similitud coseno.
 * Ambos embeddings deben tener el mismo número de dimensiones (mismo modelo).
 * @param id1 - ID del primer embedding
 * @param id2 - ID del segundo embedding
 * @returns Respuesta con el puntaje de similitud y datos de ambos embeddings
 */
export async function compareEmbeddings(
  id1: number,
  id2: number
): Promise<IApiResponse<IComparisonResult>> {
  return apiFetch<IApiResponse<IComparisonResult>>('/api/embeddings/compare', {
    method: 'POST',
    body: JSON.stringify({ id1, id2 }),
  });
}

/**
 * Elimina un embedding por su ID.
 * @param id - ID del embedding a eliminar
 * @returns Respuesta con confirmación de eliminación
 */
export async function deleteEmbedding(
  id: number
): Promise<IApiResponse<{ message: string }>> {
  return apiFetch<IApiResponse<{ message: string }>>(`/api/embeddings/${id}`, {
    method: 'DELETE',
  });
}
