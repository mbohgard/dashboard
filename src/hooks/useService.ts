import { useCallback, useEffect } from "react";
import { Emit, ServiceName, ServiceResponse } from "../integrations";
import { createStore } from "../utils/store";
import { socket } from "../utils/socket";
import { reportError } from "../utils/report";
import { connectedStore } from "../stores";

type Store<Data> = ReturnType<typeof createStore<Data | undefined>>;
type Callback<Data> = (data: Data) => void;

// record of stores for each service
const serviceStores: Partial<Record<ServiceName, Store<any>>> = {};
// keep track of how many subscribers there are for each service
const subscriberAmount: Partial<Record<ServiceName, number>> = {};
// callbacks for each service to run when data is received
const subscriptionCallbacks: Partial<Record<ServiceName, Callback<any>>> = {};

// get store for a service or create a new one if it doesn't exist
const getStore = <Data>(n: ServiceName) => {
  const store = serviceStores[n] ?? createStore<Data | undefined>(undefined);
  serviceStores[n] = store;

  return store as Store<Data>;
};

// register a service callback if it doesn't exist to update the service store
const registerCallback = <
  Name extends ServiceName,
  Data extends ServiceResponse<Name>,
>(
  n: Name
) => {
  const sbs = subscriptionCallbacks;
  if (sbs[n]) return;

  sbs[n] = (res: Data) => {
    if (res.error) reportError(res.service, res.error);
    else serviceStores[n]?.set(res);
  };
  const cb: any = sbs[n];

  connectedStore.subscribe((connected) => {
    if (connected) socket.on(n, cb);
    else socket.off(n, cb);
  });

  if (connectedStore.get()) socket.on(n, cb);
};

// subscribe to a service if it hasn't been subscribed to before and increment the subscriber count
// - unsubscribe from the service if the subscriber count reaches 0
const subscribeToService = (n: ServiceName) => {
  const sa = subscriberAmount;

  sa[n] = (sa[n] ?? 0) + 1;

  if (sa[n] === 1) socket.emit("subscribe", n);

  return () => {
    sa[n] = sa[n]! > 0 ? sa[n]! - 1 : 0;

    if (sa[n] === 0) {
      socket.emit("unsubscribe", n);
    }
  };
};

export const useService = <
  Name extends ServiceName,
  Res extends ServiceResponse<Name>,
  S = Res["data"],
>(
  serviceName: Name,
  selector: (res: Res) => S = (s) => s.data as any
) => {
  const store = getStore<Res>(serviceName);
  const [data] = store.useStore((s) => (s ? selector(s) : undefined));

  const emit = useCallback(
    (payload: Emit<Name>) => {
      if (socket.connected) {
        socket.emit(serviceName, payload);

        return (data: Res["data"]) =>
          store.set({ ...store.get(), data } as Res);
      } else {
        reportError(
          serviceName,
          Error("Can't emit message due to lost server connection.")
        );

        return undefined;
      }
    },
    [store]
  );

  useEffect(() => {
    registerCallback(serviceName);
    const unsubscribe = subscribeToService(serviceName);

    return unsubscribe;
  }, []);

  return [data, emit] as const;
};
