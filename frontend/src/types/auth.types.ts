/**
 * Tipos e interfaces de autenticación para el frontend.
 * Espeja los tipos del backend para consistencia entre capas.
 */

/** Datos públicos del usuario (sin contraseña) */
export interface IPublicUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

/** Respuesta del servidor al autenticar exitosamente */
export interface IAuthResponse {
  token: string;
  user: IPublicUser;
}

/** Cuerpo del formulario de registro */
export interface IRegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Cuerpo del formulario de inicio de sesión */
export interface ILoginForm {
  email: string;
  password: string;
}
