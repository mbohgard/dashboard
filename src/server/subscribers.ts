import { ServiceName } from "./services";

type Subscribers = { [key in ServiceName]?: string[] };

const subscribers: Subscribers = {};

const clone = (arr?: any[]) => (arr ? [...arr] : []);

interface Remove {
  (id: string): Subscribers;
  (id: string, s: ServiceName): string[];
}

export const add = (id: string, s: ServiceName) => {
  const subs = subscribers[s] || [];

  if (subs.includes(id)) return false;

  subscribers[s] = Array.from(new Set([...subs, id]));

  return subscribers[s]!.length === 1;
};

export const remove: Remove = (id: any, s?: ServiceName): any => {
  if (s) {
    subscribers[s] = (subscribers[s] || []).filter(x => x !== id);

    return clone(subscribers[s]);
  } else {
    Object.keys(subscribers).forEach(service =>
      remove(id, service as ServiceName)
    );

    return subscribers;
  }
};

export const get = (s?: ServiceName) =>
  s
    ? clone(subscribers[s])
    : Object.keys(subscribers).reduce<string[]>(
        (acc, key) =>
          Array.from(
            new Set([...acc, ...(subscribers[key as ServiceName] || [])])
          ),
        []
      );

export const getServices = (id?: string) => {
  const keys = Object.keys(subscribers) as ServiceName[];

  return id
    ? keys.reduce<ServiceName[]>(
        (acc, key) => (subscribers[key]!.includes(id) ? [...acc, key] : acc),
        []
      )
    : keys;
};
