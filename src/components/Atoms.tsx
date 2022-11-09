import styled, { keyframes } from "styled-components";

import { colors } from "../styles";

export const ButtonGrid = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-rows: repeat(3, 1fr);
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

const bounce = keyframes`
  0%,
  100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
`;

export const Loader = styled.div`
  width: 40px;
  height: 40px;

  position: relative;
  margin: 0;

  &:before,
  &:after {
    content: "";
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #fff;
    opacity: 0.5;
    position: absolute;
    top: 0;
    left: 0;

    animation: ${bounce} 2s infinite ease-in-out;
  }

  &:after {
    animation-delay: -1s;
  }
`;
