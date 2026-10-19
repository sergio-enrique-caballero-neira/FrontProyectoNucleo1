import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Asignatura, BloqueHorario, DIAS_SEMANA, Horario } from '../../data/modelos';
import { AsignaturaService } from '../../data/asignatura.service';
import { HorarioService } from '../../data/horario.service';
import {
  bloquesSeSolapan,
  calcularHoraFin,
  DURACION_SESION_HORAS,
  esFilaAlmuerzo,
  esInicioValido,
  HORA_INICIO_MAXIMA,
  HORA_INICIO_MINIMA,
} from '../../data/reglas-horario';

@Component({
  selector: 'app-horario-grid',
  standalone: false,
  templateUrl: './horario-grid.html',
  styleUrls: ['./horario-grid.css'],
})
export class HorarioGrid implements OnDestroy {
  dias = DIAS_SEMANA;
  horas = Array.from({ length: 13 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
  readonly filasAlmuerzo = new Set(this.horas.filter(esFilaAlmuerzo));
  readonly celdasInvalidas = new Set(
    this.dias.flatMap((dia) =>
      this.horas.filter((hora) => !esInicioValido(dia, hora)).map((hora) => `${dia}|${hora}`),
    ),
  );
  readonly duracionSesion = DURACION_SESION_HORAS;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly horarioService = inject(HorarioService);
  private readonly asignaturaService = inject(AsignaturaService);
  private readonly cdr = inject(ChangeDetectorRef);

  get asignaturas(): Asignatura[] {
    return this.asignaturaService.lista();
  }

  readonly cargado = computed(
    () => this.horarioService.cargado() && this.asignaturaService.cargado(),
  );

  private readonly paramId = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly horario = computed<Horario | null>(() => {
    const id = Number(this.paramId()?.get('id'));
    return this.horarioService.lista().find((item) => item.id === id) ?? null;
  });

  readonly bloques = computed<BloqueHorario[]>(() => this.horario()?.bloques ?? []);

  readonly horasTotales = computed(() => this.bloques().length * DURACION_SESION_HORAS);

  readonly asignaturasEnHorario = computed(
    () => new Set(this.bloques().map((bloque) => bloque.asignaturaId)).size,
  );

  readonly celdaSeleccionada = signal('');

  alert = '';
  alertType: 'success' | 'error' = 'success';
  dragOver = '';
  invalidTarget = '';
  trashOver = false;
  confirmOpen = false;
  bloquePendiente: BloqueHorario | null = null;

  private alertTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      this.paramId();
      this.alert = '';
    });
    Promise.all([this.asignaturaService.cargar(), this.horarioService.cargar()]).then(
      (resultados) => {
        const error = resultados.find((resultado) => !resultado.ok);
        if (error && !error.ok) {
          this.mostrarAlerta('error', error.motivo);
        }
      },
    );
  }

  volver(): void {
    this.router.navigate(['/horarios']);
  }

  nombreAsignatura(id: number): string {
    return this.asignaturas.find((item) => item.id === id)?.nombre ?? 'Sin asignatura';
  }

  codigoAsignatura(id: number): string {
    return this.asignaturas.find((item) => item.id === id)?.codigo ?? '—';
  }

  tonoDe(id: number): number {
    const indice = this.asignaturas.findIndex((item) => item.id === id);
    return ((indice < 0 ? 0 : indice) % 6) + 1;
  }

  bloquesDe(asignaturaId: number): number {
    return this.bloques().filter((bloque) => bloque.asignaturaId === asignaturaId).length;
  }

  sesionesRestantes(asignatura: Asignatura): number {
    return asignatura.sesionesSemana - this.bloquesDe(asignatura.id);
  }

  puedeAgregar(asignatura: Asignatura): boolean {
    return this.sesionesRestantes(asignatura) > 0;
  }

  filaDesde(indice: number): number {
    return indice + 2;
  }

  indiceDeHora(hora: string): number {
    return this.horas.indexOf(hora);
  }

  columnaDe(dia: string): number {
    return this.dias.indexOf(dia) + 2;
  }

  onDragStartSubject(event: DragEvent, asignatura: Asignatura): void {
    if (!this.puedeAgregar(asignatura)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData('text/plain', `asignatura:${asignatura.id}`);
  }

  onDragStartBlock(event: DragEvent, bloque: BloqueHorario): void {
    event.dataTransfer?.setData('text/plain', `bloque:${bloque.id}`);
  }

  onDragOverCell(event: DragEvent, indiceHora: number, dia: string): void {
    event.preventDefault();
    const hora = this.horas[indiceHora];
    const clave = `${dia}|${hora}`;
    this.dragOver = clave;
    this.invalidTarget = this.celdasInvalidas.has(clave) ? clave : '';
  }

  onDragLeave(): void {
    this.dragOver = '';
    this.invalidTarget = '';
  }

  async onDropCell(event: DragEvent, indiceHora: number, dia: string): Promise<void> {
    event.preventDefault();
    const hora = this.horas[indiceHora];
    this.dragOver = '';
    this.invalidTarget = '';
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    const horario = this.horario();
    if (!horario || !data) {
      return;
    }
    if (data.startsWith('asignatura:')) {
      const asignaturaId = Number(data.split(':')[1]);
      const asignatura = this.asignaturas.find((item) => item.id === asignaturaId);
      if (!asignatura) {
        return;
      }
      const resultado = await this.horarioService.agregarBloque(horario.id, {
        asignaturaId,
        diaSemana: dia,
        horaInicio: hora,
      });
      if (resultado.ok) {
        this.mostrarAlerta('success', `${asignatura.nombre} agregada el ${dia} a las ${hora}.`);
      } else {
        this.mostrarAlerta('error', resultado.motivo);
      }
      return;
    }
    if (data.startsWith('bloque:')) {
      const bloqueId = Number(data.split(':')[1]);
      const resultado = await this.horarioService.moverBloque(horario.id, bloqueId, {
        diaSemana: dia,
        horaInicio: hora,
      });
      if (!resultado.ok) {
        this.mostrarAlerta('error', resultado.motivo);
        return;
      }
      const movido = this.bloques().find((bloque) => bloque.id === bloqueId);
      if (movido) {
        this.mostrarAlerta(
          'success',
          `${this.nombreAsignatura(movido.asignaturaId)} movida al ${dia} a las ${hora}.`,
        );
      }
    }
  }

  onDropTrash(event: DragEvent): void {
    event.preventDefault();
    this.trashOver = false;
    this.invalidTarget = '';
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    const horario = this.horario();
    if (data.startsWith('bloque:') && horario) {
      const bloqueId = Number(data.split(':')[1]);
      const bloque = this.bloques().find((item) => item.id === bloqueId);
      if (bloque) {
        this.bloquePendiente = bloque;
        this.confirmOpen = true;
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

  abrirEliminar(bloque: BloqueHorario): void {
    this.bloquePendiente = bloque;
    this.confirmOpen = true;
  }

  cancelarEliminar(): void {
    this.confirmOpen = false;
    this.bloquePendiente = null;
  }

  async confirmarEliminar(): Promise<void> {
    const horario = this.horario();
    const bloque = this.bloquePendiente;
    this.cancelarEliminar();
    if (horario && bloque) {
      const resultado = await this.horarioService.eliminarBloque(horario.id, bloque.id);
      if (resultado.ok) {
        this.mostrarAlerta(
          'success',
          `Bloque de ${this.nombreAsignatura(bloque.asignaturaId)} eliminado.`,
        );
      } else {
        this.mostrarAlerta('error', resultado.motivo);
      }
    }
  }

  seleccionar(bloque: BloqueHorario): void {
    this.celdaSeleccionada.set(`${bloque.diaSemana}|${bloque.horaInicio}`);
  }

  estaSeleccionado(bloque: BloqueHorario): boolean {
    return this.celdaSeleccionada() === `${bloque.diaSemana}|${bloque.horaInicio}`;
  }

  async onBloqueKeydown(event: KeyboardEvent, bloque: BloqueHorario): Promise<void> {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.abrirEliminar(bloque);
      return;
    }

    const paso = event.shiftKey ? DURACION_SESION_HORAS : 1;
    let indiceDia = this.dias.indexOf(bloque.diaSemana);
    let indiceHora = this.indiceDeHora(bloque.horaInicio);

    switch (event.key) {
      case 'ArrowUp':
        indiceHora -= paso;
        break;
      case 'ArrowDown':
        indiceHora += paso;
        break;
      case 'ArrowLeft':
        indiceDia -= 1;
        break;
      case 'ArrowRight':
        indiceDia += 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (
      indiceDia < 0 ||
      indiceDia >= this.dias.length ||
      indiceHora < 0 ||
      indiceHora >= this.horas.length
    ) {
      this.mostrarAlerta('error', 'No puedes mover el bloque fuera de la rejilla.');
      return;
    }

    const horario = this.horario();
    if (!horario) {
      return;
    }
    const resultado = await this.horarioService.moverBloque(horario.id, bloque.id, {
      diaSemana: this.dias[indiceDia],
      horaInicio: this.horas[indiceHora],
    });
    if (!resultado.ok) {
      this.mostrarAlerta('error', resultado.motivo);
      return;
    }
    const movido = this.bloques().find((item) => item.id === bloque.id);
    if (movido) {
      this.celdaSeleccionada.set(`${movido.diaSemana}|${movido.horaInicio}`);
      this.mostrarAlerta(
        'success',
        `${this.nombreAsignatura(movido.asignaturaId)} movida al ${movido.diaSemana} a las ${movido.horaInicio}.`,
      );
    }
  }

  async onChipKeydown(event: KeyboardEvent, asignatura: Asignatura): Promise<void> {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    const horario = this.horario();
    if (!horario) {
      return;
    }
    const destino = this.primerEspacioLibre();
    if (!destino) {
      this.mostrarAlerta('error', 'No hay un espacio libre válido en esta rejilla.');
      return;
    }
    const resultado = await this.horarioService.agregarBloque(horario.id, {
      asignaturaId: asignatura.id,
      diaSemana: destino.dia,
      horaInicio: destino.hora,
    });
    if (resultado.ok) {
      this.mostrarAlerta(
        'success',
        `${asignatura.nombre} agregada el ${destino.dia} a las ${destino.hora}.`,
      );
    } else {
      this.mostrarAlerta('error', resultado.motivo);
    }
  }

  private primerEspacioLibre(): { dia: string; hora: string } | null {
    for (const dia of this.dias) {
      for (const hora of this.horas) {
        if (!esInicioValido(dia, hora)) {
          continue;
        }
        const candidato: BloqueHorario = {
          id: 0,
          asignaturaId: 0,
          diaSemana: dia,
          horaInicio: hora,
          horaFin: calcularHoraFin(hora),
        };
        if (!this.bloques().some((bloque) => bloquesSeSolapan(bloque, candidato))) {
          return { dia, hora };
        }
      }
    }
    return null;
  }

  private mostrarAlerta(tipo: 'success' | 'error', mensaje: string): void {
    this.alertType = tipo;
    this.alert = mensaje;
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => {
      this.alert = '';
      this.cdr.markForCheck();
    }, 4000);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    clearTimeout(this.alertTimer);
  }

  get franjaResumen(): string {
    return `${HORA_INICIO_MINIMA} a ${HORA_INICIO_MAXIMA} · ${this.duracionSesion} h por sesión`;
  }
}
