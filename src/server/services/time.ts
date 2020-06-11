import axios from "axios";

import * as secrets from "../../../secrets";
import * as config from "../../../config";
import { min2Ms } from "../../utils/time";

export const name = "time";

export const get = () =>
  axios
    .get<TimeZone>(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${secrets.time}&format=json&by=zone&zone=${config.time.timezone}`
    )
    .then(({ data }) => ({
      service: name,
      data,
    }));

export const delay = () => min2Ms(20);
