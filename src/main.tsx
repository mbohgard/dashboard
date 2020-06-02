import React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/sv";

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
import { Errors } from "./components/Errors";

dayjs.locale("sv");

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
`;

type HalfProps = {
  right?: boolean;
  top?: boolean;
};

const Half = styled.div<HalfProps>`
  width: 50%;
  display: flex;
  align-items: ${({ top }) => (top ? "flex-start" : "center")};
  justify-content: ${({ right }) => (right ? "flex-end" : "flex-start")};
`;

type WholeProps = {
  left?: boolean;
  right?: boolean;
  last?: boolean;
  stretched?: boolean;
};

const Whole = styled(Half)<WholeProps>`
  width: 100%;
  justify-content: ${({ left, right, stretched }) =>
    left
      ? "flex-start"
      : right
      ? "flex-start"
      : stretched
      ? "space-between"
      : "center"};
  align-items: ${({ last }) => (last ? "flex-end" : "normal")};
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
            <Half top>
              <Weather type="big" />
            </Half>
            <Half right top>
              <Time />
            </Half>
            <Whole>
              <Weather />
            </Whole>
            <Whole stretched>
              <Transports />
              <VOC />
              <Hue />
            </Whole>
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
