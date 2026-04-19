/**
 * Sistema de notificaciones toast.
 * Muestra mensajes de éxito, error e información en la esquina inferior derecha.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';

/** Tipos de toast disponibles */
type ToastType = 'success' | 'error' | 'info';

/** Interfaz de un mensaje toast */
interface IToast {
  id: string;
  message: string;
  type: ToastType;
}

/** Props del componente ToastContainer */
interface IToastContainerProps {
  toasts: IToast[];
  onRemove: (id: string) => void;
}

/** Hook para gestionar el estado de los toasts */
export interface IUseToastReturn {
  toasts: IToast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

/**
 * Hook personalizado para mostrar notificaciones toast.
 * Los toasts desaparecen automáticamente después de 4 segundos.
 * @returns Estado de los toasts y función para mostrarlos
 */
export function useToast(): IUseToastReturn {
  const [toasts, setToasts] = useState<IToast[]>([]);

  /**
   * Muestra un nuevo toast con mensaje y tipo.
   * @param message - Texto a mostrar en el toast
   * @param type - Tipo de toast: 'success', 'error' o 'info'
   */
  const showToast = useCallback((message: string, type: ToastType = 'info'): void => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  /**
   * Elimina un toast por su ID.
   * @param id - ID del toast a eliminar
   */
  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

/** Íconos para cada tipo de toast */
const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

/**
 * Contenedor de toasts que renderiza todos los mensajes activos.
 * @param toasts - Lista de toasts activos
 * @param onRemove - Callback para eliminar un toast por ID
 */
export function ToastContainer({ toasts, onRemove }: IToastContainerProps): React.JSX.Element {
  return (
    <div className="toast-container" role="region" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{TOAST_ICONS[toast.type]}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              opacity: 0.6,
              fontSize: '1rem',
              padding: '0',
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
