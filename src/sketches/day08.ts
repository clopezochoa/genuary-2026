import type { SketchFunction, SketchUtils } from "../genuary-framework";

export const sketch: SketchFunction = (() => {

  function facade(cx: number, cy: number, width: number, height: number): string {
    return `M ${cx}, ${cy} l 0, ${-height} l ${-width}, 0 l 0, ${height} l ${-width}, 0 z`;
  }

  function roof(cx: number, cy: number, width: number, height: number, deep: number): string {
    return `M ${cx}, ${cy - height} l ${-deep}, ${-deep} l ${-width}, 0 l ${deep}, ${deep} l ${width}, 0 z`;
  }

  function side(cx: number, cy: number, width: number, height: number, deep: number): string {
    return `M ${cx - width}, ${cy} l 0, ${-height} l ${-deep}, ${-deep} l 0, ${height} l ${deep}, ${deep} z`;
  }

  function building(cx: number, cy: number, x: number, y: number, z: number, utils: SketchUtils) {
    const building = { cx, cy, x, y, z };
    const facadePath = utils.createElement('path', {
      d: facade(building.cx, building.cy, building.x, building.y),
      fill: 'url(#facade-lines)',
    });


    const roofPath = utils.createElement('path', {
      d: roof(building.cx, building.cy, building.x, building.y, building.z),
      fill: 'url(#horizontal-lines)',

    });

    const sidePath = utils.createElement('path', {
      d: side(building.cx, building.cy, building.x, building.y, building.z),
      fill: 'url(#vertical-lines)',
    })

    const group = utils.createElement('g', {});
    group.appendChild(facadePath);
    group.appendChild(roofPath);
    group.appendChild(sidePath);
    return group;
  }

  const red = '#8f0000';
  const beige = '#e3d5c1';
  const gray = '#8c8670';
  const orange = '#db5b00';


  return {
    setup: async ({ svg, width, height, utils, random }) => {
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';

      const patternLine = utils.createElement('line', {
        x1: '0',
        y1: '0',
        x2: '0',
        y2: '100%',
        stroke: red,
        'stroke-width': '1',
        opacity: '1',
      });

      const horizontalPattern = utils.createElement('pattern', {
        id: 'horizontal-lines',
        width: '2',
        height: '2',
        patternUnits: 'userSpaceOnUse',
        patternTransform: 'rotate(90)',
      });
      const verticalPattern = utils.createElement('pattern', {
        id: 'vertical-lines',
        width: '2',
        height: '2',
        patternUnits: 'userSpaceOnUse',
      });
      const facadePattern = utils.createElement('pattern', {
        id: 'facade-lines',
        width: '2',
        height: '2',
        patternUnits: 'userSpaceOnUse',
      });

      const patternBg = utils.createElement('rect', {
        width: '2',
        height: '2',
        fill: beige,
      });

      horizontalPattern.appendChild(patternBg);
      horizontalPattern.appendChild(patternLine);
      verticalPattern.appendChild(patternBg.cloneNode(true));
      const verticalLine = patternLine.cloneNode(true);
      (verticalLine as SVGLineElement).setAttribute('stroke', gray);
      verticalPattern.appendChild(verticalLine);
      facadePattern.appendChild(patternBg.cloneNode(true));
      const facadeLine = patternLine.cloneNode(true);
      (facadeLine as SVGLineElement).setAttribute('stroke', orange);
      facadePattern.appendChild(facadeLine);

      const defs = utils.createElement('defs', {});
      defs.appendChild(horizontalPattern);
      defs.appendChild(verticalPattern);
      defs.appendChild(facadePattern);
      svg.appendChild(defs);

      const rows = Math.floor(height / Math.max(Math.ceil(height / 32), Math.ceil(random() * 64)));
      const deltaY = height / (rows);

      for (var i = 0; i < rows; i++) {
        const columns = Math.floor(width / Math.max(Math.ceil(width / 32), Math.ceil(random() * 64)))
        const deltaX = width / (columns);
        for (var j = columns; j > 0; j--) {
          const buildingGroup = building((deltaX * j), (deltaY * i) + deltaY, (deltaX * 0.8), (deltaY * random(j)), Math.min(deltaY, random(i - j) * 40), utils);
          // const binaryRandom = Math.floor(random(i - j) * 2);
          // if (binaryRandom === 1) {
          //   const cx = deltaX * j;
          //   buildingGroup.setAttribute('transform', `translate(${cx * 2 - deltaX}, 0) scale(-1, 1)`);
          // }

          utils.appendChild(buildingGroup);
        }

        const swatches = [
          gray, red, orange
        ];
        const randomLineColor = swatches[Math.floor(random(i) * swatches.length)];
        utils.appendChild(utils.createElement('line', {
          x1: '0',
          y1: ((deltaY * i) + deltaY * 1.25).toString(),
          x2: width.toString(),
          y2: ((deltaY * i) + deltaY * 1.25).toString(),
          stroke: randomLineColor,
          'stroke-width': (deltaY * 0.25).toString(),
          opacity: 0.5,
        }))
      }
    },
  };

})();
