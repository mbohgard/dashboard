import _axios from "axios";
import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import type { ValueOf } from "../types/index.ts";

import config, { type AppConfig } from "../config/index.ts";

import * as Hue from "./hue/service/index.ts";
import * as Time from "./time/service/index.ts";
import * as Energy from "./energy/service/index.ts";
import * as Transports from "./transports/service/index.ts";
import * as Voc from "./voc/service/index.ts";
import * as Weather from "./weather/service/index.ts";
import * as Calendar from "./calendar/service/index.ts";
import * as Chores from "./chores/service/index.ts";
import * as Temp from "./temp/service/index.ts";
import * as Food from "./food/service/index.ts";
import * as Sonos from "./sonos/service/index.ts";
import * as ICloud from "./icloud/service/index.ts";
import * as DayInfo from "./dayinfo/service/index.ts";

const services = {
  hue: Hue,
  time: Time,
  energy: Energy,
  transports: Transports,
  voc: Voc,
  weather: Weather,
  calendar: Calendar,
  chores: Chores,
  temp: Temp,
  food: Food,
  sonos: Sonos,
  icloud: ICloud,
  dayinfo: DayInfo,
} as const;

type Services = typeof services;
export type ServicesUnion = ValueOf<Services>;
export type ServiceName = keyof Services;

type ServiceReturn<N extends ServiceName> = Awaited<
  ReturnType<Services[N]["get"]>
>;
export type Data<N extends ServiceName> = ServiceReturn<N>["data"];
// @ts-ignore
export type Meta<N extends ServiceName> = ServiceReturn<N>["meta"];
export type Emit<N extends ServiceName> =
  // @ts-ignore
  unknown extends Services[N]["listener"]
    ? never
    : // @ts-ignore
      Parameters<Services[N]["listener"]>[number];
// @ts-ignore
export type Feed<Name extends ServiceName, T> = {
  // `endpoint` will register a route to receive updates on, `sse` (server side event) will make a request to receive streaming events on
  type: "endpoint" | "sse";
  method: "get" | "post";
  endpoint?: string;
  handler: (data: T) => ServiceResponse<Name> | null;
};

export type CreateServiceResponse<N = string, D = unknown, M = unknown> = {
  data?: D;
  error?: unknown;
  service: N;
} & (unknown extends M ? { meta?: never } : { meta: M });

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
    config: AppConfig;
  }
>;
export type ControlServiceData = CreateServiceResponse<
  "control",
  {
    action: "RELOAD";
  }
>;
