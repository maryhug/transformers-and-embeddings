/**
 * Tipos e interfaces relacionados con embeddings de texto.
 * Define estructuras para generación, almacenamiento y comparación de vectores.
 */

/** Enum de modelos de embedding disponibles */
export enum EmbeddingModel {
  OPENAI = 'openai',
  TRANSFORMERS = 'transformers',
}

/** Interfaz que representa un embedding guardado en la base de datos */
export interface IEmbedding {
  id: number;
  user_id: number;
  text_input: string;
  model: string;
  vector: string; // JSON serializado del arreglo de números
  dimensions: number;
  created_at: string;
}

/** Interfaz para el embedding deserializado con el vector como arreglo */
export interface IEmbeddingWithVector {
  id: number;
  user_id: number;
  text_input: string;
  model: string;
  vector: number[];
  dimensions: number;
  created_at: string;
}

/** Resultado de generación de un embedding */
export interface IEmbeddingResult {
  vector: number[];
  dimensions: number;
  model: string;
}

/** Cuerpo de la petición para guardar un embedding */
export interface ISaveEmbeddingRequest {
  text: string;
  vector: number[];
  model: string;
  dimensions: number;
}

/** Cuerpo de la petición para comparar dos embeddings */
export interface ICompareRequest {
  id1: number;
  id2: number;
}

/** Resultado de comparación de similitud coseno */
export interface IComparisonResult {
  similarity: number;
  embedding1: IEmbeddingWithVector;
  embedding2: IEmbeddingWithVector;
}
