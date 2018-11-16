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
  Buses?: TransportItem[];
  DataAge: number;
  LatestUpdate: string;
  Metros?: TransportItem[];
  Trains?: TransportItem[];
}

declare interface Timetable {
  ExecutionTime: number;
  Message: null;
  ResponseData: TimetableResponse;
  StatusCode: number;
  StopPointDeviations: any[];
}

declare interface ServiceData<T = any> {
  data?: T;
  error?: any;
  service: string;
}

declare type TimeServiceData = ServiceData<TimeZone>;
declare type WeatherServiceData = ServiceData<Forecast>;
declare type TransportsServiceData = ServiceData<Timetable[]>;
