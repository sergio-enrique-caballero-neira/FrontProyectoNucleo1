import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.css'],
})
export class AppShell {
  private readonly auth = inject(AuthService);

  cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
