import * as request from "request";

import * as secrets from "../../secrets";
import * as config from "../../config";
import { ServiceResponse } from "./index";
import { min2Ms } from "../utils/time";

export const get = (): ServiceResponse =>
  new Promise(resolve =>
    request(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${
        secrets.time
      }&format=json&by=zone&zone=${config.time.timezone}`,
      (error, _, body) =>
        resolve({
          service: "time",
          error,
          data: body ? JSON.parse(body) : undefined
        })
    )
  );

export const delay = () => min2Ms(20);
