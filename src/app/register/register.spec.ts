import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Register } from './register';
import { ThemeToggle } from '../theme/theme-toggle/theme-toggle';

describe('Register', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([])],
      declarations: [Register, ThemeToggle],
    }).compileComponents();
  });

  it('should create the register component', () => {
    const fixture = TestBed.createComponent(Register);
    const register = fixture.componentInstance;
    expect(register).toBeTruthy();
  });

  it('should render the register form', () => {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
  });
});
