import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForgotPassword } from './forgot-password';
import { ThemeToggle } from '../theme/theme-toggle/theme-toggle';

describe('ForgotPassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([])],
      declarations: [ForgotPassword, ThemeToggle],
    }).compileComponents();
  });

  it('should create the forgot password component', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    const forgotPassword = fixture.componentInstance;
    expect(forgotPassword).toBeTruthy();
  });

  it('should render the forgot password form', () => {
    const fixture = TestBed.createComponent(ForgotPassword);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
  });
});
