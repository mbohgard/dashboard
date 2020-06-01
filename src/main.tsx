import React, { useCallback, useState, useEffect } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/sv";

import { BaseStyles, colors } from "./styles";
import { useSocket } from "./hooks";
import { socket } from "./utils/socket";
import { parse } from "./utils/helpers";

import { Status } from "./components/Atoms";
import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Transports } from "./components/Transports";
import { Hue } from "./components/Hue";
import { VOC } from "./components/VOC";
import { Icon } from "./components/Icon";

dayjs.locale("sv");

let version: string | undefined;

socket.on("server", ({ data }: ServiceData) => {
  if (version !== undefined && version !== data.version) location.reload();
  else version = data.version;
});

const Wrapper = styled.div`
  padding: 30px;
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

const ErrorsContainer = styled.div`
  position: fixed;
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: solid 10px ${colors.red};
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
`;

const ErrorsContent = styled.div`
  max-height: calc(100% - 40px);
  overflow: auto;
`;

const ErrorBox = styled.div`
  background: ${colors.red};
  padding: 20px;
  margin: auto;
  margin-bottom: 20px;
  width: max-content;
`;

const ErrorIndicator = styled.a<{ newError?: boolean }>`
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 0 0 10px 15px;
  opacity: ${({ newError }) => (newError ? 1 : 0)};

  & > svg {
    width: 50px;
    height: 50px;

    & path {
      fill: ${colors.red};
    }
  }
`;

export type ReportError = (service: string, err: any) => void;

class ErrorBoundary extends React.Component<{ report(err: any): void }> {
  componentDidCatch(err: any) {
    this.props.report(err);
  }

  render() {
    return this.props.children;
  }
}

type ServiceError = {
  id: number;
  code: number;
  message: string;
  name: string;
  service: string;
  time: string;
};

let errI = 0;

export let reportError: ReportError | undefined;
export const ConnectionContext = React.createContext<boolean>(false);

const App: React.FC = () => {
  const connected = useSocket();
  const [errors, setSerrors] = useState<ServiceError[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [newError, setNewError] = useState(false);

  const report: ReportError = useCallback((service, e) => {
    const err = parse(e);
    const isObj = typeof err === "object";
    const code = isObj ? err.statusCode || err.status : 0;
    const message = isObj
      ? err.message || err.msg || err.text || JSON.stringify(err)
      : String(err);
    const name = (isObj && err.name) || err.code || "Error";
    const error: ServiceError = {
      id: ++errI,
      code,
      service,
      message,
      name,
      time: dayjs().format("DD/MM HH:mm:ss"),
    };

    setSerrors((s) => [error, ...s.slice(0, 9)]);
    setNewError(true);
  }, []);

  useEffect(() => {
    reportError = report;
  }, []);

  const toggleError = (showErrors: boolean) => {
    setShowErrors(showErrors);
    setNewError(false);
  };

  return (
    <Wrapper>
      <ErrorBoundary report={(e) => report("catch in Main", e)}>
        <ConnectionContext.Provider value={connected}>
          <BaseStyles />
          <Status ok={connected} />
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
            <Whole stretched last>
              <Transports />
              <VOC />
              <Hue />
            </Whole>
          </Container>
          <ErrorIndicator newError={newError} onClick={() => toggleError(true)}>
            <Icon Warning />
          </ErrorIndicator>
          {showErrors && (
            <ErrorsContainer onClick={() => toggleError(false)}>
              <ErrorsContent>
                {errors.map((err) => (
                  <ErrorBox key={err.id} onClick={(e) => e.stopPropagation()}>
                    {err.code ? `(${err.code}) ` : ""}
                    {err.name}: {err.message} [by {err.service} at {err.time}]
                  </ErrorBox>
                ))}
              </ErrorsContent>
            </ErrorsContainer>
          )}
        </ConnectionContext.Provider>
      </ErrorBoundary>
    </Wrapper>
  );
};

if (window) window.oncontextmenu = () => false;

render(<App />, document.getElementById("app"));
