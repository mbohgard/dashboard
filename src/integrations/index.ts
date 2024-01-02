import _axios, { AxiosRequestConfig } from "axios";
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import type { ValueOf } from "../types";

import config from "../config";

import * as Hue from "./hue/service";
import * as Time from "./time/service";
import * as Energy from "./energy/service";
import * as Transports from "./transports/service";
import * as Voc from "./voc/service";
import * as Weather from "./weather/service";
import * as Calendar from "./calendar/service";
import * as Temp from "./temp/service";
import * as Food from "./food/service";
import * as Sonos from "./sonos/service";

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

export const axios = _axios.create(config.axiosConfig);

axiosRetry(axios, {
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (err) => {
    if (err.status === 429) return false;

    return isNetworkOrIdempotentRequestError(err);
  },
});

export const ConfigError = (name: ServiceName, msg: string) =>
  new Error(`${name}: ${msg}`);

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
