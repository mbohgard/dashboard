import request from "request";

import * as secrets from "../../../secrets";
import * as config from "../../../config";
import { sec2Ms, min2Ms } from "../../utils/time";

const {
  voc: { region }
} = config;
const url = `https://vocapi${
  region ? `${region}-` : ""
}.wirelesscar.net/customerapi/rest/v3.0/vehicles/${secrets.voc.vin}`;

export const name = "voc";

export const get = (): Promise<VOCServiceData> =>
  new Promise(resolve =>
    request(
      {
        auth: {
          username: secrets.voc.username,
          password: secrets.voc.password
        },
        method: "GET",
        headers: {
          "cache-control": "no-cache",
          "content-type": "application/json",
          "x-device-id": "Device",
          "x-originator-type": "App",
          "x-os-type": "Android",
          "x-os-version": "22"
        },
        url: `${url}/status`
      },
      (err, _, body?) => {
        try {
          const res: VOCResponse | undefined = body && JSON.parse(body);
          const data =
            res && "ERS" in res
              ? {
                  locked: res.carLocked,
                  running:
                    res.engineRunning || res.ERS.status === "onByDirectCtrl"
                }
              : undefined;
          const error = res && "errorLabel" in res ? res : err;

          resolve({
            service: "voc",
            error,
            data
          });
        } catch (error) {
          resolve({
            service: "voc",
            error
          });
        }
      }
    )
  );

export const delay = () => {
  const d = new Date();
  const day = d.getDay();
  const weekend = day === 0 || day === 6;
  const hour = d.getHours();

  if (hour < 7) return min2Ms(5);

  if (hour > 15 || weekend) return sec2Ms(30);

  return min2Ms(1);
};

// export const listener = ({ id, ...payload }: HueEmitPayload) => {
//   request.put(
//     {
//       url: `${url}/${id}/action`,
//       body: payload,
//       rejectUnauthorized: false,
//       json: true
//     },
//     (error?, _?, body?: HueActionReponse) => {
//       const err = body && body.find(item => item.error !== undefined);

//       if (error)
//         console.error("Something went wrong with the Hue action", error);
//       if (err) console.error(err.error);
//     }
//   );
// };
