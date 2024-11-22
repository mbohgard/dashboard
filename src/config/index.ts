import type { AxiosRequestConfig } from "axios";
import * as config from "../../config";

export type Config = {
  axiosConfig?: AxiosRequestConfig;
  transports?: {
    label?: string;
    settings?: {
      siteId: string;
      type?: "BUS" | "TRAIN" | "METRO" | "TRAM" | "SHIP" | "TAXI" | "FERRY";
      direction?: number;
    };
  };
  energy?: {
    zone?: string;
  };
  weather?: {
    settings?: {
      lon?: string;
      lat?: string;
    };
  };
  time?: {
    key?: string;
    settings?: {
      timezone?: string;
    };
  };
  hue?: {
    key?: string;
    settings?: {
      ip?: string;
      tempOffset?: number;
      tempLabel?: string;
    };
  };
  voc?: {
    username?: string;
    password?: string;
    vin?: string;
    settings?: {
      region?: string;
      label?: string;
    };
  };
  calendar?: {
    label?: string;
    settings?: Array<{
      name?: string;
      url?: string;
      color?: string;
    }>;
  };
  dayinfo?: {
    namsorApiKey?: string;
    birthdays?: Array<{
      name: string;
      month: number;
      day: number;
    }>;
  };
  chores?: {
    label?: string;
    url?: string;
  };
  food?: {
    station?: number;
    label?: string;
  };
  sonos?: {
    api?: string;
    feed?: string;
  };
  icloud?: {
    label: string;
    albumToken: string;
  };
};

export default config as unknown as Config;

export type AppConfig = {
  calendar?: {
    label: string;
  };
  voc?: {
    label: string;
  };
  food?: {
    label: string;
  };
  temp?: {
    label: string;
  };
  app?: {
    version?: string;
    launched?: number;
  };
};
