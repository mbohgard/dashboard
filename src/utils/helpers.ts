const d2h = (d: number) => d.toString(16); // convert a decimal value to hex
export const percentageOfRange = (min: number, max: number) => (
  input: number
) => ((input - min) * 100) / (max - min);
