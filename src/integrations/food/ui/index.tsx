import React, { useEffect, useRef, useState } from "react";

import { colors } from "../../../styles";
import { useIsIdle, useStableCallback } from "../../../hooks";
import { Loader } from "../../../components/Atoms";
import styled, { css } from "styled-components";
import { Icon } from "../../../components/Icon";
import dayjs from "dayjs";
import { useService } from "../../../hooks/useService";

const Container = styled.div`
  font-size: 21px;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WeekButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  color: ${colors.dimmed};
  background: ${colors.black};
  border: solid 3px ${colors.superDimmed};
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 8px;
  font-size: 16px;

  > svg {
    fill: currentColor;
    rotate: 90deg;
    width: 18px;
    height: 18px;
  }

  > svg:first-child {
    rotate: -90deg;
  }
`;

const Week = styled.h4`
  font-size: 24px;
  color: ${colors.superDimmed};
  padding-top: 10px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 18px;
  line-height: 1.3;
  overflow: scroll;
  flex-grow: 1;
`;

const Day = styled.li<{ active: boolean; past: boolean }>`
  display: flex;
  gap: 5px;

  ${(p) =>
    p.past &&
    !p.active &&
    css`
      * {
        color: ${colors.ultraDimmed} !important;
      }
    `}

  ${(p) =>
    p.active &&
    css`
      h5 {
        color: ${colors.green};
      }
    `};
`;

const DayDate = styled.h5`
  text-transform: capitalize;
  color: ${colors.dimmed};
  min-width: 84px;

  span {
    display: block;
    color: ${colors.superDimmed};
    font-size: 20px;
  }
`;

const Meals = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Meal = styled.li<{ variant: number }>`
  color: ${(p) => (p.variant ? colors.dimmed : "currentColor")};
`;

export const Food: React.FC = () => {
  const list = useRef<HTMLUListElement | null>(null);
  const [data] = useService("food");
  const [week, setWeek] = useState(0);

  const thisWeek = data?.[0];
  const selectedWeek = data?.find((w) => w.week === week);
  const thisWeekN = thisWeek?.week ?? 0;
  const isCurrent = thisWeek === selectedWeek;
  const today = dayjs();
  const isPastWednesday = today.day() >= 3;

  const resetScroll = useStableCallback(() => {
    list.current?.scrollTo({
      top: isCurrent && isPastWednesday ? list.current?.scrollHeight : 0,
      behavior: "smooth",
    });
  });

  const reset = useStableCallback((next = false) => {
    const nextWeek = next ? thisWeekN + 1 : thisWeekN;

    setWeek(nextWeek);

    // reset scroll pos if we're on the same week, otherwise scroll after state change
    if (nextWeek === thisWeekN) resetScroll();
  });

  // reset scroll on every week change
  useEffect(() => resetScroll(), [week]);

  useEffect(() => {
    if (!week && thisWeekN) setWeek(thisWeekN);
  }, [week, thisWeekN]);

  useIsIdle(reset, { timeout: 15000 });

  if (!thisWeek) return <Loader />;

  return (
    <Container>
      {Boolean(data.length) && (
        <WeekButton onClick={() => reset(isCurrent)}>
          {!isCurrent && <Icon Arrow />}
          <span>{isCurrent ? "Nästa vecka" : "Denna vecka"}</span>
          {isCurrent && <Icon Arrow />}
        </WeekButton>
      )}

      <Week>Vecka {week}</Week>
      <List ref={list}>
        {selectedWeek?.Days.map(({ date: utc, Meals: meals }) => {
          const date = dayjs(utc);

          return (
            <Day
              key={utc}
              active={date.isToday()}
              past={date.isSameOrBefore(today)}
            >
              <DayDate>
                {date.format("dddd")}
                <span>{date.format("D/M")}</span>
              </DayDate>
              <Meals>
                {meals.reverse().map(({ id, name }, ix) => (
                  <Meal key={id} variant={ix}>
                    {name}
                  </Meal>
                ))}
              </Meals>
            </Day>
          );
        })}
      </List>
    </Container>
  );
};
