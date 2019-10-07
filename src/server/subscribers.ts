import { ServiceName } from "./services";

type Subscribers = { [key in ServiceName]?: string[] };

const subscribers: Subscribers = {};

interface Remove {
  (id: string): Subscribers;
  (id: string, s: ServiceName): string[];
}

export const add = (id: string, s: ServiceName) => {
  const service = subscribers[s];

  if (service && service.includes(id)) return service;
  else subscribers[s] = [...new Set([...(service || []), id])];

  return subscribers[s]!;
};

export const remove: Remove = (id: any, s?: ServiceName): any => {
  if (s) {
    subscribers[s] = (subscribers[s] || []).reduce<string[]>(
      (acc, presentId: string) =>
        id === presentId ? acc : [...acc, presentId],
      []
    );

    return subscribers[s];
  } else {
    Object.keys(subscribers).forEach(service =>
      remove(id, service as ServiceName)
    );

    return subscribers;
  }
};

export const get = (s?: ServiceName) =>
  s
    ? subscribers[s] || []
    : Object.keys(subscribers).reduce<string[]>(
        (acc, key) => [
          ...new Set([...acc, ...subscribers[key as ServiceName]])
        ],
        []
      );

export const getSubsriptions = (id?: string) => {
  const keys = Object.keys(subscribers) as ServiceName[];

  return id
    ? keys.reduce<ServiceName[]>(
        (acc, key) => (subscribers[key]!.includes(id) ? [...acc, key] : acc),
        []
      )
    : keys;
};
