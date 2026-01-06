import type { SketchFunction } from "../genuary-framework";

interface Worm {
  id: number;
  y: number;
  x: number;
  vx: number;
  length: number;
  thickness: number;
  wasOverlapping: Set<number>;
  separationEnergy: number;
  mass: number;
  alive: boolean;
}

export const sketch: SketchFunction = (() => {
  let worms: Worm[] = [];
  let lines: SVGLineElement[] = [];
  const spacing = 0.3;
  const wormLength = 100;

  return {
    setup: async ({ svg, width, height, utils }) => {

      svg.style.willChange = 'transform';
      const numWorms = Math.floor(height / spacing);

      for (let i = 0; i < numWorms; i++) {
        const worm: Worm = {
          id: i,
          y: i * spacing + spacing / 2,
          x: width,
          vx: (- 0.5) * 2.4,
          length: wormLength,
          thickness: 1 + 1.5,
          wasOverlapping: new Set(),
          separationEnergy: 0,
          mass: 1.0,
          alive: true,
        };
        worms.push(worm);

        const line = utils.createElement('line', {
          'stroke-width': worm.thickness.toString(),
          'stroke-linecap': 'round',
          opacity: '0.5',
          stroke: '#6a6a6aff',
        }) as SVGLineElement;
        line.setAttribute('style', 'mix-blend-mode: multiply');
        utils.appendChild(line);
        lines.push(line);
      }
    },

    loop: ({ frame, maxIterations, width, random }) => {

      worms.forEach((worm) => {
        if (!worm.alive) return;
        worm.x += worm.vx + (random() * 1.2);
        worm.separationEnergy *= 0.95;
        if (worm.x + worm.length < 0) {
          worm.x = width;
        } else if (worm.x > width) {
          worm.x = -worm.length;
        }
      });

      worms.forEach((worm, i) => {
        if (!worm.alive) return;

        let overlapCount = 0;
        const wormLeft = worm.x;
        const wormRight = worm.x + worm.length;
        const currentOverlaps = new Set<number>();

        worms.forEach((other, j) => {
          if (i === j || !other.alive) return;

          const yDiff = Math.abs(worm.y - other.y);
          if (yDiff > spacing) return;
          const otherLeft = other.x;
          const otherRight = other.x + other.length;
          const hasOverlap = !(wormRight < otherLeft || wormLeft > otherRight);

          if (hasOverlap) {
            overlapCount++;
            currentOverlaps.add(j);
          }
        });

        worm.wasOverlapping.forEach((otherId) => {
          if (!currentOverlaps.has(otherId)) {
            const other = worms[otherId];
            if (!other.alive) return;
            if (worm.mass > other.mass) {
              const massTransfer = other.mass * 0.5;
              worm.mass += massTransfer;
              other.mass -= massTransfer;
              worm.thickness = 1 + worm.mass * 10;
              if (other.mass < 0.25) {
                other.alive = false;
                other.mass = 0;
                lines[otherId].setAttribute('opacity', '0');
              }
            } else if (other.mass > worm.mass) {
              const massTransfer = worm.mass * 0.1;
              other.mass += massTransfer;
              worm.mass -= massTransfer;
              other.thickness = 1 + other.mass * 10;
              if (worm.mass < 0.1) {
                worm.alive = false;
                worm.mass = 0;
                lines[i].setAttribute('opacity', '0');
                return;
              }
            }
            worm.vx *= 1.01;
            worm.separationEnergy = 1.0;
          }
        });
        worm.wasOverlapping = currentOverlaps;

        let opacity = 0.95;
        if (overlapCount === 1) {
          opacity = 0.6;
        } else if (overlapCount === 2) {
          opacity = 0.3;
        } else if (overlapCount >= 3) {
          opacity = 0.1;
        }

        lines[i].setAttribute('x1', worm.x.toString());
        lines[i].setAttribute('y1', worm.y.toString());
        lines[i].setAttribute('x2', (worm.x + worm.length).toString());
        lines[i].setAttribute('y2', worm.y.toString());
        lines[i].setAttribute('stroke-width', worm.thickness.toString());
        lines[i].setAttribute('opacity', opacity.toString());
      });

      return frame < maxIterations;
    }
  };
})();
