import config from "../../../config";

import { ConfigError, axios } from "../../index";
import type { DeparturesResponse } from "../types";

import { min2Ms, sec2Ms } from "../../../utils/time";

export const name = "transports";
const { transports } = config;

export const get = async () => {
  const { settings } = transports ?? {};
  if (typeof settings?.siteId !== "string") {
    throw ConfigError(name, "Missing transports api key or siteIdconfig");
  }

  const { siteId, type, direction } = settings;

  const {
    data: { departures },
  } = await axios.get<DeparturesResponse>(
    `https://transport.integration.sl.se/v1/sites/${siteId}/departures?timewindow=60${type ? `&transport=${type}` : ""}${direction ? `&direction=${direction}` : ""}`
  );

  if (!departures) throw Error("Missing departures data");

  return {
    service: name,
    data: departures
      .map(({ display, scheduled, journey }) => ({
        id: `${journey.id}-${scheduled}`,
        display,
      }))
      .filter((_, ix) => ix < 5),
    meta: {
      label: transports?.label ?? "Transports",
    },
  };
};

export const delay = () => {
  const time = new Date();
  const day = time.getDay();
  const weekend = day === 0 || day === 6;
  const hour = time.getHours();
  const dayTime = (weekend ? hour >= 8 : hour >= 7) && hour <= 21;
  const peakTime =
    !weekend && ((hour >= 7 && hour <= 8) || (hour >= 15 && hour <= 16));

  if (peakTime) sec2Ms(20);

  if (dayTime) sec2Ms(30);

  return min2Ms(1);
};
