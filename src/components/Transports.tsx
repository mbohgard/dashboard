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
  buses?: TransportItem[];
  trains?: TransportItem[];
};

const getTransports = (data: Timetable[], t: keyof TimetableResponse) => {
  const timetable = data.find(d => {
    const transport =
      d && d.ResponseData && (d.ResponseData[t] as TransportItem[] | undefined);

    return transport ? transport.length > 0 : false;
  });

  return timetable && (timetable.ResponseData[t] as TransportItem[]);
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
                buses: getTransports(res.data!, "Buses") || state.buses,
                trains: getTransports(res.data!, "Trains") || state.trains
              };
            })
          : this.props.reportError(res.service, res.error)
    );
  }

  render() {
    const { buses, trains } = this.state;

    return (
      <Container>
        {buses ? (
          buses
            .filter(b => b.Destination.includes("Väsby"))
            .filter((_, i) => i < 2)
            .map(b => (
              <Transport key={b.JourneyNumber} data={b} icon={busIcon} />
            ))
        ) : (
          <div>
            <Placeholder>Väntar på bussdata...</Placeholder>
          </div>
        )}
        {trains ? (
          trains
            .filter(t => {
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
