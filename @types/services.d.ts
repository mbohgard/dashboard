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
  timeSeries?: TimeSerie[];
  sun?: Sun;
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

declare interface EnergyMetric {
  value: string;
  time: string;
}

declare interface Energy {
  now: EnergyMetric;
  high: EnergyMetric;
  low: EnergyMetric;
  average: EnergyMetric;
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
  StopPointDesignation: any;
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
  Message: any;
  ResponseData?: TimetableResponse;
  StatusCode: number;
  StopPointDeviations: any[];
}

declare interface Transport extends Timetable {
  siteId: string;
}

declare interface VOCResults {
  ERS: {
    status: string;
    timestamp: string;
    engineStartWarning: string;
    engineStartWarningTimestamp: string;
  };
  averageFuelConsumption: number;
  averageFuelConsumptionTimestamp: string;
  averageSpeed: number;
  averageSpeedTimestamp: string;
  brakeFluid: string;
  brakeFluidTimestamp: string;
  bulbFailures: any[];
  bulbFailuresTimestamp: string;
  carLocked: boolean;
  carLockedTimestamp: string;
  distanceToEmpty: number;
  distanceToEmptyTimestamp: string;
  doors: {
    tailgateOpen: boolean;
    rearRightDoorOpen: boolean;
    rearLeftDoorOpen: boolean;
    frontRightDoorOpen: boolean;
    frontLeftDoorOpen: boolean;
    hoodOpen: boolean;
    timestamp: string;
  };
  engineRunning: boolean;
  engineRunningTimestamp: string;
  fuelAmount: number;
  fuelAmountLevel: number;
  fuelAmountLevelTimestamp: string;
  fuelAmountTimestamp: string;
  heater: {
    seatSelection: {
      frontDriverSide: boolean;
      frontPassengerSide: boolean;
      rearDriverSide: boolean;
      rearPassengerSide: boolean;
      rearMid: boolean;
    };
    status: string;
    timestamp: string;
  };
  hvBattery: {
    hvBatteryChargeStatusDerived: string;
    hvBatteryChargeStatusDerivedTimestamp: string;
    hvBatteryChargeModeStatus: null;
    hvBatteryChargeModeStatusTimestamp: null;
    hvBatteryChargeStatus: string;
    hvBatteryChargeStatusTimestamp: string;
    hvBatteryLevel: number;
    hvBatteryLevelTimestamp: string;
    distanceToHVBatteryEmpty: null;
    distanceToHVBatteryEmptyTimestamp: string;
    hvBatteryChargeWarning: string;
    hvBatteryChargeWarningTimestamp: string;
    timeToHVBatteryFullyCharged: number;
    timeToHVBatteryFullyChargedTimestamp: string;
  };
  odometer: number;
  odometerTimestamp: string;
  privacyPolicyEnabled: boolean;
  privacyPolicyEnabledTimestamp: string;
  remoteClimatizationStatus: any;
  remoteClimatizationStatusTimestamp: any;
  serviceWarningStatus: string;
  serviceWarningStatusTimestamp: string;
  theftAlarm: any;
  timeFullyAccessibleUntil: string;
  timePartiallyAccessibleUntil: string;
  tripMeter1: number;
  tripMeter1Timestamp: string;
  tripMeter2: number;
  tripMeter2Timestamp: string;
  tyrePressure: {
    frontLeftTyrePressure: string;
    frontRightTyrePressure: string;
    rearLeftTyrePressure: string;
    rearRightTyrePressure: string;
    timestamp: string;
  };
  washerFluidLevel: string;
  washerFluidLevelTimestamp: string;
  windows: {
    frontLeftWindowOpen: boolean;
    frontRightWindowOpen: boolean;
    timestamp: string;
    rearLeftWindowOpen: boolean;
    rearRightWindowOpen: boolean;
  };
}

declare type VOCResponse =
  | VOCResults
  | {
      errorLabel: string;
      errorDescription: string;
    };

declare interface VOCData {
  locked: boolean;
  running: boolean;
  label: string;
  batteryLevel: number;
  charging: boolean;
}

declare interface CalendarEvent {
  allDay: boolean;
  color: import("../src/styles").Colors;
  end: number;
  id: string;
  name: string;
  now: number;
  ongoing: boolean;
  passed: boolean;
  start: number;
  summary: string;
}

declare type TimeServiceData = ServiceData<TimeZone>;
declare type EnergyServiceData = ServiceData<Energy>;
declare type WeatherServiceData = ServiceData<Forecast>;
declare type TransportsServiceData = ServiceData<
  Transport[],
  {
    sites: {
      label: string;
      siteId: string;
      types: string[];
    }[];
  }
>;
declare type HueServiceData = ServiceData<HueGroups>;
declare type VOCServiceData = ServiceData<VOCData>;
declare type CalendarServiceData = ServiceData<CalendarEvent[]>;
