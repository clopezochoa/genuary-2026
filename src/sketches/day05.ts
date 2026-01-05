import type { SketchFunction } from "../genuary-framework";

export const sketch: SketchFunction = (() => {
  const word = "·GENUARY·";
  const arrayDimension = 5;
  const squaresPerCharacter = Math.pow(arrayDimension, 2);

  //  0  1  2  3  4
  //  5  6  7  8  9
  // 10 11 12 13 14
  // 15 16 17 18 19
  // 20 21 22 23 24

  const charactersArray = [
    [12],
    [1, 2, 3, 5, 10, 13, 14, 15, 19, 21, 22, 23],
    [1, 2, 3, 4, 5, 10, 11, 12, 13, 15, 21, 22, 23, 24],
    [0, 4, 5, 6, 9, 10, 11, 12, 14, 15, 17, 18, 19, 20, 23, 24],
    [0, 4, 5, 9, 10, 14, 15, 19, 21, 22, 23],
    [1, 2, 3, 5, 9, 10, 11, 12, 13, 14, 15, 19, 20, 24],
    [0, 1, 2, 3, 5, 9, 10, 11, 12, 13, 15, 17, 20, 23],
    [0, 4, 5, 9, 11, 12, 13, 17, 22],
    [12],
  ];

  const subMargin = 1;
  const margin = 4;

  let flickerDuration: number;
  let waveDuration: number;
  let totalCycle: number

  let rectangles: SVGRectElement[] = [];

  return {
    setup: async ({ svg, width, height, utils, random, fps }) => {
      flickerDuration = fps;
      waveDuration = (squaresPerCharacter * word.length) / 2;
      totalCycle = flickerDuration + waveDuration;

      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';
      const defs = utils.createElement('defs', {});
      utils.appendChild(defs);

      const cols = Math.floor(Math.sqrt(word.length));
      const rows = cols;
      const totalGapX = margin * (cols - 1);
      const totalGapY = margin * (rows - 1);
      const letterWidth = (width - totalGapX) / cols;
      const letterHeight = (height - totalGapY) / rows;

      for (var i = 0; i < word.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const baseX = letterWidth * col + margin * col;
        const baseY = letterHeight * row + margin * row;
        const subRectWidth = letterWidth / arrayDimension;
        const subRectHeight = letterHeight / arrayDimension;

        for (var j = 0; j < squaresPerCharacter; j++) {
          if (!charactersArray[i].includes(j)) continue;
          const subX = baseX + subRectWidth * (j % arrayDimension);
          const subY = baseY + subRectHeight * Math.floor(j / arrayDimension);

          const gradientId = `pixel-gradient-${i}`;
          const gradient = utils.createElement('radialGradient', {
            id: gradientId,
            cx: '50%',
            cy: '50%',
            r: '70%',
          });

          let hue = Math.floor(random(i) * 360);
          hue = Math.max(120, Math.min(160, hue));

          const stop1 = utils.createElement('stop', {
            offset: '0%',
            'stop-color': `hsl(${hue}, ${68 + (20 * random(j))}%, 58%)`,
            'stop-opacity': '1',
          });
          const stop2 = utils.createElement('stop', {
            offset: '100%',
            'stop-color': `hsl(${hue}, ${58 - (20 * random(i))}%, 48%)`,
            'stop-opacity': '1',
          });

          gradient.appendChild(stop1);
          gradient.appendChild(stop2);
          defs.appendChild(gradient);

          const rect = utils.createElement('rect', {
            x: subX,
            y: subY,
            id: i.toString(),
            width: subRectWidth - subMargin,
            height: subRectHeight - subMargin,
            opacity: 1.0,
            fill: `url(#${gradientId})`,
          }) as SVGRectElement;
          rect.setAttribute('style', 'mix-blend-mode: overlay;');
          rect.dataset.baseOpacity = '1.0';
          rect.dataset.charIndex = i.toString();
          utils.appendChild(rect);
          rectangles.push(rect);
        }
      }
    },

    loop: ({ frame, maxIterations, random }) => {
      const cyclePosition = frame % totalCycle;

      if (cyclePosition < flickerDuration) {
        const randomPicksQuantity = Math.min(10, Math.max(5, Math.floor(random() * 10)));
        const randomPicks: number[] = [];
        for (var i = 0; i < randomPicksQuantity; i++) {
          randomPicks.push(Math.floor(random() * rectangles.length));
        }

        rectangles.forEach((rect, index) => {
          const flickerAmount = 0.4;
          const flicker = 1.0 - (random() * flickerAmount);
          if (randomPicks.includes(index)) {
            rect.setAttribute('opacity', '0.0');
          } else {
            rect.setAttribute('opacity', flicker.toString());
          }
        });
      } else {
        const waveProgress = cyclePosition - flickerDuration;
        const totalPixels = rectangles.length;
        const halfWave = waveDuration / 2;

        rectangles.forEach((rect, index) => {
          const pixelTiming = (index / totalPixels) * halfWave;

          if (waveProgress < halfWave) {
            if (waveProgress >= pixelTiming) {
              rect.setAttribute('opacity', '0.0');
            } else {
              const flickerAmount = 0.1;
              const flicker = 1.0 - (random() * flickerAmount);
              rect.setAttribute('opacity', flicker.toString());
            }
          } else {
            const reappearProgress = waveProgress - halfWave;
            if (reappearProgress >= pixelTiming) {
              const flickerAmount = 0.1;
              const flicker = 1.0 - (random() * flickerAmount);
              rect.setAttribute('opacity', flicker.toString());
            } else {
              rect.setAttribute('opacity', '0.0');
            }
          }
        });
      }

      return frame < maxIterations;
    }
  };

})();
