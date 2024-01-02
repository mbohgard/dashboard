import https from "https";

import config from "../../../config";
import type { ApiResponse, HueThermometers } from "../types";

import { axios } from "../../index";

import { min2Ms } from "../../../utils/time";

const { hue } = config;

export const name = "temp";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const get = async () => {
  if (!hue?.settings?.ip || !hue.key) {
    throw Error("Required config for 'ip' and 'key' are missing");
  }

  const res = await axios.get<ApiResponse>(
    `https://${hue.settings.ip}/api/${hue.key}/sensors`,
    {
      headers: {
        "Cache-Control": "no-cache",
      },
      httpsAgent,
    }
  );

  const data = Object.values(res.data).reduce<HueThermometers>(
    (acc, { productname, name, uniqueid, state }) => {
      if (productname?.includes("motion")) {
        acc[uniqueid] = {
          name: name.match(/^\w+/)?.[0]!, // pick first word
          value: -999,
        };
      }

      if (productname?.includes("temperature")) {
        const target = Object.values(acc).find((t) => t.value === -999);

        if (target)
          target.value =
            Number(state.temperature) + (hue?.settings?.tempOffset ?? 0);
      }

      return acc;
    },
    {}
  );

  return {
    service: name,
    data,
  };
};

export const delay = () => min2Ms(1);
