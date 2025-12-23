export type ApiResponse = Array<{
  SEK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
}>;

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
