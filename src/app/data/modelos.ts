export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  sesionesSemana: number;
}

export interface BloqueHorario {
  id: number;
  asignaturaId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

/** Horario de una carrera; en la API se llama "programación" (/api/programaciones). */
export interface Horario {
  id: number;
  codigo: string;
  carrera: string;
  bloques: BloqueHorario[];
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Bloque tal como lo devuelve /api/horarios. */
export interface BloqueApi extends BloqueHorario {
  programacionId: number;
  asignaturaCodigo: string;
  asignaturaNombre: string;
}

/** Programación tal como la devuelve /api/programaciones. */
export interface ProgramacionApi {
  id: number;
  codigo: string;
  carrera: string;
  bloques: BloqueApi[];
}
