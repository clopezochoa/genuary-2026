
export const isInBounds = (x: number, y: number, width: number, height: number, margin = 0): boolean => {
  return x >= margin &&
    x <= width - margin &&
    y >= margin &&
    y <= height - margin;
};

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function fibonacci(iterations: number = 10): number[] {
  var fib = [0, 1];
  for (var i = 2; i <= iterations; i++) {
    fib[i] = fib[i - 2] + fib[i - 1];
  }
  return fib;
}

export async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function getDominantColor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  const ctx = canvas.getContext('2d')!;

  const clampedX = Math.max(0, Math.floor(x));
  const clampedY = Math.max(0, Math.floor(y));
  const clampedWidth = Math.max(1, Math.min(Math.floor(width), canvas.width - clampedX));
  const clampedHeight = Math.max(1, Math.min(Math.floor(height), canvas.height - clampedY));

  if (clampedWidth <= 0 || clampedHeight <= 0) {
    return 'rgb(0, 0, 0)';
  }

  const imageData = ctx.getImageData(clampedX, clampedY, clampedWidth, clampedHeight);
  const data = imageData.data;

  let r = 0, g = 0, b = 0;
  const pixelCount = imageData.width * imageData.height;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return `rgb(${r}, ${g}, ${b})`;
}
