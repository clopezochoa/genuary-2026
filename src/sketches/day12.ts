import type { SketchFunction, SketchUtils } from "../genuary-framework";

export const sketch: SketchFunction = (() => {
  type Box = { width: number, height: number, x: number, y: number, id: number };
  const resolution = 2;
  let runningBoxes: Box[] = [];
  let stoppedBoxes: Box[] = [];
  let uniqueIdCounter = 0;

  const sizesCatalogue = [0, 1, 1, 2, 3, 5, 8, 13];
  const colorCatalogue = ['#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41'];

  let canvas = { width: 0, height: 0 };
  const floorBoxes = (box: Box) => (canvas.height - box.y) <= box.height;
  const ceilingBoxes = (box: Box) => box.y < box.height;

  const isPositionValid = (x: number, size: number): boolean => {
    return !stoppedBoxes.some(box =>
      box.y < size &&
      x < box.x + box.width &&
      x + size > box.x
    );
  };

  const spawnBoxes = () => {
    if (runningBoxes.length === 0 || !runningBoxes.some(ceilingBoxes)) {
      const size = sizesCatalogue[Math.floor(Math.random() * sizesCatalogue.length)] * resolution;
      const x = Math.floor(Math.random() * ((canvas.width - size) / resolution)) * resolution;

      if (isPositionValid(x, size)) {
        const newBox: Box = {
          width: size,
          height: size,
          x: x,
          y: 0,
          id: uniqueIdCounter++
        };
        runningBoxes.push(newBox);
      }
    }
  };

  const paintBoxes = (utils: SketchUtils) => {
    const allBoxes = runningBoxes.concat(stoppedBoxes);
    allBoxes.forEach((box: Box) => {
      const rect = utils.createElement('rect', {
        x: box.x.toString(),
        y: box.y.toString(),
        width: box.width.toString(),
        height: box.height.toString(),
        fill: colorCatalogue[box.id % colorCatalogue.length],
        opacity: 0.75,

      });
      rect.setAttribute('style', 'mix-blend-mode: difference;');
      utils.appendChild(rect);
    });
  }

  const checkBoxCollision = (fallingBox: Box, stoppedBox: Box): { collision: boolean, containment: boolean } => {
    const hasHorizontalOverlap =
      fallingBox.x < stoppedBox.x + stoppedBox.width &&
      fallingBox.x + fallingBox.width > stoppedBox.x;
    const isHorizontallyContained =
      fallingBox.x >= stoppedBox.x &&
      fallingBox.x + fallingBox.width <= stoppedBox.x + stoppedBox.width;
    const isLandingOnTop =
      fallingBox.y + fallingBox.height >= stoppedBox.y &&
      fallingBox.y + fallingBox.height <= stoppedBox.y + resolution &&
      hasHorizontalOverlap &&
      !isHorizontallyContained;
    const isContained =
      isHorizontallyContained &&
      fallingBox.y >= stoppedBox.y &&
      fallingBox.y < stoppedBox.y + stoppedBox.height &&
      fallingBox.width < stoppedBox.width;
    return {
      collision: isLandingOnTop,
      containment: isContained
    };
  };

  const runBoxes = () => {
    const newlyStopped: Box[] = [];
    runningBoxes.forEach((box: Box) => {
      box.y += resolution;
      let shouldStop = false;

      if (floorBoxes(box)) {
        shouldStop = true;
      }

      if (!shouldStop) {
        for (const stoppedBox of stoppedBoxes) {
          const { collision, containment } = checkBoxCollision(box, stoppedBox);
          if (collision) {
            box.y = stoppedBox.y - box.height;
            shouldStop = true;
            break;
          }
          if (containment) {
            const wouldHitBottom = box.y + box.height + resolution >= stoppedBox.y + stoppedBox.height;
            if (wouldHitBottom) {
              box.y = stoppedBox.y + stoppedBox.height - box.height;
              shouldStop = true;
              break;
            }
          }
        }
      }
      if (shouldStop) {
        newlyStopped.push(box);
      }
    });

    stoppedBoxes = stoppedBoxes.concat(newlyStopped);
    runningBoxes = runningBoxes.filter(box => !newlyStopped.includes(box));
  };

  const _protectedElements: SVGElement[] = [];

  const setupPattern = (utils: SketchUtils) => {
    const patternLine = utils.createElement('line', {
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '100%',
      stroke: 'black',
      'stroke-width': resolution,
      opacity: 0.2,
    });

    const horizontalPattern = utils.createElement('pattern', {
      id: 'horizontal-lines',
      width: '2',
      height: '2',
      patternUnits: 'userSpaceOnUse',
      patternTransform: 'rotate(90)',
    });

    const patternBg = utils.createElement('rect', {
      width: resolution.toString(),
      height: resolution.toString(),
      fill: 'white',
    });

    horizontalPattern.appendChild(patternBg);
    horizontalPattern.appendChild(patternLine);
    const defs = utils.createElement('defs', {});
    defs.appendChild(horizontalPattern);
    utils.appendChild(defs);
    _protectedElements.push(defs);
  }

  return {
    setup: async ({ utils, width, height }) => {
      canvas = { width, height };
      setupPattern(utils);

      const bg = utils.createElement('rect', {
        width: width.toString(),
        height: height.toString(),
        fill: 'url(#horizontal-lines)',
      });
      _protectedElements.push(bg);
      utils.appendChild(bg);
    },
    loop: ({ frame, maxIterations, utils }) => {
      runBoxes();
      if (frame % 6 === 0) spawnBoxes();
      utils.clearLooped(_protectedElements);
      paintBoxes(utils);
      return frame < maxIterations;
    }
  };
})();
