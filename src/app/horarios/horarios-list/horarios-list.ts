import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Horario } from '../../data/modelos';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-horarios-list',
  standalone: false,
  templateUrl: './horarios-list.html',
})
export class HorariosList {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly horarioService = inject(HorarioService);

  readonly cargado = this.horarioService.cargado;
  confirmOpen = false;
  selected: Horario | null = null;
  error = '';

  constructor() {
    this.horarioService.cargar(true).then((resultado) => {
      if (!resultado.ok) {
        this.error = resultado.motivo;
        this.cdr.markForCheck();
      }
    });
  }

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

  async confirmar(): Promise<void> {
    const seleccionado = this.selected;
    this.cancelar();
    if (seleccionado) {
      const resultado = await this.horarioService.eliminar(seleccionado.id);
      this.error = resultado.ok ? '' : resultado.motivo;
      this.cdr.markForCheck();
    }
  }
}
