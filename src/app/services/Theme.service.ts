import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light' | 'cyberpunk' | 'matrix';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>('dark');
  theme$ = this.currentTheme.asObservable();

  constructor() {
    // Check for saved theme preference or default to 'dark'
    const savedTheme = localStorage.getItem('preferred-theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Set theme based on time of day
      const hour = new Date().getHours();
      this.setTheme(hour >= 6 && hour < 18 ? 'light' : 'dark');
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme.next(theme);
    localStorage.setItem('preferred-theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;

    switch (theme) {
      case 'light':
        root.style.setProperty('--primary-color', '#0088ff');
        root.style.setProperty('--secondary-color', '#ff0080');
        root.style.setProperty('--bg-dark', '#f0f0f0');
        root.style.setProperty('--bg-light', '#ffffff');
        root.style.setProperty('--text-primary', '#1a1a1a');
        root.style.setProperty('--text-secondary', '#666666');
        break;

      case 'cyberpunk':
        root.style.setProperty('--primary-color', '#ff00ff');
        root.style.setProperty('--secondary-color', '#00ffff');
        root.style.setProperty('--bg-dark', '#1a0033');
        root.style.setProperty('--bg-light', '#330066');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#cc99ff');
        break;

      case 'matrix':
        root.style.setProperty('--primary-color', '#00ff00');
        root.style.setProperty('--secondary-color', '#008800');
        root.style.setProperty('--bg-dark', '#000000');
        root.style.setProperty('--bg-light', '#001100');
        root.style.setProperty('--text-primary', '#00ff00');
        root.style.setProperty('--text-secondary', '#008800');
        break;

      default: // dark
        root.style.setProperty('--primary-color', '#00ff88');
        root.style.setProperty('--secondary-color', '#ff0080');
        root.style.setProperty('--bg-dark', '#0a0a0a');
        root.style.setProperty('--bg-light', '#1a1a1a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#888888');
    }
  }

  getTheme(): Theme {
    return this.currentTheme.value;
  }

  toggleTheme() {
    const themes: Theme[] = ['dark', 'light', 'cyberpunk', 'matrix'];
    const currentIndex = themes.indexOf(this.currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
}
