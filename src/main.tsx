import React from "react";
import { createRoot } from "react-dom/client";
import styled, { css, StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";
import isToday from "dayjs/plugin/isToday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import sv from "dayjs/locale/sv";

import { BaseStyles } from "./styles";
import { configStore, connectedStore, settingsStore } from "./stores";
import { socket } from "./utils/socket";
import { reportError } from "./utils/report";
import { useConnected } from "./hooks";

import { StatusDot } from "./components/Atoms";
import { About } from "./components/About";
import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Energy } from "./components/Energy";
import { Transports } from "./components/Transports";
import { Hue } from "./components/Hue";
import { Temp } from "./components/Temp";
import { VOC } from "./components/VOC";
import { Errors } from "./components/Errors";
import { Scrollable } from "./components/Scrollable";
import { RightTabGroup } from "./components/RightTabGroup";
import { HalloweenOverlay } from "./components/HalloweenOverlay";
import { ControlServiceData, InitServiceData } from "./types";

dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.extend(isToday);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);

dayjs.locale(sv);

dayjs.updateLocale("sv", {
  calendar: {
    lastDay: "[igår] HH:mm",
    sameDay: "[idag] HH:mm",
    nextDay: "[imorrn] HH:mm",
    lastWeek: "[i] ddd[s] HH:mm",
    nextWeek: "ddd HH:mm",
    sameElse: "D/M HH:mm",
  },
});

type AreaProps = {
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  align?: "start" | "end" | "center" | "stretch";
  justify?: "start" | "end" | "center" | "stretch";
  flex?: boolean;
  column?: boolean;
};

export const Area = styled.div<AreaProps>(
  (p) => css`
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    grid-gap: 20px;
    grid-column-start: ${p.colStart ?? "auto"};
    grid-column-end: ${p.colEnd ?? "auto"};
    grid-row-start: ${p.rowStart ?? "auto"};
    grid-row-end: ${p.rowEnd ?? "auto"};
    align-self: ${p.align ?? "auto"};
    justify-self: ${p.justify ?? "auto"};
    display: ${p.flex ? "flex" : "block"};
    flex-direction: ${p.column ? "column" : "row"};
  `
);

type GridWrapperProps = {
  padding?: number;
  columns: string;
  rows?: string;
};

const GridWrapper = styled(Area)<GridWrapperProps>`
  padding: ${(p) => p.padding ?? 0}px;
  display: grid;
  grid-template-columns: ${(p) => p.columns};
  grid-template-rows: ${(p) => p.rows ?? "none"};
  grid-gap: 15px;
  row-gap: 10px;
  height: 100%;
  position: relative;
`;

const ScrollableContainer = styled(Scrollable)`
  min-width: 0;
`;

const BottomContainer = styled(Area)`
  gap: 25px;
`;

const Fill = styled.div`
  flex-grow: 1;
`;

export type ReportError = (service: string, err: any) => void;

const Status = () => {
  const connected = useConnected();

  return <StatusDot ok={connected} />;
};

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: null | any }
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(err: any) {
    reportError("catch in Main", err);
  }

  render() {
    const err = this.state.error;

    const msg =
      err instanceof Error ? err.message : err ? "Something went wrong" : null;
    return msg ?? this.props.children;
  }
}

const App: React.FC = (props) => {
  const [settings] = settingsStore.useStore();

  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <GridWrapper columns="repeat(32, 1fr)" rows="30% auto 38%" padding={25}>
        <ErrorBoundary>
          <BaseStyles />
          <Status />
          <About {...props} />
          <Area colStart={1} colEnd={14}>
            <Weather type="big" />
          </Area>
          <Area colStart={14} colEnd={21}>
            <Energy />
          </Area>
          <Area colStart={21} colEnd={33} flex>
            <Time />
          </Area>
          <Area colStart={1} colEnd={23} flex>
            <ScrollableContainer>
              <Weather />
            </ScrollableContainer>
            <Temp />
          </Area>
          <Area colStart={23} colEnd={33} rowStart={2} rowEnd={4}>
            <RightTabGroup />
          </Area>
          <BottomContainer colStart={1} colEnd={23} flex>
            <Transports />
            <VOC />
            <Fill>
              <Hue />
            </Fill>
          </BottomContainer>
          <Errors />
          {settings.halloween && <HalloweenOverlay />}
        </ErrorBoundary>
      </GridWrapper>
    </StyleSheetManager>
  );
};

if (typeof window !== "undefined") window.oncontextmenu = () => false;

let version: string | undefined;

const container = document.getElementById("app");
const root = createRoot(container!);

socket.on("server", ({ data, error }: InitServiceData) => {
  if (!data || error) {
    container!.innerText = "FATAL: Error loading initial server response...";
    return;
  }

  if (version && version !== data.version) location.reload();
  else {
    version = data.version;

    configStore.set(data.config);

    root.render(<App />);
  }
});

socket.on("control", ({ data }: ControlServiceData) => {
  if (!data) return;

  switch (data.action) {
    case "RELOAD":
      location.reload();
  }
});

socket.on("connect", () => connectedStore.set(true));
socket.on("disconnect", () => connectedStore.set(false));
