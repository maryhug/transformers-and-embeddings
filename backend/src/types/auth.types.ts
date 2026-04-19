/**
 * Tipos e interfaces relacionados con autenticación de usuarios.
 * Define las estructuras de datos para registro, login y tokens JWT.
 */

/** Interfaz que representa un usuario en la base de datos */
export interface IUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

/** Interfaz para la respuesta pública del usuario (sin datos sensibles) */
export interface IPublicUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

/** Payload contenido dentro del token JWT */
export interface IJwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/** Cuerpo de la petición para registro */
export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** Cuerpo de la petición para inicio de sesión */
export interface ILoginRequest {
  email: string;
  password: string;
}

/** Respuesta exitosa de autenticación */
export interface IAuthResponse {
  token: string;
  user: IPublicUser;
}
