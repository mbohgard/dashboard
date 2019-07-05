import * as request from "request";

import * as secrets from "../../secrets";
import * as config from "../../config";
import { min2Ms } from "../utils/time";

export const get = (): Promise<TimeServiceData> =>
  new Promise(resolve =>
    request(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${secrets.time}&format=json&by=zone&zone=${config.time.timezone}`,
      (err, _, body) => {
        let data;
        let error = err;

        try {
          data = JSON.parse(body);
        } catch (e) {
          error = error || e;
        }

        resolve({
          service: "time",
          error,
          data
        });
      }
    )
  );

export const delay = () => min2Ms(20);
