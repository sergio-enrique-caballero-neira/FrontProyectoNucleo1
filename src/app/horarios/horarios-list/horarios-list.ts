import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { asignaturas, Asignatura, DIAS_SEMANA, horarios, Horario } from '../../data/sample-data';

@Component({
  selector: 'app-horarios-list',
  standalone: false,
  templateUrl: './horarios-list.html',
  styleUrls: ['./horarios-list.css'],
})
export class HorariosList {
  view: 'grid' | 'list' = 'grid';
  dias = DIAS_SEMANA;
  horas = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
  asignaturas = asignaturas;
  horarios: Horario[] = [...horarios];
  filtro = '';
  confirmOpen = false;
  selected: Horario | null = null;
  dragOver = '';
  private nextId = 6;

  constructor(private readonly router: Router) {}

  get asignaturasFiltradas(): Asignatura[] {
    if (!this.filtro) {
      return this.asignaturas;
    }
    return this.asignaturas.filter((item) => item.id === Number(this.filtro));
  }

  get horariosFiltrados(): Horario[] {
    if (!this.filtro) {
      return this.horarios;
    }
    return this.horarios.filter((item) => item.asignaturaId === Number(this.filtro));
  }

  nombreAsignatura(id: number): string {
    return this.asignaturas.find((item) => item.id === id)?.nombre ?? 'Sin asignatura';
  }

  horarioEn(dia: string, hora: string): Horario | undefined {
    return this.horarios.find((item) => item.diaSemana === dia && item.horaInicio === hora);
  }

  esBloqueado(hora: string): boolean {
    return hora === '12:00';
  }

  esFueraDeFranja(dia: string, hora: string): boolean {
    return dia === 'Sábado' && hora >= '13:00';
  }

  nuevo(): void {
    this.router.navigate(['/horarios/nuevo']);
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
      this.horarios = this.horarios.filter((item) => item.id !== this.selected?.id);
    }
    this.cancelar();
  }

  onDragStart(event: DragEvent, id: number): void {
    event.dataTransfer?.setData('text/plain', String(id));
  }

  onDragOver(event: DragEvent, dia: string, hora: string): void {
    event.preventDefault();
    this.dragOver = `${dia}|${hora}`;
  }

  onDragLeave(): void {
    this.dragOver = '';
  }

  onDrop(event: DragEvent, dia: string, hora: string): void {
    event.preventDefault();
    this.dragOver = '';
    const id = Number(event.dataTransfer?.getData('text/plain'));
    if (!id || this.esBloqueado(hora) || this.esFueraDeFranja(dia, hora)) {
      return;
    }
    this.horarios = [
      ...this.horarios,
      {
        id: this.nextId++,
        asignaturaId: id,
        diaSemana: dia,
        horaInicio: hora,
        horaFin: this.sumarHoras(hora, 2),
      },
    ];
  }

  sumarHoras(hora: string, horas: number): string {
    const [h] = hora.split(':').map(Number);
    return `${String((h + horas) % 24).padStart(2, '0')}:00`;
  }
}
