import React, { useMemo, useRef } from "react";
import styled, { css } from "styled-components";

import { Loader } from "../../../components/Atoms";
import {
  useIsIdle,
  useService,
  useSparkle,
  useStoredData,
} from "../../../hooks";
import { ServiceBox } from "../../../components/Molecules";
import type { Chore as ChoreContainer, Status } from "../types";
import { colors } from "../../../styles";
import dayjs from "dayjs";

const Container = styled.ul`
  font-size: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  overflow: auto;
  padding-right: 10px;
  margin-top: 10px;
`;

const MONTH_LABEL_WIDTH = 70;

const ChoreContainer = styled.li<{
  status?: Status;
  separate: boolean;
}>`
  display: flex;
  align-items: center;
  line-height: 1.3;
  color: ${(p) =>
    p.status === "urgent"
      ? colors.danger
      : p.status === "close"
        ? colors.warning
        : "inherit"};

  ${(p) =>
    p.separate &&
    css`
      &:not(:first-child) {
        padding-top: 8px;
        border-top: dashed 1px ${colors.ultraDimmed};
        margin-top: 4px;
      }
    `};

  label {
    gap: 8px;
    display: flex;
    flex-grow: 1;
    max-width: calc(100% - ${MONTH_LABEL_WIDTH}px);

    input {
      display: grid;
      place-content: center;
      position: relative;
      margin: 0;
      appearance: none;

      &:before {
        content: "";
        width: 22px;
        height: 22px;
        background: ${colors.ultraDimmed};
        border-radius: 3px;
        box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:after {
        content: "✔";
        color: ${colors.green};
        position: absolute;
        width: 14px;
        height: 14px;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        line-height: 14px;
        scale: 0;
        transition: all 0.1s ease-out;
      }

      &:checked:after {
        scale: 1;
      }
    }

    &.checked {
      text-decoration: line-through;
      color: ${colors.dimmed};
    }
  }

  .period {
    display: inline-flex;
    align-items: center;
    font-size: 16px;
    color: ${colors.dimmed};
    background: ${colors.megaDimmed};
    border-radius: 3px;
    padding: 0 4px;
  }

  .summary {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .month {
    text-transform: uppercase;
    width: ${MONTH_LABEL_WIDTH}px;
    text-align: right;
    color: ${colors.dimmed};
    visibility: ${(p) => (p.separate ? "visible" : "hidden")};
  }
`;

type ChoreProps = {
  checked: boolean;
  item: ListItem;
  onChange: (el: HTMLInputElement, item: ListItem) => void;
};

const Chore = ({ checked, item, onChange }: ChoreProps) => {
  const { ref, sparkle } = useSparkle<HTMLInputElement>();

  let period = "";

  if (item.chore.period === "week") {
    period = `${dayjs.locale() === "sv" ? "v" : "w"}${item.chore.week}`;
  }

  if (item.chore.period === "day") {
    period = dayjs(item.chore.start).calendar();
  }

  return (
    <ChoreContainer
      key={item.chore.id}
      separate={!item.hideLabel}
      status={item.chore.status}
    >
      <label className={checked ? "checked" : ""}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            onChange(e.target, item);
            if (e.target.checked) sparkle();
          }}
        />
        {period && <span className="period">{period}</span>}
        <span className="summary">{item.chore.summary}</span>
      </label>
      <span className="month">{item.label}</span>
    </ChoreContainer>
  );
};

type ListItem = {
  chore: ChoreContainer;
  label: string;
  hideLabel: boolean;
};

type StoreData = string[];

export const Chores: React.FC = () => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [data, , meta] = useService("chores");
  const [checkedChores, setCheckedChores] = useStoredData<StoreData>("chores");

  useIsIdle(() => {
    if (listRef.current)
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
  });

  const list = useMemo(
    () =>
      data?.reduce<ListItem[]>((acc, item) => {
        const month = item.month;
        const last = acc[acc.length - 1];

        acc.push({
          chore: item,
          label: `${dayjs(item.start).format("MMM")} ${String(item.year).slice(2)}`,
          hideLabel: month === last?.chore.month,
        });

        return acc;
      }, []),
    [data]
  );

  if (!data) return <Loader />;

  const onChange = (el: HTMLInputElement, item: ListItem) => {
    const chores = checkedChores?.slice() ?? [];

    if (el.checked) chores.push(item.chore.id);
    else chores.splice(chores.indexOf(item.chore.id), 1);

    setCheckedChores(
      chores.filter((id) => list!.find((item) => item.chore.id === id))
    );
  };

  return (
    <ServiceBox title={meta?.label} fillWidth>
      <Container ref={listRef}>
        {list?.map((item) => {
          const checked = checkedChores?.includes(item.chore.id) ?? false;

          return (
            <Chore
              key={item.chore.id + item.chore.start}
              checked={checked}
              item={item}
              onChange={onChange}
            />
          );
        })}
      </Container>
    </ServiceBox>
  );
};
