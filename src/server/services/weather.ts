import * as config from "../../../config";
import { axios } from "./index";

import { min2Ms } from "../../utils/time";
import { retry } from "../../utils/retry";

const request = <T>(name: string, url: string) =>
  axios.get<T>(url).then(({ data }) => ({
    service: name,
    data,
  }));

export const name = "weather";

const { lon, lat } = config.weather.settings;
const smhiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;
const sunUrl = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;

export const get = (): Promise<WeatherServiceData> =>
  Promise.all([
    retry(request<Forecast>("smhi", smhiUrl)),
    retry(request<Sun>("sun", sunUrl)),
  ]).then(([smhi, sun]) => ({
    service: name,
    data: {
      ...smhi.data,
      sun: sun.data,
    },
  }));

export const delay = () => min2Ms(1);
