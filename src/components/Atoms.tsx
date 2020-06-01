import styled from "styled-components";

import { colors } from "../styles";

export const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 18px;
  grid-template-rows: repeat(2, 1fr);
  grid-auto-flow: column;
`;

export const Status = styled.div<{ ok: boolean }>`
  position: absolute;
  right: 15px;
  top: 15px;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: ${({ ok }) => (ok ? colors.green : colors.red)};
`;

export const Svg = styled.svg.attrs(({ viewBox }: { viewBox?: string }) => ({
  version: "1.1",
  x: "0px",
  y: "0px",
  viewBox: viewBox || "0 0 56.69 56.69",
}))`
  width: 40px;
  height: 40px;

  path {
    fill: white;
  }
`;
