import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  imports: [],
  templateUrl: './three-scene.component.html',
  styleUrl: './three-scene.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeSceneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sceneContainer', { static: true }) sceneContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mainObject!: THREE.Mesh;
  private particles!: THREE.Points;
  private animationId!: number;

  isRotating = true;
  isWireframe = false;
  currentGeometryIndex = 0;

  private geometries = [
    () => new THREE.IcosahedronGeometry(1, 0),
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.TetrahedronGeometry(1, 0),
    () => new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16),
    () => new THREE.DodecahedronGeometry(1, 0),
  ];

  private mouse = { x: 0, y: 0 };
  private mouseDown = false;
  private rotationSpeed = { x: 0, y: 0 };

  ngOnInit() {
    this.initThree();
    this.createScene();
    this.createLights();
    this.createMainObject();
    this.createParticles();
    this.setupEventListeners();
  }

  ngAfterViewInit() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Clean up Three.js resources
    this.renderer.dispose();
    this.scene.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }

  private initThree() {
    const container = this.sceneContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 5, 15);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
  }

  private createScene() {
    // Add some ambient particles in the background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  private createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Point lights
    const pointLight1 = new THREE.PointLight(0x00ff88, 1);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0080, 0.5);
    pointLight2.position.set(-5, -5, -5);
    this.scene.add(pointLight2);

    // Moving light
    const movingLight = new THREE.PointLight(0x0088ff, 0.8);
    this.scene.add(movingLight);

    // Animate the moving light
    const animateLight = () => {
      const time = Date.now() * 0.001;
      movingLight.position.x = Math.sin(time) * 3;
      movingLight.position.y = Math.cos(time * 0.5) * 3;
      movingLight.position.z = Math.cos(time) * 3;
    };

    this.scene.userData['animateLight'] = animateLight;
  }

  private createMainObject() {
    const geometry = this.geometries[this.currentGeometryIndex]();
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      specular: 0x00ff88,
      shininess: 100,
      wireframe: this.isWireframe,
      transparent: true,
      opacity: 0.8,
    });

    this.mainObject = new THREE.Mesh(geometry, material);
    this.scene.add(this.mainObject);

    // Add edge geometry for cool effect
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0080,
      linewidth: 2,
    });
    const edgeLines = new THREE.LineSegments(edges, lineMaterial);
    this.mainObject.add(edgeLines);
  }

  private createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 300;
    const posArray = new Float32Array(particlesCnt * 3);

    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  private setupEventListeners() {
    const container = this.sceneContainer.nativeElement;

    // Mouse events
    container.addEventListener('mousedown', (e: { clientX: number; clientY: number; }) => {
      this.mouseDown = true;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    container.addEventListener('mousemove', (e: { clientX: number; clientY: number; }) => {
      if (this.mouseDown) {
        const deltaX = e.clientX - this.mouse.x;
        const deltaY = e.clientY - this.mouse.y;

        this.rotationSpeed.x = deltaY * 0.01;
        this.rotationSpeed.y = deltaX * 0.01;

        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }
    });

    container.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    container.addEventListener('mouseleave', () => {
      this.mouseDown = false;
    });

    // Wheel event for zoom
    container.addEventListener('wheel', (e: { preventDefault: () => void; deltaY: number; }) => {
      e.preventDefault();
      this.camera.position.z += e.deltaY * 0.01;
      this.camera.position.z = Math.max(
        2,
        Math.min(10, this.camera.position.z)
      );
    });

    // Window resize
    window.addEventListener('resize', () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotate main object
    if (this.isRotating) {
      this.mainObject.rotation.x += 0.01;
      this.mainObject.rotation.y += 0.01;
    }

    // Apply manual rotation
    this.mainObject.rotation.x += this.rotationSpeed.x;
    this.mainObject.rotation.y += this.rotationSpeed.y;

    // Damping
    this.rotationSpeed.x *= 0.95;
    this.rotationSpeed.y *= 0.95;

    // Animate particles
    if (this.particles) {
      this.particles.rotation.y += 0.001;

      // Make particles pulse
      const time = Date.now() * 0.001;
      const scale = 1 + Math.sin(time) * 0.1;
      this.particles.scale.set(scale, scale, scale);
    }

    // Animate light
    if (this.scene.userData['animateLight']) {
      this.scene.userData['animateLight']();
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  toggleRotation() {
    this.isRotating = !this.isRotating;
  }

  changeGeometry() {
    this.currentGeometryIndex =
      (this.currentGeometryIndex + 1) % this.geometries.length;

    // Remove old object
    this.scene.remove(this.mainObject);

    // Create new object
    this.createMainObject();
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.mainObject.material instanceof THREE.MeshPhongMaterial) {
      this.mainObject.material.wireframe = this.isWireframe;
    }
  }
}
