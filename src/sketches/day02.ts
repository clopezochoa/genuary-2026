import { type SketchFunction } from '../genuary-framework';
import { isInBounds } from '../utils';

export const sketch: SketchFunction = (() => {
  let randomLetter: string;
  // Japanese hiragana
  const letters = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ		゙゚゛゜ゝゞゟ";
  let fontSize = 100;

  let opacity = 0.0001;
  let displayOpacity = 0.0001;
  let threshold = 0.025
  let inertia = true;
  const smoothing = 0.5;

  const textAttribs = {
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-family': 'Noto Sans JP',
    'font-weight': '100',
  };
  let textHue = 0;

  return {
    setup({ svg, random }) {
      randomLetter = letters[Math.floor(random() * letters.length)];
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';
      textHue = Math.floor(random() * 360);
    },

    loop({ utils, width, height, frame, maxIterations }) {
      const theta = frame * 0.01;

      const x = (fontSize / 2) * theta;
      const y = fontSize / 1.5;

      const margin = fontSize / 2;
      if (!isInBounds(x, y, width, height, margin)) {
        return frame < maxIterations;
      }

      if (opacity > 1 - threshold) {
        inertia = false;
      } else if (opacity < threshold) {
        inertia = true;
      }
      opacity *= !inertia ? 1 - threshold : 1 + threshold;
      displayOpacity += (opacity - displayOpacity) * smoothing;

      const hueShift = theta * 5;
      const hue = (textHue + hueShift) % 360;

      const text = utils.createElement('text', {
        x: 0,
        y: 0,
        ...textAttribs,
        'font-size': (fontSize).toString(),
        opacity: displayOpacity,
        fill: `hsl(${hue}, 68%, 68%)`,
      });

      text.setAttribute('transform',
        `translate(${x}, ${y})`);

      text.textContent = randomLetter;
      text.style.willChange = 'transform, opacity';
      utils.appendChild(text);

      return frame < maxIterations;
    }
  };
})();
