import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { AppShell } from './shell/app-shell';
import { AsignaturasList } from './asignaturas/asignaturas-list/asignaturas-list';
import { AsignaturaForm } from './asignaturas/asignatura-form/asignatura-form';
import { HorariosList } from './horarios/horarios-list/horarios-list';
import { HorarioGrid } from './horarios/horario-grid/horario-grid';
import { HorarioForm } from './horarios/horario-form/horario-form';
import { authGuard, invitadoGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
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
