import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { Loader } from "../../../components/Atoms";
import { useService, useStoredData } from "../../../hooks";
import { ServiceBox } from "../../../components/Molecules";
import type { Chore } from "../types";
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

const Chore = styled.li<{ separate: boolean }>`
  display: flex;
  align-items: center;
  line-height: 1.3;

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
      }

      &:checked:after {
        content: "";
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 3px;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        background: ${colors.green};
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

  .label {
    text-transform: uppercase;
    width: 70px;
    text-align: right;
    color: ${colors.dimmed};
    visibility: ${(p) => (p.separate ? "visible" : "hidden")};
  }
`;

type ListItem = {
  chore: Chore;
  label: string;
  hideLabel: boolean;
};

type StoreData = string[];

export const Chores: React.FC = () => {
  const [data, , meta] = useService("chores");
  const [checkedChores, setCheckedChores] = useStoredData<StoreData>("chores");

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

  return (
    <ServiceBox title={meta?.label} fillWidth>
      <Container>
        {list?.map((item) => {
          let period = "";

          if (item.chore.period === "week") {
            period = `${dayjs.locale() === "sv" ? "v" : "w"}${item.chore.week}`;
          }

          if (item.chore.period === "day") {
            period = dayjs(item.chore.start).calendar();
          }

          const checked = checkedChores?.includes(item.chore.id) ?? false;

          return (
            <Chore key={item.chore.id} separate={!item.hideLabel}>
              <label className={checked ? "checked" : ""}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const chores = checkedChores?.slice() ?? [];

                    if (e.target.checked) chores.push(item.chore.id);
                    else chores.splice(chores.indexOf(item.chore.id), 1);

                    setCheckedChores(chores);
                  }}
                />
                {period && <span className="period">{period}</span>}
                <span className="summary">{item.chore.summary}</span>
              </label>
              <span className="label">{item.label}</span>
            </Chore>
          );
        })}
      </Container>
    </ServiceBox>
  );
};