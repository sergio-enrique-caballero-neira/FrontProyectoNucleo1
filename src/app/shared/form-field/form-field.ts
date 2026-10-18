import { Component, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

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
}
