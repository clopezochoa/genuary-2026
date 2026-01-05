import { GenuarySketch } from './genuary-framework';
const day = new Date().getDate().toString().padStart(2, '0');
const { sketch } = await import(`./sketches/day${day}`);

const size = 512;

const app = new GenuarySketch({
  width: size,
  height: size,
  containerId: 'app',
  sketch,
  mode: 'interactive', // 'single' | 'loop' | 'interactive' | 'random-play',
  maxIterations: 7000,
  fps: 60,
});

app.run();
