/// <reference path="./sonos.d.ts" />
import sonos from "sonos";
import type { Group, Track } from "sonos";
import config from "../../../config/index.ts";
import { axios } from "../../index.ts";
import type { SonosDevice, SonosEmit, SonosTrack } from "../types.ts";
import { createSubscriptions } from "./subscriptions.ts";
import { sec2Ms } from "../../../utils/time.ts";

export const name = "sonos";
const { Sonos, DeviceDiscovery, Helpers, Services } = sonos;
const albumCache = new Map<string, string | undefined>();
type Speaker = InstanceType<typeof Sonos>;
const speakers = new Map<string, { location: string; device: Speaker }>();
let commandsInFlight = 0;
let active: { refresh(): void; stop(): Promise<void> } | undefined;
let seed: Speaker | undefined;
let discovering: Promise<InstanceType<typeof Sonos>> | undefined;

const withTimeout = <T>(operation: Promise<T>): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    operation,
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Sonos speaker request timed out")),
        sec2Ms(10),
      );
    }),
  ]).finally(() => clearTimeout(timer));
};

const discover = () => {
  discovering ??= new Promise<InstanceType<typeof Sonos>>((resolve, reject) => {
    const search = DeviceDiscovery({ timeout: sec2Ms(5) });
    search.once("DeviceAvailable", (device) => {
      search.destroy();
      resolve(device);
    });
    search.once("timeout", () =>
      reject(new Error("No Sonos speakers found on the local network")),
    );
    search.once("error", (error) => {
      search.destroy();
      reject(error);
    });
  }).finally(() => {
    discovering = undefined;
  });
  return discovering;
};

const getGroups = async () => {
  try {
    seed ??= config.sonos?.host
      ? new Sonos(config.sonos.host)
      : await discover();
    const groups = (await withTimeout(seed.getAllGroups())).filter((group) =>
      group.ZoneGroupMember.some((member) => member.UUID === group.Coordinator),
    );
    const present = new Set<string>();
    for (const group of groups) {
      for (const member of group.ZoneGroupMember) {
        if (member.Invisible === "1" && member.UUID !== group.Coordinator)
          continue;
        present.add(member.UUID);
        if (speakers.get(member.UUID)?.location === member.Location) continue;
        const location = new URL(member.Location);
        const port = Number(location.port) || 1400;
        speakers.set(member.UUID, {
          location: member.Location,
          device:
            seed.host === location.hostname && seed.port === port
              ? seed
              : new Sonos(location.hostname, port),
        });
      }
    }
    for (const id of speakers.keys()) if (!present.has(id)) speakers.delete(id);
    return groups;
  } catch (error) {
    seed = undefined; // Rediscover after a speaker goes offline or changes IP.
    throw error;
  }
};

const nonNegative = (value = 0) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
const formatTime = (seconds: number) =>
  [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    Math.floor(seconds) % 60,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

const mapTrack = (
  track: Track,
  device: InstanceType<typeof Sonos>,
): SonosTrack => {
  const uri = track.uri ?? undefined;
  const artwork = track.albumArtURL || track.albumArtURI;
  const absoluteAlbumArtUri = artwork
    ? new URL(artwork, `http://${device.host}:${device.port}`).href
    : undefined;
  return {
    artist: track.artist ?? undefined,
    title: track.title ?? undefined,
    album: track.album ?? undefined,
    uri,
    trackUri: uri,
    duration: nonNegative(track.duration),
    type: uri?.startsWith("x-rincon-stream:") ? "line_in" : "track",
    absoluteAlbumArtUri,
    albumArtSrc: absoluteAlbumArtUri,
  };
};

const addAlbumArt = async (track: SonosTrack) => {
  if (track.albumArtSrc) return;
  const uri = track.uri?.replace("x-sonos-spotify:", "");
  if (!uri?.includes("spotify")) return;
  if (!albumCache.has(uri)) {
    try {
      const { data } = await axios.get<{ thumbnail_url?: string }>(
        `https://embed.spotify.com/oembed?url=${encodeURIComponent(uri)}`,
        { timeout: sec2Ms(5) },
      );
      albumCache.set(uri, data.thumbnail_url);
    } catch {
      albumCache.set(uri, undefined);
    }
  }
  track.albumArtSrc = albumCache.get(uri);
};

const readGroup = async (group: Group): Promise<SonosDevice> => {
  const device = speakers.get(group.Coordinator)!.device;
  const transport = device.avTransportService();
  const rendering = new Services.GroupRenderingControl(
    device.host,
    device.port,
  );
  const [
    track,
    playback,
    volume,
    mute,
    groupVolume,
    groupMute,
    playMode,
    crossfade,
    media,
  ] = await Promise.all([
    device.currentTrack(),
    transport.GetTransportInfo(),
    device.getVolume(),
    device.getMuted(),
    rendering.GetGroupVolume(),
    rendering.GetGroupMute(),
    device.getPlayMode(),
    transport.GetCrossfadeMode(),
    transport.GetMediaInfo(),
  ]);
  const currentTrack = mapTrack(track, device);
  await addAlbumArt(currentTrack);
  const next =
    media.NextURIMetaData && media.NextURIMetaData !== "NOT_IMPLEMENTED"
      ? Helpers.ParseDIDL(
          await Helpers.ParseXml(media.NextURIMetaData),
          device.host,
          device.port,
          media.NextURI,
        )
      : { uri: media.NextURI };
  const elapsedTime = nonNegative(track.position);
  const state = playback.CurrentTransportState;
  return {
    roomName: group.ZoneGroupMember.find(
      (member) => member.UUID === group.Coordinator,
    )!.ZoneName,
    members: group.ZoneGroupMember.filter(
      (member) => member.Invisible !== "1",
    ).map((member) => member.ZoneName),
    groupState: { volume: groupVolume, mute: groupMute },
    state: {
      volume,
      mute,
      currentTrack,
      nextTrack: mapTrack(next, device),
      trackNo: nonNegative(track.queuePosition),
      elapsedTime,
      elapsedTimeFormatted: formatTime(elapsedTime),
      playbackState:
        state === "PLAYING" ||
        state === "PAUSED_PLAYBACK" ||
        state === "TRANSITIONING"
          ? state
          : "STOPPED",
      playMode: {
        repeat: playMode.includes("ONE")
          ? "one"
          : playMode === "REPEAT_ALL" || playMode === "SHUFFLE"
            ? "all"
            : "none",
        shuffle: playMode.startsWith("SHUFFLE"),
        crossfade: crossfade.CrossfadeMode === "1",
      },
    },
  };
};

export const get = async () => ({
  service: name as typeof name,
  data: await withTimeout(Promise.all((await getGroups()).map(readGroup))),
});

// Used for recovery rather than the primary source of updates.
export const delay = () => sec2Ms(60);

export const start = (
  publish: (response: Awaited<ReturnType<typeof get>>) => void,
  onError: (error: unknown) => void,
) => {
  if (active) return;
  let running = true;
  let groups: Group[] = [];
  const snapshots = new Map<string, { data: SonosDevice; sampledAt: number }>();
  const dirty = new Set<string>();
  let topologyChanged = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let refreshing: Promise<void> | undefined;

  const request = (speakerId?: string) => {
    if (!running) return;
    if (speakerId) dirty.add(speakerId);
    else topologyChanged = true;
    if (!timer && !refreshing) timer = setTimeout(flush, 150);
  };
  const subscriptions = createSubscriptions(
    (id, endpoint) => {
      if (endpoint === "/ZoneGroupTopology/Event") return request();
      const group = groups.find((g) =>
        g.ZoneGroupMember.some((m) => m.UUID === id),
      );
      if (!group) return request();
      if (endpoint.includes("AVTransport") && group.Coordinator !== id) return;
      request(id);
    },
    (error) => {
      if (running) onError(error);
    },
  );

  const refresh = async () => {
    const full = topologyChanged || !groups.length;
    const changed = new Set(dirty);
    topologyChanged = false;
    dirty.clear();
    if (full) {
      groups = await getGroups();
      for (const id of snapshots.keys()) {
        if (!groups.some((g) => g.Coordinator === id)) snapshots.delete(id);
      }
    }
    const affected = full
      ? groups
      : groups.filter((group) =>
          group.ZoneGroupMember.some((member) => changed.has(member.UUID)),
        );
    const results = await Promise.allSettled(
      affected.map(async (group) => {
        const data = await withTimeout(readGroup(group));
        snapshots.set(group.Coordinator, { data, sampledAt: Date.now() });
      }),
    );
    if (!running) return;
    for (const result of results)
      if (result.status === "rejected") onError(result.reason);
    if (commandsInFlight) request();
    else if (snapshots.size || !groups.length) {
      publish({
        service: name,
        data: groups.flatMap((group) => {
          const snapshot = snapshots.get(group.Coordinator);
          if (!snapshot) return [];
          const { data, sampledAt } = snapshot;
          // Updates for one group must not rewind another group's local clock.
          const elapsedTime =
            data.state.playbackState === "PLAYING"
              ? Math.min(
                  data.state.currentTrack.duration || Infinity,
                  data.state.elapsedTime + (Date.now() - sampledAt) / 1000,
                )
              : data.state.elapsedTime;
          return [
            {
              ...data,
              state: {
                ...data.state,
                elapsedTime,
                elapsedTimeFormatted: formatTime(elapsedTime),
              },
            },
          ];
        }),
      });
    }
    if (full && running)
      await subscriptions.reconcile(
        [...speakers].map(([id, { device }]) => ({
          id,
          host: device.host,
          port: device.port,
        })),
      );
  };

  function flush() {
    timer = undefined;
    if (!running) return;
    if (commandsInFlight) {
      request();
      return;
    }
    refreshing = refresh()
      .catch((error) => {
        if (running) onError(error);
      })
      .finally(() => {
        refreshing = undefined;
        if (running && (topologyChanged || dirty.size)) requestPending();
      });
  }
  function requestPending() {
    if (!timer) timer = setTimeout(flush, 150);
  }
  const recovery = setInterval(() => request(), delay());
  active = {
    refresh: () => request(),
    async stop() {
      running = false;
      clearTimeout(timer);
      clearInterval(recovery);
      await Promise.all([subscriptions.close(), refreshing]);
    },
  };
  flush();
};

export const stop = async () => {
  const previous = active;
  active = undefined;
  await previous?.stop();
};

const execute = async ({ roomName, action, volume }: SonosEmit) => {
  if (!["play", "pause", "next", "previous", "volume"].includes(action))
    throw new Error("Unsupported Sonos action");
  // Resolve current topology for every command so regrouped rooms use their
  // current coordinator. Volume continues to target the named speaker.
  const groups = await getGroups();
  const group = groups.find((group) =>
    group.ZoneGroupMember.some((member) => member.ZoneName === roomName),
  );
  const member = group?.ZoneGroupMember.find(
    (member) => member.ZoneName === roomName,
  );
  if (!group || !member) throw new Error(`Sonos room not found: ${roomName}`);
  if (action !== "volume")
    return withTimeout(speakers.get(group.Coordinator)!.device[action]());

  const value = volume ?? "+0";
  if (!/^[+-]?\d+$/.test(value)) throw new Error("Invalid Sonos volume");
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || Math.abs(amount) > 100)
    throw new Error(
      "Sonos volume must be between 0 and 100, or a relative adjustment within ±100",
    );
  const speaker = speakers.get(member.UUID)?.device;
  if (!speaker) throw new Error(`Sonos room is unavailable: ${roomName}`);
  return withTimeout(
    /^[+-]/.test(value)
      ? speaker.adjustVolume(amount)
      : speaker.setVolume(amount),
  );
};

export const listener = async (payload: SonosEmit) => {
  commandsInFlight++;
  try {
    return await execute(payload);
  } finally {
    commandsInFlight--;
    active?.refresh();
  }
};

export const enabled = true;
