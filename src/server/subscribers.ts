type Services = { [service: string]: string[] };

const services: Services = {};

interface Remove {
  (id: string): Services;
  (id: string, s: string): string[];
}

export const add = (id: string, s: string) => {
  services[s] = [...new Set([...(services[s] || []), id])];

  return services[s];
};

export const remove: Remove = (id: any, s?: any): any => {
  if (s) {
    services[s] = (services[s] || []).reduce<string[]>(
      (acc, presentId: string) =>
        id === presentId ? acc : [...acc, presentId],
      []
    );

    return services[s];
  } else {
    Object.keys(services).forEach(service => remove(id, service));

    return services;
  }
};

export const get = (s?: string) =>
  s
    ? services[s] || []
    : Object.keys(services).reduce<string[]>(
        (acc, key) => [...new Set([...acc, ...services[key]])],
        []
      );

export const getServices = (id?: string) => {
  const keys = Object.keys(services);

  return id
    ? keys.reduce<string[]>(
        (acc, key) => (services[key].includes(id) ? [...acc, key] : acc),
        []
      )
    : keys;
};
