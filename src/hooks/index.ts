import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";

import { reportError, ConnectionContext } from "../main";

const socket = io();

export const useSocket = () => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const connect = () => setConnected(true);
    const disconnect = () => setConnected(false);

    socket.on("connect", connect);
    socket.on("disconnect", disconnect);

    setConnected(socket.connected);

    return () => {
      socket.off("connect", connect);
      socket.off("disconnect", disconnect);
    };
  }, []);

  return connected;
};

type Emit<D> = (
  payload: any
) => React.Dispatch<React.SetStateAction<D>> | undefined;

interface UseService {
  <T extends ServiceData>(
    serviceName: string,
    condition?: (res: T) => boolean
  ): [T["data"], Emit<T["data"]>];

  <T extends ServiceData>(
    serviceName: string,
    initialData: Required<T>["data"],
    condition?: (res: T) => boolean
  ): [Required<T>["data"], Emit<Required<T>["data"]>];
}

export const useService: UseService = <T extends ServiceData>(
  serviceName: any,
  arg1?: any,
  arg2: any = (res: T) => Boolean(res.data)
): [any, any] => {
  const connected = useContext(ConnectionContext);
  const short = typeof arg1 === "function";
  const condition = short ? arg1 : arg2;
  const [data, setData] = useState<T["data"]>(short ? undefined : arg1);

  useEffect(() => {
    const listener = (res: T) =>
      condition(res)
        ? setData(res.data)
        : reportError?.(res.service, res.error);

    if (connected) {
      socket.on(serviceName, listener);
      socket.emit("subscribe", serviceName);
    }

    return () => {
      socket.emit("unsubscribe", serviceName);
      socket.off(serviceName, listener);
    };
  }, [connected]);

  const emit: Emit<T["data"]> = (payload) => {
    if (connected) {
      socket.emit(serviceName, payload);

      return setData;
    } else {
      reportError?.(
        serviceName,
        Error("Can't emit message due to lost server connection.")
      );

      return undefined;
    }
  };

  return [data, emit];
};

import { useRef } from "react";

export const useTouchPress = (cbs: {
  onPress?(): void;
  onLongPress?(): void;
}) => {
  const timer = useRef<number>();
  const [active, setActive] = useState(false);

  const on = () => {
    setActive(true);

    if (cbs.onLongPress)
      timer.current = setTimeout(() => {
        cbs.onLongPress?.();

        setActive(false);
      }, 650);
  };

  const off = () => {
    clearTimeout(timer.current);

    if (active) {
      cbs.onPress?.();

      setActive(false);
    }
  };

  return [on, off];
};
