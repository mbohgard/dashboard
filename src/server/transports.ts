import * as request from "request";

import * as secrets from "../../secrets";
import * as config from "../../config";
import { ServiceResponse } from "./index";
import { min2Ms, sec2Ms } from "../utils/time";

const getDelay = () => {
  const time = new Date();
  const day = time.getDay();
  const weekend = day === 0 || day === 6;
  const hour = time.getHours();
  const dayTime = (weekend ? hour >= 8 : hour >= 7) && hour <= 21;
  const peakTime =
    !weekend && ((hour >= 7 && hour <= 8) || (hour >= 15 && hour <= 16));

  if (peakTime) {
    return sec2Ms(20);
  }

  if (dayTime) {
    return sec2Ms(30);
  }

  return min2Ms(1);
};

const getTransportUrl = (types: string[], siteId: string) => {
  const q = (t: string) => `&${t}=${String(types.includes(t))}`;

  return `http://api.sl.se/api2/realtimedeparturesV4.json?key=${
    secrets.transports
  }&siteId=${siteId}&timewindow=60${q("bus")}${q("train")}${q("metro")}${q(
    "ship"
  )}${q("tram")}`;
};

const callers = config.transports.map(t => (delay: number): ServiceResponse<
  Timetable
> =>
  new Promise(resolve =>
    setTimeout(
      () =>
        request(getTransportUrl(t.types, t.siteId), (error, _, body) =>
          resolve({
            service: "transports",
            error,
            data: body ? JSON.parse(body) : undefined
          })
        ),
      delay
    )
  )
);

const requests = async () => {
  let results: ServiceData | undefined;

  for (const call of callers) {
    const result = await call(results ? sec2Ms(2) : 0);

    results = results
      ? {
          ...results,
          data: [
            ...(Array.isArray(results.data) ? results.data : [results.data]),
            result.data
          ]
        }
      : result;
  }

  return results as TransportsServiceData;
};

export const get = () => requests();

export const delay = () => getDelay();
