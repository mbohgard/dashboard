// save this file as config.js and your details

module.exports = {
  axiosConfig: undefined, // optional base config for Axios
  transports: {
    // key for sl.se realtimedeparturesV4 service
    key: "",
    settings: [
      {
        siteId: "",
        types: ["bus", "train"],
      },
    ],
  },
  energy: {
    zone: "SE3",
  },
  weather: {
    settings: {
      lon: "",
      lat: "",
    },
  },
  time: {
    // key for timezone.db
    key: "",
    settings: {
      timezone: "",
    },
  },
  hue: {
    // philips hue username
    key: "",
    settings: {
      // ip for hue hub
      ip: "",
    },
  },
  // volvo on call
  voc: {
    username: "",
    password: "",
    vin: "",
    settings: {
      region: "",
      label: "",
    },
  },
  // ical (ics) links
  calendar: {
    label: "",
    settings: [
      {
        name: "",
        url: ".ics",
        color: "",
      },
    ],
  },
  food: {
    station: 0,
    label: "",
  },
  sonos: {
    api: "", // url to local node-sonos-http-api
  },
};
