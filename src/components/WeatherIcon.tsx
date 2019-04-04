import * as React from "react";

import {
  clear,
  clearNight,
  cloudy,
  drizzle,
  fog,
  half,
  halfNight,
  overcast,
  rain,
  snow,
  thunder,
  thunderstorm,
  variable,
  variableNight
} from "./Icon";

export const WeatherIcon: React.SFC<{ code: number; night: boolean }> = ({
  code,
  night
}) => {
  const iconMap: { [code: number]: JSX.Element } = {
    1: night ? clearNight : clear,
    2: night ? clearNight : clear,
    3: night ? variableNight : variable,
    4: night ? halfNight : half,
    5: cloudy,
    6: overcast,
    7: fog,
    8: drizzle,
    9: drizzle,
    10: rain,
    11: thunderstorm,
    12: drizzle,
    13: drizzle,
    14: rain,
    15: snow,
    16: snow,
    17: snow,
    18: drizzle,
    19: rain,
    20: rain,
    21: thunder,
    22: drizzle,
    23: rain,
    24: rain,
    25: snow,
    26: snow,
    27: snow
  };

  return code in iconMap ? <>{iconMap[code]}</> : <noscript />;
};
