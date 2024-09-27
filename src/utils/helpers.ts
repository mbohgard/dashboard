export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const pascal = (s: string) =>
  s
    .split(/\W|_/)
    .filter((s) => s)
    .map(capitalize)
    .join("");

export const isObj = (x: unknown): x is object => typeof x === "object";

export const round = (n: number) =>
  n > 1 ? Math.round(n) : Number(n.toFixed(2));

export const roundValues = <T extends object>(obj: T) =>
  Object.entries(obj).reduce(
    (acc, [k, v]) => ({ ...acc, [k]: round(v) }),
    {} as T
  );

export const percentageOfRange =
  (min: number, max: number) => (input: number) =>
    max ? ((input - min) * 100) / (max - min) : 0;

export const roundedPercentageOf = (value = 0, max = 0) =>
  round((value / max) * 100);

export const roundedValueFromPercentage = (
  percentage: number = 0,
  max: number = 0
) => round((percentage / 100) * max);

export const def = (...things: any[]) => !things.some((x) => x === undefined);

export const limiter = (b: number, limit: number) => (b < limit ? limit : b);
export const compressor = (b: number, min: number) => (b > min ? b : min);

export const count = (arr: (number | undefined)[]) =>
  arr.reduce((acc, n = 0) => acc! + n, 0) || 0;

export const addLeadingZero = (n: number) => `${n < 10 ? `0${n}` : n}`;

export const parseJSON = (input: unknown) => {
  if (typeof input !== "string") return input;

  try {
    return JSON.parse(input);
  } catch (error) {
    return input;
  }
};

export const stringify = (x: any): string | undefined => {
  try {
    return x.toString();
  } catch (e) {
    try {
      return JSON.stringify(x);
    } catch (e) {
      return "Could not stringify error";
    }
  }
};

export const createMedian = () => {
  let i = 0;
  let sum = 0;

  return (value: number) => {
    i++;
    sum += value;

    return {
      sum,
      median: sum / i,
    };
  };
};

type Obj = { [s: string]: any };

export const areEqual = (a: Obj, b: Obj) => {
  for (const k in a) {
    if (a[k] !== b[k]) return false;
  }

  return true;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  picked: K[]
) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) =>
      picked.includes(key as K) ? { ...acc, [key]: value } : acc,
    {} as Pick<T, K>
  );

export const memo = <F extends (...args: any[]) => any>(func: F) => {
  const cache = new Map();

  const set = (args: any, str: string) => {
    const val = func.apply(null, args);

    cache.set(str, val);

    return val;
  };

  return (...args: Parameters<F>): ReturnType<F> => {
    if (cache.size > 1000) cache.clear();

    const str = args.join();

    return cache.get(str) || set(args, str);
  };
};

export const debounce = <F extends (...args: any[]) => any>(
  f: F,
  wait = 300
) => {
  let t: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve, reject) => {
      clearTimeout(t);

      t = setTimeout(() => {
        try {
          resolve(f(...args));
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
};

export const throttle = <F extends (...args: any[]) => any>(
  f: F,
  interval = 500
) => {
  let last: number;
  let t: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve, reject) => {
      const run = () => {
        try {
          resolve(f(...args));
        } catch (error) {
          reject(error);
        }
      };

      const now = Date.now();

      if (!last) {
        run();

        last = now;
      } else {
        clearTimeout(t);

        t = setTimeout(
          () => {
            run();

            last = Date.now();
          },
          interval - (now - last)
        );
      }
    });
};

export const wait = (delay: number = 100) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const randomInt = (min = 0, max = 100) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const swtch = <T, R>(
  target: T,
  ...cases: Readonly<Array<[T, R]>>
): R | undefined => {
  for (const [k, v] of cases) {
    if (target === k) return v;
  }

  return undefined;
};
