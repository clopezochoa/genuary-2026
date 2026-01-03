
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
