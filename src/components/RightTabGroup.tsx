import React, { useEffect } from "react";
import styled, { css } from "styled-components";

import { useConfig, useIsPlaying } from "../hooks";

import { Tabs } from "./Tabs";
import { Calendar } from "./Calendar";
import { Food } from "./Food";
import { Sonos } from "./Sonos";
import { colors } from "../styles";

export const Container = styled.div<{ isPlaying: boolean }>`
  height: 100%;

  ${(p) =>
    p.isPlaying &&
    css`
      #tab-sonos {
        color: ${colors.orange};
      }
    `}
`;

export const RightTabGroup: React.FC = () => {
  const config = useConfig();
  const isPlaying = useIsPlaying();

  useEffect(() => {
    if (isPlaying) document.getElementById("tab-sonos")?.click();
  }, [isPlaying]);

  const labels = {
    calendar: config.calendar?.label ?? "Calendar",
    food: config.food?.label ?? "Food",
    sonos: "Sonos",
  };

  return (
    <Container isPlaying={isPlaying}>
      <Tabs
        items={[
          [labels.calendar, <Calendar />, "tab-calendar"],
          [labels.food, <Food />, "tab-food"],
          // [labels.sonos, <Sonos />, "tab-sonos"],
        ]}
        defaultSelected={labels.calendar}
        resetDelay={15000}
      />
    </Container>
  );
};
