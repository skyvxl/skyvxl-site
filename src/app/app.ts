import { Component, HostListener, OnInit } from '@angular/core';
import { TerminalComponent } from './components/terminal/terminal.component';
import { ThemeService } from './services/Theme.service';
import { SecretCodeService } from './services/SecretCode.service';
import { ThreeSceneComponent } from './components/three-scene/three-scene.component';
import { SkillsMapComponent } from './components/skills-map/skills-map.component';
import { MiniGameComponent } from './components/mini-game/mini-game.component';
import { SocialLinksComponent } from './components/social-links/social-links.component';
import { GlitchTextComponent } from './components/glitch-text/glitch-text.component';
import { CursorService } from './services/Cursor.service';

@Component({
  selector: 'app-root',
  imports: [
    TerminalComponent,
    ThreeSceneComponent,
    SkillsMapComponent,
    MiniGameComponent,
    SocialLinksComponent,
    GlitchTextComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  isDarkTheme = true;
  isMatrixMode = false;
  showEasterEgg = false;
  isLoading = true;
  loadingProgress = 0;

  cursorX = 0;
  cursorY = 0;

  typedText = '';
  currentAsciiArt = '';

  projects = [
    {
      title: 'Portfolio Website',
      description: 'Interactive visualization of portfolio items',
      image: 'assets/project1.jpg',
      tech: ['Three.js', 'Angular', 'TypeScript'],
      link: 'github.com/skyvxl/skyvxl-site',
    },
    {
      title: 'React 3D Constructor',
      description: 'A 3D constructor built with React and Three.js',
      image: 'assets/project2.jpg',
      tech: ['React', 'Three.js', 'TypeScript'],
      link: '',
    },
  ];

  private typingTexts = [
    'Full Stack Developer',
    'Coffee-Powered Lifeform',
    'Debugger of the Universe',
    'Will Code for Snacks 🍪',
    'Professional Keyboard Smasher',
  ];

  private asciiArts = [
    `
     _____ _____ _____ _____
    |     |     |  _  |   __|
    |   --|  |  |     |   __|
    |_____|_____|_____|_____|
    `,
    `
     _____  _____ _____  _____
    |  |  ||  _  |     ||  |  |
    |     ||     |   --||    -|
    |__|__||__|__|_____||__|__|
    `,
    `
     _____ _____ _____  _____
    |  _  |   __|     ||     |
    |     |__   |   --||  |  |
    |__|__|_____|_____||_____|
    `,
  ];

  constructor(
    private themeService: ThemeService,
    private secretCodeService: SecretCodeService
  ) {}

  ngOnInit() {
    this.initializeApp();
    this.startTypingAnimation();
    this.startAsciiAnimation();

    // Subscribe to secret code detection
    this.secretCodeService.onSecretCode.subscribe(() => {
      this.showEasterEgg = true;
      this.isMatrixMode = true;
      setTimeout(() => (this.isMatrixMode = false), 5000);
    });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
  }

  private initializeApp() {
    // Simulate loading
    const interval = setInterval(() => {
      this.loadingProgress += Math.random() * 20;
      if (this.loadingProgress >= 100) {
        this.loadingProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    }, 200);

    // Set theme based on time
    const hour = new Date().getHours();
    this.isDarkTheme = hour < 6 || hour >= 18;
    this.themeService.setTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  private startTypingAnimation() {
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentText = this.typingTexts[textIndex];

      if (!isDeleting) {
        this.typedText = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
          isDeleting = true;
          setTimeout(type, 2000);
          return;
        }
      } else {
        this.typedText = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % this.typingTexts.length;
        }
      }

      setTimeout(type, isDeleting ? 50 : 150);
    };

    type();
  }

  private startAsciiAnimation() {
    let index = 0;
    setInterval(() => {
      this.currentAsciiArt = this.asciiArts[index];
      index = (index + 1) % this.asciiArts.length;
    }, 3000);
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.setTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openProject(project: any) {
    window.open(project.link, '_blank');
  }
}
