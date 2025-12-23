import config from "../../../config";

import { ConfigError, axios } from "../../index";
import dayjs from "dayjs";

import type { Data, ApiResponse } from "../types";
import { min2Ms, sec2Ms } from "../../../utils/time";
import { isAxiosError } from "axios";

export const name = "energy";
const { energy } = config;

const getData = (day: dayjs.Dayjs, axiosData?: ApiResponse): Data | null => {
  if (!axiosData) return null;

  return axiosData.reduce<Data>((acc, item, ix) => {
    const start = dayjs(item.time_start);
    const value = item.SEK_per_kWh * 100;

    acc.average = {
      value: ((acc.average?.value ?? 0) * ix + value) / (ix + 1),
    };

    // only care about full hours
    if (start.minute() !== 0) return acc;

    const time = `${start.format("HH")}-${start.add(1, "hour").format("HH")}`;

    if (day.isAfter(start) && day.isBefore(start.add(1, "hour"))) {
      acc.now = { value, time };
    }

    if ((acc.high?.value ?? -1000) < value) {
      acc.high = { value, time };
    }

    if ((acc.low?.value ?? 1000) > value) {
      acc.low = { value, time };
    }

    return acc;
  }, {});
};

export const get = async () => {
  if (!energy?.zone) throw ConfigError(name, "Missing energy zone config");

  const now = dayjs();
  const days = [
    now.format("YYYY/MM-DD"),
    now.add(1, "day").format("YYYY/MM-DD"),
  ];

  const [todayRes, tomorrowRes] = await Promise.all(
    days.map((d) =>
      axios
        .get<ApiResponse>(
          `https://www.elprisetjustnu.se/api/v1/prices/${d}_${energy.zone}.json`
        )
        .catch((e) => {
          if (isAxiosError(e) && e.status === 404) return null;
          throw e;
        })
    )
  );

  const data = getData(now, todayRes?.data);
  const tomorrow = getData(now.add(1, "day"), tomorrowRes?.data);

  if (!data) {
    throw Error("Could not fetch energy data for today");
  }

  data.tomorrow = tomorrow ?? undefined;

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
