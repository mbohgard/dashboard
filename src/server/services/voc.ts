import axios from "axios";

import * as config from "../../../config";
import { sec2Ms, min2Ms } from "../../utils/time";
import { retry } from "../../utils/retry";

const {
  settings: { region },
  vin,
  username,
  password,
} = config.voc;
const url = `https://vocapi${
  region ? `${region}-` : ""
}.wirelesscar.net/customerapi/rest/v3.0/vehicles/${vin}`;

export const name = "voc";

export const get = (): Promise<VOCServiceData> =>
  retry(
    axios
      .request<VOCResponse>({
        auth: {
          username,
          password,
        },
        method: "GET",
        url: `${url}/status`,
        headers: {
          "cache-control": "no-cache",
          "content-type": "application/json",
          "x-device-id": "Device",
          "x-originator-type": "App",
          "x-os-type": "Android",
          "x-os-version": "22",
        },
      })
      .then(({ data: res }) => {
        const data =
          res && "ERS" in res
            ? {
                locked: res.carLocked,
                running:
                  res.engineRunning || res.ERS.status === "onByDirectCtrl",
              }
            : undefined;
        const error = res && "errorLabel" in res ? res : undefined;

        return {
          service: name,
          data,
          error,
        };
      })
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
