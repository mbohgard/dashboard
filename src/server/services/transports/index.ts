import * as config from "../../../../config";

import { axios } from "../index";
import type { ApiResponse } from "./types";

import { min2Ms, sec2Ms } from "../../../utils/time";
import { wait } from "../../../utils/helpers";

export const name = "transports";

const getTransportUrl = (types: string[], siteId: string) => {
  const q = (t: string) => `&${t}=${String(types.includes(t))}`;

  return `http://api.sl.se/api2/realtimedeparturesV4.json?key=${
    config.transports.key
  }&siteId=${siteId}&timewindow=60${q("bus")}${q("train")}${q("metro")}${q(
    "ship"
  )}${q("tram")}`;
};

const callers = config.transports.settings.map(
  ({ types, siteId }) =>
    (delay: number) =>
      wait(delay).then(() =>
        axios
          .get<ApiResponse>(getTransportUrl(types, siteId))
          .then(({ data }) => ({
            ...data,
            siteId,
          }))
      )
);

type Data = Awaited<ReturnType<(typeof callers)[number]>>;

export const get = () =>
  Promise.all(callers.map((call, i) => call(sec2Ms(i * 2)))).then(
    (responses) => {
      const start = {
        service: name,
        meta: {
          sites: config.transports.settings,
        },
      };

      return responses.reduce(
        (acc, r) => {
          acc.data.push(r);
          return acc;
        },
        start as typeof start & { data: Data[] }
      );
    }
  );

export const delay = () => {
  const time = new Date();
  const day = time.getDay();
  const weekend = day === 0 || day === 6;
  const hour = time.getHours();
  const dayTime = (weekend ? hour >= 8 : hour >= 7) && hour <= 21;
  const peakTime =
    !weekend && ((hour >= 7 && hour <= 8) || (hour >= 15 && hour <= 16));

  if (peakTime) sec2Ms(20);

  if (dayTime) sec2Ms(30);

  return min2Ms(1);
};
