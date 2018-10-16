import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { min2Ms } from "../utils/time";

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

export class Time extends React.Component<
  { reportError(e: Error): void },
  State
> {
  state: State = { timestamp: Math.floor(Date.now() / 1000) };

  fetchTimer: NodeJS.Timer;
  interval: NodeJS.Timer;

  getData = () =>
    fetch("/time")
      .then(res => res.json())
      .then((data: TimeZone) =>
        this.setState({ timestamp: dayjs(data.formatted).unix() })
      )
      .catch(error => this.props.reportError(error));

  tick = () => {
    this.interval = setInterval(
      () => this.setState(state => ({ timestamp: state.timestamp + 1 })),
      1000
    );
  };

  startClock = () => {
    clearTimeout(this.fetchTimer);
    clearInterval(this.interval);

    this.fetchTimer = setTimeout(this.startClock, min2Ms(5));
    this.tick();

    this.getData();
  };

  componentDidMount() {
    this.startClock();
  }

  componentWillUnmount() {
    clearTimeout(this.fetchTimer);
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
