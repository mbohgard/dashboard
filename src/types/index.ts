export type * from "../server/services";

export type * as HueTypes from "../server/services/hue/types";
export type * as WeatherTypes from "../server/services/weather/types";
export type * as TransportsTypes from "../server/services/transports/types";
export type * as SonosTypes from "../server/services/sonos/types";

export type ValueOf<T> = T[keyof T];
