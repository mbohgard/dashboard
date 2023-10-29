import React, { useState, useRef, useLayoutEffect } from "react";
import styled from "styled-components";

import { colors } from "../styles";
import { ms2Sec, sec2Time } from "../utils/time";
import { useConnected } from "../hooks";

import { Overlay } from "./Molecules";
import { settingsStore } from "../stores";

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
  padding: 20px;
  background: linear-gradient(
    0deg,
    rgba(255, 201, 161, 1) 0%,
    rgba(201, 255, 233, 1) 100%
  );
  border: solid 2px ${colors.white};
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.7);
  min-width: 380px;
  line-height: 1.65;
  font-size: 18px;
  text-align: center;

  strong {
    font-weight: bold;
  }

  h2 {
    font-size: 30px;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const ContentData = styled.div`
  white-space: nowrap;
`;

const Status = styled.span<{ connected: boolean }>`
  display: inline-block;
  font-weight: 600;
  padding: 0 7px;
  font-size: 17px;
  background: ${({ connected }) => (connected ? colors.green : colors.red)};
  color: ${colors.white};
`;

const SettingsContainer = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 16px;
  flex-wrap: wrap;
  justify-content: center;

  strong {
    width: 100%;
  }
`;

const Setting = styled.button<{ active: boolean }>`
  background: ${(p) => (p.active ? colors.green : colors.gray)};
  color: ${(p) => (p.active ? colors.white : colors.lightGray)};
  text-transform: capitalize;
  border: none;
  padding: 4px 8px;
`;

const Settings: React.FC = () => {
  const [settings, setSettings] = settingsStore.useStore();

  return (
    <SettingsContainer>
      <strong>Settings:</strong>
      {Object.entries(settings).map(([key, val]) => (
        <Setting
          key={key}
          active={val}
          onClick={() => setSettings((s) => ({ ...s, [key]: !val }))}
        >
          {key}
        </Setting>
      ))}
    </SettingsContainer>
  );
};

type Props = {
  version?: string;
  launched?: number;
};

export const About = ({ version, launched: serverStarted }: Props) => {
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
    <Overlay closeOnPress autoClose={undefined} close={() => setShow(false)}>
      <Content onClick={(e) => e.stopPropagation()}>
        <h2>dashboard v{version}</h2>
        <ContentData>
          <strong>Status:</strong>{" "}
          <Status connected={connected}>
            {connected ? "Connected" : "Disconnected"}
          </Status>
        </ContentData>
        <ContentData>
          <strong>Client uptime:</strong>{" "}
          {sec2Time(now - started.current).formatted}
        </ContentData>
        {serverStarted && connected && (
          <ContentData>
            <strong>Server uptime:</strong>{" "}
            {sec2Time(now - serverStarted).formatted}
          </ContentData>
        )}
        <Settings />
      </Content>
    </Overlay>
  ) : (
    <Trigger onClick={() => setShow(true)} />
  );
};
