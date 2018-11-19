import * as React from "react";
import { render } from "react-dom";
import styled from "styled-components";
import io from "socket.io-client";
import dayjs from "dayjs";
import "dayjs/locale/sv";

import { BaseStyles } from "./styles";

import { Weather } from "./components/Weather";
import { Time } from "./components/Time";
import { Transports } from "./components/Transports";

dayjs.locale("sv");

const Wrapper = styled.div`
  padding: 40px;
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

const Half = styled.div`
  width: 50%;
  display: flex;
  align-items: ${({ top }: HalfProps) => (top ? "flex-start" : "center")};
  justify-content: ${({ right }: HalfProps) =>
    right ? "flex-end" : "flex-start"};
`;

type WholeProps = {
  left?: boolean;
  right?: boolean;
  last?: boolean;
};

const Whole = styled(Half)`
  width: 100%;
  justify-content: ${({ left, right }: WholeProps) =>
    left ? "flex-start" : right ? "flex-start" : "center"};
  align-items: ${({ last }: WholeProps) => (last ? "flex-end" : "normal")};
`;

const ErrorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
`;

const ErrorBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #bf2f2f;
  padding: 20px;
`;

export type CommonProps = {
  socket: SocketIOClient.Socket;
  reportError(service: string, err: any): void;
};

type ServiceError = {
  code: number;
  message: string;
  name: string;
  service: string;
};

type State = {
  error?: ServiceError;
  showError?: boolean;
};

class App extends React.Component {
  state: State = {};
  socket = io();

  reportError = (service: string, err: any) => {
    const isObj = err === "object";
    const code = typeof isObj ? err.statusCode || err.status : 0;
    const message = typeof isObj
      ? err.message || err.msg || err.text
      : String(err);
    const name = (isObj && err.name) || "Error";
    const error: ServiceError = {
      code,
      service,
      message,
      name
    };

    this.setState({ error });
  };

  componentDidCatch(err: any) {
    this.reportError("catch in Main", err);
  }

  render() {
    const { error: err, showError } = this.state;
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
          <Whole last>
            <Transports {...common} />
          </Whole>
        </Container>
        {err && (
          <ErrorContainer>
            {showError && (
              <ErrorBox>
                {err.code && `(${err.code}) `}
                {err.name}: {err.message} [by {err.service}]{console.dir(err)}
              </ErrorBox>
            )}
          </ErrorContainer>
        )}
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("app"));
