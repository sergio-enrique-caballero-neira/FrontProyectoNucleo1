import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.html',
  styleUrls: ['./empty-state.css'],
})
export class AppEmptyState {
  @Input() message = 'No hay registros para mostrar.';
}
