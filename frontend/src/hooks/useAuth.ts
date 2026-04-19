/**
 * Hook personalizado para gestión del estado de autenticación.
 * Provee el usuario actual, funciones de login/logout y estado de carga.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../services/auth.service';
import type { IPublicUser } from '../types/auth.types';

/** Interfaz del valor retornado por el hook useAuth */
interface IUseAuthReturn {
  user: IPublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Hook que gestiona el estado de autenticación del usuario.
 * Lee la sesión desde localStorage y la verifica con el servidor.
 * @returns Estado del usuario, estado de carga y funciones de auth
 */
export function useAuth(): IUseAuthReturn {
  const [user, setUser] = useState<IPublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Cierra la sesión del usuario limpiando localStorage y redirigiendo al login.
   */
  const logout = useCallback((): void => {
    authService.clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  /**
   * Verifica y refresca los datos del usuario desde el servidor.
   * Si el token no es válido, cierra la sesión.
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token inválido o expirado — limpiar sesión
        authService.clearSession();
        setUser(null);
      }
    } catch {
      authService.clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar sesión al montar el componente
  useEffect(() => {
    // Primero cargar desde localStorage para respuesta inmediata
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    // Luego verificar con el servidor en segundo plano
    void refreshUser();
  }, [refreshUser]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
    refreshUser,
  };
}
