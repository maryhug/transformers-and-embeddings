/**
 * Formulario de inicio de sesión.
 * Valida correo y contraseña, muestra errores y redirige al dashboard.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import * as authService from '../../services/auth.service';
import type { ILoginForm } from '../../types/auth.types';

/** Props del formulario de inicio de sesión */
interface ILoginFormProps {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

/**
 * Formulario de login con validación de campos y manejo de errores de credenciales.
 */
export default function LoginForm({ onError, onSuccess }: ILoginFormProps): React.JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<ILoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<ILoginForm>>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Actualiza un campo del formulario y limpia su error.
   */
  function handleChange(field: keyof ILoginForm, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  /**
   * Valida los campos del formulario de login.
   * @returns true si es válido
   */
  function validate(): boolean {
    const newErrors: Partial<ILoginForm> = {};

    if (!form.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Formato de correo inválido';
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   */
  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(form.email.trim(), form.password);

      if (!response.success || !response.data) {
        onError(response.error ?? 'Credenciales incorrectas');
        return;
      }

      authService.saveSession(response.data.token, response.data.user);
      onSuccess('¡Bienvenido de vuelta! Redirigiendo...');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch {
      onError('Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@correo.com"
        value={form.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        autoComplete="email"
        autoFocus
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Tu contraseña"
        value={form.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        style={{ marginTop: '8px' }}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
