import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import dayjs, { Dayjs } from "dayjs";

import { useService } from "../../../hooks";
import { colors } from "../../../styles";

const dots = keyframes`
  from {
    opacity: 1;
  } to {
    opacity: 0.2;
  }
`;

const seconds = keyframes`
  from {
    clip-path: inset(99% 0 0 0);
  } to {
    clip-path: inset(7% 0 0 0);
  }
`;

const Container = styled.div`
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimeView = styled.h2`
  position: relative;
  font-size: 185px;
  font-weight: 300;
  scale: 1 0.93;
  transform-origin: top;
  text-align: right;
  letter-spacing: -7px;
  line-height: 0.8;
  color: ${colors.dimmed};
`;

const DateView = styled.h4`
  font-size: 30px;
  font-weight: 300;
  text-align: right;
  white-space: nowrap;

  span {
    color: ${colors.dimmed};
  }
`;

const Dots = styled.i`
  animation: ${dots} 1s steps(2, end) infinite;
  color: ${colors.white};
  font-weight: 300;
`;

const TimeBlind = styled.span`
  position: absolute;
  display: block;
  /* background: ${colors.black}; */
  clip-path: inset(99% 0 0 0);
  font-weight: 400;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: ${colors.white};
  animation: ${seconds} 60s linear;
`;

type Time = [string, string, Dayjs];

const now = () => Math.floor(Date.now() / 1000);
const getTime = (timestamp: number) => {
  const time = dayjs.unix(timestamp);
  const [h, m] = time.format("HH:mm").split(":");

  return [h, m, time] as Time;
};
const getDate = (date: Dayjs) => [
  ...date.format("dddd DD MMMM:YYYY").split(":"),
  date.week(),
];

export const Time: React.FC = () => {
  const timestamp = useRef<number>();
  if (!timestamp.current) timestamp.current = now();
  const ts = timestamp.current;

  const [data] = useService("time");
  const [[h, m, time], setTime] = useState(() => getTime(ts));

  useEffect(() => {
    const interval = window.setInterval(() => {
      timestamp.current = timestamp.current! + 1;

      setTime((state) => {
        const [hour, min, time] = getTime(timestamp.current!);

        return state[1] !== min ? [hour, min, time] : state;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data) {
      timestamp.current = data.timestamp - data.gmtOffset;

      setTime(getTime(timestamp.current));
    }
  }, [data]);

  const [date, year, week] = getDate(time);

  return (
    <Container>
      <TimeView key={m}>
        {h}
        <Dots>:</Dots>
        {m}
        <TimeBlind>
          {h}
          <Dots>:</Dots>
          {m}
        </TimeBlind>
      </TimeView>
      <DateView>
        <span>
          {dayjs.locale() === "sv" ? "v" : "w"}
          {week},
        </span>{" "}
        {date} <span>{year}</span>
      </DateView>
    </Container>
  );
};
