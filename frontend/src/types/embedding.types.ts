/**
 * Tipos e interfaces de embeddings para el frontend.
 */

/** Modelos de embedding disponibles */
export enum EmbeddingModel {
  OPENAI = 'openai',
  TRANSFORMERS = 'transformers',
}

/** Embedding guardado en la base de datos */
export interface IEmbedding {
  id: number;
  user_id: number;
  text_input: string;
  model: string;
  vector: number[];
  dimensions: number;
  created_at: string;
}

/** Resultado temporal de generación (antes de guardar) */
export interface IEmbeddingResult {
  vector: number[];
  dimensions: number;
  model: string;
}

/** Resultado de comparación de dos embeddings */
export interface IComparisonResult {
  similarity: number;
  embedding1: IEmbedding;
  embedding2: IEmbedding;
}

/** Respuesta genérica de la API */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}
