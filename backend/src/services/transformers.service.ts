/**
 * Servicio para generación de embeddings usando Transformers.js (@xenova/transformers).
 * Corre completamente en local — no requiere API key ni conexión a internet
 * después de la primera descarga del modelo.
 *
 * Modelo usado: Xenova/all-MiniLM-L6-v2
 *   - 384 dimensiones
 *   - ~23 MB descargado y cacheado automáticamente en ~/.cache/huggingface/
 *   - Excelente equilibrio entre velocidad y calidad semántica
 */

import { EmbeddingModel } from '../types/embedding.types';
import type { IEmbeddingResult } from '../types/embedding.types';
import type { ServiceResult } from '../types/db.types';

/** Nombre del modelo de Hugging Face que se usará para embeddings locales */
const TRANSFORMERS_MODEL = 'Xenova/all-MiniLM-L6-v2';

/**
 * Pipeline de feature-extraction cacheado para no re-inicializarlo en cada petición.
 * Se inicializa de forma lazy en la primera llamada.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelineInstance: any = null;

/**
 * Obtiene o inicializa el pipeline de extracción de características de Transformers.js.
 * La primera vez descarga el modelo (~23 MB) y lo cachea localmente.
 * Las llamadas siguientes reutilizan la instancia ya cargada en memoria.
 * @returns El pipeline listo para usar
 */
async function getPipeline(): Promise<unknown> {
  if (pipelineInstance) return pipelineInstance;

  // Importación dinámica necesaria porque @xenova/transformers es un módulo ESM
  const { pipeline, env } = await import('@xenova/transformers');

  // Evitar que el modelo intente compilar con WASM nativo en entornos restrictivos
  env.backends.onnx.wasm.numThreads = 1;

  console.log(`🔄 Cargando modelo Transformers.js: ${TRANSFORMERS_MODEL} (primera vez puede tardar)...`);
  pipelineInstance = await pipeline('feature-extraction', TRANSFORMERS_MODEL);
  console.log(`✅ Modelo ${TRANSFORMERS_MODEL} cargado correctamente`);

  return pipelineInstance;
}

/**
 * Genera un embedding de texto usando el modelo local all-MiniLM-L6-v2.
 * Utiliza mean pooling y normalización L2 sobre los hidden states del modelo,
 * que es la técnica estándar para obtener embeddings de oraciones con este modelo.
 *
 * @param text - Texto a convertir en vector de embedding
 * @returns ServiceResult con el vector de 384 dimensiones, o un error descriptivo
 */
export async function generateTransformersEmbedding(
  text: string
): Promise<ServiceResult<IEmbeddingResult>> {
  if (!text || text.trim().length === 0) {
    return { success: false, error: 'El texto no puede estar vacío', code: 400 };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractor = (await getPipeline()) as any;

    // Generar embedding con mean pooling y normalización L2
    const output = await extractor(text.trim(), {
      pooling: 'mean',
      normalize: true,
    });

    // Convertir el tensor de salida a un arreglo plano de números JavaScript
    const vector = Array.from(output.data) as number[];

    return {
      success: true,
      data: {
        vector,
        dimensions: vector.length,
        model: EmbeddingModel.TRANSFORMERS,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en Transformers.js:', msg);
    return {
      success: false,
      error: `Error al generar embedding con Transformers.js: ${msg}`,
      code: 500,
    };
  }
}
