// @ts-ignore
import convert from "cie-rgb-color-converter";

import { TinyColor } from "@ctrl/tinycolor";
import {
  huePercentage,
  satOrBriPercentage,
  tempPercentage,
} from "../../../utils/color";
import { roundValues } from "../../../utils/helpers";
import type { HueApiLight } from "./types";

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
