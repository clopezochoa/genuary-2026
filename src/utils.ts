
export const isInBounds = (x: number, y: number, width: number, height: number, margin = 0): boolean => {
  return x >= margin &&
    x <= width - margin &&
    y >= margin &&
    y <= height - margin;
};

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
