import { createStore } from "../utils/store";
import { ServiceError } from "../utils/report";

export const [useErrorsStore, setErrors] = createStore<{
  errors: ServiceError[];
  notify: boolean;
}>({ errors: [], notify: false });
