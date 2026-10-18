import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Horario } from '../../data/sample-data';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-horarios-list',
  standalone: false,
  templateUrl: './horarios-list.html',
})
export class HorariosList {
  private readonly router = inject(Router);
  private readonly horarioService = inject(HorarioService);

  confirmOpen = false;
  selected: Horario | null = null;

  get items(): Horario[] {
    return this.horarioService.lista();
  }

  nuevo(): void {
    this.router.navigate(['/horarios/nuevo']);
  }

  ver(id: number): void {
    this.router.navigate(['/horarios', id]);
  }

  editar(item: Horario): void {
    this.router.navigate(['/horarios', item.id, 'editar']);
  }

  abrirEliminar(item: Horario): void {
    this.selected = item;
    this.confirmOpen = true;
  }

  cancelar(): void {
    this.confirmOpen = false;
    this.selected = null;
  }

  confirmar(): void {
    if (this.selected) {
      this.horarioService.eliminar(this.selected.id);
    }
    this.cancelar();
  }
}
