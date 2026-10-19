import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Añade `Authorization: Bearer <token>` a las peticiones a la API. Si la API responde 401
 * (token vencido o inválido), cierra la sesión y vuelve al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esApi = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url === `${environment.apiUrl}/auth/login`;
  const token = esApi && !esLogin ? auth.token() : null;
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (esApi && !esLogin && error instanceof HttpErrorResponse && error.status === 401) {
        auth.cerrarSesion(true);
      }
      return throwError(() => error);
    }),
  );
};
