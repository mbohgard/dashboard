import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
// @ts-ignore
import Ical from "ical-expander";

import { ConfigError, axios } from "../../index";
import type { CalendarEvent } from "../types";

import config from "../../../config";
import { sec2Ms, ms2Hour } from "../../../utils/time";
import { Colors } from "../../../styles";

export const name = "calendar";
const { calendar } = config;

dayjs.extend(isBetween);

const isAllDay = (from: Date, to: Date) =>
  ms2Hour(dayjs(to).diff(dayjs(from))) >= 24;

const createEvent = (
  name: string,
  color: Colors,
  { uid, summary, description, ...e }: any,
  nowDate: Dayjs,
  now: number
): CalendarEvent => {
  const startDate = e.startDate.toJSDate();
  const endDate = e.endDate.toJSDate();
  const passed = dayjs(endDate).isBefore(now);
  const start = startDate.getTime();

  return {
    allDay: isAllDay(startDate, endDate),
    ongoing: nowDate.isBetween(startDate, endDate),
    color,
    end: endDate.getTime(),
    id: `${uid}-${start}`, // recurring events have the same uid - adding start time to differentiate
    name,
    now,
    passed,
    start,
    summary,
    description,
  };
};

export const sortEvents = <
  T extends Pick<CalendarEvent, "ongoing" | "start" | "now">,
>(
  a: T,
  b: T
) => {
  const timeA = a.ongoing ? a.now : a.start;
  const timeB = b.ongoing ? b.now : b.start;

  return timeA > timeB ? 1 : -1;
};

const priority = calendar?.settings?.map((x) => x.name!) ?? [];

export const parseCalendarData = ({
  data,
  from,
  to,
  name,
  color,
}: {
  data: any;
  from: Date;
  to: Date;
  name: string;
  color?: string;
}) => {
  const nowDate = dayjs();
  const now = nowDate.valueOf();
  const ical = new Ical({ ics: data, maxIterations: 100 });
  const { events, occurrences } = ical.between(from, to);

  return (
    [
      ...events.map(
        ({ startDate, endDate, summary, description = "", uid }: any) => {
          return {
            startDate,
            endDate,
            summary,
            description,
            uid,
          };
        }
      ),
      ...occurrences.map(
        ({
          startDate,
          endDate,
          item: { summary, description = "", uid },
        }: any) => {
          return {
            startDate,
            endDate,
            summary,
            description,
            uid,
          };
        }
      ),
    ]
      .map((e) => createEvent(name, color as Colors, e, nowDate, now))
      // remove duplicates (same id in both events and occurrences)
      .reduce<CalendarEvent[]>((acc, event) => {
        if (acc.find((e) => e.id === event.id)) return acc;
        acc.push(event);
        return acc;
      }, [])
  );
};

export const get = async () => {
  if (!calendar?.settings) throw ConfigError(name, "Missing calendar settings");

  const from = dayjs().startOf("day").toDate();
  const to = dayjs().add(30, "day").startOf("day").toDate();

  const requests = calendar.settings.map(
    async ({ name: calendarName, url, color }) => {
      if (!url || !calendarName)
        throw ConfigError(name, "Missing url and/or name for calendar");

      const data = (await axios.get(url)).data;

      return parseCalendarData({ data, from, to, name: calendarName, color });
    }
  );

  return Promise.allSettled(requests).then((events) => ({
    service: name,
    data: events
      .reduce<CalendarEvent[]>(
        (acc, es) => (es.status === "fulfilled" ? [...acc, ...es.value] : acc),
        []
      )
      .reduce<CalendarEvent[]>((acc, item, ix) => {
        let duplicateIndex = -1;
        const duplicate = acc.find((e) => {
          const isDup =
            e.start === item.start &&
            e.end === item.end &&
            e.summary === item.summary;

          if (isDup && priority.indexOf(item.name) < priority.indexOf(e.name)) {
            duplicateIndex = ix;
          }

          return isDup;
        });

        if (duplicate && duplicateIndex > -1) {
          acc[duplicateIndex] = item;
        }

        return duplicate ? acc : [...acc, item];
      }, [])
      .sort(sortEvents)
      .filter((_, i) => i < 20),
  }));
};

export const delay = () => sec2Ms(45);
