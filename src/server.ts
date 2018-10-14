import { Request, Response } from "express";
import * as Bundler from "parcel-bundler";
import * as express from "express";
import * as request from "request";
import * as path from "path";

import { sl, time } from "../secrets";

const prod = process.env.NODE_ENV === "production";
const port = 8081;

const app = express();

app.get("/weather", (_: Request, res: Response) => {
  request(
    "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/17.88/lat/59.515/data.json"
  ).pipe(res);
});

app.get("/time", (_: Request, res: Response) => {
  request(
    `http://api.timezonedb.com/v2.1/get-time-zone?key=${time}&format=json&by=zone&zone=CEST`
  ).pipe(res);
});

app.get("/buses", (_: Request, res: Response) => {
  request(
    `http://api.sl.se/api2/realtimedeparturesV4.json?key=${sl}&timewindow=60&metro=false&train=false&ship=false&tram=false`
  ).pipe(res);
});

if (prod) {
  app.use("/", express.static(path.join(__dirname, "..", "dist")));
} else {
  const bundler = new Bundler(__dirname + "/index.html");

  // @ts-ignore
  app.use(bundler.middleware());
}

console.log("Server running on port " + port);

app.listen(port);
