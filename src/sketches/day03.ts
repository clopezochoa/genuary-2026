import { type SketchFunction } from '../genuary-framework';
import { fibonacci } from '../utils';

export const sketch: SketchFunction = (() => {
  let randomLetter: string;
  // Japanese hiragana
  const letters = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ		゙゚゛゜ゝゞゟ";
  let fontSize = 0.1;
  let margin = fontSize / 4;
  let opacity = 0.75;
  let inertia = true;
  const threshold = 0.025

  const textAttribs = {
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-family': 'Noto Sans JP',
    'font-weight': '100',
  };

  let textHue = 30;
  const minHue = 325;
  const maxHue = 35;
  const hueRange = (maxHue + 360 - minHue) % 360;

  let fib: number[] = [];
  const startingPad = 12;

  let top = startingPad;
  let right = 0;
  let bottom = 0;
  let left = startingPad;

  let x = startingPad;
  let y = startingPad;
  let direction = 0;

  let finalBuffer = 0;

  const stepMagnitude = 40;

  return {
    setup({ svg, random, maxIterations, width, height }) {
      randomLetter = letters[Math.floor(random() * letters.length)];
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';

      textHue = minHue + Math.floor(random() * hueRange);

      fib = fibonacci(maxIterations);

      right = width - margin;
      bottom = height - margin;
      x = left;
      y = top;
    },

    loop({ random, utils, frame, maxIterations }) {
      const _n = fib[Math.floor(frame) % fib.length];
      const n = Math.log(_n + 1);
      fontSize += 0.1 * 1;
      margin = fontSize / 4;

      if (opacity > 1 - threshold) {
        inertia = false;
      } else if (opacity < threshold) {
        inertia = true;
      }
      opacity += !inertia ? -random() * n : random() * n;
      opacity = Math.abs(opacity) % 1;

      const step = n / stepMagnitude;

      randomLetter = letters[Math.floor(random() * letters.length)];

      if (direction === 0) {
        x += step;
        if (x >= (right - fontSize * 0.75)) {
          x = (right - fontSize * 0.75);
          y = (top + fontSize * 0.75);
          top += fontSize * 0.75;
          direction = 1;
        }
      } else if (direction === 1) {
        y += step;
        if (y >= (bottom - fontSize * 0.75)) {
          y = (bottom - fontSize * 0.75);
          x = (right - fontSize * 0.75);
          right -= fontSize * 0.75;
          direction = 2;
        }
      } else if (direction === 2) {
        x -= step;
        if (x <= (left + fontSize * 0.75)) {
          x = (left + fontSize * 0.75);
          y = (bottom - fontSize * 0.75);
          bottom -= fontSize * 0.75;
          direction = 3;
        }
      } else if (direction === 3) {
        y -= step;
        if (y <= (top + fontSize * 0.75)) {
          y = (top + fontSize * 0.75);
          x = (left + fontSize * 0.75);
          left += fontSize * 0.75;
          direction = 0;
        }
      }

      if (left >= right || top >= bottom) {
        if (finalBuffer <= 0) {
          return false;
        }
        --finalBuffer;
      }

      const hueOffset = (x * n) - (y / n);
      const normalizedHue = ((textHue + hueOffset) % hueRange + hueRange) % hueRange;
      const hue = (normalizedHue + minHue) % 360;

      const text = utils.createElement('text', {
        x: 0,
        y: 0,
        ...textAttribs,
        fill: `hsl(${hue}, 68%, 68%)`,
        'font-size': fontSize.toString() + 'px',
        opacity
      });

      text.setAttribute('transform',
        `translate(${x}, ${y}), rotate(${direction * 90}, 0, 0)`);

      text.textContent = randomLetter;
      text.style.willChange = 'transform';
      utils.appendChild(text);

      return frame < maxIterations;
    }
  };
})();
