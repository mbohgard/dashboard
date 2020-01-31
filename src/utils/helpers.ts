export const percentageOfRange = (min: number, max: number) => (
  input: number
) => ((input - min) * 100) / (max - min);

export const def = (...things: any[]) => !things.some(x => x === undefined);

export const limiter = (b: number, limit: number) => (b < limit ? limit : b);

export const parse = (input: any) => {
  if (typeof input !== "string") return input;

  try {
    return JSON.parse(input);
  } catch (error) {
    return input;
  }
};

type Obj = { [s: string]: any };

export const areEqual = (a: Obj, b: Obj) => {
  for (const k in a) {
    if (a[k] !== b[k]) return false;
  }

  return true;
};

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
  let t: number;

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
