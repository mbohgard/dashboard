interface EnergyMetric {
  value: string;
  time: string;
}

export interface ApiResponse {
  now: EnergyMetric;
  high: EnergyMetric;
  low: EnergyMetric;
  average: EnergyMetric;
}
