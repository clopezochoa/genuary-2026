import type { SketchFunction } from "../genuary-framework";

export const sketch: SketchFunction = (() => {
  const columns = 5;
  const rows = 5;

  const columnRadius = 20;
  let lighter = { col: 1, row: 1 };
  let lighterPos = { x: 0, y: 0 };
  const shadowResolution = 32;
  const pillarHeight = 60;

  let tiles: SVGRectElement[] = [];
  let shadows: SVGRectElement[] = [];

  let deltaX = 0;
  let deltaY = 0;

  let lightSwitch = true;
  let clockOn = 0;
  let clockOff = 0;
  const alarm = 30;

  const switchLights = (on: boolean, _utils: any, _deltaX: any, _deltaY: any, _random: any, _svg: SVGElement) => {
    _utils.clear();
    tiles = [];
    shadows = [];

    if (on) {
      lighter = { col: Math.floor(_random() * columns), row: Math.floor(_random() * rows) };
      lighterPos = { x: _deltaX * lighter.col + (_deltaX / 2), y: _deltaY * lighter.row + (_deltaY / 2) };
    }

    for (var i = 0; i < columns; i++) {
      const baseX = _deltaX * i + (_deltaX / 2) - (columnRadius);

      for (var j = 0; j < rows; j++) {
        if (on && lighter.col === i && lighter.row === j) continue;
        const baseY = _deltaY * j + (_deltaY / 2) - (columnRadius);

        const id = `${i}_${j}_${on ? 'on' : 'off'}`;

        if (on) {
          for (var s = 0; s < shadowResolution; s++) {
            const sliceFactor = (s / shadowResolution) * pillarHeight;
            const direction = { x: i - lighter.col, y: j - lighter.row };
            const shadowSliceDisplacement = {
              x: (baseX + (sliceFactor * direction.x)),
              y: (baseY + (sliceFactor * direction.y))
            };

            const shadowSlice = _utils.createElement('rect', {
              x: shadowSliceDisplacement.x,
              y: shadowSliceDisplacement.y,
              id: `s_${id}_${s}`,
              width: columnRadius * 2,
              height: columnRadius * 2,
              opacity: 0.05 * (1 / (sliceFactor / pillarHeight)),
              fill: 'gray',
              stroke: 'none'
            }) as SVGRectElement;
            _utils.appendChild(shadowSlice);
            shadows.push(shadowSlice);
          }
        }

        const rect = _utils.createElement('rect', {
          x: baseX,
          y: baseY,
          id,
          width: columnRadius * 2,
          height: columnRadius * 2,
          opacity: 1.0,
          fill: on ? 'white' : 'black',
          stroke: !on ? 'white' : 'black',
          'stroke-width': '2px',
          'data-cx': baseX.toString(),
          'data-cy': baseY.toString(),
          'data-switch': on.toString()
        }) as SVGRectElement;
        tiles.push(rect);
      }
    }

    for (var i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      _utils.appendChild(tile);
    }

    (_svg).style.backgroundColor = on ? 'black' : 'white';
    lightSwitch = on;
  }

  return {
    setup: async ({ svg, width, height }) => {
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';

      deltaX = width / columns;
      deltaY = height / rows;

    },

    loop: ({ frame, maxIterations, utils, random, svg }) => {
      console.log("🚀", frame, clockOn, clockOff, lightSwitch);

      if (frame === 0) {
        switchLights(true, utils, deltaX, deltaY, random, svg);
      }

      if (!lightSwitch) {
        clockOff++;
        if (clockOff > alarm) {
          clockOff = 0;
          utils.clear();
          switchLights(true, utils, deltaX, deltaY, random, svg);
        }
      } else {
        clockOn++;
        if (clockOn > alarm) {
          clockOn = 0;
          utils.clear();
          switchLights(false, utils, deltaX, deltaY, random, svg);
        }
      }
      return frame < maxIterations;
    }
  };

})();
