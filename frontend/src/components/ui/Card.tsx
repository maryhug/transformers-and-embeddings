/**
 * Componente de tarjeta con efecto glassmorphism.
 * Contenedor base con fondo translúcido, borde sutil y desenfoque.
 */

'use client';

import React from 'react';

/** Props del componente Card */
interface ICardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  subtitle?: string;
}

/**
 * Tarjeta con fondo glassmorphism (backdrop-filter: blur).
 * @param children - Contenido de la tarjeta
 * @param className - Clases CSS adicionales
 * @param title - Título opcional en la cabecera de la tarjeta
 * @param subtitle - Subtítulo opcional bajo el título
 */
export default function Card({
  children,
  className = '',
  style,
  title,
  subtitle,
}: ICardProps): React.JSX.Element {
  return (
    <div className={['card', className].filter(Boolean).join(' ')} style={style}>
      {(title ?? subtitle) && (
        <div
          style={{
            padding: '20px 24px 0',
            marginBottom: title ? '4px' : '0',
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: subtitle ? '4px' : '0',
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ padding: '20px 24px 24px' }}>{children}</div>
    </div>
  );
}
