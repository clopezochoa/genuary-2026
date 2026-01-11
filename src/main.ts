import { GenuarySketch } from './genuary-framework';
const day = new Date().getDate().toString().padStart(2, '0');
const { sketch } = await import(`./sketches/day${day}`);

const size = 1024;

const app = new GenuarySketch({
  width: size,
  height: size,
  containerId: 'app',
  sketch,
  mode: 'single', // 'single' | 'loop' | 'interactive' | 'random-play',
  maxIterations: 60,
  fps: 6,
});

app.run();
