import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { CommonProps } from "../main";

type State = {
  timestamp: number;
};

const TimeView = styled.h2`
  font-size: 125px;
  font-weight: 300;
  text-align: right;
  letter-spacing: -7px;

  span {
    font-size: 62px;
    color: #aaa;
    letter-spacing: 0;
    margin-left: 10px;
  }
`;

const DateView = styled.h4`
  font-size: 28px;
  font-weight: 300;
  text-align: right;
  margin-top: 12px;

  span {
    color: #aaa;
  }
`;

const getUnix = (data: TimeZone) => {
  const date = dayjs(data.formatted);

  // return data.dst === "1" ? date.subtract(1, "hour").unix() : date.unix();
  return date.unix();
};

export class Time extends React.Component<CommonProps, State> {
  state: State = { timestamp: Math.floor(Date.now() / 1000) };

  interval: NodeJS.Timer;

  tick = () => {
    this.interval = setInterval(
      () => this.setState(state => ({ timestamp: state.timestamp + 1 })),
      1000
    );
  };

  componentDidMount() {
    clearInterval(this.interval);

    this.tick();
    this.props.socket.on("time", (res: TimeServiceData) =>
      res.data
        ? this.setState({ timestamp: getUnix(res.data) })
        : this.props.reportError(res.service, res.error)
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const ts = (dayjs as any).unix(this.state.timestamp);
    const time = ts.format("HH:mm");
    const seconds = ts.format("ss");
    const date = ts.format("dddd DD MMMM");
    const year = ts.format("YYYY");

    return (
      <div>
        <TimeView>
          {time}
          <span>:{seconds}</span>
        </TimeView>
        <DateView>
          {date} <span>{year}</span>
        </DateView>
      </div>
    );
  }
}
