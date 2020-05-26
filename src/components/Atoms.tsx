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
