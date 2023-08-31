import { createStore } from "../utils/store";
import { ServiceError } from "../utils/report";

export const errorStore = createStore<{
  errors: ServiceError[];
  notify: boolean;
}>({ errors: [], notify: false });

export const connectedStore = createStore(false);

export const configStore = createStore<LightConfig>({} as LightConfig);
