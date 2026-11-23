import config from "../../../config/index.ts";

import { ConfigError, axios } from "../../index.ts";
import type { ApiResponse } from "../types.ts";

import { min2Ms } from "../../../utils/time.ts";

export const name = "time";
const { time } = config;

export const get = async () => {
  if (!time?.key || !time.settings?.timezone)
    throw ConfigError(name, "Missing time api key or timezone config");

  const { timestamp, gmtOffset } = (
    await axios.get<ApiResponse>(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${time.key}&format=json&by=zone&zone=${time.settings.timezone}`,
    )
  ).data;

  return {
    service: name,
    data: timestamp - gmtOffset,
  };
};

export const delay = () => min2Ms(20);
