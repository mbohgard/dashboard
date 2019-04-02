import * as Bundler from "parcel-bundler";
import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as socket from "socket.io";

import * as weather from "./weather";
import * as time from "./time";
import * as transports from "./transports";

const prod = process.env.NODE_ENV === "production";
const port = 3000;

const app = express();

const server = http.createServer(app);
const io = socket(server);

export type ServiceResponse = Promise<ServiceData>;

let users: number = 0;
const timers: { [service: string]: NodeJS.Timer } = {};
const cache: { [service: string]: any } = {};

const fetcher = (
  ...args: { delay: () => number; get: () => ServiceResponse }[]
) =>
  args.forEach(s => {
    const get = () =>
      s
        .get()
        .then(res => {
          io.emit(res.service, res);

          cache[res.service] = res;
          timers[res.service] = setTimeout(get, s.delay());
        })
        .catch(() => {
          // no data to send
        });

    get();
  });

const services = (action: "start" | "stop") => {
  if (action === "start") {
    fetcher(time, weather, transports);
  } else {
    Object.keys(timers).forEach(t => {
      clearTimeout(timers[t]);
    });
  }
};

io.on("connection", s => {
  users++;

  console.log("user connected", users);

  if (users === 1) services("start");

  Object.keys(cache).forEach(s => (cache[s] ? io.emit(s, cache[s]) : null));

  s.on("disconnect", () => {
    users--;

    if (!users) services("stop");
  });
});

if (prod) {
  app.use("/", express.static(path.join(__dirname, "..", "..", "dist")));
} else {
  const bundler = new Bundler(__dirname + "/../index.html");

  // @ts-ignore
  app.use(bundler.middleware());
}

console.log("Server running on port " + port);
console.log("i am in", __dirname);

server.listen(port);
