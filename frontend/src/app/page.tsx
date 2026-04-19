/**
 * Página raíz — redirige al dashboard si hay sesión activa, o al login si no.
 */

import { redirect } from 'next/navigation';

export default function HomePage(): never {
  redirect('/login');
}
