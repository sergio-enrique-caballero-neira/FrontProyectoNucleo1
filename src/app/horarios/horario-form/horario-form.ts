import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { asignaturas, DIAS_SEMANA, horarios } from '../../data/sample-data';

@Component({
  selector: 'app-horario-form',
  standalone: false,
  templateUrl: './horario-form.html',
  styleUrls: ['./horario-form.css'],
})
export class HorarioForm {
  asignaturas = asignaturas;
  dias = DIAS_SEMANA;
  form = { asignaturaId: null as number | null, diaSemana: 'Lunes', horaInicio: '07:00' };
  errors: Record<string, string> = {};
  alert = '';
  isEdit = false;
  editingId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = horarios.find((item) => item.id === id);
    if (found) {
      this.isEdit = true;
      this.editingId = found.id;
      this.form = {
        asignaturaId: found.asignaturaId,
        diaSemana: found.diaSemana,
        horaInicio: found.horaInicio,
      };
    }
  }

  get horaFin(): string {
    return this.sumarHoras(this.form.horaInicio, 2);
  }

  esFueraDeFranja(): boolean {
    const inicio = this.form.horaInicio;
    if (this.form.diaSemana === 'Sábado') {
      return inicio < '07:00' || inicio >= '13:00';
    }
    return inicio < '07:00' || inicio >= '22:00';
  }

  esAlmuerzo(): boolean {
    return this.form.horaInicio < '13:00' && this.horaFin > '12:00';
  }

  guardar(): void {
    this.errors = {};
    if (!this.form.asignaturaId) {
      this.errors['asignaturaId'] = 'Debe seleccionar una asignatura.';
    }
    if (this.esFueraDeFranja()) {
      this.errors['horaInicio'] = 'La hora está fuera de la franja permitida.';
    } else if (this.esAlmuerzo()) {
      this.errors['horaInicio'] = 'La hora cruza el intervalo de almuerzo (12:00 a 13:00).';
    }
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    this.alert = this.isEdit ? 'Horario actualizado correctamente.' : 'Horario creado correctamente.';
  }

  sumarHoras(hora: string, horas: number): string {
    const [h] = hora.split(':').map(Number);
    return `${String((h + horas) % 24).padStart(2, '0')}:00`;
  }

  cancelar(): void {
    this.router.navigate(['/horarios']);
  }
}
