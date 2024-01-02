import config from "../../../config";

import { ConfigError, axios } from "../../index";
import type { ApiResponse } from "../types";

import { min2Ms } from "../../../utils/time";

export const name = "weather";
const { weather } = config;

const request = <T>(name: string, url: string) =>
  axios.get<T>(url).then(({ data }) => ({
    service: name,
    data,
  }));

export const get = async () => {
  const { lon, lat } = weather?.settings ?? {};

  if (!lon || !lat)
    throw ConfigError(name, "Missing 'lon' and/or 'lat' config");

  const smhiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;
  const sunUrl = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;

  const [smhi, sun] = await Promise.all([
    request<ApiResponse["forecast"]>("smhi", smhiUrl),
    request<ApiResponse["sun"]>("sun", sunUrl),
  ]);

  return {
    service: name,
    data: {
      ...smhi.data,
      sun: sun.data,
    },
  };
};

export const delay = () => min2Ms(1);
