import config from "../../../config";

import { ConfigError, axios } from "../../index";
import dayjs from "dayjs";
import type { PartialDeep } from "type-fest";

import type { Data, ApiResponse, Areas } from "../types";
import { min2Ms, sec2Ms } from "../../../utils/time";

export const name = "energy";
const { energy } = config;

const zones: { [Key in "SE1" | "SE2" | "SE3" | "SE4"]: Areas } = {
  SE1: "One",
  SE2: "Two",
  SE3: "Three",
  SE4: "Four",
};

export const get = async () => {
  if (!energy?.zone) throw ConfigError(name, "Missing energy zone config");

  const { data: res } = await axios.get<ApiResponse>(
    "https://www.elmarknad.se/api/spotprice/current"
  );

  const now = dayjs().startOf("hour").format("HH:mm");
  const zone = zones[(energy.zone as keyof typeof zones) || "SE3"];
  const data = res.reduce<Data>((acc, { CreatedDate, ...h }, ix, arr) => {
    const date = dayjs(CreatedDate);
    const time = `${date.format("HH")}-${date.add(1, "hour").format("HH")}`;
    const current = h[`CurrentArea${zone}`];
    const average = h[`AverageArea${zone}`];
    const forecast = h[`ForecastArea${zone}`];

    const isCurrent = date.format("HH:mm") === now;
    const isLast = ix + 1 === arr.length;

    acc.now = isCurrent
      ? {
          value: current,
          time,
        }
      : acc.now;

    acc.average = { value: average };

    if ((acc.high?.value ?? -1000) < current) {
      acc.high = {
        value: current,
        time,
      };
    }

    if ((acc.low?.value ?? 1000) > current) {
      acc.low = {
        value: current,
        time,
      };
    }

    if ((acc.tomorrow?.high?.value ?? -1000) < forecast) {
      acc.tomorrow = {
        ...acc.tomorrow,
        high: {
          value: forecast,
          time,
        },
      };
    }

    if ((acc.tomorrow?.low?.value ?? 1000) > forecast) {
      acc.tomorrow = {
        ...acc.tomorrow,
        low: {
          value: forecast,
          time,
        },
      };
    }

    const averageSum = (acc.tomorrow?.average?.value ?? 0) + forecast;
    acc.tomorrow = {
      ...acc.tomorrow,
      average: {
        value: isLast ? averageSum / arr.length : averageSum,
      },
    };

    if (isLast && acc.tomorrow.average?.value === 0) {
      delete acc.tomorrow;
    }

    return acc;
  }, {});

  return {
    service: name,
    data,
  };
};

export const delay = () => {
  const now = dayjs();
  const nextHour = now.endOf("hour").add(2, "second");
  const diff = nextHour.valueOf() - now.valueOf();
  const tenSec = sec2Ms(10);
  const fiveMin = min2Ms(5);

  if (diff < tenSec) return tenSec;
  if (diff > fiveMin) return fiveMin;

  return diff;
};
