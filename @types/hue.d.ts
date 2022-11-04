declare type HueGroupClass =
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

declare type HueApiState = {
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

declare type HueApiCapabilities = {
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

declare interface HueApiLight {
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

declare interface HueApiLights {
  [id: string]: HueApiLight;
}

declare interface HueApiGroups {
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

declare interface HueApiResponse {
  lights: HueApiLights;
  groups: HueApiGroups;
}

declare type HSV = {
  h: number;
  s: number;
  v: number;
};

declare type HueLights = {
  [id: string]: HSV;
};

declare interface HueGroup {
  bri: number;
  name: string;
  class: HueGroupClass;
  on: boolean;
  lights: HueLights | null;
}

declare interface HueGroups {
  [id: string]: HueGroup;
}

declare interface HueGroupEmit {
  id: string;
  on?: boolean;
  bri?: number;
}

declare interface HueApiActionResponseItem {
  error?: {
    description: string;
  };
  success?: {
    [s: string]: any;
  };
}

declare type HueApiActionResponse = HueApiActionResponseItem[];
