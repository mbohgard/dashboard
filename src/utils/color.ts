import { TinyColor } from "@ctrl/tinycolor";

import { colors } from "../styles";
import { percentageOfRange, roundedPercentageOf } from "./helpers";

export const tempPercentage = percentageOfRange(153, 500);
export const huePercentage = percentageOfRange(0, 65535);
export const satOrBriPercentage = (value: number) =>
  roundedPercentageOf(value, 254);

const percentage = percentageOfRange(-15, 30);

export const getTempColor = (deg: number, range?: [number, number]) => {
  const color = new TinyColor(colors.cold)
    .mix(
      new TinyColor(colors.hot),
      range ? percentageOfRange(...range)(deg) : percentage(deg)
    )
    .toHsv();
  return new TinyColor({
    ...color,
    v: 1,
  }).toString("hex6") as string;
};
