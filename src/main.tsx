import React from "react";
import { createRoot } from "react-dom/client";
import styled, { css, StyleSheetManager } from "styled-components";
import isPropValid from '@emotion/is-prop-valid';
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";
import isToday from "dayjs/plugin/isToday";
import sv from "dayjs/locale/sv";

import { BaseStyles } from "./styles";
import { useSocket } from "./hooks";
import { socket } from "./utils/socket";
import { reportError } from "./utils/report";

import { Status } from "./components/Atoms";
import { About } from "./components/About";
import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Energy } from "./components/Energy";
import { Transports } from "./components/Transports";
import { Hue } from "./components/Hue";
import { Temp } from "./components/Temp";
import { VOC } from "./components/VOC";
import { Calendar } from "./components/Calendar";
import { Errors } from "./components/Errors";
import { Scrollable } from "./components/Scrollable";

dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.extend(isToday);

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
  grid-gap: 20px;
  row-gap: 10px;
  height: 100%;
  position: relative;
`;

const BottomContainer = styled(Area)`
  gap: 25px;
`;

const Fill = styled.div`
  flex-grow: 1;
`;

export type ReportError = (service: string, err: any) => void;

class ErrorBoundary extends React.Component<React.PropsWithChildren> {
  componentDidCatch(err: any) {
    reportError("catch in Main", err);
  }

  render() {
    return this.props.children;
  }
}

export const ConnectionContext = React.createContext<boolean>(false);

const App: React.FC = (props) => {
  const connected = useSocket();

  return (
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <GridWrapper columns="repeat(32, 1fr)" rows="30% auto 38%" padding={25}>
      <ErrorBoundary>
        <ConnectionContext.Provider value={connected}>
          <BaseStyles />
          <Status ok={connected} />
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
          <Area colStart={1} colEnd={19}>
            <Scrollable>
              <Weather />
            </Scrollable>
          </Area>
          <Area colStart={19} colEnd={23} flex column align="center">
            <Temp />
          </Area>
          <Area colStart={23} colEnd={33} rowStart={2} rowEnd={4}>
            <Calendar />
          </Area>
          <BottomContainer colStart={1} colEnd={23} flex>
            <Transports />
            <VOC />
            <Fill>
              <Hue />
            </Fill>
          </BottomContainer>
          <Errors />
        </ConnectionContext.Provider>
      </ErrorBoundary>
    </GridWrapper>
    </StyleSheetManager>
    
  );
};

if (typeof window !== "undefined") window.oncontextmenu = () => false;

let version: string | undefined;

const container = document.getElementById("app");
const root = createRoot(container!);

socket.on("server", ({ data }: ServiceData) => {
  if (version !== undefined && version !== data.version) location.reload();
  else {
    version = data.version;

    root.render(<App {...data} />);
  }
});
