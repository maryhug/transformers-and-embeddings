/**
 * Componente de botón reutilizable con variantes de estilo.
 * Soporta estados de carga, deshabilitado y diferentes tamaños.
 */

'use client';

import React from 'react';

/** Variantes de estilo del botón */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Tamaños disponibles del botón */
type ButtonSize = 'sm' | 'md' | 'lg';

/** Props del componente Button */
interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Botón estilizado con glassmorphism y efectos de brillo al hover.
 * @param variant - Variante visual del botón (primary, secondary, ghost, danger)
 * @param size - Tamaño del botón (sm, md, lg)
 * @param isLoading - Si true, muestra spinner y deshabilita el botón
 * @param fullWidth - Si true, el botón ocupa el ancho completo
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: IButtonProps): React.JSX.Element {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    fullWidth ? 'btn-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled ?? isLoading} {...props}>
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
