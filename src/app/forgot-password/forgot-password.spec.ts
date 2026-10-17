import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ForgotPassword],
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
