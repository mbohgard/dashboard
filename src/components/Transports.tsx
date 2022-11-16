import React, { useMemo, useRef } from "react";
import styled, { css } from "styled-components";
import dayjs from "dayjs";

import { useService } from "../hooks";
import { colors } from "../styles";
import { ServiceBox } from "./Molecules";

const Container = styled.div`
  display: flex;
`;

type TimeProps = { empty?: boolean };

const TimeWrapper = styled.div<TimeProps>`
  font-weight: 300;
  font-size: 53px;
  margin-top: 3px;
  line-height: 1.2;
  white-space: nowrap;

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
  min-width: 150px;
`;

type TranportTimeProps = {
  data?: TransportItem;
} & TimeProps;

const TransportTime: React.FC<TranportTimeProps> = ({ data }) => {
  if (!data) return <TimeWrapper>---</TimeWrapper>;

  const time = data.DisplayTime.split("min");

  return (
    <TimeWrapper>
      {time[0]}
      {time.length > 1 && <span>min</span>}{" "}
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

const fill = (x: TransportItems): TransportItems =>
  Array(4)
    .fill(undefined)
    .map((_, i) => x[i]);

export const Transports: React.FC = () => {
  const labels = useRef<Record<string, string>>({});
  const [data, _, meta] = useService<TransportsServiceData>("transports");

  const transports = useMemo(
    () =>
      data?.map((transport, i) => {
        const siteId = transport.siteId;
        const label = meta?.sites.find(
          ({ siteId: id }) => siteId === id
        )?.label;
        const type = label === "Tåg" ? "Trains" : "Buses";
        const currentLabel = labels.current[siteId];

        if (!currentLabel || currentLabel?.startsWith("(Transport"))
          labels.current[siteId] = label ?? `(Transport ${i + 1})`;

        return {
          items: fill(
            getTransports(type, data).filter(
              (t) =>
                !t ||
                (type === "Trains"
                  ? t.JourneyDirection === 1 &&
                    dayjs(t.ExpectedDateTime).unix() - dayjs().unix() > 60 * 5
                  : t.Destination.includes("Väsby"))
            )
          ),
          siteId,
        };
      }),
    [data, meta]
  );

  return (
    <Container>
      {transports ? (
        transports?.map(({ items, siteId }) => (
          <Box
            key={labels.current[siteId]}
            title={labels.current[siteId]}
            loading={!Boolean(items)}
          >
            <div>
              {items.map((b, i) => (
                <TransportTime key={b?.JourneyNumber ?? i} data={b} />
              ))}
            </div>
          </Box>
        ))
      ) : (
        <Box title="Transports..." loading={true} />
      )}
    </Container>
  );
};
