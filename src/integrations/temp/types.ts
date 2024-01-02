interface HueThermometer {
  name: string;
  value: number;
}

export interface HueThermometers {
  [id: string]: HueThermometer;
}

export interface ApiResponse {
  [id: string]: {
    state: {
      [key: string]: boolean | number | string;
    };
    name: string;
    type: string;
    modelid: string;
    productname?: string;
    uniqueid: string;
  };
}
