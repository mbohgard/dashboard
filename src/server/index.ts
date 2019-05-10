import * as Bundler from "parcel-bundler";
import * as express from "express";
import * as path from "path";
import * as http from "http";
import * as ws from "socket.io";

import * as weather from "./weather";
import * as time from "./time";
import * as transports from "./transports";
import * as hue from "./hue";
import * as voc from "./voc";

const prod = process.env.NODE_ENV === "production";
const port = 8081;

const app = express();

const server = http.createServer(app);
const io = ws(server);

export type ServiceResponse<T = any> = Promise<ServiceData<T>>;

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
    fetcher(time, weather, transports, hue, voc);
  } else {
    Object.keys(timers).forEach(t => {
      clearTimeout(timers[t]);
    });
  }
};

io.on("connection", socket => {
  users++;

  console.log("user connected", users);

  if (users === 1) services("start");

  Object.keys(cache).forEach(s => (cache[s] ? io.emit(s, cache[s]) : null));

  socket.on("disconnect", () => {
    users--;

    if (!users) services("stop");
  });

  socket.on("hue", hue.listener);
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
