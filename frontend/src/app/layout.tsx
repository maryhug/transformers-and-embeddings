/**
 * Layout raíz de la aplicación Next.js.
 * Define los estilos globales, fuentes y la estructura HTML base.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Explorador de Embeddings',
  description: 'Genera y compara embeddings de texto con OpenAI',
};

/**
 * Layout raíz que envuelve toda la aplicación.
 * @param children - Contenido de la página actual
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
