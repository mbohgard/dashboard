import https from "https";

import * as config from "../../../../config";

import { axios } from "../index";
import { hue2Hsv } from "./helpers";
import type { ApiResponse } from "./types";

import type {
  HueGroups,
  HueGroupEmit,
  HueApiActionResponse,
  HSV,
  HueLights,
} from "./types";
import { sec2Ms } from "../../../utils/time";
import { round, pick, createMedian } from "../../../utils/helpers";

const url = `https://${config.hue.settings.ip}/api/${config.hue.key}`;

export const name = "hue";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const getLights = (l: ApiResponse["lights"]) => {
  const add = createMedian();

  return Object.entries(l)
    .filter(([, { state }]) => state.on && "colormode" in state)
    .reduce<[number, HueLights]>(
      ([_, lights], [id, light]) => {
        const bri = add(light.state.bri);

        return [
          round(bri.median),
          {
            ...lights,
            [id]: hue2Hsv(light) as HSV,
          },
        ];
      },
      [0, {}]
    );
};

export const get = () =>
  axios
    .get<ApiResponse>(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
      httpsAgent,
    })
    .then(({ data: { lights: allLights, groups } }) => {
      const data = Object.entries(groups).reduce<HueGroups>(
        (acc, [id, { action, state, type, ...group }]) => {
          if (type !== "Room" || group.name === "Inaktiva") return acc;

          const on = state.any_on || state.all_on;
          const [bri, lights] = getLights(pick(allLights, group.lights));

          return {
            ...acc,
            [id]: {
              bri,
              name: group.name,
              class: group.class,
              on,
              lights: Object.keys(lights).length ? lights : null,
            },
          };
        },
        {}
      );

      return {
        service: name,
        data,
      };
    });

export const delay = () => sec2Ms(5);

export const listener = ({ id, ...payload }: HueGroupEmit) =>
  axios
    .request<HueApiActionResponse>({
      url: `${url}/groups/${id}/action`,
      method: "put",
      data: payload,
      httpsAgent,
    })
    .then((res) => {
      const error =
        res.status === 200 && res.data.find((item) => item.error !== undefined);

      if (error) throw Error("Something went wrong with the Hue action");
    });
