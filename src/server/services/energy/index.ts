import * as config from "../../../../config";

import { axios } from "../index";
import * as cheerio from "cheerio";
import dayjs from "dayjs";

import type { ApiResponse } from "./types";
import { min2Ms, sec2Ms } from "../../../utils/time";

export const name = "energy";

const url = {
  SE1: "se1-lulea",
  SE2: "se2-sundsvall",
  SE3: "se3-stockholm",
  SE4: "se4-malmo",
};

const getUrl = (zone: string) =>
  `https://www.elbruk.se/timpriser-${url[zone as keyof typeof url]}`;

const catMap = {
  "Aktuellt pris": "now",
  Dagspris: "average",
  "Lägsta timpris": "low",
  "Högsta timpris": "high",
} as const;

export const get = () =>
  axios.get<string>(getUrl(config.energy.zone)).then(({ data: src }) => {
    const $ = cheerio.load(src);

    const data: ApiResponse = {
      now: { value: "N/A", time: "N/A" },
      high: { value: "N/A", time: "N/A" },
      low: { value: "N/A", time: "N/A" },
      average: { value: "N/A", time: "N/A" },
    };

    $(".info-box-text").each((_, el) => {
      const text = $(el).text() as keyof typeof catMap;
      const cat = catMap[text];

      if (cat)
        data[cat] = {
          value: $(el).siblings(".info-box-number").text(),
          time: $(el)
            .siblings(".progress-description")
            .text()
            .replace("Timpris kl. ", ""),
        };
    });

    return {
      service: name,
      data,
    };
  });

export const delay = () => {
  const now = dayjs();
  const nextHour = now.endOf("hour").add(2, "second");
  const diff = nextHour.valueOf() - now.valueOf();
  const tenSec = sec2Ms(10);
  const fiveMin = min2Ms(5);

  if (diff < tenSec) return tenSec;
  if (diff > fiveMin) return fiveMin;

  return diff;
};
