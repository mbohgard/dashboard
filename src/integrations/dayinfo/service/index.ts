import { axios, ConfigError } from "../../index";
import dayjs from "dayjs";
import config from "../../../config";

import type { Data, DayResponse, NameResponse } from "../types";

export const name = "dayinfo";
const { dayinfo } = config;

export const get = async () => {
  const { genderKey, birthdays } = dayinfo ?? {};

  if (!genderKey)
    throw ConfigError(name, "Missing dayinfo gender api key config");

  const today = dayjs();
  const path = today.format("YYYY/MM/DD");
  const day = (
    await axios.get<DayResponse>(
      `https://sholiday.faboul.se/dagar/v2.1/${path}`
    )
  ).data.dagar[0];

  const namesInfoProms = day?.namnsdag?.map((name) =>
    axios.get<NameResponse>(
      `https://api.genderapi.io/api/?name=${name}&key=${genderKey}`
    )
  );

  const nameInfo = namesInfoProms
    ? (await Promise.all(namesInfoProms)).map((r) => r.data)
    : [];

  const data: Data = {
    birthday: (birthdays ?? []).reduce<null | string>(
      (acc, { name, month, day }) =>
        month === today.month() + 1 && day === today.date() ? name : acc,
      null
    ),
    names: nameInfo.map(({ name, gender }) => ({
      name,
      gender,
    })),
    flag: Boolean(day?.flaggdag),
    red: Boolean(day?.["röd dag"]),
  };

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
