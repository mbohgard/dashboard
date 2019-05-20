import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import dayjs from "dayjs";
import { Omit } from "utility-types";

import { CommonProps } from "../main";
import { colors } from "../styles";
import { bus as busIcon, train as trainIcon } from "./Icon";
import { DimmedIconBox as Box } from "./Atoms";

const Container = styled.div`
  display: flex;
  min-height: 160px;
`;

const LineNumber = styled.span`
  color: ${colors.superDimmed};
`;

type TimeProps = { empty?: boolean };

const TimeWrapper = styled.div<TimeProps>`
  font-weight: 300;
  font-size: 44px;
  margin-top: 8px;
  line-height: 1.2;

  > span {
    font-size: 32px;
  }

  ${({ empty }) =>
    empty &&
    css`
      color: ${colors.superDimmed};
    `};
`;

type TranportTimeProps = {
  data?: TransportItem;
} & TimeProps;

const TransportTime: React.SFC<TranportTimeProps> = ({ data }) => {
  if (!data) return null;

  const time = data.DisplayTime.split("min");

  return (
    <TimeWrapper>
      {time[0]}
      {time.length > 1 && <span>min</span>}{" "}
      <LineNumber>({data.LineNumber})</LineNumber>
    </TimeWrapper>
  );
};

const Placeholder = styled.div`
  font-size: 14px;
`;

const getTransports = (
  t: keyof Omit<TimetableResponse, "LatestUpdate" | "DataAge">,
  data?: Timetable[]
) => {
  const timetable =
    data &&
    data.find(d => {
      const transport = d && d.ResponseData && d.ResponseData[t];

      return transport ? transport.length > 0 : false;
    });

  return (
    (timetable && timetable.ResponseData && timetable.ResponseData[t]) || []
  );
};

type TransportItems = (TransportItem | undefined)[];

type TransportProps = {
  icon: JSX.Element;
  items?: TransportItems;
  placeholderText: string;
};

const Transport: React.SFC<TransportProps> = ({
  icon,
  items,
  placeholderText
}) => (
  <Box>
    {icon}
    <div>
      {items ? (
        items.map((b, i) => (
          <TransportTime key={b ? b.JourneyNumber : i} data={b} />
        ))
      ) : (
        <Placeholder>{placeholderText}</Placeholder>
      )}
    </div>
  </Box>
);

const fill = (x: TransportItems): TransportItems =>
  x &&
  Array(3)
    .fill(undefined)
    .map((_, i) => x[i]);

type State = {
  buses?: TransportItems;
  trains?: TransportItems;
};

export const Transports: React.SFC<CommonProps> = ({ socket, reportError }) => {
  const [{ buses: b, trains: t }, setState] = useState<State>({});
  const buses =
    b && fill(b.filter(b => (!b ? true : b.Destination.includes("Väsby"))));
  const trains =
    t &&
    fill(
      t.filter(t =>
        !t
          ? true
          : t.JourneyDirection === 1 &&
            dayjs(t.ExpectedDateTime).unix() - dayjs().unix() > 60 * 5
      )
    );

  useEffect(() => {
    const listener = (res: TransportsServiceData) =>
      res.data
        ? setState(() => ({
            buses: getTransports("Buses", res.data),
            trains: getTransports("Trains", res.data)
          }))
        : reportError(res.service, res.error);

    socket.on("transports", listener);

    return () => {
      socket.off("transports", listener);
    };
  }, []);

  return (
    <Container>
      <Transport
        icon={busIcon}
        items={buses}
        placeholderText="Väntar på bussdata..."
      />
      <Transport
        icon={trainIcon}
        items={trains}
        placeholderText="Väntar på tågdata..."
      />
    </Container>
  );
};
