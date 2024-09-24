import dayjs from "dayjs";

import { parseJSON } from "./helpers";
import { errorStore } from "../stores";

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
    id: (isObj && err.id) || ++errI,
    code,
    service,
    message,
    name,
    time: dayjs().format("DD/MM HH:mm:ss"),
  };

  errorStore.set((s) => {
    if (s.errors.find((e) => e.id === error.id)) return s;

    return {
      errors: [error, ...s.errors.slice(0, 9)],
      notify: true,
    };
  });
};

export const resetErrorsNotification = () =>
  errorStore.set((s) => ({ ...s, notify: false }));
