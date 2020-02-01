import request from "request";

import * as secrets from "../../../secrets";
import * as config from "../../../config";
import { sec2Ms } from "../../utils/time";
import { emit } from "../";

const url = `https://${config.hue.ip}/api/${secrets.hue}/groups`;

export const name = "hue";

export const get = (): Promise<HueServiceData> =>
  new Promise(resolve =>
    request(
      {
        method: "GET",
        url,
        rejectUnauthorized: false,
        headers: {
          "Cache-Control": "no-cache"
        }
      },
      (error, _, body?) => {
        const res: HueGroupsResponse | undefined = body
          ? JSON.parse(body)
          : undefined;
        const data =
          res &&
          Object.keys(res).reduce((acc, k) => {
            const {
              action: { on, bri, hue, sat, ct },
              ...item
            } = res[k];
            const group: HueGroup = {
              name: item.name,
              class: item.class,
              on,
              bri,
              ct,
              hue,
              sat
            };

            return {
              ...acc,
              [k]: group
            };
          }, {});

        resolve({
          service: "hue",
          error,
          data
        });
      }
    )
  );

export const delay = () => sec2Ms(5);

export const listener = ({ id, ...payload }: HueEmitPayload) => {
  request.put(
    {
      url: `${url}/${id}/action`,
      body: payload,
      rejectUnauthorized: false,
      json: true
    },
    (error, { statusCode }, body?: HueActionReponse) => {
      try {
        if (error) throw error;

        const err =
          statusCode === 200 && body?.find(item => item.error !== undefined);

        if (err) throw err;
      } catch (e) {
        console.error("Something went wrong with the Hue action", e);

        emit({
          service: "hue",
          error: e instanceof Error ? { message: e.message, name: e.name } : e
        });
      }
    }
  );
};
