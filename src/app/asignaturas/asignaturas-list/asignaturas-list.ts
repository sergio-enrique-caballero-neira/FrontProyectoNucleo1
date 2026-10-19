import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Asignatura } from '../../data/modelos';
import { AsignaturaService } from '../../data/asignatura.service';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-asignaturas-list',
  standalone: false,
  templateUrl: './asignaturas-list.html',
})
export class AsignaturasList {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly asignaturaService = inject(AsignaturaService);
  private readonly horarioService = inject(HorarioService);

  readonly cargado = this.asignaturaService.cargado;
  confirmOpen = false;
  hasSchedules = false;
  selected: Asignatura | null = null;
  error = '';

  constructor() {
    Promise.all([this.asignaturaService.cargar(true), this.horarioService.cargar(true)]).then(
      (resultados) => {
        const fallido = resultados.find((resultado) => !resultado.ok);
        if (fallido && !fallido.ok) {
          this.error = fallido.motivo;
          this.cdr.markForCheck();
        }
      },
    );
  }

  get items(): Asignatura[] {
    return this.asignaturaService.lista();
  }

  get dialogTitle(): string {
    return this.hasSchedules ? 'Asignatura con horarios' : 'Eliminar asignatura';
  }

  get dialogMessage(): string {
    return this.hasSchedules
      ? 'Esta asignatura tiene horarios asociados. Debe eliminarlos antes de continuar.'
      : '¿Estás seguro de que deseas eliminar esta asignatura? Esta acción no se puede deshacer.';
  }

  get dialogConfirmText(): string {
    return this.hasSchedules ? 'Entendido' : 'Eliminar';
  }

  nueva(): void {
    this.router.navigate(['/asignaturas/nueva']);
  }

  editar(item: Asignatura): void {
    this.router.navigate(['/asignaturas', item.id, 'editar']);
  }

  abrirEliminar(item: Asignatura): void {
    this.selected = item;
    this.hasSchedules = this.horarioService
      .lista()
      .some((horario) => horario.bloques.some((bloque) => bloque.asignaturaId === item.id));
    this.confirmOpen = true;
  }

  cancelar(): void {
    this.confirmOpen = false;
    this.selected = null;
  }

  async confirmar(): Promise<void> {
    const seleccionada = this.selected;
    const eliminar = seleccionada && !this.hasSchedules;
    this.cancelar();
    if (eliminar) {
      const resultado = await this.asignaturaService.eliminar(seleccionada.id);
      this.error = resultado.ok ? '' : resultado.motivo;
      this.cdr.markForCheck();
    }
  }
}
