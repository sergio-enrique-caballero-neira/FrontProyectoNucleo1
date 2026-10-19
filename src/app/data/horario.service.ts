import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { fallo, falloLocal, ResultadoOperacion } from './api';
import { AsignaturaService } from './asignatura.service';
import { BloqueApi, BloqueHorario, Horario, ProgramacionApi } from './modelos';
import {
  bloquesSeSolapan,
  calcularHoraFin,
  esInicioValido,
  motivoInicioInvalido,
} from './reglas-horario';

export type { ResultadoOperacion } from './api';

export type ResultadoCreacion =
  { ok: true; horario: Horario } | { ok: false; motivo: string; campos: Record<string, string> };

/**
 * Estado de los horarios (programaciones en la API) y sus bloques. Las reglas se revisan
 * aquí antes de llamar a la API para dar respuesta inmediata en la rejilla; el backend
 * vuelve a validarlas y tiene la última palabra (RNF-03).
 */
@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly http = inject(HttpClient);
  private readonly asignaturas = inject(AsignaturaService);
  private readonly urlProgramaciones = `${environment.apiUrl}/programaciones`;
  private readonly urlBloques = `${environment.apiUrl}/horarios`;

  private readonly items = signal<Horario[]>([]);
  private carga: Promise<ResultadoOperacion> | null = null;

  readonly lista = this.items.asReadonly();
  /** `true` después de la primera carga exitosa desde la API. */
  readonly cargado = signal(false);

  /** Trae los horarios con sus bloques; reutiliza la carga anterior salvo que se pida `forzar`. */
  cargar(forzar = false): Promise<ResultadoOperacion> {
    if (this.carga && !forzar) {
      return this.carga;
    }
    this.carga = firstValueFrom(this.http.get<ProgramacionApi[]>(this.urlProgramaciones)).then(
      (lista) => {
        this.items.set(lista.map(aHorario));
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

  obtener(id: number): Horario | undefined {
    return this.items().find((horario) => horario.id === id);
  }

  async crear(datos: { codigo: string; carrera: string }): Promise<ResultadoCreacion> {
    try {
      const creado = aHorario(
        await firstValueFrom(this.http.post<ProgramacionApi>(this.urlProgramaciones, datos)),
      );
      this.items.update((lista) => [...lista, creado]);
      return { ok: true, horario: creado };
    } catch (error) {
      return fallo(error);
    }
  }

  async actualizar(
    id: number,
    datos: { codigo: string; carrera: string },
  ): Promise<ResultadoOperacion> {
    try {
      const actualizado = aHorario(
        await firstValueFrom(
          this.http.put<ProgramacionApi>(`${this.urlProgramaciones}/${id}`, datos),
        ),
      );
      this.reemplazar(actualizado);
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  async eliminar(id: number): Promise<ResultadoOperacion> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.urlProgramaciones}/${id}`));
      this.items.update((lista) => lista.filter((horario) => horario.id !== id));
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  async agregarBloque(
    horarioId: number,
    datos: { asignaturaId: number; diaSemana: string; horaInicio: string },
  ): Promise<ResultadoOperacion> {
    const horario = this.obtener(horarioId);
    if (!horario) {
      return falloLocal('El horario ya no existe.');
    }

    const asignatura = this.asignaturas.obtener(datos.asignaturaId);
    if (!asignatura) {
      return falloLocal('La asignatura indicada no existe.');
    }

    const bloqueados = horario.bloques.filter(
      (bloque) => bloque.asignaturaId === datos.asignaturaId,
    ).length;
    if (bloqueados >= asignatura.sesionesSemana) {
      return falloLocal(
        `${asignatura.nombre} ya alcanzó sus ${asignatura.sesionesSemana} sesiones semanales.`,
      );
    }

    const invalido = this.revisarReglas(horario, datos.diaSemana, datos.horaInicio);
    if (invalido) {
      return invalido;
    }

    const nuevoBloque: BloqueHorario = {
      id: 0,
      asignaturaId: datos.asignaturaId,
      diaSemana: datos.diaSemana,
      horaInicio: datos.horaInicio,
      horaFin: calcularHoraFin(datos.horaInicio),
    };

    const ocupado = horario.bloques.find((bloque) => bloquesSeSolapan(bloque, nuevoBloque));
    if (ocupado) {
      return falloLocal(
        `El ${ocupado.diaSemana} de ${ocupado.horaInicio} a ${ocupado.horaFin} ya está ocupado.`,
      );
    }

    try {
      const creado = aBloque(
        await firstValueFrom(
          this.http.post<BloqueApi>(this.urlBloques, {
            programacionId: horarioId,
            asignaturaId: nuevoBloque.asignaturaId,
            diaSemana: nuevoBloque.diaSemana,
            horaInicio: nuevoBloque.horaInicio,
            horaFin: nuevoBloque.horaFin,
          }),
        ),
      );
      this.actualizarBloques(horarioId, (bloques) => [...bloques, creado]);
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  /**
   * Mueve el bloque en la rejilla de inmediato y luego lo confirma con la API. Si la API lo
   * rechaza, vuelve a traer el horario para quedar igual que el servidor.
   */
  async moverBloque(
    horarioId: number,
    bloqueId: number,
    datos: { diaSemana: string; horaInicio: string },
  ): Promise<ResultadoOperacion> {
    const horario = this.obtener(horarioId);
    if (!horario) {
      return falloLocal('El horario ya no existe.');
    }

    const actual = horario.bloques.find((bloque) => bloque.id === bloqueId);
    if (!actual) {
      return falloLocal('El bloque ya no existe.');
    }

    const invalido = this.revisarReglas(horario, datos.diaSemana, datos.horaInicio);
    if (invalido) {
      return invalido;
    }

    const movido: BloqueHorario = {
      ...actual,
      diaSemana: datos.diaSemana,
      horaInicio: datos.horaInicio,
      horaFin: calcularHoraFin(datos.horaInicio),
    };

    const ocupado = horario.bloques.find(
      (bloque) => bloque.id !== bloqueId && bloquesSeSolapan(bloque, movido),
    );
    if (ocupado) {
      return falloLocal(
        `El ${ocupado.diaSemana} de ${ocupado.horaInicio} a ${ocupado.horaFin} ya está ocupado.`,
      );
    }

    this.actualizarBloques(horarioId, (bloques) =>
      bloques.map((bloque) => (bloque.id === bloqueId ? movido : bloque)),
    );
    try {
      await firstValueFrom(
        this.http.put<BloqueApi>(`${this.urlBloques}/${bloqueId}`, {
          programacionId: horarioId,
          asignaturaId: movido.asignaturaId,
          diaSemana: movido.diaSemana,
          horaInicio: movido.horaInicio,
          horaFin: movido.horaFin,
        }),
      );
      return { ok: true };
    } catch (error) {
      await this.recargarHorario(horarioId);
      return fallo(error);
    }
  }

  async eliminarBloque(horarioId: number, bloqueId: number): Promise<ResultadoOperacion> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.urlBloques}/${bloqueId}`));
      this.actualizarBloques(horarioId, (bloques) =>
        bloques.filter((bloque) => bloque.id !== bloqueId),
      );
      return { ok: true };
    } catch (error) {
      return fallo(error);
    }
  }

  private revisarReglas(
    horario: Horario,
    diaSemana: string,
    horaInicio: string,
  ): ResultadoOperacion | null {
    if (!esInicioValido(diaSemana, horaInicio)) {
      return falloLocal(motivoInicioInvalido(diaSemana, horaInicio));
    }
    if (
      horario.bloques.some(
        (bloque) => bloque.diaSemana === diaSemana && bloque.horaInicio === horaInicio,
      )
    ) {
      return falloLocal(`Ya existe un bloque que inicia a las ${horaInicio} ese día.`);
    }
    return null;
  }

  private async recargarHorario(id: number): Promise<void> {
    try {
      this.reemplazar(
        aHorario(
          await firstValueFrom(this.http.get<ProgramacionApi>(`${this.urlProgramaciones}/${id}`)),
        ),
      );
    } catch {
      await this.cargar(true);
    }
  }

  private reemplazar(horario: Horario): void {
    this.items.update((lista) => lista.map((item) => (item.id === horario.id ? horario : item)));
  }

  private actualizarBloques(
    horarioId: number,
    cambio: (bloques: BloqueHorario[]) => BloqueHorario[],
  ): void {
    this.items.update((lista) =>
      lista.map((item) =>
        item.id === horarioId ? { ...item, bloques: cambio(item.bloques) } : item,
      ),
    );
  }
}

function aBloque(bloque: BloqueApi): BloqueHorario {
  return {
    id: bloque.id,
    asignaturaId: bloque.asignaturaId,
    diaSemana: bloque.diaSemana,
    horaInicio: bloque.horaInicio,
    horaFin: bloque.horaFin,
  };
}

function aHorario(programacion: ProgramacionApi): Horario {
  return {
    id: programacion.id,
    codigo: programacion.codigo,
    carrera: programacion.carrera,
    bloques: programacion.bloques.map(aBloque),
  };
}
