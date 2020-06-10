import { count } from "../utils/helpers";
import services, { ServiceName } from "./services";

type Subscriptions = {
  [id: string]: number | undefined;
};

type Subscribers<T = Subscriptions> = { [key in ServiceName]: T };

const state = Object.keys(services).reduce(
  (acc, s) => ({ ...acc, [s]: {} }),
  {} as Subscribers
);

const getCountByService = () =>
  Object.entries(state).reduce((acc, [k, v]) => {
    return {
      ...acc,
      [k]: count(Object.values(v)),
    };
  }, {} as Subscribers<number>);

export const add = (id: string, s: ServiceName) => {
  state[s][id] = (state[s][id] || 0) + 1;

  return state[s][id] === 1;
};

interface Remove {
  (id: string): Subscribers<number>;
  (id: string, s: ServiceName): number;
}

export const remove: Remove = (id: string, s?: ServiceName): any => {
  if (s) {
    const update = (state[s][id] || 1) - 1;

    state[s][id] = update;

    if (update === 0) delete state[s][id];

    return count(Object.values(state[s]));
  } else {
    Object.keys(state).forEach((service) => {
      delete state[service as ServiceName][id];
    });

    return getCountByService();
  }
};
