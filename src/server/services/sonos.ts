import * as config from "../../../config";
import { axios } from "./index";

import { sec2Ms } from "../../utils/time";

export const name = "sonos";

const api = config.sonos.api;
let playing = false;
let playingTimer: NodeJS.Timeout | null = null;

export const get = (): Promise<SonosServiceData> =>
  axios.get<SonosResponse>(`${api}/zones`).then(({ data }) => {
    if (!data.length) throw Error("No Sonos devices found");

    const isPlaying = data.some(({ coordinator: { state } }) =>
      state.playbackState.includes("PLAYING")
    );

    if (isPlaying) {
      playingTimer && global.clearTimeout(playingTimer);
      playing = true;
    } else if (playing) {
      playingTimer = global.setTimeout(() => {
        playing = false;
      }, 5000);
    }

    return {
      service: name,
      data: data.map(
        ({ coordinator: { state, roomName, groupState }, members }) => ({
          state,
          roomName,
          groupState,
          members: members.map(({ roomName }) => roomName),
        })
      ),
      meta: { playing },
    };
  });

export const delay = () => sec2Ms(playing ? 1 : 3);

export const listener = ({ roomName, action, volume }: SonosEmit) => {
  const url = `${api}/${roomName}/${action}${
    action === "volume" ? `/${volume || "+0"}` : ""
  }`;

  return axios.get(url);
};
