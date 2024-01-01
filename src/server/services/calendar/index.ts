import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
// @ts-ignore
import Ical from "ical-expander";

import { axios } from "../index";
import type { CalendarEvent } from "./types";

import * as config from "../../../../config";
import { sec2Ms, ms2Hour } from "../../../utils/time";
import { Colors } from "../../../styles";

export const name = "calendar";

dayjs.extend(isBetween);

const isAllDay = (from: Date, to: Date) =>
  ms2Hour(dayjs(to).diff(dayjs(from))) >= 24;

const createEvent = (
  name: string,
  color: Colors,
  { uid, summary, ...e }: any,
  nowDate: Dayjs,
  now: number
): CalendarEvent => {
  const startDate = e.startDate.toJSDate();
  const endDate = e.endDate.toJSDate();
  const passed = dayjs(endDate).isBefore(now);

  return {
    allDay: isAllDay(startDate, endDate),
    ongoing: nowDate.isBetween(startDate, endDate),
    color,
    end: endDate.getTime(),
    id: uid || startDate.getTime() + summary.replace(" ", "-"),
    name,
    now,
    passed,
    start: startDate.getTime(),
    summary,
  };
};

const sortEvents = <T extends CalendarEvent>(a: T, b: T) => {
  const timeA = a.ongoing ? a.now : a.start;
  const timeB = b.ongoing ? b.now : b.start;

  return timeA > timeB ? 1 : -1;
};

export const get = () => {
  const from = dayjs().startOf("day").toDate();
  const to = dayjs().add(30, "day").startOf("day").toDate();
  const nowDate = dayjs();
  const now = nowDate.valueOf();

  const requests = config.calendar.settings.map(({ name, url, color }) =>
    axios.get(url).then(({ data }) => {
      const ical = new Ical({ ics: data, maxIterations: 100 });
      const { events, occurrences } = ical.between(from, to);

      return [
        ...events.map(({ startDate, endDate, summary, uid }: any) => ({
          startDate,
          endDate,
          summary,
          uid,
        })),
        ...occurrences.map(
          ({ startDate, endDate, item: { summary }, uid }: any) => ({
            startDate,
            endDate,
            summary,
            uid,
          })
        ),
      ].map((e) => createEvent(name, color as Colors, e, nowDate, now));
    })
  );

  return Promise.allSettled(requests).then((events) => ({
    service: name,
    data: events
      .reduce<CalendarEvent[]>(
        (acc, es) => (es.status === "fulfilled" ? [...acc, ...es.value] : acc),
        []
      )
      .sort(sortEvents)
      .filter((_, i) => i < 13),
  }));
};

export const delay = () => sec2Ms(45);
