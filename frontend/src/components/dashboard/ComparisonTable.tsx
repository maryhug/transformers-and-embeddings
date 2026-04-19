/**
 * Componente de comparación de embeddings usando similitud coseno.
 * Permite seleccionar dos embeddings guardados y visualizar su similitud
 * con una barra de progreso animada y puntaje numérico.
 */

'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import * as embeddingService from '../../services/embedding.service';
import type { IEmbedding, IComparisonResult } from '../../types/embedding.types';
import { EmbeddingModel } from '../../types/embedding.types';

/** Props del componente ComparisonTable */
interface IComparisonTableProps {
  embeddings: IEmbedding[];
  onError: (msg: string) => void;
}

/**
 * Trunca un texto largo añadiendo puntos suspensivos.
 * @param text - Texto a truncar
 * @param maxLen - Longitud máxima antes de truncar
 */
function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/**
 * Retorna el color de la barra de similitud según el puntaje.
 * @param score - Puntaje entre 0 y 1
 */
function getSimilarityColor(score: number): string {
  if (score >= 0.85) return 'var(--color-success)';
  if (score >= 0.6) return 'var(--color-accent-purple-light)';
  if (score >= 0.35) return 'var(--color-warning)';
  return 'var(--color-error)';
}

/**
 * Retorna una descripción textual del nivel de similitud.
 * @param score - Puntaje entre 0 y 1
 */
function getSimilarityLabel(score: number): string {
  if (score >= 0.92) return 'Casi idénticos';
  if (score >= 0.85) return 'Muy similares';
  if (score >= 0.7) return 'Similares';
  if (score >= 0.5) return 'Algo relacionados';
  if (score >= 0.3) return 'Poco relacionados';
  return 'Muy diferentes';
}

/**
 * Panel de comparación de dos embeddings con visualización de similitud coseno.
 */
export default function ComparisonTable({
  embeddings,
  onError,
}: IComparisonTableProps): React.JSX.Element {
  const [selectedId1, setSelectedId1] = useState<number | null>(null);
  const [selectedId2, setSelectedId2] = useState<number | null>(null);
  const [result, setResult] = useState<IComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  /**
   * Ejecuta la comparación de los dos embeddings seleccionados.
   */
  async function handleCompare(): Promise<void> {
    if (!selectedId1 || !selectedId2) {
      onError('Selecciona dos embeddings para comparar');
      return;
    }
    if (selectedId1 === selectedId2) {
      onError('Selecciona dos embeddings diferentes para comparar');
      return;
    }

    setIsComparing(true);
    setResult(null);
    try {
      const response = await embeddingService.compareEmbeddings(selectedId1, selectedId2);
      if (!response.success || !response.data) {
        onError(response.error ?? 'Error al comparar los embeddings');
        return;
      }
      setResult(response.data);
    } catch {
      onError('Error de conexión al comparar los embeddings');
    } finally {
      setIsComparing(false);
    }
  }

  if (embeddings.length < 2) {
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
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚖️</div>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          Necesitas al menos <strong style={{ color: 'var(--color-text-secondary)' }}>2 embeddings guardados</strong> para comparar
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Selecciona dos embeddings para calcular su similitud coseno
      </p>

      {/* Selectores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Selector 1 */}
        <div className="input-wrapper">
          <label className="input-label">Embedding A</label>
          <select
            className="input"
            value={selectedId1 ?? ''}
            onChange={(e) => {
              setSelectedId1(e.target.value ? parseInt(e.target.value, 10) : null);
              setResult(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            <option value="">— Seleccionar embedding —</option>
            {embeddings.map((emb) => (
              <option key={emb.id} value={emb.id} disabled={emb.id === selectedId2}>
                {`#${emb.id} · ${truncate(emb.text_input, 40)} [${emb.model === EmbeddingModel.TRANSFORMERS ? 'Transformers' : 'OpenAI'}]`}
              </option>
            ))}
          </select>
        </div>

        {/* Icono de versus */}
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          vs
        </div>

        {/* Selector 2 */}
        <div className="input-wrapper">
          <label className="input-label">Embedding B</label>
          <select
            className="input"
            value={selectedId2 ?? ''}
            onChange={(e) => {
              setSelectedId2(e.target.value ? parseInt(e.target.value, 10) : null);
              setResult(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            <option value="">— Seleccionar embedding —</option>
            {embeddings.map((emb) => (
              <option key={emb.id} value={emb.id} disabled={emb.id === selectedId1}>
                {`#${emb.id} · ${truncate(emb.text_input, 40)} [${emb.model === EmbeddingModel.TRANSFORMERS ? 'Transformers' : 'OpenAI'}]`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aviso si los modelos tienen dimensiones distintas */}
      {selectedId1 && selectedId2 && selectedId1 !== selectedId2 && (() => {
        const e1 = embeddings.find(e => e.id === selectedId1);
        const e2 = embeddings.find(e => e.id === selectedId2);
        if (e1 && e2 && e1.dimensions !== e2.dimensions) {
          return (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              fontSize: 'var(--font-size-xs)', color: '#fca5a5',
            }}>
              ⚠️ <strong>Modelos incompatibles:</strong> OpenAI genera {e1.model !== EmbeddingModel.TRANSFORMERS ? e1.dimensions : e2.dimensions} dims y Transformers genera {e1.model === EmbeddingModel.TRANSFORMERS ? e1.dimensions : e2.dimensions} dims.
              La similitud coseno solo es válida entre vectores del <strong>mismo modelo</strong>.
            </div>
          );
        }
        return null;
      })()}

      {/* Botón comparar */}
      <Button
        variant="primary"
        fullWidth
        isLoading={isComparing}
        disabled={!selectedId1 || !selectedId2 || selectedId1 === selectedId2 || (() => {
          const e1 = embeddings.find(e => e.id === selectedId1);
          const e2 = embeddings.find(e => e.id === selectedId2);
          return !!(e1 && e2 && e1.dimensions !== e2.dimensions);
        })()}
        onClick={() => { void handleCompare(); }}
      >
        {isComparing ? 'Calculando similitud...' : '⚖️ Comparar embeddings'}
      </Button>

      {/* Resultado de similitud */}
      {result && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${getSimilarityColor(result.similarity)}44`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Puntaje principal */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: getSimilarityColor(result.similarity),
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {(result.similarity * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Similitud coseno · <strong>{getSimilarityLabel(result.similarity)}</strong>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              ({result.similarity.toFixed(8)})
            </div>
          </div>

          {/* Barra visual */}
          <div>
            <div className="similarity-bar-track">
              <div
                className="similarity-bar-fill"
                style={{
                  width: `${result.similarity * 100}%`,
                  background: `linear-gradient(90deg, ${getSimilarityColor(result.similarity)}, ${getSimilarityColor(result.similarity)}aa)`,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Diferente (0)</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Idéntico (1)</span>
            </div>
          </div>

          {/* Detalle de cada embedding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[result.embedding1, result.embedding2].map((emb, idx) => (
              <div
                key={emb.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Embedding {idx === 0 ? 'A' : 'B'} · #{emb.id}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  {truncate(emb.text_input, 60)}
                </div>
                <span className={emb.model === EmbeddingModel.TRANSFORMERS ? 'badge badge-transformers' : 'badge badge-openai'}>
                  {emb.model === EmbeddingModel.TRANSFORMERS ? '🤗 Transformers' : '⚡ OpenAI'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
