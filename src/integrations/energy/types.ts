export type Areas = "One" | "Two" | "Three" | "Four";

type Hour = {
  Id: number;
  CreatedDate: string;
} & {
  [Key in Areas as `AverageArea${Key}`]: number;
} & {
  [Key in Areas as `CurrentArea${Key}`]: number;
} & {
  [Key in Areas as `ForecastArea${Key}`]: number;
};

export type ApiResponse = Hour[];

interface EnergyMetric {
  value: number;
  time?: string;
}

export interface Data {
  average?: EnergyMetric;
  high?: EnergyMetric;
  low?: EnergyMetric;
  now?: EnergyMetric;
  tomorrow?: {
    average?: EnergyMetric;
    high?: EnergyMetric;
    low?: EnergyMetric;
  };
}
