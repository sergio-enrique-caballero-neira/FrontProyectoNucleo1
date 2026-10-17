import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Register } from './register';

describe('Register', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [Register],
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
