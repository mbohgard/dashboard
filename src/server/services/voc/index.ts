import * as config from "../../../../config";

import { axios } from "../index";
import type { ApiResponse } from "./types";
import { sec2Ms, min2Ms } from "../../../utils/time";

const {
  settings: { region, label },
  vin,
  username,
  password,
} = config.voc;
const url = `https://vocapi${
  region ? `${region}-` : ""
}.wirelesscar.net/customerapi/rest/v3.0/vehicles/${vin}`;

export const name = "voc";

export const get = () =>
  axios
    .request<ApiResponse>({
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
              batteryLevel: res.hvBattery.hvBatteryLevel,
              locked: res.carLocked,
              running: res.engineRunning || res.ERS.status === "onByDirectCtrl",
              label: label ?? "Volvo",
              charging: res.hvBattery.hvBatteryChargeStatus === "Started",
            }
          : undefined;
      const error = res && "errorLabel" in res ? res : undefined;

      return {
        service: name,
        data,
        error,
      };
    });

export const delay = () => {
  const d = new Date();
  const day = d.getDay();
  const weekend = day === 0 || day === 6;
  const hour = d.getHours();

  if (hour < 7) return min2Ms(5);

  if (hour > 15 || weekend) return sec2Ms(30);

  return min2Ms(1);
};
