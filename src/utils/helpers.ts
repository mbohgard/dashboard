export const percentageOfRange = (min: number, max: number) => (
  input: number
) => ((input - min) * 100) / (max - min);

export const def = (...things: any[]) => !things.some(x => x === undefined);

export const limiter = (b: number, limit: number) => (b < limit ? limit : b);
