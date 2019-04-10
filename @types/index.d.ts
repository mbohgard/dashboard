declare interface Parameter {
  level: number;
  levelType: string;
  name: string;
  unit: string;
  values: number[];
}

declare interface Geometry {
  coordinates: [number, number][];
  type: string;
}

declare interface TimeSerie {
  parameters: Parameter[];
  validTime: string;
}

declare interface Forecast {
  approvedTime: string;
  geometry: Geometry;
  referenceTime: string;
  timeSeries: TimeSerie[];
  sun: Sun;
}

declare interface Sun {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

declare interface TimeZone {
  abbreviation: string;
  countryCode: string;
  countryName: string;
  dst: string;
  formatted: string;
  gmtOffset: number;
  message: string;
  nextAbbreviation: string;
  status: string;
  timestamp: number;
  zoneEnd: number;
  zoneName: string;
  zoneStart: number;
}

declare interface TransportItem {
  Destination: string;
  Deviations: any;
  DisplayTime: string;
  ExpectedDateTime: string;
  JourneyDirection: number;
  JourneyNumber: number;
  LineNumber: string;
  StopAreaName: string;
  StopAreaNumber: number;
  StopPointDesignation: null;
  StopPointNumber: number;
  TimeTabledDateTime: string;
  TransportMode: string;
}

declare interface TimetableResponse {
  Buses: TransportItem[];
  DataAge: number;
  LatestUpdate: string;
  Trains: TransportItem[];
}

declare interface Timetable {
  ExecutionTime: number;
  Message: null;
  ResponseData?: TimetableResponse;
  StatusCode: number;
  StopPointDeviations: any[];
}

declare interface ServiceData<T = any> {
  data?: T;
  error?: any;
  service: string;
}

declare type GroupClass =
  | "Living room"
  | "Kitchen"
  | "Dining"
  | "Bedroom"
  | "Kids bedroom"
  | "Bathroom"
  | "Nursery"
  | "Recreation"
  | "Office"
  | "Gym"
  | "Hallway"
  | "Toilet"
  | "Front door"
  | "Garage"
  | "Terrace"
  | "Garden"
  | "Driveway"
  | "Carport"
  | "Other"
  | "Home"
  | "Downstairs"
  | "Upstairs"
  | "Top floor"
  | "Attic"
  | "Guest room"
  | "Staircase"
  | "Lounge"
  | "Man cave"
  | "Computer"
  | "Studio"
  | "Music"
  | "TV"
  | "Reading"
  | "Closet"
  | "Storage"
  | "Laundry room"
  | "Balcony"
  | "Porch"
  | "Barbecue"
  | "Pool";

declare interface HueGroupsResponse {
  [id: string]: {
    name: string;
    lights: string[];
    sensors: any[];
    type: string;
    state: {
      all_on: boolean;
      any_on: boolean;
    };
    recycle: false;
    class: GroupClass;
    action: {
      on: boolean;
      bri: number;
      hue: number;
      sat: number;
      effect: string;
      xy: number[];
      ct: number;
      alert: string;
      colormode: string;
    };
  };
}

declare interface HueGroups {
  [id: string]: {
    name: string;
    class: GroupClass;
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
  };
}

declare interface HueEmitPayload {
  [s: string]: any;
}

declare interface HueActionReponseItem {
  error?: {
    description: string;
  };
  success?: {
    [s: string]: any;
  };
}

declare type HueActionReponse = HueActionReponseItem[];

declare type TimeServiceData = ServiceData<TimeZone>;
declare type WeatherServiceData = ServiceData<Forecast>;
declare type TransportsServiceData = ServiceData<Timetable[]>;
declare type HueServiceData = ServiceData<HueGroups>;
