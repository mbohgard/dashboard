import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useService } from "../../../hooks";
import { colors } from "../../../styles";
import { ServiceBox } from "../../../components/Molecules";
import { ServiceResponse } from "../../../types";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type TimeProps = { empty?: boolean };

const TimeWrapper = styled.div<TimeProps>`
  font-weight: 300;
  font-size: 46px;
  margin-top: 3px;
  line-height: 1.3;
  white-space: nowrap;

  > span {
    font-size: 34px;
  }

  ${({ empty }) =>
    empty &&
    css`
      color: ${colors.dimmed};
    `};
`;

type Data = NonNullable<ServiceResponse<"transports">["data"]>;

const TransportTime = ({
  children,
  empty,
}: { children?: string } & TimeProps) => {
  if (empty) return <TimeWrapper>---</TimeWrapper>;

  const time = children?.split("min") ?? [];

  return (
    <TimeWrapper>
      {time?.[0]}
      {time?.length > 1 && <span>min</span>}{" "}
    </TimeWrapper>
  );
};

const fill = (x?: Data) =>
  Array(4)
    .fill(undefined)
    .map((_, i) => x?.[i]);

export const Transports: React.FC = () => {
  const [data, _, meta] = useService("transports");

  const items = useMemo(() => fill(data), [data]);

  return (
    <ServiceBox title={meta?.label ?? "Transports"} loading={!Boolean(data)}>
      <Container>
        {items?.map((item, ix) => (
          <TransportTime key={item?.id ?? ix} empty={!Boolean(item?.id)}>
            {item?.display}
          </TransportTime>
        ))}
      </Container>
    </ServiceBox>
  );
};
