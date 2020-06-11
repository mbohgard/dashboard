import dayjs from "dayjs";

import { parseJSON } from "./helpers";
import { setErrors } from "../stores";

export type ReportError = (service: string, err: any) => void;

export type ServiceError = {
  id: number;
  code: number;
  message: string;
  name: string;
  service: string;
  time: string;
};

let errI = 0;

export const reportError: ReportError = (service, e) => {
  const err = parseJSON(e);
  const isObj = typeof err === "object";
  const code = isObj ? err.statusCode || err.status : 0;
  const message = isObj
    ? err.message || err.msg || err.text || JSON.stringify(err)
    : String(err);
  const name = (isObj && (err.name || err.code)) || "Error";
  const error: ServiceError = {
    id: ++errI,
    code,
    service,
    message,
    name,
    time: dayjs().format("DD/MM HH:mm:ss"),
  };

  setErrors((s) => ({
    errors: [error, ...s.errors.slice(0, 9)],
    notify: true,
  }));
};

export const resetErrorsNotification = () =>
  setErrors((s) => ({ ...s, notify: false }));
