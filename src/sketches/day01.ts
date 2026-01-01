import { type SketchFunction } from '../genuary-framework';

export const sketch: SketchFunction = (() => {
  let randomLetter: string;
  // Japanese hiragana
  // const letters = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ		゙゚゛゜ゝゞゟ";
  const letters = "っ";
  let fontSize = 100;
  let opacity = 0.001;
  let inertia = true;
  const textAttribs = {
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-family': 'Noto Sans JP',
    'font-weight': '100',
    fill: '#dd5e5eff'
  };

  return {
    setup({ svg, random }) {
      randomLetter = letters[Math.floor(random() * letters.length)];
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';
    },

    loop({ utils, width, height, frame, maxIterations }) {
      const theta = frame * 0.01;
      if (opacity > 0.994) {
        inertia = false;
      } else if (opacity < 0.002) {
        inertia = true;
      }
      // fontSize *= 1.001;
      fontSize *= inertia ? 1.001 : 0.999;
      opacity *= !inertia ? 0.99 : 1.01;
      console.log("🚀 ~ opacity:", opacity);

      const r = 5.75 * theta * 2;
      const x = width / 2 + r * Math.cos(theta);
      const y = height / 2 + r * Math.sin(theta);

      // const margin = fontSize / 2;
      // if (!isInBounds(x, y, width, height, margin)) {
      //   return frame < maxIterations;
      // }

      const text = utils.createElement('text', {
        x: 0,
        y: 0,
        ...textAttribs,
        'font-size': (fontSize).toString(),
        opacity
      });

      const rotation = (theta * 180 / Math.PI) + 90;
      text.setAttribute('transform',
        `translate(${x}, ${y}) rotate(${rotation})`);

      text.textContent = randomLetter;
      text.style.willChange = 'transform, opacity';
      utils.appendChild(text);


      return frame < maxIterations;
    }
  };
})();
