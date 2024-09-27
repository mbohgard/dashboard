import React from "react";
import { createRoot } from "react-dom/client";
import styled, { css, StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import sv from "dayjs/locale/sv";

import { BaseStyles } from "./styles";
import { configStore, connectedStore, settingsStore } from "./stores";
import { socket } from "./utils/socket";
import { reportError } from "./utils/report";
import { useConnected, useIsIdle } from "./hooks";

import { StatusDot } from "./components/Atoms";
import { About } from "./components/About";
import { Weather } from "./integrations/weather/ui";
import { Time } from "./integrations/time/ui";
import { Energy } from "./integrations/energy/ui";
import { Transports } from "./integrations/transports/ui";
import { Hue } from "./integrations/hue/ui";
import { Temp } from "./integrations/temp/ui";
import { VOC } from "./integrations/voc/ui";
import { Errors } from "./components/Errors";
import { Scrollable } from "./components/Scrollable";
import { RightTabGroup } from "./components/RightTabGroup";
import { HalloweenOverlay } from "./components/HalloweenOverlay";
import { ControlServiceData, InitServiceData } from "./types";
import { ScrollIndicator } from "./components/ScrollIndicator";
import { Chores } from "./integrations/chores/ui";

dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
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

const AppContainer = styled.div`
  height: 100%;
  width: 150%;
  display: flex;
`;

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
  width?: number;
};

const GridWrapper = styled(Area)<GridWrapperProps>`
  padding: ${(p) => p.padding ?? 0}px;
  display: grid;
  grid-template-columns: ${(p) => p.columns};
  grid-template-rows: ${(p) => p.rows ?? "none"};
  grid-gap: 15px;
  row-gap: 10px;
  height: 100%;
  width: ${(p) => p.width ?? 100}vw;
  position: relative;
`;

const ScrollableContainer = styled(Scrollable)`
  min-width: 0;
`;

const BottomContainer = styled(Area)`
  gap: 25px;
  margin-right: 10px;
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

  useIsIdle(() => {
    document.getElementById("app")?.scrollTo({ left: 0, behavior: "smooth" });
  });

  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <AppContainer>
        <BaseStyles />
        <ErrorBoundary>
          <Status />
          <About {...props} />
          <ScrollIndicator />
          <GridWrapper
            columns="repeat(32, 1fr)"
            rows="30% auto 38%"
            padding={25}
          >
            <Area colStart={1} colEnd={14}>
              <Weather type="big" />
            </Area>
            <Area colStart={14} colEnd={21}>
              <Energy />
            </Area>
            <Area colStart={21} colEnd={33} flex>
              <Time />
            </Area>
            <Area colStart={1} colEnd={22} flex>
              <ScrollableContainer>
                <Weather />
              </ScrollableContainer>
            </Area>
            <Area colStart={22} colEnd={33} rowStart={2} rowEnd={4}>
              <RightTabGroup />
            </Area>
            <BottomContainer colStart={1} colEnd={22} flex>
              <Transports />
              <VOC />
              <Temp />
              <Chores />
            </BottomContainer>
            <Errors />
            {settings.halloween && <HalloweenOverlay />}
          </GridWrapper>
          <GridWrapper
            columns="repeat(16, 1fr)"
            rows="50% auto 40%"
            padding={25}
            width={50}
          >
            <Area colStart={1} colEnd={17}>
              top
            </Area>
            <Area colStart={1} colEnd={17}>
              middle
            </Area>
            <Area colStart={1} colEnd={17}>
              <Hue />
            </Area>
          </GridWrapper>
        </ErrorBoundary>
      </AppContainer>
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
