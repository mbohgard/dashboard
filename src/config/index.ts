import type { AxiosRequestConfig } from "axios";
import * as config from "../../config";

type Config = {
  axiosConfig?: AxiosRequestConfig;
  transports?: {
    key?: string;
    settings?: Array<{
      siteId?: string;
      types?: string[];
    }>;
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
  food?: {
    station?: 0;
    label?: string;
  };
  sonos?: {
    api?: string;
    feed?: string;
  };
};

export default config as unknown as Config;
