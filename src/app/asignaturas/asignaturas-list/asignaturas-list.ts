import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { asignaturas, Asignatura } from '../../data/sample-data';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-asignaturas-list',
  standalone: false,
  templateUrl: './asignaturas-list.html',
  styleUrls: ['./asignaturas-list.css'],
})
export class AsignaturasList {
  private readonly router = inject(Router);
  private readonly horarioService = inject(HorarioService);

  items: Asignatura[] = [...asignaturas];
  confirmOpen = false;
  hasSchedules = false;
  selected: Asignatura | null = null;

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

  confirmar(): void {
    if (this.selected && !this.hasSchedules) {
      this.items = this.items.filter((item) => item.id !== this.selected?.id);
    }
    this.cancelar();
  }
}
