import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

import { ConfigError, axios } from "../../index.ts";

import config from "../../../config/index.ts";
import { parseCalendarData } from "../../calendar/service/index.ts";
import { min2Ms } from "../../../utils/time.ts";
import type { Period, Status } from "../types.ts";
import { swtch } from "../../../utils/helpers.ts";
import type { CalendarEvent } from "../../calendar/types.ts";

dayjs.extend(duration);

export const name = "chores";
const { chores } = config;

const getStatus = (
  period: Period,
  now: dayjs.Dayjs,
  start: dayjs.Dayjs,
): Status => {
  if (start.isBefore(now)) return "urgent";

  if (period === "week" || period === "month")
    return start.subtract(1, "week").isBefore(now) ? "close" : "normal";

  return start.subtract(3, "days").isBefore(now) ? "close" : "normal";
};

const mapEvents =
  (now: dayjs.Dayjs) =>
  ({ id, summary, ...e }: CalendarEvent) => {
    let [text, p] = summary.split("$");
    const period = (swtch(p, ["day", "day"], ["week", "week"]) ??
      "month") as Period;
    const start =
      swtch(
        period,
        ["day", dayjs(e.start).endOf("day")],
        ["week", dayjs(e.start).endOf("week")],
      ) ?? dayjs(e.start).endOf("month");

    return {
      id,
      summary: text!,
      start,
      period,
      status: getStatus(period, now, start),
    };
  };

type MappedEvent = ReturnType<ReturnType<typeof mapEvents>>;

const sortEvents = (a: MappedEvent, b: MappedEvent) => {
  const timeDiff = a.start.valueOf() - b.start.valueOf();
  if (timeDiff !== 0) return timeDiff;

  return a.summary.localeCompare(b.summary, undefined, { sensitivity: "base" });
};

export const get = async () => {
  if (!chores?.url) throw ConfigError(name, "Missing chores url");

  const now = dayjs();
  const from = dayjs().subtract(1, "month").startOf("month").toDate();
  const to = dayjs().add(12, "month").toDate();

  const data = (await axios.get(chores.url)).data;

  return {
    service: name,
    data: parseCalendarData({ data, from, to, name })
      .map(mapEvents(now))
      .sort(sortEvents)
      .map(({ start, ...rest }) => ({
        ...rest,
        start: start.valueOf(),
        year: start.year(),
        month: start.month(),
        week: start.week(),
      }))
      .filter((_, ix) => ix < 30),
    meta: {
      label: chores.label,
    },
  };
};

export const delay = () => min2Ms(1);
