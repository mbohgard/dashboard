import * as React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import io from "socket.io-client";
import dayjs from "dayjs";
import "dayjs/locale/sv";

import { BaseStyles, colors } from "./styles";

import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Transports } from "./components/Transports";
import { Hue } from "./components/Hue";
import { warning } from "./components/Icon";
import { VOC } from "./components/VOC";

dayjs.locale("sv");

const Wrapper = styled.div`
  padding: 30px;
  max-height: 100%;
  height: 100%;
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
  background: rgba(0, 0, 0, 0.4);
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

export type CommonProps = {
  socket: SocketIOClient.Socket;
  reportError(service: string, err: any): void;
};

type ServiceError = {
  id: number;
  code: number;
  message: string;
  name: string;
  service: string;
  time: string;
};

type State = {
  errors: ServiceError[];
  newError?: boolean;
  showErrors?: boolean;
};

let errI = 0;

class App extends React.Component {
  state: State = { errors: [] };
  socket = io();

  reportError = (service: string, err: any) => {
    const isObj = typeof err === "object";
    const code = isObj ? err.statusCode || err.status : 0;
    const message = isObj ? err.message || err.msg || err.text : String(err);
    const name = (isObj && err.name) || err.code || "Error";
    const error: ServiceError = {
      id: ++errI,
      code,
      service,
      message,
      name,
      time: dayjs().format("DD/MM HH:mm")
    };

    this.setState((s: State) => ({
      errors: [error, ...s.errors.slice(0, 9)],
      newError: true
    }));
  };

  toggleError = (showErrors: boolean) =>
    this.setState({ showErrors, newError: false });

  componentDidCatch(err: any) {
    this.reportError("catch in Main", err);
  }

  render() {
    const { errors, showErrors, newError } = this.state;
    const common = { reportError: this.reportError, socket: this.socket };

    return (
      <Wrapper>
        <BaseStyles />
        <Container>
          <Half top>
            <Weather type="big" {...common} />
          </Half>
          <Half right top>
            <Time {...common} />
          </Half>
          <Whole>
            <Weather {...common} />
          </Whole>
          <Whole stretched last>
            <Transports {...common} />
            <VOC {...common} />
            <Hue {...common} />
          </Whole>
        </Container>
        <ErrorIndicator
          newError={newError}
          onClick={() => this.toggleError(true)}
        >
          {warning}
        </ErrorIndicator>
        {showErrors && (
          <ErrorsContainer onClick={() => this.toggleError(false)}>
            <ErrorsContent>
              {errors.map(err => (
                <ErrorBox key={err.id} onClick={e => e.stopPropagation()}>
                  {err.code ? `(${err.code}) ` : ""}
                  {err.name}: {err.message} [by {err.service} at {err.time}]
                </ErrorBox>
              ))}
            </ErrorsContent>
          </ErrorsContainer>
        )}
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("app"));
