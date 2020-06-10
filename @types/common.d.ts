declare interface ServiceData<T = any> {
  data?: T;
  error?: any;
  service: string;
}

declare type ServiceResponse<T = any> = Promise<ServiceData<T>>;

declare type Service<T = any, S = string> = {
  name: S;
  get(): ServiceResponse<T>;
  delay(): number;
};

declare module "*.svg" {
  const content: React.FC;
  export default content;
}
