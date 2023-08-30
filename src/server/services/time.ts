import * as config from "../../../config";
import { axios } from "./index";

import { min2Ms } from "../../utils/time";

export const name = "time";

export const get = () =>
  axios
    .get<TimeZone>(
      `http://api.timezonedb.com/v2.1/get-time-zone?key=${config.time.key}&format=json&by=zone&zone=${config.time.settings.timezone}`
    )
    .then(({ data }) => ({
      service: name,
      data,
    }));

export const delay = () => min2Ms(20);
