import * as React from "react";
import styled from "styled-components";
import dayjs from "dayjs";

import { CommonProps } from "../main";
import { bus as busIcon, train as trainIcon } from "./Icon";

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

export class Transports extends React.Component<CommonProps, State> {
  state: State = {};

  componentDidMount() {
    this.props.socket.on(
      "transports",
      (res: TransportsServiceData) =>
        res.data
          ? this.setState(state => {
              return {
                bus:
                  res.data!.find(d => d.ResponseData.Buses.length > 0) ||
                  state.bus,
                train:
                  res.data!.find(d => d.ResponseData.Trains.length > 0) ||
                  state.train
              };
            })
          : this.props.reportError(res.service, res.error)
    );
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
            <Placeholder>Väntar på bussdata...</Placeholder>
          </div>
        )}
        {train ? (
          train.ResponseData.Trains.filter(t => {
            // Only interrested in journeys in a single direction
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
            <Placeholder>Väntar på tågdata...</Placeholder>
          </div>
        )}
      </Container>
    );
  }
}
