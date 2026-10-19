import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { fallo, ResultadoOperacion } from './api';
import { Asignatura } from './modelos';

export type DatosAsignatura = Omit<Asignatura, 'id'>;

@Injectable({ providedIn: 'root' })
export class AsignaturaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/asignaturas`;

  private readonly items = signal<Asignatura[]>([]);
  private carga: Promise<ResultadoOperacion> | null = null;

  readonly lista = this.items.asReadonly();
  /** `true` después de la primera carga exitosa desde la API. */
  readonly cargado = signal(false);

  /** Trae el catálogo; reutiliza la carga anterior salvo que se pida `forzar`. */
  cargar(forzar = false): Promise<ResultadoOperacion> {
    if (this.carga && !forzar) {
      return this.carga;
    }
    this.carga = firstValueFrom(this.http.get<Asignatura[]>(this.url)).then(
      (lista) => {
        this.items.set(lista);
        this.cargado.set(true);
        return { ok: true } as const;
      },
      (error) => {
        this.carga = null;
        return fallo(error);
      },
    );
    return this.carga;
  }

  obtener(id: number): Asignatura | undefined {
    return this.items().find((asignatura) => asignatura.id === id);
  }

  async crear(datos: DatosAsignatura): Promise<ResultadoOperacion> {
    try {
      const creada = await firstValueFrom(this.http.post<Asignatura>(this.url, datos));
      this.items.update((lista) => ordenar([...lista, creada]));
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  async actualizar(id: number, datos: DatosAsignatura): Promise<ResultadoOperacion> {
    try {
      const actualizada = await firstValueFrom(
        this.http.put<Asignatura>(`${this.url}/${id}`, datos),
      );
      this.items.update((lista) =>
        ordenar(lista.map((asignatura) => (asignatura.id === id ? actualizada : asignatura))),
      );
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  async eliminar(id: number): Promise<ResultadoOperacion> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
      this.items.update((lista) => lista.filter((asignatura) => asignatura.id !== id));
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }
}

function ordenar(lista: Asignatura[]): Asignatura[] {
  return [...lista].sort((a, b) => a.codigo.localeCompare(b.codigo));
}
