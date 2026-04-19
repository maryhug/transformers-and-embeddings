/**
 * Componente que muestra la lista de embeddings guardados del usuario.
 * Incluye vista previa del texto, modelo usado, fecha y botón de eliminación.
 */

'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import * as embeddingService from '../../services/embedding.service';
import type { IEmbedding } from '../../types/embedding.types';
import { EmbeddingModel } from '../../types/embedding.types';

/** Props del componente EmbeddingResult */
interface IEmbeddingResultProps {
  embeddings: IEmbedding[];
  isLoading: boolean;
  onDeleted: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param dateStr - Fecha en formato ISO
 * @returns Fecha formateada
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Trunca texto largo con puntos suspensivos.
 */
function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/**
 * Lista de embeddings guardados con opción de eliminación individual.
 */
export default function EmbeddingResult({
  embeddings,
  isLoading,
  onDeleted,
  onError,
  onSuccess,
}: IEmbeddingResultProps): React.JSX.Element {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /**
   * Elimina un embedding por su ID previa confirmación.
   * @param id - ID del embedding a eliminar
   */
  async function handleDelete(id: number): Promise<void> {
    setDeletingId(id);
    try {
      const response = await embeddingService.deleteEmbedding(id);
      if (!response.success) {
        onError(response.error ?? 'Error al eliminar el embedding');
        return;
      }
      onSuccess('Embedding eliminado correctamente');
      onDeleted();
    } catch {
      onError('Error de conexión al eliminar el embedding');
    } finally {
      setDeletingId(null);
    }
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '72px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  // Estado vacío
  if (embeddings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          No tienes embeddings guardados aún.
          <br />
          Genera uno en el panel izquierdo.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
      {embeddings.map((emb) => {
        const isExpanded = expandedId === emb.id;
        const isDeleting = deletingId === emb.id;

        return (
          <div
            key={emb.id}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              transition: 'border-color var(--transition)',
              cursor: 'default',
            }}
          >
            {/* Cabecera del item */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Texto del embedding */}
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                    wordBreak: 'break-word',
                  }}
                >
                  {isExpanded ? emb.text_input : truncate(emb.text_input, 90)}
                  {emb.text_input.length > 90 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : emb.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-accent-purple-light)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-xs)',
                        marginLeft: '4px',
                        padding: 0,
                      }}
                    >
                      {isExpanded ? 'ver menos' : 'ver más'}
                    </button>
                  )}
                </p>

                {/* Metadatos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={emb.model === EmbeddingModel.TRANSFORMERS ? 'badge badge-transformers' : 'badge badge-openai'}>
                    {emb.model === EmbeddingModel.TRANSFORMERS ? '🤗 Transformers' : '⚡ OpenAI'}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {emb.dimensions.toLocaleString()} dims
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(emb.created_at)}
                  </span>
                </div>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => { void handleDelete(emb.id); }}
                disabled={isDeleting}
                title="Eliminar embedding"
                style={{
                  background: 'none',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-muted)',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  padding: '4px 6px',
                  flexShrink: 0,
                  transition: 'all var(--transition)',
                  opacity: isDeleting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-error)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'none';
                }}
              >
                {isDeleting ? '...' : '✕'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
