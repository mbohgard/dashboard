import * as React from "react";
import styled, { css } from "styled-components";

import { colors } from "../styles";

import { arrow, sunrise } from "./Icon";

const fill = css<Props>`
  path {
    fill: ${({ color }) => color} !important;
  }
`;

const Wrapper = styled.div`
  height: 50px;
`;

const SunWrapper = styled.div<Props>`
  overflow: hidden;
  height: 30px;
  text-align: center;

  > svg {
    height: 60px;
    width: 60px;
    ${fill}
  }
`;

const ArrowWrapper = styled.div<Props>`
  text-align: center;
  position: relative;
  top: -4px;

  > svg {
    transform: rotate(${({ down }) => (down ? "90deg" : "-90deg")});
    height: 15px;
    width: 15px;
    ${fill}
  }
`;

type Props = { down?: boolean; color: string };

const Icon: React.SFC<Props> = props => (
  <Wrapper>
    <SunWrapper {...props}>{sunrise}</SunWrapper>
    <ArrowWrapper {...props}>{arrow}</ArrowWrapper>
  </Wrapper>
);

export const SunriseIcon = () => <Icon color={colors.yellow} />;
export const SunsetIcon = () => <Icon color={colors.orange} down />;
