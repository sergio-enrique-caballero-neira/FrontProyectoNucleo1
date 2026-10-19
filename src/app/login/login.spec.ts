import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { Login } from './login';
import { ThemeToggle } from '../theme/theme-toggle/theme-toggle';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterModule.forRoot([])],
      declarations: [Login, ThemeToggle],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the login component', () => {
    const fixture = TestBed.createComponent(Login);
    const login = fixture.componentInstance;
    expect(login).toBeTruthy();
  });

  it('should render the login form', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form')).toBeTruthy();
  });
});
