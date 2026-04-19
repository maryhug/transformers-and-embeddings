/**
 * Servicio para generación de embeddings usando la API de OpenAI.
 * Utiliza el modelo text-embedding-ada-002 para convertir texto en vectores numéricos.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { EmbeddingModel } from '../types/embedding.types';
import type { IEmbeddingResult } from '../types/embedding.types';
import type { ServiceResult } from '../types/db.types';

dotenv.config();

/** Instancia del cliente de OpenAI configurada con la clave de API */
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Nombre técnico del modelo que se envía a la API de OpenAI */
const OPENAI_MODEL_NAME = 'text-embedding-ada-002';

/**
 * Genera un embedding de texto usando el modelo text-embedding-ada-002 de OpenAI.
 * Los embeddings de OpenAI tienen 1536 dimensiones y representan el significado semántico del texto.
 * @param text - Texto a convertir en vector de embedding
 * @returns ServiceResult con el vector, dimensiones y nombre del modelo, o un error
 */
export async function generateOpenAIEmbedding(
  text: string
): Promise<ServiceResult<IEmbeddingResult>> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: 'El texto no puede estar vacío', code: 400 };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'Clave de API de OpenAI no configurada en el servidor',
      code: 500,
    };
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: OPENAI_MODEL_NAME,
      input: text.trim(),
      encoding_format: 'float',
    });

    const vector = response.data[0].embedding;

    return {
      success: true,
      data: {
        vector,
        dimensions: vector.length,
        // Guardamos el identificador canónico del enum, no el nombre técnico del modelo
        model: EmbeddingModel.OPENAI,
      },
    };
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return { success: false, error: 'Clave de API de OpenAI inválida', code: 401 };
      }
      if (error.status === 429) {
        return {
          success: false,
          error: 'Límite de solicitudes de OpenAI excedido. Intenta más tarde',
          code: 429,
        };
      }
      return {
        success: false,
        error: `Error de OpenAI: ${error.message}`,
        code: error.status ?? 500,
      };
    }
    return {
      success: false,
      error: 'Error al generar embedding con OpenAI',
      code: 500,
    };
  }
}
