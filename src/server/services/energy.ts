import * as config from "../../../config";
import { axios } from "./index";
import * as cheerio from "cheerio";

import { min2Ms } from "../../utils/time";
import { retry } from "../../utils/retry";

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
  "Aktuellt timpris": "now",
  Dagspris: "average",
  "Lägsta timpris": "low",
  "Högsta timpris": "high",
} as const;

export const get = (): Promise<EnergyServiceData> =>
  retry(
    axios.get<string>(getUrl(config.energy.zone)).then(({ data: src }) => {
      const $ = cheerio.load(src);

      console.log("data from cheerio");

      const data: Energy = {
        now: "N/A",
        high: "N/A",
        low: "N/A",
        average: "N/A",
      };

      $(".info-box-text").each((_, el) => {
        const text = $(el).text() as keyof typeof catMap;
        const cat = catMap[text];

        if (cat) data[cat] = $(el).siblings(".info-box-number").text();
      });

      console.log("after each", data);

      return {
        service: name,
        data,
      };
    })
  );

export const delay = () => min2Ms(5);
