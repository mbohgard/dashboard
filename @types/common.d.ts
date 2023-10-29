type ServiceName = import("../src/server/services").ServiceName;
type Config = import("../config");

declare interface ServiceData<T = any, Meta = any> {
  data?: T;
  error?: any;
  service: ServiceName;
  meta?: Meta;
}

declare type ServiceResponse<T = any> = Promise<ServiceData<T>>;

declare type Service<T = any, S = ServiceName> = {
  name: S;
  get(): ServiceResponse<T>;
  delay(): number;
};

declare module "*.svg" {
  const content: React.FC;
  export default content;
}

declare interface LightConfig {
  calendar?: {
    label: string;
  };
  voc?: {
    label: string;
  };
  food?: {
    label: string;
  };
}

declare module "*.png" {
  const content: string;
  export default content;
}
