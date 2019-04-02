import * as request from "request";

import * as config from "../../config";
import { ServiceResponse } from "./index";
import { min2Ms } from "../utils/time";

const weather: ServiceResponse = new Promise(resolve =>
  request(
    `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${
      config.weather.lon
    }/lat/${config.weather.lat}/data.json`,
    (error, _, body) =>
      resolve({
        service: "smhi",
        error,
        data: body ? JSON.parse(body) : undefined
      })
  )
);

const sun: ServiceResponse = new Promise(resolve =>
  request(
    `https://api.sunrise-sunset.org/json?lat=${config.weather.lat}&lng=${
      config.weather.lon
    }`,
    (error, _, body) =>
      resolve({
        service: "sun",
        error,
        data: body ? JSON.parse(body) : undefined
      })
  )
);

export const get = (): ServiceResponse =>
  Promise.all([weather, sun]).then(([weather, sun]) => ({
    service: "weather",
    data: {
      ...weather.data,
      sun: sun.data
    },
    error: weather.error || sun.error
  }));

export const delay = () => min2Ms(5);
