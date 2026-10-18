import { Injectable, signal } from '@angular/core';
import { BloqueHorario, Horario, horarios as sampleHorarios } from './sample-data';
import {
  bloquesSeSolapan,
  calcularHoraFin,
  esInicioValido,
  motivoInicioInvalido,
} from './reglas-horario';

export type ResultadoOperacion = { ok: true } | { ok: false; motivo: string };

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly items = signal<Horario[]>(
    sampleHorarios.map((horario) => ({
      ...horario,
      bloques: horario.bloques.map((bloque) => ({ ...bloque })),
    })),
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
    this.items.update((lista) =>
      lista.map((horario) => (horario.id === id ? { ...horario, ...datos } : horario)),
    );
  }

  eliminar(id: number): void {
    this.items.update((lista) => lista.filter((horario) => horario.id !== id));
  }

  agregarBloque(
    horarioId: number,
    datos: { asignaturaId: number; diaSemana: string; horaInicio: string },
  ): ResultadoOperacion {
    const horario = this.obtener(horarioId);
    if (!horario) {
      return { ok: false, motivo: 'El horario ya no existe.' };
    }

    const invalido = this.revisarReglas(horario, datos.diaSemana, datos.horaInicio);
    if (invalido) {
      return invalido;
    }

    const nuevoBloque: BloqueHorario = {
      id: this.siguienteBloqueId(horario),
      asignaturaId: datos.asignaturaId,
      diaSemana: datos.diaSemana,
      horaInicio: datos.horaInicio,
      horaFin: calcularHoraFin(datos.horaInicio),
    };

    const ocupado = horario.bloques.find((bloque) => bloquesSeSolapan(bloque, nuevoBloque));
    if (ocupado) {
      return {
        ok: false,
        motivo: `El ${ocupado.diaSemana} de ${ocupado.horaInicio} a ${ocupado.horaFin} ya está ocupado.`,
      };
    }

    this.items.update((lista) =>
      lista.map((item) =>
        item.id === horarioId ? { ...item, bloques: [...item.bloques, nuevoBloque] } : item,
      ),
    );
    return { ok: true };
  }

  moverBloque(
    horarioId: number,
    bloqueId: number,
    datos: { diaSemana: string; horaInicio: string },
  ): ResultadoOperacion {
    const horario = this.obtener(horarioId);
    if (!horario) {
      return { ok: false, motivo: 'El horario ya no existe.' };
    }

    const actual = horario.bloques.find((bloque) => bloque.id === bloqueId);
    if (!actual) {
      return { ok: false, motivo: 'El bloque ya no existe.' };
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
      return {
        ok: false,
        motivo: `El ${ocupado.diaSemana} de ${ocupado.horaInicio} a ${ocupado.horaFin} ya está ocupado.`,
      };
    }

    this.items.update((lista) =>
      lista.map((item) =>
        item.id === horarioId
          ? {
              ...item,
              bloques: item.bloques.map((bloque) => (bloque.id === bloqueId ? movido : bloque)),
            }
          : item,
      ),
    );
    return { ok: true };
  }

  eliminarBloque(horarioId: number, bloqueId: number): void {
    this.items.update((lista) =>
      lista.map((item) =>
        item.id === horarioId
          ? { ...item, bloques: item.bloques.filter((bloque) => bloque.id !== bloqueId) }
          : item,
      ),
    );
  }

  private revisarReglas(
    horario: Horario,
    diaSemana: string,
    horaInicio: string,
  ): ResultadoOperacion | null {
    if (!esInicioValido(diaSemana, horaInicio)) {
      return { ok: false, motivo: motivoInicioInvalido(diaSemana, horaInicio) };
    }
    if (
      horario.bloques.some(
        (bloque) => bloque.diaSemana === diaSemana && bloque.horaInicio === horaInicio,
      )
    ) {
      return { ok: false, motivo: `Ya existe un bloque que inicia a las ${horaInicio} ese día.` };
    }
    return null;
  }

  private siguienteId(): number {
    return this.items().reduce((max, horario) => Math.max(max, horario.id), 0) + 1;
  }

  private siguienteBloqueId(horario: Horario): number {
    return horario.bloques.reduce((max, bloque) => Math.max(max, bloque.id), 0) + 1;
  }
}
