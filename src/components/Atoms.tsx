import styled, { css } from "styled-components";
import tinycolor from "tinycolor2";

import { colors } from "../styles";
import { limiter } from "../utils/helpers";

const activeBorder = (c: string = "#fff") => {
  const color = tinycolor(c).toHsv();

  return tinycolor({
    ...color,
    v: limiter(color.v, 0.7)
  }).toRgbString();
};

export const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 18px;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-flow: column;
`;

export const ActionButton = styled.a<{
  active: boolean;
  color?: string;
  size?: string;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: solid 3px
    ${({ active, color }) =>
      active ? activeBorder(color) : colors.superDimmed};
  width: 110px;
  height: 100px;
  cursor: pointer;

  svg {
    ${({ size }) =>
      css`
        height: ${size || "55px"};
        width: ${size || "55px"};
      `}

    path {
      fill: ${({ active, color = colors.white }) =>
        active ? color : colors.superDimmed};
    }
  }
`;

export const DimmedIconBox = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 20px;
  margin-right: 0;
  position: relative;

  > svg {
    height: 140px;
    width: 140px;
    margin-top: 10px;
    margin-right: 10px;
    position: absolute;
    top: 12px;
    left: -34px;
    z-index: -1;

    path {
      fill: ${colors.ultraDimmed};
    }
  }
`;
