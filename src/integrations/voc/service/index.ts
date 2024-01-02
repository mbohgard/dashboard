import config from "../../../config";

import { ConfigError, axios } from "../../index";
import type { ApiResponse } from "../types";
import { sec2Ms, min2Ms } from "../../../utils/time";

export const name = "voc";
const { voc = {} } = config;
const { settings, vin, username, password } = voc;

const url = () => {
  if (!vin) throw ConfigError(name, "Missing 'vin' config");

  return `https://vocapi${
    settings?.region ? `${settings?.region}-` : ""
  }.wirelesscar.net/customerapi/rest/v3.0/vehicles/${vin}/status`;
};

export const get = async () => {
  if (!username || !password)
    throw ConfigError(name, "Missing 'username' and/or 'password' config");

  const data = (
    await axios.request<ApiResponse>({
      auth: {
        username,
        password,
      },
      method: "GET",
      url: url(),
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
        "x-device-id": "Device",
        "x-originator-type": "App",
        "x-os-type": "Android",
        "x-os-version": "22",
      },
    })
  ).data;

  return {
    service: name,
    data:
      "ERS" in data
        ? {
            batteryLevel: data.hvBattery.hvBatteryLevel,
            locked: data.carLocked,
            running: data.engineRunning || data.ERS.status === "onByDirectCtrl",
            label: settings?.label ?? "Volvo",
            charging: data.hvBattery.hvBatteryChargeStatus === "Started",
          }
        : undefined,
    error: "errorLabel" in data ? data : undefined,
  };
};

export const delay = () => {
  const d = new Date();
  const day = d.getDay();
  const weekend = day === 0 || day === 6;
  const hour = d.getHours();

  if (hour < 7) return min2Ms(5);

  if (hour > 15 || weekend) return sec2Ms(30);

  return min2Ms(1);
};
