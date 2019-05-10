import * as request from "request";

import * as secrets from "../../secrets";
import * as config from "../../config";
import { sec2Ms } from "../utils/time";

const url = `https://${config.hue.ip}/api/${secrets.hue}/groups`;

export const get = (): Promise<HueServiceData> =>
  new Promise(resolve =>
    request(
      {
        method: "GET",
        url,
        rejectUnauthorized: false
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
    (error?, _?, body?: HueActionReponse) => {
      const err = body && body.find(item => item.error !== undefined);

      if (error)
        console.error("Something went wrong with the Hue action", error);
      if (err) console.error(err.error);
    }
  );
};
