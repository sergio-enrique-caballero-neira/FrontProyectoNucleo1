import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  standalone: false,
  templateUrl: './alert-message.html',
  styleUrls: ['./alert-message.css'],
})
export class AppAlertMessage {
  @Input() type: 'success' | 'error' = 'success';
  @Input() message = '';
}
