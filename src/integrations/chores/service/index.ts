import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { ConfigError, axios } from "../../index";

import config from "../../../config";
import { parseCalendarData } from "../../calendar/service";
import { min2Ms } from "../../../utils/time";
import type { Chore, Period, Status } from "../types";
import { swtch } from "../../../utils/helpers";

dayjs.extend(duration);

export const name = "chores";
const { chores } = config;

type SortInput = {
  start: dayjs.Dayjs;
};

const sortEvents = (a: SortInput, b: SortInput) => {
  const timeA = a.start.valueOf();
  const timeB = b.start.valueOf();

  return timeA > timeB ? 1 : -1;
};

const getStatus = (
  period: Period,
  now: dayjs.Dayjs,
  start: dayjs.Dayjs
): Status => {
  if (start.isBefore(now)) return "urgent";

  if (period === "week" || period === "month")
    return start.subtract(1, "week").isBefore(now) ? "close" : "normal";

  return start.subtract(3, "days").isBefore(now) ? "close" : "normal";
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
      .map(({ id, summary, ...e }) => {
        let [text, p] = summary.split("$");
        const period = (swtch(p, ["day", "day"], ["week", "week"]) ??
          "month") as Period;
        const start =
          swtch(
            period,
            ["day", dayjs(e.start).endOf("day")],
            ["week", dayjs(e.start).endOf("week")]
          ) ?? dayjs(e.start).endOf("month");

        return {
          id,
          summary: text!,
          start,
          period,
          status: getStatus(period, now, start),
        };
      })
      .sort(sortEvents)
      .map<Chore>(({ start, ...rest }) => ({
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
