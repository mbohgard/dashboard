import dayjs from "dayjs";
// @ts-ignore

import { ConfigError, axios } from "../../index";

import config from "../../../config";
import { parseCalendarData } from "../../calendar/service";
import { min2Ms } from "../../../utils/time";
import type { Chore, Period } from "../types";
import { swtch } from "../../../utils/helpers";

export const name = "chores";
const { chores } = config;

const sortEvents = (a: Chore, b: Chore) => {
  const timeA =
    swtch(
      a.period,
      ["day", dayjs(a.start).endOf("day").valueOf()],
      ["week", dayjs(a.start).endOf("week").valueOf()]
    ) ?? dayjs(a.start).endOf("month").valueOf();
  const timeB =
    swtch(
      b.period,
      ["day", dayjs(b.start).endOf("day").valueOf()],
      ["week", dayjs(b.start).endOf("week").valueOf()]
    ) ?? dayjs(b.start).endOf("month").valueOf();

  return timeA > timeB ? 1 : -1;
};

export const get = async () => {
  if (!chores?.url) throw ConfigError(name, "Missing chores url");

  const from = dayjs().startOf("month").toDate();
  const to = dayjs().add(12, "month").toDate();

  const data = (await axios.get(chores.url)).data;

  return {
    service: name,
    data: parseCalendarData({ data, from, to, name })
      .map<Chore>(({ id, summary, description, ...e }) => {
        const start = dayjs(e.start);
        let [text, p] = summary.split("$");

        return {
          id,
          summary: text!,
          description,
          start: e.start,
          year: start.year(),
          month: start.month(),
          week: start.week(),
          date: start.date(),
          period: (swtch(p, ["day", "day"], ["week", "week"]) ??
            "month") as Period,
        };
      })
      .sort(sortEvents)
      .filter((_, ix) => ix < 20),
    meta: {
      label: chores.label,
    },
  };
};

export const delay = () => min2Ms(1);
