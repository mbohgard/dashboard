import https from "https";

import * as config from "../../../../config";
import type { ApiResponse, HueThermometers } from "./types";

import { axios } from "../index";

import { min2Ms } from "../../../utils/time";

const url = `https://${config.hue.settings.ip}/api/${config.hue.key}/sensors`;

export const name = "temp";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const get = () =>
  axios
    .get<ApiResponse>(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
      httpsAgent,
    })
    .then(({ data: tempData }) => {
      const data = Object.values(tempData).reduce<HueThermometers>(
        (acc, { productname, name, uniqueid, state }) => {
          if (productname?.includes("motion")) {
            acc[uniqueid] = {
              name: name.match(/^\w+/)?.[0]!, // pick first word
              value: -999,
            };
          }

          if (productname?.includes("temperature")) {
            const target = Object.values(acc).find((t) => t.value === -999);

            if (target) target.value = state.temperature as number;
          }

          return acc;
        },
        {}
      );

      return {
        service: name,
        data,
      };
    });

export const delay = () => min2Ms(1);
