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
  if (!food?.school) throw ConfigError(name, "Missing food school config");
  const timestamp = (await getTime()).data;

  const date = dayjs.unix(timestamp);
  const week = date.week();
  const year = date.year();
  const weeks = [
    [week, year],
    [week === 52 ? 1 : week + 1, week === 52 ? year + 1 : year],
  ] as const;

  const data = (
    await Promise.all(
      weeks.map(([w, y]) =>
        axios.get<ApiResponse>(
          `https://skolmaten.se/api/4/menu/school/${food.school}?year=${y}&week=${w}`,
          {
            headers: {
              "Client-Token": "web-eaa12e50-c84c-4b4a-9cfe-4e3fcbcd9165",
            },
          }
        )
      )
    )
  )
    .map((res) => res.data.WeekState)
    .flat()
    .filter(Boolean);

  return {
    service: name,
    data,
  };
};

export const delay = () => min2Ms(30);
