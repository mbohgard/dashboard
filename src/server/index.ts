import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import ws from "socket.io";
import { v4 as uuid } from "uuid";

import { version } from "../../package.json";
import config from "../config";

import * as subscribers from "./subscribers";
import services, { ServiceName } from "../integrations";
import { ms2Sec } from "../utils/time";
import { stringify } from "../utils/helpers";
import type {
  ServiceResponse,
  InitServiceData,
  ControlServiceData,
  ServicesUnion,
} from "../integrations";

let launched: number;

const PROD = process.env.NODE_ENV === "production";
const PORT = 8081;

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new ws.Server(server, {
  cors: {
    origin: "*",
  },
});

const timers: { [key in ServiceName]?: NodeJS.Timeout } = {};
const cache: { [key in ServiceName]?: ServiceResponse } = {};
const actionsInProgress = new Set<ServiceName>();
const poll = !process.argv.includes("no-poll");
const rootDir = path.join(__dirname, "..", "..");

const stopService = (s: ServiceName) => global.clearTimeout(timers[s]!);

const saveToCache = (s: ServiceName, data: ServiceResponse) =>
  (cache[s] = data);
const sendCached = (s: ServiceName) => {
  const data = cache[s];
  data && emit(data);

  return Boolean(data);
};

const emit = (
  data:
    | { service: string; data?: any; error?: any }
    | InitServiceData
    | ControlServiceData
) => {
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
  if (e instanceof Error)
    return { message: e.message, name: e.name, id: uuid() };
  return stringify(e) || "Unknown error";
};

const fetcher = (service: ServicesUnion, forceWait = false) => {
  const next = (waitOnAction = false) => {
    timers[service.name] = global.setTimeout(
      () => fetcher(service),
      waitOnAction ? 1000 : service.delay()
    );
  };

  return actionsInProgress.has(service.name) || forceWait
    ? next(true)
    : service
        .get()
        .then((data) => {
          emit({
            ...data,
            error: formatError("error" in data ? data.error : undefined),
          });
          saveToCache(data.service as ServiceName, data as ServiceResponse);
        })
        .catch((e) => {
          console.log(e);
          emit({
            service: service.name,
            error: formatError(e),
          });
        })
        .finally(() => poll && next());
};

const subscribe = (id: string, s: ServiceName) => {
  const hasCache = sendCached(s);

  if (subscribers.add(id, s)) {
    const service = services[s] as ServicesUnion;

    if (service) fetcher(service, hasCache);
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

    if (service.name && "feed" in service && service.feed.endpoint) {
      app.post(service.feed.endpoint, (req, res) => {
        const result = service.feed.handler(req.body);
        if (result) emit(result);

        res.sendStatus(200);
      });
    }
  });

  const configBody: LightConfig = {};

  if (config.calendar)
    configBody.calendar = { label: config.calendar.label ?? "Calendar" };
  if (config.voc)
    configBody.voc = { label: config.voc.settings?.label ?? "Volvo" };
  if (config.food) configBody.food = { label: config.food?.label ?? "Food" };

  emit({ service: "server", data: { version, launched, config: configBody } });
});

app.get("/reloadAll", (_, res) => {
  emit({ service: "control", data: { action: "RELOAD" } });

  res.sendStatus(200);
});

if (PROD) app.use("/", express.static(path.join(rootDir, "dist")));

server.listen(PORT, () => {
  launched = ms2Sec(Date.now());
  console.log("Server listening on port", PORT);
});

process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  // some other closing procedures go here
  process.exit(0);
});
