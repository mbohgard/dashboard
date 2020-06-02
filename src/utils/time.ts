export const min2Ms = (min: number) => min * (1000 * 60);
export const sec2Ms = (sec: number) => sec * 1000;
export const ms2sec = (ms: number) => Math.round(ms / 1000);

export const sec2Str = (sec: number) => {
  let s = sec;
  const d = Math.floor(s / (3600 * 24));
  s -= d * 3600 * 24;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;

  const days = d ? `${d} days, ` : "";
  const hours = h ? `${h} hours, ` : "";
  const min = m ? `${m} min, ` : "";
  return `${days}${hours}${min}${s} sec`;
};
