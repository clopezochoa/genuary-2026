import GIF from 'gif.js';
import gifWorker from 'gif.js/dist/gif.worker.js?url';

export interface SketchConfig {
  svg: SVGSVGElement;
  width: number;
  height: number;
  frame: number;
  fps: number;
  maxIterations: number;
  random: (seed?: number) => number;
  utils: SketchUtils;
}

export interface SketchFunction {
  setup?: (config: SketchConfig) => void | Promise<void>;
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
    this.options = { fps: 60, maxIterations: Infinity, ...options };
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
    controls.appendChild(createButton('Export GIF', () => this.exportGIF()));
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
      fps: this.options.fps ?? 60,
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

  public async run(): Promise<void> {
    const config = this.getConfig();

    if (this.options.sketch.setup) {
      await this.options.sketch.setup(config); // Add await
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

  private async reset(): Promise<void> {
    this.stop();
    this.frame = 0;
    this.seed = Date.now();

    const config = this.getConfig();
    config.utils.clear();

    if (this.options.sketch.setup) {
      await this.options.sketch.setup(config); // Add await
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

  private async exportGIF(): Promise<void> {
    const wasRunning = this.isRunning;
    this.stop();

    const originalFrame = this.frame;
    const originalSeed = this.seed;

    const status = document.createElement('div');
    status.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 8px; z-index: 10000; font-family: monospace;';
    status.textContent = 'Generating GIF... 0%';
    document.body.appendChild(status);

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: this.options.width,
      height: this.options.height,
      workerScript: gifWorker
    });

    this.frame = 0;
    this.seed = originalSeed;
    const config = this.getConfig();
    config.utils.clear();

    if (this.options.sketch.setup) {
      this.options.sketch.setup(config);
    }

    const maxFrames = Math.min(this.options.maxIterations ?? 100, 100);
    const fps = this.options.fps || 60;
    const delay = 1000 / fps;

    await new Promise(resolve => setTimeout(resolve, 100));

    for (let i = 0; i < maxFrames; i++) {
      if (this.options.sketch.loop) {
        const shouldContinue = this.options.sketch.loop(this.getConfig());
        if (!shouldContinue) break;
      }
      this.frame++;

      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await this.svgToCanvas();
      gif.addFrame(canvas, { delay });

      status.textContent = `Generating GIF... ${Math.round((i / maxFrames) * 100)}%`;
    }

    this.frame = originalFrame;
    this.seed = originalSeed;
    this.reset();

    if (wasRunning) {
      this.startLoop();
    }

    status.textContent = 'Rendering GIF...';

    gif.on('finished', (blob: Blob) => {
      const link = document.createElement('a');
      link.download = `genuary-${new Date().toISOString().slice(0, 10)}.gif`;
      link.href = URL.createObjectURL(blob);
      link.click();

      document.body.removeChild(status);
      URL.revokeObjectURL(link.href);
    });

    gif.render();
  }



  private async svgToCanvas(): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const svgData = new XMLSerializer().serializeToString(this.svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = this.options.width;
        canvas.height = this.options.height;

        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };

      img.src = url;
    });
  }

}
