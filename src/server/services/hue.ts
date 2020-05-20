import axios from "axios";
import https from "https";

import * as secrets from "../../../secrets";
import * as config from "../../../config";
import { sec2Ms } from "../../utils/time";

const url = `https://${config.hue.ip}/api/${secrets.hue}/groups`;

export const name = "hue";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const get = () =>
  axios
    .get<HueGroupsResponse>(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
      httpsAgent,
    })
    .then(({ data: res }) => {
      const data = Object.keys(res).reduce((acc, k) => {
        const {
          action: { on, bri, hue, sat, ct },
          ...item
        } = res[k];

        return {
          ...acc,
          [k]: {
            name: item.name,
            class: item.class,
            on,
            bri,
            ct,
            hue,
            sat,
          },
        };
      }, {});

      return {
        service: name,
        data,
      };
    });

export const delay = () => sec2Ms(5);

export const listener = ({ id, ...payload }: HueEmitPayload) =>
  axios
    .request<HueActionReponse>({
      url: `${url}/${id}/action`,
      method: "put",
      data: payload,
      httpsAgent,
    })
    .then((res) => {
      const error =
        res.status === 200 && res.data.find((item) => item.error !== undefined);

      if (error) throw Error("Something went wrong with the Hue action");
    });
