export const percentageOfRange = (min: number, max: number) => (
  input: number
) => ((input - min) * 100) / (max - min);

export const def = (...things: any[]) => !things.some(x => x === undefined);
