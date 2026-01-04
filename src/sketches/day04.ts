import type { SketchFunction } from "../genuary-framework";
import { fibonacci, getDominantColor, imageToBase64 } from "../utils";

export const sketch: SketchFunction = (() => {
  const minSize = 0.25;
  const maxSize = 3;
  const fib = fibonacci(12).slice(2);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const sizes = fib.map(fibNumber => Math.min(maxSize, Math.max(minSize, Math.log(fibNumber) * (1 / goldenRatio)))).filter(x => x < maxSize);
  const items = 64;
  let x = 0;
  let y = 0;
  let deltaX = 0;
  let deltaY = 0;
  let offscreenCanvas: HTMLCanvasElement;

  return {
    setup: async ({ svg, random, width, height, utils }) => {
      svg.style.willChange = 'transform';
      svg.style.transformBox = 'fill-box';

      deltaX = (width / items);
      deltaY = (height / items);

      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const ctx = offscreenCanvas.getContext('2d')!;

      const imageUrl = 'day_4/ref.jpg';
      const base64Image = await imageToBase64(imageUrl);

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = base64Image;
      });

      ctx.drawImage(img, 0, 0, width, height);

      for (var i = 0; i < items * items; i++) {
        const randomSize = sizes[Math.floor(random(i) * sizes.length)];
        x += deltaX;
        if (i % items === 0) x = deltaX / 2;
        if (i % items === 0) y += deltaY;
        if (i < items) y = deltaY / 2;

        const rectWidth = deltaX * randomSize;
        const rectHeight = deltaY * randomSize;

        const rectX = x - rectWidth / 2;
        const rectY = y - rectHeight / 2;

        const color = getDominantColor(
          offscreenCanvas,
          rectX,
          rectY,
          rectWidth,
          rectHeight
        );

        const rect = utils.createElement('rect', {
          x: x - rectWidth / 2,
          y: y - rectHeight / 2,
          id: i.toString(),
          width: rectWidth,
          height: rectHeight,
          opacity: 0.75,
          fill: color,
          'data-cx': x,
          'data-cy': y
        });
        rect.setAttribute('style', 'mix-blend-mode: overlay;');

        utils.appendChild(rect);
      }
    },

    loop({ random, frame, svg, maxIterations }) {
      const randomSize = sizes[Math.floor(random(frame) * sizes.length)];
      const randomId = Math.floor(random(frame) * items * items);
      const rect = svg.querySelector(`rect[id="${randomId}"]`);

      if (rect) {
        const rectWidth = deltaX * randomSize;
        const rectHeight = deltaY * randomSize;
        const cx = parseFloat(rect.getAttribute('data-cx') || '0');
        const cy = parseFloat(rect.getAttribute('data-cy') || '0');

        const rectX = cx - rectWidth / 2;
        const rectY = cy - rectHeight / 2;

        const color = getDominantColor(
          offscreenCanvas,
          rectX,
          rectY,
          rectWidth,
          rectHeight
        );

        rect.setAttribute('width', rectWidth.toString());
        rect.setAttribute('height', rectHeight.toString());
        rect.setAttribute('x', (cx - rectWidth / 2).toString());
        rect.setAttribute('y', (cy - rectHeight / 2).toString());
        rect.setAttribute('fill', color);
      }

      return frame < maxIterations;
    }
  };
})();