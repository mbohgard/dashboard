import config from "../../../config";

import { ConfigError, axios } from "../../index";
import * as cheerio from "cheerio";
import dayjs from "dayjs";

import type { ApiResponse } from "../types";
import { min2Ms, sec2Ms } from "../../../utils/time";

export const name = "energy";
const { energy } = config;

const zones = {
  SE1: "se1-lulea",
  SE2: "se2-sundsvall",
  SE3: "se3-stockholm",
  SE4: "se4-malmo",
};

const catMap = {
  "Aktuellt pris": "now",
  Dagspris: "average",
  "Lägsta timpris": "low",
  "Högsta timpris": "high",
} as const;

export const get = async () => {
  if (!energy?.zone) throw ConfigError(name, "Missing energy zone config");

  const src = (
    await axios.get<string>(
      `https://www.elbruk.se/timpriser-${
        zones[energy.zone as keyof typeof zones]
      }`
    )
  ).data;

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
};

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
