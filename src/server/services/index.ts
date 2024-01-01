import _axios, { AxiosRequestConfig } from "axios";
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import type { ValueOf } from "../../types";

import * as config from "../../../config";

import * as Hue from "./hue";
import * as Time from "./time";
import * as Energy from "./energy";
import * as Transports from "./transports";
import * as Voc from "./voc";
import * as Weather from "./weather";
import * as Calendar from "./calendar";
import * as Temp from "./temp";
import * as Food from "./food";
import * as Sonos from "./sonos";

const services = {
  hue: Hue,
  time: Time,
  energy: Energy,
  transports: Transports,
  voc: Voc,
  weather: Weather,
  calendar: Calendar,
  temp: Temp,
  food: Food,
  sonos: Sonos,
} as const;

type Services = typeof services;
export type ServicesUnion = ValueOf<Services>;
export type ServiceName = keyof Services;

type ServiceReturn<N extends ServiceName> = Awaited<
  ReturnType<Services[N]["get"]>
>;
type Data<N extends ServiceName> = ServiceReturn<N>["data"];
// @ts-ignore
export type Meta<N extends ServiceName> = ServiceReturn<N>["meta"];
export type Emit<N extends ServiceName> =
  // @ts-ignore
  unknown extends Services[N]["listener"]
    ? never
    : // @ts-ignore
      Parameters<Services[N]["listener"]>[number];

type CreateServiceResponse<N, D, M = unknown> = {
  data?: D;
  error?: unknown;
  service: N;
} & (unknown extends M ? { meta?: undefined } : { meta: M });

export type ServiceResponse<Name extends ServiceName = ServiceName> =
  CreateServiceResponse<Name, Data<Name>, Meta<Name>>;

type Config = typeof config & {
  axiosConfig?: AxiosRequestConfig;
};

const conf = config as Config;

export const axios = conf.axiosConfig
  ? _axios.create(conf.axiosConfig)
  : _axios;

axiosRetry(axios, {
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (err) => {
    if (err.status === 429) return false;

    return isNetworkOrIdempotentRequestError(err);
  },
});

export default services;

/**
 * Internal services
 */
export type InitServiceData = CreateServiceResponse<
  "server",
  {
    version: string;
    launched: number;
    config: LightConfig;
  }
>;
export type ControlServiceData = CreateServiceResponse<
  "control",
  {
    action: "RELOAD";
  }
>;
