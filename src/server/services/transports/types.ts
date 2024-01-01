export interface TransportItem {
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

export interface TimetableResponse {
  Buses: TransportItem[];
  DataAge: number;
  LatestUpdate: string;
  Trains: TransportItem[];
}

export type ApiResponse = {
  ExecutionTime: number;
  Message: any;
  ResponseData?: TimetableResponse;
  StatusCode: number;
  StopPointDeviations: any[];
};
