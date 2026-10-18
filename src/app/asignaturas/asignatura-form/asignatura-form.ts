import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { asignaturas } from '../../data/sample-data';

@Component({
  selector: 'app-asignatura-form',
  standalone: false,
  templateUrl: './asignatura-form.html',
  styleUrls: ['./asignatura-form.css'],
})
export class AsignaturaForm {
  form = { codigo: '', nombre: '', creditos: 3, sesionesSemana: 2 };
  errors: Record<string, string> = {};
  alert = '';
  isEdit = false;
  editingId: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = asignaturas.find((item) => item.id === id);
    if (found) {
      this.isEdit = true;
      this.editingId = found.id;
      this.form = {
        codigo: found.codigo,
        nombre: found.nombre,
        creditos: found.creditos,
        sesionesSemana: found.sesionesSemana,
      };
    }
  }

  guardar(): void {
    this.errors = {};
    if (!this.form.nombre.trim()) {
      this.errors['nombre'] = 'El nombre es obligatorio.';
    }
    if (!this.form.codigo.trim()) {
      this.errors['codigo'] = 'El código es obligatorio.';
    }
    if (this.form.creditos < 1 || this.form.creditos > 6) {
      this.errors['creditos'] = 'Los créditos deben estar entre 1 y 6.';
    }
    if (this.form.sesionesSemana < 1 || this.form.sesionesSemana > 4) {
      this.errors['sesionesSemana'] = 'Las sesiones deben estar entre 1 y 4.';
    }
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    this.alert = this.isEdit ? 'Asignatura actualizada correctamente.' : 'Asignatura creada correctamente.';
  }

  cancelar(): void {
    this.router.navigate(['/asignaturas']);
  }
}
