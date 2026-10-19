import { HttpErrorResponse } from '@angular/common/http';

export type ResultadoOperacion =
  { ok: true } | { ok: false; motivo: string; campos: Record<string, string> };

/** Convierte un error de la API en un mensaje comprensible y los errores por campo. */
export function fallo(error: unknown): {
  ok: false;
  motivo: string;
  campos: Record<string, string>;
} {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        ok: false,
        motivo: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
        campos: {},
      };
    }
    const cuerpo = error.error;
    if (cuerpo && typeof cuerpo.mensaje === 'string') {
      return { ok: false, motivo: cuerpo.mensaje, campos: cuerpo.campos ?? {} };
    }
    if (error.status === 401) {
      return { ok: false, motivo: 'Tu sesión expiró. Inicia sesión de nuevo.', campos: {} };
    }
  }
  return { ok: false, motivo: 'Ocurrió un error inesperado. Intenta de nuevo.', campos: {} };
}

export function falloLocal(motivo: string): {
  ok: false;
  motivo: string;
  campos: Record<string, string>;
} {
  return { ok: false, motivo, campos: {} };
}
