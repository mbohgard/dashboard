import { getImages } from "icloud-shared-album";

import { ConfigError } from "../../index";
import config from "../../../config";
import { min2Ms } from "../../../utils/time";

export const name = "icloud";
const { icloud } = config;

export const get = async () => {
  if (!icloud?.albumToken) throw ConfigError(name, "Missing icloud url");

  console.log("icloud fetching");

  const data = await getImages(icloud.albumToken);

  console.log("icloud", data);

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
