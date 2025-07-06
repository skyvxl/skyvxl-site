import {
  AfterViewInit,
  ChangeDetectionStrategy,
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

  skills: Skill[] = [
    // Frontend
    {
      name: 'Angular',
      level: 40,
      category: 'Frontend',
      connections: ['TypeScript', 'RxJS'],
      description: 'Expert level with Angular framework',
    },
    {
      name: 'React',
      level: 50,
      category: 'Frontend',
      connections: ['TypeScript', 'Redux'],
      description: 'Strong experience with React ecosystem',
    },
    {
      name: 'Vue.js',
      level: 50,
      category: 'Frontend',
      connections: ['TypeScript'],
      description: 'Proficient in Vue.js development',
    },
    {
      name: 'TypeScript',
      level: 60,
      category: 'Frontend',
      connections: ['JavaScript'],
      description: 'Advanced TypeScript skills',
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
      level: 50,
      category: 'DevOps',
      connections: [],
      description: 'Containerization expert',
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

            // Create curved connection
            const midX = (skill.x! + target.x!) / 2;
            const midY = (skill.y! + target.y!) / 2;
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 50;

            this.ctx.quadraticCurveTo(
              midX + offsetX,
              midY + offsetY,
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
          this.ctx.lineTo(target.x, target.y);
          this.ctx.stroke();
        }
      });
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
    this.hoveredSkill = skill;
    if (skill.x && skill.y) {
      this.tooltipX = skill.x + 20;
      this.tooltipY = skill.y - 50;
    }
  }

  onSkillLeave() {
    this.hoveredSkill = null;
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
