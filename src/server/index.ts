import Bundler from "parcel-bundler";
import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import ws from "socket.io";

import { version } from "../../package.json";

import * as subscribers from "./subscribers";
import services, { ServiceName } from "./services";

const prod = process.env.NODE_ENV === "production";
const port = 8081;

const app = express();

const server = http.createServer(app);
const io = ws(server);

const timers: { [key in ServiceName]?: number } = {};
const cache: { [key in ServiceName]?: ServiceData } = {};
const poll = !process.argv.includes("no-poll");
const rootDir = path.join(__dirname, "..", "..");

const startPoll = (s: Service) => {
  const name = s.name as ServiceName;
  stopPoll(name);

  if (poll) {
    timers[name] = setTimeout(() => fetcher(s), s.delay());
  }
};
const stopPoll = (s: ServiceName) => clearTimeout(timers[s]);

const saveToCache = (s: string, data: ServiceData) =>
  (cache[s as ServiceName] = data);
const sendCached = (s: ServiceName) => cache[s] && emit(cache[s]!);

const emit = (data: ServiceData) => {
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

const formatError = (e: any) => {
  if (e === undefined) return e;

  if (e instanceof Error) return { message: e.message, name: e.name };
  else {
    try {
      return JSON.stringify(e);
    } catch (error) {
      if ("toString" in e) return e.toString();
      else return "Unknown error";
    }
  }
};

const fetcher = (service: Service) =>
  service
    .get()
    .then((data) => {
      emit({ ...data, error: formatError(data.error) });
      saveToCache(data.service, data);
      startPoll(service);
    })
    .catch((e) => {
      emit({
        service: service.name,
        error: formatError(e),
      });
    });

const subscribe = (id: string, s: ServiceName) => {
  sendCached(s);

  const init = subscribers.add(id, s);

  if (init) {
    const service = services[s];

    if (service) fetcher(service);
    else {
      emit({
        service: s,
        error: Error(`Service ${s} has the wrong format or doesn't exist`),
      });
    }
  }
};

const unsubscribe = (id: string, s?: ServiceName) => {
  const u = s ? subscribers.remove(id, s) : subscribers.remove(id);

  if (s && u instanceof Array && u.length === 0) stopPoll(s);
  else {
    subscribers
      .getServices()
      .forEach((s) => subscribers.get(s).length === 0 && stopPoll(s));
  }
};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("subscribe", (service) => subscribe(socket.id, service));
  socket.on("unsubscribe", (service) => unsubscribe(socket.id, service));

  socket.on("disconnect", () => {
    unsubscribe(socket.id);
  });

  // register listeners
  Object.keys(services).forEach((key) => {
    const service = services[key as keyof typeof services];

    if (service.name && "listener" in service) {
      socket.on(service.name, (payload) => {
        service.listener(payload).catch((e) => {
          emit({
            service: service.name,
            error: formatError(e),
          });
        });
      });
    }
  });

  emit({ service: "server", data: { version } });
});

if (prod) {
  app.use("/", express.static(path.join(rootDir, "dist")));
} else {
  const bundler = new Bundler(__dirname + "/../index.html");

  // @ts-ignore
  app.use(bundler.middleware());
}

console.log("Server running on port " + port);
console.log("i am in", __dirname);

server.listen(port);
