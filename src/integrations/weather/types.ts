interface Geometry {
  coordinates: [number, number];
  type: "Point";
}

export interface ForecastData {
  air_temperature?: number;
  wind_from_direction?: number;
  wind_speed?: number;
  wind_speed_of_gust?: number;

  relative_humidity?: number;
  air_pressure_at_mean_sea_level?: number;
  visibility_in_air?: number;

  thunderstorm_probability?: number;
  probability_of_frozen_precipitation?: number;

  cloud_area_fraction?: number;
  low_type_cloud_area_fraction?: number;
  medium_type_cloud_area_fraction?: number;
  high_type_cloud_area_fraction?: number;

  cloud_base_altitude?: number;
  cloud_top_altitude?: number;

  precipitation_amount_mean_deterministic?: number;
  precipitation_amount_mean?: number;
  precipitation_amount_min?: number;
  precipitation_amount_max?: number;
  precipitation_amount_median?: number;

  probability_of_precipitation?: number;
  precipitation_frozen_part?: number;

  predominant_precipitation_type_at_surface?: number;

  /**
   * SMHI weather symbol
   * https://opendata.smhi.se/apidocs/metfcst/parameters.html
   */
  symbol_code?: number;

  /**
   * Allow future parameters without breaking typing
   */
  [key: string]: number | undefined;
}

export interface TimeSerie {
  time: string;
  intervalParametersStartTime: string;
  data: ForecastData;
}

export interface Forecast {
  createdTime: string;
  referenceTime: string;
  geometry: Geometry;
  timeSeries: TimeSerie[];
}

export interface SunResults {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: number;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
}

export interface Sun {
  results: SunResults;
  status: string;
}

export type ApiResponse = {
  forecast: Forecast;
  sun: Sun;
};
