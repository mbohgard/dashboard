export type HueGroupClass =
  | "Attic"
  | "Balcony"
  | "Barbecue"
  | "Bathroom"
  | "Bedroom"
  | "Carport"
  | "Closet"
  | "Computer"
  | "Dining"
  | "Downstairs"
  | "Driveway"
  | "Front door"
  | "Garage"
  | "Garden"
  | "Guest room"
  | "Gym"
  | "Hallway"
  | "Home"
  | "Kids bedroom"
  | "Kitchen"
  | "Laundry room"
  | "Living room"
  | "Lounge"
  | "Man cave"
  | "Music"
  | "Nursery"
  | "Office"
  | "Other"
  | "Pool"
  | "Porch"
  | "Reading"
  | "Recreation"
  | "Staircase"
  | "Storage"
  | "Studio"
  | "Terrace"
  | "Toilet"
  | "Top floor"
  | "TV"
  | "Upstairs";

type HueApiState = {
  bri: number;
  effect?: "none" | "colorloop";
} & (
  | {
      colormode: "xy";
      xy: [number, number];
    }
  | {
      colormode: "ct";
      ct: number;
    }
  | {
      colormode: "hs";
      hue: number;
      sat: number;
    }
  | {}
);

type HueApiCapabilities = {
  certified: boolean;
  control: {
    colorgamut?: [number, number][];
    colorgamuttype?: string;
    ct?: {
      min: number;
      max: number;
    };
    mindimlevel?: number;
    maxlumen?: number;
  };
  streaming: {
    renderer: boolean;
    proxy: boolean;
  };
};

export interface HueApiLight {
  name: string;
  state: {
    on: boolean;
    alert: "none" | "select" | "lselect";
    mode: string;
    reachable: boolean;
  } & HueApiState;
  modelid: string;
  capabilities: HueApiCapabilities;
}

interface HueApiLights {
  [id: string]: HueApiLight;
}

interface HueApiGroups {
  [id: string]: {
    name: string;
    lights: string[];
    sensors: any[];
    type: string;
    state: {
      all_on: boolean;
      any_on: boolean;
    };
    recycle: false;
    class: HueGroupClass;
    action: HueApiState;
  };
}

export type HSV = {
  h: number;
  s: number;
  v: number;
};

export type HueLights = {
  [id: string]: HSV;
};

interface HueGroup {
  bri: number;
  name: string;
  class: HueGroupClass;
  on: boolean;
  lights: HueLights | null;
}

export interface HueGroups {
  [id: string]: HueGroup;
}

export interface HueGroupEmit {
  id: string;
  on?: boolean;
  bri?: number;
}

interface HueApiActionResponseItem {
  error?: {
    description: string;
  };
  success?: {
    [s: string]: any;
  };
}

export type HueApiActionResponse = HueApiActionResponseItem[];

export interface ApiResponse {
  lights: HueApiLights;
  groups: HueApiGroups;
}
