import type { SketchFunction } from "../genuary-framework";
import content from './day11.ts?raw';

export const sketch: SketchFunction = (() => {
  return {
    setup: async ({ utils, width, height }) => {
      const sortedContent = content.toLowerCase().split('').sort().join('').trim();
      const differentCharacters = [...new Set(sortedContent)];

      const fontSize = 15;
      const lineHeight = fontSize * 1.25;

      const text = utils.createElement('text', {
        x: 0,
        y: 4,
        'font-family': 'Playfair Display',
        'font-weight': 700,
        'font-size': fontSize.toString(),
        fill: `hsla(103, 7%, 81%, 1.00)`,
        'text-anchor': 'middle',
      });

      for (let i = 0; i < differentCharacters.length; i++) {
        const char = differentCharacters[i];
        const charItems = sortedContent.split(char).length - 1;

        const lineTspan = utils.createElement('tspan', {
          x: (width / 2).toString(),
          dy: i === 0 ? fontSize.toString() : lineHeight.toString(),
        });

        for (let j = 0; j < charItems; j++) {
          const opacity = (j + 1) / charItems;

          const charTspan = utils.createElement('tspan', {
            opacity: opacity.toString(),
          });
          charTspan.textContent = char + ' ';
          lineTspan.appendChild(charTspan);
        }

        text.appendChild(lineTspan);
      }

      utils.appendChild(utils.createElement('rect', { width: width.toString(), height: height.toString(), fill: '#1c1450ff' }));
      utils.appendChild(text);
    },
  };
})();
