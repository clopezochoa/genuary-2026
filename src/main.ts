import { GenuarySketch } from './genuary-framework';
import { sketch } from './sketches/day01';

const size = 512;

const app = new GenuarySketch({
  width: size,
  height: size,
  containerId: 'app',
  sketch,
  mode: 'interactive', // 'single' | 'loop' | 'interactive' | 'random-play',
  maxIterations: 10000
});

app.run();
