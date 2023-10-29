import * as config from "../../../config";
import { axios } from "./index";

import { sec2Ms } from "../../utils/time";

export const name = "sonos";

const API = config.sonos.api;
const SONOS_API = "https://embed.spotify.com/oembed?url=";

let dataCache: SonosResponse = [];
const albumCache = new Map<string, string | undefined>();

const getAlbumArtSrc = async (device: SonosResponse[number]) => {
  const track = device.coordinator.state.currentTrack;

  if (track.absoluteAlbumArtUri?.startsWith("http")) {
    track.albumArtSrc = track.absoluteAlbumArtUri;

    return device;
  }

  const uri = (track.trackUri || track.uri)?.replace("x-sonos-spotify:", "");

  if (!uri?.includes("spotify")) return device;

  if (albumCache.has(uri)) {
    track.albumArtSrc = albumCache.get(uri);

    return device;
  }

  try {
    const src = (await axios.get(`${SONOS_API}${uri}`)).data.thumbnail_url;

    track.albumArtSrc = src;
  } catch {
    // leave track.albumArtSrc undefined
  }

  albumCache.set(uri, track.albumArtSrc);

  return device;
};

const filterData = (updatedDevice?: SonosCompleteDevice) => {
  if (updatedDevice) {
    const ix = dataCache.findIndex(
      (device) => device.uuid === updatedDevice.uuid
    );

    if (ix > -1)
      dataCache[ix] = {
        ...dataCache[ix]!,
        coordinator: updatedDevice,
      };
  }

  return dataCache.map(
    ({ coordinator: { state, roomName, groupState }, members }) => ({
      state,
      roomName,
      groupState,
      members: members.map(({ roomName }) => roomName),
    })
  );
};

export const get = (): Promise<SonosServiceData> =>
  axios
    .get<SonosResponse>(`${API}/zones`)
    .then(({ data }) => {
      if (!data.length) throw Error("No Sonos devices found");

      return Promise.all(data.map(getAlbumArtSrc));
    })
    .then((data) => {
      dataCache = data;

      return {
        service: name,
        data: filterData(),
        meta: { feed: false },
      };
    });

export const delay = () => sec2Ms(5);

export const listener = ({ roomName, action, volume }: SonosEmit) => {
  const url = `${API}/${roomName}/${action}${
    action === "volume" ? `/${volume || "+0"}` : ""
  }`;

  return axios.get(url);
};

export const feed = {
  endpoint: config.sonos.feed,
  handler: (body: SonosFeedResponse): SonosServiceData | null => {
    // console.dir(body, { depth: 3 });
    if (!dataCache.length) return null;

    const res = {
      service: name,
      meta: { feed: true },
    } as const;

    if (body.type === "transport-state") {
      return {
        ...res,
        data: filterData(body.data),
      };
    }

    if (body.type === "volume-change") {
    }

    return null;
  },
};
