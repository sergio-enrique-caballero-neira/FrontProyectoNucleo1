import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignaturaService } from '../../data/asignatura.service';

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
  error = '';
  isEdit = false;
  editingId: number | null = null;
  guardando = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly asignaturaService = inject(AsignaturaService);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(async (params) => {
      this.errors = {};
      this.alert = '';
      this.error = '';
      const id = params.get('id');
      if (id !== null) {
        const carga = await this.asignaturaService.cargar();
        if (!carga.ok) {
          this.error = carga.motivo;
        }
      }
      const found = this.asignaturaService.obtener(Number(id));
      this.isEdit = found !== undefined;
      this.editingId = found?.id ?? null;
      if (id !== null && !found && !this.error) {
        this.error = 'La asignatura solicitada no existe.';
      }
      this.form = found
        ? {
            codigo: found.codigo,
            nombre: found.nombre,
            creditos: found.creditos,
            sesionesSemana: found.sesionesSemana,
          }
        : { codigo: '', nombre: '', creditos: 3, sesionesSemana: 2 };
      this.cdr.markForCheck();
    });
  }

  async guardar(): Promise<void> {
    if (this.guardando) {
      return;
    }
    this.errors = {};
    this.alert = '';
    this.error = '';
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
    const datos = {
      codigo: this.form.codigo.trim(),
      nombre: this.form.nombre.trim(),
      creditos: Number(this.form.creditos),
      sesionesSemana: Number(this.form.sesionesSemana),
    };
    this.guardando = true;
    const resultado =
      this.isEdit && this.editingId
        ? await this.asignaturaService.actualizar(this.editingId, datos)
        : await this.asignaturaService.crear(datos);
    this.guardando = false;
    if (resultado.ok) {
      this.router.navigate(['/asignaturas']);
      return;
    }
    this.errors = { ...resultado.campos };
    if (Object.keys(this.errors).length === 0) {
      this.error = resultado.motivo;
    }
    this.cdr.markForCheck();
  }

  cancelar(): void {
    this.router.navigate(['/asignaturas']);
  }
}
