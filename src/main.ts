import { GenuarySketch } from './genuary-framework';
const day = new Date().getDate().toString().padStart(2, '0');
const { sketch } = await import(`./sketches/day${day}`);

const size = 900;

const app = new GenuarySketch({
  width: size,
  height: size,
  containerId: 'app',
  sketch,
  mode: 'interactive', // 'single' | 'loop' | 'interactive' | 'random-play',
  maxIterations: 100000,
  fps: 300,
});

app.run();
