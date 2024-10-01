import type { AxiosRequestConfig } from "axios";
import * as config from "../../config";

type Config = {
  axiosConfig?: AxiosRequestConfig;
  transports?: {
    settings?: {
      label?: string;
      siteId: string;
      type?: Array<
        "BUS" | "TRAIN" | "METRO" | "TRAM" | "SHIP" | "TAXI" | "FERRY"
      >;
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
  chores?: {
    label?: string;
    url?: string;
  };
  food?: {
    station?: 0;
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
