import React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";
import sv from "dayjs/locale/sv";

import { BaseStyles } from "./styles";
import { useSocket } from "./hooks";
import { socket } from "./utils/socket";
import { reportError } from "./utils/report";

import { Status } from "./components/Atoms";
import { About } from "./components/About";
import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Transports } from "./components/Transports";
import { Hue } from "./components/Hue";
import { VOC } from "./components/VOC";
import { Calendar } from "./components/Calendar";
import { Errors } from "./components/Errors";

dayjs.extend(calendar);
dayjs.extend(updateLocale);

dayjs.locale(sv);

dayjs.updateLocale("sv", {
  calendar: {
    lastDay: "[igår] HH:mm",
    sameDay: "[idag] HH:mm",
    nextDay: "[imorgon] HH:mm",
    lastWeek: "[i] dddd[s] HH:mm",
    nextWeek: "dddd HH:mm",
    sameElse: "D/M HH:mm",
  },
});

const Wrapper = styled.div`
  padding: 25px;
  max-height: 100%;
  height: 100%;
  position: relative;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  justify-content: space-between;
`;

type HorizontalProps = {
  withMargin?: boolean;
};

const Horizontal = styled.div<HorizontalProps>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${({ withMargin }) => (withMargin ? "10px 0" : 0)};
`;

export type ReportError = (service: string, err: any) => void;

class ErrorBoundary extends React.Component {
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
    <Wrapper>
      <ErrorBoundary>
        <ConnectionContext.Provider value={connected}>
          <BaseStyles />
          <Status ok={connected} />
          <About {...props} />
          <Container>
            <Weather type="big" />
            <Time />
            <Horizontal withMargin>
              <Weather />
              <Calendar />
            </Horizontal>
            <Horizontal>
              <Transports />
              <VOC />
              <Hue />
            </Horizontal>
          </Container>
          <Errors />
        </ConnectionContext.Provider>
      </ErrorBoundary>
    </Wrapper>
  );
};

if (window) window.oncontextmenu = () => false;

let version: string | undefined;

socket.on("server", ({ data }: ServiceData) => {
  if (version !== undefined && version !== data.version) location.reload();
  else {
    version = data.version;

    render(<App {...data} />, document.getElementById("app"));
  }
});
