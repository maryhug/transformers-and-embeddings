/**
 * Repositorio de embeddings.
 * Contiene todas las operaciones de base de datos para la tabla embeddings.
 * Serializa/deserializa vectores como JSON para almacenarlos en SQLite.
 */

import { db } from '../db/database';
import type { IEmbedding, IEmbeddingWithVector } from '../types/embedding.types';

/**
 * Convierte un registro de embedding de la DB (vector como string JSON)
 * al formato con el vector como arreglo de números.
 * @param embedding - Registro crudo de la base de datos
 * @returns Embedding con el vector deserializado
 */
function deserializeEmbedding(embedding: IEmbedding): IEmbeddingWithVector {
  return {
    ...embedding,
    vector: JSON.parse(embedding.vector) as number[],
  };
}

/**
 * Guarda un nuevo embedding en la base de datos.
 * @param userId - ID del usuario propietario
 * @param textInput - Texto original que generó el embedding
 * @param model - Nombre del modelo usado para generar el embedding
 * @param vector - Vector de números del embedding
 * @param dimensions - Número de dimensiones del vector
 * @returns El embedding recién guardado con el vector deserializado
 */
export function saveEmbedding(
  userId: number,
  textInput: string,
  model: string,
  vector: number[],
  dimensions: number
): IEmbeddingWithVector {
  const vectorJson = JSON.stringify(vector);
  const stmt = db.prepare(
    'INSERT INTO embeddings (user_id, text_input, model, vector, dimensions) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, textInput, model, vectorJson, dimensions);
  const newEmbedding = findEmbeddingById(result.lastInsertRowid as number);
  if (!newEmbedding) {
    throw new Error('Error al guardar el embedding en la base de datos');
  }
  return newEmbedding;
}

/**
 * Obtiene todos los embeddings de un usuario ordenados por fecha descendente.
 * @param userId - ID del usuario del que se quieren obtener los embeddings
 * @returns Arreglo de embeddings con vectores deserializados
 */
export function findEmbeddingsByUserId(userId: number): IEmbeddingWithVector[] {
  const stmt = db.prepare(
    'SELECT * FROM embeddings WHERE user_id = ? ORDER BY created_at DESC'
  );
  const rows = stmt.all(userId) as IEmbedding[];
  return rows.map(deserializeEmbedding);
}

/**
 * Busca un embedding específico por su ID numérico.
 * @param id - ID del embedding a buscar
 * @returns El embedding encontrado o undefined
 */
export function findEmbeddingById(id: number): IEmbeddingWithVector | undefined {
  const stmt = db.prepare('SELECT * FROM embeddings WHERE id = ?');
  const row = stmt.get(id) as IEmbedding | undefined;
  return row ? deserializeEmbedding(row) : undefined;
}

/**
 * Elimina un embedding por su ID, verificando que pertenezca al usuario indicado.
 * @param id - ID del embedding a eliminar
 * @param userId - ID del usuario propietario (para autorización)
 * @returns true si se eliminó correctamente, false si no se encontró o no pertenece al usuario
 */
export function deleteEmbedding(id: number, userId: number): boolean {
  const stmt = db.prepare('DELETE FROM embeddings WHERE id = ? AND user_id = ?');
  const result = stmt.run(id, userId);
  return result.changes > 0;
}
