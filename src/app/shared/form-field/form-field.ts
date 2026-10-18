import { Component, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

let secuenciaCampo = 0;

@Component({
  selector: 'app-form-field',
  standalone: false,
  templateUrl: './form-field.html',
  styleUrls: ['./form-field.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppFormField {
  @Input() label = '';
  @Input() forId = '';
  @Input() help = '';
  @Input() error = '';

  readonly helpId = `app-field-help-${++secuenciaCampo}`;
  readonly errorId = `app-field-error-${secuenciaCampo}`;

  get describedBy(): string | null {
    if (this.error) {
      return this.errorId;
    }
    return this.help ? this.helpId : null;
  }
}
