import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-horario-form',
  standalone: false,
  templateUrl: './horario-form.html',
  styleUrls: ['./horario-form.css'],
})
export class HorarioForm {
  form = { codigo: '', carrera: '' };
  errors: Record<string, string> = {};
  isEdit = false;
  editingId: number | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly horarioService = inject(HorarioService);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const found = this.horarioService.obtener(Number(params.get('id')));
      this.isEdit = found !== undefined;
      this.editingId = found?.id ?? null;
      this.errors = {};
      this.form = found
        ? { codigo: found.codigo, carrera: found.carrera }
        : { codigo: '', carrera: '' };
    });
  }

  guardar(): void {
    this.errors = {};
    const codigo = this.form.codigo.trim();
    const carrera = this.form.carrera.trim();
    if (!codigo) {
      this.errors['codigo'] = 'El código es obligatorio.';
    }
    if (!carrera) {
      this.errors['carrera'] = 'La carrera es obligatoria.';
    }
    const existe = this.horarioService
      .lista()
      .some(
        (horario) =>
          horario.codigo.toLowerCase() === codigo.toLowerCase() && horario.id !== this.editingId,
      );
    if (codigo && existe) {
      this.errors['codigo'] = 'El código ya existe.';
    }
    if (Object.keys(this.errors).length > 0) {
      return;
    }
    if (this.isEdit && this.editingId) {
      this.horarioService.actualizar(this.editingId, { codigo, carrera });
      this.router.navigate(['/horarios']);
      return;
    }
    const creado = this.horarioService.crear({ codigo, carrera });
    this.router.navigate(['/horarios', creado.id]);
  }

  cancelar(): void {
    this.router.navigate(['/horarios']);
  }
}
