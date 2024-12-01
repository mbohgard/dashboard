import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

import config from "../../../config";
import { ConfigError, axios } from "../../index";
import type { ApiResponse } from "../types";

import { min2Ms } from "../../../utils/time";

import { get as getTime } from "../../time/service";

export const name = "food";
const { food } = config;

dayjs.extend(weekOfYear);

export const get = async () => {
  if (!food?.station) throw ConfigError(name, "Missing food station config");
  const timestamp = (await getTime()).data;

  const date = dayjs.unix(timestamp);

  const data = (
    await axios.get<ApiResponse>(
      `https://skolmaten.se/api/4/menu/?station=${
        food.station
      }&year=${date.year()}&weekOfYear=${date.week()}&count=2`,
      {
        headers: {
          Locale: "sv_SE",
          "Api-Version": "4.0",
          "Client-Token": "web",
          "Client-Version-Token": "web",
        },
      }
    )
  ).data;

  return {
    service: name,
    data: data.menu.weeks,
  };
};

export const delay = () => min2Ms(30);
