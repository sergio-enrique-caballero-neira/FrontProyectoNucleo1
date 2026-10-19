import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['../auth.css'],
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  form = { usuario: '', contrasena: '' };
  error =
    inject(ActivatedRoute).snapshot.queryParamMap.get('sesion') === 'expirada'
      ? 'Tu sesión expiró. Inicia sesión de nuevo.'
      : '';
  cargando = false;

  async iniciarSesion(): Promise<void> {
    if (this.cargando) {
      return;
    }
    const usuario = this.form.usuario.trim();
    if (!usuario || !this.form.contrasena) {
      this.error = 'Ingresa tu usuario y contraseña.';
      return;
    }
    this.error = '';
    this.cargando = true;
    const resultado = await this.auth.iniciarSesion(usuario, this.form.contrasena);
    this.cargando = false;
    if (resultado.ok) {
      this.router.navigate(['/asignaturas']);
    } else {
      this.error = resultado.motivo;
      this.form.contrasena = '';
    }
    this.cdr.markForCheck();
  }
}
