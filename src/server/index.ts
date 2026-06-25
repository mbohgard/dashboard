import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import ws from "socket.io";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import sv from "dayjs/locale/sv";

import { version } from "../../package.json";
import config, { AppConfig } from "../config";

import services, { ServiceName } from "../integrations";
import { ms2Sec } from "../utils/time";
import { stringify } from "../utils/helpers";
import type {
  ServiceResponse,
  InitServiceData,
  ControlServiceData,
  ServicesUnion,
} from "../integrations";

dayjs.locale(sv);

let launched: number;

const PROD = process.env.NODE_ENV === "production";
const PORT = 8081;
const POLL = !process.argv.includes("no-poll");

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
const rootDir = path.join(__dirname, "..", "..");

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

    if ("feed" in service && service.feed.endpoint) {
      app.post(service.feed.endpoint, (req, res) => {
        try {
          const result = service.feed.handler(req.body);
          if (result) emit(result);
        } catch (e) {
          emit({
            service: service.name,
            error: formatError(e),
          });
        }

        res.sendStatus(200);
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
  Object.values(services).forEach((service) => fetcher(service));
});

process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  // some other closing procedures go here
  process.exit(0);
});
