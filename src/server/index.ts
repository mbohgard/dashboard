import Bundler from "parcel-bundler";
import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import ws from "socket.io";

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

const fetcher = (service: Service) =>
  service
    .get()
    .then((data: ServiceData) => {
      emit(data);

      cache[data.service as ServiceName] = data;
      if (poll)
        timers[data.service as ServiceName] = setTimeout(
          () => fetcher(service),
          service.delay()
        );
    })
    .catch(error => {
      emit({
        service: service.name,
        error
      });
    });

const subscribe = (id: string, s: ServiceName) => {
  if (cache[s]) emit(cache[s]!);

  const u = subscribers.add(id, s);

  if (u.length === 1) {
    const service = services[s];

    if (service) fetcher(service);
    else {
      emit({
        service: s,
        error: Error(`Service ${s} has the wrong format or doesn't exist`)
      });
    }
  }
};

const unsubscribe = (id: string, s?: ServiceName) => {
  const u = s ? subscribers.remove(id, s) : subscribers.remove(id);

  if (s && u instanceof Array && u.length === 0) clearTimeout(timers[s]);
  else if (!s) {
    subscribers
      .getSubsriptions(id)
      .forEach(
        service =>
          subscribers.get(service).length === 1 && clearTimeout(timers[service])
      );
  }
};

io.on("connection", socket => {
  console.log("user connected", subscribers.get());

  socket.on("subscribe", service => subscribe(socket.id, service));
  socket.on("unsubscribe", service => unsubscribe(socket.id, service));

  socket.on("disconnect", () => {
    unsubscribe(socket.id);
  });

  // register listeners
  Object.keys(services).forEach(key => {
    const service = services[key as keyof typeof services];

    if (service.name && "listener" in service) {
      socket.on(service.name, service.listener);
    }
  });
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
