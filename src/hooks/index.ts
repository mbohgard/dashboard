import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";

import { ReportContext } from "../main";

const socket = io();

type Send<D> = (payload: any) => React.Dispatch<React.SetStateAction<D>>;

interface UseService {
  <T extends ServiceData>(
    serviceName: string,
    condition?: (res: T) => boolean
  ): [T["data"], Send<T["data"]>];

  <T extends ServiceData>(
    serviceName: string,
    initialData: Required<T>["data"],
    condition?: (res: T) => boolean
  ): [Required<T>["data"], Send<Required<T>["data"]>];
}

export const useService: UseService = <T extends ServiceData>(
  serviceName: any,
  arg1?: any,
  arg2: any = (res: T) => Boolean(res.data)
): [any, any] => {
  const reportError = useContext(ReportContext);
  const short = typeof arg1 === "function";
  const condition = short ? arg1 : arg2;
  const [data, setData] = useState<T["data"]>(short ? undefined : arg1);

  const listener = (res: T) =>
    condition(res) ? setData(res.data) : reportError(res.service, res.error);

  useEffect(() => {
    socket.on(serviceName, listener);
    socket.emit("subscribe", serviceName);

    return () => {
      socket.off(serviceName, listener);
    };
  }, []);

  const send: Send<T["data"]> = payload => {
    socket.emit(serviceName, payload);

    return setData;
  };

  return [data, send];
};
