import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { useService } from "../hooks";
import { colors } from "../styles";

const TimeView = styled.h2`
  font-size: 190px;
  font-weight: 300;
  text-align: right;
  letter-spacing: -7px;
  line-height: 0.8;

  span {
    font-size: 80px;
    color: ${colors.dimmed};
    letter-spacing: 0;
    margin-left: 10px;
  }
`;

const DateView = styled.h4`
  font-size: 40px;
  font-weight: 300;
  text-align: right;
  margin-top: 30px;

  span {
    color: ${colors.dimmed};
  }
`;

export const Time: React.FC = () => {
  const [data] = useService<TimeServiceData>("time");
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = window.setInterval(
      () => setTimestamp((state) => state + 1),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => data && setTimestamp(data.timestamp - data.gmtOffset), [
    data,
  ]);

  const ts = (dayjs as any).unix(timestamp);
  const [h, m, s] = ts.format("HH:mm:ss").split(":");
  const [date, year] = ts.format("dddd DD MMMM:YYYY").split(":");

  return (
    <div>
      <TimeView>
        {h}:{m}
        <span>:{s}</span>
      </TimeView>
      <DateView>
        {date} <span>{year}</span>
      </DateView>
    </div>
  );
};
