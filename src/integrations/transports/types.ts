type DepartureState =
  | "NOTEXPECTED"
  | "NOTCALLED"
  | "EXPECTED"
  | "CANCELLED"
  | "INHIBITED"
  | "ATSTOP"
  | "BOARDING"
  | "BOARDINGCLOSED"
  | "DEPARTED"
  | "PASSED"
  | "MISSED"
  | "REPLACED"
  | "ASSUMEDDEPARTED";

type JourneyState =
  | "NOTEXPECTED"
  | "NOTRUN"
  | "EXPECTED"
  | "ASSIGNED"
  | "CANCELLED"
  | "ATORIGIN"
  | "FASTPROGRESS"
  | "NORMALPROGRESS"
  | "SLOWPROGRESS"
  | "NOPROGRESS"
  | "OFFROUTE"
  | "ABORTED"
  | "COMPLETED"
  | "ASSUMEDCOMPLETED";

interface DepartureJourney {
  id: number;
  state: JourneyState;
  prediction_state?: "NORMAL" | "LOSTCONTACT" | "UNRELIABLE";
  passenger_level?:
    | "EMPTY"
    | "SEATSAVAILABLE"
    | "STANDINGPASSENGERS"
    | "PASSENGERSLEFTBEHIND"
    | "UNKNOWN";
}

interface DepartureDeviation {
  importance: number;
  consequence: string;
  message: string;
}

interface Departure {
  direction: string;
  direction_code: number;
  via?: string;
  destination?: string;
  state: DepartureState;
  scheduled: string;
  expected?: string;
  display: string;
  journey: DepartureJourney;
  stop_area: {
    id: number;
    name: string;
    sname?: string;
    type?:
      | "BUSTERM"
      | "METROSTN"
      | "TRAMSTN"
      | "RAILWSTN"
      | "SHIPBER"
      | "FERRYBER"
      | "AIRPORT"
      | "TAXITERM"
      | "UNKNOWN";
  };
  stop_point: {
    id: number;
    name?: string;
    designation?: string;
  };
  line: {
    id: number;
    designation?: string;
    transport_mode?:
      | "BUS"
      | "TRAM"
      | "METRO"
      | "TRAIN"
      | "FERRY"
      | "SHIP"
      | "TAXI";
    group_of_lines?: string;
  };
  deviations: DepartureDeviation[];
}

interface StopDeviation {
  id: number;
  level: number;
  message: string;
  scope: {
    description?: string;
    lines?: string;
    stop_areas?: string;
    stop_points?: string;
  };
}

export interface DeparturesResponse {
  departures?: Departure[];
  stop_deviations: StopDeviation[];
}
