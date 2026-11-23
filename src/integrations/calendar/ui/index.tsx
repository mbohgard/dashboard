import React, { useRef } from "react";
import styled, { css } from "styled-components";
import dayjs, { Dayjs } from "dayjs";

import { useIsIdle } from "../../../hooks";
import { useService } from "../../../hooks/useService";
import { colors } from "../../../styles";

import { Loader } from "../../../components/Atoms";
import { ServiceResponse } from "../../../types";

const Container = styled.ul`
  list-style: none;
  font-size: 20px;
  padding-top: 5px;
  height: 100%;
  overflow: auto;
`;

const pebble = css`
  min-width: 26px;
  min-height: 26px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  font-size: 16px !important;
  line-height: 0;
`;

type ItemProps = {
  color: keyof typeof colors;
  label: string;
  valid: boolean;
  size: number | null;
};

const Item = styled.li<ItemProps>`
  white-space: nowrap;
  line-height: 33px;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ valid }) => (valid ? 1 : 0.5)};
  font-size: ${(p) => (p.size ? `${p.size}px` : "inherit")};

  &:before {
    content: ${({ label }) => `"${label}"`};
    text-transform: uppercase;
    background: ${({ color }) => colors[color]};
    ${pebble};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    font-size: 0.7em;
  }
`;

const Time = styled.span`
  color: ${colors.lightGray};
  font-style: italic;
  ${pebble};
  font-size: 0.8em !important;
  background: ${colors.megaDimmed};
  padding: 0 6px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-right: 5px;
  vertical-align: middle;
`;

const Summary = styled.span<Pick<ItemProps, "valid">>`
  text-decoration: ${({ valid }) => (valid ? "none" : "line-through")};
`;

const makeGetCalTime = (allDay: boolean) => (date: Dayjs) => {
  const time = date.calendar();

  return allDay ? time.split(" ").slice(0, -1).join(" ") : time;
};

type Data = NonNullable<ServiceResponse<"calendar">["data"]>;

const getTime = ({
  start: startDate,
  end: endDate,
  allDay,
  ongoing,
  passed,
}: Data[number]): [string, boolean, "today" | "tomorrow" | "future"] => {
  const getCalTime = makeGetCalTime(allDay);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const valid = !passed;
  const urgency = start.isToday()
    ? "today"
    : start.isTomorrow()
      ? "tomorrow"
      : "future";

  if (allDay) {
    return [
      ongoing
        ? "nu"
        : valid
          ? getCalTime(start)
          : getCalTime(end.subtract(1, "second")), // make whole day events end att 23:59:59 instead of 00:00:00 the next day
      valid,
      ongoing ? "today" : urgency,
    ];
  }

  return [
    ongoing ? `nu t. ${end.format("HH:mm")}` : getCalTime(start),
    valid,
    urgency,
  ];
};

export const Calendar: React.FC = () => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [data] = useService("calendar");

  useIsIdle(() => {
    if (listRef.current)
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
  });

  if (!data) return <Loader />;

  return (
    <Container ref={listRef}>
      {data.map((e) => {
        const [time, valid, urgency] = getTime(e);

        return (
          <Item
            key={e.id}
            label={e.name.charAt(0)}
            color={e.color}
            valid={valid}
            size={urgency === "today" ? 26 : urgency === "tomorrow" ? 23 : null}
          >
            <Time>{time}</Time>
            <Summary valid={valid}>{e.summary}</Summary>
          </Item>
        );
      })}
    </Container>
  );
};
