import dayjs from "dayjs";
import { v4 as uuid } from "uuid";

import { axios, ConfigError } from "../../index";
import config from "../../../config";

import type {
  Data,
  DayResponse,
  NamsorApiBody,
  NamsorApiResponse,
} from "../types";

export const name = "dayinfo";
const { dayinfo } = config;

let genderCache: {
  date?: string;
  data?: NamsorApiResponse;
} = {};

export const get = async () => {
  const { namsorApiKey, birthdays } = dayinfo ?? {};

  if (!namsorApiKey)
    throw ConfigError(name, "Missing dayinfo `namsorApiKey` config");

  const today = dayjs();
  const datePath = today.format("YYYY/MM/DD");
  const day = (
    await axios.get<DayResponse>(
      `https://sholiday.faboul.se/dagar/v2.1/${datePath}`
    )
  ).data.dagar[0]!;

  const namsorBody: NamsorApiBody = {
    personalNames: day?.namnsdag?.map((name) => ({
      id: uuid(),
      firstName: name,
      countryIso2: "SE",
    })),
  };

  // only query gender api once per day
  const genderData =
    genderCache.date === datePath
      ? genderCache.data!
      : (
          await axios.post<NamsorApiResponse>(
            `https://v2.namsor.com/NamSorAPIv2/api2/json/genderGeoBatch`,
            namsorBody,
            {
              headers: {
                "X-API-KEY": namsorApiKey,
              },
            }
          )
        ).data;

  genderCache = {
    date: datePath,
    data: genderData,
  };

  const data = {
    birthday: (birthdays ?? []).reduce<null | string>(
      (acc, { name, month, day }) =>
        month === today.month() + 1 && day === today.date() ? name : acc,
      null
    ),
    names: genderData.personalNames.map(
      ({ firstName: name, likelyGender: gender }) => ({
        name,
        gender,
      })
    ),
    flag: Boolean(day?.flaggdag),
    red: Boolean(day?.["röd dag"]),
  } satisfies Data;

  return {
    service: name,
    data,
  };
};

export const delay = () => {
  const now = dayjs();
  const nextHour = now.endOf("hour").add(2, "second");
  const diff = nextHour.valueOf() - now.valueOf();

  return diff;
};
