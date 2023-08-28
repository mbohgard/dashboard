import _axios, { AxiosRequestConfig } from "axios";

import * as config from "../../../config";

import * as Hue from "./hue";
import * as Time from "./time";
import * as Energy from "./energy";
import * as Transports from "./transports";
import * as Voc from "./voc";
import * as Weather from "./weather";
import * as Calendar from "./calendar";
import * as Temp from "./temp";

export const hue = Hue;
export const time = Time;
export const energy = Energy;
export const transports = Transports;
export const voc = Voc;
export const weather = Weather;
export const calendar = Calendar;
export const temp = Temp;

const services = {
  hue,
  time,
  energy,
  transports,
  voc,
  weather,
  calendar,
  temp,
};

export type Services = typeof services;
export type ServiceName = keyof Services;

type Config = typeof config & {
  axiosConfig?: AxiosRequestConfig;
};

const conf = config as Config;

export const axios = conf.axiosConfig
  ? _axios.create(conf.axiosConfig)
  : _axios;

export default services;
