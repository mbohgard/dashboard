import React from "react";
import styled, { css } from "styled-components";

import { useService } from "../hooks";
import { colors } from "../styles";
import { Icon } from "./Icon";

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: flex-end;
`;

const DataContainer = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: 12px;
`;

const iconSize = (size: number) => css`
  min-width: ${size}px;
  min-height: ${size}px;
  max-width: ${size}px;
  max-height: ${size}px;
`;

const Data = styled.li<{
  color: string;
  flipIcon?: boolean;
  size?: 1 | 2;
}>`
  display: flex;
  align-items: center;
  font-size: ${({ size }) =>
    size === 1 ? "30px" : size === 2 ? "40px" : "22px"};
  gap: 6px;
  color: ${({ size, color }) => (size ? color : colors.dimmed)};
  margin-top: 5px;

  svg {
    ${({ color, size }) => css`
      fill: ${size ? colors.white : color};
      ${iconSize(size === 1 ? 30 : size === 2 ? 40 : 20)}
    `}
    transform: rotate(${({ flipIcon }) => (flipIcon ? "180deg" : "0")});
  }

  > span {
    font-size: 20px;
  }

  i span {
    font-size: 18px;
    margin-left: 6px;
    color: ${colors.superDimmed};
  }
`;

const getColor = (value?: string) => {
  if (value === undefined) return colors.white;

  const n = Number(value.split(",").join("."));

  return n > 99 ? colors.red : n > 60 ? colors.orange : colors.green;
};

export const Energy = () => {
  const [data] = useService<EnergyServiceData>("energy");

  return (
    <Container>
      <DataContainer>
        <Data size={2} color={getColor(data?.now.value)}>
          <Icon Plug />
          <i>
            {data?.now.value}
            <span>öre</span>
          </i>
        </Data>
        <Data size={1} color={getColor(data?.average.value)}>
          <Icon Average />
          <i>
            {data?.average.value}
            <span>öre</span>
          </i>
        </Data>
        <Data color={getColor(data?.high.value)}>
          <Icon Arrow />
          <i>
            {data?.high.value}
            <span>({data?.high.time})</span>
          </i>
        </Data>
        <Data flipIcon color={getColor(data?.low.value)}>
          <Icon Arrow />
          <i>
            {data?.low.value}
            <span>({data?.low.time})</span>
          </i>
        </Data>
      </DataContainer>
    </Container>
  );
};
