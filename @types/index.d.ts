interface Parameter {
  level: number;
  levelType: string;
  name: string;
  unit: string;
  values: number[];
}

interface Geometry {
  coordinates: [number, number][];
  type: string;
}

interface TimeSerie {
  parameters: Parameter[];
  validTime: string;
}

interface Forecast {
  approvedTime: string;
  geometry: Geometry;
  referenceTime: string;
  timeSeries: TimeSerie[];
}

interface TimeZone {
  status: string;
  message: string;
  countryCode: string;
  countryName: string;
  zoneName: string;
  abbreviation: string;
  gmtOffset: number;
  dst: string;
  zoneStart: number;
  zoneEnd: number;
  nextAbbreviation: string;
  timestamp: number;
  formatted: string;
}

interface TransportItem {
  TransportMode: string;
  LineNumber: string;
  Destination: string;
  JourneyDirection: number;
  StopAreaName: string;
  StopAreaNumber: number;
  StopPointNumber: number;
  StopPointDesignation: null;
  TimeTabledDateTime: string;
  ExpectedDateTime: string;
  DisplayTime: string;
  JourneyNumber: number;
  Deviations: any;
}

interface TimetableResponse {
  LatestUpdate: string;
  DataAge: number;
  Metros: any[];
  Buses: TransportItem[];
  Trains: TransportItem[];
}

interface Timetable {
  StatusCode: number;
  Message: null;
  ExecutionTime: number;
  ResponseData: TimetableResponse;
  StopPointDeviations: any[];
}
