import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AppShell } from './shell/app-shell';
import { ThemeToggle } from './theme/theme-toggle/theme-toggle';
import { AppButton } from './shared/app-button/app-button';
import { AppFormField } from './shared/form-field/form-field';
import { AppDataTable } from './shared/data-table/data-table';
import { AppConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { AppAlertMessage } from './shared/alert-message/alert-message';
import { AppEmptyState } from './shared/empty-state/empty-state';
import { AsignaturasList } from './asignaturas/asignaturas-list/asignaturas-list';
import { AsignaturaForm } from './asignaturas/asignatura-form/asignatura-form';
import { HorariosList } from './horarios/horarios-list/horarios-list';
import { HorarioGrid } from './horarios/horario-grid/horario-grid';
import { HorarioForm } from './horarios/horario-form/horario-form';

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    ForgotPassword,
    AppShell,
    ThemeToggle,
    AppButton,
    AppFormField,
    AppDataTable,
    AppConfirmDialog,
    AppAlertMessage,
    AppEmptyState,
    AsignaturasList,
    AsignaturaForm,
    HorariosList,
    HorarioGrid,
    HorarioForm,
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
