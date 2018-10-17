import { Request, Response } from "express";
import * as Bundler from "parcel-bundler";
import * as express from "express";
import * as request from "request";
import * as path from "path";

import * as secrets from "../secrets";
import * as config from "../config";

const prod = process.env.NODE_ENV === "production";
const port = 8081;

const app = express();

const getTransportUrl = (type: string, siteId: string) => {
  const q = (t: string) => `&${t}=${String(type === t)}`;

  return `http://api.sl.se/api2/realtimedeparturesV4.json?key=${
    secrets.transports
  }&siteId=${siteId}&timewindow=60${q("bus")}${q("train")}${q("metro")}${q(
    "ship"
  )}${q("tram")}`;
};

app.get("/weather", (_: Request, res: Response) => {
  request(
    `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${
      config.weather.lon
    }/lat/${config.weather.lat}/data.json`
  ).pipe(res);
});

app.get("/time", (_: Request, res: Response) => {
  request(
    `http://api.timezonedb.com/v2.1/get-time-zone?key=${
      secrets.time
    }&format=json&by=zone&zone=${config.time.timezone}`
  ).pipe(res);
});

if (config.transports) {
  Object.keys(config.transports).forEach(k => {
    app.get(`/${k}`, (_: Request, res: Response) => {
      request(
        getTransportUrl(
          k,
          config.transports[k as keyof typeof config.transports].siteId
        )
      ).pipe(res);
    });
  });
}

if (prod) {
  app.use("/", express.static(path.join(__dirname, "..", "dist")));
} else {
  const bundler = new Bundler(__dirname + "/index.html");

  // @ts-ignore
  app.use(bundler.middleware());
}

console.log("Server running on port " + port);

app.listen(port);
