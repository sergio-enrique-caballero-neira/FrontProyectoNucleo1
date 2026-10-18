export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  sesionesSemana: number;
}

export interface Horario {
  id: number;
  asignaturaId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const asignaturas: Asignatura[] = [
  { id: 1, codigo: 'SIS101', nombre: 'Programación I', creditos: 4, sesionesSemana: 3 },
  { id: 2, codigo: 'SIS201', nombre: 'Bases de Datos', creditos: 4, sesionesSemana: 3 },
  { id: 3, codigo: 'SIS301', nombre: 'Ingeniería de Software', creditos: 3, sesionesSemana: 2 },
  { id: 4, codigo: 'SIS401', nombre: 'Redes de Computadores', creditos: 3, sesionesSemana: 2 },
  { id: 5, codigo: 'MAT101', nombre: 'Cálculo I', creditos: 4, sesionesSemana: 4 },
];

export const horarios: Horario[] = [
  { id: 1, asignaturaId: 1, diaSemana: 'Lunes', horaInicio: '07:00', horaFin: '09:00' },
  { id: 2, asignaturaId: 2, diaSemana: 'Lunes', horaInicio: '09:00', horaFin: '11:00' },
  { id: 3, asignaturaId: 3, diaSemana: 'Martes', horaInicio: '14:00', horaFin: '16:00' },
  { id: 4, asignaturaId: 4, diaSemana: 'Miércoles', horaInicio: '18:00', horaFin: '20:00' },
  { id: 5, asignaturaId: 5, diaSemana: 'Jueves', horaInicio: '07:00', horaFin: '09:00' },
];
