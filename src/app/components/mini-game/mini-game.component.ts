import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { SecretCodeService } from '../../services/SecretCode.service';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  color?: string;
}

@Component({
  selector: 'app-mini-game',
  imports: [],
  templateUrl: './mini-game.component.html',
  styleUrl: './mini-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniGameComponent implements OnInit, OnDestroy {
  private secretCodeService = inject(SecretCodeService);

  score = 0;
  lives = 3;
  level = 1;
  gameRunning = false;
  gameOver = false;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;

  // Game objects
  private player: GameObject = { x: 375, y: 500, width: 50, height: 30 };
  private enemies: GameObject[] = [];
  private bullets: GameObject[] = [];
  private particles: GameObject[] = [];

  // Game state
  private keys: Record<string, boolean> = {};
  private lastShot = 0;
  private enemyDirection = 1;

  ngOnInit() {
    this.setupCanvas();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.gameRunning) {
      this.keys[event.key] = true;

      // Prevent default behavior for game controls
      if (
        event.key === ' ' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight'
      ) {
        event.preventDefault();
      }

      if (event.key === ' ') {
        this.shoot();
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.gameRunning) {
      this.keys[event.key] = false;
    }
  }

  private setupCanvas() {
    // Canvas setup will be done after view init
    setTimeout(() => {
      this.canvas = document.querySelector('.game-canvas') as HTMLCanvasElement;
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d')!;
        this.canvas.width = 800;
        this.canvas.height = 600;
      }
    }, 0);
  }

  startGame() {
    this.gameRunning = true;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];

    // Enable secret code when game starts
    this.secretCodeService.setGameActive(true);

    this.createEnemies();
    this.gameLoop();
  }

  toggleGame() {
    if (this.gameRunning) {
      this.pauseGame();
    } else if (!this.gameOver) {
      this.resumeGame();
    }
  }

  pauseGame() {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Disable secret code when game is paused
    this.secretCodeService.setGameActive(false);
  }

  resumeGame() {
    this.gameRunning = true;
    this.gameLoop();
    // Re-enable secret code when game resumes
    this.secretCodeService.setGameActive(true);
  }

  stopGame() {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Disable secret code when game stops
    this.secretCodeService.setGameActive(false);
  }

  resetGame() {
    this.stopGame();
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.player.x = 375;
  }

  private createEnemies() {
    const rows = 4 + Math.floor(this.level / 2);
    const cols = 8;
    const spacing = 60;
    const startX = 100;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.enemies.push({
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: 40,
          height: 30,
          speed: 0.5 + this.level * 0.1,
          color: row === 0 ? '#ff0080' : row === 1 ? '#ff8800' : '#00ff88',
        });
      }
    }
  }

  private gameLoop() {
    if (!this.gameRunning) return;

    this.animationId = requestAnimationFrame(() => this.gameLoop());

    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw game objects
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
    this.updateParticles();

    this.drawPlayer();
    this.drawEnemies();
    this.drawBullets();
    this.drawParticles();

    // Check win condition
    if (this.enemies.length === 0) {
      this.level++;
      this.createEnemies();
    }
  }

  private updatePlayer() {
    if (this.keys['ArrowLeft'] && this.player.x > 0) {
      this.player.x -= 5;
    }
    if (
      this.keys['ArrowRight'] &&
      this.player.x < this.canvas.width - this.player.width
    ) {
      this.player.x += 5;
    }
  }

  private updateEnemies() {
    let shouldDrop = false;

    // Check if any enemy hit the edge
    for (const enemy of this.enemies) {
      enemy.x += this.enemyDirection * enemy.speed!;

      if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
        shouldDrop = true;
      }

      // Check if enemy reached player
      if (enemy.y + enemy.height >= this.player.y) {
        this.gameOver = true;
        this.gameRunning = false;
        this.secretCodeService.setGameActive(false);
      }
    }

    // Drop enemies down if they hit the edge
    if (shouldDrop) {
      this.enemyDirection *= -1;
      for (const enemy of this.enemies) {
        enemy.y += 20;
      }
    }

    // Random enemy shooting
    if (Math.random() < 0.01 * this.level && this.enemies.length > 0) {
      const shooter =
        this.enemies[Math.floor(Math.random() * this.enemies.length)];
      this.enemyShoot(shooter);
    }
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.y += bullet.speed!;

      // Remove bullets that go off screen
      if (bullet.y < 0 || bullet.y > this.canvas.height) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check collision with enemies (player bullets)
      if (bullet.speed! < 0) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (this.checkCollision(bullet, enemy)) {
            // Create explosion particles
            this.createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              enemy.color!,
            );

            this.enemies.splice(j, 1);
            this.bullets.splice(i, 1);
            this.score += 10 * this.level;
            break;
          }
        }
      }

      // Check collision with player (enemy bullets)
      if (bullet.speed! > 0 && this.checkCollision(bullet, this.player)) {
        this.bullets.splice(i, 1);
        this.lives--;
        this.createExplosion(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2,
          '#ff0000',
        );

        if (this.lives <= 0) {
          this.gameOver = true;
          this.gameRunning = false;
          this.secretCodeService.setGameActive(false);
        }
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.speed! * Math.cos(particle.width);
      particle.y += particle.speed! * Math.sin(particle.width);
      particle.height *= 0.95; // Use height as opacity

      if (particle.height < 0.01) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawPlayer() {
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
    );

    // Draw player details
    this.ctx.fillRect(this.player.x + 20, this.player.y - 10, 10, 10);
    this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 30, 10);
  }

  private drawEnemies() {
    for (const enemy of this.enemies) {
      this.ctx.fillStyle = enemy.color!;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Draw bug-like features
      this.ctx.fillRect(enemy.x - 5, enemy.y + 5, 5, 20);
      this.ctx.fillRect(enemy.x + enemy.width, enemy.y + 5, 5, 20);
      this.ctx.fillRect(enemy.x + 10, enemy.y + 10, 5, 5);
      this.ctx.fillRect(enemy.x + 25, enemy.y + 10, 5, 5);
    }
  }

  private drawBullets() {
    for (const bullet of this.bullets) {
      this.ctx.fillStyle = bullet.speed! < 0 ? '#00ff88' : '#ff0080';
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      // Add glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = bullet.speed! < 0 ? '#00ff88' : '#ff0080';
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      this.ctx.shadowBlur = 0;
    }
  }

  private drawParticles() {
    for (const particle of this.particles) {
      this.ctx.fillStyle =
        particle.color +
        Math.floor(particle.height * 255)
          .toString(16)
          .padStart(2, '0');
      this.ctx.fillRect(particle.x, particle.y, 3, 3);
    }
  }

  private shoot() {
    if (!this.gameRunning || Date.now() - this.lastShot < 300) return;

    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y,
      width: 4,
      height: 10,
      speed: -8,
    });

    this.lastShot = Date.now();
  }

  private enemyShoot(enemy: GameObject) {
    this.bullets.push({
      x: enemy.x + enemy.width / 2 - 2,
      y: enemy.y + enemy.height,
      width: 4,
      height: 10,
      speed: 3,
    });
  }

  private checkCollision(a: GameObject, b: GameObject): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        width: Math.random() * Math.PI * 2, // angle
        height: 1, // opacity
        speed: Math.random() * 3 + 1,
        color: color,
      });
    }
  }
}
