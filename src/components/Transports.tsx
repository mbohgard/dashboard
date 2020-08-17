import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import dayjs from "dayjs";

import { useService } from "../hooks";
import { colors } from "../styles";
import { ServiceBox } from "./Molecules";

const Container = styled.div`
  display: flex;
  min-height: 180px;

  > div:first-child {
    margin-left: 0;
  }
`;

const LineNumber = styled.span`
  color: ${colors.superDimmed};
`;

type TimeProps = { empty?: boolean };

const TimeWrapper = styled.div<TimeProps>`
  font-weight: 300;
  font-size: 60px;
  margin-top: 4px;
  line-height: 1.2;
  white-space: nowrap;
  min-width: 200px;

  > span {
    font-size: 40px;
  }

  ${({ empty }) =>
    empty &&
    css`
      color: ${colors.dimmed};
    `};
`;

const Box = styled(ServiceBox)`
  min-width: 100px;
`;

type TranportTimeProps = {
  data?: TransportItem;
} & TimeProps;

const TransportTime: React.SFC<TranportTimeProps> = ({ data }) => {
  if (!data) return <TimeWrapper>---</TimeWrapper>;

  const time = data.DisplayTime.split("min");

  return (
    <TimeWrapper>
      {time[0]}
      {time.length > 1 && <span>min</span>}{" "}
      <LineNumber>({data.LineNumber})</LineNumber>
    </TimeWrapper>
  );
};

const getTransports = (
  t: keyof Omit<TimetableResponse, "LatestUpdate" | "DataAge">,
  data?: Timetable[]
) =>
  data?.find((d) => {
    const transport = d && d.ResponseData && d.ResponseData[t];

    return transport ? transport.length > 0 : false;
  })?.ResponseData?.[t] || [];

type TransportItems = (TransportItem | undefined)[];

type TransportProps = {
  items?: TransportItems;
  title: string;
};

const Transport: React.SFC<TransportProps> = ({ items, title }) => (
  <Box title={title} loading={!Boolean(items)}>
    <div>
      {items?.map((b, i) => (
        <TransportTime key={i} data={b} />
      ))}
    </div>
  </Box>
);

const fill = (x: TransportItems): TransportItems =>
  Array(3)
    .fill(undefined)
    .map((_, i) => x[i]);

export const Transports: React.FC = () => {
  const [data] = useService<TransportsServiceData>("transports");
  const [buses, trains] = useMemo(() => {
    if (!data) return [undefined, undefined];

    return [
      fill(
        getTransports("Buses", data).filter((b) =>
          !b ? true : b.Destination.includes("Väsby")
        )
      ),
      fill(
        getTransports("Trains", data).filter((t) =>
          !t
            ? true
            : t.JourneyDirection === 1 &&
              dayjs(t.ExpectedDateTime).unix() - dayjs().unix() > 60 * 5
        )
      ),
    ];
  }, [data]);

  return (
    <Container>
      <Transport items={buses} title="Buss" />
      <Transport items={trains} title="Tåg" />
    </Container>
  );
};
