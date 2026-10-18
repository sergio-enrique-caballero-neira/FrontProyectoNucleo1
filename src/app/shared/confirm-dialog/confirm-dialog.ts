import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

let secuenciaDialogo = 0;

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
})
export class AppConfirmDialog implements OnDestroy {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Eliminar';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogRef') dialogRef?: ElementRef<HTMLElement>;

  readonly tituloId = `app-dialog-title-${++secuenciaDialogo}`;
  readonly mensajeId = `app-dialog-message-${secuenciaDialogo}`;

  private readonly document = inject(DOCUMENT);
  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelled.emit();
    }
  };

  ngOnDestroy(): void {
    this.document.removeEventListener('keydown', this.onKeydown);
  }
}
