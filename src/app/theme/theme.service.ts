import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'gestor-horarios-theme';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>('light');

  constructor() {
    this.theme.set(this.initialTheme());
    this.apply(this.theme());
    effect(() => this.apply(this.theme()));
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    try {
      this.storage()?.setItem(STORAGE_KEY, next);
    } catch {}
  }

  private initialTheme(): Theme {
    const stored = this.storedTheme();
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private storedTheme(): string | null {
    try {
      return this.storage()?.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private apply(theme: Theme): void {
    const root = this.document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}
