import * as request from "request";

import * as config from "../../config";
import { ServiceResponse } from "./index";
import { min2Ms } from "../utils/time";

export const get = (): ServiceResponse =>
  new Promise(resolve =>
    request(
      `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${
        config.weather.lon
      }/lat/${config.weather.lat}/data.json`,
      (error, _, body) =>
        resolve({
          service: "weather",
          error,
          data: body ? JSON.parse(body) : undefined
        })
    )
  );

export const delay = () => min2Ms(5);
