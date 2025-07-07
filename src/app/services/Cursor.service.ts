import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CursorService {
  private cursor: HTMLElement | null = null;
  private cursorOutline: HTMLElement | null = null;

  public initCustomCursor() {
    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    // Create custom cursor elements
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor-dot';
    this.cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
      display: block;
    `;

    this.cursorOutline = document.createElement('div');
    this.cursorOutline.className = 'custom-cursor-outline';
    this.cursorOutline.style.cssText = `
      position: fixed;
      width: 30px;
      height: 30px;
      border: 2px solid #00ff88;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      display: block;
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorOutline);

    // Track mouse movement with requestAnimationFrame for smooth performance
    document.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() => {
        if (this.cursor && this.cursorOutline) {
          this.cursor.style.left = e.clientX + 'px';
          this.cursor.style.top = e.clientY + 'px';

          this.cursorOutline.style.left = e.clientX + 'px';
          this.cursorOutline.style.top = e.clientY + 'px';
        }
      });
    });

    // Add click effects
    document.addEventListener('mousedown', () => {
      if (this.cursorOutline) {
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(0.8)';
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.cursorOutline) {
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });

    // Handle hover on interactive elements
    const interactiveElements =
      'a, button, input, textarea, select, [role="button"]';
    document.addEventListener('mouseover', (e) => {
      if ((e.target as Element).matches(interactiveElements)) {
        this.setHoverState(true);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if ((e.target as Element).matches(interactiveElements)) {
        this.setHoverState(false);
      }
    });
  }

  private setHoverState(isHovering: boolean) {
    if (this.cursor && this.cursorOutline) {
      if (isHovering) {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        this.cursorOutline.style.borderColor = '#ff0080';
      } else {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursorOutline.style.borderColor = '#00ff88';
      }
    }
  }

  destroy() {
    this.cursor?.remove();
    this.cursorOutline?.remove();
    document.documentElement.style.cursor = 'auto';
  }
}
