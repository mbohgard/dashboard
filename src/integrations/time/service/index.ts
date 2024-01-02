import config from "../../../config";

import { ConfigError, axios } from "../../index";
import type { ApiResponse } from "../types";

import { min2Ms } from "../../../utils/time";

export const name = "time";
const { time } = config;

export const get = async () => {
  if (!time?.key || !time.settings?.timezone)
    throw ConfigError(name, "Missing time api key or timezone config");

  return {
    service: name,
    data: (
      await axios.get<ApiResponse>(
        `http://api.timezonedb.com/v2.1/get-time-zone?key=${time.key}&format=json&by=zone&zone=${time.settings.timezone}`
      )
    ).data,
  };
};

export const delay = () => min2Ms(20);
