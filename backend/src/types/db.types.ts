/**
 * Tipos genéricos reutilizables para respuestas de la API y resultados de servicios.
 * Proveen consistencia en el manejo de errores y respuestas a lo largo del proyecto.
 */

/** Respuesta genérica de la API con tipado del dato */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/** Resultado genérico de un servicio: puede ser éxito o error */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number };
