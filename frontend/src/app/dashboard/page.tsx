/**
 * Página principal del dashboard (/dashboard).
 * Ruta protegida que requiere autenticación.
 * Divide la vista en dos paneles: generación y lista/comparación de embeddings.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import WaveBackground from '../../components/ui/WaveBackground';
import EmbeddingForm from '../../components/dashboard/EmbeddingForm';
import EmbeddingResult from '../../components/dashboard/EmbeddingResult';
import ComparisonTable from '../../components/dashboard/ComparisonTable';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import * as embeddingService from '../../services/embedding.service';
import type { IEmbedding } from '../../types/embedding.types';

/** Pestañas del panel derecho */
type RightTab = 'lista' | 'comparar';

/**
 * Dashboard principal con dos columnas:
 * - Izquierda: formulario de generación de embeddings
 * - Derecha: lista de embeddings guardados y comparación
 */
export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [embeddings, setEmbeddings] = useState<IEmbedding[]>([]);
  const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>('lista');

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  /**
   * Carga o recarga los embeddings del usuario desde el servidor.
   */
  const loadEmbeddings = useCallback(async (): Promise<void> => {
    setIsLoadingEmbeddings(true);
    try {
      const response = await embeddingService.getEmbeddings();
      if (response.success && response.data) {
        setEmbeddings(response.data.embeddings);
      }
    } catch {
      showToast('Error al cargar los embeddings', 'error');
    } finally {
      setIsLoadingEmbeddings(false);
    }
  }, [showToast]);

  // Cargar embeddings al montar el componente (solo cuando el usuario esté listo)
  useEffect(() => {
    if (user) {
      void loadEmbeddings();
    }
  }, [user, loadEmbeddings]);

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (authLoading) {
    return (
      <>
        <WaveBackground />
        <div
          className="page-wrapper"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Verificando sesión...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) return <></>;

  return (
    <>
      <WaveBackground />
      <div className="page-wrapper">

        {/* ── Barra de navegación superior ─────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 24px',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '60px',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '20px',
                  background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-blue))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ⬡
              </span>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>
                Explorador de Embeddings
              </span>
            </div>

            {/* Usuario y logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Hola, <strong style={{ color: 'var(--color-text-primary)' }}>{user.username}</strong>
              </span>
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* ── Contenido principal ───────────────────────────────────────────── */}
        <main
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '28px 24px',
          }}
        >
          {/* Estadísticas rápidas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {[
              { label: 'Embeddings guardados', value: embeddings.length, icon: '📦' },
              {
                label: 'Con OpenAI',
                value: embeddings.filter((e) => e.model === 'openai').length,
                icon: '⚡',
              },
              {
                label: 'Con Transformers',
                value: embeddings.filter((e) => e.model === 'transformers').length,
                icon: '🤗',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backdropFilter: 'blur(10px)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Layout de dos columnas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {/* ── Panel izquierdo: Generar embeddings ───────────────────── */}
            <div
              className="card"
              style={{ padding: '0' }}
            >
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '4px' }}>
                  Generar Embedding
                </h2>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Convierte texto en un vector numérico de alta dimensión
                </p>
              </div>
              <div style={{ padding: '20px 24px 24px' }}>
                <EmbeddingForm
                  onSaved={() => { void loadEmbeddings(); }}
                  onError={(msg) => showToast(msg, 'error')}
                  onSuccess={(msg) => showToast(msg, 'success')}
                />
              </div>
            </div>

            {/* ── Panel derecho: Lista y Comparación ─────────────────────── */}
            <div className="card" style={{ padding: '0' }}>
              {/* Pestañas */}
              <div
                style={{
                  padding: '20px 24px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '-1px' }}>
                  {(['lista', 'comparar'] as RightTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: rightTab === tab ? '2px solid var(--color-accent-purple)' : '2px solid transparent',
                        color: rightTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-family)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: rightTab === tab ? 600 : 400,
                        padding: '0 4px 12px',
                        transition: 'all var(--transition)',
                        marginRight: '12px',
                      }}
                    >
                      {tab === 'lista' ? `📋 Mis embeddings (${embeddings.length})` : '⚖️ Comparar'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px 24px 24px' }}>
                {rightTab === 'lista' ? (
                  <EmbeddingResult
                    embeddings={embeddings}
                    isLoading={isLoadingEmbeddings}
                    onDeleted={() => { void loadEmbeddings(); }}
                    onError={(msg) => showToast(msg, 'error')}
                    onSuccess={(msg) => showToast(msg, 'success')}
                  />
                ) : (
                  <ComparisonTable
                    embeddings={embeddings}
                    onError={(msg) => showToast(msg, 'error')}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Estilos responsive */}
      <style>{`
        @media (max-width: 900px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          main {
            padding: 16px !important;
          }
        }
      `}</style>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
