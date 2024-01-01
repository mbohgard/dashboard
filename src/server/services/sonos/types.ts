interface SonosTrack {
  artist?: string;
  title?: string;
  album?: string;
  duration: 116;
  type: "track" | "line_in";
  stationName?: string;
  uri?: string;
  trackUri?: string;
  absoluteAlbumArtUri?: string;
  albumArtSrc?: string;
}

export interface SonosCompleteDevice {
  uuid: string;
  state: {
    volume: number;
    mute: boolean;
    currentTrack: SonosTrack;
    nextTrack: SonosTrack;
    trackNo: number;
    elapsedTime: number;
    elapsedTimeFormatted: string;
    playbackState: "PLAYING" | "PAUSED_PLAYBACK" | "STOPPED" | "TRANSITIONING";
    playMode: {
      repeat: string;
      shuffle: boolean;
      crossfade: boolean;
    };
  };
  roomName: string;
  coordinator: string;
  groupState: {
    volume: number;
    mute: boolean;
  };
}

export type SonosDevice = Pick<
  SonosCompleteDevice,
  "state" | "roomName" | "groupState"
> & {
  members: string[];
};

export type ApiResponse = Array<{
  uuid: string;
  coordinator: SonosCompleteDevice;
  members: SonosCompleteDevice[];
}>;

export type SonosFeedResponse =
  | {
      type: "transport-state";
      data: SonosCompleteDevice;
    }
  | {
      type: "volume-change";
      data: {
        uuid: string;
        previousVolume: number;
        newVolume: number;
        roomName: string;
      };
    }
  | {
      type: "mute-change";
      data: {
        uuid: string;
        previousMute: boolean;
        newMute: boolean;
        roomName: string;
      };
    }
  | {
      type: "topology-change";
      data: ApiResponse;
    };

export interface SonosEmit {
  roomName: string;
  action: "play" | "pause" | "volume" | "next" | "previous";
  volume?: string;
}
