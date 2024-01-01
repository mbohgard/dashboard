import { TinyColor } from "@ctrl/tinycolor";

import { colors } from "../styles";
import {
  percentageOfRange,
  roundedPercentageOf,
  createMedian,
  compressor,
} from "./helpers";
import type { HueTypes } from "../types";

export const tempPercentage = percentageOfRange(153, 500);
export const huePercentage = percentageOfRange(0, 65535);
export const satOrBriPercentage = (value: number) =>
  roundedPercentageOf(value, 254);

const getColor = (hsv: HueTypes.HSV) => {
  const color = new TinyColor({ ...hsv, v: compressor(hsv.v, 0.8) });

  return { value: color.toRgbString(), bri: color.getBrightness() };
};

export const lights2background = (
  on: boolean,
  l?: HueTypes.HueLights,
  deg: number = 0
) => {
  const start = { value: `linear-gradient(${deg}deg, `, bri: 0 };

  if (!l)
    return on
      ? getColor({ h: 0, s: 0, v: 0.7 })
      : { ...start, value: undefined };

  const values = Object.values(l);
  const add = createMedian();

  return values.length === 1
    ? getColor(values[0]!)
    : values
        .sort((a, b) => (a.h > b.h ? 1 : -1))
        .reduce(({ value }, hsv, i, arr) => {
          const len = arr.length;
          const last = i === len - 1;
          const { value: rgb, bri } = getColor(hsv);
          const percentage = percentageOfRange(0, len - 1)(i);

          return {
            value: `${value}${rgb} ${percentage}%${last ? ")" : ", "}`,
            bri: add(bri).median,
          };
        }, start);
};

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
