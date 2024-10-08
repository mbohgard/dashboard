// save this file as config.js and your details

module.exports = {
  axiosConfig: undefined, // optional base config for Axios
  transports: {
    label: "",
    settings: {
      direction: 0,
      siteId: "",
      type: "",
    },
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
      tempOffset: 0, // increase/decrease reading of temp sensors
      tempLabel: "", // label for temp sensors
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
  chores: {
    label: "",
    url: ".ics",
  },
  food: {
    station: 0,
    label: "",
  },
  sonos: {
    api: "", // url to local node-sonos-http-api,
    feed: "",
  },
  icloud: {
    label: "",
    albumToken: "",
  },
};
