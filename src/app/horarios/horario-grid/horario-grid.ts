import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { asignaturas, Asignatura, BloqueHorario, DIAS_SEMANA, Horario } from '../../data/sample-data';
import { HorarioService } from '../../data/horario.service';

@Component({
  selector: 'app-horario-grid',
  standalone: false,
  templateUrl: './horario-grid.html',
  styleUrls: ['./horario-grid.css'],
})
export class HorarioGrid {
  dias = DIAS_SEMANA;
  horas = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
  asignaturas = asignaturas;
  horario: Horario | null = null;
  alert = '';
  alertType: 'success' | 'error' = 'success';
  dragOver = '';
  trashOver = false;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly horarioService = inject(HorarioService);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.horario = this.horarioService.obtener(id) ?? null;
  }

  volver(): void {
    this.router.navigate(['/horarios']);
  }

  nombreAsignatura(id: number): string {
    return this.asignaturas.find((item) => item.id === id)?.nombre ?? 'Sin asignatura';
  }

  bloquesDe(asignaturaId: number): number {
    return this.horario?.bloques.filter((bloque) => bloque.asignaturaId === asignaturaId).length ?? 0;
  }

  sesionesRestantes(asignatura: Asignatura): number {
    return asignatura.sesionesSemana - this.bloquesDe(asignatura.id);
  }

  puedeAgregar(asignatura: Asignatura): boolean {
    return this.sesionesRestantes(asignatura) > 0;
  }

  horarioEn(dia: string, hora: string): BloqueHorario | undefined {
    return this.horario?.bloques.find((bloque) => bloque.diaSemana === dia && bloque.horaInicio === hora);
  }

  esBloqueado(hora: string): boolean {
    return hora === '12:00';
  }

  esFueraDeFranja(dia: string, hora: string): boolean {
    return dia === 'Sábado' && hora >= '13:00';
  }

  onDragStartSubject(event: DragEvent, asignatura: Asignatura): void {
    if (!this.puedeAgregar(asignatura)) {
      event.preventDefault();
      this.mostrarAlerta(
        'error',
        `La asignatura ${asignatura.nombre} ya alcanzó sus ${asignatura.sesionesSemana} sesiones semanales.`,
      );
      return;
    }
    event.dataTransfer?.setData('text/plain', `asignatura:${asignatura.id}`);
  }

  onDragStartBlock(event: DragEvent, bloque: BloqueHorario): void {
    event.dataTransfer?.setData('text/plain', `bloque:${bloque.id}`);
  }

  onDragOver(event: DragEvent, dia: string, hora: string): void {
    event.preventDefault();
    this.dragOver = `${dia}|${hora}`;
  }

  onDragLeave(): void {
    this.dragOver = '';
  }

  onDropCell(event: DragEvent, dia: string, hora: string): void {
    event.preventDefault();
    this.dragOver = '';
    if (this.esBloqueado(hora) || this.esFueraDeFranja(dia, hora)) {
      return;
    }
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    if (data.startsWith('asignatura:')) {
      const asignaturaId = Number(data.split(':')[1]);
      const asignatura = this.asignaturas.find((item) => item.id === asignaturaId);
      if (!asignatura || !this.horario) {
        return;
      }
      if (!this.puedeAgregar(asignatura)) {
        this.mostrarAlerta(
          'error',
          `La asignatura ${asignatura.nombre} ya alcanzó sus ${asignatura.sesionesSemana} sesiones semanales.`,
        );
        return;
      }
      this.horarioService.agregarBloque(this.horario.id, { asignaturaId, diaSemana: dia, horaInicio: hora });
      this.recargar();
      this.mostrarAlerta('success', `Bloque de ${asignatura.nombre} agregado.`);
    } else if (data.startsWith('bloque:')) {
      const bloqueId = Number(data.split(':')[1]);
      if (this.horario && bloqueId) {
        this.horarioService.moverBloque(this.horario.id, bloqueId, { diaSemana: dia, horaInicio: hora });
        this.recargar();
      }
    }
  }

  onTrashOver(event: DragEvent): void {
    event.preventDefault();
    this.trashOver = true;
  }

  onTrashLeave(): void {
    this.trashOver = false;
  }

  onDropTrash(event: DragEvent): void {
    event.preventDefault();
    this.trashOver = false;
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    if (data.startsWith('bloque:') && this.horario) {
      const bloqueId = Number(data.split(':')[1]);
      this.horarioService.eliminarBloque(this.horario.id, bloqueId);
      this.recargar();
      this.mostrarAlerta('success', 'Bloque eliminado.');
    }
  }

  eliminarBloque(bloque: BloqueHorario): void {
    if (this.horario) {
      this.horarioService.eliminarBloque(this.horario.id, bloque.id);
      this.recargar();
      this.mostrarAlerta('success', 'Bloque eliminado.');
    }
  }

  private recargar(): void {
    if (this.horario) {
      this.horario = this.horarioService.obtener(this.horario.id) ?? null;
    }
  }

  private mostrarAlerta(tipo: 'success' | 'error', mensaje: string): void {
    this.alertType = tipo;
    this.alert = mensaje;
  }
}
