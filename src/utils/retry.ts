type Options<T> = {
  predicate?: (res: T) => boolean;
  retries?: number;
  delay?: number;
};

export const retry = <T>(
  prom: Promise<T>,
  { predicate = () => true, retries = 2, delay = 2000 }: Options<T> = {}
) => {
  let timer: number;

  const attempt = (n: number) =>
    new Promise<T>((resolve, reject) => {
      const schedule = () => {
        timer = setTimeout(() => {
          attempt(n - 1)
            .then(resolve)
            .catch(reject);
        }, delay);
      };

      prom
        .then((res) =>
          predicate(res)
            ? resolve(res)
            : n
            ? schedule()
            : reject("Never met the condition")
        )
        .catch((err) => (clearTimeout(timer), n ? schedule() : reject(err)));
    });

  return attempt(retries);
};
