import { BloqueHorario } from './modelos';

export const DURACION_SESION_HORAS = 2;

export const HORA_INICIO_MINIMA = '07:00';
export const HORA_INICIO_MAXIMA = '19:00';

export const HORA_ALMUERZO_INICIO = '12:00';
export const HORA_ALMUERZO_FIN = '13:00';

export const HORA_LIMITE_SABADO = '13:00';
export const DIA_SABADO = 'Sábado';

export function calcularHoraFin(hora: string): string {
  const [h, m] = hora.split(':').map(Number);
  return `${String(h + DURACION_SESION_HORAS).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function esFilaAlmuerzo(hora: string): boolean {
  return hora === HORA_ALMUERZO_INICIO;
}

export function sesionCruzariaAlmuerzo(horaInicio: string): boolean {
  return horaInicio < HORA_ALMUERZO_FIN && calcularHoraFin(horaInicio) > HORA_ALMUERZO_INICIO;
}

function motivoInvalido(dia: string, horaInicio: string): string | null {
  if (sesionCruzariaAlmuerzo(horaInicio)) {
    return `La sesión de ${horaInicio} a ${calcularHoraFin(horaInicio)} invade el descanso de 12:00 a 13:00.`;
  }
  if (horaInicio < HORA_INICIO_MINIMA) {
    return `La jornada inicia a las ${HORA_INICIO_MINIMA}.`;
  }
  if (dia === DIA_SABADO && calcularHoraFin(horaInicio) > HORA_LIMITE_SABADO) {
    return `El ${DIA_SABADO} solo admite sesiones hasta las ${HORA_LIMITE_SABADO}.`;
  }
  if (horaInicio > HORA_INICIO_MAXIMA) {
    return `La última sesión de la jornada inicia a las ${HORA_INICIO_MAXIMA}.`;
  }
  return null;
}

export function esInicioValido(dia: string, horaInicio: string): boolean {
  return motivoInvalido(dia, horaInicio) === null;
}

export function motivoInicioInvalido(dia: string, horaInicio: string): string {
  return motivoInvalido(dia, horaInicio) ?? '';
}

export function bloquesSeSolapan(a: BloqueHorario, b: BloqueHorario): boolean {
  if (a.diaSemana !== b.diaSemana) {
    return false;
  }
  return a.horaInicio < b.horaFin && b.horaInicio < a.horaFin;
}
