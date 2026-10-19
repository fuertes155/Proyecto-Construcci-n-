/**
 * Error de dominio con código HTTP. Lo lanzan servicios y controladores;
 * el `errorHandler` lo convierte en una respuesta JSON uniforme.
 *
 *   throw ApiError.notFound('Proyecto no encontrado');
 *   throw new ApiError(422, 'Datos incompletos', { campo: 'motivo' });
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Solicitud inválida', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = 'No autenticado'): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message = 'No tienes permiso para esta acción'): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message = 'El recurso ya existe'): ApiError {
    return new ApiError(409, message);
  }
}

export default ApiError;
