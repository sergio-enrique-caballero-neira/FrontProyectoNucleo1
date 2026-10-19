import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protege las páginas de gestión. Solo mejora la navegación: la autorización real la
 * aplica el backend en cada petición (RNF-04).
 */
export const authGuard: CanActivateFn = () =>
  inject(AuthService).estaAutenticado() ? true : inject(Router).createUrlTree(['/login']);

/** Evita mostrar el login a quien ya tiene una sesión vigente. */
export const invitadoGuard: CanActivateFn = () =>
  inject(AuthService).estaAutenticado() ? inject(Router).createUrlTree(['/asignaturas']) : true;
