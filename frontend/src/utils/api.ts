/**
 * Utilidad base para realizar peticiones HTTP a la API del backend.
 * Centraliza la configuración de headers, manejo de tokens y errores.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Opciones extendidas para las peticiones fetch */
interface IFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Realiza una petición HTTP a la API con manejo automático de autenticación.
 * Lee el token JWT desde localStorage y lo incluye en el header Authorization.
 * @param endpoint - Ruta del endpoint (ej: '/api/auth/login')
 * @param options - Opciones de fetch, incluyendo skipAuth para rutas públicas
 * @returns Respuesta JSON parseada del servidor
 */
export async function apiFetch<T>(
  endpoint: string,
  options: IFetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Agregar token de autenticación si está disponible y no se omite
  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: defaultHeaders,
  });

  const data = await response.json() as T;

  // Si el servidor responde con 401, limpiar sesión y redirigir al login
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return data;
}
