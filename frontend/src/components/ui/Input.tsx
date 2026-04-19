/**
 * Componente de campo de entrada reutilizable.
 * Soporta etiqueta, mensaje de error y estilos de foco con brillo púrpura.
 */

'use client';

import React from 'react';

/** Props del componente Input */
interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * Campo de entrada estilizado con borde de foco en color morado.
 * Muestra una etiqueta opcional y mensaje de error debajo si se proporciona.
 * @param label - Etiqueta descriptiva sobre el input
 * @param error - Mensaje de error a mostrar bajo el input
 * @param fullWidth - Si true, el input ocupa el ancho completo
 */
export default function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}: IInputProps): React.JSX.Element {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-wrapper" style={fullWidth ? { width: '100%' } : {}}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={['input', error ? 'input-error' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
