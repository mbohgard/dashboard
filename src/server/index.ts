import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import sv from "dayjs/locale/sv.js";

import pkg from "../../package.json" with { type: "json" };
import config, { type AppConfig } from "../config/index.ts";

import services, { type ServiceName } from "../integrations/index.ts";
import { ms2Sec } from "../utils/time.ts";
import { stringify } from "../utils/helpers.ts";
import type {
  ServiceResponse,
  InitServiceData,
  ControlServiceData,
  ServicesUnion,
} from "../integrations/index.ts";

dayjs.locale(sv);

const { version } = pkg;

let launched: number;

const PROD = process.env.NODE_ENV === "production";
const PORT = 8081;
const POLL = !process.argv.includes("no-poll");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const timers: { [key in ServiceName]?: NodeJS.Timeout } = {};
const cache: { [key in ServiceName]?: ServiceResponse } = {};
const actionsInProgress = new Set<ServiceName>();
const rootDir = path.join(import.meta.dirname, "..", "..");

const emit = (data: ServiceResponse | InitServiceData | ControlServiceData) => {
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

  return e instanceof Error
    ? { message: e.message, name: e.name, id: uuid() }
    : stringify(e) || "Unknown error";
};

const publish = (data: ServiceResponse) => {
  cache[data.service] = data;
  emit({ ...data, error: formatError(data.error) });
};

const serviceError = (name: ServiceName, error: unknown) => {
  console.log(`Error in service ${name}:`, error);
  emit({ service: name, error: formatError(error) });
};

const fetcher = (service: ServicesUnion, forceWait = false) => {
  if ("enabled" in service && !service.enabled) return;

  const next = (waitOnAction = false) => {
    global.clearTimeout(timers[service.name]!);
    timers[service.name] = global.setTimeout(
      () => fetcher(service),
      waitOnAction ? 1000 : service.delay(),
    );
  };

  return actionsInProgress.has(service.name) || forceWait
    ? next(true)
    : service
        .get()
        .then((data) => {
          emit({
            ...(data as ServiceResponse),
            error: formatError("error" in data ? data.error : undefined),
          });
          // save to cache
          cache[data.service as ServiceName] = data as ServiceResponse;
        })
        .catch((e) => {
          console.log(`Error in service ${service.name}:`, e);
          emit({
            service: service.name,
            error: formatError(e),
          });
        })
        .finally(() => POLL && next());
};

io.on("connection", (socket) => {
  socket.on("subscribe", (s: ServiceName) => {
    const service = services[s];
    const data = cache[s];

    if (service) {
      // send cached data if available
      if (data) emit(data);
    } else {
      emit({
        service: s,
        error: formatError(
          Error(`Service ${s} has the wrong format or doesn't exist`),
        ),
      });
    }
  });

  // register listeners
  Object.values(services).forEach((service) => {
    if ("listener" in service) {
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

  const configBody: AppConfig = {};

  if (config.calendar)
    configBody.calendar = { label: config.calendar.label ?? "Calendar" };
  if (config.voc)
    configBody.voc = { label: config.voc.settings?.label ?? "Volvo" };
  if (config.food) configBody.food = { label: config.food?.label ?? "Food" };
  if (config.hue)
    configBody.temp = { label: config.hue?.settings?.tempLabel ?? "Temp" };

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

  // kick off all services
  Object.values(services).forEach((service) => {
    if ("enabled" in service && !service.enabled) return;
    if (POLL && "start" in service) {
      service.start(publish, (error) => serviceError(service.name, error));
    } else {
      fetcher(service);
    }
  });
});

let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const timer of Object.values(timers)) clearTimeout(timer);
  // Offline speakers must not prevent the watcher from restarting the server.
  const deadline = setTimeout(() => process.exit(0), 5000);
  await Promise.allSettled(
    Object.values(services).map((service) =>
      "stop" in service ? service.stop() : undefined,
    ),
  );
  clearTimeout(deadline);
  io.close();
  server.close();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
