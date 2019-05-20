import styled, { css } from "styled-components";

import { colors } from "../styles";

export const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 1fr 1fr 1fr;
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
    ${({ active, color = colors.white }) =>
      active ? color : colors.superDimmed};
  width: 85px;
  height: 75px;
  cursor: pointer;

  svg {
    ${({ size }) =>
      css`
        height: ${size || "45px"};
        width: ${size || "45px"};
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
    height: 100px;
    width: 100px;
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
