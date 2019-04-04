export const percentageOfRange = (min: number, max: number) => (
  input: number
) => ((input - min) * 100) / (max - min);
