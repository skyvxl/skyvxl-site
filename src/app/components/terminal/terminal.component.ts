import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Command {
  name: string;
  description: string;
  action: () => string | string[];
}

@Component({
  selector: 'app-terminal',
  imports: [FormsModule],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalComponent implements OnInit, AfterViewInit {
  @ViewChild('terminalBody') terminalBody!: ElementRef;
  @ViewChild('terminalInput') terminalInput!: ElementRef;

  currentCommand = '';
  currentDirectory = 'guest@portfolio:~';
  output: { text: string; isCommand: boolean }[] = [];
  commandHistory: string[] = [];
  historyIndex = -1;
  suggestions: string[] = [];

  private commands: { [key: string]: Command } = {
    help: {
      name: 'help',
      description: 'Show available commands',
      action: () => this.showHelp(),
    },
    about: {
      name: 'about',
      description: 'Learn about me',
      action: () => this.showAbout(),
    },
    skills: {
      name: 'skills',
      description: 'List my technical skills',
      action: () => this.showSkills(),
    },
    projects: {
      name: 'projects',
      description: 'Show my projects',
      action: () => this.showProjects(),
    },
    contact: {
      name: 'contact',
      description: 'Get my contact information',
      action: () => this.showContact(),
    },
    clear: {
      name: 'clear',
      description: 'Clear the terminal',
      action: () => this.clearTerminal(),
    },
    whoami: {
      name: 'whoami',
      description: 'Display current user',
      action: () => 'guest',
    },
    date: {
      name: 'date',
      description: 'Show current date and time',
      action: () => new Date().toString(),
    },
    echo: {
      name: 'echo',
      description: 'Echo a message',
      action: () => this.currentCommand.split(' ').slice(1).join(' '),
    },
    ls: {
      name: 'ls',
      description: 'List directory contents',
      action: () => [
        'about.txt',
        'skills.json',
        'projects/',
        'contact.md',
        'resume.pdf',
      ],
    },
    cat: {
      name: 'cat',
      description: 'Display file contents',
      action: () => this.catFile(),
    },
    pwd: {
      name: 'pwd',
      description: 'Print working directory',
      action: () => '/home/guest/portfolio',
    },
    matrix: {
      name: 'matrix',
      description: '???',
      action: () => this.enterMatrix(),
    },
    sudo: {
      name: 'sudo',
      description: 'Run as superuser',
      action: () => '❌ Permission denied. Nice try though! 😉',
    },
    coffee: {
      name: 'coffee',
      description: 'Brew some coffee',
      action: () => "☕ Brewing coffee... Done! Here's your virtual coffee!",
    },
    rm: {
      name: 'rm',
      description: 'Dangerously remove everything (…or not)',
      action: () => [
        '❌ Hah! Nice try, but you can\'t delete my code that easily!',
        '    Type "sudo rm -rf /" if you dare (but I won\'t let you)!',
      ],
    },
  };

  ngOnInit() {
    this.showWelcome();
  }

  ngAfterViewInit() {
    this.terminalInput.nativeElement.focus();
  }

  private showWelcome() {
    const welcomeMessage = [
      '',
      '██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ ',
      '██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗',
      '██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║',
      '██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║',
      '██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝',
      '╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ ',
      '',
      'Welcome to my interactive terminal portfolio!',
      'Type "help" to see available commands.',
      '',
    ];

    welcomeMessage.forEach((line, index) => {
      setTimeout(() => {
        this.output.push({ text: line, isCommand: false });
        this.scrollToBottom();
      }, index * 50);
    });
  }

  executeCommand() {
    const command = this.currentCommand.trim();
    if (!command) return;

    // Add command to output
    this.output.push({
      text: `${this.currentDirectory}$ ${command}`,
      isCommand: true,
    });

    // Add to history
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;

    // Parse and execute command
    const [cmd, ...args] = command.split(' ');
    const lowerCmd = cmd.toLowerCase();

    if (this.commands[lowerCmd]) {
      const result = this.commands[lowerCmd].action();
      if (Array.isArray(result)) {
        result.forEach((line) =>
          this.output.push({ text: line, isCommand: false })
        );
      } else {
        this.output.push({ text: result, isCommand: false });
      }
    } else {
      this.output.push({
        text: `Command not found: ${cmd}. Type "help" for available commands.`,
        isCommand: false,
      });
    }

    // Clear input and scroll
    this.currentCommand = '';
    this.suggestions = [];
    this.scrollToBottom();
  }

  autocomplete(event: Event) {
    event.preventDefault();
    const input = this.currentCommand.toLowerCase();

    if (!input) {
      this.suggestions = Object.keys(this.commands);
    } else {
      const matches = Object.keys(this.commands).filter((cmd) =>
        cmd.startsWith(input)
      );
      if (matches.length === 1) {
        this.currentCommand = matches[0];
        this.suggestions = [];
      } else if (matches.length > 1) {
        this.suggestions = matches;
      }
    }
  }

  navigateHistory(direction: number) {
    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;
    this.historyIndex = Math.max(
      0,
      Math.min(this.historyIndex, this.commandHistory.length)
    );

    if (this.historyIndex < this.commandHistory.length) {
      this.currentCommand = this.commandHistory[this.historyIndex];
    } else {
      this.currentCommand = '';
    }
  }

  private showHelp(): string[] {
    const helpText = ['Available commands:', ''];
    Object.values(this.commands).forEach((cmd) => {
      helpText.push(`  ${cmd.name.padEnd(12)} - ${cmd.description}`);
    });
    helpText.push(
      '',
      'Pro tip: Use TAB for autocomplete and ↑/↓ for command history'
    );
    return helpText;
  }

  private showAbout(): string[] {
    return [
      '',
      '👋 Hey! I’m Dmitry — professional bug whisperer, amateur snack enthusiast.',
      '',
      'I turn ☕ into TypeScript and “it works on my machine” into production miracles.',
      'The journey started with innocent curiosity and snowballed into nightly commits,',
      'single-line fixes that break five other things, and the occasional breakthrough 💡.',
      '',
      'When I’m AFK you’ll catch me speed-running the fridge,',
      'sleeping like it’s a competitive sport, or grinding XP in the latest game.',
      '🍔 + 😴 + 🎮 = the holy trinity of happiness.',
      '',
      'Got a crazy idea? Ping me and let’s build it, ship it,',
      'and then refactor it at 3 AM together. 🚀',
      '',
    ];
  }

  private showSkills(): string[] {
    return [
      '',
      '🛠️  Technical Skills:',
      '',
      'Languages:',
      '  → JavaScript/TypeScript (Advanced)',
      '  → C/C++ (Advanced)',
      '  → C# (Intermediate)',
      '  → Swift (Learning)',
      '',
      'Frontend:',
      '  → Angular, React, Vue.js',
      '  → Three.js, WebGL, Canvas API',
      '  → CSS3, Scss, Tailwind',
      '',
      'Backend:',
      '  → Node.js, Express',
      '  → REST APIs',
      '',
      'Database:',
      '  → PostgreSQL, MongoDB',
      '',
      'DevOps:',
      '  → Docker',
      '  → CI/CD, GitHub Actions',
      '  → DigitalOcean, AWS',
      '',
    ];
  }

  private showProjects(): string[] {
    return [
      '',
      '📁 Featured Projects:',
      '',
      '1. Portfolio Website',
      '   → Interactive 3D visualization of portfolio items',
      '   → Built with Three.js and Angular',
      '   → github.com/skyvxl/skyvxl-site',
      '',
      '2. React 3D Constructor',
      '   → A 3D constructor built with React and Three.js',
      '   → not publicly available',
      'Type "cat projects/[project-name]" for more details',
      '',
    ];
  }

  private showContact(): string[] {
    return [
      '',
      '📫 Get in Touch:',
      '',
      '  Email:    xynth@mail.ru',
      '  GitHub:   github.com/skyvxl',
      '',
      "💬 I'm always open to discussing new opportunities,",
      '   collaborations, or just chatting about tech!',
      '',
      '📍 Location: Earth, Solar System, Milky Way',
      '🕐 Timezone: UTC+3 (but I work across all timezones!)',
      '',
    ];
  }

  private clearTerminal(): string {
    this.output = [];
    return '';
  }

  private catFile(): string | string[] {
    const args = this.currentCommand.split(' ').slice(1);
    if (args.length === 0) {
      return 'cat: missing file operand';
    }

    const file = args[0];
    switch (file) {
      case 'about.txt':
        return this.showAbout();
      case 'contact.md':
        return this.showContact();
      case 'skills.json':
        return this.showSkills();
      case 'resume.pdf':
        return '📄 Opening resume.pdf... (This would download/open the actual file)';
      default:
        return `cat: ${file}: No such file or directory`;
    }
  }

  private enterMatrix(): string[] {
    const matrixArt = [
      '',
      '╔═══════════════════════════════════════╗',
      '║  You have entered the Matrix...       ║',
      '║                                       ║',
      '║  01001000 01100101 01101100 01101100  ║',
      '║  01101111 00100000 01001110 01100101  ║',
      '║  01101111                             ║',
      '║                                       ║',
      '║  🐇 Follow the white rabbit...        ║',
      '╚═══════════════════════════════════════╝',
      '',
    ];

    // Trigger matrix effect in parent component
    document.body.classList.add('matrix-mode');
    setTimeout(() => document.body.classList.remove('matrix-mode'), 5000);

    return matrixArt;
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.terminalBody.nativeElement.scrollTop =
        this.terminalBody.nativeElement.scrollHeight;
    }, 0);
  }
}
