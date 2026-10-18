import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const found = asignaturas.find((item) => item.id === Number(params.get('id')));
      this.isEdit = found !== undefined;
      this.errors = {};
      this.alert = '';
      this.form = found
        ? {
            codigo: found.codigo,
            nombre: found.nombre,
            creditos: found.creditos,
            sesionesSemana: found.sesionesSemana,
          }
        : { codigo: '', nombre: '', creditos: 3, sesionesSemana: 2 };
    });
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
    this.alert = this.isEdit
      ? 'Asignatura actualizada correctamente.'
      : 'Asignatura creada correctamente.';
  }

  cancelar(): void {
    this.router.navigate(['/asignaturas']);
  }
}
