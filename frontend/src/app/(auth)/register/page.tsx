/**
 * Página de registro de nuevo usuario (/register).
 * Muestra el formulario de registro con fondo de ondas animadas.
 */

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WaveBackground from '@/components/ui/WaveBackground';
import RegisterForm from '@/components/auth/RegisterForm';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { getToken } from '@/services/auth.service';

/**
 * Página de registro con diseño glassmorphism centrado.
 */
export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  // Si ya hay sesión activa, redirigir al dashboard
  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <>
      <WaveBackground />
      <div
        className="page-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          minHeight: '100vh',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logotipo / Título */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-blue))',
                marginBottom: '16px',
                fontSize: '24px',
              }}
            >
              ⬡
            </div>
            <h1
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}
            >
              Crear cuenta
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Únete al explorador de embeddings
            </p>
          </div>

          {/* Tarjeta del formulario */}
          <div className="card">
            <div style={{ padding: '28px' }}>
              <RegisterForm
                onError={(msg) => showToast(msg, 'error')}
                onSuccess={(msg) => showToast(msg, 'success')}
              />

              <div className="divider" style={{ margin: '24px 0' }} />

              <p
                style={{
                  textAlign: 'center',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  style={{
                    color: 'var(--color-accent-purple-light)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
