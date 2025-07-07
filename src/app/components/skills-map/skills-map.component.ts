import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

interface Skill {
  name: string;
  level: number;
  category: string;
  x?: number;
  y?: number;
  connections?: string[];
  description?: string;
}

@Component({
  selector: 'app-skills-map',
  imports: [],
  templateUrl: './skills-map.component.html',
  styleUrl: './skills-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsMapComponent implements OnInit, AfterViewInit {
  @ViewChild('skillsCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private cdr: ChangeDetectorRef) {}

  skills: Skill[] = [
    // Frontend
    {
      name: 'Angular',
      level: 40,
      category: 'Frontend',
      connections: ['TypeScript', 'RxJS'],
      description: 'Angular framework',
    },
    {
      name: 'React',
      level: 50,
      category: 'Frontend',
      connections: ['TypeScript', 'Redux'],
      description: 'React ecosystem',
    },
    {
      name: 'Vue.js',
      level: 50,
      category: 'Frontend',
      connections: ['TypeScript'],
      description: 'Vue.js development',
    },
    {
      name: 'TypeScript',
      level: 60,
      category: 'Frontend',
      connections: ['JavaScript'],
      description: 'TypeScript skills',
    },
    {
      name: 'Three.js',
      level: 30,
      category: 'Frontend',
      connections: ['JavaScript'],
      description: '3D graphics and animations',
    },
    {
      name: 'CSS/Sass',
      level: 70,
      category: 'Frontend',
      connections: [],
      description: 'Advanced styling and animations',
    },

    // Backend
    {
      name: 'Node.js',
      level: 70,
      category: 'Backend',
      connections: ['Express', 'NestJS'],
      description: 'Server-side JavaScript',
    },
    {
      name: 'Express',
      level: 70,
      category: 'Backend',
      connections: ['Node.js'],
      description: 'RESTful API development',
    },
    {
      name: 'C/C++',
      level: 60,
      category: 'Backend',
      connections: [],
      description: 'Systems programming and performance',
    },

    // Database
    {
      name: 'PostgreSQL',
      level: 40,
      category: 'Database',
      connections: [],
      description: 'Relational database expert',
    },
    {
      name: 'MongoDB',
      level: 70,
      category: 'Database',
      connections: [],
      description: 'NoSQL database design',
    },

    // DevOps
    {
      name: 'Docker',
      level: 40,
      category: 'DevOps',
      connections: [],
      description: 'Containerization',
    },
    {
      name: 'CI/CD',
      level: 50,
      category: 'DevOps',
      connections: [],
      description: 'Automated deployment pipelines',
    },
    {
      name: 'DigitalOcean',
      level: 40,
      category: 'DevOps',
      connections: [],
      description: 'Cloud infrastructure on DigitalOcean',
    },

    // Other
    {
      name: 'Git',
      level: 80,
      category: 'Tools',
      connections: [],
      description: 'Version control mastery',
    },
    {
      name: 'Linux',
      level: 70,
      category: 'Tools',
      connections: [],
      description: 'Linux system administration',
    },
  ];

  filteredSkills: Skill[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';
  hoveredSkill: Skill | null = null;
  tooltipX = 0;
  tooltipY = 0;

  private ctx!: CanvasRenderingContext2D;
  private animationFrame!: number;
  isDragging = false;
  draggedSkill: Skill | null = null;
  private dragOffset = { x: 0, y: 0 };
  private rafId: number | null = null;

  get totalSkills(): number {
    return this.filteredSkills.length;
  }

  get averageLevel(): number {
    if (this.filteredSkills.length === 0) return 0;
    const sum = this.filteredSkills.reduce(
      (acc, skill) => acc + skill.level,
      0
    );
    return Math.round(sum / this.filteredSkills.length);
  }

  ngOnInit() {
    // Extract unique categories
    const uniqueCategories = new Set(this.skills.map((s) => s.category));
    this.categories = ['All', ...Array.from(uniqueCategories)];

    // Position skills in a network layout
    this.positionSkills();

    // Show all skills initially
    this.filterByCategory('All');
  }

  ngAfterViewInit() {
    this.setupCanvas();
    this.animate();
    this.setupDragListeners();
  }

  private positionSkills() {
    const centerX = 600;
    const centerY = 300;
    const radius = 200;

    // Group skills by category
    const categoryGroups = this.groupByCategory();
    let angleOffset = 0;

    Object.entries(categoryGroups).forEach(([category, skills], groupIndex) => {
      const angleStep = (Math.PI * 2) / Object.keys(categoryGroups).length;
      const groupAngle = angleStep * groupIndex;

      skills.forEach((skill, index) => {
        const angle = groupAngle + index * 0.3;
        const r = radius + (Math.random() - 0.5) * 100;

        skill.x = centerX + Math.cos(angle) * r;
        skill.y = centerY + Math.sin(angle) * r;
      });
    });
  }

  private groupByCategory(): { [key: string]: Skill[] } {
    return this.skills.reduce((groups, skill) => {
      const category = skill.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
      return groups;
    }, {} as { [key: string]: Skill[] });
  }

  private setupCanvas() {
    const canvas = this.canvas.nativeElement;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx = canvas.getContext('2d')!;
  }

  private animate() {
    this.animationFrame = requestAnimationFrame(() => this.animate());

    // Clear canvas
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    // Draw connections
    this.drawConnections();
  }

  private drawConnections() {
    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    this.ctx.lineWidth = 1;

    this.filteredSkills.forEach((skill) => {
      if (skill.connections && skill.x && skill.y) {
        skill.connections.forEach((targetName) => {
          const target = this.filteredSkills.find((s) => s.name === targetName);
          if (target && target.x && target.y) {
            this.ctx.beginPath();
            this.ctx.moveTo(skill.x!, skill.y!);

            // Create smooth curved connection with consistent offset
            const midX = (skill.x! + target.x!) / 2;
            const midY = (skill.y! + target.y!) / 2;
            const distance = Math.sqrt(
              Math.pow(target.x! - skill.x!, 2) + Math.pow(target.y! - skill.y!, 2)
            );
            const curve = Math.min(distance * 0.2, 50);

            this.ctx.quadraticCurveTo(
              midX,
              midY - curve,
              target.x,
              target.y
            );

            this.ctx.stroke();
          }
        });
      }
    });

    // Draw highlighted connections
    if (this.hoveredSkill && this.hoveredSkill.connections) {
      this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#00ff88';

      this.hoveredSkill.connections.forEach((targetName) => {
        const target = this.filteredSkills.find((s) => s.name === targetName);
        if (
          target &&
          target.x &&
          target.y &&
          this.hoveredSkill!.x &&
          this.hoveredSkill!.y
        ) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.hoveredSkill!.x, this.hoveredSkill!.y);

          const midX = (this.hoveredSkill!.x + target.x) / 2;
          const midY = (this.hoveredSkill!.y + target.y) / 2;
          const distance = Math.sqrt(
            Math.pow(target.x - this.hoveredSkill!.x, 2) + Math.pow(target.y - this.hoveredSkill!.y, 2)
          );
          const curve = Math.min(distance * 0.2, 50);

          this.ctx.quadraticCurveTo(
            midX,
            midY - curve,
            target.x,
            target.y
          );

          this.ctx.stroke();
        }
      });

      this.ctx.shadowBlur = 0;
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredSkills = [...this.skills];
    } else {
      this.filteredSkills = this.skills.filter((s) => s.category === category);
    }
  }

  onSkillHover(skill: Skill) {
    if (!this.isDragging) {
      this.hoveredSkill = skill;
      if (skill.x && skill.y) {
        this.tooltipX = skill.x + 20;
        this.tooltipY = skill.y - 50;
      }
    }
  }

  onSkillLeave() {
    if (!this.isDragging) {
      this.hoveredSkill = null;
    }
  }

  private setupDragListeners() {
    const container = this.canvas.nativeElement.parentElement!;

    container.addEventListener('mousedown', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find skill under cursor with better detection
      const skill = this.filteredSkills.find(s => {
        if (!s.x || !s.y) return false;
        // Check if click is within skill node bounds
        return (
          x >= s.x - 60 && x <= s.x + 60 &&
          y >= s.y - 25 && y <= s.y + 25
        );
      });

      if (skill) {
        this.isDragging = true;
        this.draggedSkill = skill;
        this.dragOffset = {
          x: x - skill.x!,
          y: y - skill.y!
        };
        container.style.cursor = 'grabbing';
      }
    });

    container.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.draggedSkill) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
          if (this.draggedSkill) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.draggedSkill.x = x - this.dragOffset.x;
            this.draggedSkill.y = y - this.dragOffset.y;

            // Keep skill within bounds
            this.draggedSkill.x = Math.max(50, Math.min(container.offsetWidth - 50, this.draggedSkill.x));
            this.draggedSkill.y = Math.max(50, Math.min(container.offsetHeight - 50, this.draggedSkill.y));

            // Force view update
            this.cdr.detectChanges();
          }
        });
      }
    });

    container.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedSkill = null;
      container.style.cursor = 'default';
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });

    container.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.draggedSkill = null;
      container.style.cursor = 'default';
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
