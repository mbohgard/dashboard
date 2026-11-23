import http from "node:http";
import dgram from "node:dgram";
import { randomUUID } from "node:crypto";
import { once } from "node:events";

export interface SpeakerAddress {
  id: string;
  host: string;
  port: number;
}

type Subscription = SpeakerAddress & {
  endpoint: string;
  token: string;
  sid?: string;
  renewAt: number;
};

const endpoints = [
  "/MediaRenderer/AVTransport/Event",
  "/MediaRenderer/RenderingControl/Event",
  "/MediaRenderer/GroupRenderingControl/Event",
  "/ZoneGroupTopology/Event",
];

// Discover the local interface used to reach this speaker, including machines
// with Ethernet, Wi-Fi and VPN interfaces. No discovery packet is sent.
const localAddress = (host: string, port: number) =>
  new Promise<string>((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    socket.once("error", (error) => {
      socket.close();
      reject(error);
    });
    socket.connect(port, host, () => {
      const address = socket.address().address;
      socket.close();
      resolve(address);
    });
  });

// Own the small UPnP subscription transport here rather than using sonos's
// global Listener: its stopListener leaves renewal timers and failed partial
// subscriptions behind. Speaker operations and metadata still use the library.
export const createSubscriptions = (
  onChange: (speakerId: string, endpoint: string) => void,
  onError: (error: unknown) => void,
) => {
  const subscriptions = new Map<string, Subscription>();
  const abort = new AbortController();
  let closed = false;
  const server = http.createServer((req, res) => {
    const token = req.url?.slice("/notify/".length);
    const subscription =
      req.url?.startsWith("/notify/") && token
        ? subscriptions.get(token)
        : undefined;
    req.on("error", () => res.destroy());
    req.resume();
    if (
      closed ||
      req.method !== "NOTIFY" ||
      !subscription ||
      (subscription.sid && req.headers.sid !== subscription.sid)
    ) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200).end();
    // Notification payloads are hints to reread authoritative speaker state;
    // they are never applied directly to the browser's state.
    onChange(subscription.id, subscription.endpoint);
  });
  const listening = once(server, "listening");
  server.listen(0, "0.0.0.0");
  void listening.catch(onError);
  server.on("error", onError);

  const unsubscribe = async (subscription: Subscription) => {
    if (!subscription.sid) return;
    try {
      await fetch(
        `http://${subscription.host}:${subscription.port}${subscription.endpoint}`,
        {
          method: "UNSUBSCRIBE",
          headers: { SID: subscription.sid },
          signal: AbortSignal.timeout(2000),
        },
      );
    } catch {
      // Offline speakers expire subscriptions themselves. Local cleanup must
      // not depend on a disconnected device acknowledging UNSUBSCRIBE.
    }
  };

  const subscribe = async (subscription: Subscription) => {
    await listening;
    if (closed) return;
    const port = (server.address() as { port: number }).port;
    const callbackHost = await localAddress(
      subscription.host,
      subscription.port,
    );
    const url = `http://${subscription.host}:${subscription.port}${subscription.endpoint}`;
    const request = (renew: boolean) =>
      fetch(url, {
        method: "SUBSCRIBE",
        headers:
          renew && subscription.sid
            ? { SID: subscription.sid, TIMEOUT: "Second-1800" }
            : {
                CALLBACK: `<http://${callbackHost}:${port}/notify/${subscription.token}>`,
                NT: "upnp:event",
                TIMEOUT: "Second-1800",
              },
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]),
      });
    let response = await request(Boolean(subscription.sid));
    if (response.status === 412 && subscription.sid) {
      subscription.sid = undefined;
      response = await request(false);
    }
    if (!response.ok)
      throw new Error(`Sonos event subscription failed (${response.status})`);
    const sid = response.headers.get("sid") ?? subscription.sid;
    if (!sid) throw new Error("Sonos event subscription has no SID");
    subscription.sid = sid;
    const seconds = Number(
      response.headers.get("timeout")?.match(/^Second-(\d+)$/i)?.[1] ?? 1800,
    );
    // A minute-long recovery interval must renew comfortably before expiry.
    subscription.renewAt = Date.now() + Math.max(0, seconds * 1000 - 120000);
    if (closed || !subscriptions.has(subscription.token))
      await unsubscribe(subscription);
  };

  return {
    async reconcile(speakers: SpeakerAddress[]) {
      if (closed) return;
      const wanted = new Map(speakers.map((speaker) => [speaker.id, speaker]));
      const removed = [...subscriptions.values()].filter((subscription) => {
        const speaker = wanted.get(subscription.id);
        return (
          !speaker ||
          speaker.host !== subscription.host ||
          speaker.port !== subscription.port
        );
      });
      for (const subscription of removed)
        subscriptions.delete(subscription.token);
      await Promise.all(removed.map(unsubscribe));
      if (closed) return;
      for (const speaker of speakers) {
        for (const endpoint of endpoints) {
          if (
            ![...subscriptions.values()].some(
              (s) => s.id === speaker.id && s.endpoint === endpoint,
            )
          ) {
            const subscription = {
              ...speaker,
              endpoint,
              token: randomUUID(),
              renewAt: 0,
            };
            subscriptions.set(subscription.token, subscription);
          }
        }
      }
      const results = await Promise.allSettled(
        [...subscriptions.values()]
          .filter((s) => !s.sid || s.renewAt <= Date.now())
          .map(subscribe),
      );
      if (!closed) {
        const failure = results.find((result) => result.status === "rejected");
        if (failure?.status === "rejected") onError(failure.reason);
      }
    },
    async close() {
      if (closed) return;
      closed = true;
      abort.abort();
      const previous = [...subscriptions.values()];
      subscriptions.clear();
      // Wait for listen() even if stopped immediately after startup.
      await listening.catch(() => {});
      const stopped = new Promise<void>((resolve) =>
        server.close(() => resolve()),
      );
      server.closeAllConnections();
      await Promise.all([stopped, ...previous.map(unsubscribe)]);
    },
  };
};
