import { createStore } from "../utils/store";
import { ServiceError } from "../utils/report";
import type { AppConfig } from "../config";

export const errorStore = createStore<{
  errors: ServiceError[];
  notify: boolean;
}>({ errors: [], notify: false });

export const connectedStore = createStore(false);

export const configStore = createStore<AppConfig>({});

export const isPlayingStore = createStore(false);

export const settingsStore = createStore(
  {
    halloween: false,
    xmas: false,
  },
  "DashboardSettings"
);

export const useConfig = () => {
  const [config] = configStore.useStore();
  return config;
};

export const useConnected = () => {
  const [connected] = connectedStore.useStore();
  return connected;
};

export const useIsPlaying = () => {
  const [isPlaying] = isPlayingStore.useStore();
  return isPlaying;
};
