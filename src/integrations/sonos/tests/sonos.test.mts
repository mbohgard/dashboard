import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import http from "node:http";
import { mock, test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import realSonos from "sonos";

// Run the real Sonos SOAP client against local fake speakers. Only network
// discovery is substituted, so these tests never control household speakers.
const calls: Array<{ speaker: string; action: string; body: string }> = [];
const ports: Record<string, number> = {};
let coordinator = "living";
let playback = "PLAYING";
let discoveryMode = "found";
let searches = 0;
let destroyed = 0;
let extraGroup = false;
let failSubscription = false;
let rejectRenewal = false;
let subscriptionTimeout = "Second-1800";
let topologyOffline = false;
let blockPosition: Promise<void> | undefined;
const subscriptions = new Map<
  string,
  { speaker: string; endpoint: string; callback: string }
>();
const subscriptionCalls: Array<{
  method: string;
  speaker: string;
  sid?: string;
}> = [];
const waitFor = async (ready: () => boolean) => {
  const deadline = performance.now() + 4000;
  while (!ready()) {
    if (performance.now() > deadline)
      throw new Error("Timed out waiting for Sonos update");
    await sleep(10);
  }
};
const notify = async (speaker: string, endpoint: string) => {
  const entry = [...subscriptions].find(
    ([, s]) => s.speaker === speaker && s.endpoint.includes(endpoint),
  );
  assert.ok(entry, `No subscription for ${speaker} ${endpoint}`);
  return fetch(entry[1].callback, {
    method: "NOTIFY",
    headers: { SID: entry[0] },
    body: '<e:propertyset xmlns:e="urn:schemas-upnp-org:event-1-0"><e:property><LastChange>changed</LastChange></e:property></e:propertyset>',
  });
};
const escape = (xml: string) =>
  xml
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const metadata = (title: string) =>
  `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"><item id="track"><dc:title>${title}</dc:title><dc:creator>Artist</dc:creator><upnp:album>Album</upnp:album><upnp:albumArtURI>/cover.jpg</upnp:albumArtURI></item></DIDL-Lite>`;
const topology = () =>
  `<ZoneGroups><ZoneGroup Coordinator="${coordinator}" ID="group">${["living", "kitchen", "sub"].map((id) => `<ZoneGroupMember UUID="${id}" ZoneName="${id}" Location="http://127.0.0.1:${ports[id] ?? ports.living}/xml/device_description.xml" Invisible="${id === "sub" ? "1" : "0"}"/>`).join("")}</ZoneGroup>${extraGroup ? `<ZoneGroup Coordinator="office" ID="office-group"><ZoneGroupMember UUID="office" ZoneName="office" Location="http://127.0.0.1:${ports.office}/xml/device_description.xml"/></ZoneGroup>` : ""}</ZoneGroups>`;

const createSpeaker = async (speaker: string) => {
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    if (req.method === "SUBSCRIBE" || req.method === "UNSUBSCRIBE") {
      const sid = req.headers.sid as string | undefined;
      subscriptionCalls.push({ method: req.method, speaker, sid });
      if (req.method === "UNSUBSCRIBE") {
        if (sid) subscriptions.delete(sid);
        res.writeHead(200).end();
        return;
      }
      if (
        failSubscription &&
        speaker === "kitchen" &&
        req.url?.includes("RenderingControl")
      ) {
        res.writeHead(503).end();
        return;
      }
      if (sid && rejectRenewal) {
        res.writeHead(412).end();
        return;
      }
      const nextSid = sid ?? `uuid:${randomUUID()}`;
      if (!sid)
        subscriptions.set(nextSid, {
          speaker,
          endpoint: req.url!,
          callback: String(req.headers.callback).slice(1, -1),
        });
      res.writeHead(200, { SID: nextSid, TIMEOUT: subscriptionTimeout }).end();
      return;
    }
    const header = String(req.headers.soapaction).replaceAll('"', "");
    const [service, action] = header.split("#") as [string, string];
    calls.push({ speaker, action, body });
    if (topologyOffline && action === "GetZoneGroupState") {
      res.writeHead(503).end("Offline");
      return;
    }
    if (action === "GetPositionInfo" && blockPosition) await blockPosition;
    const outputs: Record<string, string> = {
      GetZoneGroupState: `<ZoneGroupState>${escape(topology())}</ZoneGroupState>`,
      GetPositionInfo: `<Track>3</Track><TrackDuration>00:03:20</TrackDuration><TrackMetaData>${escape(metadata("Current"))}</TrackMetaData><TrackURI>x-sonos-spotify:spotify:track:example</TrackURI><RelTime>00:01:05</RelTime>`,
      GetMediaInfo: `<NextURI>next-track</NextURI><NextURIMetaData>${escape(metadata("Next"))}</NextURIMetaData>`,
      GetTransportInfo: `<CurrentTransportState>${playback}</CurrentTransportState>`,
      GetTransportSettings: "<PlayMode>SHUFFLE_REPEAT_ONE</PlayMode>",
      GetCrossfadeMode: "<CrossfadeMode>1</CrossfadeMode>",
      GetVolume: "<CurrentVolume>25</CurrentVolume>",
      GetMute: "<CurrentMute>0</CurrentMute>",
      GetGroupVolume: "<CurrentVolume>30</CurrentVolume>",
      GetGroupMute: "<CurrentMute>1</CurrentMute>",
      SetRelativeVolume: "<NewVolume>22</NewVolume>",
    };
    res.setHeader("Content-Type", "text/xml");
    res.end(
      `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><u:${action}Response xmlns:u="${service}">${outputs[action] ?? ""}</u:${action}Response></s:Body></s:Envelope>`,
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  ports[speaker] = (server.address() as { port: number }).port;
  return server;
};

mock.module(new URL("../../../config/index.ts", import.meta.url).href, {
  exports: { default: {} },
});
mock.module(new URL("../../index.ts", import.meta.url).href, {
  exports: {
    axios: {
      get: () => {
        throw new Error("Unexpected external artwork request");
      },
    },
  },
});
mock.module("sonos", {
  exports: {
    default: {
      ...realSonos,
      DeviceDiscovery: () => {
        searches++;
        const search = Object.assign(new EventEmitter(), {
          destroy: () => {
            destroyed++;
          },
        });
        queueMicrotask(() => {
          if (discoveryMode === "timeout") search.emit("timeout");
          else if (discoveryMode === "error")
            search.emit("error", new Error("Discovery failed"));
          else
            search.emit(
              "DeviceAvailable",
              new realSonos.Sonos("127.0.0.1", ports.living),
            );
        });
        return search;
      },
    },
  },
});
let instance = 0;
const services: Array<{ stop(): Promise<void> }> = [];
const fresh = async () => {
  const service = await import(`../service/index.ts?test=${instance++}`);
  services.push(service);
  return service;
};

await test("direct Sonos integration", async (t) => {
  const servers = await Promise.all([
    createSpeaker("living"),
    createSpeaker("kitchen"),
    createSpeaker("office"),
  ]);
  try {
    await t.test(
      "maps real SOAP responses to the existing client payload",
      async () => {
        const service = await fresh();
        const { data } = await service.get();
        assert.equal(data.length, 1);
        const group = data[0]!;
        assert.equal(group.roomName, "living");
        assert.deepEqual(group.members, ["living", "kitchen"]);
        assert.deepEqual(group.groupState, { volume: 30, mute: true });
        assert.equal(group.state.volume, 25);
        assert.equal(group.state.mute, false);
        assert.equal(group.state.playbackState, "PLAYING");
        assert.equal(group.state.currentTrack.title, "Current");
        assert.equal(group.state.currentTrack.artist, "Artist");
        assert.equal(group.state.currentTrack.duration, 200);
        assert.equal(
          group.state.currentTrack.albumArtSrc,
          `http://127.0.0.1:${ports.living}/cover.jpg`,
        );
        assert.equal(group.state.nextTrack.title, "Next");
        assert.equal(group.state.elapsedTime, 65);
        assert.equal(group.state.elapsedTimeFormatted, "00:01:05");
        assert.equal(group.state.trackNo, 3);
        assert.deepEqual(group.state.playMode, {
          repeat: "one",
          shuffle: true,
          crossfade: true,
        });
        playback = "PAUSED_PLAYBACK";
        assert.equal(
          (await service.get()).data[0]!.state.playbackState,
          "PAUSED_PLAYBACK",
        );
      },
    );
    await t.test(
      "discovers once and cleans up the discovery socket",
      async () => {
        const before = searches;
        const beforeDestroyed = destroyed;
        const service = await fresh();
        await Promise.all([service.get(), service.get()]);
        assert.equal(searches - before, 1);
        assert.equal(destroyed - beforeDestroyed, 1);
      },
    );
    await t.test(
      "routes all transport commands to the current group coordinator",
      async () => {
        const service = await fresh();
        for (const action of ["play", "pause", "next", "previous"] as const) {
          await service.listener({ roomName: "kitchen", action });
          assert.equal(calls.at(-1)!.speaker, "living");
          assert.equal(calls.at(-1)!.action.toLowerCase(), action);
        }
        coordinator = "kitchen";
        await service.listener({ roomName: "living", action: "pause" });
        assert.equal(calls.at(-1)!.speaker, "kitchen");
        coordinator = "living";
      },
    );
    await t.test(
      "sends absolute and relative volume to the selected speaker",
      async () => {
        const service = await fresh();
        await service.listener({
          roomName: "kitchen",
          action: "volume",
          volume: "0",
        });
        assert.equal(calls.at(-1)!.speaker, "kitchen");
        assert.equal(calls.at(-1)!.action, "SetVolume");
        assert.match(calls.at(-1)!.body, /<DesiredVolume>0<\/DesiredVolume>/);
        await service.listener({
          roomName: "kitchen",
          action: "volume",
          volume: "-3",
        });
        assert.equal(calls.at(-1)!.action, "SetRelativeVolume");
        assert.match(calls.at(-1)!.body, /<Adjustment>-3<\/Adjustment>/);
      },
    );
    await t.test(
      "rejects invalid commands without sending control requests",
      async () => {
        const service = await fresh();
        const before = calls.filter((c) =>
          /^(Play|Pause|Next|Previous|Set)/.test(c.action),
        ).length;
        for (const volume of [
          "NaN",
          "101",
          "-101",
          "1.5",
          "",
          "1</DesiredVolume>",
        ]) {
          await assert.rejects(
            service.listener({ roomName: "kitchen", action: "volume", volume }),
          );
        }
        await assert.rejects(
          service.listener({ roomName: "missing", action: "play" }),
          /room not found/,
        );
        await assert.rejects(
          service.listener({ roomName: "kitchen", action: "reboot" as "play" }),
          /Unsupported/,
        );
        assert.equal(
          calls.filter((c) => /^(Play|Pause|Next|Previous|Set)/.test(c.action))
            .length,
          before,
        );
      },
    );
    await t.test(
      "handles discovery timeout/error and recovers on the next poll",
      async () => {
        const service = await fresh();
        discoveryMode = "timeout";
        await assert.rejects(service.get(), /No Sonos speakers/);
        discoveryMode = "error";
        await assert.rejects(service.get(), /Discovery failed/);
        discoveryMode = "found";
        assert.equal((await service.get()).data.length, 1);
      },
    );

    await t.test("one-shot reads do not create subscriptions", async () => {
      const service = await fresh();
      const before = subscriptionCalls.length;
      await service.get();
      assert.equal(subscriptionCalls.length, before);
      assert.equal(service.delay(), 60000);
    });
    await t.test(
      "notifications refresh only the affected group and coalesce bursts",
      async () => {
        extraGroup = true;
        const service = await fresh();
        const updates: any[] = [];
        const errors: unknown[] = [];
        service.start(
          (data: unknown) => updates.push(data),
          (error: unknown) => errors.push(error),
        );
        await waitFor(() => subscriptions.size === 12 && updates.length > 0);
        assert.equal(updates.at(-1).data.length, 2);
        const beforeReads = calls.filter(
          (c) => c.action === "GetPositionInfo",
        ).length;
        const beforeTopology = calls.filter(
          (c) => c.action === "GetZoneGroupState",
        ).length;
        const beforeUpdates = updates.length;
        playback = "PLAYING";
        await Promise.all(
          Array.from({ length: 5 }, () => notify("living", "AVTransport")),
        );
        await waitFor(() => updates.length > beforeUpdates);
        assert.equal(
          updates.at(-1).data.find((d: any) => d.roomName === "living").state
            .playbackState,
          "PLAYING",
        );
        assert.equal(
          calls.filter((c) => c.action === "GetPositionInfo").length -
            beforeReads,
          1,
        );
        assert.equal(
          calls.filter((c) => c.action === "GetZoneGroupState").length,
          beforeTopology,
        );
        assert.equal(errors.length, 0);
        // Per-room rendering changes also trigger a fresh group snapshot.
        const beforeVolume = updates.length;
        await notify("kitchen", "RenderingControl");
        await waitFor(() => updates.length > beforeVolume);
        await service.stop();
        assert.equal(subscriptions.size, 0);
        extraGroup = false;
      },
    );
    await t.test(
      "notifications arriving during a refresh queue one follow-up read",
      async () => {
        const service = await fresh();
        const updates: any[] = [];
        service.start((data: unknown) => updates.push(data), assert.fail);
        await waitFor(() => subscriptions.size === 8 && updates.length > 0);
        const before = calls.filter(
          (c) => c.action === "GetPositionInfo",
        ).length;
        const beforeUpdates = updates.length;
        let release!: () => void;
        blockPosition = new Promise<void>((resolve) => {
          release = resolve;
        });
        try {
          await notify("living", "AVTransport");
          await waitFor(
            () =>
              calls.filter((c) => c.action === "GetPositionInfo").length ===
              before + 1,
          );
          await Promise.all(
            Array.from({ length: 5 }, () =>
              notify("kitchen", "RenderingControl"),
            ),
          );
          await sleep(200);
          assert.equal(
            calls.filter((c) => c.action === "GetPositionInfo").length,
            before + 1,
          );
        } finally {
          blockPosition = undefined;
          release();
        }
        await waitFor(() => updates.length === beforeUpdates + 2);
        assert.equal(
          calls.filter((c) => c.action === "GetPositionInfo").length,
          before + 2,
        );
        await service.stop();
      },
    );
    await t.test(
      "offline startup recovers without five-second polling or duplicate watchers",
      async (t) => {
        t.mock.timers.enable({ apis: ["setInterval"] });
        const service = await fresh();
        const updates: any[] = [];
        const errors: unknown[] = [];
        topologyOffline = true;
        service.start(
          (data: unknown) => updates.push(data),
          (error: unknown) => errors.push(error),
        );
        service.start(assert.fail, assert.fail); // Starting twice must be a no-op.
        await waitFor(() => errors.length > 0);
        const before = calls.length;
        t.mock.timers.tick(5000);
        await sleep(20);
        assert.equal(calls.length, before);
        topologyOffline = false;
        t.mock.timers.tick(55000);
        await waitFor(() => subscriptions.size === 8 && updates.length === 1);
        await service.stop();
      },
    );
    await t.test(
      "regrouping follows the new coordinator and unsubscribes removed rooms",
      async () => {
        extraGroup = true;
        const service = await fresh();
        const updates: any[] = [];
        service.start((data: unknown) => updates.push(data), assert.fail);
        await waitFor(() => subscriptions.size === 12 && updates.length > 0);
        coordinator = "kitchen";
        extraGroup = false;
        await notify("living", "ZoneGroupTopology");
        await waitFor(
          () =>
            updates.at(-1)?.data[0]?.roomName === "kitchen" &&
            subscriptions.size === 8,
        );
        const before = updates.length;
        playback = "PAUSED_PLAYBACK";
        await notify("kitchen", "AVTransport");
        await waitFor(() => updates.length > before);
        assert.equal(
          updates.at(-1).data[0].state.playbackState,
          "PAUSED_PLAYBACK",
        );
        await service.stop();
        coordinator = "living";
      },
    );
    await t.test(
      "recovery renews expired subscriptions and retries partial failures",
      async (t) => {
        t.mock.timers.enable({ apis: ["setInterval"] });
        const service = await fresh();
        const updates: any[] = [];
        const errors: unknown[] = [];
        failSubscription = true;
        subscriptionTimeout = "Second-1";
        service.start(
          (data: unknown) => updates.push(data),
          (error: unknown) => errors.push(error),
        );
        await waitFor(() => errors.length > 0 && subscriptions.size === 6);
        failSubscription = false;
        rejectRenewal = true;
        const before = updates.length;
        playback = "STOPPED"; // No notification: the recovery snapshot must fix it.
        t.mock.timers.tick(60000);
        await waitFor(
          () =>
            updates.length > before &&
            subscriptionCalls.some((c) => c.sid && c.method === "SUBSCRIBE"),
        );
        await waitFor(
          () =>
            [...subscriptions.values()].filter((s) => s.speaker === "kitchen")
              .length >= 4,
        );
        assert.equal(updates.at(-1).data[0].state.playbackState, "STOPPED");
        await service.stop();
        rejectRenewal = false;
        subscriptionTimeout = "Second-1800";
        // A 412 represents an expired SID at the speaker; discard fake old SIDs.
        subscriptions.clear();
      },
    );
    await t.test(
      "shutdown cancels subscriptions and closes the callback listener",
      async () => {
        const service = await fresh();
        const updates: any[] = [];
        service.start((data: unknown) => updates.push(data), assert.fail);
        await waitFor(() => subscriptions.size === 8 && updates.length > 0);
        const callback = [...subscriptions.values()][0]!.callback;
        await service.stop();
        assert.equal(subscriptions.size, 0);
        const before = updates.length;
        await assert.rejects(fetch(callback, { method: "NOTIFY" }));
        await sleep(200);
        assert.equal(updates.length, before);
        // Starting a new watch after shutdown must subscribe afresh.
        service.start((data: unknown) => updates.push(data), assert.fail);
        await waitFor(
          () => subscriptions.size === 8 && updates.length > before,
        );
        await service.stop();
      },
    );
  } finally {
    await Promise.all(services.map((service) => service.stop()));
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          ),
      ),
    );
  }
});
