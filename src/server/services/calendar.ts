import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
// @ts-ignore
import Ical from "ical-expander";

import * as secrets from "../../../secrets";
import { sec2Ms, ms2Hour } from "../../utils/time";
import { Colors } from "../../styles";

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
  const to = dayjs().add(14, "day").startOf("day").toDate();
  const nowDate = dayjs();
  const now = nowDate.valueOf();

  const requests = secrets.calendar.map(({ name, url, color }) =>
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

  return Promise.all(requests).then((events) => ({
    service: name,
    data: events.reduce((acc, es) => [...acc, ...es], []).sort(sortEvents),
  }));
};

// export const get = () =>
//   Promise.resolve({
//     service: name,
//     data: [
//       {
//         allDay: true,
//         ongoing: false,
//         color: "purlpe",
//         end: 1591740000000,
//         id: "5s4vrtvd3p1rlvpcaatp4s0nck@google.com",
//         name: "tuva",
//         now: 1591823786175,
//         passed: true,
//         start: 1591653600000,
//         summary: "läkare ska ringa",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1591797600000,
//         id: "492bfpq2c9j0vn8urqqua81to0@google.com",
//         name: "tuva",
//         now: 1591823786175,
//         passed: true,
//         start: 1591794000000,
//         summary: "läkartid",
//       },
//       {
//         allDay: true,
//         ongoing: true,
//         color: "blue",
//         end: 1591826400000,
//         id: "61v2i32rvb1op3iie9bv2vqkh8@google.com",
//         name: "martin",
//         now: 1591823786175,
//         passed: false,
//         start: 1591567200000,
//         summary: "PROVA HELDAG",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592132400000,
//         id: "a33013f4-bf30-4711-9715-f9a2e0c5c80f",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592127000000,
//         summary: "Visning Båtsman Nähls väg  41\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592134200000,
//         id: "3d25d2b3-0610-4dfc-abc5-e5d2f999fdfd",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592131500000,
//         summary: "Visning Björkvägen 14A\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592136000000,
//         id: "4ba772ed-15eb-4a0d-bbbd-ca786a6c1d35",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592132400000,
//         summary: "Visning Brudsporregränd 2\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592141400000,
//         id: "f8f977ac-cec2-4ecd-bcfd-3eeb57fde579",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592132401000,
//         summary: "Visning Gryningsvägen 40\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592138700000,
//         id: "93b0c313-2adb-4d02-9779-abb6ad482475",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592136000000,
//         summary: "Visning Hägervägen 9\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592145000000,
//         id: "0ebf47f1-8b84-4b0f-918b-0e7211abe166",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592142300000,
//         summary: "Visning Mellangårdsvägen 7\n",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592474400000,
//         id: "5o0rk0g10jho2jnpmgg19ng1c4@google.com",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592460000000,
//         summary: "Jobba på kontoret",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "blue",
//         end: 1592485200000,
//         id: "1592463600000Städning",
//         name: "martin",
//         now: 1591823786175,
//         passed: false,
//         start: 1592463600000,
//         summary: "Städning",
//       },
//       {
//         allDay: false,
//         ongoing: false,
//         color: "purlpe",
//         end: 1592478000000,
//         id: "f1tjli5r481ov97l9dg550e51k@google.com",
//         name: "tuva",
//         now: 1591823786175,
//         passed: false,
//         start: 1592474400000,
//         summary: "Lunch med Mira",
//       },
//       {
//         allDay: true,
//         ongoing: false,
//         color: "red",
//         end: 1592604000000,
//         id: "Midsommarafton-20200619@kalender.link",
//         name: "helgdagar",
//         now: 1591823786175,
//         passed: false,
//         start: 1592517600000,
//         summary: "Midsommarafton",
//       },
//       {
//         allDay: true,
//         ongoing: false,
//         color: "red",
//         end: 1592690400000,
//         id: "Sommarsolstandet-20200620@kalender.link",
//         name: "helgdagar",
//         now: 1591823786175,
//         passed: false,
//         start: 1592604000000,
//         summary: "Sommarsolståndet",
//       },
//       {
//         allDay: true,
//         ongoing: false,
//         color: "red",
//         end: 1592690400000,
//         id: "Midsommardagen-20200620@kalender.link",
//         name: "helgdagar",
//         now: 1591823786175,
//         passed: false,
//         start: 1592604000000,
//         summary: "Midsommardagen",
//       },
//       {
//         allDay: true,
//         ongoing: false,
//         color: "blue",
//         end: 1593986400000,
//         id: "A39BCD46-EB7E-4AE9-A14F-3ABA3FDC38BB",
//         name: "martin",
//         now: 1591823786175,
//         passed: false,
//         start: 1592690400000,
//         summary: "Stina till Koster",
//       },
//       {
//         allDay: true,
//         ongoing: false,
//         color: "blue",
//         end: 1595196000000,
//         id: "CBE9DB4E-8B53-420E-8AE7-FBC188DB16CC",
//         name: "martin",
//         now: 1591823786175,
//         passed: false,
//         start: 1592863200000,
//         summary: "Anna till Koster",
//       },
//     ],
//   });

export const delay = () => sec2Ms(15);
