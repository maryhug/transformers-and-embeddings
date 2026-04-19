/**
 * Componente de fondo animado con ondas SVG.
 * Renderiza tres ondas con gradientes púrpura/azul que se animan suavemente.
 */

'use client';

import React from 'react';

/**
 * Fondo decorativo con ondas SVG animadas en gradiente morado-azul.
 * Se renderiza en posición fija detrás de todo el contenido.
 */
export default function WaveBackground(): React.JSX.Element {
  return (
    <div className="page-bg" aria-hidden="true">
      {/* Onda superior — más brillante */}
      <svg
        className="wave-svg wave-svg-1"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGrad1)"
          d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>

      {/* Onda inferior */}
      <svg
        className="wave-svg wave-svg-2"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#9f67ff" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGrad2)"
          d="M0,64L48,96C96,128,192,192,288,197.3C384,203,480,149,576,128C672,107,768,117,864,138.7C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Onda central — más sutil */}
      <svg
        className="wave-svg wave-svg-3"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <path
          fill="url(#waveGrad3)"
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,208C840,213,960,203,1080,181.3C1200,160,1320,128,1380,112L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>
    </div>
  );
}
