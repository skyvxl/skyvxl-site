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

    // Create custom cursor elements
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor-dot';
    this.cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transition: transform 0.1s;
      mix-blend-mode: difference;
    `;

    this.cursorOutline = document.createElement('div');
    this.cursorOutline.className = 'custom-cursor-outline';
    this.cursorOutline.style.cssText = `
      position: fixed;
      width: 30px;
      height: 30px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.1s;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorOutline);

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      if (this.cursor && this.cursorOutline) {
        this.cursor.style.left = e.clientX + 'px';
        this.cursor.style.top = e.clientY + 'px';

        this.cursorOutline.style.left = e.clientX + 'px';
        this.cursorOutline.style.top = e.clientY + 'px';
      }
    });

    // Add hover effects
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
        this.cursor.style.transform = 'scale(1.5)';
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        this.cursorOutline.style.borderColor = 'var(--secondary-color)';
      } else {
        this.cursor.style.transform = 'scale(1)';
        this.cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursorOutline.style.borderColor = 'var(--primary-color)';
      }
    }
  }

  destroy() {
    this.cursor?.remove();
    this.cursorOutline?.remove();
    document.documentElement.style.cursor = 'auto';
  }
}
