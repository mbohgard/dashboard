import { useEffect, useState, useCallback, useRef, useMemo } from "react";

import { socket } from "../utils/socket";
import { reportError } from "../utils/report";
import type {
  ServiceName,
  ServiceResponse,
  Emit as EmitPayload,
} from "../types";
import { configStore, connectedStore, isPlayingStore } from "../stores";

export * from "./useSparkle";

export const useConfig = () => {
  const [config] = configStore.useStore();
  return config;
};

export const useConnected = () => {
  const [connected] = connectedStore.useStore();
  return connected;
};

export const useIsPlaying = () => {
  const [isPlaying] = isPlayingStore.useStore();
  return isPlaying;
};

type Emit<P, D> = (
  payload: P
) => React.Dispatch<React.SetStateAction<D>> | undefined;

type Data<Name extends ServiceName> = ServiceResponse<Name>["data"];
// @ts-ignore
type Meta<Name extends ServiceName> = ServiceResponse<Name>["meta"];

interface UseService {
  <Name extends ServiceName>(
    serviceName: Name,
    condition?: (res: ServiceResponse<Name>) => boolean
  ): [Data<Name>, Emit<EmitPayload<Name>, Data<Name>>, Meta<Name> | undefined];

  <Name extends ServiceName>(
    serviceName: Name,
    initialData: NonNullable<Data<Name>>,
    condition?: (res: ServiceResponse<Name>) => boolean
  ): [
    NonNullable<Data<Name>>,
    Emit<EmitPayload<Name>, NonNullable<Data<Name>>>,
    Meta<Name> | undefined,
  ];
}

export const useService: UseService = <T extends ServiceResponse>(
  serviceName: any,
  arg1?: any,
  arg2: any = (res: any) => Boolean(res.data)
) => {
  const short = typeof arg1 === "function";
  const condition = short ? arg1 : arg2;

  const connected = useConnected();
  const meta = useRef<T["meta"]>(undefined);
  const [data, setData] = useState<T["data"]>(short ? undefined : arg1);

  useEffect(() => {
    const listener = (res: T) => {
      meta.current = res.meta;

      if (condition(res)) setData(res.data);
      else reportError?.(res.service, res.error);
    };

    if (connected) {
      socket.on(serviceName, listener);
      socket.emit("subscribe", serviceName);
    }

    return () => {
      socket.off(serviceName, listener);
    };
  }, [connected]);

  useEffect(
    () => () => {
      socket.emit("unsubscribe", serviceName);
    },
    []
  );

  const emit = useCallback(
    (payload: any) => {
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
    },
    [connected]
  );

  return [data, emit, meta.current];
};

export const useSonosService = () => {
  const [data, emit] = useService("sonos");

  const isPlaying = useMemo(() => {
    if (!data || !data.length) return false;

    return data.some((device) => device.state.playbackState === "PLAYING");
  }, [data]);

  useEffect(() => {
    isPlayingStore.set(isPlaying);
  }, [isPlaying]);

  return [data, emit, isPlaying] as const;
};

const isOutside = (
  { left, top, width, height }: DOMRect,
  { clientX: x, clientY: y }: React.Touch
) => {
  if (x < left || x > left + width) return true;
  if (y < top || y > top + height) return true;

  return false;
};

export const useTouchPress = (cbs: {
  onPress?(): void;
  onLongPress?(): void;
}) => {
  const timer = useRef<number>();
  const [active, setActive] = useState(false);

  const onTouchStart = () => {
    setActive(true);

    if (cbs.onLongPress)
      timer.current = window.setTimeout(() => {
        cbs.onLongPress?.();

        setActive(false);
      }, 650);
  };

  const onTouchEnd = () => {
    clearTimeout(timer.current);

    if (active) {
      cbs.onPress?.();

      setActive(false);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.target as HTMLElement;
    const out = isOutside(t.getBoundingClientRect(), e.touches[0]!);

    if (out && active) {
      clearTimeout(timer.current);
      setActive(false);
    }
  };

  return { onTouchStart, onTouchEnd, onTouchMove };
};

export const useStableCallback = <T extends (...args: any[]) => any>(
  f: T | undefined
) => {
  const ref = useRef(f);

  ref.current = f;

  return useCallback(
    (...args: Parameters<T>) => ref.current?.(...args) as ReturnType<T>,
    []
  );
};

export const useIsIdle = (
  cb?: () => void,
  { timeout = 10000 }: { timeout?: number } = {}
) => {
  const f = useStableCallback(cb);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer = 0;
    const listener = () => {
      setIdle(false);
      window.clearTimeout(timer);

      timer = window.setTimeout(() => setIdle(true), timeout);
    };

    document.addEventListener("touchstart", listener);

    return () => document.removeEventListener("touchstart", listener);
  }, [f, timeout]);

  useOnChange(f, [idle]);

  return idle;
};

export const useOnChange = (
  cb: () => void | (() => void),
  deps: React.DependencyList
) => {
  const init = useRef(false);

  useEffect(() => {
    if (init.current) return cb();
    init.current = true;
  }, deps);
};

type DashboardData = Record<ServiceName, unknown>;

type GetData = {
  (): DashboardData;
  <T>(service: ServiceName): T | null;
};

const getData: GetData = (service?: ServiceName) => {
  const data = localStorage.getItem("DashboardData");

  if (data) {
    try {
      const parsed = JSON.parse(data);

      return service ? parsed[service] : parsed;
    } catch (_) {}
  }

  return service ? null : ({} as DashboardData);
};

export const useStoredData = <T>(service: ServiceName) => {
  const [state, setState] = useState(() => getData<T>(service));

  const setStorageData = (data: T | null) => {
    const current = getData();

    current[service] = data;

    try {
      localStorage.setItem("DashboardData", JSON.stringify(current));
      setState(data);
    } catch (e) {
      throw Error(
        `Could not store ${service} data with payload ${data?.toString()}`
      );
    }
  };

  return [state, setStorageData] as const;
};

type UseThrottleOptions = {
  interval?: number;
  // call cb again after final cb call
  finalize?: boolean;
};

export const useThrottle = ({
  interval = 300,
  finalize = false,
}: UseThrottleOptions) => {
  const t1 = useRef<number>();
  const t2 = useRef<number>();

  useEffect(
    () => () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
    },
    []
  );

  return useCallback(
    (cb: () => void) => {
      clearTimeout(t2.current);

      if (!t1.current) cb();

      t1.current ??= window.setTimeout(() => {
        t1.current = undefined;
      }, interval);

      t2.current = window.setTimeout(() => {
        if (finalize) cb();
      }, interval);
    },
    [interval, finalize]
  );
};

type UseScrollOptions = {
  direction?: "horizontal" | "vertical";
  onScroll: (value: number) => void;
};

export const useScroll = <T extends HTMLElement>({
  direction = "vertical",
  onScroll,
}: UseScrollOptions) => {
  const ref = useRef<T>(null);
  const initialized = useRef(false);
  const cb = useStableCallback(onScroll);

  useEffect(() => {
    const el = ref.current ?? document.getElementById("app")!;
    const listener = (e: Event) => {
      const target = e.target as HTMLElement;

      cb(direction === "vertical" ? target.scrollTop : target.scrollLeft);
    };

    el.addEventListener("scroll", listener);

    if (!initialized.current) {
      el.dispatchEvent(new Event("scroll"));
      initialized.current = true;
    }

    return () => el.removeEventListener("scroll", listener);
  }, [direction]);

  return ref;
};

type UseScrollFilterOptions = Pick<UseScrollOptions, "direction"> & {
  interval?: number;
  maxValue?: number;
  filter: string;
};

export const useScrollFilter = <
  T extends HTMLElement,
  S extends HTMLElement = HTMLElement,
>({
  direction = "horizontal",
  interval = 300,
  maxValue = 500,
  filter,
}: UseScrollFilterOptions) => {
  const filterRef = useRef<T>(null);
  const filtered = useRef(true);
  const throttle = useThrottle({ interval, finalize: true });

  const scrollRef = useScroll<S>({
    direction,
    onScroll: (val) => {
      throttle(() => {
        if (!filterRef.current) return;

        if (val < maxValue) {
          filtered.current = true;
          filterRef.current.style.filter = `${filter}(${1 - val / maxValue})`;
        } else if (val >= maxValue && filtered.current) {
          filtered.current = false;
          filterRef.current.style.filter = `${filter}(0)`;
        }
      });
    },
  });

  return { scrollRef, filterRef };
};
