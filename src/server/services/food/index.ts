import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

import * as config from "../../../../config";
import { axios } from "../index";
import type { ApiResponse } from "./types";

import { min2Ms } from "../../../utils/time";

import { get as getTime } from "../time";

export const name = "food";

dayjs.extend(weekOfYear);

export const get = () =>
  getTime().then(({ data }) => {
    const timestamp = data.timestamp - data.gmtOffset;
    const date = dayjs.unix(timestamp);

    return axios
      .get<ApiResponse>(
        `https://skolmaten.se/api/4/menu/?station=${
          config.food.station
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
      .then(({ data }) => ({
        service: name,
        data: data.menu.weeks,
      }));
  });

export const delay = () => min2Ms(30);
