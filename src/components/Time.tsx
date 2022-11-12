import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import dayjs, { Dayjs } from "dayjs";

import { useService } from "../hooks";
import { colors } from "../styles";

const dots = keyframes`
  from {
    opacity: 1;
  } to {
    opacity: 0.2;
  }
`;

const seconds = keyframes`
  from {
    transform: scaleX(0);
  } to {
    transform: scaleX(1);
  }
`;

const TimeView = styled.h2`
  font-size: 190px;
  font-weight: 300;
  text-align: right;
  letter-spacing: -7px;
  line-height: 0.8;

  i {
    animation: ${dots} 0.5s infinite alternate ease-in;
  }
`;

const DateView = styled.h4`
  font-size: 38px;
  font-weight: 300;
  text-align: right;

  span {
    color: ${colors.dimmed};
  }
`;

const Seconds = styled.div`
  height: 4px;
  background: ${colors.hyperDimmed};
  width: 4ch;
  margin: 20px 0 10px auto;

  div {
    animation: ${seconds} 60s linear;
    transform-origin: left;
    background: ${colors.superDimmed};
    width: 100%;
    height: 100%;
  }
`;

type Time = [string, string, Dayjs];

const now = () => Math.floor(Date.now() / 1000);
const getTime = (timestamp: number) => {
  const time = dayjs.unix(timestamp);
  const [h, m] = time.format("HH:mm").split(":");

  return [h, m, time] as Time;
};
const getDate = (date: Dayjs) => date.format("dddd DD MMMM:YYYY").split(":");

export const Time: React.FC = () => {
  const timestamp = useRef<number>();
  if (!timestamp.current) timestamp.current = now();
  const ts = timestamp.current;

  const [data] = useService<TimeServiceData>("time");
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

  const [date, year] = getDate(time);

  return (
    <div>
      <TimeView>
        {h}
        <i>:</i>
        {m}
        <Seconds key={m}>
          <div />
        </Seconds>
      </TimeView>
      <DateView>
        {date} <span>{year}</span>
      </DateView>
    </div>
  );
};
