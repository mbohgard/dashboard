// save this file as config.js and your details

module.exports = {
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
    },
  },
  // ical (ics) links
  calendar: {
    settings: [
      {
        name: "",
        url: ".ics",
        color: "",
      },
    ],
  },
};
