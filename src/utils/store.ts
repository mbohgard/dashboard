import { useSyncExternalStore } from "react";

type Listener<T> = (state: T) => void;
type SetterCallback<T> = (state: T) => T;
type Setter<T> = (state: T | SetterCallback<T>) => T;
type Selector<T, S> = (state: T) => S;
interface UseStore<T> {
  (): readonly [T, Setter<T>];
  <S>(selector: Selector<T, S>): readonly [S, Setter<T>];
}

const getNewState = <T>(newState: T | SetterCallback<T>, oldState?: T): T =>
  typeof newState === "function"
    ? (newState as SetterCallback<T>)(oldState as T)
    : newState;

export const createStore = <T>(initialState: T | SetterCallback<T>) => {
  let state = getNewState(initialState);

  const listeners = new Set<Listener<T>>();

  const store = {
    getState: () => state,
    setState: (newState: T | SetterCallback<T>) => {
      // create the new state
      state = getNewState(newState, state);

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

  const useStore: UseStore<T> = (selector?: Selector<T, T>) => {
    const getState = () => selector?.(store.getState()) ?? store.getState();

    return [
      useSyncExternalStore<T>(store.subscribe, getState, getState),
      store.setState,
    ] as const;
  };

  return {
    useStore,
    get: store.getState,
    set: store.setState,
  };
};
