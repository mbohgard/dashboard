declare type GroupClass =
  | "Living room"
  | "Kitchen"
  | "Dining"
  | "Bedroom"
  | "Kids bedroom"
  | "Bathroom"
  | "Nursery"
  | "Recreation"
  | "Office"
  | "Gym"
  | "Hallway"
  | "Toilet"
  | "Front door"
  | "Garage"
  | "Terrace"
  | "Garden"
  | "Driveway"
  | "Carport"
  | "Other"
  | "Home"
  | "Downstairs"
  | "Upstairs"
  | "Top floor"
  | "Attic"
  | "Guest room"
  | "Staircase"
  | "Lounge"
  | "Man cave"
  | "Computer"
  | "Studio"
  | "Music"
  | "TV"
  | "Reading"
  | "Closet"
  | "Storage"
  | "Laundry room"
  | "Balcony"
  | "Porch"
  | "Barbecue"
  | "Pool";

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
    class: GroupClass;
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
  class: GroupClass;
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
