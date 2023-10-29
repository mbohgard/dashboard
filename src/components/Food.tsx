import React, { useCallback, useEffect, useRef, useState } from "react";

import { colors } from "../styles";
import { useIsIdle, useService } from "../hooks";
import { Loader } from "./Atoms";
import styled, { css } from "styled-components";
import { Icon } from "./Icon";
import dayjs from "dayjs";

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
  const [data] = useService<FoodServiceData>("food");
  const [week, setWeek] = useState(0);

  const thisWeek = data?.[0];

  const reset = useCallback(
    (newWeek = thisWeek?.weekOfYear ?? 0) => {
      setWeek(newWeek);
      list.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [thisWeek]
  );

  useEffect(() => {
    if (!week && thisWeek) reset();
  }, [reset, week]);

  useIsIdle(reset, { timeout: 15000 });

  if (!thisWeek) return <Loader />;

  const selectedWeek = data?.find((w) => w.weekOfYear === week);
  const isCurrent = thisWeek === selectedWeek;
  const today = dayjs();

  return (
    <Container>
      <WeekButton onClick={() => reset(isCurrent ? week + 1 : week - 1)}>
        {!isCurrent && <Icon Arrow />}
        <span>{isCurrent ? "Nästa vecka" : "Denna vecka"}</span>
        {isCurrent && <Icon Arrow />}
      </WeekButton>
      <Week>Vecka {week}</Week>
      <List ref={list}>
        {selectedWeek?.days.map(({ day, month, year, meals }) => {
          const dateStr = `${year}-${month}-${day}`;
          const date = dayjs(dateStr);

          return (
            <Day
              key={dateStr}
              active={date.isToday()}
              past={date.isSameOrBefore(today)}
            >
              <DayDate>
                {date.format("dddd")}
                <span>{date.format("D/M")}</span>
              </DayDate>
              <Meals>
                {meals.map(({ value }, ix) => (
                  <Meal key={ix} variant={ix}>
                    {value}
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
