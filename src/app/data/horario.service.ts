import { Injectable, signal } from '@angular/core';
import { BloqueHorario, Horario, horarios as sampleHorarios } from './sample-data';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly items = signal<Horario[]>(
    sampleHorarios.map((horario) => ({ ...horario, bloques: horario.bloques.map((bloque) => ({ ...bloque })) })),
  );

  readonly lista = this.items.asReadonly();

  obtener(id: number): Horario | undefined {
    return this.items().find((horario) => horario.id === id);
  }

  crear(datos: { codigo: string; carrera: string }): Horario {
    const nuevo: Horario = {
      id: this.siguienteId(),
      codigo: datos.codigo,
      carrera: datos.carrera,
      bloques: [],
    };
    this.items.update((lista) => [...lista, nuevo]);
    return nuevo;
  }

  actualizar(id: number, datos: { codigo: string; carrera: string }): void {
    this.items.update((lista) => lista.map((horario) => (horario.id === id ? { ...horario, ...datos } : horario)));
  }

  eliminar(id: number): void {
    this.items.update((lista) => lista.filter((horario) => horario.id !== id));
  }

  agregarBloque(horarioId: number, datos: { asignaturaId: number; diaSemana: string; horaInicio: string }): void {
    this.items.update((lista) =>
      lista.map((horario) =>
        horario.id === horarioId
          ? {
              ...horario,
              bloques: [
                ...horario.bloques,
                {
                  id: this.siguienteBloqueId(horario),
                  asignaturaId: datos.asignaturaId,
                  diaSemana: datos.diaSemana,
                  horaInicio: datos.horaInicio,
                  horaFin: this.sumarHoras(datos.horaInicio, 2),
                },
              ],
            }
          : horario,
      ),
    );
  }

  moverBloque(horarioId: number, bloqueId: number, datos: { diaSemana: string; horaInicio: string }): void {
    this.items.update((lista) =>
      lista.map((horario) =>
        horario.id === horarioId
          ? {
              ...horario,
              bloques: horario.bloques.map((bloque) =>
                bloque.id === bloqueId
                  ? {
                      ...bloque,
                      diaSemana: datos.diaSemana,
                      horaInicio: datos.horaInicio,
                      horaFin: this.sumarHoras(datos.horaInicio, 2),
                    }
                  : bloque,
              ),
            }
          : horario,
      ),
    );
  }

  eliminarBloque(horarioId: number, bloqueId: number): void {
    this.items.update((lista) =>
      lista.map((horario) =>
        horario.id === horarioId
          ? { ...horario, bloques: horario.bloques.filter((bloque) => bloque.id !== bloqueId) }
          : horario,
      ),
    );
  }

  sumarHoras(hora: string, horas: number): string {
    const [h] = hora.split(':').map(Number);
    return `${String((h + horas) % 24).padStart(2, '0')}:00`;
  }

  private siguienteId(): number {
    return this.items().reduce((max, horario) => Math.max(max, horario.id), 0) + 1;
  }

  private siguienteBloqueId(horario: Horario): number {
    return horario.bloques.reduce((max, bloque) => Math.max(max, bloque.id), 0) + 1;
  }
}
