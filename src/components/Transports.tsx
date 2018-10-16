import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { bus, train } from "./Icon";

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
    return sec2Ms(10);
  }

  if (dayTime) {
    return sec2Ms(30);
  }

  return min2Ms(1);
};

const Container = styled.div`
  display: flex;
`;

const TransportContainer = styled.div`
  margin-left: 30px;

  &:first-child {
    margin-left: 0;
  }
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
    margin-left: 2px;
    font-size: 32px;
    color: #aaa;
  }
`;

const Destination = styled.div`
  font-size: 20px;
  margin-top: 10px;
  max-width: 238px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
  <TransportContainer>
    <LineNumber>
      {icon} {data.LineNumber}
    </LineNumber>
    <Time>{formatTime(data.DisplayTime)}</Time>
    <Destination>{data.Destination}</Destination>
  </TransportContainer>
);

const Placeholder = styled.div`
  font-size: 14px;
`;

type State = {
  buses?: Timetable;
  trains?: Timetable;
};

export class Transports extends React.Component<
  { reportError(e: Error): void },
  State
> {
  state: State = {};

  timer: NodeJS.Timer;
  visible: true;

  getData = (endpoint: "buses" | "trains") =>
    (document.hidden === false || document.hidden === undefined) &&
    fetch(`/${endpoint}`, { mode: "no-cors" })
      .then(res => res.json())
      .then((data: Timetable) => this.setState({ [endpoint]: data }))
      .then(
        () =>
          endpoint === "buses" &&
          setTimeout(this.getData.bind(this, "trains"), 2000)
      )
      .catch(error => this.props.reportError(error));

  fetcher = (delay: number) => () => {
    this.getData("buses");

    this.timer = setTimeout(this.fetcher(getDelay()), delay);
  };

  componentDidMount() {
    this.fetcher(getDelay())();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { buses, trains } = this.state;

    return (
      <Container>
        {buses ? (
          buses.ResponseData.Buses.filter(b => b.Destination.includes("Väsby"))
            .filter((_, i) => !i)
            .map(b => <Transport key={b.JourneyNumber} data={b} icon={bus} />)
        ) : (
          <TransportContainer>
            <Placeholder>Hämtar bussar...</Placeholder>
          </TransportContainer>
        )}
        {trains ? (
          trains.ResponseData.Trains.filter(b => b.JourneyDirection === 1)
            .filter((_, i) => i < 2)
            .map(b => <Transport key={b.JourneyNumber} data={b} icon={train} />)
        ) : (
          <TransportContainer>
            <Placeholder>Hämtar tåg...</Placeholder>
          </TransportContainer>
        )}
      </Container>
    );
  }
}
