import styled from "styled-components";

import { colors } from "../styles";

export const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 18px;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-flow: column;
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
