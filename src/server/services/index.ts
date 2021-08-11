import _axios, { AxiosRequestConfig } from "axios";

import * as config from "../../../config";

import * as Hue from "./hue";
import * as Time from "./time";
import * as Transports from "./transports";
import * as Voc from "./voc";
import * as Weather from "./weather";
import * as Calendar from "./calendar";

export const hue = Hue;
export const time = Time;
export const transports = Transports;
export const voc = Voc;
export const weather = Weather;
export const calendar = Calendar;

const services = { hue, time, transports, voc, weather, calendar };

export type Services = typeof services;
export type ServiceName = keyof Services;

export const axios = config.axiosConfig
  ? _axios.create(config.axiosConfig as AxiosRequestConfig)
  : _axios;

export default services;
