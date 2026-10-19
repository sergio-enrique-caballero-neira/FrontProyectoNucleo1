import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  error = '';
  isEdit = false;
  editingId: number | null = null;
  guardando = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly horarioService = inject(HorarioService);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(async (params) => {
      this.errors = {};
      this.error = '';
      const carga = await this.horarioService.cargar();
      if (!carga.ok) {
        this.error = carga.motivo;
      }
      const id = params.get('id');
      const found = this.horarioService.obtener(Number(id));
      this.isEdit = found !== undefined;
      this.editingId = found?.id ?? null;
      if (id !== null && !found && !this.error) {
        this.error = 'El horario solicitado no existe.';
      }
      this.form = found
        ? { codigo: found.codigo, carrera: found.carrera }
        : { codigo: '', carrera: '' };
      this.cdr.markForCheck();
    });
  }

  async guardar(): Promise<void> {
    if (this.guardando) {
      return;
    }
    this.errors = {};
    this.error = '';
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
    this.guardando = true;
    if (this.isEdit && this.editingId) {
      const resultado = await this.horarioService.actualizar(this.editingId, { codigo, carrera });
      this.guardando = false;
      if (resultado.ok) {
        this.router.navigate(['/horarios']);
      } else {
        this.mostrarError(resultado.motivo, resultado.campos);
      }
      return;
    }
    const resultado = await this.horarioService.crear({ codigo, carrera });
    this.guardando = false;
    if (resultado.ok) {
      this.router.navigate(['/horarios', resultado.horario.id]);
    } else {
      this.mostrarError(resultado.motivo, resultado.campos);
    }
  }

  cancelar(): void {
    this.router.navigate(['/horarios']);
  }

  private mostrarError(motivo: string, campos: Record<string, string>): void {
    this.errors = { ...campos };
    if (Object.keys(this.errors).length === 0) {
      this.error = motivo;
    }
    this.cdr.markForCheck();
  }
}
