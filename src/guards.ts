
export const isInBounds = (x: number, y: number, width: number, height: number, margin = 0): boolean => {
  return x >= margin &&
    x <= width - margin &&
    y >= margin &&
    y <= height - margin;
};