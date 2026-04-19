/**
 * Formulario de registro de nuevo usuario.
 * Incluye validación de campos, indicador de fortaleza de contraseña
 * y manejo de errores con feedback visual.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import * as authService from '../../services/auth.service';
import type { IRegisterForm } from '../../types/auth.types';

/** Props del formulario de registro */
interface IRegisterFormProps {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

/**
 * Calcula la fortaleza de una contraseña del 0 al 4.
 * @param password - Contraseña a evaluar
 * @returns Número del 0 al 4 indicando la fortaleza
 */
function calcPasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/** Etiquetas para cada nivel de fortaleza */
const STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_CLASSES = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong'];

/**
 * Formulario completo de registro con validación y fortaleza de contraseña.
 */
export default function RegisterForm({ onError, onSuccess }: IRegisterFormProps): React.JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<IRegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<IRegisterForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const passwordStrength = calcPasswordStrength(form.password);

  /**
   * Actualiza un campo del formulario y limpia su error correspondiente.
   * @param field - Nombre del campo a actualizar
   * @param value - Nuevo valor del campo
   */
  function handleChange(field: keyof IRegisterForm, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  /**
   * Valida todos los campos del formulario.
   * @returns true si el formulario es válido, false si hay errores
   */
  function validate(): boolean {
    const newErrors: Partial<IRegisterForm> = {};

    if (!form.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (form.username.trim().length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!form.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Formato de correo inválido';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Maneja el envío del formulario de registro.
   * @param e - Evento del formulario
   */
  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.register(
        form.username.trim(),
        form.email.trim(),
        form.password
      );

      if (!response.success || !response.data) {
        onError(response.error ?? 'Error al registrarse');
        return;
      }

      authService.saveSession(response.data.token, response.data.user);
      onSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch {
      onError('Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Nombre de usuario"
        type="text"
        placeholder="ej: juan_perez"
        value={form.username}
        onChange={(e) => handleChange('username', e.target.value)}
        error={errors.username}
        autoComplete="username"
        autoFocus
      />

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        value={form.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        autoComplete="email"
      />

      <div className="input-wrapper">
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />

        {/* Indicador de fortaleza de contraseña */}
        {form.password.length > 0 && (
          <div className="password-strength">
            <div className="password-strength-bars">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={[
                    'password-strength-bar',
                    passwordStrength >= level ? STRENGTH_CLASSES[passwordStrength] : '',
                  ].join(' ')}
                />
              ))}
            </div>
            <span className="password-strength-label">
              Fortaleza:{' '}
              <span style={{ color: 'var(--color-text-primary)' }}>
                {STRENGTH_LABELS[passwordStrength] ?? 'Desconocida'}
              </span>
            </span>
          </div>
        )}
      </div>

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        value={form.confirmPassword}
        onChange={(e) => handleChange('confirmPassword', e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        style={{ marginTop: '8px' }}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
