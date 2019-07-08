declare interface ServiceData<T = any> {
  data?: T;
  error?: any;
  service: string;
}

declare type ServiceResponse<T = any> = Promise<ServiceData<T>>;

declare type Service = {
  name: string;
  get(): ServiceResponse;
  delay(): number;
};
