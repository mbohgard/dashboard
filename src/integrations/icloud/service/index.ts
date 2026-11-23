import { getImages } from "icloud-shared-album";

import { ConfigError } from "../../index.ts";
import config from "../../../config/index.ts";
import { min2Ms } from "../../../utils/time.ts";

export const name = "icloud";
const { icloud } = config;

export const get = async () => {
  if (!icloud?.albumToken) throw ConfigError(name, "Missing icloud url");

  const data = await getImages(icloud.albumToken);

  return {
    service: name,
    data: data.photos
      .map(({ height: key, derivatives }) => derivatives[key]?.url)
      .filter(Boolean) as string[],
    meta: {
      label: icloud.label,
    },
  };
};

export const delay = () => min2Ms(5);

export const enabled = true;
