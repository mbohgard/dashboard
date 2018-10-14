import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { bus } from "../components/Icon";

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

const BusContainer = styled.div`
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

const Bus: React.SFC<{ data: Bus }> = ({ data }) => (
  <BusContainer>
    <LineNumber>
      {bus} {data.LineNumber}
    </LineNumber>
    <Time>{formatTime(data.DisplayTime)}</Time>
    <Destination>{data.Destination}</Destination>
  </BusContainer>
);

type State = {
  data?: Timetable;
  error?: any;
};

export class Buses extends React.Component<{}, State> {
  state: State = {};

  timer: NodeJS.Timer;
  visible: true;

  getData = () =>
    (document.hidden === false || document.hidden === undefined) &&
    fetch("/buses", { mode: "no-cors" })
      .then(res => res.json())
      .then((data: Timetable) => this.setState({ data }))
      .catch(error => this.setState({ error }));

  fetcher = (delay: number) => () => {
    this.getData();

    this.timer = setTimeout(this.fetcher(getDelay()), delay);
  };

  componentDidMount() {
    this.fetcher(getDelay())();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { data } = this.state;

    if (!data) {
      return <div>Hämtar bussar...</div>;
    }

    return (
      <Container>
        {data.ResponseData.Buses.filter(b =>
          b.Destination.includes("Väsby")
        ).map(bus => (
          <Bus key={bus.JourneyNumber} data={bus} />
        ))}
      </Container>
    );
  }
}
