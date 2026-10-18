import { Component, inject } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: false,
  templateUrl: './theme-toggle.html',
  styleUrls: ['./theme-toggle.css'],
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggle(): void {
    this.themeService.toggle();
  }
}
