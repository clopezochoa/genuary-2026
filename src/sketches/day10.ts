import type { SketchFunction, SketchUtils } from "../genuary-framework";

export const sketch: SketchFunction = (() => {
  const blue = '#93969dff';
  const yellow = '#878580ff';
  const gray = '#2c2c2cff';
  const red = '#5f5d5dff';
  let delta = 0;

  const resolution = 128;
  function drawLines(resolution: number, delta: number, random: (seed?: number) => number, width: number, height: number, utils: SketchUtils) {
    const defs = utils.createElement('defs');
    const gradient = utils.createElement('radialGradient', {
      id: 'pathGradient',
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '100%',
      gradientUnits: 'userSpaceOnUse'
    });

    const stop1 = utils.createElement('stop', {
      offset: '0%',
      'stop-color': red
    });
    const stop2 = utils.createElement('stop', {
      offset: '45%',
      'stop-color': yellow
    });
    const stop3 = utils.createElement('stop', {
      offset: '60%',
      'stop-color': blue
    });
    const stop4 = utils.createElement('stop', {
      offset: '100%',
      'stop-color': gray
    });

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    gradient.appendChild(stop4);
    defs.appendChild(gradient);
    utils.appendChild(defs);

    const positions: { x: number; y: number; }[] = [];

    for (var j = 1; j <= resolution; j++) {
      const isReverse = j % 2 === 0;

      const angles = [];
      for (var i = -45; i < 225; i = i + 0.5) {
        angles.push(i);
      }

      if (isReverse) {
        angles.reverse();
      }

      for (const i of angles) {
        const x = -Math.cos(i * Math.PI / 180) * j * (delta) * (j < 2 ? 1 : Math.min(1, Math.max(0.95, random(i))));
        const y = -Math.sin(i * Math.PI / 180) * j * (delta) * (j < 2 ? 1 : Math.min(1, Math.max(0.95, random(j))));
        positions.push({ x, y });
      }
    }

    const pathStart = `M ${width / 2} ${(height / 2)}`;
    const path = positions.map(p => `L ${p.x + width / 2} ${p.y + (height / 2)}`).join('');
    const composedPath = pathStart + path;

    const pathElement = utils.createElement('path', {
      d: composedPath,
      fill: 'none',
      stroke: 'url(#pathGradient)',
      opacity: '1',
      'stroke-width': 1,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    });

    utils.appendChild(pathElement);
  }

  return {
    setup: async ({ svg, width }) => {
      svg.style.willChange = 'transform';
      delta = (width * 0.49) / resolution;
    },

    loop: ({ frame, maxIterations, utils, random, width, height }) => {
      utils.clear();

      drawLines(resolution, delta, random, width, height, utils);
      return frame < maxIterations;
    },

  };
})();

