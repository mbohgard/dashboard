export interface Parameter {
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

export interface TimeSerie {
  parameters: Parameter[];
  validTime: string;
}

interface Sun {
  results?: {
    sunrise?: string;
    sunset?: string;
  };
}

export interface Forecast {
  approvedTime: string;
  geometry: Geometry;
  referenceTime: string;
  timeSeries?: TimeSerie[];
}

export type ApiResponse = {
  forecast: Forecast;
  sun: Sun;
};
