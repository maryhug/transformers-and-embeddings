/**
 * Formulario para generar embeddings de texto.
 * Permite elegir entre OpenAI (API remota, 1536 dims) o
 * Transformers.js (modelo local, 384 dims, sin API key).
 */

'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import * as embeddingService from '../../services/embedding.service';
import type { IEmbeddingResult } from '../../types/embedding.types';
import { EmbeddingModel } from '../../types/embedding.types';

interface IEmbeddingFormProps {
  onSaved: () => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

/** Metadatos de visualización por modelo */
const MODEL_META: Record<EmbeddingModel, { label: string; icon: string; dims: string; badge: string; desc: string }> = {
  [EmbeddingModel.OPENAI]: {
    label: 'Generar con OpenAI',
    icon: '⚡',
    dims: '1 536',
    badge: 'badge-openai',
    desc: 'text-embedding-ada-002 · API remota · requiere clave',
  },
  [EmbeddingModel.TRANSFORMERS]: {
    label: 'Generar con Transformers',
    icon: '🤗',
    dims: '384',
    badge: 'badge-transformers',
    desc: 'all-MiniLM-L6-v2 · modelo local · sin API key',
  },
};

/**
 * Panel de generación de embeddings con dos proveedores.
 * Muestra el vector resultante y permite guardarlo en la DB.
 */
export default function EmbeddingForm({ onSaved, onError, onSuccess }: IEmbeddingFormProps): React.JSX.Element {
  const [text, setText] = useState('');
  const [result, setResult] = useState<IEmbeddingResult | null>(null);
  const [loadingModel, setLoadingModel] = useState<EmbeddingModel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedThisResult, setSavedThisResult] = useState(false);

  const isGenerating = loadingModel !== null;

  /**
   * Llama al endpoint correspondiente según el modelo elegido.
   * @param model - EmbeddingModel.OPENAI o EmbeddingModel.TRANSFORMERS
   */
  async function handleGenerate(model: EmbeddingModel): Promise<void> {
    if (!text.trim()) {
      onError('Por favor ingresa un texto antes de generar el embedding');
      return;
    }

    setLoadingModel(model);
    setResult(null);
    setSavedThisResult(false);

    try {
      const response =
        model === EmbeddingModel.OPENAI
          ? await embeddingService.generateWithOpenAI(text)
          : await embeddingService.generateWithTransformers(text);

      if (!response.success || !response.data) {
        onError(response.error ?? 'Error al generar el embedding');
        return;
      }

      setResult(response.data);
    } catch {
      onError('Error de conexión al generar el embedding');
    } finally {
      setLoadingModel(null);
    }
  }

  /** Guarda el embedding actual en la base de datos. */
  async function handleSave(): Promise<void> {
    if (!result) return;
    setIsSaving(true);
    try {
      const response = await embeddingService.saveEmbedding(
        text, result.vector, result.model, result.dimensions
      );
      if (!response.success) {
        onError(response.error ?? 'Error al guardar el embedding');
        return;
      }
      onSuccess('Embedding guardado correctamente');
      setSavedThisResult(true);
      onSaved();
    } catch {
      onError('Error de conexión al guardar el embedding');
    } finally {
      setIsSaving(false);
    }
  }

  function formatDate(): string {
    return new Date().toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const resultMeta = result
    ? MODEL_META[result.model as EmbeddingModel] ?? MODEL_META[EmbeddingModel.OPENAI]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Área de texto */}
      <div className="input-wrapper">
        <label className="input-label" htmlFor="embedding-text">
          Texto a convertir en embedding
        </label>
        <textarea
          id="embedding-text"
          className="input"
          placeholder="Escribe o pega cualquier texto aquí... Por ejemplo: 'El aprendizaje automático es una rama de la inteligencia artificial'"
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); setSavedThisResult(false); }}
          disabled={isGenerating}
          style={{ minHeight: '120px', resize: 'vertical' }}
        />
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'right' }}>
          {text.length} caracteres
        </span>
      </div>

      {/* Botones de generación */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* OpenAI */}
        <button
          className="btn btn-full"
          disabled={isGenerating || !text.trim()}
          onClick={() => { void handleGenerate(EmbeddingModel.OPENAI); }}
          style={{
            background: 'linear-gradient(135deg, #10a37f, #1a7f64)',
            color: '#fff',
            border: 'none',
            opacity: (isGenerating || !text.trim()) ? 0.5 : 1,
            cursor: (isGenerating || !text.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {loadingModel === EmbeddingModel.OPENAI
            ? <><span className="spinner" /> Generando...</>
            : <>⚡ OpenAI</>}
        </button>

        {/* Transformers */}
        <button
          className="btn btn-full"
          disabled={isGenerating || !text.trim()}
          onClick={() => { void handleGenerate(EmbeddingModel.TRANSFORMERS); }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff',
            border: 'none',
            opacity: (isGenerating || !text.trim()) ? 0.5 : 1,
            cursor: (isGenerating || !text.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {loadingModel === EmbeddingModel.TRANSFORMERS
            ? <><span className="spinner" /> Cargando modelo...</>
            : <>🤗 Transformers</>}
        </button>
      </div>

      {/* Aviso primera vez para Transformers */}
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '-12px' }}>
        💡 <strong style={{ color: 'var(--color-text-secondary)' }}>Transformers</strong> descarga el modelo (~23 MB) la primera vez — puede tardar 10-30 s.
      </p>

      {/* Resultado */}
      {result && resultMeta && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              ✓ Embedding generado
            </span>
            <span className={`badge ${resultMeta.badge}`}>
              {resultMeta.icon} {result.model === EmbeddingModel.OPENAI ? 'OpenAI' : 'Transformers'}
            </span>
          </div>

          {/* Metadatos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Dimensiones</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-accent-purple-light)' }}>
                {result.dimensions.toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Generado</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{formatDate()}</div>
            </div>
          </div>

          {/* Vista previa del vector */}
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Vista previa del vector (primeras 10 dimensiones)
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-accent-purple-light)',
              overflowX: 'auto', whiteSpace: 'nowrap',
            }}>
              [{result.vector.slice(0, 10).map((v) => v.toFixed(6)).join(', ')}
              {result.dimensions > 10 ? ` ... y ${result.dimensions - 10} más]` : ']'}
            </div>
          </div>

          {/* Descripción del modelo */}
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Modelo: <span style={{ color: 'var(--color-text-secondary)' }}>{resultMeta.desc}</span>
          </div>

          {/* Botón guardar */}
          <Button
            variant="secondary"
            fullWidth
            isLoading={isSaving}
            disabled={savedThisResult || isSaving}
            onClick={() => { void handleSave(); }}
            style={savedThisResult ? { borderColor: 'var(--color-success)', color: 'var(--color-success)' } : {}}
          >
            {savedThisResult ? '✓ Guardado en la base de datos' : isSaving ? 'Guardando...' : '💾 Guardar embedding'}
          </Button>
        </div>
      )}

      {/* Estado vacío */}
      {!result && !isGenerating && (
        <div style={{
          textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)', border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⬡</div>
          <p>Ingresa un texto y elige un proveedor para generar el embedding</p>
        </div>
      )}
    </div>
  );
}
