import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

let secuenciaDialogo = 0;

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'],
})
export class AppConfirmDialog implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Eliminar';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogRef') set dialogRef(ref: ElementRef<HTMLElement> | undefined) {
    if (ref) {
      ref.nativeElement.focus();
    } else {
      this.restoreFocus();
    }
  }

  readonly tituloId = `app-dialog-title-${++secuenciaDialogo}`;
  readonly mensajeId = `app-dialog-message-${secuenciaDialogo}`;

  private readonly document = inject(DOCUMENT);
  private previousFocus: HTMLElement | null = null;

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelled.emit();
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) {
      return;
    }
    if (this.open) {
      this.previousFocus = this.document.activeElement as HTMLElement | null;
      this.document.addEventListener('keydown', this.onKeydown);
    } else {
      this.document.removeEventListener('keydown', this.onKeydown);
    }
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('keydown', this.onKeydown);
  }

  private restoreFocus(): void {
    this.previousFocus?.focus();
    this.previousFocus = null;
  }
}
