// @ts-ignore
import convert from "cie-rgb-color-converter";
import { TinyColor } from "@ctrl/tinycolor";

import {
  roundValues,
  percentageOfRange,
  roundedPercentageOf,
  createMedian,
  compressor,
} from "./helpers";

export const tempPercentage = percentageOfRange(153, 500);
export const huePercentage = percentageOfRange(0, 65535);
export const satOrBriPercentage = (value: number) =>
  roundedPercentageOf(value, 254);

export const hue2Hsv = (light: HueApiLight) => {
  let hsv;
  const { state } = light;
  const v = satOrBriPercentage(state.bri) / 100;

  if (!("colormode" in state)) hsv = { h: 0, s: 0, v };
  else if (state.colormode === "ct") {
    const mix = new TinyColor("#d9f2ff")
      .mix(new TinyColor("#ffcd78"), tempPercentage(state.ct))
      .toHsv();

    hsv = new TinyColor({
      ...mix,
      v: 1,
    }).toHsv();
  } else if (state.colormode === "xy") {
    const [x, y] = state.xy;
    const rgb = convert.xyBriToRgb(x, y, state.bri);
    hsv = new TinyColor(rgb).toHsv();
  } else {
    hsv = new TinyColor({
      h: huePercentage(state.hue),
      s: satOrBriPercentage(state.sat),
      v,
    }).toHsv();
  }

  return roundValues(hsv);
};

const getColor = (hsv: HSV) => {
  const color = new TinyColor({ ...hsv, v: compressor(hsv.v, 0.8) });

  return { value: color.toRgbString(), bri: color.getBrightness() };
};

export const lights2background = (
  on: boolean,
  l?: HueLights,
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
    ? getColor(values[0])
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
