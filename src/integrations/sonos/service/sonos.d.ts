// The sonos package has no bundled TypeScript declarations. This describes the
// local-control API used by this integration (sonos 1.14.x).
declare module "sonos" {
  import type { EventEmitter } from "node:events";

  export interface Track {
    artist?: string | null;
    title?: string | null;
    album?: string | null;
    uri?: string | null;
    albumArtURI?: string | null;
    albumArtURL?: string | null;
    duration?: number;
    position?: number;
    queuePosition?: number;
  }
  export interface Member {
    UUID: string;
    ZoneName: string;
    Location: string;
    Invisible?: string;
  }
  export interface Group {
    Coordinator: string;
    ZoneGroupMember: Member[];
    CoordinatorDevice(): Sonos;
  }
  export class Sonos {
    constructor(host: string, port?: number);
    host: string;
    port: number;
    getAllGroups(): Promise<Group[]>;
    currentTrack(): Promise<Track>;
    getVolume(): Promise<number>;
    getMuted(): Promise<boolean>;
    getPlayMode(): Promise<string>;
    avTransportService(): {
      GetTransportInfo(): Promise<{ CurrentTransportState: string }>;
      GetMediaInfo(): Promise<{ NextURI?: string; NextURIMetaData?: string }>;
      GetCrossfadeMode(): Promise<{ CrossfadeMode: string }>;
    };
    play(): Promise<boolean>;
    pause(): Promise<boolean>;
    next(): Promise<boolean>;
    previous(): Promise<boolean>;
    setVolume(volume: number): Promise<unknown>;
    adjustVolume(adjustment: number): Promise<unknown>;
  }
  export function DeviceDiscovery(options: {
    timeout: number;
  }): EventEmitter & {
    destroy(): void;
  };
  export const Helpers: {
    ParseXml(xml: string): Promise<unknown>;
    ParseDIDL(xml: unknown, host?: string, port?: number, uri?: string): Track;
  };
  export const Services: {
    GroupRenderingControl: new (
      host: string,
      port?: number,
    ) => {
      GetGroupVolume(): Promise<number>;
      GetGroupMute(): Promise<boolean>;
    };
  };
}
