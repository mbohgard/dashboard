import { useLayoutEffect } from "react";

import { useForceUpdate } from "../hooks";

type ShouldUpdate<T> = (oldState: T, newState: T) => boolean;

type Listeners<T> = {
  forceUpdate: () => void;
  shouldUpdate?: ShouldUpdate<T>;
};

type Updater<T> = (state: T) => T;

export const createStore = <T>(defaultValue: T) => {
  let state = defaultValue;
  let listeners: Listeners<T>[] = [];

  const updateState = (stateOrFunc: T | Updater<T>) => {
    const oldState = state;
    state =
      typeof stateOrFunc === "function"
        ? (stateOrFunc as Updater<T>)(state)
        : stateOrFunc;

    listeners.forEach(({ forceUpdate, shouldUpdate = () => true }) => {
      if (shouldUpdate(oldState, state)) forceUpdate();
    });
  };

  const useState = (shouldUpdate?: ShouldUpdate<T>) => {
    const forceUpdate = useForceUpdate();

    useLayoutEffect(() => {
      const listener: Listeners<T> = {
        forceUpdate,
        shouldUpdate,
      };

      listeners = [...listeners, listener];

      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    }, []);

    return [state, updateState] as const;
  };

  return [useState, updateState] as const;
};
