import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { bus as busIcon, train as trainIcon } from "./Icon";

import { min2Ms, sec2Ms } from "../utils/time";

const getDelay = () => {
  const time = dayjs(Date.now());
  const day = time.day();
  const weekend = day === 0 || day === 6;
  const hour = time.hour();
  const dayTime = (weekend ? hour >= 8 : hour >= 7) && hour <= 21;
  const peakTime =
    !weekend && ((hour >= 7 && hour <= 8) || (hour >= 15 && hour <= 17));

  if (peakTime) {
    return sec2Ms(20);
  }

  if (dayTime) {
    return sec2Ms(30);
  }

  return min2Ms(1);
};

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const LineNumber = styled.div`
  font-size: 30px;

  > svg {
    vertical-align: bottom;
    width: 34px;
    height: 34px;
  }
`;

const Time = styled.h3`
  font-weight: 300;
  font-size: 60px;
  margin-top: 8px;

  span {
    font-size: 32px;
    color: #aaa;
  }
`;

// const Destination = styled.div`
//   font-size: 20px;
//   margin-top: 10px;
//   max-width: 238px;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
// `;

const formatTime = (time: string) => {
  const arr = time.split("min");

  return (
    <div>
      {arr[0]}
      {arr.length > 1 && <span>min</span>}
    </div>
  );
};

type TransportProps = {
  data: TransportItem;
  icon: JSX.Element;
};

const Transport: React.SFC<TransportProps> = ({ data, icon }) => (
  <div>
    <LineNumber>
      {icon} {data.LineNumber}
    </LineNumber>
    <Time>{formatTime(data.DisplayTime)}</Time>
  </div>
);

const Placeholder = styled.div`
  font-size: 14px;
`;

type State = {
  bus?: Timetable;
  train?: Timetable;
};

export class Transports extends React.Component<
  { reportError(e: Error): void },
  State
> {
  state: State = {};

  timer: NodeJS.Timer;
  visible: true;

  getData = (endpoint: "bus" | "train") =>
    (document.hidden === false || document.hidden === undefined) &&
    fetch(`/${endpoint}`, { mode: "no-cors" })
      .then(res => res.json())
      .then((data: Timetable) => this.setState({ [endpoint]: data }))
      .then(
        () =>
          endpoint === "bus" &&
          setTimeout(this.getData.bind(this, "train"), 2000)
      )
      .catch(error => this.props.reportError(error));

  fetcher = (delay: number) => () => {
    this.getData("bus");

    this.timer = setTimeout(this.fetcher(getDelay()), delay);
  };

  componentDidMount() {
    this.fetcher(getDelay())();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { bus, train } = this.state;

    return (
      <Container>
        {bus ? (
          bus.ResponseData.Buses.filter(b => b.Destination.includes("Väsby"))
            .filter((_, i) => i < 2)
            .map(b => (
              <Transport key={b.JourneyNumber} data={b} icon={busIcon} />
            ))
        ) : (
          <div>
            <Placeholder>Hämtar bussar...</Placeholder>
          </div>
        )}
        {train ? (
          train.ResponseData.Trains.filter(t => {
            if (t.JourneyDirection !== 1) {
              return false;
            }

            const now = dayjs(Date.now());
            const time = dayjs(t.ExpectedDateTime);

            return time.unix() - now.unix() > 60 * 5;
          })
            .filter((_, i) => i < 3)
            .map(b => (
              <Transport key={b.JourneyNumber} data={b} icon={trainIcon} />
            ))
        ) : (
          <div>
            <Placeholder>Hämtar tåg...</Placeholder>
          </div>
        )}
      </Container>
    );
  }
}
