import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SecretCodeService {
  private konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  private currentSequence: string[] = [];
  private gameActive = false;
  private audio: HTMLAudioElement;

  public onSecretCode = new Subject<void>();

  constructor() {
    this.audio = new Audio('assets/secret.mp3');
    this.audio.load();
    this.audio.volume = 0.3;
    this.initializeListener();
  }

  private initializeListener() {
    window.addEventListener('keydown', (event) => {
      // Only process the secret code if the game is active
      if (!this.gameActive) {
        return;
      }

      this.currentSequence.push(event.key);

      // Keep only the last N keys where N is the length of the code
      if (this.currentSequence.length > this.konamiCode.length) {
        this.currentSequence.shift();
      }

      // Check if the sequence matches
      if (this.checkSequence()) {
        this.onSecretCode.next();
        this.currentSequence = [];
        this.triggerEasterEgg();
      }
    });
  }

  private checkSequence(): boolean {
    if (this.currentSequence.length !== this.konamiCode.length) {
      return false;
    }

    return this.currentSequence.every(
      (key, index) => key === this.konamiCode[index],
    );
  }

  private triggerEasterEgg() {
    // Add matrix rain effect
    this.createMatrixRain();

    // Play sound effect if available
    this.playSecretSound();

    // Show achievement notification
    this.showAchievement();
  }

  private createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const matrix = '01';
    const matrixArray = matrix.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text =
          matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    // Remove after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      canvas.remove();
    }, 5000);
  }

  private playSecretSound() {
    if (!this.audio) return;
    this.audio.currentTime = 0;
    this.audio.play().catch((err) => console.log('Audio play failed', err));
  }

  private showAchievement() {
    const achievement = document.createElement('div');
    achievement.style.cssText = `
      position: fixed;
      top: 20px;
      right: -400px;
      background: linear-gradient(135deg, #00ff88 0%, #00b894 50%, #00ff88 100%);
      color: #0a0a0a;
      padding: 20px 30px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 10px 40px rgba(0, 255, 136, 0.5);
      z-index: 10000;
      transition: right 0.5s ease-out;
    `;

    achievement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="font-size: 24px;">🎮</span>
        <div>
          <div style="font-size: 18px; margin-bottom: 5px;">Achievement Unlocked!</div>
          <div style="font-size: 14px; opacity: 0.8;">Konami Code Master</div>
        </div>
      </div>
    `;

    document.body.appendChild(achievement);

    // Slide in
    setTimeout(() => {
      achievement.style.right = '20px';
    }, 100);

    // Slide out and remove
    setTimeout(() => {
      achievement.style.right = '-400px';
      setTimeout(() => achievement.remove(), 500);
    }, 3000);
  }

  // Methods to control when the secret code is active
  setGameActive(active: boolean) {
    this.gameActive = active;
    if (!active) {
      this.currentSequence = []; // Clear sequence when game becomes inactive
    }
  }

  isGameActive(): boolean {
    return this.gameActive;
  }
}
