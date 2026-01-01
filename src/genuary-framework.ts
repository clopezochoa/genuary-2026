export interface SketchConfig {
  svg: SVGSVGElement;
  width: number;
  height: number;
  frame: number;
  maxIterations: number;
  random: (seed?: number) => number;
  utils: SketchUtils;
}

export interface SketchFunction {
  setup?: (config: SketchConfig) => void;
  loop?: (config: SketchConfig) => boolean;
  teardown?: (config: SketchConfig) => void;
}

export interface SketchUtils {
  clear: () => void;
  createElement: <K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs?: Record<string, string | number>
  ) => SVGElementTagNameMap[K];
  appendChild: (element: SVGElement) => void;
}

export interface GenuaryOptions {
  width: number;
  height: number;
  containerId: string;
  sketch: SketchFunction;
  mode: 'single' | 'loop' | 'interactive' | 'random-play';
  fps?: number;
  maxIterations?: number;
}

export class GenuarySketch {
  private svg: SVGSVGElement;
  private container: HTMLElement;
  private options: GenuaryOptions;
  private frame = 0;
  private animationId: number | null = null;
  private seed = Date.now();
  private isRunning = false;

  constructor(options: GenuaryOptions) {
    this.options = { fps: 999, maxIterations: Infinity, ...options };
    this.container = document.getElementById(options.containerId)!;
    this.svg = this.createSVG();
    this.setupUI();
  }

  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(this.options.width));
    svg.setAttribute('height', String(this.options.height));
    svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    this.container.appendChild(svg);
    return svg;
  }

  private setupUI(): void {
    const controls = document.createElement('div');
    controls.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 8px; color: white; font-family: monospace; z-index: 1000;';

    const createButton = (text: string, onClick: () => void) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText = 'display: block; width: 100%; margin: 5px 0; padding: 8px; cursor: pointer; background: #333; color: white; border: 1px solid #666; border-radius: 4px;';
      btn.onclick = onClick;
      return btn;
    };

    controls.appendChild(createButton('Save PNG', () => this.savePNG()));
    controls.appendChild(createButton('Reset', () => this.reset()));

    if (this.options.mode === 'loop' || this.options.mode === 'interactive') {
      controls.appendChild(createButton('Play/Pause', () => this.togglePlayPause()));
      controls.appendChild(createButton('Step', () => this.step()));
    }

    if (this.options.mode === 'random-play') {
      controls.appendChild(createButton('Random', () => this.randomize()));
    }

    this.container.appendChild(controls);
  }

  private getConfig(): SketchConfig {
    return {
      svg: this.svg,
      width: this.options.width,
      height: this.options.height,
      frame: this.frame,
      maxIterations: this.options.maxIterations ?? Infinity,
      random: this.seededRandom.bind(this),
      utils: {
        clear: () => {
          while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
          }
        },
        createElement: <K extends keyof SVGElementTagNameMap>(
          tag: K,
          attrs?: Record<string, string | number>
        ) => {
          const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
          if (attrs) {
            Object.entries(attrs).forEach(([key, value]) => {
              el.setAttribute(key, String(value));
            });
          }
          return el;
        },
        appendChild: (element: SVGElement) => {
          this.svg.appendChild(element);
        }
      }
    };
  }

  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public run(): void {
    const config = this.getConfig();

    if (this.options.sketch.setup) {
      this.options.sketch.setup(config);
    }

    switch (this.options.mode) {
      case 'single':
        if (this.options.sketch.loop) {
          this.options.sketch.loop(config);
        }
        break;

      case 'loop':
      case 'interactive':
        this.startLoop();
        break;

      case 'random-play':
        this.randomize();
        break;
    }
  }

  private startLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const fps = this.options.fps || 60;
    const interval = 1000 / fps;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!this.isRunning) return;

      const elapsed = currentTime - lastTime;

      if (elapsed >= interval) {
        lastTime = currentTime - (elapsed % interval);

        const shouldContinue = this.step();

        if (!shouldContinue || this.frame >= this.options.maxIterations!) {
          this.stop();
          return;
        }
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private step(): boolean {
    if (!this.options.sketch.loop) return false;

    const config = this.getConfig();
    const shouldContinue = this.options.sketch.loop(config);
    this.frame++;

    return shouldContinue;
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private togglePlayPause(): void {
    if (this.isRunning) {
      this.stop();
    } else {
      this.startLoop();
    }
  }

  private reset(): void {
    this.stop();
    this.frame = 0;
    this.seed = Date.now();

    const config = this.getConfig();
    config.utils.clear();

    if (this.options.sketch.setup) {
      this.options.sketch.setup(config);
    }

    if (this.options.mode === 'single' && this.options.sketch.loop) {
      this.options.sketch.loop(config);
    }
  }

  private randomize(): void {
    this.seed = Math.random() * 999999;
    this.reset();
  }

  private async savePNG(): Promise<void> {
    const svgData = new XMLSerializer().serializeToString(this.svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = this.options.width;
      canvas.height = this.options.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const link = document.createElement('a');
        link.download = `genuary-${new Date().toISOString().slice(0, 10)}-${this.frame}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();

        URL.revokeObjectURL(link.href);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
}
