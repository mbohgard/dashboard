import { useSyncExternalStore } from "react";
import { reportError } from "./report";

type Listener<T> = (state: T) => void;
type SetterCallback<T> = (state: T) => T;

const getNewState = <T>(newState: T | SetterCallback<T>, oldState?: T): T =>
  typeof newState === "function"
    ? (newState as SetterCallback<T>)(oldState as T)
    : newState;

export const createStore = <T>(
  initialState: T | SetterCallback<T>,
  storageKey?: string
) => {
  if (storageKey) {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        initialState = JSON.parse(saved) ?? initialState;
      } catch {
        reportError(storageKey, "Failed to get store data from localStorage");
      }
    }
  }

  let state = getNewState(initialState);

  const listeners = new Set<Listener<T>>();

  const store = {
    getState: () => state,
    setState: (newState: T | SetterCallback<T>) => {
      // create the new state
      state = getNewState(newState, state);

      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {
          reportError(storageKey, "Failed to save store data to localStorage");
        }
      }

      // notify all subscrtibers
      listeners.forEach((listener) => listener(state));

      return state;
    },
    subscribe: (listener: Listener<T>) => {
      // add subscriber to list of listeners
      listeners.add(listener);

      // clean up by removing the listerer reference
      return () => listeners.delete(listener);
    },
  };

  const useStore = <S = T>(selector: (state: T) => S = (s) => s as any) => {
    const getState = () => store.getState();

    const s = useSyncExternalStore<T>(store.subscribe, getState, getState);

    return [selector(s), store.setState] as const;
  };

  return {
    useStore,
    get: store.getState,
    set: store.setState,
    subscribe: store.subscribe,
  };
};
