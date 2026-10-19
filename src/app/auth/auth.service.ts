import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { fallo, ResultadoOperacion } from '../data/api';

const STORAGE_KEY = 'gestor-horarios-sesion';

interface Sesion {
  token: string;
  username: string;
  /** Momento (ms desde epoch) en que el token deja de ser válido. */
  expira: number;
}

interface RespuestaLogin {
  token: string;
  tipo: string;
  expiraEn: number;
  username: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sesion = signal<Sesion | null>(this.leer());

  readonly usuario = computed(() => this.sesion()?.username ?? '');

  /** Token vigente, o `null` si no hay sesión o ya expiró. */
  token(): string | null {
    const sesion = this.sesion();
    if (!sesion) {
      return null;
    }
    if (Date.now() >= sesion.expira) {
      this.limpiar();
      return null;
    }
    return sesion.token;
  }

  estaAutenticado(): boolean {
    return this.token() !== null;
  }

  async iniciarSesion(username: string, password: string): Promise<ResultadoOperacion> {
    try {
      const respuesta = await firstValueFrom(
        this.http.post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, { username, password }),
      );
      const sesion: Sesion = {
        token: respuesta.token,
        username: respuesta.username,
        expira: Date.now() + respuesta.expiraEn,
      };
      this.sesion.set(sesion);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
      } catch {}
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  /** Cierra la sesión y vuelve al login; `expirada` muestra el aviso correspondiente. */
  cerrarSesion(expirada = false): void {
    this.limpiar();
    this.router.navigate(['/login'], expirada ? { queryParams: { sesion: 'expirada' } } : {});
  }

  private limpiar(): void {
    this.sesion.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  private leer(): Sesion | null {
    try {
      const guardada = localStorage.getItem(STORAGE_KEY);
      const sesion = guardada ? (JSON.parse(guardada) as Sesion) : null;
      return sesion && typeof sesion.token === 'string' && sesion.expira > Date.now()
        ? sesion
        : null;
    } catch {
      return null;
    }
  }
}
