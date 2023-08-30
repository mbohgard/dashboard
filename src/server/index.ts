import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import ws from "socket.io";

import { version } from "../../package.json";

import * as subscribers from "./subscribers";
import services, { ServiceName } from "./services";
import { ms2Sec } from "../utils/time";
import { stringify } from "../utils/helpers";

let launched: number;

const prod = process.env.NODE_ENV === "production";
const port = 8081;

const app = express();

const server = http.createServer(app);
const io = new ws.Server(server, {
  cors: {
    origin: "*",
  },
});

const timers: { [key in ServiceName]?: NodeJS.Timeout } = {};
const cache: { [key in ServiceName]?: ServiceData } = {};
const actionsInProgress = new Set<ServiceName>();
const poll = !process.argv.includes("no-poll");
const rootDir = path.join(__dirname, "..", "..");

const stopService = (s: ServiceName) => global.clearTimeout(timers[s]!);

const saveToCache = (s: ServiceName, data: ServiceData) => (cache[s] = data);
const sendCached = (s: ServiceName) => cache[s] && emit(cache[s]!);

const emit = (data: Omit<ServiceData, "service"> & { service: string }) => {
  io.emit(data.service, data);

  if (data.error) {
    const output = `${Date()}\n${data.service.toUpperCase()}: ${
      data.error instanceof Error
        ? data.error.message
        : JSON.stringify(data.error)
    }\n\n`;

    fs.appendFileSync(path.join(rootDir, "dashboard.log"), output);
  }
};

const formatError = (e: unknown) => {
  if (e === undefined) return e;
  if (e instanceof Error) return { message: e.message, name: e.name };
  return stringify(e) || "Unknown error";
};

const fetcher = (service: Service) => {
  const next = (waitOnAction = false) => {
    timers[service.name] = global.setTimeout(
      () => fetcher(service),
      waitOnAction ? 1000 : service.delay()
    );
  };

  return actionsInProgress.has(service.name)
    ? next(true)
    : service
        .get()
        .then((data) => {
          emit({ ...data, error: formatError(data.error) });
          saveToCache(data.service, data);
        })
        .catch((e) => {
          emit({
            service: service.name,
            error: formatError(e),
          });
        })
        .finally(() => poll && next());
};

const subscribe = (id: string, s: ServiceName) => {
  sendCached(s);

  if (subscribers.add(id, s)) {
    const service = services[s] as Service;

    if (service) fetcher(service);
    else {
      emit({
        service: s,
        error: formatError(
          Error(`Service ${s} has the wrong format or doesn't exist`)
        ),
      });
    }
  }
};

const unsubscribe = (id: string, s?: ServiceName) => {
  if (s && !subscribers.remove(id, s)) stopService(s);
  else if (!s) {
    Object.entries(subscribers.remove(id)).forEach(([k, n]) => {
      if (!n) stopService(k as ServiceName);
    });
  }
};

io.on("connection", (socket) => {
  socket.on("subscribe", (service) => subscribe(socket.id, service));
  socket.on("unsubscribe", (service) => unsubscribe(socket.id, service));

  socket.on("disconnect", () => {
    unsubscribe(socket.id);
  });

  // register listeners
  Object.values(services).forEach((service) => {
    if (service.name && "listener" in service) {
      socket.on(service.name, (payload) => {
        actionsInProgress.add(service.name);
        service
          .listener(payload)
          .catch((e) => {
            emit({
              service: service.name,
              error: formatError(e),
            });
          })
          .finally(() => actionsInProgress.delete(service.name));
      });
    }
  });

  emit({ service: "server", data: { version, launched } });
});

if (prod) app.use("/", express.static(path.join(rootDir, "dist")));

server.listen(port, () => {
  launched = ms2Sec(Date.now());
  console.log("Server listening on port", port);
});
