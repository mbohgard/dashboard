import { getImages } from "icloud-shared-album";

import { ConfigError } from "../../index";
import config from "../../../config";
import { min2Ms } from "../../../utils/time";

export const name = "icloud";
const { icloud } = config;

export const get = async () => {
  if (!icloud?.albumToken) throw ConfigError(name, "Missing chores url");

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
