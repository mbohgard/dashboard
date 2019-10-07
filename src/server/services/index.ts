import * as Hue from "./hue";
import * as Time from "./time";
import * as Transports from "./transports";
import * as Voc from "./voc";
import * as Weather from "./weather";

export const hue = Hue;
export const time = Time;
export const transports = Transports;
export const voc = Voc;
export const weather = Weather;

const services = { hue, time, transports, voc, weather };

export type Services = typeof services;
export type ServiceName = keyof Services;

export default services;