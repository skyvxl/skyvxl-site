import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-glitch-text',
  imports: [],
  templateUrl: './glitch-text.component.html',
  styleUrl: './glitch-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlitchTextComponent implements OnInit, OnDestroy {
  @Input() text: string = '';
  @Input() scramble: boolean = false;
  @Input() variant: 'default' | 'error' | 'success' = 'default';

  displayText: string = '';
  private scrambleInterval?: number;
  private scrambleChars = '!<>-_\\/[]{}—=+*^?#________';

  ngOnInit() {
    if (this.scramble) {
      this.startScrambleAnimation();
    } else {
      this.displayText = this.text;
    }
  }

  ngOnDestroy() {
    if (this.scrambleInterval) {
      clearInterval(this.scrambleInterval);
    }
  }

  private startScrambleAnimation() {
    let iteration = 0;
    const originalText = this.text;

    this.scrambleInterval = window.setInterval(() => {
      this.displayText = originalText
        .split('')
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return this.scrambleChars[
            Math.floor(Math.random() * this.scrambleChars.length)
          ];
        })
        .join('');

      if (iteration >= originalText.length) {
        if (this.scrambleInterval) {
          clearInterval(this.scrambleInterval);
        }
      }

      iteration += 1 / 3;
    }, 30);
  }
}
