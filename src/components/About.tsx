import React, { useState, useRef, useLayoutEffect } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { ms2Sec, sec2Str } from "../utils/time";
import { useConnected } from "../hooks";

import { Overlay } from "./Molecules";

const Trigger = styled.a`
  position: fixed;
  width: 60px;
  height: 60px;
  top: 0;
  right: 0;
  background: transparent;
  z-index: 99;
`;

const Content = styled.div`
  padding: 30px;
  background: linear-gradient(
    0deg,
    rgba(255, 201, 161, 1) 0%,
    rgba(201, 255, 233, 1) 100%
  );
  border: solid 2px ${colors.white};
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.7);
  min-width: 380px;

  h2 {
    font-size: 30px;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const ContentData = styled.div`
  white-space: nowrap;
  line-height: 1.65;
  font-size: 18px;
  text-align: center;

  strong {
    font-weight: bold;
  }
`;

const Status = styled.span<{ connected: boolean }>`
  display: inline-block;
  font-weight: 600;
  padding: 0 7px;
  font-size: 17px;
  background: ${({ connected }) => (connected ? colors.green : colors.red)};
  color: ${colors.white};
`;

type Props = {
  version?: string;
  launched?: number;
};

export const About: React.FC<Props> = ({
  version,
  launched: serverStarted,
}) => {
  const started = useRef(ms2Sec(Date.now()));
  const connected = useConnected();
  const [now, setNow] = useState(0);
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    if (!show) return;

    let countFrom = ms2Sec(Date.now());

    setNow(countFrom);

    const interval = setInterval(() => setNow(++countFrom), 1000);

    return () => clearInterval(interval);
  }, [show]);

  return show ? (
    <Overlay closeOnPress autoClose={5000} close={() => setShow(false)}>
      <Content>
        <h2>dashboard v{version}</h2>
        <ContentData>
          <strong>Status:</strong>{" "}
          <Status connected={connected}>
            {connected ? "Connected" : "Disconnected"}
          </Status>
        </ContentData>
        <ContentData>
          <strong>Client uptime:</strong> {sec2Str(now - started.current)}
        </ContentData>
        {serverStarted && connected && (
          <ContentData>
            <strong>Server uptime:</strong> {sec2Str(now - serverStarted)}
          </ContentData>
        )}
      </Content>
    </Overlay>
  ) : (
    <Trigger onClick={() => setShow(true)} />
  );
};
