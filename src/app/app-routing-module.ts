import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AppShell } from './shell/app-shell';
import { AsignaturasList } from './asignaturas/asignaturas-list/asignaturas-list';
import { AsignaturaForm } from './asignaturas/asignatura-form/asignatura-form';
import { HorariosList } from './horarios/horarios-list/horarios-list';
import { HorarioGrid } from './horarios/horario-grid/horario-grid';
import { HorarioForm } from './horarios/horario-form/horario-form';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'recuperar', component: ForgotPassword },
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', redirectTo: 'asignaturas', pathMatch: 'full' },
      { path: 'asignaturas', component: AsignaturasList },
      { path: 'asignaturas/nueva', component: AsignaturaForm },
      { path: 'asignaturas/:id/editar', component: AsignaturaForm },
      { path: 'horarios', component: HorariosList },
      { path: 'horarios/nuevo', component: HorarioForm },
      { path: 'horarios/:id', component: HorarioGrid },
      { path: 'horarios/:id/editar', component: HorarioForm },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
