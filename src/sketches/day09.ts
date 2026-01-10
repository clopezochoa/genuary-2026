import type { SketchFunction } from "../genuary-framework";

export const sketch: SketchFunction = (() => {
  const blue = '#5d76aa';
  const yellow = '#fcb631';
  const gray = '#a5b4b5';
  const red = '#ff4118';

  const creatureCatalogue = [
    {
      name: 'blue',
      color: blue,
      eats: 'red',
    },
    {
      name: 'yellow',
      color: yellow,
      eats: 'gray,red'
    },
    {
      name: 'gray',
      color: gray,
      eats: 'blue,yellow'
    },
    {
      name: 'red',
      color: red,
      eats: 'gray,blue,yellow'
    },
  ];

  const clock = [
    'up',
    'right',
    'down',
    'left'
  ]

  const resolution = 128;
  let delta = { x: 0, y: 0 };
  let grid: any[][] = [];
  let prevCreaturesMap: Map<number, any> = new Map();
  let uniqueIdCounter = 0;
  let justEaten = new Set<number>();
  let elements: Map<number, SVGRectElement> = new Map();

  const processRandomCoordinate = (rand: number, refCoordinates: { x: number, y: number }) => {
    const randomClock = clock[Math.floor(rand * clock.length)];

    let targetX = refCoordinates.x;
    let targetY = refCoordinates.y;

    switch (randomClock) {
      case 'up':
        targetY -= 1;
        break;
      case 'right':
        targetX += 1;
        break;
      case 'down':
        targetY += 1;
        break;
      case 'left':
        targetX -= 1;
        break;
    }

    return { x: targetX, y: targetY };
  };


  const badLuck = (name: string, random: any) => {
    switch (name) {
      case 'blue':
        return random < 0.1;
      case 'yellow':
        return random < 0.25;
      case 'gray':
        return random < 0.5;
      case 'red':
        return random < 0.75;
      default:
        return random < 0.01;
    }
  }

  const paintCreaturesOptimized = (utils: any, isSetup: boolean, justEatenThisFrame?: Set<number>) => {
    if (isSetup) {
      utils.clear();
      for (let x = 0; x < resolution; x++) {
        for (let y = 0; y < resolution; y++) {
          const creature = grid[x][y];
          const cell = utils.createElement('rect', {
            x: creature.x * delta.x,
            y: creature.y * delta.y,
            width: delta.x,
            height: delta.y,
            fill: creature.color,
            opacity: 1,
          });
          utils.appendChild(cell);
          elements.set(creature.id, cell);
        }
      }
    } else {
      for (let x = 0; x < resolution; x++) {
        for (let y = 0; y < resolution; y++) {
          const creature = grid[x][y];
          const prev = prevCreaturesMap.get(creature.id);
          const element = elements.get(creature.id);

          if (element) {
            if (!prev || prev.color !== creature.color) {
              element.setAttribute('fill', creature.color);
            }

            if (justEatenThisFrame?.has(creature.id)) {
              element.setAttribute('opacity', '0.5');
            } else {
              element.setAttribute('opacity', '1');
            }
          }
        }
      }
    }

    prevCreaturesMap.clear();
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        prevCreaturesMap.set(grid[x][y].id, { ...grid[x][y] });
      }
    }
  };


  return {
    setup: async ({ svg, width, height, utils, random }) => {
      svg.style.willChange = 'transform';
      delta = { x: width / resolution, y: height / resolution };

      for (let x = 0; x < resolution; x++) {
        grid[x] = [];
        for (let y = 0; y < resolution; y++) {
          const pick = {
            ...creatureCatalogue[Math.floor(random() * creatureCatalogue.length)],
            x,
            y,
            id: uniqueIdCounter
          };
          uniqueIdCounter++;
          grid[x][y] = pick;
        }
      }

      paintCreaturesOptimized(utils, true);
    },

    loop: ({ frame, maxIterations, utils, random }) => {
      justEaten.clear();

      for (let x = 0; x < resolution; x++) {
        for (let y = 0; y < resolution; y++) {
          const creature = grid[x][y];

          if (justEaten.has(creature.id)) continue;
          if (badLuck(creature.name, random(x * resolution + y))) continue;

          const targetCoords = processRandomCoordinate(random(x * resolution + y), { x, y });

          if (targetCoords.x < 0 || targetCoords.x >= resolution ||
            targetCoords.y < 0 || targetCoords.y >= resolution) continue;

          const otherCell = grid[targetCoords.x][targetCoords.y];

          if (otherCell &&
            otherCell.name !== creature.name &&
            creature.eats.split(',').some((_eat: string) => {
              return _eat === otherCell.name;
            })) {
            grid[targetCoords.x][targetCoords.y] = {
              ...otherCell,
              name: creature.name,
              color: creature.color
            };
            justEaten.add(creature.id);
          }
        }
      }

      paintCreaturesOptimized(utils, false, justEaten);
      return frame < maxIterations;
    },

  };
})();